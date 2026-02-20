import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { FaCalendarAlt, FaHistory, FaCheckCircle, FaTrash, FaPlus, FaList, FaChevronLeft, FaChevronRight, FaMoon, FaSun } from 'react-icons/fa';
import { showSuccess, showError, showWarning } from '../utils/toast';

// ─── Animations ─────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// ─── Styled Components ──────────────────────────

const PageContainer = styled.div`
  padding: 24px;
  min-height: calc(100vh - 80px);
  background: linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 50%, #faf5ff 100%);
  animation: ${fadeIn} 0.5s ease;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;

  .header-icon {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    background: linear-gradient(135deg, #4CAF50, #66BB6A);
    box-shadow: 0 8px 24px rgba(76,175,80,0.25);
  }

  h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    color: #1a1a1a;
    letter-spacing: -0.5px;
  }
  
  .sub {
    font-size: 14px;
    color: #888;
    font-weight: 500;
    margin-top: 2px;
  }
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 24px;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(10px);
  padding: 6px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.04);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 14px 20px;
  border: none;
  background: ${props => props.active
        ? 'linear-gradient(135deg, #4CAF50, #43A047)'
        : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;

  ${props => props.active && `
    box-shadow: 0 4px 14px rgba(76,175,80,0.3);
  `}

  &:hover {
    ${props => !props.active && `
      background: rgba(76,175,80,0.08);
      color: #4CAF50;
    `}
  }
`;

const ContentCard = styled.div`
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.06);
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid rgba(255,255,255,0.8);
  animation: ${fadeIn} 0.4s ease 0.1s both;
`;

const SectionTitle = styled.h2`
  font-size: 22px;
  font-weight: 800;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 28px 0;
  letter-spacing: -0.3px;

  .emoji {
    font-size: 28px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 22px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 10px;
  font-weight: 700;
  color: #334155;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 18px;
  font-size: ${props => props.large ? '24px' : '15px'};
  font-weight: ${props => props.large ? '800' : '500'};
  border-radius: 14px;
  border: 2px solid #e8ecf0;
  background: #f8fafc;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
  color: ${props => props.large ? '#4CAF50' : '#1a1a1a'};
  letter-spacing: ${props => props.large ? '-0.5px' : '0'};

  &:focus {
    border-color: #4CAF50;
    background: white;
    box-shadow: 0 0 0 4px rgba(76,175,80,0.1);
  }

  &::placeholder {
    color: #c0c0c0;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  
  .suffix {
    position: absolute;
    right: 18px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
    font-weight: 600;
    font-size: 14px;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 18px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 14px;
  border: 2px solid #e8ecf0;
  background: #f8fafc;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;

  &:focus {
    border-color: #4CAF50;
    background-color: white;
    box-shadow: 0 0 0 4px rgba(76,175,80,0.1);
  }
`;

const SagimButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const SagimButton = styled.button`
  flex: 1;
  padding: 16px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid ${props => props.active ? props.color : '#e8ecf0'};
  background: ${props => props.active ? props.bg : '#f8fafc'};
  color: ${props => props.active ? props.color : '#888'};
  
  ${props => props.active && `
    box-shadow: 0 4px 12px ${props.color}30;
    transform: scale(1.02);
  `}

  &:hover {
    border-color: ${props => props.color};
    color: ${props => props.color};
  }

  .icon { font-size: 20px; }
`;

const PrimaryButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #4CAF50, #43A047);
  color: white;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  margin-top: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(76,175,80,0.25);
  letter-spacing: 0.3px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(76,175,80,0.35);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled.button`
  flex: 1;
  padding: 14px;
  background: #f1f5f9;
  color: #475569;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  transition: all 0.3s ease;

  &:hover {
    background: #e2e8f0;
    border-color: #cbd5e1;
  }
`;

