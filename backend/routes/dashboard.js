const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

console.log('✅ DASHBOARD ROUTER YÜKLENDİ (V2) - Eğer bunu görüyorsan kod güncel!');




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
    const userId = req.userId;

    const uid = new mongoose.Types.ObjectId(req.userId);

    // Toplam hayvan sayıları
    const toplamInek = await Inek.countDocuments({ userId: uid });
    const toplamDuve = await Duve.countDocuments({ userId: uid });
    const toplamBuzagi = await Buzagi.countDocuments({ userId: uid });
    const toplamTosun = await Tosun.countDocuments({ userId: uid });

    // Gebe hayvanlar (Field adı düzeltmeleri)
    const gebeInek = await Inek.countDocuments({ userId: uid, gebelikDurumu: 'Gebe' });
    const gebeDuve = await Duve.countDocuments({ userId: uid, gebelikDurumu: 'Gebe' });

    // Sağmal inekler: Süt veren inekler (kuru dönemdekiler hariç)
    // durum 'Aktif' = sağmal; durum 'Kuru Dönemde' = kuruya ayrılmış
    const sagmalInek = await Inek.countDocuments({
      userId: uid,
      durum: 'Aktif'
    });

    // Bugünün süt verimi
    const bugunStr = new Date().toLocaleDateString('en-CA');

    // Debug
    console.log('QUERY DATE:', bugunStr);

    const bugunSut = await SutKaydi.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          tarih: bugunStr
        }
      },
      {
        $group: {
          _id: null,
          toplam: { $sum: '$litre' }
        }
      }
    ]);

    // Yaklaşan doğumlar (30 gün içinde)
    // Sadece Gebe olanları çekip JS tarafında hesaplayacağız
    const gebeler = await Promise.all([
      Inek.find({ userId: uid, gebelikDurumu: 'Gebe' }).select('tohumlamaTarihi isim kupeNo'),
      Duve.find({ userId: uid, gebelikDurumu: 'Gebe' }).select('tohumlamaTarihi isim kupeNo')
    ]);

    const otuzGunSonra = new Date();
    otuzGunSonra.setDate(otuzGunSonra.getDate() + 30);
    const simdi = new Date();

    let yaklaşanDogumSayisi = 0;

    // İnekler ve Düveler için hesaplama
    [...gebeler[0], ...gebeler[1]].forEach(hayvan => {
      if (hayvan.tohumlamaTarihi) {
        const tohumlama = new Date(hayvan.tohumlamaTarihi);
        const dogum = new Date(tohumlama);
        dogum.setDate(dogum.getDate() + 283); // Ortalama gebelik süresi

        if (dogum >= simdi && dogum <= otuzGunSonra) {
          yaklaşanDogumSayisi++;
        }
      }
    });

    // Okunmamış bildirimler
    const okunmayanBildirim = await Bildirim.countDocuments({
      userId: uid,
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
      yaklaşanDogum: yaklaşanDogumSayisi,
      okunmayanBildirim,
      trendler: await calculateTrends(uid)
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Dashboard istatistikleri alınamadı', detail: error.message });
  }
});

// Süt performans grafiği (son 30 gün)
router.get('/performans/sut', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const gunSayisi = parseInt(req.query.gun) || 30;

    const baslangicTarihi = new Date();
    baslangicTarihi.setDate(baslangicTarihi.getDate() - gunSayisi);
    const baslangicStr = baslangicTarihi.toLocaleDateString('en-CA');

    const sutVerileri = await SutKaydi.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          tarih: { $gte: baslangicStr }
        }
      },
      {
        $group: {
          _id: '$tarih', // Tarih zaten YYYY-MM-DD formatında string
          toplam: { $sum: '$litre' },
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
    res.status(500).json({ message: 'Süt performansı alınamadı', detail: error.message });
  }
});

// Finansal özet (son 30 gün)
router.get('/finansal', auth, async (req, res) => {
  try {
    const userId = req.userId;
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
    res.status(500).json({ message: 'Finansal özet alınamadı', detail: error.message });
  }
});

const { otomatikGorevleriKontrolEt } = require('../jobs/otomatikGorevler');

// Bugünün yapılacakları (bildirimler)
router.get('/yapilacaklar', auth, async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.userId);

    // 1. OTOMATİK GÖREV OLUŞTURMA (hem burada hem cron'da çalışır)
    await otomatikGorevleriKontrolEt(uid);

    // Bugünün bildirimleri
    const bugununkiler = await Bildirim.bugununkiler(uid);

    // Gecikmiş bildirimler
    const gecikmisler = await Bildirim.gecikmisler(uid);

    // Yaklaşan bildirimler (7 gün)
    const yaklaşanlar = await Bildirim.yaklaşanlar(uid, 7);

    res.json({
      bugun: bugununkiler,
      geciken: gecikmisler,
      yaklaşan: yaklaşanlar
    });
  } catch (error) {
    console.error('Yapılacaklar error:', error);
    res.status(500).json({ message: 'Yapılacaklar alınamadı', detail: error.message });
  }
});

