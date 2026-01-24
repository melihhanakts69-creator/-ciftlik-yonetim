import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../logo.png';
import '../styles/LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Scroll animasyonları için Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.animationPlayState = 'running';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const animatedElements = document.querySelectorAll('.fade-in-up');
        animatedElements.forEach(el => observer.observe(el));

        return () => {
            if (animatedElements.length > 0) observer.disconnect();
        };
    }, []);

    const handleLoginClick = () => {
        navigate('/login');
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <div className="landing-container">
            {/* HEADER */}
            <header className="landing-header">
                <div className="brand-logo">
                    <img src={logo} alt="Agrolina Logo" className="logo-image" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                    <span>Agrolina</span>
                </div>

                <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
                    {mobileMenuOpen ? '✕' : '☰'}
                </button>

                <nav className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
                    <a href="#home" onClick={() => setMobileMenuOpen(false)}>Ana Sayfa</a>
                    <a href="#features" onClick={() => setMobileMenuOpen(false)}>Hizmetler</a>
                    <a href="#blog" onClick={() => setMobileMenuOpen(false)}>Blog</a>
                    <a href="#contact" onClick={() => setMobileMenuOpen(false)}>İletişim</a>
                    <button className="btn-header-login" onClick={handleLoginClick}>Giriş Yap</button>
                    <button className="btn-header-register" onClick={() => navigate('/login')}>Kayıt Ol</button>
                </nav>
            </header>

            {/* HERO SECTION */}
            <section className="hero-section" id="home">
                <div className="hero-content fade-in-up">
                    <h1 className="hero-title">Çiftliğinizi <br /> <span>Akıllı Yönetin</span></h1>
                    <p className="hero-subtitle">
                        Teknoloji ve tarımı birleştirerek verimliliğinizi maksimize edin.
                        Hayvan takibi, finansal analizler ve daha fazlası tek platformda.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn-hero-primary" onClick={handleLoginClick}>Hemen Başla</button>
                        <button className="btn-hero-secondary" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                            Daha Fazla Bilgi
                        </button>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="features-section" id="features">
                <div className="section-header fade-in-up">
                    <h2>Hizmetlerimiz</h2>
                    <p>Modern çiftçilik için ihtiyacınız olan her şey</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card fade-in-up delay-100">
                        <div className="feature-icon">📊</div>
                        <h3 className="feature-title">Detaylı Raporlama</h3>
                        <p className="feature-desc">Verileri anlamlı grafiklere dönüştürerek karar verme sürecinizi hızlandırın.</p>
                    </div>
                    <div className="feature-card fade-in-up delay-200">
                        <div className="feature-icon">🐄</div>
                        <h3 className="feature-title">Hayvan Karnesi</h3>
                        <p className="feature-desc">Her hayvanın aşı, doğum ve sağlık geçmişini dijital ortamda saklayın.</p>
                    </div>
                    <div className="feature-card fade-in-up delay-300">
                        <div className="feature-icon">💰</div>
                        <h3 className="feature-title">Gelir/Gider Takibi</h3>
                        <p className="feature-desc">Çiftliğinizin finansal durumunu anlık olarak takip edin ve yönetin.</p>
                    </div>
                    <div className="feature-card fade-in-up delay-100">
                        <div className="feature-icon">📱</div>
                        <h3 className="feature-title">Mobil Uyumlu</h3>
                        <p className="feature-desc">İster tarlada ister evde, sistemimize her cihazdan erişim sağlayın.</p>
                    </div>
                </div>
            </section>

            {/* BLOG SECTION */}
            <section className="blog-section" id="blog">
                <div className="section-header fade-in-up">
                    <h2>Blog & Haberler</h2>
                    <p>Sektördeki son gelişmeler ve ipuçları</p>
                </div>

                <div className="blog-grid">
                    <div className="blog-card fade-in-up delay-100">
                        <div className="blog-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2670&auto=format&fit=crop')" }}></div>
                        <div className="blog-content">
                            <span className="blog-date">10 Ocak 2026</span>
                            <h3 className="blog-title">Sürdürülebilir Tarım Yöntemleri</h3>
                            <p className="blog-excerpt">Geleceğin tarımı için toprağı koruyan ve verimi artıran modern teknikler.</p>
                            <button className="btn-read-more">Devamını Oku &rarr;</button>
                        </div>
                    </div>
                    <div className="blog-card fade-in-up delay-200">
                        <div className="blog-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?q=80&w=2521&auto=format&fit=crop')" }}></div>
                        <div className="blog-content">
                            <span className="blog-date">5 Ocak 2026</span>
                            <h3 className="blog-title">Hayvancılıkta Doğru Beslenme</h3>
                            <p className="blog-excerpt">Süt ve et verimini artırmak için rasyon hazırlama teknikleri ve öneriler.</p>
                            <button className="btn-read-more">Devamını Oku &rarr;</button>
                        </div>
                    </div>
                    <div className="blog-card fade-in-up delay-300">
                        <div className="blog-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=2670&auto=format&fit=crop')" }}></div>
                        <div className="blog-content">
                            <span className="blog-date">28 Aralık 2025</span>
                            <h3 className="blog-title">Akıllı Çiftlik Teknolojileri</h3>
                            <p className="blog-excerpt">Otomasyon sistemleri ve sensörler ile iş yükünüzü nasıl azaltabilirsiniz?</p>
                            <button className="btn-read-more">Devamını Oku &rarr;</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA REGISTER SECTION */}
            <section className="cta-register-section fade-in-up">
                <div className="mini-login-card">
                    <h3>Ailemize Katılın</h3>
                    <p style={{ marginBottom: '2rem', color: '#666', fontSize: '1rem', lineHeight: '1.6' }}>
                        Binlerce çiftçi gibi siz de işinizi dijitalleştirin.
                        Hemen ücretsiz deneyin.
                    </p>

                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            width: '100%',
                            padding: '16px',
                            backgroundColor: '#2e7d32',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50px',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            boxShadow: '0 10px 20px rgba(46, 125, 50, 0.3)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        Kayıt Ol & Başla &rarr;
                    </button>
                    <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#888' }}>
                        Zaten üye misiniz? <span style={{ color: '#2e7d32', fontWeight: 'bold', cursor: 'pointer' }} onClick={handleLoginClick}>Giriş Yapın</span>
                    </p>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="landing-footer" id="contact">
                <div className="footer-content">
                    <div className="footer-brand">
                        <h2><img src={logo} alt="Agrolina Logo" style={{ height: '40px', marginRight: '10px' }} /> Agrolina</h2>
                        <p style={{ lineHeight: '1.6', color: '#888' }}>
                            Modern çiftçilik için geliştirilmiş, kullanımı kolay ve kapsamlı yönetim platformu.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4>Hızlı Erişim</h4>
                        <a href="#home">Ana Sayfa</a>
                        <a href="#features">Hizmetler</a>
                        <a href="#blog">Blog</a>
                        <a href="/login">Giriş Yap</a>
                    </div>

                    <div className="footer-section">
                        <h4>Kurumsal</h4>
                        <a href="#about">Hakkımızda</a>
                        <a href="#contact">İletişim</a>
                        <a href="#careers">Kariyer</a>
                        <a href="#privacy">Gizlilik Politikası</a>
                    </div>

                    <div className="footer-section">
                        <h4>İletişim</h4>
                        <a href="mailto:info@ciftlikyonetim.com">📧 info@ciftlikyonetim.com</a>
                        <a href="tel:+905555555555">📞 +90 555 555 55 55</a>
                        <div className="social-icons" style={{ marginTop: '1rem' }}>
                            <span style={{ fontSize: '1.5rem', cursor: 'pointer' }}>📷</span>
                            <span style={{ fontSize: '1.5rem', cursor: 'pointer' }}>📘</span>
                            <span style={{ fontSize: '1.5rem', cursor: 'pointer' }}>🐦</span>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div>© 2026 Çiftlik Yönetim Platformu. Tüm hakları saklıdır.</div>
                    <div style={{ color: '#666' }}>Designed with ❤️ for Farmers</div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
