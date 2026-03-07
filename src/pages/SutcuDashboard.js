import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;
const API = process.env.REACT_APP_API_URL || 'https://ciftlik-yonetim.onrender.com';

const DashboardContainer = styled.div`
  animation: ${fadeIn} 0.4s ease;
  font-family: 'Inter', sans-serif;
  color: #333;
`;

const WelcomeBanner = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px 30px;
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 5px solid #FF9800;
`;

const WelcomeInfo = styled.div`
  h1 { font-size: 24px; font-weight: 700; color: #2c3e50; margin: 0 0 8px; }
  p { color: #7f8c8d; font-size: 15px; margin: 0; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 10px; background: rgba(255, 152, 0, 0.1); color: #F57C00; }
`;

const WelcomeImage = styled.div`font-size: 48px; opacity: 0.8;`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.2s;
  &:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }

  .icon-wrapper {
    width: 50px; height: 50px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; font-size: 24px;
    background: ${p => p.$bg || '#f1f5f9'}; color: ${p => p.$color || '#64748b'};
  }
  .info { flex: 1; display: flex; flex-direction: column; }
  .val { font-size: 24px; font-weight: 800; color: #2c3e50; line-height: 1.2; }
  .lbl { font-size: 13px; color: #95a5a6; font-weight: 500; margin-top: 2px; }
  .progress-bg { width: 100%; height: 6px; background: #f1f5f9; border-radius: 3px; margin-top: 8px; overflow: hidden; }
  .progress-bar { height: 100%; background: #FF9800; width: ${p => p.$pct || 0}%; }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 24px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  
  h3 { font-size: 16px; font-weight: 700; color: #2c3e50; margin: 0 0 20px 0; border-bottom: 1px solid #eee; padding-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
  .badge-h { background: #FFF3E0; color: #E65100; font-size: 11px; padding: 4px 8px; border-radius: 12px; }
`;

const FormRow = styled.div`display: flex; gap: 16px; margin-bottom: 16px; @media (max-width: 600px) { flex-direction: column; }`;
const Field = styled.div`
  flex: ${p => p.$flex || 1}; display: flex; flex-direction: column; gap: 8px;
  label { font-size: 12px; font-weight: 700; color: #7f8c8d; text-transform: uppercase; }
  input {
    background: #f8fafc; border: 1px solid #e2e8f0;
    border-radius: 8px; padding: 12px 16px; color: #2c3e50; font-size: 14px;
    transition: all 0.2s; outline: none; width: 100%; box-sizing: border-box;
    &:focus { border-color: #FF9800; background: white; box-shadow: 0 0 0 3px rgba(255,152,0,0.1); }
  }
`;

const SaveBtn = styled.button`
  width: 100%;
  background: #FF9800; border: none; border-radius: 8px;
  color: white; padding: 14px; font-size: 14px; font-weight: 700; cursor: pointer;
  margin-top: 10px; transition: all 0.2s;
  &:hover { background: #F57C00; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const AlertBox = styled.div`
  background: ${p => p.$err ? '#FFEBEE' : '#E8F5E9'};
  border: 1px solid ${p => p.$err ? '#FFCDD2' : '#C8E6C9'};
  color: ${p => p.$err ? '#C62828' : '#2E7D32'};
  border-radius: 8px; padding: 12px; font-size: 13px; font-weight: 500; margin-top: 16px;
`;

const HistoryItem = styled.div`
  display: flex; justify-content: space-between; align-items: center; padding: 14px 16px;
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px;
  border-left: 3px solid #FF9800;
  
  .farm-info { display: flex; flex-direction: column; gap: 4px; }
  .farm-name { font-size: 14px; font-weight: 600; color: #34495e; }
  .farm-note { font-size: 12px; color: #95a5a6; }
  
  .amount-info { text-align: right; display: flex; flex-direction: column; gap: 4px; }
  .amount-val { font-size: 15px; font-weight: 800; color: #E65100; }
  .amount-time { font-size: 11px; color: #7f8c8d; font-weight: 500; }
`;

const MOCK_HISTORY = [
  { id: 1, ciftlik: 'Demir Kardeşler Besi', miktar: 350.5, zaman: '10:45', not: 'Sabah Sütü' },
  { id: 2, ciftlik: 'Yeşil Vadi Tarım', miktar: 840.0, zaman: '11:20', not: 'Kalite: A Sınıfı' },
  { id: 3, ciftlik: 'Yılmaz Çiftliği', miktar: 125.0, zaman: '13:10', not: '-' }
];

export default function SutcuDashboard({ kullanici }) {
  const [ciftlikId, setCiftlikId] = useState('');
  const [miktar, setMiktar] = useState('');
  const [not, setNot] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const dolulukOrani = Math.min((1315.5 / 5000) * 100, 100);

  const handleKaydet = async (e) => {
    e.preventDefault();
    if (!ciftlikId || !miktar) { setErr('Çiftlik ID ve miktar girilmesi zorunludur.'); return; }
    setLoading(true); setMsg(''); setErr('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/sut-toplama`, {
        ciftlikId, miktar: parseFloat(miktar), not, tarih: new Date().toISOString()
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setMsg(`1 Başarılı! ${miktar} Litre süt kaydedildi.`);
      setCiftlikId(''); setMiktar(''); setNot('');
    } catch (e) {
      setErr(e.response?.data?.message || 'Kayıt başarısız. Lütfen bilgileri kontrol edin.');
    } finally { setLoading(false); }
  };

  return (
    <DashboardContainer>
      <WelcomeBanner>
        <WelcomeInfo>
          <h1>Hoş Geldiniz, {kullanici?.isim?.split(' ')[0] || 'Toplayıcı'}</h1>
          <p>Bugün rotanızda <strong>5</strong> çiftlik bulunuyor. Merkez depoya aktarım için araç tankı verilerini takip edin.</p>
          <span className="badge">Merkez Süt Toplama Birimi - {kullanici?.bolge || 'Bölge: X'}</span>
        </WelcomeInfo>
        <WelcomeImage>🚛</WelcomeImage>
      </WelcomeBanner>

      <StatGrid>
        <StatCard $bg="#FFF3E0" $color="#EF6C00" $pct={dolulukOrani}>
          <div className="icon-wrapper">🥛</div>
          <div className="info">
            <span className="val">1,315.5 L</span>
            <span className="lbl">Bugün Toplanan</span>
            <div className="progress-bg"><div className="progress-bar"></div></div>
          </div>
        </StatCard>
        
        <StatCard $bg="#E3F2FD" $color="#1976D2">
          <div className="icon-wrapper">📍</div>
          <div className="info">
            <span className="val">3 / 5</span>
            <span className="lbl">Ziyaret Edilen</span>
          </div>
        </StatCard>

        <StatCard $bg="#E8F5E9" $color="#388E3C">
          <div className="icon-wrapper">🏅</div>
          <div className="info">
            <span className="val">A+ Sınıfı</span>
            <span className="lbl">Süt Kalitesi Skoru</span>
          </div>
        </StatCard>
        
        <StatCard $bg="#F3E5F5" $color="#7B1FA2">
          <div className="icon-wrapper">📅</div>
          <div className="info">
            <span className="val">8.4k L</span>
            <span className="lbl">Bu Hafta Toplanan</span>
          </div>
        </StatCard>
      </StatGrid>

      <MainGrid>
        <Card>
          <h3>Süt Teslim Alma Formu</h3>
          <form onSubmit={handleKaydet}>
            <FormRow>
              <Field $flex="1.5">
                <label>Çiftlik ID Numarası *</label>
                <input value={ciftlikId} onChange={e => setCiftlikId(e.target.value)} placeholder="Örn: 507f1f77bcf8" required />
              </Field>
              <Field $flex="1">
                <label>Miktar (Litre) *</label>
                <input type="number" step="0.1" min="0" value={miktar} onChange={e => setMiktar(e.target.value)} placeholder="145.5" required />
              </Field>
            </FormRow>
            <Field>
              <label>Süt Notu (Opsiyonel)</label>
              <input value={not} onChange={e => setNot(e.target.value)} placeholder="Kalite gözlemi vb..." />
            </Field>
            
            <SaveBtn type="submit" disabled={loading}>
              {loading ? 'İşleniyor...' : 'Kayıt Ekle'}
            </SaveBtn>
          </form>

          {msg && <AlertBox>✔️ {msg}</AlertBox>}
          {err && <AlertBox $err>⚠️ {err}</AlertBox>}
        </Card>

        <Card>
          <h3>Bugünkü Toplamalar <span className="badge-h">Canlı Güncel</span></h3>
          <div>
            {MOCK_HISTORY.map(h => (
              <HistoryItem key={h.id}>
                <div className="farm-info">
                  <span className="farm-name">{h.ciftlik}</span>
                  <span className="farm-note">{h.not}</span>
                </div>
                <div className="amount-info">
                  <span className="amount-val">{h.miktar} L</span>
                  <span className="amount-time">{h.zaman}</span>
                </div>
              </HistoryItem>
            ))}
            
            <button style={{ width: '100%', marginTop: 12, background: 'transparent', border: '1px dashed #ced4da', color: '#6c757d', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
              Tüm Geçmişi Gör
            </button>
          </div>
        </Card>
      </MainGrid>

    </DashboardContainer>
  );
}
