const express = require('express');
const router = express.Router();
const SiteContent = require('../models/SiteContent');

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

// GET /api/admin/content — tüm içerikleri getir
router.get('/content', async (req, res) => {
    try {
        const docs = await SiteContent.find({});
        const result = { ...DEFAULTS };
        docs.forEach(doc => {
            result[doc.key] = doc.data;
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'İçerik alınamadı', hata: err.message });
    }
});

// PUT /api/admin/content/:key — section güncelle (upsert)
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

// GET /api/content — public, landing page için (auth yok)
// Bu ayrı route olarak server.js'e eklenecek ama şimdilik buraya koyalım
router.get('/public', async (req, res) => {
    try {
        const docs = await SiteContent.find({});
        const result = { ...DEFAULTS };
        docs.forEach(doc => {
            result[doc.key] = doc.data;
        });
        res.json(result);
    } catch (err) {
        res.json(DEFAULTS); // hata olsa da default döner
    }
});

module.exports = router;
