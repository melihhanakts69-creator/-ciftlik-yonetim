import React from 'react';
import styled from 'styled-components';
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

  .count {
    font-size: 11px;
    color: #999;
    font-weight: 500;
    background: #f5f5f5;
    padding: 2px 8px;
    border-radius: 10px;
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 320px;
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }
  &::-webkit-scrollbar-thumb:hover { background: #bbb; }
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  transition: all 0.15s ease;
  cursor: default;

  &:hover {
    background: #fafafa;
    transform: translateX(3px);
  }
`;

const ActivityIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: ${props => props.bgColor || colors.bg.green};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityTitle = styled.div`
  font-weight: 600;
  color: ${colors.text.primary};
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ActivityTime = styled.div`
  font-size: 11px;
  color: ${colors.text.light};
  white-space: nowrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 24px;
  color: ${colors.text.light};
  font-size: 13px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AktivitelerCard = ({ aktiviteler = [] }) => {
  const getActivityIcon = (tip) => {
    const icons = {
      hayvan_eklendi: { icon: '➕', bg: '#E8F5E9' },
      hayvan_alindi: { icon: '🛒', bg: '#E3F2FD' },
      hayvan_satildi: { icon: '💰', bg: '#FFF3E0' },
      sut_kaydi: { icon: '🥛', bg: '#E3F2FD' },
      maliyet: { icon: '💸', bg: '#FFEBEE' },
      asi: { icon: '💉', bg: '#E8F5E9' },
      muayene: { icon: '🩺', bg: '#FFF3E0' }
    };
    return icons[tip] || { icon: '📋', bg: '#F5F5F5' };
  };

  const getActivityMessage = (aktivite) => {
    if (!aktivite || !aktivite.veri) return 'Bilinmeyen Aktivite';
    const veri = aktivite.veri;
    switch (aktivite.tip) {
      case 'hayvan_eklendi':
        return `${veri.kupe_no || veri.kupeNo || '?'} no'lu ${veri.tip || 'hayvan'} eklendi`;
      case 'hayvan_alindi':
        return `${veri.hayvanTipi || 'Hayvan'} alındı — ${(veri.fiyat || 0).toLocaleString('tr-TR')} ₺`;
      case 'hayvan_satildi':
        return `${veri.hayvanTipi || 'Hayvan'} satıldı — ${(veri.fiyat || 0).toLocaleString('tr-TR')} ₺`;
      case 'sut_kaydi':
        return `${veri.miktar || veri.litre || 0} lt süt kaydedildi`;
      case 'maliyet':
        return `${veri.kategori || 'Masraf'} — ${(veri.tutar || 0).toLocaleString('tr-TR')} ₺`;
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
    if (dakika < 60) return `${dakika}dk`;
    if (saat < 24) return `${saat}sa`;
    if (gun < 7) return `${gun}g`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <CardWrapper>
      <CardHeader>
        <h3>📋 Son Aktiviteler</h3>
        {aktiviteler.length > 0 && <span className="count">{aktiviteler.length} işlem</span>}
      </CardHeader>
      {aktiviteler.length === 0 ? (
        <EmptyState>Henüz aktivite bulunmuyor</EmptyState>
      ) : (
        <ActivityList>
          {aktiviteler.slice(0, 8).map((aktivite, index) => {
            const { icon, bg } = getActivityIcon(aktivite.tip);
            return (
              <ActivityItem key={index}>
                <ActivityIcon bgColor={bg}>{icon}</ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>{getActivityMessage(aktivite)}</ActivityTitle>
                </ActivityContent>
                <ActivityTime>{formatZaman(aktivite.tarih)}</ActivityTime>
              </ActivityItem>
            );
          })}
        </ActivityList>
      )}
    </CardWrapper>
  );
};

export default AktivitelerCard;
