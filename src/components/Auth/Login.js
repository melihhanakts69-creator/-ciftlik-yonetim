import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { login, register } from '../../services/api';
import logo from '../../logo.png';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); }`;
const float = keyframes`0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); }`;

// ── Styled ───────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 50%, #0f2d1a 100%);
  position: relative; overflow: hidden; padding: 20px;
  &::before {
    content: ''; position: absolute; width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(74,222,128,0.07) 0%, transparent 70%);
    top: -100px; left: -100px; animation: ${float} 8s ease-in-out infinite;
  }
  &::after {
    content: ''; position: absolute; width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 70%);
    bottom: -80px; right: -80px; animation: ${float} 10s ease-in-out infinite reverse;
  }
`;

const Card = styled.div`
  background: rgba(255,255,255,0.04); backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 24px;
  padding: 40px 36px; max-width: 460px; width: 100%;
  box-shadow: 0 32px 64px rgba(0,0,0,0.4); animation: ${fadeIn} 0.5s ease;
  position: relative; z-index: 1;
  @media (max-width: 480px) { padding: 28px 20px; }
`;

const LogoWrap = styled.div`text-align: center; margin-bottom: 28px;`;
const LogoImg = styled.img`width: 140px; height: auto; filter: drop-shadow(0 4px 20px rgba(74,222,128,0.3));`;
const Tagline = styled.p`color: #475569; font-size: 13px; margin: 8px 0 0; font-weight: 500;`;

// Role selector
const RoleGrid = styled.div`display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px;`;
const RoleCard = styled.button`
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 16px 8px; border-radius: 14px; cursor: pointer; transition: all 0.2s;
  border: 2px solid ${p => p.$active ? p.$color || '#4ade80' : 'rgba(255,255,255,0.07)'};
  background: ${p => p.$active ? `${p.$bg || 'rgba(74,222,128,0.1)'}` : 'rgba(255,255,255,0.02)'};
  .emoji { font-size: 24px; }
  .lbl { font-size: 11px; font-weight: 700; color: ${p => p.$active ? '#e2e8f0' : '#475569'}; text-align: center; }
  &:hover { border-color: ${p => p.$color || '#4ade80'}; background: ${p => p.$bg || 'rgba(74,222,128,0.07)'}; }
`;

// Tab bar (Giriş / Kayıt)
const Tabs = styled.div`display: flex; gap: 0; background: rgba(255,255,255,0.04); border-radius: 12px; padding: 4px; margin-bottom: 22px;`;
const Tab = styled.button`
  flex: 1; padding: 10px; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;
  background: ${p => p.$active ? 'rgba(74,222,128,0.15)' : 'transparent'};
  color: ${p => p.$active ? '#4ade80' : '#475569'};
`;

// Form
const Form = styled.form`display: flex; flex-direction: column; gap: 14px;`;
const Label = styled.label`font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px; display: block;`;
const Input = styled.input`
  width: 100%; padding: 12px 14px; font-size: 14px; border-radius: 10px; box-sizing: border-box;
  border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: #e2e8f0; outline: none; font-family: inherit;
  &:focus { border-color: #4ade80; background: rgba(74,222,128,0.04); }
  &::placeholder { color: #334155; }
`;
const SubmitBtn = styled.button`
  width: 100%; padding: 14px; font-size: 15px; font-weight: 800; color: #fff; border: none; border-radius: 12px; cursor: pointer;
  background: linear-gradient(135deg, #4ade80, #16a34a); margin-top: 6px;
  box-shadow: 0 4px 20px rgba(74,222,128,0.3); transition: all 0.2s;
  &:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(74,222,128,0.4); }
  &:disabled { background: #1e293b; cursor: not-allowed; transform: none; box-shadow: none; color: #475569; }
`;
const AlertBox = styled.div`
  padding: 11px 14px; border-radius: 10px; font-size: 13px; animation: ${fadeIn} 0.3s;
  background: ${p => p.$err ? 'rgba(239,68,68,0.1)' : 'rgba(74,222,128,0.1)'};
  border: 1px solid ${p => p.$err ? 'rgba(239,68,68,0.2)' : 'rgba(74,222,128,0.2)'};
  color: ${p => p.$err ? '#f87171' : '#4ade80'};
`;
const Footer = styled.div`text-align: center; margin-top: 20px; font-size: 11px; color: #1e293b;`;
const SectionLabel = styled.div`
  font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 1px;
  border-top: 1px solid rgba(255,255,255,0.05); padding-top: 14px; margin-top: 4px; margin-bottom: 2px;
`;

