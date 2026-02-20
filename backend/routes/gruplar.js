const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Grup = require('../models/Grup');
const Inek = require('../models/Inek');
const Duve = require('../models/Duve');
const Buzagi = require('../models/Buzagi');
const Tosun = require('../models/Tosun');

// Helper: Tüm hayvanları sorgula (4 modeli birleştirir)
const getAllAnimals = async (userId, filter = {}) => {
  const baseFilter = { userId, ...filter };

  const [inekler, duveler, buzagilar, tosunlar] = await Promise.all([
    Inek.find(baseFilter).lean(),
    Duve.find(baseFilter).lean(),
    Buzagi.find(baseFilter).lean(),
    Tosun.find(baseFilter).lean()
  ]);

  return [
    ...inekler.map(h => ({ ...h, tip: 'inek' })),
    ...duveler.map(h => ({ ...h, tip: 'duve' })),
    ...buzagilar.map(h => ({ ...h, tip: 'buzagi' })),
    ...tosunlar.map(h => ({ ...h, tip: 'tosun' }))
  ];
};

// Helper: Tekil hayvan bul
const findAnimalById = async (userId, hayvanId, tip) => {
  const modelMap = { inek: Inek, duve: Duve, buzagi: Buzagi, tosun: Tosun };
  const Model = modelMap[tip];
  if (!Model) return null;
  return Model.findOne({ _id: hayvanId, userId });
};

// Tüm grupları listele
router.get('/', auth, async (req, res) => {
  try {
    const { tip, aktif = 'true' } = req.query;

    const filter = { userId: req.userId };
    if (tip) filter.tip = tip;
    if (aktif !== undefined) filter.aktif = aktif === 'true';

    const gruplar = await Grup.find(filter).sort({ ad: 1 });

    res.json(gruplar);
  } catch (error) {
    console.error('Gruplar listesi error:', error);
    res.status(500).json({ message: 'Gruplar listelenemedi' });
  }
});

// Belirli bir grubu getir
router.get('/:id', auth, async (req, res) => {
  try {
    const grup = await Grup.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!grup) {
      return res.status(404).json({ message: 'Grup bulunamadı' });
    }

    res.json({ grup });
  } catch (error) {
    console.error('Grup getirme error:', error);
    res.status(500).json({ message: 'Grup getirilemedi' });
  }
});

// Yeni grup oluştur
router.post('/', auth, async (req, res) => {
  try {
    const { ad, aciklama, renk, tip, ozellikler } = req.body;
    const grup = new Grup({
      userId: req.userId,
      ad, aciklama, renk, tip, ozellikler
    });

    await grup.save();

    res.status(201).json({
      message: 'Grup oluşturuldu',
      grup
    });
  } catch (error) {
    console.error('Grup oluşturma error:', error);
    res.status(400).json({ message: 'Grup oluşturulamadı' });
  }
});

// Grubu güncelle
router.put('/:id', auth, async (req, res) => {
  try {
    const { userId, _id, ...safeBody } = req.body;
    const grup = await Grup.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      safeBody,
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
    res.status(400).json({ message: 'Grup güncellenemedi' });
  }
});

// Grubu sil (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const grup = await Grup.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { aktif: false },
      { new: true }
    );

    if (!grup) {
      return res.status(404).json({ message: 'Grup bulunamadı' });
    }

    res.json({ message: 'Grup silindi' });
  } catch (error) {
    console.error('Grup silme error:', error);
    res.status(500).json({ message: 'Grup silinemedi' });
  }
});

// Grup istatistikleri
router.get('/ozet/istatistik', auth, async (req, res) => {
  try {
    const gruplar = await Grup.find({
      userId: req.userId,
      aktif: true
    });

    const hayvanlar = await getAllAnimals(req.userId);

    res.json({
      toplamGrup: gruplar.length,
      toplamHayvan: hayvanlar.length
    });
  } catch (error) {
    console.error('Grup istatistikleri error:', error);
    res.status(500).json({ message: 'Grup istatistikleri alınamadı' });
  }
});

// Tipe göre grupları listele
router.get('/tip/:tip', auth, async (req, res) => {
  try {
    const gruplar = await Grup.find({
      userId: req.userId,
      tip: req.params.tip,
      aktif: true
    }).sort({ ad: 1 });

    res.json(gruplar);
  } catch (error) {
    console.error('Tip grupları error:', error);
    res.status(500).json({ message: 'Gruplar alınamadı' });
  }
});

module.exports = router;