// En iyi süt veren inekler (Son 30 gün ortalaması)
router.get('/top-performers', auth, async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.userId);
    const gunSayisi = 30;

    const baslangicTarihi = new Date();
    baslangicTarihi.setDate(baslangicTarihi.getDate() - gunSayisi);
    const baslangicStr = baslangicTarihi.toISOString().split('T')[0];

    const topCows = await SutKaydi.aggregate([
      {
        $match: {
          userId: uid,
          tarih: { $gte: baslangicStr }
        }
      },
      {
        $addFields: {
          inekObjId: { $toObjectId: '$inekId' }
        }
      },
      {
        $group: {
          _id: '$inekObjId',
          toplamSut: { $sum: '$litre' },
          gunSayisi: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'ineks',
          localField: '_id',
          foreignField: '_id',
          as: 'inekBilgi'
        }
      },
      {
        $unwind: '$inekBilgi'
      },
      {
        $project: {
          _id: 1,
          isim: '$inekBilgi.isim',
          kupeNo: '$inekBilgi.kupeNo',
          toplamSut: 1,
          ortalama: { $divide: ['$toplamSut', '$gunSayisi'] }
        }
      },
      { $sort: { ortalama: -1 } },
      { $limit: 5 }
    ]);

    res.json(topCows);
  } catch (error) {
    console.error('Top performers error:', error);
    // Koleksiyon adı hatası olabilir, boş array dönelim ki patlamasın
    res.json([]);
  }
});

// Son aktiviteler
const TopluSutGirisi = require('../models/TopluSutGirisi'); // Import Eklendi

// ... (other imports remain, ensuring TopluSutGirisi is included)

// Son aktiviteler
router.get('/aktiviteler', auth, async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.userId);
    const limit = parseInt(req.query.limit) || 10;

    // Son eklenen hayvanlar
    const sonInekler = await Inek.find({ userId: uid }).sort({ createdAt: -1 }).limit(5).lean();
    const sonDuveler = await Duve.find({ userId: uid }).sort({ createdAt: -1 }).limit(5).lean();
    const sonBuzagilar = await Buzagi.find({ userId: uid }).sort({ createdAt: -1 }).limit(5).lean();

    // Tüm hayvanları birleştir ve tip ekle
    const sonHayvanlar = [
      ...sonInekler.map(h => ({ ...h, tip: 'inek', kupe_no: h.kupeNo || h.kupe_no })),
      ...sonDuveler.map(h => ({ ...h, tip: 'duve', kupe_no: h.kupeNo || h.kupe_no })),
      ...sonBuzagilar.map(h => ({ ...h, tip: 'buzagi', kupe_no: h.kupeNo || h.kupe_no }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    // Son süt kayıtları - ARTIK TOPLU GİRİŞLERDEN ÇEKİYORUZ
    const sonSutler = await TopluSutGirisi.find({ userId: uid })
      .sort({ tarih: -1, createdAt: -1 })
      .limit(3)
      .select('tarih toplamSut sagim createdAt'); // toplamSut ve createdAt önemli

    // Son maliyetler
    const sonMaliyetler = await Maliyet.find({ userId: uid })
      .sort({ tarih: -1 })
      .limit(3)
      .select('kategori tutar tarih');

    // Son alış-satışlar
    const sonAlisSatis = await AlisSatis.find({ userId: uid })
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
        tarih: s.createdAt || s.tarih, // createdAt varsa onu kullan (saat farkı için), yoksa tarih
        veri: {
          ...s.toObject(),
          miktar: s.toplamSut // Frontend 'miktar' bekliyor
        }
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
    res.status(500).json({ message: 'Aktiviteler alınamadı', detail: error.message });
  }
});

