import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    FaHeartbeat, FaSyringe, FaStethoscope, FaPills, FaPlus,
    FaFilter, FaTrash, FaEdit, FaTimes, FaExclamationTriangle,
    FaCheckCircle, FaCalendarAlt, FaClock, FaMoneyBillWave,
    FaCut, FaBaby, FaSearch
} from 'react-icons/fa';
import { GiCow } from 'react-icons/gi';
import { toast } from 'react-toastify';
import * as api from '../services/api';

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// --- Styled Components ---
const PageContainer = styled.div`
  padding: 24px;
  background: #f4f7f6;
  min-height: 100vh;
  padding-bottom: 80px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  animation: ${fadeIn} 0.4s ease;

  h1 {
    font-size: 28px;
    font-weight: 800;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;

    svg { color: #e91e63; }
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #e91e63, #c2185b);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(233, 30, 99, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(233, 30, 99, 0.4);
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
  animation: ${fadeIn} 0.5s ease;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s;
  border-bottom: 3px solid ${props => props.color};

  &:hover { transform: translateY(-3px); }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 14px;
  background: ${props => props.bg};
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
`;

const StatInfo = styled.div`
  .value {
    font-size: 28px;
    font-weight: 800;
    color: #2c3e50;
  }
  .label {
    font-size: 13px;
    color: #7f8c8d;
    font-weight: 500;
  }
`;

const TabBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 4px;
  animation: ${fadeIn} 0.6s ease;

  &::-webkit-scrollbar { display: none; }
`;

const Tab = styled.button`
  padding: 10px 20px;
  background: ${props => props.active ? 'linear-gradient(135deg, #e91e63, #c2185b)' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border: 1px solid ${props => props.active ? 'transparent' : '#e0e0e0'};
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  transition: all 0.3s;
  box-shadow: ${props => props.active ? '0 4px 12px rgba(233,30,99,0.3)' : 'none'};

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #c2185b, #ad1457)' : '#fce4ec'};
    color: ${props => props.active ? 'white' : '#e91e63'};
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterSelect = styled.select`
  padding: 8px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 13px;
  background: white;
  color: #555;
  cursor: pointer;
  font-weight: 500;

  &:focus {
    outline: none;
    border-color: #e91e63;
  }
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: ${fadeIn} 0.7s ease;
`;

const RecordCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  display: flex;
  gap: 16px;
  transition: all 0.2s;
  border-left: 5px solid ${props => props.color};

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }
`;

const RecordIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.bg};
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
`;

const RecordContent = styled.div`
  flex: 1;

  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 6px;
  }

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #2c3e50;
  }

  .hayvan-info {
    font-size: 13px;
    color: #7f8c8d;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .detail-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .detail {
    font-size: 12px;
    color: #95a5a6;
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  background: ${props => props.bg};
  color: ${props => props.color};
  white-space: nowrap;
`;

