import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import * as api from '../services/api';

const Page = styled.div`
  font-family: 'Inter', -apple-system, sans-serif;
  max-width: 1000px;
  margin: 0 auto;
  padding: 28px 24px 56px;
  background: #f8fafc;
  min-height: calc(100vh - 100px);
`;

const Header = styled.header`
  margin-bottom: 24px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  .title { font-size: 11px; font-weight: 700; color: #0ea5e9; letter-spacing: 0.08em; margin: 0 0 6px; text-transform: uppercase; }
  .name { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
  .desc { font-size: 13px; color: #64748b; margin-top: 8px; }
`;

const ToplamCard = styled.div`
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  .label { font-size: 12px; font-weight: 600; opacity: 0.9; }
  .value { font-size: 28px; font-weight: 800; }
`;

const TableWrap = styled.div`
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 14px 18px; text-align: left; border-bottom: 1px solid #f1f5f9; }
  th { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; background: #f8fafc; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #f8fafc; }
  .bakiye { font-weight: 700; color: #0ea5e9; }
  .btn-small { padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; border: none; cursor: pointer; margin-right: 8px; }
  .btn-detail { background: #e0f2fe; color: #0284c7; }
  .btn-detail:hover { background: #bae6fd; }
  .btn-hatirlat { background: #fef3c7; color: #b45309; }
  .btn-hatirlat:hover { background: #fde68a; }
`;

const DetailPanel = styled.div`
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  margin-top: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  h3 { margin: 0 0 16px; font-size: 16px; color: #0f172a; }
  .kalem { padding: 12px 0; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
  .kalem:last-child { border-bottom: none; }
  .tahsilat-form { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; }
  .tahsilat-form input { padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; width: 120px; }
  .tahsilat-form button { padding: 10px 18px; border-radius: 10px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; background: #0ea5e9; color: #fff; }
  .tahsilat-form button:hover { background: #0284c7; }
  .tahsilat-form button:disabled { opacity: 0.6; cursor: not-allowed; }
  .ozet-satir { display: flex; justify-content: space-between; margin-top: 12px; font-weight: 600; color: #475569; }
  .ozet-satir.toplam { font-size: 15px; color: #0ea5e9; margin-top: 16px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
`;

const Empty = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: #64748b;
  font-size: 14px;
  background: #fff;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
`;

export default function VeterinerFinans() {
  const [cari, setCari] = useState({ list: [], toplamBakiye: 0 });
  const [loading, setLoading] = useState(true);
  const [detay, setDetay] = useState(null);
  const [detayId, setDetayId] = useState(null);
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
      toast.success('Tahsilat kaydedildi.');
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

  const handleHatirlatma = async (ciftciId) => {
    try {
      await api.postVeterinerHatirlatma(ciftciId);
      toast.success('Borç hatırlatması çiftçiye gönderildi.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gönderilemedi.');
    }
  };

  return (
    <Page>
      <Header>
        <p className="title">Finans</p>
        <h1 className="name">Fatura ve tahsilat</h1>
        <p className="desc">Müşteri bazında alacaklarınızı görün, tahsilat girin veya çiftçiye borç hatırlatması gönderin.</p>
      </Header>

      {loading ? (
        <Empty>Yükleniyor…</Empty>
      ) : (
        <>
          {cari.toplamBakiye > 0 && (
            <ToplamCard>
              <div className="label">Toplam alacak bakiyesi</div>
              <div className="value">{cari.toplamBakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
            </ToplamCard>
          )}

          {cari.list.length === 0 ? (
            <Empty>Henüz alacak kaydı yok. Hastalar panelinde sağlık kaydı girerken &quot;Tutar (TL)&quot; doldurduğunuzda burada listelenir.</Empty>
          ) : (
            <TableWrap>
              <table>
                <thead>
                  <tr>
                    <th>Çiftlik / Müşteri</th>
                    <th>Toplam alacak</th>
                    <th>Tahsilat</th>
                    <th>Bakiye</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cari.list.map(row => (
                    <tr key={row.ciftciId}>
                      <td><strong>{row.isletmeAdi || row.isim || '—'}</strong></td>
                      <td>{row.toplamAlacak?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                      <td>{row.toplamOdenen?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                      <td className="bakiye">{row.bakiye?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                      <td>
                        <button type="button" className="btn-small btn-detail" onClick={() => setDetayId(row.ciftciId)}>Detay / Tahsilat</button>
                        <button type="button" className="btn-small btn-hatirlat" onClick={() => handleHatirlatma(row.ciftciId)}>Hatırlatma gönder</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}

          {detay && (
            <DetailPanel>
              <h3>{detay.ciftci?.isletmeAdi || detay.ciftci?.isim || 'Cari detay'}</h3>
              {detay.kalemler?.length ? (
                <>
                  {detay.kalemler.map(k => (
                    <div key={k._id} className="kalem">
                      <span>{k.aciklama || 'Kalem'} · {new Date(k.tarih).toLocaleDateString('tr-TR')}</span>
                      <span>{k.tutar?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺ — Ödenen: {(k.odenenTutar || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                    </div>
                  ))}
                  <div className="ozet-satir toplam">Bakiye: {detay.bakiye?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                  {detay.bakiye > 0 && (
                    <form className="tahsilat-form" onSubmit={handleTahsilat}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: '#64748b' }}>Tahsilat tutarı (₺)</label>
                        <input type="number" min="0" step="0.01" value={tahsilatTutar} onChange={e => setTahsilatTutar(e.target.value)} placeholder="0.00" required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: '#64748b' }}>Açıklama (opsiyonel)</label>
                        <input type="text" value={tahsilatAciklama} onChange={e => setTahsilatAciklama(e.target.value)} placeholder="Nakit, havale..." style={{ width: 160 }} />
                      </div>
                      <button type="submit" disabled={gonderiyor || !tahsilatTutar}>Tahsilat kaydet</button>
                    </form>
                  )}
                </>
              ) : (
                <p style={{ margin: 0, color: '#64748b' }}>Kalem yok.</p>
              )}
            </DetailPanel>
          )}
        </>
      )}
    </Page>
  );
}
