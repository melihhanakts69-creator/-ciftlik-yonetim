const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Inek = require('../models/Inek');

// TÜM İNEKLERİ GETİR
router.get('/', auth, async (req, res) => {
  try {
    const inekler = await Inek.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(inekler);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// YENİ İNEK EKLE
router.post('/', auth, async (req, res) => {
  try {
    const { isim, yas, kilo, kupeNo, dogumTarihi, buzagiSayisi, notlar } = req.body;

    const inek = new Inek({
      userId: req.userId,
      isim,
      yas,
      kilo,
      kupeNo,
      dogumTarihi,
      buzagiSayisi,
      notlar
    });

    await inek.save();
    res.status(201).json(inek);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// İNEK GÜNCELLE
router.put('/:id', auth, async (req, res) => {
  try {
   const {
  isim,
  yas,
  kilo,
  kupeNo,
  dogumTarihi,
  buzagiSayisi,
  notlar,

  gebelikDurumu,
  tohumlamaTarihi,
  sonBuzagilamaTarihi,
  kuruDonemiBaslangic,
  laktasyonDonemi
} = req.body;
router.get('/yaklasan-dogumlar', auth, async (req, res) => {
  try {
    const today = new Date();
    const limit = new Date();
    limit.setDate(today.getDate() + 30);

    const inekler = await Inek.find({
      userId: req.userId,
      gebelikDurumu: 'Gebe',
      tohumlamaTarihi: { $ne: null }
    });

    const sonuc = inekler.filter(inek => {
      const tohumlama = new Date(inek.tohumlamaTarihi);
      if (isNaN(tohumlama)) return false;

      const dogum = new Date(tohumlama);
      dogum.setDate(dogum.getDate() + 280);

      return dogum >= today && dogum <= limit;
    });

    res.json(sonuc);
  } catch (err) {
    res.status(500).json({ message: 'Yaklaşan doğumlar alınamadı' });
  }
});

const inek = await Inek.findOneAndUpdate(
  { _id: req.params.id, userId: req.userId },
  {
    isim,
    yas,
    kilo,
    kupeNo,
    dogumTarihi,
    buzagiSayisi,
    notlar,

    gebelikDurumu,
    tohumlamaTarihi,
    sonBuzagilamaTarihi,
    kuruDonemiBaslangic,
    laktasyonDonemi
  },
  { new: true }
);


    if (!inek) {
      return res.status(404).json({ message: 'İnek bulunamadı' });
    }

    res.json(inek);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// İNEK SİL
router.delete('/:id', auth, async (req, res) => {
  try {
    const inek = await Inek.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!inek) {
      return res.status(404).json({ message: 'İnek bulunamadı' });
    }

    res.json({ message: 'İnek silindi', inek });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});


module.exports = router;