import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaHeartbeat, FaSyringe, FaStethoscope, FaPills, FaExclamationTriangle, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 8px;

    svg { color: #e91e63; }
  }
`;

const ViewAllBtn = styled.button`
  background: none;
  border: 1px solid #e91e63;
  color: #e91e63;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    background: #fce4ec;
    transform: translateY(-1px);
  }
`;

const MiniStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const MiniStat = styled.div`
  text-align: center;
  padding: 10px 6px;
  border-radius: 12px;
  background: ${props => props.bg || '#f8f9fa'};

  .number {
    font-size: 22px;
    font-weight: 800;
    color: ${props => props.color || '#2c3e50'};
    display: block;
  }

  .label {
    font-size: 10px;
    color: #7f8c8d;
    font-weight: 600;
    margin-top: 2px;
  }
`;

const AlertList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const AlertItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: ${props => props.bg || '#f8f9fa'};
  transition: transform 0.15s;

  &:hover { transform: translateX(3px); }

  .icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: ${props => props.iconBg || '#fff'};
    color: ${props => props.iconColor || '#666'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    flex-shrink: 0;
  }

  .info {
    flex: 1;
    min-width: 0;
  }

  .title {
    font-size: 13px;
    font-weight: 600;
    color: #2c3e50;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meta {
    font-size: 10px;
    color: #95a5a6;
    display: flex;
    gap: 6px;
  }
`;

const EmptyText = styled.p`
  color: #bdc3c7;
  text-align: center;
  font-size: 13px;
  padding: 16px 0;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SaglikUyariCard = () => {
    const [veri, setVeri] = useState(null);
    const [yukleniyor, setYukleniyor] = useState(true);
    const navigate = useNavigate();

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const yukle = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/dashboard/saglik-uyarilari`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setVeri(data);
                }
            } catch (err) {
                console.log('Sağlık uyarıları yüklenemedi');
            } finally {
                setYukleniyor(false);
            }
        };
        yukle();
    }, [API_URL]);

    // Tüm uyarıları birleştir
    const getAlerts = () => {
        if (!veri) return [];
        const alerts = [];

        (veri.aktifTedaviler || []).forEach(t => {
            alerts.push({
                id: t._id,
                type: 'tedavi',
                title: t.tani || 'Tedavi',
                meta: t.hayvanIsim || t.hayvanTipi,
                date: t.tarih,
                bg: '#FFF3E0',
                iconBg: '#FFE0B2',
                iconColor: '#E65100',
                icon: <FaPills />
            });
        });

        (veri.gecikmiAsiler || []).forEach(a => {
            alerts.push({
                id: a._id,
                type: 'asi',
                title: a.asiAdi || 'Aşı Gecikmiş',
                meta: a.hayvanIsim || 'Toplu',
                date: a.sonrakiTarih,
                bg: '#FFEBEE',
                iconBg: '#FFCDD2',
                iconColor: '#C62828',
                icon: <FaSyringe />
            });
        });

        (veri.yaklasanKontroller || []).forEach(k => {
            alerts.push({
                id: k._id,
                type: 'kontrol',
                title: k.tani || 'Kontrol',
                meta: k.hayvanIsim || k.hayvanTipi,
                date: k.sonrakiKontrol,
                bg: '#E3F2FD',
                iconBg: '#BBDEFB',
                iconColor: '#1565C0',
                icon: <FaStethoscope />
            });
        });

        return alerts.slice(0, 4);
    };

    const alerts = getAlerts();
    const toplam = veri?.toplam || { aktif: 0, yaklasan: 0, gecikmi: 0 };

    return (
        <Card>
            <CardHeader>
                <h3><FaHeartbeat /> Sağlık Durumu</h3>
                <ViewAllBtn onClick={() => navigate('/saglik-merkezi')}>
                    Merkez <FaArrowRight />
                </ViewAllBtn>
            </CardHeader>

            <MiniStats>
                <MiniStat bg="#FFF3E0" color="#E65100">
                    <span className="number">{toplam.aktif}</span>
                    <span className="label">Aktif Tedavi</span>
                </MiniStat>
                <MiniStat bg="#FFEBEE" color="#C62828">
                    <span className="number">{toplam.gecikmi}</span>
                    <span className="label">Gecikmiş Aşı</span>
                </MiniStat>
                <MiniStat bg="#E3F2FD" color="#1565C0">
                    <span className="number">{toplam.yaklasan}</span>
                    <span className="label">Yaklaşan</span>
                </MiniStat>
            </MiniStats>

            <AlertList>
                {yukleniyor ? (
                    <EmptyText>Yükleniyor...</EmptyText>
                ) : alerts.length === 0 ? (
                    <EmptyText>✅ Sağlık uyarısı yok — her şey kontrol altında!</EmptyText>
                ) : (
                    alerts.map(alert => (
                        <AlertItem key={alert.id} bg={alert.bg} iconBg={alert.iconBg} iconColor={alert.iconColor}>
                            <div className="icon">{alert.icon}</div>
                            <div className="info">
                                <div className="title">{alert.title}</div>
                                <div className="meta">
                                    <span>{alert.meta}</span>
                                    {alert.date && (
                                        <span><FaCalendarAlt /> {new Date(alert.date).toLocaleDateString('tr-TR')}</span>
                                    )}
                                </div>
                            </div>
                        </AlertItem>
                    ))
                )}
            </AlertList>
        </Card>
    );
};

export default SaglikUyariCard;
