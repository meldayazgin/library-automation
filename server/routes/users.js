const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getFirestore } = require('firebase-admin/firestore');

const db = getFirestore();

// Get all users
router.get('/', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// Update user
router.put('/:id', [
  body('name').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('role').optional().isIn(['user', 'staff', 'admin']),
  body('status').optional().isIn(['active', 'inactive', 'suspended'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userRef = db.collection('users').doc(req.params.id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    await userRef.update(updateData);
    res.json({ id: req.params.id, ...updateData });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Error updating user' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const userRef = db.collection('users').doc(req.params.id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has any active borrowings
    const borrowingsSnapshot = await db.collection('borrowings')
      .where('userId', '==', req.params.id)
      .where('status', '==', 'borrowed')
      .get();

    if (!borrowingsSnapshot.empty) {
      return res.status(400).json({ error: 'Cannot delete user with active borrowings' });
    }

    await userRef.delete();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
});

// Get user's borrowing history
router.get('/:id/borrowings', async (req, res) => {
  try {
    const borrowingsSnapshot = await db.collection('borrowings')
      .where('userId', '==', req.params.id)
      .orderBy('borrowDate', 'desc')
      .get();

    const borrowings = [];
    borrowingsSnapshot.forEach(doc => {
      borrowings.push({ id: doc.id, ...doc.data() });
    });
    res.json(borrowings);
  } catch (error) {
    console.error('Error fetching user borrowings:', error);
    res.status(500).json({ error: 'Error fetching user borrowings' });
  }
});

// Get user's active borrowings
router.get('/:id/active-borrowings', async (req, res) => {
  try {
    const borrowingsSnapshot = await db.collection('borrowings')
      .where('userId', '==', req.params.id)
      .where('status', '==', 'borrowed')
      .get();

    const borrowings = [];
    borrowingsSnapshot.forEach(doc => {
      borrowings.push({ id: doc.id, ...doc.data() });
    });
    res.json(borrowings);
  } catch (error) {
    console.error('Error fetching active borrowings:', error);
    res.status(500).json({ error: 'Error fetching active borrowings' });
  }
});

module.exports = router; 