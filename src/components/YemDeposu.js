import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { FaPlus, FaBoxOpen, FaClipboardList, FaArrowDown, FaArrowUp, FaFire, FaHistory, FaExclamationTriangle } from 'react-icons/fa';
import * as api from '../services/api';
import { showSuccess, showError, showWarning } from '../utils/toast';

// --- Styled Components ---

const PageContainer = styled.div`
  padding: 20px;
  background-color: #f4f7f6;
  min-height: 100vh;
  padding-bottom: 80px;

  @media (max-width: 768px) {
    padding: 10px;
    padding-bottom: 80px;
  }
`;

const Header = styled.div`
  margin-bottom: 20px;
  h1 {
    font-size: 28px;
    font-weight: 800;
    color: #2c3e50;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;

    @media (max-width: 768px) {
      font-size: 24px;
    }
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
`;

const TabButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.active ? '#4CAF50' : '#7f8c8d'};
  cursor: pointer;
  position: relative;
  padding: 5px 10px;

  &:after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 0;
    width: 100%;
    height: 3px;
    background: #4CAF50;
    transform: scaleX(${props => props.active ? 1 : 0});
    transition: transform 0.2s;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

// --- Premium Animations ---
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(244,67,54,0.3); }
  50% { box-shadow: 0 0 20px rgba(244,67,54,0.6); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const floatIcon = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-3px) rotate(2deg); }
`;

const StockCard = styled.div`
  background: linear-gradient(145deg, #ffffff 0%, #f8fffe 50%, ${props => props.color}08 100%);
  border-radius: 24px;
  padding: 28px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 1px solid ${props => props.color}20;
  animation: ${fadeInUp} 0.5s ease both;
  animation-delay: ${props => props.index * 0.08}s;

  /* Üst gradient şerit */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${props => props.color}, ${props => props.color}88, ${props => props.color});
    background-size: 200% 100%;
    animation: ${shimmer} 3s ease-in-out infinite;
  }

  /* Dekoratif arka plan elementi */
  &::after {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 120px; height: 120px;
    border-radius: 50%;
    background: ${props => props.color}08;
    transition: all 0.4s ease;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 
      0 20px 40px ${props => props.color}15,
      0 8px 16px rgba(0,0,0,0.06);
    border-color: ${props => props.color}40;

    &::after {
      transform: scale(1.5);
      background: ${props => props.color}12;
    }

    .type-icon {
      animation: ${floatIcon} 1s ease-in-out infinite;
    }
  }

  ${props => props.isCritical && `
    animation: ${fadeInUp} 0.5s ease both;
    border-color: #f4433640;
    &:hover {
      box-shadow: 0 20px 40px rgba(244,67,54,0.15), 0 8px 16px rgba(0,0,0,0.06);
    }
  `}

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
  }

  .type-info {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .type-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: ${props => props.color}12;
    border: 1px solid ${props => props.color}20;
    transition: all 0.3s ease;
  }

  .type-name {
    h3 {
      margin: 0;
      color: #1a1a1a;
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }
    .sub {
      font-size: 12px;
      color: #999;
      margin-top: 3px;
      font-weight: 500;
    }
  }

  .status-badge {
    padding: 6px 14px;
    border-radius: 30px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    display: flex;
    align-items: center;
    gap: 5px;
    background: ${props => props.color}15;
    color: ${props => props.color};
    border: 1px solid ${props => props.color}25;
    ${props => props.isCritical && `
      animation: ${pulseGlow} 2s ease-in-out infinite;
    `}
  }

  .amount-section {
    position: relative;
    z-index: 1;
    margin: 16px 0 20px 0;
  }

  .amount-value {
    font-size: 42px;
    font-weight: 900;
    color: #1a1a1a;
    line-height: 1;
    display: flex;
    align-items: baseline;
    gap: 8px;
    letter-spacing: -1px;
  }

  .amount-unit {
    font-size: 16px;
    color: #999;
    font-weight: 600;
    letter-spacing: 0;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid ${props => props.color}10;
    position: relative;
    z-index: 1;
  }

  .footer-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .footer-label {
      font-size: 11px;
      color: #aaa;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .footer-value {
      font-size: 14px;
      color: #555;
      font-weight: 700;
    }
  }

  .price-tag {
    background: linear-gradient(135deg, ${props => props.color}10, ${props => props.color}05);
    color: ${props => props.color};
    padding: 6px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    border: 1px solid ${props => props.color}15;
  }
