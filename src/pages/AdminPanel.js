import React, { useState, useEffect } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import axios from 'axios';

const API = 'https://ciftlik-yonetim.onrender.com';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;
const spin = keyframes`to { transform: rotate(360deg); }`;

const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #0a0c14; color: #e2e8f0; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0a0c14; } ::-webkit-scrollbar-thumb { background: #2d3148; border-radius: 3px; }
`;

const Shell = styled.div`display: flex; min-height: 100vh; background: #0a0c14;`;

const Sidebar = styled.div`
  width: 260px; min-height: 100vh; background: #10131f;
  border-right: 1px solid rgba(255,255,255,0.05);
  display: flex; flex-direction: column; flex-shrink: 0;
  position: sticky; top: 0; height: 100vh; overflow-y: auto;
`;

const SidebarBrand = styled.div`
  padding: 22px 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  .logo { font-size: 21px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
  .logo span { color: #4ade80; }
  .sub { font-size: 10px; color: #475569; margin-top: 3px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
`;

const SidebarSection = styled.div`
  padding: 10px 12px 2px;
  .lbl { font-size: 10px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 1px; padding: 0 8px; margin-bottom: 4px; }
`;

const MenuItem = styled.button`
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 10px; border: none;
  background: ${p => p.$active ? 'rgba(74,222,128,0.1)' : 'transparent'};
  color: ${p => p.$active ? '#4ade80' : '#64748b'};
  font-size: 13px; font-weight: ${p => p.$active ? '700' : '500'};
  cursor: pointer; text-align: left; transition: all 0.15s; margin-bottom: 2px;
  border-left: 2px solid ${p => p.$active ? '#4ade80' : 'transparent'};
  .icon { font-size: 14px; min-width: 18px; }
  &:hover { background: rgba(255,255,255,0.04); color: #e2e8f0; }
`;

const LoginBox = styled.div`
  margin: 12px; background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 14px;
  h4 { font-size: 11px; font-weight: 700; color: #94a3b8; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  input {
    width: 100%; background: #0a0c14; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px; padding: 8px 10px; color: #e2e8f0; font-size: 12px;
    font-family: inherit; outline: none; margin-bottom: 7px;
    &:focus { border-color: #4ade80; }
    &::placeholder { color: #334155; }
  }
  button {
    width: 100%; background: linear-gradient(135deg, #4ade80, #16a34a);
    border: none; border-radius: 7px; color: #fff; padding: 8px;
    font-size: 12px; font-weight: 700; cursor: pointer;
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
  .err { font-size: 11px; color: #f87171; margin-bottom: 7px; }
`;

const UserCard = styled.div`
  margin: 12px; background: rgba(74,222,128,0.06);
  border: 1px solid rgba(74,222,128,0.15); border-radius: 12px; padding: 13px;
  .name { font-size: 13px; font-weight: 700; color: #4ade80; margin-bottom: 2px; }
  .email { font-size: 11px; color: #475569; margin-bottom: 9px; word-break: break-all; }
  .row { display: flex; gap: 6px; }
  button {
    flex: 1; border: none; border-radius: 7px; padding: 6px 8px;
    font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s;
  }
  .app { background: rgba(74,222,128,0.15); color: #4ade80; }
  .app:hover { background: rgba(74,222,128,0.25); }
  .out { background: rgba(239,68,68,0.12); color: #f87171; }
  .out:hover { background: rgba(239,68,68,0.22); }
`;

const SidebarFooter = styled.div`
  margin-top: auto; padding: 14px; border-top: 1px solid rgba(255,255,255,0.04);
  font-size: 10px; color: #334155; text-align: center;
`;

const Main = styled.div`flex: 1; padding: 30px 34px; overflow-y: auto; max-width: 880px;`;

const PageHeader = styled.div`
  margin-bottom: 24px; display: flex; align-items: center; gap: 14px;
  .emoji { font-size: 30px; }
  h1 { font-size: 21px; font-weight: 800; color: #fff; margin: 0; letter-spacing: -0.5px; }
  p { font-size: 13px; color: #475569; margin: 4px 0 0; }
`;

const Card = styled.div`
  background: #10131f; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05);
  padding: 20px; margin-bottom: 14px; animation: ${fadeIn} 0.25s ease;
  h3 { font-size: 11px; font-weight: 700; color: #475569; margin: 0 0 14px;
    padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);
    text-transform: uppercase; letter-spacing: 0.5px; }
`;

