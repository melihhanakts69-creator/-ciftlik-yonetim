import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import styled from 'styled-components';
import { FaArrowLeft, FaEdit, FaTrash, FaSyringe, FaBaby, FaWeight, FaMoneyBillWave } from 'react-icons/fa';
import SatisModal from '../components/modals/SatisModal';
import SaglikGecmisi from '../components/Saglik/SaglikGecmisi';
import { EditModal, FormGroup, FormLabel, FormInput, FormTextarea } from '../components/HayvanDetay/DetayModal';
import { toast } from 'react-toastify';

const DetailContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px 40px;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 0 12px 80px;
  }
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const TitleSection = styled.div`display: flex; align-items: center; gap: 12px;`;
const BackButton = styled.button`background: #f1f5f9; border: none; width: 40px; height: 40px; border-radius: 10px; cursor: pointer; color: #475569; display: flex; align-items: center; justify-content: center; &:hover { background: #e2e8f0; }`;
const Title = styled.h1`margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;`;
const TagBadge = styled.span`background: #9C27B0; color: #fff; padding: 4px 12px; border-radius: 8px; font-size: 13px; font-weight: 700;`;
const Subtitle = styled.div`font-size: 13px; color: #64748b; margin-top: 4px;`;
const ActionButtons = styled.div`display: flex; gap: 8px; margin-left: auto;`;
const ActionButton = styled.button`padding: 10px 18px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 8px; transition: all 0.2s; &:hover { transform: translateY(-1px); }`;
const QuickRow = styled.div`display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;`;
const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
  align-items: flex-start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;
const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 18px 20px;
  margin-bottom: 16px;
`;
const CardTitle = styled.h3`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 14px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #f3f4f6;
`;
const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: sticky;
  top: 70px;
`;
const InfoGrid = styled.div`display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px;`;
const InfoItem = styled.div`padding: 12px 14px; background: #f8fafc; border-radius: 10px; border: 1px solid #f1f5f9;`;
const Label = styled.span`font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 4px;`;
const Value = styled.span`font-size: 14px; color: #0f172a; font-weight: 600;`;
const StatusBadge = styled.span`padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; display: inline-block;`;
const TabBar = styled.div`display: flex; gap: 0; border-bottom: 1px solid #e5e7eb; margin-bottom: 20px; overflow-x: auto; scrollbar-width: none;`;
const Tab = styled.button`
  padding: 10px 16px; border: none; background: transparent; font-size: 13px;
  font-weight: ${p => p.$active ? '600' : '500'}; color: ${p => p.$active ? '#16a34a' : '#6b7280'};
  border-bottom: 2px solid ${p => p.$active ? '#16a34a' : 'transparent'}; cursor: pointer; white-space: nowrap; transition: all 0.15s;
`;

