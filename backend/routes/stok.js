const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const Stok = require('../models/Stok');
const Bildirim = require('../models/Bildirim');

// @route   GET /api/stok
// @desc    Tüm stokları getir
// @access  Private
router.get('/', auth, checkRole(['ciftci', 'sutcu', 'veteriner']), async (req, res) => {
    try {
        const filter = { userId: req.userId };
        if (req.query.kategori) filter.kategori = req.query.kategori;
        const stoklar = await Stok.find(filter)
            .populate('yemKutuphanesiId')
            .sort({ urunAdi: 1 });
        res.json(stoklar);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Hatası');
    }
});

// @route   POST /api/stok
// @desc    Yeni stok ekle
// @access  Private
router.post('/', auth, checkRole(['ciftci', 'sutcu', 'veteriner']), async (req, res) => {
    try {
        const { urunAdi, kategori, miktar, birim, kritikSeviye, notlar, yemKutuphanesiId } = req.body;

        const yeniStok = new Stok({
            userId: req.userId,
            urunAdi,
            kategori,
            miktar,
            birim,
            kritikSeviye,
            notlar,
            yemKutuphanesiId: yemKutuphanesiId || undefined
        });

        const stok = await yeniStok.save();
        res.json(stok);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Hatası');
    }
});

// @route   PUT /api/stok/:id
// @desc    Stok güncelle (Miktar artır/azalt veya bilgi düzenle)
// @access  Private
router.put('/:id', auth, checkRole(['ciftci', 'sutcu', 'veteriner']), async (req, res) => {
    try {
        let stok = await Stok.findById(req.params.id);
        if (!stok) return res.status(404).json({ msg: 'Stok bulunamadı' });
        if (stok.userId.toString() !== req.userId) return res.status(401).json({ msg: 'Yetkisiz işlem' });

        const { urunAdi, kategori, miktar, birim, kritikSeviye, notlar, yemKutuphanesiId, islem } = req.body;

        // Eğer işlem 'ekle' veya 'cikar' ise miktarı güncelle
        if (islem === 'ekle') {
            stok.miktar += Number(miktar);
        } else if (islem === 'cikar') {
            stok.miktar -= Number(miktar);
        } else {
            // Doğrudan güncelleme
            if (urunAdi) stok.urunAdi = urunAdi;
            if (kategori) stok.kategori = kategori;
            if (miktar !== undefined) stok.miktar = miktar;
            if (birim) stok.birim = birim;
            if (kritikSeviye !== undefined) stok.kritikSeviye = kritikSeviye;
            if (notlar) stok.notlar = notlar;
            if (yemKutuphanesiId !== undefined) stok.yemKutuphanesiId = yemKutuphanesiId || undefined;
        }

        stok.sonGuncelleme = Date.now();
        await stok.save();

        // Kritik seviye kontrolü ve Bildirim oluşturma (tamamlanmadı kontrolü — stok tekrar kritik olana kadar bildirim yok)
        if (stok.kritikSeviye !== undefined && stok.miktar <= stok.kritikSeviye) {
            const mevcutBildirim = await Bildirim.findOne({
                userId: req.userId,
                tip: 'stok',
                tamamlandi: false,
                aktif: true,
                'metadata.stokId': stok._id.toString()
            });

            if (!mevcutBildirim) {
                await Bildirim.create({
                    userId: req.userId,
                    baslik: '⚠️ Kritik Stok Uyarısı',
                    mesaj: `${stok.urunAdi} kritik seviyenin altına düştü! Mevcut: ${stok.miktar} ${stok.birim || ''}, Kritik Eşiği: ${stok.kritikSeviye}`,
                    tip: 'stok',
                    oncelik: 'acil',
                    hatirlatmaTarihi: new Date(),
                    aktif: true,
                    metadata: { stokId: stok._id.toString(), urunAdi: stok.urunAdi }
                });
            }
        } else if (stok.kritikSeviye !== undefined && stok.miktar > stok.kritikSeviye) {
            // Stok kritik seviyenin üstüne çıktıysa bildirimi kapat
            await Bildirim.updateMany(
                { userId: req.userId, tip: 'stok', 'metadata.stokId': stok._id.toString(), tamamlandi: false },
                { tamamlandi: true, tamamlanmaTarihi: new Date() }
            );
        }

        res.json(stok);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Hatası');
    }
});

// @route   GET /api/stok/alim-onerisi
router.get('/alim-onerisi', auth, checkRole(['ciftci', 'sutcu', 'veteriner']), async (req, res) => {
    try {
        const uid = req.userId;
        const HEDEF_GUN = 30;

        const yemStoklar = await Stok.find({
            userId: uid,
            kategori: 'Yem'
        }).lean();

        const oneriler = [];
        for (const s of yemStoklar) {
            const gunlukTuketim = s.gunlukTuketim || 0;
            const yeterlilikGun = gunlukTuketim > 0
                ? Math.floor((s.miktar || 0) / gunlukTuketim)
                : 999;

            if (yeterlilikGun < HEDEF_GUN && gunlukTuketim > 0) {
                const eksikGun = HEDEF_GUN - yeterlilikGun;
                const gerekliKg = Math.ceil(eksikGun * gunlukTuketim);
                const birimFiyat = s.birimFiyat || 0;
                const tahminiMaliyet = gerekliKg * birimFiyat;
                oneriler.push({
                    _id: s._id,
                    urunAdi: s.urunAdi,
                    mevcutKg: s.miktar,
                    yeterlilikGun,
                    gerekliKg,
                    tahminiMaliyet,
                    oncelik: yeterlilikGun < 7 ? 'acil' : yeterlilikGun < 14 ? 'yuksek' : 'normal'
                });
            }
        }
        oneriler.sort((a, b) => a.yeterlilikGun - b.yeterlilikGun);
        const toplamMaliyet = oneriler.reduce((sum, o) => sum + (o.tahminiMaliyet || 0), 0);

        res.json({ oneriler, toplamMaliyet: +toplamMaliyet.toFixed(2), hedefGun: HEDEF_GUN });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Alım önerisi hesaplanamadı' });
    }
});

// @route   DELETE /api/stok/:id
// @desc    Stok sil
// @access  Private
router.delete('/:id', auth, checkRole(['ciftci', 'veteriner']), async (req, res) => {
    try {
        let stok = await Stok.findById(req.params.id);
        if (!stok) return res.status(404).json({ msg: 'Stok bulunamadı' });
        if (stok.userId.toString() !== req.userId) return res.status(401).json({ msg: 'Yetkisiz işlem' });

        await stok.deleteOne();
        res.json({ msg: 'Stok silindi' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Hatası');
    }
});

module.exports = router;
