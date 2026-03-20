import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ToplayiciGelir() {
  const [rapor, setRapor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getToplayiciGelirRaporu().then(r => {
      setRapor(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Yükleniyor...</div>;

  return (
    <div style={{ background: '#f9fafb', minHeight: '100%' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '13px 20px', position: 'sticky', top: 56, zIndex: 5 }}>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Gelir Takibi</h1>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>Süt toplama gelir analizi · {rapor?.fiyat > 0 ? `${rapor.fiyat} ₺/Lt` : 'Fiyat girilmedi'}</p>
      </div>

      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { lbl: 'Bu Ay Süt', val: `${rapor?.buAyLitre || 0} Lt`, color: '#2563eb', bg: '#dbeafe' },
            { lbl: 'Bu Ay Gelir', val: rapor?.buAyGelir > 0 ? `${rapor.buAyGelir.toLocaleString('tr-TR')} ₺` : '—', color: '#16a34a', bg: '#dcfce7' },
            { lbl: 'Geçen Ay', val: `${rapor?.gecenAyLitre || 0} Lt`, color: '#6b7280', bg: '#f3f4f6' },
            { lbl: 'Değişim', val: rapor?.degisimYuzde != null ? `${rapor.degisimYuzde > 0 ? '+' : ''}${rapor.degisimYuzde}%` : '—', color: (rapor?.degisimYuzde || 0) >= 0 ? '#16a34a' : '#dc2626', bg: (rapor?.degisimYuzde || 0) >= 0 ? '#dcfce7' : '#fef2f2' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: k.bg, marginBottom: 8 }} />
              <div style={{ fontSize: 10, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>{k.lbl}</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: k.color }}>{k.val}</div>
            </div>
          ))}
        </div>

        {/* Aylık trend */}
        {rapor?.aylikTrend?.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 14 }}>Aylık Gelir Trendi</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={rapor.aylikTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="ay" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v, n) => [n === 'gelir' ? `${Number(v).toLocaleString('tr-TR')} ₺` : `${v} Lt`, n === 'gelir' ? 'Gelir' : 'Süt']} />
                <Bar dataKey="litre" fill="#bfdbfe" radius={[4, 4, 0, 0]} name="litre" />
                <Bar dataKey="gelir" fill="#2563eb" radius={[4, 4, 0, 0]} name="gelir" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Çiftlik bazlı */}
        {rapor?.ciftlikBazli?.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>Bu Ay — Çiftlik Bazlı</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 100px 80px', gap: 8, padding: '7px 16px', background: '#f9fafb', fontSize: 10, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>
              <span>Çiftlik</span><span style={{ textAlign: 'right' }}>Süt</span><span style={{ textAlign: 'right' }}>Gelir</span><span style={{ textAlign: 'right' }}>Pay</span>
            </div>
            {rapor.ciftlikBazli.map((c) => {
              const toplamLitre = rapor.ciftlikBazli.reduce((s, x) => s + x.litre, 0);
              const pct = toplamLitre > 0 ? Math.round((c.litre / toplamLitre) * 100) : 0;
              return (
                <div key={c._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 100px 80px', gap: 8, padding: '10px 16px', borderBottom: '1px solid #f9fafb', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{c.isim}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', textAlign: 'right' }}>{c.litre} Lt</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', textAlign: 'right' }}>{c.gelir > 0 ? `${c.gelir.toLocaleString('tr-TR')} ₺` : '—'}</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ height: 4, background: '#f3f4f6', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: '#2563eb', borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>%{pct}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
