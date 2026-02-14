const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Bildirim = require('../models/Bildirim');

// Tüm bildirimleri listele
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;

    const {
      tip,
      oncelik,
      okundu,
      tamamlandi,
      aktif = 'true',
      page = 1,
      limit = 50
    } = req.query;

    // Filtre oluştur
    const filter = { userId };

    if (tip) filter.tip = tip;
    if (oncelik) filter.oncelik = oncelik;
    if (okundu !== undefined) filter.okundu = okundu === 'true';
    if (tamamlandi !== undefined) filter.tamamlandi = tamamlandi === 'true';
    if (aktif !== undefined) filter.aktif = aktif === 'true';

    // Sayfalama
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bildirimler = await Bildirim.find(filter)
      .sort({ oncelik: -1, hatirlatmaTarihi: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const toplam = await Bildirim.countDocuments(filter);

    res.json({
      bildirimler,
      sayfa: {
        current: parseInt(page),
        total: Math.ceil(toplam / parseInt(limit)),
        toplam
      }
    });
  } catch (error) {
    console.error('Bildirimler listesi error:', error);
    res.status(500).json({ message: 'Bildirimler listelenemedi' });
  }
});

// Belirli bir bildirimi getir
router.get('/:id', auth, async (req, res) => {
  try {
    const bildirim = await Bildirim.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!bildirim) {
      return res.status(404).json({ message: 'Bildirim bulunamadı' });
    }

    res.json(bildirim);
  } catch (error) {
    console.error('Bildirim getirme error:', error);
    res.status(500).json({ message: 'Bildirim getirilemedi' });
  }
});

// Yeni bildirim oluştur
router.post('/', auth, async (req, res) => {
  try {
    const bildirimData = {
      ...req.body,
      userId: req.userId
    };

    const bildirim = new Bildirim(bildirimData);
    await bildirim.save();

    res.status(201).json({
      message: 'Bildirim oluşturuldu',
      bildirim
    });
  } catch (error) {
    console.error('Bildirim oluşturma error:', error);
    res.status(400).json({ message: 'Bildirim oluşturulamadı' });
  }
});

// Bildirimi güncelle
router.put('/:id', auth, async (req, res) => {
  try {
    const bildirim = await Bildirim.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!bildirim) {
      return res.status(404).json({ message: 'Bildirim bulunamadı' });
    }

    res.json({
      message: 'Bildirim güncellendi',
      bildirim
    });
  } catch (error) {
    console.error('Bildirim güncelleme error:', error);
    res.status(400).json({ message: 'Bildirim güncellenemedi' });
  }
});

// Bildirimi sil (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const bildirim = await Bildirim.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId
      },
      { aktif: false },
      { new: true }
    );

    if (!bildirim) {
      return res.status(404).json({ message: 'Bildirim bulunamadı' });
    }

    res.json({ message: 'Bildirim silindi' });
  } catch (error) {
    console.error('Bildirim silme error:', error);
    res.status(500).json({ message: 'Bildirim silinemedi' });
  }
});

// Bildirimi okundu olarak işaretle
router.patch('/:id/okundu', auth, async (req, res) => {
  try {
    const bildirim = await Bildirim.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!bildirim) {
      return res.status(404).json({ message: 'Bildirim bulunamadı' });
    }

    await bildirim.okunduIsaretle();

    res.json({
      message: 'Bildirim okundu olarak işaretlendi',
      bildirim
    });
  } catch (error) {
    console.error('Okundu işaretleme error:', error);
    res.status(500).json({ message: 'Bildirim işaretlenemedi' });
  }
});

// Bildirimi tamamlandı olarak işaretle
router.patch('/:id/tamamlandi', auth, async (req, res) => {
  try {
    const bildirim = await Bildirim.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!bildirim) {
      return res.status(404).json({ message: 'Bildirim bulunamadı' });
    }

    await bildirim.tamamlandiIsaretle();

    res.json({
      message: 'Bildirim tamamlandı olarak işaretlendi',
      bildirim
    });
  } catch (error) {
    console.error('Tamamlandı işaretleme error:', error);
    res.status(500).json({ message: 'Bildirim işaretlenemedi' });
  }
});

