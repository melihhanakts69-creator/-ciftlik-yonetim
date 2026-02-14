import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import styled from 'styled-components';
import { FaArrowLeft, FaEdit, FaTrash, FaSyringe, FaBaby, FaNotesMedical, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SatisModal from '../components/modals/SatisModal';
import SaglikGecmisi from '../components/Saglik/SaglikGecmisi';

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

const CowTitle = styled.h1`
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

const InekDetay = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [inek, setInek] = useState(null);
    const [sutGrafigi, setSutGrafigi] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showTohumlamaModal, setShowTohumlamaModal] = useState(false);
    const [showDogumModal, setShowDogumModal] = useState(false);
    const [showSatisModal, setShowSatisModal] = useState(false);

    // Form State
    const [tohumlamaTarihi, setTohumlamaTarihi] = useState(new Date().toISOString().split('T')[0]);
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
            const res = await api.getInek(id);
            const inekData = res.data;

            if (inekData) {
                setInek(inekData);

                // Süt Grafiği
                if (inekData.sutGecmisi && inekData.sutGecmisi.length > 0) {
                    const grafikData = inekData.sutGecmisi.map(kayit => ({
                        tarih: new Date(kayit.tarih).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
                        miktar: kayit.litre
                    }));
                    setSutGrafigi(grafikData);
                } else {
                    setSutGrafigi([]);
                }
            } else {
                alert('İnek bulunamadı!');
                navigate('/inekler');
            }
        } catch (error) {
            console.error('Detay hatası:', error);
            // alert('Bir hata oluştu'); // Opsiyonel
        } finally {
            setLoading(false);
        }
    };

    const handleTohumlama = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.inekTohumla(id, { tohumlamaTarihi });
            alert('Tohumlama başarıyla kaydedildi!');
            setShowTohumlamaModal(false);
            fetchDetaylar();
        } catch (error) {
            alert('İşlem başarısız: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDogum = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.inekDogurdu(id, { ...dogumForm, buzagiKilo: Number(dogumForm.buzagiKilo) });
            alert('Doğum başarıyla kaydedildi!');
            setShowDogumModal(false);
            fetchDetaylar();
        } catch (error) {
            alert('İşlem başarısız: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTohumlama = async () => {
        if (!window.confirm('Tohumlama kaydını silmek istediğinize emin misiniz?')) return;
        try {
            setLoading(true);
            await api.deleteInekTohumlama(id);
            alert('Tohumlama kaydı silindi');
            fetchDetaylar();
        } catch (error) {
            alert('Silme başarısız: ' + (error.response?.data?.message || error.message));
            setLoading(false);
        }
    };

    if (loading) return <Container>Yükleniyor...</Container>;
    if (!inek) return null;

    return (
        <Container>
            {/* --- HEADER --- */}
            <Header>
                <TitleSection>
                    <BackButton onClick={() => navigate('/inekler')}><FaArrowLeft /></BackButton>
                    <div>
                        <CowTitle>
                            {inek.isim}
                            <TagBadge>{inek.kupeNo}</TagBadge>
                        </CowTitle>
                        <div style={{ color: '#7f8c8d', marginTop: '5px' }}>
                            {inek.irk} • {inek.yas} Yaşında
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
                                    backgroundColor: inek.durum === 'Hasta' ? '#ffebee' : '#e8f5e9',
                                    color: inek.durum === 'Hasta' ? '#c62828' : '#2e7d32'
                                }}>
                                    {inek.durum || 'Sağlıklı'}
                                </StatusBadge>
                            </InfoItem>
                            <InfoItem>
                                <Label>Üreme Durumu</Label>
                                <StatusBadge style={{
                                    backgroundColor: inek.gebelikDurumu === 'Gebe' ? '#e1f5fe' : '#fff3e0',
                                    color: inek.gebelikDurumu === 'Gebe' ? '#0277bd' : '#ef6c00'
                                }}>
                                    {inek.gebelikDurumu || 'Boş'}
                                </StatusBadge>
                            </InfoItem>
                            <InfoItem>
                                <Label>Doğum Tarihi</Label>
                                <Value>{new Date(inek.dogumTarihi).toLocaleDateString()}</Value>
                            </InfoItem>
                            <InfoItem>
                                <Label>Son Buzağılama</Label>
                                <Value>{inek.sonBuzagilamaTarihi ? new Date(inek.sonBuzagilamaTarihi).toLocaleDateString() : '-'}</Value>
                            </InfoItem>
                            <InfoItem>
                                <Label>Kilo</Label>
                                <Value>{inek.kilo} kg</Value>
                            </InfoItem>
                        </InfoGrid>
                    </Card>

                    {/* SÜT GRAFİĞİ */}
                    <Card>
                        <CardTitle><FaChartLine /> Süt Verimi (Son 7 Gün)</CardTitle>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sutGrafigi}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                    <XAxis dataKey="tarih" stroke="#999" />
                                    <YAxis stroke="#999" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="miktar" stroke="#4CAF50" strokeWidth={3} dot={{ r: 4, fill: '#4CAF50' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>


                    {/* TOHUMLAMA BİLGİSİ - Varsa Göster */}
                    {inek?.tohumlamaTarihi && (
                        <Card style={{ marginTop: '25px' }}>
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
                                        {new Date(inek.tohumlamaTarihi).toLocaleDateString()}
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
                                        {inek.gebelikDurumu}
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
                                onClick={() => navigate('/saglik-merkezi')}
                                style={{ backgroundColor: '#e0f2f1', color: '#00695c', width: '100%', justifyContent: 'center' }}
                            >
                                <FaNotesMedical /> Sağlık Kaydı
                            </ActionButton>
                            <ActionButton
                                onClick={() => setShowDogumModal(true)}
                                style={{ backgroundColor: '#fce4ec', color: '#880e4f', width: '100%', justifyContent: 'center' }}
                            >
                                <FaBaby /> Doğum Kaydı
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
                            {inek.notlar || 'Henüz bir not eklenmemiş.'}
                        </p>
                    </Card>
                </div>
            </Grid>


            {/* TOHUMLAMA MODAL */}
            {
                showTohumlamaModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '400px', maxWidth: '90%' }}>
                            <h2>💉 Tohumlama Ekle</h2>
                            <form onSubmit={handleTohumlama}>
                                <div style={{ marginBottom: '15px' }}>
                                    <Label>Tarih</Label>
                                    <input
                                        type="date"
                                        required
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                        value={tohumlamaTarihi}
                                        onChange={e => setTohumlamaTarihi(e.target.value)}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <button type="button" onClick={() => setShowTohumlamaModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#f5f5f5' }}>İptal</button>
                                    <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#FF9800', color: 'white', fontWeight: 'bold' }}>Kaydet</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* DOĞUM MODAL */}
            {
                showDogumModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '400px', maxWidth: '90%' }}>
                            <h2>🎉 Doğum Kaydı</h2>
                            <form onSubmit={handleDogum}>
                                <div style={{ marginBottom: '15px' }}>
                                    <Label>Doğum Tarihi</Label>
                                    <input type="date" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={dogumForm.dogumTarihi} onChange={e => setDogumForm({ ...dogumForm, dogumTarihi: e.target.value })} />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <Label>Buzağı İsmi</Label>
                                    <input type="text" required placeholder="Buzağı İsmi" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={dogumForm.buzagiIsim} onChange={e => setDogumForm({ ...dogumForm, buzagiIsim: e.target.value })} />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <Label>Cinsiyet</Label>
                                    <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={dogumForm.buzagiCinsiyet} onChange={e => setDogumForm({ ...dogumForm, buzagiCinsiyet: e.target.value })}>
                                        <option value="disi">Dişi</option>
                                        <option value="erkek">Erkek</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <Label>Kilo (kg)</Label>
                                    <input type="number" required placeholder="Kilo" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={dogumForm.buzagiKilo} onChange={e => setDogumForm({ ...dogumForm, buzagiKilo: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <button type="button" onClick={() => setShowDogumModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#f5f5f5' }}>İptal</button>
                                    <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#E91E63', color: 'white', fontWeight: 'bold' }}>Kaydet</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }


            {/* SATIŞ MODAL */}
            <SatisModal
                isOpen={showSatisModal}
                onClose={() => setShowSatisModal(false)}
                hayvan={inek ? { ...inek, type: 'inek' } : null}
                onSuccess={() => {
                    fetchDetaylar();
                    // Satış başarılı olduğunda (örneğin hayvan durumu değiştiyse veya listeden çıktıysa)
                    // kullanıcıyı listeye yönlendirebiliriz veya detayları güncelleyebiliriz.
                    // Şimdilik detayları güncelliyoruz.
                }}
            />

        </Container >
    );
};

export default InekDetay;
