import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { FaPlus, FaFilter, FaArrowUp, FaArrowDown, FaTrash, FaWallet, FaExchangeAlt, FaChartBar } from 'react-icons/fa';
import * as api from '../services/api';

const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;

// --- Styled Components ---

const PageContainer = styled.div`
  padding: 20px;
  background-color: #f4f7f6;
  min-height: 100vh;
  padding-bottom: 90px;
  animation: ${fadeIn} .35s ease;

  @media (max-width: 768px) {
    padding: 12px 12px 90px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;

  h1 {
    font-size: 22px;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

const PeriodBar = styled.div`
  display: flex;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
`;

const PeriodBtn = styled.button`
  padding: 7px 14px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  transition: all .2s;
  background: ${p => p.$active ? '#1e293b' : 'white'};
  color: ${p => p.$active ? 'white' : '#64748b'};
  &:hover { background: ${p => p.$active ? '#1e293b' : '#f1f5f9'}; }
`;

const AddButton = styled.button`
  padding: 9px 18px;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all .2s;
  box-shadow: 0 2px 8px rgba(76,175,80,0.3);
  &:hover { filter: brightness(1.05); transform: translateY(-1px); }

  @media (max-width: 768px) { display: none; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const StatCard = styled.div`
  background: ${props => props.$bg || 'white'};
  border-radius: 14px;
  padding: 16px;
  color: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;

  h3 {
    margin: 0 0 4px 0;
    font-size: 11px;
    opacity: 0.85;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .value {
    font-size: 20px;
    font-weight: 900;
    margin-bottom: 3px;
    line-height: 1.1;
    
    @media (max-width: 768px) { font-size: 16px; }
  }

  .label {
    font-size: 11px;
    opacity: 0.75;
  }

  .ico {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 32px;
    opacity: 0.15;
  }
`;

const QuickFilter = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  flex-wrap: wrap;
  align-items: center;
`;

const QFBtn = styled.button`
  padding: 7px 14px;
  border-radius: 20px;
  border: 1.5px solid ${p => p.$active ? (p.$color || '#4CAF50') : '#e2e8f0'};
  background: ${p => p.$active ? (p.$bg || '#E8F5E9') : 'white'};
  color: ${p => p.$active ? (p.$color || '#2e7d32') : '#64748b'};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
  &:hover { border-color: ${p => p.$color || '#4CAF50'}; }
`;

const DateFilterBar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 12px;
  padding: 10px 14px;
  background: white;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  
  label {
    font-size: 11px; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; white-space: nowrap;
  }
  
  @media(max-width:480px){ flex-direction: column; align-items: flex-start; gap: 6px; }
`;

const DateInput = styled.input`
  padding: 7px 10px;
  border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 13px; outline: none;
  &:focus { border-color: #4CAF50; }
`;

const ClearDateBtn = styled.button`
  padding: 6px 12px; border: none; border-radius: 8px;
  background: #f1f5f9; color: #64748b; font-size: 12px;
  font-weight: 700; cursor: pointer;
  &:hover { background: #e2e8f0; }
`;

const ChartToggleBtn = styled.button`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 9px 14px;
    background: ${p => p.$open ? '#e2e8f0' : 'white'};
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
    color: #475569;
    cursor: pointer;
    margin-bottom: 12px;
    transition: all .2s;
  }
`;

const ChartSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 900px) { grid-template-columns: 1fr; }
  @media (max-width: 768px) {
    display: ${p => p.$visible ? 'grid' : 'none'};
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #f1f5f9;

  h3 {
    margin: 0 0 14px 0;
    color: #1e293b;
    font-size: 14px;
    font-weight: 700;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  h3 {
    font-size: 14px;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
  }

  .count {
    font-size: 12px;
    color: #94a3b8;
    background: #f1f5f9;
    padding: 3px 10px;
    border-radius: 20px;
    font-weight: 600;
  }
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TransactionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  border-left: 4px solid ${props => props.$type === 'gelir' ? '#4CAF50' : '#ef5350'};
  gap: 12px;
  transition: box-shadow .2s;
  &:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.08); }

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 8px;
  }

  .info {
    flex: 1;
    min-width: 0;

    .category {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      background: ${props => props.$type === 'gelir' ? '#E8F5E9' : '#FFEBEE'};
      color: ${props => props.$type === 'gelir' ? '#2E7D32' : '#C62828'};
      margin-bottom: 4px;
    }

    .date { font-size: 11px; color: #94a3b8; }
    .desc { font-size: 13px; color: #334155; margin-top: 2px; font-weight: 500; }
  }

  .amount {
    font-size: 16px;
    font-weight: 800;
    color: ${props => props.$type === 'gelir' ? '#4CAF50' : '#ef5350'};
    white-space: nowrap;
  }

  .delete-btn {
    background: #fff1f2; color: #e74c3c; border: none;
    width: 34px; height: 34px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s; flex-shrink: 0;
    &:hover { background: #fecdd3; }
  }
`;

const FAB = styled.button`
  position: fixed; bottom: 76px; right: 16px;
  width: 54px; height: 54px; border-radius: 27px;
  background: #4CAF50; color: white; border: none;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4);
  display: none; align-items: center; justify-content: center;
  font-size: 22px; cursor: pointer; z-index: 99; transition: transform 0.2s;
  &:hover { transform: scale(1.1); }
  &:active { transform: scale(0.95); }

  @media (max-width: 768px) { display: flex; }
`;

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); display: flex; align-items: center;
  justify-content: center; z-index: 1000; padding: 16px;
`;

const ModalContent = styled.div`
  background: white; border-radius: 20px; padding: 24px;
  width: 100%; max-width: 480px; max-height: 90vh;
  overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  animation: ${fadeIn} .25s ease;

  h2 { margin-top: 0; color: #1e293b; font-size: 18px; font-weight: 800; }
`;

const InputGroup = styled.div`
  margin-bottom: 14px;
  label {
    display: block; font-size: 12px; font-weight: 700; color: #334155;
    text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 5px;
  }
  input, select {
    width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 9px;
    font-size: 14px; outline: none; box-sizing: border-box; background: #f8fafc;
    &:focus { border-color: #4CAF50; background: white; }
  }
`;

const Button = styled.button`
  padding: 11px 22px;
  background: ${props => props.$primary ? 'linear-gradient(135deg, #4CAF50, #45a049)' : '#f1f5f9'};
  color: ${props => props.$primary ? 'white' : '#475569'};
  border: none; border-radius: 10px; font-weight: 700; font-size: 14px;
  cursor: pointer; flex: 1; transition: all .2s;
  &:hover { filter: brightness(${p => p.$primary ? '1.05' : '0.95'}); }
`;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

const getPeriodDates = (period) => {
  const now = new Date();
  if (period === 'bu_ay') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { baslangic: start.toISOString().split('T')[0], bitis: '' };
  }
  if (period === 'bu_yil') {
    const start = new Date(now.getFullYear(), 0, 1);
    return { baslangic: start.toISOString().split('T')[0], bitis: '' };
  }
  return { baslangic: '', bitis: '' };
};

function Finansal() {
  const location = useLocation();
  const [kayitlar, setKayitlar] = useState([]);
  const [ozet, setOzet] = useState(null);
  const [eklemeEkrani, setEklemeEkrani] = useState(!!location.state?.openAdd);
  const [donem, setDonem] = useState('bu_ay');
  const [tipFilter, setTipFilter] = useState('');
  const [showCharts, setShowCharts] = useState(false);
  const [filtreleme, setFiltreleme] = useState(() => getPeriodDates('bu_ay'));
  const [customBaslangic, setCustomBaslangic] = useState('');
  const [customBitis, setCustomBitis] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);

  const [form, setForm] = useState({
    tip: 'gider', kategori: 'yem', miktar: '',
    tarih: new Date().toISOString().split('T')[0], aciklama: ''
  });

  const gelirKategorileri = [
    { value: 'sut-satisi', label: '🥛 Süt Satışı' },
    { value: 'hayvan-satisi', label: '🐄 Hayvan Satışı' },
    { value: 'diger-gelir', label: '💰 Diğer Gelir' }
  ];
  const giderKategorileri = [
    { value: 'yem', label: '🌾 Yem' },
    { value: 'veteriner', label: '💉 Veteriner' },
    { value: 'hayvan-olum', label: '💀 Hayvan Ölümü' },
    { value: 'iscilik', label: '👷 İşçilik' },
    { value: 'elektrik', label: '💡 Elektrik' },
    { value: 'su', label: '💧 Su' },
    { value: 'bakim-onarim', label: '🔧 Bakım-Onarım' },
    { value: 'diger-gider', label: '💸 Diğer Gider' }
  ];

  useEffect(() => { kayitlariYukle(); ozetYukle(); }, [filtreleme, tipFilter]);

  const handleDonemChange = (d) => {
    setDonem(d);
    setFiltreleme(getPeriodDates(d));
    setCustomBaslangic('');
    setCustomBitis('');
    setShowDateFilter(false);
  };

  const handleCustomDateApply = () => {
    if (customBaslangic || customBitis) {
      setDonem('ozel');
      setFiltreleme({ baslangic: customBaslangic, bitis: customBitis });
    }
  };

  const handleClearCustomDate = () => {
    setCustomBaslangic('');
    setCustomBitis('');
    setShowDateFilter(false);
    handleDonemChange('bu_ay');
  };

  const kayitlariYukle = async () => {
    try {
      const params = {};
      if (tipFilter) params.tip = tipFilter;
      if (filtreleme.baslangic) params.baslangic = filtreleme.baslangic;
      if (filtreleme.bitis) params.bitis = filtreleme.bitis;
      const response = await api.getFinansalKayitlar(params);
      setKayitlar(response.data);
    } catch (error) { console.error('Hata:', error); }
  };

  const ozetYukle = async () => {
    try {
      const params = {};
      if (filtreleme.baslangic) params.baslangic = filtreleme.baslangic;
      if (filtreleme.bitis) params.bitis = filtreleme.bitis;
      const response = await api.getFinansalOzet(params);
      setOzet(response.data);
    } catch (error) { console.error('Özet hata:', error); }
  };

  const kayitEkle = async () => {
    if (!form.miktar || form.miktar <= 0) return alert('Miktar giriniz!');
    try {
      await api.createFinansalKayit({ ...form, miktar: parseFloat(form.miktar) });
      setEklemeEkrani(false);
      setForm({ ...form, miktar: '', aciklama: '' });
      kayitlariYukle(); ozetYukle();
    } catch { alert('Kayıt başarısız'); }
  };

  const kayitSil = async (id) => {
    if (!window.confirm('Emin misiniz?')) return;
    try { await api.deleteFinansalKayit(id); kayitlariYukle(); ozetYukle(); }
    catch { alert('Silinemedi'); }
  };

  const kategoriGetir = (tip, kat) => {
    const list = tip === 'gelir' ? gelirKategorileri : giderKategorileri;
    return list.find(k => k.value === kat)?.label || kat;
  };

  const pieData = ozet ? [
    { name: 'Gelir', value: ozet.toplamGelir },
    { name: 'Gider', value: ozet.toplamGider }
  ] : [];

  const giderDagilimi = kayitlar
    .filter(k => k.tip === 'gider')
    .reduce((acc, curr) => {
      const kat = kategoriGetir('gider', curr.kategori);
      const ex = acc.find(i => i.name === kat);
      if (ex) ex.value += curr.miktar;
      else acc.push({ name: kat, value: curr.miktar });
      return acc;
    }, []);

  return (
    <PageContainer>
      <Header>
        <h1><FaWallet /> Finansal Yönetim</h1>
        <div className="header-actions">
          <PeriodBar>
            <PeriodBtn $active={donem === 'bu_ay'} onClick={() => handleDonemChange('bu_ay')}>Bu Ay</PeriodBtn>
            <PeriodBtn $active={donem === 'bu_yil'} onClick={() => handleDonemChange('bu_yil')}>Bu Yıl</PeriodBtn>
            <PeriodBtn $active={donem === 'tumu'} onClick={() => handleDonemChange('tumu')}>Tümü</PeriodBtn>
          </PeriodBar>
          <AddButton onClick={() => setEklemeEkrani(true)}><FaPlus /> Yeni Kayıt</AddButton>
        </div>
      </Header>

      {/* Özet Kartlar */}
      {ozet && (
        <StatsGrid>
          <StatCard $bg="linear-gradient(135deg, #4CAF50, #45a049)">
            <h3>Toplam Gelir</h3>
            <div className="value">+{ozet.toplamGelir.toLocaleString('tr-TR')} ₺</div>
            <div className="label">{donem === 'bu_ay' ? 'Bu ay' : donem === 'bu_yil' ? 'Bu yıl' : 'Tüm kayıtlar'}</div>
            <FaArrowUp className="ico" />
          </StatCard>
          <StatCard $bg="linear-gradient(135deg, #ef5350, #e53935)">
            <h3>Toplam Gider</h3>
            <div className="value">-{ozet.toplamGider.toLocaleString('tr-TR')} ₺</div>
            <div className="label">{donem === 'bu_ay' ? 'Bu ay' : donem === 'bu_yil' ? 'Bu yıl' : 'Tüm kayıtlar'}</div>
            <FaArrowDown className="ico" />
          </StatCard>
          <StatCard $bg={ozet.netKar >= 0 ? "linear-gradient(135deg, #42a5f5, #1e88e5)" : "linear-gradient(135deg, #ffa726, #fb8c00)"}>
            <h3>Net Durum</h3>
            <div className="value">{ozet.netKar.toLocaleString('tr-TR')} ₺</div>
            <div className="label">{ozet.netKar >= 0 ? 'Kârdayız 📈' : 'Zarardayız 📉'}</div>
            <FaExchangeAlt className="ico" />
          </StatCard>
        </StatsGrid>
      )}

      {/* Hızlı Filtre Bar */}
      <QuickFilter>
        <QFBtn $active={tipFilter === ''} $color="#334155" $bg="#f1f5f9" onClick={() => setTipFilter('')}>Tümü ({kayitlar.length})</QFBtn>
        <QFBtn $active={tipFilter === 'gelir'} $color="#2e7d32" $bg="#E8F5E9" onClick={() => setTipFilter('gelir')}>
          <FaArrowUp size={10} /> Gelirler
        </QFBtn>
        <QFBtn $active={tipFilter === 'gider'} $color="#C62828" $bg="#FFEBEE" onClick={() => setTipFilter('gider')}>
          <FaArrowDown size={10} /> Giderler
        </QFBtn>
        <QFBtn $active={showDateFilter || donem === 'ozel'} $color="#1d4ed8" $bg="#dbeafe"
          onClick={() => setShowDateFilter(p => !p)}>
          📅 Tarih Filtresi
        </QFBtn>
      </QuickFilter>

      {/* Tarih Aralığı Filtresi */}
      {(showDateFilter || donem === 'ozel') && (
        <DateFilterBar>
          <label>Başlangıç:</label>
          <DateInput type="date" value={customBaslangic}
            onChange={e => setCustomBaslangic(e.target.value)} />
          <label>Bitiş:</label>
          <DateInput type="date" value={customBitis}
            onChange={e => setCustomBitis(e.target.value)} />
          <QFBtn $active={true} $color="#1d4ed8" $bg="#dbeafe"
            style={{ padding: '7px 14px' }}
            onClick={handleCustomDateApply}>
            Uygula
          </QFBtn>
          <ClearDateBtn onClick={handleClearCustomDate}>Temizle</ClearDateBtn>
          {donem === 'ozel' && (
            <span style={{ fontSize: 11, color: '#64748b', marginLeft: 4 }}>
              {customBaslangic && `${new Date(customBaslangic).toLocaleDateString('tr-TR')}`}
              {customBaslangic && customBitis && ' — '}
              {customBitis && `${new Date(customBitis).toLocaleDateString('tr-TR')}`}
            </span>
          )}
        </DateFilterBar>
      )}

      {/* Grafik Toggle (sadece mobilde) */}
      <ChartToggleBtn $open={showCharts} onClick={() => setShowCharts(p => !p)}>
        <FaChartBar size={13} />
        {showCharts ? 'Grafikleri Gizle' : 'Grafikleri Göster'}
      </ChartToggleBtn>

      {/* Grafikler */}
      <ChartSection $visible={showCharts}>
        <ChartCard>
          <h3>📊 Gelir / Gider Dengesi</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'Gelir' ? '#4CAF50' : '#ef5350'} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value) => `${value.toLocaleString('tr-TR')} ₺`} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <h3>💸 Gider Dağılımı</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={giderDagilimi}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${v}`} />
              <RechartsTooltip formatter={(value) => `${value.toLocaleString('tr-TR')} ₺`} />
              <Bar dataKey="value" name="Tutar" radius={[6, 6, 0, 0]} barSize={40}>
                {giderDagilimi.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartSection>

      {/* Liste */}
      <SectionHeader>
        <h3>Son İşlemler</h3>
        <span className="count">{kayitlar.length} kayıt</span>
      </SectionHeader>
      <TransactionList>
        {kayitlar.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '30px', background: 'white', borderRadius: 12, fontSize: 14 }}>
            Bu dönemde kayıt bulunamadı.
          </div>
        ) : (
          kayitlar.map(kayit => (
            <TransactionCard key={kayit._id} $type={kayit.tip}>
              <div className="info">
                <span className="category">{kategoriGetir(kayit.tip, kayit.kategori)}</span>
                <div className="desc">{kayit.aciklama || 'Açıklama yok'}</div>
                <span className="date">{new Date(kayit.tarih).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="amount">
                {kayit.tip === 'gelir' ? '+' : '-'}{kayit.miktar.toLocaleString('tr-TR')} ₺
              </div>
              <button className="delete-btn" onClick={() => kayitSil(kayit._id)}>
                <FaTrash size={13} />
              </button>
            </TransactionCard>
          ))
        )}
      </TransactionList>

      <FAB onClick={() => setEklemeEkrani(true)}><FaPlus /></FAB>

      {eklemeEkrani && (
        <ModalOverlay onClick={() => setEklemeEkrani(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h2>{form.tip === 'gelir' ? '💰 Gelir Ekle' : '💸 Gider Ekle'}</h2>
            <InputGroup>
              <label>Tip</label>
              <select value={form.tip} onChange={e => setForm({ ...form, tip: e.target.value, kategori: e.target.value === 'gelir' ? 'sut-satisi' : 'yem' })}>
                <option value="gelir">Gelir</option>
                <option value="gider">Gider</option>
              </select>
            </InputGroup>
            <InputGroup>
              <label>Kategori</label>
              <select value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}>
                {(form.tip === 'gelir' ? gelirKategorileri : giderKategorileri).map(k => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </select>
            </InputGroup>
            <InputGroup>
              <label>Miktar (₺)</label>
              <input type="number" placeholder="0.00" value={form.miktar} onChange={e => setForm({ ...form, miktar: e.target.value })} />
            </InputGroup>
            <InputGroup>
              <label>Tarih</label>
              <input type="date" value={form.tarih} onChange={e => setForm({ ...form, tarih: e.target.value })} />
            </InputGroup>
            <InputGroup>
              <label>Açıklama</label>
              <input type="text" placeholder="Detay..." value={form.aciklama} onChange={e => setForm({ ...form, aciklama: e.target.value })} />
            </InputGroup>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button onClick={() => setEklemeEkrani(false)}>İptal</Button>
              <Button $primary onClick={kayitEkle}>Kaydet</Button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
}

export default Finansal;
