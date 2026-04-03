const mongoose = require('mongoose');

/**
 * Atlas bağlantısı: mongodb+srv URI üzerinde TLS ve replica set zaten tanımlıdır.
 * Ek tls/ssl/ca/rejectUnauthorized ayarı EKLEME — uyumsuzluk ve "whitelist" benzeri
 * seçim hatalarına yol açabilir. Sadece URI + isteğe bağlı timeout.
 */
const CONNECT_OPTS = {
  serverSelectionTimeoutMS: 30000,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let handlersAttached = false;
function attachConnectionHandlers() {
  if (handlersAttached) return;
  handlersAttached = true;
  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] disconnected');
  });
}

/** @returns {string|null} geçerli URI veya null */
function readMongoUri() {
  const raw = process.env.MONGODB_URI;
  if (raw === undefined || raw === null) {
    console.error('[MongoDB] MONGODB_URI undefined — Render’da Environment’a ekleyin veya .env kullanın.');
    return null;
  }
  const uri = String(raw).trim();
  if (uri.length === 0) {
    console.error('[MongoDB] MONGODB_URI bos string.');
    return null;
  }
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.error('[MongoDB] MONGODB_URI mongodb:// veya mongodb+srv:// ile baslamali.');
    return null;
  }
  try {
    const at = uri.indexOf('@');
    if (at !== -1) {
      const host = uri.slice(at + 1).split('/')[0].split('?')[0];
      console.log('[MongoDB] URI host:', host);
    }
  } catch (_) {
    /* ignore */
  }
  return uri;
}

/**
 * @returns {Promise<boolean>}
 */
const connectDB = async () => {
  const uri = readMongoUri();
  if (!uri) return false;

  const maxAttempts = Math.max(1, parseInt(process.env.MONGO_CONNECT_RETRIES || '5', 10));
  let lastErr;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (mongoose.connection.readyState === 1) {
        return true;
      }
      await mongoose.connect(uri, CONNECT_OPTS);
      console.log('[MongoDB] Baglanti basarili.');
      attachConnectionHandlers();

      try {
        const userCol = mongoose.connection.collection('users');
        const indexes = await userCol.indexes();
        const oldIdx = indexes.find((idx) => idx.name === 'email_1');
        if (oldIdx) {
          await userCol.dropIndex('email_1');
          console.log('Eski email_1 unique index kaldirildi.');
        }
      } catch (idxErr) {
        console.log('Index migration:', idxErr.message);
      }

      return true;
    } catch (error) {
      lastErr = error;
      console.error(
        `[MongoDB] Deneme ${attempt}/${maxAttempts} basarisiz:`,
        error.message
      );
      try {
        await mongoose.disconnect();
      } catch (_) {
        /* ignore */
      }
      if (attempt < maxAttempts) {
        const waitMs = Math.min(2000 * 2 ** (attempt - 1), 30000);
        await sleep(waitMs);
      }
    }
  }

  console.error(
    '[MongoDB] Tum denemeler basarisiz. Atlas: Network Access (0.0.0.0/0), cluster Resume, MONGODB_URI dogru mu?',
    lastErr?.message || ''
  );
  return false;
};

module.exports = connectDB;
