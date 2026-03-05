const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const YemKutuphanesi = require('../models/YemKutuphanesi');

// @route   GET /api/yem-kutuphanesi
// @desc    Tüm yem kütüphanesi kayıtlarını getir
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const yemler = await YemKutuphanesi.find({ userId: req.userId }).sort({ ad: 1 });
        res.json(yemler);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Hatası');
    }
});

// @route   POST /api/yem-kutuphanesi/seed
// @desc    Varsayılan yem listesini (kütüphaneyi) kullanıcı için oluştur (İlk kurulum)
// @access  Private
router.post('/seed', auth, async (req, res) => {
    try {
        // Zaten kayıt varsa ekleme yapma
        const count = await YemKutuphanesi.countDocuments({ userId: req.userId });
        if (count > 0) {
            return res.status(400).json({ msg: 'Kütüphane zaten oluşturulmuş.' });
        }

        const seedData = [
            { ad: 'Mısır Silajı', kategori: 'kaba_yem', kuruMadde: 30, protein: 8, enerji: 2.4, nisasta: 28, birimFiyat: 2 },
            { ad: 'Yonca Otu', kategori: 'kaba_yem', kuruMadde: 88, protein: 16, enerji: 2.1, nisasta: 2, birimFiyat: 6 },
            { ad: 'Saman', kategori: 'kaba_yem', kuruMadde: 90, protein: 4, enerji: 1.4, nisasta: 1, birimFiyat: 1.5 },
            { ad: 'Soya Küspesi', kategori: 'kesif_yem', kuruMadde: 89, protein: 46, enerji: 3.1, nisasta: 5, birimFiyat: 15 },
            { ad: 'Ayçiçek Küspesi', kategori: 'kesif_yem', kuruMadde: 89, protein: 28, enerji: 2.5, nisasta: 2, birimFiyat: 8 },
            { ad: 'Arpa Ezmesi', kategori: 'kesif_yem', kuruMadde: 88, protein: 11, enerji: 3.1, nisasta: 58, birimFiyat: 7 },
            { ad: 'Mısır Flake', kategori: 'kesif_yem', kuruMadde: 88, protein: 9, enerji: 3.3, nisasta: 70, birimFiyat: 7.5 },
            { ad: 'Buğday Kepeği', kategori: 'kesif_yem', kuruMadde: 88, protein: 15, enerji: 2.4, nisasta: 20, birimFiyat: 5 },
            { ad: 'Süt Yemi (%19)', kategori: 'kesif_yem', kuruMadde: 88, protein: 19, enerji: 2.7, nisasta: 25, birimFiyat: 9 },
            { ad: 'Besi Yemi (%14)', kategori: 'kesif_yem', kuruMadde: 88, protein: 14, enerji: 2.8, nisasta: 30, birimFiyat: 8.5 },
            { ad: 'Mermer Tozu', kategori: 'vitamin_mineral', kuruMadde: 99, protein: 0, enerji: 0, nisasta: 0, birimFiyat: 1 },
            { ad: 'Tuz', kategori: 'vitamin_mineral', kuruMadde: 99, protein: 0, enerji: 0, nisasta: 0, birimFiyat: 2 }
        ].map(y => ({ ...y, userId: req.userId }));

        await YemKutuphanesi.insertMany(seedData);
        res.json({ msg: 'Varsayılan yem kütüphanesi başarıyla oluşturuldu.' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Hatası');
    }
});

// @route   POST /api/yem-kutuphanesi
// @desc    Manuel olarak yeni bir kütüphane yemi ekle
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const yeniYem = new YemKutuphanesi({
            userId: req.userId,
            ...req.body
        });

        const yem = await yeniYem.save();
        res.json(yem);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Hatası');
    }
});

// @route   PUT /api/yem-kutuphanesi/:id
// @desc    Kütüphane yemini güncelle
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        let yem = await YemKutuphanesi.findById(req.params.id);
        if (!yem) return res.status(404).json({ msg: 'Yem bulunamadı' });
        if (yem.userId.toString() !== req.userId) return res.status(401).json({ msg: 'Yetkisiz işlem' });

        yem = await YemKutuphanesi.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(yem);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Hatası');
    }
});

// @route   DELETE /api/yem-kutuphanesi/:id
// @desc    Kütüphane yemini sil
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let yem = await YemKutuphanesi.findById(req.params.id);
        if (!yem) return res.status(404).json({ msg: 'Yem bulunamadı' });
        if (yem.userId.toString() !== req.userId) return res.status(401).json({ msg: 'Yetkisiz işlem' });

        await yem.deleteOne();
        res.json({ msg: 'Yem silindi' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Hatası');
    }
});

module.exports = router;
