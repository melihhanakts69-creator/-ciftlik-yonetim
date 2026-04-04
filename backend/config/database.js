/**
 * GEÇİCİ NÜKLEER TEST: URI kodda sabit. İş bitince kaldır, MONGODB_URI + Render env kullan.
 * Mongoose 8: useNewUrlParser / useUnifiedTopology YOK.
 */
console.log('☢️ NÜKLEER MOD V3 AKTİF - HARDCODED URI TEST EDİLİYOR');

const mongoose = require('mongoose');

let mongodbDriverVersion = '?';
try {
  mongodbDriverVersion = require('mongodb/package.json').version;
} catch (_) {}

console.log('[MongoDB] mongoose:', mongoose.version, '| driver:', mongodbDriverVersion);

/** Atlas bağlantısı — şifre büyük M (Melihhan / ...05465742067M) */
const uri =
  'mongodb+srv://Melihhan:05465742067M@melih.faq6tsp.mongodb.net/Agrolina?appName=Melih';

const opts = {
  serverSelectionTimeoutMS: 30000,
  family: 4,
};

let connectionEventsBound = false;
function bindConnectionEventsOnce() {
  if (connectionEventsBound) return;
  connectionEventsBound = true;
  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] connection error:', err && err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] disconnected');
  });
}

async function connectDB() {
  const maxAttempts = Math.max(1, parseInt(process.env.MONGO_CONNECT_RETRIES || '5', 10));
  let lastErr;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (mongoose.connection.readyState === 1) {
        return true;
      }

      await mongoose.connect(uri, opts);

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
      console.error('❌ BAĞLANTI PATLADI! Detay:', JSON.stringify(err, null, 2));
      if (err && err.message) console.error('❌ err.message:', err.message);
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
  if (lastErr) {
    console.error('❌ BAĞLANTI PATLADI! Detay:', JSON.stringify(lastErr, null, 2));
    if (lastErr.message) console.error('❌ err.message:', lastErr.message);
  }
  return false;
}

module.exports = connectDB;
