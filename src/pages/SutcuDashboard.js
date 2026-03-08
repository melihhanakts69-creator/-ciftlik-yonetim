import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import * as api from '../services/api';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;

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

export default function SutcuDashboard({ kullanici }) {
  const [stats, setStats] = useState({ inekSayisi: 0, buzagiSayisi: 0, duveSayisi: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inekRes, buzagiRes, duveRes] = await Promise.all([
          api.getInekler().catch(() => ({ data: [] })),
          api.getBuzagilar().catch(() => ({ data: [] })),
          api.getDuveler().catch(() => ({ data: [] })),
        ]);
        setStats({
          inekSayisi: Array.isArray(inekRes.data) ? inekRes.data.length : 0,
          buzagiSayisi: Array.isArray(buzagiRes.data) ? buzagiRes.data.length : 0,
          duveSayisi: Array.isArray(duveRes.data) ? duveRes.data.length : 0,
        });
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const toplamHayvan = stats.inekSayisi + stats.buzagiSayisi + stats.duveSayisi;

  return (
    <DashboardContainer>
      <WelcomeBanner>
        <WelcomeInfo>
          <h1>Hoş geldiniz, {kullanici?.isim?.split(' ')[0] || 'İşçi'}</h1>
          <p>{kullanici?.isletmeAdi || 'Çiftlik'} — işçi paneli. Hayvan takibi, süt kaydı ve sağlık merkezi erişiminiz aktif.</p>
          <span className="badge">İşçi / Sağımcı Hesabı</span>
        </WelcomeInfo>
        <WelcomeImage>👷</WelcomeImage>
      </WelcomeBanner>

      {loading ? (
        <Card><p style={{ color: '#94a3b8', textAlign: 'center' }}>Yükleniyor…</p></Card>
      ) : (
        <>
          <StatGrid>
            <StatCard $bg="#E3F2FD" $color="#1976D2">
              <div className="icon-wrapper">🐄</div>
              <div className="info">
                <span className="val">{stats.inekSayisi}</span>
                <span className="lbl">İnek</span>
              </div>
            </StatCard>
            <StatCard $bg="#FFF3E0" $color="#EF6C00">
              <div className="icon-wrapper">🐮</div>
              <div className="info">
                <span className="val">{stats.buzagiSayisi}</span>
                <span className="lbl">Buzağı</span>
              </div>
            </StatCard>
            <StatCard $bg="#E8F5E9" $color="#388E3C">
              <div className="icon-wrapper">🐄</div>
              <div className="info">
                <span className="val">{stats.duveSayisi}</span>
                <span className="lbl">Düve</span>
              </div>
            </StatCard>
            <StatCard $bg="#F3E5F5" $color="#7B1FA2">
              <div className="icon-wrapper">📋</div>
              <div className="info">
                <span className="val">{toplamHayvan}</span>
                <span className="lbl">Toplam Hayvan</span>
              </div>
            </StatCard>
          </StatGrid>

          <MainGrid>
            <Card>
              <h3>Hızlı erişim</h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>
                Sol menüden <strong>İnekler</strong>, <strong>Süt Kaydı</strong>, <strong>Buzağılar</strong>, <strong>Düveler</strong> ve <strong>Sağlık Merkezi</strong> sayfalarına erişebilirsiniz.
                Çiftliğin tüm hayvan verilerine okuma/yazma yetkiniz var.
              </p>
              <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 12 }}>
                Finansal veriler, personel yönetimi ve ayarlar sadece çiftlik sahibi tarafından erişilebilir.
              </p>
            </Card>
            <Card>
              <h3>Çiftlik bilgileri</h3>
              <HistoryItem>
                <div className="farm-info">
                  <span className="farm-name">{kullanici?.isletmeAdi || '—'}</span>
                  <span className="farm-note">Bağlı olduğunuz çiftlik</span>
                </div>
                <div className="amount-info">
                  <span className="amount-val">{toplamHayvan}</span>
                  <span className="amount-time">Hayvan</span>
                </div>
              </HistoryItem>
            </Card>
          </MainGrid>
        </>
      )}
    </DashboardContainer>
  );
}
