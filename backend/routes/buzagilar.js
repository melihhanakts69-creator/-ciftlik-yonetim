const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Buzagi = require('../models/Buzagi');

// TÜM BUZAĞILARI GETİR
router.get('/', auth, async (req, res) => {
  try {
    const buzagilar = await Buzagi.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(buzagilar);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// YENİ BUZAĞI EKLE
router.post('/', auth, async (req, res) => {
  try {
    const { isim, anneId, anneIsim, dogumTarihi, cinsiyet, kilo, notlar, eklemeTarihi } = req.body;
    
    console.log('Gelen buzağı verisi:', { isim, anneId, anneIsim, dogumTarihi, cinsiyet, kilo, notlar, eklemeTarihi, userId: req.userId });

    const buzagi = new Buzagi({
      userId: req.userId,
      isim,
      anneId,
      anneIsim,
      dogumTarihi,
      cinsiyet,
      kilo,
      notlar,
      eklemeTarihi
    });

    await buzagi.save();
    console.log('Buzağı kayıt başarılı:', buzagi);
    res.status(201).json(buzagi);
  } catch (error) {
    console.error('❌ BUZAĞI KAYDI HATASI:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// BUZAĞI SİL
router.delete('/:id', auth, async (req, res) => {
  try {
    const buzagi = await Buzagi.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!buzagi) {
      return res.status(404).json({ message: 'Buzağı bulunamadı' });
    }

    res.json({ message: 'Buzağı silindi', buzagi });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router;