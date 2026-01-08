const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// KAYIT OL
router.post('/register', async (req, res) => {
  try {
    const { isim, email, sifre, isletmeAdi, telefon } = req.body;

    // Email kontrolü
    const mevcutUser = await User.findOne({ email });
    if (mevcutUser) {
      return res.status(400).json({ message: 'Bu email zaten kayıtlı!' });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(sifre, 10);

    // Yeni user oluştur
    const user = new User({
      isim,
      email,
      sifre: hashedPassword,
      isletmeAdi,
      telefon
    });

    await user.save();

    // Token oluştur
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Kayıt başarılı!',
      token,
      user: {
        id: user._id,
        isim: user.isim,
        email: user.email,
        isletmeAdi: user.isletmeAdi
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// GİRİŞ YAP
router.post('/login', async (req, res) => {
  try {
    const { email, sifre } = req.body;

    // User bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email veya şifre hatalı!' });
    }

    // Şifreyi kontrol et
    const sifreDogrumu = await bcrypt.compare(sifre, user.sifre);
    if (!sifreDogrumu) {
      return res.status(400).json({ message: 'Email veya şifre hatalı!' });
    }

    // Token oluştur
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Giriş başarılı!',
      token,
      user: {
        id: user._id,
        isim: user.isim,
        email: user.email,
        isletmeAdi: user.isletmeAdi
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// PROFİL BİLGİLERİ (Login kontrolü ile)
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-sifre');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;