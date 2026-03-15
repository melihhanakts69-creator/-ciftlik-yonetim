import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import styled from 'styled-components';
import { FaArrowLeft, FaEdit, FaTrash, FaMars, FaVenus, FaArrowRight, FaMoneyBillWave } from 'react-icons/fa';
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
const TagBadge = styled.span`padding: 4px 12px; border-radius: 8px; font-size: 13px; font-weight: 700;`;
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

const BuzagiDetay = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [buzagi, setBuzagi] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
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
                toast.error('Buzağı bulunamadı!');
                navigate('/buzagilar');
            }
        } catch (error) {
            console.error('Detay hatası:', error);
            navigate('/buzagilar');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <DetailContainer>Yükleniyor...</DetailContainer>;
    if (!buzagi) return null;

    const yas = Math.floor((new Date() - new Date(buzagi.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
    const isDisi = buzagi.cinsiyet === 'disi';

    const handleGecisYap = async () => {
        if (!window.confirm(`Buzağıyı ${isDisi ? 'Düve' : 'Tosun'} olarak transfer etmek istiyor musunuz?`)) return;

        try {
            setLoading(true);
            const res = await api.buzagiGecisYap(id);
            toast.success(res.data.message);
            navigate(isDisi ? '/duveler' : '/tosunlar');
        } catch (error) {
            console.error('Geçiş hatası:', error);
            toast.error('Transfer başarısız: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleKilo = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.updateBuzagi(id, { ...buzagi, kilo: Number(kiloGuncel) });
            toast.success('Kilo güncellendi!');
            setShowKiloModal(false);
            fetchDetaylar();
        } catch (error) {
            toast.error('İşlem başarısız');
        } finally {
            setLoading(false);
        }
    };

    const openEdit = () => {
        setEditForm({
            isim: buzagi.isim || '',
            kupeNo: buzagi.kupeNo || '',
            kilo: buzagi.kilo || '',
            dogumTarihi: buzagi.dogumTarihi ? new Date(buzagi.dogumTarihi).toISOString().split('T')[0] : '',
            cinsiyet: buzagi.cinsiyet || 'disi',
            notlar: buzagi.notlar || ''
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.updateBuzagi(id, { ...editForm, kilo: parseFloat(editForm.kilo) || 0 });
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
        if (!window.confirm(`${buzagi.isim} adlı buzağıyı silmek istediğinize emin misiniz?`)) return;
        try {
            setLoading(true);
            await api.deleteBuzagi(id);
            toast.success('Buzağı silindi');
            navigate('/buzagilar');
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
                    <BackButton onClick={() => navigate('/buzagilar')}><FaArrowLeft /></BackButton>
                    <div>
                        <Title>
                            {buzagi.isim}
                            <TagBadge style={{ backgroundColor: isDisi ? '#E91E63' : '#2196F3' }}>
                                {buzagi.kupeNo}
                            </TagBadge>
                        </Title>
                        <Subtitle>Buzağı • {yas} Aylık</Subtitle>
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

            <DetailGrid>
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

                    {/* SAĞLIK GEÇMİŞİ */}
                    <SaglikGecmisi hayvanId={id} />
                </div>
                {/* SAĞ KOLON */}
                <SidePanel>
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
                </SidePanel>

            </DetailGrid>

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

            <SatisModal isOpen={showSatisModal} onClose={() => setShowSatisModal(false)} hayvan={{ ...buzagi, type: 'buzagi' }} onSuccess={() => navigate('/buzagilar')} />

            {showEditModal && (
                <EditModal title="✏️ Buzağı Bilgilerini Düzenle" onClose={() => setShowEditModal(false)} onSubmit={handleEditSubmit} loading={saving}>
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
                        <FormLabel>Cinsiyet</FormLabel>
                        <select value={editForm.cinsiyet || 'disi'} onChange={e => setEditForm({ ...editForm, cinsiyet: e.target.value })} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14 }}>
                            <option value="disi">Dişi</option>
                            <option value="erkek">Erkek</option>
                        </select>
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>Notlar</FormLabel>
                        <FormTextarea value={editForm.notlar || ''} onChange={e => setEditForm({ ...editForm, notlar: e.target.value })} />
                    </FormGroup>
                </EditModal>
            )}

        </DetailContainer>
    );
};

export default BuzagiDetay;
