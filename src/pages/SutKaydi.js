import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { FaCalendarAlt, FaHistory, FaCheckCircle, FaTrash, FaPlus, FaList } from 'react-icons/fa';
import { showSuccess, showError, showWarning } from '../utils/toast';

// --- Styled Components ---

const PageContainer = styled.div`
  padding: 20px;
  background-color: #f4f7f6;
  min-height: calc(100vh - 80px);
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  background: white;
  padding: 5px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
`;

const TabButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  background: ${props => props.active ? '#4CAF50' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${props => props.active ? '#43A047' : '#f0f0f0'};
  }
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  max-width: 800px; /* Okuma kolaylığı için limit */
  margin: 0 auto;
`;

// ... (Eski Style Object'ler buraya taşınabilir veya styled-component yapılabilir, basitlik için object kullanmaya devam edeyim)
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#34495e', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '12px 15px', fontSize: '16px', borderRadius: '10px', border: '1px solid #dfe6e9', backgroundColor: '#f8f9fa', outline: 'none', transition: 'border-color 0.3s', boxSizing: 'border-box' };
const sagimBtnStyle = { flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s' };
const primaryBtnStyle = { width: '100%', padding: '14px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '15px', transition: 'background 0.3s', boxShadow: '0 4px 10px rgba(76, 175, 80, 0.2)' };
const secondaryBtnStyle = { flex: 1, padding: '14px', backgroundColor: '#e0e0e0', color: '#333', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' };


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
            showSuccess('Kayıt Başarılı!');
            setAdim(1);
            setToplamSut('');
            setOnizleme(null);
            fetchGecmis();
            setActiveTab('gecmis'); // Kayıttan sonra geçmişe at
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
        if (window.confirm(`${new Date(tarih).toLocaleDateString()} ${sagim} kaydını silmek istediğinize emin misiniz?`)) {
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
            <div className="calendar-container">
                <div className="calendar-header">
                    <button onClick={() => setSeciliTarih(new Date(seciliTarih.setMonth(seciliTarih.getMonth() - 1)))}>&lt;</button>
                    <h3>{monthName}</h3>
                    <button onClick={() => setSeciliTarih(new Date(seciliTarih.setMonth(seciliTarih.getMonth() + 1)))}>&gt;</button>
                </div>
                <div className="calendar-grid">
                    <div className="day-name">Pzt</div>
                    <div className="day-name">Sal</div>
                    <div className="day-name">Çar</div>
                    <div className="day-name">Per</div>
                    <div className="day-name">Cum</div>
                    <div className="day-name">Cmt</div>
                    <div className="day-name">Paz</div>

                    {days.map((date, index) => {
                        if (!date) return <div key={index} className="day empty"></div>;
                        const gunKayitlari = gecmisKayitlar.filter(k =>
                            new Date(k.tarih).getDate() === date.getDate() &&
                            new Date(k.tarih).getMonth() === date.getMonth()
                        );
                        const sabahKaydi = gunKayitlari.find(k => k.sagim === 'sabah');
                        const aksamKaydi = gunKayitlari.find(k => k.sagim === 'aksam');
                        const toplamGun = gunKayitlari.reduce((acc, k) => acc + k.toplamSut, 0);
                        const isToday = new Date().toDateString() === date.toDateString();

                        return (
                            <div key={index} className={`day ${isToday ? 'today' : ''} ${gunKayitlari.length > 0 ? 'has-data' : ''}`}>
                                <span className="date-num">{date.getDate()}</span>
                                {gunKayitlari.length > 0 && (
                                    <div className="day-summary">
                                        <div className="dots">
                                            {sabahKaydi && <span className="dot sabah" title="Sabah"></span>}
                                            {aksamKaydi && <span className="dot aksam" title="Akşam"></span>}
                                        </div>
                                        <span className="total">{toplamGun.toFixed(0)} lt</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <PageContainer>
            {/* TAB MENU */}
            <TabContainer>
                <TabButton active={activeTab === 'giris'} onClick={() => setActiveTab('giris')}>
                    <FaPlus /> Veri Girişi
                </TabButton>
                <TabButton active={activeTab === 'gecmis'} onClick={() => setActiveTab('gecmis')}>
                    <FaHistory /> Geçmiş & Takvim
                </TabButton>
            </TabContainer>

            {/* İÇERİK */}
            <ContentCard>
                {activeTab === 'giris' ? (
                    // --- GİRİŞ SEKMESİ ---
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '25px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '28px' }}>🥛</span> Günlük Süt Girişi
                        </h2>

                        {adim === 1 ? (
                            <div className="form-content">
                                {/* Tarih */}
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={labelStyle}>Tarih</label>
                                    <input type="date" value={tarih} onChange={e => setTarih(e.target.value)} style={inputStyle} />
                                </div>
                                {/* Sağım */}
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={labelStyle}>Sağım Zamanı</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => setSagim('sabah')} style={{ ...sagimBtnStyle, backgroundColor: sagim === 'sabah' ? '#FFF3E0' : '#f8f9fa', border: sagim === 'sabah' ? '2px solid #FF9800' : '1px solid #eee' }}>🌅 Sabah</button>
                                        <button onClick={() => setSagim('aksam')} style={{ ...sagimBtnStyle, backgroundColor: sagim === 'aksam' ? '#E3F2FD' : '#f8f9fa', border: sagim === 'aksam' ? '2px solid #2196F3' : '1px solid #eee' }}>🌙 Akşam</button>
                                    </div>
                                </div>
                                {/* Miktar */}
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={labelStyle}>Litre Miktarı</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type="number" value={toplamSut} onChange={e => setToplamSut(e.target.value)} placeholder="0.0" style={{ ...inputStyle, fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }} />
                                        <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}>Lt</span>
                                    </div>
                                </div>
                                {/* Dağılım */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={labelStyle}>Dağılım Yöntemi</label>
                                    <select value={dagilimTipi} onChange={e => setDagilimTipi(e.target.value)} style={inputStyle}>
                                        <option value="akilli">🧠 Akıllı Dağılım</option>
                                        <option value="esit">⚖️ Eşit Dağılım</option>
                                    </select>
                                </div>

                                <button onClick={onizlemeAl} disabled={yukleniyor} style={primaryBtnStyle}>
                                    {yukleniyor ? 'Hesaplanıyor...' : 'Kaydet ve Önizle'}
                                </button>
                            </div>
                        ) : (
                            // --- ÖNİZLEME ---
                            <div className="preview-content">
                                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ color: '#666' }}>Tarih:</span>
                                        <strong>{new Date(tarih).toLocaleDateString()} - {sagim === 'sabah' ? 'Sabah' : 'Akşam'}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#666' }}>Toplam:</span>
                                        <strong style={{ color: '#4CAF50' }}>{onizleme.toplamSut} Lt</strong>
                                    </div>
                                </div>

                                <h4 style={{ marginBottom: '10px' }}>İnek Bazlı Dağılım</h4>
                                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px', marginBottom: '20px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <tbody>
                                            {onizleme.detaylar.map((d, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                    <td style={{ padding: '8px 12px' }}>{d.inekIsim}</td>
                                                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'bold' }}>{d.miktar.toFixed(1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => setAdim(1)} style={secondaryBtnStyle}>Geri Dön</button>
                                    <button onClick={kaydet} style={primaryBtnStyle}>✅ Onayla</button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // --- GEÇMİŞ SEKMESİ ---
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' }}>Geçmiş Veriler</h2>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                                    <span style={{ width: '10px', height: '10px', backgroundColor: '#FF9800', borderRadius: '50%', display: 'inline-block' }}></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                                    <span style={{ width: '10px', height: '10px', backgroundColor: '#2196F3', borderRadius: '50%', display: 'inline-block' }}></span>
                                </div>
                            </div>
                        </div>

                        {renderCalendar()}

                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h4 style={{ margin: 0 }}>Son Kayıtlar</h4>
                                <button
                                    onClick={() => setTumunuGoster(!tumunuGoster)}
                                    style={{
                                        border: 'none',
                                        background: 'none',
                                        color: '#2196F3',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    {tumunuGoster ? 'Daha Az Göster' : 'Tümünü Göster'}
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                                {gecmisKayitlar.slice(0, tumunuGoster ? gecmisKayitlar.length : 3).map(kayit => (
                                    <div key={kayit._id} style={{ padding: '15px', borderRadius: '12px', backgroundColor: '#f8f9fa', borderLeft: `4px solid ${kayit.sagim === 'sabah' ? '#FF9800' : '#2196F3'}` }}>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>{new Date(kayit.tarih).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>{kayit.toplamSut} Lt</div>
                                        <div style={{ fontSize: '12px', textTransform: 'capitalize', color: '#444' }}>{kayit.sagim} Sağımı</div>
                                        <button onClick={(e) => { e.stopPropagation(); gecmisSil(kayit.tarih, kayit.sagim); }} style={{ marginTop: '10px', border: 'none', backgroundColor: '#fee', color: '#e74c3c', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', width: '100%' }}>🗑️ Sil</button>
                                    </div>
                                ))}
                            </div>
                            {!tumunuGoster && gecmisKayitlar.length > 3 && (
                                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#999' }}>
                                    Toplam {gecmisKayitlar.length} kayıt var
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </ContentCard>

            <style>{`
                .calendar-container { width: 100%; }
                .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .calendar-header button { background: none; border: 1px solid #ddd; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; }
                .day-name { text-align: center; font-weight: bold; color: #999; font-size: 14px; padding-bottom: 10px; }
                .day { border: 1px solid #f0f0f0; border-radius: 8px; min-height: 50px; padding: 5px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s; font-size: 13px; }
                .day:not(.empty):hover { background-color: #fafafa; border-color: #ddd; }
                .day.today { border: 2px solid #4CAF50; background-color: #f1f8f4; }
                .day.has-data { background-color: #fff; }
                .date-num { font-weight: 600; color: #444; font-size: 13px; }
                .day-summary { display: flex; flex-direction: column; gap: 2px; align-items: flex-end; }
                .dots { display: flex; gap: 3px; }
                .dot { width: 6px; height: 6px; border-radius: 50%; }
                .dot.sabah { background-color: #FF9800; }
                .dot.aksam { background-color: #2196F3; }
                .total { font-size: 11px; color: #666; font-weight: 600; }
            `}</style>
        </PageContainer>
    );
}

export default SutKaydi;
