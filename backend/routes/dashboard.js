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

    // Toplam hayvan sayıları
    const toplamInek = await Inek.countDocuments({ userId });
    const toplamDuve = await Duve.countDocuments({ userId });
    const toplamBuzagi = await Buzagi.countDocuments({ userId });
    const toplamTosun = await Tosun.countDocuments({ userId });

    // Gebe hayvanlar (Field adı düzeltmeleri)
    const gebeInek = await Inek.countDocuments({ userId, gebelikDurumu: 'Gebe' });
    const gebeDuve = await Duve.countDocuments({ userId, gebelikDurumu: 'Gebe' });

    // Sağmal inekler (Aktif olanlar sağmal kabul edilir, Kuru Dönemde olanlar hariç)
    const sagmalInek = await Inek.countDocuments({
      userId,
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
      Inek.find({ userId, gebelikDurumu: 'Gebe' }).select('tohumlamaTarihi isim kupeNo'),
      Duve.find({ userId, gebelikDurumu: 'Gebe' }).select('tohumlamaTarihi isim kupeNo')
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
      yaklaşanDogum: yaklaşanDogumSayisi,
      okunmayanBildirim,
      trendler: await calculateTrends(userId)
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Dashboard istatistikleri alınamadı' });
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
    res.status(500).json({ message: 'Süt performansı alınamadı' });
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
    res.status(500).json({ message: 'Finansal özet alınamadı' });
  }
});

// Bugünün yapılacakları (bildirimler)
router.get('/yapilacaklar', auth, async (req, res) => {
  try {
    const userId = req.userId;

    // 1. OTOMATİK GÖREV OLUŞTURMA (Her çağrıldığında kontrol eder)
    await otomatikGorevleriKontrolEt(userId);

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
    res.status(500).json({ message: 'Yapılacaklar alınamadı' });
  }
});

