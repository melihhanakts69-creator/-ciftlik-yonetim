import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import GorevListesi from './GorevListesi';

const CardWrapper = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 10px 8px;
    border-radius: 12px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #111827;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 8px;

    @media (max-width: 768px) {
      font-size: 13px;
    }
  }
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 320px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #e0e0e0;
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    max-height: 160px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 24px 20px;
  color: #9ca3af;
  font-size: 13px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;

  .empty-icon {
    font-size: 28px;
  }
  .empty-title {
    font-weight: 600;
    color: #6b7280;
  }
`;

const ViewAllBtn = styled.button`
  margin-top: 8px;
  padding: 7px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  color: #16a34a;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;

  &:hover {
    background: #f0fdf4;
    border-color: #16a34a;
  }
`;

const YapilacaklarCard = ({ geciken = [], bugun = [], yaklaşan = [], onRefresh }) => {
  const navigate = useNavigate();
  const toplam = geciken.length + bugun.length + yaklaşan.length;

  return (
    <CardWrapper>
      <CardHeader>
        <h3>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            📌 Yapılacaklar
            {geciken.length > 0 && (
              <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 20, background: '#fef2f2', color: '#991b1b' }}>
                {geciken.length} gecikmiş
              </span>
            )}
            <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 20, background: '#f3f4f6', color: '#6b7280' }}>
              {toplam} toplam
            </span>
          </span>
          <span
            onClick={() => navigate('/bildirimler')}
            style={{ fontSize: 12, color: '#16a34a', fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}
          >
            Tümü →
          </span>
        </h3>
      </CardHeader>

      {toplam === 0 ? (
        <EmptyState>
          <span className="empty-icon">✅</span>
          <span className="empty-title">Bekleyen görev yok</span>
        </EmptyState>
      ) : (
        <>
          <TaskList>
            <GorevListesi
              geciken={geciken}
              bugun={bugun}
              yaklaşan={yaklaşan}
              onRefresh={onRefresh}
            />
          </TaskList>
          {toplam > 8 && (
            <ViewAllBtn onClick={() => navigate('/bildirimler')}>
              +{toplam - 8} görev daha
            </ViewAllBtn>
          )}
        </>
      )}
    </CardWrapper>
  );
};

export default YapilacaklarCard;
