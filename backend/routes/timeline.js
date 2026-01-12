const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Timeline = require('../models/Timeline');
const Inek = require('../models/Inek');
const Duve = require('../models/Duve');
// YAKLASAN DOĞUMLARI GETİR
router.get('/yaklasan/dogumlar', auth, async (req, res) => {
  try {
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    const yaklaşanlar = [];

    // İNEKLERİ KONTROL ET
    const inekler = await Inek.find({
      userId: req.userId,
      $or: [
        { durum: 'Aktif' },
        { durum: { $exists: false } },
        { durum: null }
      ],
      gebelikDurumu: 'Gebe',
      tohumlamaTarihi: { $ne: null, $exists: true }
    });

    inekler.forEach(inek => {
      if (inek.tohumlamaTarihi) {
        const tohumlama = new Date(inek.tohumlamaTarihi.includes('T') ? inek.tohumlamaTarihi : inek.tohumlamaTarihi + 'T12:00:00Z');
        const tahminiDoğum = new Date(tohumlama);
        tahminiDoğum.setDate(tahminiDoğum.getDate() + 283);
        tahminiDoğum.setHours(0, 0, 0, 0);

        const kalanGun = Math.ceil((tahminiDoğum - bugun) / (1000 * 60 * 60 * 24));

        if (kalanGun >= 0 && kalanGun <= 30) {
          yaklaşanlar.push({
            hayvan: inek,
            hayvanTipi: 'inek',
            kalanGun: kalanGun,
            tahminiDoğum: tahminiDoğum.toISOString().split('T')[0]
          });
        }
      }
    });

    // DÜVELERİ KONTROL ET
    const duveler = await Duve.find({
      userId: req.userId,
      gebelikDurumu: 'Gebe',
      tohumlamaTarihi: { $ne: null, $exists: true }
    });

    duveler.forEach(duve => {
      if (duve.tohumlamaTarihi) {
        const tohumlama = new Date(duve.tohumlamaTarihi.includes('T') ? duve.tohumlamaTarihi : duve.tohumlamaTarihi + 'T12:00:00Z');
        const tahminiDoğum = new Date(tohumlama);
        tahminiDoğum.setDate(tahminiDoğum.getDate() + 283);
        tahminiDoğum.setHours(0, 0, 0, 0);

        const kalanGun = Math.ceil((tahminiDoğum - bugun) / (1000 * 60 * 60 * 24));

        if (kalanGun >= 0 && kalanGun <= 30) {
          yaklaşanlar.push({
            hayvan: duve,
            hayvanTipi: 'duve',
            kalanGun: kalanGun,
            tahminiDoğum: tahminiDoğum.toISOString().split('T')[0]
          });
        }
      }
    });

    yaklaşanlar.sort((a, b) => a.kalanGun - b.kalanGun);

    res.json(yaklaşanlar);
  } catch (error) {
    console.error('❌ Yaklaşan doğumlar hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// TOHUMLAMA KONTROLÜ BEKLEYENLERİ GETİR
router.get('/kontrol-bekleyenler', auth, async (req, res) => {
  try {
    // Son 30 gün içindeki tohumlama kayıtlarını bul
    const otuzGunOnce = new Date();
    otuzGunOnce.setDate(otuzGunOnce.getDate() - 30);

    const tohumlamalar = await Timeline.find({
      userId: req.userId,
      tip: 'tohumlama',
      tarih: { $gte: otuzGunOnce.toISOString().split('T')[0] }
    }).sort({ tarih: 1 });

    const bekleyenler = [];
    const bugun = new Date();

    for (const tohumlama of tohumlamalar) {
      const inek = await Inek.findOne({ _id: tohumlama.hayvanId, userId: req.userId });

      if (!inek) {
        // Orphan tohumlama kaydı - silinmiş ineğe ait, otomatik temizle
        await Timeline.deleteOne({ _id: tohumlama._id });
        continue;
      }

      const tohumlamaTarihi = new Date(tohumlama.tarih);
      const gecenGun = Math.floor((bugun - tohumlamaTarihi) / (1000 * 60 * 60 * 24));

      if (gecenGun >= 21 && gecenGun <= 28) {
        // Belirsiz olanları göster, Gebe veya Gebe Değil olanları atla
        if (inek.gebelikDurumu === 'Gebe' || inek.gebelikDurumu === 'Gebe Değil') {
          continue;
        }

        bekleyenler.push({
          inek: inek,
          tohumlama: tohumlama,
          gecenGun: gecenGun
        });
      }
    }

    // DÜVELERE DE BAK
    const duveler = await Duve.find({ userId: req.userId });

    for (const duve of duveler) {
      if (!duve.tohumlamaTarihi) continue;

      const tohumlamaTarihi = new Date(duve.tohumlamaTarihi);
      const gecenGun = Math.floor((bugun - tohumlamaTarihi) / (1000 * 60 * 60 * 24));

      if (gecenGun >= 21 && gecenGun <= 28) {
        if (duve.gebelikDurumu === 'Gebe' || duve.gebelikDurumu === 'Gebe Değil') {
          continue;
        }
        bekleyenler.push({
          hayvan: duve,
          hayvanTipi: 'düve',
          tohumlama: {
            tarih: duve.tohumlamaTarihi,
            _id: null
          },
          gecenGun: gecenGun
        });
      }
    }

    res.json(bekleyenler);
  } catch (error) {
    console.error('Kontrol bekleyenler hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});
// HAYVAN TIMELINE'INI GETİR
router.get('/:hayvanId', auth, async (req, res) => {
  try {
    const timeline = await Timeline.find({ 
      userId: req.userId, 
      hayvanId: req.params.hayvanId 
    }).sort({ tarih: -1 });
    
    res.json(timeline);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// TIMELINE KAYDI EKLE
router.post('/', auth, async (req, res) => {
  try {
    const { hayvanId, hayvanTipi, tip, tarih, aciklama, iliskiliHayvanId } = req.body;

    const timelineKaydi = new Timeline({
      userId: req.userId,
      hayvanId,
      hayvanTipi,
      tip,
      tarih,
      aciklama,
      iliskiliHayvanId
    });

    await timelineKaydi.save();

    res.status(201).json(timelineKaydi);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});



// TIMELINE KAYDI SİL
router.delete('/:id', auth, async (req, res) => {
  try {
    const timeline = await Timeline.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!timeline) {
      return res.status(404).json({ message: 'Kayıt bulunamadı!' });
    }

    res.json({ message: 'Kayıt silindi!' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }


  
});

module.exports = router;