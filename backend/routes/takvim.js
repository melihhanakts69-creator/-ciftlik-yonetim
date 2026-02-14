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

// @route   GET /api/takvim
// @desc    Get all events for a specific month
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { ay, yil } = req.query;

        // Tarih aralığını belirle
        const year = parseInt(yil) || new Date().getFullYear();
        const month = parseInt(ay) ? parseInt(ay) - 1 : new Date().getMonth(); // 0-indexed month

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);

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
            // İşlem tarihi bu aydaysa
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

            // Kontrol tarihi bu aydaysa
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

        // --- 3. DOĞUMLAR (Tahmini ve Gerçekleşen) ---
        // (İnek ve Düvelerde beklenen doğum tarihi varsa)
        // Not: Mevcut modellerde "tahminiDogumTarihi" var mı kontrol edelim.
        // Inek modelinde 'beklenenDogumTarihi' veya tohumlama tarihinden hesaplama gerekebilir.
        // Şimdilik 'tohumlamaTarihi' varsa +280 gün ekleyerek tahmini doğum bulabiliriz.

        const inekler = await Inek.find({ userId: req.userId, 'tohumlamaBilgisi.tarih': { $exists: true } });
        const duveler = await Duve.find({ userId: req.userId, 'tohumlamaBilgisi.tarih': { $exists: true } });

        [...inekler, ...duveler].forEach(hayvan => {
            if (hayvan.tohumlamaBilgisi && hayvan.tohumlamaBilgisi.tarih) {
                const tohumlamaTarihi = new Date(hayvan.tohumlamaBilgisi.tarih);
                const tahminiDogum = new Date(tohumlamaTarihi);
                tahminiDogum.setDate(tahminiDogum.getDate() + 280); // Yaklaşık gebelik süresi

                if (tahminiDogum >= startDate && tahminiDogum <= endDate) {
                    events.push({
                        id: `${hayvan._id}_dogum`,
                        date: tahminiDogum,
                        title: `Beklenen Doğum: ${hayvan.kupeNo}`,
                        type: 'dogum',
                        details: {
                            hayvanId: hayvan._id,
                            cins: hayvan.cins || (hayvan.ozellikler ? hayvan.ozellikler.irk : '?')
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

        // Tarihe göre sırala
        events.sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json(events);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Hatası');
    }
});

module.exports = router;