// Sağlık uyarıları
router.get('/saglik-uyarilari', auth, async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.userId);

    // SaglikKaydi ve AsiTakvimi modellerini dinamik yükle (deploy uyumlu)
    let aktifTedaviler = [];
    let yaklasanKontroller = [];
    let gecikmiAsiler = [];
    let aylikMaliyet = 0;

    try {
      const SaglikKaydi = require('../models/SaglikKaydi');

      // Aktif tedaviler (devam eden)
      aktifTedaviler = await SaglikKaydi.find({
        userId: uid,
        durum: 'devam_ediyor'
      }).sort({ tarih: -1 }).limit(5).lean();

      // Yaklaşan kontroller (7 gün içi)
      const yediGunSonra = new Date();
      yediGunSonra.setDate(yediGunSonra.getDate() + 7);
      yaklasanKontroller = await SaglikKaydi.find({
        userId: uid,
        sonrakiKontrol: { $lte: yediGunSonra, $gte: new Date() },
        durum: 'devam_ediyor'
      }).sort({ sonrakiKontrol: 1 }).limit(5).lean();

      // Aylık sağlık maliyeti
      const ayBaslangic = new Date();
      ayBaslangic.setDate(1);
      ayBaslangic.setHours(0, 0, 0, 0);
      const maliyetSonuc = await SaglikKaydi.aggregate([
        { $match: { userId: uid, tarih: { $gte: ayBaslangic }, maliyet: { $gt: 0 } } },
        { $group: { _id: null, toplam: { $sum: '$maliyet' } } }
      ]);
      aylikMaliyet = maliyetSonuc.length > 0 ? maliyetSonuc[0].toplam : 0;
    } catch (e) {
      console.log('SaglikKaydi modeli henüz yüklenmemiş olabilir');
    }

    try {
      const AsiTakvimi = require('../models/AsiTakvimi');

      // Gecikmiş aşılar
      gecikmiAsiler = await AsiTakvimi.find({
        userId: uid,
        sonrakiTarih: { $lt: new Date() },
        durum: { $ne: 'yapildi' }
      }).sort({ sonrakiTarih: 1 }).limit(5).lean();
    } catch (e) {
      console.log('AsiTakvimi modeli henüz yüklenmemiş olabilir');
    }

    res.json({
      aktifTedaviler,
      yaklasanKontroller,
      gecikmiAsiler,
      aylikMaliyet,
      toplam: {
        aktif: aktifTedaviler.length,
        yaklasan: yaklasanKontroller.length,
        gecikmi: gecikmiAsiler.length
      }
    });
  } catch (error) {
    console.error('Sağlık uyarıları error:', error);
    res.status(500).json({ message: 'Sağlık uyarıları alınamadı', detail: error.message });
  }
});

