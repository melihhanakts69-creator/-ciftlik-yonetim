import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { FaPlus, FaBoxOpen, FaClipboardList, FaArrowDown, FaArrowUp, FaFire, FaHistory } from 'react-icons/fa';
import * as api from '../services/api';

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

const StockCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.03);

  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 6px; height: 100%;
    background: ${props => props.color};
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.08);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      color: #1a1a1a;
      font-size: 19px;
      font-weight: 700;
    }

    .badge {
      background: ${props => props.color}15; // 15% opacity
      color: ${props => props.color};
      padding: 6px 12px;
      border-radius: 30px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  .amount {
    font-size: 36px;
    font-weight: 800;
    color: ${props => props.color};
    margin: 15px 0;
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .unit {
    color: #999;
    font-size: 15px;
    font-weight: 600;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px dashed #f0f0f0;
    
    .price {
      font-size: 13px;
      color: #7f8c8d;
      font-weight: 500;
      background: #f8f9fa;
      padding: 4px 10px;
      border-radius: 8px;
    }
  }
`;

const ProgressBarContainer = styled.div`
  background: #ecf0f1;
  border-radius: 10px;
  height: 10px;
  width: 100%;
  margin-top: 15px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  width: ${props => Math.min(props.percent, 100)}%;
  background: ${props => props.color};
  border-radius: 10px;
  transition: width 0.5s ease-in-out;
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
    if (!form.miktar || form.miktar <= 0) return alert('Geçerli miktar giriniz');

    try {
      await api.createYemHareket({
        ...form,
        miktar: parseFloat(form.miktar),
        birimFiyat: parseFloat(form.birimFiyat) || 0
      });
      setModalAcik(false);
      setForm({ ...form, miktar: '', birimFiyat: '', aciklama: '' });
      fetchData();
    } catch (error) {
      alert('Kayıt eklenemedi');
    }
  };

  // Helper: Stok rengi ve durum belirleme
  const getStockStatus = (stok) => {
    // Görsel amaçlı bir 'maksimum' kapasite varsayımı yapıyoruz (minStok * 4) veya mantıklı bir üst sınır
    const maxCapacity = stok.minimumStok * 5 || 1000;
    const percent = (stok.miktar / maxCapacity) * 100;

    let color = '#4CAF50'; // Yeşil
    let status = 'İyi';

    if (stok.miktar <= stok.minimumStok) {
      color = '#f44336'; // Kırmızı
      status = 'KRİTİK';
    } else if (stok.miktar <= stok.minimumStok * 2) {
      color = '#FF9800'; // Turuncu
      status = 'AZALIYOR';
    }

    return { color, status, percent };
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
            {stoklar.map(stok => {
              const { color, status, percent } = getStockStatus(stok);
              return (
                <StockCard key={stok._id} color={color}>
                  <div className="header">
                    <h3>{stok.yemTipi}</h3>
                    <span className="badge">{status}</span>
                  </div>
                  <div className="amount">
                    {stok.miktar.toLocaleString()} <span className="unit">{stok.birim}</span>
                  </div>
                  <div className="footer">
                    <div className="unit">Min: {stok.minimumStok}</div>
                    <div className="price">{stok.birimFiyat ? `${stok.birimFiyat} ₺/kg` : '-'}</div>
                  </div>
                  <ProgressBarContainer>
                    <ProgressBarFill percent={percent} color={color} />
                  </ProgressBarContainer>
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