// En iyi süt veren inekler (Son 30 gün ortalaması)
router.get('/top-performers', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const gunSayisi = 30;

    const baslangicTarihi = new Date();
    baslangicTarihi.setDate(baslangicTarihi.getDate() - gunSayisi);
    const baslangicStr = baslangicTarihi.toISOString().split('T')[0];

    const topCows = await SutKaydi.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
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
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 10;

    // Son eklenen hayvanlar
    const sonInekler = await Inek.find({ userId }).sort({ createdAt: -1 }).limit(5).lean();
    const sonDuveler = await Duve.find({ userId }).sort({ createdAt: -1 }).limit(5).lean();
    const sonBuzagilar = await Buzagi.find({ userId }).sort({ createdAt: -1 }).limit(5).lean();

    // Tüm hayvanları birleştir ve tip ekle
    const sonHayvanlar = [
      ...sonInekler.map(h => ({ ...h, tip: 'inek', kupe_no: h.kupeNo || h.kupe_no })),
      ...sonDuveler.map(h => ({ ...h, tip: 'duve', kupe_no: h.kupeNo || h.kupe_no })),
      ...sonBuzagilar.map(h => ({ ...h, tip: 'buzagi', kupe_no: h.kupeNo || h.kupe_no }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    // Son süt kayıtları - ARTIK TOPLU GİRİŞLERDEN ÇEKİYORUZ
    const sonSutler = await TopluSutGirisi.find({ userId })
      .sort({ tarih: -1, createdAt: -1 })
      .limit(3)
      .select('tarih toplamSut sagim createdAt'); // toplamSut ve createdAt önemli

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
    res.status(500).json({ message: 'Aktiviteler alınamadı' });
  }
});

// Sağlık uyarıları
router.get('/saglik-uyarilari', auth, async (req, res) => {
  try {
    const userId = req.userId;

    // Hasta hayvanlar — Not: Mevcut modelde 'hasta' durumu tanımlı değil.
    // İleride 'hasta' enum değeri eklenirse bu sorgu çalışacak.
    const hastalar = [];

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
    res.status(500).json({ message: 'Sağlık uyarıları alınamadı' });
  }
});

// YARDIMCI FONSİYON: Otomatik Görev Kontrolü
async function otomatikGorevleriKontrolEt(userId) {
  try {
    const bugun = new Date();
    const yediGunSonra = new Date();
    yediGunSonra.setDate(bugun.getDate() + 7);

    // 1. DOĞUM KONTROLÜ (7 gün kalanlar)
    const gebeler = await Promise.all([
      Inek.find({ userId, gebelikDurumu: 'Gebe' }),
      Duve.find({ userId, gebelikDurumu: 'Gebe' })
    ]);

    const tumGebeler = [...gebeler[0], ...gebeler[1]];

    for (const hayvan of tumGebeler) {
      if (!hayvan.tohumlamaTarihi) continue;

      const tohumlama = new Date(hayvan.tohumlamaTarihi);
      const dogum = new Date(tohumlama);
      dogum.setDate(dogum.getDate() + 283); // Tahmini doğum

      // Eğer doğum yaklaştıysa (0-7 gün kaldıysa)
      if (dogum >= bugun && dogum <= yediGunSonra) {
        // Zaten bildirim var mı? (Tamamlanmış olsa bile tekrar oluşturma - Bu gebelik için)
        // Bildirim oluşturulma tarihi tohumlamadan sonra olmalı
        const varMi = await Bildirim.findOne({
          userId,
          tip: 'dogum',
          hayvanId: hayvan._id,
          createdAt: { $gte: tohumlama } // Tohumlamadan sonra oluşturulmuş bir bildirim var mı?
        });

        if (!varMi) {
          const kalanGun = Math.ceil((dogum - bugun) / (1000 * 60 * 60 * 24));
          const hayvanTipi = hayvan instanceof Inek ? 'inek' : 'duve';

          await Bildirim.create({
            userId,
            tip: 'dogum',
            baslik: `Doğum Yaklaşıyor: ${hayvan.isim || hayvan.kupeNo}`,
            mesaj: `Tahmini doğuma ${kalanGun} gün kaldı. Hazırlıkları kontrol et.`,
            hayvanId: hayvan._id,
            hayvanTipi,
            kupe_no: hayvan.kupeNo,
            oncelik: 'yuksek',
            hatirlatmaTarihi: bugun
          });
        }
      }
    }

    // 2. KURU DÖNEM KONTROLÜ (Doğuma 60 gün kala)
    // Tohumlama + 223 gün = Kuruya ayırma zamanı (283 - 60)
    for (const hayvan of tumGebeler) {
      if (!hayvan.tohumlamaTarihi) continue;

      const tohumlama = new Date(hayvan.tohumlamaTarihi);
      const kuruTarihi = new Date(tohumlama);
      kuruTarihi.setDate(kuruTarihi.getDate() + 223);

      // Kuruya ayrılma zamanı geldi mi? (bugün ile +7 gün arası)
      if (kuruTarihi >= bugun && kuruTarihi <= yediGunSonra) {
        // Zaten bildirim var mı? (Bu gebelik için)
        const varMi = await Bildirim.findOne({
          userId,
          tip: 'kuru_donem',
          hayvanId: hayvan._id,
          createdAt: { $gte: tohumlama }
        });

        if (!varMi) {
          const kalanGun = Math.ceil((kuruTarihi - bugun) / (1000 * 60 * 60 * 24));
          const hayvanTipi = hayvan instanceof Inek ? 'inek' : 'duve';

          await Bildirim.create({
            userId,
            tip: 'kuru_donem',
            baslik: `Kuruya Ayırma: ${hayvan.isim || hayvan.kupeNo}`,
            mesaj: `Doğuma 60 gün kaldı. Hayvanı kuruya ayırma vakti geldi (${kalanGun} gün).`,
            hayvanId: hayvan._id,
            hayvanTipi,
            kupe_no: hayvan.kupeNo,
            oncelik: 'yuksek',
            hatirlatmaTarihi: bugun
          });
        }
      }
    }

    // 3. SÜTTEN KESME KONTROLÜ (2.5 - 3 ay arası buzağılar)
    const buzagilar = await Buzagi.find({
      userId,
      cinsiyet: { $exists: true } // Hepsi
    });

    for (const buzagi of buzagilar) {
      if (buzagi.dogumTarihi) {
        const dogum = new Date(buzagi.dogumTarihi);
        const gunFarki = Math.floor((bugun - dogum) / (1000 * 60 * 60 * 24));

        // 75-90 gün arası (2.5 - 3 ay) ve henüz sütten kesilmemişse
        // Not: Buzagi modelinde 'durum' veya 'suttenKesildi' alanı varsa kontrol edilmeli.
        // Şimdilik sadece gününe bakıyoruz ve bildirim yoksa ekliyoruz.
        if (gunFarki >= 75 && gunFarki <= 95) {
          const varMi = await Bildirim.findOne({
            userId,
            // tip: 'diger', // İptal, tip ile değil ID ile bakacağız
            hayvanId: buzagi._id,
            baslik: { $regex: 'Sütten Kesme' }
            // Tamamlanmış olsa bile tekrar sorma
          });

          if (!varMi) {
            await Bildirim.create({
              userId,
              tip: 'diger',
              baslik: `Sütten Kesme: ${buzagi.kupeNo}`,
              mesaj: `Buzağı ${Math.floor(gunFarki / 30)} aylık oldu. Sütten kesmeyi planla.`,
              hayvanId: buzagi._id,
              hayvanTipi: 'buzagi',
              kupe_no: buzagi.kupeNo,
              oncelik: 'normal',
              hatirlatmaTarihi: bugun
            });
          }
        }
      }
    }

  } catch (err) {
    console.error('Otomatik görev hatası:', err);
  }
}

// YARDIMCI: Trend Hesaplama (Son 30 gün vs Önceki 30 gün)
async function calculateTrends(userId) {
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
          userId: new mongoose.Types.ObjectId(userId),
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
