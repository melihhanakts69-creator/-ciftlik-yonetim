import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUtensils, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import * as api from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';

const WidgetContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  margin-bottom: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  h3 { margin: 0; color: #2c3e50; display: flex; align-items: center; gap: 8px; font-size: 1.1rem; }
`;

const RationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  &:last-child { border-bottom: none; }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  strong { color: #333; font-size: 0.95rem; }
  span { color: #888; font-size: 0.8rem; }
`;

const ActionButton = styled.button`
  background: ${props => props.done ? '#e8f5e9' : '#fff3e0'};
  color: ${props => props.done ? '#2e7d32' : '#e65100'};
  border: 1px solid ${props => props.done ? '#c8e6c9' : '#ffe0b2'};
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  }
`;

const HizliYemlemeWidget = () => {
    const [rasyonlar, setRasyonlar] = useState([]);
    const [loading, setLoading] = useState(false);
    // Basit bir state ile "bugün yapıldı mı" takibi yapıyoruz (Local'de tutulabilir veya backend'den kontrol edilebilir)
    // Şimdilik session bazlı basit bir UI state tutacağız, backend desteği gelirse oradan çekeriz.
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

    if (rasyonlar.length === 0) return null;

    return (
        <WidgetContainer>
            <Header>
                <h3><FaUtensils color="#e65100" /> Hızlı Yemleme</h3>
                <span style={{ fontSize: '0.8rem', color: '#999' }}>{new Date().toLocaleDateString('tr-TR')}</span>
            </Header>
            {rasyonlar.map(r => (
                <RationItem key={r._id}>
                    <Info>
                        <strong>{r.ad}</strong>
                        <span>{r.hedefGrup.toUpperCase()} • {r.toplamMaliyet.toFixed(2)} TL/Baş</span>
                    </Info>
                    <ActionButton
                        disabled={loading || completed[r._id]}
                        done={completed[r._id]}
                        onClick={() => !completed[r._id] && handleFeed(r._id)}
                    >
                        {completed[r._id] ? (
                            <><FaCheck /> Verildi</>
                        ) : (
                            <><FaExclamationTriangle /> Yemle</>
                        )}
                    </ActionButton>
                </RationItem>
            ))}
        </WidgetContainer>
    );
};

export default HizliYemlemeWidget;
