import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import styled from 'styled-components';
import { FaArrowLeft, FaEdit, FaTrash, FaWeight, FaMoneyBillWave } from 'react-icons/fa';
import SatisModal from '../components/modals/SatisModal';

// --- STYLED COMPONENTS ---
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    padding: 15px;
  }
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    gap: 10px;
    flex-wrap: wrap;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 10px;
  border-radius: 50%;
  &:hover { background-color: #f0f0f0; }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 15px;

  @media (max-width: 768px) {
    font-size: 24px;
    flex-wrap: wrap;
    gap: 10px;
  }
`;

const TagBadge = styled.span`
  background-color: #795548;
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s;
  
  &:hover { transform: translateY(-2px); }

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  margin-bottom: 25px;
`;

const CardTitle = styled.h3`
  margin: 0 0 20px 0;
  color: #34495e;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.span`
  font-size: 13px;
  color: #7f8c8d;
  margin-bottom: 5px;
  font-weight: 600;
`;

const Value = styled.span`
  font-size: 16px;
  color: #2c3e50;
  font-weight: 500;
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
  display: inline-block;
  text-align: center;
`;

const TosunDetay = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [tosun, setTosun] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showKiloModal, setShowKiloModal] = useState(false);
    const [kiloGuncel, setKiloGuncel] = useState('');
    const [showSatisModal, setShowSatisModal] = useState(false);

    useEffect(() => {
        fetchDetaylar();
    }, [id]);

    const fetchDetaylar = async () => {
        try {
            const res = await api.getTosun(id);
            if (res.data) {
                setTosun(res.data);
                setKiloGuncel(res.data.kilo || '');
            } else {
                alert('Tosun bulunamadı!');
                navigate('/tosunlar');
            }
        } catch (error) {
            console.error('Detay hatası:', error);
            navigate('/tosunlar');
        } finally {
            setLoading(false);
        }
    };

    const handleKilo = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.updateTosun(id, { ...tosun, kilo: Number(kiloGuncel) });
            alert('Kilo güncellendi!');
            setShowKiloModal(false);
            fetchDetaylar();
        } catch (error) {
            alert('İşlem başarısız');
        } finally {
            setLoading(false);
        }
    };

    // Satış logic henüz tam değil, placeholder
    const handleSatis = () => {
        alert('Satış modülü yakında eklenecek!');
    };

    if (loading) return <Container>Yükleniyor...</Container>;
    if (!tosun) return null;

    const yas = Math.floor((new Date() - new Date(tosun.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));

    return (
        <Container>
            {/* --- HEADER --- */}
            <Header>
                <TitleSection>
                    <BackButton onClick={() => navigate('/tosunlar')}><FaArrowLeft /></BackButton>
                    <div>
                        <Title>
                            {tosun.isim}
                            <TagBadge>{tosun.kupeNo}</TagBadge>
                        </Title>
                        <div style={{ color: '#7f8c8d', marginTop: '5px' }}>
                            Tosun • {yas} Aylık
                        </div>
                    </div>
                </TitleSection>

                <ActionButtons>
                    <ActionButton style={{ backgroundColor: '#E3F2FD', color: '#2196F3' }}>
                        <FaEdit /> Düzenle
                    </ActionButton>
                    <ActionButton style={{ backgroundColor: '#FFEBEE', color: '#D32F2F' }}>
                        <FaTrash /> Sil
                    </ActionButton>
                </ActionButtons>
            </Header>

            <Grid>
                {/* SOL KOLON */}
                <div>
                    {/* TEMEL BİLGİLER */}
                    <Card>
                        <CardTitle>📋 Temel Bilgiler</CardTitle>
                        <InfoGrid>
                            <InfoItem>
                                <Label>Durum</Label>
                                <StatusBadge style={{
                                    backgroundColor: '#efebe9',
                                    color: '#5d4037'
                                }}>
                                    Besi
                                </StatusBadge>
                            </InfoItem>
                            <InfoItem>
                                <Label>Doğum Tarihi</Label>
                                <Value>{new Date(tosun.dogumTarihi).toLocaleDateString()}</Value>
                            </InfoItem>
                            <InfoItem>
                                <Label>Kilo</Label>
                                <Value>{tosun.kilo || '-'} kg</Value>
                            </InfoItem>
                            <InfoItem>
                                <Label>Tahmini Değer</Label>
                                <Value>{tosun.kilo ? `${tosun.kilo * 220} ₺` : '-'}</Value>
                            </InfoItem>
                        </InfoGrid>
                    </Card>

                    {/* EKSTRA BİLGİLER */}
                    <Card>
                        <CardTitle>🔍 Besi Takibi</CardTitle>
                        <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                            Kilo artış grafiği yakında burada olacak...
                        </div>
                    </Card>
                </div>

                {/* SAĞ KOLON */}
                <div>
                    {/* HIZLI İŞLEMLER */}
                    <Card>
                        <CardTitle>⚡ Hızlı İşlemler</CardTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <ActionButton
                                onClick={() => setShowKiloModal(true)}
                                style={{ backgroundColor: '#e0f2f1', color: '#00695c', width: '100%', justifyContent: 'center' }}
                            >
                                <FaWeight /> Kilo Güncelle
                            </ActionButton>
                            <ActionButton
                                onClick={() => setShowSatisModal(true)}
                                style={{ backgroundColor: '#f3e5f5', color: '#7b1fa2', width: '100%', justifyContent: 'center' }}
                            >
                                <FaMoneyBillWave /> Satış Yap
                            </ActionButton>
                        </div>
                    </Card>

                    {/* NOTLAR */}
                    <Card>
                        <CardTitle>📝 Notlar</CardTitle>
                        <p style={{ color: '#666', lineHeight: '1.5' }}>
                            {tosun.not || 'Henüz bir not eklenmemiş.'}
                        </p>
                    </Card>
                </div>

            </Grid>

            {/* KİLO MODAL */}
            {
                showKiloModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '400px' }}>
                            <h2>⚖️ Kilo Güncelle</h2>
                            <form onSubmit={handleKilo}>
                                <div style={{ marginBottom: '15px' }}>
                                    <Label>Yeni Kilo (kg)</Label>
                                    <input type="number" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={kiloGuncel} onChange={e => setKiloGuncel(e.target.value)} />
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="button" onClick={() => setShowKiloModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#f5f5f5' }}>İptal</button>
                                    <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#009688', color: 'white', fontWeight: 'bold' }}>Güncelle</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            <SatisModal
                isOpen={showSatisModal}
                onClose={() => setShowSatisModal(false)}
                hayvan={{ ...tosun, type: 'tosun' }}
                onSuccess={() => navigate('/tosunlar')}
            />

        </Container >
    );
};

export default TosunDetay;
