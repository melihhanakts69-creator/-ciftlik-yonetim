const express = require('express');
const router = express.Router();
const SiteContent = require('../models/SiteContent');
const User = require('../models/User');
const Inek = require('../models/Inek');
const Duve = require('../models/Duve');
const Buzagi = require('../models/Buzagi');
const Tosun = require('../models/Tosun');
const BlogPost = require('../models/BlogPost');
const AdminSettings = require('../models/AdminSettings');

// Default içerikler — DB boşsa bunlar döner
const DEFAULTS = {
    hero: {
        badge: '🚀 Modern Çiftlik Yönetimi',
        title: 'Çiftliğinizi Geleceğe Taşıyın',
        titleHighlight: 'Taşıyın',
        subtitle: 'Sürü takibi, süt verimi analizi, stok yönetimi ve finansal raporlamalar tek bir platformda. Verimliliğinizi %30 artırın.',
        btnPrimary: 'Hemen Başlayın',
        btnSecondary: 'Nasıl Çalışır?'
    },
    stats: [
        { value: '500+', label: 'Aktif Çiftlik' },
        { value: '100k+', label: 'Kayıtlı Hayvan' },
        { value: '%35', label: 'Ortalama Verim Artışı' }
    ],
    features: [
        { icon: '📊', title: 'Akıllı Raporlama', desc: 'Karmaşık verileri anlaşılır grafiklere dönüştürün. Trendleri takip edin.' },
        { icon: '🔔', title: 'Akıllı Bildirimler', desc: 'Aşı, doğum ve stok uyarılarını zamanında alın. Hiçbir şeyi kaçırmayın.' },
        { icon: '🏥', title: 'Sağlık Takibi', desc: 'Tedavi geçmişi, aşı takvimi ve hastalık kayıtları elinizin altında.' },
        { icon: '🥡', title: 'Stok & Yem', desc: 'Yem ve ilaç stoklarını yönetin. Kritik seviyelerde otomatik uyarı alın.' }
    ],
    testimonials: [
        { text: '"Agrolina sayesinde süt verimimizi %25 artırdık. Artık hangi ineğin ne kadar ürettiğini tam olarak biliyoruz."', name: 'Ahmet Demir', farm: 'Demir Çiftliği', size: '50 Baş', initials: 'AD' },
        { text: '"Aşı takibini sürekli kaçırıyorduk. Bildirim sistemi hayatımızı kurtardı. Stok takibi de cabası."', name: 'Mehmet Yılmaz', farm: 'Yılmaz Besi', size: '120 Baş', initials: 'MY' }
    ],
    pricing: [
        { name: 'Başlangıç', price: '₺0', period: '/ay', features: ['10 Hayvana Kadar', 'Temel Sürü Takibi', 'Süt Kaydı'], popular: false, btnText: 'Ücretsiz Başla' },
        { name: 'Profesyonel', price: '₺499', period: '/ay', features: ['100 Hayvana Kadar', 'Tüm Modüller Aktif', 'Gelişmiş Raporlar', 'Stok Yönetimi'], popular: true, btnText: 'Şimdi Yükselt' },
        { name: 'Kurumsal', price: '₺999', period: '/ay', features: ['Sınırsız Hayvan', 'Çoklu Çiftlik', 'Özel API Erişimi', '7/24 Destek'], popular: false, btnText: 'İletişime Geç' }
    ]
};

// Default uygulama ayarları
const DEFAULT_SETTINGS = {
    bakimModu: false,
    kayitAcik: true,
    yemDanismaniAktif: true,
    finansalModulAktif: true,
    saglikModulAktif: true,
    maxHayvanLimiti: 500,
    siteTamAdi: 'Agrolina - Modern Çiftlik Yönetim Platformu',
    destek_email: 'destek@agrolina.com',
};

// ══════════════════════════════════════════════
// LANDING PAGE CONTENT — mevcut
// ══════════════════════════════════════════════

