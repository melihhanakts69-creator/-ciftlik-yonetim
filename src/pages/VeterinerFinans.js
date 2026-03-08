import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { toast } from 'react-toastify';
import * as api from '../services/api';

const fadeUp = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;

const Page = styled.div`
  font-family: 'Inter', -apple-system, sans-serif;
  max-width: 1050px;
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
    background: linear-gradient(180deg, #0ea5e9, #6366f1);
    border-radius: 10px 0 0 10px;
  }
  .left { padding-left: 8px; }
  .eyebrow { font-size: 11px; font-weight: 800; color: #0ea5e9; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 4px; }
  .title { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
  .desc { font-size: 13px; color: #64748b; margin: 6px 0 0; line-height: 1.5; }
  .badge { padding: 6px 14px; background: #eff6ff; color: #2563eb; border-radius: 20px; font-size: 12px; font-weight: 700; white-space: nowrap; border: 1px solid #bfdbfe; }
`;

const MetricRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  @media (max-width: 700px) { grid-template-columns: 1fr; }
`;

const MetricCard = styled.div`
  background: ${p => p.$primary
    ? 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)'
    : '#fff'};
  border-radius: 14px;
  padding: 20px 22px;
  border: 1px solid ${p => p.$primary ? 'transparent' : '#e2e8f0'};
  box-shadow: ${p => p.$primary
    ? '0 12px 30px -8px rgba(37,99,235,0.35)'
    : '0 2px 8px rgba(0,0,0,0.04)'};
  position: relative;
  overflow: hidden;
  transition: transform 0.2s;
  &:hover { transform: translateY(-2px); }
  &::after {
    content: '';
    position: absolute;
    top: -20px; right: -20px;
    width: 80px; height: 80px;
    background: ${p => p.$primary
      ? 'rgba(255,255,255,0.12)'
      : p.$accent || 'rgba(14,165,233,0.06)'};
    border-radius: 50%;
  }
  .icon { font-size: 22px; margin-bottom: 10px; }
  .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${p => p.$primary ? 'rgba(255,255,255,0.75)' : '#94a3b8'}; margin-bottom: 4px; }
  .value { font-size: 26px; font-weight: 900; color: ${p => p.$primary ? '#fff' : (p.$color || '#0f172a')}; letter-spacing: -0.02em; line-height: 1; }
  .sub { font-size: 12px; color: ${p => p.$primary ? 'rgba(255,255,255,0.6)' : '#64748b'}; margin-top: 6px; }
