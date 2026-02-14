import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../logo.png';
import '../styles/LandingPage.css';
import { FaCheck, FaStar, FaQuoteLeft } from 'react-icons/fa';

const LandingPage = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Scroll animasyonları
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
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

    const handleLoginClick = () => navigate('/login');
    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

    return (
        <div className="landing-container">
            {/* HEADER */}
            <header className="landing-header">
                <div className="brand-logo">
                    <img src={logo} alt="Agrolina Logo" className="logo-image" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                    <span>Agrolina</span>
                </div>

                <button className="mobile-menu-btn" onClick={toggleMobileMenu}>{mobileMenuOpen ? '✕' : '☰'}</button>

                <nav className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
                    <a href="#home" onClick={() => setMobileMenuOpen(false)}>Ana Sayfa</a>
                    <a href="#features" onClick={() => setMobileMenuOpen(false)}>Özellikler</a>
                    <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Fiyatlar</a>
                    <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Yorumlar</a>
                    <button className="btn-header-login" onClick={handleLoginClick}>Giriş Yap</button>
                    <button className="btn-header-register" onClick={() => navigate('/login')}>Ücretsiz Dene</button>
                </nav>
            </header>

            {/* HERO SECTION */}
            <section className="hero-section" id="home">
                <div className="hero-content fade-in-up">
                    <div className="hero-badge">🚀 Modern Çiftlik Yönetimi</div>
                    <h1 className="hero-title">Çiftliğinizi Geleceğe <br /> <span>Taşıyın</span></h1>
                    <p className="hero-subtitle">
                        Sürü takibi, süt verimi analizi, stok yönetimi ve finansal raporlamalar tek bir platformda.
                        Verimliliğinizi %30 artırın.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn-hero-primary" onClick={handleLoginClick}>Hemen Başlayın</button>
                        <button className="btn-hero-secondary" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                            Nasıl Çalışır?
                        </button>
                    </div>
                </div>
                {/* İsteğe bağlı hero image eklenebilir */}
            </section>

            {/* STATS SECTION */}
            <section className="stats-section fade-in-up">
                <div className="stat-item">
                    <h3>500+</h3>
                    <p>Aktif Çiftlik</p>
                </div>
                <div className="stat-item">
                    <h3>100k+</h3>
                    <p>Kayıtlı Hayvan</p>
                </div>
                <div className="stat-item">
                    <h3>%35</h3>
                    <p>Ortalama Verim Artışı</p>
                </div>
            </section>

            {/* FEATURES */}
            <section className="features-section" id="features">
                <div className="section-header fade-in-up">
                    <h2>Neden Agrolina?</h2>
                    <p>Her ölçekteki çiftlik için en kapsamlı çözümler</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card fade-in-up delay-100">
                        <div className="feature-icon">📊</div>
                        <h3>Akıllı Raporlama</h3>
                        <p>Karmaşık verileri anlaşılır grafiklere dönüştürün. Trendleri takip edin.</p>
                    </div>
                    <div className="feature-card fade-in-up delay-200">
                        <div className="feature-icon">🔔</div>
                        <h3>Akıllı Bildirimler</h3>
                        <p>Aşı, doğum ve stok uyarılarını zamanında alın. Hiçbir şeyi kaçırmayın.</p>
                    </div>
                    <div className="feature-card fade-in-up delay-300">
                        <div className="feature-icon">🏥</div>
                        <h3>Sağlık Takibi</h3>
                        <p>Tedavi geçmişi, aşı takvimi ve hastalık kayıtları elinizin altında.</p>
                    </div>
                    <div className="feature-card fade-in-up delay-400">
                        <div className="feature-icon">🥡</div>
                        <h3>Stok & Yem</h3>
                        <p>Yem ve ilaç stoklarını yönetin. Kritik seviyelerde otomatik uyarı alın.</p>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="testimonials-section" id="testimonials">
                <div className="section-header fade-in-up">
                    <h2>Çiftçilerimiz Ne Diyor?</h2>
                    <p>Başarı hikayelerine göz atın</p>
                </div>

                <div className="testimonials-grid">
                    <div className="testimonial-card fade-in-up">
                        <FaQuoteLeft className="quote-icon" />
                        <p>"Agrolina sayesinde süt verimimizi %25 artırdık. Artık hangi ineğin ne kadar ürettiğini tam olarak biliyoruz."</p>
                        <div className="user-info">
                            <div className="avatar">AD</div>
                            <div>
                                <h4>Ahmet Demir</h4>
                                <span>Demir Çiftliği (50 Baş)</span>
                            </div>
                        </div>
                        <div className="stars"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
                    </div>
                    <div className="testimonial-card fade-in-up delay-100">
                        <FaQuoteLeft className="quote-icon" />
                        <p>"Aşı takibini sürekli kaçırıyorduk. Bildirim sistemi hayatımızı kurtardı. Stok takibi de cabası."</p>
                        <div className="user-info">
                            <div className="avatar">MY</div>
                            <div>
                                <h4>Mehmet Yılmaz</h4>
                                <span>Yılmaz Besi (120 Baş)</span>
                            </div>
                        </div>
                        <div className="stars"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section className="pricing-section" id="pricing">
                <div className="section-header fade-in-up">
                    <h2>Fiyatlandırma</h2>
                    <p>İhtiyacınıza uygun paketi seçin</p>
                </div>

                <div className="pricing-grid">
                    <div className="pricing-card fade-in-up">
                        <h3>Başlangıç</h3>
                        <div className="price">₺0<span>/ay</span></div>
                        <ul className="features-list">
                            <li><FaCheck /> 10 Hayvana Kadar</li>
                            <li><FaCheck /> Temel Sürü Takibi</li>
                            <li><FaCheck /> Süt Kaydı</li>
                        </ul>
                        <button className="btn-plan btn-outline" onClick={handleLoginClick}>Ücretsiz Başla</button>
                    </div>
                    <div className="pricing-card featured fade-in-up delay-100">
                        <div className="best-value">En Popüler</div>
                        <h3>Profesyonel</h3>
                        <div className="price">₺499<span>/ay</span></div>
                        <ul className="features-list">
                            <li><FaCheck /> 100 Hayvana Kadar</li>
                            <li><FaCheck /> Tüm Modüller Aktif</li>
                            <li><FaCheck /> Gelişmiş Raporlar</li>
                            <li><FaCheck /> Stok Yönetimi</li>
                        </ul>
                        <button className="btn-plan btn-primary" onClick={handleLoginClick}>Şimdi Yükselt</button>
                    </div>
                    <div className="pricing-card fade-in-up delay-200">
                        <h3>Kurumsal</h3>
                        <div className="price">₺999<span>/ay</span></div>
                        <ul className="features-list">
                            <li><FaCheck /> Sınırsız Hayvan</li>
                            <li><FaCheck /> Çoklu Çiftlik</li>
                            <li><FaCheck /> Özel API Erişimi</li>
                            <li><FaCheck /> 7/24 Destek</li>
                        </ul>
                        <button className="btn-plan btn-outline" onClick={handleLoginClick}>İletişime Geç</button>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <h2>Agrolina</h2>
                        <p>Modern teknoloji ile geleneksel tarımı buluşturuyoruz.</p>
                        <div className="social-links">
                            <span>📷</span> <span>📘</span> <span>💼</span>
                        </div>
                    </div>
                    <div className="footer-links">
                        <h4>Ürün</h4>
                        <a href="#features">Özellikler</a>
                        <a href="#pricing">Fiyatlar</a>
                        <a href="/login">Giriş</a>
                    </div>
                    <div className="footer-links">
                        <h4>Şirket</h4>
                        <a href="#">Hakkımızda</a>
                        <a href="#">Kariyer</a>
                        <a href="#">İletişim</a>
                    </div>
                    <div className="footer-links">
                        <h4>Yasal</h4>
                        <a href="#">Gizlilik</a>
                        <a href="#">Kullanım Şartları</a>
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
