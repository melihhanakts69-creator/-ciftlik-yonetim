import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import VetPageHeader from '../components/Layout/VetPageHeader';

export default function VeterinerRapor() {
  const [data, setData] = useState({ aylik: null, hastalik: [], cari: null });
  const [donem, setDonem] = useState('Bu Ay');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.allSettled([
      api.getVeterinerRaporAylik(),
      api.getVeterinerHastalikDagilimi(),
      api.getVeterinerCari()
    ]).then(([aRes, hRes, cRes]) => {
      setData({
        aylik: aRes.status === 'fulfilled' ? aRes.value?.data : null,
        hastalik: hRes.status === 'fulfilled' ? (hRes.value?.data || []) : [],
        cari: cRes.status === 'fulfilled' ? cRes.value?.data : null
      });
    });
  }, []);

  const { aylik, hastalik, cari } = data;

  // Backend hastalik dagilimi farkli formatta olabilir: { _id, count } veya { tani, toplamSayi }
  const hastalikList = Array.isArray(hastalik)
    ? hastalik.map(h => ({ _id: h._id || h.tani || 'Diğer', count: h.count ?? h.toplamSayi ?? 0 }))
    : [];

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: 64 }}>
      <VetPageHeader
        title="Aylık Rapor"
        subtitle={new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            {['Bu Ay', '3 Ay', '6 Ay'].map(d => (
              <button
                key={d}
                onClick={() => setDonem(d)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  border: '1px solid',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: donem === d ? '#dbeafe' : '#fff',
                  color: donem === d ? '#1e40af' : '#6b7280',
                  borderColor: donem === d ? '#2563eb' : '#e5e7eb'
                }}
              >
                {d}
              </button>
            ))}
          </div>
        }
      />
      <div style={{ padding: '20px 24px' }}>

      {/* KPI'lar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { lbl: 'Toplam Kayıt', val: aylik?.toplamKayit ?? 0, icon: '📋', color: '#374151' },
          { lbl: 'Toplam Gelir', val: aylik?.toplamGelir ? `${aylik.toplamGelir.toLocaleString('tr-TR')} ₺` : '0 ₺', icon: '💰', color: '#16a34a' },
          { lbl: 'Aktif Çiftlik', val: aylik?.ciftlikSayisi ?? 0, icon: '🏡', color: '#374151' },
          { lbl: 'Açık Alacak', val: cari?.toplamBakiye > 0 ? `${cari.toplamBakiye.toLocaleString('tr-TR')} ₺` : '—', icon: '⚠️', color: cari?.toplamBakiye > 0 ? '#d97706' : '#9ca3af' }
        ].map((k, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>{k.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>{k.lbl}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, color: k.color, letterSpacing: '-.3px' }}>{k.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Hastalık dağılımı */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 14 }}>Tanı Dağılımı</div>
          {hastalikList.slice(0, 8).map((h, i) => {
            const max = hastalikList[0]?.count || 1;
            const pct = (h.count / max) * 100;
            return (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#374151', fontWeight: 500 }}>{h._id || 'Diğer'}</span>
                  <span style={{ color: '#9ca3af' }}>{h.count} kayıt</span>
                </div>
                <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: '#3b82f6', borderRadius: 3, transition: 'width .6s' }} />
                </div>
              </div>
            );
          })}
          {hastalikList.length === 0 && <div style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: 24 }}>Veri yok</div>}
        </div>

        {/* Alacak listesi */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Cari Durum
            <button onClick={() => navigate('/finans')} style={{ fontSize: 11, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Finans →</button>
          </div>
          {(cari?.list || []).slice(0, 8).map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ flex: 1, fontSize: 12, color: '#374151', fontWeight: 500 }}>{c.isletmeAdi || c.isim || 'Çiftlik'}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: c.bakiye > 0 ? '#d97706' : '#16a34a' }}>
                {c.bakiye > 0 ? `${c.bakiye.toLocaleString('tr-TR')} ₺ borç` : 'Kapalı'}
              </div>
            </div>
          ))}
          {(!cari?.list || cari.list.length === 0) && <div style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: 24 }}>Cari kaydı yok</div>}
        </div>
      </div>
      </div>
    </div>
  );
}