const ROLES = [
  { key: 'ciftci', emoji: '🐄', label: 'Çiftçi', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  { key: 'veteriner', emoji: '🩺', label: 'Veteriner', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  { key: 'sutcu', emoji: '🥛', label: 'Süt Toplayıcı', color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
];

export default function Login({ onLoginSuccess }) {
  const [kayitModu, setKayitModu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [seciliRol, setSeciliRol] = useState('ciftci');

  // Mevcut oturum varsa uyar
  const mevcutKullanici = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();

  const handleCikis = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.reload();
  };

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSifre, setLoginSifre] = useState('');

  // Register — ortak
  const [form, setForm] = useState({
    isim: '', email: '', sifre: '', telefon: '',
    // ciftci
    isletmeAdi: '', sehir: '',
    // veteriner
    lisansNo: '', uzmanlik: '', klinikAdi: '',
    // sutcu
    firmaAdi: '', bolge: '',
  });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const inp = (k, ph, label, type = 'text', req = false) => (
    <div key={k}>
      <Label>{label}{req && ' *'}</Label>
      <Input type={type} value={form[k]} onChange={e => upd(k, e.target.value)} placeholder={ph} required={req} />
    </div>
  );

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      // rol da gönderiliyor — seçilen kart hangi hesabı açacağını belirler
      const r = await login({ email: loginEmail, sifre: loginSifre, rol: seciliRol });
      localStorage.setItem('token', r.data.token);
      if (r.data.refreshToken) localStorage.setItem('refreshToken', r.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(r.data.user));
      setSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
      setTimeout(() => onLoginSuccess(r.data.user), 900);
    } catch (err) {
      const data = err.response?.data;
      // Backend doğru rolü döndürdüyse otomatik seç
      if (data?.digerRol) {
        setSeciliRol(data.digerRol);
      }
      setError(data?.message || 'Giriş başarısız! Bilgilerinizi kontrol edin.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const payload = { ...form, rol: seciliRol };
      const r = await register(payload);
      localStorage.setItem('token', r.data.token);
      if (r.data.refreshToken) localStorage.setItem('refreshToken', r.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(r.data.user));
      setSuccess('Kayıt başarılı! Hoş geldiniz...');
      setTimeout(() => onLoginSuccess(r.data.user), 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt başarısız! Lütfen tekrar deneyin.');
    } finally { setLoading(false); }
  };

  const roleInfo = ROLES.find(r => r.key === seciliRol);

  return (
    <Page>
      <Card>
        <LogoWrap>
          <LogoImg src={logo} alt="Agrolina" />
          <Tagline>Akıllı Çiftlik Yönetim Sistemi</Tagline>
        </LogoWrap>

        {/* MEVCUT OTURUM UYARISI */}
        {mevcutKullanici && (
          <div style={{
            background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.25)',
            borderRadius: 12, padding: '11px 14px', marginBottom: 16, display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', gap: 10
          }}>
            <span style={{ fontSize: 12, color: '#fb923c', fontWeight: 600 }}>
              {mevcutKullanici.rol === 'veteriner' ? '🩺' : mevcutKullanici.rol === 'sutcu' ? '🥛' : '🐄'} {mevcutKullanici.isim} olarak giriş yapılı
            </span>
            <button onClick={handleCikis} style={{
              background: 'rgba(251,146,60,0.2)', border: 'none', borderRadius: 7,
              color: '#fb923c', padding: '5px 12px', fontSize: 11, fontWeight: 800, cursor: 'pointer'
            }}>Çıkış / Değiştir</button>
          </div>
        )}

        {/* ROL SEÇİCİ */}
        <RoleGrid>
          {ROLES.map(r => (
            <RoleCard key={r.key} $active={seciliRol === r.key} $color={r.color} $bg={r.bg}
              onClick={() => { setSeciliRol(r.key); setError(''); }} type="button">
              <span className="emoji">{r.emoji}</span>
              <span className="lbl">{r.label}</span>
            </RoleCard>
          ))}
        </RoleGrid>

        {/* GİRİŞ / KAYIT TAB */}
        <Tabs>
          <Tab $active={!kayitModu} onClick={() => { setKayitModu(false); setError(''); }}>Giriş Yap</Tab>
          <Tab $active={kayitModu} onClick={() => { setKayitModu(true); setError(''); }}>Kayıt Ol</Tab>
        </Tabs>

        {error && <AlertBox $err style={{ marginBottom: 12 }}>❌ {error}</AlertBox>}
        {success && <AlertBox style={{ marginBottom: 12 }}>✅ {success}</AlertBox>}

        {/* GİRİŞ FORMU */}
        {!kayitModu && (
          <Form onSubmit={handleLogin}>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="ornek@email.com" required autoComplete="email" />
            </div>
            <div>
              <Label>Şifre *</Label>
              <Input type="password" value={loginSifre} onChange={e => setLoginSifre(e.target.value)} placeholder="••••••••" required />
            </div>
            <SubmitBtn type="submit" disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : `${roleInfo.emoji} ${roleInfo.label} Olarak Giriş Yap`}
            </SubmitBtn>
          </Form>
        )}

        {/* KAYIT FORMU */}
        {kayitModu && (
          <Form onSubmit={handleRegister}>
            {inp('isim', 'Adınız Soyadınız', 'İsim Soyisim', 'text', true)}
            {inp('email', 'ornek@email.com', 'Email', 'email', true)}
            {inp('sifre', 'En az 6 karakter', 'Şifre', 'password', true)}
            {inp('telefon', '05XX XXX XX XX', 'Telefon', 'tel')}

            {/* Çiftçi özel alanları */}
            {seciliRol === 'ciftci' && (<>
              <SectionLabel>🐄 Çiftlik Bilgileri</SectionLabel>
              {inp('isletmeAdi', 'Çiftliğinizin adı', 'İşletme Adı', 'text', true)}
              {inp('sehir', 'Şehir / İlçe', 'Şehir')}
            </>)}

            {/* Veteriner özel alanları */}
            {seciliRol === 'veteriner' && (<>
              <SectionLabel>🩺 Veteriner Bilgileri</SectionLabel>
              {inp('lisansNo', 'Lisans / diploma numaranız', 'Lisans No', 'text', true)}
              {inp('uzmanlik', 'örn: Büyükbaş Hayvanlar', 'Uzmanlık Alanı')}
              {inp('klinikAdi', 'Klinik veya çalıştığınız yer', 'Klinik / Hastane Adı')}
              {inp('sehir', 'Şehir / İlçe', 'Hizmet Verdiğiniz Şehir')}
              <AlertBox style={{ fontSize: 12 }}>
                ℹ️ Kaydınız admin onayından sonra aktif olacak.
              </AlertBox>
            </>)}

            {/* Süt Toplayıcı özel alanları */}
            {seciliRol === 'sutcu' && (<>
              <SectionLabel>🥛 Toplayıcı Bilgileri</SectionLabel>
              {inp('firmaAdi', 'Süt kooperatifi veya firma adı', 'Firma Adı', 'text', true)}
              {inp('bolge', 'örn: Konya Ereğli', 'Hizmet Bölgesi')}
            </>)}

            <SubmitBtn type="submit" disabled={loading}>
              {loading ? 'Kayıt yapılıyor...' : `${roleInfo.emoji} ${roleInfo.label} Olarak Kayıt Ol`}
            </SubmitBtn>
          </Form>
        )}

        <Footer>Agrolina © 2026 — v2.0</Footer>
      </Card>
    </Page>
  );
}