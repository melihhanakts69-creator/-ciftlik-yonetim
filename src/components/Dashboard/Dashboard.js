import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import * as api from '../../services/api';
import PerformansChart from './PerformansChart';
import SuruSaglikSkoru from './SuruSaglikSkoru';
import YaklasanDogumlar from '../YaklasanDogumlar';
import BugunYemlemeCard from './BugunYemlemeCard';
import GorevListesi from './GorevListesi';
import { Skeleton } from '../common/Skeleton';
import { FaPlus, FaMoneyBillWave, FaHeartbeat } from 'react-icons/fa';

const DASHBOARD_PANEL_KEY = 'dashboardPanelMetrikleri';
const DEFAULT_PANELS = ['gunlukSut', 'sagmalInek', 'yaklasanDogum', 'saglikSkoru'];

const METRIK_OPTIONS = [
  { id: 'gunlukSut', label: 'Günlük Süt', icon: '🥛', unit: 'Lt', color: '#16a34a', bg: '#dcfce7', nav: '/sut-kaydi' },
  { id: 'sagmalInek', label: 'Sağmal İnek', icon: '🐄', unit: 'baş', color: '#2563eb', bg: '#dbeafe', nav: '/inekler' },
  { id: 'yaklasanDogum', label: 'Yaklaşan Doğum', icon: '🤰', unit: 'adet', color: '#d97706', bg: '#fef3c7', nav: '/saglik-merkezi', navState: { openTab: 'tohumlar' } },
  { id: 'saglikSkoru', label: 'Sağlık Skoru', icon: '❤️', unit: '/100', color: '#16a34a', bg: '#dcfce7', nav: '/saglik-merkezi' },
  { id: 'yemStok', label: 'Yem Stok', icon: '🌿', unit: '%', color: '#d97706', bg: '#fef3c7', nav: '/yem-merkezi' },
  { id: 'fcr', label: 'Yem Çevirme', icon: '📊', unit: 'kg/Lt', color: '#2563eb', bg: '#dbeafe', nav: '/yem-merkezi' },
  { id: 'aylikGelir', label: 'Aylık Gelir', icon: '💰', unit: '₺', color: '#16a34a', bg: '#dcfce7', nav: '/finansal' },
  { id: 'litreBasinaMaliyet', label: 'Lt Başına Maliyet', icon: '💰', unit: '₺/Lt', color: '#d97706', bg: '#fef3c7', nav: '/karlilik' },
];

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
    display: none;
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

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
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

const getMetrikValue = (stats, metrikId, saglikSkoru) => {
  if (!stats && metrikId !== 'saglikSkoru') return '0';
  switch (metrikId) {
    case 'gunlukSut': return (stats?.bugunSut ?? 0).toFixed(0);
    case 'sagmalInek': return stats?.sagmal ?? 0;
    case 'yaklasanDogum': return stats?.yaklaşanDogum ?? stats?.yaklasanDogum ?? 0;
    case 'saglikSkoru': return saglikSkoru ?? 100;
    case 'yemStok': return stats?.yemStok ?? 0;
    case 'fcr': return stats?.fcr ?? '—';
    case 'aylikGelir': return stats?.aylikGelir ?? 0;
    case 'litreBasinaMaliyet': return stats?.litreBasinaMaliyet != null ? Number(stats.litreBasinaMaliyet).toFixed(1) : '—';
    default: return '0';
  }
};

const getMetrikTrend = (stats, metrikId, saglikSkoruDetay) => {
  if (!stats && metrikId !== 'saglikSkoru') return '';
  switch (metrikId) {
    case 'gunlukSut': return stats?.trendler?.sut > 0 ? `↑ %${stats.trendler.sut}` : 'Son 30 gün ortalaması';
    case 'sagmalInek': return `${stats?.toplamHayvan?.inek ?? 0} toplam inek`;
    case 'yaklasanDogum': return 'Önümüzdeki 30 gün';
    case 'saglikSkoru': return saglikSkoruDetay?.aktifTedavi > 0 ? `${saglikSkoruDetay.aktifTedavi} aktif tedavi` : 'Sürü sağlıklı';
    case 'yemStok': return 'Stok doluluk';
    case 'fcr': return 'Son 7 gün';
    case 'aylikGelir': return 'Bu ay';
    case 'litreBasinaMaliyet': return 'Ortalama';
    default: return '';
  }
};

