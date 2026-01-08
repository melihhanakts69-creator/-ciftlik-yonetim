const express = require('express');
const router = express.Router();
const Tosun = require('../models/Tosun');
const auth = require('../middleware/auth');

// TÜMÜNÜ GETİR
router.get('/', auth, async (req, res) => {
  try {
    const tosunlar = await Tosun.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(tosunlar);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// YENİ TOSUN EKLE
router.post('/', auth, async (req, res) => {
  try {
    const yeniTosun = new Tosun({
      userId: req.userId,
      ...req.body
    });
    await yeniTosun.save();
    res.status(201).json(yeniTosun);
  } catch (error) {
    res.status(500).json({ message: 'Tosun eklenemedi', error: error.message });
  }
});

// GÜNCELLE
router.put('/:id', auth, async (req, res) => {
  try {
    const tosun = await Tosun.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    
    if (!tosun) {
      return res.status(404).json({ message: 'Tosun bulunamadı' });
    }
    
    res.json(tosun);
  } catch (error) {
    res.status(500).json({ message: 'Güncelleme başarısız', error: error.message });
  }
});

// SİL
router.delete('/:id', auth, async (req, res) => {
  try {
    const tosun = await Tosun.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!tosun) {
      return res.status(404).json({ message: 'Tosun bulunamadı' });
    }
    
    res.json({ message: 'Tosun silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Silme başarısız', error: error.message });
  }
});

module.exports = router;