`;

const SectionCard = styled.div`
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  margin-bottom: 20px;
`;

const SectionHead = styled.div`
  padding: 16px 22px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 10px;
  h2 { margin: 0; font-size: 14px; font-weight: 800; color: #0f172a; }
  span { font-size: 12px; color: #64748b; font-weight: 500; margin-left: auto; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    padding: 14px 18px;
    text-align: left;
    border-bottom: 1px solid #f1f5f9;
    font-size: 13px;
  }
  th {
    font-size: 10px;
    font-weight: 800;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    background: #fafbfc;
  }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #fafbfd; }
`;

const BakiyeBadge = styled.span`
  font-weight: 800;
  font-size: 14px;
  color: ${p => p.$v > 500 ? '#dc2626' : p.$v > 100 ? '#d97706' : p.$v > 0 ? '#059669' : '#94a3b8'};
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  background: ${p => p.$type === 'acik' ? '#fff7ed' : '#f0fdf4'};
  color: ${p => p.$type === 'acik' ? '#c2410c' : '#16a34a'};
  border: 1px solid ${p => p.$type === 'acik' ? '#fed7aa' : '#bbf7d0'};
`;

const ActionBtn = styled.button`
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.18s;
  margin-right: 6px;
  &.detail { background: #eff6ff; color: #2563eb; }
  &.detail:hover { background: #dbeafe; }
  &.warn { background: #fff7ed; color: #c2410c; }
  &.warn:hover { background: #fed7aa; }
`;

const DetailPanel = styled.div`
  margin-top: 20px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
  animation: ${fadeUp} 0.3s ease;
`;

const DetailHead = styled.div`
  padding: 16px 22px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(90deg, #f8fafc, #fff);
  display: flex;
  align-items: center;
  justify-content: space-between;
  h3 { margin: 0; font-size: 15px; font-weight: 800; color: #0f172a; }
  button { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 20px; line-height: 1; padding: 0 4px; }
  button:hover { color: #ef4444; }
`;

const KalemList = styled.div`
  padding: 0 22px;
`;

const KalemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;
  &:last-child { border-bottom: none; }
  .aciklama { font-size: 13px; color: #374151; font-weight: 600; }
  .tarih { font-size: 11px; color: #94a3b8; margin-top: 3px; }
  .right { text-align: right; }
  .tutar { font-size: 14px; font-weight: 800; color: #0f172a; }
  .odenen { font-size: 12px; color: #16a34a; margin-top: 2px; }
  .kalan { font-size: 12px; color: #dc2626; margin-top: 2px; }
`;

const BakiyeSummary = styled.div`
  margin: 0 22px;
  padding: 14px 0;
  border-top: 2px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .label { font-size: 13px; font-weight: 700; color: #475569; }
  .amount { font-size: 18px; font-weight: 900; color: #dc2626; }
  .amount.clear { color: #16a34a; }
`;

const TahsilatForm = styled.form`
  margin: 16px 22px 22px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  h4 { margin: 0 0 14px; font-size: 13px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
  .fields { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; }
  .field { display: flex; flex-direction: column; gap: 4px; }
  .field label { font-size: 11px; color: #64748b; font-weight: 700; }
  .field input { padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: #fff; min-width: 130px; }
  .field input:focus { outline: none; border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.12); }
  .submit-btn { padding: 10px 22px; border-radius: 10px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; background: linear-gradient(135deg, #0ea5e9, #2563eb); color: #fff; box-shadow: 0 4px 12px rgba(14,165,233,0.25); transition: all 0.2s; white-space: nowrap; align-self: flex-end; }
  .submit-btn:hover:not(:disabled) { box-shadow: 0 6px 18px rgba(14,165,233,0.35); transform: translateY(-1px); }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Empty = styled.div`
  text-align: center;
  padding: 56px 24px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
  .icon { font-size: 42px; margin-bottom: 14px; opacity: 0.5; }
  strong { display: block; font-size: 16px; color: #374151; margin-bottom: 8px; }
`;

export default function VeterinerFinans() {
  const [cari, setCari] = useState({ list: [], toplamBakiye: 0 });
  const [loading, setLoading] = useState(true);
  const [detay, setDetay] = useState(null);
  const [detayId, setDetayId] = useState(null);
  const [detayCiftciAd, setDetayCiftciAd] = useState('');
  const [tahsilatTutar, setTahsilatTutar] = useState('');
  const [tahsilatAciklama, setTahsilatAciklama] = useState('');
  const [gonderiyor, setGonderiyor] = useState(false);

  const fetchCari = () => {
    api.getVeterinerCari()
      .then(res => setCari({ list: res.data?.list || [], toplamBakiye: res.data?.toplamBakiye || 0 }))
      .catch(() => setCari({ list: [], toplamBakiye: 0 }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCari(); }, []);

  useEffect(() => {
    if (!detayId) { setDetay(null); return; }
    api.getVeterinerCariDetay(detayId)
      .then(res => setDetay(res.data))
      .catch(() => setDetay(null));
  }, [detayId]);

  const handleTahsilat = async (e) => {
    e.preventDefault();
    const tutar = parseFloat(String(tahsilatTutar).replace(',', '.'));
    if (!detayId || !(tutar > 0) || gonderiyor) return;
    setGonderiyor(true);
    try {
      await api.postVeterinerTahsilat({ ciftciId: detayId, tutar, aciklama: tahsilatAciklama.trim() || undefined });
      toast.success('✅ Tahsilat kaydedildi.');
      setTahsilatTutar('');
      setTahsilatAciklama('');
      fetchCari();
      api.getVeterinerCariDetay(detayId).then(res => setDetay(res.data)).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tahsilat kaydedilemedi.');
    } finally {
      setGonderiyor(false);
    }
  };

  const handleHatirlatma = async (ciftciId, ad) => {
    try {
      await api.postVeterinerHatirlatma(ciftciId);
      toast.success(`📬 Borç hatırlatması "${ad}" çiftliğine gönderildi.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gönderilemedi.');
    }
  };

  const openDetay = (row) => {
    setDetayId(row.ciftciId);
    setDetayCiftciAd(row.isletmeAdi || row.isim || 'Müşteri');
  };

  const toplamTahsilat = cari.list.reduce((s, r) => s + (r.toplamOdenen || 0), 0);
  const toplamAlacak = cari.list.reduce((s, r) => s + (r.toplamAlacak || 0), 0);
  const buAy = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <Page>
        <PageHeader>
          <div className="left">
            <p className="eyebrow">Finans</p>
            <h1 className="title">Fatura ve tahsilat</h1>
          </div>
        </PageHeader>
        <Empty><div className="icon">⏳</div><strong>Yükleniyor…</strong></Empty>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader>
        <div className="left">
          <p className="eyebrow">Finans</p>
          <h1 className="title">Fatura ve Tahsilat</h1>
          <p className="desc">Müşteri bazında alacaklarınızı takip edin, tahsilat kaydedin, borç hatırlatması gönderin.</p>
        </div>
        <span className="badge">📅 {buAy}</span>
      </PageHeader>

      <MetricRow>
        <MetricCard $primary>
          <div className="icon">💰</div>
          <div className="label">Net bakiye (alacak)</div>
          <div className="value">{cari.toplamBakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
          <div className="sub">{cari.list.filter(r => r.bakiye > 0).length} müşteride açık hesap</div>
        </MetricCard>
        <MetricCard $accent="rgba(239,68,68,0.06)">
          <div className="icon">📋</div>
          <div className="label">Toplam faturalandı</div>
          <div className="value" style={{ color: '#0f172a' }}>{toplamAlacak.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
          <div className="sub">{cari.list.length} müşteri</div>
        </MetricCard>
        <MetricCard $accent="rgba(22,163,74,0.06)">
          <div className="icon">✅</div>
          <div className="label">Toplam tahsilat</div>
          <div className="value" style={{ color: '#16a34a' }}>{toplamTahsilat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
          <div className="sub">{toplamAlacak > 0 ? Math.round(toplamTahsilat / toplamAlacak * 100) : 0}% tahsil edildi</div>
        </MetricCard>
      </MetricRow>

      {cari.list.length === 0 ? (
        <Empty>
          <div className="icon">🧾</div>
          <strong>Henüz alacak kaydı yok</strong>
          Hastalar panelinde sağlık kaydı girerken "Tutar (TL)" alanını doldurduğunuzda burada otomatik oluşur.
        </Empty>
      ) : (
        <SectionCard>
          <SectionHead>
            <span>🏦</span>
            <h2>Müşteri cari hesapları</h2>
            <span>{cari.list.length} kayıt</span>
          </SectionHead>
          <Table>
            <thead>
              <tr>
                <th>Çiftlik / Müşteri</th>
                <th>Faturalanan</th>
                <th>Tahsilat</th>
                <th>Bakiye</th>
                <th>Durum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cari.list.map(row => (
                <tr key={row.ciftciId}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.isletmeAdi || row.isim || '—'}</div>
                  </td>
                  <td style={{ color: '#374151' }}>{row.toplamAlacak?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                  <td style={{ color: '#16a34a' }}>{row.toplamOdenen?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                  <td><BakiyeBadge $v={row.bakiye}>{row.bakiye?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</BakiyeBadge></td>
                  <td>
                    <Pill $type={row.bakiye > 0 ? 'acik' : 'kapali'}>
                      {row.bakiye > 0 ? '⏳ Açık' : '✅ Kapandı'}
                    </Pill>
                  </td>
                  <td>
                    <ActionBtn type="button" className="detail" onClick={() => openDetay(row)}>Detay / Tahsilat</ActionBtn>
                    {row.bakiye > 0 && (
                      <ActionBtn type="button" className="warn" onClick={() => handleHatirlatma(row.ciftciId, row.isletmeAdi || row.isim)}>
                        📬 Hatırlat
                      </ActionBtn>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </SectionCard>
      )}

      {detay && (
        <DetailPanel>
          <DetailHead>
            <h3>📂 {detayCiftciAd} — Cari detay</h3>
            <button type="button" onClick={() => { setDetay(null); setDetayId(null); }}>×</button>
          </DetailHead>
          <KalemList>
            {(detay.kalemler || []).length === 0 ? (
              <p style={{ padding: '20px 0', color: '#94a3b8', textAlign: 'center' }}>Kalem bulunamadı.</p>
            ) : (
              detay.kalemler.map(k => {
                const kalan = (k.tutar || 0) - (k.odenenTutar || 0);
                return (
                  <KalemRow key={k._id}>
                    <div>
                      <div className="aciklama">{k.aciklama || 'Sağlık hizmeti'}</div>
                      <div className="tarih">{new Date(k.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                    <div className="right">
                      <div className="tutar">{k.tutar?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                      {k.odenenTutar > 0 && <div className="odenen">✓ {k.odenenTutar?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺ ödendi</div>}
                      {kalan > 0 && <div className="kalan">{kalan.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺ kalan</div>}
                    </div>
                  </KalemRow>
                );
              })
            )}
          </KalemList>
          {detay.bakiye != null && (
            <BakiyeSummary>
              <span className="label">Toplam kalan bakiye</span>
              <span className={`amount ${detay.bakiye <= 0 ? 'clear' : ''}`}>
                {detay.bakiye <= 0 ? '✅ Hesap kapandı' : `${detay.bakiye?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`}
              </span>
            </BakiyeSummary>
          )}
          {detay.bakiye > 0 && (
            <TahsilatForm onSubmit={handleTahsilat}>
              <h4>💳 Tahsilat gir</h4>
              <div className="fields">
                <div className="field">
                  <label>Tutar (₺)</label>
                  <input type="number" min="0" step="0.01" value={tahsilatTutar} onChange={e => setTahsilatTutar(e.target.value)} placeholder="0.00" required />
                </div>
                <div className="field">
                  <label>Açıklama (opsiyonel)</label>
                  <input type="text" value={tahsilatAciklama} onChange={e => setTahsilatAciklama(e.target.value)} placeholder="Nakit, havale, kart…" style={{ width: 180 }} />
                </div>
                <button type="submit" className="submit-btn" disabled={gonderiyor || !tahsilatTutar}>
                  {gonderiyor ? '…' : '✅ Tahsilat kaydet'}
                </button>
              </div>
            </TahsilatForm>
          )}
        </DetailPanel>
      )}
    </Page>
  );
}