// GET /api/admin/content
router.get('/content', async (req, res) => {
    try {
        const docs = await SiteContent.find({});
        const result = { ...DEFAULTS };
        docs.forEach(doc => { result[doc.key] = doc.data; });
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'İçerik alınamadı', hata: err.message });
    }
});

// PUT /api/admin/content/:key
router.put('/content/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const { data } = req.body;
        if (!data) return res.status(400).json({ message: 'data alanı gerekli' });
        const doc = await SiteContent.findOneAndUpdate(
            { key },
            { key, data },
            { upsert: true, new: true }
        );
        res.json({ success: true, doc });
    } catch (err) {
        res.status(500).json({ message: 'Güncelleme başarısız', hata: err.message });
    }
});

// GET public content
router.get('/public', async (req, res) => {
    try {
        const docs = await SiteContent.find({});
        const result = { ...DEFAULTS };
        docs.forEach(doc => { result[doc.key] = doc.data; });
        res.json(result);
    } catch (err) {
        res.json(DEFAULTS);
    }
});

// ══════════════════════════════════════════════
// DASHBOARD — istatistikler
// ══════════════════════════════════════════════

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const now = new Date();
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        const [
            toplamKullanici,
            aktifKullanici,
            buHaftaKaydolan,
            buAyKaydolan,
            toplamInek,
            toplamDuve,
            toplamBuzagi,
            toplamTosun,
            sonKullanicilar,
        ] = await Promise.all([
            User.countDocuments({}),
            User.countDocuments({ aktif: { $ne: false } }),
            User.countDocuments({ createdAt: { $gte: weekAgo } }),
            User.countDocuments({ createdAt: { $gte: monthAgo } }),
            Inek.countDocuments({}),
            Duve.countDocuments({}),
            Buzagi.countDocuments({}),
            Tosun.countDocuments({}),
            User.find({})
                .select('isim email isletmeAdi aktif createdAt kayitTarihi')
                .sort({ createdAt: -1 })
                .limit(8),
        ]);

        // Son 7 günlük kayıt grafiği verisi
        const gunlukKayitlar = [];
        for (let i = 6; i >= 0; i--) {
            const gun = new Date(now);
            gun.setDate(gun.getDate() - i);
            gun.setHours(0, 0, 0, 0);
            const gunSonu = new Date(gun);
            gunSonu.setHours(23, 59, 59, 999);
            const count = await User.countDocuments({ createdAt: { $gte: gun, $lte: gunSonu } });
            gunlukKayitlar.push({
                tarih: gun.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' }),
                sayi: count
            });
        }

        res.json({
            kullanici: { toplam: toplamKullanici, aktif: aktifKullanici, buHafta: buHaftaKaydolan, buAy: buAyKaydolan },
            hayvan: {
                toplam: toplamInek + toplamDuve + toplamBuzagi + toplamTosun,
                inek: toplamInek, duve: toplamDuve, buzagi: toplamBuzagi, tosun: toplamTosun
            },
            sonKullanicilar,
            gunlukKayitlar,
        });
    } catch (err) {
        res.status(500).json({ message: 'Dashboard verisi alınamadı', hata: err.message });
    }
});

// ══════════════════════════════════════════════
// KULLANICI YÖNETİMİ
// ══════════════════════════════════════════════

// GET /api/admin/users?q=arama&sayfa=1
router.get('/users', async (req, res) => {
    try {
        const { q, sayfa = 1, limit = 20 } = req.query;
        const filter = q
            ? {
                $or: [
                    { isim: { $regex: q, $options: 'i' } },
                    { email: { $regex: q, $options: 'i' } },
                    { isletmeAdi: { $regex: q, $options: 'i' } }
                ]
            }
            : {};

        const skip = (parseInt(sayfa) - 1) * parseInt(limit);
        const [users, toplam] = await Promise.all([
            User.find(filter)
                .select('-sifre')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(filter)
        ]);

        res.json({ users, toplam, sayfa: parseInt(sayfa), toplamSayfa: Math.ceil(toplam / parseInt(limit)) });
    } catch (err) {
        res.status(500).json({ message: 'Kullanıcılar alınamadı', hata: err.message });
    }
});