// Karlılık / Baş Başına Maliyet Dashboard
router.get('/karlilik', auth, async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.userId);
    const Finansal = require('../models/Finansal');
    const SaglikKaydi = require('../models/SaglikKaydi');
    const TopluSutGirisi = require('../models/TopluSutGirisi');

    const bugun = new Date();
    const ayBaslangic = new Date(bugun.getFullYear(), bugun.getMonth(), 1);
    const oncekiAyBas = new Date(bugun.getFullYear(), bugun.getMonth() - 1, 1);
    const oncekiAyBit = new Date(bugun.getFullYear(), bugun.getMonth(), 0, 23, 59, 59);

    // Toplam aktif inek sayısı
    const inekSayisi = await Inek.countDocuments({ userId: uid, durum: 'Aktif' });

    // Bu ayın finansal giderleri (yem, veteriner, ilaç, diğer)
    const giderler = await Finansal.aggregate([
      { $match: { userId: uid, tip: 'gider', tarih: { $gte: ayBaslangic.toISOString().slice(0, 10) } } },
      { $group: { _id: '$kategori', toplam: { $sum: '$miktar' } } }
    ]);

    // Bu ayın geliri (süt satışı + hayvan satışı)
    const gelirler = await Finansal.aggregate([
      { $match: { userId: uid, tip: 'gelir', tarih: { $gte: ayBaslangic.toISOString().slice(0, 10) } } },
      { $group: { _id: '$kategori', toplam: { $sum: '$miktar' } } }
    ]);

    const toplamGider = giderler.reduce((s, g) => s + g.toplam, 0);
    const toplamGelir = gelirler.reduce((s, g) => s + g.toplam, 0);
    const netKar = toplamGelir - toplamGider;
    const basBasinaMaliyet = inekSayisi > 0 ? toplamGider / inekSayisi : 0;
    const basBasinaGelir = inekSayisi > 0 ? toplamGelir / inekSayisi : 0;

    // Bu ay toplam süt
    const sutKayitlari = await SutKaydi.aggregate([
      { $match: { userId: uid, tarih: { $gte: ayBaslangic.toISOString().slice(0, 10) } } },
      { $group: { _id: null, toplam: { $sum: '$litre' } } }
    ]);
    const toplamSut = sutKayitlari[0]?.toplam || 0;

    // Önceki ay kar karşılaştırması
    const oncekiGider = await Finansal.aggregate([
      { $match: { userId: uid, tip: 'gider', tarih: { $gte: oncekiAyBas.toISOString().slice(0, 10), $lte: oncekiAyBit.toISOString().slice(0, 10) } } },
      { $group: { _id: null, toplam: { $sum: '$miktar' } } }
    ]);
    const oncekiGelir = await Finansal.aggregate([
      { $match: { userId: uid, tip: 'gelir', tarih: { $gte: oncekiAyBas.toISOString().slice(0, 10), $lte: oncekiAyBit.toISOString().slice(0, 10) } } },
      { $group: { _id: null, toplam: { $sum: '$miktar' } } }
    ]);
    const oncekiNetKar = (oncekiGelir[0]?.toplam || 0) - (oncekiGider[0]?.toplam || 0);
    const karDegisim = oncekiNetKar !== 0 ? ((netKar - oncekiNetKar) / Math.abs(oncekiNetKar)) * 100 : 0;

    // En iyi performanslı inekler (süt veriminden karlılık tahmini)
    const topInekler = await SutKaydi.aggregate([
      { $match: { userId: uid, tarih: { $gte: ayBaslangic.toISOString().slice(0, 10) } } },
      { $addFields: { inekObjId: { $toObjectId: '$inekId' } } },
      { $group: { _id: '$inekObjId', toplamSut: { $sum: '$litre' }, gunSayisi: { $sum: 1 } } },
      { $lookup: { from: 'ineks', localField: '_id', foreignField: '_id', as: 'inek' } },
      { $unwind: { path: '$inek', preserveNullAndEmptyArrays: true } },
      { $project: { isim: '$inek.isim', kupeNo: '$inek.kupeNo', toplamSut: 1, ortalama: { $divide: ['$toplamSut', { $max: ['$gunSayisi', 1] }] } } },
      { $sort: { ortalama: -1 } },
      { $limit: 5 }
    ]);

    // Son 6 ay aylık trend
    const altıAyOnce = new Date(bugun.getFullYear(), bugun.getMonth() - 5, 1);
    const aylikTrend = await Finansal.aggregate([
      { $match: { userId: uid, tarih: { $gte: altıAyOnce.toISOString().slice(0, 10) } } },
      { $addFields: { ay: { $substr: ['$tarih', 0, 7] } } },
      { $group: { _id: { ay: '$ay', tip: '$tip' }, toplam: { $sum: '$miktar' } } },
      { $sort: { '_id.ay': 1 } }
    ]);

    const aylarMap = {};
    aylikTrend.forEach(item => {
      const ay = item._id.ay;
      if (!aylarMap[ay]) aylarMap[ay] = { ay, gelir: 0, gider: 0 };
      if (item._id.tip === 'gelir') aylarMap[ay].gelir = item.toplam;
      else if (item._id.tip === 'gider') aylarMap[ay].gider = item.toplam;
    });
    const aylikTrendArr = Object.values(aylarMap).map(a => ({ ...a, net: a.gelir - a.gider }));

    res.json({
      ozet: { toplamGelir, toplamGider, netKar, basBasinaMaliyet, basBasinaGelir, inekSayisi, toplamSut, karDegisim: karDegisim.toFixed(1) },
      giderKategoriler: giderler,
      gelirKategoriler: gelirler,
      topInekler,
      aylikTrend: aylikTrendArr
    });
  } catch (error) {
    console.error('Karlılık error:', error);
    res.status(500).json({ message: 'Karlılık verisi alınamadı', detail: error.message });
  }
});

// YARDIMCI: Trend Hesaplama
async function calculateTrends(uid) {
  try {
    const today = new Date();
    const last30Start = new Date(today);
    last30Start.setDate(today.getDate() - 30);

    const prev30Start = new Date(last30Start);
    prev30Start.setDate(last30Start.getDate() - 30);

    const format = d => d.toISOString().split('T')[0];

    // Süt Trendi
    const result = await SutKaydi.aggregate([
      {
        $match: {
          userId: uid,
          tarih: { $gte: format(prev30Start) }
        }
      },
      {
        $group: {
          _id: {
            period: {
              $cond: [
                { $gte: ['$tarih', format(last30Start)] },
                'current',
                'previous'
              ]
            }
          },
          total: { $sum: '$litre' }
        }
      }
    ]);

    const current = result.find(r => r._id?.period === 'current')?.total || 0;
    const previous = result.find(r => r._id?.period === 'previous')?.total || 0;

    let sutArtisYuzdesi = 0;
    if (previous > 0) {
      sutArtisYuzdesi = ((current - previous) / previous) * 100;
    } else if (current > 0) {
      sutArtisYuzdesi = 100; // Önceki veri yoksa %100 artış
    }

    return {
      sut: sutArtisYuzdesi.toFixed(1),
      sutFark: current - previous
    };
  } catch (err) {
    console.error('Trend hesaplama hatası:', err);
    return { sut: 0, sutFark: 0 };
  }
}

module.exports = router;
