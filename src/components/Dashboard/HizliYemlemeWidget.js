import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUtensils, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import * as api from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';

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

const Header = styled.div`
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
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .date {
    font-size: 11px;
    color: #999;
    background: #f5f5f5;
    padding: 2px 8px;
    border-radius: 10px;
  }
`;

const RationList = styled.div`
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

const RationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  background: ${props => props.done ? '#F1F8E9' : '#FAFAFA'};
  transition: all 0.15s ease;

  &:hover {
    transform: translateX(3px);
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;

  strong {
    color: #333;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    color: #999;
    font-size: 11px;
  }
`;

const FeedButton = styled.button`
  background: ${props => props.done ? '#C8E6C9' : '#FFE0B2'};
  color: ${props => props.done ? '#2e7d32' : '#e65100'};
  border: none;
  padding: 5px 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 11px;
  cursor: ${props => props.done ? 'default' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    ${props => !props.done && `
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    `}
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 20px;
  color: #bbb;
  font-size: 13px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HizliYemlemeWidget = () => {
    const [rasyonlar, setRasyonlar] = useState([]);
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState({});

    useEffect(() => {
        loadRasyonlar();
    }, []);

    const loadRasyonlar = async () => {
        try {
            const res = await api.getRasyonlar();
            setRasyonlar(res.data);
        } catch (e) {
            console.error("Rasyonlar yüklenemedi", e);
        }
    };

    const handleFeed = async (rasyonId) => {
        if (!window.confirm('Bu grup için yem dağıtımı yapılsın mı? Stoktan düşülecek.')) return;
        setLoading(true);
        try {
            await api.rasyonDagit({ rasyonId });
            setCompleted(prev => ({ ...prev, [rasyonId]: true }));
            showSuccess('Yemleme Kaydedildi!');
        } catch (error) {
            showError(error.response?.data?.message || 'İşlem başarısız');
        } finally {
            setLoading(false);
        }
    };

    return (
        <CardWrapper>
            <Header>
                <h3><FaUtensils color="#e65100" /> Hızlı Yemleme</h3>
                <span className="date">{new Date().toLocaleDateString('tr-TR')}</span>
            </Header>
            {rasyonlar.length === 0 ? (
                <EmptyState>Rasyon tanımlanmamış</EmptyState>
            ) : (
                <RationList>
                    {rasyonlar.map(r => (
                        <RationItem key={r._id} done={completed[r._id]}>
                            <Info>
                                <strong>{r.ad}</strong>
                                <span>{r.hedefGrup?.toUpperCase()} · {r.toplamMaliyet?.toFixed(0)} ₺/Baş</span>
                            </Info>
                            <FeedButton
                                disabled={loading || completed[r._id]}
                                done={completed[r._id]}
                                onClick={() => !completed[r._id] && handleFeed(r._id)}
                            >
                                {completed[r._id] ? (
                                    <><FaCheck /> Verildi</>
                                ) : (
                                    <><FaExclamationTriangle /> Yemle</>
                                )}
                            </FeedButton>
                        </RationItem>
                    ))}
                </RationList>
            )}
        </CardWrapper>
    );
};

export default HizliYemlemeWidget;
