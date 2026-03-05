import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  FiChevronLeft, FiChevronRight, FiCalendar, FiActivity,
  FiDroplet, FiHeart, FiBell, FiAlertCircle, FiClipboard, FiTruck
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
    padding: 24px;
  }
`;

const HeaderPanel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const TitleContent = styled.div`
  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 4px 0;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  p {
    font-size: 14px;
    color: #64748b;
    margin: 0;
  }
`;

const CalendarNav = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);

  .month-label {
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
    min-width: 140px;
    text-align: center;
  }
`;

const NavBtn = styled.button`
  background: white;
  border: 1px solid transparent;
  width: 32px;
  height: 32px;
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

// Metrics Section
const MetricsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
`;

const MetricBadge = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  
  .m-icon {
    width: 32px; height: 32px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    background: ${p => p.$bg}; color: ${p => p.$color}; font-size: 16px;
  }
  
  .m-info {
    .m-val { font-size: 16px; font-weight: 700; color: #0f172a; line-height: 1.2; }
    .m-lbl { font-size: 12px; font-weight: 500; color: #64748b; }
  }
`;

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
  
  @media (max-width: 900px) { display: none; }
`;

const DayName = styled.div`
  text-align: right;
  font-weight: 600;
  color: #64748b;
  padding: 12px 16px;
  font-size: 12px;
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
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

const DayCell = styled.div`
  background: ${props => props.$isToday ? '#f0fdf4' : 'white'};
  min-height: 140px;
  padding: 12px;
  opacity: ${props => props.$isOtherMonth ? 0.4 : 1};
  position: relative;
  transition: background 0.2s;
  
  &:hover {
    background: ${props => props.$isToday ? '#dcfce7' : '#f8fafc'};
  }
  
  @media (max-width: 900px) { border-bottom: 1px solid #e2e8f0; min-height: 100px; }

  .date-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 8px;
  }

  .date-num {
    font-weight: 600;
    font-size: 14px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: ${props => props.$isToday ? 'white' : '#334155'};
    background: ${props => props.$isToday ? '#10b981' : 'transparent'};
  }

  .events {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .more-btn {
    font-size: 11px;
    color: #64748b;
    font-weight: 600;
    text-align: left;
    padding: 4px;
    background: none; border: none; cursor: pointer;
    &:hover { color: #0f172a; }
  }
`;

const EventItem = styled.div`
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${p => p.$bg || '#f1f5f9'};
  color: ${p => p.$color || '#334155'};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-left: 2px solid ${p => p.$border || p.$color};
  
  .evt-icon { font-size: 12px; flex-shrink: 0; }
`;

const LegendContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 24px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;

  .legend-box {
    width: 12px; height: 12px; border-radius: 3px;
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
  sut: { bg: '#f0fdf4', color: '#10b981', icon: <FiDroplet />, label: 'Süt Kaydı' },
  alis: { bg: '#f1f5f9', color: '#475569', icon: <FiTruck />, label: 'Alış İşlemi' },
  satis: { bg: '#f1f5f9', color: '#475569', icon: <FiTruck />, label: 'Satış İşlemi' },
  buzagi_dogum: { bg: '#fefce8', color: '#ca8a04', icon: <FiHeart />, label: 'Buzağı' },
};

const getStyle = (type) => CFG[type] || { bg: '#f8fafc', color: '#cbd5e1', icon: <FiCalendar />, label: 'Diğer' };

export default function Takvim() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
    return events.filter(e => {
      const dt = new Date(e.date);
      return dt.getDate() === d && dt.getMonth() === currentDate.getMonth() && dt.getFullYear() === currentDate.getFullYear();
    });
  };

  const isToday = (d, t) => {
    if (t !== 'current') return false;
    const n = new Date();
    return d === n.getDate() && currentDate.getMonth() === n.getMonth() && currentDate.getFullYear() === n.getFullYear();
  };

  const strMonths = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

  const stats = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <PageContainer>
      <HeaderPanel>
        <TitleContent>
          <h1><FiCalendar style={{ color: '#64748b' }} /> Operasyon Takvimi</h1>
          <p>Çiftlikteki tüm işlemleri, aşıları ve hatırlatmaları takip edin</p>
        </TitleContent>
        <CalendarNav>
          <NavBtn onClick={() => navMonth(-1)}><FiChevronLeft /></NavBtn>
          <div className="month-label">{strMonths[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
          <NavBtn onClick={() => navMonth(1)}><FiChevronRight /></NavBtn>
        </CalendarNav>
      </HeaderPanel>

      {events.length > 0 && (
        <MetricsGrid>
          <MetricBadge $bg="#f1f5f9" $color="#0f172a">
            <div className="m-icon"><FiCalendar /></div>
            <div className="m-info"><div className="m-val">{events.length}</div><div className="m-lbl">Planlı İşlem</div></div>
          </MetricBadge>
          {stats.saglik > 0 && (
            <MetricBadge $bg="#fffbeb" $color="#d97706">
              <div className="m-icon"><FiAlertCircle /></div>
              <div className="m-info"><div className="m-val">{stats.saglik}</div><div className="m-lbl">Sağlık İşlemi</div></div>
            </MetricBadge>
          )}
          {(stats.asi || stats.asi_bekliyor) && (
            <MetricBadge $bg="#eff6ff" $color="#3b82f6">
              <div className="m-icon"><FiActivity /></div>
              <div className="m-info"><div className="m-val">{(stats.asi || 0) + (stats.asi_bekliyor || 0)}</div><div className="m-lbl">Aşı Takvimi</div></div>
            </MetricBadge>
          )}
          {stats.dogum > 0 && (
            <MetricBadge $bg="#fef2f2" $color="#ef4444">
              <div className="m-icon"><FiHeart /></div>
              <div className="m-info"><div className="m-val">{stats.dogum}</div><div className="m-lbl">Beklenen Doğum</div></div>
            </MetricBadge>
          )}
        </MetricsGrid>
      )}

      {loading ? (
        <LoadingOverlay>
          <FiCalendar size={32} style={{ opacity: 0.5 }} />
          Ay takvimi yükleniyor...
        </LoadingOverlay>
      ) : (
        <CalendarContainer>
          <DayNameRow>
            {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map(d => <DayName key={d}>{d}</DayName>)}
          </DayNameRow>
          <CalendarGrid>
            {buildDays().map((item, idx) => {
              const evts = getDayEvents(item.day, item.type);
              const max = 4;
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
                          <span className="evt-icon">{cfg.icon}</span> {e.title}
                        </EventItem>
                      );
                    })}
                    {rem > 0 && <button className="more-btn">+{rem} eylem daha</button>}
                  </div>
                </DayCell>
              );
            })}
          </CalendarGrid>
        </CalendarContainer>
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
