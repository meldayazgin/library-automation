const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const admin = require('firebase-admin'); // 🔥 Doğru bağlantı için admin import
const db = admin.firestore(); // ✅ Firestore bağlantısı bu şekilde yapılmalı

// 📚 Get all books
router.get('/', async (req, res) => {
  console.log('📥 Kitaplar çekiliyor...');
  const start = Date.now();

  try {
    const booksSnapshot = await db.collection('books').get();
    const books = booksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Kitaplar başarıyla getirildi: ${Date.now() - start}ms`);
    res.json(books);
  } catch (error) {
    console.error('❌ Kitaplar getirilirken hata:', error.message);
    res.status(500).json({ error: 'Error fetching books' });
  }
});

// 📖 Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const bookDoc = await db.collection('books').doc(req.params.id).get();

    if (!bookDoc.exists) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ id: bookDoc.id, ...bookDoc.data() });
  } catch (error) {
    console.error('❌ Tekil kitap getirme hatası:', error.message);
    res.status(500).json({ error: 'Error fetching book' });
  }
});

// ➕ Add new book
router.post(
  '/',
  [
    body('title').notEmpty(),
    body('author').notEmpty(),
    body('isbn').notEmpty(),
    body('category').notEmpty(),
    body('quantity').isInt({ min: 0 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, author, isbn, category, quantity, description } = req.body;

      const bookData = {
        title,
        author,
        isbn,
        category,
        quantity,
        available: quantity,
        description: description || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await db.collection('books').add(bookData);
      res.status(201).json({ id: docRef.id, ...bookData });
    } catch (error) {
      console.error('❌ Kitap eklerken hata:', error.message);
      res.status(500).json({ error: 'Error adding book' });
    }
  }
);

// ✏️ Update book
router.put(
  '/:id',
  [
    body('title').optional().notEmpty(),
    body('author').optional().notEmpty(),
    body('isbn').optional().notEmpty(),
    body('category').optional().notEmpty(),
    body('quantity').optional().isInt({ min: 0 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
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
      console.error('❌ Kitap güncellenirken hata:', error.message);
      res.status(500).json({ error: 'Error updating book' });
    }
  }
);

// ❌ Delete book
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
    console.error('❌ Kitap silinirken hata:', error.message);
    res.status(500).json({ error: 'Error deleting book' });
  }
});

module.exports = router;