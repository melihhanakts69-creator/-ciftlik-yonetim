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
router.post('/register', async (req, res) => {
  try {
    const { isim, email, sifre, telefon, rol = 'ciftci',
      // Çiftçi
      isletmeAdi, sehir,
      // Veteriner
      lisansNo, uzmanlik, klinikAdi,
      // Sütçü
      firmaAdi, bolge
    } = req.body;

    if (!isim || !email || !sifre) {
      return res.status(400).json({ message: 'İsim, email ve şifre zorunludur.' });
    }
    if (!['ciftci', 'veteriner', 'sutcu'].includes(rol)) {
      return res.status(400).json({ message: 'Geçersiz rol.' });
    }

    const mevcutUser = await User.findOne({ email });
    if (mevcutUser) {
      return res.status(400).json({ message: 'Bu email zaten kayıtlı!' });
    }

    const hashedPassword = await bcrypt.hash(sifre, 10);

    const user = new User({
      isim, email, sifre: hashedPassword, telefon, rol,
      // Çiftçi
      isletmeAdi, sehir,
      // Veteriner
      lisansNo, uzmanlik, klinikAdi,
      // Sütçü
      firmaAdi, bolge,
    });

    await user.save();

    const token = generateAccessToken(user._id);
    const refreshToken = await RefreshToken.createToken(user._id);

    res.status(201).json({
      message: 'Kayıt başarılı!',
      token, refreshToken,
      user: { id: user._id, isim: user.isim, email: user.email, rol: user.rol, isletmeAdi: user.isletmeAdi, firmaAdi: user.firmaAdi, klinikAdi: user.klinikAdi }
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

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email veya şifre hatalı!' });

    const sifreDogrumu = await bcrypt.compare(sifre, user.sifre);
    if (!sifreDogrumu) return res.status(400).json({ message: 'Email veya şifre hatalı!' });

    if (!user.aktif) return res.status(403).json({ message: 'Hesabınız askıya alınmış. Destek ile iletişime geçin.' });

    user.sonGiris = new Date();
    await user.save();

    const token = generateAccessToken(user._id);
    const refreshToken = await RefreshToken.createToken(user._id);

    res.json({
      message: 'Giriş başarılı!',
      token, refreshToken,
      user: { id: user._id, isim: user.isim, email: user.email, rol: user.rol || 'ciftci', isletmeAdi: user.isletmeAdi, firmaAdi: user.firmaAdi, klinikAdi: user.klinikAdi, onaylandi: user.onaylandi }
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
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
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