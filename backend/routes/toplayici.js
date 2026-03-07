const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const SutKaydi = require('../models/SutKaydi');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.use(auth);
router.use(checkRole(['toplayici']));

// 1. Çiftlik kodu ile çiftlik ekle
router.post('/ciftlik-ekle', async (req, res) => {
  try {
    const { ciftlikKodu } = req.body;
    const toplayiciId = req.originalUserId;

    if (!ciftlikKodu || typeof ciftlikKodu !== 'string') {
      return res.status(400).json({ message: 'Çiftlik kodu girin.' });
    }

    const kod = ciftlikKodu.trim().toUpperCase();
    const tenant = await Tenant.findOne({ ciftlikKodu: kod }).populate('ownerUser');
    if (!tenant || !tenant.ownerUser) {
      return res.status(404).json({ message: 'Bu çiftlik kodu ile eşleşen bir çiftlik bulunamadı.' });
    }

    const ciftci = tenant.ownerUser;
    if (ciftci.rol !== 'ciftci') {
      return res.status(400).json({ message: 'Bu kod bir çiftlik hesabına ait değil.' });
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
