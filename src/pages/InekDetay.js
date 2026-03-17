import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import styled from 'styled-components';
import { FaArrowLeft, FaEdit, FaTrash, FaSyringe, FaBaby, FaNotesMedical, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SatisModal from '../components/modals/SatisModal';
import SaglikGecmisi from '../components/Saglik/SaglikGecmisi';
import { EditModal, FormGroup, FormLabel, FormInput, FormTextarea } from '../components/HayvanDetay/DetayModal';
import { toast } from 'react-toastify';

// --- STYLED COMPONENTS (standart pattern) ---
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
const BackButton = styled.button`
  background: #f1f5f9; border: none; width: 40px; height: 40px; border-radius: 10px;
  cursor: pointer; color: #475569; display: flex; align-items: center; justify-content: center;
  &:hover { background: #e2e8f0; }
`;
const CowTitle = styled.h1`
  margin: 0; font-size: 22px; font-weight: 800; color: #0f172a;
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
`;
const TagBadge = styled.span`
  background: #4CAF50; color: #fff; padding: 4px 12px; border-radius: 8px;
  font-size: 13px; font-weight: 700;
`;
const Subtitle = styled.div`font-size: 13px; color: #64748b; margin-top: 4px;`;
const ActionButtons = styled.div`display: flex; gap: 8px; margin-left: auto;`;
const ActionButton = styled.button`
  padding: 10px 18px; border: none; border-radius: 10px; cursor: pointer;
  font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 8px;
  transition: all 0.2s;
  &:hover { transform: translateY(-1px); }
`;
const QuickRow = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;
`;
const TabBar = styled.div`
  display: flex; gap: 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
  overflow-x: auto;
  scrollbar-width: none;
`;
const Tab = styled.button`
  padding: 10px 16px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: ${p => p.$active ? '600' : '500'};
  color: ${p => p.$active ? '#16a34a' : '#6b7280'};
  border-bottom: 2px solid ${p => p.$active ? '#16a34a' : 'transparent'};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
`;
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
const InfoGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px;
`;
const InfoItem = styled.div`
  padding: 12px 14px; background: #f8fafc; border-radius: 10px; border: 1px solid #f1f5f9;
`;
const Label = styled.span`font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 4px;`;
const Value = styled.span`font-size: 14px; color: #0f172a; font-weight: 600;`;
const StatusBadge = styled.span`
  padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; display: inline-block;
`;

const TimelineTab = ({ inekId }) => {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    api.getTimeline(inekId).then(r => setEvents(r.data || [])).catch(() => {});
  }, [inekId]);
  if (events.length === 0) return (
    <div style={{ textAlign: 'center', padding: '32px 20px', color: '#9ca3af', fontSize: 13 }}>
      Henüz kayıt yok
    </div>
  );
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

