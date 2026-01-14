import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import styled from 'styled-components';
import { FaArrowLeft, FaEdit, FaTrash, FaMars, FaVenus, FaArrowRight, FaMoneyBillWave } from 'react-icons/fa';
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
  background-color: #FF9800;
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

const BuzagiDetay = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [buzagi, setBuzagi] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showKiloModal, setShowKiloModal] = useState(false);
    const [kiloGuncel, setKiloGuncel] = useState('');
    const [showSatisModal, setShowSatisModal] = useState(false);

    useEffect(() => {
        fetchDetaylar();
    }, [id]);

    const fetchDetaylar = async () => {
        try {
            const res = await api.getBuzagi(id);
            if (res.data) {
                setBuzagi(res.data);
                setKiloGuncel(res.data.kilo || '');
            } else {
                alert('Buzağı bulunamadı!');
                navigate('/buzagilar');
            }
        } catch (error) {
            console.error('Detay hatası:', error);
            navigate('/buzagilar');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Container>Yükleniyor...</Container>;
    if (!buzagi) return null;

    const yas = Math.floor((new Date() - new Date(buzagi.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
    const isDisi = buzagi.cinsiyet === 'disi';

    const handleGecisYap = async () => {
        if (!window.confirm(`Buzağıyı ${isDisi ? 'Düve' : 'Tosun'} olarak transfer etmek istiyor musunuz?`)) return;

        try {
            setLoading(true);
            const res = await api.buzagiGecisYap(id);
            alert(res.data.message);
            navigate(isDisi ? '/duveler' : '/tosunlar');
        } catch (error) {
            console.error('Geçiş hatası:', error);
            alert('Transfer başarısız: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleKilo = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.updateBuzagi(id, { ...buzagi, kilo: Number(kiloGuncel) });
            alert('Kilo güncellendi!');
            setShowKiloModal(false);
            fetchDetaylar();
        } catch (error) {
            alert('İşlem başarısız');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            {/* --- HEADER --- */}
            <Header>
                <TitleSection>
                    <BackButton onClick={() => navigate('/buzagilar')}><FaArrowLeft /></BackButton>
                    <div>
                        <Title>
                            {buzagi.isim}
                            <TagBadge style={{ backgroundColor: isDisi ? '#E91E63' : '#2196F3' }}>
                                {buzagi.kupeNo}
                            </TagBadge>
                        </Title>
                        <div style={{ color: '#7f8c8d', marginTop: '5px' }}>
                            Buzağı • {yas} Aylık
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
                                <Label>Cinsiyet</Label>
                                <StatusBadge style={{
                                    backgroundColor: isDisi ? '#fce4ec' : '#e3f2fd',
                                    color: isDisi ? '#880e4f' : '#0d47a1'
                                }}>
                                    {isDisi ? <><FaVenus /> Dişi</> : <><FaMars /> Erkek</>}
                                </StatusBadge>
                            </InfoItem>
                            <InfoItem>
                                <Label>Doğum Tarihi</Label>
                                <Value>{new Date(buzagi.dogumTarihi).toLocaleDateString()}</Value>
                            </InfoItem>
                            <InfoItem>
                                <Label>Kilo</Label>
                                <Value>{buzagi.kilo || '-'} kg</Value>
                            </InfoItem>
                            <InfoItem>
                                <Label>Anne Bilgisi</Label>
                                <Value>{buzagi.anneKupeNo || 'Bilinmiyor'}</Value>
                            </InfoItem>
                        </InfoGrid>
                    </Card>

                    {/* BESLENME */}
                    <Card>
                        <CardTitle>🍼 Beslenme Durumu</CardTitle>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{
                                flex: 1, padding: '15px', borderRadius: '12px',
                                backgroundColor: yas < 3 ? '#e8f5e9' : '#fafafa',
                                border: yas < 3 ? '2px solid #4caf50' : '1px solid #ddd'
                            }}>
                                <strong>Süt Dönemi</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '13px' }}>0-3 Ay</p>
                            </div>
                            <div style={{
                                flex: 1, padding: '15px', borderRadius: '12px',
                                backgroundColor: yas >= 3 ? '#e8f5e9' : '#fafafa',
                                border: yas >= 3 ? '2px solid #4caf50' : '1px solid #ddd'
                            }}>
                                <strong>Yem Dönemi</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '13px' }}>3+ Ay</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* SAĞ KOLON */}
                <div>
                    {/* HIZLI İŞLEMLER */}
                    <Card>
                        <CardTitle>⚡ Hızlı İşlemler</CardTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {yas >= 0 && (
                                <ActionButton
                                    onClick={handleGecisYap}
                                    style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', width: '100%', justifyContent: 'center' }}
                                >
                                    <FaArrowRight /> {isDisi ? 'Düveye' : 'Tosuna'} Transfer
                                </ActionButton>
                            )}
                            <ActionButton
                                onClick={() => setShowKiloModal(true)}
                                style={{ backgroundColor: '#fff3e0', color: '#ef6c00', width: '100%', justifyContent: 'center' }}
                            >
                                <FaEdit /> Kilo Güncelle
                            </ActionButton>
                            <ActionButton
                                onClick={() => setShowSatisModal(true)}
                                style={{ backgroundColor: '#f3e5f5', color: '#7b1fa2', width: '100%', justifyContent: 'center' }}
                            >
                                <FaMoneyBillWave /> Satış Yap
                            </ActionButton>
                        </div>
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
                hayvan={{ ...buzagi, type: 'buzagi' }}
                onSuccess={() => navigate('/buzagilar')}
            />

        </Container >
    );
};

export default BuzagiDetay;
