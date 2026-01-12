import React from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius } from '../../styles/colors';
import Card from '../common/Card';

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.md};
  padding: ${spacing.md};
  border-radius: ${borderRadius.md};
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.bg.gray};
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.bgColor || colors.bg.green};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: 600;
  color: ${colors.text.primary};
  font-size: 14px;
  margin-bottom: 4px;
`;

const ActivityMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  font-size: 12px;
  color: ${colors.text.secondary};
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: ${colors.text.light};
  white-space: nowrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing.xl};
  color: ${colors.text.light};
  font-size: 14px;
`;

const AktivitelerCard = ({ aktiviteler = [] }) => {
  const getActivityIcon = (tip) => {
    const icons = {
      hayvan_eklendi: { icon: '➕', bg: colors.bg.green },
      hayvan_alindi: { icon: '🛒', bg: colors.bg.blue },
      hayvan_satildi: { icon: '💰', bg: colors.bg.orange },
      sut_kaydi: { icon: '🥛', bg: colors.bg.lightBlue },
      maliyet: { icon: '💸', bg: colors.bg.red },
      asi: { icon: '💉', bg: colors.bg.lightGreen },
      muayene: { icon: '🩺', bg: colors.bg.lightOrange }
    };
    return icons[tip] || { icon: '📋', bg: colors.bg.gray };
  };

  const getActivityMessage = (aktivite) => {
    switch (aktivite.tip) {
      case 'hayvan_eklendi':
        return `${aktivite.veri.kupe_no} küpe nolu ${aktivite.veri.tip} eklendi`;
      case 'hayvan_alindi':
        return `${aktivite.veri.hayvanTipi} alındı - ${aktivite.veri.fiyat} ₺`;
      case 'hayvan_satildi':
        return `${aktivite.veri.hayvanTipi} satıldı - ${aktivite.veri.fiyat} ₺`;
      case 'sut_kaydi':
        return `${aktivite.veri.miktar} lt süt kaydedildi`;
      case 'maliyet':
        return `${aktivite.veri.kategori} - ${aktivite.veri.tutar} ₺`;
      default:
        return 'Aktivite';
    }
  };

  const formatZaman = (tarih) => {
    const now = new Date();
    const date = new Date(tarih);
    const diff = now - date;

    const dakika = Math.floor(diff / (1000 * 60));
    const saat = Math.floor(diff / (1000 * 60 * 60));
    const gun = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dakika < 1) return 'Az önce';
    if (dakika < 60) return `${dakika} dakika önce`;
    if (saat < 24) return `${saat} saat önce`;
    if (gun < 7) return `${gun} gün önce`;

    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <Card
      title="Son Aktiviteler"
      subtitle="Son işlemler"
      headerBorder
    >
      {aktiviteler.length === 0 ? (
        <EmptyState>
          Henüz aktivite bulunmuyor
        </EmptyState>
      ) : (
        <ActivityList>
          {aktiviteler.map((aktivite, index) => {
            const { icon, bg } = getActivityIcon(aktivite.tip);
            return (
              <ActivityItem key={index}>
                <ActivityIcon bgColor={bg}>
                  {icon}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>{getActivityMessage(aktivite)}</ActivityTitle>
                  <ActivityMeta>
                    <span>{formatZaman(aktivite.tarih)}</span>
                  </ActivityMeta>
                </ActivityContent>
              </ActivityItem>
            );
          })}
        </ActivityList>
      )}
    </Card>
  );
};

export default AktivitelerCard;
