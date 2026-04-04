/**
 * MongoDB Atlas — Mongoose 8.x
 * Mongoose 6+: useNewUrlParser, useUnifiedTopology, useFindAndModify KULLANILMAZ (eklenirse uyarı/hata).
 */
const mongoose = require('mongoose');

let mongodbDriverVersion = '?';
try {
  mongodbDriverVersion = require('mongodb/package.json').version;
} catch (_) {}

console.log('[MongoDB] mongoose:', mongoose.version, '| driver:', mongodbDriverVersion);

let connectionEventsBound = false;
function bindConnectionEventsOnce() {
  if (connectionEventsBound) return;
  connectionEventsBound = true;
  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] connection error:', errToJson(err));
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] disconnected');
  });
}

/** Error → JSON (message, stack, code, name) */
function errToJson(err) {
  if (err == null) return 'null';
  const o = typeof err === 'object' ? err : { message: String(err) };
  try {
    return JSON.stringify(o, Object.getOwnPropertyNames(o), 2);
  } catch (_) {
    return JSON.stringify({ message: String(err) }, null, 2);
  }
}

function logMongoUriEnv() {
  const raw = process.env.MONGODB_URI;
  console.log('[ENV] MONGODB_URI typeof:', typeof raw);
  console.log('[ENV] MONGODB_URI var mi:', raw != null && String(raw).trim() !== '');
  if (raw == null) {
    console.log('[ENV] MONGODB_URI: null/undefined');
    return;
  }
  const s = String(raw).trim();
  console.log('[ENV] MONGODB_URI length:', s.length);
  const scheme = s.startsWith('mongodb+srv://')
    ? 'mongodb+srv://'
    : s.startsWith('mongodb://')
      ? 'mongodb://'
      : '(gecersiz)';
  console.log('[ENV] scheme:', scheme);
  const at = s.indexOf('@');
  if (at > 0) {
    console.log('[ENV] host (sifresiz):', s.slice(at + 1).split('/')[0].split('?')[0]);
  }
}

/** Tek kaynak: ortam değişkeni (Render / .env); trim, şema kontrolü */
function readConnectionUri() {
  const encodedUri = process.env.MONGODB_URI != null ? String(process.env.MONGODB_URI).trim() : '';
  if (!encodedUri) return null;
  if (!encodedUri.startsWith('mongodb://') && !encodedUri.startsWith('mongodb+srv://')) {
    console.error('[MongoDB] URI mongodb:// veya mongodb+srv:// ile baslamali.');
    return null;
  }
  return encodedUri;
}

async function connectDB() {
  logMongoUriEnv();

  const encodedUri = readConnectionUri();
  if (!encodedUri) {
    console.error('[MongoDB] MONGODB_URI bos veya gecersiz.');
    return false;
  }

  const opts = {
    serverSelectionTimeoutMS: 30000,
    family: 4,
  };

  const maxAttempts = Math.max(1, parseInt(process.env.MONGO_CONNECT_RETRIES || '5', 10));
  let lastErr;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (mongoose.connection.readyState === 1) {
        return true;
      }

      await mongoose.connect(encodedUri, opts);

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
      console.error(`[MongoDB] Deneme ${attempt}/${maxAttempts} basarisiz`);
      console.error('❌ HATA DETAYI:', errToJson(err));
      try {
        await mongoose.disconnect();
      } catch (_) {}
      if (attempt < maxAttempts) {
        const wait = Math.min(2000 * 2 ** (attempt - 1), 30000);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }

  console.error('[MongoDB] Tum denemeler basarisiz.');
  console.error('❌ SON HATA DETAYI:', lastErr ? errToJson(lastErr) : 'null');
  return false;
}

module.exports = connectDB;
