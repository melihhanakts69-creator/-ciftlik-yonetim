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
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

const yasHesaplaAy = (dogumTarihi) => {
  if (!dogumTarihi) return 0;
  return Math.floor((new Date() - new Date(dogumTarihi)) / (1000 * 60 * 60 * 24 * 30.44));
};

// YENİ DÜVE EKLE
router.post('/', auth, async (req, res) => {
  try {
    const { isim, yas, kilo, kupeNo, dogumTarihi, tohumlamaTarihi, notlar, not, eklemeTarihi, gebelikDurumu } = req.body;

    const finalYas = dogumTarihi ? yasHesaplaAy(dogumTarihi) : (parseInt(yas, 10) || 0);

    const duve = new Duve({
      userId: req.userId,
      isim,
      yas: finalYas,
      kilo,
      kupeNo,
      dogumTarihi: dogumTarihi || undefined,
      tohumlamaTarihi: tohumlamaTarihi || null,
      gebelikDurumu: gebelikDurumu || 'Belirsiz',
      notlar: notlar || not || '',
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
    res.status(500).json({ message: 'Sunucu hatası' });
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
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});
// DÜVE GÜNCELLE
router.put('/:id', auth, async (req, res) => {
  try {
    const { userId, _id, ...safeBody } = req.body;
    const duve = await Duve.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      safeBody,
      { new: true }
    );

    if (!duve) {
      return res.status(404).json({ message: 'Düve bulunamadı' });
    }

    res.json(duve);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// DÜVE DOĞURDU - İnek'e geçir, Buzağı oluştur
router.post('/:id/dogurdu', auth, async (req, res) => {
  try {
    const { dogumTarihi, buzagiIsim, buzagiCinsiyet, buzagiKilo, notlar, buzagiDurum, tahminiZarar } = req.body;
    const olum = buzagiDurum === 'Öldü';

    const duve = await Duve.findOne({ _id: req.params.id, userId: req.userId });
    if (!duve) {
      return res.status(404).json({ message: 'Düve bulunamadı' });
    }

    // Validasyon
    if (!dogumTarihi) {
      return res.status(400).json({ message: 'Doğum tarihi zorunludur' });
    }
    if (!olum && (!buzagiIsim || !buzagiCinsiyet || buzagiKilo === undefined)) {
      return res.status(400).json({ message: 'Doğum bilgileri eksik' });
    }

    const isim = olum ? 'Ölü Buzağı' : buzagiIsim;
    const cinsiyet = olum ? 'disi' : buzagiCinsiyet;
    const kilo = olum ? 0 : parseFloat(buzagiKilo);
    const durum = olum ? 'Öldü' : 'Aktif';

    // 1. Buzağı oluştur
    const buzagi = new Buzagi({
      userId: req.userId,
      isim,
      kupeNo: `BZ-${Date.now()}`,
      anneId: duve._id.toString(),
      anneIsim: duve.isim,
      anneKupeNo: duve.kupeNo,
      dogumTarihi: dogumTarihi,
      cinsiyet,
      kilo,
      notlar: notlar || (olum ? 'Doğumda öldü' : ''),
      durum,
      eklemeTarihi: new Date().toISOString().split('T')[0]
    });
    await buzagi.save();

    // 2. Düveyi İnek'e dönüştür (ilk doğum)
    const yeniInek = new Inek({
      userId: req.userId,
      isim: duve.isim,
      kupeNo: duve.kupeNo,
      dogumTarihi: duve.dogumTarihi,
      yas: Math.floor((new Date() - new Date(duve.dogumTarihi)) / (1000 * 60 * 60 * 24 * 365)), // Otomatik yaş hesapla (Yıl)
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

    // 3. Doğum bildirimlerini tamamlandı işaretle (dogum_beklenen, dogum_gecikme)
    const Bildirim = require('../models/Bildirim');
    await Bildirim.updateMany(
      { userId: req.userId, hayvanId: duve._id, tip: { $in: ['dogum_beklenen', 'dogum_gecikme', 'dogum'] }, tamamlandi: false },
      { tamamlandi: true, tamamlanmaTarihi: new Date() }
    );

    // 4. Ölüm ise Finansal gider ekle (tahmini zarar)
    if (olum && tahminiZarar && parseFloat(tahminiZarar) > 0) {
      const Finansal = require('../models/Finansal');
      const tarihStr = typeof dogumTarihi === 'string' && dogumTarihi.includes('T')
        ? dogumTarihi.split('T')[0] : (typeof dogumTarihi === 'string' ? dogumTarihi : new Date(dogumTarihi).toISOString().split('T')[0]);
      await Finansal.create({
        userId: req.userId,
        tip: 'gider',
        kategori: 'hayvan-olum',
        miktar: parseFloat(tahminiZarar),
        tarih: tarihStr,
        aciklama: `Buzağı ölümü (doğumda): ${duve.isim} ${duve.kupeNo}`
      });
    }

    // 5. Timeline event'leri oluştur
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

    // 5. Düveyi sil
    await Duve.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Düve doğurdu ve inek oldu!',
      inek: yeniInek,
      buzagi: buzagi
    });
  } catch (error) {
    console.error('Düve doğum hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// TOHUMLAMA EKLE
router.post('/:id/tohumlama', auth, async (req, res) => {
  try {
    const { tohumlamaTarihi } = req.body;
    const duve = await Duve.findOne({ _id: req.params.id, userId: req.userId });

    if (!duve) {
      return res.status(404).json({ message: 'Düve bulunamadı' });
    }

    // Düveyi güncelle
    duve.tohumlamaTarihi = tohumlamaTarihi;
    duve.gebelikDurumu = 'Belirsiz';
    await duve.save();

    // Timeline'a ekle
    await Timeline.create({
      userId: req.userId,
      hayvanId: duve._id.toString(),
      hayvanTipi: 'duve',
      tip: 'tohumlama',
      tarih: tohumlamaTarihi,
      aciklama: `Tohumlama yapıldı. Tarih: ${tohumlamaTarihi}`
    });

    res.json({ message: 'Tohumlama kaydedildi', duve });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// TOHUMLAMA SİL
router.delete('/:id/tohumlama', auth, async (req, res) => {
  try {
    const duve = await Duve.findOne({ _id: req.params.id, userId: req.userId });
    if (!duve) return res.status(404).json({ message: 'Düve bulunamadı' });

    duve.tohumlamaTarihi = null;
    duve.gebelikDurumu = 'Gebe Değil';
    await duve.save();

    // En son eklenen tohumlama timeline kaydını sil
    const lastTimeline = await Timeline.findOne({
      hayvanId: duve._id.toString(),
      tip: 'tohumlama'
    }).sort({ createdAt: -1 });
    if (lastTimeline) await lastTimeline.deleteOne();

    res.json({ message: 'Tohumlama kaydı silindi', duve });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// TEK BİR DÜVEYİ GETİR
router.get('/:id', auth, async (req, res) => {
  try {
    const duve = await Duve.findOne({ _id: req.params.id, userId: req.userId });
    if (!duve) {
      return res.status(404).json({ message: 'Düve bulunamadı' });
    }
    res.json(duve);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;