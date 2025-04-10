const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// 🌱 Ortam değişkenlerini yükle
dotenv.config();

// 🔐 Firebase Admin başlat
let serviceAccount;
const serviceAccountPath = path.join(__dirname, 'config', 'firebase-admin.json');

try {
  const raw = fs.readFileSync(serviceAccountPath, 'utf8');
  const parsed = JSON.parse(raw);
  serviceAccount = {
    ...parsed,
    private_key: parsed.private_key.replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('✅ Firebase Admin başarıyla başlatıldı');
} catch (error) {
  console.error('❌ Firebase Admin başlatılamadı:', error.message);
  process.exit(1);
}

// 🔥 Firestore bağlantısı (gerekirse kullan)
const db = admin.firestore();

// 🚀 Express app
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// 📄 Root endpoint – Backend çalışıyor mesajı
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="tr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Library Automation Backend</title>
      </head>
      <body>
        <h1>📡 Backend çalışıyor</h1>
      </body>
    </html>
  `);
});

// ✅ Firebase Admin test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: '🔥 Firebase Admin aktif' });
});

// 🌐 Genel amaçlı proxy
app.get('/api/proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL parametresi gerekli' });

  try {
    const response = await axios.get(url);
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('❌ Proxy hatası:', error.message);
    res.status(500).json({ error: 'Proxy isteği başarısız' });
  }
});

// 🕵️ dlnk.one özel proxy
app.get('/api/dlnk', async (req, res) => {
  const { id, type } = req.query;
  if (!id) return res.status(400).json({ error: 'ID parametresi gerekli' });

  const url = `https://dlnk.one/e?id=${id}&type=${type || 1}`;

  try {
    const response = await axios.get(url);
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('❌ dlnk.one proxy hatası:', error.message);
    res.status(500).json({ error: 'dlnk.one isteği başarısız' });
  }
});

// 📦 API route'ları bağla
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/users', require('./routes/users'));
app.use('/api/borrowings', require('./routes/borrowings'));

// 🧯 Global hata yakalayıcı
app.use((err, req, res, next) => {
  console.error('❌ Global hata:', err.stack);
  res.status(500).json({ error: 'Sunucuda bir hata oluştu!' });
});

// 🔊 Server'ı başlat
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server aktif: http://localhost:${PORT}`);
});
