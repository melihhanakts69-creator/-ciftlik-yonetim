import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ToplayiciRaporlar() {
  const [ciftlikler, setCiftlikler] = useState([]);
  const [secili, setSecili] = useState(null);
  const [istatistik, setIstatistik] = useState(null);
  const [fiyat, setFiyat] = useState(0);
  const [ozet, setOzet] = useState(null);

  useEffect(() => {
    api.getToplayiciCiftlikler().then(r => setCiftlikler(r.data || []));
    api.getToplayiciFiyat().then(r => setFiyat(r.data?.fiyat || 0));
    api.getToplayiciOzet().then(r => setOzet(r.data));
  }, []);

  const secCiftlik = async (c) => {
    setSecili(c);
    const r = await api.getToplayiciCiftlikIstatistik(c._id);
    setIstatistik(r.data);
  };

  return (
    <div style={{ background: '#f9fafb', minHeight: '100%' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '13px 20px', position: 'sticky', top: 56, zIndex: 5 }}>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Raporlar & Analizler</h1>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>Çiftlik performansları ve süt analizi</p>
      </div>

      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Genel özet */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { lbl: 'Bugün Toplam', val: `${ozet?.bugunToplamLitre || 0} Lt`, ico: '📅', bg: '#dbeafe', color: '#1e40af' },
            { lbl: 'Bu Hafta', val: `${ozet?.buHaftaToplamLitre || 0} Lt`, ico: '📊', bg: '#dcfce7', color: '#166534' },
            { lbl: 'Çiftlik Sayısı', val: ciftlikler.length, ico: '🏡', bg: '#f3e8ff', color: '#5b21b6' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{k.ico}</div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>{k.lbl}</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: k.color, marginTop: 2 }}>{k.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Çiftlik seçici + analiz */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 14 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>Çiftlik Analizi</span>
            </div>
            {ciftlikler.map(c => (
              <div key={c._id} onClick={() => secCiftlik(c)} style={{ padding: '9px 14px', borderBottom: '1px solid #f9fafb', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: secili?._id === c._id ? '#1e40af' : '#111827', background: secili?._id === c._id ? '#eff6ff' : '', borderLeft: `3px solid ${secili?._id === c._id ? '#2563eb' : 'transparent'}` }}>
                {c.isletmeAdi || c.isim || 'İsimsiz'}
              </div>
            ))}
          </div>

          <div>
            {!secili ? (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                Analiz görmek için bir çiftlik seçin
              </div>
            ) : istatistik && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{secili.isletmeAdi || secili.isim}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 }}>
                    {[
                      { lbl: 'Bu Ay', val: `${istatistik.aylikLitre} Lt` },
                      { lbl: 'Günlük Ort.', val: `${istatistik.ortalamaSutPerGun} Lt` },
                      { lbl: 'Bu Ay Gelir', val: fiyat > 0 ? `${istatistik.aylikGelir.toLocaleString('tr-TR')} ₺` : '—' },
                    ].map((k, i) => (
                      <div key={i} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>{k.lbl}</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{k.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {istatistik.trend?.length > 0 && (
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 14 }}>30 Günlük Trend</div>
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart data={istatistik.trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="tarih" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => v?.slice?.(5) || v} />
                        <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={v => [`${v} Lt`, 'Süt']} />
                        <Line type="monotone" dataKey="litre" stroke="#2563eb" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
