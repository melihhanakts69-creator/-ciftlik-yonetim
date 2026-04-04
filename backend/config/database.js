/**
 * MongoDB Atlas — Mongoose 8.x (^8.2.0+)
 * URI: sadece process.env.MONGODB_URI (dotenv server.js en üstte yüklenir)
 * mongodb+srv → TLS Atlas tarafında; ekstra tls/ssl objesi EKLENMEMELİ.
 *
 * Mongoose 8 Breaking Changes:
 *   - useNewUrlParser, useUnifiedTopology, useFindAndModify KALDIRILDI — geçmez.
 *   - family: 4  → Render/cloud ortamlarında IPv6 SRV çözümleme sorunlarını önler.
 *   - serverSelectionTimeoutMS: 30000 → Atlas cold-start için yeterli süre.
 */
const mongoose = require('mongoose');

let mongodbDriverVersion = '?';
try {
  mongodbDriverVersion = require('mongodb/package.json').version;
} catch (_) {
  /* mongoose ile gelen nested path farklı olabilir */
}

console.log('[MongoDB] atlas-connect-v4 | mongoose:', mongoose.version, '| mongodb driver:', mongodbDriverVersion);

let connectionEventsBound = false;
function bindConnectionEventsOnce() {
  if (connectionEventsBound) return;
  connectionEventsBound = true;
  mongoose.connection.on('error', (err) => {
    // Tam err objesi: kod (ETIMEDOUT, AUTH_FAILED vb.) görünür olsun
    console.error('[MongoDB] connection error — full object:', err);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] disconnected');
  });
}

/**
 * Şifre/log sızdırmaz: typeof, uzunluk, güvenli önek (ilk 16 karakter: şema + host başlangıcı değil, sadece scheme)
 */
function logMongoUriEnv() {
  const raw = process.env.MONGODB_URI;
  console.log('[ENV] MONGODB_URI typeof:', typeof raw);
  console.log('[ENV] MONGODB_URI var mi:', raw != null && String(raw).trim() !== '');

  if (raw == null) {
    console.log('[ENV] MONGODB_URI: null/undefined — .env veya Render Environment kontrol et');
    return;
  }

  const s = String(raw).trim();
  console.log('[ENV] MONGODB_URI length (trim):', s.length);

  // Sadece scheme: mongodb+srv:// veya mongodb:// — kullanıcı/şifre yok
  const scheme = s.startsWith('mongodb+srv://')
    ? 'mongodb+srv://'
    : s.startsWith('mongodb://')
      ? 'mongodb://'
      : '(gecersiz scheme)';
  console.log('[ENV] MONGODB_URI scheme:', scheme);

  const at = s.indexOf('@');
  if (at > 0) {
    const hostPart = s.slice(at + 1).split('/')[0].split('?')[0];
    console.log('[ENV] MONGODB_URI host (kimlik yok):', hostPart);
  } else {
    console.log('[ENV] MONGODB_URI: @ bulunamadı — URI formatını kontrol et');
  }
}

async function connectDB() {
  logMongoUriEnv();

  const raw = process.env.MONGODB_URI;
  if (raw == null || String(raw).trim() === '') {
    console.error('[MongoDB] MONGODB_URI bos veya tanimli degil.');
    return false;
  }

  const uri = String(raw).trim();
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.error('[MongoDB] URI mongodb:// veya mongodb+srv:// ile baslamali.');
    return false;
  }

  const maxAttempts = Math.max(1, parseInt(process.env.MONGO_CONNECT_RETRIES || '5', 10));
  let lastErr;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (mongoose.connection.readyState === 1) {
        return true;
      }

      await mongoose.connect(uri, {
        // Mongoose 8: useNewUrlParser ve useUnifiedTopology KALDIRILDI, eklenirse hata verir.
        serverSelectionTimeoutMS: 30000, // Atlas için 30 sn bekleme süresi
        family: 4,                        // IPv4 zorlaması — Render'da SRV/IPv6 çözümleme sorunlarını önler
      });

      console.log('[MongoDB] Baglanti OK. readyState:', mongoose.connection.readyState);

      bindConnectionEventsOnce();

      try {
        const userCol = mongoose.connection.collection('users');
        const indexes = await userCol.indexes();
        const oldIdx = indexes.find((idx) => idx.name === 'email_1');
        if (oldIdx) {
          await userCol.dropIndex('email_1');
          console.log('[MongoDB] Eski email_1 index kaldirildi.');
        }
      } catch (idxErr) {
        console.log('[MongoDB] Index migration:', idxErr.message);
      }

      return true;
    } catch (err) {
      lastErr = err;
      // Tam err objesi: code (ETIMEDOUT, ENOTFOUND, AUTH_FAILED vb.) teşhis için kritik
      console.error(`[MongoDB] Deneme ${attempt}/${maxAttempts} HATA — full object:`, err);
      try {
        await mongoose.disconnect();
      } catch (_) {}
      if (attempt < maxAttempts) {
        const wait = Math.min(2000 * 2 ** (attempt - 1), 30000);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }

  // Tüm lastErr objesi: gerçek hata kodu (ETIMEDOUT, AUTH_FAILED, ENOTFOUND vb.) burada görünür
  console.error('[MongoDB] Baglanamadi. Atlas: Resume, Network 0.0.0.0/0, URI dogru mu? — full error:', lastErr);
  return false;
}

module.exports = connectDB;
