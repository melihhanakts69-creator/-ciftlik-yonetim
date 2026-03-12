import { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import * as api from '../services/api';
import {
  FiDroplet, FiCalendar, FiClock, FiPlus, FiArrowRight,
  FiTrash2, FiActivity, FiCheckCircle, FiChevronLeft, FiChevronRight, FiList
} from 'react-icons/fi';
import { showSuccess, showError, showWarning } from '../utils/toast';

const fadeIn = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;

const Container = styled.div`
  padding: 32px 40px;
  background: #f8fafc;
  min-height: calc(100vh - 80px);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const TitleContent = styled.div`
  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
  }
  p {
    font-size: 14px;
    color: #64748b;
    margin: 0;
  }
`;

const ActionButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
  
  &:hover {
    background: #059669;
    box-shadow: 0 6px 8px -1px rgba(16, 185, 129, 0.3);
  }
`;

// Metrics Section
const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.4s ease-out forwards;
  animation-delay: ${p => p.$delay || '0s'};
  opacity: 0;

  @media (max-width: 640px) {
    padding: 14px;
    border-radius: 10px;
    .metric-value { font-size: 22px !important; }
  }
  
  .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }
  
  .metric-title {
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .metric-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: ${p => p.$bg || '#f1f5f9'};
    color: ${p => p.$color || '#64748b'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }
  
  .metric-value {
    font-size: 32px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -1px;
    display: flex;
    align-items: baseline;
    gap: 4px;
    
    span {
      font-size: 14px;
      font-weight: 500;
      color: #94a3b8;
      letter-spacing: 0;
    }
  }
`;

// Main Layout
const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const SectionPanel = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  
  h2 {
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  @media (max-width: 768px) {
    padding: 14px 16px;
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const PanelBody = styled.div`
  padding: 24px;
  flex: 1;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

// Log Form
const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 15px;
  color: #0f172a;
  transition: all 0.2s;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  .icon-left {
    position: absolute;
    left: 16px;
    color: #64748b;
    font-size: 18px;
  }
  
  .text-right {
    position: absolute;
    right: 16px;
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
  }
  
  input {
    padding-left: 44px;
    font-size: 24px;
    font-weight: 600;
    height: 60px;
    color: #0f172a;
  }
`;

const SelectCards = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const SelectCardOpt = styled.div`
  border: 1px solid ${p => p.$active ? '#3b82f6' : '#e2e8f0'};
  background: ${p => p.$active ? '#eff6ff' : '#fff'};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  
  &:hover {
    border-color: ${p => p.$active ? '#3b82f6' : '#cbd5e1'};
  }
  
  .icon {
    font-size: 20px;
    color: ${p => p.$active ? '#3b82f6' : '#64748b'};
    margin-top: 2px;
  }
  
  .content {
    h4 {
      margin: 0 0 4px 0;
      font-size: 14px;
      font-weight: 600;
      color: ${p => p.$active ? '#1e3a8a' : '#334155'};
    }
    p {
      margin: 0;
      font-size: 12px;
      color: #64748b;
      line-height: 1.4;
    }
  }
`;

const PrimaryButton = styled.button`
  width: 100%;
  padding: 14px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
  
  &:hover:not(:disabled) {
    background: #2563eb;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Preview Table
const TableContainer = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  max-height: 280px;
  overflow-y: auto;
  overflow-x: auto;
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th {
    background: #f8fafc;
    padding: 12px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
  }
  
  td {
    padding: 12px 16px;
    font-size: 14px;
    color: #334155;
    border-bottom: 1px solid #e2e8f0;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  .amount-col {
    text-align: right;
    font-weight: 600;
    color: #0f172a;
  }
`;

const SummaryBox = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .info {
    font-size: 13px;
    color: #64748b;
    line-height: 1.5;
    strong { color: #0f172a; font-size: 14px; }
  }
  
  .total {
    font-size: 24px;
    font-weight: 700;
    color: #10b981;
    display: flex;
    align-items: baseline;
    gap: 4px;
    
    span {
      font-size: 14px;
      font-weight: 500;
      color: #94a3b8;
    }
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  
  button {
    flex: 1;
    padding: 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
  
  .btn-outline {
    background: white;
    border: 1px solid #cbd5e1;
    color: #475569;
    
    &:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }
  }
  
  .btn-success {
    background: #10b981;
    border: none;
    color: white;
    
    &:hover:not(:disabled) {
      background: #059669;
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

// History List
const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 480px;
  overflow-y: auto;
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

const HistoryItem = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
  
  &:hover {
    background: #f8fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  .h-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0;
  }
  
  .h-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: ${p => p.$isSabah ? '#fffbeb' : '#eff6ff'};
    color: ${p => p.$isSabah ? '#d97706' : '#2563eb'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  
  .h-date {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .h-meta {
    font-size: 12px;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .h-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    .h-left { gap: 10px; }
    .h-icon { width: 36px; height: 36px; font-size: 16px; }
  }
  
  .h-amount {
    text-align: right;
    
    .val {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }
    
    .unit {
      font-size: 12px;
      color: #94a3b8;
    }
  }
  
  .h-action {
    color: #cbd5e1;
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      color: #ef4444;
      background: #fef2f2;
    }
  }
`;

const EmptyState = styled.div`
  padding: 48px 24px;
  text-align: center;
  
  .icon-wrap {
    width: 64px;
    height: 64px;
    background: #f1f5f9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    color: #94a3b8;
    font-size: 24px;
  }
  
  h4 {
    margin: 0 0 8px 0;
    color: #0f172a;
    font-size: 15px;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    color: #64748b;
    font-size: 13px;
  }
`;

// Simple Calendar
const SimpleCalendar = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  
  .cal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
      text-transform: capitalize;
    }
    
    .nav-btns {
      display: flex;
      gap: 6px;
      
      button {
        background: white;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #475569;
        transition: all 0.2s;
        
        &:hover {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #94a3b8;
        }
      }
    }
  }
  
  .cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
    
    .day-name {
      text-align: center;
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      padding-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .day-cell {
      aspect-ratio: 1;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      position: relative;
      background: ${p => p.$hasData ? '#dcfce7' : 'white'};
      color: ${p => p.$hasData ? '#047857' : '#475569'};
      font-weight: ${p => p.$hasData ? '600' : '500'};
      border: 1px solid ${p => p.$hasData ? '#bbf7d0' : '#e2e8f0'};
      
      &.today {
        border: 1.5px solid #3b82f6;
        color: ${p => p.$hasData ? '#047857' : '#1d4ed8'};
      }
      
      .indicator {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: #10b981;
        position: absolute;
        bottom: 6px;
      }
    }
  }
  
  .cal-legend {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 16px;
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
      
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 2px;
        background: #dcfce7;
        border: 1px solid #bbf7d0;
      }
    }
  }
