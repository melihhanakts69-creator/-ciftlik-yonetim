const mongoose = require('mongoose');

const CONNECT_OPTS = {
  serverSelectionTimeoutMS: 20000,
  socketTimeoutMS: 120000,
  maxPoolSize: 10,
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

/**
 * @returns {Promise<boolean>} bağlantı kuruldu mu
 */
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI tanımlı değil.');
    return false;
  }

  const uri = process.env.MONGODB_URI;
  const maxAttempts = Math.max(1, parseInt(process.env.MONGO_CONNECT_RETRIES || '5', 10));
  let lastErr;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (mongoose.connection.readyState === 1) {
        return true;
      }
      await mongoose.connect(uri, CONNECT_OPTS);
      console.log('MongoDB baglantisi basarili!');
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
        `[MongoDB] Baglanti denemesi ${attempt}/${maxAttempts} basarisiz:`,
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
    'MongoDB: Baglanti kurulamadi. Atlas IP (0.0.0.0/0), MONGODB_URI ve ag.',
    lastErr?.message || ''
  );
  return false;
};

module.exports = connectDB;