// --- YemlemeCollapsible ---
const YemlemeCollapsible = () => {
  const [acik, setAcik] = useState(false);
  const [mod, setMod] = useState(() =>
    localStorage.getItem('yemleme_mod') || 'grup'
  );

  const handleMod = (yeniMod) => {
    setMod(yeniMod);
    localStorage.setItem('yemleme_mod', yeniMod);
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
      <div
        onClick={() => setAcik(p => !p)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', transition: 'background .15s' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>🌿</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Günlük Yemleme</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {[
            { label: 'Grup bazlı', value: 'grup' },
            { label: 'Tür bazlı', value: 'tur' },
          ].map(m => (
            <button
              key={m.value}
              onClick={e => { e.stopPropagation(); handleMod(m.value); setAcik(true); }}
              style={{
                padding: '3px 9px', borderRadius: 20, border: '1px solid',
                fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                background: mod === m.value ? '#fef3c7' : '#fff',
                color: mod === m.value ? '#92400e' : '#6b7280',
                borderColor: mod === m.value ? '#f59e0b' : '#e5e7eb',
              }}
            >
              {m.label}
            </button>
          ))}
          <span style={{ fontSize: 12, color: '#9ca3af', transform: acik ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</span>
        </div>
      </div>

      {acik && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: 16 }}>
          <BugunYemlemeCard mod={mod} compact />
        </div>
      )}
    </div>
  );
};

// --- Component ---

