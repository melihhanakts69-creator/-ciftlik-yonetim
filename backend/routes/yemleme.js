const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const mongoose = require('mongoose');
const Grup = require('../models/Grup');
const Rasyon = require('../models/Rasyon');
const Inek = require('../models/Inek');
const Duve = require('../models/Duve');
const Buzagi = require('../models/Buzagi');
const Tosun = require('../models/Tosun');
const YemlemeSafari = require('../models/YemlemeSafari');
const YemKutuphanesi = require('../models/YemKutuphanesi');
const YemStok = require('../models/YemStok');
const Stok = require('../models/Stok');
const YemHareket = require('../models/YemHareket');
const Finansal = require('../models/Finansal');
const Bildirim = require('../models/Bildirim');

// Grup baş sayısı (canlı sorgu)
async function getGrupBasCount(userId, grupId) {
  const uid = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
  const gid = mongoose.Types.ObjectId.isValid(grupId) ? new mongoose.Types.ObjectId(grupId) : grupId;
  const [inek, duve, buzagi, tosun] = await Promise.all([
    Inek.countDocuments({ userId: uid, grupId: gid, durum: 'Aktif' }),
    Duve.countDocuments({ userId: uid, grupId: gid }),
    Buzagi.countDocuments({ userId: uid, grupId: gid, durum: 'Aktif' }),
    Tosun.countDocuments({ userId: uid, grupId: gid, durum: 'Aktif' })
  ]);
  return inek + duve + buzagi + tosun;
}

// Yem stoktan düş (YemStok veya Stok)
async function stoktanDus(userId, yemId, miktar, yemAdi) {
  const yem = await YemKutuphanesi.findById(yemId);
  if (!yem) return { ok: false, msg: `Yem bulunamadı: ${yemId}` };

  let stok = null;
  if (yem.yemStokId) {
    stok = await YemStok.findById(yem.yemStokId);
  }
  if (!stok) {
    stok = await YemStok.findOne({ userId, yemTipi: yem.ad });
  }
  if (!stok) {
    const stokYem = await Stok.findOne({ userId, kategori: 'Yem', yemKutuphanesiId: yemId });
    if (stokYem) {
      const mevcut = Number(stokYem.miktar) || 0;
      if (mevcut < miktar) return { ok: false, msg: `Yetersiz stok: ${yem.ad} — Mevcut: ${mevcut} kg, Gerekli: ${miktar} kg` };
      stokYem.miktar = mevcut - miktar;
      await stokYem.save();
      return { ok: true, birimFiyat: yem.birimFiyat || 0 };
    }
    return { ok: false, msg: `Stok kaydı bulunamadı: "${yem.ad}"` };
  }

  const mevcut = Number(stok.miktar) || 0;
  if (mevcut < miktar) return { ok: false, msg: `Yetersiz stok: ${stok.yemTipi} — Mevcut: ${mevcut} kg, Gerekli: ${miktar} kg` };
  stok.miktar = mevcut - miktar;
  await stok.save();
  return { ok: true, birimFiyat: stok.birimFiyat || yem.birimFiyat || 0 };
}