// PATCH /api/admin/users/:id — aktif/pasif toggle + alan güncelleme
router.patch('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, select: '-sifre' }
        );
        if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ message: 'Güncelleme başarısız', hata: err.message });
    }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Kullanıcı silindi' });
    } catch (err) {
        res.status(500).json({ message: 'Silme başarısız', hata: err.message });
    }
});

// ══════════════════════════════════════════════
// BLOG / DUYURULAR
// ══════════════════════════════════════════════

// GET /api/admin/blog?yayinlandi=true
router.get('/blog', async (req, res) => {
    try {
        const { yayinlandi } = req.query;
        const filter = yayinlandi !== undefined ? { published: yayinlandi === 'true' } : {};
        const posts = await BlogPost.find(filter).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Blog yazıları alınamadı', hata: err.message });
    }
});

// GET /api/admin/blog/:id
router.get('/blog/:id', async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Yazı bulunamadı' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Yazı alınamadı', hata: err.message });
    }
});

// POST /api/admin/blog
router.post('/blog', async (req, res) => {
    try {
        const post = new BlogPost(req.body);
        await post.save();
        res.status(201).json({ success: true, post });
    } catch (err) {
        res.status(500).json({ message: 'Yazı eklenemedi', hata: err.message });
    }
});

// PUT /api/admin/blog/:id
router.put('/blog/:id', async (req, res) => {
    try {
        const post = await BlogPost.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!post) return res.status(404).json({ message: 'Yazı bulunamadı' });
        res.json({ success: true, post });
    } catch (err) {
        res.status(500).json({ message: 'Güncelleme başarısız', hata: err.message });
    }
});

// DELETE /api/admin/blog/:id
router.delete('/blog/:id', async (req, res) => {
    try {
        await BlogPost.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Yazı silindi' });
    } catch (err) {
        res.status(500).json({ message: 'Silme başarısız', hata: err.message });
    }
});

// ══════════════════════════════════════════════
// UYGULAMA AYARLARI
// ══════════════════════════════════════════════

// GET /api/admin/settings — tüm ayarlar
router.get('/settings', async (req, res) => {
    try {
        const docs = await AdminSettings.find({});
        const settings = { ...DEFAULT_SETTINGS };
        docs.forEach(doc => { settings[doc.key] = doc.value; });
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: 'Ayarlar alınamadı', hata: err.message });
    }
});

// PUT /api/admin/settings — birden fazla ayarı kaydet (obje gönder)
router.put('/settings', async (req, res) => {
    try {
        const updates = req.body; // { bakimModu: true, kayitAcik: false ... }
        const ops = Object.entries(updates).map(([key, value]) =>
            AdminSettings.findOneAndUpdate(
                { key },
                { key, value },
                { upsert: true, new: true }
            )
        );
        await Promise.all(ops);
        res.json({ success: true, message: 'Ayarlar kaydedildi' });
    } catch (err) {
        res.status(500).json({ message: 'Ayarlar kaydedilemedi', hata: err.message });
    }
});

// GET /api/admin/settings/public — uygulamanın okuyacağı public ayarlar
router.get('/settings/public', async (req, res) => {
    try {
        const docs = await AdminSettings.find({});
        const settings = { ...DEFAULT_SETTINGS };
        docs.forEach(doc => { settings[doc.key] = doc.value; });
        // Sadece önemli açık flag'ları döndür
        res.json({
            bakimModu: settings.bakimModu,
            kayitAcik: settings.kayitAcik,
            yemDanismaniAktif: settings.yemDanismaniAktif,
            finansalModulAktif: settings.finansalModulAktif,
            saglikModulAktif: settings.saglikModulAktif,
            maxHayvanLimiti: settings.maxHayvanLimiti,
        });
    } catch (err) {
        res.json({
            bakimModu: false, kayitAcik: true,
            yemDanismaniAktif: true, finansalModulAktif: true,
            saglikModulAktif: true, maxHayvanLimiti: 500
        });
    }
});

module.exports = router;
