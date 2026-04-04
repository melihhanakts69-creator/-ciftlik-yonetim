const mongoose = require('mongoose');

function buildMongoOpts() {
  const opts = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  };
  if (process.env.MONGO_FAMILY === '4') {
    opts.family = 4;
  }
  return opts;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function safeHostFromUri(uri) {
  try {
    const at = uri.indexOf('@');
    if (at === -1) return '(no-host)';
    return uri.slice(at + 1).split('/')[0].split('?')[0];
  } catch {
    return '(parse-error)';
  }
}

async function connectDB() {
  const uri = process.env.MONGODB_URI ? String(process.env.MONGODB_URI).trim() : '';

  if (!uri) {
    console.error('[MongoDB] HATA: MONGODB_URI tanımlı değil veya boş');
    return false;
  }
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.error('[MongoDB] HATA: MONGODB_URI mongodb:// veya mongodb+srv:// ile başlamalı');
    return false;
  }

  console.log(
    '[MongoDB] MONGODB_URI uzunluk=',
    uri.length,
    uri.startsWith('mongodb+srv') ? '(srv)' : '(direct)'
  );
  const mo = buildMongoOpts();
  console.log('[MongoDB] mongoose seçenekleri:', {
    serverSelectionTimeoutMS: mo.serverSelectionTimeoutMS,
    socketTimeoutMS: mo.socketTimeoutMS,
    family: mo.family != null ? mo.family : 'varsayılan (önerilen)',
  });

  const host = safeHostFromUri(uri);
  const maxAttempts = Math.max(1, parseInt(process.env.MONGO_CONNECT_RETRIES || '5', 10));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[MongoDB] deneme ${attempt}/${maxAttempts} host=${host}`);

    try {
      if (mongoose.connection.readyState === 1) {
        console.log('[MongoDB] BAŞARILI: bağlantı zaten açık');
        return true;
      }

      await mongoose.connect(uri, buildMongoOpts());
      console.log('[MongoDB] BAŞARILI: MongoDB bağlandı');
      return true;
    } catch (err) {
      console.error('[MongoDB] HATA:', err?.message || String(err));
      if (err?.stack) console.error(err.stack);
      try {
        await mongoose.disconnect();
      } catch (_) {}
      if (attempt < maxAttempts) {
        await sleep(Math.min(2000 * 2 ** (attempt - 1), 30000));
      }
    }
  }

  console.error('[MongoDB] HATA: tüm bağlantı denemeleri başarısız');
  return false;
}

module.exports = connectDB;
