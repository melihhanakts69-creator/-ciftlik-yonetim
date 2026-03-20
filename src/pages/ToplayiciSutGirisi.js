import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as api from '../services/api';
import { toast } from 'react-toastify';

export default function ToplayiciSutGirisi() {
  const location = useLocation();
  const [ciftlikler, setCiftlikler] = useState([]);
  const [form, setForm] = useState({
    ciftlikId: '',
    ciftlikKodu: '',
    tarih: new Date().toISOString().split('T')[0],
    litre: '',
    sagim: 'sabah',
  });
  const [submitting, setSubmitting] = useState(false);
  const [gecmis, setGecmis] = useState([]);
  const [fiyat, setFiyat] = useState(0);

  useEffect(() => {
    api.getToplayiciCiftlikler().then(r => {
      const list = r.data || [];
      setCiftlikler(list);
      const state = location.state?.ciftlik;
      if (state) {
        setForm(f => ({ ...f, ciftlikId: state._id, ciftlikKodu: state.ciftlikKodu || '' }));
      }
    });
    api.getToplayiciFiyat().then(r => setFiyat(r.data?.fiyat || 0));
    api.getToplayiciSonToplamalar().then(r => setGecmis(r.data || []));
  }, [location.state?.ciftlik]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const secili = ciftlikler.find(c => c._id === form.ciftlikId);
    if (!secili?.ciftlikKodu || !form.tarih || !form.litre) {
      toast.warning('Çiftlik, tarih ve litre girin');
      return;
    }
    setSubmitting(true);
    try {
      await api.toplayiciSutToplama({
        ciftlikKodu: secili.ciftlikKodu,
        tarih: form.tarih,
        litre: parseFloat(form.litre),
        sagim: form.sagim,
      });
      toast.success('✅ Kayıt çiftliğe işlendi');
      setForm(f => ({ ...f, litre: '' }));
      api.getToplayiciSonToplamalar().then(r => setGecmis(r.data || []));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kayıt eklenemedi');
    } finally { setSubmitting(false); }
  };

  const tahminiGelir = form.litre && fiyat > 0 ? (parseFloat(form.litre) * fiyat).toFixed(2) : null;

  return (
    <div style={{ background: '#f9fafb', minHeight: '100%' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '13px 20px', position: 'sticky', top: 56, zIndex: 5 }}>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Süt Girişi</h1>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>Çiftliğe süt toplama kaydı ekle</p>
      </div>

      <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: '420px 1fr', gap: 14, alignItems: 'start' }}>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 6 }}>Çiftlik *</label>
            <select
              value={form.ciftlikId}
              onChange={e => setForm(f => ({ ...f, ciftlikId: e.target.value }))}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, background: '#fff', outline: 'none' }}
            >
              <option value="">— Çiftlik Seç —</option>
              {ciftlikler.map(c => (
                <option key={c._id} value={c._id}>{c.isletmeAdi || c.isim || 'İsimsiz'} ({c.ciftlikKodu})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 6 }}>Tarih *</label>
              <input type="date" value={form.tarih} onChange={e => setForm(f => ({ ...f, tarih: e.target.value }))} required style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 6 }}>Sağım</label>
              <select value={form.sagim} onChange={e => setForm(f => ({ ...f, sagim: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, outline: 'none' }}>
                <option value="sabah">🌅 Sabah</option>
                <option value="aksam">🌙 Akşam</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 6 }}>Litre *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number" step="0.1" min="0"
                value={form.litre}
                onChange={e => setForm(f => ({ ...f, litre: e.target.value }))}
                placeholder="0.0"
                required
                style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, fontWeight: 500, outline: 'none', boxSizing: 'border-box' }}
              />
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9ca3af' }}>Lt</span>
            </div>
          </div>

          {/* Tahmini gelir */}
          {tahminiGelir && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#166534' }}>Tahmini gelir ({fiyat} ₺/Lt)</span>
              <span style={{ fontWeight: 600, color: '#16a34a' }}>{tahminiGelir} ₺</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !form.ciftlikId || !form.litre}
            style={{ width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}
          >
            {submitting ? 'Kaydediliyor...' : '✓ Süt Toplama Kaydı Gönder'}
          </button>
        </form>

        {/* Son girişler */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>Son Girişler</span>
          </div>
          {gecmis.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Henüz giriş yok</div>
          ) : gecmis.slice(0, 15).map(k => (
            <div key={k._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: '1px solid #f9fafb' }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🥛</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>{k.tenantId?.name || k.tenantId?.ciftlikKodu || 'Çiftlik'}</div>
                <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{k.tarih} · {k.sagim === 'aksam' ? 'Akşam' : 'Sabah'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#2563eb' }}>{k.litre} Lt</div>
                {fiyat > 0 && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{(k.litre * fiyat).toFixed(2)} ₺</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@media(max-width:768px){.tpl-sut-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