const Grid = styled.div`
  display: grid; grid-template-columns: ${p => p.$cols || '1fr'};
  gap: ${p => p.$gap || '13px'}; ${p => p.$mt && `margin-top: ${p.$mt}px;`}
`;

const Field = styled.div`
  display: flex; flex-direction: column; gap: 5px;
  label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.4px; }
  input, textarea, select {
    background: #0a0c14; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; padding: 9px 11px; color: #e2e8f0; font-size: 13px;
    font-family: inherit; outline: none; transition: border-color 0.15s; resize: vertical;
    &:focus { border-color: #4ade80; }
    &::placeholder { color: #334155; }
  }
  textarea { min-height: 70px; line-height: 1.5; }
  select { cursor: pointer; }
`;

const ColorField = styled.div`
  display: flex; flex-direction: column; gap: 5px;
  label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.4px; }
  .row { display: flex; align-items: center; gap: 8px; }
  input[type="color"] { width: 40px; height: 36px; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 2px; background: #0a0c14; cursor: pointer; }
  input[type="text"] {
    flex: 1; background: #0a0c14; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; padding: 9px 11px; color: #e2e8f0; font-size: 12px; font-family: monospace; outline: none;
    &:focus { border-color: #4ade80; }
  }
`;

const ImagePreview = styled.div`
  margin-top: 8px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);
  img { width: 100%; height: 130px; object-fit: cover; display: block; }
  .placeholder { height: 70px; background: #0a0c14; display: flex; align-items: center; justify-content: center; color: #334155; font-size: 12px; }
`;

const ItemCard = styled.div`
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px; padding: 15px; margin-bottom: 10px; position: relative;
`;

const DelBtn = styled.button`
  position: absolute; top: 11px; right: 11px;
  background: rgba(239,68,68,0.1); border: none; border-radius: 6px;
  color: #f87171; padding: 3px 9px; font-size: 11px; font-weight: 700;
  cursor: pointer; transition: all 0.15s;
  &:hover { background: rgba(239,68,68,0.22); }
`;

const AddBtn = styled.button`
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;
  background: rgba(74,222,128,0.05); border: 1px dashed rgba(74,222,128,0.2);
  border-radius: 10px; color: #4ade80; padding: 10px; font-size: 13px; font-weight: 600;
  cursor: pointer; margin-top: 8px; transition: all 0.15s;
  &:hover { background: rgba(74,222,128,0.1); border-color: rgba(74,222,128,0.4); }
`;

const SaveBtn = styled.button`
  display: flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #4ade80, #16a34a);
  border: none; border-radius: 10px; color: #fff;
  padding: 11px 26px; font-size: 14px; font-weight: 700;
  cursor: pointer; margin-top: 18px; transition: all 0.2s;
  box-shadow: 0 4px 18px rgba(74,222,128,0.22);
  &:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(74,222,128,0.32); }
  &:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
`;

const Loader = styled.div`
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

const Toast = styled.div`
  position: fixed; bottom: 26px; right: 26px;
  background: ${p => p.$error ? '#dc2626' : '#16a34a'};
  color: #fff; padding: 11px 18px; border-radius: 10px; font-size: 13px; font-weight: 700;
  z-index: 9999; animation: ${fadeIn} 0.3s ease; box-shadow: 0 8px 28px rgba(0,0,0,0.4);
`;

const Tip = styled.div`
  background: rgba(74,222,128,0.06); border: 1px solid rgba(74,222,128,0.14);
  border-radius: 8px; padding: 10px 13px; font-size: 12px; color: #86efac; margin-bottom: 14px;
