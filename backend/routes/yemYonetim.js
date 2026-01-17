const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const YemKutuphanesi = require('../models/YemKutuphanesi');
const Rasyon = require('../models/Rasyon');
const YemStok = require('../models/YemStok');
const YemHareket = require('../models/YemHareket');
const Maliyet = require('../models/Maliyet');
const Inek = require('../models/Inek');

// --- YEM KÜTÜPHANESİ ---

// Tüm yemleri getir
router.get('/kutuphane', auth, async (req, res) => {
    try {
        const yemler = await YemKutuphanesi.find({ userId: req.userId }).sort({ ad: 1 });
        res.json(yemler);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Yeni yem ekle
router.post('/kutuphane', auth, async (req, res) => {
    try {
        // YemStok entegrasyonu: Stokta bu isimle kayıt var mı bak, yoksa oluştur
        let stok = await YemStok.findOne({ userId: req.userId, yemTipi: req.body.ad });

        if (!stok) {
            stok = new YemStok({
                userId: req.userId,
                yemTipi: req.body.ad,
                miktar: 0, // İlk başta 0 stok
                birim: 'kg',
                birimFiyat: req.body.birimFiyat || 0
            });
            await stok.save();
        } else {
            // Stok varsa birim fiyatını güncelle
            if (req.body.birimFiyat) {
                stok.birimFiyat = req.body.birimFiyat;
                await stok.save();
            }
        }

        const yeniYem = new YemKutuphanesi({
            userId: req.userId,
            ...req.body,
            yemStokId: stok._id // Bağlantıyı kur
        });
        await yeniYem.save();
        res.status(201).json(yeniYem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Yem güncelle
router.put('/kutuphane/:id', auth, async (req, res) => {
    try {
        const yem = await YemKutuphanesi.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true }
        );
        res.json(yem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Yem sil
router.delete('/kutuphane/:id', auth, async (req, res) => {
    try {
        await YemKutuphanesi.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        res.json({ message: 'Yem silindi' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- RASYON ---

// Rasyonları getir
router.get('/rasyon', auth, async (req, res) => {
    try {
        const rasyonlar = await Rasyon.find({ userId: req.userId }).populate('icerik.yemId');
        res.json(rasyonlar);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rasyon oluştur
router.post('/rasyon', auth, async (req, res) => {
    try {
        // Hesaplamaları yap (Back-end validasyonu)
        const { icerik } = req.body;
        let toplamMaliyet = 0;
        let toplamKM = 0;
        let toplamProt = 0;
        let toplamEnerji = 0;

        // Yemleri çekip değerleri hesapla
        for (let item of icerik) {
            const yem = await YemKutuphanesi.findById(item.yemId);
            if (yem) {
                toplamMaliyet += yem.birimFiyat * item.miktar;
                toplamKM += (yem.kuruMadde * item.miktar) / 100;
                // Diğer değerler de benzer mantıkla toplanır...
                // Basitlik için sadece maliyeti kesinleştiriyoruz
            }
        }

        const yeniRasyon = new Rasyon({
            userId: req.userId,
            ...req.body,
            toplamMaliyet // Server-side hesaplanan maliyet
        });
        await yeniRasyon.save();
        res.status(201).json(yeniRasyon);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Rasyon sil
router.delete('/rasyon/:id', auth, async (req, res) => {
    try {
        await Rasyon.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        res.json({ message: 'Rasyon silindi' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- GÜNLÜK YEMLEME UYGULA ---
// Kritik Fonksiyon: Yem Önerisine veya Rasyona göre stoktan düş ve maliyet yaz
router.post('/dagit', auth, async (req, res) => {
    try {
        const { rasyonId, tarih } = req.body;
        const userId = req.userId;
        const islemTarihi = tarih ? new Date(tarih) : new Date();

        // 1. Rasyon ve içeriğini bul
        const rasyon = await Rasyon.findOne({ _id: rasyonId, userId }).populate('icerik.yemId');
        if (!rasyon) return res.status(404).json({ message: 'Rasyon bulunamadı' });

        // 2. Grubu bul ve hayvan sayısını çek
        const Duve = require('../models/Duve');
        const Buzagi = require('../models/Buzagi');
        const Tosun = require('../models/Tosun');

        if (rasyon.hedefGrup === 'sagmal') {
            hayvanSayisi = await Inek.countDocuments({ userId, durum: 'Aktif' }); // Basit varsayım: Aktif tüm inekler
        } else if (rasyon.hedefGrup === 'kuru') {
            // Kuru inekleri bulmak için Inek modelinde 'sutVerimi' veya 'durum' kontrolü gerekebilir. 
            // Şimdilik 'Kuru' durumu varsayıyoruz. 
            // Eğer yoksa, geliştirilmeli. Basitlik için 'Aktif' ineklerin bir kısmı kabul edilebilir ama doğrusu:
            hayvanSayisi = await Inek.countDocuments({ userId, durum: 'Kuru' });
            if (hayvanSayisi === 0) {
                // Eğer 'Kuru' durumu yoksa, not düş:
                console.log("Kuru inek bulunamadı, 0 sayıldı.");
            }
        } else if (rasyon.hedefGrup === 'genc_duve') {
            hayvanSayisi = await Duve.countDocuments({ userId });
        } else if (rasyon.hedefGrup === 'buzagi') {
            hayvanSayisi = await Buzagi.countDocuments({ userId });
        } else if (rasyon.hedefGrup === 'besi') {
            hayvanSayisi = await Tosun.countDocuments({ userId });
        } else {
            // Bilinmeyen grup
            return res.status(400).json({ message: 'Geçersiz hedef grup' });
        }

        if (hayvanSayisi === 0) return res.status(400).json({ message: 'Bu grupta hayvan yok!' });

        // 3. Stoktan Düş ve Hareket Ekle
        let toplamGunlukMaliyet = 0;

        for (let item of rasyon.icerik) {
            const yem = item.yemId; // Populated
            const harcananMiktar = item.miktar * hayvanSayisi;
            const kalemMaliyeti = harcananMiktar * yem.birimFiyat;
            toplamGunlukMaliyet += kalemMaliyeti;

            // Stoktan düş (YemStok modeli varsa, yoksa YemKutuphanesi'ndeki basit stoktan)
            // YemStok entegrasyonu: Gerçek stoktan düş
            // Öncelik: yem.yemStokId varsa onu kullan, yoksa isme göre bul
            let stok = null;
            if (yem.yemStokId) {
                stok = await YemStok.findById(yem.yemStokId);
            }

            if (!stok) {
                // İsimle bulmayı dene
                stok = await YemStok.findOne({ userId, yemTipi: yem.ad });
            }

            if (stok) {
                stok.miktar -= harcananMiktar;
                await stok.save();

                // Yem Hareketi Kaydet
                await YemHareket.create({
                    userId,
                    yemTipi: stok.yemTipi,
                    hareketTipi: 'Kullanım',
                    miktar: harcananMiktar,
                    birimFiyat: stok.birimFiyat,
                    toplamTutar: kalemMaliyeti,
                    tarih: islemTarihi,
                    aciklama: `Günlük Yemleme: ${rasyon.ad} (${hayvanSayisi} baş)`
                });
            } else {
                // Stok bulunamadıysa YemKutuphanesi'ndeki basit alanı güncelle (Fallback)
                if (yem.stokTakibi) {
                    yem.stokMiktari -= harcananMiktar;
                    await yem.save();
                }
            }
        }

        // 4. Maliyet Tablosuna İşle
        await Maliyet.create({
            userId,
            kategori: 'yem',
            tutar: toplamGunlukMaliyet,
            tarih: islemTarihi,
            aciklama: `Günlük Yemleme: ${rasyon.ad} (${hayvanSayisi} Baş x ${rasyon.toplamMaliyet.toFixed(2)} TL)`
        });

        res.json({
            message: 'Yemleme tamamlandı',
            hayvanSayisi,
            toplamMaliyet: toplamGunlukMaliyet
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Yemleme işlemi başarısız', error: err.message });
    }
});


module.exports = router;
