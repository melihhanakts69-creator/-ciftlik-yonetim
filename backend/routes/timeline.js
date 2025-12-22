const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Timeline = require('../models/Timeline');
const Inek = require('../models/Inek');
// YAKLASAN DOĞUMLARI GETİR
router.get('/yaklasan/dogumlar', auth, async (req, res) => {
  try {
     console.log('🚨 YAKLASAN DOĞUMLAR İSTEĞİ GELDİ!');
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
     console.log('📊 TOPLAM İNEK BULUNDU:', inekler.length);
    console.log('🐄 İNEKLER:', JSON.stringify(inekler.map(i => ({
      isim: i.isim,
      durum: i.durum,
      gebe: i.gebelikDurumu,
      tohum: i.tohumlamaTarihi
    })), null, 2));
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    const yaklaşanlar = [];

    inekler.forEach(inek => {
      if (inek.tohumlamaTarihi) {
        // Tarihi düzgün parse et
        const tohumlama = new Date(inek.tohumlamaTarihi.includes('T') ? inek.tohumlamaTarihi : inek.tohumlamaTarihi + 'T12:00:00Z');
        const tahminiDoğum = new Date(tohumlama);
        tahminiDoğum.setDate(tahminiDoğum.getDate() + 283);
        tahminiDoğum.setHours(0, 0, 0, 0);

        const kalanGun = Math.ceil((tahminiDoğum - bugun) / (1000 * 60 * 60 * 24));

        console.log(`İnek: ${inek.isim}, Tohum: ${inek.tohumlamaTarihi}, Doğum: ${tahminiDoğum.toISOString().split('T')[0]}, Kalan: ${kalanGun}`);

        if (kalanGun >= 0 && kalanGun <= 30) {
          yaklaşanlar.push({
            inek: inek,
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