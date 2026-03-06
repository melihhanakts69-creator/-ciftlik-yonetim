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
    if (!['ciftci', 'veteriner', 'sutcu', 'toplayici'].includes(rol)) {
      return res.status(400).json({ message: 'Geçersiz rol.' });
    }

    // Aynı email + aynı rol zaten kayıtlı ise hata dön
    const mevcutUser = await User.findOne({ email: email.toLowerCase(), rol });
    if (mevcutUser) {
      return res.status(400).json({ message: `Bu email ile zaten bir ${rol === 'ciftci' ? 'çiftçi' : rol === 'veteriner' ? 'veteriner' : rol === 'toplayici' ? 'süt toplayıcı' : 'sütçü'} hesabı mevcut!` });
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
    const { email, sifre, rol = 'ciftci' } = req.body;

    // Email + Rol kombinasyonu ile doğru hesabı bul
    // Aynı email farklı rollerde farklı hesap olabilir
    const rolLabel = rol === 'ciftci' ? 'çiftçi' : rol === 'veteriner' ? 'veteriner' : 'sütçü';

    // Önce email + rol kombinasyonu ile ara
    let user = await User.findOne({ email: email.toLowerCase(), rol });

    // Bulunamazsa ve ciftci ise: eski hesabı kontrol et (rol alanı null/undefined olabilir)
    if (!user && rol === 'ciftci') {
      user = await User.findOne({
        email: email.toLowerCase(),
        $or: [{ rol: null }, { rol: { $exists: false } }, { rol: 'ciftci' }]
      });
      // Eski hesabı bulduk, rolünü güncelle
      if (user && (!user.rol || user.rol !== 'ciftci')) {
        user.rol = 'ciftci';
        await user.save();
      }
    }

    if (!user) {
      // Aynı email'in başka rolde kaydı var mı kontrol et
      const digerRoller = ['ciftci', 'veteriner', 'sutcu'].filter(r => r !== rol);
      const digerHesap = await User.findOne({ email: email.toLowerCase(), rol: { $in: digerRoller } });

      if (digerHesap) {
        const digerRolLabel = digerHesap.rol === 'ciftci' ? 'Çiftçi 🐄' : digerHesap.rol === 'veteriner' ? 'Veteriner 🩺' : 'Süt Toplayıcı 🥛';
        return res.status(400).json({
          message: `Bu email, ${digerRolLabel} olarak kayıtlı! Lütfen giriş sayfasında doğru profili seçin.`,
          digerRol: digerHesap.rol
        });
      }

      return res.status(400).json({
        message: `Bu email ile kayıtlı ${rolLabel} hesabı bulunamadı! Farklı bir profil seçtin mi?`
      });
    }

    const sifreDogrumu = await bcrypt.compare(sifre, user.sifre);
    if (!sifreDogrumu) return res.status(400).json({ message: 'Şifre hatalı!' });

    if (!user.aktif) return res.status(403).json({ message: 'Hesabınız askıya alınmış.' });

    user.sonGiris = new Date();
    await user.save();

    const token = generateAccessToken(user._id);
    const refreshToken = await RefreshToken.createToken(user._id);

    let finalIsletmeAdi = user.isletmeAdi;

    // Eğer alt hesapsa (sütçü vb.) asıl işletmenin adını çekelim ki Dashboard veya Ayarlar patlamasın
    if (user.parentUserId) {
      const parentUser = await User.findById(user.parentUserId).select('isletmeAdi');
      if (parentUser && parentUser.isletmeAdi) {
        finalIsletmeAdi = parentUser.isletmeAdi;
      }
    }

    res.json({
      message: 'Giriş başarılı!',
      token, refreshToken,
      user: {
        id: user._id,
        isim: user.isim,
        email: user.email,
        rol: user.rol,
        isletmeAdi: finalIsletmeAdi,
        firmaAdi: user.firmaAdi,
        klinikAdi: user.klinikAdi,
        onaylandi: user.onaylandi,
        parentUserId: user.parentUserId || null
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
    const user = await User.findById(req.originalUserId || req.userId).select('-sifre');
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

    // Eğer alt hesapsa asıl üyenin işletme adını aktar
    let finalIsletmeAdi = user.isletmeAdi;
    if (user.parentUserId) {
      const parentUser = await User.findById(user.parentUserId).select('isletmeAdi');
      if (parentUser && parentUser.isletmeAdi) {
        finalIsletmeAdi = parentUser.isletmeAdi;
      }
    }

    const userData = { ...user.toObject(), isletmeAdi: finalIsletmeAdi };

    res.json({ user: userData });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// PROFİL GÜNCELLE
router.put('/update', require('../middleware/auth'), updateValidation, async (req, res) => {
  try {
    const { isim, email, isletmeAdi, sehir, telefon, profilFoto, logoUrl, mevcutSifre, yeniSifre, bolge, firmaAdi, lisansNo } = req.body;
    const user = await User.findById(req.originalUserId || req.userId);

    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı!' });

    // Şifre değişikliği
    if (mevcutSifre && yeniSifre) {
      const sifreDogru = await bcrypt.compare(mevcutSifre, user.sifre);
      if (!sifreDogru) return res.status(400).json({ message: 'Mevcut şifre hatalı!' });
      user.sifre = await bcrypt.hash(yeniSifre, 10);
    }

    // Profil alanları
    if (isim) user.isim = isim;
    if (email) user.email = email;
    if (isletmeAdi !== undefined) user.isletmeAdi = isletmeAdi;
    if (sehir !== undefined) user.sehir = sehir;
    if (telefon !== undefined) user.telefon = telefon;
    if (profilFoto !== undefined) user.profilFoto = profilFoto;
    if (logoUrl !== undefined) user.logoUrl = logoUrl; // Çiftlik özel logosu update
    if (bolge !== undefined) user.bolge = bolge;
    if (firmaAdi !== undefined) user.firmaAdi = firmaAdi;
    if (lisansNo !== undefined) user.lisansNo = lisansNo;

    await user.save();

    res.json({
      message: 'Profil güncellendi!',
      user: {
        id: user._id,
        isim: user.isim,
        email: user.email,
        rol: user.rol,
        isletmeAdi: user.isletmeAdi,
        sehir: user.sehir,
        telefon: user.telefon,
        profilFoto: user.profilFoto,
        logoUrl: user.logoUrl,
        bolge: user.bolge,
        firmaAdi: user.firmaAdi,
        lisansNo: user.lisansNo
      }
    });
  } catch (error) {
    console.error('Auth /update error:', error);
    res.status(500).json({ message: 'Sunucu hatası', detail: error.message });
  }
});

// ── Kurumsal Ayarlar: Alt Hesap (Personel) Yönetimi ──

// 1. Alt Hesapları Listele
router.get('/sub-accounts', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.rol !== 'ciftci') {
      return res.status(403).json({ message: 'Sadece çiftlik sahipleri alt hesapları görebilir.' });
    }

    const subAccounts = await User.find({ parentUserId: req.userId }).select('-sifre');
    res.json(subAccounts);
  } catch (error) {
    res.status(500).json({ message: 'Alt hesaplar getirilirken hata oluştu.' });
  }
});

// 2. Yeni Alt Hesap Oluştur
router.post('/sub-accounts', require('../middleware/auth'), async (req, res) => {
  try {
    const adminUser = await User.findById(req.userId);
    if (adminUser.rol !== 'ciftci') {
      return res.status(403).json({ message: 'Sadece çiftlik sahipleri alt hesap açabilir.' });
    }

    const { isim, email, sifre, telefon, rol } = req.body;

    if (!isim || !email || !sifre || !rol) {
      return res.status(400).json({ message: 'İsim, email, şifre ve rol zorunludur.' });
    }

    if (!['veteriner', 'sutcu'].includes(rol)) {
      return res.status(400).json({ message: 'Alt personel rolü sadece veteriner veya sutcu olabilir.' });
    }

    const mevcutUser = await User.findOne({ email: email.toLowerCase(), rol });
    if (mevcutUser) {
      return res.status(400).json({ message: `Bu email ile zaten bir ${rol} hesabı var.` });
    }

    const hashedPassword = await bcrypt.hash(sifre, 10);

    const newUser = new User({
      isim, email, sifre: hashedPassword, telefon, rol,
      parentUserId: adminUser._id, // Alt hesap ana hesaba bağlandı!
      onaylandi: true // Admin kendi açtığı için direkt onaylı
    });

    await newUser.save();
    res.status(201).json({ message: 'Alt hesap başarıyla oluşturuldu.', user: { id: newUser._id, isim, email, rol } });
  } catch (error) {
    console.error('Alt hesap açma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// 3. Alt Hesap Sil
router.delete('/sub-accounts/:id', require('../middleware/auth'), async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    // Sadece hesabı açan parent (ciftci) silebilir
    if (targetUser.parentUserId?.toString() !== req.userId) {
      return res.status(403).json({ message: 'Bu hesabı silme yetkiniz yok.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Alt hesap silindi.' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;