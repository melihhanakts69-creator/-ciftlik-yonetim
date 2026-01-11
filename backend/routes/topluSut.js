const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TopluSutGirisi = require('../models/TopluSutGirisi');
const SutKaydi = require('../models/SutKaydi');
const Inek = require('../models/Inek');

// SON 7 GÜNLÜK ORTALAMA HESAPLA (Akıllı dağılım için)
async function getSon7GunOrtalama(userId) {
  const yediGunOnce = new Date();
  yediGunOnce.setDate(yediGunOnce.getDate() - 7);
  const yediGunOnceStr = yediGunOnce.toISOString().split('T')[0];

  const kayitlar = await SutKaydi.find({
    userId: userId,
    tarih: { $gte: yediGunOnceStr }
  });

  const inekOrtalamalari = {};
  const inekSayaclari = {};

  kayitlar.forEach(kayit => {
    if (!inekOrtalamalari[kayit.inekId]) {
      inekOrtalamalari[kayit.inekId] = 0;
      inekSayaclari[kayit.inekId] = 0;
    }
    inekOrtalamalari[kayit.inekId] += kayit.litre;
    inekSayaclari[kayit.inekId]++;
  });

  // Ortalama hesapla
  Object.keys(inekOrtalamalari).forEach(inekId => {
    inekOrtalamalari[inekId] = inekOrtalamalari[inekId] / inekSayaclari[inekId];
  });

  return inekOrtalamalari;
}

// AKILLI DAĞILIM HESAPLA
router.post('/onizleme', auth, async (req, res) => {
  try {
    const { toplamSut, dagilimTipi, tarih, sagim } = req.body;

    // Aktif inekleri al (Kuru dönem hariç)
    const inekler = await Inek.find({
      userId: req.userId,
      $or: [
        { durum: 'Aktif' },
        { durum: { $exists: false } },
        { durum: null }
      ]
    });

    if (inekler.length === 0) {
      return res.status(400).json({ message: 'Aktif inek bulunamadı!' });
    }

    let detaylar = [];

    if (dagilimTipi === 'esit') {
      // EŞİT DAĞILIM
      const inekBasinaSut = toplamSut / inekler.length;
      
      detaylar = inekler.map(inek => ({
        inekId: inek._id.toString(),
        inekIsim: inek.isim,
        miktar: parseFloat(inekBasinaSut.toFixed(2)),
        otomatikMi: true,
        duzenlenmis: false
      }));

    } else if (dagilimTipi === 'akilli') {
      // AKILLI DAĞILIM - Son 7 günlük ortalamaya göre
      const ortalamaları = await getSon7GunOrtalama(req.userId);
      
      // Toplam ortalama süt hesapla
      let toplamOrtalama = 0;
      const inekOranlari = {};

      inekler.forEach(inek => {
        const inekId = inek._id.toString();
        const ortalama = ortalamaları[inekId] || 0;
        inekOranlari[inekId] = ortalama;
        toplamOrtalama += ortalama;
      });

      // Eğer hiç kayıt yoksa eşit dağıt
      if (toplamOrtalama === 0) {
        const inekBasinaSut = toplamSut / inekler.length;
        detaylar = inekler.map(inek => ({
          inekId: inek._id.toString(),
          inekIsim: inek.isim,
          miktar: parseFloat(inekBasinaSut.toFixed(2)),
          otomatikMi: true,
          duzenlenmis: false
        }));
      } else {
        // Orana göre dağıt
        detaylar = inekler.map(inek => {
          const inekId = inek._id.toString();
          const oran = inekOranlari[inekId] / toplamOrtalama;
          const miktar = toplamSut * oran;
          
          return {
            inekId: inekId,
            inekIsim: inek.isim,
            miktar: parseFloat(miktar.toFixed(2)),
            otomatikMi: true,
            duzenlenmis: false
          };
        });
      }
    }

    // Toplam kontrolü
    const hesaplananToplam = detaylar.reduce((sum, d) => sum + d.miktar, 0);
    
    res.json({
      detaylar: detaylar,
      toplamSut: toplamSut,
      hesaplananToplam: parseFloat(hesaplananToplam.toFixed(2)),
      inekSayisi: inekler.length,
      dagilimTipi: dagilimTipi
    });

  } catch (error) {
    console.error('Önizleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// TOPLU SÜT KAYDET
router.post('/', auth, async (req, res) => {
  try {
    const { tarih, sagim, toplamSut, dagilimTipi, detaylar, notlar } = req.body;

    // MEVCUT SÜT KAYITLARINI KONTROL ET
    const mevcutSutKayitlari = await SutKaydi.find({
      userId: req.userId,
      tarih: tarih,
      sagim: sagim
    });

    if (mevcutSutKayitlari.length > 0) {
      return res.status(409).json({
        message: 'Bu tarih ve sağım için zaten süt kayıtları mevcut!',
        kayitSayisi: mevcutSutKayitlari.length,
        toplamSut: mevcutSutKayitlari.reduce((sum, k) => sum + k.litre, 0),
        conflict: true
      });
    }

    // TOPLU KAYIT OLUŞTUR
    const topluKayit = new TopluSutGirisi({
      userId: req.userId,
      tarih,
      sagim,
      toplamSut,
      dagilimTipi,
      detaylar,
      notlar
    });

    await topluKayit.save();

    // HER İNEK İÇİN SÜT KAYDI OLUŞTUR
    const sutKayitlari = detaylar.map(detay => ({
      userId: req.userId,
      inekId: detay.inekId,
      inekIsim: detay.inekIsim,
      tarih: tarih,
      litre: detay.miktar,
      sagim: sagim,
      topluGiristen: true,
      topluGirisId: topluKayit._id
    }));

    await SutKaydi.insertMany(sutKayitlari);

    res.status(201).json({
      message: 'Toplu süt girişi başarılı!',
      topluKayit: topluKayit,
      kayitSayisi: sutKayitlari.length
    });

  } catch (error) {
    console.error('Toplu süt kayıt hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// TOPLU GİRİŞ GEÇMİŞİNİ GETİR
router.get('/gecmis', auth, async (req, res) => {
  try {
    const { limit = 30 } = req.query;

    const gecmis = await TopluSutGirisi.find({ userId: req.userId })
      .sort({ tarih: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.json(gecmis);
  } catch (error) {
    console.error('Geçmiş getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// BİR TOPLU GİRİŞİN DETAYINI GETİR
router.get('/:id', auth, async (req, res) => {
  try {
    const kayit = await TopluSutGirisi.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!kayit) {
      return res.status(404).json({ message: 'Kayıt bulunamadı!' });
    }

    res.json(kayit);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// TARİH VE SAĞIMA GÖRE TÜM KAYITLARI SİL
router.delete('/tarih/:tarih/:sagim', auth, async (req, res) => {
  try {
    const { tarih, sagim } = req.params;

    // Süt kayıtlarını sil
    const silinen = await SutKaydi.deleteMany({
      userId: req.userId,
      tarih: tarih,
      sagim: sagim
    });

    // Toplu giriş kaydını da sil (varsa)
    await TopluSutGirisi.deleteMany({
      userId: req.userId,
      tarih: tarih,
      sagim: sagim
    });

    res.json({
      message: 'Kayıtlar silindi!',
      silinenSayisi: silinen.deletedCount
    });
  } catch (error) {
    console.error('Silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router;