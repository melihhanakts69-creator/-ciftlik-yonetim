const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Grup = require('../models/Grup');
const Animal = require('../models/Animal');

// Tüm grupları listele
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { tip, aktif = 'true' } = req.query;

    // Filtre oluştur
    const filter = { userId };

    if (tip) filter.tip = tip;
    if (aktif !== undefined) filter.aktif = aktif === 'true';

    const gruplar = await Grup.find(filter).sort({ ad: 1 });

    res.json(gruplar);
  } catch (error) {
    console.error('Gruplar listesi error:', error);
    res.status(500).json({ message: 'Gruplar listelenemedi', error: error.message });
  }
});

// Belirli bir grubu getir
router.get('/:id', auth, async (req, res) => {
  try {
    const grup = await Grup.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!grup) {
      return res.status(404).json({ message: 'Grup bulunamadı' });
    }

    // Gruptaki hayvanları da getir
    const hayvanlar = await Animal.find({
      grupId: grup._id
    }).select('kupe_no ad tip dogum_tarihi gunluk_sut');

    res.json({
      grup,
      hayvanlar
    });
  } catch (error) {
    console.error('Grup getirme error:', error);
    res.status(500).json({ message: 'Grup getirilemedi', error: error.message });
  }
});

// Yeni grup oluştur
router.post('/', auth, async (req, res) => {
  try {
    const grupData = {
      ...req.body,
      userId: req.user.userId
    };

    const grup = new Grup(grupData);
    await grup.save();

    res.status(201).json({
      message: 'Grup oluşturuldu',
      grup
    });
  } catch (error) {
    console.error('Grup oluşturma error:', error);
    res.status(400).json({ message: 'Grup oluşturulamadı', error: error.message });
  }
});

// Grubu güncelle
router.put('/:id', auth, async (req, res) => {
  try {
    const grup = await Grup.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!grup) {
      return res.status(404).json({ message: 'Grup bulunamadı' });
    }

    res.json({
      message: 'Grup güncellendi',
      grup
    });
  } catch (error) {
    console.error('Grup güncelleme error:', error);
    res.status(400).json({ message: 'Grup güncellenemedi', error: error.message });
  }
});

// Grubu sil (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const grup = await Grup.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId
      },
      { aktif: false },
      { new: true }
    );

    if (!grup) {
      return res.status(404).json({ message: 'Grup bulunamadı' });
    }

    // Gruptaki hayvanların grup bilgisini kaldır
    await Animal.updateMany(
      { grupId: grup._id },
      { $unset: { grupId: "" } }
    );

    res.json({ message: 'Grup silindi' });
  } catch (error) {
    console.error('Grup silme error:', error);
    res.status(500).json({ message: 'Grup silinemedi', error: error.message });
  }
});

// Gruba hayvan ekle
router.post('/:id/hayvan', auth, async (req, res) => {
  try {
    const { hayvanId } = req.body;

    if (!hayvanId) {
      return res.status(400).json({ message: 'Hayvan ID gerekli' });
    }

    // Hayvanın kullanıcıya ait olduğunu kontrol et
    const hayvan = await Animal.findOne({
      _id: hayvanId,
      userId: req.user.userId
    });

    if (!hayvan) {
      return res.status(404).json({ message: 'Hayvan bulunamadı' });
    }

    // Gruba ekle
    const grup = await Grup.hayvanEkle(req.params.id, hayvanId);

    if (!grup) {
      return res.status(404).json({ message: 'Grup bulunamadı' });
    }

    res.json({
      message: 'Hayvan gruba eklendi',
      grup
    });
  } catch (error) {
    console.error('Hayvan ekleme error:', error);
    res.status(500).json({ message: 'Hayvan eklenemedi', error: error.message });
  }
});

// Gruptan hayvan çıkar
router.delete('/:id/hayvan/:hayvanId', auth, async (req, res) => {
  try {
    // Hayvanın kullanıcıya ait olduğunu kontrol et
    const hayvan = await Animal.findOne({
      _id: req.params.hayvanId,
      userId: req.user.userId
    });

    if (!hayvan) {
      return res.status(404).json({ message: 'Hayvan bulunamadı' });
    }

    // Gruptan çıkar
    const grup = await Grup.hayvanCikar(req.params.id, req.params.hayvanId);

    if (!grup) {
      return res.status(404).json({ message: 'Grup bulunamadı' });
    }

    res.json({
      message: 'Hayvan gruptan çıkarıldı',
      grup
    });
  } catch (error) {
    console.error('Hayvan çıkarma error:', error);
    res.status(500).json({ message: 'Hayvan çıkarılamadı', error: error.message });
  }
});

// Toplu hayvan ekleme
router.post('/:id/hayvanlar', auth, async (req, res) => {
  try {
    const { hayvanIds } = req.body;

    if (!Array.isArray(hayvanIds) || hayvanIds.length === 0) {
      return res.status(400).json({ message: 'Geçerli hayvan ID listesi gerekli' });
    }

    const grup = await Grup.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!grup) {
      return res.status(404).json({ message: 'Grup bulunamadı' });
    }

    // Tüm hayvanları gruba ekle
    const result = await Animal.updateMany(
      {
        _id: { $in: hayvanIds },
        userId: req.user.userId
      },
      { grupId: grup._id }
    );

    // İstatistikleri güncelle
    await grup.istatistikleriGuncelle();

    res.json({
      message: `${result.modifiedCount} hayvan gruba eklendi`,
      grup
    });
  } catch (error) {
    console.error('Toplu ekleme error:', error);
    res.status(500).json({ message: 'Hayvanlar eklenemedi', error: error.message });
  }
});

// Grup istatistiklerini güncelle
router.patch('/:id/istatistik-guncelle', auth, async (req, res) => {
  try {
    const grup = await Grup.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!grup) {
      return res.status(404).json({ message: 'Grup bulunamadı' });
    }

    await grup.istatistikleriGuncelle();

    res.json({
      message: 'İstatistikler güncellendi',
      grup
    });
  } catch (error) {
    console.error('İstatistik güncelleme error:', error);
    res.status(500).json({ message: 'İstatistikler güncellenemedi', error: error.message });
  }
});

// Kullanıcının grup istatistikleri
router.get('/ozet/istatistik', auth, async (req, res) => {
  try {
    const istatistikler = await Grup.grupIstatistikleri(req.user.userId);

    res.json(istatistikler);
  } catch (error) {
    console.error('Grup istatistikleri error:', error);
    res.status(500).json({ message: 'Grup istatistikleri alınamadı', error: error.message });
  }
});

// Grupsuz hayvanları listele
router.get('/ozet/grupsuz-hayvanlar', auth, async (req, res) => {
  try {
    const hayvanlar = await Animal.find({
      userId: req.user.userId,
      $or: [
        { grupId: { $exists: false } },
        { grupId: null }
      ]
    })
    .select('kupe_no ad tip dogum_tarihi gunluk_sut')
    .sort({ kupe_no: 1 });

    res.json(hayvanlar);
  } catch (error) {
    console.error('Grupsuz hayvanlar error:', error);
    res.status(500).json({ message: 'Grupsuz hayvanlar alınamadı', error: error.message });
  }
});

// Tipe göre grupları listele
router.get('/tip/:tip', auth, async (req, res) => {
  try {
    const gruplar = await Grup.find({
      userId: req.user.userId,
      tip: req.params.tip,
      aktif: true
    }).sort({ ad: 1 });

    res.json(gruplar);
  } catch (error) {
    console.error('Tip grupları error:', error);
    res.status(500).json({ message: 'Gruplar alınamadı', error: error.message });
  }
});

module.exports = router;
