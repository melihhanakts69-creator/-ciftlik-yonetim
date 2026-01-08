const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Inek = require('../models/Inek');
const Duve = require('../models/Duve');  // ← EKLE

// TÜM İNEKLERİ GETİR
router.get('/', auth, async (req, res) => {
  try {
    const inekler = await Inek.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(inekler);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// YAKLAŞAN DOĞUMLAR (30 GÜN İÇİNDE) - İNEK + DÜVE
router.get('/yaklasan-dogumlar', auth, async (req, res) => {
  try {
    const inekler = await Inek.find({ userId: req.userId });
    const duveler = await Duve.find({ userId: req.userId });
    
    const bugun = new Date();
    const yaklasanlar = [];

    // İNEKLER
    for (const inek of inekler) {
      if (inek.tohumlamaTarihi && inek.gebelikDurumu === 'Gebe') {
        const tohumlamaTarihi = new Date(inek.tohumlamaTarihi);
        const tahminiDoğum = new Date(tohumlamaTarihi);
        tahminiDoğum.setDate(tahminiDoğum.getDate() + 283);

        const kalanGun = Math.ceil((tahminiDoğum - bugun) / (1000 * 60 * 60 * 24));

        if (kalanGun >= 0 && kalanGun <= 30) {
          yaklasanlar.push({
            hayvan: inek,
            hayvanTipi: 'inek',
            tahminiDoğum,
            kalanGun
          });
        }
      }
    }

    // DÜVELER
    for (const duve of duveler) {
      if (duve.tohumlamaTarihi && duve.gebelikDurumu === 'Gebe') {
        const tohumlamaTarihi = new Date(duve.tohumlamaTarihi);
        const tahminiDoğum = new Date(tohumlamaTarihi);
        tahminiDoğum.setDate(tahminiDoğum.getDate() + 283);

        const kalanGun = Math.ceil((tahminiDoğum - bugun) / (1000 * 60 * 60 * 24));

        if (kalanGun >= 0 && kalanGun <= 30) {
          yaklasanlar.push({
            hayvan: duve,
            hayvanTipi: 'duve',
            tahminiDoğum,
            kalanGun
          });
        }
      }
    }

    // Tarihe göre sırala (en yakın önce)
    yaklasanlar.sort((a, b) => a.kalanGun - b.kalanGun);

    res.json(yaklasanlar);
  } catch (error) {
    console.error('Yaklaşan doğumlar hatası:', error);
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