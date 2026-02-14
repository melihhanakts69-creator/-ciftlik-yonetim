import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { colors, spacing, borderRadius, shadows } from '../../styles/colors';
import StatsCard from '../common/StatsCard';
import PerformansChart from './PerformansChart';
import YapilacaklarCard from './YapilacaklarCard';
import AktivitelerCard from './AktivitelerCard';
import HizliYemlemeWidget from './HizliYemlemeWidget';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaPlus, FaMoneyBillWave, FaSyringe, FaTint } from 'react-icons/fa';
import SaglikUyariCard from './SaglikUyariCard';

// --- Styled Components ---

const DashboardContainer = styled.div`
  padding: ${spacing.lg};
  max-width: 1600px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: ${spacing.xl};
`;

const TitleSection = styled.div``;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: ${colors.text.primary};
  margin: 0 0 ${spacing.xs} 0;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: ${colors.text.secondary};
  margin: 0;
  font-weight: 500;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  color: ${colors.text.primary};
  box-shadow: ${shadows.sm};
  font-size: 13px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
    background: #f8f9fa;
  }
  
  &.primary {
    background: ${colors.primary};
    color: white;
    &:hover { background: #1b5e20; }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(6, 1fr);
  }
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
`;

const Widget = styled.div`
  background: white;
  border-radius: ${borderRadius.lg};
  padding: 24px;
  box-shadow: ${shadows.md};
  height: 100%;
  display: flex;
  flex-direction: column;

  h3 {
    margin: 0 0 20px 0;
    font-size: 16px;
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
  gap: 15px;
`;

const TopCowItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child { border-bottom: none; }

  .rank {
    width: 24px; height: 24px;
    background: #FFD700; color: white;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: bold; font-size: 12px;
    margin-right: 12px;
  }
  
  .info {
    flex: 1;
    strong { display: block; font-size: 14px; color: #333; }
    span { font-size: 12px; color: #888; }
  }

  .value {
    font-weight: 800;
    color: ${colors.primary};
    font-size: 15px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${colors.text.secondary};
  font-size: 16px;
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

      const [statsRes, perfRes, tasksRes, actsRes, topRes] = await Promise.all([
        fetch(`${API_URL}/dashboard/stats`, { headers }),
        fetch(`${API_URL}/dashboard/performans/sut?gun=30`, { headers }),
        fetch(`${API_URL}/dashboard/yapilacaklar`, { headers }),
        fetch(`${API_URL}/dashboard/aktiviteler?limit=10`, { headers }),
        fetch(`${API_URL}/dashboard/top-performers`, { headers })
      ]);

      const stats = await statsRes.json();
      const performans = await perfRes.json();
      const tasks = await tasksRes.json();
      const aktiviteler = await actsRes.json();
      const topCows = await topRes.json();

      setData({
        stats,
        performans,
        yapilacaklar: [...(tasks.geciken || []), ...(tasks.bugun || [])],
        aktiviteler,
        topCows
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

  if (loading) return <DashboardContainer><LoadingContainer>Veriler yükleniyor...</LoadingContainer></DashboardContainer>;

  return (
    <DashboardContainer>
      <Header>
        <TitleSection>
          <Title>🌿 Agrolina Paneli</Title>
          <Subtitle>{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Subtitle>
        </TitleSection>
        <QuickActions>
          <ActionButton className="primary" onClick={() => navigate('/sut-kaydi')}><FaPlus /> Süt Ekle</ActionButton>
          <ActionButton onClick={() => navigate('/finansal')}><FaMoneyBillWave /> Gider Ekle</ActionButton>
          <ActionButton onClick={() => navigate('/takvim')}><FaSyringe /> Aşı Gir</ActionButton>
        </QuickActions>
      </Header>

      {/* --- KPI CARDS ROW --- */}
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
          description={`${data.stats?.toplamHayvan?.inek} Toplam İnek`}
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
      <Grid>
        {/* Süt Grafiği - Geniş */}
        <div style={{ gridColumn: 'span 8' }}>
          <PerformansChart
            data={data.performans}
            title="Süt Performans Eğrisi (30 Gün)"
            type="area"
            color={colors.primary}
          />
        </div>

        {/* Sürü Dağılımı - Dar */}
        <div style={{ gridColumn: 'span 4' }}>
          <Widget>
            <h3>📊 Sürü Dağılımı</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={getHerdData()}
                  innerRadius={60}
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
          </Widget>
        </div>
      </Grid>

      {/* --- WIDGETS ROW --- */}
      <Grid>
        {/* Top Performers */}
        <div style={{ gridColumn: 'span 4' }}>
          <Widget>
            <h3>🏆 Şampiyonlar (En Çok Süt)</h3>
            <TopCowList>
              {data.topCows.length === 0 && <p style={{ color: '#999' }}>Veri yok</p>}
              {data.topCows.map((cow, index) => (
                <TopCowItem key={cow._id}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="rank" style={{ background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#eee' }}>{index + 1}</div>
                    <div className="info">
                      <strong>{cow.isim || 'İsimsiz'}</strong>
                      <span>Küpe: {cow.kupeNo}</span>
                    </div>
                  </div>
                  <div className="value">{cow.ortalama.toFixed(1)} Lt</div>
                </TopCowItem>
              ))}
            </TopCowList>
          </Widget>
        </div>

        {/* Yapılacaklar */}
        <div style={{ gridColumn: 'span 4' }}>
          <YapilacaklarCard
            bildirimler={data.yapilacaklar}
          // onTaskComplete logic placeholder
          />
        </div>

        {/* Hızlı Yemleme (Eski Widget) */}
        <div style={{ gridColumn: 'span 4' }}>
          <HizliYemlemeWidget />
        </div>
      </Grid>

      {/* --- SAĞLIK + AKTİVİTELER ROW --- */}
      <Grid>
        <div style={{ gridColumn: 'span 4' }}>
          <SaglikUyariCard />
        </div>
        <div style={{ gridColumn: 'span 8' }}>
          <AktivitelerCard aktiviteler={data.aktiviteler} />
        </div>
      </Grid>

    </DashboardContainer>
  );
};

export default Dashboard;
