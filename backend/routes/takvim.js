const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

const Inek = require('../models/Inek');
const Duve = require('../models/Duve');
const Buzagi = require('../models/Buzagi');
const SaglikKaydi = require('../models/SaglikKaydi');
const AsiTakvimi = require('../models/AsiTakvimi');
const Bildirim = require('../models/Bildirim');
const TopluSutGirisi = require('../models/TopluSutGirisi');
const AlisSatis = require('../models/AlisSatis');

// @route   GET /api/takvim
// @desc    Get all events for a specific month
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { ay, yil } = req.query;

        const year = parseInt(yil) || new Date().getFullYear();
        const month = parseInt(ay) ? parseInt(ay) - 1 : new Date().getMonth();

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);

        // ISO string formatında da arama yapabilmek için (TopluSutGirisi string tarih kullanıyor)
        const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;

        const events = [];

        // --- 1. AŞI TAKVİMİ ---
        const asilar = await AsiTakvimi.find({
            userId: req.userId,
            tarih: { $gte: startDate, $lte: endDate }
        });

        asilar.forEach(asi => {
            events.push({
                id: asi._id,
                date: asi.tarih,
                title: `${asi.asiAdi} Aşısı`,
                type: 'asi',
                details: {
                    notlar: asi.notlar,
                    yapildi: asi.yapildi
                }
            });
        });

        // --- 2. SAĞLIK KAYITLARI (Tedavi/Kontrol) ---
        const saglikIslemleri = await SaglikKaydi.find({
            userId: req.userId,
            $or: [
                { tarih: { $gte: startDate, $lte: endDate } },
                { sonrakiKontrolTarihi: { $gte: startDate, $lte: endDate } }
            ]
        });

        saglikIslemleri.forEach(kayit => {
            if (new Date(kayit.tarih) >= startDate && new Date(kayit.tarih) <= endDate) {
                events.push({
                    id: `${kayit._id}_islem`,
                    date: kayit.tarih,
                    title: `${kayit.tip === 'tedavi' ? 'Tedavi' : 'Muayene'}: ${kayit.hayvanIsim || 'Hayvan'}`,
                    type: 'saglik',
                    details: {
                        tani: kayit.tani,
                        durum: kayit.durum
                    }
                });
            }

            if (kayit.sonrakiKontrolTarihi && new Date(kayit.sonrakiKontrolTarihi) >= startDate && new Date(kayit.sonrakiKontrolTarihi) <= endDate) {
                events.push({
                    id: `${kayit._id}_kontrol`,
                    date: kayit.sonrakiKontrolTarihi,
                    title: `Kontrol: ${kayit.hayvanIsim || 'Hayvan'}`,
                    type: 'kontrol',
                    details: {
                        tani: kayit.tani,
                        not: 'Takip kontrolü'
                    }
                });
            }
        });

        // --- 3. DOĞUM TAHMİNLERİ (Gebe İnek/Düveler) ---
        // tohumlamaTarihi + 280 gün = tahmini doğum
        const gebeInekler = await Inek.find({
            userId: req.userId,
            tohumlamaTarihi: { $ne: null },
            gebelikDurumu: 'Gebe'
        });

        const gebeDuveler = await Duve.find({
            userId: req.userId,
            tohumlamaTarihi: { $ne: null },
            gebelikDurumu: 'Gebe'
        });

        [...gebeInekler, ...gebeDuveler].forEach(hayvan => {
            if (hayvan.tohumlamaTarihi) {
                const tohumlamaTarihi = new Date(hayvan.tohumlamaTarihi);
                const tahminiDogum = new Date(tohumlamaTarihi);
                tahminiDogum.setDate(tahminiDogum.getDate() + 280);

                if (tahminiDogum >= startDate && tahminiDogum <= endDate) {
                    events.push({
                        id: `${hayvan._id}_dogum`,
                        date: tahminiDogum,
                        title: `Beklenen Doğum: ${hayvan.isim || hayvan.kupeNo}`,
                        type: 'dogum',
                        details: {
                            hayvanId: hayvan._id,
                            kupeNo: hayvan.kupeNo
                        }
                    });
                }
            }
        });

        // --- 4. BİLDİRİMLER (Genel Hatırlatmalar) ---
        const bildirimler = await Bildirim.find({
            userId: req.userId,
            hatirlatmaTarihi: { $gte: startDate, $lte: endDate }
        });

        bildirimler.forEach(bildirim => {
            events.push({
                id: bildirim._id,
                date: bildirim.hatirlatmaTarihi,
                title: bildirim.baslik,
                type: 'bildirim',
                details: {
                    not: bildirim.mesaj,
                    oncelik: bildirim.oncelik
                }
            });
        });

        // --- 5. SÜT KAYITLARI ---
        const sutKayitlari = await TopluSutGirisi.find({
            userId: req.userId,
            tarih: { $gte: startStr, $lte: endStr }
        });

        sutKayitlari.forEach(kayit => {
            events.push({
                id: `sut_${kayit._id}`,
                date: kayit.tarih,
                title: `${kayit.sagim === 'sabah' ? '🌅' : '🌙'} ${kayit.toplamSut} Lt`,
                type: 'sut',
                details: {
                    sagim: kayit.sagim,
                    toplamSut: kayit.toplamSut,
                    inekSayisi: kayit.detaylar?.length || 0
                }
            });
        });

        // --- 6. ALIŞ-SATIŞ ---
        const alisSatislar = await AlisSatis.find({
            userId: req.userId,
            tarih: { $gte: startDate, $lte: endDate },
            durum: 'tamamlandi'
        });

        alisSatislar.forEach(islem => {
            events.push({
                id: `as_${islem._id}`,
                date: islem.tarih,
                title: `${islem.tip === 'alis' ? 'Alış' : 'Satış'}: ${islem.hayvanTipi} — ₺${islem.fiyat.toLocaleString('tr-TR')}`,
                type: islem.tip === 'alis' ? 'alis' : 'satis',
                details: {
                    fiyat: islem.fiyat,
                    hayvanTipi: islem.hayvanTipi,
                    kupe_no: islem.kupe_no
                }
            });
        });

        // --- 7. BUZAĞI DOĞUMLARI (Gerçekleşen) ---
        const buzagilar = await Buzagi.find({
            userId: req.userId,
            dogumTarihi: { $gte: startDate, $lte: endDate }
        });

        buzagilar.forEach(buzagi => {
            events.push({
                id: `bd_${buzagi._id}`,
                date: buzagi.dogumTarihi,
                title: `Doğum: ${buzagi.isim || buzagi.kupeNo}`,
                type: 'buzagi_dogum',
                details: {
                    cinsiyet: buzagi.cinsiyet,
                    kupeNo: buzagi.kupeNo,
                    anneKupeNo: buzagi.anneKupeNo
                }
            });
        });

        // Tarihe göre sırala
        events.sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json(events);

    } catch (err) {
        console.error('Takvim hatası:', err);
        res.status(500).json({ message: 'Takvim verileri alınamadı' });
    }
});

module.exports = router;
