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

const MASTER_FEED_DATA = {
    // SİLAJLAR
    'misir silaji': { kuruMadde: 32, protein: 8, enerji: 2.5, nisasta: 30 },
    'misir silaj': { kuruMadde: 32, protein: 8, enerji: 2.5, nisasta: 30 },
    'yonca silaji': { kuruMadde: 35, protein: 18, enerji: 2.2, nisasta: 2 },
    'ot silaji': { kuruMadde: 35, protein: 14, enerji: 2.1, nisasta: 1 },
    'fig silaji': { kuruMadde: 35, protein: 15, enerji: 2.1, nisasta: 2 },

    // KURU OTLAR / KABA YEMLER
    'yonca': { kuruMadde: 90, protein: 16, enerji: 2.1, nisasta: 2 },
    'yonca kuru': { kuruMadde: 90, protein: 16, enerji: 2.1, nisasta: 2 },
    'saman': { kuruMadde: 90, protein: 3, enerji: 1.6, nisasta: 0 },
    'bugday samani': { kuruMadde: 90, protein: 3, enerji: 1.6, nisasta: 0 },
    'arpa samani': { kuruMadde: 90, protein: 3.5, enerji: 1.65, nisasta: 0 },
    'ryegrass': { kuruMadde: 20, protein: 16, enerji: 2.5, nisasta: 10 }, // Yeşil
    'cayir otu': { kuruMadde: 88, protein: 10, enerji: 1.9, nisasta: 2 },

    // TAHILLAR
    'arpa': { kuruMadde: 88, protein: 11, enerji: 2.8, nisasta: 55 },
    'arpa ezme': { kuruMadde: 88, protein: 11, enerji: 2.8, nisasta: 55 },
    'misir': { kuruMadde: 88, protein: 9, enerji: 3.1, nisasta: 70 },
    'misir flake': { kuruMadde: 88, protein: 9, enerji: 3.2, nisasta: 72 },
    'bugday': { kuruMadde: 88, protein: 12, enerji: 3.0, nisasta: 65 },
    'yulaf': { kuruMadde: 89, protein: 11, enerji: 2.6, nisasta: 40 },
    'cavdar': { kuruMadde: 88, protein: 11, enerji: 2.7, nisasta: 55 },

    // KÜSPELER (PROTEİN KAYNAKLARI)
    'soya': { kuruMadde: 90, protein: 48, enerji: 3.3, nisasta: 5 },
    'soya kuspesi': { kuruMadde: 90, protein: 48, enerji: 3.3, nisasta: 5 },
    'aycicek': { kuruMadde: 90, protein: 32, enerji: 2.1, nisasta: 2 }, // 32'lik
    'aycicek kuspesi': { kuruMadde: 90, protein: 28, enerji: 2.0, nisasta: 2 }, // 28'lik ortalama
    'aycicegi kuspesi': { kuruMadde: 90, protein: 28, enerji: 2.0, nisasta: 2 },
    'pamuk': { kuruMadde: 90, protein: 24, enerji: 2.2, nisasta: 2 }, // Tohum
    'pamuk kuspesi': { kuruMadde: 90, protein: 28, enerji: 2.1, nisasta: 2 },
    'kanola': { kuruMadde: 90, protein: 36, enerji: 2.6, nisasta: 4 },
    'kanola kuspesi': { kuruMadde: 90, protein: 36, enerji: 2.6, nisasta: 4 },

    // FABRİKA YEMLERİ (KARMA YEMLER)
    'sut yemi': { kuruMadde: 88, protein: 19, enerji: 2.7, nisasta: 25 },
    'sut 19': { kuruMadde: 88, protein: 19, enerji: 2.7, nisasta: 25 },
    'sut 21': { kuruMadde: 88, protein: 21, enerji: 2.7, nisasta: 25 },
    'besi yemi': { kuruMadde: 88, protein: 14, enerji: 2.8, nisasta: 35 },
    'besi baslangic': { kuruMadde: 88, protein: 16, enerji: 2.7, nisasta: 30 },
    'besi bitis': { kuruMadde: 88, protein: 13, enerji: 2.9, nisasta: 40 },
    'duve yemi': { kuruMadde: 88, protein: 16, enerji: 2.6, nisasta: 25 },
    'buzagi yemi': { kuruMadde: 89, protein: 18, enerji: 2.9, nisasta: 35 },
    'buzagi baslangic': { kuruMadde: 89, protein: 20, enerji: 3.0, nisasta: 35 },

    // YAN ÜRÜNLER
    'kepek': { kuruMadde: 89, protein: 15, enerji: 2.3, nisasta: 20 },
    'bugday kepegi': { kuruMadde: 89, protein: 15, enerji: 2.3, nisasta: 20 },
    'razmol': { kuruMadde: 88, protein: 16, enerji: 2.4, nisasta: 25 },
    'pancar posasi': { kuruMadde: 22, protein: 9, enerji: 2.6, nisasta: 1 }, // Yaş
    'kuru pancar': { kuruMadde: 90, protein: 9, enerji: 2.6, nisasta: 1 },
    'melas': { kuruMadde: 75, protein: 4, enerji: 2.9, nisasta: 0 }, // Şeker
    'bira mayasi': { kuruMadde: 92, protein: 45, enerji: 2.8, nisasta: 5 },
    'bira posasi': { kuruMadde: 25, protein: 24, enerji: 2.6, nisasta: 5 }, // Yaş
};

// Yem eşitleme (Smart Sync)
router.post('/kutuphane/sync-stok', auth, async (req, res) => {
    try {
        const stoklar = await YemStok.find({ userId: req.userId });
        let addedCount = 0;
        let matchedCount = 0;

        for (let stok of stoklar) {
            // Zaten kütüphanede var mı?
            const exist = await YemKutuphanesi.findOne({ userId: req.userId, ad: stok.yemTipi });
            if (!exist) {
                // Master Data Match
                const normalizedName = stok.yemTipi.toLowerCase()
                    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
                    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c');

                // Fuzzy search logic (basit içerir mantığı)
                let masterValues = { kuruMadde: 0, protein: 0, enerji: 0, nisasta: 0 };
                let isMatch = false;

                for (const key in MASTER_FEED_DATA) {
                    if (normalizedName.includes(key)) {
                        masterValues = MASTER_FEED_DATA[key];
                        isMatch = true;
                        break;
                    }
                }

                if (isMatch) matchedCount++;

                const yeniYem = new YemKutuphanesi({
                    userId: req.userId,
                    ad: stok.yemTipi,
                    birimFiyat: stok.birimFiyat,
                    yemStokId: stok._id,
                    ...masterValues
                });
                await yeniYem.save();
                addedCount++;
            }
        }

        res.json({ message: 'Eşitleme tamamlandı', added: addedCount, matched: matchedCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

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
