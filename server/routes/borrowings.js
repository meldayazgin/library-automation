const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const admin = require('firebase-admin');
const db = admin.firestore();

// 🔄 Get all borrowings
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('borrowings').get();
    const borrowings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(borrowings);
  } catch (error) {
    console.error('❌ Borrowings fetch error:', error.message);
    res.status(500).json({ error: 'Error fetching borrowings' });
  }
});

// 👤 Get borrowings by user
router.get('/user/:userId', async (req, res) => {
  try {
    const snapshot = await db.collection('borrowings')
      .where('userId', '==', req.params.userId)
      .get();

    const borrowings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(borrowings);
  } catch (error) {
    console.error('❌ User borrowings fetch error:', error.message);
    res.status(500).json({ error: 'Error fetching user borrowings' });
  }
});

// 📚 Borrow a book
router.post('/', [
  body('userId').notEmpty(),
  body('bookId').notEmpty(),
  body('dueDate').isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { userId, bookId, dueDate } = req.body;

    const bookRef = db.collection('books').doc(bookId);
    const bookDoc = await bookRef.get();

    if (!bookDoc.exists) return res.status(404).json({ error: 'Book not found' });

    const book = bookDoc.data();
    if (book.available <= 0) {
      return res.status(400).json({ error: 'Book is not available' });
    }

    const borrowData = {
      userId,
      bookId,
      borrowDate: new Date(),
      dueDate: new Date(dueDate),
      returnDate: null,
      status: 'borrowed',
      fine: 0,
      createdAt: new Date()
    };

    const borrowRef = await db.collection('borrowings').add(borrowData);

    await bookRef.update({
      available: book.available - 1,
      updatedAt: new Date()
    });

    res.status(201).json({ id: borrowRef.id, ...borrowData });
  } catch (error) {
    console.error('❌ Borrowing error:', error.message);
    res.status(500).json({ error: 'Error creating borrowing' });
  }
});

// 🔁 Return a book
router.put('/:id/return', async (req, res) => {
  try {
    const borrowRef = db.collection('borrowings').doc(req.params.id);
    const borrowDoc = await borrowRef.get();

    if (!borrowDoc.exists) return res.status(404).json({ error: 'Borrowing not found' });

    const data = borrowDoc.data();
    if (data.status === 'returned') {
      return res.status(400).json({ error: 'Book already returned' });
    }

    const returnDate = new Date();
    const dueDate = data.dueDate instanceof admin.firestore.Timestamp
      ? data.dueDate.toDate()
      : new Date(data.dueDate);

    const daysLate = Math.max(0, Math.floor((returnDate - dueDate) / (1000 * 60 * 60 * 24)));
    const fine = daysLate * 1;

    await borrowRef.update({
      returnDate,
      status: 'returned',
      fine,
      updatedAt: new Date()
    });

    const bookRef = db.collection('books').doc(data.bookId);
    const bookDoc = await bookRef.get();
    const bookData = bookDoc.data();

    await bookRef.update({
      available: bookData.available + 1,
      updatedAt: new Date()
    });

    res.json({
      id: req.params.id,
      returnDate,
      fine,
      ...data,
      status: 'returned'
    });
  } catch (error) {
    console.error('❌ Book return error:', error.message);
    res.status(500).json({ error: 'Error returning book' });
  }
});

// ⏳ Get overdue books
router.get('/overdue', async (req, res) => {
  try {
    const now = new Date();
    const snapshot = await db.collection('borrowings')
      .where('status', '==', 'borrowed')
      .where('dueDate', '<', now)
      .get();

    const overdue = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(overdue);
  } catch (error) {
    console.error('❌ Overdue fetch error:', error.message);
    res.status(500).json({ error: 'Error fetching overdue books' });
  }
});

module.exports = router;
