import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import styled from 'styled-components';
import { FaArrowLeft, FaEdit, FaTrash, FaSyringe, FaBaby, FaNotesMedical, FaWeight, FaMoneyBillWave } from 'react-icons/fa';
import SatisModal from '../components/modals/SatisModal';
import SaglikGecmisi from '../components/Saglik/SaglikGecmisi';

// --- STYLED COMPONENTS (Shared with InekDetay ideally, but kept separate for speed) ---
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
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  margin-bottom: 20px;
  border: 1px solid #f1f5f9;

  @media (max-width: 768px) {
    padding: 18px;
    border-radius: 14px;
    margin-bottom: 16px;
  }
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
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 14px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;

  @media (max-width: 768px) {
    padding: 12px;
    min-height: 72px;
  }
`;

const Label = styled.span`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const Value = styled.span`
  font-size: 15px;
  color: #0f172a;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const StatusBadge = styled.span`
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  display: inline-block;
  text-align: center;

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

const DuveDetay = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [duve, setDuve] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modallar için State
    const [showDogumModal, setShowDogumModal] = useState(false);
    const [showTohumlamaModal, setShowTohumlamaModal] = useState(false);
    const [showKiloModal, setShowKiloModal] = useState(false);
    const [showSatisModal, setShowSatisModal] = useState(false);

    // Formlar
    const [tohumlamaTarihi, setTohumlamaTarihi] = useState(new Date().toISOString().split('T')[0]);
    const [kiloGuncel, setKiloGuncel] = useState('');
    const [dogumForm, setDogumForm] = useState({
        dogumTarihi: new Date().toISOString().split('T')[0],
        buzagiIsim: '',
        buzagiCinsiyet: 'disi',
        buzagiKilo: '',
        notlar: ''
    });

    useEffect(() => {
        fetchDetaylar();
    }, [id]);

    const fetchDetaylar = async () => {
        try {
            const res = await api.getDuve(id);
            if (res.data) {
                setDuve(res.data);
                setKiloGuncel(res.data.kilo); // Kilo state'ini güncelle
            } else {
                alert('Düve bulunamadı!');
                navigate('/duveler');
            }
        } catch (error) {
            console.error('Detay hatası:', error);
            navigate('/duveler');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Container>Yükleniyor...</Container>;
    if (!duve) return null;

    const yas = Math.floor((new Date() - new Date(duve.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));



    const handleDogumSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await api.duveDogurdu(id, {
                ...dogumForm,
                buzagiKilo: Number(dogumForm.buzagiKilo)
            });
            alert(res.data.message);
            // Başarılı olursa inekler sayfasına yönlendir (çünkü artık inek oldu)
            navigate('/inekler');
        } catch (error) {
            console.error('Doğum hatası:', error);
            alert('İşlem başarısız: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
            setShowDogumModal(false);
        }
    };

    const handleTohumlama = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.duveTohumla(id, { tohumlamaTarihi });
            alert('Tohumlama başarıyla kaydedildi!');
            setShowTohumlamaModal(false);
            fetchDetaylar();
        } catch (error) {
            alert('İşlem başarısız: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleKilo = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.updateDuve(id, { ...duve, kilo: Number(kiloGuncel) });
            alert('Kilo güncellendi!');
            setShowKiloModal(false);
            fetchDetaylar();
        } catch (error) {
            alert('İşlem başarısız');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTohumlama = async () => {
        if (!window.confirm('Tohumlama kaydını silmek istediğinize emin misiniz?')) return;
        try {
            setLoading(true);
            await api.deleteDuveTohumlama(id);
            alert('Tohumlama kaydı silindi');
            fetchDetaylar();
        } catch (error) {
            alert('Silme başarısız: ' + (error.response?.data?.message || error.message));
            setLoading(false);
        }
    };

    return (
        <Container>
            {/* --- HEADER --- */}
            <Header>
                <TitleSection>
                    <BackButton onClick={() => navigate('/duveler')}><FaArrowLeft /></BackButton>
                    <div>
                        <Title>
                            {duve.isim}
                            <TagBadge>{duve.kupeNo}</TagBadge>
                        </Title>
                        <div style={{ color: '#7f8c8d', marginTop: '5px' }}>
                            Düve • {yas} Aylık
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
                                <Label>Gebelik Durumu</Label>
                                <StatusBadge style={{
                                    backgroundColor: duve.gebelikDurumu === 'Gebe' ? '#E8F5E9' : '#FFF3E0',
                                    color: duve.gebelikDurumu === 'Gebe' ? '#2E7D32' : '#E65100'
                                }}>
                                    {duve.gebelikDurumu || 'Belirsiz'}
                                </StatusBadge>
                            </InfoItem>
                            <InfoItem>
                                <Label>Doğum Tarihi</Label>
                                <Value>{new Date(duve.dogumTarihi).toLocaleDateString()}</Value>
                            </InfoItem>
                            <InfoItem>
                                <Label>Beklenen Doğum</Label>
                                <Value>
                                    {duve.gebelikDurumu === 'Gebe' && duve.tohumlamaTarihi
                                        ? new Date(new Date(duve.tohumlamaTarihi).getTime() + 283 * 24 * 60 * 60 * 1000).toLocaleDateString()
                                        : '-'}
                                </Value>
                            </InfoItem>
                            <InfoItem>
                                <Label>Kilo</Label>
                                <Value>{duve.kilo} kg</Value>
                            </InfoItem>
                            <InfoItem>
                                <Label>Anne Küpe No</Label>
                                <Value>{duve.anneKupeNo || '-'}</Value>
                            </InfoItem>
                        </InfoGrid>
                    </Card>

                    {/* TOHUMLAMA BİLGİSİ */}
                    {duve.tohumlamaTarihi && (

                        <Card>
                            <CardTitle style={{ justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaSyringe /> Tohumlama Bilgisi
                                </div>
                                <button
                                    onClick={handleDeleteTohumlama}
                                    style={{
                                        border: 'none', background: '#ffebee', color: '#c62828',
                                        padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px'
                                    }}
                                >
                                    <FaTrash /> Sil
                                </button>
                            </CardTitle>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: '#f1f8e9',
                                    borderRadius: '12px',
                                    flex: 1
                                }}>
                                    <Label>Tohumlama Tarihi</Label>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#33691e', marginTop: '5px' }}>
                                        {new Date(duve.tohumlamaTarihi).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: '#e3f2fd',
                                    borderRadius: '12px',
                                    flex: 1
                                }}>
                                    <Label>Gebelik Kontrolü</Label>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0d47a1', marginTop: '5px' }}>
                                        {duve.gebelikDurumu}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* SAĞLIK GEÇMİŞİ */}
                    <SaglikGecmisi hayvanId={id} />
                </div>

                {/* SAĞ KOLON */}
                <div>
                    {/* HIZLI İŞLEMLER */}
                    <Card>
                        <CardTitle>⚡ Hızlı İşlemler</CardTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <ActionButton
                                onClick={() => setShowTohumlamaModal(true)}
                                style={{ backgroundColor: '#fff3e0', color: '#ef6c00', width: '100%', justifyContent: 'center' }}
                            >
                                <FaSyringe /> Tohumlama Ekle
                            </ActionButton>
                            <ActionButton
                                onClick={() => setShowKiloModal(true)}
                                style={{ backgroundColor: '#e0f2f1', color: '#00695c', width: '100%', justifyContent: 'center' }}
                            >
                                <FaWeight /> Kilo Güncelle
                            </ActionButton>
                            {/* Her zaman göster (test için), normalde gebeyse gösterilir */}
                            <ActionButton
                                onClick={() => setShowDogumModal(true)}
                                style={{ backgroundColor: '#fce4ec', color: '#880e4f', width: '100%', justifyContent: 'center' }}
                            >
                                <FaBaby /> Doğum Yaptı (İnek Ol)
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
                            {duve.notlar || 'Henüz bir not eklenmemiş.'}
                        </p>
                    </Card>
                </div>
            </Grid>

            {/* DOĞUM MODALI */}
            {showDogumModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '400px', maxWidth: '90%' }}>
                        <h2 style={{ marginTop: 0 }}>🎉 Doğum Kaydı</h2>
                        <form onSubmit={handleDogumSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <Label>Doğum Tarihi</Label>
                                <input
                                    type="date"
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    value={dogumForm.dogumTarihi}
                                    onChange={e => setDogumForm({ ...dogumForm, dogumTarihi: e.target.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <Label>Buzağı İsmi</Label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Örn: Sarıkız'ın buzağısı"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    value={dogumForm.buzagiIsim}
                                    onChange={e => setDogumForm({ ...dogumForm, buzagiIsim: e.target.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <Label>Cinsiyet</Label>
                                <select
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    value={dogumForm.buzagiCinsiyet}
                                    onChange={e => setDogumForm({ ...dogumForm, buzagiCinsiyet: e.target.value })}
                                >
                                    <option value="disi">Dişi</option>
                                    <option value="erkek">Erkek</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <Label>Doğum Kilosu (kg)</Label>
                                <input
                                    type="number"
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    value={dogumForm.buzagiKilo}
                                    onChange={e => setDogumForm({ ...dogumForm, buzagiKilo: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowDogumModal(false)}
                                    style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', background: '#f5f5f5', cursor: 'pointer' }}
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', background: '#E91E63', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            )
            }


            {/* TOHUMLAMA MODAL */}
            {
                showTohumlamaModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '400px' }}>
                            <h2>💉 Tohumlama Ekle</h2>
                            <form onSubmit={handleTohumlama}>
                                <div style={{ marginBottom: '15px' }}>
                                    <Label>Tarih</Label>
                                    <input type="date" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={tohumlamaTarihi} onChange={e => setTohumlamaTarihi(e.target.value)} />
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="button" onClick={() => setShowTohumlamaModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#f5f5f5' }}>İptal</button>
                                    <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#FF9800', color: 'white', fontWeight: 'bold' }}>Kaydet</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

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
                hayvan={{ ...duve, type: 'duve' }}
                onSuccess={() => navigate('/duveler')}
            />

        </Container >
    );
};

export default DuveDetay;
