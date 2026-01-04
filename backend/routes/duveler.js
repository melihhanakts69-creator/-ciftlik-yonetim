const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Duve = require('../models/Duve');
const Timeline = require('../models/Timeline');


// TÜM DÜVELERİ GETİR
router.get('/', auth, async (req, res) => {
  try {
    const duveler = await Duve.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(duveler);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// YENİ DÜVE EKLE
router.post('/', auth, async (req, res) => {
  try {
    const { isim, yas, kilo, kupeNo, dogumTarihi, tohumlamaTarihi, notlar, eklemeTarihi } = req.body;

    const duve = new Duve({
      userId: req.userId,
      isim,
      yas,
      kilo,
      kupeNo,
      dogumTarihi,
      tohumlamaTarihi,
      notlar,
      eklemeTarihi
    });
console.log('📌 tohumlamaTarihi:', tohumlamaTarihi);

await duve.save();


if (tohumlamaTarihi && tohumlamaTarihi.trim() !== '') {
  await Timeline.create({
    userId: req.userId,
    hayvanId: duve._id.toString(),
    hayvanTipi: 'duve',
    tip: 'tohumlama',
    tarih: tohumlamaTarihi,
    aciklama: 'Düve eklenirken otomatik tohumlama kaydı'
  });
}

res.status(201).json(duve);

  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// DÜVE SİL
router.delete('/:id', auth, async (req, res) => {
  try {
    const duve = await Duve.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!duve) {
      return res.status(404).json({ message: 'Düve bulunamadı' });
    }

    res.json({ message: 'Düve silindi', duve });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});
// DÜVE GÜNCELLE
router.put('/:id', auth, async (req, res) => {
  try {
    const duve = await Duve.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!duve) {
      return res.status(404).json({ message: 'Düve bulunamadı' });
    }

    res.json(duve);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});



module.exports = router;