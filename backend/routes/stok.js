const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Stok = require('../models/Stok');

// @route   GET /api/stok
// @desc    Tüm stokları getir
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const stoklar = await Stok.find({ userId: req.userId }).sort({ urunAdi: 1 });
        res.json(stoklar);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Hatası');
    }
});

// @route   POST /api/stok
// @desc    Yeni stok ekle
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { urunAdi, kategori, miktar, birim, kritikSeviye, notlar } = req.body;

        const yeniStok = new Stok({
            userId: req.userId,
            urunAdi,
            kategori,
            miktar,
            birim,
            kritikSeviye,
            notlar
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
router.put('/:id', auth, async (req, res) => {
    try {
        let stok = await Stok.findById(req.params.id);
        if (!stok) return res.status(404).json({ msg: 'Stok bulunamadı' });
        if (stok.userId.toString() !== req.userId) return res.status(401).json({ msg: 'Yetkisiz işlem' });

        const { urunAdi, kategori, miktar, birim, kritikSeviye, notlar, islem } = req.body;

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
        }

        stok.sonGuncelleme = Date.now();
        await stok.save();
        res.json(stok);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Hatası');
    }
});

// @route   DELETE /api/stok/:id
// @desc    Stok sil
// @access  Private
router.delete('/:id', auth, async (req, res) => {
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
