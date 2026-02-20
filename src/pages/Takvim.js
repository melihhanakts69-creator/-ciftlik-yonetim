import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaSyringe, FaStethoscope, FaBirthdayCake, FaBell } from 'react-icons/fa';
import * as api from '../services/api';

// ─── Animations ─────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ──────────────────────────

const PageContainer = styled.div`
  padding: 24px;
  min-height: calc(100vh - 80px);
  background: linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 50%, #faf5ff 100%);
  animation: ${fadeIn} 0.5s ease;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(20px);
  padding: 24px 28px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  border: 1px solid rgba(255,255,255,0.8);

  .left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .header-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: linear-gradient(135deg, #4CAF50, #66BB6A);
    color: white;
    box-shadow: 0 6px 20px rgba(76,175,80,0.25);
  }

  h1 {
    font-size: 26px;
    font-weight: 800;
    color: #1a1a1a;
    margin: 0;
    letter-spacing: -0.5px;
  }

  .sub {
    font-size: 13px;
    color: #94a3b8;
    font-weight: 500;
    margin-top: 2px;
  }

  @media (max-width: 700px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const MonthSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  span {
    font-size: 18px;
    font-weight: 800;
    color: #1a1a1a;
    min-width: 160px;
    text-align: center;
    letter-spacing: -0.3px;
  }
`;

const NavBtn = styled.button`
  background: white;
  border: 2px solid #e8ecf0;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
  font-size: 14px;

  &:hover {
    border-color: #4CAF50;
    color: #4CAF50;
    background: #f0fdf4;
    transform: scale(1.05);
  }
`;

const DayNameRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;

  @media (max-width: 900px) {
    display: none;
  }
`;

const DayName = styled.div`
  text-align: center;
  font-weight: 700;
  color: #94a3b8;
  padding: 10px;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 1px;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const DayCell = styled.div`
  background: ${props => props.isToday
    ? 'linear-gradient(145deg, #f0fdf4, #dcfce7)'
    : 'rgba(255,255,255,0.85)'};
  backdrop-filter: blur(8px);
  min-height: 120px;
  padding: 10px;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  opacity: ${props => props.isOtherMonth ? 0.4 : 1};
  border: ${props => props.isToday ? '2px solid #4CAF50' : '1px solid rgba(0,0,0,0.04)'};
  position: relative;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: ${props => props.isOtherMonth ? 'none' : 'translateY(-3px)'};
    box-shadow: ${props => props.isOtherMonth ? 'none' : '0 8px 24px rgba(0,0,0,0.08)'};
    z-index: 2;
  }

  .date-num {
    font-weight: 800;
    font-size: 14px;
    color: ${props => props.isToday ? '#4CAF50' : '#334155'};
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .today-badge {
    font-size: 10px;
    background: #4CAF50;
    color: white;
    padding: 2px 8px;
    border-radius: 6px;
    font-weight: 700;
  }

  .events {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .more-badge {
    font-size: 10px;
    color: #94a3b8;
    font-weight: 700;
    text-align: center;
    padding: 2px;
    cursor: pointer;
  }
`;

const EventItem = styled.div`
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 8px;
  background: ${props => props.bg || '#f1f5f9'};
  color: ${props => props.color || '#333'};
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s;
  border-left: 3px solid ${props => props.color || '#999'};

  &:hover {
    filter: brightness(0.93);
    transform: scale(1.02);
  }

  .evt-icon {
    font-size: 11px;
    flex-shrink: 0;
  }
`;

const LegendContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 24px;
  padding: 18px 24px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.04);
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 4px;
    background: ${props => props.color};
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px 20px;
  border: 1px solid rgba(0,0,0,0.04);
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  text-align: center;

  .stat-value {
    font-size: 24px;
    font-weight: 900;
    color: ${props => props.color || '#1a1a1a'};
    letter-spacing: -0.5px;
  }

  .stat-label {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 4px;
  }
`;

const LoadingOverlay = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
  font-size: 16px;
  font-weight: 600;
`;

// ─── Event Type Config ──────────────────────────
const EVENT_CONFIG = {
  asi: { bg: '#EBF5FB', color: '#1565C0', icon: '💉', label: 'Aşılar' },
  dogum: { bg: '#E8F5E9', color: '#2E7D32', icon: '🤰', label: 'Beklenen Doğum' },
  saglik: { bg: '#FFF3E0', color: '#E65100', icon: '🩺', label: 'Sağlık' },
  kontrol: { bg: '#FFF3E0', color: '#E65100', icon: '🔍', label: 'Kontrol' },
  bildirim: { bg: '#F3E5F5', color: '#7B1FA2', icon: '🔔', label: 'Hatırlatma' },
  sut: { bg: '#E0F2F1', color: '#00695C', icon: '🥛', label: 'Süt Kaydı' },
  alis: { bg: '#FFEBEE', color: '#C62828', icon: '📥', label: 'Alış' },
  satis: { bg: '#E8F5E9', color: '#1B5E20', icon: '📦', label: 'Satış' },
  buzagi_dogum: { bg: '#FFF8E1', color: '#F57F17', icon: '🐄', label: 'Buzağı Doğum' },
};

