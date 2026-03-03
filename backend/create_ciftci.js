require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const EMAIL = 'melihhan.akts69@gmail.com';
const SIFRE = '05465742067m';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('DB OK');

    // Zaten var mı?
    const varMi = await User.findOne({ email: EMAIL, rol: 'ciftci' });
    if (varMi) {
        console.log('✅ Zaten ciftci hesabı mevcut:', varMi._id);
        await mongoose.disconnect(); process.exit(0);
    }

    // null rolu olan eski hesap var mı?
    const eskiHesap = await User.findOne({ email: EMAIL, $or: [{ rol: null }, { rol: { $exists: false } }] });
    if (eskiHesap) {
        console.log('🔄 Eski hesap bulundu, rol güncelleniyor...');
        eskiHesap.rol = 'ciftci';
        await eskiHesap.save();
        console.log('✅ Eski hesap ciftci olarak güncellendi:', eskiHesap._id);
        await mongoose.disconnect(); process.exit(0);
    }

    // Yeni hesap oluştur - insert directly to bypass unique index issues
    const hashSifre = await bcrypt.hash(SIFRE, 10);

    // Use insertOne via the native driver to bypass mongoose middleware issues
    const db = mongoose.connection.db;
    const result = await db.collection('users').insertOne({
        isim: 'ADMİN MELİH',
        email: EMAIL,
        sifre: hashSifre,
        rol: 'ciftci',
        aktif: true,
        isletmeAdi: 'Agrolina Admin Çiftliği',
        sehir: 'İstanbul',
        createdAt: new Date(),
        updatedAt: new Date()
    });

    console.log('✅ Çiftçi hesabı oluşturuldu! ID:', result.insertedId);
    await mongoose.disconnect();
    process.exit(0);
}).catch(e => {
    console.error('HATA:', e.message);
    console.error('Detay:', e);
    process.exit(1);
});
