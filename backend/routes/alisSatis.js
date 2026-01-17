const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const AlisSatis = require('../models/AlisSatis');

// Tüm alış-satış kayıtlarını listele
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;
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
      userId: req.userId
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

const Finansal = require('../models/Finansal');
const Inek = require('../models/Inek');
const Buzagi = require('../models/Buzagi');
const Duve = require('../models/Duve');
const Tosun = require('../models/Tosun');

// Helper to get model by type
const getModelByType = (type) => {
  switch (type) {
    case 'inek': return Inek;
    case 'buzagi': return Buzagi;
    case 'duve': return Duve;
    case 'tosun': return Tosun;
    default: return null;
  }
};

// SATIŞ İŞLEMİ (Animal Sale)
router.post('/satis', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      hayvanId, hayvanTipi, fiyat, aliciSatici,
      odenenMiktar, tarih, notlar
    } = req.body;

    if (!hayvanId || !hayvanTipi || !fiyat || !aliciSatici) {
      throw new Error('Eksik bilgi: Hayvan, Fiyat ve Alıcı zorunludur.');
    }

    // Sayısal değerlere çevir
    const fiyatNum = Number(fiyat);
    const odenenMiktarNum = odenenMiktar ? Number(odenenMiktar) : 0;

    // 1. Alış/Satış Kaydı (History)
    const satisKaydi = new AlisSatis({
      userId: req.userId,
      tip: 'satis',
      hayvanId,
      hayvanTipi,
      kupe_no: req.body.kupeNo, // Frontend should send this for record accuracy
      fiyat: fiyatNum,
      aliciSatici,
      odenenMiktar: odenenMiktarNum,
      kalanBorc: fiyatNum - odenenMiktarNum,
      tarih: tarih || new Date(),
      notlar,
      durum: 'tamamlandi'
    });
    await satisKaydi.save({ session });

    // 2. Finansal Kayıt (Income)
    // Sadece ödenen miktar kasaya girer
    if (odenenMiktarNum > 0) {
      const yeniFinansal = new Finansal({
        userId: req.userId,
        tip: 'gelir',
        kategori: 'hayvan-satisi',
        miktar: odenenMiktarNum,
        tarih: new Date(tarih || new Date()).toISOString().split('T')[0],
        aciklama: `${hayvanTipi.toUpperCase()} Satışı - Küpe: ${req.body.kupeNo} - Alıcı: ${aliciSatici}`,
        ilgiliHayvanId: hayvanId,
        ilgiliHayvanTipi: hayvanTipi
      });
      await yeniFinansal.save({ session });
    }

    // 3. Hayvanı Envanterden Düş (Delete)
    const Model = getModelByType(hayvanTipi);
    if (Model) {
      const deleted = await Model.findOneAndDelete({ _id: hayvanId, userId: req.userId }).session(session);
      if (!deleted) throw new Error('Satılacak hayvan bulunamadı.');
    } else {
      throw new Error('Geçersiz hayvan tipi.');
    }

    await session.commitTransaction();
    res.status(201).json({ message: 'Satış işlemi başarılı', kayit: satisKaydi });

  } catch (error) {
    await session.abortTransaction();
    console.error('Satış Error:', error);
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// ALIŞ İŞLEMİ (Animal Purchase)
router.post('/alis', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      hayvanTipi, fiyat, aliciSatici,
      odenenMiktar, tarih, notlar,
      // Hayvan Detayları
      isim, kupeNo, dogumTarihi, cinsiyet, kilo, yas, anneKupeNo, gebelikDurumu, tohumlamaTarihi
    } = req.body;

    if (!hayvanTipi || !fiyat || !aliciSatici || !kupeNo) {
      throw new Error('Eksik bilgi: Hayvan Tipi, Fiyat, Satıcı ve Küpe No zorunludur.');
    }

    // 1. Hayvanı Oluştur (Inventory)
    const Model = getModelByType(hayvanTipi);
    if (!Model) throw new Error('Geçersiz hayvan tipi.');

    // Prepare animal data based on schema
    const animalData = {
      userId: req.userId,
      isim,
      kupeNo,
      dogumTarihi,
      kilo: kilo || 0,
      notlar: `Satın alındı: ${aliciSatici} - ${tarih}`
    };

    // Add type-specific fields
    if (hayvanTipi === 'inek' || hayvanTipi === 'duve') {
      if (gebelikDurumu) animalData.gebelikDurumu = gebelikDurumu;
      if (tohumlamaTarihi) animalData.tohumlamaTarihi = tohumlamaTarihi;
      if (anneKupeNo) animalData.anneKupeNo = anneKupeNo;
      if (hayvanTipi === 'inek') {
        animalData.yas = yas; // Inek schema might use Number for age? double check model if needed, usually dynamic but let's pass if schema allows
      }
      if (hayvanTipi === 'duve') {
        animalData.yas = yas;
      }
    } else if (hayvanTipi === 'buzagi') {
      animalData.cinsiyet = cinsiyet || 'disi';
      animalData.anneKupeNo = anneKupeNo;
    } else if (hayvanTipi === 'tosun') {
      animalData.dogumTarihi = dogumTarihi; // required
    }

    const [newAnimal] = await Model.create([animalData], { session });

    // 2. Alış/Satış Kaydı (History)
    const alisKaydi = new AlisSatis({
      userId: req.userId,
      tip: 'alis',
      hayvanId: newAnimal._id,
      hayvanTipi,
      kupe_no: kupeNo,
      fiyat,
      aliciSatici, // Satıcı
      odenenMiktar: odenenMiktar || 0,
      kalanBorc: fiyat - (odenenMiktar || 0),
      tarih: tarih || new Date(),
      notlar,
      durum: 'tamamlandi',
      // Store snapshot details
      yas: yas || 0,
      agirlik: kilo || 0,
      cinsiyet: cinsiyet,
      irk: req.body.irk
    });
    await alisKaydi.save({ session });

    // 3. Finansal Kayıt (Expense)
    if (odenenMiktar > 0) {
      const yeniFinansal = new Finansal({
        userId: req.userId,
        tip: 'gider',
        kategori: 'hayvan-alisi',
        miktar: odenenMiktar,
        tarih: new Date(tarih || new Date()).toISOString().split('T')[0],
        aciklama: `${hayvanTipi.toUpperCase()} Alışı - Küpe: ${kupeNo} - Satıcı: ${aliciSatici}`,
        ilgiliHayvanId: newAnimal._id,
        ilgiliHayvanTipi: hayvanTipi
      });
      await yeniFinansal.save({ session });
    }

    await session.commitTransaction();
    res.status(201).json({ message: 'Alış işlemi başarılı', kayit: alisKaydi, hayvan: newAnimal });

  } catch (error) {
    await session.abortTransaction();
    console.error('Alış Error:', error);
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Toplam alış özeti
router.get('/ozet/alis', auth, async (req, res) => {
  try {
    const userId = req.userId;
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
    const userId = req.userId;
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
    const userId = req.userId;
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
    const userId = req.userId;

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
      userId: req.userId
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
      userId: req.userId,
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
    const userId = req.userId;
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
          userId: req.userId,
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
