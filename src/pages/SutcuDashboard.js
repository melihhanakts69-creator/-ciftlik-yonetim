import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;
const API = process.env.REACT_APP_API_URL || 'https://ciftlik-yonetim.onrender.com';

const Page = styled.div`
  min-height: 100vh; background: linear-gradient(135deg, #0a0f1e 0%, #1a0f0a 100%);
  color: #e2e8f0; font-family: 'Inter', system-ui, sans-serif;
`;
const TopBar = styled.div`
  display: flex; align-items: center; justify-content: space-between; padding: 16px 24px;
  background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.07);
  position: sticky; top: 0; z-index: 100; backdrop-filter: blur(12px);
`;
const Logo = styled.div`font-size: 18px; font-weight: 900; color: #fb923c; letter-spacing: -0.5px;`;
const UserBadge = styled.div`
  display: flex; align-items: center; gap: 10px; font-size: 13px; color: #94a3b8;
  span.name { color: #e2e8f0; font-weight: 600; }
`;
const LogoutBtn = styled.button`
  background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px;
  color: #f87171; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer;
  &:hover { background: rgba(239,68,68,0.2); }
`;
const Content = styled.div`max-width: 960px; margin: 0 auto; padding: 28px 20px; animation: ${fadeIn} 0.4s ease;`;
const WelcomeCard = styled.div`
  background: linear-gradient(135deg, rgba(251,146,60,0.12), rgba(249,115,22,0.06));
  border: 1px solid rgba(251,146,60,0.2); border-radius: 20px; padding: 28px 32px; margin-bottom: 24px;
  h1 { font-size: 22px; font-weight: 900; margin: 0 0 6px; }
  p { color: #64748b; font-size: 14px; margin: 0; }
`;
const TurForm = styled.div`
  background: rgba(251,146,60,0.06); border: 1px solid rgba(251,146,60,0.15);
  border-radius: 16px; padding: 24px; margin-bottom: 20px;
  h2 { font-size: 14px; font-weight: 800; color: #fb923c; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.5px; }
`;
const Row = styled.div`display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px;`;
const Label = styled.label`font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 4px; display: block;`;
const Input = styled.input`
  padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04); color: #e2e8f0; font-size: 13px; font-family: inherit;
  outline: none; width: 100%; box-sizing: border-box;
  &:focus { border-color: #fb923c; }
  &::placeholder { color: #334155; }
`;
const SaveBtn = styled.button`
  background: linear-gradient(135deg, #fb923c, #ea580c); border: none; border-radius: 10px;
  color: #fff; padding: 11px 24px; font-size: 13px; font-weight: 800; cursor: pointer;
  &:hover { opacity: 0.9; } &:disabled { opacity: 0.4; cursor: not-allowed; }
`;
const SuccessBox = styled.div`
  background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.2); border-radius: 10px;
  padding: 12px 16px; color: #4ade80; font-size: 13px; margin-top: 12px;
`;
const ErrorBox = styled.div`
  background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px;
  padding: 12px 16px; color: #f87171; font-size: 13px; margin-top: 12px;
`;
const StatGrid = styled.div`display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }`;
const StatCard = styled.div`
  background: rgba(251,146,60,0.06); border: 1px solid rgba(251,146,60,0.15);
  border-radius: 14px; padding: 20px;
  .val { font-size: 26px; font-weight: 900; color: #fb923c; }
  .lbl { font-size: 11px; color: #475569; margin-top: 4px; font-weight: 600; text-transform: uppercase; }
`;

export default function SutcuDashboard({ kullanici, onLogout }) {
    const [ciftlikId, setCiftlikId] = useState('');
    const [miktar, setMiktar] = useState('');
    const [not, setNot] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    const handleKaydet = async (e) => {
        e.preventDefault();
        if (!ciftlikId || !miktar) { setErr('Çiftlik ID ve miktar zorunludur.'); return; }
        setLoading(true); setMsg(''); setErr('');
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API}/api/sut-toplama`, {
                ciftlikId, miktar: parseFloat(miktar), not,
                tarih: new Date().toISOString()
            }, { headers: { Authorization: `Bearer ${token}` } });
            setMsg(`✅ ${miktar} litre başarıyla kaydedildi!`);
            setCiftlikId(''); setMiktar(''); setNot('');
        } catch (e) {
            setErr(e.response?.data?.message || 'Kayıt başarısız. Çiftlik ID\'yi kontrol edin.');
        } finally { setLoading(false); }
    };

    return (
        <Page>
            <TopBar>
                <Logo>🥛 Agrolina Sütçü</Logo>
                <UserBadge>
                    🥛 <span className="name">{kullanici?.isim}</span> · {kullanici?.firmaAdi || kullanici?.bolge || ''}
                    <LogoutBtn onClick={onLogout}>Çıkış</LogoutBtn>
                </UserBadge>
            </TopBar>

            <Content>
                <WelcomeCard>
                    <h1>👋 Merhaba, {kullanici?.isim?.split(' ')[0]}!</h1>
                    <p>{kullanici?.firmaAdi || 'Süt Toplayıcı'} · {kullanici?.bolge || ''} · Bugün {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </WelcomeCard>

                <StatGrid>
                    <StatCard><div className="val">0</div><div className="lbl">Bugün Toplanan (L)</div></StatCard>
                    <StatCard><div className="val">0</div><div className="lbl">Bu Hafta (L)</div></StatCard>
                    <StatCard><div className="val">0</div><div className="lbl">Bu Ay (L)</div></StatCard>
                </StatGrid>

                {/* Süt Kayıt Formu */}
                <TurForm>
                    <h2>🚛 Süt Toplama Kaydı Gir</h2>
                    <form onSubmit={handleKaydet}>
                        <Row>
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <Label>Çiftlik ID *</Label>
                                <Input
                                    value={ciftlikId}
                                    onChange={e => setCiftlikId(e.target.value)}
                                    placeholder="Çiftliğin kullanıcı ID'si"
                                    required
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: 140 }}>
                                <Label>Miktar (Litre) *</Label>
                                <Input
                                    type="number" step="0.1" min="0"
                                    value={miktar}
                                    onChange={e => setMiktar(e.target.value)}
                                    placeholder="örn: 145.5"
                                    required
                                />
                            </div>
                        </Row>
                        <Row>
                            <div style={{ flex: 1 }}>
                                <Label>Not (Opsiyonel)</Label>
                                <Input
                                    value={not}
                                    onChange={e => setNot(e.target.value)}
                                    placeholder="Kalite notu, özel durum..."
                                />
                            </div>
                        </Row>
                        <SaveBtn type="submit" disabled={loading}>
                            {loading ? 'Kaydediliyor...' : '💾 Kaydet'}
                        </SaveBtn>
                    </form>
                    {msg && <SuccessBox>{msg}</SuccessBox>}
                    {err && <ErrorBox>❌ {err}</ErrorBox>}
                </TurForm>
            </Content>
        </Page>
    );
}