// Tüm bildirimleri okundu olarak işaretle
router.patch('/toplu/okundu', auth, async (req, res) => {
  try {
    const result = await Bildirim.updateMany(
      {
        userId: req.userId,
        okundu: false,
        aktif: true
      },
      {
        okundu: true,
        okunmaTarihi: new Date()
      }
    );

    res.json({
      message: 'Tüm bildirimler okundu olarak işaretlendi',
      guncellenen: result.modifiedCount
    });
  } catch (error) {
    console.error('Toplu okundu işaretleme error:', error);
    res.status(500).json({ message: 'Bildirimler işaretlenemedi' });
  }
});

// Okunmamış bildirimler
router.get('/liste/okunmayan', auth, async (req, res) => {
  try {
    const bildirimler = await Bildirim.okunmayanlar(req.userId);

    res.json(bildirimler);
  } catch (error) {
    console.error('Okunmayanlar error:', error);
    res.status(500).json({ message: 'Okunmamış bildirimler alınamadı' });
  }
});

// Bugünün bildirimleri
router.get('/liste/bugun', auth, async (req, res) => {
  try {
    const bildirimler = await Bildirim.bugununkiler(req.userId);

    res.json(bildirimler);
  } catch (error) {
    console.error('Bugünkü bildirimler error:', error);
    res.status(500).json({ message: 'Bugünün bildirimleri alınamadı' });
  }
});

// Gecikmiş bildirimler
router.get('/liste/geciken', auth, async (req, res) => {
  try {
    const bildirimler = await Bildirim.gecikmisler(req.userId);

    res.json(bildirimler);
  } catch (error) {
    console.error('Gecikenler error:', error);
    res.status(500).json({ message: 'Geciken bildirimler alınamadı' });
  }
});

// Yaklaşan bildirimler
router.get('/liste/yaklasan', auth, async (req, res) => {
  try {
    const gun = parseInt(req.query.gun) || 7;

    const bildirimler = await Bildirim.yaklaşanlar(req.userId, gun);

    res.json(bildirimler);
  } catch (error) {
    console.error('Yaklaşanlar error:', error);
    res.status(500).json({ message: 'Yaklaşan bildirimler alınamadı' });
  }
});

// Bildirim istatistikleri
router.get('/ozet/istatistik', auth, async (req, res) => {
  try {
    const istatistikler = await Bildirim.istatistikler(req.userId);

    res.json(istatistikler);
  } catch (error) {
    console.error('İstatistikler error:', error);
    res.status(500).json({ message: 'İstatistikler alınamadı' });
  }
});

// Hayvana göre bildirimler
router.get('/hayvan/:hayvanId', auth, async (req, res) => {
  try {
    const bildirimler = await Bildirim.find({
      userId: req.userId,
      hayvanId: req.params.hayvanId,
      aktif: true
    }).sort({ hatirlatmaTarihi: -1 });

    res.json(bildirimler);
  } catch (error) {
    console.error('Hayvan bildirimleri error:', error);
    res.status(500).json({ message: 'Hayvan bildirimleri alınamadı' });
  }
});

// Tipe göre bildirimler
router.get('/tip/:tip', auth, async (req, res) => {
  try {
    const bildirimler = await Bildirim.find({
      userId: req.userId,
      tip: req.params.tip,
      aktif: true
    })
      .sort({ hatirlatmaTarihi: -1 })
      .limit(50);

    res.json(bildirimler);
  } catch (error) {
    console.error('Tip bildirimleri error:', error);
    res.status(500).json({ message: 'Bildirimler alınamadı' });
  }
});

module.exports = router;
