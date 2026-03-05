const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const SaglikKaydi = require('../models/SaglikKaydi');
const AsiTakvimi = require('../models/AsiTakvimi');
const Timeline = require('../models/Timeline');
const Bildirim = require('../models/Bildirim');
const Maliyet = require('../models/Maliyet');
const mongoose = require('mongoose');

// ============================
//  SAĞLIK KAYITLARI
// ============================

// Tüm sağlık kayıtlarını getir (filtreleme destekli)
router.get('/', auth, checkRole(['ciftci', 'veteriner', 'sutcu']), async (req, res) => {
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
router.get('/hayvan/:hayvanId', auth, checkRole(['ciftci', 'veteriner', 'sutcu']), async (req, res) => {
    try {
        const kayitlar = await SaglikKaydi.hayvanGecmisi(req.userId, req.params.hayvanId);
        res.json(kayitlar);
    } catch (error) {
        console.error('Hayvan sağlık geçmişi hatası:', error);
        res.status(500).json({ message: 'Sağlık geçmişi alınamadı' });
    }
});

// Sağlık istatistikleri
router.get('/istatistik', auth, checkRole(['ciftci', 'veteriner', 'sutcu']), async (req, res) => {
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
router.get('/yaklasan', auth, checkRole(['ciftci', 'veteriner', 'sutcu']), async (req, res) => {
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
router.post('/', auth, checkRole(['ciftci', 'veteriner', 'sutcu']), async (req, res) => {
    try {
        const { userId: _u, _id, ...safeBody } = req.body;

        const kayit = new SaglikKaydi({
            ...safeBody,
            userId: req.userId
        });
        await kayit.save();

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

        // Maliyet varsa otomatik gider kaydı
        if (kayit.maliyet > 0) {
            try {
                await Maliyet.create({
                    userId: req.userId,
                    kategori: 'veteriner',
                    tutar: kayit.maliyet,
                    tarih: kayit.tarih,
                    aciklama: `${kayit.tani} - ${kayit.hayvanIsim || kayit.hayvanKupeNo || 'Hayvan'} (${kayit.tip})`
                });
            } catch (maliyetErr) {
                console.error('Maliyet kayıt hatası (kritik değil):', maliyetErr.message);
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

// Sağlık kaydını güncelle
router.put('/:id', auth, checkRole(['ciftci', 'veteriner', 'sutcu']), async (req, res) => {
    try {
        const { userId, _id, ...safeBody } = req.body;

        const kayit = await SaglikKaydi.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            safeBody,
            { new: true, runValidators: true }
        );

        if (!kayit) {
            return res.status(404).json({ message: 'Sağlık kaydı bulunamadı' });
        }

        res.json({ message: 'Sağlık kaydı güncellendi', kayit });
    } catch (error) {
        console.error('Sağlık kaydı güncelleme hatası:', error);
        res.status(400).json({ message: error.message || 'Sağlık kaydı güncellenemedi' });
    }
});

// Sağlık kaydını sil
router.delete('/:id', auth, checkRole(['ciftci', 'veteriner', 'sutcu']), async (req, res) => {
    try {
        const kayit = await SaglikKaydi.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!kayit) {
            return res.status(404).json({ message: 'Sağlık kaydı bulunamadı' });
        }

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
router.get('/asi-takvimi', auth, checkRole(['ciftci', 'veteriner', 'sutcu']), async (req, res) => {
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
router.post('/asi', auth, checkRole(['ciftci', 'veteriner', 'sutcu']), async (req, res) => {
    try {
        const { userId: _u, _id, ...safeBody } = req.body;

        const asi = new AsiTakvimi({
            ...safeBody,
            userId: req.userId
        });
        await asi.save();

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

        // Maliyet varsa gider kaydı
        if (asi.maliyet > 0) {
            try {
                await Maliyet.create({
                    userId: req.userId,
                    kategori: 'veteriner',
                    tutar: asi.maliyet,
                    tarih: asi.uygulamaTarihi,
                    aciklama: `Aşı: ${asi.asiAdi} - ${asi.hayvanIsim || asi.hayvanKupeNo || 'Toplu'}`
                });
            } catch (maliyetErr) {
                console.error('Aşı maliyet hatası (kritik değil):', maliyetErr.message);
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
router.put('/asi/:id', auth, checkRole(['ciftci', 'veteriner', 'sutcu']), async (req, res) => {
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
router.delete('/asi/:id', auth, checkRole(['ciftci', 'veteriner', 'sutcu']), async (req, res) => {
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