`;

export default function SutKaydi() {
  const today = new Date().toLocaleDateString('en-CA');

  const [tarih, setTarih] = useState(today);
  const [sagim, setSagim] = useState('sabah');
  const [miktar, setMiktar] = useState('');
  const [dagilim, setDagilim] = useState('akilli');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [onizleme, setOnizleme] = useState(null);
  const [adim, setAdim] = useState(1);
  const [gecmis, setGecmis] = useState([]);

  // Calendar state
  const [calDate, setCalDate] = useState(new Date());

  useEffect(() => { getGecmis(); }, []);

  const getGecmis = async () => {
    try { const r = await api.topluSutGecmis(90); setGecmis(r.data || []); }
    catch (e) { console.error(e); }
  };

  const stats = useMemo(() => {
    const prefix = today.slice(0, 7);
    const buAy = gecmis.filter(k => k.tarih?.startsWith(prefix));
    const toplamAy = buAy.reduce((a, k) => a + k.toplamSut, 0);
    const toplamGenel = gecmis.reduce((a, k) => a + k.toplamSut, 0);

    let highest = 0;
    const gunler = {};
    buAy.forEach(k => {
      gunler[k.tarih] = (gunler[k.tarih] || 0) + k.toplamSut;
      if (gunler[k.tarih] > highest) highest = gunler[k.tarih];
    });

    const vals = Object.values(gunler);
    const ort = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;

    return {
      toplamAy: Number(toplamAy.toFixed(0)).toLocaleString('tr-TR'),
      toplamGenel: Number(toplamGenel.toFixed(0)).toLocaleString('tr-TR'),
      ort: ort.toFixed(1),
      highest: highest.toFixed(0)
    };
  }, [gecmis]);

  const onizlemeAl = async () => {
    if (!miktar || parseFloat(miktar) <= 0) return showWarning('Lütfen geçerli bir üretim hacmi giriniz.');
    setYukleniyor(true);
    try {
      const r = await api.topluSutOnizleme({ toplamSut: parseFloat(miktar), dagilimTipi: dagilim, tarih, sagim });
      setOnizleme(r.data); setAdim(2);
    } catch (e) { showError(e.response?.data?.message || 'Hesaplama işlemi başarısız oldu.'); }
    finally { setYukleniyor(false); }
  };

  const kaydet = async () => {
    setYukleniyor(true);
    try {
      await api.topluSutKaydet({ tarih, sagim, toplamSut: onizleme.toplamSut, dagilimTipi: dagilim, detaylar: onizleme.detaylar });
      showSuccess('Sağım verileri başarıyla sisteme kaydedildi.');
      setAdim(1); setMiktar(''); setOnizleme(null);
      getGecmis();
    } catch (e) {
      if (e.response?.status === 409) showWarning('Seçili dönem için sisteme işlenmiş veri zaten mevcut.');
      else showError('Kayıt işlemi sırasında sistem hatası oluştu: ' + e.message);
    } finally { setYukleniyor(false); }
  };

  const sil = async (t, s) => {
    if (!window.confirm('Bu sağım kaydını kalıcı olarak silmek istediğinize emin misiniz?')) return;
    try { await api.topluSutSilByTarihSagim(t, s); getGecmis(); showSuccess('Kayıt başarıyla kaldırıldı.'); }
    catch { showError('Silme işlemi başarısız oldu.'); }
  };

  // Prepare Calendar Grid
  const calGrid = useMemo(() => {
    const y = calDate.getFullYear();
    const m = calDate.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const firstDay = new Date(y, m, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    const grid = [];
    for (let i = 0; i < offset; i++) grid.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const hasData = gecmis.some(k => k.tarih === dateStr);
      grid.push({ day: i, hasData, isToday: dateStr === today });
    }
    return grid;
  }, [calDate, gecmis]);

  const monthLabel = calDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  return (
    <Container>
      <PageHeader>
        <TitleContent>
          <h1>Süt Kayıt ve Üretim Takibi</h1>
          <p>İşletmenizin sağım verilerini yönetin, üretim trendlerini analiz edin</p>
        </TitleContent>
        {adim === 1 && (
          <ActionButton onClick={() => document.getElementById('miktar-input').focus()}>
            <FiPlus /> Yeni Kayıt Oluştur
          </ActionButton>
        )}
      </PageHeader>

      <MetricsGrid>
        <MetricCard $delay="0s" $bg="#eff6ff" $color="#3b82f6">
          <div className="metric-header">
            <div className="metric-title">Aylık Üretim Hacmi</div>
            <div className="metric-icon"><FiDroplet /></div>
          </div>
          <div className="metric-value">{stats.toplamAy} <span>Litre</span></div>
        </MetricCard>

        <MetricCard $delay="0.05s" $bg="#f0fdf4" $color="#10b981">
          <div className="metric-header">
            <div className="metric-title">Günlük Ortalama</div>
            <div className="metric-icon"><FiActivity /></div>
          </div>
          <div className="metric-value">{stats.ort} <span>L/Gün</span></div>
        </MetricCard>

        <MetricCard $delay="0.1s" $bg="#fffbeb" $color="#d97706">
          <div className="metric-header">
            <div className="metric-title">En Yüksek Sağım</div>
            <div className="metric-icon"><FiArrowRight style={{ transform: 'rotate(-45deg)' }} /></div>
          </div>
          <div className="metric-value">{stats.highest} <span>Litre</span></div>
        </MetricCard>

        <MetricCard $delay="0.15s" $bg="#f1f5f9" $color="#64748b">
          <div className="metric-header">
            <div className="metric-title">Toplam Kayıtlı Üretim</div>
            <div className="metric-icon"><FiList /></div>
          </div>
          <div className="metric-value">{stats.toplamGenel} <span>Litre</span></div>
        </MetricCard>
      </MetricsGrid>

      <ContentLayout>
        {/* Left Panel: Form / Preview */}
        <SectionPanel>
          <PanelHeader>
            <h2>
              {adim === 1 ? <><FiPlus style={{ color: '#64748b' }} /> Veri Giriş Formu</> : <><FiCheckCircle style={{ color: '#10b981' }} /> Kayıt Onayı</>}
            </h2>
          </PanelHeader>

          <PanelBody>
            {adim === 1 ? (
              <>
                <FormGroup>
                  <Label>İşlem Tarihi</Label>
                  <Input
                    type="date"
                    value={tarih}
                    onChange={e => setTarih(e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Sağım Periyodu</Label>
                  <SelectCards>
                    <SelectCardOpt
                      $active={sagim === 'sabah'}
                      onClick={() => setSagim('sabah')}
                    >
                      <div className="icon"><FiClock /></div>
                      <div className="content">
                        <h4>Sabah Vardiyası</h4>
                        <p>Genellikle 06:00 - 08:00 arası sağım verileri</p>
                      </div>
                    </SelectCardOpt>
                    <SelectCardOpt
                      $active={sagim === 'aksam'}
                      onClick={() => setSagim('aksam')}
                    >
                      <div className="icon"><FiClock /></div>
                      <div className="content">
                        <h4>Akşam Vardiyası</h4>
                        <p>Genellikle 17:00 - 19:00 arası sağım verileri</p>
                      </div>
                    </SelectCardOpt>
                  </SelectCards>
                </FormGroup>

                <FormGroup>
                  <Label>Toplam Üretim Hacmi</Label>
                  <InputGroup>
                    <FiDroplet className="icon-left" />
                    <Input
                      id="miktar-input"
                      type="number"
                      value={miktar}
                      onChange={e => setMiktar(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.1"
                    />
                    <span className="text-right">Litre</span>
                  </InputGroup>
                </FormGroup>

                <FormGroup>
                  <Label>Bireysel Verim Hesaplama Yöntemi</Label>
                  <SelectCards>
                    <SelectCardOpt
                      $active={dagilim === 'akilli'}
                      onClick={() => setDagilim('akilli')}
                    >
                      <div className="icon"><FiActivity /></div>
                      <div className="content">
                        <h4>Akıllı Dağılım</h4>
                        <p>İneklerin mevcut laktasyon ve geçmiş verim potansiyeline göre matematiksel dağılım uygulanır.</p>
                      </div>
                    </SelectCardOpt>
                    <SelectCardOpt
                      $active={dagilim === 'esit'}
                      onClick={() => setDagilim('esit')}
                    >
                      <div className="icon"><FiList /></div>
                      <div className="content">
                        <h4>Eşit Dağılım</h4>
                        <p>Toplam hacim, aktif olan tüm sağmal ineklere eşit miktarda paylaştırılır.</p>
                      </div>
                    </SelectCardOpt>
                  </SelectCards>
                </FormGroup>

                <PrimaryButton onClick={onizlemeAl} disabled={!miktar || yukleniyor}>
                  {yukleniyor ? 'Hesaplanıyor...' : 'Verimi Analiz Et ve Devam Et'}
                </PrimaryButton>
              </>
            ) : (
              <>
                <SummaryBox>
                  <div className="info">
                    <strong>{new Date(tarih + 'T12:00').toLocaleDateString('tr-TR')}</strong><br />
                    {sagim === 'sabah' ? 'Sabah Vardiyası' : 'Akşam Vardiyası'} • {onizleme?.detaylar?.length} İnek Katılımı
                  </div>
                  <div className="total">
                    {onizleme?.toplamSut} <span>Litre</span>
                  </div>
                </SummaryBox>

                <Label style={{ marginBottom: '12px' }}>Bireysel Üretim Dağılım Şeması</Label>
                <TableContainer>
                  <table>
                    <thead>
                      <tr>
                        <th>Küpe No / İsim</th>
                        <th className="amount-col">Hesaplanmış Verim</th>
                      </tr>
                    </thead>
                    <tbody>
                      {onizleme?.detaylar?.map((d, i) => (
                        <tr key={i}>
                          <td>{d.inekIsim}</td>
                          <td className="amount-col">{d.miktar?.toFixed(2)} L</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableContainer>

                <ButtonRow>
                  <button className="btn-outline" onClick={() => setAdim(1)}>
                    Geri Dön
                  </button>
                  <button className="btn-success" onClick={kaydet} disabled={yukleniyor}>
                    <FiCheckCircle /> {yukleniyor ? 'Sisteme İşleniyor...' : 'Kayıtları Sisteme İşle'}
                  </button>
                </ButtonRow>
              </>
            )}
          </PanelBody>
        </SectionPanel>

        {/* Right Panel: Calendar & History */}
        <SectionPanel>
          {/* Minimal Calendar */}
          <SimpleCalendar>
            <div className="cal-header">
              <h3><FiCalendar style={{ marginRight: 6, verticalAlign: 'text-bottom', color: '#64748b' }} /> Dönemsel Takvim</h3>
              <div className="nav-btns">
                <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1))}><FiChevronLeft /></button>
                <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1))}><FiChevronRight /></button>
              </div>
            </div>
            <div className="cal-grid">
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => <div key={d} className="day-name">{d}</div>)}
              {calGrid.map((dt, i) => {
                if (!dt) return <div key={i} />;
                return (
                  <div key={i} className={`day-cell ${dt.isToday ? 'today' : ''}`} $hasData={dt.hasData}>
                    {dt.day}
                    {dt.hasData && <div className="indicator" />}
                  </div>
                );
              })}
            </div>
            <div className="cal-legend">
              <div className="legend-item"><div className="dot"></div> Kayıt Girilen Günler</div>
            </div>
          </SimpleCalendar>

          {/* Activity Feed */}
          <PanelHeader style={{ borderBottom: 'none' }}>
            <h2><FiList style={{ color: '#64748b' }} /> Son Aktiviteler</h2>
          </PanelHeader>

          <HistoryList>
            {gecmis.length === 0 ? (
              <EmptyState>
                <div className="icon-wrap"><FiDroplet /></div>
                <h4>Veri Bulunamadı</h4>
                <p>Sisteme işlenmiş sağım verisi henüz mevcut değil.</p>
              </EmptyState>
            ) : gecmis.slice(0, 15).map(k => {
              const isSabah = k.sagim === 'sabah';
              return (
                <HistoryItem key={k._id} $isSabah={isSabah}>
                  <div className="h-left">
                    <div className="h-icon">
                      {isSabah ? <FiClock /> : <FiClock />}
                    </div>
                    <div>
                      <div className="h-date">{new Date(k.tarih + 'T12:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <div className="h-meta">{isSabah ? 'Sabah Vardiyası' : 'Akşam Vardiyası'} • {k.detaylar?.length} İnek</div>
                    </div>
                  </div>
                  <div className="h-right">
                    <div className="h-amount">
                      <div className="val">{k.toplamSut}</div>
                      <div className="unit">Litre</div>
                    </div>
                    <button className="h-action" onClick={() => sil(k.tarih, k.sagim)} title="Kaydı Sil">
                      <FiTrash2 />
                    </button>
                  </div>
                </HistoryItem>
              );
            })}
          </HistoryList>
        </SectionPanel>
      </ContentLayout>
    </Container>
  );
}
