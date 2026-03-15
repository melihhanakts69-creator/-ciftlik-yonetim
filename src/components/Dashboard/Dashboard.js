import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import * as api from '../../services/api';
import PerformansChart from './PerformansChart';
import SuruSaglikSkoru from './SuruSaglikSkoru';
import YaklasanDogumlar from '../YaklasanDogumlar';
import { Skeleton } from '../common/Skeleton';
import { FaPlus, FaMoneyBillWave, FaHeartbeat } from 'react-icons/fa';

// --- Styled Components ---

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 24px 40px;

  @media (max-width: 768px) {
    padding: 12px 12px 80px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 0;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 0;
    margin-bottom: 16px;
  }
`;

const TitleSection = styled.div``;

const GreetingLine = styled.div`
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 2px;
  font-weight: 500;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 2px 0;
  letter-spacing: -0.4px;
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    width: 100%;
    gap: 6px;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  min-height: 48px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.15s;

  background: transparent;
  color: #374151;
  border: 1px solid #e5e7eb;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  &.accent {
    background: #16a34a;
    color: white;
    border: none;
    &:hover { background: #15803d; }
  }

  svg { font-size: 13px; }

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
    padding: 10px 8px;
    font-size: 12px;
    span { display: none; }
    min-height: 48px;
  }
`;

const SutYasakBanner = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  .icon { font-size: 18px; flex-shrink: 0; }

  .text {
    flex: 1;
    font-size: 13px;
    color: #991b1b;
    font-weight: 500;
  }

  .badge {
    background: #dc2626;
    color: white;
    border-radius: 20px;
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const KpiCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  cursor: ${p => p.$clickable ? 'pointer' : 'default'};
  transition: border-color 0.15s;

  &:hover {
    border-color: ${p => p.$clickable ? '#16a34a' : '#e5e7eb'};
  }

  .kpi-label {
    font-size: 11px;
    font-weight: 500;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 8px;
  }

  .kpi-value {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    letter-spacing: -0.5px;
    line-height: 1;
  }

  .kpi-unit {
    font-size: 14px;
    color: #9ca3af;
    font-weight: 400;
    margin-left: 2px;
  }

  .kpi-trend {
    font-size: 12px;
    font-weight: 600;
    margin-top: 6px;
  }

  .kpi-bar {
    height: 3px;
    background: #f3f4f6;
    border-radius: 2px;
    margin-top: 10px;
    overflow: hidden;
  }

  .kpi-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.8s ease;
  }
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 16px;
  align-items: flex-start;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr 220px;
  }

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const MainCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`;

const SideCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 70px;

  @media (max-width: 800px) {
    position: static;
  }
