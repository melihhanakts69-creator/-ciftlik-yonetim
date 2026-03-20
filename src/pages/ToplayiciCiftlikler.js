import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as api from '../services/api';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ToplayiciCiftlikler() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ciftlikler, setCiftlikler] = useState([]);
  const [secili, setSecili] = useState(null);
  const [istatistik, setIstatistik] = useState(null);
  const [istatistikLoading, setIstatistikLoading] = useState(false);
  const [ciftlikKodu, setCiftlikKodu] = useState('');
  const [adding, setAdding] = useState(false);
  const [fiyat, setFiyat] = useState(0);

  useEffect(() => {
    api.getToplayiciCiftlikler().then(r => {
      const list = r.data || [];
      setCiftlikler(list);
      const seciliId = location.state?.secili;
      if (seciliId) {
        const c = list.find(x => String(x._id) === String(seciliId));
        if (c) seciCiftlik(c);
      }
    });
    api.getToplayiciFiyat().then(r => setFiyat(r.data?.fiyat || 0));
  }, [location.state?.secili]);

  const seciCiftlik = async (c) => {
    setSecili(c);
    setIstatistikLoading(true);
    try {
      const r = await api.getToplayiciCiftlikIstatistik(c._id);
      setIstatistik(r.data);
    } catch { setIstatistik(null); }
    finally { setIstatistikLoading(false); }
  };

  const handleEkle = async (e) => {
    e.preventDefault();
    const val = ciftlikKodu.trim();
    if (!val) return;
    setAdding(true);
    try {
      await api.toplayiciCiftlikEkle(val.length <= 12 ? val.toUpperCase() : val);
      toast.success('Çiftlik eklendi');
      setCiftlikKodu('');
      const r = await api.getToplayiciCiftlikler();
      setCiftlikler(r.data || []);
    } catch (err) { toast.error(err.response?.data?.message || 'Eklenemedi'); }
    finally { setAdding(false); }
  };

  return (
    <div style={{ background: '#f9fafb', minHeight: '100%' }}>
      {/* Topbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '13px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 56, zIndex: 5 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Çiftliklerim</h1>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>{ciftlikler.length} kayıtlı çiftlik</p>
        </div>
        <form onSubmit={handleEkle} style={{ display: 'flex', gap: 7 }}>
          <input
            value={ciftlikKodu}
            onChange={e => {
              const v = e.target.value;
              setCiftlikKodu(v.length <= 12 ? v.toUpperCase() : v);
            }}
            placeholder="Çiftlik kodu (8 karakter) veya çiftçi ID (24 karakter)"
            maxLength={30}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, outline: 'none', width: 260 }}
          />
          <button type="submit" disabled={adding || !ciftlikKodu.trim()} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
            {adding ? '...' : '+ Çiftlik Ekle'}
          </button>
        </form>
      </div>

      <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: '320px 1fr', gap: 14, alignItems: 'start' }}>

        {/* Sol — çiftlik listesi */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>Çiftlik Listesi</span>
          </div>
          {ciftlikler.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
              Henüz çiftlik yok.<br/>Yukarıdan çiftlik kodu ile ekleyin.
            </div>
          ) : ciftlikler.map(c => (
            <div
              key={c._id}
              onClick={() => seciCiftlik(c)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                borderBottom: '1px solid #f9fafb', cursor: 'pointer', transition: 'background .1s',
                background: secili?._id === c._id ? '#eff6ff' : '',
                borderLeft: secili?._id === c._id ? '3px solid #2563eb' : '3px solid transparent',
              }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 8, background: secili?._id === c._id ? '#bfdbfe' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: secili?._id === c._id ? '#1e40af' : '#374151', flexShrink: 0 }}>
                {(c.isletmeAdi || c.isim || 'Ç')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{c.isletmeAdi || c.isim || 'İsimsiz'}</div>
                <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{c.ciftlikKodu ? `Kod: ${c.ciftlikKodu}` : c.sehir || ''}</div>
              </div>
              <span style={{ fontSize: 13, color: '#d1d5db' }}>›</span>
            </div>
          ))}
        </div>

        {/* Sağ — seçili çiftlik detayı */}
        {!secili ? (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '48px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏡</div>
            Soldaki listeden bir çiftlik seçin
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Çiftlik başlık */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{secili.isletmeAdi || secili.isim || 'İsimsiz'}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                  {secili.ciftlikKodu ? `Kod: ${secili.ciftlikKodu}` : ''}{secili.sehir ? ` · ${secili.sehir}` : ''}
                </div>
              </div>
              <button
                onClick={() => navigate('/sut-girisi', { state: { ciftlik: secili } })}
                style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
              >
                🥛 Süt Gir
              </button>
            </div>

            {/* İstatistik kartları */}
            {istatistikLoading ? (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Yükleniyor...</div>
            ) : istatistik && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {[
                    { lbl: 'Bugün', val: `${istatistik.bugunLitre} Lt`, color: '#2563eb', bg: '#dbeafe' },
                    { lbl: 'Bu Ay', val: `${istatistik.aylikLitre} Lt`, color: '#16a34a', bg: '#dcfce7' },
                    { lbl: 'Bu Ay Gelir', val: fiyat > 0 ? `${istatistik.aylikGelir.toLocaleString('tr-TR')} ₺` : '—', color: '#d97706', bg: '#fef3c7' },
                    { lbl: 'Günlük Ort.', val: `${istatistik.ortalamaSutPerGun} Lt`, color: '#5b21b6', bg: '#f3e8ff' },
                  ].map((k, i) => (
                    <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: k.bg, marginBottom: 8 }} />
                      <div style={{ fontSize: 10, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>{k.lbl}</div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: k.color }}>{k.val}</div>
                    </div>
                  ))}
                </div>

                {/* Trend grafik */}
                {istatistik.trend?.length > 0 && (
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 14 }}>Son 30 Gün Süt Trendi</div>
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={istatistik.trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="tarih" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => v?.slice?.(5) || v} />
                        <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={v => [`${v} Lt`, 'Süt']} labelFormatter={l => l} />
                        <Line type="monotone" dataKey="litre" stroke="#2563eb" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <style>{`@media(max-width:768px){.tpl-ciftlik-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
