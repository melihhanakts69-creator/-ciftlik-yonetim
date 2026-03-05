import { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import * as api from '../services/api';
import { FaPlus, FaChevronLeft, FaChevronRight, FaTrash, FaClock, FaTint, FaChartLine, FaCalendarCheck } from 'react-icons/fa';
import { showSuccess, showError, showWarning } from '../utils/toast';

const fadeUp = keyframes`from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}`;
const slideIn = keyframes`from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}`;
const pulse = keyframes`0%,100%{transform:scale(1)}50%{transform:scale(1.04)}`;

/* ─── PAGE ───────────────────────────────────────── */
const Page = styled.div`
  padding: 28px;
  background: #f4f6fb;
  min-height: calc(100vh - 80px);
  font-family: 'Inter', system-ui, sans-serif;
`;

/* ─── HEADER ─────────────────────────────────────── */
const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 28px;
`;
const HeaderIcon = styled.div`
  width: 60px; height: 60px; border-radius: 20px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex; align-items: center; justify-content: center;
  font-size: 30px;
  box-shadow: 0 10px 28px rgba(16,185,129,0.35);
  flex-shrink: 0;
`;
const HeaderText = styled.div`
  h1 { margin: 0; font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
  p  { margin: 4px 0 0; font-size: 13px; color: #94a3b8; font-weight: 500; }
`;

/* ─── STATS ──────────────────────────────────────── */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  @media(max-width:900px){ grid-template-columns: repeat(2,1fr); }
`;
const Stat = styled.div`
  background: #fff;
  border-radius: 20px;
  padding: 22px 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  border: 1px solid #f0f4f8;
  display: flex;
  align-items: center;
  gap: 16px;
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => p.$d || '0s'};
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.10); transform: translateY(-2px); }
`;
const StatIcon = styled.div`
  width: 48px; height: 48px; border-radius: 14px;
  background: ${p => p.$bg};
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: ${p => p.$color};
  flex-shrink: 0;
`;
const StatInfo = styled.div`
  .lbl { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 4px; }
  .val { font-size: 22px; font-weight: 900; color: ${p => p.$color || '#0f172a'}; letter-spacing: -0.5px; }
  .sub { font-size: 11px; color: #cbd5e1; font-weight: 600; margin-top: 1px; }
`;

/* ─── TWO COLUMN LAYOUT ──────────────────────────── */
const Layout = styled.div`
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 20px;
  align-items: start;
  @media(max-width:1100px){ grid-template-columns: 1fr; }
`;

/* ─── GLASS CARD ─────────────────────────────────── */
const GlassCard = styled.div`
  background: #fff;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  border: 1px solid #f0f4f8;
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => p.$d || '0s'};
`;
const CardHead = styled.div`
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 22px;
  h2 { margin: 0; font-size: 16px; font-weight: 800; color: #0f172a; }
  .badge { background: #f0fdf4; color: #10b981; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; border: 1px solid #d1fae5; }
`;
const IconDot = styled.div`
  width: 32px; height: 32px; border-radius: 10px;
  background: ${p => p.$bg || '#f0fdf4'};
  display: flex; align-items: center; justify-content: center;
  color: ${p => p.$color || '#10b981'};
  font-size: 14px;
`;

/* ─── FORM ELEMENTS ──────────────────────────────── */
const FormGroup = styled.div`
  margin-bottom: 18px;
`;
const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 8px;
`;

const DateInput = styled.input`
  width: 100%;
  padding: 13px 16px;
  background: #f8fafc;
  border: 2px solid #e8edf3;
  border-radius: 14px;
  color: #0f172a;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s;
  &:focus { border-color: #10b981; background: #f0fdf4; box-shadow: 0 0 0 4px rgba(16,185,129,0.08); }
`;

const SagimPicker = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;
const SagimOpt = styled.button`
  padding: 14px 12px;
  border-radius: 14px;
  border: 2px solid ${p => p.$active ? p.$color : '#e8edf3'};
  background: ${p => p.$active ? p.$bg : '#f8fafc'};
  color: ${p => p.$active ? p.$color : '#94a3b8'};
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  .ico { font-size: 24px; }
  .sub { font-size: 10px; font-weight: 600; opacity: 0.7; }
  box-shadow: ${p => p.$active ? `0 4px 14px ${p.$shadow}` : 'none'};
  transform: ${p => p.$active ? 'scale(1.02)' : 'scale(1)'};
  &:hover { border-color: ${p => p.$color}; }
`;

const MiktarBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f0fdf4, #f0f9ff);
  border: 2px solid #d1fae5;
  border-radius: 16px;
  padding: 12px 18px;
  gap: 12px;
  transition: all 0.2s;
  &:focus-within { border-color: #10b981; box-shadow: 0 0 0 4px rgba(16,185,129,0.10); }
  .prefix { font-size: 28px; }
  input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 32px;
    font-weight: 900;
    color: #10b981;
    outline: none;
    font-family: inherit;
    letter-spacing: -1px;
    min-width: 0;
    &::placeholder { color: #d1fae5; }
  }
  .suffix { font-size: 14px; font-weight: 700; color: #6ee7b7; white-space: nowrap; }
`;

const DagilimRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;
const DagilimOpt = styled.button`
  padding: 12px;
  border-radius: 12px;
  border: 2px solid ${p => p.$active ? '#6366f1' : '#e8edf3'};
  background: ${p => p.$active ? '#eef2ff' : '#f8fafc'};
  color: ${p => p.$active ? '#6366f1' : '#94a3b8'};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex; align-items: center; gap: 8px;
  &:hover { border-color: #6366f1; color: #6366f1; }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  letter-spacing: 0.3px;
  box-shadow: 0 6px 20px rgba(16,185,129,0.3);
  transition: all 0.25s;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  margin-top: 6px;
  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(16,185,129,0.4); }
  &:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
`;

/* ─── PREVIEW MODE ───────────────────────────────── */
const PreviewHeader = styled.div`
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 16px;
  padding: 18px 20px;
  color: white;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .title { font-size: 14px; font-weight: 700; opacity: 0.85; }
  .amount { font-size: 32px; font-weight: 900; letter-spacing: -1px; }
  .detail { font-size: 12px; opacity: 0.75; margin-top: 2px; }
`;
const PreviewTable = styled.div`
  max-height: 240px;
  overflow-y: auto;
  border-radius: 12px;
  border: 1px solid #f0f4f8;
  margin-bottom: 14px;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { padding: 10px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: #94a3b8; background: #f8fafc; border-bottom: 1px solid #f0f4f8; text-align: left; &:last-child{text-align:right;} }
  tbody tr { border-bottom: 1px solid #f8fafc; transition: background 0.15s; &:hover{background:#f0fdf4;} &:last-child{border:none;} }
  td { padding: 10px 14px; font-size: 13px; color: #475569; font-weight: 500; &:first-child{color:#0f172a;font-weight:700;} &:last-child{text-align:right;font-weight:800;color:#10b981;} }
`;
const PreviewBtns = styled.div`
  display: grid; grid-template-columns: 1fr 2fr; gap: 10px;
`;
const BackBtn = styled.button`
  padding: 14px; border-radius: 12px; border: 2px solid #e8edf3; background: #f8fafc;
  color: #64748b; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s;
  &:hover { border-color: #94a3b8; }
`;
const ConfirmBtn = styled(SubmitBtn)`
  margin-top: 0; width: auto; padding: 14px 24px;
`;

/* ─── CALENDAR & HISTORY (right column) ─────────── */
const RightCol = styled.div`
  display: flex; flex-direction: column; gap: 20px;
`;

/* Calendar */
const CalBody = styled.div``;
const CalHead = styled.div`
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
  h3 { margin: 0; font-size: 15px; font-weight: 800; color: #0f172a; text-transform: capitalize; }
  .nav { width: 32px; height: 32px; border-radius: 10px; border: 1.5px solid #e8edf3; background: #f8fafc; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; transition: all 0.2s; font-size: 12px; &:hover{border-color:#10b981;color:#10b981;background:#f0fdf4;} }
`;
const CalGrid = styled.div`
  display: grid; grid-template-columns: repeat(7,1fr); gap: 5px;
`;
const DayName = styled.div`
  text-align: center; font-size: 10px; font-weight: 800; color: #cbd5e1;
  text-transform: uppercase; padding-bottom: 6px; letter-spacing: 0.5px;
`;
const DayCell = styled.div`
  border-radius: 10px;
  min-height: 48px;
  padding: 5px;
  display: flex; flex-direction: column; justify-content: space-between;
  transition: all 0.15s;
  cursor: ${p => p.$hasData ? 'pointer' : 'default'};
  background: ${p => p.$today ? '#f0fdf4' : p.$hasData ? '#fafffe' : 'transparent'};
  border: 1.5px solid ${p => p.$today ? '#10b981' : p.$hasData ? '#d1fae5' : 'transparent'};
  &:hover { ${p => p.$hasData && 'transform:scale(1.06); box-shadow:0 4px 14px rgba(16,185,129,.15);'} }
  .dn { font-size: 12px; font-weight: 700; color: ${p => p.$today ? '#10b981' : '#64748b'}; }
  .dots { display: flex; gap: 3px; justify-content: flex-end; }
  .dot { width: 5px; height: 5px; border-radius: 50%; &.s{background:#f59e0b;} &.a{background:#6366f1;} }
  .total { font-size: 9px; font-weight: 800; color: #10b981; text-align: right; margin-top: 1px; }
`;
const CalLegend = styled.div`
  display: flex; gap: 14px; margin-top: 12px; justify-content: center;
  .item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #94a3b8; font-weight: 600; }
  .dot { width: 8px; height: 8px; border-radius: 50%; }
`;

/* History list */
const HistoryHead = styled.div`
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
  h3 { margin: 0; font-size: 15px; font-weight: 800; color: #0f172a; }
  .count { background: #f0fdf4; color: #10b981; font-size: 12px; font-weight: 800; padding: 3px 10px; border-radius: 20px; }
`;
const HList = styled.div`
  display: flex; flex-direction: column; gap: 8px;
  max-height: 390px; overflow-y: auto;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
`;
const HItem = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  background: ${p => p.$hover ? '#f0fdf4' : '#f8fafc'};
  border: 1.5px solid ${p => p.$hover ? '#d1fae5' : '#f0f4f8'};
  border-left: 4px solid ${p => p.$color};
  border-radius: 14px;
  transition: all 0.2s;
  &:hover { background: #f0fdf4; border-color: #d1fae5; transform: translateX(3px); }
  .left { display: flex; align-items: center; gap: 12px; }
  .emo { width: 38px; height: 38px; border-radius: 12px; background: ${p => p.$iconBg}; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .date { font-size: 13px; font-weight: 800; color: #0f172a; }
  .meta { font-size: 11px; color: #94a3b8; margin-top: 2px; font-weight: 500; }
  .right { display: flex; align-items: center; gap: 10px; }
  .amount { font-size: 20px; font-weight: 900; color: ${p => p.$color}; letter-spacing: -0.5px; }
  .unit { font-size: 11px; color: #cbd5e1; font-weight: 700; }
  .sil { background: none; border: none; color: #fca5a5; cursor: pointer; padding: 6px; border-radius: 8px; font-size: 13px; transition: all 0.2s; &:hover{color:#ef4444;background:#fef2f2;} }
`;
const EmptyState = styled.div`
  text-align: center; padding: 40px; color: #cbd5e1; font-size: 14px; font-weight: 600;
  .ico { font-size: 40px; margin-bottom: 10px; display: block; }
`;

/* ─────────────────────────────────────────────────── */
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
  const [calAy, setCalAy] = useState(new Date());

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
    const gunler = {};
    buAy.forEach(k => { gunler[k.tarih] = (gunler[k.tarih] || 0) + k.toplamSut; });
    const vals = Object.values(gunler);
    const ort = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return { toplamAy: toplamAy.toFixed(1), toplamGenel: Number(toplamGenel.toFixed(0)).toLocaleString('tr-TR'), ort: ort.toFixed(1), kay: gecmis.length };
  }, [gecmis]);

  const onizlemeAl = async () => {
    if (!miktar || parseFloat(miktar) <= 0) return showWarning('Geçerli bir miktar girin!');
    setYukleniyor(true);
    try {
      const r = await api.topluSutOnizleme({ toplamSut: parseFloat(miktar), dagilimTipi: dagilim, tarih, sagim });
      setOnizleme(r.data); setAdim(2);
    } catch (e) { showError(e.response?.data?.message || 'Önizleme alınamadı'); }
    finally { setYukleniyor(false); }
  };

  const kaydet = async () => {
    setYukleniyor(true);
    try {
      await api.topluSutKaydet({ tarih, sagim, toplamSut: onizleme.toplamSut, dagilimTipi: dagilim, detaylar: onizleme.detaylar });
      showSuccess('🥛 Süt kaydı eklendi!');
      setAdim(1); setMiktar(''); setOnizleme(null);
      getGecmis();
    } catch (e) {
      if (e.response?.status === 409) showWarning('Bu tarih/sağım için kayıt zaten var!');
      else showError('Hata: ' + e.message);
    } finally { setYukleniyor(false); }
  };

  const sil = async (t, s) => {
    if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    try { await api.topluSutSilByTarihSagim(t, s); getGecmis(); showSuccess('Silindi.'); }
    catch { showError('Silme başarısız'); }
  };

  /* Takvim */
  const calDays = useMemo(() => {
    const y = calAy.getFullYear(), m = calAy.getMonth();
    const days = new Date(y, m + 1, 0).getDate();
    const first = new Date(y, m, 1).getDay();
    const offset = first === 0 ? 6 : first - 1;
    const arr = [];
    for (let i = 0; i < offset; i++) arr.push(null);
    for (let i = 1; i <= days; i++) arr.push(new Date(y, m, i));
    return arr;
  }, [calAy]);

  const monthLabel = calAy.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  const getDayData = (date) => {
    if (!date) return { items: [], sabah: null, aksam: null, total: 0 };
    const items = gecmis.filter(k => {
      const kd = new Date(k.tarih + 'T12:00');
      return kd.getDate() === date.getDate() && kd.getMonth() === date.getMonth() && kd.getFullYear() === date.getFullYear();
    });
    return {
      items,
      sabah: items.find(k => k.sagim === 'sabah'),
      aksam: items.find(k => k.sagim === 'aksam'),
      total: items.reduce((a, k) => a + k.toplamSut, 0)
    };
  };

  return (
    <Page>
      {/* HEADER */}
      <Header>
        <HeaderIcon>🥛</HeaderIcon>
        <HeaderText>
          <h1>Süt Yönetimi</h1>
          <p>Günlük süt üretimini kayıt altına alın, takip edin ve analiz edin</p>
        </HeaderText>
      </Header>

      {/* STATS */}
      <StatsGrid>
        <Stat $d="0.05s">
          <StatIcon $bg="#f0fdf4" $color="#10b981"><FaTint /></StatIcon>
          <StatInfo $color="#10b981">
            <div className="lbl">Bu Ay Toplam</div>
            <div className="val">{stats.toplamAy} <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>lt</span></div>
          </StatInfo>
        </Stat>
        <Stat $d="0.1s">
          <StatIcon $bg="#eff6ff" $color="#3b82f6"><FaChartLine /></StatIcon>
          <StatInfo $color="#3b82f6">
            <div className="lbl">Günlük Ort.</div>
            <div className="val">{stats.ort} <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>lt</span></div>
          </StatInfo>
        </Stat>
        <Stat $d="0.15s">
          <StatIcon $bg="#fefce8" $color="#f59e0b"><FaCalendarCheck /></StatIcon>
          <StatInfo $color="#f59e0b">
            <div className="lbl">Toplam Kayıt</div>
            <div className="val">{stats.kay} <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>adet</span></div>
          </StatInfo>
        </Stat>
        <Stat $d="0.2s">
          <StatIcon $bg="#f5f3ff" $color="#8b5cf6"><FaClock /></StatIcon>
          <StatInfo $color="#8b5cf6">
            <div className="lbl">Toplam Üretim</div>
            <div className="val">{stats.toplamGenel} <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>lt</span></div>
          </StatInfo>
        </Stat>
      </StatsGrid>

      {/* MAIN */}
      <Layout>
        {/* SOL: FORM */}
        <GlassCard $d="0.2s">
          <CardHead>
            <IconDot $bg="#f0fdf4" $color="#10b981"><FaPlus /></IconDot>
            <h2>{adim === 1 ? 'Yeni Kayıt' : 'Önizleme'}</h2>
            {adim === 2 && <div className="badge">✅ Onaya hazır</div>}
          </CardHead>

          {adim === 1 ? (
            <>
              <FormGroup>
                <Label>📅 Tarih</Label>
                <DateInput type="date" value={tarih} onChange={e => setTarih(e.target.value)} />
              </FormGroup>

              <FormGroup>
                <Label>🕐 Sağım Zamanı</Label>
                <SagimPicker>
                  <SagimOpt
                    $active={sagim === 'sabah'}
                    $color="#f59e0b" $bg="#fffbeb" $shadow="rgba(245,158,11,0.25)"
                    onClick={() => setSagim('sabah')}
                  >
                    <span className="ico">🌅</span>
                    <strong>Sabah</strong>
                    <span className="sub">06:00 – 10:00</span>
                  </SagimOpt>
                  <SagimOpt
                    $active={sagim === 'aksam'}
                    $color="#6366f1" $bg="#eef2ff" $shadow="rgba(99,102,241,0.25)"
                    onClick={() => setSagim('aksam')}
                  >
                    <span className="ico">🌙</span>
                    <strong>Akşam</strong>
                    <span className="sub">17:00 – 20:00</span>
                  </SagimOpt>
                </SagimPicker>
              </FormGroup>

              <FormGroup>
                <Label>🥛 Toplam Miktar</Label>
                <MiktarBox>
                  <span className="prefix">🥛</span>
                  <input
                    type="number"
                    value={miktar}
                    onChange={e => setMiktar(e.target.value)}
                    placeholder="0.0"
                  />
                  <span className="suffix">Litre</span>
                </MiktarBox>
              </FormGroup>

              <FormGroup>
                <Label>⚙️ Dağılım Yöntemi</Label>
                <DagilimRow>
                  <DagilimOpt $active={dagilim === 'akilli'} onClick={() => setDagilim('akilli')}>
                    🧠 Akıllı Dağılım
                  </DagilimOpt>
                  <DagilimOpt $active={dagilim === 'esit'} onClick={() => setDagilim('esit')}>
                    ⚖️ Eşit Dağılım
                  </DagilimOpt>
                </DagilimRow>
              </FormGroup>

              <SubmitBtn onClick={onizlemeAl} disabled={!miktar || yukleniyor}>
                {yukleniyor ? '⏳ Hesaplanıyor...' : <><FaTint /> Önizle ve Kaydet</>}
              </SubmitBtn>
            </>
          ) : (
            <>
              <PreviewHeader>
                <div>
                  <div className="title">{new Date(tarih + 'T12:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} • {sagim === 'sabah' ? '🌅 Sabah' : '🌙 Akşam'} Sağımı</div>
                  <div className="amount">{onizleme?.toplamSut} Lt</div>
                  <div className="detail">{onizleme?.detaylar?.length} inek • {dagilim === 'akilli' ? 'Akıllı dağılım' : 'Eşit dağılım'}</div>
                </div>
                <div style={{ fontSize: 48 }}>🥛</div>
              </PreviewHeader>

              <PreviewTable>
                <table>
                  <thead><tr><th>İnek</th><th>Miktar (Lt)</th></tr></thead>
                  <tbody>
                    {onizleme?.detaylar?.map((d, i) => (
                      <tr key={i}><td>{d.inekIsim}</td><td>{d.miktar?.toFixed(1)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </PreviewTable>

              <PreviewBtns>
                <BackBtn onClick={() => setAdim(1)}>← Geri</BackBtn>
                <ConfirmBtn onClick={kaydet} disabled={yukleniyor}>
                  {yukleniyor ? '⏳ Kaydediliyor...' : '✅ Onayla ve Kaydet'}
                </ConfirmBtn>
              </PreviewBtns>
            </>
          )}
        </GlassCard>

        {/* SAĞ */}
        <RightCol>
          {/* Takvim */}
          <GlassCard $d="0.25s">
            <CardHead>
              <IconDot $bg="#fef9c3" $color="#ca8a04">📅</IconDot>
              <h2>Aylık Takip</h2>
            </CardHead>
            <CalBody>
              <CalHead>
                <button className="nav" onClick={() => setCalAy(new Date(calAy.getFullYear(), calAy.getMonth() - 1, 1))}><FaChevronLeft /></button>
                <h3>{monthLabel}</h3>
                <button className="nav" onClick={() => setCalAy(new Date(calAy.getFullYear(), calAy.getMonth() + 1, 1))}><FaChevronRight /></button>
              </CalHead>
              <CalGrid>
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => <DayName key={d}>{d}</DayName>)}
                {calDays.map((date, i) => {
                  if (!date) return <div key={i} />;
                  const { sabah, aksam, items, total } = getDayData(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <DayCell key={i} $today={isToday} $hasData={items.length > 0}>
                      <span className="dn">{date.getDate()}</span>
                      {items.length > 0 && (
                        <>
                          <div className="dots">
                            {sabah && <span className="dot s" />}
                            {aksam && <span className="dot a" />}
                          </div>
                          <div className="total">{total.toFixed(0)}lt</div>
                        </>
                      )}
                    </DayCell>
                  );
                })}
              </CalGrid>
              <CalLegend>
                <div className="item"><div className="dot" style={{ background: '#f59e0b' }} /> Sabah</div>
                <div className="item"><div className="dot" style={{ background: '#6366f1' }} /> Akşam</div>
              </CalLegend>
            </CalBody>
          </GlassCard>

          {/* Geçmiş */}
          <GlassCard $d="0.3s">
            <CardHead>
              <IconDot $bg="#f0f4ff" $color="#6366f1"><FaClock /></IconDot>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <h2>Son Kayıtlar</h2>
                <span style={{ background: '#f0fdf4', color: '#10b981', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20, marginLeft: 'auto' }}>{gecmis.length}</span>
              </div>
            </CardHead>
            <HList>
              {gecmis.length === 0 ? (
                <EmptyState><span className="ico">🥛</span>Henüz kayıt yok.<br />İlk süt kaydınızı ekleyin!</EmptyState>
              ) : gecmis.slice(0, 20).map(k => {
                const isSabah = k.sagim === 'sabah';
                const color = isSabah ? '#f59e0b' : '#6366f1';
                const iconBg = isSabah ? '#fffbeb' : '#eef2ff';
                return (
                  <HItem key={k._id} $color={color} $iconBg={iconBg}>
                    <div className="left">
                      <div className="emo">{isSabah ? '🌅' : '🌙'}</div>
                      <div>
                        <div className="date">{new Date(k.tarih + 'T12:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        <div className="meta">{isSabah ? 'Sabah' : 'Akşam'} sağımı • {k.detaylar?.length || '?'} inek</div>
                      </div>
                    </div>
                    <div className="right">
                      <div>
                        <span className="amount">{k.toplamSut}</span>
                        <span className="unit"> lt</span>
                      </div>
                      <button className="sil" onClick={() => sil(k.tarih, k.sagim)}><FaTrash /></button>
                    </div>
                  </HItem>
                );
              })}
            </HList>
          </GlassCard>
        </RightCol>
      </Layout>
    </Page>
  );
}
