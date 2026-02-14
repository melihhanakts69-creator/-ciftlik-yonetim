import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { colors, spacing, borderRadius } from '../../styles/colors';

const CardWrapper = styled.div`
  background: white;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.04);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 25px rgba(0,0,0,0.08);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: ${colors.text.primary};
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const CountBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: white;
  background: ${props => props.count > 0 ? colors.warning : colors.primary};
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 320px;
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: ${props => props.geciken ? '#FFF5F5' : '#FAFAFA'};
  border-left: 3px solid ${props => {
    if (props.geciken) return '#ef5350';
    if (props.oncelik === 'acil') return '#ef5350';
    if (props.oncelik === 'yuksek') return '#FF9800';
    return '#4CAF50';
  }};
  transition: all 0.15s ease;
  cursor: default;

  &:hover {
    transform: translateX(3px);
    box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  }
`;

const TaskIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: ${props => props.bg || '#E8F5E9'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
`;

const TaskContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const TaskTitle = styled.div`
  font-weight: 600;
  color: ${colors.text.primary};
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TaskMeta = styled.div`
  font-size: 10px;
  color: ${colors.text.light};
  display: flex;
  gap: 6px;
  align-items: center;
`;

const Badge = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${props => {
    if (props.type === 'dogum') return '#2e7d32';
    if (props.type === 'asi') return '#1565C0';
    if (props.type === 'muayene') return '#E65100';
    if (props.type === 'kizginlik') return '#ad1457';
    return '#666';
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 20px;
  color: ${colors.text.light};
  font-size: 13px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ViewAllBtn = styled.button`
  margin-top: 8px;
  padding: 7px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  color: ${colors.primary};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;

  &:hover {
    background: ${colors.bg.lightGreen};
    border-color: ${colors.primary};
  }
`;

const YapilacaklarCard = ({ bildirimler = [], onTaskClick, onTaskComplete }) => {
  const navigate = useNavigate();

  const formatTarih = (tarih) => {
    const date = new Date(tarih);
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    const bildirimTarih = new Date(date);
    bildirimTarih.setHours(0, 0, 0, 0);

    if (bildirimTarih < bugun) {
      const gunFarki = Math.floor((bugun - bildirimTarih) / (1000 * 60 * 60 * 24));
      return `${gunFarki}g gecikmiş`;
    }
    if (bildirimTarih.getTime() === bugun.getTime()) return 'Bugün';
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const getTipIcon = (tip) => {
    const map = {
      dogum: { icon: '🤰', bg: '#E8F5E9' },
      asi: { icon: '💉', bg: '#E3F2FD' },
      muayene: { icon: '🩺', bg: '#FFF3E0' },
      kizginlik: { icon: '🌡️', bg: '#FCE4EC' },
      sagim: { icon: '🥛', bg: '#E3F2FD' },
      yem: { icon: '🌾', bg: '#FFF8E1' },
      odeme: { icon: '💰', bg: '#FFF3E0' },
    };
    return map[tip] || { icon: '📋', bg: '#F5F5F5' };
  };

  const getTipLabel = (tip) => {
    const labels = { dogum: 'Doğum', asi: 'Aşı', muayene: 'Muayene', kizginlik: 'Kızgınlık', sagim: 'Sağım', yem: 'Yem', odeme: 'Ödeme' };
    return labels[tip] || tip;
  };

  return (
    <CardWrapper>
      <CardHeader>
        <h3>📌 Yapılacaklar</h3>
        <CountBadge count={bildirimler.length}>{bildirimler.length}</CountBadge>
      </CardHeader>

      {bildirimler.length === 0 ? (
        <EmptyState>✅ Tüm görevler tamamlandı!</EmptyState>
      ) : (
        <>
          <TaskList>
            {bildirimler.slice(0, 5).map((bildirim) => {
              const { icon, bg } = getTipIcon(bildirim.tip);
              const geciken = new Date(bildirim.hatirlatmaTarihi) < new Date();
              return (
                <TaskItem
                  key={bildirim._id}
                  oncelik={bildirim.oncelik}
                  geciken={geciken}
                  onClick={() => onTaskClick && onTaskClick(bildirim)}
                >
                  <TaskIcon bg={bg}>{icon}</TaskIcon>
                  <TaskContent>
                    <TaskTitle>{bildirim.baslik}</TaskTitle>
                    <TaskMeta>
                      <Badge type={bildirim.tip}>{getTipLabel(bildirim.tip)}</Badge>
                      <span>·</span>
                      <span>{formatTarih(bildirim.hatirlatmaTarihi)}</span>
                    </TaskMeta>
                  </TaskContent>
                </TaskItem>
              );
            })}
          </TaskList>
          {bildirimler.length > 5 && (
            <ViewAllBtn onClick={() => navigate('/bildirimler')}>
              +{bildirimler.length - 5} görev daha
            </ViewAllBtn>
          )}
        </>
      )}
    </CardWrapper>
  );
};

export default YapilacaklarCard;
