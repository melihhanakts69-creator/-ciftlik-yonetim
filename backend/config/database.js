const mongoose = require('mongoose');
// Bağlantı yokken sorguları sonsuza kadar bekletme (buffering timeout yerine hızlı hata)
mongoose.set('bufferCommands', false);

/**
 * Atlas / Render: Network Access’te IP izni şart.
 * - Atlas → Network Access → Add IP → 0.0.0.0/0 (tüm IP’ler) VEYA Render çıkış IP’leri
 * Aksi halde: "not whitelisted", buffering timeout, login patlar.
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI tanımlı değil.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB readyState beklenen değil');
    }

    console.log('MongoDB baglantisi basarili!');

    // === INDEX MIGRASYONU ===
    // Eski email_1 unique index'i kaldir (varsa)
    // Artik email+rol compound index kullaniyoruz
    try {
      const userCol = mongoose.connection.collection('users');
      const indexes = await userCol.indexes();
      const oldIdx = indexes.find(idx => idx.name === 'email_1');
      if (oldIdx) {
        await userCol.dropIndex('email_1');
        console.log('Eski email_1 unique index kaldirildi.');
      }
    } catch (idxErr) {
      console.log('Index migration:', idxErr.message);
    }

  } catch (error) {
    console.error('MongoDB baglanti hatasi:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;