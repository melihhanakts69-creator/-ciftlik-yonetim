const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Finansal = require('../models/Finansal');

// TÜM FİNANSAL KAYITLARI GETİR
router.get('/', auth, async (req, res) => {
  try {
    const { tip, baslangic, bitis } = req.query;

    let query = { userId: req.userId };

    // Tip filtresi (gelir veya gider)
    if (tip) {
      query.tip = tip;
    }

    // Tarih aralığı filtresi
    if (baslangic && bitis) {
      query.tarih = { $gte: baslangic, $lte: bitis };
    } else if (baslangic) {
      query.tarih = { $gte: baslangic };
    } else if (bitis) {
      query.tarih = { $lte: bitis };
    }

    const kayitlar = await Finansal.find(query).sort({ tarih: -1, createdAt: -1 });
    res.json(kayitlar);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// YENİ FİNANSAL KAYIT EKLE
router.post('/', auth, async (req, res) => {
  try {
    const { tip, kategori, miktar, tarih, aciklama, ilgiliHayvanId, ilgiliHayvanTipi } = req.body;

    // Validasyon
    if (!tip || !kategori || !miktar || !tarih) {
      return res.status(400).json({ message: 'Gerekli alanlar eksik (tip, kategori, miktar, tarih)' });
    }

    if (!['gelir', 'gider'].includes(tip)) {
      return res.status(400).json({ message: 'Geçersiz tip. gelir veya gider olmalı.' });
    }

    if (miktar <= 0) {
      return res.status(400).json({ message: 'Miktar 0\'dan büyük olmalıdır' });
    }

    const kayit = new Finansal({
      userId: req.userId,
      tip,
      kategori,
      miktar,
      tarih,
      aciklama: aciklama || '',
      ilgiliHayvanId: ilgiliHayvanId || null,
      ilgiliHayvanTipi: ilgiliHayvanTipi || null
    });

    await kayit.save();
    res.status(201).json(kayit);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// FİNANSAL KAYIT GÜNCELLE
router.put('/:id', auth, async (req, res) => {
  try {
    const { tip, kategori, miktar, tarih, aciklama, ilgiliHayvanId, ilgiliHayvanTipi } = req.body;

    const kayit = await Finansal.findOne({ _id: req.params.id, userId: req.userId });

    if (!kayit) {
      return res.status(404).json({ message: 'Kayıt bulunamadı' });
    }

    // Güncellenecek alanlar
    if (tip !== undefined) kayit.tip = tip;
    if (kategori !== undefined) kayit.kategori = kategori;
    if (miktar !== undefined) kayit.miktar = miktar;
    if (tarih !== undefined) kayit.tarih = tarih;
    if (aciklama !== undefined) kayit.aciklama = aciklama;
    if (ilgiliHayvanId !== undefined) kayit.ilgiliHayvanId = ilgiliHayvanId;
    if (ilgiliHayvanTipi !== undefined) kayit.ilgiliHayvanTipi = ilgiliHayvanTipi;

    await kayit.save();
    res.json(kayit);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// FİNANSAL KAYIT SİL
router.delete('/:id', auth, async (req, res) => {
  try {
    const kayit = await Finansal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!kayit) {
      return res.status(404).json({ message: 'Kayıt bulunamadı' });
    }

    res.json({ message: 'Kayıt silindi', kayit });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// ÖZET İSTATİSTİKLER (Gelir/Gider Toplamları)
router.get('/ozet', auth, async (req, res) => {
  try {
    const { baslangic, bitis } = req.query;

    let query = { userId: req.userId };

    const mongoose = require('mongoose'); // Ensure mongoose is required

    // ...

    // Aggregation için userId'yi ObjectId'ye çevir
    // NOT: aggregate queries string userId ile çalışmaz, auto-cast yapmaz
    if (query.userId) {
      query.userId = new mongoose.Types.ObjectId(req.userId);
    }

    // Tarih aralığı filtresi
    if (baslangic && bitis) {
      query.tarih = { $gte: baslangic, $lte: bitis };
    } else if (baslangic) {
      query.tarih = { $gte: baslangic };
    } else if (bitis) {
      query.tarih = { $lte: bitis };
    }

    // Toplam Gelir
    const toplamGelir = await Finansal.aggregate([
      { $match: { ...query, tip: 'gelir' } },
      { $group: { _id: null, toplam: { $sum: '$miktar' } } }
    ]);

    // Toplam Gider
    const toplamGider = await Finansal.aggregate([
      { $match: { ...query, tip: 'gider' } },
      { $group: { _id: null, toplam: { $sum: '$miktar' } } }
    ]);

    // Kategoriye göre gelirler
    const gelirKategorileri = await Finansal.aggregate([
      { $match: { ...query, tip: 'gelir' } },
      { $group: { _id: '$kategori', toplam: { $sum: '$miktar' }, adet: { $sum: 1 } } },
      { $sort: { toplam: -1 } }
    ]);

    // Kategoriye göre giderler
    const giderKategorileri = await Finansal.aggregate([
      { $match: { ...query, tip: 'gider' } },
      { $group: { _id: '$kategori', toplam: { $sum: '$miktar' }, adet: { $sum: 1 } } },
      { $sort: { toplam: -1 } }
    ]);

    const gelir = toplamGelir.length > 0 ? toplamGelir[0].toplam : 0;
    const gider = toplamGider.length > 0 ? toplamGider[0].toplam : 0;

    res.json({
      toplamGelir: gelir,
      toplamGider: gider,
      netKar: gelir - gider,
      gelirKategorileri,
      giderKategorileri
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
