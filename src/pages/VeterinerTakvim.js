import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { toast } from 'react-toastify';
import * as api from '../services/api';
import VetPageHeader, { VetBtnPrimary } from '../components/Layout/VetPageHeader';

const fadeUp = keyframes`from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}`;

const Page = styled.div`
  font-family: 'Inter', -apple-system, sans-serif;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 20px 64px;
  min-height: calc(100vh - 80px);
  background: #f9fafb;
  animation: ${fadeUp} 0.4s ease;
`;

// ─── Stats Row ────────────────────────────────────────────────────────────────
const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin: 24px 0 22px;
  @media(max-width: 900px) { grid-template-columns: repeat(2,1fr); }
`;

const StatCard = styled.div`
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 18px 20px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.07); }

  .sc-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .sc-val { font-size: 24px; font-weight: 900; color: #0f172a; line-height: 1; }
  .sc-lbl { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 3px; }
`;

// ─── Layout ───────────────────────────────────────────────────────────────────
const Grid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  @media(max-width: 920px) { grid-template-columns: 1fr; }
`;

// ─── Sol: Form + Mini Takvim ──────────────────────────────────────────────────
const SidePanel = styled.div`
  display: flex; flex-direction: column; gap: 16px;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
`;

const CardHead = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex; align-items: center; gap: 10px;
  .ch-icon { font-size: 16px; }
  .ch-title { font-size: 14px; font-weight: 800; color: #0f172a; flex: 1; }
  .ch-count { font-size: 11px; color: #94a3b8; font-weight: 700; }
`;

const FormBody = styled.form`
  padding: 20px;
  display: flex; flex-direction: column; gap: 14px;
`;

const Field = styled.div`
  display: flex; flex-direction: column; gap: 5px;
  label { font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; }
  input, select {
    padding: 11px 14px;
    border: 1.5px solid #e2e8f0; border-radius: 10px;
    font-size: 13px; font-family: inherit; background: #f8fafc;
    transition: all 0.2s;
    &:focus { outline: none; border-color: #0ea5e9; background: #fff; box-shadow: 0 0 0 3px rgba(14,165,233,0.1); }
  }
`;

const SubmitBtn = styled.button`
  width: 100%; padding: 13px;
  border-radius: 12px; border: none;
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: #fff; font-size: 14px; font-weight: 800;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(14,165,233,0.3);
  &:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(14,165,233,0.45); transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

// ─── Mini Takvim ──────────────────────────────────────────────────────────────
const MiniCal = styled.div`
  padding: 16px 20px;
  .mc-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .mc-month { font-size: 14px; font-weight: 800; color: #0f172a; }
  .mc-btn { background: #f1f5f9; border: none; border-radius: 8px; width: 28px; height: 28px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; &:hover { background: #e2e8f0; } }
  .mc-days { display: grid; grid-template-columns: repeat(7,1fr); gap: 3px; }
  .mc-dn { text-align: center; font-size: 10px; font-weight: 800; color: #94a3b8; padding: 4px 0; text-transform: uppercase; }
  .mc-d {
    text-align: center; font-size: 12px; font-weight: 600;
    padding: 6px 2px; border-radius: 8px; cursor: pointer;
    color: #64748b; transition: all 0.15s;
    &:hover { background: #eff6ff; color: #2563eb; }
    &.today { background: linear-gradient(135deg,#0ea5e9,#2563eb); color: #fff; font-weight: 900; }
    &.has-event { position: relative; &::after { content: ''; position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background: #f59e0b; } }
    &.empty { cursor: default; }
    &.other-month { color: #d1d5db; }
  }
`;

// ─── Sağ: Randevu Listesi ─────────────────────────────────────────────────────
const MainPanel = styled.div`
  display: flex; flex-direction: column; gap: 16px;
`;

const RandevuCard = styled.div`
  display: flex; align-items: stretch; gap: 0;
  background: #fff;
  border-radius: 16px;
  border: 1px solid ${p => p.$isToday ? '#bae6fd' : p.$gecmis ? '#fecaca' : '#e2e8f0'};
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
  transition: all 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.08); }

  .rc-side {
    width: 80px; flex-shrink: 0;
    background: ${p => p.$isToday ? 'linear-gradient(180deg,#0ea5e9,#2563eb)' : p.$tamamlandi ? '#f0fdf4' : p.$gecmis ? '#fff5f5' : '#f8fafc'};
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 16px 8px;
    border-right: 1px solid ${p => p.$isToday ? 'transparent' : '#f1f5f9'};
    .rc-gun { font-size: 28px; font-weight: 900; color: ${p => p.$isToday ? '#fff' : p.$gecmis ? '#dc2626' : '#0f172a'}; line-height: 1; }
    .rc-ay { font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${p => p.$isToday ? 'rgba(255,255,255,0.75)' : '#64748b'}; margin-top: 2px; }
    .rc-saat { font-size: 10px; font-weight: 800; color: ${p => p.$isToday ? 'rgba(255,255,255,0.9)' : '#94a3b8'}; margin-top: 6px; }
  }

  .rc-body { flex: 1; padding: 16px 20px; display: flex; flex-direction: column; justify-content: center; gap: 6px; }
  .rc-baslik { font-size: 15px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .rc-meta { display: flex; gap: 12px; flex-wrap: wrap; }
  .rc-meta-item { font-size: 12px; color: #64748b; font-weight: 600; display: flex; align-items: center; gap: 4px; }

  .rc-actions { padding: 16px 16px 16px 0; display: flex; flex-direction: column; gap: 8px; justify-content: center; }
`;

const Pill = styled.span`
  padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap;
  background: ${p => p.$d === 'tamamlandi' ? '#f0fdf4' : p.$d === 'iptal' ? '#fef2f2' : p.$today ? '#eff6ff' : p.$gecmis ? '#fff5f5' : '#f8fafc'};
  color: ${p => p.$d === 'tamamlandi' ? '#16a34a' : p.$d === 'iptal' ? '#dc2626' : p.$today ? '#2563eb' : p.$gecmis ? '#dc2626' : '#64748b'};
  border: 1px solid ${p => p.$d === 'tamamlandi' ? '#bbf7d0' : p.$d === 'iptal' ? '#fecaca' : p.$today ? '#bfdbfe' : p.$gecmis ? '#fecaca' : '#e5e7eb'};
`;

const ActionBtn = styled.button`
  padding: 6px 14px; border-radius: 8px; font-size: 11px; font-weight: 700; border: none; cursor: pointer; white-space: nowrap; transition: all 0.15s;
  background: ${p => p.$variant === 'done' ? '#f0fdf4' : '#fef2f2'};
  color: ${p => p.$variant === 'done' ? '#16a34a' : '#dc2626'};
  border: 1px solid ${p => p.$variant === 'done' ? '#bbf7d0' : '#fecaca'};
  &:hover { background: ${p => p.$variant === 'done' ? '#dcfce7' : '#fee2e2'}; }
`;

const OneriItem = styled.div`
  display: flex; align-items: center; gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.15s;
  &:last-child { border-bottom: none; }
  &:hover { background: #fffbeb; }

  .oi-dot { width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; flex-shrink: 0; }
  .oi-body { flex: 1; }
  .oi-baslik { font-size: 13px; font-weight: 700; color: #1e293b; }
  .oi-alt { font-size: 12px; color: #64748b; margin-top: 2px; }
  .oi-tarih { font-size: 11px; font-weight: 800; color: #d97706; background: #fef3c7; padding: 4px 10px; border-radius: 20px; white-space: nowrap; border: 1px solid #fde68a; }
`;

const Empty = styled.div`
  padding: 48px 24px; text-align: center; color: #94a3b8; font-size: 14px;
  .e-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.4; display: block; }
  .e-text { font-weight: 600; }
`;

// ─────────────────────────────────────────────────────────────────────────────
const MONTHS_TR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const MONTHS_SHORT = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
const DAYS_SHORT = ['Pts','Sal','Çar','Per','Cum','Cmt','Paz'];

function getRandevuAralik() {
  const start = new Date(); start.setDate(1); start.setHours(0,0,0,0);
  const end = new Date(start); end.setMonth(end.getMonth() + 2);
  return { start: start.toISOString(), end: end.toISOString() };
}

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7; // Pazartesi başlangıç
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function VeterinerTakvim() {
  const [randevular, setRandevular] = useState([]);
  const [oneriler, setOneriler] = useState([]);
  const [musteriler, setMusteriler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ciftciId: '', baslik: '', tarih: '', saat: '', aciklama: '' });
  const [gonderiyor, setGonderiyor] = useState(false);

  // Mini takvim state
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const todayStr = today.toDateString();

  const fetchRandevular = async () => {
    const { start, end } = getRandevuAralik();
    try { const res = await api.getVeterinerRandevu(start, end); setRandevular(res.data || []); } catch {}
  };

  useEffect(() => {
    const { start, end } = getRandevuAralik();
    Promise.all([
      api.getVeterinerRandevu(start, end),
      api.getVeterinerZiyaretOnerileri(),
      api.getVeterinerMusteriler()
    ])
      .then(([rRes, oRes, mRes]) => {
        setRandevular(rRes.data || []);
        setOneriler(oRes.data || []);
        setMusteriler(mRes.data || []);
      })
      .catch(() => { setRandevular([]); setOneriler([]); setMusteriler([]); })
      .finally(() => setLoading(false));
  }, []);

  const handleRandevuEkle = async (e) => {
    e.preventDefault();
    if (!form.ciftciId || !form.baslik || !form.tarih || gonderiyor) return;
    setGonderiyor(true);
    try {
      await api.postVeterinerRandevu(form);
      toast.success('✅ Randevu eklendi ve çiftçiye bildirim gönderildi.');
      setForm({ ciftciId: '', baslik: '', tarih: '', saat: '', aciklama: '' });
      await fetchRandevular();
    } catch (err) { toast.error(err.response?.data?.message || 'Eklenemedi.'); }
    finally { setGonderiyor(false); }
  };

  const handleDurum = async (id, durum) => {
    try {
      await api.patchVeterinerRandevu(id, { durum });
      setRandevular(prev => prev.map(r => r._id === id ? { ...r, durum } : r));
      toast.success(durum === 'tamamlandi' ? '✅ Tamamlandı.' : '❌ İptal edildi.');
    } catch { toast.error('Güncellenemedi.'); }
  };

  const formRef = useRef(null);
  const sorted = [...randevular].sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
  const bugunSayisi = randevular.filter(r => new Date(r.tarih).toDateString() === todayStr && r.durum === 'planlandi').length;
  const planlananSayisi = randevular.filter(r => r.durum === 'planlandi').length;
  const tamamlananSayisi = randevular.filter(r => r.durum === 'tamamlandi').length;

  // Mini takvim
  const calCells = buildCalendar(calYear, calMonth);
  const eventDays = new Set(
    randevular.map(r => {
      const d = new Date(r.tarih);
      if (d.getFullYear() === calYear && d.getMonth() === calMonth) return d.getDate();
      return null;
    }).filter(Boolean)
  );

  return (
    <Page>
      <VetPageHeader
        title="Randevu Takvimi"
        subtitle="Ziyaret planlaması · Randevu yönetimi"
        actions={
          <button style={VetBtnPrimary} onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            + Yeni Randevu
          </button>
        }
      />

      {/* Stats */}
      <StatsRow>
        <StatCard>
          <div className="sc-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>📅</div>
          <div>
            <div className="sc-val">{planlananSayisi}</div>
            <div className="sc-lbl">Planlanan</div>
          </div>
        </StatCard>
        <StatCard>
          <div className="sc-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>✅</div>
          <div>
            <div className="sc-val">{tamamlananSayisi}</div>
            <div className="sc-lbl">Tamamlanan</div>
          </div>
        </StatCard>
        <StatCard>
          <div className="sc-icon" style={{ background: '#fef3c7', color: '#d97706' }}>💡</div>
          <div>
            <div className="sc-val">{oneriler.length}</div>
            <div className="sc-lbl">Ziyaret Önerisi</div>
          </div>
        </StatCard>
        <StatCard>
          <div className="sc-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>🏡</div>
          <div>
            <div className="sc-val">{musteriler.length}</div>
            <div className="sc-lbl">Müşteri</div>
          </div>
        </StatCard>
      </StatsRow>

      <Grid>
        {/* Sol */}
        <SidePanel>
          {/* Randevu Ekle */}
          <Card ref={formRef}>
            <CardHead>
              <span className="ch-icon">➕</span>
              <span className="ch-title">Yeni Randevu Ekle</span>
            </CardHead>
            <FormBody onSubmit={handleRandevuEkle}>
              <Field>
                <label>Çiftlik / Müşteri</label>
                <select value={form.ciftciId} onChange={e => setForm({ ...form, ciftciId: e.target.value })} required>
                  <option value="">Müşteri seçin…</option>
                  {musteriler.map(m => (
                    <option key={m._id} value={m._id}>{m.isletmeAdi || m.isim}</option>
                  ))}
                </select>
              </Field>
              <Field>
                <label>Başlık / Konu</label>
                <input type="text" value={form.baslik} onChange={e => setForm({ ...form, baslik: e.target.value })} placeholder="Aşı, muayene, kontrol…" required />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field>
                  <label>Tarih</label>
                  <input type="date" value={form.tarih} onChange={e => setForm({ ...form, tarih: e.target.value })} required />
                </Field>
                <Field>
                  <label>Saat</label>
                  <input type="time" value={form.saat} onChange={e => setForm({ ...form, saat: e.target.value })} />
                </Field>
              </div>
              <Field>
                <label>Not</label>
                <input type="text" value={form.aciklama} onChange={e => setForm({ ...form, aciklama: e.target.value })} placeholder="Kısa not…" />
              </Field>
              <SubmitBtn type="submit" disabled={gonderiyor}>
                {gonderiyor ? '⏳ Ekleniyor…' : '📅 Randevu Ekle & Bildir'}
              </SubmitBtn>
            </FormBody>
          </Card>

          {/* Mini Takvim */}
          <Card>
            <MiniCal>
              <div className="mc-nav">
                <button className="mc-btn" type="button" onClick={() => { const d = new Date(calYear, calMonth - 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }}>‹</button>
                <div className="mc-month">{MONTHS_TR[calMonth]} {calYear}</div>
                <button className="mc-btn" type="button" onClick={() => { const d = new Date(calYear, calMonth + 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }}>›</button>
              </div>
              <div className="mc-days">
                {DAYS_SHORT.map(d => <div key={d} className="mc-dn">{d}</div>)}
                {calCells.map((d, i) => {
                  if (!d) return <div key={`e-${i}`} className="mc-d empty" />;
                  const isToday = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
                  const hasEvent = eventDays.has(d);
                  return (
                    <div key={d} className={`mc-d ${isToday ? 'today' : ''} ${hasEvent && !isToday ? 'has-event' : ''}`}>
                      {d}
                    </div>
                  );
                })}
              </div>
            </MiniCal>
          </Card>
        </SidePanel>

        {/* Sağ */}
        <MainPanel>
          {/* Randevular */}
          <Card>
            <CardHead>
              <span className="ch-icon">📋</span>
              <span className="ch-title">Planlanan Randevular</span>
              <span className="ch-count">{sorted.filter(r => r.durum !== 'iptal').length} aktif</span>
            </CardHead>
            {loading ? (
              <Empty><span className="e-icon">⏳</span><span className="e-text">Yükleniyor…</span></Empty>
            ) : sorted.length === 0 ? (
              <Empty><span className="e-icon">🗓️</span><span className="e-text">Henüz randevu yok. Soldan ekleyebilirsiniz.</span></Empty>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16 }}>
                {sorted.map(r => {
                  const dt = r.tarih ? new Date(r.tarih) : null;
                  const isToday = dt && dt.toDateString() === todayStr;
                  const gecmis = dt && dt < new Date() && r.durum === 'planlandi';
                  const tamamlandi = r.durum === 'tamamlandi';
                  return (
                    <RandevuCard key={r._id} $isToday={isToday} $gecmis={gecmis} $tamamlandi={tamamlandi}>
                      <div className="rc-side">
                        {dt ? (
                          <>
                            <div className="rc-gun">{dt.getDate()}</div>
                            <div className="rc-ay">{MONTHS_SHORT[dt.getMonth()]}</div>
                            {r.saat && <div className="rc-saat">{r.saat}</div>}
                          </>
                        ) : <div style={{ fontSize: 20 }}>📅</div>}
                      </div>
                      <div className="rc-body">
                        <div className="rc-baslik">
                          {r.baslik}
                          <Pill $d={r.durum} $today={isToday} $gecmis={gecmis}>
                            {r.durum === 'tamamlandi' ? '✅ Tamamlandı' : r.durum === 'iptal' ? '❌ İptal' : isToday ? '🔵 Bugün' : gecmis ? '⚠️ Gecikmeli' : '⏳ Planlandı'}
                          </Pill>
                        </div>
                        <div className="rc-meta">
                          {r.ciftciId && <span className="rc-meta-item">🏡 {r.ciftciId.isletmeAdi || r.ciftciId.isim}</span>}
                          {r.aciklama && <span className="rc-meta-item">📝 {r.aciklama}</span>}
                        </div>
                      </div>
                      {r.durum === 'planlandi' && (
                        <div className="rc-actions">
                          <ActionBtn type="button" $variant="done" onClick={() => handleDurum(r._id, 'tamamlandi')}>✓ Tamamla</ActionBtn>
                          <ActionBtn type="button" $variant="cancel" onClick={() => handleDurum(r._id, 'iptal')}>✕ İptal</ActionBtn>
                        </div>
                      )}
                    </RandevuCard>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Ziyaret Önerileri */}
          {oneriler.length > 0 && (
            <Card>
              <CardHead>
                <span className="ch-icon">💡</span>
                <span className="ch-title">Ziyaret Önerileri</span>
                <span className="ch-count">yaklaşan aşı & kontrol</span>
              </CardHead>
              {oneriler.map((o, i) => (
                <OneriItem key={`${o.tip}-${o.tarih}-${i}`}>
                  <div className="oi-dot" />
                  <div className="oi-body">
                    <div className="oi-baslik">{o.baslik}</div>
                    <div className="oi-alt">{o.ciftlik}{o.detay ? ` · ${o.detay}` : ''}</div>
                  </div>
                  <span className="oi-tarih">
                    {o.tarih ? new Date(o.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : ''}
                  </span>
                </OneriItem>
              ))}
            </Card>
          )}
        </MainPanel>
      </Grid>
    </Page>
  );
}
