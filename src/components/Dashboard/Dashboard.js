import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { colors, spacing, borderRadius, shadows } from '../../styles/colors';
import StatsCard from '../common/StatsCard';
import PerformansChart from './PerformansChart';
import YapilacaklarCard from './YapilacaklarCard';
import AktivitelerCard from './AktivitelerCard';
import HizliYemlemeWidget from './HizliYemlemeWidget';
import SaglikUyariCard from './SaglikUyariCard';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaPlus, FaMoneyBillWave, FaHeartbeat, FaTint, FaCog, FaBell } from 'react-icons/fa';

// --- Animations ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// --- Styled Components ---

const DashboardContainer = styled.div`
  padding: ${spacing.lg};
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #1a5e1f 0%, #2e7d32 40%, #43a047 100%);
  border-radius: 20px;
  color: white;
  position: relative;
  overflow: hidden;
  animation: ${fadeInUp} 0.6s ease;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -60%;
    left: 20%;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
    border-radius: 50%;
  }
`;

const TitleSection = styled.div`
  position: relative;
  z-index: 1;
`;

const GreetingLine = styled.div`
  font-size: 14px;
  opacity: 0.85;
  margin-bottom: 4px;
  font-weight: 500;
  letter-spacing: 0.3px;
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 800;
  color: white;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: rgba(255,255,255,0.75);
  margin: 0;
  font-weight: 400;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.25);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  background: rgba(255,255,255,0.12);
  color: white;
  font-size: 12px;
  backdrop-filter: blur(4px);

  &:hover {
    transform: translateY(-2px);
    background: rgba(255,255,255,0.22);
    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  }

  &.accent {
    background: rgba(255,255,255,0.95);
    color: #2e7d32;
    border-color: transparent;
    font-weight: 700;
    &:hover { 
      background: white;
      box-shadow: 0 4px 20px rgba(255,255,255,0.3); 
    }
  }

  svg { font-size: 13px; }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 11px;
    span { display: none; }
  }
`;

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 14px;
  padding-left: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: ${slideIn} 0.5s ease;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, ${colors.border.light}, transparent);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
  margin-bottom: 28px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(6, 1fr);
  }
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
`;

const AnimatedGridItem = styled.div`
  grid-column: ${props => props.span ? `span ${props.span}` : 'span 4'};
  animation: ${fadeInUp} 0.5s ease;
  animation-delay: ${props => props.delay || '0s'};
  animation-fill-mode: both;

  @media (max-width: 1200px) {
    grid-column: ${props => props.spanMd ? `span ${props.spanMd}` : `span ${Math.min(props.span || 4, 6)}`};
  }
  @media (max-width: 768px) {
    grid-column: span 1 !important;
  }
