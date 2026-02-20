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
// @desc    Belirli bir ay için tüm etkinlikleri getir
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { ay, yil } = req.query;

        const year = parseInt(yil) || new Date().getFullYear();
        const month = parseInt(ay) ? parseInt(ay) - 1 : new Date().getMonth();

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);

        // userId her zaman ObjectId olarak kullan
        const userId = new mongoose.Types.ObjectId(req.userId);

        const events = [];

        // ─── 1. AŞI TAKVİMİ ───────────────────────────────────────────
        // Model fields: uygulamaTarihi, sonrakiTarih (NOT tarih!)
        const asilar = await AsiTakvimi.find({
            userId,
            $or: [
                { uygulamaTarihi: { $gte: startDate, $lte: endDate } },
                { sonrakiTarih: { $gte: startDate, $lte: endDate } }
            ]
        });

        asilar.forEach(asi => {
            if (asi.uygulamaTarihi && new Date(asi.uygulamaTarihi) >= startDate && new Date(asi.uygulamaTarihi) <= endDate) {
                events.push({
                    id: `asi_${asi._id}`,
                    date: asi.uygulamaTarihi,
                    title: `💉 ${asi.asiAdi}${asi.hayvanIsim ? ` — ${asi.hayvanIsim}` : ''}`,
                    type: 'asi',
                    details: { notlar: asi.notlar, durum: asi.durum }
                });
            }
            if (asi.sonrakiTarih && new Date(asi.sonrakiTarih) >= startDate && new Date(asi.sonrakiTarih) <= endDate) {
                events.push({
                    id: `asi_s_${asi._id}`,
                    date: asi.sonrakiTarih,
                    title: `📅 Planlı Aşı: ${asi.asiAdi}${asi.hayvanIsim ? ` — ${asi.hayvanIsim}` : ''}`,
                    type: 'asi_bekliyor',
                    details: { notlar: asi.notlar, durum: asi.durum }
                });
            }
        });

        // ─── 2. SAĞLIK KAYITLARI ──────────────────────────────────────
        // Model fields: tarih ✅, sonrakiKontrol (NOT sonrakiKontrolTarihi!)
        const saglikIslemleri = await SaglikKaydi.find({
            userId,
            $or: [
                { tarih: { $gte: startDate, $lte: endDate } },
                { sonrakiKontrol: { $gte: startDate, $lte: endDate } }
            ]
        });

        saglikIslemleri.forEach(kayit => {
            if (new Date(kayit.tarih) >= startDate && new Date(kayit.tarih) <= endDate) {
                events.push({
                    id: `saglik_${kayit._id}`,
                    date: kayit.tarih,
                    title: `🩺 ${kayit.tip === 'tedavi' ? 'Tedavi' : kayit.tip === 'hastalik' ? 'Hastalık' : 'Muayene'}: ${kayit.hayvanIsim || kayit.hayvanKupeNo || 'Hayvan'}`,
                    type: 'saglik',
                    details: { tani: kayit.tani, durum: kayit.durum }
                });
            }
            if (kayit.sonrakiKontrol && new Date(kayit.sonrakiKontrol) >= startDate && new Date(kayit.sonrakiKontrol) <= endDate) {
                events.push({
                    id: `kontrol_${kayit._id}`,
                    date: kayit.sonrakiKontrol,
                    title: `🔍 Kontrol: ${kayit.hayvanIsim || kayit.hayvanKupeNo || 'Hayvan'}`,
                    type: 'kontrol',
                    details: { tani: kayit.tani }
                });
            }
        });

        // ─── 3. DOĞUM TAHMİNLERİ (tohumlama + 280 gün) ──────────────
        const inekDuveler = await Promise.all([
            Inek.find({ userId, tohumlamaTarihi: { $exists: true, $ne: null } }).lean(),
            Duve.find({ userId, tohumlamaTarihi: { $exists: true, $ne: null } }).lean()
        ]);

        [...inekDuveler[0], ...inekDuveler[1]].forEach(hayvan => {
            if (!hayvan.tohumlamaTarihi) return;
            const tohumlamaTarihi = new Date(hayvan.tohumlamaTarihi);
            if (isNaN(tohumlamaTarihi.getTime())) return;
            const tahminiDogum = new Date(tohumlamaTarihi);
            tahminiDogum.setDate(tahminiDogum.getDate() + 280);
            if (tahminiDogum >= startDate && tahminiDogum <= endDate) {
                events.push({
                    id: `dogum_${hayvan._id}`,
                    date: tahminiDogum,
                    title: `🤰 Beklenen Doğum: ${hayvan.isim || hayvan.kupeNo}`,
                    type: 'dogum',
                    details: { hayvanId: hayvan._id, kupeNo: hayvan.kupeNo }
                });
            }
        });

        // ─── 4. BİLDİRİMLER ──────────────────────────────────────────
        const bildirimler = await Bildirim.find({
            userId,
            hatirlatmaTarihi: { $gte: startDate, $lte: endDate },
            aktif: true
        });

        bildirimler.forEach(bildirim => {
            events.push({
                id: `bildirim_${bildirim._id}`,
                date: bildirim.hatirlatmaTarihi,
                title: `🔔 ${bildirim.baslik}`,
                type: 'bildirim',
                details: { not: bildirim.mesaj, oncelik: bildirim.oncelik }
            });
        });

        // ─── 5. SÜT KAYITLARI ────────────────────────────────────────
        // TopluSutGirisi.tarih = String "YYYY-MM-DD" (en-CA locale)
        // Regex ile ay prefix eşleştirmesi
        const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
        const sutKayitlari = await TopluSutGirisi.find({
            userId,
            tarih: { $regex: `^${monthPrefix}` }
        }).lean();

        console.log(`[Takvim] ${monthPrefix}: ${sutKayitlari.length} süt kaydı bulundu (userId: ${req.userId})`);

        sutKayitlari.forEach(kayit => {
            // "YYYY-MM-DD" → local Date saat 12:00 (timezone-safe)
            const parts = String(kayit.tarih).split('-');
            if (parts.length !== 3) return;
            const eventDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
            events.push({
                id: `sut_${kayit._id}`,
                date: eventDate,
                title: `🥛 ${kayit.sagim === 'sabah' ? 'Sabah' : 'Akşam'}: ${kayit.toplamSut} Lt`,
                type: 'sut',
                details: {
                    sagim: kayit.sagim,
                    toplamSut: kayit.toplamSut,
                    inekSayisi: kayit.detaylar?.length || 0
                }
            });
        });

        // ─── 6. ALIŞ-SATIŞ ───────────────────────────────────────────
        const alisSatislar = await AlisSatis.find({
            userId,
            tarih: { $gte: startDate, $lte: endDate }
        });

        alisSatislar.forEach(islem => {
            events.push({
                id: `as_${islem._id}`,
                date: islem.tarih,
                title: `${islem.tip === 'alis' ? '📥 Alış' : '📦 Satış'}: ${islem.hayvanTipi} — ₺${Number(islem.fiyat).toLocaleString('tr-TR')}`,
                type: islem.tip === 'alis' ? 'alis' : 'satis',
                details: { fiyat: islem.fiyat, hayvanTipi: islem.hayvanTipi, kupe_no: islem.kupe_no }
            });
        });

        // ─── 7. BUZAĞI DOĞUMLARI ─────────────────────────────────────
        const buzagilar = await Buzagi.find({
            userId,
            dogumTarihi: { $gte: startDate, $lte: endDate }
        });

        buzagilar.forEach(buzagi => {
            events.push({
                id: `bd_${buzagi._id}`,
                date: buzagi.dogumTarihi,
                title: `🐄 Buzağı: ${buzagi.isim || buzagi.kupeNo}`,
                type: 'buzagi_dogum',
                details: { cinsiyet: buzagi.cinsiyet, kupeNo: buzagi.kupeNo }
            });
        });

        events.sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log(`[Takvim] ${monthPrefix} toplam ${events.length} event bulundu`);

        res.json(events);

    } catch (err) {
        console.error('Takvim hatası:', err.message);
        res.status(500).json({ message: 'Takvim verileri alınamadı', hata: err.message });
    }
});

module.exports = router;