const Dashboard = ({ kullanici }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showPanelAyari, setShowPanelAyari] = useState(false);
  const [dogumAcik, setDogumAcik] = useState(false);
  const [grafikAcik, setGrafikAcik] = useState(false);
  const [grafikSure, setGrafikSure] = useState(7);
  const [panelMetrikleri, setPanelMetrikleri] = useState(() => {
    try {
      const s = localStorage.getItem(DASHBOARD_PANEL_KEY);
      if (s) {
        const arr = JSON.parse(s);
        if (Array.isArray(arr) && arr.length >= 1 && arr.length <= 4) return arr;
      }
    } catch (_) {}
    return [...DEFAULT_PANELS];
  });
  const [data, setData] = useState({
    stats: null,
    performans: [],
    yapilacaklar: [],
    geciken: [],
    bugunGorev: [],
    yaklaşanGorev: [],
    devamEdenTedaviler: [],
    aktiviteler: [],
    topCows: [],
    sutYasaklar: [],
    saglikSkoru: null,
    saglikSkoruDetay: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    api.getDashboardPerformans(grafikSure)
      .then(r => {
        if (Array.isArray(r?.data)) {
          setData(prev => ({ ...prev, performans: r.data }));
        }
      })
      .catch(() => {});
  }, [grafikSure]);

  const refreshYapilacaklar = useCallback(async () => {
    try {
      const r = await api.getYapilacaklar();
      const d = r?.data ?? {};
      setData(prev => ({
        ...prev,
        geciken: d.geciken ?? [],
        bugunGorev: d.bugun ?? [],
        yaklaşanGorev: d.yaklaşan ?? [],
        devamEdenTedaviler: d.devamEdenTedaviler ?? []
      }));
    } catch (e) {
      console.error('Yapilacaklar refresh error:', e);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const results = await Promise.allSettled([
        api.getDashboardStats(),
        api.getDashboardPerformans(grafikSure),
        api.getYapilacaklar(),
        api.getDashboardAktiviteler(10),
        api.getDashboardTopPerformers(),
        api.getSaglikSkoru(),
        api.getSutYasak(),
        api.getFCR(7)
      ]);

      const yapilacaklarData = results[2].status === 'fulfilled' && results[2].value?.data
        ? results[2].value.data
        : { geciken: [], bugun: [], yaklaşan: [], devamEdenTedaviler: [] };

      let stats = results[0].status === 'fulfilled' ? results[0].value?.data : null;
      if (stats && results[7].status === 'fulfilled' && results[7].value?.data) {
        const fcrData = results[7].value.data;
        stats = { ...stats, fcr: fcrData.fcr, litreBasinaMaliyet: fcrData.litreBasinaMaliyet };
      }

      setData({
        stats,
        performans: results[1].status === 'fulfilled' && Array.isArray(results[1].value?.data) ? results[1].value.data : [],
        yapilacaklar: [
          ...(yapilacaklarData.geciken || []),
          ...(yapilacaklarData.bugun || []),
          ...(yapilacaklarData.yaklaşan || [])
        ],
        geciken: yapilacaklarData.geciken || [],
        bugunGorev: yapilacaklarData.bugun || [],
        yaklaşanGorev: yapilacaklarData.yaklaşan || [],
        devamEdenTedaviler: yapilacaklarData.devamEdenTedaviler || [],
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
      <SectionTitle>
        📊 Özet Kartlar
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{panelMetrikleri.length} kart seçili</span>
          <button
            onClick={() => setShowPanelAyari(p => !p)}
            style={{
              background: showPanelAyari ? '#fef2f2' : '#f9fafb',
              border: `1px solid ${showPanelAyari ? '#fecaca' : '#e5e7eb'}`,
              color: showPanelAyari ? '#dc2626' : '#6b7280',
              borderRadius: 20, padding: '4px 12px',
              fontSize: 11, fontWeight: 600, cursor: 'pointer'
            }}
          >
            {showPanelAyari ? 'Kapat' : 'Düzenle ✎'}
          </button>
        </div>
      </SectionTitle>
      <KpiGrid style={{ marginBottom: showPanelAyari ? 0 : 16 }}>
        {panelMetrikleri.map((metrikId, idx) => {
          const opt = METRIK_OPTIONS.find(m => m.id === metrikId) || METRIK_OPTIONS[0];
          const val = getMetrikValue(data.stats, metrikId, data.saglikSkoru);
          const trend = getMetrikTrend(data.stats, metrikId, data.saglikSkoruDetay);
          const pct = metrikId === 'saglikSkoru' ? (data.saglikSkoru ?? 100) :
            metrikId === 'sagmalInek' && data.stats?.toplamHayvan?.inek
              ? (data.stats.sagmal / data.stats.toplamHayvan.inek * 100) : 78;
          const barColor = metrikId === 'saglikSkoru'
            ? ((data.saglikSkoru ?? 100) >= 80 ? '#16a34a' : '#d97706')
            : opt.color;
          return (
            <KpiCard
              key={metrikId}
              $clickable={!!opt.nav}
              onClick={opt.nav ? () => (opt.navState ? navigate(opt.nav, { state: opt.navState }) : navigate(opt.nav)) : undefined}
            >
              <div className="kpi-label">{opt.label}</div>
              <div className="kpi-value" style={metrikId === 'saglikSkoru' ? {
                color: (data.saglikSkoru ?? 100) >= 80 ? '#16a34a'
                     : (data.saglikSkoru ?? 100) >= 60 ? '#d97706' : '#dc2626'
              } : {}}>
                {val}
                <span className="kpi-unit">{opt.unit}</span>
              </div>
              <div className="kpi-trend" style={{ color: '#6b7280' }}>{trend}</div>
              <div className="kpi-bar">
                <div className="kpi-fill" style={{
                  width: `${Math.min(pct, 100)}%`,
                  background: barColor
                }} />
              </div>
            </KpiCard>
          );
        })}
      </KpiGrid>
      {showPanelAyari && (
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 16,
          marginTop: -12,
          marginBottom: 16
        }}>
          <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>
            Görmek istediğin kartları seç — max 4
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
            {METRIK_OPTIONS.map(m => {
              const secili = panelMetrikleri.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    if (secili) {
                      if (panelMetrikleri.length > 1) setPanelMetrikleri(p => p.filter(x => x !== m.id));
                    } else {
                      if (panelMetrikleri.length < 4) setPanelMetrikleri(p => [...p, m.id]);
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                    background: secili ? '#f0fdf4' : '#fff',
                    border: `1px solid ${secili ? '#16a34a' : '#e5e7eb'}`,
                    transition: 'all .15s'
                  }}
                >
                  <span style={{ fontSize: 16 }}>{m.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, flex: 1, color: '#374151' }}>{m.label}</span>
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    background: secili ? '#16a34a' : 'transparent',
                    border: `1.5px solid ${secili ? '#16a34a' : '#d1d5db'}`,
                    flexShrink: 0
                  }} />
                </div>
              );
            })}
          </div>
          <button
            onClick={() => {
              localStorage.setItem(DASHBOARD_PANEL_KEY, JSON.stringify(panelMetrikleri));
              setShowPanelAyari(false);
            }}
            style={{ width: '100%', padding: '9px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Kaydet
          </button>
        </div>
      )}

      {/* 4. 2 KOLON */}
      <TwoCol>
        <MainCol>

          {/* GÖREVLER — 3 grup: gecikmiş / bugün / bu hafta */}
          <Widget>
            <h3>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Görevler
                {data.geciken.length > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 20, background: '#fef2f2', color: '#991b1b' }}>
                    {data.geciken.length} gecikmiş
                  </span>
                )}
                <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 20, background: '#f3f4f6', color: '#6b7280' }}>
                  {(data.geciken?.length || 0) + (data.bugunGorev?.length || 0) + (data.yaklaşanGorev?.length || 0) + (data.devamEdenTedaviler?.length || 0)} toplam
                </span>
              </span>
              <Link to="/bildirimler" style={{ fontSize: 12, color: '#16a34a', fontWeight: 500, textDecoration: 'none' }}>
                Tümü →
              </Link>
            </h3>

            {(!data.geciken?.length && !data.bugunGorev?.length && !data.yaklaşanGorev?.length && !data.devamEdenTedaviler?.length) ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>
                ✅ Bekleyen görev yok
              </div>
            ) : (
              <GorevListesi
                geciken={data.geciken || []}
                bugun={data.bugunGorev || []}
                yaklaşan={data.yaklaşanGorev || []}
                devamEdenTedaviler={data.devamEdenTedaviler || []}
                onRefresh={refreshYapilacaklar}
              />
            )}
          </Widget>

          {/* YEMLEME BÖLÜMÜ */}
          <YemlemeCollapsible />

          {/* SÜT GRAFİĞİ — Collapsible */}
          <div style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: 20
          }}>
            <div
              onClick={() => setGrafikAcik(p => !p)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>📈</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Süt Performans Grafiği</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {[
                  { label: '7G', value: 7 },
                  { label: '30G', value: 30 },
                  { label: '90G', value: 90 },
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={e => { e.stopPropagation(); setGrafikSure(f.value); setGrafikAcik(true); }}
                    style={{
                      padding: '3px 9px', borderRadius: 20, border: '1px solid',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                      background: grafikSure === f.value ? '#dcfce7' : '#fff',
                      color: grafikSure === f.value ? '#166534' : '#6b7280',
                      borderColor: grafikSure === f.value ? '#16a34a' : '#e5e7eb',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
                <span style={{
                  fontSize: 12, color: '#9ca3af',
                  display: 'inline-block',
                  transform: grafikAcik ? 'rotate(180deg)' : 'none',
                  transition: 'transform .2s'
                }}>▾</span>
              </div>
            </div>

            {grafikAcik && (
              <div style={{ borderTop: '1px solid #f3f4f6', padding: 16 }}>
                <PerformansChart
                  data={data.performans}
                  title=""
                  type="area"
                  color="#16a34a"
                />
              </div>
            )}
          </div>

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
          <div style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            overflow: 'hidden'
          }}>
            <div
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px',
                background: '#fff'
              }}
            >
              <div
                onClick={() => setDogumAcik(p => !p)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, cursor: 'pointer', minWidth: 0 }}
              >
                <span style={{ fontSize: 14 }}>🤰</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Yaklaşan Doğumlar</span>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>30 gün içinde</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {!dogumAcik && (data.stats?.yaklaşanDogum ?? data.stats?.yaklasanDogum ?? 0) > 0 && (
                  <span style={{
                    background: '#fef3c7', color: '#92400e',
                    fontSize: 11, fontWeight: 600,
                    padding: '3px 9px', borderRadius: 20
                  }}>
                    {data.stats?.yaklaşanDogum ?? data.stats?.yaklasanDogum ?? 0} hayvan
                  </span>
                )}
                <Link
                  to="/saglik-merkezi"
                  state={{ openTab: 'tohumlar' }}
                  onClick={e => e.stopPropagation()}
                  style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  Gebeler →
                </Link>
                <span
                  onClick={() => setDogumAcik(p => !p)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setDogumAcik(p => !p); }}
                  style={{
                    fontSize: 12, color: '#9ca3af',
                    display: 'inline-block',
                    cursor: 'pointer',
                    transform: dogumAcik ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform .2s'
                  }}
                >▾</span>
              </div>
            </div>

            {dogumAcik && (
              <div style={{ borderTop: '1px solid #f3f4f6', padding: '0 16px 12px' }}>
                <YaklasanDogumlar compact />
              </div>
            )}
          </div>
        </SideCol>

      </TwoCol>

    </DashboardContainer>
  );
};

export default Dashboard;
