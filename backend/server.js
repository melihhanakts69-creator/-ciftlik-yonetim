require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database bağlantısı
connectDB();

// Test route
app.get('/', (req, res) => {
  res.json({ message: '🐄 Çiftlik API çalışıyor!' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/inekler', require('./routes/inekler'));
app.use('/api/buzagilar', require('./routes/buzagilar'));
app.use('/api/duveler', require('./routes/duveler'));
app.use('/api/tosunlar', require('./routes/tosunlar'));
app.use('/api/sut-kayitlari', require('./routes/sutKayitlari'));
app.use('/api/yemler', require('./routes/yemler'));
app.use('/api/ayarlar', require('./routes/ayarlar'));
app.use('/api/timeline', require('./routes/timeline'));
app.use('/api/toplu-sut', require('./routes/topluSut'));
app.use('/api/finansal', require('./routes/finansal'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor!`);
});