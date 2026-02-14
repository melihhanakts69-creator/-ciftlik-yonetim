const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const YemStok = require('../models/YemStok');
const YemHareket = require('../models/YemHareket');

// TÜM YEM STOKLARINI GETİR
router.get('/stok', auth, async (req, res) => {
  try {
    const stoklar = await YemStok.find({ userId: req.userId });
    res.json(stoklar);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// YEM STOK EKLE/GÜNCELLE
router.post('/stok', auth, async (req, res) => {
  try {
    const { yemTipi, miktar, birim, minimumStok, birimFiyat } = req.body;

    // Var olan stok kontrolü
    let stok = await YemStok.findOne({ userId: req.userId, yemTipi });

    if (stok) {
      // Güncelle
      stok.miktar = miktar;
      stok.birim = birim;
      stok.minimumStok = minimumStok || stok.minimumStok;
      stok.birimFiyat = birimFiyat || stok.birimFiyat;
      await stok.save();
    } else {
      // Yeni oluştur
      stok = new YemStok({
        userId: req.userId,
        yemTipi,
        miktar,
        birim,
        minimumStok,
        birimFiyat
      });
      await stok.save();
    }

    res.json(stok);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// YEM HAREKETLERİNİ GETİR
router.get('/hareketler', auth, async (req, res) => {
  try {
    const hareketler = await YemHareket.find({ userId: req.userId }).sort({ tarih: -1 });
    res.json(hareketler);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// YEM HAREKET EKLE
router.post('/hareket', auth, async (req, res) => {
  try {
    const { yemTipi, hareketTipi, miktar, birimFiyat, tarih, aciklama } = req.body;

    // Hareket kaydı oluştur
    const hareket = new YemHareket({
      userId: req.userId,
      yemTipi,
      hareketTipi,
      miktar,
      birimFiyat: birimFiyat || 0,
      toplamTutar: (birimFiyat || 0) * miktar,
      tarih,
      aciklama
    });

    await hareket.save();

    // Stok güncelle
    let stok = await YemStok.findOne({ userId: req.userId, yemTipi });

    if (!stok) {
      stok = new YemStok({
        userId: req.userId,
        yemTipi,
        miktar: 0,
        birim: 'kg'
      });
    }

    if (hareketTipi === 'Alım') {
      stok.miktar += miktar;
    } else {
      stok.miktar -= miktar;
    }

    await stok.save();

    res.status(201).json({ hareket, stok });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;