// ─────────────────────────────────────────────────

const Takvim = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const yil = currentDate.getFullYear();
      const ay = currentDate.getMonth() + 1;
      const res = await api.getTakvim(ay, yil);
      setEvents(res.data);
    } catch (err) {
      console.error('Takvim verisi alınamadı', err);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return (day + 6) % 7; // Mon=0 ... Sun=6
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];
    const prevMonthDays = getDaysInMonth(year, month - 1);

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: prevMonthDays - firstDay + i + 1, type: 'prev' });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, type: 'current' });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, type: 'next' });
    }
    return days;
  };

  const getEventsForDay = (day, type) => {
    if (type !== 'current') return [];
    return events.filter(e => {
      const eDate = new Date(e.date);
      return eDate.getDate() === day &&
        eDate.getMonth() === currentDate.getMonth() &&
        eDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const getEventStyle = (type) => {
    return EVENT_CONFIG[type] || { bg: '#f1f5f9', color: '#64748b', icon: '📌', label: 'Diğer' };
  };

  const isToday = (day, type) => {
    if (type !== 'current') return false;
    const today = new Date();
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

  // İstatistikler
  const getStats = () => {
    const counts = {};
    events.forEach(e => {
      counts[e.type] = (counts[e.type] || 0) + 1;
    });
    return counts;
  };

  const stats = getStats();

  return (
    <PageContainer>
      {/* Header */}
      <Header>
        <div className="left">
          <div className="header-icon">
            <FaCalendarAlt />
          </div>
          <div>
            <h1>Çiftlik Takvimi</h1>
            <div className="sub">Tüm etkinlikleri tek bakışta görün</div>
          </div>
        </div>
        <MonthSelector>
          <NavBtn onClick={prevMonth}><FaChevronLeft /></NavBtn>
          <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
          <NavBtn onClick={nextMonth}><FaChevronRight /></NavBtn>
        </MonthSelector>
      </Header>

      {/* Stats */}
      {events.length > 0 && (
        <StatsRow>
          <StatCard color="#1565C0">
            <div className="stat-value">{events.length}</div>
            <div className="stat-label">Toplam Etkinlik</div>
          </StatCard>
          {stats.sut > 0 && (
            <StatCard color="#00695C">
              <div className="stat-value">{stats.sut}</div>
              <div className="stat-label">Süt Kaydı</div>
            </StatCard>
          )}
          {stats.saglik > 0 && (
            <StatCard color="#E65100">
              <div className="stat-value">{stats.saglik}</div>
              <div className="stat-label">Sağlık İşlemi</div>
            </StatCard>
          )}
          {stats.dogum > 0 && (
            <StatCard color="#2E7D32">
              <div className="stat-value">{stats.dogum}</div>
              <div className="stat-label">Beklenen Doğum</div>
            </StatCard>
          )}
          {(stats.alis > 0 || stats.satis > 0) && (
            <StatCard color="#C62828">
              <div className="stat-value">{(stats.alis || 0) + (stats.satis || 0)}</div>
              <div className="stat-label">Alış-Satış</div>
            </StatCard>
          )}
        </StatsRow>
      )}

      {/* Day Names */}
      <DayNameRow>
        {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map(d => (
          <DayName key={d}>{d}</DayName>
        ))}
      </DayNameRow>

      {/* Calendar Grid */}
      {loading ? (
        <LoadingOverlay>⏳ Takvim yükleniyor...</LoadingOverlay>
      ) : (
        <CalendarGrid>
          {generateCalendarDays().map((item, index) => {
            const dayEvents = getEventsForDay(item.day, item.type);
            const maxShow = 3;
            const visibleEvents = dayEvents.slice(0, maxShow);
            const remaining = dayEvents.length - maxShow;

            return (
              <DayCell
                key={index}
                isOtherMonth={item.type !== 'current'}
                isToday={isToday(item.day, item.type)}
              >
                <span className="date-num">
                  {item.day}
                  {isToday(item.day, item.type) && <span className="today-badge">Bugün</span>}
                </span>
                <div className="events">
                  {visibleEvents.map(evt => {
                    const style = getEventStyle(evt.type);
                    return (
                      <EventItem
                        key={evt.id}
                        bg={style.bg}
                        color={style.color}
                        title={evt.title}
                      >
                        <span className="evt-icon">{style.icon}</span>
                        {evt.title}
                      </EventItem>
                    );
                  })}
                  {remaining > 0 && (
                    <div className="more-badge">+{remaining} daha</div>
                  )}
                </div>
              </DayCell>
            );
          })}
        </CalendarGrid>
      )}

      {/* Legend */}
      <LegendContainer>
        {Object.entries(EVENT_CONFIG).map(([key, config]) => (
          <LegendItem key={key} color={config.color}>
            <div className="dot" />
            {config.icon} {config.label}
          </LegendItem>
        ))}
      </LegendContainer>
    </PageContainer>
  );
};

export default Takvim;
