const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { registerValidation, loginValidation, updateValidation } = require('../validators/authValidator');

// Token oluşturma yardımcı fonksiyonu
const generateAccessToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    console.error('CRITICAL ERROR: JWT_SECRET environment variable is not defined!');
    throw new Error('JWT_SECRET missing');
  }
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }  // 15 dakika
  );
};

// KAYIT OL
router.post('/register', registerValidation, async (req, res) => {
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

    // Token'lar oluştur
    const token = generateAccessToken(user._id);
    const refreshToken = await RefreshToken.createToken(user._id);

    res.status(201).json({
      message: 'Kayıt başarılı!',
      token,
      refreshToken,
      user: {
        id: user._id,
        isim: user.isim,
        email: user.email,
        isletmeAdi: user.isletmeAdi
      }
    });
  } catch (error) {
    console.error('Register Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// GİRİŞ YAP
router.post('/login', loginValidation, async (req, res) => {
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

    // Token'lar oluştur
    const token = generateAccessToken(user._id);
    const refreshToken = await RefreshToken.createToken(user._id);

    res.json({
      message: 'Giriş başarılı!',
      token,
      refreshToken,
      user: {
        id: user._id,
        isim: user.isim,
        email: user.email,
        isletmeAdi: user.isletmeAdi
      }
    });
  } catch (error) {
    console.error('Login Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// TOKEN YENİLE
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token gerekli' });
    }

    // Refresh token'ı doğrula
    const storedToken = await RefreshToken.verifyToken(refreshToken);
    if (!storedToken) {
      return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' });
    }

    // Kullanıcı hala var mı kontrol et
    const user = await User.findById(storedToken.userId);
    if (!user) {
      await RefreshToken.revokeAllUserTokens(storedToken.userId);
      return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Eski refresh token'ı sil, yenisini üret (rotation)
    await storedToken.deleteOne();
    const newRefreshToken = await RefreshToken.createToken(user._id);
    const newAccessToken = generateAccessToken(user._id);

    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// ÇIKIŞ YAP (Refresh token'ı geçersiz kıl)
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    res.json({ message: 'Çıkış başarılı!' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
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

// PROFİL GÜNCELLE
router.put('/update', require('../middleware/auth'), updateValidation, async (req, res) => {
  try {
    const { isim, email, isletmeAdi, mevcutSifre, yeniSifre } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı!' });
    }

    // Şifre değişikliği isteniyorsa
    if (mevcutSifre && yeniSifre) {
      const sifreDogru = await bcrypt.compare(mevcutSifre, user.sifre);
      if (!sifreDogru) {
        return res.status(400).json({ message: 'Mevcut şifre hatalı!' });
      }
      user.sifre = await bcrypt.hash(yeniSifre, 10);
    }

    // Bilgileri güncelle
    if (isim) user.isim = isim;
    if (email) user.email = email;
    if (isletmeAdi) user.isletmeAdi = isletmeAdi;

    await user.save();

    res.json({
      message: 'Profil güncellendi!',
      user: {
        id: user._id,
        isim: user.isim,
        email: user.email,
        isletmeAdi: user.isletmeAdi
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;