const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const SutKaydi = require('../models/SutKaydi');
const Bildirim = require('../models/Bildirim');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.use(auth);
router.use(checkRole(['toplayici']));

// 1. Çiftlik kodu, çiftçi User ID veya Tenant ID ile çiftlik ekle
router.post('/ciftlik-ekle', async (req, res) => {
  try {
    const { ciftlikKodu } = req.body;
    const toplayiciId = req.originalUserId;

    if (!ciftlikKodu || (typeof ciftlikKodu !== 'string' && typeof ciftlikKodu !== 'object')) {
      return res.status(400).json({ message: 'Çiftlik kodu veya ID girin.' });
    }

    const input = String(ciftlikKodu).trim();
    const kod = input.length <= 12 ? input.toUpperCase() : input;
    let tenant = null;
    let ciftci = null;

    // 1) Önce çiftlik kodu ile ara (8 karakterlik kod)
    if (kod.length <= 12) {
      tenant = await Tenant.findOne({ ciftlikKodu: kod }).populate('ownerUser');
      if (tenant?.ownerUser) ciftci = tenant.ownerUser;
    }

    // 2) Bulunamadıysa, ObjectId ise çiftçi User ID ile dene
    if (!ciftci && /^[a-fA-F0-9]{24}$/.test(kod)) {
      const user = await User.findById(kod).select('rol tenantId');
      if (user?.rol === 'ciftci') {
        ciftci = user;
        tenant = user.tenantId ? await Tenant.findById(user.tenantId) : null;
      }
    }

    // 3) Hâlâ bulunamadıysa Tenant ID ile dene
    if (!ciftci && /^[a-fA-F0-9]{24}$/.test(kod)) {
      tenant = await Tenant.findById(kod).populate('ownerUser');
      if (tenant?.ownerUser?.rol === 'ciftci') ciftci = tenant.ownerUser;
    }

    if (!ciftci || ciftci.rol !== 'ciftci') {
      return res.status(404).json({ message: 'Bu kod/ID ile eşleşen bir çiftlik bulunamadı. Çiftçinin paylaştığı 8 karakterlik kodu veya çiftçi ID\'sini girin.' });
    }

    const toplayici = await User.findById(toplayiciId);
    const ciftciIdStr = ciftci._id.toString();
    if (toplayici.topladigiCiftlikler && toplayici.topladigiCiftlikler.some(c => c.toString() === ciftciIdStr)) {
      return res.status(400).json({ message: 'Bu çiftlik zaten listenizde ekli.' });
    }

    if (!toplayici.topladigiCiftlikler) toplayici.topladigiCiftlikler = [];
    toplayici.topladigiCiftlikler.push(ciftci._id);
    await toplayici.save();

    res.json({
      message: 'Çiftlik başarıyla eklendi.',
      ciftlik: { _id: ciftci._id, isim: ciftci.isim, isletmeAdi: ciftci.isletmeAdi }
    });
  } catch (error) {
    console.error('Toplayici ciftlik ekleme hatasi:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// Süt litre fiyatı kaydet/getir
router.get('/fiyat', async (req, res) => {
  try {
    const toplayici = await User.findById(req.originalUserId).select('sutLitreFiyati').lean();
    res.json({ fiyat: toplayici?.sutLitreFiyati || 0 });
  } catch { res.status(500).json({ message: 'Hata' }); }
});

router.post('/fiyat', async (req, res) => {
  try {
    const { fiyat } = req.body;
    if (!fiyat || fiyat <= 0) return res.status(400).json({ message: 'Geçerli fiyat girin.' });
    await User.findByIdAndUpdate(req.originalUserId, { sutLitreFiyati: Number(fiyat) });
    res.json({ message: 'Fiyat güncellendi.', fiyat: Number(fiyat) });
  } catch { res.status(500).json({ message: 'Hata' }); }
});

// Çiftlik detay istatistikleri
router.get('/ciftlik/:ciftciId/istatistik', async (req, res) => {
  try {
    const { ciftciId } = req.params;
    const toplayiciId = req.originalUserId;
    const now = new Date();
    const bugun = now.toISOString().split('T')[0];
    const ayBaslangic = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const otuzGunOnce = new Date(); otuzGunOnce.setDate(otuzGunOnce.getDate() - 30);
    const otuzStr = otuzGunOnce.toISOString().split('T')[0];

    const [bugunKayit, aylikKayitlar, otuzGunKayitlar] = await Promise.all([
      SutKaydi.find({ userId: ciftciId, toplayiciUserId: toplayiciId, tarih: bugun }),
      SutKaydi.find({ userId: ciftciId, toplayiciUserId: toplayiciId, tarih: { $gte: ayBaslangic, $lte: bugun } }),
      SutKaydi.find({ userId: ciftciId, toplayiciUserId: toplayiciId, tarih: { $gte: otuzStr, $lte: bugun } })
        .sort({ tarih: 1 }).lean(),
    ]);

    const toplayici = await User.findById(toplayiciId).select('sutLitreFiyati').lean();
    const fiyat = toplayici?.sutLitreFiyati || 0;

    const bugunLitre = bugunKayit.reduce((s, k) => s + (k.litre || 0), 0);
    const aylikLitre = aylikKayitlar.reduce((s, k) => s + (k.litre || 0), 0);
    const otuzGunLitre = otuzGunKayitlar.reduce((s, k) => s + (k.litre || 0), 0);

    const trend = {};
    otuzGunKayitlar.forEach(k => {
      trend[k.tarih] = (trend[k.tarih] || 0) + (k.litre || 0);
    });
    const trendArr = Object.entries(trend).map(([tarih, litre]) => ({ tarih, litre }));

    res.json({
      bugunLitre: Math.round(bugunLitre * 10) / 10,
      aylikLitre: Math.round(aylikLitre * 10) / 10,
      otuzGunLitre: Math.round(otuzGunLitre * 10) / 10,
      aylikGelir: +(aylikLitre * fiyat).toFixed(2),
      otuzGunGelir: +(otuzGunLitre * fiyat).toFixed(2),
      ortalamaSutPerGun: otuzGunKayitlar.length > 0 ? +(otuzGunLitre / 30).toFixed(1) : 0,
      trend: trendArr,
      kayitSayisi: otuzGunKayitlar.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Hata' });
  }
});

// Gelir raporu (toplayıcının toplam kazancı)
router.get('/gelir-raporu', async (req, res) => {
  try {
    const toplayiciId = req.originalUserId;
    const toplayici = await User.findById(toplayiciId)
      .populate('topladigiCiftlikler', 'isim isletmeAdi tenantId')
      .select('sutLitreFiyati topladigiCiftlikler').lean();
    const fiyat = toplayici?.sutLitreFiyati || 0;

    const now = new Date();
    const ayBaslangic = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const bugun = now.toISOString().split('T')[0];
    const gecenAyBas = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const gecenAyBit = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    const altiAyOnce = new Date(); altiAyOnce.setMonth(altiAyOnce.getMonth() - 6);
    const altiAyStr = altiAyOnce.toISOString().split('T')[0];

    const [buAyKayitlar, gecenAyKayitlar, altiAyKayitlar] = await Promise.all([
      SutKaydi.find({ toplayiciUserId: toplayiciId, tarih: { $gte: ayBaslangic, $lte: bugun } }).lean(),
      SutKaydi.find({ toplayiciUserId: toplayiciId, tarih: { $gte: gecenAyBas, $lte: gecenAyBit } }).lean(),
      SutKaydi.find({ toplayiciUserId: toplayiciId, tarih: { $gte: altiAyStr, $lte: bugun } }).lean(),
    ]);

    const buAyLitre = buAyKayitlar.reduce((s, k) => s + (k.litre || 0), 0);
    const gecenAyLitre = gecenAyKayitlar.reduce((s, k) => s + (k.litre || 0), 0);

    const ciftlikMap = {};
    buAyKayitlar.forEach(k => {
      const id = k.userId?.toString();
      if (!id) return;
      ciftlikMap[id] = (ciftlikMap[id] || 0) + (k.litre || 0);
    });
    const ciftlikBazli = (toplayici.topladigiCiftlikler || []).map(c => ({
      _id: c._id,
      isim: c.isletmeAdi || c.isim || 'İsimsiz',
      litre: Math.round((ciftlikMap[c._id?.toString()] || 0) * 10) / 10,
      gelir: +((ciftlikMap[c._id?.toString()] || 0) * fiyat).toFixed(2),
    })).sort((a, b) => b.litre - a.litre);

    const aylikTrend = {};
    altiAyKayitlar.forEach(k => {
      const ay = k.tarih?.slice(0, 7);
      if (ay) aylikTrend[ay] = (aylikTrend[ay] || 0) + (k.litre || 0);
    });
    const trendArr = Object.entries(aylikTrend)
      .map(([ay, litre]) => ({ ay, litre: Math.round(litre * 10) / 10, gelir: +(litre * fiyat).toFixed(2) }))
      .sort((a, b) => a.ay.localeCompare(b.ay));

    res.json({
      fiyat,
      buAyLitre: Math.round(buAyLitre * 10) / 10,
      gecenAyLitre: Math.round(gecenAyLitre * 10) / 10,
      buAyGelir: +(buAyLitre * fiyat).toFixed(2),
      gecenAyGelir: +(gecenAyLitre * fiyat).toFixed(2),
      degisimYuzde: gecenAyLitre > 0 ? +(((buAyLitre - gecenAyLitre) / gecenAyLitre) * 100).toFixed(1) : 0,
      ciftlikBazli,
      aylikTrend: trendArr,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Hata' });
  }
});

// 2. Bugün / bu hafta özet (toplayıcının yazdığı süt kayıtları)
router.get('/ozet', async (req, res) => {
  try {
    const toplayiciId = req.originalUserId;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const [bugunKayitlar, haftalikKayitlar] = await Promise.all([
      SutKaydi.find({ toplayiciUserId: toplayiciId, tarih: today }),
      SutKaydi.find({
        toplayiciUserId: toplayiciId,
        tarih: { $gte: weekStartStr, $lte: today }
      })
    ]);

    const bugunLitre = bugunKayitlar.reduce((s, k) => s + (k.litre || 0), 0);
    const bugunCiftlikSayisi = new Set(bugunKayitlar.map(k => k.tenantId?.toString()).filter(Boolean)).size;
    const haftalikLitre = haftalikKayitlar.reduce((s, k) => s + (k.litre || 0), 0);

    res.json({
      bugunToplamLitre: Math.round(bugunLitre * 10) / 10,
      bugunCiftlikSayisi,
      buHaftaToplamLitre: Math.round(haftalikLitre * 10) / 10
    });
  } catch (error) {
    console.error('Toplayici ozet hatasi:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// 3. Son toplamalar (toplayıcının yazdığı süt kayıtları, en yeniler)
router.get('/son-toplamalar', async (req, res) => {
  try {
    const list = await SutKaydi.find({ toplayiciUserId: req.originalUserId })
      .populate('tenantId', 'name ciftlikKodu')
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();
    res.json(list);
  } catch (error) {
    console.error('Son toplamalar hatasi:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// 4. Toplayıcının eklediği çiftlikleri listele (ciftlikKodu için Tenant bilgisi eklenir)
router.get('/ciftlikler', async (req, res) => {
  try {
    const toplayici = await User.findById(req.originalUserId)
      .populate('topladigiCiftlikler', 'isim email isletmeAdi sehir tenantId');
    const list = toplayici.topladigiCiftlikler || [];
    const tenantIds = list.map(c => c.tenantId).filter(Boolean);
    const tenants = await Tenant.find({ _id: { $in: tenantIds } }).select('ciftlikKodu');
    const kodMap = {};
    tenants.forEach(t => { kodMap[t._id.toString()] = t.ciftlikKodu; });
    const enriched = list.map(c => {
      const o = c.toObject ? c.toObject() : { ...c };
      o.ciftlikKodu = o.tenantId ? kodMap[o.tenantId.toString()] : null;
      return o;
    });
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// 5. Süt toplama kaydı – çiftliğin verisine yazılır
router.post('/sut-toplama', async (req, res) => {
  try {
    const { ciftlikKodu, tarih, litre, sagim } = req.body;
    const toplayiciId = req.originalUserId;

    if (!ciftlikKodu || !tarih || litre == null) {
      return res.status(400).json({ message: 'Çiftlik kodu, tarih ve litre gerekli.' });
    }

    const kod = String(ciftlikKodu).trim().toUpperCase();
    const tenant = await Tenant.findOne({ ciftlikKodu: kod }).populate('ownerUser');
    if (!tenant || !tenant.ownerUser) {
      return res.status(404).json({ message: 'Bu çiftlik kodu ile eşleşen çiftlik bulunamadı.' });
    }

    const ciftci = tenant.ownerUser;
    if (ciftci.rol !== 'ciftci') {
      return res.status(400).json({ message: 'Bu kod bir çiftlik hesabına ait değil.' });
    }

    const toplayici = await User.findById(toplayiciId);
    const ciftciIdStr = ciftci._id.toString();
    const izinVar = toplayici.topladigiCiftlikler && toplayici.topladigiCiftlikler.some(c => c.toString() === ciftciIdStr);
    if (!izinVar) {
      return res.status(403).json({ message: 'Bu çiftliğe süt toplama yetkiniz yok. Önce çiftliği kod ile ekleyin.' });
    }

    const tarihStr = typeof tarih === 'string' ? tarih : new Date(tarih).toISOString().split('T')[0];
    const sagimVal = sagim === 'aksam' ? 'aksam' : 'sabah';

    const mevcutKayit = await SutKaydi.findOne({
      userId: ciftci._id,
      toplayiciUserId: toplayiciId,
      tarih: tarihStr,
      sagim: sagimVal
    });
    if (mevcutKayit) {
      return res.status(400).json({
        message: `Bu çiftlik için ${tarihStr} tarihli ${sagimVal} sağımı zaten kaydedilmiş.`
      });
    }

    const kayit = new SutKaydi({
      userId: ciftci._id,
      tenantId: tenant._id,
      toplayiciUserId: toplayiciId,
      inekId: 'toplayici-giris',
      inekIsim: 'Süt toplayıcı toplama',
      tarih: tarihStr,
      litre: Number(litre),
      sagim: sagimVal,
      topluGiristen: true
    });
    await kayit.save();

    // Bildirim oluştur
    try {
      await Bildirim.create({
        userId: ciftci._id,
        tip: 'sagim',
        baslik: `Süt toplama kaydı: ${Number(litre)} Lt`,
        mesaj: `${tarihStr} tarihli ${sagimVal} sağımınız süt toplayıcı tarafından kaydedildi. Miktar: ${Number(litre)} Lt`,
        oncelik: 'normal',
        aktif: true,
        tamamlandi: false,
      });
    } catch {}

    res.status(201).json({
      message: 'Süt toplama kaydı çiftliğe işlendi.',
      kayit: { _id: kayit._id, tarih: kayit.tarih, litre: kayit.litre, sagim: kayit.sagim }
    });
  } catch (error) {
    console.error('Toplayici sut toplama hatasi:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

module.exports = router;