const ConfirmButton = styled(PrimaryButton)`
  flex: 1;
  margin-top: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

// Önizleme
const PreviewBox = styled.div`
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 24px;
  border: 1px solid rgba(76,175,80,0.15);

  .row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    
    .label { color: #64748b; font-size: 14px; font-weight: 500; }
    .value { font-weight: 700; color: #1a1a1a; font-size: 14px; }
    .value.highlight { color: #4CAF50; font-size: 18px; }
  }
`;

const PreviewTable = styled.div`
  max-height: 320px;
  overflow-y: auto;
  border-radius: 14px;
  border: 1px solid #e8ecf0;
  margin-bottom: 20px;

  table {
    width: 100%;
    border-collapse: collapse;
  }

  thead th {
    padding: 12px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #94a3b8;
    background: #f8fafc;
    border-bottom: 2px solid #e8ecf0;
    position: sticky;
    top: 0;

    &:last-child { text-align: right; }
  }

  tbody tr {
    transition: background 0.2s;
    border-bottom: 1px solid #f1f5f9;
    
    &:hover { background: #f8fafc; }
    &:last-child { border: none; }
  }

  td {
    padding: 12px 16px;
    font-size: 14px;
    color: #334155;
    font-weight: 500;

    &:last-child { 
      text-align: right; 
      font-weight: 700; 
      color: #4CAF50;
    }
  }
`;

// Takvim
const CalendarContainer = styled.div`
  .cal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
      color: #1a1a1a;
      text-transform: capitalize;
    }
  }

  .nav-btn {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    border: 2px solid #e8ecf0;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    transition: all 0.2s;
    font-size: 14px;

    &:hover {
      border-color: #4CAF50;
      color: #4CAF50;
      background: #f0fdf4;
    }
  }
`;

const CalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
`;

const DayName = styled.div`
  text-align: center;
  font-weight: 700;
  color: #94a3b8;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-bottom: 12px;
`;

const DayCell = styled.div`
  border-radius: 12px;
  min-height: 56px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s ease;
  cursor: default;
  background: ${props => {
        if (props.isToday) return 'linear-gradient(135deg, #f0fdf4, #dcfce7)';
        if (props.hasData) return '#fafffe';
        return '#fafafa';
    }};
  border: ${props => {
        if (props.isToday) return '2px solid #4CAF50';
        if (props.hasData) return '1px solid #e0f2e9';
        return '1px solid #f0f0f0';
    }};
  
  &:not(.empty):hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  }

  .date-num {
    font-weight: 700;
    color: ${props => props.isToday ? '#4CAF50' : '#475569'};
    font-size: 13px;
  }

  .day-summary {
    display: flex;
    flex-direction: column;
    gap: 3px;
    align-items: flex-end;
  }

  .dots {
    display: flex;
    gap: 4px;
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    
    &.sabah { background: #FF9800; }
    &.aksam { background: #2196F3; }
  }

  .total {
    font-size: 10px;
    font-weight: 800;
    color: #4CAF50;
  }
`;

// Geçmiş kartlar
const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 2px solid #f1f5f9;
  margin-bottom: 16px;

  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 800;
    color: #1a1a1a;
  }

  .toggle-btn {
    border: none;
    background: none;
    color: #4CAF50;
    font-weight: 700;
    cursor: pointer;
    font-size: 13px;
    padding: 6px 14px;
    border-radius: 8px;
    transition: background 0.2s;
    
    &:hover { background: #f0fdf4; }
  }
`;

const HistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
`;

const HistoryCard = styled.div`
  padding: 18px;
  border-radius: 16px;
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border: 1px solid #e8ecf0;
  border-left: 4px solid ${props => props.color};
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.06);
  }

  .date {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .amount {
    font-size: 22px;
    font-weight: 900;
    color: #1a1a1a;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
    
    .unit { 
      font-size: 14px; 
      color: #999; 
      font-weight: 600; 
      margin-left: 4px;
    }
  }

  .type {
    font-size: 12px;
    text-transform: capitalize;
    color: #64748b;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .delete-btn {
    margin-top: 12px;
    border: none;
    background: #fef2f2;
    color: #ef4444;
    padding: 8px 0;
    border-radius: 10px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    width: 100%;
    transition: all 0.2s;
    
    &:hover {
      background: #fee2e2;
    }
  }
`;

const Legend = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
  }

  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
`;

const HistoryCount = styled.div`
  text-align: center;
  margin-top: 14px;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
