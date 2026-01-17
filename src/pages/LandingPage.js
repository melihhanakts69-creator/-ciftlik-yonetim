import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

// İkonlar için basit SVG'ler veya kütüphane kullanılabilir. Şimdilik text emoji/icon kullanacağım.
// Daha sonra react-icons entegre edilebilir.

const LandingPage = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <div className="landing-container">
            {/* HEADER */}
            <header className="landing-header">
                <div className="brand-logo">
                    <span>🏡</span>
                    <span>Çiftlik Yönetim Sistemi</span>
                </div>
                <nav className="nav-links">
                    <a href="#home">Ana Sayfa</a>
                    <a href="#features">Hizmetler</a>
                    <a href="#blog">Blog</a>
                    <a href="#contact">İletişim</a>
                    <button className="btn-header-login" onClick={handleLoginClick}>Giriş Yap</button>
                    <button className="btn-header-register" onClick={() => navigate('/login')}>Kayıt Ol</button>
                </nav>
            </header>

            {/* HERO SECTION */}
            <section className="hero-section" id="home">
                {/* Arka plan resmi CSS'de tanımlı */}
                {/* <div className="hero-overlay"></div> */}
                <div className="hero-content">
                    <h1>Çiftliğinizi</h1>
                    <h1>Akıllı Yönetin</h1>
                    <p className="hero-subtitle">
                        Çiftliğinizin verimliliğini artırın, her şey kontrolünüz altında!
                        Hayvan takibi, süt verimi, finansal analizler ve daha fazlası.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn-hero-primary" onClick={handleLoginClick}>Hemen Başla</button>
                        <button className="btn-hero-secondary" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                            Özellikleri İncele
                        </button>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="features-section" id="features">
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🏠</div>
                        <h3 className="feature-title">Çiftlik Takibi</h3>
                        <p className="feature-desc">Tarlalarınızı, işlerinizi ve günlük operasyonları kolayca izleyin.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🐄</div>
                        <h3 className="feature-title">Hayvan Yönetimi</h3>
                        <p className="feature-desc">İnek, Düve, Buzağı ve Tosunlarınızı detaylı kayıtlarla takip edin.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3 className="feature-title">Verim Analizi</h3>
                        <p className="feature-desc">Süt üretimi ve finansal verilerinizi grafiklerle analiz edin.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📰</div>
                        <h3 className="feature-title">Blog & Rehberler</h3>
                        <p className="feature-desc">Faydalı bilgiler, ipuçları ve sektörel haberleri keşfedin.</p>
                    </div>
                </div>
            </section>

            {/* BLOG SECTION */}
            <section className="blog-section" id="blog">
                <h2 className="section-title">Son Yazılar</h2>
                <div className="blog-grid">
                    <div className="blog-card">
                        <div className="blog-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2670&auto=format&fit=crop')" }}></div>
                        <div className="blog-content">
                            <h3 className="blog-title">Organik Tarımın Püf Noktaları</h3>
                            <p className="blog-excerpt">Sürdürülebilir tarım ve organik üretim için bilmeniz gereken temel ipuçları.</p>
                            <button className="btn-read-more">Devamını Oku &gt;</button>
                        </div>
                    </div>
                    <div className="blog-card">
                        <div className="blog-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?q=80&w=2521&auto=format&fit=crop')" }}></div>
                        <div className="blog-content">
                            <h3 className="blog-title">Süt Verimini Artırma</h3>
                            <p className="blog-excerpt">Büyükbaş hayvanlarınızdan maksimum verim almak için beslenme ve bakım önerileri.</p>
                            <button className="btn-read-more">Devamını Oku &gt;</button>
                        </div>
                    </div>
                    <div className="blog-card">
                        <div className="blog-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=2670&auto=format&fit=crop')" }}></div>
                        <div className="blog-content">
                            <h3 className="blog-title">Tarımda Teknoloji</h3>
                            <p className="blog-excerpt">Modern çiftlik yönetiminde kullanılan son teknoloji araçlar ve yazılımlar.</p>
                            <button className="btn-read-more">Devamını Oku &gt;</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA REGISTER SECTION */}
            <section className="cta-register-section">
                <div className="cta-overlay"></div>
                <div className="mini-login-card">
                    <div className="mini-login-header">
                        <h3>Giriş Yap veya Kayıt Ol</h3>
                        <span style={{ cursor: 'pointer' }} onClick={() => { }}>×</span>
                    </div>
                    <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>Deneme sürümü için hemen kayıt olun veya hesabınıza giriş yapın.</p>

                    <button
                        onClick={handleLoginClick}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#384e34',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}>
                        Giriş Yap &gt;
                    </button>
                    <p style={{ marginTop: '10px', fontSize: '0.8rem', textAlign: 'center' }}>
                        Şifrenizi mi unuttunuz?
                    </p>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="landing-footer">
                <div className="footer-links">
                    <a href="#about">Hakkımızda</a>
                    <a href="#blog">Blog</a>
                    <a href="#privacy">Gizlilik Politikası</a>
                    <a href="#contact">İletişim</a>
                </div>
                <div className="copyright">
                    © 2026 Çiftlik Yönetim Platformu. Tüm hakları saklıdır.
                </div>
                <div className="social-icons">
                    <span>📷</span>
                    <span>📘</span>
                    <span>💼</span>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
