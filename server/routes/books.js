const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getFirestore } = require('firebase-admin/firestore');

const db = getFirestore();

// Get all books
router.get('/', async (req, res) => {
  try {
    const booksSnapshot = await db.collection('books').get();
    const books = [];
    booksSnapshot.forEach(doc => {
      books.push({ id: doc.id, ...doc.data() });
    });
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Error fetching books' });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const bookDoc = await db.collection('books').doc(req.params.id).get();
    if (!bookDoc.exists) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ id: bookDoc.id, ...bookDoc.data() });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Error fetching book' });
  }
});

// Add new book
router.post('/', [
  body('title').notEmpty(),
  body('author').notEmpty(),
  body('isbn').notEmpty(),
  body('category').notEmpty(),
  body('quantity').isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, author, isbn, category, quantity, description } = req.body;

    const bookData = {
      title,
      author,
      isbn,
      category,
      quantity,
      description,
      available: quantity,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('books').add(bookData);
    res.status(201).json({ id: docRef.id, ...bookData });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'Error adding book' });
  }
});

// Update book
router.put('/:id', [
  body('title').optional().notEmpty(),
  body('author').optional().notEmpty(),
  body('isbn').optional().notEmpty(),
  body('category').optional().notEmpty(),
  body('quantity').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bookRef = db.collection('books').doc(req.params.id);
    const bookDoc = await bookRef.get();

    if (!bookDoc.exists) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    await bookRef.update(updateData);
    res.json({ id: req.params.id, ...updateData });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Error updating book' });
  }
});

// Delete book
router.delete('/:id', async (req, res) => {
  try {
    const bookRef = db.collection('books').doc(req.params.id);
    const bookDoc = await bookRef.get();

    if (!bookDoc.exists) {
      return res.status(404).json({ error: 'Book not found' });
    }

    await bookRef.delete();
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Error deleting book' });
  }
});

module.exports = router; 