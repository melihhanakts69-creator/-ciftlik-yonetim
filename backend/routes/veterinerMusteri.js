const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Inek = require('../models/Inek');
const Buzagi = require('../models/Buzagi');
const Duve = require('../models/Duve');
const Tosun = require('../models/Tosun');
const SaglikKaydi = require('../models/SaglikKaydi');
const Bildirim = require('../models/Bildirim');
const Stok = require('../models/Stok');
const VeterinerCari = require('../models/VeterinerCari');
const VeterinerRandevu = require('../models/VeterinerRandevu');
const Finansal = require('../models/Finansal');
const AsiTakvimi = require('../models/AsiTakvimi');
const TedaviProtokol = require('../models/TedaviProtokol');
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
        const { hayvanTipi, hayvanIsim, hayvanKupeNo, tip, tani, belirtiler, tedavi, ilaclar, notlar, maliyet } = req.body;
        // tip = 'hastalik' | 'tedavi' | 'asi' | 'muayene' | 'tohumlama' vs (Tohumlamayı Saglik kaydı üzerinden tutacağız)

        const veteriner = await User.findById(vetId);
        if (!veteriner) return res.status(500).json({ message: 'Veteriner bulunamadı.' });
        if (!Array.isArray(veteriner.musteriler)) veteriner.musteriler = [];
        if (!veteriner.musteriler.some(m => m && m.toString() === ciftciId)) {
            return res.status(403).json({ message: 'Yetkisiz işlem.' });
        }

        const ciftci = await User.findById(ciftciId).select('tenantId');
        const farmTenantId = ciftci && ciftci.tenantId ? ciftci.tenantId : null;

        const maliyetTutar = typeof maliyet === 'number' && maliyet > 0 ? maliyet : (parseFloat(maliyet) || 0);
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
            notlar,
            maliyet: maliyetTutar,
            kayitSahibi: { tip: 'veteriner', sahipId: vetId }
        });

        await yeniKayit.save();

        // ── TOHUMLAMA: Hayvanı güncelle (inek/düve) ─────────────────
        const isTohumlama = tip === 'tohumlama' || (tip === 'muayene' && tani === 'Suni Tohumlama');
        if (isTohumlama && hayvanTipi && ['inek', 'duve'].includes(hayvanTipi)) {
            const tohumTarih = yeniKayit.tarih ? new Date(yeniKayit.tarih).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            try {
                if (hayvanTipi === 'inek') {
                    await Inek.findOneAndUpdate(
                        { _id: hayvanId, userId: ciftciId },
                        { tohumlamaTarihi: tohumTarih, gebelikDurumu: 'Belirsiz' }
                    );
                } else {
                    await Duve.findOneAndUpdate(
                        { _id: hayvanId, userId: ciftciId },
                        { tohumlamaTarihi: tohumTarih, gebelikDurumu: 'Belirsiz' }
                    );
                }
            } catch (err) {
                console.error('Tohumlama hayvan güncelleme hatası:', err.message);
            }
        }
        // ── TOHUMLAMA SONU ────────────────────────────────────────

        // ── SÜT KORUMA ZİNCİRİ ──────────────────────────────────
        const ilaclarArr = yeniKayit.ilaclar || [];
        const maxArinmaSut = Math.max(0, ...ilaclarArr.map(i => i.arinmaSuresiSut || 0));
        const maxArinmaEt = Math.max(0, ...ilaclarArr.map(i => i.arinmaSuresiEt || 0));

        if (maxArinmaSut > 0 || maxArinmaEt > 0) {
            const bugun = new Date();
            if (maxArinmaSut > 0) {
                yeniKayit.sutYasakBitis = new Date(bugun);
                yeniKayit.sutYasakBitis.setDate(bugun.getDate() + maxArinmaSut);
                yeniKayit.sutYasakAktif = true;
            }
            if (maxArinmaEt > 0) {
                yeniKayit.etYasakBitis = new Date(bugun);
                yeniKayit.etYasakBitis.setDate(bugun.getDate() + maxArinmaEt);
            }
            await yeniKayit.save();

            const sutBitisStr = yeniKayit.sutYasakBitis
                ? yeniKayit.sutYasakBitis.toLocaleDateString('tr-TR')
                : null;
            const ilacAdlari = ilaclarArr.map(i => i.ilacAdi).filter(Boolean).join(', ');

            await Bildirim.create({
                userId: ciftciId,
                tip: 'saglik',
                oncelik: 'acil',
                baslik: `Süt Yasağı: ${hayvanKupeNo || hayvanIsim}`,
                mesaj: `Vet. ${veteriner.isim} tarafından uygulanan ${ilacAdlari} nedeniyle${sutBitisStr ? ` ${sutBitisStr} tarihine kadar` : ''} bu hayvanın sütü tanka karıştırılmamalıdır.`,
                hayvanId: hayvanId || undefined,
                hayvanTipi: hayvanTipi || 'inek',
                kupe_no: hayvanKupeNo,
                hatirlatmaTarihi: bugun,
                metadata: {
                    tip: 'sut_yasak',
                    sutYasakBitis: yeniKayit.sutYasakBitis,
                    ilacAdlari,
                    veterinerAdi: veteriner.isim
                }
            });

            const toplayicilar = await User.find({
                rol: 'toplayici',
                topladigiCiftlikler: mongoose.Types.ObjectId.isValid(ciftciId) ? new mongoose.Types.ObjectId(ciftciId) : ciftciId
            }).lean();

            if (toplayicilar.length > 0) {
                const ciftci = await User.findById(ciftciId).select('isletmeAdi isim').lean();
                const ciftlikAdi = ciftci?.isletmeAdi || ciftci?.isim || 'Çiftlik';
                await Bildirim.insertMany(toplayicilar.map(t => ({
                    userId: t._id,
                    tip: 'saglik',
                    oncelik: 'acil',
                    baslik: `Süt Yasağı — ${ciftlikAdi}`,
                    mesaj: `${hayvanKupeNo || hayvanIsim} küpeli hayvana antibiyotik uygulandı.${sutBitisStr ? ` ${sutBitisStr} tarihine kadar` : ''} bu hayvanın sütünü ayrı tutun.`,
                    hatirlatmaTarihi: bugun,
                    aktif: true,
                    metadata: {
                        tip: 'sut_yasak',
                        ciftciId,
                        sutYasakBitis: yeniKayit.sutYasakBitis,
                        hayvanKupeNo
                    }
                })));
            }
        }
        // ── ZİNCİR SONU ─────────────────────────────────────────

        // ── İLAÇ STOK DÜŞÜM (çiftçinin stoku) ───────────────────
        for (const ilac of ilaclarArr) {
            if (!ilac.ilacAdi || !(ilac.kullanilanMiktar || ilac.kullanılanMiktar)) continue;
            const miktar = ilac.kullanilanMiktar || ilac.kullanılanMiktar || 0;
            const stok = await Stok.findOne({
                userId: ciftciId,
                urunAdi: { $regex: new RegExp(ilac.ilacAdi.trim(), 'i') },
                kategori: { $in: ['İlaç', 'Antibiyotik', 'Vitamin', 'Anti-inflamatuar', 'Paraziter'] }
            });
            if (stok) {
                stok.miktar = Math.max(0, stok.miktar - miktar);
                stok.sonGuncelleme = new Date();
                await stok.save();
                if (stok.miktar <= (stok.kritikSeviye || 0)) {
                    const mevcutBildirim = await Bildirim.findOne({
                        userId: ciftciId,
                        tip: 'stok',
                        tamamlandi: false,
                        'metadata.stokId': stok._id.toString()
                    });
                    if (!mevcutBildirim) {
                        await Bildirim.create({
                            userId: ciftciId,
                            tip: 'stok',
                            oncelik: 'acil',
                            baslik: `İlaç Stok Uyarısı: ${stok.urunAdi}`,
                            mesaj: `${stok.urunAdi} kritik seviyede. Mevcut: ${stok.miktar} ${stok.birim}.`,
                            hatirlatmaTarihi: new Date(),
                            metadata: { stokId: stok._id.toString(), urunAdi: stok.urunAdi }
                        });
                    }
                }
            }
        }
        // ── STOK SONU ────────────────────────────────────────────

        if (maliyetTutar > 0) {
            await VeterinerCari.create({
                veterinerId: vetId,
                ciftciId,
                tutar: maliyetTutar,
                aciklama: `${tani || tip}${hayvanKupeNo ? ` (${hayvanKupeNo})` : ''}`.slice(0, 200),
                saglikKaydiId: yeniKayit._id,
                tarih: new Date(),
                durum: 'acik'
            });
            const bugun = new Date().toISOString().split('T')[0];
            await Finansal.create({
                userId: ciftciId,
                tip: 'gider',
                kategori: 'veteriner',
                miktar: maliyetTutar,
                tarih: bugun,
                aciklama: `Veteriner: ${veteriner.isim} - ${tani || tip}`,
                ilgiliHayvanId: hayvanId || undefined,
                ilgiliHayvanTipi: hayvanTipi || undefined
            });
        }

        // ** Çiftçiye Bildirim Gönderme **
        let mesaj = `Veterineriniz ${veteriner.isim}, ${hayvanKupeNo || hayvanIsim} küpeli hayvanınız için yeni bir sağlık kaydı/reçete oluşturdu.`;
        if (tip === 'tohumlama') {
            mesaj = `Veterineriniz ${veteriner.isim}, ${hayvanKupeNo || hayvanIsim} küpeli hayvanınıza suni tohumlama kaydı girdi.`;
        }

        const bildirim = new Bildirim({
            userId: ciftciId,
            baslik: 'Yeni Veteriner Raporu',
            mesaj,
            tip: 'saglik',
            hayvanId: hayvanId || undefined,
            hayvanTipi: hayvanTipi || 'genel'
        });
        await bildirim.save();

        res.status(201).json({ message: 'Sağlık kaydı başarıyla oluşturuldu ve çiftçiye bildirildi.', kayit: yeniKayit });
    } catch (error) {
        console.error('Veteriner Sağlık Kaydı Hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// ========== FİNANS / CARİ HESAP ==========

// Cari özet: Müşteri bazında toplam alacak ve tahsilat
router.get('/finans/cari', async (req, res) => {
    try {
        const vetId = req.originalUserId;
        const cariler = await VeterinerCari.aggregate([
            { $match: { veterinerId: new mongoose.Types.ObjectId(vetId), durum: 'acik' } },
            { $group: { _id: '$ciftciId', toplamAlacak: { $sum: '$tutar' }, toplamOdenen: { $sum: '$odenenTutar' } } },
            { $project: { ciftciId: '$_id', toplamAlacak: 1, toplamOdenen: 1, bakiye: { $subtract: ['$toplamAlacak', '$toplamOdenen'] } } },
            { $match: { bakiye: { $gt: 0 } } },
            { $sort: { bakiye: -1 } }
        ]);
        const ciftciIds = cariler.map(c => c.ciftciId);
        const users = await User.find({ _id: { $in: ciftciIds } }).select('isim isletmeAdi').lean();
        const userMap = {};
        users.forEach(u => { userMap[u._id.toString()] = u; });
        const list = cariler.map(c => ({
            ciftciId: c.ciftciId,
            isim: userMap[c.ciftciId.toString()]?.isim,
            isletmeAdi: userMap[c.ciftciId.toString()]?.isletmeAdi,
            toplamAlacak: c.toplamAlacak,
            toplamOdenen: c.toplamOdenen,
            bakiye: c.bakiye
        }));
        const toplamBakiye = list.reduce((s, c) => s + (c.bakiye || 0), 0);
        res.json({ list, toplamBakiye });
    } catch (error) {
        console.error('Veteriner cari list error:', error);
        res.status(500).json({ message: 'Cari listelenemedi.' });
    }
});

// Belirli çiftçinin cari kalemleri (fatura detayı)
router.get('/finans/cari/:ciftciId', async (req, res) => {
    try {
        const vetId = req.originalUserId;
        const { ciftciId } = req.params;
        const veteriner = await User.findById(vetId).select('musteriler');
        if (!veteriner || !(veteriner.musteriler || []).map(m => m.toString()).includes(ciftciId)) {
            return res.status(403).json({ message: 'Bu çiftçi müşteriniz değil.' });
        }
        const kalemler = await VeterinerCari.find({ veterinerId: vetId, ciftciId }).sort({ tarih: -1 }).lean();
        const ciftci = await User.findById(ciftciId).select('isim isletmeAdi').lean();
        const toplamAlacak = kalemler.reduce((s, k) => s + k.tutar, 0);
        const toplamOdenen = kalemler.reduce((s, k) => s + (k.odenenTutar || 0), 0);
        res.json({ kalemler, ciftci, toplamAlacak, toplamOdenen, bakiye: toplamAlacak - toplamOdenen });
    } catch (error) {
        console.error('Veteriner cari detay error:', error);
        res.status(500).json({ message: 'Cari detayı alınamadı.' });
    }
});

// Tahsilat gir: Belirli çiftçiye yapılan ödeme (genel veya kalem bazlı)
router.post('/finans/tahsilat', async (req, res) => {
    try {
        const vetId = req.originalUserId;
        const { ciftciId, tutar, aciklama } = req.body;
        const odenenTutar = typeof tutar === 'number' ? tutar : parseFloat(tutar);
        if (!ciftciId || !(odenenTutar > 0)) return res.status(400).json({ message: 'Çiftçi ve geçerli tutar gerekli.' });
        const veteriner = await User.findById(vetId).select('musteriler');
        if (!veteriner || !(veteriner.musteriler || []).map(m => m.toString()).includes(ciftciId)) {
            return res.status(403).json({ message: 'Bu çiftçi müşteriniz değil.' });
        }
        const acikKalemler = await VeterinerCari.find({ veterinerId: vetId, ciftciId, durum: 'acik' }).sort({ tarih: 1 });
        let kalan = odenenTutar;
        for (const kalem of acikKalemler) {
            if (kalan <= 0) break;
            const borc = kalem.tutar - (kalem.odenenTutar || 0);
            if (borc <= 0) continue;
            const ode = Math.min(kalan, borc);
            kalem.odenenTutar = (kalem.odenenTutar || 0) + ode;
            kalem.odemeTarihi = new Date();
            if (kalem.odenenTutar >= kalem.tutar) kalem.durum = 'kapali';
            await kalem.save();
            kalan -= ode;
        }
        const vet = await User.findById(vetId).select('isim').lean();
        await Bildirim.create({
            userId: ciftciId,
            tip: 'odeme',
            baslik: 'Veteriner tahsilat',
            mesaj: `${vet?.isim || 'Veteriner'} ${odenenTutar.toFixed(2)} TL tahsilat kaydetti.${aciklama ? ` (${aciklama})` : ''}`,
            oncelik: 'normal'
        });
        res.json({ message: 'Tahsilat kaydedildi.', odenenTutar });
    } catch (error) {
        console.error('Veteriner tahsilat error:', error);
        res.status(500).json({ message: 'Tahsilat kaydedilemedi.' });
    }
});

// Borç hatırlatması: Çiftçiye "X TL borcunuz var" bildirimi atar
router.post('/finans/hatirlatma-gonder/:ciftciId', async (req, res) => {
    try {
        const vetId = req.originalUserId;
        const { ciftciId } = req.params;
        const veteriner = await User.findById(vetId).select('musteriler isim');
        if (!veteriner || !(veteriner.musteriler || []).map(m => m.toString()).includes(ciftciId)) {
            return res.status(403).json({ message: 'Bu çiftçi müşteriniz değil.' });
        }
        const cariler = await VeterinerCari.find({ veterinerId: vetId, ciftciId, durum: 'acik' });
        const toplamAlacak = cariler.reduce((s, k) => s + k.tutar, 0);
        const toplamOdenen = cariler.reduce((s, k) => s + (k.odenenTutar || 0), 0);
        const bakiye = toplamAlacak - toplamOdenen;
        if (bakiye <= 0) return res.status(400).json({ message: 'Bu çiftçinin bakiyesi yok.' });
        await Bildirim.create({
            userId: ciftciId,
            tip: 'odeme',
            baslik: 'Veteriner borç hatırlatması',
            mesaj: `${veteriner.isim} size ${bakiye.toFixed(2)} TL borcunuz olduğunu hatırlatıyor. Lütfen ödeme yapınız.`,
            oncelik: 'normal'
        });
        res.json({ message: 'Hatırlatma gönderildi.', bakiye });
    } catch (error) {
        console.error('Hatirlatma error:', error);
        res.status(500).json({ message: 'Hatırlatma gönderilemedi.' });
    }
});

// ========== RANDEVU / ZİYARET TAKVİMİ ==========

router.get('/randevu', async (req, res) => {
    try {
        const vetId = req.originalUserId;
        const { baslangic, bitis } = req.query;
        const start = baslangic ? new Date(baslangic) : new Date(new Date().setHours(0, 0, 0, 0));
        const end = bitis ? new Date(bitis) : new Date(start);
        end.setDate(end.getDate() + 31);
        const list = await VeterinerRandevu.find({
            veterinerId: vetId,
            tarih: { $gte: start, $lte: end },
            durum: { $ne: 'iptal' }
        }).populate('ciftciId', 'isim isletmeAdi').sort({ tarih: 1, saat: 1 }).lean();
        res.json(list);
    } catch (error) {
        console.error('Randevu list error:', error);
        res.status(500).json({ message: 'Randevular alınamadı.' });
    }
});

router.post('/randevu', async (req, res) => {
    try {
        const vetId = req.originalUserId;
        const { ciftciId, baslik, tarih, saat, aciklama } = req.body;
        if (!ciftciId || !baslik || !tarih) return res.status(400).json({ message: 'Çiftçi, başlık ve tarih gerekli.' });
        const veteriner = await User.findById(vetId).select('musteriler isim klinikAdi').lean();
        if (!veteriner || !(veteriner.musteriler || []).map(m => m.toString()).includes(ciftciId)) {
            return res.status(403).json({ message: 'Bu çiftçi müşteriniz değil.' });
        }
        const doc = await VeterinerRandevu.create({
            veterinerId: vetId,
            ciftciId,
            baslik: baslik.trim(),
            tarih: new Date(tarih),
            saat: (saat || '').trim(),
            aciklama: (aciklama || '').trim(),
            durum: 'planlandi'
        });
        const vetAd = veteriner.klinikAdi || veteriner.isim || 'Veteriner';
        const tarihStr = new Date(tarih).toLocaleDateString('tr-TR');
        const saatStr = (saat || '').trim() || '—';
        const randevuTarih = new Date(tarih);
        await Bildirim.create({
            userId: ciftciId,
            tip: 'randevu',
            baslik: 'Veteriner randevusu',
            mesaj: `${vetAd} sizin için ${tarihStr} ${saatStr !== '—' ? saatStr : ''} tarihli randevu oluşturdu: ${baslik.trim()}`.trim(),
            oncelik: 'normal',
            hatirlatmaTarihi: randevuTarih,
            metadata: {
                randevuId: doc._id,
                veterinerAdi: vetAd,
                baslik: baslik.trim(),
                tarih: randevuTarih,
                saat: (saat || '').trim(),
                aciklama: (aciklama || '').trim()
            }
        });
        const populated = await VeterinerRandevu.findById(doc._id).populate('ciftciId', 'isim isletmeAdi').lean();
        res.status(201).json(populated);
    } catch (error) {
        console.error('Randevu create error:', error);
        res.status(500).json({ message: 'Randevu oluşturulamadı.' });
    }
});

router.patch('/randevu/:id', async (req, res) => {
    try {
        const vetId = req.originalUserId;
        const { durum } = req.body;
        const r = await VeterinerRandevu.findOne({ _id: req.params.id, veterinerId: vetId });
        if (!r) return res.status(404).json({ message: 'Randevu bulunamadı.' });
        if (durum) r.durum = durum;
        await r.save();
        res.json(r);
    } catch (error) {
        console.error('Randevu update error:', error);
        res.status(500).json({ message: 'Güncellenemedi.' });
    }
});

// Müşteri çiftliklerinden yaklaşan aşı ve sonraki kontrol tarihleri (ziyaret önerileri)
router.get('/ziyaret-onerileri', async (req, res) => {
    try {
        const vetId = req.originalUserId;
        const veteriner = await User.findById(vetId).select('musteriler');
        const musteriIds = (veteriner.musteriler || []).map(m => m.toString());
        if (musteriIds.length === 0) return res.json([]);
        const objIds = musteriIds.map(id => new mongoose.Types.ObjectId(id));
        const bugun = new Date();
        bugun.setHours(0, 0, 0, 0);
        const birAySonra = new Date(bugun);
        birAySonra.setDate(birAySonra.getDate() + 31);
        const asilar = await AsiTakvimi.find({
            userId: { $in: objIds },
            sonrakiTarih: { $gte: bugun, $lte: birAySonra }
        }).populate('userId', 'isim isletmeAdi').lean();
        const sagliklar = await SaglikKaydi.find({
            userId: { $in: objIds },
            sonrakiKontrol: { $gte: bugun, $lte: birAySonra }
        }).populate('userId', 'isim isletmeAdi').lean();
        const ciftciMap = {};
        (await User.find({ _id: { $in: objIds } }).select('isim isletmeAdi').lean()).forEach(u => { ciftciMap[u._id.toString()] = u; });
        const oneriler = [
            ...asilar.map(a => ({
                tip: 'asi',
                tarih: a.sonrakiTarih,
                baslik: `Aşı: ${a.asiAdi}`,
                ciftlik: ciftciMap[a.userId?.toString()]?.isletmeAdi || ciftciMap[a.userId?.toString()]?.isim || 'Çiftlik',
                ciftciId: a.userId?._id || a.userId,
                detay: a.hayvanIsim || a.hayvanKupeNo || ''
            })),
            ...sagliklar.map(s => ({
                tip: 'kontrol',
                tarih: s.sonrakiKontrol,
                baslik: `Kontrol: ${s.tani || 'Sonraki muayene'}`,
                ciftlik: ciftciMap[s.userId?.toString()]?.isletmeAdi || ciftciMap[s.userId?.toString()]?.isim || 'Çiftlik',
                ciftciId: s.userId?._id || s.userId,
                detay: s.hayvanIsim || s.hayvanKupeNo || ''
            }))
        ];
        oneriler.sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
        res.json(oneriler.slice(0, 50));
    } catch (error) {
        console.error('Ziyaret onerileri error:', error);
        res.status(500).json({ message: 'Öneriler alınamadı.' });
    }
});

// ========== KLİNİK RAPORLAMA ==========
router.get('/rapor/aylik', async (req, res) => {
    try {
        const vetId = req.originalUserId;
        const veteriner = await User.findById(vetId).select('musteriler');
        const musteriIds = (veteriner.musteriler || []).map(m => m.toString());
        if (musteriIds.length === 0) {
            return res.json({ enCokHastalik: [], enCokIlac: [], problemliCiftlikler: [], toplamKayit: 0 });
        }
        const objIds = musteriIds.map(id => new mongoose.Types.ObjectId(id));
        const baslangic = new Date();
        baslangic.setDate(1);
        baslangic.setHours(0, 0, 0, 0);
        const bitis = new Date();
        bitis.setMonth(bitis.getMonth() + 1);
        bitis.setDate(0);
        bitis.setHours(23, 59, 59, 999);
        const kayitlar = await SaglikKaydi.find({
            userId: { $in: objIds },
            tarih: { $gte: baslangic, $lte: bitis }
        }).lean();
        const taniCount = {};
        const ilacCount = {};
        const ciftciCount = {};
        kayitlar.forEach(k => {
            const t = (k.tani || k.tip || '').trim() || 'Diğer';
            taniCount[t] = (taniCount[t] || 0) + 1;
            (k.ilaclar || []).forEach(il => {
                const ad = (il.ilacAdi || '').trim() || 'Belirtilmemiş';
                ilacCount[ad] = (ilacCount[ad] || 0) + 1;
            });
            const cid = (k.userId && (k.userId._id || k.userId)).toString();
            ciftciCount[cid] = (ciftciCount[cid] || 0) + 1;
        });
        const enCokHastalik = Object.entries(taniCount).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([ad, sayi]) => ({ ad, sayi }));
        const enCokIlac = Object.entries(ilacCount).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([ad, sayi]) => ({ ad, sayi }));
        const ciftciList = await User.find({ _id: { $in: Object.keys(ciftciCount) } }).select('isim isletmeAdi').lean();
        const ciftciMap = {};
        ciftciList.forEach(u => { ciftciMap[u._id.toString()] = u; });
        const problemliCiftlikler = Object.entries(ciftciCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([cid, sayi]) => ({ ciftciId: cid, isim: ciftciMap[cid]?.isim, isletmeAdi: ciftciMap[cid]?.isletmeAdi, kayitSayisi: sayi }));
        res.json({ enCokHastalik, enCokIlac, problemliCiftlikler, toplamKayit: kayitlar.length });
    } catch (error) {
        console.error('Rapor aylik error:', error);
        res.status(500).json({ message: 'Rapor alınamadı.' });
    }
});

