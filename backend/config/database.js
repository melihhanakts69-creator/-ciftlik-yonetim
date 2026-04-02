const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI tanımlı değil.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);

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