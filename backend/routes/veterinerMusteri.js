const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Inek = require('../models/Inek');
const Buzagi = require('../models/Buzagi');
const Duve = require('../models/Duve');
const Tosun = require('../models/Tosun');
const SaglikKaydi = require('../models/SaglikKaydi');
const Bildirim = require('../models/Bildirim');
const Tenant = require('../models/Tenant');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const mongoose = require('mongoose');

// Sadece veterinerlerin okuyabileceği rotalar
router.use(auth);
router.use(checkRole(['veteriner']));

// 1. Yeni Çiftlik / Müşteri Ekleme
router.post('/musteri-ekle', async (req, res) => {
    try {
        const { ciftciId } = req.body;
        const vetId = req.originalUserId;

        if (!mongoose.Types.ObjectId.isValid(ciftciId)) {
            return res.status(400).json({ message: 'Geçersiz Çiftçi ID formatı.' });
        }

        const ciftciObjId = new mongoose.Types.ObjectId(ciftciId);
        const ciftci = await User.findOne({ _id: ciftciObjId, rol: 'ciftci' });
        if (!ciftci) {
            return res.status(404).json({ message: 'Bu ID ile eşleşen bir çiftçi bulunamadı.' });
        }

        const veteriner = await User.findById(vetId);
        if (!veteriner) return res.status(500).json({ message: 'Veteriner bulunamadı.' });
        if (!Array.isArray(veteriner.musteriler)) veteriner.musteriler = [];

        const ciftciIdStr = ciftci._id.toString();
        if (veteriner.musteriler.some(m => m && m.toString() === ciftciIdStr)) {
            return res.status(400).json({ message: 'Bu çiftlik zaten hastalarınız arasında ekli.' });
        }

        veteriner.musteriler.push(ciftci._id);
        await veteriner.save();

        res.json({ message: 'Müşteri başarıyla eklendi', ciftci: { _id: ciftci._id, isim: ciftci.isim, isletmeAdi: ciftci.isletmeAdi } });
    } catch (error) {
        console.error('Musteri Ekleme Hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// 1b. Çiftlik kodu ile müşteri ekleme
router.post('/musteri-ekle-kod', async (req, res) => {
    try {
        const { ciftlikKodu } = req.body;
        const vetId = req.originalUserId;

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

        const veteriner = await User.findById(vetId);
        if (!veteriner) return res.status(500).json({ message: 'Veteriner bulunamadı.' });
        if (!Array.isArray(veteriner.musteriler)) veteriner.musteriler = [];

        const ciftciIdStr = ciftci._id.toString();
        if (veteriner.musteriler.some(m => m && m.toString() === ciftciIdStr)) {
            return res.status(400).json({ message: 'Bu çiftlik zaten hastalarınız arasında ekli.' });
        }

        veteriner.musteriler.push(ciftci._id);
        await veteriner.save();

        res.json({
            message: 'Müşteri başarıyla eklendi',
            ciftci: { _id: ciftci._id, isim: ciftci.isim, isletmeAdi: ciftci.isletmeAdi }
        });
    } catch (error) {
        console.error('Musteri Ekleme (Kod) Hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// 2. Dashboard özeti (çiftlik sayısı, toplam hayvan, bu ay kayıt, devam eden tedavi)
router.get('/ozet', async (req, res) => {
    try {
        const veteriner = await User.findById(req.originalUserId).select('musteriler');
        const musteriIds = (veteriner.musteriler || []).map(m => m.toString());
        if (musteriIds.length === 0) {
            return res.json({ musteriSayisi: 0, toplamHayvan: 0, buAySaglikKaydi: 0, devamEdenTedavi: 0 });
        }
        const objIds = musteriIds.map(id => new mongoose.Types.ObjectId(id));
        const buAyBaslangic = new Date();
        buAyBaslangic.setDate(1);
        buAyBaslangic.setHours(0, 0, 0, 0);

        const [toplamInek, toplamBuzagi, toplamDuve, toplamTosun, buAyKayit, devamEden] = await Promise.all([
            Inek.countDocuments({ userId: { $in: objIds } }),
            Buzagi.countDocuments({ userId: { $in: objIds } }),
            Duve.countDocuments({ userId: { $in: objIds } }),
            Tosun.countDocuments({ userId: { $in: objIds } }),
            SaglikKaydi.countDocuments({
                userId: { $in: objIds },
                createdAt: { $gte: buAyBaslangic }
            }),
            SaglikKaydi.countDocuments({
                userId: { $in: objIds },
                durum: 'devam_ediyor'
            })
        ]);
        const toplamHayvan = toplamInek + toplamBuzagi + toplamDuve + toplamTosun;
        res.json({
            musteriSayisi: musteriIds.length,
            toplamHayvan,
            buAySaglikKaydi: buAyKayit,
            devamEdenTedavi: devamEden
        });
    } catch (error) {
        console.error('Veteriner ozet hatasi:', error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// 3. Küpe no ile hayvan ara (tüm müşteri çiftliklerinde)
router.get('/hayvan-ara', async (req, res) => {
    try {
        const { kupeNo } = req.query;
        if (!kupeNo || String(kupeNo).trim().length < 2) {
            return res.json([]);
        }
        const veteriner = await User.findById(req.originalUserId).select('musteriler');
        const musteriIds = (veteriner.musteriler || []).map(m => m.toString());
        if (musteriIds.length === 0) return res.json([]);
        const objIds = musteriIds.map(id => new mongoose.Types.ObjectId(id));
        const aranacak = String(kupeNo).trim();
        const regex = new RegExp(aranacak.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

        const [inekler, buzagilar, duveler, tosunlar] = await Promise.all([
            Inek.find({ userId: { $in: objIds }, kupeNo: regex }).select('userId isim kupeNo irk guncelDurum').lean(),
            Buzagi.find({ userId: { $in: objIds }, kupeNo: regex }).select('userId isim kupeNo irk saglikDurumu cinsiyet').lean(),
            Duve.find({ userId: { $in: objIds }, kupeNo: regex }).select('userId isim kupeNo irk guncelDurum').lean(),
            Tosun.find({ userId: { $in: objIds }, kupeNo: regex }).select('userId isim kupeNo irk saglikDurumu').lean()
        ]);

        const ciftciler = await User.find({ _id: { $in: objIds } }).select('isim isletmeAdi').lean();
        const ciftciMap = {};
        ciftciler.forEach(c => { ciftciMap[c._id?.toString()] = c; });

        const sonuc = [];
        inekler.forEach(h => { sonuc.push({ ciftciId: h.userId?.toString(), ciftlikAdi: ciftciMap[h.userId?.toString()]?.isletmeAdi || ciftciMap[h.userId?.toString()]?.isim, ciftciIsim: ciftciMap[h.userId?.toString()]?.isim, tip: 'inek', hayvan: { ...h, tip: 'inek' } }); });
        buzagilar.forEach(h => { sonuc.push({ ciftciId: h.userId?.toString(), ciftlikAdi: ciftciMap[h.userId?.toString()]?.isletmeAdi || ciftciMap[h.userId?.toString()]?.isim, ciftciIsim: ciftciMap[h.userId?.toString()]?.isim, tip: 'buzagi', hayvan: { ...h, tip: 'buzagi' } }); });
        duveler.forEach(h => { sonuc.push({ ciftciId: h.userId?.toString(), ciftlikAdi: ciftciMap[h.userId?.toString()]?.isletmeAdi || ciftciMap[h.userId?.toString()]?.isim, ciftciIsim: ciftciMap[h.userId?.toString()]?.isim, tip: 'duve', hayvan: { ...h, tip: 'duve' } }); });
        tosunlar.forEach(h => { sonuc.push({ ciftciId: h.userId?.toString(), ciftlikAdi: ciftciMap[h.userId?.toString()]?.isletmeAdi || ciftciMap[h.userId?.toString()]?.isim, ciftciIsim: ciftciMap[h.userId?.toString()]?.isim, tip: 'tosun', hayvan: { ...h, tip: 'tosun' } }); });
        res.json(sonuc.slice(0, 20));
    } catch (error) {
        console.error('Hayvan ara hatasi:', error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// 4. Son eklenen sağlık kayıtları (müşteri çiftliklerindeki)
router.get('/son-saglik-kayitlari', async (req, res) => {
    try {
        const veteriner = await User.findById(req.originalUserId).select('musteriler');
        const musteriIds = (veteriner.musteriler || []).map(m => m.toString());
        if (musteriIds.length === 0) return res.json([]);

        const ciftciler = await User.find({ _id: { $in: musteriIds } }).select('tenantId isim isletmeAdi');
        const tenantIds = ciftciler.map(c => c.tenantId).filter(Boolean);
        if (tenantIds.length === 0) return res.json([]);

        const kayitlar = await SaglikKaydi.find({ tenantId: { $in: tenantIds } })
            .populate('userId', 'isim isletmeAdi')
            .sort({ createdAt: -1 })
            .limit(12)
            .lean();
        res.json(kayitlar);
    } catch (error) {
        console.error('Son saglik kayitlari hatasi:', error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// 5. Bir müşteriye ait sağlık kayıtları (geçmiş)
router.get('/musteri/:ciftciId/saglik-kayitlari', async (req, res) => {
    try {
        const { ciftciId } = req.params;
        const veteriner = await User.findById(req.originalUserId).select('musteriler');
        if (!veteriner.musteriler.some(m => m.toString() === ciftciId)) {
            return res.status(403).json({ message: 'Bu çiftliğe erişim izniniz yok.' });
        }
        const kayitlar = await SaglikKaydi.find({ userId: ciftciId })
            .sort({ createdAt: -1 })
            .limit(80)
            .lean();
        res.json(kayitlar);
    } catch (error) {
        console.error('Musteri saglik kayitlari hatasi:', error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// 6. Kayıtlı Çiftlikleri / Müşterileri Getir
router.get('/musteriler', async (req, res) => {
    try {
        const veteriner = await User.findById(req.originalUserId).populate('musteriler', 'isim email isletmeAdi sehir telefon');
        res.json(veteriner.musteriler || []);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// 7. Bir Müşteriye Ait Tüm Hayvanları Getir
router.get('/musteri/:ciftciId/hayvanlar', async (req, res) => {
    try {
        const { ciftciId } = req.params;
        const veteriner = await User.findById(req.originalUserId);

        if (!veteriner.musteriler.some(m => m.toString() === ciftciId)) {
            return res.status(403).json({ message: 'Bu çiftliğe erişim izniniz yok (Listenizde değil).' });
        }

        // Paralel olarak tüm hayvanları çek
        const [inekler, buzagilar, duveler, tosunlar] = await Promise.all([
            Inek.find({ userId: ciftciId }).select('isim kupeNo irk dogumTarihi guncelDurum'),
            Buzagi.find({ userId: ciftciId }).select('isim kupeNo irk dogumTarihi cinsiyet saglikDurumu'),
            Duve.find({ userId: ciftciId }).select('isim kupeNo irk dogumTarihi guncelDurum'),
            Tosun.find({ userId: ciftciId }).select('isim kupeNo irk dogumTarihi saglikDurumu')
        ]);

        res.json({
            inekler: inekler.map(i => ({ ...i.toObject(), tip: 'inek' })),
            buzagilar: buzagilar.map(i => ({ ...i.toObject(), tip: 'buzagi' })),
            duveler: duveler.map(i => ({ ...i.toObject(), tip: 'duve' })),
            tosunlar: tosunlar.map(i => ({ ...i.toObject(), tip: 'tosun' }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// 8. Müşterinin Hayvanına Uzaktan Sağlık/Tohum Kaydı Ekleme
router.post('/musteri/:ciftciId/hayvan/:hayvanId/saglik', async (req, res) => {
    try {
        const { ciftciId, hayvanId } = req.params;
        const vetId = req.originalUserId;
        const { hayvanTipi, hayvanIsim, hayvanKupeNo, tip, tani, belirtiler, tedavi, ilaclar, notlar } = req.body;
        // tip = 'hastalik' | 'tedavi' | 'asi' | 'muayene' | 'tohumlama' vs (Tohumlamayı Saglik kaydı üzerinden tutacağız)

        const veteriner = await User.findById(vetId);
        if (!veteriner.musteriler.some(m => m.toString() === ciftciId)) {
            return res.status(403).json({ message: 'Yetkisiz işlem.' });
        }

        const ciftci = await User.findById(ciftciId).select('tenantId');
        const farmTenantId = ciftci && ciftci.tenantId ? ciftci.tenantId : null;

        // Yeni Sağlık Kaydı (çiftliğin userId ve tenantId'si ile)
        const yeniKayit = new SaglikKaydi({
            userId: ciftciId,
            tenantId: farmTenantId,
            hayvanId,
            hayvanTipi,
            hayvanIsim,
            hayvanKupeNo,
            tip,
            tani,
            belirtiler,
            tedavi,
            ilaclar,
            veteriner: `Dr. ${veteriner.isim} (Klinik: ${veteriner.klinikAdi || 'Serbest'})`,
            notlar
        });

        await yeniKayit.save();

        // ** Çiftçiye Bildirim Gönderme **
        let mesaj = `Veterineriniz ${veteriner.isim}, ${hayvanKupeNo || hayvanIsim} küpeli hayvanınız için yeni bir sağlık kaydı/reçete oluşturdu.`;
        if (tip === 'tohumlama') {
            mesaj = `Veterineriniz ${veteriner.isim}, ${hayvanKupeNo || hayvanIsim} küpeli hayvanınıza suni tohumlama kaydı girdi.`;
        }

        const bildirim = new Bildirim({
            userId: ciftciId,
            baslik: 'Yeni Veteriner Raporu',
            mesaj: mesaj,
            tip: 'saglik',
            baglantiliId: hayvanId,
            baglantiliModel: hayvanTipi.charAt(0).toUpperCase() + hayvanTipi.slice(1) // Inek, Duve vb
        });
        await bildirim.save();

        res.status(201).json({ message: 'Sağlık kaydı başarıyla oluşturuldu ve çiftçiye bildirildi.', kayit: yeniKayit });
    } catch (error) {
        console.error('Veteriner Sağlık Kaydı Hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

module.exports = router;