`;

const BottomRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Widget = styled.div`
  background: white;
  border-radius: 12px;
  padding: 22px;
  border: 1px solid #e5e7eb;
  height: 100%;
  display: flex;
  flex-direction: column;

  h3 {
    margin: 0 0 18px 0;
    font-size: 15px;
    font-weight: 700;
    color: #111827;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  @media (max-width: 768px) {
    padding: 16px;
    h3 { margin-bottom: 12px; font-size: 14px; }
  }
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child { border-bottom: none; }

  .dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .task-body { flex: 1; }
  .task-name { font-size: 13px; font-weight: 500; color: #111827; }
  .task-when { font-size: 11px; color: #9ca3af; margin-top: 1px; }

  .tag {
    font-size: 11px; font-weight: 600;
    padding: 3px 9px; border-radius: 20px;
    white-space: nowrap;
  }
`;

const ChampRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child { border-bottom: none; }

  .rank {
    width: 22px; height: 22px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800; color: white;
    flex-shrink: 0;
  }

  .cow-name { flex: 1; font-size: 13px; font-weight: 500; color: #111827; }
  .cow-val { font-size: 13px; font-weight: 700; color: #16a34a; }
`;

const ActivityRow = styled.div`
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child { border-bottom: none; }

  .dot-col {
    display: flex; flex-direction: column; align-items: center;
    gap: 0;
  }

  .dot {
    width: 8px; height: 8px; border-radius: 50%;
    flex-shrink: 0; margin-top: 3px;
  }

  .line {
    width: 1px; flex: 1;
    background: #f3f4f6; margin-top: 3px;
  }

  .act-text { font-size: 12px; color: #374151; }
  .act-time { font-size: 11px; color: #9ca3af; margin-top: 1px; }
`;

// --- Helpers ---

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return 'İyi geceler';
  if (hour < 12) return 'Günaydın';
  if (hour < 18) return 'İyi günler';
  return 'İyi akşamlar';
};

const formatTarih = (tarih) => {
  if (!tarih) return '';
  const d = new Date(tarih);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

// --- Component ---

const Dashboard = ({ kullanici }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: null,
    performans: [],
    yapilacaklar: [],
    aktiviteler: [],
    topCows: [],
    sutYasaklar: [],
    saglikSkoru: null,
    saglikSkoruDetay: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const results = await Promise.allSettled([
        api.getDashboardStats(),
        api.getDashboardPerformans(30),
        api.getYapilacaklar(),
        api.getDashboardAktiviteler(10),
        api.getDashboardTopPerformers(),
        api.getSaglikSkoru(),
        api.getSutYasak()
      ]);

      const yapilacaklarRaw = results[2].status === 'fulfilled' && results[2].value?.data
        ? [...(results[2].value.data.geciken || []), ...(results[2].value.data.bugun || [])]
        : [];

      setData({
        stats: results[0].status === 'fulfilled' ? results[0].value?.data : null,
        performans: results[1].status === 'fulfilled' && Array.isArray(results[1].value?.data) ? results[1].value.data : [],
        yapilacaklar: yapilacaklarRaw,
        aktiviteler: results[3].status === 'fulfilled' && Array.isArray(results[3].value?.data) ? results[3].value.data : [],
        topCows: results[4].status === 'fulfilled' && Array.isArray(results[4].value?.data) ? results[4].value.data : [],
        saglikSkoru: results[5].status === 'fulfilled' && results[5].value?.data ? results[5].value.data.skor : null,
        saglikSkoruDetay: results[5].status === 'fulfilled' && results[5].value?.data ? results[5].value.data.detay : null,
        sutYasaklar: results[6].status === 'fulfilled' && results[6].value?.data ? (Array.isArray(results[6].value.data) ? results[6].value.data : []) : []
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalHayvan = () => {
    if (!data.stats?.toplamHayvan) return 0;
    const t = data.stats.toplamHayvan;
    return (t.inek || 0) + (t.duve || 0) + (t.buzagi || 0) + (t.tosun || 0);
  };

  const yaklasanDogum = data.stats?.yaklaşanDogum ?? data.stats?.yaklasanDogum ?? 0;

  if (loading) {
    return (
      <DashboardContainer>
        <Header>
          <TitleSection>
            <Skeleton $height={14} $width={100} style={{ marginBottom: 8 }} />
            <Skeleton $height={24} $width={180} style={{ marginBottom: 4 }} />
            <Skeleton $height={13} $width={220} />
          </TitleSection>
        </Header>
        <KpiGrid style={{ marginBottom: 16 }}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} $height={120} $borderRadius={12} />
          ))}
        </KpiGrid>
        <TwoCol>
          <MainCol>
            <Skeleton $height={200} $borderRadius={12} />
            <Skeleton $height={200} $borderRadius={12} />
          </MainCol>
          <SideCol>
            <Skeleton $height={120} $borderRadius={12} />
            <Skeleton $height={180} $borderRadius={12} />
          </SideCol>
        </TwoCol>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>

      {/* 1. HEADER */}
      <Header>
        <TitleSection>
          <GreetingLine>{getGreeting()}, {kullanici?.ad || 'Kullanıcı'}</GreetingLine>
          <Title>{kullanici?.isletmeAdi || 'Çiftlik'} Paneli</Title>
          <Subtitle>
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}Toplam {getTotalHayvan()} hayvan
          </Subtitle>
        </TitleSection>
        <QuickActions>
          <ActionButton className="accent" onClick={() => navigate('/sut-kaydi')}>
            <FaPlus /> <span>Süt Ekle</span>
          </ActionButton>
          {kullanici?.rol !== 'isci' && (
            <ActionButton onClick={() => navigate('/finansal')}>
              <FaMoneyBillWave /> <span>Gider</span>
            </ActionButton>
          )}
          <ActionButton onClick={() => navigate('/saglik-merkezi')}>
            <FaHeartbeat /> <span>Sağlık</span>
          </ActionButton>
        </QuickActions>
      </Header>

      {/* 2. SÜT YASAK BANNER */}
      {data.sutYasaklar?.length > 0 && (
        <SutYasakBanner>
          <span className="icon">⚠️</span>
          <span className="text">
            {data.sutYasaklar.map(h => h.hayvanIsim || h.hayvanKupeNo).join(', ')}
            {' '}— antibiyotik arınma süresi devam ediyor
          </span>
          <span className="badge">{data.sutYasaklar.length} hayvan</span>
        </SutYasakBanner>
      )}

      {/* 3. KPI KARTLARI */}
      <KpiGrid style={{ marginBottom: 16 }}>
        <KpiCard $clickable onClick={() => navigate('/sut-kaydi')}>
          <div className="kpi-label">Günlük Süt</div>
          <div className="kpi-value">
            {(data.stats?.bugunSut ?? 0).toFixed(0)}
            <span className="kpi-unit">Lt</span>
          </div>
          <div className="kpi-trend" style={{ color: '#16a34a' }}>
            {data.stats?.trendler?.sut > 0 ? `↑ %${data.stats.trendler.sut}` : 'Son 30 gün ortalaması'}
          </div>
          <div className="kpi-bar">
            <div className="kpi-fill" style={{ width: '78%', background: '#16a34a' }} />
          </div>
        </KpiCard>

        <KpiCard $clickable onClick={() => navigate('/inekler')}>
          <div className="kpi-label">Sağmal İnek</div>
          <div className="kpi-value">
            {data.stats?.sagmal ?? 0}
            <span className="kpi-unit">baş</span>
          </div>
          <div className="kpi-trend" style={{ color: '#6b7280' }}>
            {data.stats?.toplamHayvan?.inek ?? 0} toplam inek
          </div>
          <div className="kpi-bar">
            <div className="kpi-fill" style={{
              width: `${data.stats?.toplamHayvan?.inek
                ? (data.stats.sagmal / data.stats.toplamHayvan.inek * 100)
                : 0}%`,
              background: '#2563eb'
            }} />
          </div>
        </KpiCard>

        <KpiCard>
          <div className="kpi-label">Yaklaşan Doğum</div>
          <div className="kpi-value">
            {yaklasanDogum}
            <span className="kpi-unit">adet</span>
          </div>
          <div className="kpi-trend" style={{ color: '#d97706' }}>
            Önümüzdeki 30 gün
          </div>
          <div className="kpi-bar">
            <div className="kpi-fill" style={{
              width: `${Math.min(yaklasanDogum * 20, 100)}%`,
              background: '#d97706'
            }} />
          </div>
        </KpiCard>

        <KpiCard $clickable onClick={() => navigate('/saglik-merkezi')}>
          <div className="kpi-label">Sağlık Skoru</div>
          <div className="kpi-value" style={{
            color: (data.saglikSkoru ?? 100) >= 80 ? '#16a34a'
                 : (data.saglikSkoru ?? 100) >= 60 ? '#d97706' : '#dc2626'
          }}>
            {data.saglikSkoru ?? 100}
            <span className="kpi-unit">/100</span>
          </div>
          <div className="kpi-trend" style={{ color: '#6b7280' }}>
            {data.saglikSkoruDetay?.aktifTedavi > 0
              ? `${data.saglikSkoruDetay.aktifTedavi} aktif tedavi`
              : 'Sürü sağlıklı'}
          </div>
          <div className="kpi-bar">
            <div className="kpi-fill" style={{
              width: `${data.saglikSkoru ?? 100}%`,
              background: (data.saglikSkoru ?? 100) >= 80 ? '#16a34a' : '#d97706'
            }} />
          </div>
        </KpiCard>
      </KpiGrid>

      {/* 4. 2 KOLON */}
      <TwoCol>
        <MainCol>

          {/* BUGÜNÜN GÖREVLERİ */}
          <Widget>
            <h3>
              Bugünün Görevleri
              <Link to="/bildirimler" style={{ fontSize: 12, color: '#16a34a', fontWeight: 500, textDecoration: 'none' }}>
                Tümü →
              </Link>
            </h3>
            {data.yapilacaklar?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>
                ✅ Bugün yapılacak bir şey yok
              </div>
            ) : (
              data.yapilacaklar.slice(0, 5).map((gorev, i) => (
                <TaskItem key={gorev._id || i}>
                  <div className="dot" style={{
                    background: gorev.oncelik === 'acil' ? '#dc2626'
                              : gorev.oncelik === 'yuksek' ? '#d97706'
                              : '#16a34a'
                  }} />
                  <div className="task-body">
                    <div className="task-name">{gorev.baslik}</div>
                    <div className="task-when">{(gorev.mesaj || gorev.aciklama || '').slice(0, 60)}</div>
                  </div>
                  <span className="tag" style={{
                    background: gorev.oncelik === 'acil' ? '#fef2f2'
                              : gorev.oncelik === 'yuksek' ? '#fef3c7'
                              : '#dcfce7',
                    color: gorev.oncelik === 'acil' ? '#991b1b'
                         : gorev.oncelik === 'yuksek' ? '#92400e'
                         : '#166534'
                  }}>
                    {gorev.oncelik === 'acil' ? 'Acil'
                     : gorev.oncelik === 'yuksek' ? 'Bugün'
                     : 'Planla'}
                  </span>
                </TaskItem>
              ))
            )}
          </Widget>

          {/* SÜT GRAFİĞİ */}
          <Widget>
            <h3>
              Son 7 Gün Süt
              <Link to="/sut-kaydi" style={{ fontSize: 12, color: '#16a34a', fontWeight: 500, textDecoration: 'none' }}>
                Detaylı →
              </Link>
            </h3>
            <PerformansChart
              data={data.performans.slice(-7)}
              type="bar"
              color="#16a34a"
              title={null}
            />
          </Widget>

          {/* ALT SATIR: Şampiyonlar + Aktiviteler */}
          <BottomRow>
            <Widget>
              <h3>En Çok Süt Verenler</h3>
              {data.topCows.length === 0
                ? <div style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Henüz süt kaydı yok</div>
                : data.topCows.map((cow, i) => (
                    <ChampRow key={cow._id}>
                      <div className="rank" style={{
                        background: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#d97706' : '#e5e7eb',
                        color: i < 3 ? 'white' : '#6b7280'
                      }}>{i + 1}</div>
                      <span className="cow-name">{cow.isim || 'İsimsiz'}</span>
                      <span className="cow-val">{(cow.ortalama ?? 0).toFixed(1)} Lt</span>
                    </ChampRow>
                  ))
              }
            </Widget>

            <Widget>
              <h3>Son Aktiviteler</h3>
              {data.aktiviteler.slice(0, 4).length === 0 ? (
                <div style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Henüz aktivite yok</div>
              ) : (
                data.aktiviteler.slice(0, 4).map((akt, i) => (
                  <ActivityRow key={akt._id || i}>
                    <div className="dot-col">
                      <div className="dot" style={{
                        background: akt.tip === 'sut_kaydi' ? '#16a34a'
                                 : akt.tip === 'maliyet' ? '#f59e0b'
                                 : akt.tip === 'hayvan_eklendi' ? '#2563eb'
                                 : '#9ca3af'
                      }} />
                      {i < data.aktiviteler.slice(0, 4).length - 1 && <div className="line" />}
                    </div>
                    <div>
                      <div className="act-text">
                        {akt.tip === 'sut_kaydi' ? `Süt girişi — ${akt.veri?.miktar ?? ''}Lt`
                         : akt.tip === 'hayvan_eklendi' ? `${akt.veri?.isim ?? 'Hayvan'} eklendi`
                         : akt.tip === 'maliyet' ? `${akt.veri?.kategori ?? 'Gider'} — ${akt.veri?.tutar ?? ''}₺`
                         : akt.tip === 'hayvan_satildi' ? `${akt.veri?.hayvanTipi ?? 'Hayvan'} satıldı`
                         : 'Aktivite'}
                      </div>
                      <div className="act-time">{formatTarih(akt.tarih)}</div>
                    </div>
                  </ActivityRow>
                ))
              )}
            </Widget>
          </BottomRow>

        </MainCol>

        {/* SAĞ PANEL */}
        <SideCol>
          <SuruSaglikSkoru />
          <YaklasanDogumlar compact />
        </SideCol>

      </TwoCol>

    </DashboardContainer>
  );
};

export default Dashboard;
