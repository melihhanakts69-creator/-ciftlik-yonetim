import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

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
  border-left: 5px solid #2196F3;
`;

const WelcomeInfo = styled.div`
  h1 { font-size: 24px; font-weight: 700; color: #2c3e50; margin: 0 0 8px; }
  p { color: #7f8c8d; font-size: 15px; margin: 0; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 10px; background: rgba(33, 150, 243, 0.1); color: #2196F3; }
`;

const WelcomeImage = styled.div`
  font-size: 48px;
  opacity: 0.8;
`;

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
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  
  h3 { font-size: 16px; font-weight: 700; color: #2c3e50; margin: 0 0 20px 0; border-bottom: 1px solid #eee; padding-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
  .badge-h { background: #E3F2FD; color: #1976D2; font-size: 11px; padding: 4px 8px; border-radius: 12px; }
`;

const RequestItem = styled.div`
  padding: 16px; border: 1px solid #f1f5f9; border-radius: 10px; margin-bottom: 12px;
  display: flex; gap: 16px; transition: background 0.2s;
  &:hover { background: #f8fafc; border-color: #e2e8f0; }

  .icon { width: 40px; height: 40px; border-radius: 8px; background: #FFF3E0; color: #E65100; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .content { flex: 1; }
  .header { display: flex; justify-content: space-between; margin-bottom: 4px; }
  .title { font-size: 14px; font-weight: 700; color: #34495e; }
  .time { font-size: 12px; color: #95a5a6; }
  .desc { font-size: 13px; color: #7f8c8d; line-height: 1.4; margin-bottom: 10px; }
  .actions { display: flex; gap: 8px; }
  
  button { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; }
  .btn-primary { background: #2196F3; color: white; }
  .btn-primary:hover { background: #1E88E5; }
  .btn-secondary { background: #f1f5f9; color: #475569; }
  .btn-secondary:hover { background: #e2e8f0; }
`;

const AptItem = styled.div`
  display: flex; align-items: center; padding: 12px; border-radius: 8px;
  background: ${p => p.$active ? '#E8F5E9' : '#f8fafc'};
  border-left: 3px solid ${p => p.$color || '#bdc3c7'}; margin-bottom: 10px;

  .time { font-size: 13px; font-weight: 700; color: #2c3e50; min-width: 50px; }
  .details { flex: 1; margin-left: 10px; }
  .farm { font-size: 13px; font-weight: 600; color: #34495e; }
  .type { font-size: 11px; color: #7f8c8d; margin-top: 2px; }
`;

const UnapprovedAlert = styled.div`
  background: #FFF3E0; border: 1px solid #FFE0B2; border-radius: 8px;
  padding: 16px; margin-bottom: 20px; color: #E65100;
  display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 500;
`;

export default function VeterinerDashboard({ kullanici }) {
  const isApproved = kullanici?.onaylandi;

  return (
    <DashboardContainer>
      
      {!isApproved && (
        <UnapprovedAlert>
          <span style={{fontSize: 20}}>🔒</span>
          <div>
            <strong>Hesabınız Onay Bekliyor.</strong> Sisteme tam erişim sağlamak ve reçete/teşhis işlemlerine başlamak için yönetici onayını bekleyiniz.
          </div>
        </UnapprovedAlert>
      )}

      <WelcomeBanner>
        <WelcomeInfo>
          <h1>Hoş Geldiniz, Dr. {kullanici?.isim?.split(' ')[0] || ''}</h1>
          <p>Bugün klinikte ve sahada <strong>4</strong> randevunuz, incelemeyi bekleyen <strong>2</strong> danışma isteğiniz var.</p>
          <span className="badge">Mesleki Kod: {kullanici?.klinikAdi || 'Serbest Veteriner'}</span>
        </WelcomeInfo>
        <WelcomeImage>📋</WelcomeImage>
      </WelcomeBanner>

      <StatGrid>
        <StatCard $bg="#E3F2FD" $color="#1976D2">
          <div className="icon-wrapper">🐄</div>
          <div className="info"><span className="val">1,240</span><span className="lbl">Kayıtlı Hasta (Hayvan)</span></div>
        </StatCard>
        <StatCard $bg="#FFF3E0" $color="#F57C00">
          <div className="icon-wrapper">🚨</div>
          <div className="info"><span className="val">2</span><span className="lbl">Açık Danışma İsteği</span></div>
        </StatCard>
        <StatCard $bg="#E8F5E9" $color="#388E3C">
          <div className="icon-wrapper">📅</div>
          <div className="info"><span className="val">4</span><span className="lbl">Bugünün Randevuları</span></div>
        </StatCard>
        <StatCard $bg="#F3E5F5" $color="#7B1FA2">
          <div className="icon-wrapper">💊</div>
          <div className="info"><span className="val">28</span><span className="lbl">Edilen Reçete (Aylık)</span></div>
        </StatCard>
      </StatGrid>

      <MainGrid>
        {/* Danışmalar */}
        <Card>
          <h3>Açık Çiftlik Danışmaları <span className="badge-h">2 Yeni</span></h3>
          
          <RequestItem>
            <div className="icon">⚠️</div>
            <div className="content">
              <div className="header">
                <span className="title">Yılmaz Besi Çiftliği - TR-45-1234</span>
                <span className="time">15 dk önce</span>
              </div>
              <div className="desc">İnek son iki gündür yemi yarıda bırakıyor. Süt verimi %30 düştü, ateş tespit ettik.</div>
              <div className="actions">
                <button className="btn-primary" disabled={!isApproved}>📋 Reçete / Teşhis Yaz</button>
                <button className="btn-secondary">Görüntüle</button>
              </div>
            </div>
          </RequestItem>

          <RequestItem>
            <div className="icon">ℹ️</div>
            <div className="content">
              <div className="header">
                <span className="title">Yeşil Vadi Tarım</span>
                <span className="time">2 saat önce</span>
              </div>
              <div className="desc">Sürü genelinde sonbahar öncesi şap aşılarının planlanması rica olunur.</div>
              <div className="actions">
                <button className="btn-primary" disabled={!isApproved}>📋 Reçete / Teşhis Yaz</button>
                <button className="btn-secondary">Görüntüle</button>
              </div>
            </div>
          </RequestItem>
        </Card>

        {/* Günlük Plan */}
        <Card>
          <h3>Bugünkü Takvim</h3>
          
          <AptItem $active $color="#4CAF50">
            <div className="time">09:30</div>
            <div className="details">
              <div className="farm">Demir Kardeşler Besi</div>
              <div className="type">Tamamlandı - Rutin Kontrol</div>
            </div>
          </AptItem>
          
          <AptItem $color="#2196F3">
            <div className="time">13:00</div>
            <div className="details">
              <div className="farm">Güneş Süt Çiftliği</div>
              <div className="type">Şimdi - Sürü Taraması</div>
            </div>
          </AptItem>

          <AptItem $color="#FF9800">
            <div className="time">15:45</div>
            <div className="details">
              <div className="farm">Kuzey Çiftliği</div>
              <div className="type">Bekliyor - Aşı Programı</div>
            </div>
          </AptItem>
          
          <AptItem $color="#9E9E9E">
            <div className="time">17:00</div>
            <div className="details">
              <div className="farm">Yılmaz Besi Çiftliği</div>
              <div className="type">Bekliyor - Acil İnceleme</div>
            </div>
          </AptItem>

        </Card>
      </MainGrid>

    </DashboardContainer>
  );
}
