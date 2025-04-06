const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Read and parse firebase-admin.json
const serviceAccountPath = path.join(__dirname, 'config', 'firebase-admin.json');
let serviceAccount;

try {
  const serviceAccountRaw = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  serviceAccount = {
    ...serviceAccountRaw,
    private_key: serviceAccountRaw.private_key.replace(/\\n/g, '\n'),
  };
} catch (error) {
  console.error('Error loading Firebase service account:', error.message);
  process.exit(1);
}

// Initialize Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error.message);
  process.exit(1);
}

// Initialize Firestore
const db = getFirestore();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'Firebase Admin is working!' });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/users', require('./routes/users'));
app.use('/api/borrowings', require('./routes/borrowings'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'An error occurred!' });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running: http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Trying port ${PORT + 1}`);
    server.listen(PORT + 1, () => {
      console.log(`Server is running: http://localhost:${PORT + 1}`);
    });
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
