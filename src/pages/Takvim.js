import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaSyringe, FaStethoscope, FaBirthdayCake, FaBell } from 'react-icons/fa';
import * as api from '../services/api';

const PageContainer = styled.div`
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);

  h1 {
    font-size: 24px;
    font-weight: 800;
    color: #2c3e50;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const MonthSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  
  span {
    font-size: 18px;
    font-weight: 700;
    color: #2c3e50;
    min-width: 150px;
    text-align: center;
  }
`;

const NavBtn = styled.button`
  background: #f0f2f5;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #555;
  transition: all 0.2s;

  &:hover {
    background: #e0e0e0;
    color: #333;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    display: flex;
    flex-direction: column;
  }
`;

const DayName = styled.div`
  text-align: center;
  font-weight: 700;
  color: #95a5a6;
  padding: 10px;
  text-transform: uppercase;
  font-size: 13px;
  letter-spacing: 1px;

  @media (max-width: 900px) {
    display: none;
  }
`;

const DayCell = styled.div`
  background: white;
  min-height: 140px;
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  opacity: ${props => props.isOtherMonth ? 0.5 : 1};
  border: ${props => props.isToday ? '2px solid #4CAF50' : '1px solid transparent'};
  position: relative;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.06);
    z-index: 2;
  }

  .date-num {
    font-weight: 700;
    font-size: 14px;
    color: ${props => props.isToday ? '#4CAF50' : '#2c3e50'};
    margin-bottom: 8px;
    display: block;
  }
`;

const EventItem = styled.div`
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 6px;
  margin-bottom: 4px;
  background: ${props => props.bg || '#eee'};
  color: ${props => props.color || '#333'};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    filter: brightness(0.95);
  }
`;

const Legend = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 24px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => props.color};
  }
`;

const Takvim = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // seçili ay/yıl değişince veri çek
    useEffect(() => {
        fetchEvents();
    }, [currentDate]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const yil = currentDate.getFullYear();
            const ay = currentDate.getMonth() + 1; // 1-12
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
        let day = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon...
        // Pazartesi'den başlatmak için (0=Pazartesi, 6=Pazar yapalım)
        // JS'de 0=Pazar, 1=Pzt...
        // Bizim sistem: 1=Pzt... 7=Pazar olsun istiyoruz veya 0=Pzt
        // Standart takvim Pzts başlar.
        // JS: Sun=0, Mon=1, ...
        // Dönüşüm: (day + 6) % 7 -> Mon=0, Tue=1 ... Sun=6
        return (day + 6) % 7;
    };

    const generateCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        // Önceki aydan kaç gün göstereceğiz?
        const days = [];
        const prevMonthDays = getDaysInMonth(year, month - 1);

        for (let i = 0; i < firstDay; i++) {
            days.push({ day: prevMonthDays - firstDay + i + 1, type: 'prev' });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, type: 'current' });
        }

        // Sonraki aydan doldur (toplam 35 veya 42 kare olsun)
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, type: 'next' });
        }

        return days;
    };

    const getEventsForDay = (day, type) => {
        if (type !== 'current') return [];

        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = targetDate.toLocaleDateString('tr-TR'); // "14.02.2026"

        // Basit karşılaştırma (API tam tarih stringi veya ISO dönüyor olabilir)
        // Backend ISO dönüyor: 2026-02-14T...
        // En sağlıklısı backend'den gelen date'i object yapıp gün/ay/yıl kıyaslamak.

        return events.filter(e => {
            const eDate = new Date(e.date);
            return eDate.getDate() === day &&
                eDate.getMonth() === currentDate.getMonth() &&
                eDate.getFullYear() === currentDate.getFullYear();
        });
    };

    const getEventStyle = (type) => {
        switch (type) {
            case 'asi': return { bg: '#E3F2FD', color: '#1565C0', icon: <FaSyringe /> };
            case 'dogum': return { bg: '#E8F5E9', color: '#2E7D32', icon: <FaBirthdayCake /> };
            case 'saglik':
            case 'tedavi':
            case 'muayene':
                return { bg: '#FFF3E0', color: '#E65100', icon: <FaStethoscope /> };
            case 'bildirim': return { bg: '#F3E5F5', color: '#7B1FA2', icon: <FaBell /> };
            default: return { bg: '#eee', color: '#333', icon: null };
        }
    };

    const isToday = (day, type) => {
        if (type !== 'current') return false;
        const today = new Date();
        return day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();
    };

    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

    return (
        <PageContainer>
            <Header>
                <h1><FaCalendarAlt color="#4CAF50" /> Çiftlik Takvimi</h1>
                <MonthSelector>
                    <NavBtn onClick={prevMonth}><FaChevronLeft /></NavBtn>
                    <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                    <NavBtn onClick={nextMonth}><FaChevronRight /></NavBtn>
                </MonthSelector>
            </Header>

            {/* Gün Başlıkları */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 10 }}>
                {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map(d => (
                    <DayName key={d}>{d}</DayName>
                ))}
            </div>

            <CalendarGrid>
                {generateCalendarDays().map((item, index) => {
                    const dayEvents = getEventsForDay(item.day, item.type);

                    return (
                        <DayCell key={index} isOtherMonth={item.type !== 'current'} isToday={isToday(item.day, item.type)}>
                            <span className="date-num">{item.day}</span>
                            <div className="events">
                                {dayEvents.map(evt => {
                                    const style = getEventStyle(evt.type);
                                    return (
                                        <EventItem key={evt.id} bg={style.bg} color={style.color} title={evt.title}>
                                            {style.icon} {evt.title}
                                        </EventItem>
                                    );
                                })}
                            </div>
                        </DayCell>
                    );
                })}
            </CalendarGrid>

            <Legend>
                <LegendItem color="#1565C0"><div className="dot" /> Aşılar</LegendItem>
                <LegendItem color="#2E7D32"><div className="dot" /> Doğumlar</LegendItem>
                <LegendItem color="#E65100"><div className="dot" /> Sağlık / Tedavi</LegendItem>
                <LegendItem color="#7B1FA2"><div className="dot" /> Hatırlatmalar</LegendItem>
            </Legend>

        </PageContainer>
    );
};

export default Takvim;
