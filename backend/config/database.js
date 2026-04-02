const mongoose = require('mongoose');

const CONNECT_OPTS = {
  serverSelectionTimeoutMS: 45000,
  socketTimeoutMS: 120000,
  maxPoolSize: 10,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI tanımlı değil');
  }

  const uri = process.env.MONGODB_URI;
  const maxAttempts = Math.max(1, parseInt(process.env.MONGO_CONNECT_RETRIES || '5', 10));
  let lastErr;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (mongoose.connection.readyState === 1) {
        console.log('MongoDB zaten bağlı.');
        break;
      }
      await mongoose.connect(uri, CONNECT_OPTS);
      console.log('MongoDB baglantisi basarili!');
      break;
    } catch (error) {
      lastErr = error;
      console.error(
        `[MongoDB] Baglanti denemesi ${attempt}/${maxAttempts} basarisiz:`,
        error.message
      );
      try {
        await mongoose.disconnect();
      } catch (_) {
        /* yarım kalmış baglanti */
      }
      if (attempt < maxAttempts) {
        const waitMs = Math.min(2000 * 2 ** (attempt - 1), 30000);
        await sleep(waitMs);
      }
    }
  }

  if (mongoose.connection.readyState !== 1) {
    console.error(
      'MongoDB: Atlas IP whitelist, MONGODB_URI veya ag erisimini kontrol edin.'
    );
    throw lastErr || new Error('MongoDB baglantisi kurulamadi');
  }

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] disconnected — yeniden baglanti denenecek');
  });

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
};

module.exports = connectDB;
