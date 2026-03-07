const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Inek = require('../models/Inek');
const Buzagi = require('../models/Buzagi');
const Duve = require('../models/Duve');
const Tosun = require('../models/Tosun');
const SaglikKaydi = require('../models/SaglikKaydi');
const Bildirim = require('../models/Bildirim');
const { verifyToken, checkRole } = require('../middleware/auth');
const mongoose = require('mongoose');

// Sadece veterinerlerin okuyabileceği rotalar
router.use(verifyToken);
router.use(checkRole(['veteriner']));

// 1. Yeni Çiftlik / Müşteri Ekleme
router.post('/musteri-ekle', async (req, res) => {
    try {
        const { ciftciId } = req.body;
        const vetId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(ciftciId)) {
            return res.status(400).json({ message: 'Geçersiz Çiftçi ID formatı.' });
        }

        // Çiftçiyi bul
        const ciftci = await User.findOne({ _id: ciftciId, rol: 'ciftci' });
        if (!ciftci) {
            return res.status(404).json({ message: 'Bu ID ile eşleşen bir çiftçi bulunamadı.' });
        }

        const veteriner = await User.findById(vetId);
        if (!veteriner.onaylandi) {
            return res.status(403).json({ message: 'Hesabınız henüz onaylanmadığı için işlem yapamazsınız.' });
        }

        if (veteriner.musteriler.includes(ciftciId)) {
            return res.status(400).json({ message: 'Bu çiftlik zaten hastalarınız arasında ekli.' });
        }

        veteriner.musteriler.push(ciftciId);
        await veteriner.save();

        res.json({ message: 'Müşteri başarıyla eklendi', ciftci: { _id: ciftci._id, isim: ciftci.isim, isletmeAdi: ciftci.isletmeAdi } });
    } catch (error) {
        console.error('Musteri Ekleme Hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// 2. Kayıtlı Çiftlikleri / Müşterileri Getir
router.get('/musteriler', async (req, res) => {
    try {
        const veteriner = await User.findById(req.user.id).populate('musteriler', 'isim email isletmeAdi sehir telefon');
        res.json(veteriner.musteriler || []);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// 3. Bir Müşteriye Ait Tüm Hayvanları Getir
router.get('/musteri/:ciftciId/hayvanlar', async (req, res) => {
    try {
        const { ciftciId } = req.params;
        const veteriner = await User.findById(req.user.id);

        if (!veteriner.musteriler.includes(ciftciId)) {
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

// 4. Müşterinin Hayvanına Uzaktan Sağlık/Tohum Kaydı Ekleme
router.post('/musteri/:ciftciId/hayvan/:hayvanId/saglik', async (req, res) => {
    try {
        const { ciftciId, hayvanId } = req.params;
        const vetId = req.user.id;
        const { hayvanTipi, hayvanIsim, hayvanKupeNo, tip, tani, belirtiler, tedavi, ilaclar, notlar } = req.body;
        // tip = 'hastalik' | 'tedavi' | 'asi' | 'muayene' | 'tohumlama' vs (Tohumlamayı Saglik kaydı üzerinden tutacağız)

        const veteriner = await User.findById(vetId);
        if (!veteriner.musteriler.includes(ciftciId)) {
            return res.status(403).json({ message: 'Yetkisiz işlem.' });
        }

        // Yeni Sağlık Kaydı (Direkt olarak Çiftçinin userId'si ile açılıyor)
        const yeniKayit = new SaglikKaydi({
            userId: ciftciId,
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
