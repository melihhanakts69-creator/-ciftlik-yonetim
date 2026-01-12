const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Inek = require('../models/Inek');
const Duve = require('../models/Duve');
const Buzagi = require('../models/Buzagi');
const Tosun = require('../models/Tosun');
const SutKaydi = require('../models/SutKaydi');
const Bildirim = require('../models/Bildirim');
const Maliyet = require('../models/Maliyet');
const AlisSatis = require('../models/AlisSatis');

// Dashboard genel istatistikler
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Toplam hayvan sayıları
    const toplamInek = await Inek.countDocuments({ userId });
    const toplamDuve = await Duve.countDocuments({ userId });
    const toplamBuzagi = await Buzagi.countDocuments({ userId });
    const toplamTosun = await Tosun.countDocuments({ userId });

    // Gebe hayvanlar
    const gebeInek = await Inek.countDocuments({ userId, gebe: true });
    const gebeDuve = await Duve.countDocuments({ userId, gebe: true });

    // Sağmal inekler
    const sagmalInek = await Inek.countDocuments({
      userId,
      durum: { $in: ['sagmal', 'gebe'] }
    });

    // Bugünün süt verimi
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);

    const yarin = new Date(bugun);
    yarin.setDate(yarin.getDate() + 1);

    const bugunSut = await SutKaydi.aggregate([
      {
        $match: {
          userId: req.user.userId,
          tarih: {
            $gte: bugun,
            $lt: yarin
          }
        }
      },
      {
        $group: {
          _id: null,
          toplam: { $sum: '$miktar' }
        }
      }
    ]);

    // Yaklaşan doğumlar (30 gün içinde)
    const otuzGunSonra = new Date();
    otuzGunSonra.setDate(otuzGunSonra.getDate() + 30);

    const yaklaşanDogumInek = await Inek.countDocuments({
      userId,
      gebe: true,
      dogum_tarihi: {
        $gte: new Date(),
        $lte: otuzGunSonra
      }
    });

    const yaklaşanDogumDuve = await Duve.countDocuments({
      userId,
      gebe: true,
      dogum_tarihi: {
        $gte: new Date(),
        $lte: otuzGunSonra
      }
    });

    const yaklaşanDogum = yaklaşanDogumInek + yaklaşanDogumDuve;

    // Okunmamış bildirimler
    const okunmayanBildirim = await Bildirim.countDocuments({
      userId,
      okundu: false,
      aktif: true
    });

    res.json({
      toplamHayvan: {
        inek: toplamInek,
        duve: toplamDuve,
        buzagi: toplamBuzagi,
        tosun: toplamTosun,
        toplam: toplamInek + toplamDuve + toplamBuzagi + toplamTosun
      },
      gebe: {
        inek: gebeInek,
        duve: gebeDuve,
        toplam: gebeInek + gebeDuve
      },
      sagmal: sagmalInek,
      bugunSut: bugunSut.length > 0 ? bugunSut[0].toplam : 0,
      yaklaşanDogum,
      okunmayanBildirim
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Dashboard istatistikleri alınamadı', error: error.message });
  }
});

// Süt performans grafiği (son 30 gün)
router.get('/performans/sut', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const gunSayisi = parseInt(req.query.gun) || 30;

    const baslangic = new Date();
    baslangic.setDate(baslangic.getDate() - gunSayisi);
    baslangic.setHours(0, 0, 0, 0);

    const sutVerileri = await SutKaydi.aggregate([
      {
        $match: {
          userId: req.user.userId,
          tarih: { $gte: baslangic }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$tarih' }
          },
          toplam: { $sum: '$miktar' },
          kayitSayisi: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json(sutVerileri);
  } catch (error) {
    console.error('Süt performans error:', error);
    res.status(500).json({ message: 'Süt performansı alınamadı', error: error.message });
  }
});

// Finansal özet (son 30 gün)
router.get('/finansal', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const gunSayisi = parseInt(req.query.gun) || 30;

    const baslangic = new Date();
    baslangic.setDate(baslangic.getDate() - gunSayisi);
    baslangic.setHours(0, 0, 0, 0);

    const bitis = new Date();

    // Toplam maliyet
    const toplamMaliyet = await Maliyet.toplamMaliyet(userId, baslangic, bitis);

    // Kategoriye göre maliyet
    const kategoriler = await Maliyet.kategoriyeGoreMaliyet(userId, baslangic, bitis);

    // Alış-satış kar/zarar
    const karZarar = await AlisSatis.karZarar(userId, baslangic, bitis);

    // Veresiye borçlar
    const veresiyeler = await AlisSatis.veresiyeler(userId);

    res.json({
      maliyet: {
        toplam: toplamMaliyet,
        kategoriler
      },
      alisSatis: karZarar,
      veresiyeler
    });
  } catch (error) {
    console.error('Finansal özet error:', error);
    res.status(500).json({ message: 'Finansal özet alınamadı', error: error.message });
  }
});