const ActionBtns = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  align-self: flex-start;

  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s;

    &.edit { color: #2196F3; &:hover { background: #e3f2fd; } }
    &.delete { color: #f44336; &:hover { background: #ffebee; } }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #bdc3c7;
  animation: ${fadeIn} 0.5s ease;

  svg { font-size: 60px; margin-bottom: 16px; opacity: 0.3; }
  p { font-size: 16px; margin: 0; }
`;

// --- MODAL ---
const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.2s ease;
`;

const ModalBox = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  width: 90%;
  max-width: 560px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0,0,0,0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  button {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #999;
    padding: 4px;
    &:hover { color: #333; }
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;

  label {
    display: block;
    font-weight: 600;
    font-size: 13px;
    color: #444;
    margin-bottom: 6px;
  }

  input, select, textarea {
    width: 100%;
    padding: 12px 14px;
    border: 2px solid #e8e8e8;
    border-radius: 10px;
    font-size: 14px;
    transition: border-color 0.3s;
    box-sizing: border-box;
    background: #fafafa;

    &:focus {
      outline: none;
      border-color: #e91e63;
      background: white;
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #e91e63, #c2185b);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(233,30,99,0.4);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

// --- HELPERS ---
const getTipStyle = (tip) => {
    switch (tip) {
        case 'hastalik': return { icon: <FaHeartbeat />, color: '#f44336', bg: '#ffebee', label: 'Hastalık' };
        case 'tedavi': return { icon: <FaPills />, color: '#FF9800', bg: '#FFF3E0', label: 'Tedavi' };
        case 'asi': return { icon: <FaSyringe />, color: '#9C27B0', bg: '#F3E5F5', label: 'Aşı' };
        case 'muayene': return { icon: <FaStethoscope />, color: '#2196F3', bg: '#E3F2FD', label: 'Muayene' };
        case 'ameliyat': return { icon: <FaCut />, color: '#E91E63', bg: '#FCE4EC', label: 'Ameliyat' };
        case 'dogum_komplikasyonu': return { icon: <FaBaby />, color: '#795548', bg: '#EFEBE9', label: 'Doğum Komp.' };
        default: return { icon: <FaHeartbeat />, color: '#607D8B', bg: '#ECEFF1', label: 'Diğer' };
    }
};

const getDurumBadge = (durum) => {
    switch (durum) {
        case 'devam_ediyor': return { bg: '#FFF3E0', color: '#E65100', label: '⏳ Devam Ediyor' };
        case 'iyilesti': return { bg: '#E8F5E9', color: '#2E7D32', label: '✅ İyileşti' };
        case 'kronik': return { bg: '#FFF9C4', color: '#F57F17', label: '🔄 Kronik' };
        case 'oldu': return { bg: '#FFEBEE', color: '#C62828', label: '❌ Öldü' };
        default: return { bg: '#ECEFF1', color: '#455A64', label: durum };
    }
};

const hayvanTipiLabel = {
    inek: '🐄 İnek',
    duve: '🐮 Düve',
    buzagi: '🐂 Buzağı',
    tosun: '🐃 Tosun'
};

// =====================
//  COMPONENT
// =====================
function SaglikMerkezi() {
    const [aktifTab, setAktifTab] = useState('kayitlar');
    const [kayitlar, setKayitlar] = useState([]);
    const [asilar, setAsilar] = useState([]);
    const [istatistikler, setIstatistikler] = useState(null);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [modalAcik, setModalAcik] = useState(false);
    const [modalTip, setModalTip] = useState('saglik'); // 'saglik' veya 'asi'
    const [filtreTip, setFiltreTip] = useState('');
    const [filtreDurum, setFiltreDurum] = useState('');
    const [hayvanlar, setHayvanlar] = useState([]);

    // Form state
    const [form, setForm] = useState({
        hayvanId: '', hayvanTipi: 'inek', tip: 'hastalik',
        tarih: new Date().toISOString().split('T')[0],
        tani: '', belirtiler: '', tedavi: '', veteriner: '',
        maliyet: '', durum: 'devam_ediyor', sonrakiKontrol: '', notlar: ''
    });

    const [asiForm, setAsiForm] = useState({
        hayvanId: '', hayvanTipi: 'hepsi', asiAdi: '',
        uygulamaTarihi: new Date().toISOString().split('T')[0],
        sonrakiTarih: '', tekrarPeriyodu: '', uygulayan: '',
        doz: '', maliyet: '', notlar: ''
    });

    // Veri yükleme
    const veriYukle = useCallback(async () => {
        setYukleniyor(true);
        try {
            const params = {};
            if (filtreTip) params.tip = filtreTip;
            if (filtreDurum) params.durum = filtreDurum;

            const [kayitRes, asiRes, istatRes] = await Promise.allSettled([
                api.getSaglikKayitlari(params),
                api.getAsiTakvimi(),
                api.getSaglikIstatistikleri()
            ]);

            if (kayitRes.status === 'fulfilled') {
                setKayitlar(kayitRes.value.data.kayitlar || []);
            }
            if (asiRes.status === 'fulfilled') {
                setAsilar(asiRes.value.data.asilar || []);
            }
            if (istatRes.status === 'fulfilled') {
                setIstatistikler(istatRes.value.data);
            }
        } catch (error) {
            console.error('Sağlık verileri yüklenemedi:', error);
        } finally {
            setYukleniyor(false);
        }
    }, [filtreTip, filtreDurum]);

    // Hayvanları yükle (modal için)
    const hayvanYukle = useCallback(async () => {
        try {
            const [inekRes, duveRes, buzagiRes, tosunRes] = await Promise.all([
                api.getInekler(),
                api.getDuveler(),
                api.getBuzagilar(),
                api.getTosunlar()
            ]);
            const hepsi = [
                ...(inekRes.data || []).map(h => ({ ...h, tip: 'inek' })),
                ...(duveRes.data || []).map(h => ({ ...h, tip: 'duve' })),
                ...(buzagiRes.data || []).map(h => ({ ...h, tip: 'buzagi' })),
                ...(tosunRes.data || []).map(h => ({ ...h, tip: 'tosun' }))
            ];
            setHayvanlar(hepsi);
        } catch (err) {
            console.error('Hayvanlar yüklenemedi:', err);
        }
    }, []);

    useEffect(() => { veriYukle(); }, [veriYukle]);
    useEffect(() => { hayvanYukle(); }, [hayvanYukle]);

    // Sağlık kaydı oluştur
    const handleSaglikSubmit = async (e) => {
        e.preventDefault();
        try {
            const seciliHayvan = hayvanlar.find(h => h._id === form.hayvanId);
            const data = {
                ...form,
                hayvanTipi: seciliHayvan?.tip || form.hayvanTipi,
                hayvanIsim: seciliHayvan?.isim || '',
                hayvanKupeNo: seciliHayvan?.kupeNo || '',
                belirtiler: form.belirtiler ? form.belirtiler.split(',').map(s => s.trim()) : [],
                maliyet: parseFloat(form.maliyet) || 0,
                sonrakiKontrol: form.sonrakiKontrol || undefined
            };

            await api.createSaglikKaydi(data);
            toast.success('Sağlık kaydı oluşturuldu! 🏥');
            setModalAcik(false);
            resetForms();
            veriYukle();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Kayıt oluşturulamadı');
        }
    };

    // Aşı kaydı oluştur
    const handleAsiSubmit = async (e) => {
        e.preventDefault();
        try {
            const seciliHayvan = hayvanlar.find(h => h._id === asiForm.hayvanId);
            const data = {
                ...asiForm,
                hayvanIsim: seciliHayvan?.isim || '',
                hayvanKupeNo: seciliHayvan?.kupeNo || '',
                maliyet: parseFloat(asiForm.maliyet) || 0,
                tekrarPeriyodu: parseInt(asiForm.tekrarPeriyodu) || 0,
                sonrakiTarih: asiForm.sonrakiTarih || undefined
            };

            await api.createAsiKaydi(data);
            toast.success('Aşı kaydı oluşturuldu! 💉');
            setModalAcik(false);
            resetForms();
            veriYukle();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Aşı kaydı oluşturulamadı');
        }
    };

    // Silme
    const handleSil = async (id, tip) => {
        if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
        try {
            if (tip === 'asi') {
                await api.deleteAsiKaydi(id);
                toast.success('Aşı kaydı silindi');
            } else {
                await api.deleteSaglikKaydi(id);
                toast.success('Sağlık kaydı silindi');
            }
            veriYukle();
        } catch (error) {
            toast.error('Silme işlemi başarısız');
        }
    };

    const resetForms = () => {
        setForm({
            hayvanId: '', hayvanTipi: 'inek', tip: 'hastalik',
            tarih: new Date().toISOString().split('T')[0],
            tani: '', belirtiler: '', tedavi: '', veteriner: '',
            maliyet: '', durum: 'devam_ediyor', sonrakiKontrol: '', notlar: ''
        });
        setAsiForm({
            hayvanId: '', hayvanTipi: 'hepsi', asiAdi: '',
            uygulamaTarihi: new Date().toISOString().split('T')[0],
            sonrakiTarih: '', tekrarPeriyodu: '', uygulayan: '',
            doz: '', maliyet: '', notlar: ''
        });
    };

    const openModal = (tip) => {
        setModalTip(tip);
        resetForms();
        setModalAcik(true);
    };

    // =====================
    //  RENDER
    // =====================
    return (
        <PageContainer>
            <Header>
                <h1><FaHeartbeat /> Sağlık Merkezi</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <AddButton onClick={() => openModal('asi')} style={{ background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)' }}>
                        <FaSyringe /> Aşı Ekle
                    </AddButton>
                    <AddButton onClick={() => openModal('saglik')}>
                        <FaPlus /> Sağlık Kaydı
                    </AddButton>
                </div>
            </Header>

            {/* İSTATİSTİK KARTLARI */}
            <StatGrid>
                <StatCard color="#FF9800">
                    <StatIcon bg="#FFF3E0" color="#FF9800"><FaHeartbeat /></StatIcon>
                    <StatInfo>
                        <div className="value">{istatistikler?.aktifTedavi || 0}</div>
                        <div className="label">Aktif Tedavi</div>
                    </StatInfo>
                </StatCard>

                <StatCard color="#9C27B0">
                    <StatIcon bg="#F3E5F5" color="#9C27B0"><FaSyringe /></StatIcon>
                    <StatInfo>
                        <div className="value">{istatistikler?.buAyAsi || 0}</div>
                        <div className="label">Bu Ay Aşı</div>
                    </StatInfo>
                </StatCard>

                <StatCard color="#2196F3">
                    <StatIcon bg="#E3F2FD" color="#2196F3"><FaClock /></StatIcon>
                    <StatInfo>
                        <div className="value">{istatistikler?.yaklasanKontrol || 0}</div>
                        <div className="label">Yaklaşan Kontrol</div>
                    </StatInfo>
                </StatCard>

                <StatCard color="#f44336">
                    <StatIcon bg="#FFEBEE" color="#f44336"><FaMoneyBillWave /></StatIcon>
                    <StatInfo>
                        <div className="value">₺{(istatistikler?.aylikMaliyet || 0).toLocaleString('tr-TR')}</div>
                        <div className="label">Aylık Sağlık Gideri</div>
                    </StatInfo>
                </StatCard>
            </StatGrid>

            {/* TAB BAR */}
            <TabBar>
                <Tab active={aktifTab === 'kayitlar'} onClick={() => setAktifTab('kayitlar')}>
                    🏥 Sağlık Kayıtları
                </Tab>
                <Tab active={aktifTab === 'asilar'} onClick={() => setAktifTab('asilar')}>
                    💉 Aşı Takvimi
                </Tab>
                <Tab active={aktifTab === 'yaklasan'} onClick={() => setAktifTab('yaklasan')}>
                    ⏰ Yaklaşan İşlemler
                </Tab>
            </TabBar>

            {/* SAĞLIK KAYITLARI TAB */}
            {aktifTab === 'kayitlar' && (
                <>
                    <FilterRow>
                        <FaFilter style={{ color: '#999' }} />
                        <FilterSelect value={filtreTip} onChange={e => setFiltreTip(e.target.value)}>
                            <option value="">Tüm Tipler</option>
                            <option value="hastalik">Hastalık</option>
                            <option value="tedavi">Tedavi</option>
                            <option value="asi">Aşı</option>
                            <option value="muayene">Muayene</option>
                            <option value="ameliyat">Ameliyat</option>
                        </FilterSelect>
                        <FilterSelect value={filtreDurum} onChange={e => setFiltreDurum(e.target.value)}>
                            <option value="">Tüm Durumlar</option>
                            <option value="devam_ediyor">Devam Ediyor</option>
                            <option value="iyilesti">İyileşti</option>
                            <option value="kronik">Kronik</option>
                        </FilterSelect>
                    </FilterRow>

                    <CardList>
                        {yukleniyor ? (
                            <EmptyState><p>Yükleniyor...</p></EmptyState>
                        ) : kayitlar.length === 0 ? (
                            <EmptyState>
                                <FaHeartbeat />
                                <p>Henüz sağlık kaydı yok</p>
                                <p style={{ fontSize: '13px', marginTop: '8px' }}>İlk kaydı eklemek için yukarıdaki butona tıklayın</p>
                            </EmptyState>
                        ) : (
                            kayitlar.map(k => {
                                const style = getTipStyle(k.tip);
                                const durumBadge = getDurumBadge(k.durum);
                                return (
                                    <RecordCard key={k._id} color={style.color}>
                                        <RecordIcon bg={style.bg} color={style.color}>
                                            {style.icon}
                                        </RecordIcon>
                                        <RecordContent>
                                            <div className="top-row">
                                                <div>
                                                    <h3>{k.tani}</h3>
                                                    <div className="hayvan-info">
                                                        {hayvanTipiLabel[k.hayvanTipi] || k.hayvanTipi}
                                                        {k.hayvanIsim && ` • ${k.hayvanIsim}`}
                                                        {k.hayvanKupeNo && ` (${k.hayvanKupeNo})`}
                                                    </div>
                                                </div>
                                                <Badge bg={durumBadge.bg} color={durumBadge.color}>
                                                    {durumBadge.label}
                                                </Badge>
                                            </div>
                                            {k.tedavi && <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>💊 {k.tedavi}</div>}
                                            <div className="detail-row">
                                                <span className="detail"><FaCalendarAlt /> {new Date(k.tarih).toLocaleDateString('tr-TR')}</span>
                                                {k.veteriner && <span className="detail"><FaStethoscope /> {k.veteriner}</span>}
                                                {k.maliyet > 0 && <span className="detail"><FaMoneyBillWave /> ₺{k.maliyet.toLocaleString('tr-TR')}</span>}
                                                {k.sonrakiKontrol && <span className="detail"><FaClock /> Kontrol: {new Date(k.sonrakiKontrol).toLocaleDateString('tr-TR')}</span>}
                                            </div>
                                        </RecordContent>
                                        <ActionBtns>
                                            <button className="delete" onClick={() => handleSil(k._id, 'saglik')}><FaTrash /></button>
                                        </ActionBtns>
                                    </RecordCard>
                                );
                            })
                        )}
                    </CardList>
                </>
            )}

            {/* AŞI TAKVİMİ TAB */}
            {aktifTab === 'asilar' && (
                <CardList>
                    {asilar.length === 0 ? (
                        <EmptyState>
                            <FaSyringe />
                            <p>Henüz aşı kaydı yok</p>
                        </EmptyState>
                    ) : (
                        asilar.map(a => {
                            const gecikti = a.sonrakiTarih && new Date(a.sonrakiTarih) < new Date() && a.durum === 'bekliyor';
                            return (
                                <RecordCard key={a._id} color={gecikti ? '#f44336' : '#9C27B0'}>
                                    <RecordIcon bg={gecikti ? '#FFEBEE' : '#F3E5F5'} color={gecikti ? '#f44336' : '#9C27B0'}>
                                        <FaSyringe />
                                    </RecordIcon>
                                    <RecordContent>
                                        <div className="top-row">
                                            <div>
                                                <h3>{a.asiAdi}</h3>
                                                <div className="hayvan-info">
                                                    {a.hayvanTipi === 'hepsi' ? '🐄 Toplu Aşı' :
                                                        (hayvanTipiLabel[a.hayvanTipi] || a.hayvanTipi)}
                                                    {a.hayvanIsim && ` • ${a.hayvanIsim}`}
                                                    {a.hayvanKupeNo && ` (${a.hayvanKupeNo})`}
                                                </div>
                                            </div>
                                            <Badge
                                                bg={gecikti ? '#FFEBEE' : a.durum === 'yapildi' ? '#E8F5E9' : '#FFF3E0'}
                                                color={gecikti ? '#C62828' : a.durum === 'yapildi' ? '#2E7D32' : '#E65100'}
                                            >
                                                {gecikti ? '⚠️ GECİKTİ' : a.durum === 'yapildi' ? '✅ Yapıldı' : '⏳ Bekliyor'}
                                            </Badge>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail"><FaCalendarAlt /> {new Date(a.uygulamaTarihi).toLocaleDateString('tr-TR')}</span>
                                            {a.sonrakiTarih && <span className="detail"><FaClock /> Sonraki: {new Date(a.sonrakiTarih).toLocaleDateString('tr-TR')}</span>}
                                            {a.uygulayan && <span className="detail"><FaStethoscope /> {a.uygulayan}</span>}
                                            {a.doz && <span className="detail"><FaPills /> {a.doz}</span>}
                                            {a.maliyet > 0 && <span className="detail"><FaMoneyBillWave /> ₺{a.maliyet.toLocaleString('tr-TR')}</span>}
                                        </div>
                                    </RecordContent>
                                    <ActionBtns>
                                        <button className="delete" onClick={() => handleSil(a._id, 'asi')}><FaTrash /></button>
                                    </ActionBtns>
                                </RecordCard>
                            );
                        })
                    )}
                </CardList>
            )}

            {/* YAKLAŞAN İŞLEMLER TAB */}
            {aktifTab === 'yaklasan' && (
                <CardList>
                    {(() => {
                        const yaklasanItems = [
                            ...kayitlar
                                .filter(k => k.sonrakiKontrol && k.durum === 'devam_ediyor')
                                .map(k => ({ ...k, _itemType: 'kontrol', _sortDate: k.sonrakiKontrol })),
                            ...asilar
                                .filter(a => a.sonrakiTarih && a.durum !== 'yapildi')
                                .map(a => ({ ...a, _itemType: 'asi', _sortDate: a.sonrakiTarih }))
                        ].sort((a, b) => new Date(a._sortDate) - new Date(b._sortDate));

                        if (yaklasanItems.length === 0) {
                            return (
                                <EmptyState>
                                    <FaCheckCircle />
                                    <p>Yaklaşan işlem yok — her şey yolunda! 🎉</p>
                                </EmptyState>
                            );
                        }

                        return yaklasanItems.map(item => {
                            const gecikti = new Date(item._sortDate) < new Date();
                            if (item._itemType === 'kontrol') {
                                return (
                                    <RecordCard key={item._id} color={gecikti ? '#f44336' : '#2196F3'}>
                                        <RecordIcon bg={gecikti ? '#FFEBEE' : '#E3F2FD'} color={gecikti ? '#f44336' : '#2196F3'}>
                                            <FaStethoscope />
                                        </RecordIcon>
                                        <RecordContent>
                                            <div className="top-row">
                                                <h3>Kontrol: {item.tani}</h3>
                                                <Badge bg={gecikti ? '#FFEBEE' : '#E3F2FD'} color={gecikti ? '#C62828' : '#1565C0'}>
                                                    {gecikti ? '⚠️ GECİKTİ' : `📅 ${new Date(item.sonrakiKontrol).toLocaleDateString('tr-TR')}`}
                                                </Badge>
                                            </div>
                                            <div className="hayvan-info">
                                                {hayvanTipiLabel[item.hayvanTipi]} {item.hayvanIsim && `• ${item.hayvanIsim}`}
                                            </div>
                                        </RecordContent>
                                    </RecordCard>
                                );
                            } else {
                                return (
                                    <RecordCard key={item._id} color={gecikti ? '#f44336' : '#9C27B0'}>
                                        <RecordIcon bg={gecikti ? '#FFEBEE' : '#F3E5F5'} color={gecikti ? '#f44336' : '#9C27B0'}>
                                            <FaSyringe />
                                        </RecordIcon>
                                        <RecordContent>
                                            <div className="top-row">
                                                <h3>Aşı: {item.asiAdi}</h3>
                                                <Badge bg={gecikti ? '#FFEBEE' : '#F3E5F5'} color={gecikti ? '#C62828' : '#7B1FA2'}>
                                                    {gecikti ? '⚠️ GECİKTİ' : `📅 ${new Date(item.sonrakiTarih).toLocaleDateString('tr-TR')}`}
                                                </Badge>
                                            </div>
                                            <div className="hayvan-info">
                                                {item.hayvanTipi === 'hepsi' ? '🐄 Toplu' : hayvanTipiLabel[item.hayvanTipi]}
                                                {item.hayvanIsim && ` • ${item.hayvanIsim}`}
                                            </div>
                                        </RecordContent>
                                    </RecordCard>
                                );
                            }
                        });
                    })()}
                </CardList>
            )}

            {/* MODAL */}
            {modalAcik && (
                <Overlay onClick={() => setModalAcik(false)}>
                    <ModalBox onClick={e => e.stopPropagation()}>
                        {modalTip === 'saglik' ? (
                            <>
                                <ModalHeader>
                                    <h2><FaHeartbeat style={{ color: '#e91e63' }} /> Yeni Sağlık Kaydı</h2>
                                    <button onClick={() => setModalAcik(false)}><FaTimes /></button>
                                </ModalHeader>

                                <form onSubmit={handleSaglikSubmit}>
                                    <FormGroup>
                                        <label>Hayvan *</label>
                                        <select value={form.hayvanId} onChange={e => setForm({ ...form, hayvanId: e.target.value })} required>
                                            <option value="">Hayvan Seçin...</option>
                                            {hayvanlar.map(h => (
                                                <option key={h._id} value={h._id}>
                                                    {h.isim} ({h.kupeNo}) — {hayvanTipiLabel[h.tip]}
                                                </option>
                                            ))}
                                        </select>
                                    </FormGroup>

                                    <FormRow>
                                        <FormGroup>
                                            <label>İşlem Tipi *</label>
                                            <select value={form.tip} onChange={e => setForm({ ...form, tip: e.target.value })}>
                                                <option value="hastalik">🤒 Hastalık</option>
                                                <option value="tedavi">💊 Tedavi</option>
                                                <option value="muayene">🩺 Muayene</option>
                                                <option value="ameliyat">🔪 Ameliyat</option>
                                                <option value="dogum_komplikasyonu">⚠️ Doğum Komplikasyonu</option>
                                            </select>
                                        </FormGroup>
                                        <FormGroup>
                                            <label>Tarih *</label>
                                            <input type="date" value={form.tarih} onChange={e => setForm({ ...form, tarih: e.target.value })} required />
                                        </FormGroup>
                                    </FormRow>

                                    <FormGroup>
                                        <label>Tanı / Hastalık Adı *</label>
                                        <input
                                            type="text"
                                            value={form.tani}
                                            onChange={e => setForm({ ...form, tani: e.target.value })}
                                            placeholder="Ör: Mastitis, Şap Hastalığı, Topallık..."
                                            required
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <label>Belirtiler (virgülle ayırın)</label>
                                        <input
                                            type="text"
                                            value={form.belirtiler}
                                            onChange={e => setForm({ ...form, belirtiler: e.target.value })}
                                            placeholder="Ör: Ateş, İştahsızlık, Topallık"
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <label>Tedavi / Uygulama</label>
                                        <textarea
                                            value={form.tedavi}
                                            onChange={e => setForm({ ...form, tedavi: e.target.value })}
                                            placeholder="Uygulanan tedaviyi yazın..."
                                        />
                                    </FormGroup>

                                    <FormRow>
                                        <FormGroup>
                                            <label>Veteriner</label>
                                            <input type="text" value={form.veteriner} onChange={e => setForm({ ...form, veteriner: e.target.value })} placeholder="Vet. adı" />
                                        </FormGroup>
                                        <FormGroup>
                                            <label>Maliyet (₺)</label>
                                            <input type="number" value={form.maliyet} onChange={e => setForm({ ...form, maliyet: e.target.value })} placeholder="0" min="0" />
                                        </FormGroup>
                                    </FormRow>

                                    <FormRow>
                                        <FormGroup>
                                            <label>Durum</label>
                                            <select value={form.durum} onChange={e => setForm({ ...form, durum: e.target.value })}>
                                                <option value="devam_ediyor">⏳ Devam Ediyor</option>
                                                <option value="iyilesti">✅ İyileşti</option>
                                                <option value="kronik">🔄 Kronik</option>
                                                <option value="oldu">❌ Öldü</option>
                                            </select>
                                        </FormGroup>
                                        <FormGroup>
                                            <label>Sonraki Kontrol</label>
                                            <input type="date" value={form.sonrakiKontrol} onChange={e => setForm({ ...form, sonrakiKontrol: e.target.value })} />
                                        </FormGroup>
                                    </FormRow>

                                    <FormGroup>
                                        <label>Notlar</label>
                                        <textarea value={form.notlar} onChange={e => setForm({ ...form, notlar: e.target.value })} placeholder="Ek notlar..." />
                                    </FormGroup>

                                    <SubmitBtn type="submit">Kaydet</SubmitBtn>
                                </form>
                            </>
                        ) : (
                            <>
                                <ModalHeader>
                                    <h2><FaSyringe style={{ color: '#9C27B0' }} /> Yeni Aşı Kaydı</h2>
                                    <button onClick={() => setModalAcik(false)}><FaTimes /></button>
                                </ModalHeader>

                                <form onSubmit={handleAsiSubmit}>
                                    <FormGroup>
                                        <label>Aşı Adı *</label>
                                        <input
                                            type="text"
                                            value={asiForm.asiAdi}
                                            onChange={e => setAsiForm({ ...asiForm, asiAdi: e.target.value })}
                                            placeholder="Ör: Şap Aşısı, Brusella, IBR..."
                                            required
                                        />
                                    </FormGroup>

                                    <FormRow>
                                        <FormGroup>
                                            <label>Hayvan Tipi</label>
                                            <select value={asiForm.hayvanTipi} onChange={e => setAsiForm({ ...asiForm, hayvanTipi: e.target.value, hayvanId: '' })}>
                                                <option value="hepsi">Tüm Sürü (Toplu)</option>
                                                <option value="inek">İnekler</option>
                                                <option value="duve">Düveler</option>
                                                <option value="buzagi">Buzağılar</option>
                                                <option value="tosun">Tosunlar</option>
                                            </select>
                                        </FormGroup>
                                        <FormGroup>
                                            <label>Belirli Hayvan (opsiyonel)</label>
                                            <select value={asiForm.hayvanId} onChange={e => setAsiForm({ ...asiForm, hayvanId: e.target.value })}>
                                                <option value="">Toplu Aşı</option>
                                                {hayvanlar
                                                    .filter(h => asiForm.hayvanTipi === 'hepsi' || h.tip === asiForm.hayvanTipi)
                                                    .map(h => (
                                                        <option key={h._id} value={h._id}>{h.isim} ({h.kupeNo})</option>
                                                    ))
                                                }
                                            </select>
                                        </FormGroup>
                                    </FormRow>

                                    <FormRow>
                                        <FormGroup>
                                            <label>Uygulama Tarihi *</label>
                                            <input type="date" value={asiForm.uygulamaTarihi} onChange={e => setAsiForm({ ...asiForm, uygulamaTarihi: e.target.value })} required />
                                        </FormGroup>
                                        <FormGroup>
                                            <label>Sonraki Aşı Tarihi</label>
                                            <input type="date" value={asiForm.sonrakiTarih} onChange={e => setAsiForm({ ...asiForm, sonrakiTarih: e.target.value })} />
                                        </FormGroup>
                                    </FormRow>

                                    <FormRow>
                                        <FormGroup>
                                            <label>Tekrar Periyodu (gün)</label>
                                            <input type="number" value={asiForm.tekrarPeriyodu} onChange={e => setAsiForm({ ...asiForm, tekrarPeriyodu: e.target.value })} placeholder="Ör: 180" min="0" />
                                        </FormGroup>
                                        <FormGroup>
                                            <label>Doz</label>
                                            <input type="text" value={asiForm.doz} onChange={e => setAsiForm({ ...asiForm, doz: e.target.value })} placeholder="Ör: 2 ml" />
                                        </FormGroup>
                                    </FormRow>

                                    <FormRow>
                                        <FormGroup>
                                            <label>Uygulayan</label>
                                            <input type="text" value={asiForm.uygulayan} onChange={e => setAsiForm({ ...asiForm, uygulayan: e.target.value })} placeholder="Veteriner adı" />
                                        </FormGroup>
                                        <FormGroup>
                                            <label>Maliyet (₺)</label>
                                            <input type="number" value={asiForm.maliyet} onChange={e => setAsiForm({ ...asiForm, maliyet: e.target.value })} placeholder="0" min="0" />
                                        </FormGroup>
                                    </FormRow>

                                    <FormGroup>
                                        <label>Notlar</label>
                                        <textarea value={asiForm.notlar} onChange={e => setAsiForm({ ...asiForm, notlar: e.target.value })} placeholder="Ek notlar..." />
                                    </FormGroup>

                                    <SubmitBtn type="submit" style={{ background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)' }}>
                                        Kaydet
                                    </SubmitBtn>
                                </form>
                            </>
                        )}
                    </ModalBox>
                </Overlay>
            )}
        </PageContainer>
    );
}

export default SaglikMerkezi;