`;

const ProgressSection = styled.div`
  position: relative;
  z-index: 1;
  margin-top: 6px;

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .progress-label {
      font-size: 11px;
      color: #aaa;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .progress-percent {
      font-size: 13px;
      font-weight: 800;
      color: ${props => props.color};
    }
  }
`;

const ProgressBarContainer = styled.div`
  background: linear-gradient(90deg, #f0f0f0, #e8e8e8);
  border-radius: 12px;
  height: 10px;
  width: 100%;
  overflow: hidden;
  position: relative;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  width: ${props => Math.min(props.percent, 100)}%;
  background: linear-gradient(90deg, ${props => props.color}cc, ${props => props.color});
  border-radius: 12px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 2px 6px ${props => props.color}40;

  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255,255,255,0.3) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 2s ease-in-out infinite;
    border-radius: 12px;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  margin-bottom: 30px;
  height: 400px;
  border: 1px solid rgba(0,0,0,0.03);

  h3 {
    margin: 0 0 25px 0;
    color: #1a1a1a;
    font-size: 18px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const MovementList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const MovementCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);

  .left {
    display: flex;
    align-items: center;
    gap: 15px;

    .icon {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
  }

  .info {
    h4 { margin: 0 0 4px 0; color: #2c3e50; font-size: 16px; }
    p { margin: 0; color: #7f8c8d; font-size: 12px; }
  }

  .amount {
    font-weight: 800;
    font-size: 18px;
  }
`;

const FAB = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: #4CAF50;
  color: white;
  border: none;
  box-shadow: 0 4px 20px rgba(76, 175, 80, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  z-index: 99;
  transition: transform 0.2s;

  &:hover { transform: scale(1.1); }
  &:active { transform: scale(0.95); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 25px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);

  h2 { margin-top: 0; color: #2c3e50; }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: ${props => props.primary ? '#4CAF50' : '#eee'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  width: ${props => props.full ? '100%' : 'auto'};
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #2c3e50;
  }
  input, select, textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    outline: none;
    &:focus { border-color: #4CAF50; }
  }
`;

const YemDeposu = ({ isEmbedded = false }) => {
  const [stoklar, setStoklar] = useState([]);
  const [hareketler, setHareketler] = useState([]);
  const [aktifSekme, setAktifSekme] = useState('stok');
  const [modalAcik, setModalAcik] = useState(false);
  const [ayarlar, setAyarlar] = useState(null);

  // Form State
  const [form, setForm] = useState({
    yemTipi: 'Karma Yem',
    hareketTipi: 'Alım',
    miktar: '',
    birimFiyat: '',
    tarih: new Date().toISOString().split('T')[0],
    aciklama: ''
  });

  const yemTipleri = [
    'Süt Yemi',
    'Besi Yemi',
    'Düve Yemi',
    'Buzağı Başlangıç Yemi',
    'Buzağı Geliştirme Yemi',
    'Mısır Silajı',
    'Pancar Küspesi',
    'Yonca Balyası',
    'Yulaf Balyası',
    'Korunga Balyası',
    'Fiğ Balyası',
    'Çayır Balyası',
    'Saman Balyası',
    'Arpa',
    'Mısır (Dane)',
    'Kepek',
    'Diğer'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [stokRes, hareketRes, ayarRes] = await Promise.all([
        api.getYemStok(),
        api.getYemHareketler(),
        api.getAyarlar()
      ]);
      setStoklar(stokRes.data);
      setHareketler(hareketRes.data);
      setAyarlar(ayarRes.data);
    } catch (error) {
      console.error('Veri hatası:', error);
    }
  };

  const hareketEkle = async () => {
    if (!form.miktar || form.miktar <= 0) return showWarning('Geçerli bir miktar giriniz');

    try {
      await api.createYemHareket({
        ...form,
        miktar: parseFloat(form.miktar),
        birimFiyat: parseFloat(form.birimFiyat) || 0
      });
      setModalAcik(false);
      setForm({ ...form, miktar: '', birimFiyat: '', aciklama: '' });
      showSuccess('Hareket başarıyla eklendi! 🎉');
      fetchData();
    } catch (error) {
      showError('Kayıt eklenemedi');
    }
  };

  // Helper: Stok rengi ve durum belirleme
  const getStockStatus = (stok) => {
    const maxCapacity = stok.minimumStok * 5 || 1000;
    const percent = (stok.miktar / maxCapacity) * 100;

    let color = '#4CAF50';
    let status = 'İyi';
    let statusIcon = '✅';
    let isCritical = false;

    if (stok.miktar <= stok.minimumStok) {
      color = '#f44336';
      status = 'KRİTİK';
      statusIcon = '🔴';
      isCritical = true;
    } else if (stok.miktar <= stok.minimumStok * 2) {
      color = '#FF9800';
      status = 'AZALIYOR';
      statusIcon = '🟡';
    }

    return { color, status, percent, statusIcon, isCritical };
  };

  // Helper: Yem tipine göre ikon belirleme
  const getYemIcon = (yemTipi) => {
    const iconMap = {
      'Süt Yemi': '🥛',
      'Besi Yemi': '🐂',
      'Düve Yemi': '🐮',
      'Buzağı Başlangıç Yemi': '🍼',
      'Buzağı Geliştirme Yemi': '🐄',
      'Mısır Silajı': '🌽',
      'Pancar Küspesi': '🥬',
      'Yonca Balyası': '🌿',
      'Yulaf Balyası': '🌾',
      'Korunga Balyası': '🌱',
      'Fiğ Balyası': '☘️',
      'Çayır Balyası': '🌾',
      'Saman Balyası': '🟨',
      'Arpa': '🌾',
      'Mısır (Dane)': '🌽',
      'Kepek': '🫘',
      'Karma Yem': '🧪'
    };
    return iconMap[yemTipi] || '📦';
  };

  // Helper: Hareket ikonu ve rengi
  const getMovementStyle = (type) => {
    switch (type) {
      case 'Alım': return { icon: <FaArrowUp />, color: '#4CAF50', bg: '#E8F5E9' };
      case 'Tüketim': return { icon: <FaArrowDown />, color: '#FF9800', bg: '#FFF3E0' };
      case 'Fire': return { icon: <FaFire />, color: '#f44336', bg: '#FFEBEE' };
      default: return { icon: <FaHistory />, color: '#95a5a6', bg: '#ecf0f1' };
    }
  };

  // Chart Data: Son 7 günlük tüketim
  const consumptionData = React.useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dailyTotal = hareketler
        .filter(h => h.hareketTipi === 'Tüketim' && h.tarih.startsWith(date))
        .reduce((acc, curr) => acc + curr.miktar, 0);
      return {
        name: new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        tuketim: dailyTotal
      };
    });
  }, [hareketler]);

  const Content = (
    <>
      {!isEmbedded && (
        <Header>
          <h1>🌾 Yem Deposu</h1>
        </Header>
      )}

      <TabContainer>
        <TabButton active={aktifSekme === 'stok'} onClick={() => setAktifSekme('stok')}>
          <FaBoxOpen /> Stoklar
        </TabButton>
        <TabButton active={aktifSekme === 'hareketler'} onClick={() => setAktifSekme('hareketler')}>
          <FaClipboardList /> Hareketler
        </TabButton>
      </TabContainer>

      {aktifSekme === 'stok' && (
        <>
          {/* Tüketim Grafiği */}
          <ChartCard>
            <h3>📉 Yem Tüketim Trendi (Son 7 Gün)</h3>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#777' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="tuketim" name="Tüketim (kg)" stroke="#FF9800" strokeWidth={4} dot={{ r: 5, fill: '#FF9800', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Stok Grid */}
          <Grid>
            {stoklar.map((stok, index) => {
              const { color, status, percent, statusIcon, isCritical } = getStockStatus(stok);
              const yemIcon = getYemIcon(stok.yemTipi);
              return (
                <StockCard key={stok._id} color={color} isCritical={isCritical} index={index}>
                  <div className="card-header">
                    <div className="type-info">
                      <div className="type-icon">{yemIcon}</div>
                      <div className="type-name">
                        <h3>{stok.yemTipi}</h3>
                        <div className="sub">Minimum: {stok.minimumStok} {stok.birim}</div>
                      </div>
                    </div>
                    <div className="status-badge">
                      {isCritical && <FaExclamationTriangle size={10} />}
                      {statusIcon} {status}
                    </div>
                  </div>

                  <div className="amount-section">
                    <div className="amount-value">
                      {stok.miktar.toLocaleString('tr-TR')}
                      <span className="amount-unit">{stok.birim}</span>
                    </div>
                  </div>

                  <ProgressSection color={color}>
                    <div className="progress-header">
                      <span className="progress-label">Doluluk</span>
                      <span className="progress-percent">{Math.min(Math.round(percent), 100)}%</span>
                    </div>
                    <ProgressBarContainer>
                      <ProgressBarFill percent={percent} color={color} />
                    </ProgressBarContainer>
                  </ProgressSection>

                  <div className="card-footer">
                    <div className="footer-item">
                      <span className="footer-label">Birim Fiyat</span>
                      <span className="footer-value">{stok.birimFiyat ? `${stok.birimFiyat.toLocaleString('tr-TR')} ₺/${stok.birim}` : '—'}</span>
                    </div>
                    <div className="price-tag">
                      {stok.birimFiyat && stok.miktar ? `${(stok.birimFiyat * stok.miktar).toLocaleString('tr-TR')} ₺` : '—'}
                    </div>
                  </div>
                </StockCard>
              );
            })}
          </Grid>
        </>
      )}

      {aktifSekme === 'hareketler' && (
        <MovementList>
          {hareketler.map(h => {
            const style = getMovementStyle(h.hareketTipi);
            return (
              <MovementCard key={h._id}>
                <div className="left">
                  <div className="icon" style={{ background: style.bg, color: style.color }}>
                    {style.icon}
                  </div>
                  <div className="info">
                    <h4>{h.yemTipi} ({h.hareketTipi})</h4>
                    <p>{new Date(h.tarih).toLocaleDateString('tr-TR')} • {h.aciklama || 'Açıklama yok'}</p>
                  </div>
                </div>
                <div className="amount" style={{ color: style.color }}>
                  {h.hareketTipi === 'Alım' ? '+' : '-'}{h.miktar} kg
                </div>
              </MovementCard>
            );
          })}
        </MovementList>
      )}

      <FAB onClick={() => setModalAcik(true)}>
        <FaPlus />
      </FAB>

      {modalAcik && (
        <ModalOverlay onClick={() => setModalAcik(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h2>Hareket Ekle</h2>
            <InputGroup>
              <label>Hareket Tipi</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['Alım', 'Tüketim', 'Fire'].map(type => (
                  <Button
                    key={type}
                    primary={form.hareketTipi === type}
                    onClick={() => setForm({ ...form, hareketTipi: type })}
                    style={{ flex: 1 }}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </InputGroup>

            <InputGroup>
              <label>Yem Tipi</label>
              <select value={form.yemTipi} onChange={e => setForm({ ...form, yemTipi: e.target.value })}>
                {yemTipleri.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </InputGroup>

            <InputGroup>
              <label>Miktar (kg)</label>
              <input type="number" value={form.miktar} onChange={e => setForm({ ...form, miktar: e.target.value })} />
            </InputGroup>

            {form.hareketTipi === 'Alım' && (
              <InputGroup>
                <label>Birim Fiyat (₺)</label>
                <input type="number" value={form.birimFiyat} onChange={e => setForm({ ...form, birimFiyat: e.target.value })} />
              </InputGroup>
            )}

            <InputGroup>
              <label>Tarih</label>
              <input type="date" value={form.tarih} onChange={e => setForm({ ...form, tarih: e.target.value })} />
            </InputGroup>

            <InputGroup>
              <label>Açıklama</label>
              <input type="text" value={form.aciklama} onChange={e => setForm({ ...form, aciklama: e.target.value })} />
            </InputGroup>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button full onClick={() => setModalAcik(false)}>İptal</Button>
              <Button full primary onClick={hareketEkle}>Kaydet</Button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );

  if (isEmbedded) {
    return <div>{Content}</div>;
  }

  return (
    <PageContainer>
      {Content}
    </PageContainer>
  );
};

export default YemDeposu;