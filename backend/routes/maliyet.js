const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Maliyet = require('../models/Maliyet');

// Tüm maliyetleri listele (filtreleme + sayfalama)
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const {
      kategori,
      hayvanTipi,
      baslangic,
      bitis,
      odemeTipi,
      page = 1,
      limit = 50
    } = req.query;

    // Filtre oluştur
    const filter = { userId };

    if (kategori) filter.kategori = kategori;
    if (hayvanTipi) filter.hayvanTipi = hayvanTipi;
    if (odemeTipi) filter.odemeTipi = odemeTipi;

    if (baslangic || bitis) {
      filter.tarih = {};
      if (baslangic) filter.tarih.$gte = new Date(baslangic);
      if (bitis) filter.tarih.$lte = new Date(bitis);
    }

    // Sayfalama
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const maliyetler = await Maliyet.find(filter)
      .sort({ tarih: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const toplam = await Maliyet.countDocuments(filter);

    res.json({
      maliyetler,
      sayfa: {
        current: parseInt(page),
        total: Math.ceil(toplam / parseInt(limit)),
        toplam
      }
    });
  } catch (error) {
    console.error('Maliyetler listesi error:', error);
    res.status(500).json({ message: 'Maliyetler listelenemedi', error: error.message });
  }
});

// Belirli bir maliyet kaydını getir
router.get('/:id', auth, async (req, res) => {
  try {
    const maliyet = await Maliyet.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!maliyet) {
      return res.status(404).json({ message: 'Maliyet kaydı bulunamadı' });
    }

    res.json(maliyet);
  } catch (error) {
    console.error('Maliyet getirme error:', error);
    res.status(500).json({ message: 'Maliyet kaydı getirilemedi', error: error.message });
  }
});

// Yeni maliyet kaydı oluştur
router.post('/', auth, async (req, res) => {
  try {
    const maliyetData = {
      ...req.body,
      userId: req.user.userId
    };

    const maliyet = new Maliyet(maliyetData);
    await maliyet.save();

    res.status(201).json({
      message: 'Maliyet kaydı oluşturuldu',
      maliyet
    });
  } catch (error) {
    console.error('Maliyet oluşturma error:', error);
    res.status(400).json({ message: 'Maliyet kaydı oluşturulamadı', error: error.message });
  }
});

// Maliyet kaydını güncelle
router.put('/:id', auth, async (req, res) => {
  try {
    const maliyet = await Maliyet.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!maliyet) {
      return res.status(404).json({ message: 'Maliyet kaydı bulunamadı' });
    }

    res.json({
      message: 'Maliyet kaydı güncellendi',
      maliyet
    });
  } catch (error) {
    console.error('Maliyet güncelleme error:', error);
    res.status(400).json({ message: 'Maliyet kaydı güncellenemedi', error: error.message });
  }
});

// Maliyet kaydını sil
router.delete('/:id', auth, async (req, res) => {
  try {
    const maliyet = await Maliyet.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!maliyet) {
      return res.status(404).json({ message: 'Maliyet kaydı bulunamadı' });
    }

    res.json({ message: 'Maliyet kaydı silindi' });
  } catch (error) {
    console.error('Maliyet silme error:', error);
    res.status(500).json({ message: 'Maliyet kaydı silinemedi', error: error.message });
  }
});

// Toplam maliyet hesapla
router.get('/ozet/toplam', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { baslangic, bitis } = req.query;

    if (!baslangic || !bitis) {
      return res.status(400).json({ message: 'Başlangıç ve bitiş tarihi gerekli' });
    }

    const toplam = await Maliyet.toplamMaliyet(userId, baslangic, bitis);

    res.json({ toplam });
  } catch (error) {
    console.error('Toplam maliyet error:', error);
    res.status(500).json({ message: 'Toplam maliyet hesaplanamadı', error: error.message });
  }
});

// Kategoriye göre maliyet özeti
router.get('/ozet/kategori', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { baslangic, bitis } = req.query;

    if (!baslangic || !bitis) {
      return res.status(400).json({ message: 'Başlangıç ve bitiş tarihi gerekli' });
    }

    const kategoriler = await Maliyet.kategoriyeGoreMaliyet(userId, baslangic, bitis);

    res.json(kategoriler);
  } catch (error) {
    console.error('Kategori özeti error:', error);
    res.status(500).json({ message: 'Kategori özeti alınamadı', error: error.message });
  }
});

// Aylık maliyet raporu
router.get('/rapor/aylik', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { yil, ay } = req.query;

    if (!yil || !ay) {
      return res.status(400).json({ message: 'Yıl ve ay gerekli' });
    }

    const baslangic = new Date(yil, ay - 1, 1);
    const bitis = new Date(yil, ay, 0, 23, 59, 59);

    const toplam = await Maliyet.toplamMaliyet(userId, baslangic, bitis);
    const kategoriler = await Maliyet.kategoriyeGoreMaliyet(userId, baslangic, bitis);

    // Günlük detay
    const gunlukDetay = await Maliyet.aggregate([
      {
        $match: {
          userId: req.userId,
          tarih: { $gte: baslangic, $lte: bitis }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: '$tarih' },
          toplam: { $sum: '$tutar' },
          adet: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      toplam,
      kategoriler,
      gunlukDetay
    });
  } catch (error) {
    console.error('Aylık rapor error:', error);
    res.status(500).json({ message: 'Aylık rapor alınamadı', error: error.message });
  }
});

// Hayvana göre maliyetler
router.get('/hayvan/:hayvanId', auth, async (req, res) => {
  try {
    const maliyetler = await Maliyet.find({
      userId: req.userId,
      hayvanId: req.params.hayvanId
    }).sort({ tarih: -1 });

    const toplam = maliyetler.reduce((acc, m) => acc + m.tutar, 0);

    res.json({
      maliyetler,
      toplam
    });
  } catch (error) {
    console.error('Hayvan maliyetleri error:', error);
    res.status(500).json({ message: 'Hayvan maliyetleri alınamadı', error: error.message });
  }
});

module.exports = router;
