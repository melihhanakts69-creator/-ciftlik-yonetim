import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { toast } from 'react-toastify';
import * as api from '../services/api';

const fadeUp = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;

const Page = styled.div`
  font-family: 'Inter', -apple-system, sans-serif;
  max-width: 960px;
  margin: 0 auto;
  padding: 28px 24px 64px;
  background: #f8fafc;
  min-height: calc(100vh - 100px);
  animation: ${fadeUp} 0.4s ease;
`;

const PageHeader = styled.header`
  margin-bottom: 28px;
  padding: 24px 28px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 5px;
    background: linear-gradient(180deg, #0ea5e9, #059669);
    border-radius: 10px 0 0 10px;
  }
  .left { padding-left: 8px; }
  .eyebrow { font-size: 11px; font-weight: 800; color: #0ea5e9; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 4px; }
  .title { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
  .desc { font-size: 13px; color: #64748b; margin: 6px 0 0; }
  .badge { padding: 6px 14px; background: #f0fdf4; color: #059669; border-radius: 20px; font-size: 12px; font-weight: 700; white-space: nowrap; border: 1px solid #bbf7d0; }
`;

const FormCard = styled.div`
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  margin-bottom: 20px;
  overflow: hidden;
`;

const FormHead = styled.div`
  padding: 16px 22px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 8px;
  h2 { margin: 0; font-size: 14px; font-weight: 800; color: #0f172a; }
`;

const FormGrid = styled.form`
  padding: 20px 22px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px;
  @media (max-width: 720px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 480px) { grid-template-columns: 1fr; }

  .field { display: flex; flex-direction: column; gap: 5px; }
  .field label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .field input, .field select {
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 13px;
    font-family: inherit;
    background: #fafbfc;
    transition: all 0.2s;
    &:focus { outline: none; border-color: #0ea5e9; background: #fff; box-shadow: 0 0 0 3px rgba(14,165,233,0.12); }
  }
  .submit-wrap { display: flex; align-items: flex-end; }
  .submit-btn {
    width: 100%; padding: 11px 18px;
    border-radius: 10px; font-size: 13px; font-weight: 700;
    border: none; cursor: pointer;
    background: linear-gradient(135deg, #0ea5e9, #2563eb);
    color: #fff;
    box-shadow: 0 4px 12px rgba(14,165,233,0.25);
    transition: all 0.2s;
    &:hover:not(:disabled) { box-shadow: 0 6px 18px rgba(14,165,233,0.35); transform: translateY(-1px); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
`;

const SectionCard = styled.div`
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  margin-bottom: 20px;
  overflow: hidden;
`;

const SectionHead = styled.div`
  padding: 16px 22px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 8px;
  .icon { font-size: 18px; }
  h2 { margin: 0; font-size: 14px; font-weight: 800; color: #0f172a; flex: 1; }
  .count { font-size: 11px; color: #94a3b8; font-weight: 700; }
`;

const RandevuItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 22px;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.15s;
  &:last-child { border-bottom: none; }
  &:hover { background: #fafbfd; }

  .date-col {
    display: flex; flex-direction: column; align-items: center;
    min-width: 52px;
    padding: 10px 8px;
    border-radius: 10px;
    background: ${p => p.$isToday ? 'linear-gradient(135deg, #0ea5e9, #2563eb)' : '#f1f5f9'};
    text-align: center;
    .day { font-size: 22px; font-weight: 900; color: ${p => p.$isToday ? '#fff' : '#0f172a'}; line-height: 1; }
    .month { font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${p => p.$isToday ? 'rgba(255,255,255,0.8)' : '#64748b'}; margin-top: 2px; }
  }

  .body { flex: 1; min-width: 0; }
  .baslik { font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .meta { font-size: 12px; color: #64748b; display: flex; gap: 12px; flex-wrap: wrap; }
  .meta span { display: flex; align-items: center; gap: 4px; }

  .actions { display: flex; gap: 8px; align-items: flex-start; flex-shrink: 0; }
`;

const StatusPill = styled.span`
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  background: ${p =>
    p.$d === 'tamamlandi' ? '#f0fdf4' :
    p.$d === 'iptal' ? '#fef2f2' :
    p.$isToday ? '#eff6ff' : '#fafafa'};
  color: ${p =>
    p.$d === 'tamamlandi' ? '#16a34a' :
    p.$d === 'iptal' ? '#dc2626' :
    p.$isToday ? '#2563eb' : '#64748b'};
  border: 1px solid ${p =>
    p.$d === 'tamamlandi' ? '#bbf7d0' :
    p.$d === 'iptal' ? '#fecaca' :
    p.$isToday ? '#bfdbfe' : '#e5e7eb'};
`;

const SmallBtn = styled.button`
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
  &.done { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
  &.done:hover { background: #dcfce7; }
  &.cancel { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  &.cancel:hover { background: #fee2e2; }
`;

const OneriItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 22px;
  border-bottom: 1px solid #f8fafc;
  &:last-child { border-bottom: none; }
  &:hover { background: #fffbeb; }
  .dot { width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; flex-shrink: 0; }
  .info { flex: 1; }
  .baslik { font-size: 13px; font-weight: 700; color: #1e293b; }
  .alt { font-size: 12px; color: #64748b; margin-top: 2px; }
  .tarih { font-size: 12px; font-weight: 700; color: #d97706; background: #fef3c7; padding: 3px 10px; border-radius: 20px; white-space: nowrap; border: 1px solid #fde68a; }
`;

const Empty = styled.div`
  text-align: center;
  padding: 36px 20px;
  color: #94a3b8;
  font-size: 13px;
  .icon { font-size: 32px; margin-bottom: 10px; opacity: 0.4; }
`;

const MONTHS_TR = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];

function getRandevuAralik() {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 2);
  return { start: start.toISOString(), end: end.toISOString() };
}

export default function VeterinerTakvim() {
  const [randevular, setRandevular] = useState([]);
  const [oneriler, setOneriler] = useState([]);
  const [musteriler, setMusteriler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ciftciId: '', baslik: '', tarih: '', saat: '', aciklama: '' });
  const [gonderiyor, setGonderiyor] = useState(false);

  const todayStr = new Date().toDateString();

  const fetchRandevular = async () => {
    const { start, end } = getRandevuAralik();
    const rRes = await api.getVeterinerRandevu(start, end);
    setRandevular(rRes.data || []);
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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Eklenemedi.');
    } finally {
      setGonderiyor(false);
    }
  };

  const handleDurum = async (id, durum) => {
    try {
      await api.patchVeterinerRandevu(id, { durum });
      setRandevular(prev => prev.map(r => r._id === id ? { ...r, durum } : r));
      toast.success(durum === 'tamamlandi' ? '✅ Randevu tamamlandı olarak işaretlendi.' : '❌ Randevu iptal edildi.');
    } catch {
      toast.error('Güncellenemedi.');
    }
  };

  const buAy = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  const bugunSayisi = randevular.filter(r => new Date(r.tarih).toDateString() === todayStr && r.durum === 'planlandi').length;

  const sorted = [...randevular].sort((a, b) => new Date(a.tarih) - new Date(b.tarih));

  if (loading) {
    return (
      <Page>
        <PageHeader>
          <div className="left">
            <p className="eyebrow">Takvim</p>
            <h1 className="title">Randevu ve ziyaret</h1>
          </div>
        </PageHeader>
        <p style={{ padding: 24, color: '#94a3b8' }}>Yükleniyor…</p>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader>
        <div className="left">
          <p className="eyebrow">Takvim</p>
          <h1 className="title">Randevu ve Ziyaret Takvimi</h1>
          <p className="desc">
            Planladığınız randevuları yönetin.
            {bugunSayisi > 0 && <strong style={{ color: '#0ea5e9' }}> Bugün {bugunSayisi} randevunuz var.</strong>}
          </p>
        </div>
        <span className="badge">📅 {buAy}</span>
      </PageHeader>

      <FormCard>
        <FormHead>
          <span>➕</span>
          <h2>Yeni randevu ekle</h2>
        </FormHead>
        <FormGrid onSubmit={handleRandevuEkle}>
          <div className="field">
            <label>Çiftlik</label>
            <select value={form.ciftciId} onChange={e => setForm({ ...form, ciftciId: e.target.value })} required>
              <option value="">Müşteri seçin…</option>
              {musteriler.map(m => (
                <option key={m._id} value={m._id}>{m.isletmeAdi || m.isim}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Başlık / Konu</label>
            <input type="text" value={form.baslik} onChange={e => setForm({ ...form, baslik: e.target.value })} placeholder="Aşı, muayene, kontrol…" required />
          </div>
          <div className="field">
            <label>Tarih</label>
            <input type="date" value={form.tarih} onChange={e => setForm({ ...form, tarih: e.target.value })} required />
          </div>
          <div className="field">
            <label>Saat (opsiyonel)</label>
            <input type="time" value={form.saat} onChange={e => setForm({ ...form, saat: e.target.value })} />
          </div>
          <div className="field">
            <label>Not / Açıklama</label>
            <input type="text" value={form.aciklama} onChange={e => setForm({ ...form, aciklama: e.target.value })} placeholder="Kısa not…" />
          </div>
          <div className="submit-wrap">
            <button type="submit" className="submit-btn" disabled={gonderiyor}>
              {gonderiyor ? '…' : '📅 Ekle & Bildir'}
            </button>
          </div>
        </FormGrid>
      </FormCard>

      <SectionCard>
        <SectionHead>
          <span className="icon">📋</span>
          <h2>Planlanan randevular</h2>
          <span className="count">{sorted.filter(r => r.durum !== 'iptal').length} aktif</span>
        </SectionHead>
        {sorted.length === 0 ? (
          <Empty>
            <div className="icon">🗓️</div>
            Henüz randevu yok. Yukarıdaki formu kullanarak ekleyebilirsiniz.
          </Empty>
        ) : (
          sorted.map(r => {
            const dt = r.tarih ? new Date(r.tarih) : null;
            const isToday = dt && dt.toDateString() === todayStr;
            const isPast = dt && dt < new Date() && r.durum === 'planlandi';
            return (
              <RandevuItem key={r._id} $isToday={isToday}>
                {dt && (
                  <div className="date-col">
                    <div className="day">{dt.getDate()}</div>
                    <div className="month">{MONTHS_TR[dt.getMonth()]}</div>
                  </div>
                )}
                <div className="body">
                  <div className="baslik">
                    {r.baslik}
                    <StatusPill $d={r.durum} $isToday={isToday}>
                      {r.durum === 'tamamlandi' ? '✅ Tamamlandı' :
                       r.durum === 'iptal' ? '❌ İptal' :
                       isToday ? '🔵 Bugün' :
                       isPast ? '⚠️ Gecikmeli' : '⏳ Planlandı'}
                    </StatusPill>
                  </div>
                  <div className="meta">
                    {r.ciftciId && <span>🏡 {r.ciftciId.isletmeAdi || r.ciftciId.isim}</span>}
                    {r.saat && <span>🕐 {r.saat}</span>}
                    {r.aciklama && <span>📝 {r.aciklama}</span>}
                  </div>
                </div>
                {r.durum === 'planlandi' && (
                  <div className="actions">
                    <SmallBtn type="button" className="done" onClick={() => handleDurum(r._id, 'tamamlandi')}>✓ Tamamla</SmallBtn>
                    <SmallBtn type="button" className="cancel" onClick={() => handleDurum(r._id, 'iptal')}>İptal</SmallBtn>
                  </div>
                )}
              </RandevuItem>
            );
          })
        )}
      </SectionCard>

      <SectionCard>
        <SectionHead>
          <span className="icon">💡</span>
          <h2>Ziyaret önerileri</h2>
          <span className="count">yaklaşan aşı & kontrol tarihleri</span>
        </SectionHead>
        {oneriler.length === 0 ? (
          <Empty>
            <div className="icon">🌿</div>
            Önümüzdeki dönemde yaklaşan aşı veya kontrol tarihi bulunamadı.
          </Empty>
        ) : (
          oneriler.map((o, i) => (
            <OneriItem key={`${o.tip}-${o.tarih}-${i}`}>
              <div className="dot" />
              <div className="info">
                <div className="baslik">{o.baslik}</div>
                <div className="alt">{o.ciftlik}{o.detay ? ` · ${o.detay}` : ''}</div>
              </div>
              <span className="tarih">
                {o.tarih ? new Date(o.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : ''}
              </span>
            </OneriItem>
          ))
        )}
      </SectionCard>
    </Page>
  );
}
