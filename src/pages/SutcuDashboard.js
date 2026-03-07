import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;
const pulse = keyframes`0% { box-shadow: 0 0 0 0 rgba(251,146,60,0.4); } 70% { box-shadow: 0 0 0 10px rgba(251,146,60,0); } 100% { box-shadow: 0 0 0 0 rgba(251,146,60,0); }`;
const API = process.env.REACT_APP_API_URL || 'https://ciftlik-yonetim.onrender.com';

const Page = styled.div`
  min-height: 100vh; background: #0a0c14;
  color: #e2e8f0; font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden;
`;

const TopBar = styled.div`
  display: flex; align-items: center; justify-content: space-between; padding: 18px 30px;
  background: rgba(16, 19, 31, 0.8); border-bottom: 1px solid rgba(255,255,255,0.05);
  position: sticky; top: 0; z-index: 100; backdrop-filter: blur(16px);
`;

const Logo = styled.div`
  font-size: 20px; font-weight: 900; color: #fff; letter-spacing: -0.5px;
  display: flex; align-items: center; gap: 10px;
  span { color: #fb923c; }
  .icon { background: rgba(251,146,60,0.15); color: #fb923c; padding: 6px 10px; border-radius: 10px; font-size: 16px; }
`;

const UserMenu = styled.div`display: flex; align-items: center; gap: 16px;`;

const UserBadge = styled.div`
  display: flex; align-items: center; gap: 12px; font-size: 13px; color: #94a3b8;
  background: rgba(255,255,255,0.03); padding: 6px 16px 6px 6px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05);
  .avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #fb923c, #ea580c); display: flex; alignItems: center; justify-content: center; color: #fff; font-weight: 800; }
  .info { display: flex; flex-direction: column; text-align: right; }
  .name { color: #e2e8f0; font-weight: 700; }
  .status { font-size: 10px; color: #4ade80; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 4px; }
  .dot { width: 6px; height: 6px; background: #4ade80; border-radius: 50%; animation: ${pulse} 2s infinite; }
`;

const LogoutBtn = styled.button`
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px;
  color: #f87171; padding: 8px 16px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;
  &:hover { background: rgba(239,68,68,0.15); transform: translateY(-1px); }
`;

const Content = styled.div`max-width: 1100px; margin: 0 auto; padding: 32px 24px; animation: ${fadeIn} 0.4s ease;`;

const WelcomeBanner = styled.div`
  background: linear-gradient(135deg, rgba(251,146,60,0.12) 0%, rgba(249,115,22,0.04) 100%);
  border: 1px solid rgba(251,146,60,0.15); border-radius: 20px; padding: 32px; margin-bottom: 28px;
  position: relative; overflow: hidden;
  &::before { content: ''; position: absolute; top: -50%; right: -10%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(251,146,60,0.1) 0%, transparent 70%); border-radius: 50%; pointer-events: none; }
  h1 { font-size: 26px; font-weight: 900; margin: 0 0 8px; color: #fff; letter-spacing: -0.5px; }
  p { color: #94a3b8; font-size: 15px; margin: 0; line-height: 1.5; }
`;

