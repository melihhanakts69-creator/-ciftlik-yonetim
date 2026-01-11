const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Duve = require('../models/Duve');
const Inek = require('../models/Inek');
const Buzagi = require('../models/Buzagi');
const Timeline = require('../models/Timeline');


// TÜM DÜVELERİ GETİR
router.get('/', auth, async (req, res) => {
  try {
    const duveler = await Duve.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(duveler);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// YENİ DÜVE EKLE
router.post('/', auth, async (req, res) => {
  try {
    const { isim, yas, kilo, kupeNo, dogumTarihi, tohumlamaTarihi, notlar, eklemeTarihi } = req.body;

    const duve = new Duve({
      userId: req.userId,
      isim,
      yas,
      kilo,
      kupeNo,
      dogumTarihi,
      tohumlamaTarihi,
      notlar,
      eklemeTarihi
    });
console.log('📌 tohumlamaTarihi:', tohumlamaTarihi);

await duve.save();


if (tohumlamaTarihi && tohumlamaTarihi.trim() !== '') {
  await Timeline.create({
    userId: req.userId,
    hayvanId: duve._id.toString(),
    hayvanTipi: 'duve',
    tip: 'tohumlama',
    tarih: tohumlamaTarihi,
    aciklama: 'Düve eklenirken otomatik tohumlama kaydı'
  });
}

res.status(201).json(duve);

  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// DÜVE SİL
router.delete('/:id', auth, async (req, res) => {
  try {
    const duve = await Duve.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!duve) {
      return res.status(404).json({ message: 'Düve bulunamadı' });
    }

    res.json({ message: 'Düve silindi', duve });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});
// DÜVE GÜNCELLE
router.put('/:id', auth, async (req, res) => {
  try {
    const duve = await Duve.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!duve) {
      return res.status(404).json({ message: 'Düve bulunamadı' });
    }

    res.json(duve);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// DÜVE DOĞURDU - İnek'e geçir, Buzağı oluştur
router.post('/:id/dogurdu', auth, async (req, res) => {
  try {
    const { dogumTarihi, buzagiIsim, buzagiCinsiyet, buzagiKilo, notlar } = req.body;

    const duve = await Duve.findOne({ _id: req.params.id, userId: req.userId });
    if (!duve) {
      return res.status(404).json({ message: 'Düve bulunamadı' });
    }

    // Validasyon
    if (!dogumTarihi || !buzagiIsim || !buzagiCinsiyet || buzagiKilo === undefined) {
      return res.status(400).json({ message: 'Doğum bilgileri eksik' });
    }

    // 1. Buzağı oluştur
    const buzagi = new Buzagi({
      userId: req.userId,
      isim: buzagiIsim,
      kupeNo: `BZ-${Date.now()}`,
      anneId: duve._id.toString(),
      anneIsim: duve.isim,
      anneKupeNo: duve.kupeNo,
      dogumTarihi: dogumTarihi,
      cinsiyet: buzagiCinsiyet,
      kilo: buzagiKilo,
      notlar: notlar || '',
      eklemeTarihi: new Date().toISOString().split('T')[0]
    });
    await buzagi.save();

    // 2. Düveyi İnek'e dönüştür (ilk doğum)
    const yeniInek = new Inek({
      userId: req.userId,
      isim: duve.isim,
      kupeNo: duve.kupeNo,
      dogumTarihi: duve.dogumTarihi,
      yas: duve.yas,
      kilo: duve.kilo,
      buzagiSayisi: 1,
      laktasyonDonemi: 1,
      sonBuzagilamaTarihi: dogumTarihi,
      gebelikDurumu: 'Gebe Değil',
      tohumlamaTarihi: null,
      durum: 'Aktif',
      notlar: `${duve.notlar || ''}\nDüvelikten otomatik geçiş (İlk doğum: ${dogumTarihi})`
    });
    await yeniInek.save();

    // 3. Timeline event'leri oluştur
    // Düve'nin doğum timeline'ı
    await Timeline.create({
      userId: req.userId,
      hayvanId: duve._id.toString(),
      hayvanTipi: 'duve',
      tip: 'dogum',
      tarih: dogumTarihi,
      aciklama: `${duve.isim} ilk doğumunu yaptı - ${buzagiIsim} (${buzagiCinsiyet})`
    });

    // İnek'e geçiş timeline'ı
    await Timeline.create({
      userId: req.userId,
      hayvanId: yeniInek._id.toString(),
      hayvanTipi: 'inek',
      tip: 'genel',
      tarih: dogumTarihi,
      aciklama: `${duve.isim} düvelikten inek'e geçti (İlk doğum)`
    });

    // 4. Düveyi sil
    await Duve.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Düve doğurdu ve inek oldu!',
      inek: yeniInek,
      buzagi: buzagi
    });
  } catch (error) {
    console.error('Düve doğum hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router;