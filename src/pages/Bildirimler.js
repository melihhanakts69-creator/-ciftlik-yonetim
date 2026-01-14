import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaBell, FaCheckDouble, FaTrash, FaSyringe, FaBaby,
    FaStethoscope, FaInfoCircle, FaCheck, FaExclamationTriangle,
    FaBoxOpen, FaFilter
} from 'react-icons/fa';
import * as api from '../services/api';

// --- Styled Components ---

const PageContainer = styled.div`
  padding: 20px;
  background-color: #f4f7f6;
  min-height: 100vh;
  padding-bottom: 80px;

  @media (max-width: 768px) {
    padding: 10px;
    padding-bottom: 80px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    font-size: 28px;
    font-weight: 800;
    color: #2c3e50;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    
    @media (max-width: 768px) {
      font-size: 24px;
    }
  }
`;

const MarkAllButton = styled.button`
  background: white;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #555;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);

  &:hover {
    background: #f9f9f9;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    span { display: none; } /* Mobilde sadece ikon */
    padding: 10px;
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
`;

const StatCard = styled.div`
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  text-align: center;
  border-bottom: 3px solid ${props => props.color};

  .label { font-size: 13px; color: #7f8c8d; margin-bottom: 5px; }
  .value { font-size: 24px; font-weight: 800; color: ${props => props.color}; }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 5px;
  
  /* Scrollbar gizleme */
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const TabButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.active ? '#4CAF50' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border: 1px solid ${props => props.active ? '#4CAF50' : '#ddd'};
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#43A047' : '#f5f5f5'};
  }
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const NotificationCard = styled.div`
  background: ${props => props.unread ? 'white' : '#f9f9f9'};
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 20px;
  border-left: 5px solid ${props => props.color};
  opacity: ${props => props.unread ? 1 : 0.7};
  transition: transform 0.2s;

  &:hover {
    transform: translateX(5px);
  }

  @media (max-width: 768px) {
    padding: 15px;
    gap: 15px;
  }
`;

const IconWrapper = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background: ${props => props.bg};
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;

    h3 {
      margin: 0;
      font-size: 16px;
      color: #2c3e50;
      font-weight: 700;
    }

    .date {
      font-size: 12px;
      color: #95a5a6;
    }
  }

  .message {
    margin: 0;
    color: #34495e;
    font-size: 14px;
    line-height: 1.4;
  }
  
  .tags {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }
  
  .tag {
    font-size: 11px;
    padding: 2px 8px;
    background: #e3f2fd;
    color: #2196F3;
    border-radius: 10px;
    font-weight: 600;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background 0.2s;
    font-size: 16px;

    &.check { color: #4CAF50; &:hover { background: #E8F5E9; } }
    &.delete { color: #ef5350; &:hover { background: #FFEBEE; } }
  }

  @media (max-width: 768px) {
    flex-direction: row;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #95a5a6;

  svg {
    font-size: 60px;
    margin-bottom: 20px;
    opacity: 0.3;
  }

  p {
    font-size: 18px;
    margin: 0;
  }
`;