const InekDetay = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [inek, setInek] = useState(null);
    const [sutGrafigi, setSutGrafigi] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aktifSekme, setAktifSekme] = useState('genel');
    const [laktasyon, setLaktasyon] = useState(null);
    const [laktasyonYukleniyor, setLaktasyonYukleniyor] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
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

    const fetchLaktasyon = async () => {
        if (laktasyon) return;
        setLaktasyonYukleniyor(true);
        try {
            const res = await api.getInekLaktasyon(id);
            setLaktasyon(res.data);
        } catch (e) {
            console.error('Laktasyon verisi alınamadı', e);
        } finally {
            setLaktasyonYukleniyor(false);
        }
    };

    const fetchDetaylar = async () => {
        try {
            const res = await api.getInek(id);
            const inekData = res.data;

            if (inekData) {
                setInek(inekData);

                // Süt Grafiği
                if (inekData.sutGecmisi && inekData.sutGecmisi.length > 0) {
                    const grafikData = inekData.sutGecmisi
                        .slice(-7)
                        .map(kayit => ({
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
            toast.success('Tohumlama kaydı silindi');
            fetchDetaylar();
        } catch (error) {
            toast.error('Silme başarısız: ' + (error.response?.data?.message || error.message));
            setLoading(false);
        }
    };

    const openEdit = () => {
        setEditForm({
            isim: inek.isim || '',
            kupeNo: inek.kupeNo || '',
            kilo: inek.kilo || '',
            dogumTarihi: inek.dogumTarihi ? new Date(inek.dogumTarihi).toISOString().split('T')[0] : '',
            notlar: inek.notlar || '',
            gebelikDurumu: inek.gebelikDurumu || 'Belirsiz',
            tohumlamaTarihi: inek.tohumlamaTarihi ? new Date(inek.tohumlamaTarihi).toISOString().split('T')[0] : ''
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.updateInek(id, {
                ...editForm,
                kilo: parseFloat(editForm.kilo) || 0,
                tohumlamaTarihi: editForm.tohumlamaTarihi || null
            });
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
        if (!window.confirm(`${inek.isim} adlı ineği silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;
        try {
            setLoading(true);
            await api.deleteInek(id);
            toast.success('İnek silindi');
            navigate('/inekler');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Silme başarısız');
            setLoading(false);
        }
    };

    if (loading) return <DetailContainer>Yükleniyor...</DetailContainer>;
    if (!inek) return null;

    return (
        <DetailContainer>
            {/* --- HEADER --- */}
            <DetailHeader>
                <TitleSection>
                    <BackButton onClick={() => navigate('/inekler')}><FaArrowLeft /></BackButton>
                    <div>
                        <CowTitle>
                            {inek.isim}
                            <TagBadge>{inek.kupeNo}</TagBadge>
                        </CowTitle>
                        <Subtitle>{inek.irk || 'İnek'} • {inek.yas} Yaşında</Subtitle>
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
                <ActionButton onClick={() => setShowTohumlamaModal(true)} style={{ backgroundColor: '#fff3e0', color: '#e65100', flex: 1, minWidth: 110 }}>
                    <FaSyringe /> Tohumlama
                </ActionButton>
                <ActionButton onClick={() => navigate('/saglik-merkezi')} style={{ backgroundColor: '#e0f2f1', color: '#00695c', flex: 1, minWidth: 110 }}>
                    <FaNotesMedical /> Sağlık
                </ActionButton>
                <ActionButton onClick={() => setShowDogumModal(true)} style={{ backgroundColor: '#fce4ec', color: '#ad1457', flex: 1, minWidth: 110 }}>
                    <FaBaby /> Doğum
                </ActionButton>
                <ActionButton onClick={() => setShowSatisModal(true)} style={{ backgroundColor: '#f3e5f5', color: '#6a1b9a', flex: 1, minWidth: 110 }}>
                    <FaMoneyBillWave /> Satış
                </ActionButton>
            </QuickRow>

            <TabBar>
                {[
                    { key: 'genel', label: '📋 Genel' },
                    { key: 'laktasyon', label: '📈 Verim' },
                    { key: 'timeline', label: 'Geçmiş' },
                ].map(s => (
                    <Tab key={s.key} $active={aktifSekme === s.key} onClick={() => { setAktifSekme(s.key); if (s.key === 'laktasyon') fetchLaktasyon(); }}>
                        {s.label}
                    </Tab>
                ))}
            </TabBar>

            {aktifSekme === 'timeline' && (
                <Card>
                    <CardTitle>Geçmiş</CardTitle>
                    <TimelineTab inekId={id} />
                </Card>
            )}

            {/* LAKTASYON GRAFİĞİ SEKMESİ */}
            {aktifSekme === 'laktasyon' && (
                <div>
                    {/* 7 Günlük Süt Eğrisi - Veri bölümünde */}
                    {sutGrafigi.length > 0 && (
                        <Card style={{ marginBottom: 20 }}>
                            <CardTitle><FaChartLine style={{ color: '#4CAF50' }} /> Süt Verimi (Son 7 Gün)</CardTitle>
                            <div style={{ height: 220 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={sutGrafigi}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="tarih" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                                        <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                                        <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(v) => [`${v} L`, 'Süt']} />
                                        <Line type="monotone" dataKey="miktar" stroke="#4CAF50" strokeWidth={2.5} dot={{ r: 4, fill: '#4CAF50' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    )}
                    {laktasyonYukleniyor ? (
                        <Card><p style={{ textAlign: 'center', color: '#94a3b8' }}>Laktasyon verisi yükleniyor…</p></Card>
                    ) : laktasyon ? (
                        <>
                            {/* Özet Metrik Kartları */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
                                {[
                                    { label: 'Toplam Süt', val: `${laktasyon.ozet.toplamSut} L`, bg: '#E3F2FD', col: '#1976D2' },
                                    { label: 'Günlük Ortalama', val: `${laktasyon.ozet.ortalamaGunluk} L`, bg: '#E8F5E9', col: '#388E3C' },
                                    { label: 'Kayıtlı Gün', val: `${laktasyon.ozet.gunSayisi} gün`, bg: '#FFF3E0', col: '#EF6C00' },
                                    { label: 'Zirve Verimi', val: laktasyon.ozet.zirve ? `${laktasyon.ozet.zirve.litre} L` : '—', bg: '#F3E5F5', col: '#7B1FA2' },
                                ].map((k, i) => (
                                    <div key={i} style={{ background: 'white', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderLeft: `4px solid ${k.col}` }}>
                                        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{k.label}</div>
                                        <div style={{ fontSize: 22, fontWeight: 800, color: k.col }}>{k.val}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Gerçek Veri Grafiği */}
                            <Card>
                                <CardTitle><FaChartLine style={{ color: '#4CAF50' }} /> Günlük Süt Verimi (Son 305 Gün)</CardTitle>
                                {laktasyon.gercekVeri.length > 0 ? (
                                    <div style={{ height: 280 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={laktasyon.gercekVeri}>
                                                <defs>
                                                    <linearGradient id="sutGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.15} />
                                                        <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="tarih" stroke="#94a3b8" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                                                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                                                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                    formatter={(v) => [`${v} L`, 'Günlük Süt']} />
                                                <Area type="monotone" dataKey="litre" stroke="#4CAF50" strokeWidth={2.5} fill="url(#sutGrad)" dot={false} activeDot={{ r: 5 }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0' }}>Bu inek için henüz bireysel süt kaydı bulunmuyor.<br /><span style={{ fontSize: 13 }}>Toplu süt girişi yapılıyorsa bireysel kayıt oluşmaz.</span></p>
                                )}
                            </Card>

                            {/* Wood's Tahmin Eğrisi */}
                            <Card style={{ marginTop: 20 }}>
                                <CardTitle>📐 Wood's Laktasyon Tahmin Eğrisi</CardTitle>
                                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, marginTop: -10 }}>
                                    Türkiye büyükbaş ortalamalarına göre 305 günlük beklenen verim tahmini.
                                </p>
                                <div style={{ height: 240 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={laktasyon.woodTahmini.filter((_, i) => i % 5 === 0)}>
                                            <defs>
                                                <linearGradient id="woodGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="gun" stroke="#94a3b8" tick={{ fontSize: 11 }} label={{ value: 'Laktasyon Günü', position: 'insideBottom', offset: -5, fontSize: 11 }} />
                                            <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                                            <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                formatter={(v) => [`${v} L`, 'Beklenen Verim']} />
                                            <Area type="monotone" dataKey="tahminiLitre" stroke="#60a5fa" strokeWidth={2} fill="url(#woodGrad)" dot={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </>
                    ) : (
                        <Card><p style={{ textAlign: 'center', color: '#94a3b8' }}>Laktasyon verisi yüklenemedi.</p></Card>
                    )}
                </div>
            )}

            {/* GENEL BİLGİ SEKMESİ */}
            {aktifSekme === 'genel' && (
                <DetailGrid>
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
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: '#f1f8e9',
                                    borderRadius: '12px',
                                    flex: 1, minWidth: 120
                                }}>
                                    <Label>Tohumlama Tarihi</Label>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#33691e', marginTop: '5px' }}>
                                        {new Date(inek.tohumlamaTarihi).toLocaleDateString('tr-TR')}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: '#e3f2fd',
                                    borderRadius: '12px',
                                    flex: 1, minWidth: 120
                                }}>
                                    <Label>Gebelik Durumu</Label>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0d47a1', marginTop: '5px' }}>
                                        {inek.gebelikDurumu}
                                    </div>
                                </div>
                                {inek.gebelikDurumu === 'Gebe' && (() => {
                                    const tahmini = new Date(new Date(inek.tohumlamaTarihi).getTime() + 283 * 86400000);
                                    const kalanGun = Math.round((tahmini - new Date()) / 86400000);
                                    const renk = kalanGun < 0 ? '#b91c1c' : kalanGun <= 7 ? '#ea580c' : kalanGun <= 14 ? '#ca8a04' : '#15803d';
                                    const bg   = kalanGun < 0 ? '#fef2f2' : kalanGun <= 7 ? '#fff7ed' : kalanGun <= 14 ? '#fefce8' : '#f0fdf4';
                                    return (
                                        <div style={{ padding: '15px', backgroundColor: bg, borderRadius: '12px', flex: 1, minWidth: 120 }}>
                                            <Label>Beklenen Doğum</Label>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: renk, marginTop: '5px' }}>
                                                {tahmini.toLocaleDateString('tr-TR')}
                                            </div>
                                            <div style={{ fontSize: '12px', color: renk, fontWeight: 700, marginTop: 3 }}>
                                                {kalanGun < 0 ? `${Math.abs(kalanGun)} gün gecikti!` : kalanGun === 0 ? 'Bugün!' : `${kalanGun} gün kaldı`}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </Card>
                    )}

                    {/* SAĞLIK GEÇMİŞİ */}
                    <SaglikGecmisi hayvanId={id} />
                </div>

                {/* SAĞ KOLON */}
                <SidePanel>
                    {/* NOTLAR */}
                    <Card>
                        <CardTitle>📝 Notlar</CardTitle>
                        <p style={{ color: '#666', lineHeight: '1.5' }}>
                            {inek.notlar || 'Henüz bir not eklenmemiş.'}
                        </p>
                    </Card>
                </SidePanel>
            </DetailGrid>
            )}


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


            <SatisModal isOpen={showSatisModal} onClose={() => setShowSatisModal(false)} hayvan={inek ? { ...inek, type: 'inek' } : null} onSuccess={fetchDetaylar} />

            {showEditModal && (
                <EditModal title="✏️ İnek Bilgilerini Düzenle" onClose={() => setShowEditModal(false)} onSubmit={handleEditSubmit} loading={saving}>
                    <FormGroup>
                        <FormLabel>İsim *</FormLabel>
                        <FormInput value={editForm.isim || ''} onChange={e => setEditForm({ ...editForm, isim: e.target.value })} placeholder="İnek adı" required />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>Küpe No</FormLabel>
                        <FormInput value={editForm.kupeNo || ''} onChange={e => setEditForm({ ...editForm, kupeNo: e.target.value })} placeholder="Küpe numarası" />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>Doğum Tarihi</FormLabel>
                        <FormInput type="date" value={editForm.dogumTarihi || ''} onChange={e => setEditForm({ ...editForm, dogumTarihi: e.target.value })} />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>Kilo (kg)</FormLabel>
                        <FormInput type="number" step="0.1" value={editForm.kilo || ''} onChange={e => setEditForm({ ...editForm, kilo: e.target.value })} placeholder="0" />
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
                        <FormTextarea value={editForm.notlar || ''} onChange={e => setEditForm({ ...editForm, notlar: e.target.value })} placeholder="Ek notlar..." />
                    </FormGroup>
                </EditModal>
            )}

        </DetailContainer>
    );
};

export default InekDetay;
