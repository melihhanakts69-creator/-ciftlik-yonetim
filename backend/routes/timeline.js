const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Timeline = require('../models/Timeline');
const Inek = require('../models/Inek');

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

// YAKLASAN DOĞUMLARI GETİR
router.get('/yaklasan/dogumlar', auth, async (req, res) => {
  try {
    const inekler = await Inek.find({ 
      userId: req.userId, 
      durum: 'Aktif',
      gebelikDurumu: 'Gebe',
      tohumlamaTarihi: { $ne: null }
    });

    const bugun = new Date();
    const yaklaşanlar = [];

    inekler.forEach(inek => {
      if (inek.tohumlamaTarihi) {
        const tohumlama = new Date(inek.tohumlamaTarihi);
        const tahminiDoğum = new Date(tohumlama);
        tahminiDoğum.setDate(tahminiDoğum.getDate() + 283); // Gebelik süresi

        const kalanGun = Math.ceil((tahminiDoğum - bugun) / (1000 * 60 * 60 * 24));

        if (kalanGun >= 0 && kalanGun <= 30) {
          yaklaşanlar.push({
            inek: inek,
            kalanGun: kalanGun,
            tahminiDoğum: tahminiDoğum.toISOString().split('T')[0]
          });
        }
      }
    });

    // Kalan güne göre sırala (en yakın en üstte)
    yaklaşanlar.sort((a, b) => a.kalanGun - b.kalanGun);

    res.json(yaklaşanlar);
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