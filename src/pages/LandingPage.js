import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../logo.png';
import api from '../services/apiClient';
import '../styles/LandingPage.css';
import { FaCheck, FaStar, FaQuoteLeft } from 'react-icons/fa';
import InstallButton from '../components/PWAInstallPrompt/InstallButton';

const DEFAULTS = {
    hero: {
        badge: '🚀 Modern Çiftlik Yönetimi',
        title: 'Çiftliğinizi Geleceğe Taşıyın',
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
        { text: '"Agrolina sayesinde süt verimimizi %25 artırdık."', name: 'Ahmet Demir', farm: 'Demir Çiftliği', size: '50 Baş', initials: 'AD' },
        { text: '"Bildirim sistemi hayatımızı kurtardı."', name: 'Mehmet Yılmaz', farm: 'Yılmaz Besi', size: '120 Baş', initials: 'MY' }
    ],
    pricing: [
        { name: 'Başlangıç', price: '₺0', period: '/ay', features: ['10 Hayvana Kadar', 'Temel Sürü Takibi', 'Süt Kaydı'], popular: false, btnText: 'Ücretsiz Başla' },
        { name: 'Profesyonel', price: '₺499', period: '/ay', features: ['100 Hayvana Kadar', 'Tüm Modüller Aktif', 'Gelişmiş Raporlar', 'Stok Yönetimi'], popular: true, btnText: 'Şimdi Yükselt' },
        { name: 'Kurumsal', price: '₺999', period: '/ay', features: ['Sınırsız Hayvan', 'Çoklu Çiftlik', 'Özel API Erişimi', '7/24 Destek'], popular: false, btnText: 'İletişime Geç' }
    ]
};

const LandingPage = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [c, setC] = useState(DEFAULTS);

    useEffect(() => {
        api.get('/admin/public')
            .then(r => setC({ ...DEFAULTS, ...r.data }))
            .catch(() => { });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
            });
        }, { threshold: 0.1 });
        const animatedElements = document.querySelectorAll('.fade-in-up');
        animatedElements.forEach(el => observer.observe(el));
        return () => { if (animatedElements.length > 0) observer.disconnect(); };
    }, []);

    const handleLoginClick = () => navigate('/login');

    const hero = c.hero || DEFAULTS.hero;
    const stats = c.stats || DEFAULTS.stats;
    const features = c.features || DEFAULTS.features;
    const testimonials = c.testimonials || DEFAULTS.testimonials;
    const pricing = c.pricing || DEFAULTS.pricing;

    return (
        <div className="landing-container">
            <header className="landing-header">
                <div className="brand-logo">
                    <img src={logo} alt="Agrolina Logo" className="logo-image" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                    <span>Agrolina</span>
                </div>
                <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? '✕' : '☰'}</button>
                <nav className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
                    <a href="#home" onClick={() => setMobileMenuOpen(false)}>Ana Sayfa</a>
                    <a href="#features" onClick={() => setMobileMenuOpen(false)}>Özellikler</a>
                    <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Fiyatlar</a>
                    <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Yorumlar</a>
                    <button className="btn-header-login" onClick={handleLoginClick}>Giriş Yap</button>
                    <button className="btn-header-register" onClick={handleLoginClick}>Ücretsiz Dene</button>
                </nav>
            </header>

            <section className="hero-section" id="home">
                <div className="hero-content fade-in-up">
                    <div className="hero-badge">{hero.badge}</div>
                    <h1 className="hero-title">{hero.title}</h1>
                    <p className="hero-subtitle">{hero.subtitle}</p>
                    <div className="hero-buttons">
                        <button className="btn-hero-primary" onClick={handleLoginClick}>{hero.btnPrimary}</button>
                        <button className="btn-hero-secondary" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                            {hero.btnSecondary}
                        </button>
                        <InstallButton outline hideWhenCannotInstall className="btn-hero-install" style={{ minHeight: 48, padding: '12px 20px' }} />
                    </div>
                </div>
            </section>

            <section className="stats-section fade-in-up">
                {stats.map((s, i) => (
                    <div className="stat-item" key={i}>
                        <h3>{s.value}</h3>
                        <p>{s.label}</p>
                    </div>
                ))}
            </section>

            <section className="features-section" id="features">
                <div className="section-header fade-in-up">
                    <h2>Neden Agrolina?</h2>
                    <p>Her ölçekteki çiftlik için en kapsamlı çözümler</p>
                </div>
                <div className="features-grid">
                    {features.map((f, i) => (
                        <div className={`feature-card fade-in-up delay-${(i + 1) * 100}`} key={i}>
                            <div className="feature-icon">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="testimonials-section" id="testimonials">
                <div className="section-header fade-in-up">
                    <h2>Çiftçilerimiz Ne Diyor?</h2>
                    <p>Başarı hikayelerine göz atın</p>
                </div>
                <div className="testimonials-grid">
                    {testimonials.map((t, i) => (
                        <div className={`testimonial-card fade-in-up${i > 0 ? ' delay-100' : ''}`} key={i}>
                            <FaQuoteLeft className="quote-icon" />
                            <p>{t.text}</p>
                            <div className="user-info">
                                <div className="avatar">{t.initials}</div>
                                <div>
                                    <h4>{t.name}</h4>
                                    <span>{t.farm} ({t.size})</span>
                                </div>
                            </div>
                            <div className="stars"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="pricing-section" id="pricing">
                <div className="section-header fade-in-up">
                    <h2>Fiyatlandırma</h2>
                    <p>İhtiyacınıza uygun paketi seçin</p>
                </div>
                <div className="pricing-grid">
                    {pricing.map((p, i) => (
                        <div className={`pricing-card${p.popular ? ' featured' : ''} fade-in-up delay-${i * 100}`} key={i}>
                            {p.popular && <div className="best-value">En Popüler</div>}
                            <h3>{p.name}</h3>
                            <div className="price">{p.price}<span>{p.period}</span></div>
                            <ul className="features-list">
                                {(p.features || []).map((f, j) => (
                                    <li key={j}><FaCheck /> {f}</li>
                                ))}
                            </ul>
                            <button className={`btn-plan ${p.popular ? 'btn-primary' : 'btn-outline'}`} onClick={handleLoginClick}>{p.btnText}</button>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <h2>Agrolina</h2>
                        <p>Modern teknoloji ile geleneksel tarımı buluşturuyoruz.</p>
                        <div className="footer-install" style={{ marginTop: 12 }}>
                            <InstallButton hideWhenCannotInstall style={{ minHeight: 44 }} />
                        </div>
                        <div className="social-links"><span>📷</span> <span>📘</span> <span>💼</span></div>
                    </div>
                    <div className="footer-links">
                        <h4>Ürün</h4>
                        <a href="#features">Özellikler</a>
                        <a href="#pricing">Fiyatlar</a>
                        <a href="/login">Giriş</a>
                    </div>
                    <div className="footer-links">
                        <h4>Şirket</h4>
                        <a href="#hakkimizda">Hakkımızda</a>
                        <a href="#iletisim">İletişim</a>
                    </div>
                    <div className="footer-links">
                        <h4>Yasal</h4>
                        <a href="#gizlilik">Gizlilik</a>
                        <a href="#sartlar">Kullanım Şartları</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2026 Agrolina Teknoloji A.Ş. Tüm hakları saklıdır.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
