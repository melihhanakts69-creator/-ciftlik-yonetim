import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp, FiCalendar, FiActivity,
  FiDroplet, FiHeart, FiBell, FiAlertCircle, FiClipboard, FiTruck, FiList, FiGrid
} from 'react-icons/fi';
import * as api from '../services/api';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;

const PageContainer = styled.div`
  padding: 32px 40px;
  min-height: calc(100vh - 80px);
  background: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  animation: ${fadeIn} 0.4s ease-out;
  
  @media (max-width: 768px) {
    padding: 14px 12px 80px;
  }
`;

const HeaderPanel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`;

const TitleContent = styled.div`
  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 2px 0;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  p {
    font-size: 13px;
    color: #64748b;
    margin: 0;
    
    @media (max-width: 640px) { display: none; }
  }
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  
  @media (max-width: 640px) {
    justify-content: space-between;
  }
`;

const CalendarNav = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);

  .month-label {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    min-width: 130px;
    text-align: center;
    
    @media (max-width: 640px) { min-width: 110px; font-size: 13px; }
  }
`;

const NavBtn = styled.button`
  background: white;
  border: 1px solid transparent;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #475569;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
    border-color: #cbd5e1;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
`;

const ViewBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
  background: ${p => p.$active ? '#0f172a' : 'white'};
  color: ${p => p.$active ? 'white' : '#64748b'};
  
  &:hover { background: ${p => p.$active ? '#0f172a' : '#f1f5f9'}; }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 0 0 4px;
  margin-bottom: 14px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const FilterBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 20px;
  border: 1.5px solid ${p => p.$active ? p.$color || '#3b82f6' : '#e2e8f0'};
  background: ${p => p.$active ? (p.$bg || '#eff6ff') : 'white'};
  color: ${p => p.$active ? (p.$color || '#3b82f6') : '#64748b'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s;
  
  &:hover { border-color: ${p => p.$color || '#3b82f6'}; }
`;

const MetricsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
`;

const MetricBadge = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  
  .m-icon {
    width: 30px; height: 30px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    background: ${p => p.$bg}; color: ${p => p.$color}; font-size: 15px;
  }
  
  .m-info {
    .m-val { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.2; }
    .m-lbl { font-size: 11px; font-weight: 500; color: #64748b; }
  }
`;

/* ── CALENDAR VIEW ─────────────────────────────────────── */

const CalendarContainer = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
`;

const DayNameRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const DayName = styled.div`
  text-align: right;
  font-weight: 600;
  color: #64748b;
  padding: 10px 12px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-right: 1px solid #e2e8f0;
  &:last-child { border-right: none; }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #e2e8f0;
  gap: 1px;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
  }
`;

const DayCell = styled.div`
  background: ${props => props.$isToday ? '#f0fdf4' : 'white'};
  min-height: 110px;
  padding: 8px;
  opacity: ${props => props.$isOtherMonth ? 0.4 : 1};
  position: relative;
  transition: background 0.2s;
  
  &:hover {
    background: ${props => props.$isToday ? '#dcfce7' : '#f8fafc'};
  }
  
  @media (max-width: 768px) {
    min-height: 70px;
    padding: 5px 4px;
  }

  .date-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 4px;
  }

  .date-num {
    font-weight: 600;
    font-size: 13px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: ${props => props.$isToday ? 'white' : '#334155'};
    background: ${props => props.$isToday ? '#16a34a' : 'transparent'};
    
    @media (max-width: 768px) { font-size: 11px; width: 20px; height: 20px; }
  }

  .events {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .more-btn {
    font-size: 10px;
    color: #64748b;
    font-weight: 600;
    text-align: left;
    padding: 2px 4px;
    background: none; border: none; cursor: pointer;
    &:hover { color: #0f172a; }
  }
`;

const EventItem = styled.div`
  font-size: 11px;
  padding: 3px 6px;
  border-radius: 4px;
  background: ${p => p.$bg || '#f1f5f9'};
  color: ${p => p.$color || '#334155'};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-left: 2px solid ${p => p.$color};
  
  .evt-icon { font-size: 10px; flex-shrink: 0; }
  
  @media (max-width: 768px) {
    font-size: 9px;
    padding: 2px 4px;
    gap: 2px;
    .evt-text { display: none; }
    .evt-icon { font-size: 9px; }
  }
`;

/* ── LISTE / GÜNDEM VIEW ──────────────────────────────── */

const AgendaContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AgendaDayGroup = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  animation: ${fadeIn} 0.3s ease;
`;

const AgendaDayHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${p => p.$isToday ? 'linear-gradient(135deg, #ecfdf5, #f0fdf4)' : '#f8fafc'};
  border-bottom: ${p => p.$expanded ? 'none' : '1px solid #e2e8f0'};
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  
  &:hover { background: ${p => p.$isToday ? '#dcfce7' : '#f1f5f9'}; }
  &:active { opacity: 0.95; }
  
  .chevron {
    margin-left: auto;
    color: #64748b;
    font-size: 18px;
    flex-shrink: 0;
  }
`;

const AgendaDayNum = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${p => p.$isToday ? '#16a34a' : 'white'};
  color: ${p => p.$isToday ? 'white' : '#0f172a'};
  border: ${p => p.$isToday ? 'none' : '1.5px solid #e2e8f0'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 16px;
  line-height: 1;
  flex-shrink: 0;
`;

const AgendaDayInfo = styled.div`
  flex: 1;
  .day-name { font-size: 13px; font-weight: 700; color: #0f172a; }
  .day-count { font-size: 11px; color: #64748b; font-weight: 500; margin-top: 1px; }
`;

const AgendaEventList = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeIn} 0.25s ease;
`;

const AgendaEventRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  &:last-child { border-bottom: none; }
  transition: background 0.15s;
  &:hover { background: #f8fafc; }
`;

const AgendaEventIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: ${p => p.$bg};
  color: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
`;

const AgendaEventContent = styled.div`
  flex: 1;
  .evt-title { font-size: 13px; font-weight: 600; color: #1e293b; }
  .evt-type { font-size: 11px; color: #64748b; font-weight: 500; margin-top: 2px; }
`;

const AgendaTypeBadge = styled.span`
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: ${p => p.$bg};
  color: ${p => p.$color};
  white-space: nowrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  
  .icon { font-size: 40px; margin-bottom: 12px; opacity: 0.5; }
  .text { font-size: 14px; font-weight: 600; }
  .sub { font-size: 12px; margin-top: 4px; }
`;

const LegendContainer = styled.div`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 20px;
  
  @media (max-width: 768px) { gap: 8px; }
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 500;
  color: #64748b;

  .legend-box {
    width: 10px; height: 10px; border-radius: 3px;
    background: ${p => p.$bg}; border-left: 2px solid ${p => p.$color};
  }
`;

const LoadingOverlay = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  background: white; border-radius: 12px; border: 1px solid #e2e8f0;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
`;

// ─── Event Configuration ────────────────────────────────
const CFG = {
  asi: { bg: '#eff6ff', color: '#3b82f6', icon: <FiActivity />, label: 'Aşılar' },
  asi_bekliyor: { bg: '#f8fafc', color: '#94a3b8', icon: <FiClipboard />, label: 'Planlı Aşı' },
  dogum: { bg: '#fef2f2', color: '#ef4444', icon: <FiHeart />, label: 'Beklenen Doğum' },
  saglik: { bg: '#fffbeb', color: '#d97706', icon: <FiAlertCircle />, label: 'Sağlık İşlemi' },
  kontrol: { bg: '#fff7ed', color: '#ea580c', icon: <FiActivity />, label: 'Kontrol' },
  bildirim: { bg: '#f5f3ff', color: '#8b5cf6', icon: <FiBell />, label: 'Hatırlatma' },
  sut: { bg: '#f0fdf4', color: '#16a34a', icon: <FiDroplet />, label: 'Süt Kaydı' },
  alis: { bg: '#f1f5f9', color: '#475569', icon: <FiTruck />, label: 'Alış İşlemi' },
  satis: { bg: '#f1f5f9', color: '#475569', icon: <FiTruck />, label: 'Satış İşlemi' },
  buzagi_dogum: { bg: '#fefce8', color: '#ca8a04', icon: <FiHeart />, label: 'Buzağı' },
  randevu: { bg: '#ccfbf1', color: '#0d9488', icon: <FiCalendar />, label: 'Veteriner Randevusu' },
};

const FILTER_GROUPS = [
  { key: 'all', label: 'Tümü', bg: '#f1f5f9', color: '#334155' },
  { key: 'asi', label: 'Aşı', bg: '#eff6ff', color: '#3b82f6' },
  { key: 'dogum', label: 'Doğum', bg: '#fef2f2', color: '#ef4444' },
  { key: 'saglik', label: 'Sağlık', bg: '#fffbeb', color: '#d97706' },
  { key: 'bildirim', label: 'Hatırlatma', bg: '#f5f3ff', color: '#8b5cf6' },
  { key: 'sut', label: 'Süt', bg: '#f0fdf4', color: '#16a34a' },
  { key: 'alis_satis', label: 'Ticaret', bg: '#f1f5f9', color: '#475569' },
  { key: 'randevu', label: 'Randevu', bg: '#ccfbf1', color: '#0d9488' },
];

const getStyle = (type) => CFG[type] || { bg: '#f8fafc', color: '#cbd5e1', icon: <FiCalendar />, label: 'Diğer' };
const DAY_NAMES = ['Paz', 'Pts', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const DAY_NAMES_FULL = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export default function Takvim() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(isMobile ? 'liste' : 'takvim');
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedDays, setExpandedDays] = useState(new Set());

  const fetchEvents = async (date) => {
    setLoading(true);
    try {
      const y = date.getFullYear(), m = date.getMonth() + 1;
      const res = await api.getTakvim(m, y);
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err); setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchEvents(currentDate); }, [currentDate]);

  const navMonth = (offset) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDay = (y, m) => { let d = new Date(y, m, 1).getDay(); return (d + 6) % 7; };

  const filterEvent = (e) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'alis_satis') return e.type === 'alis' || e.type === 'satis';
    if (activeFilter === 'asi') return e.type === 'asi' || e.type === 'asi_bekliyor';
    return e.type === activeFilter;
  };

  const filteredEvents = events.filter(filterEvent);

  const buildDays = () => {
    const y = currentDate.getFullYear(), m = currentDate.getMonth();
    const total = daysInMonth(y, m), fd = firstDay(y, m);
    const prevTotal = daysInMonth(y, m - 1);
    const arr = [];
    for (let i = 0; i < fd; i++) arr.push({ day: prevTotal - fd + i + 1, type: 'prev' });
    for (let i = 1; i <= total; i++) arr.push({ day: i, type: 'current' });
    const rem = 42 - arr.length;
    for (let i = 1; i <= rem; i++) arr.push({ day: i, type: 'next' });
    return arr;
  };

  const getDayEvents = (d, t) => {
    if (t !== 'current') return [];
    return filteredEvents.filter(e => {
      const dt = new Date(e.date);
      return dt.getDate() === d && dt.getMonth() === currentDate.getMonth() && dt.getFullYear() === currentDate.getFullYear();
    });
  };

  const isToday = (d, t) => {
    if (t !== 'current') return false;
    const n = new Date();
    return d === n.getDate() && currentDate.getMonth() === n.getMonth() && currentDate.getFullYear() === n.getFullYear();
  };

  const getAgendaDays = () => {
    const y = currentDate.getFullYear(), m = currentDate.getMonth();
    const total = daysInMonth(y, m);
    const result = [];
    for (let d = 1; d <= total; d++) {
      const evts = filteredEvents.filter(e => {
        const dt = new Date(e.date);
        return dt.getDate() === d && dt.getMonth() === m && dt.getFullYear() === y;
      });
      if (evts.length > 0) {
        const date = new Date(y, m, d);
        result.push({ day: d, events: evts, weekDay: (date.getDay() + 6) % 7 });
      }
    }
    return result;
  };

  const dayKey = (day) => `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
  const toggleDay = (day) => {
    const key = dayKey(day);
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const strMonths = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const stats = events.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {});
  const todayN = new Date();

  return (
    <PageContainer>
      <HeaderPanel>
        <TitleContent>
          <h1><FiCalendar style={{ color: '#64748b' }} /> Operasyon Takvimi</h1>
          <p>Çiftlikteki tüm işlemleri, aşıları ve hatırlatmaları takip edin</p>
        </TitleContent>
        <HeaderControls>
          <CalendarNav>
            <NavBtn onClick={() => navMonth(-1)}><FiChevronLeft /></NavBtn>
            <div className="month-label">{strMonths[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
            <NavBtn onClick={() => navMonth(1)}><FiChevronRight /></NavBtn>
          </CalendarNav>
          <ViewToggle>
            <ViewBtn $active={viewMode === 'takvim'} onClick={() => setViewMode('takvim')}>
              <FiGrid size={12} /> Takvim
            </ViewBtn>
            <ViewBtn $active={viewMode === 'liste'} onClick={() => setViewMode('liste')}>
              <FiList size={12} /> Liste
            </ViewBtn>
          </ViewToggle>
        </HeaderControls>
      </HeaderPanel>

      {/* Filtre Bar */}
      <FilterBar>
        {FILTER_GROUPS.map(f => {
          const count = f.key === 'all' ? events.length
            : f.key === 'alis_satis' ? (stats.alis || 0) + (stats.satis || 0)
            : f.key === 'asi' ? (stats.asi || 0) + (stats.asi_bekliyor || 0)
            : (stats[f.key] || 0);
          if (f.key !== 'all' && count === 0) return null;
          return (
            <FilterBtn
              key={f.key}
              $active={activeFilter === f.key}
              $bg={f.bg}
              $color={f.color}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label} {count > 0 && <span style={{ opacity: 0.7 }}>({count})</span>}
            </FilterBtn>
          );
        })}
      </FilterBar>

      {/* Metrik Rozetleri */}
      {events.length > 0 && (
        <MetricsGrid>
          <MetricBadge $bg="#f1f5f9" $color="#0f172a">
            <div className="m-icon"><FiCalendar /></div>
            <div className="m-info"><div className="m-val">{events.length}</div><div className="m-lbl">Planlı İşlem</div></div>
          </MetricBadge>
          {(stats.saglik > 0) && (
            <MetricBadge $bg="#fffbeb" $color="#d97706">
              <div className="m-icon"><FiAlertCircle /></div>
              <div className="m-info"><div className="m-val">{stats.saglik}</div><div className="m-lbl">Sağlık</div></div>
            </MetricBadge>
          )}
          {((stats.asi || 0) + (stats.asi_bekliyor || 0) > 0) && (
            <MetricBadge $bg="#eff6ff" $color="#3b82f6">
              <div className="m-icon"><FiActivity /></div>
              <div className="m-info"><div className="m-val">{(stats.asi || 0) + (stats.asi_bekliyor || 0)}</div><div className="m-lbl">Aşı</div></div>
            </MetricBadge>
          )}
          {stats.dogum > 0 && (
            <MetricBadge $bg="#fef2f2" $color="#ef4444">
              <div className="m-icon"><FiHeart /></div>
              <div className="m-info"><div className="m-val">{stats.dogum}</div><div className="m-lbl">Doğum</div></div>
            </MetricBadge>
          )}
          {stats.randevu > 0 && (
            <MetricBadge $bg="#ccfbf1" $color="#0d9488">
              <div className="m-icon"><FiCalendar /></div>
              <div className="m-info"><div className="m-val">{stats.randevu}</div><div className="m-lbl">Randevu</div></div>
            </MetricBadge>
          )}
        </MetricsGrid>
      )}

      {loading ? (
        <LoadingOverlay>
          <FiCalendar size={32} style={{ opacity: 0.5 }} />
          Ay takvimi yükleniyor...
        </LoadingOverlay>
      ) : viewMode === 'takvim' ? (
        /* ── TAKVİM GÖRÜNÜMÜ ── */
        <CalendarContainer>
          <DayNameRow>
            {DAY_NAMES_FULL.map((d, i) => (
              <DayName key={d}>
                <span className="desktop-name">{d}</span>
                <span className="mobile-name" style={{ display: 'none' }}>{DAY_NAMES[i]}</span>
              </DayName>
            ))}
          </DayNameRow>
          <style>{`
            @media (max-width: 768px) {
              .desktop-name { display: none !important; }
              .mobile-name { display: inline !important; }
            }
          `}</style>
          <CalendarGrid>
            {buildDays().map((item, idx) => {
              const evts = getDayEvents(item.day, item.type);
              const max = 3;
              const vEvts = evts.slice(0, max);
              const rem = evts.length - max;
              const todayFlag = isToday(item.day, item.type);

              return (
                <DayCell key={idx} $isOtherMonth={item.type !== 'current'} $isToday={todayFlag}>
                  <div className="date-header">
                    <div className="date-num">{item.day}</div>
                  </div>
                  <div className="events">
                    {vEvts.map(e => {
                      const cfg = getStyle(e.type);
                      return (
                        <EventItem key={e.id} $bg={cfg.bg} $color={cfg.color} title={e.title}>
                          <span className="evt-icon">{cfg.icon}</span>
                          <span className="evt-text">{e.title}</span>
                        </EventItem>
                      );
                    })}
                    {rem > 0 && <button className="more-btn">+{rem} daha</button>}
                  </div>
                </DayCell>
              );
            })}
          </CalendarGrid>
        </CalendarContainer>
      ) : (
        /* ── LİSTE / GÜNDEM GÖRÜNÜMÜ ── */
        <AgendaContainer>
          {getAgendaDays().length === 0 ? (
            <EmptyState>
              <div className="icon"><FiCalendar /></div>
              <div className="text">Bu ayda etkinlik bulunamadı</div>
              <div className="sub">{activeFilter !== 'all' && 'Filtreyi değiştirmeyi deneyin'}</div>
            </EmptyState>
          ) : (
            getAgendaDays().map(({ day, events: dayEvts, weekDay }) => {
              const isT = day === todayN.getDate()
                && currentDate.getMonth() === todayN.getMonth()
                && currentDate.getFullYear() === todayN.getFullYear();
              const expanded = expandedDays.has(dayKey(day));
              return (
                <AgendaDayGroup key={day}>
                  <AgendaDayHeader $isToday={isT} $expanded={expanded} onClick={() => toggleDay(day)}>
                    <AgendaDayNum $isToday={isT}>{day}</AgendaDayNum>
                    <AgendaDayInfo>
                      <div className="day-name">
                        {DAY_NAMES_FULL[weekDay]}, {strMonths[currentDate.getMonth()]} {currentDate.getFullYear()}
                        {isT && <span style={{ marginLeft: 8, fontSize: 11, background: '#16a34a', color: 'white', padding: '1px 7px', borderRadius: 10, fontWeight: 700 }}>Bugün</span>}
                      </div>
                      <div className="day-count">{dayEvts.length} etkinlik</div>
                    </AgendaDayInfo>
                    <span className="chevron">{expanded ? <FiChevronUp /> : <FiChevronDown />}</span>
                  </AgendaDayHeader>
                  {expanded && (
                    <AgendaEventList>
                      {dayEvts.map(e => {
                        const cfg = getStyle(e.type);
                        return (
                          <AgendaEventRow key={e.id}>
                            <AgendaEventIcon $bg={cfg.bg} $color={cfg.color}>{cfg.icon}</AgendaEventIcon>
                            <AgendaEventContent>
                              <div className="evt-title">{e.title}</div>
                              <div className="evt-type">{cfg.label}</div>
                            </AgendaEventContent>
                            <AgendaTypeBadge $bg={cfg.bg} $color={cfg.color}>{cfg.label}</AgendaTypeBadge>
                          </AgendaEventRow>
                        );
                      })}
                    </AgendaEventList>
                  )}
                </AgendaDayGroup>
              );
            })
          )}
        </AgendaContainer>
      )}

      <LegendContainer>
        {Object.entries(CFG).map(([k, cfg]) => (
          <LegendItem key={k} $bg={cfg.bg} $color={cfg.color}>
            <div className="legend-box" /> {cfg.label}
          </LegendItem>
        ))}
      </LegendContainer>
    </PageContainer>
  );
}