// Bugün yemleme özeti — gruplar, yapılmış mı, planlanan
router.get('/bugun', auth, checkRole(['ciftci', 'sutcu']), async (req, res) => {
  try {
    const userId = req.userId;
    const bugun = new Date().toISOString().split('T')[0];

    const gruplar = await Grup.find({ userId, aktif: true })
      .populate('rasyonId')
      .sort({ ad: 1 });

    const yapilanlar = await YemlemeSafari.find({ userId, tarih: bugun }).lean();
    const yapilanGrupIds = new Set(yapilanlar.map(y => y.grupId.toString()));

    const sonuc = [];
    for (const grup of gruplar) {
      const basCount = await getGrupBasCount(userId, grup._id);
      if (basCount === 0) continue;

      const rasyon = grup.rasyonId;
      let planlanenKg = 0;
      const kalemler = [];

      if (rasyon && rasyon.icerik && rasyon.icerik.length > 0) {
        const icerik = await Rasyon.findById(rasyon._id).populate('icerik.yemId');
        for (const item of (icerik?.icerik || [])) {
          const miktar = (item.miktar || 0) * basCount;
          planlanenKg += miktar;
          kalemler.push({
            yemId: item.yemId?._id,
            yemAdi: item.yemId?.ad || item.yemAdi,
            planlanenKg: miktar
          });
        }
      }

      const yapildi = yapilanlar.find(y => y.grupId.toString() === grup._id.toString());

      sonuc.push({
        grup: {
          _id: grup._id,
          ad: grup.ad,
          renk: grup.renk,
          tip: grup.tip,
          rasyonId: grup.rasyonId,
          rasyonAdi: grup.rasyonId?.ad
        },
        basCount,
        planlanenKg,
        kalemler,
        yapildi: !!yapildi,
        safari: yapildi || null
      });
    }

    const toplamYapilan = yapilanlar.length;
    const toplamGrup = sonuc.length;

    res.json({
      tarih: bugun,
      gruplar: sonuc,
      ozet: {
        toplamGrup,
        yapilanGrup: toplamYapilan,
        bekleyenGrup: toplamGrup - toplamYapilan,
        tamamlandi: toplamGrup > 0 && toplamYapilan >= toplamGrup
      }
    });
  } catch (err) {
    console.error('Yemleme bugün error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Grup için yemleme kaydet
router.post('/', auth, checkRole(['ciftci', 'sutcu']), async (req, res) => {
  try {
    const { grupId, tarih, verilenKalemler, planlananlaAyni } = req.body;
    const userId = req.userId;

    const tarihStr = tarih || new Date().toISOString().split('T')[0];
    const grup = await Grup.findOne({ _id: grupId, userId }).populate('rasyonId');
    if (!grup) return res.status(404).json({ message: 'Grup bulunamadı' });

    const mevcutKayit = await YemlemeSafari.findOne({ userId, grupId, tarih: tarihStr });
    if (mevcutKayit) return res.status(400).json({ message: `Bu grup için ${tarihStr} tarihli yemleme zaten kaydedilmiş.` });

    const basCount = await getGrupBasCount(userId, grupId);
    if (basCount === 0) return res.status(400).json({ message: 'Grupta hayvan yok' });

    const rasyon = grup.rasyonId;
    if (!rasyon || !rasyon.icerik || rasyon.icerik.length === 0) {
      return res.status(400).json({ message: 'Gruba rasyon atanmamış. Önce Yem Merkezi\'nden rasyon atayın.' });
    }

    const rasyonPop = await Rasyon.findById(rasyon._id).populate('icerik.yemId');
    const kalemler = [];
    let planlanenToplam = 0;
    let verilenToplam = 0;
    let toplamMaliyet = 0;

    for (const item of rasyonPop.icerik) {
      const yem = item.yemId;
      if (!yem) continue;

      const planlanenKg = (item.miktar || 0) * basCount;
      planlanenToplam += planlanenKg;

      const verilenKg = planlananlaAyni
        ? planlanenKg
        : (verilenKalemler?.find(v => v.yemId?.toString() === yem._id.toString())?.verilenKg ?? planlanenKg);

      verilenToplam += verilenKg;

      const dusResult = await stoktanDus(userId, yem._id, verilenKg, yem.ad);
      if (!dusResult.ok) {
        return res.status(400).json({ message: dusResult.msg });
      }

      const kalemMaliyet = verilenKg * (dusResult.birimFiyat || 0);
      toplamMaliyet += kalemMaliyet;

      kalemler.push({
        yemId: yem._id,
        yemAdi: yem.ad,
        planlanenKg,
        verilenKg
      });

      await YemHareket.create({
        userId,
        yemTipi: yem.ad,
        hareketTipi: 'Tüketim',
        miktar: verilenKg,
        birimFiyat: dusResult.birimFiyat || 0,
        toplamTutar: kalemMaliyet,
        tarih: new Date(tarihStr),
        aciklama: `Yemleme: ${grup.ad} (${basCount} baş)`
      });
    }

    const sapmaKg = verilenToplam - planlanenToplam;
    const sapmaYuzde = planlanenToplam > 0 ? (sapmaKg / planlanenToplam) * 100 : 0;

    const safari = new YemlemeSafari({
      userId,
      tarih: tarihStr,
      grupId,
      rasyonId: rasyon._id,
      basCount,
      planlanenKg: planlanenToplam,
      verilenKg: verilenToplam,
      sapmaKg,
      sapmaYuzde,
      maliyet: toplamMaliyet,
      kalemler
    });
    await safari.save();

    await Finansal.create({
      userId,
      tip: 'gider',
      kategori: 'yem',
      miktar: toplamMaliyet,
      tarih: tarihStr,
      aciklama: `Yemleme: ${grup.ad} (${basCount} baş)`
    });

    res.status(201).json({
      message: 'Yemleme kaydedildi',
      safari: {
        _id: safari._id,
        grupAd: grup.ad,
        basCount,
        planlanenKg: planlanenToplam,
        verilenKg: verilenToplam,
        maliyet: toplamMaliyet
      }
    });
  } catch (err) {
    console.error('Yemleme kayıt error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Geçmiş yemleme kayıtları
router.get('/gecmis', auth, checkRole(['ciftci', 'sutcu']), async (req, res) => {
  try {
    const { baslangic, bitis, limit = 30 } = req.query;
    const filter = { userId: req.userId };
    if (baslangic) filter.tarih = { ...filter.tarih, $gte: baslangic };
    if (bitis) filter.tarih = { ...filter.tarih, $lte: bitis };

    const kayitlar = await YemlemeSafari.find(filter)
      .populate('grupId', 'ad renk')
      .populate('rasyonId', 'ad')
      .sort({ tarih: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json(kayitlar);
  } catch (err) {
    console.error('Yemleme geçmiş error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
