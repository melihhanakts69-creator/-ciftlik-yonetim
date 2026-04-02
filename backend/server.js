require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('./middleware/sanitize');
const hpp = require('hpp');
const connectDB = require('./config/database');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 🔒 Güvenlik Middleware'leri
app.use(helmet());                    // HTTP güvenlik header'ları

const corsExtraOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const corsFrontend = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [];

// CORS — bilinen domain'ler + FRONTEND_URL + CORS_ORIGINS (virgülle)
app.use(cors({
  origin: [
    'https://ciftlik-yonetim.vercel.app',
    /^https:\/\/ciftlik-yonetim.*\.vercel\.app$/,
    'http://localhost:3000',
    'http://localhost:5000',
    ...corsFrontend,
    ...corsExtraOrigins,
  ],
  credentials: true
}));
// Profil fotoğrafı (Base64) için /api/auth/update endpoint'i daha yüksek limitle:
app.use('/api/auth/update', express.json({ limit: '5mb' }));
app.use(express.json({ limit: '10mb' }));  // Genel body sınırı


// 🔒 Güvenlik Middleware'leri (Body parser'dan SONRA gelmeli)
app.use(mongoSanitize);               // NoSQL injection koruması (custom Express 5 uyumlu)
app.use(hpp());                       // HTTP Parameter Pollution koruması



// 🔒 Trust proxy (Render / Heroku gibi reverse proxy arkasında çalışırken şart)
app.set('trust proxy', 1);

// Rate limiting — /api/auth ayrı authLimiter ile; genel limiter login/register'ı çift saymasın
app.use('/api/', (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  if (req.originalUrl.startsWith('/api/auth')) return next();
  return apiLimiter(req, res, next);
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: '🐄 Çiftlik API çalışıyor!', version: '2.0.0-admin-panel' });
});

app.get('/api/version', (req, res) => {
  res.json({
    version: '2.0.0-admin-panel',
    timestamp: new Date().toISOString(),
    features: ['admin-dashboard', 'user-management', 'blog', 'site-content', 'media-manager']
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
app.use('/api/yem-yonetim', require('./routes/yemYonetim'));
app.use('/api/yemleme', require('./routes/yemleme')); // Günlük grup yemleme
app.use('/api/gruplar', require('./routes/gruplar'));
app.use('/api/takvim', require('./routes/takvim')); // Takvim Modülü
app.use('/api/stok', require('./routes/stok')); // Stok Modülü
app.use('/api/yem-kutuphanesi', require('./routes/yemKutuphanesi')); // Yem Kütüphanesi
app.use('/api/admin', require('./routes/adminContent')); // Admin Panel
app.use('/api/content', require('./routes/adminContent')); // Public Landing Content
app.use('/api/ai', require('./routes/ai')); // 🤖 Gemini AI Danışman
app.use('/api/veteriner', require('./routes/veterinerMusteri')); // Veteriner Modülü
app.use('/api/danismalar', require('./routes/danisma')); // Çiftçi–Veteriner danışma mesajları
app.use('/api/toplayici', require('./routes/toplayici')); // Süt toplayıcı modülü
app.use('/api/odeme', require('./routes/odeme')); // Abonelik & Ödeme modülü

// 🔒 Global Error Handler (en sonda olmalı)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// MongoDB hazır olmadan dinlemeyelim — giriş vb. istekler "Sunucu hatası" vermesin
async function start() {
  await connectDB();
  const { startScheduler } = require('./jobs/scheduler');
  startScheduler();

  app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda çalışıyor!`);
    console.log('--- Environment Check ---');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ SET' : '❌ MISSING');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '❌ MISSING');
    console.log('-------------------------');
  });
}

start().catch((err) => {
  console.error('Sunucu başlatılamadı:', err);
  process.exit(1);
});