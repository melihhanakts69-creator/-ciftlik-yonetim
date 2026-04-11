const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

if (process.env.NODE_ENV !== 'production') {
  console.log('✅ DASHBOARD ROUTER YÜKLENDİ (V2)');
}


const auth = require('../middleware/auth');
const { addTenant } = require('../utils/tenantScope');
const Inek = require('../models/Inek');
const Duve = require('../models/Duve');
const Buzagi = require('../models/Buzagi');
const Tosun = require('../models/Tosun');
const SutKaydi = require('../models/SutKaydi');
const Bildirim = require('../models/Bildirim');
const Maliyet = require('../models/Maliyet');
const AlisSatis = require('../models/AlisSatis');
const SaglikKaydi = require('../models/SaglikKaydi');

// Dashboard genel istatistikler
router.get('/stats', auth, async (req, res) => {

  try {
    const userId = req.userId;

    const uid = new mongoose.Types.ObjectId(req.userId);

    // Toplam hayvan sayıları (Silindi/Satıldı/Öldü hariç)
    const aktifFilterInek = addTenant(req, { userId: uid, durum: { $nin: ['Silindi', 'Satıldı', 'Öldü'] }, aktif: { $ne: false } });
    const aktifFilterDuve = addTenant(req, { userId: uid, aktif: { $ne: false } });
    const aktifFilterBuzagi = addTenant(req, { userId: uid, durum: { $nin: ['Silindi', 'Satıldı', 'Öldü'] }, aktif: { $ne: false } });
    const aktifFilterTosun = addTenant(req, { userId: uid, durum: { $nin: ['Silindi', 'Satıldı', 'Öldü'] }, aktif: { $ne: false } });
    const toplamInek = await Inek.countDocuments(aktifFilterInek);
    const toplamDuve = await Duve.countDocuments(aktifFilterDuve);
    const toplamBuzagi = await Buzagi.countDocuments(aktifFilterBuzagi);
    const toplamTosun = await Tosun.countDocuments(aktifFilterTosun);

    // Gebe hayvanlar (aktif olanlar)
    const gebeInek = await Inek.countDocuments({ ...aktifFilterInek, gebelikDurumu: 'Gebe' });
    const gebeDuve = await Duve.countDocuments({ ...aktifFilterDuve, gebelikDurumu: 'Gebe' });

    // Sağmal inekler: Süt veren inekler (kuru dönemdekiler hariç)
    const sagmalInek = await Inek.countDocuments({
      ...aktifFilterInek,
      durum: 'Aktif'
    });

    // Bugünün süt verimi
    const bugunStr = new Date().toLocaleDateString('en-CA');

    const bugunSut = await SutKaydi.aggregate([
      {
        $match: addTenant(req, {
          userId: new mongoose.Types.ObjectId(req.userId),
          tarih: bugunStr
        }),
      },
      {
        $group: {
          _id: null,
          toplam: { $sum: '$litre' }
        }
      }
    ]);

    // Yaklaşan doğumlar (30 gün içinde) — aktif hayvanlar
    const gebeler = await Promise.all([
      Inek.find({ ...aktifFilterInek, gebelikDurumu: 'Gebe' }).select('tohumlamaTarihi isim kupeNo'),
      Duve.find({ ...aktifFilterDuve, gebelikDurumu: 'Gebe' }).select('tohumlamaTarihi isim kupeNo')
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
      trendler: await calculateTrends(uid, req)
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
        $match: addTenant(req, {
          userId: new mongoose.Types.ObjectId(req.userId),
          tarih: { $gte: baslangicStr }
        }),
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
const { gunlukIlacDusumunuUygula } = require('../jobs/gunlukIlacDusum');
const { devamEdenGercekTedaviQuery } = require('../utils/gercekTedaviFiltre');

// Bugünün yapılacakları (bildirimler + devam eden tedaviler)
router.get('/yapilacaklar', auth, async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.userId);

    // 1. OTOMATİK GÖREV OLUŞTURMA (hem burada hem cron'da çalışır)
    await otomatikGorevleriKontrolEt(uid);

    // 2. Günlük ilaç stok düşümü (devam eden tedavilerde gunlukMiktar > 0)
    try {
      await gunlukIlacDusumunuUygula(uid);
    } catch (e) {
      console.error('[yapilacaklar] Gunluk ilac dusum hatasi:', e.message);
    }

    // Bugünün bildirimleri
    const bugununkiler = await Bildirim.bugununkiler(uid);

    // Gecikmiş bildirimler
    const gecikmisler = await Bildirim.gecikmisler(uid);

    // Yaklaşan bildirimler (7 gün)
    const yaklaşanlar = await Bildirim.yaklaşanlar(uid, 7);

    // Devam eden tedaviler (suni tohumlama / rutin tohumlama tipi hariç)
    const devamEdenTedaviler = await SaglikKaydi.find(devamEdenGercekTedaviQuery({ userId: uid }))
      .select('_id tani hayvanIsim hayvanKupeNo hayvanId hayvanTipi ilaclar tarih')
      .sort({ tarih: -1 })
      .lean();

    const devamEdenGorevler = devamEdenTedaviler.map(k => ({
      _id: k._id,
      _kaynak: 'saglik',
      tip: 'saglik_tedavi',
      baslik: `💊 ${k.tani} — ${k.hayvanIsim || k.hayvanKupeNo || 'Hayvan'}`,
      mesaj: (k.ilaclar || []).map(i => i.ilacAdi).filter(Boolean).join(', '),
      hayvanId: k.hayvanId,
      hayvanTipi: k.hayvanTipi,
      kupe_no: k.hayvanKupeNo,
      metadata: { saglikKaydiId: k._id.toString() }
    }));

    res.json({
      bugun: bugununkiler,
      geciken: gecikmisler,
      yaklaşan: yaklaşanlar,
      devamEdenTedaviler: devamEdenGorevler
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
        $match: addTenant(req, {
          userId: uid,
          tarih: { $gte: baslangicStr },
          inekId: { $regex: /^[a-f0-9]{24}$/i }
        }),
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
          gunler: { $addToSet: '$tarih' }
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
          gunSayisi: { $size: '$gunler' },
          ortalama: { $divide: ['$toplamSut', { $max: [{ $size: '$gunler' }, 1] }] }
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

    // Son eklenen hayvanlar (aktif olanlar)
    const sonInekler = await Inek.find(addTenant(req, { userId: uid, durum: { $nin: ['Silindi', 'Satıldı', 'Öldü'] }, aktif: { $ne: false } })).sort({ createdAt: -1 }).limit(5).lean();
    const sonDuveler = await Duve.find(addTenant(req, { userId: uid, aktif: { $ne: false } })).sort({ createdAt: -1 }).limit(5).lean();
    const sonBuzagilar = await Buzagi.find(addTenant(req, { userId: uid, durum: { $nin: ['Silindi', 'Satıldı', 'Öldü'] }, aktif: { $ne: false } })).sort({ createdAt: -1 }).limit(5).lean();

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

      // Aktif tedaviler (suni tohumlama hariç)
      aktifTedaviler = await SaglikKaydi.find(devamEdenGercekTedaviQuery({ userId: uid }))
        .sort({ tarih: -1 }).limit(5).lean();

      // Yaklaşan kontroller (7 gün içi, suni tohumlama hariç)
      const yediGunSonra = new Date();
      yediGunSonra.setDate(yediGunSonra.getDate() + 7);
      yaklasanKontroller = await SaglikKaydi.find({
        ...devamEdenGercekTedaviQuery({ userId: uid }),
        sonrakiKontrol: { $lte: yediGunSonra, $gte: new Date() },
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

    const gun = parseInt(req.query.gun) || 30;
    const bugun = new Date();
    const ayBaslangic = new Date(bugun);
    ayBaslangic.setDate(ayBaslangic.getDate() - gun);
    const oncekiDonemBas = new Date(bugun);
    oncekiDonemBas.setDate(bugun.getDate() - gun * 2);
    const oncekiDonemBit = new Date(bugun);
    oncekiDonemBit.setDate(bugun.getDate() - gun - 1);
    const ayBitis = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate(), 23, 59, 59);

    const ayBasStr = ayBaslangic.toISOString().slice(0, 10);
    const ayBitStr = bugun.toISOString().slice(0, 10);
    const oncekiBasStr = oncekiDonemBas.toISOString().slice(0, 10);
    const oncekiBitStr = oncekiDonemBit.toISOString().slice(0, 10);

    // Toplam hayvan sayısı (inek, düve, buzağı, tosun)
    const [inekSayisi, duveSayisi, buzagiSayisi, tosunSayisi] = await Promise.all([
      Inek.countDocuments(addTenant(req, { userId: uid, durum: 'Aktif' })),
      Duve.countDocuments(addTenant(req, { userId: uid })),
      Buzagi.countDocuments(addTenant(req, { userId: uid, durum: 'Aktif' })),
      Tosun.countDocuments(addTenant(req, { userId: uid, durum: 'Aktif' }))
    ]);
    const toplamHayvan = inekSayisi + duveSayisi + buzagiSayisi + tosunSayisi;

    // Dönem finansal giderleri
    const giderler = await Finansal.aggregate([
      { $match: { userId: uid, tip: 'gider', tarih: { $gte: ayBasStr, $lte: ayBitStr } } },
      { $group: { _id: '$kategori', toplam: { $sum: '$miktar' } } }
    ]);

    // Dönem geliri
    const gelirler = await Finansal.aggregate([
      { $match: { userId: uid, tip: 'gelir', tarih: { $gte: ayBasStr, $lte: ayBitStr } } },
      { $group: { _id: '$kategori', toplam: { $sum: '$miktar' } } }
    ]);

    const toplamGider = giderler.reduce((s, g) => s + g.toplam, 0);
    const toplamGelir = gelirler.reduce((s, g) => s + g.toplam, 0);

    // Buzağılama gelirleri (piyasa değeri)
    const buzagilamaGeliri = await AlisSatis.aggregate([
      {
        $match: {
          userId: uid,
          tip: 'buzagilama',
          tarih: { $gte: new Date(ayBasStr) }
        }
      },
      { $group: { _id: null, toplam: { $sum: '$buzagiDegeri' }, count: { $sum: 1 } } }
    ]);
    const toplamBuzagiGeliri = buzagilamaGeliri[0]?.toplam || 0;

    // Ölüm kayıpları (piyasa değeri)
    const olumKayiplari = await AlisSatis.aggregate([
      {
        $match: {
          userId: uid,
          tip: 'olum',
          tarih: { $gte: new Date(ayBasStr) }
        }
      },
      { $group: { _id: null, toplam: { $sum: '$fiyat' } } }
    ]);
    const toplamOlumKaybi = olumKayiplari[0]?.toplam || 0;

    const netKar = toplamGelir - toplamGider;
    const basBasinaMaliyet = inekSayisi > 0 ? toplamGider / inekSayisi : 0;
    const basBasinaGelir = inekSayisi > 0 ? toplamGelir / inekSayisi : 0;

    // Yem ve sağlık giderleri (kategori bazlı)
    const yemGiderleri = giderler.filter(g => ['yem', 'Yem', 'yem_alim', 'yem_deposu'].includes(g._id));
    const saglikGiderleri = giderler.filter(g => ['veteriner', 'ilac', 'İlaç', 'Veteriner', 'saglik'].includes(g._id));
    const toplamYemMaliyet = yemGiderleri.reduce((s, g) => s + g.toplam, 0);
    const toplamSaglikMaliyet = saglikGiderleri.reduce((s, g) => s + g.toplam, 0);
    const hayvanBasinaYem = toplamHayvan > 0 ? toplamYemMaliyet / toplamHayvan : 0;
    const hayvanBasinaSaglik = toplamHayvan > 0 ? toplamSaglikMaliyet / toplamHayvan : 0;
    const hayvanBasinaToplamGider = toplamHayvan > 0 ? toplamGider / toplamHayvan : 0;
    const hayvanBasinaGelir = toplamHayvan > 0 ? toplamGelir / toplamHayvan : 0;
    const hayvanBasinaKar = hayvanBasinaGelir - hayvanBasinaToplamGider;

    // Dönem toplam süt
    const sutKayitlari = await SutKaydi.aggregate([
      { $match: addTenant(req, { userId: uid, tarih: { $gte: ayBasStr, $lte: ayBitStr } }) },
      { $group: { _id: null, toplam: { $sum: '$litre' } } }
    ]);
    const toplamSut = sutKayitlari[0]?.toplam || 0;

    // Önceki dönem kar karşılaştırması (gun bazlı)
    const oncekiGider = await Finansal.aggregate([
      { $match: { userId: uid, tip: 'gider', tarih: { $gte: oncekiBasStr, $lte: oncekiBitStr } } },
      { $group: { _id: null, toplam: { $sum: '$miktar' } } }
    ]);
    const oncekiGelir = await Finansal.aggregate([
      { $match: { userId: uid, tip: 'gelir', tarih: { $gte: oncekiBasStr, $lte: oncekiBitStr } } },
      { $group: { _id: null, toplam: { $sum: '$miktar' } } }
    ]);
    const oncekiNetKar = (oncekiGelir[0]?.toplam || 0) - (oncekiGider[0]?.toplam || 0);
    const karDegisim = oncekiNetKar !== 0 ? (((netKar - oncekiNetKar) / Math.abs(oncekiNetKar)) * 100).toFixed(1) : 0;

    // En iyi performanslı inekler (süt veriminden karlılık tahmini)
    const topInekler = await SutKaydi.aggregate([
      { $match: addTenant(req, { userId: uid, tarih: { $gte: ayBasStr, $lte: ayBitStr } }) },
      { $addFields: { inekObjId: { $convert: { input: '$inekId', to: 'objectId', onError: null, onNull: null } } } },
      { $match: { inekObjId: { $ne: null } } },
      { $group: { _id: '$inekObjId', toplamSut: { $sum: '$litre' }, gunSayisi: { $sum: 1 } } },
      { $lookup: { from: 'ineks', localField: '_id', foreignField: '_id', as: 'inek' } },
      { $unwind: { path: '$inek', preserveNullAndEmptyArrays: true } },
      { $project: { isim: '$inek.isim', kupeNo: '$inek.kupeNo', durum: '$inek.durum', toplamSut: 1, ortalama: { $divide: ['$toplamSut', { $max: ['$gunSayisi', 1] }] } } },
      { $sort: { ortalama: -1 } },
      { $limit: 5 }
    ]);

    // İnek bazlı karlılık (tüm inekler)
    const YemHareket = require('../models/YemHareket');

    const saglikMasraflari = await Finansal.aggregate([
      {
        $match: {
          userId: uid,
          tip: 'gider',
          kategori: { $in: ['veteriner', 'ilac'] },
          tarih: { $gte: ayBasStr },
          ilgiliHayvanId: { $exists: true, $ne: null, $ne: '' }
        }
      },
      { $group: { _id: '$ilgiliHayvanId', toplam: { $sum: '$miktar' } } }
    ]);
    const saglikMap = {};
    saglikMasraflari.forEach(s => { if (s._id) saglikMap[s._id.toString()] = s.toplam; });

    const sutFiyati = toplamSut > 0 ? toplamGelir / toplamSut : 0;
    const yemPayiBasina = inekSayisi > 0 ? toplamYemMaliyet / inekSayisi : 0;

    const tumIneklerSut = await SutKaydi.aggregate([
      { $match: addTenant(req, { userId: uid, tarih: { $gte: ayBasStr, $lte: ayBitStr } }) },
      { $addFields: { inekObjId: { $convert: { input: '$inekId', to: 'objectId', onError: null, onNull: null } } } },
      { $match: { inekObjId: { $ne: null } } },
      { $group: { _id: '$inekObjId', toplamSut: { $sum: '$litre' }, gunSayisi: { $sum: 1 } } },
      { $lookup: { from: 'ineks', localField: '_id', foreignField: '_id', as: 'inek' } },
      { $unwind: { path: '$inek', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, isim: '$inek.isim', kupeNo: '$inek.kupeNo', durum: '$inek.durum', toplamSut: 1 } }
    ]);

    const inekKarliligi = tumIneklerSut.map(inek => {
      const inekIdStr = inek._id?.toString();
      const saglikMasrafi = saglikMap[inekIdStr] || 0;
      const sutGeliri = (inek.toplamSut || 0) * sutFiyati;
      const toplamMasraf = yemPayiBasina + saglikMasrafi;
      const netKar = sutGeliri - toplamMasraf;
      const litreBasinaMaliyet = inek.toplamSut > 0 ? toplamMasraf / inek.toplamSut : 0;

      return {
        _id: inek._id,
        isim: inek.isim,
        kupeNo: inek.kupeNo,
        durum: inek.durum || 'Aktif',
        toplamSut: inek.toplamSut,
        saglikMasrafi,
        sutGeliri: +sutGeliri.toFixed(2),
        yemPayi: +yemPayiBasina.toFixed(2),
        netKar: +netKar.toFixed(2),
        litreBasinaMaliyet: +litreBasinaMaliyet.toFixed(2)
      };
    }).sort((a, b) => b.netKar - a.netKar);

    // FCR ve Lt başına maliyet (dönem)
    const ayBitisDate = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate(), 23, 59, 59);
    let fcrDegeri = 0;
    let litreBasinaMaliyetDegeri = 0;
    if (toplamSut > 0) {
      const yemKgSonuc = await YemHareket.aggregate([
        { $match: { userId: uid, hareketTipi: 'Tüketim', tarih: { $gte: ayBaslangic, $lte: ayBitisDate } } },
        { $group: { _id: null, toplamKg: { $sum: '$miktar' } } }
      ]);
      const yemKg = yemKgSonuc[0]?.toplamKg || 0;
      fcrDegeri = +(yemKg / toplamSut).toFixed(2);
      litreBasinaMaliyetDegeri = +(toplamGider / toplamSut).toFixed(2);
    }

    // Son 6 ay aylık trend
    const altıAyOnce = new Date(bugun.getFullYear(), bugun.getMonth() - 5, 1);
    const aylikTrend = await Finansal.aggregate([
      { $match: { userId: uid, tarih: { $gte: altıAyOnce.toISOString().slice(0, 10) } } },
      { $addFields: { ay: { $substr: [ { $toString: '$tarih' }, 0, 7 ] } } },
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
      ozet: {
        toplamGelir, toplamGider, netKar, basBasinaMaliyet, basBasinaGelir,
        inekSayisi, toplamSut, karDegisim,
        fcr: fcrDegeri,
        litreBasinaMaliyet: litreBasinaMaliyetDegeri,
        toplamHayvan,
        hayvanBasinaYem: +hayvanBasinaYem.toFixed(2),
        hayvanBasinaSaglik: +hayvanBasinaSaglik.toFixed(2),
        hayvanBasinaToplamGider: +hayvanBasinaToplamGider.toFixed(2),
        hayvanBasinaGelir: +hayvanBasinaGelir.toFixed(2),
        hayvanBasinaKar: +hayvanBasinaKar.toFixed(2),
        toplamYemMaliyet: +toplamYemMaliyet.toFixed(2),
        toplamSaglikMaliyet: +toplamSaglikMaliyet.toFixed(2),
        yemGiderOrani: toplamGider > 0 ? +((toplamYemMaliyet / toplamGider) * 100).toFixed(1) : 0,
        toplamBuzagiGeliri: +toplamBuzagiGeliri.toFixed(2),
        toplamOlumKaybi: +toplamOlumKaybi.toFixed(2),
        buzagiSayisi: buzagilamaGeliri[0]?.count || 0,
      },
      inekKarliligi,
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

// Sağlık skoru (0-100)
router.get('/saglik-skoru', auth, async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.userId);
    const bugun = new Date();
    const otuzGunOnce = new Date(bugun - 30 * 86400000);

    const AsiTakvimi = require('../models/AsiTakvimi');

    const [toplamInek, aktifTedavi, gecikmisAsi, olumler, yasak] = await Promise.all([
      Inek.countDocuments(addTenant(req, { userId: uid, durum: 'Aktif' })),
      SaglikKaydi.countDocuments(devamEdenGercekTedaviQuery({ userId: uid })),
      AsiTakvimi.countDocuments({
        userId: uid,
        sonrakiTarih: { $lt: bugun },
        durum: 'bekliyor'
      }),
      SaglikKaydi.countDocuments({
        userId: uid,
        durum: 'oldu',
        tarih: { $gte: otuzGunOnce }
      }),
      SaglikKaydi.countDocuments({
        userId: uid,
        sutYasakAktif: true,
        sutYasakBitis: { $gte: bugun }
      })
    ]);

    if (toplamInek === 0) return res.json({ skor: 100, detay: {} });

    let skor = 100;
    const aktifTedaviKesinti = Math.min(30, (aktifTedavi / toplamInek) * 30);
    const asiKesinti = Math.min(20, gecikmisAsi * 3);
    const olumKesinti = Math.min(30, olumler * 10);
    const yasakKesinti = Math.min(10, yasak * 5);

    skor -= aktifTedaviKesinti + asiKesinti + olumKesinti + yasakKesinti;

    res.json({
      skor: Math.max(0, Math.round(skor)),
      detay: {
        toplamInek,
        aktifTedavi,
        gecikmisAsi,
        olumler,
        sutYasakAktif: yasak
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Skor hesaplanamadı' });
  }
});

// Bugün aktif süt yasağı olan hayvanlar
router.get('/sut-yasak', auth, async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.userId);
    const bugun = new Date();

    const yasaklar = await SaglikKaydi.find({
      userId: uid,
      sutYasakAktif: true,
      sutYasakBitis: { $gte: bugun }
    })
      .select('hayvanIsim hayvanKupeNo hayvanTipi sutYasakBitis ilaclar')
      .sort({ sutYasakBitis: 1 })
      .lean();

    const sonuc = yasaklar.map(k => {
      const kalanGun = Math.ceil(
        (new Date(k.sutYasakBitis) - bugun) / (1000 * 60 * 60 * 24)
      );
      return {
        hayvanIsim: k.hayvanIsim,
        hayvanKupeNo: k.hayvanKupeNo,
        hayvanTipi: k.hayvanTipi,
        sutYasakBitis: k.sutYasakBitis,
        kalanGun,
        ilaclar: (k.ilaclar || []).map(i => i.ilacAdi).filter(Boolean).join(', ')
      };
    });

    res.json(sonuc);
  } catch (err) {
    res.status(500).json({ message: 'Süt yasak listesi alınamadı' });
  }
});

// YARDIMCI: Trend Hesaplama
async function calculateTrends(uid, req) {
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
        $match: addTenant(req, {
          userId: uid,
          tarih: { $gte: format(prev30Start) }
        }),
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

// FCR ve litre başına maliyet
router.get('/fcr', auth, async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.userId);
    const gun = parseInt(req.query.gun) || 7;

    const baslangic = new Date();
    baslangic.setDate(baslangic.getDate() - gun);
    baslangic.setHours(0, 0, 0, 0);
    const baslangicStr = baslangic.toISOString().split('T')[0];

    const YemHareket = require('../models/YemHareket');

    const sutSonuc = await SutKaydi.aggregate([
      { $match: addTenant(req, { userId: uid, tarih: { $gte: baslangicStr } }) },
      { $group: { _id: null, toplamLitre: { $sum: '$litre' } } }
    ]);
    const toplamLitre = sutSonuc[0]?.toplamLitre || 0;

    const yemMaliyetSonuc = await YemHareket.aggregate([
      {
        $match: {
          userId: uid,
          hareketTipi: 'Tüketim',
          tarih: { $gte: baslangic }
        }
      },
      { $group: { _id: null, toplamMaliyet: { $sum: '$toplamTutar' } } }
    ]);
    const toplamYemMaliyet = yemMaliyetSonuc[0]?.toplamMaliyet || 0;

    const yemKgSonuc = await YemHareket.aggregate([
      {
        $match: {
          userId: uid,
          hareketTipi: 'Tüketim',
          tarih: { $gte: baslangic }
        }
      },
      { $group: { _id: null, toplamKg: { $sum: '$miktar' } } }
    ]);
    const yemKg = yemKgSonuc[0]?.toplamKg || 0;

    const fcr = toplamLitre > 0 ? +(yemKg / toplamLitre).toFixed(2) : 0;
    const litreBasinaMaliyet = toplamLitre > 0
      ? +(toplamYemMaliyet / toplamLitre).toFixed(2)
      : 0;

    res.json({
      gun,
      toplamLitre: +toplamLitre.toFixed(1),
      toplamYemKg: +yemKg.toFixed(1),
      toplamYemMaliyet: +toplamYemMaliyet.toFixed(2),
      fcr,
      litreBasinaMaliyet
    });
  } catch (err) {
    console.error('FCR error:', err);
    res.status(500).json({ message: 'FCR hesaplanamadı', detail: err.message });
  }
});

module.exports = router;