const StatGrid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px;
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
`;

const StatCard = styled.div`
  background: #10131f; border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px; padding: 22px; position: relative; overflow: hidden;
  transition: transform 0.2s, border-color 0.2s;
  &:hover { transform: translateY(-3px); border-color: ${p => p.$color || 'rgba(255,255,255,0.1)'}; }
  .icon { position: absolute; top: 22px; right: 22px; font-size: 24px; opacity: 0.8; }
  .val { font-size: 32px; font-weight: 900; color: #fff; margin-bottom: 4px; letter-spacing: -1px; }
  .lbl { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .trend { margin-top: 10px; font-size: 11px; font-weight: 600; color: ${p => p.$trendColor || '#4ade80'}; display: flex; align-items: center; gap: 4px; }
`;

const MainGrid = styled.div`
  display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: #10131f; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); padding: 24px;
  h3 { font-size: 16px; font-weight: 800; color: #fff; margin: 0 0 20px; display: flex; align-items: center; justify-content: space-between; }
  .badge { background: rgba(251,146,60,0.15); color: #fb923c; padding: 4px 10px; border-radius: 20px; font-size: 11px; }
`;

const FormRow = styled.div`display: flex; gap: 16px; margin-bottom: 16px; @media (max-width: 600px) { flex-direction: column; }`;
const Field = styled.div`
  flex: ${p => p.$flex || 1}; display: flex; flex-direction: column; gap: 8px;
  label { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
  input {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px; padding: 14px 16px; color: #e2e8f0; font-size: 15px; font-weight: 500;
    transition: all 0.2s; outline: none; box-sizing: border-box; width: 100%;
    &:focus { border-color: #fb923c; background: rgba(251,146,60,0.02); box-shadow: 0 0 0 3px rgba(251,146,60,0.1); }
    &::placeholder { color: #475569; }
  }
`;

const SaveBtn = styled.button`
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
  background: linear-gradient(135deg, #fb923c, #ea580c); border: none; border-radius: 12px;
  color: #fff; padding: 16px; font-size: 15px; font-weight: 800; cursor: pointer;
  margin-top: 24px; transition: all 0.2s; box-shadow: 0 4px 14px rgba(234,88,12,0.25);
  &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(234,88,12,0.35); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
`;

const InfoBox = styled.div`
  background: ${p => p.$err ? 'rgba(239,68,68,0.1)' : 'rgba(74,222,128,0.1)'};
  border: 1px solid ${p => p.$err ? 'rgba(239,68,68,0.2)' : 'rgba(74,222,128,0.2)'};
  border-radius: 10px; padding: 14px 16px; font-size: 13px; font-weight: 600;
  color: ${p => p.$err ? '#f87171' : '#4ade80'}; margin-top: 16px; display: flex; align-items: center; gap: 8px;
`;

const HistoryItem = styled.div`
  display: flex; align-items: center; justify-content: space-between; padding: 14px;
  background: rgba(255,255,255,0.02); border-radius: 12px; margin-bottom: 10px;
  border-left: 3px solid #fb923c;
  .main { display: flex; flex-direction: column; gap: 4px; }
  .farm { font-size: 13px; font-weight: 700; color: #fff; }
  .note { font-size: 11px; color: #64748b; }
  .right { text-align: right; display: flex; flex-direction: column; gap: 4px; }
  .amount { font-size: 15px; font-weight: 800; color: #fb923c; }
  .time { font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
`;

const ProgressBar = styled.div`
  width: 100%; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; margin-top: 12px;
  .fill { height: 100%; background: linear-gradient(90deg, #fb923c, #f59e0b); width: ${p => p.$pct}%; border-radius: 4px; }
`;

// Mock Veri
const MOCK_HISTORY = [
  { id: 1, ciftlik: 'Demir Kardeşler Besi', miktar: 350.5, zaman: '10:45', not: 'Sabah Sütü' },
  { id: 2, ciftlik: 'Yeşil Vadi Tarım', miktar: 840.0, zaman: '11:20', not: 'Kalite: A Sınıfı' },
  { id: 3, ciftlik: 'Yılmaz Çiftliği', miktar: 125.0, zaman: '13:10', not: '-' }
];

export default function SutcuDashboard({ kullanici, onLogout }) {
  const [ciftlikId, setCiftlikId] = useState('');
  const [miktar, setMiktar] = useState('');
  const [not, setNot] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const [gunlukToplanan] = useState(1315.5); // Mock
  const hedeflenenKapasite = 5000;
  const dolulukOrani = Math.min((gunlukToplanan / hedeflenenKapasite) * 100, 100);

  const handleKaydet = async (e) => {
    e.preventDefault();
    if (!ciftlikId || !miktar) { setErr('Çiftlik ID ve miktar girilmesi zorunludur.'); return; }
    setLoading(true); setMsg(''); setErr('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/sut-toplama`, {
        ciftlikId, miktar: parseFloat(miktar), not, tarih: new Date().toISOString()
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setMsg(`✅ Başarılı! ${miktar} Litre süt merkeze kaydedildi.`);
      setCiftlikId(''); setMiktar(''); setNot('');
    } catch (e) {
      setErr(e.response?.data?.message || 'Kayıt başarısız. Lütfen Çiftlik ID numarasını kontrol edin.');
    } finally { setLoading(false); }
  };

  return (
    <Page>
      <TopBar>
        <Logo><div className="icon">🥛</div> Agro<span>lina</span> Süt</Logo>
        <UserMenu>
          <UserBadge>
            <div className="info">
              <span className="name">{kullanici?.isim?.split(' ')[0] || 'Toplayıcı'}</span>
              <span className="status"><div className="dot" /> Sahada Aktif</span>
            </div>
            <div className="avatar">{(kullanici?.isim || 'S')[0].toUpperCase()}</div>
          </UserBadge>
          <LogoutBtn onClick={onLogout}>Araçtan Çık</LogoutBtn>
        </UserMenu>
      </TopBar>

      <Content>
        <WelcomeBanner>
          <h1>👋 Merhaba, {kullanici?.isim?.split(' ')[0] || ''}!</h1>
          <p>
            {kullanici?.firmaAdi || 'Merkez Süt Toplama'} · {kullanici?.bolge || 'Bölge: Tüm İç Anadolu'} <br/>
            Bugün rotanızda <strong>5</strong> çiftlik bulunuyor. Araç tankı doluluk oranına dikkat edin.
          </p>
        </WelcomeBanner>

        <StatGrid>
          <StatCard $color="rgba(251,146,60,0.4)">
            <div className="icon">🚛</div>
            <div className="val">{gunlukToplanan} L</div>
            <div className="lbl">Bugün Toplanan Süt</div>
            <ProgressBar $pct={dolulukOrani}><div className="fill" /></ProgressBar>
            <div className="trend" style={{ marginTop: 6, color: '#94a3b8' }}>Araç Kapasitesi: %{Math.round(dolulukOrani)} dolu ({hedeflenenKapasite}L)</div>
          </StatCard>
          <StatCard $color="rgba(96,165,250,0.4)">
            <div className="icon">📍</div>
            <div className="val">3 / 5</div>
            <div className="lbl">Ziyaret Edilen Çiftlik</div>
            <div className="trend" $trendColor="#60a5fa">Sonraki durak: Yıldız Besi</div>
          </StatCard>
          <StatCard $color="rgba(168,85,247,0.4)">
            <div className="icon">📅</div>
            <div className="val">8.4k L</div>
            <div className="lbl">Bu Hafta Toplanan</div>
            <div className="trend">↑ %5 Geçen haftaya göre</div>
          </StatCard>
          <StatCard $color="rgba(74,222,128,0.4)">
            <div className="icon">⭐</div>
            <div className="val">A+</div>
            <div className="lbl">Ortalama Süt Kalitesİ</div>
            <div className="trend">Son laboratuvar analizi</div>
          </StatCard>
        </StatGrid>

        <MainGrid>
          {/* LEFT: FORM */}
          <Card>
            <h3>Süt Teslimat Formu <span className="badge">Canlı Kayıt</span></h3>
            <form onSubmit={handleKaydet}>
              <FormRow>
                <Field $flex="1.5">
                  <label>Çiftlik ID Numarası *</label>
                  <input value={ciftlikId} onChange={e => setCiftlikId(e.target.value)} placeholder="Örn: 507f1f77bcf86cd799439011" autoFocus required />
                </Field>
                <Field $flex="1">
                  <label>Miktar (Litre) *</label>
                  <input type="number" step="0.1" min="0" value={miktar} onChange={e => setMiktar(e.target.value)} placeholder="145.5" required />
                </Field>
              </FormRow>
              <Field>
                <label>Notunuz (Opsiyonel)</label>
                <input value={not} onChange={e => setNot(e.target.value)} placeholder="Antiyotikli süt uyarısı, kalite gözlemi vb..." />
              </Field>
              
              <SaveBtn type="submit" disabled={loading}>
                {loading ? <span style={{display:'inline-block', animation:'pulse 1s infinite'}}>İşleniyor...</span> : '🚛 Sütü Sisteme Kaydet'}
              </SaveBtn>
            </form>
            
            {msg && <InfoBox>🎉 {msg}</InfoBox>}
            {err && <InfoBox $err>⚠️ {err}</InfoBox>}
          </Card>

          {/* RIGHT: HISTORY */}
          <Card>
            <h3>Bugünkü Toplamalar</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {MOCK_HISTORY.map((h) => (
                <HistoryItem key={h.id}>
                  <div className="main">
                    <span className="farm">{h.ciftlik}</span>
                    <span className="note">Not: {h.not}</span>
                  </div>
                  <div className="right">
                    <span className="amount">{h.miktar} L</span>
                    <span className="time">{h.zaman}</span>
                  </div>
                </HistoryItem>
              ))}
            </div>
            
            <button style={{ width: '100%', marginTop: 16, background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.background='rgba(255,255,255,0.06)'} onMouseLeave={e => e.target.style.background='rgba(255,255,255,0.03)'}>
              Tüm Geçmişi Gör
            </button>
          </Card>
        </MainGrid>

      </Content>
    </Page>
  );
}
