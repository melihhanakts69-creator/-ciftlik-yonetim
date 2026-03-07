import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;
const slideIn = keyframes`from { opacity: 0; transform: translateX(-15px); } to { opacity: 1; transform: translateX(0); }`;

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
  span { color: #60a5fa; }
  .icon { background: rgba(96,165,250,0.15); color: #60a5fa; padding: 6px 10px; border-radius: 10px; font-size: 16px; }
`;

const UserMenu = styled.div`
  display: flex; align-items: center; gap: 16px;
`;

const UserBadge = styled.div`
  display: flex; align-items: center; gap: 12px; font-size: 13px; color: #94a3b8;
  background: rgba(255,255,255,0.03); padding: 6px 16px 6px 6px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05);
  .avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #60a5fa, #3b82f6); display: flex; alignItems: center; justify-content: center; color: #fff; font-weight: 800; }
  .info { display: flex; flex-direction: column; }
  .name { color: #e2e8f0; font-weight: 700; }
  .status { font-size: 10px; color: ${p => p.$approved ? '#4ade80' : '#fb923c'}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
`;

const LogoutBtn = styled.button`
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px;
  color: #f87171; padding: 8px 16px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;
  &:hover { background: rgba(239,68,68,0.15); transform: translateY(-1px); }
`;

const Content = styled.div`max-width: 1100px; margin: 0 auto; padding: 32px 24px; animation: ${fadeIn} 0.4s ease;`;

const WelcomeBanner = styled.div`
  background: linear-gradient(135deg, rgba(96,165,250,0.12) 0%, rgba(59,130,246,0.04) 100%);
  border: 1px solid rgba(96,165,250,0.15); border-radius: 20px; padding: 32px; margin-bottom: 28px;
  position: relative; overflow: hidden;
  &::before { content: ''; position: absolute; top: -50%; right: -10%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%); border-radius: 50%; pointer-events: none; }
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

const Tabs = styled.div`
  display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px;
`;

const Tab = styled.button`
  background: ${p => p.$active ? 'rgba(96,165,250,0.1)' : 'transparent'};
  border: 1px solid ${p => p.$active ? 'rgba(96,165,250,0.2)' : 'transparent'};
  color: ${p => p.$active ? '#60a5fa' : '#64748b'};
  border-radius: 10px; padding: 10px 18px; font-size: 13px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  &:hover { color: ${p => p.$active ? '#60a5fa' : '#e2e8f0'}; background: ${p => p.$active ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.03)'}; }
`;

const MainGrid = styled.div`
  display: grid; grid-template-columns: 2fr 1.2fr; gap: 24px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: #10131f; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); padding: 24px;
  h3 { font-size: 16px; font-weight: 800; color: #fff; margin: 0 0 20px; display: flex; align-items: center; justify-content: space-between; }
  .badge { background: rgba(96,165,250,0.15); color: #60a5fa; padding: 4px 10px; border-radius: 20px; font-size: 11px; }
`;

const ListItem = styled.div`
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04);
  border-radius: 14px; padding: 18px; margin-bottom: 12px; display: flex; gap: 16px; align-items: flex-start;
  transition: background 0.2s; animation: ${slideIn} 0.3s ease forwards; animation-delay: ${p => p.$delay || '0s'}; opacity: 0;
  &:hover { background: rgba(255,255,255,0.04); }
  .avatar { width: 44px; height: 44px; border-radius: 12px; background: rgba(255,255,255,0.05); display: flex; alignItems: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .content { flex: 1; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .title { font-size: 14px; font-weight: 700; color: #e2e8f0; }
  .time { font-size: 11px; color: #64748b; font-weight: 600; }
  .desc { font-size: 13px; color: #94a3b8; line-height: 1.4; margin-bottom: 12px; }
  .meta { display: flex; gap: 12px; font-size: 12px; color: #64748b; }
  .meta span { display: flex; align-items: center; gap: 4px; }
  .actions { display: flex; gap: 8px; margin-top: 14px; }
  .btn-primary { background: linear-gradient(135deg, #60a5fa, #3b82f6); border: none; border-radius: 8px; color: #fff; padding: 8px 16px; font-size: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(59,130,246,0.2); }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59,130,246,0.3); }
  .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; color: #e2e8f0; padding: 8px 16px; font-size: 12px; font-weight: 700; cursor: pointer; }
  .btn-secondary:hover { background: rgba(255,255,255,0.08); }
`;

const AppointmentItem = styled.div`
  display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: 12px;
  background: rgba(255,255,255,0.02); margin-bottom: 10px; border-left: 3px solid ${p => p.$color || '#60a5fa'};
  .time-col { display: flex; flex-direction: column; align-items: center; min-width: 50px; }
  .time { font-size: 13px; font-weight: 800; color: #e2e8f0; }
  .ampm { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; }
  .info { flex: 1; }
  .farm { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 2px; }
  .type { font-size: 11px; color: #94a3b8; }
  .status { font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 20px; background: ${p => p.$bg || 'rgba(255,255,255,0.05)'}; color: ${p => p.$txt || '#94a3b8'}; }
`;

const UnapprovedOverlay = styled.div`
  position: absolute; inset: 0; background: rgba(10,12,20,0.8); backdrop-filter: blur(4px);
  display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; border-radius: 16px;
  text-align: center; padding: 30px;
  .icon { font-size: 40px; margin-bottom: 16px; }
  h3 { font-size: 18px; font-weight: 800; color: #fff; margin: 0 0 10px; }
  p { font-size: 13px; color: #94a3b8; max-width: 250px; line-height: 1.5; }
`;

// Sahte Veriler (Gelecekte API'den gelecek)
const MOCK_CONSULTS = [
  { id: 1, farm: 'Yılmaz Besi Çiftliği', animal: 'İnek TR-45-1234', issue: 'Süt veriminde ani düşüş ve hafif ateş gözlemlendi. Yem yemesi yavaşladı.', time: '10 dk önce', type: 'Genel Muayene' },
  { id: 2, farm: 'Demir Kardeşler', animal: 'Buzağı TR-45-9981', issue: 'Doğum sonrası halsizlik ve ishal şikayeti var. Acil müdahale gerekebilir.', time: '2 saat önce', type: 'Acil' },
  { id: 3, farm: 'Yeşil Vadi Tarım', animal: 'Sürü Geneli', issue: 'Rutin sonbahar aşıları için randevu ve planlama talep ediliyor.', time: 'Dün', type: 'Aşı Planlaması' }
];

const MOCK_APPOINTMENTS = [
  { id: 1, time: '09:30', ampm: 'AM', farm: 'Yılmaz Besi Çiftliği', type: 'Rutin Kontrol & Ultrason', status: 'Tamamlandı', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', txt: '#4ade80' },
  { id: 2, time: '13:00', ampm: 'PM', farm: 'Güneş Süt Çiftliği', type: 'Sürü Sağlık Taraması', status: 'Yolda', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', txt: '#fb923c' },
  { id: 3, time: '15:45', ampm: 'PM', farm: 'Demir Kardeşler', type: 'Buzağı Tedavisi', status: 'Bekliyor', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', txt: '#60a5fa' },
  { id: 4, time: '17:00', ampm: 'PM', farm: 'Kuzey Çiftliği', type: 'Aşı Uygulaması', status: 'Bekliyor', color: '#64748b', bg: 'rgba(255,255,255,0.05)', txt: '#94a3b8' }
];

export default function VeterinerDashboard({ kullanici, onLogout }) {
  const [activeTab, setActiveTab] = useState('danismalar');
  const isApproved = kullanici?.onaylandi;

  return (
    <Page>
      <TopBar>
        <Logo><div className="icon">🩺</div> Agro<span>lina</span> Vet</Logo>
        <UserMenu>
          <UserBadge $approved={isApproved}>
            <div className="info" style={{ textAlign: 'right' }}>
              <span className="name">Dr. {kullanici?.isim?.split(' ')[0] || 'Veteriner'}</span>
              <span className="status">{isApproved ? 'Yetkilendirilmiş Hekim' : 'Onay Bekliyor'}</span>
            </div>
            <div className="avatar">{(kullanici?.isim || 'V')[0].toUpperCase()}</div>
          </UserBadge>
          <LogoutBtn onClick={onLogout}>Sistemden Çık</LogoutBtn>
        </UserMenu>
      </TopBar>

      <Content>
        <WelcomeBanner>
          <h1>👋 İyi çalışmalar, Dr. {kullanici?.isim?.split(' ')[0] || ''}</h1>
          <p>
            {kullanici?.klinikAdi ? `${kullanici?.klinikAdi} - ` : ''}
            Bugün <strong>3</strong> çiftlikte toplam <strong>4</strong> planlanmış randevunuz var. <br/>
            Acil müdahale gerektiren 1 yeni danışma isteği mevcut.
          </p>
        </WelcomeBanner>

        <StatGrid>
          <StatCard $color="rgba(251,146,60,0.4)">
            <div className="icon">🚨</div>
            <div className="val">2</div>
            <div className="lbl">Açık Danışma İstekleri</div>
            <div className="trend" $trendColor="#fb923c">↑ +1 Acil durum</div>
          </StatCard>
          <StatCard $color="rgba(96,165,250,0.4)">
            <div className="icon">📅</div>
            <div className="val">4</div>
            <div className="lbl">Bugünkü Randevular</div>
            <div className="trend" $trendColor="#60a5fa">1 Yolda, 2 Bekliyor</div>
          </StatCard>
          <StatCard $color="rgba(168,85,247,0.4)">
            <div className="icon">🏥</div>
            <div className="val">128</div>
            <div className="lbl">Kayıtlı Hastalar</div>
            <div className="trend">↑ %12 Geçen aya göre</div>
          </StatCard>
          <StatCard $color="rgba(74,222,128,0.4)">
            <div className="icon">💉</div>
            <div className="val">45</div>
            <div className="lbl">Uygulanan Aşı (Bu ay)</div>
            <div className="trend">Kuduz, Şap, Çiçek</div>
          </StatCard>
        </StatGrid>

        <Tabs>
          <Tab $active={activeTab === 'danismalar'} onClick={() => setActiveTab('danismalar')}>Gelen Danışmalar</Tab>
          <Tab $active={activeTab === 'hastalar'} onClick={() => setActiveTab('hastalar')}>Kayıtlı Hastalar</Tab>
          <Tab $active={activeTab === 'receteler'} onClick={() => setActiveTab('receteler')}>Reçete & Stok</Tab>
        </Tabs>

        <MainGrid>
          {/* LECT COLUMN - MAIN CONTENT */}
          <div style={{ position: 'relative' }}>
            {!isApproved && (
              <UnapprovedOverlay>
                <div className="icon">🔒</div>
                <h3>Sınırlı Erişim</h3>
                <p>Hesabınız yönetici tarafından onaylandığında, doğrudan çiftçilerden gelen teşhis ve tedavi isteklerine buradan yanıt verebileceksiniz.</p>
              </UnapprovedOverlay>
            )}

            <Card style={{ minHeight: '400px' }}>
              {activeTab === 'danismalar' && (
                <>
                  <h3>Aktif İstekler <span className="badge">3 Yeni</span></h3>
                  {MOCK_CONSULTS.map((c, i) => (
                    <ListItem key={c.id} $delay={`${i * 0.1}s`}>
                      <div className="avatar">🐄</div>
                      <div className="content">
                        <div className="header">
                          <div className="title">{c.farm}</div>
                          <div className="time">{c.time}</div>
                        </div>
                        <div className="desc">{c.issue}</div>
                        <div className="meta">
                          <span>🔖 {c.animal}</span>
                          <span style={{ color: c.type === 'Acil' ? '#f87171' : '#64748b' }}>⚠️ {c.type}</span>
                        </div>
                        <div className="actions">
                          <button className="btn-primary">Yanıtla / Teşhis Gir</button>
                          <button className="btn-secondary">Görüntüle</button>
                        </div>
                      </div>
                    </ListItem>
                  ))}
                </>
              )}
              {activeTab === 'hastalar' && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
                  Detaylı hasta takip sistemi, aşı takvimleri ve geçmiş operasyon kayıtları bu alanda listelenecektir.
                </div>
              )}
              {activeTab === 'receteler' && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>💊</div>
                  Yazılan reçeteler, klinik stok durumunuz ve düzenli ilaç takip çizelgesi bu modülde yer alır.
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT COLUMN - SIDEBAR */}
          <div style={{ position: 'relative' }}>
            {!isApproved && (
              <UnapprovedOverlay style={{ borderRadius: 16 }}>
                <div className="icon">📅</div>
                <h3 style={{ fontSize: 16 }}>Takvim Kapalı</h3>
              </UnapprovedOverlay>
            )}
            <Card>
              <h3>Bugünkü Ajanda</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#94a3b8', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span>7 Mart 2026</span>
                <span style={{ color: '#60a5fa', cursor: 'pointer', fontWeight: 700 }}>Takvimi Aç</span>
              </div>
              
              {MOCK_APPOINTMENTS.map(apt => (
                <AppointmentItem key={apt.id} $color={apt.color} $bg={apt.bg} $txt={apt.txt}>
                  <div className="time-col">
                    <span className="time">{apt.time}</span>
                    <span className="ampm">{apt.ampm}</span>
                  </div>
                  <div className="info">
                    <div className="farm">{apt.farm}</div>
                    <div className="type">{apt.type}</div>
                  </div>
                  <div className="status">{apt.status}</div>
                </AppointmentItem>
              ))}
              
              <button style={{ width: '100%', marginTop: 20, background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                + Yeni Randevu Ekle
              </button>
            </Card>
            
            <Card style={{ marginTop: 20, background: 'linear-gradient(135deg, rgba(16,19,31,1) 0%, rgba(30,58,138,0.2) 100%)' }}>
               <h3 style={{ fontSize: 14, marginBottom: 8 }}>Hızlı Eylemler</h3>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                 <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: 12, color: '#e2e8f0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>📝 Hızlı Reçete</button>
                 <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: 12, color: '#e2e8f0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>💉 Aşı Kaydı</button>
               </div>
            </Card>
          </div>
        </MainGrid>
      </Content>
    </Page>
  );
}
