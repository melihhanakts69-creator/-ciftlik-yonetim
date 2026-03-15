const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const SaglikKaydi = require('../models/SaglikKaydi');
const AsiTakvimi = require('../models/AsiTakvimi');
const Stok = require('../models/Stok');
const Timeline = require('../models/Timeline');
const Bildirim = require('../models/Bildirim');
const Finansal = require('../models/Finansal');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const mongoose = require('mongoose');

// Çiftçinin veterinerleri (beni müşteri olarak ekleyen aktif veterinerler)
// Vet musteriler'de çiftlik sahibi User _id tutulur; çiftçi girişinde req.userId veya tenant owner kullanılır
router.get('/veterinerlerim', auth, checkRole(['ciftci']), async (req, res) => {
    try {
        let ciftciId = (req.userId || req.originalUserId || '').toString().trim();
        if (req.tenantId && mongoose.Types.ObjectId.isValid(req.tenantId)) {
            const tenant = await Tenant.findById(req.tenantId).select('ownerUser').lean();
            if (tenant?.ownerUser) ciftciId = tenant.ownerUser.toString();
        }
        if (!ciftciId) return res.json([]);
        const ciftciObjId = mongoose.Types.ObjectId.isValid(ciftciId) ? new mongoose.Types.ObjectId(ciftciId) : null;
        if (!ciftciObjId) return res.json([]);
        const list = await User.find({
            rol: 'veteriner',
            musteriler: ciftciObjId
        }).select('isim email telefon klinikAdi').lean();
        res.json(list || []);
    } catch (error) {
        console.error('Veterinerlerim hatasi:', error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// ============================
//  SAĞLIK KAYITLARI
// ============================

// Tüm sağlık kayıtlarını getir (filtreleme destekli)
router.get('/', auth, checkRole(['ciftci', 'veteriner']), async (req, res) => {
    try {
        const { tip, durum, hayvanTipi, hayvanId, baslangic, bitis, limit = 50, page = 1 } = req.query;

        const filter = { userId: req.userId };
        if (tip) filter.tip = tip;
        if (durum) filter.durum = durum;
        if (hayvanTipi) filter.hayvanTipi = hayvanTipi;
        if (hayvanId) filter.hayvanId = hayvanId;
        if (baslangic || bitis) {
            filter.tarih = {};
            if (baslangic) filter.tarih.$gte = new Date(baslangic);
            if (bitis) filter.tarih.$lte = new Date(bitis);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [kayitlar, toplam] = await Promise.all([
            SaglikKaydi.find(filter)
                .sort({ tarih: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            SaglikKaydi.countDocuments(filter)
        ]);

        res.json({
            kayitlar,
            sayfa: {
                current: parseInt(page),
                total: Math.ceil(toplam / parseInt(limit)),
                toplam
            }
        });
    } catch (error) {
        console.error('Sağlık kayıtları hatası:', error);
        res.status(500).json({ message: 'Sağlık kayıtları alınamadı' });
    }
});

// Belirli hayvanın sağlık geçmişi
router.get('/hayvan/:hayvanId', auth, checkRole(['ciftci', 'veteriner']), async (req, res) => {
    try {
        const kayitlar = await SaglikKaydi.hayvanGecmisi(req.userId, req.params.hayvanId);
        res.json(kayitlar);
    } catch (error) {
        console.error('Hayvan sağlık geçmişi hatası:', error);
        res.status(500).json({ message: 'Sağlık geçmişi alınamadı' });
    }
});

// Sağlık istatistikleri
router.get('/istatistik', auth, checkRole(['ciftci', 'veteriner']), async (req, res) => {
    try {
        const istatistikler = await SaglikKaydi.istatistikler(req.userId);

        // Aşı takvimi istatistikleri de ekle
        const gecikmisAsi = await AsiTakvimi.gecikmisAsilar(req.userId);
        const yaklasanAsi = await AsiTakvimi.yaklasanAsilar(req.userId);

        res.json({
            ...istatistikler,
            gecikmisAsi: gecikmisAsi.length,
            yaklasanAsi: yaklasanAsi.length
        });
    } catch (error) {
        console.error('Sağlık istatistik hatası:', error);
        res.status(500).json({ message: 'İstatistikler alınamadı' });
    }
});

// Yaklaşan kontroller ve aşılar
router.get('/yaklasan', auth, checkRole(['ciftci', 'veteriner']), async (req, res) => {
    try {
        const gun = parseInt(req.query.gun) || 7;

        // Yaklaşan kontroller (SaglikKaydi)
        const yediGunSonra = new Date();
        yediGunSonra.setDate(yediGunSonra.getDate() + gun);

        const yaklasanKontroller = await SaglikKaydi.find({
            userId: req.userId,
            sonrakiKontrol: {
                $gte: new Date(),
                $lte: yediGunSonra
            },
            durum: 'devam_ediyor'
        }).sort({ sonrakiKontrol: 1 }).lean();

        // Yaklaşan aşılar
        const yaklasanAsilar = await AsiTakvimi.yaklasanAsilar(req.userId, gun);

        // Gecikmiş aşılar
        const gecikmisAsilar = await AsiTakvimi.gecikmisAsilar(req.userId);

        res.json({
            yaklasanKontroller,
            yaklasanAsilar,
            gecikmisAsilar
        });
    } catch (error) {
        console.error('Yaklaşan sağlık hatası:', error);
        res.status(500).json({ message: 'Yaklaşan bilgiler alınamadı' });
    }
});

// Yeni sağlık kaydı oluştur
router.post('/', auth, checkRole(['ciftci', 'veteriner']), async (req, res) => {
    try {
        const { userId: _u, _id, ...safeBody } = req.body;

        const kayit = new SaglikKaydi({
            ...safeBody,
            userId: req.userId,
            kayitSahibi: {
                tip: req.user?.rol === 'veteriner' ? 'veteriner' : 'ciftci',
                sahipId: req.originalUserId || req.userId
            }
        });
        await kayit.save();

        // ── İLAÇ STOK DÜŞÜM ─────────────────────────────────────
        for (const ilac of kayit.ilaclar || []) {
            if (!ilac.ilacAdi || !(ilac.kullanilanMiktar || ilac.kullanılanMiktar)) continue;
            const miktar = ilac.kullanilanMiktar || ilac.kullanılanMiktar || 0;
            const stok = await Stok.findOne({
                userId: req.userId,
                urunAdi: { $regex: new RegExp(ilac.ilacAdi.trim(), 'i') },
                kategori: { $in: ['İlaç', 'Antibiyotik', 'Vitamin', 'Anti-inflamatuar', 'Paraziter'] }
            });
            if (stok) {
                stok.miktar = Math.max(0, stok.miktar - miktar);
                stok.sonGuncelleme = new Date();
                await stok.save();
                if (stok.miktar <= (stok.kritikSeviye || 0)) {
                    const mevcutBildirim = await Bildirim.findOne({
                        userId: req.userId,
                        tip: 'stok',
                        tamamlandi: false,
                        'metadata.stokId': stok._id.toString()
                    });
                    if (!mevcutBildirim) {
                        await Bildirim.create({
                            userId: req.userId,
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

        // ── SÜT KORUMA ZİNCİRİ (çiftçi kendi kaydı) ──────────────
        const ilaclarArr = kayit.ilaclar || [];
        const maxArinmaSut = Math.max(0, ...ilaclarArr.map(i => i.arinmaSuresiSut || 0));
        const maxArinmaEt = Math.max(0, ...ilaclarArr.map(i => i.arinmaSuresiEt || 0));
        if (maxArinmaSut > 0 || maxArinmaEt > 0) {
            const bugun = new Date();
            if (maxArinmaSut > 0) {
                kayit.sutYasakBitis = new Date(bugun);
                kayit.sutYasakBitis.setDate(bugun.getDate() + maxArinmaSut);
                kayit.sutYasakAktif = true;
            }
            if (maxArinmaEt > 0) {
                kayit.etYasakBitis = new Date(bugun);
                kayit.etYasakBitis.setDate(bugun.getDate() + maxArinmaEt);
            }
            await kayit.save();
            const sutBitisStr = kayit.sutYasakBitis ? kayit.sutYasakBitis.toLocaleDateString('tr-TR') : null;
            const ilacAdlari = ilaclarArr.map(i => i.ilacAdi).filter(Boolean).join(', ');
            await Bildirim.create({
                userId: req.userId,
                tip: 'saglik',
                oncelik: 'acil',
                baslik: `Süt Yasağı: ${kayit.hayvanIsim || kayit.hayvanKupeNo}`,
                mesaj: `${ilacAdlari} nedeniyle${sutBitisStr ? ` ${sutBitisStr} tarihine kadar` : ''} bu hayvanın sütü tanka karıştırılmamalıdır.`,
                hayvanId: kayit.hayvanId,
                hayvanTipi: kayit.hayvanTipi,
                kupe_no: kayit.hayvanKupeNo,
                hatirlatmaTarihi: bugun,
                metadata: { tip: 'sut_yasak', sutYasakBitis: kayit.sutYasakBitis, ilacAdlari }
            });
        }
        // ── ZİNCİR SONU ─────────────────────────────────────────

        // Timeline'a otomatik kayıt
        try {
            const tipMap = {
                hastalik: 'hastalik',
                tedavi: 'muayene',
                asi: 'asi',
                muayene: 'muayene',
                ameliyat: 'hastalik',
                dogum_komplikasyonu: 'dogum'
            };

            await Timeline.create({
                userId: req.userId,
                hayvanId: kayit.hayvanId.toString(),
                hayvanTipi: kayit.hayvanTipi,
                tip: tipMap[kayit.tip] || 'genel',
                tarih: kayit.tarih.toISOString().split('T')[0],
                aciklama: `${kayit.tip === 'hastalik' ? '🤒 Hastalık' : kayit.tip === 'tedavi' ? '💊 Tedavi' : kayit.tip === 'asi' ? '💉 Aşı' : kayit.tip === 'muayene' ? '🩺 Muayene' : kayit.tip === 'ameliyat' ? '🔪 Ameliyat' : '⚠️ Komplikasyon'}: ${kayit.tani}`
            });
        } catch (timelineErr) {
            console.error('Timeline kayıt hatası (kritik değil):', timelineErr.message);
        }

        // Maliyet varsa Finansal gider kaydı (tek kaynak: Finansal)
        if (kayit.maliyet > 0) {
            try {
                const tarihStr = kayit.tarih instanceof Date ? kayit.tarih.toISOString().split('T')[0] : (kayit.tarih || new Date().toISOString().split('T')[0]);
                await Finansal.create({
                    userId: req.userId,
                    tip: 'gider',
                    kategori: 'veteriner',
                    miktar: kayit.maliyet,
                    tarih: tarihStr,
                    aciklama: `${kayit.tani} - ${kayit.hayvanIsim || kayit.hayvanKupeNo || 'Hayvan'} (${kayit.tip})`
                });
            } catch (finansalErr) {
                console.error('Finansal kayıt hatası (kritik değil):', finansalErr.message);
            }
        }

        // Ölüm ise tahmini zarar Finansal gider olarak ekle
        const tahminiZarar = parseFloat(req.body.tahminiZarar);
        if (kayit.durum === 'oldu' && tahminiZarar > 0) {
            try {
                const tarihStr = kayit.tarih instanceof Date ? kayit.tarih.toISOString().split('T')[0] : (kayit.tarih || new Date().toISOString().split('T')[0]);
                await Finansal.create({
                    userId: req.userId,
                    tip: 'gider',
                    kategori: 'hayvan-olum',
                    miktar: tahminiZarar,
                    tarih: tarihStr,
                    aciklama: `Hayvan ölümü: ${kayit.hayvanIsim || kayit.hayvanKupeNo || 'Hayvan'} - ${kayit.tani}`
                });
            } catch (finansalErr) {
                console.error('Finansal hayvan ölümü kayıt hatası (kritik değil):', finansalErr.message);
            }
        }

        // Sonraki kontrol varsa bildirim oluştur
        if (kayit.sonrakiKontrol) {
            try {
                await Bildirim.create({
                    userId: req.userId,
                    tip: 'muayene',
                    baslik: `Kontrol Hatırlatması: ${kayit.hayvanIsim || kayit.hayvanKupeNo || 'Hayvan'}`,
                    mesaj: `${kayit.tani} tedavisi için kontrol zamanı geldi.`,
                    hayvanId: kayit.hayvanId,
                    hayvanTipi: kayit.hayvanTipi,
                    kupe_no: kayit.hayvanKupeNo,
                    oncelik: 'yuksek',
                    hatirlatmaTarihi: kayit.sonrakiKontrol
                });
            } catch (bildirimErr) {
                console.error('Bildirim oluşturma hatası (kritik değil):', bildirimErr.message);
            }
        }

        res.status(201).json({ message: 'Sağlık kaydı oluşturuldu', kayit });
    } catch (error) {
        console.error('Sağlık kaydı oluşturma hatası:', error);
        res.status(400).json({ message: error.message || 'Sağlık kaydı oluşturulamadı' });
    }
});

// Sağlık kaydını güncelle (çiftçi: kendi kaydı, veteriner: kayitSahibi.sahipId ile oluşturduğu)
router.put('/:id', auth, checkRole(['ciftci', 'veteriner']), async (req, res) => {
    try {
        const { userId, _id, tahminiZarar: reqTahminiZarar, ...safeBody } = req.body;

        const mevcut = await SaglikKaydi.findById(req.params.id).lean();
        if (!mevcut) return res.status(404).json({ message: 'Sağlık kaydı bulunamadı' });

        const sahipIdStr = mevcut.kayitSahibi?.sahipId?.toString();
        const izinli = mevcut.userId.toString() === req.userId ||
            (req.originalUserId && sahipIdStr === req.originalUserId);
        if (!izinli) return res.status(403).json({ message: 'Bu kaydı güncelleme yetkiniz yok' });

        const kayit = await SaglikKaydi.findByIdAndUpdate(
            req.params.id,
            { ...safeBody },
            { new: true, runValidators: true }
        );

        // Durum 'oldu' olarak güncellendiyse ve tahmini zarar varsa Finansal gider ekle
        const tahminiZarar = parseFloat(reqTahminiZarar);
        if (kayit.durum === 'oldu' && tahminiZarar > 0) {
            try {
                const tarihStr = kayit.tarih instanceof Date ? kayit.tarih.toISOString().split('T')[0] : (kayit.tarih || new Date().toISOString().split('T')[0]);
                await Finansal.create({
                    userId: req.userId,
                    tip: 'gider',
                    kategori: 'hayvan-olum',
                    miktar: tahminiZarar,
                    tarih: tarihStr,
                    aciklama: `Hayvan ölümü: ${kayit.hayvanIsim || kayit.hayvanKupeNo || 'Hayvan'} - ${kayit.tani}`
                });
            } catch (finansalErr) {
                console.error('Finansal hayvan ölümü kayıt hatası (kritik değil):', finansalErr.message);
            }
        }

        res.json({ message: 'Sağlık kaydı güncellendi', kayit });
    } catch (error) {
        console.error('Sağlık kaydı güncelleme hatası:', error);
        res.status(400).json({ message: error.message || 'Sağlık kaydı güncellenemedi' });
    }
});

// Sağlık kaydını sil (çiftçi: kendi kaydı, veteriner: kayitSahibi.sahipId ile oluşturduğu kayıt)
router.delete('/:id', auth, checkRole(['ciftci', 'veteriner']), async (req, res) => {
    try {
        const kayit = await SaglikKaydi.findById(req.params.id).lean();
        if (!kayit) return res.status(404).json({ message: 'Sağlık kaydı bulunamadı' });

        const sahipIdStr = kayit.kayitSahibi?.sahipId?.toString();
        const izinli = kayit.userId.toString() === req.userId ||
            (req.originalUserId && sahipIdStr === req.originalUserId);

        if (!izinli) return res.status(403).json({ message: 'Bu kaydı silme yetkiniz yok' });

        await SaglikKaydi.findByIdAndDelete(req.params.id);
        res.json({ message: 'Sağlık kaydı silindi' });
    } catch (error) {
        console.error('Sağlık kaydı silme hatası:', error);
        res.status(500).json({ message: 'Sağlık kaydı silinemedi' });
    }
});


// ============================
//  AŞI TAKVİMİ
// ============================

// Aşı takvimi listesi
router.get('/asi-takvimi', auth, checkRole(['ciftci', 'veteriner']), async (req, res) => {
    try {
        const { durum, hayvanTipi, limit = 50, page = 1 } = req.query;

        const filter = { userId: req.userId };
        if (durum) filter.durum = durum;
        if (hayvanTipi) filter.hayvanTipi = hayvanTipi;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [asilar, toplam] = await Promise.all([
            AsiTakvimi.find(filter)
                .sort({ sonrakiTarih: 1, uygulamaTarihi: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            AsiTakvimi.countDocuments(filter)
        ]);

        res.json({
            asilar,
            sayfa: {
                current: parseInt(page),
                total: Math.ceil(toplam / parseInt(limit)),
                toplam
            }
        });
    } catch (error) {
        console.error('Aşı takvimi hatası:', error);
        res.status(500).json({ message: 'Aşı takvimi alınamadı' });
    }
});

// Yeni aşı kaydı
router.post('/asi', auth, checkRole(['ciftci', 'veteriner']), async (req, res) => {
    try {
        const { userId: _u, _id, ...safeBody } = req.body;

        const asi = new AsiTakvimi({
            ...safeBody,
            userId: req.userId
        });
        await asi.save();

        // Toplu aşı ise tüm hayvanlara bireysel kayıt oluştur
        const isToplu = (!req.body.hayvanTipi || req.body.hayvanTipi === 'hepsi') && !req.body.hayvanId;
        if (isToplu) {
            const hedefTipler = req.body.hayvanTipi === 'hepsi'
                ? ['inek', 'duve', 'buzagi', 'tosun']
                : [req.body.hayvanTipi || 'inek'];

            const modelMap = {
                inek: require('../models/Inek'),
                duve: require('../models/Duve'),
                buzagi: require('../models/Buzagi'),
                tosun: require('../models/Tosun')
            };

            let toplamHayvan = 0;

            for (const tip of hedefTipler) {
                const Model = modelMap[tip];
                if (!Model) continue;
                const hayvanlar = await Model.find({
                    userId: req.userId,
                    durum: 'Aktif'
                }).lean();

                toplamHayvan += hayvanlar.length;

                const basBasinaMaliyet = hayvanlar.length > 0 && asi.maliyet > 0
                    ? asi.maliyet / hayvanlar.length
                    : 0;

                const kayitlar = hayvanlar.map(h => ({
                    userId: req.userId,
                    hayvanId: h._id,
                    hayvanTipi: tip,
                    hayvanIsim: h.isim,
                    hayvanKupeNo: h.kupeNo,
                    asiAdi: asi.asiAdi,
                    uygulamaTarihi: asi.uygulamaTarihi,
                    sonrakiTarih: asi.sonrakiTarih,
                    tekrarPeriyodu: asi.tekrarPeriyodu,
                    uygulayan: asi.uygulayan,
                    doz: asi.doz,
                    maliyet: Math.round(basBasinaMaliyet * 100) / 100,
                    durum: 'yapildi',
                    notlar: `Toplu aşı — ${toplamHayvan} hayvan`
                }));

                if (kayitlar.length > 0) {
                    await AsiTakvimi.insertMany(kayitlar);
                }
            }
        }

        // Sonraki aşı tarihi varsa bildirim oluştur
        if (asi.sonrakiTarih) {
            try {
                await Bildirim.create({
                    userId: req.userId,
                    tip: 'asi',
                    baslik: `Aşı Hatırlatması: ${asi.asiAdi}`,
                    mesaj: `${asi.hayvanIsim || asi.hayvanKupeNo || (asi.hayvanTipi === 'hepsi' ? 'Toplu aşı' : 'Hayvan')} için ${asi.asiAdi} aşı zamanı.`,
                    hayvanId: asi.hayvanId || undefined,
                    hayvanTipi: asi.hayvanTipi === 'hepsi' ? 'genel' : asi.hayvanTipi,
                    kupe_no: asi.hayvanKupeNo,
                    oncelik: 'yuksek',
                    hatirlatmaTarihi: asi.sonrakiTarih
                });
            } catch (bildirimErr) {
                console.error('Aşı bildirim hatası (kritik değil):', bildirimErr.message);
            }
        }

        // Maliyet varsa Finansal gider kaydı (tek kaynak: Finansal)
        if (asi.maliyet > 0) {
            try {
                const tarihStr = asi.uygulamaTarihi instanceof Date ? asi.uygulamaTarihi.toISOString().split('T')[0] : (asi.uygulamaTarihi || new Date().toISOString().split('T')[0]);
                await Finansal.create({
                    userId: req.userId,
                    tip: 'gider',
                    kategori: 'veteriner',
                    miktar: asi.maliyet,
                    tarih: tarihStr,
                    aciklama: `Aşı: ${asi.asiAdi} - ${asi.hayvanIsim || asi.hayvanKupeNo || 'Toplu'}`
                });
            } catch (finansalErr) {
                console.error('Aşı Finansal kayıt hatası (kritik değil):', finansalErr.message);
            }
        }

        // Timeline kaydı
        if (asi.hayvanId) {
            try {
                await Timeline.create({
                    userId: req.userId,
                    hayvanId: asi.hayvanId.toString(),
                    hayvanTipi: asi.hayvanTipi,
                    tip: 'asi',
                    tarih: asi.uygulamaTarihi.toISOString().split('T')[0],
                    aciklama: `💉 Aşı: ${asi.asiAdi}`
                });
            } catch (timelineErr) {
                console.error('Aşı timeline hatası (kritik değil):', timelineErr.message);
            }
        }

        res.status(201).json({ message: 'Aşı kaydı oluşturuldu', asi });
    } catch (error) {
        console.error('Aşı oluşturma hatası:', error);
        res.status(400).json({ message: error.message || 'Aşı kaydı oluşturulamadı' });
    }
});

// Aşı güncelle
router.put('/asi/:id', auth, checkRole(['ciftci', 'veteriner']), async (req, res) => {
    try {
        const { userId, _id, ...safeBody } = req.body;

        const asi = await AsiTakvimi.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            safeBody,
            { new: true, runValidators: true }
        );

        if (!asi) {
            return res.status(404).json({ message: 'Aşı kaydı bulunamadı' });
        }

        res.json({ message: 'Aşı kaydı güncellendi', asi });
    } catch (error) {
        console.error('Aşı güncelleme hatası:', error);
        res.status(400).json({ message: error.message || 'Aşı kaydı güncellenemedi' });
    }
});

// Aşı sil
router.delete('/asi/:id', auth, checkRole(['ciftci', 'veteriner']), async (req, res) => {
    try {
        const asi = await AsiTakvimi.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!asi) {
            return res.status(404).json({ message: 'Aşı kaydı bulunamadı' });
        }

        res.json({ message: 'Aşı kaydı silindi' });
    } catch (error) {
        console.error('Aşı silme hatası:', error);
        res.status(500).json({ message: 'Aşı kaydı silinemedi' });
    }
});

module.exports = router;
