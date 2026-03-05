import { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import * as api from '../services/api';
import { FaPlus, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaTrash, FaTachometerAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import { showSuccess, showError, showWarning } from '../utils/toast';

const fadeIn = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`;
const shimmer = keyframes`0%{background-position:-200% 0}100%{background-position:200% 0}`;

const Page = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: calc(100vh - 80px);
  animation: ${fadeIn} 0.4s ease;
  font-family: 'Inter', system-ui, sans-serif;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 16px;
  flex-wrap: wrap;
`;

const PageTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  .ico {
    width: 56px; height: 56px; border-radius: 18px;
    background: linear-gradient(135deg, #10b981, #059669);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px;
    box-shadow: 0 8px 24px rgba(16,185,129,0.35);
  }
  h1 { margin: 0; font-size: 28px; font-weight: 900; color: #f8fafc; letter-spacing: -0.5px; }
  .sub { font-size: 13px; color: #64748b; margin-top: 3px; }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
  padding: 20px;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
  &:hover { background: rgba(255,255,255,0.08); transform: translateY(-2px); }
  .label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
  .value { font-size: 28px; font-weight: 900; color: ${p => p.color || '#f8fafc'}; letter-spacing: -1px; }
  .unit { font-size: 13px; color: #94a3b8; margin-left: 3px; font-weight: 600; }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 20px;
  @media (max-width: 1024px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 28px;
  backdrop-filter: blur(10px);
  animation: ${fadeIn} 0.4s ease both;
  animation-delay: ${p => p.$delay || '0s'};
`;

const CardTitle = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: #f1f5f9;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  svg { color: #10b981; }
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 13px 16px;
  background: rgba(255,255,255,0.05);
  border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #f1f5f9;
  font-size: ${p => p.$large ? '28px' : '15px'};
  font-weight: ${p => p.$large ? '900' : '500'};
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s;
  font-family: inherit;
  color: ${p => p.$large ? '#10b981' : '#f1f5f9'};
  &:focus { border-color: #10b981; background: rgba(16,185,129,0.07); box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
  &::placeholder { color: #475569; }
`;

const InputWrap = styled.div`
  position: relative;
  margin-bottom: 20px;
  .suffix { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #64748b; font-weight: 700; font-size: 14px; pointer-events: none; }
`;

const SagimRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
`;

const SagimBtn = styled.button`
  padding: 14px;
  border-radius: 12px;
  border: 1.5px solid ${p => p.$active ? p.$color : 'rgba(255,255,255,0.1)'};
  background: ${p => p.$active ? p.$bg : 'transparent'};
  color: ${p => p.$active ? p.$color : '#64748b'};
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  &:hover { border-color: ${p => p.$color}; color: ${p => p.$color}; }
`;

const DagilimSelect = styled.select`
  width: 100%;
  padding: 13px 16px;
  background: rgba(255,255,255,0.05);
  border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #f1f5f9;
  font-size: 15px;
  outline: none;
  cursor: pointer;
  appearance: none;
  font-family: inherit;
  margin-bottom: 20px;
  transition: all 0.2s;
  &:focus { border-color: #10b981; }
  option { background: #1e293b; }
`;

const SaveBtn = styled.button`
  width: 100%;
  padding: 16px;
  background: ${p => p.disabled ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #10b981, #059669)'};
  color: ${p => p.disabled ? '#475569' : '#fff'};
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 800;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  letter-spacing: 0.3px;
  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(16,185,129,0.35); }
`;

// Preview panel
const PreviewPanel = styled.div`
  background: rgba(16,185,129,0.08);
  border: 1px solid rgba(16,185,129,0.2);
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 20px;
`;
const PreviewRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 14px;
  .k { color: #64748b; font-weight: 500; }
  .v { color: #f1f5f9; font-weight: 700; }
  .v.hi { color: #10b981; font-size: 20px; }
`;

const TableWrap = styled.div`
  max-height: 280px;
  overflow-y: auto;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 16px;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { padding: 10px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #64748b; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.06); text-align: left; &:last-child { text-align: right; } }
  tbody tr { border-bottom: 1px solid rgba(255,255,255,0.04); &:last-child{border:none;} &:hover{background:rgba(255,255,255,0.03);} }
  td { padding: 10px 14px; font-size: 13px; color: #cbd5e1; font-weight: 500; &:last-child { text-align: right; font-weight: 700; color: #10b981; } }
`;

const BtnGroup = styled.div`
  display: flex;
  gap: 10px;
  button {
    flex: 1; padding: 13px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;
  }
  .back { background: transparent; border: 1.5px solid rgba(255,255,255,0.1); color: #94a3b8; &:hover{border-color:#64748b;} }
  .confirm { background: linear-gradient(135deg,#10b981,#059669); border: none; color: white; &:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(16,185,129,.3);} }
`;

// Takvim
const CalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  h3 { color: #f1f5f9; font-size: 17px; font-weight: 800; margin: 0; text-transform: capitalize; }
  .nav { width: 34px; height: 34px; border-radius: 10px; border: 1.5px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; transition: all 0.2s; &:hover{border-color:#10b981;color:#10b981;} }
`;

const CalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
`;

const DayName = styled.div`
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  padding-bottom: 10px;
`;

const DayCell = styled.div`
  border-radius: 10px;
  min-height: 52px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s;
  background: ${p => p.$today ? 'rgba(16,185,129,0.15)' : p.$hasData ? 'rgba(255,255,255,0.04)' : 'transparent'};
  border: 1px solid ${p => p.$today ? 'rgba(16,185,129,0.4)' : p.$hasData ? 'rgba(255,255,255,0.08)' : 'transparent'};
  .dn { font-size: 12px; font-weight: 700; color: ${p => p.$today ? '#10b981' : '#64748b'}; }
  .info { display: flex; flex-direction: column; gap: 2px; align-items: flex-end; }
  .total { font-size: 10px; font-weight: 800; color: #10b981; }
  .dots { display: flex; gap: 3px; }
  .dot { width: 5px; height: 5px; border-radius: 50%; &.s { background: #f59e0b; } &.a { background: #3b82f6; } }
`;

// History
const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
  max-height: 360px;
  overflow-y: auto;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
`;

const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-left: 3px solid ${p => p.$color};
  border-radius: 12px;
  transition: all 0.2s;
  &:hover { background: rgba(255,255,255,0.06); }
  .left { display: flex; align-items: center; gap: 12px; }
  .icon { width: 36px; height: 36px; border-radius: 10px; background: ${p => p.$iconBg}; display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .date { font-size: 13px; font-weight: 700; color: #f1f5f9; }
  .meta { font-size: 11px; color: #64748b; margin-top: 2px; }
  .amount { font-size: 18px; font-weight: 900; color: ${p => p.$color}; }
  .sil { background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 6px 8px; border-radius: 8px; font-size: 13px; transition: all 0.2s; &:hover{background:rgba(239,68,68,0.1);} }
`;

const EmptyMsg = styled.div`
  text-align: center;
  padding: 40px;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
`;

export default function SutKaydi() {
  const bugun = new Date().toLocaleDateString('en-CA');

  const [tarih, setTarih] = useState(bugun);
  const [sagim, setSagim] = useState('sabah');
  const [toplamSut, setToplamSut] = useState('');
  const [dagilimTipi, setDagilimTipi] = useState('akilli');
  const [notlar, setNotlar] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [onizleme, setOnizleme] = useState(null);
  const [adim, setAdim] = useState(1);
  const [gecmisKayitlar, setGecmisKayitlar] = useState([]);
  const [takvimAy, setTakvimAy] = useState(new Date());

  useEffect(() => { fetchGecmis(); }, []);

  const fetchGecmis = async () => {
    try {
      const res = await api.topluSutGecmis(90);
      setGecmisKayitlar(res.data || []);
    } catch (e) { console.error(e); }
  };

  // Stats
  const stats = useMemo(() => {
    const thisMonth = new Date().toLocaleDateString('en-CA').slice(0, 7);
    const kayitlarBuAy = gecmisKayitlar.filter(k => k.tarih?.startsWith(thisMonth));
    const totalMonth = kayitlarBuAy.reduce((a, k) => a + (k.toplamSut || 0), 0);
    const totalAll = gecmisKayitlar.reduce((a, k) => a + (k.toplamSut || 0), 0);
    const dailyArr = {};
    kayitlarBuAy.forEach(k => { dailyArr[k.tarih] = (dailyArr[k.tarih] || 0) + k.toplamSut; });
    const vals = Object.values(dailyArr);
    const dailyAvg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    return { totalMonth: totalMonth.toFixed(1), totalAll: totalAll.toFixed(0), dailyAvg: dailyAvg.toFixed(1), kayitSayisi: gecmisKayitlar.length };
  }, [gecmisKayitlar]);

  const onizlemeAl = async () => {
    if (!toplamSut || parseFloat(toplamSut) <= 0) return showWarning('Geçerli bir miktar girin!');
    setYukleniyor(true);
    try {
      const res = await api.topluSutOnizleme({ toplamSut: parseFloat(toplamSut), dagilimTipi, tarih, sagim });
      setOnizleme(res.data);
      setAdim(2);
    } catch (e) { showError(e.response?.data?.message || 'Önizleme alınamadı!'); }
    finally { setYukleniyor(false); }
  };

  const kaydet = async () => {
    setYukleniyor(true);
    try {
      await api.topluSutKaydet({ tarih, sagim, toplamSut: onizleme.toplamSut, dagilimTipi, detaylar: onizleme.detaylar, notlar });
      showSuccess('Süt kaydı eklendi! 🥛');
      setAdim(1); setToplamSut(''); setOnizleme(null);
      fetchGecmis();
    } catch (e) {
      if (e.response?.status === 409) showWarning('Bu tarih ve sağım için kayıt zaten var!');
      else showError('Kayıt hatası: ' + e.message);
    } finally { setYukleniyor(false); }
  };

  const sil = async (tarih, sagim) => {
    if (!window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return;
    try { await api.topluSutSilByTarihSagim(tarih, sagim); fetchGecmis(); showSuccess('Silindi.'); }
    catch { showError('Silme başarısız.'); }
  };

  // Takvim
  const calDays = useMemo(() => {
    const year = takvimAy.getFullYear(), month = takvimAy.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const result = [];
    for (let i = 0; i < offset; i++) result.push(null);
    for (let i = 1; i <= days; i++) result.push(new Date(year, month, i));
    return result;
  }, [takvimAy]);

  const monthName = takvimAy.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  return (
    <Page>
      <TopRow>
        <PageTitle>
          <div className="ico">🥛</div>
          <div>
            <h1>Süt Yönetimi</h1>
            <div className="sub">Günlük süt üretimi — kayıt, takip ve analiz</div>
          </div>
        </PageTitle>
      </TopRow>

      {/* STATS */}
      <StatsRow>
        <StatCard color="#10b981">
          <div className="label">Bu Ay Toplam</div>
          <div className="value">{stats.totalMonth}<span className="unit">lt</span></div>
        </StatCard>
        <StatCard color="#3b82f6">
          <div className="label">Günlük Ortalama</div>
          <div className="value">{stats.dailyAvg}<span className="unit">lt</span></div>
        </StatCard>
        <StatCard color="#f59e0b">
          <div className="label">Toplam Kayıt</div>
          <div className="value">{stats.kayitSayisi}<span className="unit">adet</span></div>
        </StatCard>
        <StatCard color="#8b5cf6">
          <div className="label">Toplam Üretim</div>
          <div className="value">{Number(stats.totalAll).toLocaleString('tr-TR')}<span className="unit">lt</span></div>
        </StatCard>
      </StatsRow>

      <MainGrid>
        {/* SOL: FORM */}
        <Card $delay="0.05s">
          <CardTitle><FaPlus /> {adim === 1 ? 'Yeni Kayıt Gir' : 'Önizleme & Onay'}</CardTitle>

          {adim === 1 ? (
            <>
              <InputWrap>
                <Label>Tarih</Label>
                <Input type="date" value={tarih} onChange={e => setTarih(e.target.value)} />
              </InputWrap>

              <div style={{ marginBottom: 20 }}>
                <Label>Sağım Zamanı</Label>
                <SagimRow>
                  <SagimBtn $active={sagim === 'sabah'} $color="#f59e0b" $bg="rgba(245,158,11,0.12)" onClick={() => setSagim('sabah')}>🌅 Sabah</SagimBtn>
                  <SagimBtn $active={sagim === 'aksam'} $color="#3b82f6" $bg="rgba(59,130,246,0.12)" onClick={() => setSagim('aksam')}>🌙 Akşam</SagimBtn>
                </SagimRow>
              </div>

              <InputWrap>
                <Label>Toplam Süt Miktarı</Label>
                <Input $large type="number" value={toplamSut} onChange={e => setToplamSut(e.target.value)} placeholder="0.0" style={{ paddingRight: 60 }} />
                <span className="suffix">Litre</span>
              </InputWrap>

              <div style={{ marginBottom: 20 }}>
                <Label>Dağılım Yöntemi</Label>
                <DagilimSelect value={dagilimTipi} onChange={e => setDagilimTipi(e.target.value)}>
                  <option value="akilli">🧠 Akıllı Dağılım (Süt verime göre)</option>
                  <option value="esit">⚖️ Eşit Dağılım</option>
                </DagilimSelect>
              </div>

              <SaveBtn onClick={onizlemeAl} disabled={!toplamSut || yukleniyor}>
                {yukleniyor ? '⏳ Hesaplanıyor...' : '🔍 Önizle ve Kaydet'}
              </SaveBtn>
            </>
          ) : (
            <>
              <PreviewPanel>
                <PreviewRow><span className="k">Tarih</span><span className="v">{new Date(tarih + 'T12:00').toLocaleDateString('tr-TR')} • {sagim === 'sabah' ? '🌅 Sabah' : '🌙 Akşam'}</span></PreviewRow>
                <PreviewRow><span className="k">Toplam Süt</span><span className="v hi">{onizleme?.toplamSut} Lt</span></PreviewRow>
                <PreviewRow><span className="k">İnek Sayısı</span><span className="v">{onizleme?.detaylar?.length}</span></PreviewRow>
              </PreviewPanel>

              <TableWrap>
                <table>
                  <thead><tr><th>İnek</th><th>Miktar (Lt)</th></tr></thead>
                  <tbody>
                    {onizleme?.detaylar?.map((d, i) => (
                      <tr key={i}><td>{d.inekIsim}</td><td>{d.miktar?.toFixed(1)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>

              <BtnGroup>
                <button className="back" onClick={() => setAdim(1)}>← Geri</button>
                <button className="confirm" onClick={kaydet} disabled={yukleniyor}>
                  {yukleniyor ? '⏳...' : '✅ Onayla ve Kaydet'}
                </button>
              </BtnGroup>
            </>
          )}
        </Card>

        {/* SAĞ: TAKVİM + GEÇMİŞ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card $delay="0.1s">
            <CalHeader>
              <button className="nav" onClick={() => setTakvimAy(new Date(takvimAy.getFullYear(), takvimAy.getMonth() - 1, 1))}><FaChevronLeft /></button>
              <h3>{monthName}</h3>
              <button className="nav" onClick={() => setTakvimAy(new Date(takvimAy.getFullYear(), takvimAy.getMonth() + 1, 1))}><FaChevronRight /></button>
            </CalHeader>
            <CalGrid>
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => <DayName key={d}>{d}</DayName>)}
              {calDays.map((date, i) => {
                if (!date) return <div key={i} />;
                const gunKayitlari = gecmisKayitlar.filter(k => {
                  const kDate = new Date(k.tarih + 'T12:00');
                  return kDate.getDate() === date.getDate() && kDate.getMonth() === date.getMonth() && kDate.getFullYear() === date.getFullYear();
                });
                const sabah = gunKayitlari.find(k => k.sagim === 'sabah');
                const aksam = gunKayitlari.find(k => k.sagim === 'aksam');
                const total = gunKayitlari.reduce((a, k) => a + k.toplamSut, 0);
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <DayCell key={i} $today={isToday} $hasData={gunKayitlari.length > 0}>
                    <span className="dn">{date.getDate()}</span>
                    {gunKayitlari.length > 0 && (
                      <div className="info">
                        <div className="dots">
                          {sabah && <span className="dot s" />}
                          {aksam && <span className="dot a" />}
                        </div>
                        <span className="total">{total.toFixed(0)}lt</span>
                      </div>
                    )}
                  </DayCell>
                );
              })}
            </CalGrid>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' }}>
              {[['#f59e0b', 'Sabah'], ['#3b82f6', 'Akşam']].map(([color, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b', fontWeight: 700 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  {label}
                </div>
              ))}
            </div>
          </Card>

          <Card $delay="0.15s">
            <CardTitle><FaClock /> Son Kayıtlar</CardTitle>
            <HistoryList>
              {gecmisKayitlar.length === 0 ? (
                <EmptyMsg>Henüz kayıt yok. İlk süt kaydınızı ekleyin! 🥛</EmptyMsg>
              ) : (
                gecmisKayitlar.slice(0, 20).map(kayit => {
                  const color = kayit.sagim === 'sabah' ? '#f59e0b' : '#3b82f6';
                  const iconBg = kayit.sagim === 'sabah' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)';
                  return (
                    <HistoryItem key={kayit._id} $color={color} $iconBg={iconBg}>
                      <div className="left">
                        <div className="icon">{kayit.sagim === 'sabah' ? '🌅' : '🌙'}</div>
                        <div>
                          <div className="date">{new Date(kayit.tarih + 'T12:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</div>
                          <div className="meta">{kayit.sagim === 'sabah' ? 'Sabah' : 'Akşam'} sağımı • {kayit.detaylar?.length || '?'} inek</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="amount">{kayit.toplamSut}<span style={{ fontSize: 12, color: '#64748b', marginLeft: 3 }}>lt</span></span>
                        <button className="sil" onClick={() => sil(kayit.tarih, kayit.sagim)} title="Sil"><FaTrash /></button>
                      </div>
                    </HistoryItem>
                  );
                })
              )}
            </HistoryList>
          </Card>
        </div>
      </MainGrid>
    </Page>
  );
}
