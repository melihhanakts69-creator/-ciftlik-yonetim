import React from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius } from '../../styles/colors';
import Card from '../common/Card';

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const TaskItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: ${spacing.md};
  background: ${props => {
    if (props.geciken) return colors.bg.red;
    if (props.oncelik === 'acil') return colors.bg.red;
    if (props.oncelik === 'yuksek') return colors.bg.orange;
    return colors.bg.gray;
  }};
  border-radius: ${borderRadius.md};
  border-left: 3px solid ${props => {
    if (props.geciken) return colors.danger;
    if (props.oncelik === 'acil') return colors.danger;
    if (props.oncelik === 'yuksek') return colors.warning;
    return colors.primary;
  }};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => {
      if (props.geciken) return colors.bg.red;
      if (props.oncelik === 'acil') return colors.bg.red;
      if (props.oncelik === 'yuksek') return colors.bg.orange;
      return colors.bg.lightGreen;
    }};
    transform: translateX(4px);
  }
`;

const Checkbox = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.checked ? colors.success : colors.border.medium};
  border-radius: 4px;
  background: ${props => props.checked ? colors.success : 'white'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 2px;
`;

const TaskContent = styled.div`
  flex: 1;
  margin-left: ${spacing.md};
`;

const TaskTitle = styled.div`
  font-weight: 600;
  color: ${colors.text.primary};
  font-size: 14px;
  margin-bottom: 4px;
`;

const TaskMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  font-size: 12px;
  color: ${colors.text.secondary};
`;

const Badge = styled.span`
  background: ${props => {
    switch(props.type) {
      case 'dogum': return colors.primary;
      case 'asi': return colors.info;
      case 'muayene': return colors.secondary;
      case 'kizginlik': return '#E91E63';
      case 'sagim': return colors.info;
      default: return colors.text.light;
    }
  }};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing.xl};
  color: ${colors.text.light};
  font-size: 14px;
`;

const ViewAllButton = styled.button`
  width: 100%;
  padding: ${spacing.md};
  background: transparent;
  border: 1px solid ${colors.border.light};
  border-radius: ${borderRadius.md};
  color: ${colors.primary};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.bg.lightGreen};
    border-color: ${colors.primary};
  }
`;

const YapilacaklarCard = ({ bildirimler = [], onTaskClick, onTaskComplete, onViewAll }) => {
  const formatTarih = (tarih) => {
    const date = new Date(tarih);
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);

    const bildirimTarih = new Date(date);
    bildirimTarih.setHours(0, 0, 0, 0);

    if (bildirimTarih < bugun) {
      const gunFarki = Math.floor((bugun - bildirimTarih) / (1000 * 60 * 60 * 24));
      return `${gunFarki} gün önce`;
    }

    if (bildirimTarih.getTime() === bugun.getTime()) {
      return 'Bugün';
    }

    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const getTipLabel = (tip) => {
    const labels = {
      dogum: '🤰 Doğum',
      asi: '💉 Aşı',
      muayene: '🩺 Muayene',
      kizginlik: '🌡️ Kızgınlık',
      sagim: '🥛 Sağım',
      yem: '🌾 Yem',
      odeme: '💰 Ödeme',
      diger: '📋 Diğer'
    };
    return labels[tip] || tip;
  };

  return (
    <Card
      title="Bugünün Yapılacakları"
      subtitle={`${bildirimler.length} görev`}
      headerBorder
      action={
        bildirimler.length > 0 && onViewAll && (
          <button
            onClick={onViewAll}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.primary,
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            Tümünü Gör →
          </button>
        )
      }
    >
      {bildirimler.length === 0 ? (
        <EmptyState>
          ✅ Bugün için tüm görevler tamamlandı!
        </EmptyState>
      ) : (
        <>
          <TaskList>
            {bildirimler.slice(0, 5).map((bildirim) => (
              <TaskItem
                key={bildirim._id}
                oncelik={bildirim.oncelik}
                geciken={new Date(bildirim.hatirlatmaTarihi) < new Date()}
                onClick={() => onTaskClick && onTaskClick(bildirim)}
              >
                <Checkbox
                  checked={bildirim.tamamlandi}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskComplete && onTaskComplete(bildirim._id);
                  }}
                >
                  {bildirim.tamamlandi && '✓'}
                </Checkbox>
                <TaskContent>
                  <TaskTitle>{bildirim.baslik}</TaskTitle>
                  <TaskMeta>
                    <Badge type={bildirim.tip}>
                      {getTipLabel(bildirim.tip)}
                    </Badge>
                    {bildirim.kupe_no && <span>Küpe: {bildirim.kupe_no}</span>}
                    <span>{formatTarih(bildirim.hatirlatmaTarihi)}</span>
                  </TaskMeta>
                </TaskContent>
              </TaskItem>
            ))}
          </TaskList>
          {bildirimler.length > 5 && onViewAll && (
            <ViewAllButton onClick={onViewAll} style={{ marginTop: spacing.md }}>
              {bildirimler.length - 5} görev daha göster
            </ViewAllButton>
          )}
        </>
      )}
    </Card>
  );
};

export default YapilacaklarCard;
