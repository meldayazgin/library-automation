const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getFirestore } = require('firebase-admin/firestore');

const db = getFirestore();

// Get all borrowings
router.get('/', async (req, res) => {
  try {
    const borrowingsSnapshot = await db.collection('borrowings').get();
    const borrowings = [];
    borrowingsSnapshot.forEach(doc => {
      borrowings.push({ id: doc.id, ...doc.data() });
    });
    res.json(borrowings);
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    res.status(500).json({ error: 'Error fetching borrowings' });
  }
});

// Get user's borrowings
router.get('/user/:userId', async (req, res) => {
  try {
    const borrowingsSnapshot = await db.collection('borrowings')
      .where('userId', '==', req.params.userId)
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

// Borrow a book
router.post('/', [
  body('userId').notEmpty(),
  body('bookId').notEmpty(),
  body('dueDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, bookId, dueDate } = req.body;

    // Check if book is available
    const bookRef = db.collection('books').doc(bookId);
    const bookDoc = await bookRef.get();

    if (!bookDoc.exists) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const bookData = bookDoc.data();
    if (bookData.available <= 0) {
      return res.status(400).json({ error: 'Book is not available' });
    }

    // Create borrowing record
    const borrowingData = {
      userId,
      bookId,
      borrowDate: new Date(),
      dueDate: new Date(dueDate),
      returnDate: null,
      status: 'borrowed',
      fine: 0
    };

    const borrowingRef = await db.collection('borrowings').add(borrowingData);

    // Update book availability
    await bookRef.update({
      available: bookData.available - 1,
      updatedAt: new Date()
    });

    res.status(201).json({ id: borrowingRef.id, ...borrowingData });
  } catch (error) {
    console.error('Error creating borrowing:', error);
    res.status(500).json({ error: 'Error creating borrowing' });
  }
});

// Return a book
router.put('/:id/return', async (req, res) => {
  try {
    const borrowingRef = db.collection('borrowings').doc(req.params.id);
    const borrowingDoc = await borrowingRef.get();

    if (!borrowingDoc.exists) {
      return res.status(404).json({ error: 'Borrowing record not found' });
    }

    const borrowingData = borrowingDoc.data();
    if (borrowingData.status === 'returned') {
      return res.status(400).json({ error: 'Book already returned' });
    }

    const returnDate = new Date();
    const dueDate = borrowingData.dueDate.toDate();
    const daysLate = Math.max(0, Math.floor((returnDate - dueDate) / (1000 * 60 * 60 * 24)));
    const fine = daysLate * 1; // $1 per day late

    // Update borrowing record
    await borrowingRef.update({
      returnDate,
      status: 'returned',
      fine,
      updatedAt: new Date()
    });

    // Update book availability
    const bookRef = db.collection('books').doc(borrowingData.bookId);
    const bookDoc = await bookRef.get();
    const bookData = bookDoc.data();

    await bookRef.update({
      available: bookData.available + 1,
      updatedAt: new Date()
    });

    res.json({
      id: req.params.id,
      ...borrowingData,
      returnDate,
      fine
    });
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ error: 'Error returning book' });
  }
});

// Get overdue books
router.get('/overdue', async (req, res) => {
  try {
    const now = new Date();
    const borrowingsSnapshot = await db.collection('borrowings')
      .where('status', '==', 'borrowed')
      .where('dueDate', '<', now)
      .get();

    const overdueBooks = [];
    borrowingsSnapshot.forEach(doc => {
      overdueBooks.push({ id: doc.id, ...doc.data() });
    });
    res.json(overdueBooks);
  } catch (error) {
    console.error('Error fetching overdue books:', error);
    res.status(500).json({ error: 'Error fetching overdue books' });
  }
});

module.exports = router; 