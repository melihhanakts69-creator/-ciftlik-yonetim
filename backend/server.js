require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const connectDB = require('./config/database');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 🔒 Güvenlik Middleware'leri
app.use(helmet());                    // HTTP güvenlik header'ları

// CORS — sadece bilinen domain'ler
app.use(cors({
  origin: [
    'https://ciftlik-yonetim.vercel.app',
    /^https:\/\/ciftlik-yonetim.*\.vercel\.app$/, // Tüm ciftlik-yonetim* vercel domainlerini kapsar
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));  // Body boyutu sınırı

// 🔒 Güvenlik Middleware'leri (Body parser'dan SONRA gelmeli)
app.use(mongoSanitize());            // MongoDB injection koruması
app.use(hpp());                       // HTTP Parameter Pollution koruması



// Rate limiting
app.use('/api/', apiLimiter);          // Tüm API: 100 istek/15dk

// Database bağlantısı
connectDB();

// Test route
app.get('/', (req, res) => {
  res.json({ message: '🐄 Çiftlik API çalışıyor!', version: '1.0.1-fix-enum' });
});

app.get('/api/version', (req, res) => {
  res.json({
    version: '1.0.1-fix-enum',
    timestamp: new Date().toISOString(),
    fix: 'YemHareket enum relaxed'
  });
});

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
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

// Yeni Dashboard Routes
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/maliyet', require('./routes/maliyet'));
app.use('/api/alis-satis', require('./routes/alisSatis'));
app.use('/api/bildirimler', require('./routes/bildirimler'));
app.use('/api/saglik', require('./routes/saglik')); // Sağlık Modülü
app.use('/api/yem-yonetim', require('./routes/yemYonetim')); // Yeni
// app.use('/api/gruplar', require('./routes/gruplar')); // TODO: Animal model düzeltmesi gerekiyor
app.use('/api/takvim', require('./routes/takvim')); // Takvim Modülü
app.use('/api/stok', require('./routes/stok')); // Stok Modülü

// 🔒 Global Error Handler (en sonda olmalı)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor!`);
  console.log('--- Environment Check ---');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ SET' : '❌ MISSING');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '❌ MISSING');
  console.log('-------------------------');
});