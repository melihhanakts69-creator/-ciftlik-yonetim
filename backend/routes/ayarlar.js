const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Ayarlar = require('../models/Ayarlar');
const Inek = require('../models/Inek');
const YemStok = require('../models/YemStok');
const YemHareket = require('../models/YemHareket');

// AYARLARI GETİR
router.get('/', auth, async (req, res) => {
  try {
    let ayarlar = await Ayarlar.findOne({ userId: req.userId });
    
    if (!ayarlar) {
      // İlk kez oluştur
      ayarlar = new Ayarlar({ userId: req.userId });
      await ayarlar.save();
    }

    res.json(ayarlar);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// AYARLARI GÜNCELLE
router.put('/', auth, async (req, res) => {
  try {
    const { otomatikYemTuketim, gunlukTuketim } = req.body;

    let ayarlar = await Ayarlar.findOne({ userId: req.userId });

    if (!ayarlar) {
      ayarlar = new Ayarlar({ userId: req.userId });
    }

    if (otomatikYemTuketim !== undefined) {
      ayarlar.otomatikYemTuketim = otomatikYemTuketim;
    }

    if (gunlukTuketim) {
      ayarlar.gunlukTuketim = { ...ayarlar.gunlukTuketim, ...gunlukTuketim };
    }

    await ayarlar.save();

    res.json(ayarlar);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// OTOMATİK TÜKETİM ÇALIŞTIR
router.post('/otomatik-tuketim', auth, async (req, res) => {
  try {
    const ayarlar = await Ayarlar.findOne({ userId: req.userId });

    if (!ayarlar || !ayarlar.otomatikYemTuketim) {
      return res.status(400).json({ message: 'Otomatik tüketim kapalı!' });
    }

    const bugun = new Date().toISOString().split('T')[0];

    // Bugün zaten çalıştırılmış mı?
    if (ayarlar.sonTuketimTarihi === bugun) {
      return res.status(400).json({ message: 'Bugün zaten otomatik tüketim yapıldı!' });
    }

    // İnek sayısını bul
    const inekSayisi = await Inek.countDocuments({ userId: req.userId });

    if (inekSayisi === 0) {
      return res.status(400).json({ message: 'Henüz inek eklenmemiş!' });
    }

    const tuketimler = [];

    // Her yem tipi için tüketim ekle
    const yemTipleri = [
      { isim: 'Karma Yem', miktar: ayarlar.gunlukTuketim.karmaYem },
      { isim: 'Arpa', miktar: ayarlar.gunlukTuketim.arpa },
      { isim: 'Mısır', miktar: ayarlar.gunlukTuketim.misir },
      { isim: 'Saman', miktar: ayarlar.gunlukTuketim.saman },
      { isim: 'Yonca', miktar: ayarlar.gunlukTuketim.yonca },
      { isim: 'Kepek', miktar: ayarlar.gunlukTuketim.kepek }
    ];

    for (const yem of yemTipleri) {
      if (yem.miktar > 0) {
        const toplamTuketim = yem.miktar * inekSayisi;

        // Hareket kaydı oluştur
        const hareket = new YemHareket({
          userId: req.userId,
          yemTipi: yem.isim,
          hareketTipi: 'Tüketim',
          miktar: toplamTuketim,
          birimFiyat: 0,
          toplamTutar: 0,
          tarih: bugun,
          aciklama: `Otomatik günlük tüketim (${inekSayisi} inek)`
        });

        await hareket.save();

        // Stok güncelle
        const stok = await YemStok.findOne({ userId: req.userId, yemTipi: yem.isim });

        if (stok) {
          stok.miktar -= toplamTuketim;
          if (stok.miktar < 0) stok.miktar = 0;
          await stok.save();
        }

        tuketimler.push({
          yemTipi: yem.isim,
          miktar: toplamTuketim
        });
      }
    }

    // Son tüketim tarihini güncelle
    ayarlar.sonTuketimTarihi = bugun;
    await ayarlar.save();

    res.json({
      message: 'Otomatik tüketim başarılı!',
      inekSayisi,
      tuketimler
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;