`;

/* ── SECTIONS ── */
const SECTIONS = [
    {
        group: 'İÇERİK', items: [
            { key: 'hero', label: 'Hero Bölümü', icon: '🎯' },
            { key: 'stats', label: 'İstatistikler', icon: '📊' },
            { key: 'features', label: 'Özellikler', icon: '✨' },
            { key: 'testimonials', label: 'Yorumlar', icon: '💬' },
            { key: 'pricing', label: 'Fiyatlar', icon: '💰' },
        ]
    },
    {
        group: 'GÖRÜNÜM', items: [
            { key: 'appearance', label: 'Renkler & Tema', icon: '🎨' },
            { key: 'images', label: 'Görseller', icon: '🖼️' },
        ]
    },
    {
        group: 'SİTE', items: [
            { key: 'seo', label: 'SEO & Meta', icon: '🔍' },
            { key: 'footer', label: 'Footer & İletişim', icon: '📬' },
            { key: 'social', label: 'Sosyal Medya', icon: '📱' },
        ]
    },
    {
        group: 'HESAP', items: [
            { key: 'login', label: 'Giriş / Hesap', icon: '🔐' },
        ]
    },
];

const DEFAULTS = {
    hero: { badge: '🚀 Modern Çiftlik Yönetimi', title: 'Çiftliğinizi Geleceğe Taşıyın', subtitle: 'Sürü takibi, süt verimi analizi, stok yönetimi ve finansal raporlamalar tek bir platformda. Verimliliğinizi %30 artırın.', btnPrimary: 'Hemen Başlayın', btnSecondary: 'Nasıl Çalışır?' },
    stats: [{ value: '500+', label: 'Aktif Çiftlik' }, { value: '100k+', label: 'Kayıtlı Hayvan' }, { value: '%35', label: 'Ortalama Verim Artışı' }],
    features: [
        { icon: '📊', title: 'Akıllı Raporlama', desc: 'Karmaşık verileri anlaşılır grafiklere dönüştürün.' },
        { icon: '🔔', title: 'Akıllı Bildirimler', desc: 'Aşı, doğum ve stok uyarılarını zamanında alın.' },
        { icon: '🏥', title: 'Sağlık Takibi', desc: 'Tedavi geçmişi, aşı takvimi ve hastalık kayıtları.' },
        { icon: '🥡', title: 'Stok & Yem', desc: 'Yem ve ilaç stoklarını yönetin.' },
    ],
    testimonials: [
        { text: '"Agrolina sayesinde süt verimimizi %25 artırdık."', name: 'Ahmet Demir', farm: 'Demir Çiftliği', size: '50 Baş', initials: 'AD' },
        { text: '"Bildirim sistemi hayatımızı kurtardı."', name: 'Mehmet Yılmaz', farm: 'Yılmaz Besi', size: '120 Baş', initials: 'MY' },
    ],
    pricing: [
        { name: 'Başlangıç', price: '₺0', period: '/ay', features: ['10 Hayvana Kadar', 'Temel Sürü Takibi', 'Süt Kaydı'], popular: false, btnText: 'Ücretsiz Başla' },
        { name: 'Profesyonel', price: '₺499', period: '/ay', features: ['100 Hayvana Kadar', 'Tüm Modüller Aktif', 'Gelişmiş Raporlar'], popular: true, btnText: 'Şimdi Yükselt' },
        { name: 'Kurumsal', price: '₺999', period: '/ay', features: ['Sınırsız Hayvan', 'Çoklu Çiftlik', '7/24 Destek'], popular: false, btnText: 'İletişime Geç' },
    ],
    appearance: { primaryColor: '#4CAF50', secondaryColor: '#2E7D32', heroBg: 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%)', accentColor: '#81C784' },
    images: { heroImage: '', featuresImage: '', logoUrl: '', ogImage: '' },
    seo: { siteTitle: 'Agrolina - Modern Çiftlik Yönetim Platformu', metaDescription: 'Sürü takibi, süt verimi analizi, stok yönetimi ve finansal raporlamalar tek bir platformda.', keywords: 'çiftlik yönetimi, sürü takibi, süt verimi, tarım yazılımı' },
    footer: { companyName: 'Agrolina Teknoloji A.Ş.', slogan: 'Modern teknoloji ile geleneksel tarımı buluşturuyoruz.', email: 'info@agrolina.com', phone: '', address: '', copyright: '© 2026 Agrolina Teknoloji A.Ş. Tüm hakları saklıdır.' },
    social: { instagram: '', facebook: '', linkedin: '', twitter: '', youtube: '' },
};

export default function AdminPanel() {
    const [active, setActive] = useState('hero');
    const [content, setContent] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Hesap / Login
    const [user, setUser] = useState(null);
    const [loginForm, setLoginForm] = useState({ email: '', sifre: '' });
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    useEffect(() => {
        // Mevcut oturumu kontrol et
        const stored = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (stored && token) setUser(JSON.parse(stored));

        // İçerik yükle
        axios.get(`${API}/api/admin/content`)
            .then(r => setContent({ ...DEFAULTS, ...r.data }))
            .catch(() => setContent(DEFAULTS));
    }, []);

    const toast_ = (msg, error = false) => { setToast({ msg, error }); setTimeout(() => setToast(null), 3500); };

    const doLogin = async () => {
        setLoginLoading(true); setLoginError('');
        try {
            const r = await axios.post(`${API}/api/auth/login`, loginForm);
            const { token, refreshToken, user: u } = r.data;
            localStorage.setItem('token', token);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(u));
            setUser(u);
            toast_('✅ Giriş yapıldı!');
        } catch (e) {
            setLoginError(e.response?.data?.message || 'E-posta veya şifre hatalı');
        } finally { setLoginLoading(false); }
    };

    const doLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        toast_('Çıkış yapıldı');
    };

    const save = async (key) => {
        setSaving(true);
        try { await axios.put(`${API}/api/admin/content/${key}`, { data: content[key] }); toast_('✅ Kaydedildi!'); }
        catch { toast_('❌ Kayıt başarısız', true); }
        finally { setSaving(false); }
    };

    const upd = (key, val) => setContent(p => ({ ...p, [key]: val }));
    const updArr = (key, i, patch) => { const a = [...(content[key] || [])]; a[i] = { ...a[i], ...patch }; upd(key, a); };

    if (!content) return (
        <Shell style={{ alignItems: 'center', justifyContent: 'center' }}>
            <GlobalStyle />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <Loader style={{ width: 30, height: 30, borderTopColor: '#4ade80' }} />
                <div style={{ color: '#475569', fontSize: 14 }}>Yükleniyor...</div>
            </div>
        </Shell>
    );

    const sel = k => content[k] || DEFAULTS[k];

    return (
        <Shell>
            <GlobalStyle />
            <Sidebar>
                <SidebarBrand>
                    <div className="logo">🌱 Agro<span>lina</span></div>
                    <div className="sub">Admin Paneli</div>
                </SidebarBrand>

                {/* Hesap alanı - her zaman sidebar üstünde görünür */}
                {user ? (
                    <UserCard>
                        <div className="name">{user.isim || user.ad || user.name || 'Admin'}</div>
                        <div className="email">{user.email}</div>
                        <div className="row">
                            <button className="app" onClick={() => window.location.href = '/'}>🏠 Uygulamaya Git</button>
                            <button className="out" onClick={doLogout}>Çıkış</button>
                        </div>
                    </UserCard>
                ) : (
                    <LoginBox>
                        <h4>🔐 Giriş Yap</h4>
                        {loginError && <div className="err">{loginError}</div>}
                        <input
                            type="email" placeholder="E-posta"
                            value={loginForm.email}
                            onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && doLogin()}
                        />
                        <input
                            type="password" placeholder="Şifre"
                            value={loginForm.sifre}
                            onChange={e => setLoginForm(p => ({ ...p, sifre: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && doLogin()}
                        />
                        <button onClick={doLogin} disabled={loginLoading}>
                            {loginLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                        </button>
                    </LoginBox>
                )}

                {/* Menü */}
                {SECTIONS.map(g => (
                    <SidebarSection key={g.group}>
                        <div className="lbl">{g.group}</div>
                        {g.items.map(s => (
                            <MenuItem key={s.key} $active={active === s.key} onClick={() => setActive(s.key)}>
                                <span className="icon">{s.icon}</span>{s.label}
                            </MenuItem>
                        ))}
                    </SidebarSection>
                ))}

                <SidebarFooter>v2.1 · Agrolina Admin</SidebarFooter>
            </Sidebar>

            <Main key={active}>

                {/* ═══ HERO ═══ */}
                {active === 'hero' && <>
                    <PageHeader><span className="emoji">🎯</span><div><h1>Hero Bölümü</h1><p>Ziyaretçinin ilk gördüğü ana ekran</p></div></PageHeader>
                    <Card>
                        <h3>Başlık & Metin</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>Badge Metni</label><input value={sel('hero').badge} onChange={e => upd('hero', { ...sel('hero'), badge: e.target.value })} /></Field>
                            <Field><label>Ana Başlık</label><input value={sel('hero').title} onChange={e => upd('hero', { ...sel('hero'), title: e.target.value })} /></Field>
                        </Grid>
                        <Grid $mt={11}>
                            <Field><label>Alt Başlık / Açıklama</label><textarea value={sel('hero').subtitle} onChange={e => upd('hero', { ...sel('hero'), subtitle: e.target.value })} /></Field>
                        </Grid>
                    </Card>
                    <Card>
                        <h3>Butonlar</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>Birincil Buton</label><input value={sel('hero').btnPrimary} onChange={e => upd('hero', { ...sel('hero'), btnPrimary: e.target.value })} /></Field>
                            <Field><label>İkincil Buton</label><input value={sel('hero').btnSecondary} onChange={e => upd('hero', { ...sel('hero'), btnSecondary: e.target.value })} /></Field>
                        </Grid>
                    </Card>
                    <SaveBtn onClick={() => save('hero')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

                {/* ═══ STATS ═══ */}
                {active === 'stats' && <>
                    <PageHeader><span className="emoji">📊</span><div><h1>İstatistikler</h1><p>Hero altındaki sayısal kartlar</p></div></PageHeader>
                    {sel('stats').map((s, i) => (
                        <Card key={i}>
                            <h3>İstatistik {i + 1}</h3>
                            <Grid $cols="1fr 1fr">
                                <Field><label>Değer (ör: 500+)</label><input value={s.value} onChange={e => updArr('stats', i, { value: e.target.value })} /></Field>
                                <Field><label>Açıklama</label><input value={s.label} onChange={e => updArr('stats', i, { label: e.target.value })} /></Field>
                            </Grid>
                        </Card>
                    ))}
                    <SaveBtn onClick={() => save('stats')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

                {/* ═══ FEATURES ═══ */}
                {active === 'features' && <>
                    <PageHeader><span className="emoji">✨</span><div><h1>Özellikler</h1><p>"Neden Agrolina?" kartları</p></div></PageHeader>
                    {sel('features').map((f, i) => (
                        <ItemCard key={i}>
                            <DelBtn onClick={() => upd('features', sel('features').filter((_, j) => j !== i))}>🗑 Sil</DelBtn>
                            <Grid $cols="55px 1fr 2fr">
                                <Field><label>Emoji</label><input value={f.icon} onChange={e => updArr('features', i, { icon: e.target.value })} /></Field>
                                <Field><label>Başlık</label><input value={f.title} onChange={e => updArr('features', i, { title: e.target.value })} /></Field>
                                <Field><label>Açıklama</label><input value={f.desc} onChange={e => updArr('features', i, { desc: e.target.value })} /></Field>
                            </Grid>
                        </ItemCard>
                    ))}
                    <AddBtn onClick={() => upd('features', [...sel('features'), { icon: '⭐', title: 'Yeni Özellik', desc: 'Açıklama' }])}>+ Kart Ekle</AddBtn>
                    <SaveBtn onClick={() => save('features')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

                {/* ═══ TESTIMONIALS ═══ */}
                {active === 'testimonials' && <>
                    <PageHeader><span className="emoji">💬</span><div><h1>Müşteri Yorumları</h1><p>Referans ve başarı hikayeleri</p></div></PageHeader>
                    {sel('testimonials').map((t, i) => (
                        <ItemCard key={i}>
                            <DelBtn onClick={() => upd('testimonials', sel('testimonials').filter((_, j) => j !== i))}>🗑 Sil</DelBtn>
                            <Grid $cols="1fr 1fr">
                                <Field><label>Ad Soyad</label><input value={t.name} onChange={e => updArr('testimonials', i, { name: e.target.value, initials: e.target.value.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) })} /></Field>
                                <Field><label>Çiftlik Adı</label><input value={t.farm} onChange={e => updArr('testimonials', i, { farm: e.target.value })} /></Field>
                            </Grid>
                            <Grid $mt={10}>
                                <Field><label>Yorum Metni</label><textarea value={t.text} onChange={e => updArr('testimonials', i, { text: e.target.value })} /></Field>
                            </Grid>
                            <Grid $cols="1fr 1fr" $mt={10}>
                                <Field><label>Hayvan Sayısı (ör: 80 Baş)</label><input value={t.size} onChange={e => updArr('testimonials', i, { size: e.target.value })} /></Field>
                            </Grid>
                        </ItemCard>
                    ))}
                    <AddBtn onClick={() => upd('testimonials', [...sel('testimonials'), { text: '"Yorum buraya..."', name: 'Ad Soyad', farm: 'Çiftlik Adı', size: '50 Baş', initials: 'AS' }])}>+ Yorum Ekle</AddBtn>
                    <SaveBtn onClick={() => save('testimonials')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

                {/* ═══ PRICING ═══ */}
                {active === 'pricing' && <>
                    <PageHeader><span className="emoji">💰</span><div><h1>Fiyatlandırma</h1><p>Abonelik paketleri</p></div></PageHeader>
                    {sel('pricing').map((p, i) => (
                        <ItemCard key={i}>
                            <DelBtn onClick={() => upd('pricing', sel('pricing').filter((_, j) => j !== i))}>🗑 Sil</DelBtn>
                            <Grid $cols="1fr 1fr 1fr">
                                <Field><label>Paket Adı</label><input value={p.name} onChange={e => updArr('pricing', i, { name: e.target.value })} /></Field>
                                <Field><label>Fiyat (ör: ₺499)</label><input value={p.price} onChange={e => updArr('pricing', i, { price: e.target.value })} /></Field>
                                <Field><label>Dönem (ör: /ay)</label><input value={p.period} onChange={e => updArr('pricing', i, { period: e.target.value })} /></Field>
                            </Grid>
                            <Grid $mt={10}>
                                <Field><label>Özellikler — her satır bir özellik</label>
                                    <textarea value={(p.features || []).join('\n')} onChange={e => updArr('pricing', i, { features: e.target.value.split('\n') })} style={{ minHeight: 85 }} />
                                </Field>
                            </Grid>
                            <Grid $cols="1fr 1fr" $mt={10}>
                                <Field><label>Buton Yazısı</label><input value={p.btnText} onChange={e => updArr('pricing', i, { btnText: e.target.value })} /></Field>
                                <Field><label>En Popüler Badge</label>
                                    <select value={p.popular ? 'evet' : 'hayir'} onChange={e => updArr('pricing', i, { popular: e.target.value === 'evet' })}>
                                        <option value="hayir">Hayır</option>
                                        <option value="evet">✅ Evet — "En Popüler"</option>
                                    </select>
                                </Field>
                            </Grid>
                        </ItemCard>
                    ))}
                    <AddBtn onClick={() => upd('pricing', [...sel('pricing'), { name: 'Yeni Paket', price: '₺0', period: '/ay', features: ['Özellik 1'], popular: false, btnText: 'Başla' }])}>+ Paket Ekle</AddBtn>
                    <SaveBtn onClick={() => save('pricing')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

                {/* ═══ APPEARANCE ═══ */}
                {active === 'appearance' && <>
                    <PageHeader><span className="emoji">🎨</span><div><h1>Renkler & Tema</h1><p>Site renk paleti ve görsel tema</p></div></PageHeader>
                    <Tip>💡 Renkleri değiştirdikten sonra kaydet — landing page güncel renkleri kullanır.</Tip>
                    <Card>
                        <h3>Ana Renkler</h3>
                        <Grid $cols="1fr 1fr">
                            <ColorField>
                                <label>Birincil Renk</label>
                                <div className="row">
                                    <input type="color" value={sel('appearance').primaryColor} onChange={e => upd('appearance', { ...sel('appearance'), primaryColor: e.target.value })} />
                                    <input type="text" value={sel('appearance').primaryColor} onChange={e => upd('appearance', { ...sel('appearance'), primaryColor: e.target.value })} />
                                </div>
                            </ColorField>
                            <ColorField>
                                <label>İkincil Renk</label>
                                <div className="row">
                                    <input type="color" value={sel('appearance').secondaryColor} onChange={e => upd('appearance', { ...sel('appearance'), secondaryColor: e.target.value })} />
                                    <input type="text" value={sel('appearance').secondaryColor} onChange={e => upd('appearance', { ...sel('appearance'), secondaryColor: e.target.value })} />
                                </div>
                            </ColorField>
                        </Grid>
                    </Card>
                    <Card>
                        <h3>Hero Arka Planı (CSS background değeri)</h3>
                        <Field>
                            <label>Gradient veya renk kodu</label>
                            <textarea value={sel('appearance').heroBg} onChange={e => upd('appearance', { ...sel('appearance'), heroBg: e.target.value })} style={{ minHeight: 50, fontFamily: 'monospace', fontSize: 12 }} />
                        </Field>
                        <div style={{ marginTop: 10, height: 56, borderRadius: 8, background: sel('appearance').heroBg }} />
                    </Card>
                    <SaveBtn onClick={() => save('appearance')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

                {/* ═══ IMAGES ═══ */}
                {active === 'images' && <>
                    <PageHeader><span className="emoji">🖼️</span><div><h1>Görseller</h1><p>Resim URL'leri — herhangi bir CDN ya da Unsplash linki</p></div></PageHeader>
                    <Tip>💡 Resim URL olarak Unsplash, ImgBB veya Cloudinary linki kullanabilirsin.</Tip>
                    <Card>
                        <h3>Hero Görseli</h3>
                        <Field><label>Hero Arkaplan Resmi URL</label><input value={sel('images').heroImage} onChange={e => upd('images', { ...sel('images'), heroImage: e.target.value })} placeholder="https://images.unsplash.com/..." /></Field>
                        <ImagePreview>
                            {sel('images').heroImage ? <img src={sel('images').heroImage} alt="Hero" /> : <div className="placeholder">Resim URLsi girilmedi</div>}
                        </ImagePreview>
                    </Card>
                    <Card>
                        <h3>Logo</h3>
                        <Field><label>Logo URL (boş → varsayılan)</label><input value={sel('images').logoUrl} onChange={e => upd('images', { ...sel('images'), logoUrl: e.target.value })} placeholder="https://..." /></Field>
                    </Card>
                    <Card>
                        <h3>OG Image (Sosyal medya paylaşım görseli)</h3>
                        <Field><label>OG Image URL (1200×630 önerilir)</label><input value={sel('images').ogImage} onChange={e => upd('images', { ...sel('images'), ogImage: e.target.value })} placeholder="https://..." /></Field>
                        <ImagePreview>
                            {sel('images').ogImage ? <img src={sel('images').ogImage} alt="OG" /> : <div className="placeholder">Sosyal medya görseli</div>}
                        </ImagePreview>
                    </Card>
                    <SaveBtn onClick={() => save('images')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

                {/* ═══ SEO ═══ */}
                {active === 'seo' && <>
                    <PageHeader><span className="emoji">🔍</span><div><h1>SEO & Meta Etiketler</h1><p>Google arama sonuçları ve önizleme</p></div></PageHeader>
                    <Card>
                        <h3>Sayfa Başlığı</h3>
                        <Field><label>Site Başlığı</label><input value={sel('seo').siteTitle} onChange={e => upd('seo', { ...sel('seo'), siteTitle: e.target.value })} /></Field>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 5 }}>{sel('seo').siteTitle?.length || 0} karakter (önerilen: 50-60)</div>
                    </Card>
                    <Card>
                        <h3>Meta Açıklama</h3>
                        <Field><label>Açıklama (Google'da görünür)</label>
                            <textarea value={sel('seo').metaDescription} onChange={e => upd('seo', { ...sel('seo'), metaDescription: e.target.value })} />
                        </Field>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 5 }}>{sel('seo').metaDescription?.length || 0} karakter</div>
                    </Card>
                    <Card>
                        <h3>Anahtar Kelimeler</h3>
                        <Field><label>Virgülle ayır</label><input value={sel('seo').keywords} onChange={e => upd('seo', { ...sel('seo'), keywords: e.target.value })} /></Field>
                    </Card>
                    <SaveBtn onClick={() => save('seo')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

                {/* ═══ FOOTER ═══ */}
                {active === 'footer' && <>
                    <PageHeader><span className="emoji">📬</span><div><h1>Footer & İletişim</h1><p>Sayfanın alt kısmı</p></div></PageHeader>
                    <Card>
                        <h3>Şirket Bilgileri</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>Şirket Adı</label><input value={sel('footer').companyName} onChange={e => upd('footer', { ...sel('footer'), companyName: e.target.value })} /></Field>
                            <Field><label>Copyright Metni</label><input value={sel('footer').copyright} onChange={e => upd('footer', { ...sel('footer'), copyright: e.target.value })} /></Field>
                        </Grid>
                        <Grid $mt={11}>
                            <Field><label>Slogan</label><input value={sel('footer').slogan} onChange={e => upd('footer', { ...sel('footer'), slogan: e.target.value })} /></Field>
                        </Grid>
                    </Card>
                    <Card>
                        <h3>İletişim</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>E-posta</label><input type="email" value={sel('footer').email} onChange={e => upd('footer', { ...sel('footer'), email: e.target.value })} /></Field>
                            <Field><label>Telefon</label><input value={sel('footer').phone} onChange={e => upd('footer', { ...sel('footer'), phone: e.target.value })} /></Field>
                        </Grid>
                        <Grid $mt={11}>
                            <Field><label>Adres</label><textarea value={sel('footer').address} onChange={e => upd('footer', { ...sel('footer'), address: e.target.value })} style={{ minHeight: 52 }} /></Field>
                        </Grid>
                    </Card>
                    <SaveBtn onClick={() => save('footer')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

                {/* ═══ SOCIAL ═══ */}
                {active === 'social' && <>
                    <PageHeader><span className="emoji">📱</span><div><h1>Sosyal Medya</h1><p>Footer'da ikon olarak görünür</p></div></PageHeader>
                    <Card>
                        <h3>Profil Linkleri</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>📷 Instagram</label><input value={sel('social').instagram} onChange={e => upd('social', { ...sel('social'), instagram: e.target.value })} placeholder="https://instagram.com/..." /></Field>
                            <Field><label>📘 Facebook</label><input value={sel('social').facebook} onChange={e => upd('social', { ...sel('social'), facebook: e.target.value })} placeholder="https://facebook.com/..." /></Field>
                            <Field><label>💼 LinkedIn</label><input value={sel('social').linkedin} onChange={e => upd('social', { ...sel('social'), linkedin: e.target.value })} placeholder="https://linkedin.com/..." /></Field>
                            <Field><label>🐦 Twitter / X</label><input value={sel('social').twitter} onChange={e => upd('social', { ...sel('social'), twitter: e.target.value })} placeholder="https://twitter.com/..." /></Field>
                            <Field><label>▶️ YouTube</label><input value={sel('social').youtube} onChange={e => upd('social', { ...sel('social'), youtube: e.target.value })} placeholder="https://youtube.com/..." /></Field>
                        </Grid>
                    </Card>
                    <SaveBtn onClick={() => save('social')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

                {/* ═══ LOGIN ═══ */}
                {active === 'login' && <>
                    <PageHeader><span className="emoji">🔐</span><div><h1>Giriş / Hesap</h1><p>Uygulamaya giriş yapın</p></div></PageHeader>
                    {user ? (
                        <Card>
                            <h3>Aktif Hesap</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0' }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>
                                    {(user.ad || user.name || 'A')[0].toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>{user.ad || user.name || 'Admin'}</div>
                                    <div style={{ color: '#475569', fontSize: 13 }}>{user.email}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                                <SaveBtn onClick={() => window.location.href = '/'} style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', boxShadow: '0 4px 18px rgba(59,130,246,0.22)' }}>
                                    🏠 Uygulamaya Git
                                </SaveBtn>
                                <SaveBtn onClick={doLogout} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 18px rgba(239,68,68,0.22)', marginTop: 18 }}>
                                    Çıkış Yap
                                </SaveBtn>
                            </div>
                        </Card>
                    ) : (
                        <Card>
                            <h3>Giriş Yap</h3>
                            {loginError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 14 }}>{loginError}</div>}
                            <Grid>
                                <Field><label>E-posta</label>
                                    <input type="email" value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} onKeyDown={e => e.key === 'Enter' && doLogin()} placeholder="kullanici@email.com" />
                                </Field>
                                <Field><label>Şifre</label>
                                    <input type="password" value={loginForm.sifre} onChange={e => setLoginForm(p => ({ ...p, sifre: e.target.value }))} onKeyDown={e => e.key === 'Enter' && doLogin()} placeholder="••••••••" />
                                </Field>
                            </Grid>
                            <SaveBtn onClick={doLogin} disabled={loginLoading}>{loginLoading ? <Loader /> : '🔐'} {loginLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</SaveBtn>
                        </Card>
                    )}
                </>}

            </Main>

            {toast && <Toast $error={toast.error}>{toast.msg}</Toast>}
        </Shell>
    );
}
