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
app.use(mongoSanitize());            // MongoDB injection koruması
app.use(hpp());                       // HTTP Parameter Pollution koruması

// CORS — sadece bilinen domain'ler
app.use(cors({
  origin: [
    'https://ciftlik-yonetim.vercel.app',
    'https://ciftlik-yonetim-q8bwcyd9m-melihhan-aktass-projects.vercel.app',
    /^https:\/\/ciftlik-yonetim-.*-melihhan-aktass-projects\.vercel\.app$/,
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));  // Body boyutu sınırı

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
app.use('/api/yem-yonetim', require('./routes/yemYonetim')); // Yeni
// app.use('/api/gruplar', require('./routes/gruplar')); // TODO: Animal model düzeltmesi gerekiyor

// 🔒 Global Error Handler (en sonda olmalı)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor!`);
});