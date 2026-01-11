const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Buzagi = require('../models/Buzagi');
const Duve = require('../models/Duve');
const Tosun = require('../models/Tosun');
const Timeline = require('../models/Timeline');

// TÜM BUZAĞILARI GETİR
router.get('/', auth, async (req, res) => {
  try {
    const buzagilar = await Buzagi.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(buzagilar);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// YENİ BUZAĞI EKLE
router.post('/', auth, async (req, res) => {
  try {
    const { isim, kupeNo, anneId, anneIsim, anneKupeNo, babaKupeNo, dogumTarihi, cinsiyet, kilo, notlar, eklemeTarihi } = req.body;

    console.log('Gelen buzağı verisi:', { isim, kupeNo, anneId, anneIsim, anneKupeNo, babaKupeNo, dogumTarihi, cinsiyet, kilo, notlar, eklemeTarihi, userId: req.userId });

    const buzagi = new Buzagi({
      userId: req.userId,
      isim,
      kupeNo,
      anneId,
      anneIsim,
      anneKupeNo,
      babaKupeNo,
      dogumTarihi,
      cinsiyet,
      kilo,
      notlar,
      eklemeTarihi
    });

    await buzagi.save();
    console.log('Buzağı kayıt başarılı:', buzagi);
    res.status(201).json(buzagi);
  } catch (error) {
    console.error('❌ BUZAĞI KAYDI HATASI:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// BUZAĞI SİL
router.delete('/:id', auth, async (req, res) => {
  try {
    const buzagi = await Buzagi.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!buzagi) {
      return res.status(404).json({ message: 'Buzağı bulunamadı' });
    }

    res.json({ message: 'Buzağı silindi', buzagi });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});
// OTOMATİK DÜVE/TOSUN GEÇİŞİ KONTROL
router.get('/kontrol-gecis', auth, async (req, res) => {
  try {
    const buzagilar = await Buzagi.find({ userId: req.userId });
    const gecisler = [];
    const bugun = new Date();

    for (const buzagi of buzagilar) {
      const dogumTarihi = new Date(buzagi.dogumTarihi);
      const farkAy = Math.floor((bugun - dogumTarihi) / (1000 * 60 * 60 * 24 * 30));

      if (farkAy >= 12) {
        gecisler.push({
          buzagi,
          yas: farkAy,
          hedef: buzagi.cinsiyet === 'disi' ? 'düve' : 'tosun'
        });
      }
    }

    res.json(gecisler);
  } catch (error) {
    console.error('Geçiş kontrolü hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});
// BUZAĞI → DÜVE/TOSUN GEÇİŞİ
router.post('/gecis-yap/:id', auth, async (req, res) => {
  try {
    console.log('🔄 Geçiş başlatıldı, ID:', req.params.id);
    const buzagi = await Buzagi.findOne({ _id: req.params.id, userId: req.userId });

    if (!buzagi) {
      console.log('❌ Buzağı bulunamadı');
      return res.status(404).json({ message: 'Buzağı bulunamadı' });
    }

    console.log('✅ Buzağı bulundu:', buzagi);

    // Yaş hesapla (ay cinsinden)
    const dogumTarihi = new Date(buzagi.dogumTarihi);
    const bugun = new Date();
    let yasAy = Math.floor((bugun - dogumTarihi) / (1000 * 60 * 60 * 24 * 30));

    // NaN kontrolü
    if (isNaN(yasAy) || yasAy < 0) {
      yasAy = 12; // Varsayılan olarak 12 ay
    }
    console.log('📅 Yaş hesaplandı:', yasAy, 'ay');

    // Düve mi Tosun mu?
    if (buzagi.cinsiyet === 'disi') {
      // DÜVE OLUŞTUR
      console.log('🐄 Düve oluşturuluyor...');

      // Kilo ve yaş kontrolü - zorunlu alanlar
      const duveYas = yasAy || 12;
      const duveKilo = buzagi.kilo ? Number(buzagi.kilo) : 150;

      const yeniDuve = new Duve({
        userId: req.userId,
        isim: buzagi.isim,
        kupeNo: buzagi.kupeNo,
        dogumTarihi: buzagi.dogumTarihi,
        yas: duveYas,
        kilo: duveKilo,
        anneKupeNo: buzagi.anneKupeNo || null,
        gebelikDurumu: 'Belirsiz',
        notlar: `${buzagi.isim} buzağıdan otomatik geçiş`,
        eklemeTarihi: new Date().toISOString().split('T')[0]
      });

      console.log('💾 Düve kaydediliyor:', yeniDuve);
      await yeniDuve.save();
      console.log('✅ Düve kaydedildi');

      // Timeline ekle
      await Timeline.create({
        userId: req.userId,
        hayvanId: yeniDuve._id,
        hayvanTipi: 'duve',
        tip: 'genel',
        tarih: new Date().toISOString().split('T')[0],
        aciklama: `${buzagi.isim} buzağıdan düveye otomatik geçiş yapıldı`
      });

      // Buzağıyı sil
      await Buzagi.findByIdAndDelete(req.params.id);

      res.json({ message: 'Düveye geçiş başarılı', duve: yeniDuve });

    } else {
      // TOSUN OLUŞTUR
      const yeniTosun = new Tosun({
        userId: req.userId,
        isim: buzagi.isim,
        kupeNo: buzagi.kupeNo,
        dogumTarihi: buzagi.dogumTarihi,
        anneKupeNo: buzagi.anneKupeNo || null,
        babaKupeNo: buzagi.babaKupeNo || null,
        kilo: buzagi.kilo || 0,
        not: `${buzagi.isim} buzağıdan otomatik geçiş`
      });

      await yeniTosun.save();

      // Timeline ekle
      await Timeline.create({
        userId: req.userId,
        hayvanId: yeniTosun._id,
        hayvanTipi: 'tosun',
        tip: 'genel',
        tarih: new Date().toISOString().split('T')[0],
        aciklama: `${buzagi.isim} buzağıdan tosuna otomatik geçiş yapıldı`
      });

      // Buzağıyı sil
      await Buzagi.findByIdAndDelete(req.params.id);

      res.json({ message: 'Tosuna geçiş başarılı', tosun: yeniTosun });
    }

  } catch (error) {
    console.error('❌ Geçiş hatası:', error);
    console.error('Hata detayı:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router;