`;

const Widget = styled.div`
  background: white;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border: 1px solid rgba(0,0,0,0.04);

  &:hover {
    box-shadow: 0 8px 25px rgba(0,0,0,0.08);
    transform: translateY(-2px);
  }

  h3 {
    margin: 0 0 18px 0;
    font-size: 15px;
    font-weight: 700;
    color: ${colors.text.primary};
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const TopCowList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`;

const TopCowItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
  background: ${props => props.index === 0 ? '#FFFDE7' : props.index === 1 ? '#F5F5F5' : props.index === 2 ? '#FFF3E0' : '#FAFAFA'};

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  .rank {
    width: 28px; height: 28px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 12px;
    margin-right: 12px;
    color: white;
  }
  
  .info {
    flex: 1;
    strong { display: block; font-size: 13px; color: #333; font-weight: 700; }
    span { font-size: 11px; color: #999; }
  }

  .value {
    font-weight: 800;
    color: ${colors.primary};
    font-size: 14px;
    background: ${colors.bg.green};
    padding: 4px 10px;
    border-radius: 8px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${colors.text.secondary};
  font-size: 16px;
  gap: 12px;

  .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid #e0e0e0;
    border-top-color: ${colors.primary};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LiveDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #66BB6A;
  border-radius: 50%;
  margin-right: 6px;
  animation: ${pulse} 2s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(102, 187, 106, 0.5);
`;



const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    stats: null,
    performans: [],
    yapilacaklar: [],
    aktiviteler: [],
    topCows: []
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const results = await Promise.allSettled([
        fetch(`${API_URL}/dashboard/stats`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/dashboard/performans/sut?gun=30`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/dashboard/yapilacaklar`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/dashboard/aktiviteler?limit=10`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/dashboard/top-performers`, { headers }).then(r => r.json())
      ]);

      setData({
        stats: results[0].status === 'fulfilled' ? results[0].value : null,
        performans: results[1].status === 'fulfilled' ? results[1].value : [],
        yapilacaklar: results[2].status === 'fulfilled'
          ? [...(results[2].value.geciken || []), ...(results[2].value.bugun || [])]
          : [],
        aktiviteler: results[3].status === 'fulfilled' ? results[3].value : [],
        topCows: results[4].status === 'fulfilled' ? results[4].value : []
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getHerdData = () => {
    if (!data.stats) return [];
    return [
      { name: 'Sağmal', value: data.stats.sagmal || 0, color: '#4CAF50' },
      { name: 'Kuru/Diğer', value: (data.stats.toplamHayvan?.inek - data.stats.sagmal) || 0, color: '#FF9800' },
      { name: 'Düve', value: data.stats.toplamHayvan?.duve || 0, color: '#2196F3' },
      { name: 'Buzağı', value: data.stats.toplamHayvan?.buzagi || 0, color: '#9C27B0' },
    ].filter(d => d.value > 0);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '🌙 İyi geceler';
    if (hour < 12) return '☀️ Günaydın';
    if (hour < 18) return '🌤️ İyi günler';
    return '🌅 İyi akşamlar';
  };

  const getTotalHayvan = () => {
    if (!data.stats?.toplamHayvan) return 0;
    const t = data.stats.toplamHayvan;
    return (t.inek || 0) + (t.duve || 0) + (t.buzagi || 0) + (t.tosun || 0);
  };

  if (loading) return (
    <DashboardContainer>
      <LoadingContainer>
        <div className="spinner" />
        Veriler yükleniyor...
      </LoadingContainer>
    </DashboardContainer>
  );

  const rankColors = ['#FFD700', '#A0A0A0', '#CD7F32', '#e0e0e0', '#e0e0e0'];

  return (
    <DashboardContainer>
      {/* --- HEADER --- */}
      <Header>
        <TitleSection>
          <GreetingLine>{getGreeting()}</GreetingLine>
          <Title>🌿 Agrolina Paneli</Title>
          <Subtitle>
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}
            <LiveDot />Toplam {getTotalHayvan()} hayvan
          </Subtitle>
        </TitleSection>
        <HeaderRight>
          <QuickActions>
            <ActionButton className="accent" onClick={() => navigate('/sut-kaydi')}>
              <FaPlus /> <span>Süt Ekle</span>
            </ActionButton>
            <ActionButton onClick={() => navigate('/finansal')}>
              <FaMoneyBillWave /> <span>Gider Ekle</span>
            </ActionButton>
            <ActionButton onClick={() => navigate('/saglik-merkezi')}>
              <FaHeartbeat /> <span>Sağlık</span>
            </ActionButton>
          </QuickActions>
        </HeaderRight>
      </Header>

      {/* --- KPI CARDS --- */}
      <SectionTitle>📊 Günlük Özet</SectionTitle>
      <Grid style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <StatsCard
          title="Günlük Süt"
          value={data.stats?.bugunSut?.toFixed(1) || '0.0'}
          unit="Lt"
          icon="🥛"
          color={colors.info}
          bg={colors.bg.blue}
          trend={data.stats?.trendler?.sut || 0}
          description="Son 30 güne göre"
          clickable
          onClick={() => navigate('/sut-kaydi')}
        />
        <StatsCard
          title="Sağmal İnek"
          value={data.stats?.sagmal || 0}
          unit="Baş"
          icon="🐄"
          color={colors.primary}
          bg={colors.bg.green}
          description={`${data.stats?.toplamHayvan?.inek || 0} Toplam İnek`}
          clickable
          onClick={() => navigate('/inekler')}
        />
        <StatsCard
          title="Aktif Bildirimler"
          value={data.stats?.okunmayanBildirim || 0}
          unit="Adet"
          icon="🔔"
          color={colors.warning}
          bg={colors.bg.orange}
          description="Okunmamış"
          clickable
          onClick={() => navigate('/bildirimler')}
        />
        <StatsCard
          title="Yaklaşan Doğum"
          value={data.stats?.yaklaşanDogum || 0}
          unit="Adet"
          icon="🤰"
          color={colors.secondary}
          bg={colors.bg.purple}
          description="Önümüzdeki 30 gün"
          clickable
          onClick={() => navigate('/duveler')}
        />
      </Grid>

      {/* --- CHARTS ROW --- */}
      <SectionTitle>📈 Performans</SectionTitle>
      <Grid>
        <AnimatedGridItem span={8} delay="0.1s">
          <PerformansChart
            data={data.performans}
            title="Süt Performans Eğrisi (30 Gün)"
            type="area"
            color={colors.primary}
          />
        </AnimatedGridItem>

        <AnimatedGridItem span={4} delay="0.2s">
          <Widget>
            <h3>📊 Sürü Dağılımı</h3>
            {getHerdData().length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={getHerdData()}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getHerdData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '13px' }}>
                Henüz hayvan verisi yok
              </div>
            )}
          </Widget>
        </AnimatedGridItem>
      </Grid>

      {/* --- WIDGETS ROW 1 --- */}
      <SectionTitle>🏆 Operasyon</SectionTitle>
      <Grid>
        {/* Şampiyonlar */}
        <AnimatedGridItem span={4} delay="0.1s">
          <Widget>
            <h3>🏆 Şampiyonlar <span style={{ fontSize: '11px', color: '#999', fontWeight: 500 }}>En Çok Süt</span></h3>
            <TopCowList>
              {data.topCows.length === 0 && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '13px', padding: '20px 0' }}>
                  Henüz süt verisi yok
                </div>
              )}
              {data.topCows.map((cow, index) => (
                <TopCowItem key={cow._id} index={index}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="rank" style={{ background: rankColors[index] || '#eee', color: index < 3 ? 'white' : '#999' }}>
                      {index + 1}
                    </div>
                    <div className="info">
                      <strong>{cow.isim || 'İsimsiz'}</strong>
                      <span>🏷️ {cow.kupeNo}</span>
                    </div>
                  </div>
                  <div className="value">{cow.ortalama.toFixed(1)} Lt</div>
                </TopCowItem>
              ))}
            </TopCowList>
          </Widget>
        </AnimatedGridItem>

        {/* Yapılacaklar */}
        <AnimatedGridItem span={4} delay="0.15s">
          <YapilacaklarCard bildirimler={data.yapilacaklar} />
        </AnimatedGridItem>

        {/* Hızlı Yemleme */}
        <AnimatedGridItem span={4} delay="0.2s">
          <HizliYemlemeWidget />
        </AnimatedGridItem>
      </Grid>

      {/* --- WIDGETS ROW 2 --- */}
      <SectionTitle>🏥 Sağlık & Aktivite</SectionTitle>
      <Grid>
        <AnimatedGridItem span={4} delay="0.1s">
          <SaglikUyariCard />
        </AnimatedGridItem>
        <AnimatedGridItem span={8} delay="0.15s">
          <AktivitelerCard aktiviteler={data.aktiviteler} />
        </AnimatedGridItem>
      </Grid>

    </DashboardContainer>
  );
};

export default Dashboard;
