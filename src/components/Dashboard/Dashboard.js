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
import YaklasanDogumlar from '../YaklasanDogumlar';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaPlus, FaMoneyBillWave, FaHeartbeat, FaTint, FaCog, FaBell, FaChartLine, FaSeedling, FaBaby } from 'react-icons/fa';

const DASHBOARD_PANEL_KEY = 'dashboardPanelMetrikleri';
const DEFAULT_PANELS = ['gunlukSut', 'sagmalInek', 'okunmayanBildirim', 'yaklasanDogum'];

const METRIK_OPTIONS = [
  { id: 'gunlukSut', label: 'Günlük Süt', icon: '🥛', unit: 'Lt', color: colors.info, bg: colors.bg.blue, nav: '/sut-kaydi' },
  { id: 'sagmalInek', label: 'Sağmal İnek', icon: '🐄', unit: 'Baş', color: colors.primary, bg: colors.bg.green, nav: '/inekler' },
  { id: 'okunmayanBildirim', label: 'Aktif Bildirimler', icon: '🔔', unit: 'Adet', color: colors.warning, bg: colors.bg.orange, nav: '/bildirimler' },
  { id: 'yaklasanDogum', label: 'Yaklaşan Doğum', icon: '🤰', unit: 'Adet', color: colors.secondary, bg: colors.bg.purple, nav: 'dogum' },
  { id: 'toplamInek', label: 'Toplam İnek', icon: '🐄', unit: 'Baş', color: '#1976d2', bg: '#e3f2fd', nav: '/inekler' },
  { id: 'toplamDuve', label: 'Toplam Düve', icon: '🐮', unit: 'Baş', color: '#7b1fa2', bg: '#f3e5f5', nav: '/duveler' },
  { id: 'toplamBuzagi', label: 'Toplam Buzağı', icon: '🐮', unit: 'Baş', color: '#c2185b', bg: '#fce4ec', nav: '/buzagilar' },
  { id: 'toplamTosun', label: 'Toplam Tosun', icon: '🐂', unit: 'Baş', color: '#5d4037', bg: '#efebe9', nav: '/tosunlar' },
  { id: 'toplamHayvan', label: 'Toplam Hayvan', icon: '🐾', unit: 'Baş', color: '#388e3c', bg: '#e8f5e9', nav: '/inekler' },
  { id: 'gebeToplam', label: 'Gebe Hayvan', icon: '🤰', unit: 'Baş', color: '#00838f', bg: '#e0f7fa', nav: '/inekler' },
];

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

  @media (max-width: 768px) {
    padding: 12px;
  }
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

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 18px 20px;
    margin-bottom: 18px;
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

  @media (max-width: 768px) {
    width: 100%;
  }
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
    flex: 1;
    justify-content: center;
    padding: 10px 8px;
    font-size: 12px;
    span { display: none; }
    min-height: 44px;
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

  button:hover {
    opacity: 1;
  }

  @media (max-width: 768px) {
    font-size: 11px;
    margin-bottom: 10px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$cols ? `repeat(${props.$cols}, 1fr)` : 'repeat(12, 1fr)'};
  gap: 20px;
  margin-bottom: 28px;

  @media (max-width: 1200px) {
    grid-template-columns: ${props => props.$cols ? `repeat(${props.$cols}, 1fr)` : 'repeat(6, 1fr)'};
  }
  @media (max-width: 768px) {
    grid-template-columns: ${props => props.$mobileCols ? `repeat(${props.$mobileCols}, 1fr)` : '1fr'};
    gap: 12px;
    margin-bottom: 16px;
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

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 14px;
    h3 { margin-bottom: 12px; font-size: 14px; }
  }
`;

const TopCowList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  
  @media (max-width: 768px) { gap: 6px; }
`;

const TopCowItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
  background: ${props => props.index === 0 ? '#FFFDE7' : props.index === 1 ? '#F5F5F5' : props.index === 2 ? '#FFF3E0' : '#FAFAFA'};

  &:hover { transform: translateX(4px); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

  .rank {
    width: 28px; height: 28px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 12px; margin-right: 12px; color: white;
    
    @media (max-width: 768px) { width: 22px; height: 22px; font-size: 10px; margin-right: 6px; border-radius: 7px; }
  }
  
  .info {
    flex: 1;
    strong { display: block; font-size: 13px; color: #333; font-weight: 700; }
    span { font-size: 11px; color: #999; }
    
    @media (max-width: 768px) {
      strong { font-size: 11px; }
      span { font-size: 10px; }
    }
  }

  .value {
    font-weight: 800; color: ${colors.primary}; font-size: 14px;
    background: ${colors.bg.green}; padding: 4px 10px; border-radius: 8px;
    
    @media (max-width: 768px) { font-size: 11px; padding: 3px 6px; }
  }
  
  @media (max-width: 768px) { padding: 7px 8px; border-radius: 9px; }
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

// --- Mobile Quick Access Bar ---

const MobileQuickBar = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 2px 2px 12px;
    margin-bottom: 4px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }
`;

const QuickNavBtn = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 10px 14px;
  border-radius: 16px;
  border: 2px solid ${props => props.$active ? colors.primary : 'rgba(0,0,0,0.07)'};
  background: ${props => props.$active ? colors.bg.green : 'white'};
  color: ${props => props.$active ? colors.primary : colors.text.secondary};
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s ease;
  position: relative;
  min-width: 74px;
  box-shadow: ${props => props.$active
    ? '0 4px 14px rgba(46,125,50,0.18)'
    : '0 2px 8px rgba(0,0,0,0.06)'};

  .qicon { font-size: 18px; line-height: 1; }

  &:active { transform: scale(0.93); }
`;

const QuickNavBadge = styled.span`
  position: absolute;
  top: 5px;
  right: 5px;
  background: #f44336;
  color: white;
  border-radius: 10px;
  font-size: 9px;
  font-weight: 800;
  padding: 1px 5px;
  min-width: 16px;
  text-align: center;
  line-height: 1.4;
`;

const MobilePanelWrapper = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
    margin-bottom: 16px;
    animation: ${fadeInUp} 0.3s ease;
  }
`;

const MobileHide = styled.div`
  @media (max-width: 768px) {
    display: none !important;
  }
`;

const MobileHideGridItem = styled.div`
  grid-column: ${props => props.span ? `span ${props.span}` : 'span 4'};
  animation: ${fadeInUp} 0.5s ease;
  animation-delay: ${props => props.delay || '0s'};
  animation-fill-mode: both;

  @media (max-width: 1200px) {
    grid-column: ${props => props.spanMd ? `span ${props.spanMd}` : `span ${Math.min(props.span || 4, 6)}`};
  }
  @media (max-width: 768px) {
    display: none !important;
  }
`;

/* Yapılacaklar + Aktiviteler için mobilde yan yana özel grid */
const ChampActivitesRow = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 28px;
  overflow: hidden;

  @media (max-width: 1200px) { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  @media (max-width: 768px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 8px;
    margin-bottom: 14px;
  }
  @media (max-width: 420px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const ChampCol = styled.div`
  grid-column: span 4;
  min-width: 0;
  animation: ${fadeInUp} 0.5s ease 0.1s both;
  @media (max-width: 1200px) { grid-column: span 2; }
  @media (max-width: 768px) { grid-column: span 1; }
  @media (max-width: 420px) { grid-column: span 1; }
`;

const ActCol = styled.div`
  grid-column: span 8;
  min-width: 0;
  animation: ${fadeInUp} 0.5s ease 0.25s both;
  @media (max-width: 1200px) { grid-column: span 4; }
  @media (max-width: 768px) { grid-column: span 1; }
  @media (max-width: 420px) { grid-column: span 1; }
`;



const getMetrikValue = (stats, metrikId) => {
  if (!stats) return '0';
  switch (metrikId) {
    case 'gunlukSut': return (stats.bugunSut ?? 0).toFixed(1);
    case 'sagmalInek': return stats.sagmal ?? 0;
    case 'okunmayanBildirim': return stats.okunmayanBildirim ?? 0;
    case 'yaklasanDogum': return stats.yaklaşanDogum ?? 0;
    case 'toplamInek': return stats.toplamHayvan?.inek ?? 0;
    case 'toplamDuve': return stats.toplamHayvan?.duve ?? 0;
    case 'toplamBuzagi': return stats.toplamHayvan?.buzagi ?? 0;
    case 'toplamTosun': return stats.toplamHayvan?.tosun ?? 0;
    case 'toplamHayvan': return (stats.toplamHayvan?.inek || 0) + (stats.toplamHayvan?.duve || 0) + (stats.toplamHayvan?.buzagi || 0) + (stats.toplamHayvan?.tosun || 0);
    case 'gebeToplam': return stats.gebe?.toplam ?? 0;
    default: return '0';
  }
};

const getMetrikDescription = (stats, metrikId) => {
  if (!stats) return '';
  switch (metrikId) {
    case 'gunlukSut': return 'Son 30 güne göre';
    case 'sagmalInek': return `${stats.toplamHayvan?.inek || 0} Toplam İnek`;
    case 'okunmayanBildirim': return 'Okunmamış';
    case 'yaklasanDogum': return 'Önümüzdeki 30 gün';
    case 'toplamInek': return 'Aktif inekler';
    case 'toplamDuve': return 'Aktif düveler';
    case 'toplamBuzagi': return 'Aktif buzağılar';
    case 'toplamTosun': return 'Aktif tosunlar';
    case 'toplamHayvan': return 'Tüm hayvanlar';
    case 'gebeToplam': return 'Gebe inek + düve';
    default: return '';
  }
};

const Dashboard = ({ kullanici }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobilePaneli, setMobilePaneli] = useState(null);
  const [showPanelAyari, setShowPanelAyari] = useState(false);
  const [panelMetrikleri, setPanelMetrikleri] = useState(() => {
    try {
      const s = localStorage.getItem(DASHBOARD_PANEL_KEY);
      if (s) {
        const arr = JSON.parse(s);
        if (Array.isArray(arr) && arr.length === 4) return arr;
      }
    } catch (_) {}
    return [...DEFAULT_PANELS];
  });
  const [data, setData] = useState({
    stats: null,
    performans: [],
    yapilacaklar: [],
    aktiviteler: [],
    topCows: []
  });

  const toggleMobilePanel = (panel) => setMobilePaneli(prev => prev === panel ? null : panel);

  const panelMetrikKaydet = (yeniMetrikler) => {
    setPanelMetrikleri(yeniMetrikler);
    localStorage.setItem(DASHBOARD_PANEL_KEY, JSON.stringify(yeniMetrikler));
    setShowPanelAyari(false);
  };

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const fetchApi = (url) => fetch(url, { headers }).then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e)));

      const results = await Promise.allSettled([
        fetchApi(`${API_URL}/dashboard/stats`),
        fetchApi(`${API_URL}/dashboard/performans/sut?gun=30`),
        fetchApi(`${API_URL}/dashboard/yapilacaklar`),
        fetchApi(`${API_URL}/dashboard/aktiviteler?limit=10`),
        fetchApi(`${API_URL}/dashboard/top-performers`)
      ]);

      setData({
        stats: results[0].status === 'fulfilled' ? results[0].value : null,
        performans: results[1].status === 'fulfilled' && Array.isArray(results[1].value) ? results[1].value : [],
        yapilacaklar: results[2].status === 'fulfilled' && results[2].value
          ? [...(results[2].value.geciken || []), ...(results[2].value.bugun || [])]
          : [],
        aktiviteler: results[3].status === 'fulfilled' && Array.isArray(results[3].value) ? results[3].value : [],
        topCows: results[4].status === 'fulfilled' && Array.isArray(results[4].value) ? results[4].value : []
      });

      // Hata olanistekcikleri logla
      results.forEach((res, index) => {
        if (res.status === 'rejected') {
          console.error(`Dashboard Fetch Error [Index ${index}]:`, res.reason);
        }
      });

    } catch (err) {
      console.error('Catched Error:', err);
      setError(err.message || err.detail || String(err));
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
          <Title>🌿 {kullanici?.isletmeAdi || 'Çiftlik'} Paneli</Title>
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
            {kullanici?.rol !== 'isci' && (
              <ActionButton onClick={() => navigate('/finansal')}>
                <FaMoneyBillWave /> <span>Gider Ekle</span>
              </ActionButton>
            )}
            <ActionButton onClick={() => navigate('/saglik-merkezi')}>
              <FaHeartbeat /> <span>Sağlık</span>
            </ActionButton>
          </QuickActions>
        </HeaderRight>
      </Header>

      {/* --- KPI CARDS (Özelleştirilebilir) --- */}
      <SectionTitle>
        📊 Günlük Özet
        <button
          onClick={() => setShowPanelAyari(true)}
          style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.7 }}
          title="Panelleri özelleştir"
        >
          <FaCog size={14} />
        </button>
      </SectionTitle>
      <Grid $cols={4} $mobileCols={2}>
        {panelMetrikleri.map((metrikId, idx) => {
          const opt = METRIK_OPTIONS.find(m => m.id === metrikId) || METRIK_OPTIONS[0];
          const onClick = opt.nav === 'dogum' ? () => toggleMobilePanel('dogum') : opt.nav ? () => navigate(opt.nav) : undefined;
          return (
            <StatsCard
              key={idx}
              title={opt.label}
              value={getMetrikValue(data.stats, metrikId)}
              unit={opt.unit}
              icon={opt.icon}
              color={opt.color}
              bgColor={opt.bg}
              trend={metrikId === 'gunlukSut' ? (data.stats?.trendler?.sut || 0) : undefined}
              description={getMetrikDescription(data.stats, metrikId)}
              clickable={!!onClick}
              onClick={onClick}
            />
          );
        })}
      </Grid>

      {/* Panel Özelleştirme Modal */}
      {showPanelAyari && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setShowPanelAyari(false)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, maxWidth: 400, width: '90%', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaCog /> Özet Panellerini Özelleştir
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Her panel için gösterilecek veriyi seçin.</p>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Panel {i + 1}</label>
                <select
                  value={panelMetrikleri[i] || DEFAULT_PANELS[i]}
                  onChange={e => {
                    const yeni = [...panelMetrikleri];
                    yeni[i] = e.target.value;
                    setPanelMetrikleri(yeni);
                  }}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14 }}
                >
                  {METRIK_OPTIONS.map(m => (
                    <option key={m.id} value={m.id}>{m.icon} {m.label}</option>
                  ))}
                </select>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => { setPanelMetrikleri([...DEFAULT_PANELS]); setShowPanelAyari(false); localStorage.setItem(DASHBOARD_PANEL_KEY, JSON.stringify(DEFAULT_PANELS)); }} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Varsayılana Dön</button>
              <button onClick={() => panelMetrikKaydet(panelMetrikleri)} style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: colors.primary, color: 'white', cursor: 'pointer', fontWeight: 600 }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MOBİL HIZLI ERİŞİM ÇUBUĞU --- */}
      <MobileQuickBar>
        <QuickNavBtn $active={mobilePaneli === 'grafikler'} onClick={() => toggleMobilePanel('grafikler')}>
          <FaChartLine className="qicon" />
          Grafikler
        </QuickNavBtn>
        <QuickNavBtn $active={mobilePaneli === 'sampiyonlar'} onClick={() => toggleMobilePanel('sampiyonlar')}>
          <span className="qicon">🏆</span>
          Şampiyonlar
        </QuickNavBtn>
        <QuickNavBtn $active={mobilePaneli === 'yemleme'} onClick={() => toggleMobilePanel('yemleme')}>
          <FaSeedling className="qicon" />
          Yemleme
        </QuickNavBtn>
        <QuickNavBtn $active={mobilePaneli === 'dogum'} onClick={() => toggleMobilePanel('dogum')}>
          <FaBaby className="qicon" />
          Doğumlar
          {(data.stats?.yaklaşanDogum || 0) > 0 && (
            <QuickNavBadge>{data.stats.yaklaşanDogum > 9 ? '9+' : data.stats.yaklaşanDogum}</QuickNavBadge>
          )}
        </QuickNavBtn>
      </MobileQuickBar>

      {/* --- MOBİL PANEL İÇERİĞİ --- */}
      {mobilePaneli && (
        <MobilePanelWrapper>
          {mobilePaneli === 'grafikler' && (
            <>
              <div style={{ marginBottom: 12 }}>
                <PerformansChart
                  data={data.performans}
                  title="Süt Performans Eğrisi (30 Gün)"
                  type="area"
                  color={colors.primary}
                />
              </div>
              <Widget>
                <h3>📊 Sürü Dağılımı</h3>
                {getHerdData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={getHerdData()} innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value">
                        {getHerdData().map((entry, index) => (
                          <Cell key={`cell-m-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '13px', padding: '24px 0' }}>
                    Henüz hayvan verisi yok
                  </div>
                )}
              </Widget>
            </>
          )}
          {mobilePaneli === 'sampiyonlar' && (
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
          )}
          {mobilePaneli === 'yemleme' && (
            <HizliYemlemeWidget />
          )}
          {mobilePaneli === 'dogum' && (
            <YaklasanDogumlar />
          )}
        </MobilePanelWrapper>
      )}

      {/* --- CHARTS ROW (masaüstünde görünür, mobilde gizli) --- */}
      <MobileHide>
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
      </MobileHide>

      {/* --- WIDGETS ROW 1 --- */}
      <SectionTitle>🏆 Operasyon</SectionTitle>
      <Grid>
        {/* Şampiyonlar - mobilde gizli (butonla açılır), masaüstünde görünür */}
        <MobileHideGridItem span={4} delay="0.15s">
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
        </MobileHideGridItem>

        {/* Hızlı Yemleme - mobilde gizli, masaüstünde görünür */}
        <MobileHideGridItem span={4} delay="0.2s">
          <HizliYemlemeWidget />
        </MobileHideGridItem>
      </Grid>

      {/* Yapılacaklar + Aktiviteler - mobilde yan yana */}
      <SectionTitle>📋 Yapılacaklar & Aktiviteler</SectionTitle>
      <ChampActivitesRow>
        <ChampCol>
          <YapilacaklarCard bildirimler={data.yapilacaklar} />
        </ChampCol>
        <ActCol>
          <AktivitelerCard aktiviteler={data.aktiviteler} />
        </ActCol>
      </ChampActivitesRow>

      {/* --- SAĞLIK UYARI --- */}
      <SectionTitle>🏥 Sağlık</SectionTitle>
      <Grid>
        <AnimatedGridItem span={12} delay="0.1s">
          <SaglikUyariCard />
        </AnimatedGridItem>
      </Grid>

      {/* --- YAKLAŞAN DOĞUMLAR (masaüstünde görünür, mobilde gizli — butonla açılır) --- */}
      <MobileHide>
        <SectionTitle id="dogum-takvimi">🤰 Doğum Takvimi</SectionTitle>
        <Grid>
          <AnimatedGridItem span={12} delay="0.1s">
            <YaklasanDogumlar />
          </AnimatedGridItem>
        </Grid>
      </MobileHide>

    </DashboardContainer>
  );
};

export default Dashboard;
