import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaHeartbeat, FaSyringe, FaStethoscope, FaPills, FaCut, FaBaby, FaCalendarAlt, FaMoneyBillWave, FaClock, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/api';

const SectionCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  margin-bottom: 25px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #34495e;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
`;

const ViewAllBtn = styled.button`
  background: none;
  border: 1px solid #e91e63;
  color: #e91e63;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fce4ec;
  }
`;

const RecordItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 8px;
  background: ${props => props.bg || '#f8f9fa'};
  transition: transform 0.2s;

  &:hover { transform: translateX(3px); }
  &:last-child { margin-bottom: 0; }
`;

const RecordIconWrapper = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${props => props.bg};
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
`;

const RecordInfo = styled.div`
  flex: 1;

  .title {
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
  }

  .meta {
    font-size: 11px;
    color: #95a5a6;
    display: flex;
    gap: 10px;
    margin-top: 2px;
  }
`;

const StatusDot = styled.span`
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  background: ${props => props.bg};
  color: ${props => props.color};
`;

const EmptyText = styled.p`
  color: #bdc3c7;
  text-align: center;
  font-size: 14px;
  padding: 20px 0;
`;

const getTipStyle = (tip) => {
    switch (tip) {
        case 'hastalik': return { icon: <FaHeartbeat />, color: '#f44336', bg: '#ffebee' };
        case 'tedavi': return { icon: <FaPills />, color: '#FF9800', bg: '#FFF3E0' };
        case 'asi': return { icon: <FaSyringe />, color: '#9C27B0', bg: '#F3E5F5' };
        case 'muayene': return { icon: <FaStethoscope />, color: '#2196F3', bg: '#E3F2FD' };
        case 'ameliyat': return { icon: <FaCut />, color: '#E91E63', bg: '#FCE4EC' };
        case 'dogum_komplikasyonu': return { icon: <FaBaby />, color: '#795548', bg: '#EFEBE9' };
        default: return { icon: <FaHeartbeat />, color: '#607D8B', bg: '#ECEFF1' };
    }
};

const getDurumStyle = (durum) => {
    switch (durum) {
        case 'devam_ediyor': return { bg: '#FFF3E0', color: '#E65100', label: 'Devam' };
        case 'iyilesti': return { bg: '#E8F5E9', color: '#2E7D32', label: 'İyileşti' };
        case 'kronik': return { bg: '#FFF9C4', color: '#F57F17', label: 'Kronik' };
        default: return { bg: '#ECEFF1', color: '#455A64', label: durum };
    }
};

const SaglikGecmisi = ({ hayvanId, limit = 5 }) => {
    const [kayitlar, setKayitlar] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!hayvanId) return;
        const yukle = async () => {
            try {
                const res = await api.getSaglikByHayvan(hayvanId);
                setKayitlar(res.data || []);
            } catch (err) {
                // Backend henüz deploy edilmemış olabilir
                console.log('Sağlık geçmişi yüklenemedi');
            } finally {
                setYukleniyor(false);
            }
        };
        yukle();
    }, [hayvanId]);

    const sonKayitlar = kayitlar.slice(0, limit);

    return (
        <SectionCard>
            <SectionTitle>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaHeartbeat style={{ color: '#e91e63' }} /> Sağlık Geçmişi
                </div>
                <ViewAllBtn onClick={() => navigate('/saglik-merkezi')}>
                    Tümünü Gör
                </ViewAllBtn>
            </SectionTitle>

            {yukleniyor ? (
                <EmptyText>Yükleniyor...</EmptyText>
            ) : sonKayitlar.length === 0 ? (
                <EmptyText>Sağlık kaydı bulunamadı</EmptyText>
            ) : (
                sonKayitlar.map(k => {
                    const tipStyle = getTipStyle(k.tip);
                    const durumStyle = getDurumStyle(k.durum);
                    return (
                        <RecordItem key={k._id}>
                            <RecordIconWrapper bg={tipStyle.bg} color={tipStyle.color}>
                                {tipStyle.icon}
                            </RecordIconWrapper>
                            <RecordInfo>
                                <div className="title">{k.tani}</div>
                                <div className="meta">
                                    <span><FaCalendarAlt /> {new Date(k.tarih).toLocaleDateString('tr-TR')}</span>
                                    {k.veteriner && <span><FaStethoscope /> {k.veteriner}</span>}
                                    {k.maliyet > 0 && <span>₺{k.maliyet.toLocaleString('tr-TR')}</span>}
                                </div>
                            </RecordInfo>
                            <StatusDot bg={durumStyle.bg} color={durumStyle.color}>
                                {durumStyle.label}
                            </StatusDot>
                        </RecordItem>
                    );
                })
            )}
        </SectionCard>
    );
};

export default SaglikGecmisi;
