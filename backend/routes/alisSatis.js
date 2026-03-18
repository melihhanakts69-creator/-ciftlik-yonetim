const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const AlisSatis = require('../models/AlisSatis');

// Tüm alış-satış kayıtlarını listele
router.get('/', auth, checkRole(['ciftci']), async (req, res) => {
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
    res.status(500).json({ message: 'Alış-satış kayıtları listelenemedi' });
  }
});

// Belirli bir kaydı getir
router.get('/:id', auth, checkRole(['ciftci']), async (req, res) => {
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
    res.status(500).json({ message: 'Kayıt getirilemedi' });
  }
});

const Finansal = require('../models/Finansal');
const Inek = require('../models/Inek');
const Buzagi = require('../models/Buzagi');
const Duve = require('../models/Duve');
const Tosun = require('../models/Tosun');
const Timeline = require('../models/Timeline');

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
router.post('/satis', auth, checkRole(['ciftci']), async (req, res) => {
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
    res.status(400).json({ message: 'İşlem gerçekleştirilemedi' });
  } finally {
    session.endSession();
  }
});

// ALIŞ İŞLEMİ (Animal Purchase)
router.post('/alis', auth, checkRole(['ciftci']), async (req, res) => {
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
      animalData.gebelikDurumu = gebelikDurumu || 'Belirsiz';
      if (tohumlamaTarihi && String(tohumlamaTarihi).trim() !== '') {
        animalData.tohumlamaTarihi = tohumlamaTarihi;
      }
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

    // Tohumlama varsa Timeline (belirsiz-gebeler ile uyum)
    if ((hayvanTipi === 'inek' || hayvanTipi === 'duve') && tohumlamaTarihi && String(tohumlamaTarihi).trim() !== '') {
      try {
        await Timeline.create({
          userId: req.userId,
          hayvanId: newAnimal._id.toString(),
          hayvanTipi,
          tip: 'tohumlama',
          tarih: typeof tohumlamaTarihi === 'string' ? tohumlamaTarihi : new Date(tohumlamaTarihi).toISOString().split('T')[0],
          aciklama: 'Satın alırken tohumlama kaydı'
        });
      } catch (err) {
        console.error('Alış tohumlama timeline hatası:', err.message);
      }
    }

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
    res.status(400).json({ message: 'İşlem gerçekleştirilemedi' });
  } finally {
    session.endSession();
  }
});

// Toplam alış özeti
router.get('/ozet/alis', auth, checkRole(['ciftci']), async (req, res) => {
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
    res.status(500).json({ message: 'Alış özeti alınamadı' });
  }
});

// Toplam satış özeti
router.get('/ozet/satis', auth, checkRole(['ciftci']), async (req, res) => {
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
    res.status(500).json({ message: 'Satış özeti alınamadı' });
  }
});

// Kar-zarar özeti
router.get('/ozet/kar-zarar', auth, checkRole(['ciftci']), async (req, res) => {
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
    res.status(500).json({ message: 'Kar-zarar hesaplanamadı' });
  }
});

// Buzağılama kaydı — ineğin buzağıladığı an piyasa değeri girilir
router.post('/buzagilama', auth, checkRole(['ciftci']), async (req, res) => {
  try {
    const { hayvanId, hayvanTipi = 'inek', anneKupeNo, buzagiDegeri, tarih, notlar } = req.body;
    if (!buzagiDegeri || buzagiDegeri <= 0) {
      return res.status(400).json({ message: 'Buzağı piyasa değeri girilmeli' });
    }
    const kayit = new AlisSatis({
      userId: req.userId,
      tip: 'buzagilama',
      hayvanId,
      hayvanTipi,
      fiyat: buzagiDegeri,
      buzagiDegeri,
      aliciSatici: 'Sürü içi doğum',
      tarih: tarih || new Date(),
      notlar,
      anneHayvanId: hayvanId,
      durum: 'tamamlandi'
    });
    await kayit.save();

    const Finansal = require('../models/Finansal');
    await Finansal.create({
      userId: req.userId,
      tip: 'gelir',
      kategori: 'buzagilama',
      miktar: buzagiDegeri,
      tarih: (tarih || new Date()).toISOString().slice(0, 10),
      aciklama: `Buzağılama — ${anneKupeNo || 'Küpe no yok'} — Buzağı piyasa değeri`,
      ilgiliHayvanId: hayvanId
    });

    res.status(201).json({ message: 'Buzağılama kaydedildi', kayit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Ölüm kaydı — piyasa değeri kaybı olarak yazılır
router.post('/olum', auth, checkRole(['ciftci']), async (req, res) => {
  try {
    const { hayvanId, hayvanTipi = 'inek', kupeNo, piyasaDegeri, olumNedeni, tarih, notlar } = req.body;
    if (!piyasaDegeri || piyasaDegeri <= 0) {
      return res.status(400).json({ message: 'Hayvanın piyasa değeri girilmeli' });
    }
    const kayit = new AlisSatis({
      userId: req.userId,
      tip: 'olum',
      hayvanId,
      hayvanTipi,
      kupe_no: kupeNo,
      fiyat: piyasaDegeri,
      aliciSatici: 'Ölüm',
      olumNedeni,
      tarih: tarih || new Date(),
      notlar,
      durum: 'tamamlandi'
    });
    await kayit.save();

    const Finansal = require('../models/Finansal');
    await Finansal.create({
      userId: req.userId,
      tip: 'gider',
      kategori: 'olum_kaybi',
      miktar: piyasaDegeri,
      tarih: (tarih || new Date()).toISOString().slice(0, 10),
      aciklama: `Hayvan ölümü — ${kupeNo || 'Küpe no yok'} — ${olumNedeni || ''}`,
      ilgiliHayvanId: hayvanId
    });

    res.status(201).json({ message: 'Ölüm kaydedildi', kayit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Veresiye borçlar
router.get('/ozet/veresiye', auth, checkRole(['ciftci']), async (req, res) => {
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
    res.status(500).json({ message: 'Veresiye listesi alınamadı' });
  }
});

// Veresiye ödeme yap
router.post('/:id/odeme', auth, checkRole(['ciftci']), async (req, res) => {
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
    res.status(500).json({ message: 'Ödeme kaydedilemedi' });
  }
});

// Hayvana göre alış-satış geçmişi
router.get('/hayvan/:hayvanId', auth, checkRole(['ciftci']), async (req, res) => {
  try {
    const kayitlar = await AlisSatis.find({
      userId: req.userId,
      hayvanId: req.params.hayvanId
    }).sort({ tarih: -1 });

    res.json(kayitlar);
  } catch (error) {
    console.error('Hayvan geçmişi error:', error);
    res.status(500).json({ message: 'Hayvan geçmişi alınamadı' });
  }
});

// Aylık rapor
router.get('/rapor/aylik', auth, checkRole(['ciftci']), async (req, res) => {
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
          userId: new mongoose.Types.ObjectId(req.userId),
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
    res.status(500).json({ message: 'Aylık rapor alınamadı' });
  }
});

module.exports = router;