// ========== MANUEL FATURA KESME ==========
router.post('/finans/fatura', async (req, res) => {
    try {
        const vetId = req.originalUserId;
        const { ciftciId, aciklama, vadeTarihi, hizmetler } = req.body;

        if (!ciftciId || !Array.isArray(hizmetler) || hizmetler.length === 0) {
            return res.status(400).json({ message: 'Çiftlik ve en az bir hizmet kalemi gerekli.' });
        }

        const veteriner = await User.findById(vetId).select('musteriler isim klinikAdi').lean();
        if (!veteriner || !(veteriner.musteriler || []).map(m => m.toString()).includes(ciftciId)) {
            return res.status(403).json({ message: 'Bu çiftçi müşteriniz değil.' });
        }

        const tutar = hizmetler.reduce((s, h) => s + (parseFloat(h.birimFiyat) || 0) * (parseFloat(h.miktar) || 1), 0);
        if (!(tutar > 0)) return res.status(400).json({ message: 'Toplam tutar sıfırdan büyük olmalı.' });

        const tarihStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const fatura_no = `FTR-${tarihStr}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

        const doc = await VeterinerCari.create({
            veterinerId: vetId,
            ciftciId,
            tutar,
            aciklama: (aciklama || '').trim(),
            vadeTarihi: vadeTarihi ? new Date(vadeTarihi) : null,
            hizmetler: hizmetler.map(h => ({
                ad: (h.ad || '').trim(),
                miktar: parseFloat(h.miktar) || 1,
                birimFiyat: parseFloat(h.birimFiyat) || 0,
            })),
            tip: 'manuel',
            fatura_no,
            durum: 'acik',
        });

        const vetAd = veteriner.klinikAdi || veteriner.isim || 'Veteriner';
        await Bildirim.create({
            userId: ciftciId,
            tip: 'odeme',
            baslik: 'Yeni fatura',
            mesaj: `${vetAd} size ${tutar.toFixed(2)} TL tutarında fatura kesti. (${fatura_no})${aciklama ? ` — ${aciklama}` : ''}`,
            oncelik: 'normal',
            metadata: { faturaId: doc._id, fatura_no, tutar },
        });

        await Finansal.create({
            userId: ciftciId,
            tip: 'gider',
            kategori: 'veteriner',
            miktar: tutar,
            tarih: new Date().toISOString().split('T')[0],
            aciklama: `Veteriner fatura: ${vetAd} — ${fatura_no}`,
        });

        res.status(201).json(doc);
    } catch (error) {
        console.error('Manuel fatura error:', error);
        res.status(500).json({ message: 'Fatura oluşturulamadı.' });
    }
});

// ========== SÜRÜ SAĞLIK SKORU ==========
// Her müşteri çiftliği için 0-100 arası sağlık puanı hesaplar
router.get('/saglik-skoru', async (req, res) => {
    try {
        const vetId = req.originalUserId;
        const veteriner = await User.findById(vetId).select('musteriler').lean();
        const musteriIds = (veteriner.musteriler || []).map(m => m.toString());
        if (musteriIds.length === 0) return res.json([]);

        const objIds = musteriIds.map(id => new mongoose.Types.ObjectId(id));
        const otuzGunOnce = new Date();
        otuzGunOnce.setDate(otuzGunOnce.getDate() - 30);

        // Son 30 günlük sağlık kayıtları çiftlik bazında say
        // Suni tohumlama kayıtları skoru etkilememeli (pozitif/rutin işlem)
        const saglikSayilari = await SaglikKaydi.aggregate([
            { $match: { userId: { $in: objIds }, tarih: { $gte: otuzGunOnce }, tani: { $ne: 'Suni Tohumlama' } } },
            { $group: { _id: '$userId', sayi: { $sum: 1 }, devamEden: { $sum: { $cond: [{ $eq: ['$durum', 'devam_ediyor'] }, 1, 0] } } } }
        ]);

        // Gecikmiş aşılar çiftlik bazında
        const asiSayilari = await AsiTakvimi.aggregate([
            { $match: { userId: { $in: objIds }, sonrakiTarih: { $lt: new Date() }, durum: 'bekliyor' } },
            { $group: { _id: '$userId', sayi: { $sum: 1 } } }
        ]);

        const saglikMap = {};
        saglikSayilari.forEach(s => { saglikMap[s._id.toString()] = s; });
        const asiMap = {};
        asiSayilari.forEach(a => { asiMap[a._id.toString()] = a.sayi; });

        const ciftciler = await User.find({ _id: { $in: objIds } }).select('isim isletmeAdi').lean();

        const skorlar = ciftciler.map(c => {
            const cid = c._id.toString();
            const saglik = saglikMap[cid] || { sayi: 0, devamEden: 0 };
            const gecikmisAsi = asiMap[cid] || 0;

            let skor = 100;
            skor -= Math.min(saglik.sayi * 4, 30);      // Her kayıt -4 puan, max -30
            skor -= Math.min(saglik.devamEden * 8, 32); // Her devam eden tedavi -8, max -32
            skor -= Math.min(gecikmisAsi * 7, 28);      // Her gecikmiş aşı -7, max -28
            skor = Math.max(0, Math.round(skor));

            let renk = '#22c55e'; // yeşil
            if (skor < 80) renk = '#f59e0b'; // sarı
            if (skor < 50) renk = '#ef4444'; // kırmızı

            return {
                ciftciId: cid,
                isim: c.isim,
                isletmeAdi: c.isletmeAdi,
                skor,
                renk,
                saglikKaydiSayisi: saglik.sayi,
                devamEdenTedavi: saglik.devamEden,
                gecikmisAsiSayisi: gecikmisAsi
            };
        });

        // Skora göre sırala (en kötü önce)
        skorlar.sort((a, b) => a.skor - b.skor);
        res.json(skorlar);
    } catch (err) {
        console.error('Saglik skoru error:', err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// ========== AŞI TAKVİMİ (VET TARAFINDAN MÜŞTERİ İÇİN) ==========
router.get('/asi-takvimi/:ciftciId', async (req, res) => {
    try {
        const { ciftciId } = req.params;
        const vetId = req.originalUserId;
        const veteriner = await User.findById(vetId).select('musteriler').lean();
        if (!(veteriner.musteriler || []).some(m => m.toString() === ciftciId)) {
            return res.status(403).json({ message: 'Bu çiftliğe erişim izniniz yok.' });
        }
        const kayitlar = await AsiTakvimi.find({ userId: ciftciId })
            .sort({ sonrakiTarih: 1 })
            .lean();
        res.json(kayitlar);
    } catch (err) {
        console.error('Vet asi takvimi error:', err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

router.post('/asi-takvimi', async (req, res) => {
    try {
        const vetId = req.originalUserId;
        const { ciftciId, asiAdi, hayvanId, hayvanTipi, hayvanIsim, hayvanKupeNo, uygulamaTarihi, sonrakiTarih, tekrarPeriyodu, doz, notlar, maliyet } = req.body;
        if (!ciftciId || !asiAdi || !uygulamaTarihi) {
            return res.status(400).json({ message: 'Çiftlik, aşı adı ve tarih zorunlu.' });
        }
        const veteriner = await User.findById(vetId).select('musteriler isim').lean();
        if (!(veteriner.musteriler || []).some(m => m.toString() === ciftciId)) {
            return res.status(403).json({ message: 'Bu çiftliğe erişim izniniz yok.' });
        }

        const kayit = await AsiTakvimi.create({
            userId: ciftciId,
            hayvanId: hayvanId || null,
            hayvanTipi: hayvanTipi || 'hepsi',
            hayvanIsim: hayvanIsim || '',
            hayvanKupeNo: hayvanKupeNo || '',
            asiAdi,
            uygulamaTarihi: new Date(uygulamaTarihi),
            sonrakiTarih: sonrakiTarih ? new Date(sonrakiTarih) : null,
            tekrarPeriyodu: tekrarPeriyodu || 0,
            uygulayan: `Dr. ${veteriner.isim}`,
            doz: doz || '',
            notlar: notlar || '',
            maliyet: parseFloat(maliyet) || 0,
            durum: 'yapildi'
        });

        // Çiftçiye bildirim
        await Bildirim.create({
            userId: ciftciId,
            baslik: 'Yeni Aşı Kaydı',
            mesaj: `Dr. ${veteriner.isim} tarafından ${hayvanKupeNo || hayvanIsim || 'hayvanınıza'} ${asiAdi} aşısı uygulandı.`,
            tip: 'saglik',
            hayvanId: hayvanId || undefined,
            hayvanTipi: hayvanTipi || 'genel'
        });

        res.status(201).json(kayit);
    } catch (err) {
        console.error('Vet asi ekle error:', err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

router.put('/asi-takvimi/:id/tamamla', async (req, res) => {
    try {
        const vetId = req.originalUserId;
        const kayit = await AsiTakvimi.findById(req.params.id);
        if (!kayit) return res.status(404).json({ message: 'Kayıt bulunamadı.' });
        const veteriner = await User.findById(vetId).select('musteriler').lean();
        if (!(veteriner.musteriler || []).some(m => m.toString() === kayit.userId.toString())) {
            return res.status(403).json({ message: 'Yetkisiz.' });
        }
        kayit.durum = 'yapildi';
        if (kayit.tekrarPeriyodu > 0) {
            const yeni = new Date();
            yeni.setDate(yeni.getDate() + kayit.tekrarPeriyodu);
            kayit.sonrakiTarih = yeni;
        }
        await kayit.save();
        res.json(kayit);
    } catch (err) {
        console.error('Asi tamamla error:', err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// ========== HASTALIK DAĞILIM HARİTASI ==========
router.get('/rapor/hastalik-dagilimi', async (req, res) => {
    try {
        const vetId = req.originalUserId;
        const veteriner = await User.findById(vetId).select('musteriler').lean();
        const musteriIds = (veteriner.musteriler || []).map(m => m.toString());
        if (musteriIds.length === 0) return res.json([]);

        const objIds = musteriIds.map(id => new mongoose.Types.ObjectId(id));
        const ucAyOnce = new Date();
        ucAyOnce.setMonth(ucAyOnce.getMonth() - 3);

        const kayitlar = await SaglikKaydi.find({
            userId: { $in: objIds },
            tarih: { $gte: ucAyOnce },
            tani: { $exists: true, $ne: '' }
        }).select('userId tani tip tarih').lean();

        const ciftciler = await User.find({ _id: { $in: objIds } }).select('isim isletmeAdi').lean();
        const ciftciMap = {};
        ciftciler.forEach(c => { ciftciMap[c._id.toString()] = c.isletmeAdi || c.isim || 'Çiftlik'; });

        // Hastalık x Çiftlik matrisi
        const matris = {}; // { tani: { ciftlikAdi: count } }
        const hastaliklardanSayi = {};

        kayitlar.forEach(k => {
            const tani = (k.tani || k.tip || 'Diğer').trim().slice(0, 30);
            const ciftlik = ciftciMap[k.userId?.toString()] || 'Çiftlik';
            if (!matris[tani]) matris[tani] = {};
            matris[tani][ciftlik] = (matris[tani][ciftlik] || 0) + 1;
            hastaliklardanSayi[tani] = (hastaliklardanSayi[tani] || 0) + 1;
        });

        // En sık 10 hastalık
        const enSikHastaliklar = Object.entries(hastaliklardanSayi)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tani, toplamSayi]) => ({
                tani,
                toplamSayi,
                ciftlikler: Object.entries(matris[tani] || {}).map(([ciftlik, sayi]) => ({ ciftlik, sayi }))
            }));

        res.json(enSikHastaliklar);
    } catch (err) {
        console.error('Hastalik dagilim error:', err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// ========== TEDAVİ PROTOKOL ŞABLONLARI ==========
router.get('/protokoller', async (req, res) => {
    try {
        const vetId = req.originalUserId;
        const protokoller = await TedaviProtokol.find({ veterinerId: vetId }).sort({ kullanilmaSayisi: -1 }).lean();
        res.json(protokoller);
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

router.post('/protokoller', async (req, res) => {
    try {
        const vetId = req.originalUserId;
        const { ad, hastalik, tip, tani, tedaviNotu, ilaclar } = req.body;
        if (!ad || !tani) return res.status(400).json({ message: 'Protokol adı ve tanı zorunlu.' });
        const protokol = await TedaviProtokol.create({
            veterinerId: vetId,
            ad: ad.trim(),
            hastalik: hastalik?.trim() || '',
            tip: tip || 'hastalik',
            tani: tani.trim(),
            tedaviNotu: tedaviNotu?.trim() || '',
            ilaclar: Array.isArray(ilaclar) ? ilaclar : []
        });
        res.status(201).json(protokol);
    } catch (err) {
        console.error('Protokol ekle error:', err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

router.delete('/protokoller/:id', async (req, res) => {
    try {
        const vetId = req.originalUserId;
        const p = await TedaviProtokol.findOne({ _id: req.params.id, veterinerId: vetId });
        if (!p) return res.status(404).json({ message: 'Protokol bulunamadı.' });
        await p.deleteOne();
        res.json({ message: 'Silindi.' });
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// Protokol kullanıldığında sayacı artır
router.patch('/protokoller/:id/kullan', async (req, res) => {
    try {
        const vetId = req.originalUserId;
        await TedaviProtokol.findOneAndUpdate(
            { _id: req.params.id, veterinerId: vetId },
            { $inc: { kullanilmaSayisi: 1 } }
        );
        res.json({ ok: true });
    } catch (_) {
        res.json({ ok: false });
    }
});

// ========== ÇİFTLİK AYLIK SAĞLIK RAPORU (PDF için) ==========
router.get('/hastalar/:ciftciId/saglik-raporu', async (req, res) => {
    try {
        const vetId = req.originalUserId;
        const { ciftciId } = req.params;
        const veteriner = await User.findById(vetId).select('musteriler isim klinikAdi').lean();
        if (!(veteriner.musteriler || []).some(m => m.toString() === ciftciId)) {
            return res.status(403).json({ message: 'Erişim izniniz yok.' });
        }

        const ciftci = await User.findById(ciftciId).select('isim isletmeAdi sehir telefon').lean();
        if (!ciftci) return res.status(404).json({ message: 'Çiftlik bulunamadı.' });

        const buAyBaslangic = new Date();
        buAyBaslangic.setDate(1);
        buAyBaslangic.setHours(0, 0, 0, 0);

        const [inekSayisi, kayitlar, asilar] = await Promise.all([
            Inek.countDocuments({ userId: ciftciId }),
            SaglikKaydi.find({ userId: ciftciId, tarih: { $gte: buAyBaslangic } }).sort({ tarih: -1 }).lean(),
            AsiTakvimi.find({ userId: ciftciId, uygulamaTarihi: { $gte: buAyBaslangic } }).lean()
        ]);

        // Toplam maliyet
        const toplamMaliyet = kayitlar.reduce((s, k) => s + (k.maliyet || 0), 0);

        // Hastalık dağılımı
        const taniSayisi = {};
        kayitlar.forEach(k => {
            const t = (k.tani || k.tip || 'Diğer').trim();
            taniSayisi[t] = (taniSayisi[t] || 0) + 1;
        });
        const hastalikDagilimi = Object.entries(taniSayisi)
            .sort((a, b) => b[1] - a[1])
            .map(([ad, sayi]) => ({ ad, sayi }));

        // Devam eden tedaviler
        const devamEdenler = kayitlar.filter(k => k.durum === 'devam_ediyor');

        res.json({
            donem: buAyBaslangic.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
            ciftci,
            veteriner: { isim: veteriner.isim, klinikAdi: veteriner.klinikAdi },
            inekSayisi,
            toplamKayit: kayitlar.length,
            toplamAsi: asilar.length,
            toplamMaliyet,
            hastalikDagilimi,
            devamEdenTedavi: devamEdenler.length,
            kayitlar: kayitlar.slice(0, 50), // Max 50 kayıt PDF'e
            asilar
        });
    } catch (err) {
        console.error('Saglik raporu error:', err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

module.exports = router;