function Bildirimler() {
    const [bildirimler, setBildirimler] = useState([]);
    const [istatistikler, setIstatistikler] = useState(null);
    const [aktifFiltre, setAktifFiltre] = useState('hepsi');
    const [yukleniyor, setYukleniyor] = useState(true);

    const filtreler = [
        { id: 'hepsi', label: 'Tümü' },
        { id: 'okunmamis', label: 'Okunmamış' },
        { id: 'saglik', label: 'Sağlık' },
        { id: 'ureme', label: 'Doğum/Tohum' },
        { id: 'yem', label: 'Yem/Stok' },
        { id: 'sistem', label: 'Sistem' }
    ];

    useEffect(() => {
        veriYukle();
    }, []);

    const veriYukle = async () => {
        setYukleniyor(true);
        try {
            const [istRes, bildirimRes] = await Promise.all([
                api.getBildirimIstatistikleri(),
                api.getBildirimler({ limit: 100 }) // Daha fazla çekip front-end'de filtreleyebiliriz veya API destekliyorsa API filtrelemesi
            ]);
            setIstatistikler(istRes.data);
            setBildirimler(bildirimRes.data.bildirimler);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        } finally {
            setYukleniyor(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            if (action === 'okundu') {
                await api.bildirimOkunduIsaretle(id);
                setBildirimler(prev => prev.map(b => b._id === id ? { ...b, okundu: true } : b));
                // Istatistik güncellemek için basitçe state manipülasyonu
                setIstatistikler(prev => ({
                    ...prev,
                    okunmayan: Math.max(0, prev.okunmayan - 1),
                    tamamlanan: prev.tamamlanan + 1
                }));
            } else if (action === 'sil') {
                if (!window.confirm('Bildirimi silmek istiyor musunuz?')) return;
                await api.bildirimSil(id);
                setBildirimler(prev => prev.filter(b => b._id !== id));
            }
        } catch (error) {
            console.error('İşlem hatası:', error);
        }
    };

    const tumunuOkunduYap = async () => {
        try {
            await api.tumunuOkunduIsaretle();
            veriYukle(); // Yeniden çekmek en temizi
        } catch (error) {
            console.error('Toplu işlem hatası:', error);
        }
    };

    // Helper: İkon ve Stil Belirleme
    const getStyle = (tip) => {
        switch (tip) {
            case 'asi': return { icon: <FaSyringe />, color: '#E91E63', bg: '#FCE4EC' };
            case 'dogum': return { icon: <FaBaby />, color: '#9C27B0', bg: '#F3E5F5' };
            case 'muayene': return { icon: <FaStethoscope />, color: '#2196F3', bg: '#E3F2FD' };
            case 'yem': return { icon: <FaExclamationTriangle />, color: '#FF9800', bg: '#FFF3E0' };
            case 'tohumlama': return { icon: <FaInfoCircle />, color: '#673AB7', bg: '#EDE7F6' };
            default: return { icon: <FaBell />, color: '#4CAF50', bg: '#E8F5E9' };
        }
    };

    // Kategoriye göre filtreleme mantığı
    const filtrelenmisBildirimler = bildirimler.filter(b => {
        if (aktifFiltre === 'hepsi') return true;
        if (aktifFiltre === 'okunmamis') return !b.okundu;
        if (aktifFiltre === 'saglik') return ['asi', 'muayene', 'hastalik'].includes(b.tip);
        if (aktifFiltre === 'ureme') return ['dogum', 'tohumlama', 'kizginlik'].includes(b.tip);
        if (aktifFiltre === 'yem') return ['yem', 'stok'].includes(b.tip);
        if (aktifFiltre === 'sistem') return ['sistem', 'genel'].includes(b.tip);
        return true;
    });

    return (
        <PageContainer>
            <Header>
                <h1><FaBell /> Bildirimler</h1>
                <MarkAllButton onClick={tumunuOkunduYap}>
                    <FaCheckDouble /> <span>Tümünü Okundu Say</span>
                </MarkAllButton>
            </Header>

            {istatistikler && (
                <StatGrid>
                    <StatCard color="#FF9800">
                        <div className="label">Okunmamış</div>
                        <div className="value">{istatistikler.okunmayan}</div>
                    </StatCard>
                    <StatCard color="#f44336">
                        <div className="label">Geciken</div>
                        <div className="value">{istatistikler.geciken}</div>
                    </StatCard>
                    <StatCard color="#2196F3">
                        <div className="label">Toplam</div>
                        <div className="value">{istatistikler.toplam}</div>
                    </StatCard>
                </StatGrid>
            )}

            <TabContainer>
                {filtreler.map(f => (
                    <TabButton
                        key={f.id}
                        active={aktifFiltre === f.id}
                        onClick={() => setAktifFiltre(f.id)}
                    >
                        {f.label}
                    </TabButton>
                ))}
            </TabContainer>

            <NotificationList>
                {yukleniyor ? (
                    <EmptyState>Yükleniyor...</EmptyState>
                ) : filtrelenmisBildirimler.length === 0 ? (
                    <EmptyState>
                        <FaBell />
                        <p>Bu kategoride bildirim yok.</p>
                    </EmptyState>
                ) : (
                    filtrelenmisBildirimler.map(b => {
                        const style = getStyle(b.tip);
                        return (
                            <NotificationCard key={b._id} unread={!b.okundu} color={style.color}>
                                <IconWrapper bg={style.bg} color={style.color}>
                                    {style.icon}
                                </IconWrapper>

                                <Content>
                                    <div className="header">
                                        <h3>{b.baslik}</h3>
                                        <span className="date">{new Date(b.hatirlatmaTarihi).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                    <p className="message">{b.mesaj}</p>
                                    {b.kupe_no && (
                                        <div className="tags">
                                            <span className="tag">#{b.kupe_no}</span>
                                        </div>
                                    )}
                                </Content>

                                <ActionButtons>
                                    {!b.okundu && (
                                        <button className="check" onClick={() => handleAction(b._id, 'okundu')}>
                                            <FaCheck />
                                        </button>
                                    )}
                                    <button className="delete" onClick={() => handleAction(b._id, 'sil')}>
                                        <FaTrash />
                                    </button>
                                </ActionButtons>
                            </NotificationCard>
                        );
                    })
                )}
            </NotificationList>

        </PageContainer>
    );
}

export default Bildirimler;