// Bugünün yapılacakları (bildirimler)
router.get('/yapilacaklar', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Bugünün bildirimleri
    const bugununkiler = await Bildirim.bugununkiler(userId);

    // Gecikmiş bildirimler
    const gecikmisler = await Bildirim.gecikmisler(userId);

    // Yaklaşan bildirimler (7 gün)
    const yaklaşanlar = await Bildirim.yaklaşanlar(userId, 7);

    res.json({
      bugun: bugununkiler,
      geciken: gecikmisler,
      yaklaşan: yaklaşanlar
    });
  } catch (error) {
    console.error('Yapılacaklar error:', error);
    res.status(500).json({ message: 'Yapılacaklar alınamadı', error: error.message });
  }
});

// Son aktiviteler
router.get('/aktiviteler', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;

    // Son eklenen hayvanlar
    const sonInekler = await Inek.find({ userId }).sort({ createdAt: -1 }).limit(1).select('kupe_no ad createdAt').lean();
    const sonDuveler = await Duve.find({ userId }).sort({ createdAt: -1 }).limit(1).select('kupe_no ad createdAt').lean();
    const sonBuzagilar = await Buzagi.find({ userId }).sort({ createdAt: -1 }).limit(1).select('kupe_no ad createdAt').lean();

    // Tüm hayvanları birleştir ve tip ekle
    const sonHayvanlar = [
      ...sonInekler.map(h => ({ ...h, tip: 'inek' })),
      ...sonDuveler.map(h => ({ ...h, tip: 'duve' })),
      ...sonBuzagilar.map(h => ({ ...h, tip: 'buzagi' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

    // Son süt kayıtları
    const sonSutler = await SutKaydi.find({ userId })
      .sort({ tarih: -1 })
      .limit(3)
      .select('tarih miktar');

    // Son maliyetler
    const sonMaliyetler = await Maliyet.find({ userId })
      .sort({ tarih: -1 })
      .limit(3)
      .select('kategori tutar tarih');

    // Son alış-satışlar
    const sonAlisSatis = await AlisSatis.find({ userId })
      .sort({ tarih: -1 })
      .limit(3)
      .select('tip fiyat tarih hayvanTipi');

    // Aktiviteleri birleştir ve tarihe göre sırala
    const aktiviteler = [
      ...sonHayvanlar.map(h => ({
        tip: 'hayvan_eklendi',
        tarih: h.createdAt,
        veri: h
      })),
      ...sonSutler.map(s => ({
        tip: 'sut_kaydi',
        tarih: s.tarih,
        veri: s
      })),
      ...sonMaliyetler.map(m => ({
        tip: 'maliyet',
        tarih: m.tarih,
        veri: m
      })),
      ...sonAlisSatis.map(a => ({
        tip: a.tip === 'alis' ? 'hayvan_alindi' : 'hayvan_satildi',
        tarih: a.tarih,
        veri: a
      }))
    ];

    // Tarihe göre sırala ve limitle
    aktiviteler.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
    const sonAktiviteler = aktiviteler.slice(0, limit);

    res.json(sonAktiviteler);
  } catch (error) {
    console.error('Aktiviteler error:', error);
    res.status(500).json({ message: 'Aktiviteler alınamadı', error: error.message });
  }
});

// Sağlık uyarıları
router.get('/saglik-uyarilari', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Hasta hayvanlar
    const hastaInekler = await Inek.find({ userId, durum: 'hasta' }).select('kupe_no ad').lean();
    const hastaDuveler = await Duve.find({ userId, durum: 'hasta' }).select('kupe_no ad').lean();

    const hastalar = [
      ...hastaInekler.map(h => ({ ...h, tip: 'inek' })),
      ...hastaDuveler.map(h => ({ ...h, tip: 'duve' }))
    ];

    // Aşı zamanı gelen bildirimler
    const asiZamani = await Bildirim.find({
      userId,
      tip: 'asi',
      tamamlandi: false,
      aktif: true
    })
    .sort({ hatirlatmaTarihi: 1 })
    .limit(5);

    // Muayene zamanı gelen bildirimler
    const muayeneZamani = await Bildirim.find({
      userId,
      tip: 'muayene',
      tamamlandi: false,
      aktif: true
    })
    .sort({ hatirlatmaTarihi: 1 })
    .limit(5);

    res.json({
      hastalar,
      asiZamani,
      muayeneZamani
    });
  } catch (error) {
    console.error('Sağlık uyarıları error:', error);
    res.status(500).json({ message: 'Sağlık uyarıları alınamadı', error: error.message });
  }
});

module.exports = router;
