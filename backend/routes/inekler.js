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
    const { isim, yas, kilo, kupeNo, dogumTarihi, buzagiSayisi, notlar } = req.body;

    const inek = await Inek.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isim, yas, kilo, kupeNo, dogumTarihi, buzagiSayisi, notlar },
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