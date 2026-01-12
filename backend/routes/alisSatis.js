const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AlisSatis = require('../models/AlisSatis');

// Tüm alış-satış kayıtlarını listele
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      tip,
      hayvanTipi,
      durum,
      baslangic,
      bitis,
      page = 1,
      limit = 50
    } = req.query;

    // Filtre oluştur
    const filter = { userId };

    if (tip) filter.tip = tip;
    if (hayvanTipi) filter.hayvanTipi = hayvanTipi;
    if (durum) filter.durum = durum;

    if (baslangic || bitis) {
      filter.tarih = {};
      if (baslangic) filter.tarih.$gte = new Date(baslangic);
      if (bitis) filter.tarih.$lte = new Date(bitis);
    }

    // Sayfalama
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const kayitlar = await AlisSatis.find(filter)
      .sort({ tarih: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const toplam = await AlisSatis.countDocuments(filter);

    res.json({
      kayitlar,
      sayfa: {
        current: parseInt(page),
        total: Math.ceil(toplam / parseInt(limit)),
        toplam
      }
    });
  } catch (error) {
    console.error('Alış-satış listesi error:', error);
    res.status(500).json({ message: 'Alış-satış kayıtları listelenemedi', error: error.message });
  }
});

// Belirli bir kaydı getir
router.get('/:id', auth, async (req, res) => {
  try {
    const kayit = await AlisSatis.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!kayit) {
      return res.status(404).json({ message: 'Kayıt bulunamadı' });
    }

    res.json(kayit);
  } catch (error) {
    console.error('Kayıt getirme error:', error);
    res.status(500).json({ message: 'Kayıt getirilemedi', error: error.message });
  }
});

// Yeni alış-satış kaydı oluştur
router.post('/', auth, async (req, res) => {
  try {
    const kayitData = {
      ...req.body,
      userId: req.user.userId
    };

    // Veresiye kontrolü
    if (req.body.odemeTipi === 'veresiye') {
      kayitData.odenenMiktar = req.body.odenenMiktar || 0;
      kayitData.kalanBorc = req.body.fiyat - (req.body.odenenMiktar || 0);
    }

    const kayit = new AlisSatis(kayitData);
    await kayit.save();

    res.status(201).json({
      message: 'Alış-satış kaydı oluşturuldu',
      kayit
    });
  } catch (error) {
    console.error('Kayıt oluşturma error:', error);
    res.status(400).json({ message: 'Kayıt oluşturulamadı', error: error.message });
  }
});

// Kaydı güncelle
router.put('/:id', auth, async (req, res) => {
  try {
    const kayit = await AlisSatis.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!kayit) {
      return res.status(404).json({ message: 'Kayıt bulunamadı' });
    }

    res.json({
      message: 'Kayıt güncellendi',
      kayit
    });
  } catch (error) {
    console.error('Kayıt güncelleme error:', error);
    res.status(400).json({ message: 'Kayıt güncellenemedi', error: error.message });
  }
});

// Kaydı sil
router.delete('/:id', auth, async (req, res) => {
  try {
    const kayit = await AlisSatis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!kayit) {
      return res.status(404).json({ message: 'Kayıt bulunamadı' });
    }

    res.json({ message: 'Kayıt silindi' });
  } catch (error) {
    console.error('Kayıt silme error:', error);
    res.status(500).json({ message: 'Kayıt silinemedi', error: error.message });
  }
});

// Toplam alış özeti
router.get('/ozet/alis', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { baslangic, bitis } = req.query;

    if (!baslangic || !bitis) {
      return res.status(400).json({ message: 'Başlangıç ve bitiş tarihi gerekli' });
    }

    const ozet = await AlisSatis.toplamAlis(userId, baslangic, bitis);

    res.json(ozet);
  } catch (error) {
    console.error('Alış özeti error:', error);
    res.status(500).json({ message: 'Alış özeti alınamadı', error: error.message });
  }
});

