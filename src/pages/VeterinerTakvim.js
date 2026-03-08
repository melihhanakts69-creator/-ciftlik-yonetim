import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import * as api from '../services/api';

const Page = styled.div`
  font-family: 'Inter', -apple-system, sans-serif;
  max-width: 900px;
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
  .title { font-size: 11px; font-weight: 700; color: #0ea5e9; letter-spacing: 0.08em; margin: 0 0 6px; text-transform: uppercase; }
  .name { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
  .desc { font-size: 13px; color: #64748b; margin-top: 8px; }
`;

const Section = styled.section`
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  h3 { margin: 0 0 16px; font-size: 14px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.03em; }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  &:last-child { border-bottom: none; }
  .tarih { font-size: 13px; color: #64748b; min-width: 100px; }
  .baslik { font-weight: 600; color: #0f172a; }
  .ciftlik { font-size: 12px; color: #64748b; }
  .badge { font-size: 10px; padding: 2px 8px; border-radius: 6px; background: #e0f2fe; color: #0369a1; }
  .badge.oneri { background: #fef3c7; color: #b45309; }
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  align-items: end;
  margin-bottom: 16px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
  input, select { padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; }
  button { padding: 10px 18px; border-radius: 10px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; background: #0ea5e9; color: #fff; }
  button:hover { background: #0284c7; }
  button:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const Empty = styled.p`
  color: #94a3b8;
  font-size: 13px;
  margin: 0;
  padding: 12px 0;
`;

export default function VeterinerTakvim() {
  const [randevular, setRandevular] = useState([]);
  const [oneriler, setOneriler] = useState([]);
  const [musteriler, setMusteriler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ciftciId: '', baslik: '', tarih: '', saat: '', aciklama: '' });
  const [gonderiyor, setGonderiyor] = useState(false);

  const start = new Date();
  start.setDate(1);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 2);

  useEffect(() => {
    Promise.all([
      api.getVeterinerRandevu(start.toISOString(), end.toISOString()),
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
      toast.success('Randevu eklendi.');
      setForm({ ciftciId: '', baslik: '', tarih: '', saat: '', aciklama: '' });
      const rRes = await api.getVeterinerRandevu(start.toISOString(), end.toISOString());
      setRandevular(rRes.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Eklenemedi.');
    } finally {
      setGonderiyor(false);
    }
  };

  if (loading) return <Page><Header><p className="title">Takvim</p><h1 className="name">Randevu ve ziyaret</h1></Header><p>Yükleniyor…</p></Page>;

  return (
    <Page>
      <Header>
        <p className="title">Takvim</p>
        <h1 className="name">Randevu ve ziyaret takvimi</h1>
        <p className="desc">Planladığınız randevuları yönetin; müşteri çiftliklerinden gelen aşı ve kontrol tarihleri öneri olarak listelenir.</p>
      </Header>

      <Section>
        <h3>Yeni randevu ekle</h3>
        <Form onSubmit={handleRandevuEkle}>
          <div>
            <label style={{ display: 'block', fontSize: 11, marginBottom: 4, color: '#64748b' }}>Çiftlik</label>
            <select value={form.ciftciId} onChange={e => setForm({ ...form, ciftciId: e.target.value })} required>
              <option value="">Seçin</option>
              {musteriler.map(m => (
                <option key={m._id} value={m._id}>{m.isletmeAdi || m.isim}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, marginBottom: 4, color: '#64748b' }}>Başlık / Konu</label>
            <input type="text" value={form.baslik} onChange={e => setForm({ ...form, baslik: e.target.value })} placeholder="Örn: Aşı, muayene" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, marginBottom: 4, color: '#64748b' }}>Tarih</label>
            <input type="date" value={form.tarih} onChange={e => setForm({ ...form, tarih: e.target.value })} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, marginBottom: 4, color: '#64748b' }}>Saat (opsiyonel)</label>
            <input type="time" value={form.saat} onChange={e => setForm({ ...form, saat: e.target.value })} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, marginBottom: 4, color: '#64748b' }}>Açıklama</label>
            <input type="text" value={form.aciklama} onChange={e => setForm({ ...form, aciklama: e.target.value })} placeholder="Kısa not" />
          </div>
          <button type="submit" disabled={gonderiyor}>{gonderiyor ? '…' : 'Ekle'}</button>
        </Form>
      </Section>

      <Section>
        <h3>Planlanan randevular</h3>
        {randevular.length === 0 ? (
          <Empty>Henüz randevu yok. Yukarıdan ekleyebilirsiniz.</Empty>
        ) : (
          randevular.map(r => (
            <Row key={r._id}>
              <span className="tarih">{r.tarih ? new Date(r.tarih).toLocaleDateString('tr-TR') : ''} {r.saat || ''}</span>
              <div>
                <div className="baslik">{r.baslik}</div>
                <div className="ciftlik">{r.ciftciId?.isletmeAdi || r.ciftciId?.isim || ''} {r.aciklama ? `· ${r.aciklama}` : ''}</div>
              </div>
              <span className="badge">{r.durum === 'tamamlandi' ? 'Tamamlandı' : 'Planlandı'}</span>
            </Row>
          ))
        )}
      </Section>

      <Section>
        <h3>Ziyaret önerileri (çiftlik aşı / kontrol tarihleri)</h3>
        {oneriler.length === 0 ? (
          <Empty>Yaklaşan aşı veya kontrol tarihi yok.</Empty>
        ) : (
          oneriler.map((o, i) => (
            <Row key={`${o.tip}-${o.tarih}-${i}`}>
              <span className="tarih">{o.tarih ? new Date(o.tarih).toLocaleDateString('tr-TR') : ''}</span>
              <div>
                <div className="baslik">{o.baslik}</div>
                <div className="ciftlik">{o.ciftlik} {o.detay ? `· ${o.detay}` : ''}</div>
              </div>
              <span className="badge oneri">Öneri</span>
            </Row>
          ))
        )}
      </Section>
    </Page>
  );
}