`;

// ─────────────────────────────────────────────────

function SutKaydi() {
    const navigate = useNavigate();
    const bugun = new Date().toLocaleDateString('en-CA');

    // Tab State
    const [activeTab, setActiveTab] = useState('giris'); // 'giris' | 'gecmis'

    // Form State
    const [tarih, setTarih] = useState(bugun);
    const [sagim, setSagim] = useState('sabah');
    const [toplamSut, setToplamSut] = useState('');
    const [dagilimTipi, setDagilimTipi] = useState('akilli');
    const [notlar, setNotlar] = useState('');

    // İşlem State
    const [yukleniyor, setYukleniyor] = useState(false);
    const [onizleme, setOnizleme] = useState(null);
    const [adim, setAdim] = useState(1); // 1: Giriş, 2: Önizleme

    // Geçmiş & Takvim State
    const [gecmisKayitlar, setGecmisKayitlar] = useState([]);
    const [seciliTarih, setSeciliTarih] = useState(new Date());
    const [tumunuGoster, setTumunuGoster] = useState(false);

    useEffect(() => {
        fetchGecmis();
    }, []);

    const fetchGecmis = async () => {
        try {
            const res = await api.topluSutGecmis(60);
            setGecmisKayitlar(res.data);
        } catch (error) {
            console.error('Geçmiş yüklenemedi:', error);
        }
    };

    const onizlemeAl = async () => {
        if (!toplamSut || toplamSut <= 0) {
            showWarning('Lütfen geçerli bir süt miktarı girin!');
            return;
        }

        setYukleniyor(true);
        try {
            const response = await api.topluSutOnizleme({
                toplamSut: parseFloat(toplamSut),
                dagilimTipi,
                tarih,
                sagim
            });
            setOnizleme(response.data);
            setAdim(2);
        } catch (error) {
            showError(error.response?.data?.message || 'Önizleme alınamadı!');
        } finally {
            setYukleniyor(false);
        }
    };

    const kaydet = async () => {
        setYukleniyor(true);
        try {
            await api.topluSutKaydet({
                tarih,
                sagim,
                toplamSut: onizleme.toplamSut,
                dagilimTipi,
                detaylar: onizleme.detaylar,
                notlar
            });
            showSuccess('Süt kaydı başarıyla eklendi! 🥛');
            setAdim(1);
            setToplamSut('');
            setOnizleme(null);
            fetchGecmis();
            setActiveTab('gecmis');
        } catch (error) {
            if (error.response?.status === 409) {
                showWarning('Bu tarih ve sağım için kayıt zaten var! Geçmiş sekmesinden eskisini silip tekrar deneyin.');
            } else {
                showError('Hata oluştu: ' + error.message);
            }
        } finally {
            setYukleniyor(false);
        }
    };

    const gecmisSil = async (tarih, sagim) => {
        if (window.confirm(`${new Date(tarih).toLocaleDateString('tr-TR')} ${sagim} kaydını silmek istediğinize emin misiniz?`)) {
            try {
                await api.topluSutSilByTarihSagim(tarih, sagim);
                fetchGecmis();
                showSuccess('Kayıt silindi.');
            } catch (error) {
                showError('Silme işlemi başarısız.');
            }
        }
    };

    // --- TAKVİM RENDER ---
    const renderCalendar = () => {
        const getDaysInMonth = (date) => {
            const year = date.getFullYear();
            const month = date.getMonth();
            const days = new Date(year, month + 1, 0).getDate();
            const firstDay = new Date(year, month, 1).getDay();
            const startOffset = firstDay === 0 ? 6 : firstDay - 1;
            const result = [];
            for (let i = 0; i < startOffset; i++) result.push(null);
            for (let i = 1; i <= days; i++) result.push(new Date(year, month, i));
            return result;
        };

        const days = getDaysInMonth(seciliTarih);
        const monthName = seciliTarih.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

        return (
            <CalendarContainer>
                <div className="cal-header">
                    <button className="nav-btn" onClick={() => setSeciliTarih(new Date(seciliTarih.getFullYear(), seciliTarih.getMonth() - 1, 1))}>
                        <FaChevronLeft />
                    </button>
                    <h3>{monthName}</h3>
                    <button className="nav-btn" onClick={() => setSeciliTarih(new Date(seciliTarih.getFullYear(), seciliTarih.getMonth() + 1, 1))}>
                        <FaChevronRight />
                    </button>
                </div>
                <CalGrid>
                    {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
                        <DayName key={d}>{d}</DayName>
                    ))}

                    {days.map((date, index) => {
                        if (!date) return <DayCell key={index} className="empty" style={{ background: 'transparent', border: 'none' }} />;
                        const gunKayitlari = gecmisKayitlar.filter(k =>
                            new Date(k.tarih).getDate() === date.getDate() &&
                            new Date(k.tarih).getMonth() === date.getMonth()
                        );
                        const sabahKaydi = gunKayitlari.find(k => k.sagim === 'sabah');
                        const aksamKaydi = gunKayitlari.find(k => k.sagim === 'aksam');
                        const toplamGun = gunKayitlari.reduce((acc, k) => acc + k.toplamSut, 0);
                        const isToday = new Date().toDateString() === date.toDateString();

                        return (
                            <DayCell key={index} isToday={isToday} hasData={gunKayitlari.length > 0}>
                                <span className="date-num">{date.getDate()}</span>
                                {gunKayitlari.length > 0 && (
                                    <div className="day-summary">
                                        <div className="dots">
                                            {sabahKaydi && <span className="dot sabah" />}
                                            {aksamKaydi && <span className="dot aksam" />}
                                        </div>
                                        <span className="total">{toplamGun.toFixed(0)} lt</span>
                                    </div>
                                )}
                            </DayCell>
                        );
                    })}
                </CalGrid>
            </CalendarContainer>
        );
    };

    return (
        <PageContainer>
            {/* Header */}
            <PageHeader>
                <div className="header-icon">🥛</div>
                <div>
                    <h1>Süt Kayıt</h1>
                    <div className="sub">Günlük süt üretimini kaydedin ve takip edin</div>
                </div>
            </PageHeader>

            {/* TAB MENU */}
            <TabContainer>
                <TabButton active={activeTab === 'giris'} onClick={() => setActiveTab('giris')}>
                    <FaPlus /> Veri Girişi
                </TabButton>
                <TabButton active={activeTab === 'gecmis'} onClick={() => setActiveTab('gecmis')}>
                    <FaCalendarAlt /> Geçmiş & Takvim
                </TabButton>
            </TabContainer>

            {/* İÇERİK */}
            <ContentCard>
                {activeTab === 'giris' ? (
                    // --- GİRİŞ SEKMESİ ---
                    <div>
                        <SectionTitle>
                            <span className="emoji">📝</span> Günlük Süt Girişi
                        </SectionTitle>

                        {adim === 1 ? (
                            <div>
                                {/* Tarih */}
                                <FormGroup>
                                    <Label>Tarih</Label>
                                    <Input type="date" value={tarih} onChange={e => setTarih(e.target.value)} />
                                </FormGroup>

                                {/* Sağım */}
                                <FormGroup>
                                    <Label>Sağım Zamanı</Label>
                                    <SagimButtonGroup>
                                        <SagimButton
                                            active={sagim === 'sabah'}
                                            color="#FF9800"
                                            bg="#FFF8E1"
                                            onClick={() => setSagim('sabah')}
                                        >
                                            <span className="icon">🌅</span> Sabah
                                        </SagimButton>
                                        <SagimButton
                                            active={sagim === 'aksam'}
                                            color="#2196F3"
                                            bg="#E3F2FD"
                                            onClick={() => setSagim('aksam')}
                                        >
                                            <span className="icon">🌙</span> Akşam
                                        </SagimButton>
                                    </SagimButtonGroup>
                                </FormGroup>

                                {/* Miktar */}
                                <FormGroup>
                                    <Label>Toplam Süt Miktarı</Label>
                                    <InputWrapper>
                                        <Input
                                            large
                                            type="number"
                                            value={toplamSut}
                                            onChange={e => setToplamSut(e.target.value)}
                                            placeholder="0.0"
                                        />
                                        <span className="suffix">Litre</span>
                                    </InputWrapper>
                                </FormGroup>

                                {/* Dağılım */}
                                <FormGroup>
                                    <Label>Dağılım Yöntemi</Label>
                                    <Select value={dagilimTipi} onChange={e => setDagilimTipi(e.target.value)}>
                                        <option value="akilli">🧠 Akıllı Dağılım</option>
                                        <option value="esit">⚖️ Eşit Dağılım</option>
                                    </Select>
                                </FormGroup>

                                <PrimaryButton onClick={onizlemeAl} disabled={yukleniyor}>
                                    {yukleniyor ? '⏳ Hesaplanıyor...' : '🔍 Kaydet ve Önizle'}
                                </PrimaryButton>
                            </div>
                        ) : (
                            // --- ÖNİZLEME ---
                            <div>
                                <SectionTitle>
                                    <span className="emoji">📊</span> Önizleme
                                </SectionTitle>

                                <PreviewBox>
                                    <div className="row">
                                        <span className="label">Tarih</span>
                                        <span className="value">{new Date(tarih).toLocaleDateString('tr-TR')} • {sagim === 'sabah' ? '🌅 Sabah' : '🌙 Akşam'}</span>
                                    </div>
                                    <div className="row">
                                        <span className="label">Toplam Süt</span>
                                        <span className="value highlight">{onizleme.toplamSut} Litre</span>
                                    </div>
                                </PreviewBox>

                                <Label>İnek Bazlı Dağılım</Label>
                                <PreviewTable>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>İnek</th>
                                                <th>Miktar (Lt)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {onizleme.detaylar.map((d, i) => (
                                                <tr key={i}>
                                                    <td>{d.inekIsim}</td>
                                                    <td>{d.miktar.toFixed(1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </PreviewTable>

                                <ButtonGroup>
                                    <SecondaryButton onClick={() => setAdim(1)}>← Geri</SecondaryButton>
                                    <ConfirmButton onClick={kaydet} disabled={yukleniyor}>
                                        {yukleniyor ? '⏳ Kaydediliyor...' : '✅ Onayla ve Kaydet'}
                                    </ConfirmButton>
                                </ButtonGroup>
                            </div>
                        )}
                    </div>
                ) : (
                    // --- GEÇMİŞ SEKMESİ ---
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <SectionTitle style={{ marginBottom: 0 }}>
                                <span className="emoji">📅</span> Geçmiş Veriler
                            </SectionTitle>
                            <Legend>
                                <div className="legend-item">
                                    <div className="legend-dot" style={{ background: '#FF9800' }} />
                                    Sabah
                                </div>
                                <div className="legend-item">
                                    <div className="legend-dot" style={{ background: '#2196F3' }} />
                                    Akşam
                                </div>
                            </Legend>
                        </div>

                        {renderCalendar()}

                        <HistoryHeader>
                            <h4>Son Kayıtlar</h4>
                            {gecmisKayitlar.length > 3 && (
                                <button className="toggle-btn" onClick={() => setTumunuGoster(!tumunuGoster)}>
                                    {tumunuGoster ? 'Daha Az' : `Tümünü Göster (${gecmisKayitlar.length})`}
                                </button>
                            )}
                        </HistoryHeader>

                        <HistoryGrid>
                            {gecmisKayitlar.slice(0, tumunuGoster ? gecmisKayitlar.length : 3).map(kayit => (
                                <HistoryCard key={kayit._id} color={kayit.sagim === 'sabah' ? '#FF9800' : '#2196F3'}>
                                    <div className="date">{new Date(kayit.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                    <div className="amount">
                                        {kayit.toplamSut}
                                        <span className="unit">Lt</span>
                                    </div>
                                    <div className="type">
                                        {kayit.sagim === 'sabah' ? '🌅' : '🌙'} {kayit.sagim} sağımı
                                    </div>
                                    <button
                                        className="delete-btn"
                                        onClick={(e) => { e.stopPropagation(); gecmisSil(kayit.tarih, kayit.sagim); }}
                                    >
                                        🗑️ Kaydı Sil
                                    </button>
                                </HistoryCard>
                            ))}
                        </HistoryGrid>

                        {!tumunuGoster && gecmisKayitlar.length > 3 && (
                            <HistoryCount>
                                Toplam {gecmisKayitlar.length} kayıt mevcut
                            </HistoryCount>
                        )}
                    </div>
                )}
            </ContentCard>
        </PageContainer>
    );
}

export default SutKaydi;