// Toplam satış özeti
router.get('/ozet/satis', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { baslangic, bitis } = req.query;

    if (!baslangic || !bitis) {
      return res.status(400).json({ message: 'Başlangıç ve bitiş tarihi gerekli' });
    }

    const ozet = await AlisSatis.toplamSatis(userId, baslangic, bitis);

    res.json(ozet);
  } catch (error) {
    console.error('Satış özeti error:', error);
    res.status(500).json({ message: 'Satış özeti alınamadı', error: error.message });
  }
});

// Kar-zarar özeti
router.get('/ozet/kar-zarar', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { baslangic, bitis } = req.query;

    if (!baslangic || !bitis) {
      return res.status(400).json({ message: 'Başlangıç ve bitiş tarihi gerekli' });
    }

    const karZarar = await AlisSatis.karZarar(userId, baslangic, bitis);

    res.json(karZarar);
  } catch (error) {
    console.error('Kar-zarar error:', error);
    res.status(500).json({ message: 'Kar-zarar hesaplanamadı', error: error.message });
  }
});

// Veresiye borçlar
router.get('/ozet/veresiye', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const veresiyeler = await AlisSatis.veresiyeler(userId);

    // Detaylı veresiye listesi
    const detayliVeresiye = await AlisSatis.find({
      userId,
      kalanBorc: { $gt: 0 },
      durum: 'tamamlandi'
    })
    .sort({ tarih: -1 })
    .select('tip aliciSatici fiyat odenenMiktar kalanBorc tarih telefon');

    res.json({
      ozet: veresiyeler,
      detay: detayliVeresiye
    });
  } catch (error) {
    console.error('Veresiye listesi error:', error);
    res.status(500).json({ message: 'Veresiye listesi alınamadı', error: error.message });
  }
});

// Veresiye ödeme yap
router.post('/:id/odeme', auth, async (req, res) => {
  try {
    const { tutar } = req.body;

    if (!tutar || tutar <= 0) {
      return res.status(400).json({ message: 'Geçerli bir tutar giriniz' });
    }

    const kayit = await AlisSatis.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!kayit) {
      return res.status(404).json({ message: 'Kayıt bulunamadı' });
    }

    if (tutar > kayit.kalanBorc) {
      return res.status(400).json({ message: 'Ödeme tutarı borçtan fazla olamaz' });
    }

    kayit.odenenMiktar += tutar;
    kayit.kalanBorc -= tutar;

    await kayit.save();

    res.json({
      message: 'Ödeme kaydedildi',
      kayit
    });
  } catch (error) {
    console.error('Ödeme kaydetme error:', error);
    res.status(500).json({ message: 'Ödeme kaydedilemedi', error: error.message });
  }
});

// Hayvana göre alış-satış geçmişi
router.get('/hayvan/:hayvanId', auth, async (req, res) => {
  try {
    const kayitlar = await AlisSatis.find({
      userId: req.user.userId,
      hayvanId: req.params.hayvanId
    }).sort({ tarih: -1 });

    res.json(kayitlar);
  } catch (error) {
    console.error('Hayvan geçmişi error:', error);
    res.status(500).json({ message: 'Hayvan geçmişi alınamadı', error: error.message });
  }
});

// Aylık rapor
router.get('/rapor/aylik', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { yil, ay } = req.query;

    if (!yil || !ay) {
      return res.status(400).json({ message: 'Yıl ve ay gerekli' });
    }

    const baslangic = new Date(yil, ay - 1, 1);
    const bitis = new Date(yil, ay, 0, 23, 59, 59);

    const karZarar = await AlisSatis.karZarar(userId, baslangic, bitis);

    // Günlük detay
    const gunlukDetay = await AlisSatis.aggregate([
      {
        $match: {
          userId: req.user.userId,
          tarih: { $gte: baslangic, $lte: bitis },
          durum: 'tamamlandi'
        }
      },
      {
        $group: {
          _id: {
            gun: { $dayOfMonth: '$tarih' },
            tip: '$tip'
          },
          toplam: { $sum: '$fiyat' },
          adet: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.gun': 1 }
      }
    ]);

    res.json({
      karZarar,
      gunlukDetay
    });
  } catch (error) {
    console.error('Aylık rapor error:', error);
    res.status(500).json({ message: 'Aylık rapor alınamadı', error: error.message });
  }
});

module.exports = router;
