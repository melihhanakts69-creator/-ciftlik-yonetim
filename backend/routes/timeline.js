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
    
    console.log('🔍 KONTROL BEKLEYENLER DEBUG:');
    console.log('Toplam tohumlama:', tohumlamalar.length);

    for (const tohumlama of tohumlamalar) {
      const inek = await Inek.findOne({ _id: tohumlama.hayvanId, userId: req.userId });
      
      if (!inek) {
        console.log('❌ İnek bulunamadı:', tohumlama.hayvanId);
        continue;
      }

      const tohumlamaTarihi = new Date(tohumlama.tarih);
      const gecenGun = Math.floor((bugun - tohumlamaTarihi) / (1000 * 60 * 60 * 24));

      console.log(`📊 ${inek.isim}:`, {
        tohumlamaTarihi: tohumlama.tarih,
        gecenGun,
        gebelikDurumu: inek.gebelikDurumu
      });

      if (gecenGun >= 21 && gecenGun <= 28) {
        console.log('✅ 21-28 gün arası!');
        
        // Belirsiz olanları göster, Gebe veya Gebe Değil olanları atla
        if (inek.gebelikDurumu === 'Gebe' || inek.gebelikDurumu === 'Gebe Değil') {
          console.log('⏭️ Zaten kontrol edilmiş, atlanıyor');
          continue;
        }

        console.log('➕ Listeye ekleniyor!');
        bekleyenler.push({
          inek: inek,
          tohumlama: tohumlama,
          gecenGun: gecenGun
        });
      }
    }

    console.log('📋 Toplam bekleyen:', bekleyenler.length);
        // DÜVELERE DE BAK
    const duveler = await Duve.find({ userId: req.userId });
    
    console.log('🐄 Düve kontrol ediliyor, toplam:', duveler.length);

    for (const duve of duveler) {
      if (!duve.tohumlamaTarihi) continue;

      const tohumlamaTarihi = new Date(duve.tohumlamaTarihi);
      const gecenGun = Math.floor((bugun - tohumlamaTarihi) / (1000 * 60 * 60 * 24));

      console.log(`🐄 ${duve.isim}:`, {
        tohumlamaTarihi: duve.tohumlamaTarihi,
        gecenGun,
        gebelikDurumu: duve.gebelikDurumu
      });

      if (gecenGun >= 21 && gecenGun <= 28) {
        console.log('✅ 21-28 gün arası!');
        
        if (duve.gebelikDurumu === 'Gebe' || duve.gebelikDurumu === 'Gebe Değil') {
          console.log('⏭️ Zaten kontrol edilmiş, atlanıyor');
          continue;
        }

        console.log('➕ Düve listeye ekleniyor!');
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

    console.log('📋 Toplam bekleyen (İnek + Düve):', bekleyenler.length);
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