const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const planCheck = require('../middleware/planCheck');
const Inek = require('../models/Inek');
const Duve = require('../models/Duve');  // ← EKLE
const Buzagi = require('../models/Buzagi');
const Timeline = require('../models/Timeline');

// TÜM İNEKLERİ GETİR
router.get('/', auth, async (req, res) => {
  try {
    const query = { userId: req.userId };
    if (req.tenantId) {
      query.tenantId = req.tenantId;
    }

    const inekler = await Inek.find(query).sort({ createdAt: -1 });
    res.json(inekler);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// YAKLAŞAN DOĞUMLAR (30 GÜN İÇİNDE) - İNEK + DÜVE
router.get('/yaklasan-dogumlar', auth, async (req, res) => {
  try {
    const inekler = await Inek.find({ userId: req.userId });
    const duveler = await Duve.find({ userId: req.userId });

    const bugun = new Date();
    const yaklasanlar = [];

    // İNEKLER
    for (const inek of inekler) {
      if (inek.tohumlamaTarihi && inek.gebelikDurumu === 'Gebe') {
        const tohumlamaTarihi = new Date(inek.tohumlamaTarihi);
        const tahminiDoğum = new Date(tohumlamaTarihi);
        tahminiDoğum.setDate(tahminiDoğum.getDate() + 283);

        const kalanGun = Math.ceil((tahminiDoğum - bugun) / (1000 * 60 * 60 * 24));

        if (kalanGun >= 0 && kalanGun <= 30) {
          yaklasanlar.push({
            hayvan: inek,
            hayvanTipi: 'inek',
            tahminiDoğum,
            kalanGun
          });
        }
      }
    }

    // DÜVELER
    for (const duve of duveler) {
      if (duve.tohumlamaTarihi && duve.gebelikDurumu === 'Gebe') {
        const tohumlamaTarihi = new Date(duve.tohumlamaTarihi);
        const tahminiDoğum = new Date(tohumlamaTarihi);
        tahminiDoğum.setDate(tahminiDoğum.getDate() + 283);

        const kalanGun = Math.ceil((tahminiDoğum - bugun) / (1000 * 60 * 60 * 24));

        if (kalanGun >= 0 && kalanGun <= 30) {
          yaklasanlar.push({
            hayvan: duve,
            hayvanTipi: 'duve',
            tahminiDoğum,
            kalanGun
          });
        }
      }
    }

    // Tarihe göre sırala (en yakın önce)
    yaklasanlar.sort((a, b) => a.kalanGun - b.kalanGun);

    res.json(yaklasanlar);
  } catch (error) {
    console.error('Yaklaşan doğumlar hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yaş hesapla (dogumTarihi'nden)
const yasHesapla = (dogumTarihi) => {
  if (!dogumTarihi) return null;
  const dogum = new Date(dogumTarihi);
  const bugun = new Date();
  return Math.floor((bugun - dogum) / (365.25 * 24 * 60 * 60 * 1000));
};

// YENİ İNEK EKLE
router.post('/', auth, planCheck, async (req, res) => {
  try {
    const { isim, yas, kilo, kupeNo, dogumTarihi, buzagiSayisi, notlar, gebelikDurumu, tohumlamaTarihi } = req.body;

    // Yaş: dogumTarihi varsa hesapla, yoksa body'den al
    const hesaplananYas = dogumTarihi ? yasHesapla(dogumTarihi) : null;
    const finalYas = hesaplananYas !== null ? hesaplananYas : (parseInt(yas, 10) || 0);

    const inek = new Inek({
      userId: req.userId,
      tenantId: req.tenantId || null,
      isim,
      yas: finalYas,
      kilo,
      kupeNo,
      dogumTarihi: dogumTarihi || undefined,
      buzagiSayisi: buzagiSayisi || 0,
      notlar,
      gebelikDurumu: gebelikDurumu || 'Belirsiz',
      tohumlamaTarihi: tohumlamaTarihi || null,
    });

    await inek.save();
    res.status(201).json(inek);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// İNEK GÜNCELLE
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      isim,
      yas,
      kilo,
      kupeNo,
      dogumTarihi,
      buzagiSayisi,
      notlar,
      gebelikDurumu,
      tohumlamaTarihi,
      sonBuzagilamaTarihi,
      kuruDonemiBaslangic,
      laktasyonDonemi
    } = req.body;

    const filter = { _id: req.params.id, userId: req.userId };
    if (req.tenantId) {
      filter.tenantId = req.tenantId;
    }

    const update = {};
    if (isim !== undefined) update.isim = isim;
    if (kilo !== undefined) update.kilo = kilo;
    if (kupeNo !== undefined) update.kupeNo = kupeNo;
    if (dogumTarihi !== undefined) update.dogumTarihi = dogumTarihi;
    if (buzagiSayisi !== undefined) update.buzagiSayisi = buzagiSayisi;
    if (notlar !== undefined) update.notlar = notlar;
    if (gebelikDurumu !== undefined) update.gebelikDurumu = gebelikDurumu;
    if (tohumlamaTarihi !== undefined) update.tohumlamaTarihi = tohumlamaTarihi || null;
    if (sonBuzagilamaTarihi !== undefined) update.sonBuzagilamaTarihi = sonBuzagilamaTarihi;
    if (kuruDonemiBaslangic !== undefined) update.kuruDonemiBaslangic = kuruDonemiBaslangic;
    if (laktasyonDonemi !== undefined) update.laktasyonDonemi = laktasyonDonemi;

    if (dogumTarihi) {
      update.yas = yasHesapla(dogumTarihi);
    } else if (yas !== undefined) {
      update.yas = parseInt(yas, 10);
    }

    const inek = await Inek.findOneAndUpdate(filter, { $set: update }, { new: true });

    if (!inek) {
      return res.status(404).json({ message: 'İnek bulunamadı' });
    }

    res.json(inek);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// İNEK SİL
router.delete('/:id', auth, async (req, res) => {
  try {
    const filter = {
      _id: req.params.id,
      userId: req.userId,
    };
    if (req.tenantId) {
      filter.tenantId = req.tenantId;
    }

    const inek = await Inek.findOneAndDelete(filter);

    if (!inek) {
      return res.status(404).json({ message: 'İnek bulunamadı' });
    }

    res.json({ message: 'İnek silindi', inek });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// İNEK DOĞURDU - Buzağı oluştur ve inek bilgilerini güncelle
router.post('/:id/dogurdu', auth, async (req, res) => {
  try {
    const { dogumTarihi, buzagiIsim, buzagiCinsiyet, buzagiKilo, notlar, buzagiDurum, tahminiZarar } = req.body;
    const olum = buzagiDurum === 'Öldü';

    const inekFilter = { _id: req.params.id, userId: req.userId };
    if (req.tenantId) {
      inekFilter.tenantId = req.tenantId;
    }

    const inek = await Inek.findOne(inekFilter);
    if (!inek) {
      return res.status(404).json({ message: 'İnek bulunamadı' });
    }

    // Validasyon
    if (!dogumTarihi) {
      return res.status(400).json({ message: 'Doğum tarihi zorunludur' });
    }
    if (!olum && (!buzagiIsim || !buzagiCinsiyet || buzagiKilo === undefined)) {
      return res.status(400).json({ message: 'Buzağı bilgileri eksik' });
    }

    const isim = olum ? 'Ölü Buzağı' : buzagiIsim;
    const cinsiyet = olum ? 'disi' : buzagiCinsiyet;
    const kilo = olum ? 0 : parseFloat(buzagiKilo);
    const durum = olum ? 'Öldü' : 'Aktif';

    // 1. Buzağı oluştur
    const buzagi = new Buzagi({
      userId: req.userId,
      tenantId: req.tenantId || null,
      isim,
      kupeNo: `BZ-${Date.now()}`,
      anneId: inek._id.toString(),
      anneIsim: inek.isim,
      anneKupeNo: inek.kupeNo,
      dogumTarihi: dogumTarihi,
      cinsiyet,
      kilo,
      notlar: notlar || (olum ? 'Doğumda öldü' : ''),
      durum,
      eklemeTarihi: new Date().toISOString().split('T')[0]
    });
    await buzagi.save();

    // 2. İnek'i güncelle
    inek.buzagiSayisi = (inek.buzagiSayisi || 0) + 1;
    inek.laktasyonDonemi = (inek.laktasyonDonemi || 0) + 1;
    inek.sonBuzagilamaTarihi = dogumTarihi;
    inek.gebelikDurumu = 'Gebe Değil';
    inek.tohumlamaTarihi = null;
    await inek.save();

    // 3. Gecikme bildirimini tamamlandı işaretle (varsa)
    const Bildirim = require('../models/Bildirim');
    await Bildirim.updateMany(
      { userId: req.userId, tip: 'dogum_gecikme', hayvanId: inek._id, tamamlandi: false },
      { tamamlandi: true, tamamlanmaTarihi: new Date() }
    );

    // 4. Ölüm ise Finansal gider ekle (tahmini zarar)
    if (olum && tahminiZarar && parseFloat(tahminiZarar) > 0) {
      const Finansal = require('../models/Finansal');
      const tarihStr = typeof dogumTarihi === 'string' && dogumTarihi.includes('T')
        ? dogumTarihi.split('T')[0] : (typeof dogumTarihi === 'string' ? dogumTarihi : new Date(dogumTarihi).toISOString().split('T')[0]);
      await Finansal.create({
        userId: req.userId,
        tip: 'gider',
        kategori: 'hayvan-olum',
        miktar: parseFloat(tahminiZarar),
        tarih: tarihStr,
        aciklama: `Buzağı ölümü (doğumda): ${inek.isim} ${inek.kupeNo}`
      });
    }

    // 5. Timeline event'i oluştur
    const aciklama = olum
      ? `${inek.isim} doğum yaptı - Buzağı öldü (${inek.buzagiSayisi}. buzağı)`
      : `${inek.isim} doğum yaptı - ${isim} (${cinsiyet}) (${inek.buzagiSayisi}. buzağı)`;
    await Timeline.create({
      userId: req.userId,
      tenantId: req.tenantId || null,
      hayvanId: inek._id.toString(),
      hayvanTipi: 'inek',
      tip: 'dogum',
      tarih: dogumTarihi,
      aciklama
    });

    res.json({
      message: 'Doğum başarıyla kaydedildi!',
      inek: inek,
      buzagi: buzagi
    });
  } catch (error) {
    console.error('İnek doğum hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// TEK BİR İNEĞİ GETİR (ve son 30 günlük süt verisi)
// TOHUMLAMA EKLE
router.post('/:id/tohumlama', auth, async (req, res) => {
  try {
    const { tohumlamaTarihi } = req.body;
    const inekFilter2 = { _id: req.params.id, userId: req.userId };
    if (req.tenantId) {
      inekFilter2.tenantId = req.tenantId;
    }

    const inek = await Inek.findOne(inekFilter2);

    if (!inek) {
      return res.status(404).json({ message: 'İnek bulunamadı' });
    }

    // İneği güncelle
    inek.tohumlamaTarihi = tohumlamaTarihi;
    inek.gebelikDurumu = 'Belirsiz'; // Yeni tohumlandığı için
    await inek.save();

    // Timeline'a ekle
    const Timeline = require('../models/Timeline');
    await Timeline.create({
      userId: req.userId,
      hayvanId: inek._id.toString(),
      hayvanTipi: 'inek',
      tip: 'tohumlama',
      tarih: tohumlamaTarihi,
      aciklama: `Tohumlama yapıldı. Tarih: ${tohumlamaTarihi}`
    });

    res.json({ message: 'Tohumlama kaydedildi', inek });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// TOHUMLAMA SİL
router.delete('/:id/tohumlama', auth, async (req, res) => {
  try {
    const inek = await Inek.findOne({ _id: req.params.id, userId: req.userId });
    if (!inek) return res.status(404).json({ message: 'İnek bulunamadı' });

    inek.tohumlamaTarihi = null;
    inek.gebelikDurumu = 'Gebe Değil';
    await inek.save();

    // En son eklenen tohumlama timeline kaydını sil
    const lastTimelineFilter = {
      hayvanId: inek._id.toString(),
      tip: 'tohumlama',
    };
    if (req.tenantId) {
      lastTimelineFilter.tenantId = req.tenantId;
    }

    const lastTimeline = await Timeline.findOne(lastTimelineFilter).sort({ createdAt: -1 });
    if (lastTimeline) await lastTimeline.deleteOne();

    res.json({ message: 'Tohumlama kaydı silindi', inek });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const inekFilter3 = { _id: req.params.id, userId: req.userId };
    if (req.tenantId) {
      inekFilter3.tenantId = req.tenantId;
    }

    const inek = await Inek.findOne(inekFilter3);
    if (!inek) {
      return res.status(404).json({ message: 'İnek bulunamadı' });
    }

    // Son 30 günlük süt verisi
    const SutKaydi = require('../models/SutKaydi');
    const otuzGunOnce = new Date();
    otuzGunOnce.setDate(otuzGunOnce.getDate() - 30);
    const tarihStr = otuzGunOnce.toISOString().split('T')[0];

    // İnek detayına süt verisini de ekle
    const sutFilter = {
      userId: req.userId,
      inekId: inek._id,
      tarih: { $gte: tarihStr },
    };
    if (req.tenantId) {
      sutFilter.tenantId = req.tenantId;
    }

    const sutGecmisi = await SutKaydi.find(sutFilter).sort({ tarih: 1 });

    // Mongoose belgesini objeye çevirip süt geçmişini ekliyoruz
    const inekObj = inek.toObject();
    inekObj.sutGecmisi = sutGecmisi;

    res.json(inekObj);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// LAKTASYON EĞRİSİ — Gerçek veri + Wood's formülü tahmini
router.get('/:id/laktasyon', auth, async (req, res) => {
  try {
    const SutKaydi = require('../models/SutKaydi');
    const mongoose = require('mongoose');

    const inekFilter = { _id: req.params.id, userId: req.userId };
    const inek = await Inek.findOne(inekFilter);
    if (!inek) return res.status(404).json({ message: 'İnek bulunamadı' });

    // Laktasyon başlangıcı: son buzağılama tarihi veya tohumlama + 283 gün - 305 gün
    const laktasyonBaslangic = inek.sonBuzagilamaTarihi
      ? new Date(inek.sonBuzagilamaTarihi)
      : inek.tohumlamaTarihi
        ? new Date(new Date(inek.tohumlamaTarihi).getTime() + (283 - 305) * 24 * 60 * 60 * 1000)
        : null;

    // Son 305 gün gerçek veri
    const bugun = new Date();
    const baslangic = new Date(bugun);
    baslangic.setDate(bugun.getDate() - 305);
    const baslangicStr = baslangic.toISOString().split('T')[0];

    const gercekVeri = await SutKaydi.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          inekId: inek._id.toString(),
          tarih: { $gte: baslangicStr }
        }
      },
      { $group: { _id: '$tarih', toplam: { $sum: '$litre' } } },
      { $sort: { _id: 1 } }
    ]);

    // Günlük verilerden laktasyon günü hesapla
    const gercekGunler = gercekVeri.map(v => {
      const tarih = new Date(v._id);
      const gun = laktasyonBaslangic
        ? Math.max(1, Math.ceil((tarih - laktasyonBaslangic) / (1000 * 60 * 60 * 24)))
        : null;
      return { tarih: v._id, litre: v.toplam, gun };
    });

    // Wood's laktasyon formülü tahmini: y = a * t^b * e^(-c*t)
    // Türkiye büyükbaş ortalamaları: a=18, b=0.18, c=0.004
    const a = 18, b = 0.18, c = 0.004;
    const woodTahmini = [];
    for (let t = 1; t <= 305; t++) {
      const tahminiLitre = a * Math.pow(t, b) * Math.exp(-c * t);
      const tarih = laktasyonBaslangic
        ? new Date(laktasyonBaslangic.getTime() + (t - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : null;
      woodTahmini.push({ gun: t, tahminiLitre: Math.max(0, parseFloat(tahminiLitre.toFixed(2))), tarih });
    }

    // Özet istatistikler
    const toplamSut = gercekVeri.reduce((s, v) => s + v.toplam, 0);
    const gunSayisi = gercekVeri.length;
    const ortalamaGunluk = gunSayisi > 0 ? toplamSut / gunSayisi : 0;
    const zirveVeri = gercekVeri.reduce((max, v) => v.toplam > (max?.toplam || 0) ? v : max, null);

    res.json({
      inek: { isim: inek.isim, kupeNo: inek.kupeNo, laktasyonDonemi: inek.laktasyonDonemi, laktasyonBaslangic },
      gercekVeri: gercekGunler,
      woodTahmini,
      ozet: {
        toplamSut: parseFloat(toplamSut.toFixed(1)),
        gunSayisi,
        ortalamaGunluk: parseFloat(ortalamaGunluk.toFixed(2)),
        zirve: zirveVeri ? { litre: zirveVeri.toplam, tarih: zirveVeri._id } : null
      }
    });
  } catch (error) {
    console.error('Laktasyon error:', error);
    res.status(500).json({ message: 'Laktasyon verisi alınamadı' });
  }
});

module.exports = router;