const fs = require('fs');

const content = `import { DashboardSection, UsersSection, BlogSection, SettingsSection } from './AdminSections';
import React, { useState, useEffect } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import axios from 'axios';

const API = 'https://ciftlik-yonetim.onrender.com';

const fadeIn = keyframes\`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }\`;
const spin = keyframes\`to { transform: rotate(360deg); }\`;

const GlobalStyle = createGlobalStyle\`
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #0a0c14; color: #e2e8f0; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0a0c14; } ::-webkit-scrollbar-thumb { background: #2d3148; border-radius: 3px; }
\`;

const Shell = styled.div\`display: flex; min-height: 100vh; background: #0a0c14;\`;

const Sidebar = styled.div\`
  width: 260px; min-height: 100vh; background: #10131f;
  border-right: 1px solid rgba(255,255,255,0.05);
  display: flex; flex-direction: column; flex-shrink: 0;
  position: sticky; top: 0; height: 100vh; overflow-y: auto;
\`;

const SidebarBrand = styled.div\`
  padding: 22px 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  .logo { font-size: 21px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
  .logo span { color: #4ade80; }
  .sub { font-size: 10px; color: #475569; margin-top: 3px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
\`;

const SidebarSection = styled.div\`
  padding: 10px 12px 2px;
  .lbl { font-size: 10px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 1px; padding: 0 8px; margin-bottom: 4px; }
\`;

const MenuItem = styled.button\`
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 10px; border: none;
  background: \${p => p.\$active ? 'rgba(74,222,128,0.1)' : 'transparent'};
  color: \${p => p.\$active ? '#4ade80' : '#64748b'};
  font-size: 13px; font-weight: \${p => p.\$active ? '700' : '500'};
  cursor: pointer; text-align: left; transition: all 0.15s; margin-bottom: 2px;
  border-left: 2px solid \${p => p.\$active ? '#4ade80' : 'transparent'};
  .icon { font-size: 14px; min-width: 18px; }
  &:hover { background: rgba(255,255,255,0.04); color: #e2e8f0; }
\`;

const LoginBox = styled.div\`
  margin: 12px; background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 14px;
  h4 { font-size: 11px; font-weight: 700; color: #94a3b8; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  input {
    width: 100%; background: #0a0c14; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px; padding: 8px 10px; color: #e2e8f0; font-size: 12px;
    font-family: inherit; outline: none; margin-bottom: 7px; box-sizing: border-box;
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
\`;

const UserCard = styled.div\`
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
\`;

const SidebarFooter = styled.div\`
  margin-top: auto; padding: 14px; border-top: 1px solid rgba(255,255,255,0.04);
  font-size: 10px; color: #334155; text-align: center;
\`;

const Main = styled.div\`flex: 1; padding: 30px 34px; overflow-y: auto; max-width: 880px;\`;

const PageHeader = styled.div\`
  margin-bottom: 24px; display: flex; align-items: center; gap: 14px;
  .emoji { font-size: 30px; }
  h1 { font-size: 21px; font-weight: 800; color: #fff; margin: 0; letter-spacing: -0.5px; }
  p { font-size: 13px; color: #475569; margin: 4px 0 0; }
\`;

const Card = styled.div\`
  background: #10131f; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05);
  padding: 20px; margin-bottom: 14px; animation: \${fadeIn} 0.25s ease;
  h3 { font-size: 11px; font-weight: 700; color: #475569; margin: 0 0 14px;
    padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);
    text-transform: uppercase; letter-spacing: 0.5px; }
\`;

const Grid = styled.div\`
  display: grid; grid-template-columns: \${p => p.\$cols || '1fr'};
  gap: \${p => p.\$gap || '13px'}; \${p => p.\$mt && \`margin-top: \${p.\$mt}px;\`}
\`;

const Field = styled.div\`
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
\`;

const ColorField = styled.div\`
  display: flex; flex-direction: column; gap: 5px;
  label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.4px; }
  .row { display: flex; align-items: center; gap: 8px; }
  input[type="color"] { width: 40px; height: 36px; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 2px; background: #0a0c14; cursor: pointer; }
  input[type="text"] {
    flex: 1; background: #0a0c14; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; padding: 9px 11px; color: #e2e8f0; font-size: 12px; font-family: monospace; outline: none;
    &:focus { border-color: #4ade80; }
  }
\`;

const ImagePreview = styled.div\`
  margin-top: 8px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);
  img { width: 100%; height: 130px; object-fit: cover; display: block; }
  .placeholder { height: 70px; background: #0a0c14; display: flex; align-items: center; justify-content: center; color: #334155; font-size: 12px; }
\`;

const ItemCard = styled.div\`
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px; padding: 15px; margin-bottom: 10px; position: relative;
\`;

const DelBtn = styled.button\`
  position: absolute; top: 11px; right: 11px;
  background: rgba(239,68,68,0.1); border: none; border-radius: 6px;
  color: #f87171; padding: 3px 9px; font-size: 11px; font-weight: 700;
  cursor: pointer; transition: all 0.15s;
  &:hover { background: rgba(239,68,68,0.22); }
\`;

const AddBtn = styled.button\`
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;
  background: rgba(74,222,128,0.05); border: 1px dashed rgba(74,222,128,0.2);
  border-radius: 10px; color: #4ade80; padding: 10px; font-size: 13px; font-weight: 600;
  cursor: pointer; margin-top: 8px; transition: all 0.15s;
  &:hover { background: rgba(74,222,128,0.1); border-color: rgba(74,222,128,0.4); }
\`;

const SaveBtn = styled.button\`
  display: flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #4ade80, #16a34a);
  border: none; border-radius: 10px; color: #fff;
  padding: 11px 26px; font-size: 14px; font-weight: 700;
  cursor: pointer; margin-top: 18px; transition: all 0.2s;
  box-shadow: 0 4px 18px rgba(74,222,128,0.22);
  &:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(74,222,128,0.32); }
  &:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
\`;

const Loader = styled.div\`
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: \${spin} 0.7s linear infinite;
\`;

const Toast = styled.div\`
  position: fixed; bottom: 26px; right: 26px;
  background: \${p => p.\$error ? '#dc2626' : '#16a34a'};
  color: #fff; padding: 11px 18px; border-radius: 10px; font-size: 13px; font-weight: 700;
  z-index: 9999; animation: \${fadeIn} 0.3s ease; box-shadow: 0 8px 28px rgba(0,0,0,0.4);
\`;

const Tip = styled.div\`
  background: rgba(74,222,128,0.06); border: 1px solid rgba(74,222,128,0.14);
  border-radius: 8px; padding: 10px 13px; font-size: 12px; color: #86efac; margin-bottom: 14px;
\`;

const SECTIONS = [
  { group: 'ICERIK', items: [
    { key: 'hero', label: 'Hero Bolumu', icon: '\\uD83C\\uDFAF' },
    { key: 'stats', label: 'Istatistikler', icon: '\\uD83D\\uDCC8' },
    { key: 'features', label: 'Ozellikler', icon: '\\u2728' },
    { key: 'testimonials', label: 'Yorumlar', icon: '\\uD83D\\uDCAC' },
    { key: 'pricing', label: 'Fiyatlar', icon: '\\uD83D\\uDCB0' },
  ]},
  { group: 'GORUNUM', items: [
    { key: 'appearance', label: 'Renkler Tema', icon: '\\uD83C\\uDFA8' },
    { key: 'images', label: 'Gorseller', icon: '\\uD83D\\uDDBC\\uFE0F' },
  ]},
  { group: 'SITE', items: [
    { key: 'seo', label: 'SEO Meta', icon: '\\uD83D\\uDD0D' },
    { key: 'footer', label: 'Footer Iletisim', icon: '\\uD83D\\uDCEC' },
    { key: 'social', label: 'Sosyal Medya', icon: '\\uD83D\\uDCF1' },
  ]},
  { group: 'HESAP', items: [
    { key: 'login', label: 'Giris / Hesap', icon: '\\uD83D\\uDD10' },
  ]},
  { group: 'YONETIM', items: [
    { key: 'dashboard', label: 'Dashboard', icon: '\\uD83D\\uDCCA' },
    { key: 'users', label: 'Kullanicilar', icon: '\\uD83D\\uDC65' },
    { key: 'blog', label: 'Blog / Duyurular', icon: '\\uD83D\\uDCDD' },
    { key: 'settings', label: 'Uygulama Ayarlari', icon: '\\u2699\\uFE0F' },
  ]},
];

const DEFAULTS = {
  hero: { badge: 'Modern Ciftlik Yonetimi', title: 'Ciftliginizi Gelecege Tasiyin', subtitle: 'Suru takibi, sut verimi analizi, stok yonetimi tek bir platformda.', btnPrimary: 'Hemen Baslayin', btnSecondary: 'Nasil Calisir?' },
  stats: [{ value: '500+', label: 'Aktif Ciftlik' }, { value: '100k+', label: 'Kayitli Hayvan' }, { value: '%35', label: 'Verim Artisi' }],
  features: [
    { icon: '\\uD83D\\uDCCA', title: 'Akilli Raporlama', desc: 'Karmasik verileri anlasılır grafiklere donusturun.' },
    { icon: '\\uD83D\\uDD14', title: 'Akilli Bildirimler', desc: 'Asi, dogum ve stok uyarilarini zamaninda alin.' },
    { icon: '\\uD83C\\uDFE5', title: 'Saglik Takibi', desc: 'Tedavi gecmisi, asi takvimi ve hastalik kayitlari.' },
    { icon: '\\uD83E\\uDD61', title: 'Stok Yem', desc: 'Yem ve ilac stoklarini yonetin.' },
  ],
  testimonials: [
    { text: '"Agrolina sayesinde sut verimimizi artirdik."', name: 'Ahmet Demir', farm: 'Demir Ciftligi', size: '50 Bas', initials: 'AD' },
    { text: '"Bildirim sistemi hayatimizi kurtardi."', name: 'Mehmet Yilmaz', farm: 'Yilmaz Besi', size: '120 Bas', initials: 'MY' },
  ],
  pricing: [
    { name: 'Baslangic', price: '\\u20BA0', period: '/ay', features: ['10 Hayvana Kadar', 'Temel Suru Takibi', 'Sut Kaydi'], popular: false, btnText: 'Ucretsiz Basla' },
    { name: 'Profesyonel', price: '\\u20BA499', period: '/ay', features: ['100 Hayvana Kadar', 'Tum Moduller', 'Gelismis Raporlar'], popular: true, btnText: 'Simdi Yukselt' },
    { name: 'Kurumsal', price: '\\u20BA999', period: '/ay', features: ['Sinirsiz Hayvan', 'Coklu Ciftlik', '7/24 Destek'], popular: false, btnText: 'Iletisime Gec' },
  ],
  appearance: { primaryColor: '#4CAF50', secondaryColor: '#2E7D32', heroBg: 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%)', accentColor: '#81C784' },
  images: { heroImage: '', featuresImage: '', logoUrl: '', ogImage: '' },
  seo: { siteTitle: 'Agrolina - Modern Ciftlik Yonetim Platformu', metaDescription: 'Suru takibi, sut verimi analizi, stok yonetimi.', keywords: 'ciftlik yonetimi, suru takibi' },
  footer: { companyName: 'Agrolina Teknoloji A.S.', slogan: 'Modern teknoloji ile geleneksel tarimi bulusturuyoruz.', email: 'info@agrolina.com', phone: '', address: '', copyright: '\\u00A9 2026 Agrolina Teknoloji A.S.' },
  social: { instagram: '', facebook: '', linkedin: '', twitter: '', youtube: '' },
};

export default function AdminPanel() {
  const [active, setActive] = useState('hero');
  const [content, setContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', sifre: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) setUser(JSON.parse(stored));
    axios.get(\`\${API}/api/admin/content\`)
      .then(r => setContent({ ...DEFAULTS, ...r.data }))
      .catch(() => setContent(DEFAULTS));
  }, []);

  const toast_ = (msg, error = false) => { setToast({ msg, error }); setTimeout(() => setToast(null), 3500); };

  const doLogin = async () => {
    setLoginLoading(true); setLoginError('');
    try {
      const r = await axios.post(\`\${API}/api/auth/login\`, loginForm);
      const { token, refreshToken, user: u } = r.data;
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
      toast_('Giris Yapildi!');
    } catch (e) { setLoginError(e.response?.data?.message || 'E-posta veya sifre hatali'); }
    finally { setLoginLoading(false); }
  };

  const doLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('refreshToken'); localStorage.removeItem('user');
    setUser(null); toast_('Cikis yapildi');
  };

  const save = async (key) => {
    setSaving(true);
    try { await axios.put(\`\${API}/api/admin/content/\${key}\`, { data: content[key] }); toast_('Kaydedildi!'); }
    catch { toast_('Kayit basarisiz', true); }
    finally { setSaving(false); }
  };

  const upd = (key, val) => setContent(p => ({ ...p, [key]: val }));
  const updArr = (key, i, patch) => { const a = [...(content[key] || [])]; a[i] = { ...a[i], ...patch }; upd(key, a); };
  const sel = k => content[k] || DEFAULTS[k];

  if (!content) return (
    <Shell style={{ alignItems: 'center', justifyContent: 'center' }}>
      <GlobalStyle />
      <Loader style={{ width: 30, height: 30, borderTopColor: '#4ade80' }} />
    </Shell>
  );

  return (
    <Shell>
      <GlobalStyle />
      <Sidebar>
        <SidebarBrand>
          <div className="logo">\\uD83C\\uDF31 Agro<span>lina</span></div>
          <div className="sub">Admin Paneli</div>
        </SidebarBrand>

        {user ? (
          <UserCard>
            <div className="name">{user.isim || user.ad || user.name || 'Admin'}</div>
            <div className="email">{user.email}</div>
            <div className="row">
              <button className="app" onClick={() => window.location.href = '/'}>Uygulamaya Git</button>
              <button className="out" onClick={doLogout}>Cikis</button>
            </div>
          </UserCard>
        ) : (
          <LoginBox>
            <h4>Giris Yap</h4>
            {loginError && <div className="err">{loginError}</div>}
            <input type="email" placeholder="E-posta" value={loginForm.email}
              onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && doLogin()} />
            <input type="password" placeholder="Sifre" value={loginForm.sifre}
              onChange={e => setLoginForm(p => ({ ...p, sifre: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && doLogin()} />
            <button onClick={doLogin} disabled={loginLoading}>
              {loginLoading ? 'Giris yapiliyor...' : 'Giris Yap'}
            </button>
          </LoginBox>
        )}

        {SECTIONS.map(g => (
          <SidebarSection key={g.group}>
            <div className="lbl">{g.group}</div>
            {g.items.map(s => (
              <MenuItem key={s.key} \$active={active === s.key} onClick={() => setActive(s.key)}>
                <span className="icon">{s.icon}</span>{s.label}
              </MenuItem>
            ))}
          </SidebarSection>
        ))}
        <SidebarFooter>v2.2 - Agrolina Admin</SidebarFooter>
      </Sidebar>

      <Main key={active}>

        {active === 'hero' && <>
          <PageHeader><span className="emoji">\\uD83C\\uDFAF</span><div><h1>Hero Bolumu</h1><p>Ana ekran icerigi</p></div></PageHeader>
          <Card>
            <h3>Baslik Metin</h3>
            <Grid \$cols="1fr 1fr">
              <Field><label>Badge</label><input value={sel('hero').badge} onChange={e => upd('hero', { ...sel('hero'), badge: e.target.value })} /></Field>
              <Field><label>Ana Baslik</label><input value={sel('hero').title} onChange={e => upd('hero', { ...sel('hero'), title: e.target.value })} /></Field>
            </Grid>
            <Grid \$mt={11}><Field><label>Alt Baslik</label><textarea value={sel('hero').subtitle} onChange={e => upd('hero', { ...sel('hero'), subtitle: e.target.value })} /></Field></Grid>
          </Card>
          <Card>
            <h3>Butonlar</h3>
            <Grid \$cols="1fr 1fr">
              <Field><label>Birincil</label><input value={sel('hero').btnPrimary} onChange={e => upd('hero', { ...sel('hero'), btnPrimary: e.target.value })} /></Field>
              <Field><label>Ikincil</label><input value={sel('hero').btnSecondary} onChange={e => upd('hero', { ...sel('hero'), btnSecondary: e.target.value })} /></Field>
            </Grid>
          </Card>
          <SaveBtn onClick={() => save('hero')} disabled={saving}>{saving ? <Loader /> : '\\uD83D\\uDCBE'} Kaydet</SaveBtn>
        </>}

        {active === 'stats' && <>
          <PageHeader><span className="emoji">\\uD83D\\uDCC8</span><div><h1>Istatistikler</h1><p>Sayisal ozet kartlar</p></div></PageHeader>
          {sel('stats').map((s, i) => (
            <Card key={i}>
              <h3>Istatistik {i + 1}</h3>
              <Grid \$cols="1fr 1fr">
                <Field><label>Deger</label><input value={s.value} onChange={e => updArr('stats', i, { value: e.target.value })} /></Field>
                <Field><label>Aciklama</label><input value={s.label} onChange={e => updArr('stats', i, { label: e.target.value })} /></Field>
              </Grid>
            </Card>
          ))}
          <SaveBtn onClick={() => save('stats')} disabled={saving}>{saving ? <Loader /> : '\\uD83D\\uDCBE'} Kaydet</SaveBtn>
        </>}

        {active === 'features' && <>
          <PageHeader><span className="emoji">\\u2728</span><div><h1>Ozellikler</h1><p>Kart listesi</p></div></PageHeader>
          {sel('features').map((f, i) => (
            <ItemCard key={i}>
              <DelBtn onClick={() => upd('features', sel('features').filter((_, j) => j !== i))}>Sil</DelBtn>
              <Grid \$cols="55px 1fr 2fr">
                <Field><label>Emoji</label><input value={f.icon} onChange={e => updArr('features', i, { icon: e.target.value })} /></Field>
                <Field><label>Baslik</label><input value={f.title} onChange={e => updArr('features', i, { title: e.target.value })} /></Field>
                <Field><label>Aciklama</label><input value={f.desc} onChange={e => updArr('features', i, { desc: e.target.value })} /></Field>
              </Grid>
            </ItemCard>
          ))}
          <AddBtn onClick={() => upd('features', [...sel('features'), { icon: '\\u2B50', title: 'Yeni Ozellik', desc: 'Aciklama' }])}>+ Kart Ekle</AddBtn>
          <SaveBtn onClick={() => save('features')} disabled={saving}>{saving ? <Loader /> : '\\uD83D\\uDCBE'} Kaydet</SaveBtn>
        </>}

        {active === 'testimonials' && <>
          <PageHeader><span className="emoji">\\uD83D\\uDCAC</span><div><h1>Musteri Yorumlari</h1><p>Referanslar</p></div></PageHeader>
          {sel('testimonials').map((t, i) => (
            <ItemCard key={i}>
              <DelBtn onClick={() => upd('testimonials', sel('testimonials').filter((_, j) => j !== i))}>Sil</DelBtn>
              <Grid \$cols="1fr 1fr">
                <Field><label>Ad Soyad</label><input value={t.name} onChange={e => updArr('testimonials', i, { name: e.target.value, initials: e.target.value.split(' ').map(w=>w[0]||'').join('').toUpperCase().slice(0,2) })} /></Field>
                <Field><label>Ciftlik</label><input value={t.farm} onChange={e => updArr('testimonials', i, { farm: e.target.value })} /></Field>
              </Grid>
              <Grid \$mt={10}><Field><label>Yorum</label><textarea value={t.text} onChange={e => updArr('testimonials', i, { text: e.target.value })} /></Field></Grid>
              <Grid \$cols="1fr 1fr" \$mt={10}>
                <Field><label>Hayvan Sayisi</label><input value={t.size} onChange={e => updArr('testimonials', i, { size: e.target.value })} /></Field>
              </Grid>
            </ItemCard>
          ))}
          <AddBtn onClick={() => upd('testimonials', [...sel('testimonials'), { text: '"Yorum..."', name: 'Ad Soyad', farm: 'Ciftlik', size: '50 Bas', initials: 'AS' }])}>+ Yorum Ekle</AddBtn>
          <SaveBtn onClick={() => save('testimonials')} disabled={saving}>{saving ? <Loader /> : '\\uD83D\\uDCBE'} Kaydet</SaveBtn>
        </>}

        {active === 'pricing' && <>
          <PageHeader><span className="emoji">\\uD83D\\uDCB0</span><div><h1>Fiyatlandirma</h1><p>Abonelik paketleri</p></div></PageHeader>
          {sel('pricing').map((p, i) => (
            <ItemCard key={i}>
              <DelBtn onClick={() => upd('pricing', sel('pricing').filter((_, j) => j !== i))}>Sil</DelBtn>
              <Grid \$cols="1fr 1fr 1fr">
                <Field><label>Paket Adi</label><input value={p.name} onChange={e => updArr('pricing', i, { name: e.target.value })} /></Field>
                <Field><label>Fiyat</label><input value={p.price} onChange={e => updArr('pricing', i, { price: e.target.value })} /></Field>
                <Field><label>Donem</label><input value={p.period} onChange={e => updArr('pricing', i, { period: e.target.value })} /></Field>
              </Grid>
              <Grid \$mt={10}><Field><label>Ozellikler (her satir bir ozellik)</label>
                <textarea value={(p.features||[]).join('\\n')} onChange={e => updArr('pricing', i, { features: e.target.value.split('\\n') })} style={{minHeight:85}} />
              </Field></Grid>
              <Grid \$cols="1fr 1fr" \$mt={10}>
                <Field><label>Buton</label><input value={p.btnText} onChange={e => updArr('pricing', i, { btnText: e.target.value })} /></Field>
                <Field><label>En Populer</label>
                  <select value={p.popular ? 'evet' : 'hayir'} onChange={e => updArr('pricing', i, { popular: e.target.value === 'evet' })}>
                    <option value="hayir">Hayir</option><option value="evet">Evet</option>
                  </select>
                </Field>
              </Grid>
            </ItemCard>
          ))}
          <AddBtn onClick={() => upd('pricing', [...sel('pricing'), { name: 'Yeni Paket', price: '\\u20BA0', period: '/ay', features: ['Ozellik'], popular: false, btnText: 'Basla' }])}>+ Paket Ekle</AddBtn>
          <SaveBtn onClick={() => save('pricing')} disabled={saving}>{saving ? <Loader /> : '\\uD83D\\uDCBE'} Kaydet</SaveBtn>
        </>}

        {active === 'appearance' && <>
          <PageHeader><span className="emoji">\\uD83C\\uDFA8</span><div><h1>Renkler Tema</h1><p>Site renk paleti</p></div></PageHeader>
          <Tip>Renkleri degistirdikten sonra kaydet.</Tip>
          <Card><h3>Ana Renkler</h3>
            <Grid \$cols="1fr 1fr">
              <ColorField><label>Birincil Renk</label><div className="row">
                <input type="color" value={sel('appearance').primaryColor} onChange={e => upd('appearance', { ...sel('appearance'), primaryColor: e.target.value })} />
                <input type="text" value={sel('appearance').primaryColor} onChange={e => upd('appearance', { ...sel('appearance'), primaryColor: e.target.value })} />
              </div></ColorField>
              <ColorField><label>Ikincil Renk</label><div className="row">
                <input type="color" value={sel('appearance').secondaryColor} onChange={e => upd('appearance', { ...sel('appearance'), secondaryColor: e.target.value })} />
                <input type="text" value={sel('appearance').secondaryColor} onChange={e => upd('appearance', { ...sel('appearance'), secondaryColor: e.target.value })} />
              </div></ColorField>
            </Grid>
          </Card>
          <Card><h3>Hero Arka Plani</h3>
            <Field><label>CSS background</label>
              <textarea value={sel('appearance').heroBg} onChange={e => upd('appearance', { ...sel('appearance'), heroBg: e.target.value })} style={{minHeight:50,fontFamily:'monospace',fontSize:12}} />
            </Field>
            <div style={{marginTop:10,height:56,borderRadius:8,background:sel('appearance').heroBg}} />
          </Card>
          <SaveBtn onClick={() => save('appearance')} disabled={saving}>{saving ? <Loader /> : '\\uD83D\\uDCBE'} Kaydet</SaveBtn>
        </>}

        {active === 'images' && <>
          <PageHeader><span className="emoji">\\uD83D\\uDDBC\\uFE0F</span><div><h1>Gorseller</h1><p>Resim URL leri</p></div></PageHeader>
          <Tip>Unsplash, ImgBB veya Cloudinary linki kullanabilirsin.</Tip>
          <Card><h3>Hero Gorseli</h3>
            <Field><label>Hero Arkaplan URL</label><input value={sel('images').heroImage} onChange={e => upd('images', { ...sel('images'), heroImage: e.target.value })} placeholder="https://..." /></Field>
            <ImagePreview>{sel('images').heroImage ? <img src={sel('images').heroImage} alt="hero" /> : <div className="placeholder">URL girilmedi</div>}</ImagePreview>
          </Card>
          <Card><h3>Logo</h3>
            <Field><label>Logo URL</label><input value={sel('images').logoUrl} onChange={e => upd('images', { ...sel('images'), logoUrl: e.target.value })} placeholder="https://..." /></Field>
          </Card>
          <Card><h3>OG Image (Sosyal medya)</h3>
            <Field><label>OG Image URL</label><input value={sel('images').ogImage} onChange={e => upd('images', { ...sel('images'), ogImage: e.target.value })} placeholder="https://..." /></Field>
            <ImagePreview>{sel('images').ogImage ? <img src={sel('images').ogImage} alt="og" /> : <div className="placeholder">Sosyal medya gorseli</div>}</ImagePreview>
          </Card>
          <SaveBtn onClick={() => save('images')} disabled={saving}>{saving ? <Loader /> : '\\uD83D\\uDCBE'} Kaydet</SaveBtn>
        </>}

        {active === 'seo' && <>
          <PageHeader><span className="emoji">\\uD83D\\uDD0D</span><div><h1>SEO Meta Etiketler</h1><p>Google arama sonuclari</p></div></PageHeader>
          <Card><h3>Sayfa Basligi</h3>
            <Field><label>Site Basligi</label><input value={sel('seo').siteTitle} onChange={e => upd('seo', { ...sel('seo'), siteTitle: e.target.value })} /></Field>
          </Card>
          <Card><h3>Meta Aciklama</h3>
            <Field><label>Aciklama</label><textarea value={sel('seo').metaDescription} onChange={e => upd('seo', { ...sel('seo'), metaDescription: e.target.value })} /></Field>
          </Card>
          <Card><h3>Anahtar Kelimeler</h3>
            <Field><label>Virgulle ayir</label><input value={sel('seo').keywords} onChange={e => upd('seo', { ...sel('seo'), keywords: e.target.value })} /></Field>
          </Card>
          <SaveBtn onClick={() => save('seo')} disabled={saving}>{saving ? <Loader /> : '\\uD83D\\uDCBE'} Kaydet</SaveBtn>
        </>}

        {active === 'footer' && <>
          <PageHeader><span className="emoji">\\uD83D\\uDCEC</span><div><h1>Footer Iletisim</h1><p>Sayfanin alt kismi</p></div></PageHeader>
          <Card><h3>Sirket Bilgileri</h3>
            <Grid \$cols="1fr 1fr">
              <Field><label>Sirket Adi</label><input value={sel('footer').companyName} onChange={e => upd('footer', { ...sel('footer'), companyName: e.target.value })} /></Field>
              <Field><label>Copyright</label><input value={sel('footer').copyright} onChange={e => upd('footer', { ...sel('footer'), copyright: e.target.value })} /></Field>
            </Grid>
            <Grid \$mt={11}><Field><label>Slogan</label><input value={sel('footer').slogan} onChange={e => upd('footer', { ...sel('footer'), slogan: e.target.value })} /></Field></Grid>
          </Card>
          <Card><h3>Iletisim</h3>
            <Grid \$cols="1fr 1fr">
              <Field><label>E-posta</label><input type="email" value={sel('footer').email} onChange={e => upd('footer', { ...sel('footer'), email: e.target.value })} /></Field>
              <Field><label>Telefon</label><input value={sel('footer').phone} onChange={e => upd('footer', { ...sel('footer'), phone: e.target.value })} /></Field>
            </Grid>
            <Grid \$mt={11}><Field><label>Adres</label><textarea value={sel('footer').address} onChange={e => upd('footer', { ...sel('footer'), address: e.target.value })} style={{minHeight:52}} /></Field></Grid>
          </Card>
          <SaveBtn onClick={() => save('footer')} disabled={saving}>{saving ? <Loader /> : '\\uD83D\\uDCBE'} Kaydet</SaveBtn>
        </>}

        {active === 'social' && <>
          <PageHeader><span className="emoji">\\uD83D\\uDCF1</span><div><h1>Sosyal Medya</h1><p>Footer ikonlari</p></div></PageHeader>
          <Card><h3>Profil Linkleri</h3>
            <Grid \$cols="1fr 1fr">
              <Field><label>Instagram</label><input value={sel('social').instagram} onChange={e => upd('social', { ...sel('social'), instagram: e.target.value })} placeholder="https://instagram.com/..." /></Field>
              <Field><label>Facebook</label><input value={sel('social').facebook} onChange={e => upd('social', { ...sel('social'), facebook: e.target.value })} placeholder="https://facebook.com/..." /></Field>
              <Field><label>LinkedIn</label><input value={sel('social').linkedin} onChange={e => upd('social', { ...sel('social'), linkedin: e.target.value })} placeholder="https://linkedin.com/..." /></Field>
              <Field><label>Twitter / X</label><input value={sel('social').twitter} onChange={e => upd('social', { ...sel('social'), twitter: e.target.value })} placeholder="https://twitter.com/..." /></Field>
              <Field><label>YouTube</label><input value={sel('social').youtube} onChange={e => upd('social', { ...sel('social'), youtube: e.target.value })} placeholder="https://youtube.com/..." /></Field>
            </Grid>
          </Card>
          <SaveBtn onClick={() => save('social')} disabled={saving}>{saving ? <Loader /> : '\\uD83D\\uDCBE'} Kaydet</SaveBtn>
        </>}

        {active === 'login' && <>
          <PageHeader><span className="emoji">\\uD83D\\uDD10</span><div><h1>Giris / Hesap</h1><p>Uygulamaya giris</p></div></PageHeader>
          {user ? (
            <Card>
              <h3>Aktif Hesap</h3>
              <div style={{display:'flex',alignItems:'center',gap:16,padding:'8px 0'}}>
                <div style={{width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,#4ade80,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800}}>
                  {(user.isim||user.ad||user.name||'A')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{fontWeight:700,color:'#fff',fontSize:15}}>{user.isim||user.ad||user.name||'Admin'}</div>
                  <div style={{color:'#475569',fontSize:13}}>{user.email}</div>
                </div>
              </div>
              <div style={{display:'flex',gap:10,marginTop:16}}>
                <SaveBtn onClick={()=>window.location.href='/'} style={{background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',boxShadow:'0 4px 18px rgba(59,130,246,0.22)'}}>Uygulamaya Git</SaveBtn>
                <SaveBtn onClick={doLogout} style={{background:'linear-gradient(135deg,#ef4444,#dc2626)',boxShadow:'0 4px 18px rgba(239,68,68,0.22)',marginTop:18}}>Cikis Yap</SaveBtn>
              </div>
            </Card>
          ) : (
            <Card>
              <h3>Giris Yap</h3>
              {loginError && <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,padding:'10px 14px',color:'#f87171',fontSize:13,marginBottom:14}}>{loginError}</div>}
              <Grid>
                <Field><label>E-posta</label><input type="email" value={loginForm.email} onChange={e=>setLoginForm(p=>({...p,email:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&doLogin()} placeholder="kullanici@email.com" /></Field>
                <Field><label>Sifre</label><input type="password" value={loginForm.sifre} onChange={e=>setLoginForm(p=>({...p,sifre:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&doLogin()} placeholder="..." /></Field>
              </Grid>
              <SaveBtn onClick={doLogin} disabled={loginLoading}>{loginLoading ? <Loader /> : '\\uD83D\\uDD10'} {loginLoading?'Giris yapiliyor...':'Giris Yap'}</SaveBtn>
            </Card>
          )}
        </>}

        {active === 'dashboard' && <DashboardSection API={API} toast_={toast_} />}
        {active === 'users' && <UsersSection API={API} toast_={toast_} />}
        {active === 'blog' && <BlogSection API={API} toast_={toast_} />}
        {active === 'settings' && <SettingsSection API={API} toast_={toast_} />}

      </Main>

      {toast && <Toast \$error={toast.error}>{toast.msg}</Toast>}
    </Shell>
  );
}
`;

// Write without BOM
fs.writeFileSync('src/pages/AdminPanel.js', content, { encoding: 'utf8' });
console.log('Written successfully, length:', content.length);
// Verify first bytes
const bytes = fs.readFileSync('src/pages/AdminPanel.js');
console.log('First 5 bytes:', [...bytes.slice(0, 5)].map(b => b.toString(16).padStart(2, '0')).join(' '));
