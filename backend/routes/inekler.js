const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Inek = require('../models/Inek');
const Duve = require('../models/Duve');  // ← EKLE
const Buzagi = require('../models/Buzagi');
const Timeline = require('../models/Timeline');

// TÜM İNEKLERİ GETİR
router.get('/', auth, async (req, res) => {
  try {
    const inekler = await Inek.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(inekler);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
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
    res.status(500).json({ message: 'Sunucu hatası' });
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
    res.status(500).json({ message: 'Sunucu hatası' });
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
    res.status(500).json({ message: 'Sunucu hatası' });
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
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// İNEK DOĞURDU - Buzağı oluştur ve inek bilgilerini güncelle
router.post('/:id/dogurdu', auth, async (req, res) => {
  try {
    const { dogumTarihi, buzagiIsim, buzagiCinsiyet, buzagiKilo, notlar } = req.body;

    const inek = await Inek.findOne({ _id: req.params.id, userId: req.userId });
    if (!inek) {
      return res.status(404).json({ message: 'İnek bulunamadı' });
    }

    // Validasyon
    if (!dogumTarihi) {
      return res.status(400).json({ message: 'Doğum tarihi zorunludur' });
    }
    if (!buzagiIsim || !buzagiCinsiyet || !buzagiKilo) {
      return res.status(400).json({ message: 'Buzağı bilgileri eksik' });
    }

    // 1. Buzağı oluştur
    const buzagi = new Buzagi({
      userId: req.userId,
      isim: buzagiIsim,
      kupeNo: `BZ-${Date.now()}`,
      anneId: inek._id.toString(),
      anneIsim: inek.isim,
      anneKupeNo: inek.kupeNo,
      dogumTarihi: dogumTarihi,
      cinsiyet: buzagiCinsiyet,
      kilo: buzagiKilo,
      notlar: notlar || '',
      eklemeTarihi: new Date().toISOString().split('T')[0]
    });
    await buzagi.save();

    // 2. İnek'i güncelle
    inek.buzagiSayisi = (inek.buzagiSayisi || 0) + 1;
    inek.laktasyonDonemi = (inek.laktasyonDonemi || 0) + 1;
    inek.sonBuzagilamaTarihi = dogumTarihi;
    inek.gebelikDurumu = 'Gebe Değil';
    inek.tohumlamaTarihi = null;
    await inek.save();

    // 3. Timeline event'i oluştur
    await Timeline.create({
      userId: req.userId,
      hayvanId: inek._id.toString(),
      hayvanTipi: 'inek',
      tip: 'dogum',
      tarih: dogumTarihi,
      aciklama: `${inek.isim} doğum yaptı - ${buzagiIsim} (${buzagiCinsiyet}) (${inek.buzagiSayisi}. buzağı)`
    });

    res.json({
      message: 'Doğum başarıyla kaydedildi!',
      inek: inek,
      buzagi: buzagi
    });
  } catch (error) {
    console.error('İnek doğum hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// TEK BİR İNEĞİ GETİR (ve son 30 günlük süt verisi)
// TOHUMLAMA EKLE
router.post('/:id/tohumlama', auth, async (req, res) => {
  try {
    const { tohumlamaTarihi } = req.body;
    const inek = await Inek.findOne({ _id: req.params.id, userId: req.userId });

    if (!inek) {
      return res.status(404).json({ message: 'İnek bulunamadı' });
    }

    // İneği güncelle
    inek.tohumlamaTarihi = tohumlamaTarihi;
    inek.gebelikDurumu = 'Belirsiz'; // Yeni tohumlandığı için
    await inek.save();

    // Timeline'a ekle
    const Timeline = require('../models/Timeline');
    await Timeline.create({
      userId: req.userId,
      hayvanId: inek._id.toString(),
      hayvanTipi: 'inek',
      tip: 'tohumlama',
      tarih: tohumlamaTarihi,
      aciklama: `Tohumlama yapıldı. Tarih: ${tohumlamaTarihi}`
    });

    res.json({ message: 'Tohumlama kaydedildi', inek });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// TOHUMLAMA SİL
router.delete('/:id/tohumlama', auth, async (req, res) => {
  try {
    const inek = await Inek.findOne({ _id: req.params.id, userId: req.userId });
    if (!inek) return res.status(404).json({ message: 'İnek bulunamadı' });

    inek.tohumlamaTarihi = null;
    inek.gebelikDurumu = 'Gebe Değil';
    await inek.save();

    // En son eklenen tohumlama timeline kaydını sil
    const lastTimeline = await Timeline.findOne({
      hayvanId: inek._id.toString(),
      tip: 'tohumlama'
    }).sort({ createdAt: -1 });
    if (lastTimeline) await lastTimeline.deleteOne();

    res.json({ message: 'Tohumlama kaydı silindi', inek });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const inek = await Inek.findOne({ _id: req.params.id, userId: req.userId });
    if (!inek) {
      return res.status(404).json({ message: 'İnek bulunamadı' });
    }

    // Son 30 günlük süt verisi
    const SutKaydi = require('../models/SutKaydi');
    const otuzGunOnce = new Date();
    otuzGunOnce.setDate(otuzGunOnce.getDate() - 30);
    const tarihStr = otuzGunOnce.toISOString().split('T')[0];

    // İnek detayına süt verisini de ekle
    const sutGecmisi = await SutKaydi.find({
      userId: req.userId,
      inekId: inek._id,
      tarih: { $gte: tarihStr }
    }).sort({ tarih: 1 });

    // Mongoose belgesini objeye çevirip süt geçmişini ekliyoruz
    const inekObj = inek.toObject();
    inekObj.sutGecmisi = sutGecmisi;

    res.json(inekObj);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;