const mongoose = require('mongoose');

const uri =
  'mongodb+srv://Melihhan:05465742067M@melih.faq6tsp.mongodb.net/Agrolina?appName=Melih';

const opts = {
  serverSelectionTimeoutMS: 30000,
  family: 4,
};

async function connectDB() {
  console.log('🚜 [SIFIR_KM_BAGLANTI] - AGROLINA AYAĞA KALKIYOR...');

  try {
    if (mongoose.connection.readyState === 1) {
      console.log('✅ [SIFIR_KM_BAGLANTI] - VERİTABANI BETON GİBİ BAĞLANDI! MERCEDES YOLA ÇIKTI!');
      return true;
    }

    await mongoose.connect(uri, opts);

    console.log('✅ [SIFIR_KM_BAGLANTI] - VERİTABANI BETON GİBİ BAĞLANDI! MERCEDES YOLA ÇIKTI!');

    return true;
  } catch (err) {
    console.error('❌ [SIFIR_KM_BAGLANTI] - PATLADIK! Hata Objesi:', JSON.stringify(err, null, 2));
    if (err && err.message) {
      console.error('❌ [SIFIR_KM_BAGLANTI] - err.message:', err.message);
    }
    return false;
  }
}

module.exports = connectDB;