const TimelineTab = ({ hayvanId }) => {
  const [events, setEvents] = useState([]);
  useEffect(() => { api.getTimeline(hayvanId).then(r => setEvents(r.data || [])).catch(() => {}); }, [hayvanId]);
  if (events.length === 0) return <div style={{ textAlign: 'center', padding: '32px 20px', color: '#9ca3af', fontSize: 13 }}>Henüz kayıt yok</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {events.map((ev, i) => (
        <div key={ev._id} style={{ display: 'flex', gap: 12, paddingBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: ev.tip === 'dogum' ? '#16a34a' : ev.tip === 'saglik' ? '#ef4444' : ev.tip === 'tohumlama' ? '#8b5cf6' : '#3b82f6', flexShrink: 0 }} />
            {i < events.length - 1 && <div style={{ width: 1, flex: 1, background: '#e5e7eb', marginTop: 4 }} />}
          </div>
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{ev.baslik || ev.tip}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{ev.tarih ? new Date(ev.tarih).toLocaleDateString('tr-TR') : ''}</div>
            {ev.aciklama && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{ev.aciklama}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

const DuveDetay = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [duve, setDuve] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aktifSekme, setAktifSekme] = useState('genel');

    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
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

    if (loading) return <DetailContainer>Yükleniyor...</DetailContainer>;
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
            toast.success('Tohumlama kaydı silindi');
            fetchDetaylar();
        } catch (error) {
            toast.error('Silme başarısız: ' + (error.response?.data?.message || error.message));
            setLoading(false);
        }
    };

    const openEdit = () => {
        setEditForm({
            isim: duve.isim || '',
            kupeNo: duve.kupeNo || '',
            kilo: duve.kilo || '',
            dogumTarihi: duve.dogumTarihi ? new Date(duve.dogumTarihi).toISOString().split('T')[0] : '',
            notlar: duve.notlar || duve.not || '',
            gebelikDurumu: duve.gebelikDurumu || 'Belirsiz',
            tohumlamaTarihi: duve.tohumlamaTarihi ? new Date(duve.tohumlamaTarihi).toISOString().split('T')[0] : ''
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.updateDuve(id, { ...editForm, kilo: parseFloat(editForm.kilo) || 0, tohumlamaTarihi: editForm.tohumlamaTarihi || null });
            toast.success('Bilgiler güncellendi');
            setShowEditModal(false);
            fetchDetaylar();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Güncelleme başarısız');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`${duve.isim} adlı düveyi silmek istediğinize emin misiniz?`)) return;
        try {
            setLoading(true);
            await api.deleteDuve(id);
            toast.success('Düve silindi');
            navigate('/duveler');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Silme başarısız');
            setLoading(false);
        }
    };

    return (
        <DetailContainer>
            {/* --- HEADER --- */}
            <DetailHeader>
                <TitleSection>
                    <BackButton onClick={() => navigate('/duveler')}><FaArrowLeft /></BackButton>
                    <div>
                        <Title>
                            {duve.isim}
                            <TagBadge>{duve.kupeNo}</TagBadge>
                        </Title>
                        <Subtitle>Düve • {yas} Aylık</Subtitle>
                    </div>
                </TitleSection>

                <ActionButtons>
                    <ActionButton onClick={openEdit} style={{ backgroundColor: '#E3F2FD', color: '#1976D2' }}>
                        <FaEdit /> Düzenle
                    </ActionButton>
                    <ActionButton onClick={handleDelete} style={{ backgroundColor: '#FFEBEE', color: '#C62828' }}>
                        <FaTrash /> Sil
                    </ActionButton>
                </ActionButtons>
            </DetailHeader>

            <QuickRow>
                <ActionButton onClick={() => setShowTohumlamaModal(true)} style={{ backgroundColor: '#fff3e0', color: '#e65100', flex: 1, minWidth: 110 }}><FaSyringe /> Tohumlama</ActionButton>
                <ActionButton onClick={() => setShowKiloModal(true)} style={{ backgroundColor: '#e0f2f1', color: '#00695c', flex: 1, minWidth: 110 }}><FaWeight /> Kilo</ActionButton>
                <ActionButton onClick={() => setShowDogumModal(true)} style={{ backgroundColor: '#fce4ec', color: '#ad1457', flex: 1, minWidth: 110 }}><FaBaby /> Doğum</ActionButton>
                <ActionButton onClick={() => setShowSatisModal(true)} style={{ backgroundColor: '#f3e5f5', color: '#6a1b9a', flex: 1, minWidth: 110 }}><FaMoneyBillWave /> Satış</ActionButton>
            </QuickRow>

            <DetailGrid>
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

                </div>

                {/* SAĞ KOLON */}
                <SidePanel>
                    <Card>
                        <CardTitle>📝 Notlar</CardTitle>
                        <p style={{ color: '#666', lineHeight: '1.5' }}>
                            {duve.notlar || 'Henüz bir not eklenmemiş.'}
                        </p>
                    </Card>
                </SidePanel>
            </DetailGrid>
            )}

            {aktifSekme === 'saglik' && (
                <Card>
                    <CardTitle>🏥 Sağlık Geçmişi</CardTitle>
                    <SaglikGecmisi hayvanId={id} />
                </Card>
            )}

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

            <SatisModal isOpen={showSatisModal} onClose={() => setShowSatisModal(false)} hayvan={{ ...duve, type: 'duve' }} onSuccess={() => navigate('/duveler')} />

            {showEditModal && (
                <EditModal title="✏️ Düve Bilgilerini Düzenle" onClose={() => setShowEditModal(false)} onSubmit={handleEditSubmit} loading={saving}>
                    <FormGroup>
                        <FormLabel>İsim *</FormLabel>
                        <FormInput value={editForm.isim || ''} onChange={e => setEditForm({ ...editForm, isim: e.target.value })} required />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>Küpe No</FormLabel>
                        <FormInput value={editForm.kupeNo || ''} onChange={e => setEditForm({ ...editForm, kupeNo: e.target.value })} />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>Doğum Tarihi</FormLabel>
                        <FormInput type="date" value={editForm.dogumTarihi || ''} onChange={e => setEditForm({ ...editForm, dogumTarihi: e.target.value })} />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>Kilo (kg)</FormLabel>
                        <FormInput type="number" step="0.1" value={editForm.kilo || ''} onChange={e => setEditForm({ ...editForm, kilo: e.target.value })} />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>Gebelik Durumu</FormLabel>
                        <select value={editForm.gebelikDurumu || 'Belirsiz'} onChange={e => setEditForm({ ...editForm, gebelikDurumu: e.target.value })} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14 }}>
                            <option value="Belirsiz">Belirsiz</option>
                            <option value="Gebe">Gebe</option>
                            <option value="Boş">Boş</option>
                        </select>
                    </FormGroup>
                    {editForm.gebelikDurumu === 'Gebe' && (
                        <FormGroup>
                            <FormLabel>Tohumlama Tarihi</FormLabel>
                            <FormInput type="date" value={editForm.tohumlamaTarihi || ''} onChange={e => setEditForm({ ...editForm, tohumlamaTarihi: e.target.value })} />
                        </FormGroup>
                    )}
                    <FormGroup>
                        <FormLabel>Notlar</FormLabel>
                        <FormTextarea value={editForm.notlar || ''} onChange={e => setEditForm({ ...editForm, notlar: e.target.value })} />
                    </FormGroup>
                </EditModal>
            )}

        </DetailContainer>
    );
};

export default DuveDetay;
