import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

const KupeArama = ({ navigate }) => {
  const [q, setQ] = useState('');
  const [sonuc, setSonuc] = useState([]);
  const [loading, setLoading] = useState(false);

  const ara = async (e) => {
    e.preventDefault();
    if (q.trim().length < 2) return;
    setLoading(true);
    try {
      const res = await api.getVeterinerHayvanAra(q.trim());
      const list = res.data || [];
      if (list.length === 1) {
        navigate(`/hastalar/${list[0].ciftciId}`);
        return;
      }
      setSonuc(list);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 8 }}>🔍 Küpe No ile Ara</div>
      <form onSubmit={ara} style={{ display: 'flex', gap: 6 }}>
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setSonuc([]); }}
          placeholder="TR-123456..."
          style={{ flex: 1, padding: '8px 10px', borderRadius: 7, border: '1px solid #e5e7eb', fontSize: 13, outline: 'none' }}
        />
        <button
          type="submit"
          disabled={loading || q.trim().length < 2}
          style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
        >
          {loading ? '...' : 'Ara'}
        </button>
      </form>
      {sonuc.length > 0 && (
        <div style={{ marginTop: 8, border: '1px solid #e5e7eb', borderRadius: 7, overflow: 'hidden' }}>
          {sonuc.map((r, i) => (
            <div
              key={i}
              style={{ padding: '8px 10px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', fontSize: 12 }}
              onClick={() => navigate(`/hastalar/${r.ciftciId}`)}
            >
              <div style={{ fontWeight: 500 }}>{r.ciftlikAdi || r.ciftciIsim}</div>
              <div style={{ color: '#9ca3af', fontSize: 11 }}>{r.hayvan?.kupeNo} · {r.hayvan?.isim}</div>
            </div>
          ))}
        </div>
      )}
      {sonuc.length === 0 && q.length >= 2 && !loading && (
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6, textAlign: 'center' }}>Sonuç yok</div>
      )}
    </div>
  );
};

export default function VeterinerDashboard({ kullanici }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    ozet: null,
    musteriler: [],
    sonKayitlar: [],
    riskliCiftlikler: [],
    bugunRandevular: [],
    ziyaretOnerileri: [],
    cari: null
  });

  useEffect(() => {
    const bugun = new Date().toISOString().split('T')[0];
    Promise.allSettled([
      api.getVeterinerOzet(),
      api.getVeterinerMusteriler(),
      api.getVeterinerSonSaglikKayitlari(),
      api.getVeterinerSaglikSkoru(),
      api.getVeterinerRandevu(bugun, bugun),
      api.getVeterinerZiyaretOnerileri(),
      api.getVeterinerCari()
    ]).then(([oRes, mRes, sRes, skRes, rRes, zRes, cRes]) => {
      setData({
        ozet: oRes.status === 'fulfilled' ? oRes.value?.data : null,
        musteriler: mRes.status === 'fulfilled' ? (mRes.value?.data || []) : [],
        sonKayitlar: sRes.status === 'fulfilled' ? (sRes.value?.data || []) : [],
        riskliCiftlikler: (skRes.status === 'fulfilled' ? (skRes.value?.data || []) : []).sort((a, b) => a.skor - b.skor).slice(0, 5),
        bugunRandevular: rRes.status === 'fulfilled' ? (rRes.value?.data || []) : [],
        ziyaretOnerileri: zRes.status === 'fulfilled' ? (zRes.value?.data || []) : [],
        cari: cRes.status === 'fulfilled' ? cRes.value?.data : null
      });
      setLoading(false);
    });
  }, []);

  const ciftciIdFromRandevu = (r) => r.ciftciId?._id || r.ciftciId;

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
      {/* HEADER */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 2 }}>
            Veteriner Paneli
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#111827' }}>
            Dr. {kullanici?.isim || '—'}
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>
            {kullanici?.klinikAdi || 'Serbest Veteriner Hekim'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate('/hastalar')}
            style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
          >
            + Sağlık Kaydı
          </button>
          <button
            onClick={() => navigate('/takvim')}
            style={{ background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', fontSize: 12, cursor: 'pointer' }}
          >
            + Randevu
          </button>
        </div>
      </div>

      {/* KPI STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        {[
          { label: 'Kayıtlı Çiftlik', value: data.ozet?.musteriSayisi ?? 0, icon: '🏡', color: '#374151' },
          { label: 'Toplam Hayvan', value: data.ozet?.toplamHayvan ?? 0, icon: '🐄', color: '#374151' },
          { label: 'Bu Ay Kayıt', value: data.ozet?.buAySaglikKaydi ?? 0, icon: '📋', color: '#374151' },
          { label: 'Aktif Tedavi', value: data.ozet?.devamEdenTedavi ?? 0, icon: '💊', color: data.ozet?.devamEdenTedavi > 0 ? '#dc2626' : '#374151' },
          { label: 'Açık Alacak', value: data.cari?.toplamBakiye > 0 ? `${data.cari.toplamBakiye.toLocaleString('tr-TR')} ₺` : '—', icon: '💰', color: data.cari?.toplamBakiye > 0 ? '#d97706' : '#374151' }
        ].map((k, i) => (
          <div key={i} style={{ padding: '16px 20px', borderRight: i < 4 ? '1px solid #e5e7eb' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>{k.icon}</span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>{k.label}</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: k.color, letterSpacing: '-.3px', marginTop: 2 }}>{loading ? '—' : k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ANA İÇERİK */}
      <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 16, alignItems: 'start' }}>
        {/* SOL KOLON */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Bugünün randevuları */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>📅 Bugünün Randevuları</span>
              <button onClick={() => navigate('/takvim')} style={{ fontSize: 11, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Takvim →</button>
            </div>
            {data.bugunRandevular.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Bugün randevu yok</div>
            ) : (
              data.bugunRandevular.map(r => (
                <div
                  key={r._id}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}
                  onClick={() => navigate(`/hastalar/${ciftciIdFromRandevu(r)}`)}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>📅</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{r.ciftciId?.isletmeAdi || r.ciftciId?.isim || 'Çiftlik'}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{new Date(r.tarih).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} · {r.baslik || r.aciklama || 'Randevu'}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: r.durum === 'tamamlandi' ? '#dcfce7' : '#dbeafe', color: r.durum === 'tamamlandi' ? '#166534' : '#1e40af' }}>
                    {r.durum === 'tamamlandi' ? 'Tamamlandı' : 'Bekliyor'}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Son sağlık kayıtları */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>📋 Son Kayıtlar</span>
              <button onClick={() => navigate('/hastalar')} style={{ fontSize: 11, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Tümü →</button>
            </div>
            {data.sonKayitlar.slice(0, 8).map(k => (
              <div
                key={k._id}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}
                onClick={() => navigate(`/hastalar/${k.userId?._id}`)}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: k.tip === 'hastalik' ? '#ef4444' : k.tip === 'asi' ? '#3b82f6' : '#16a34a', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {k.userId?.isletmeAdi || k.userId?.isim || 'Çiftlik'} · {k.hayvanIsim || k.hayvanKupeNo || 'Hayvan'}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{k.tani}</div>
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>
                  {k.tarih ? new Date(k.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ORTA KOLON */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Ziyaret önerileri */}
          {data.ziyaretOnerileri.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #fde68a', background: '#fffbeb' }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#92400e', textTransform: 'uppercase', letterSpacing: '.4px' }}>⚡ Ziyaret Önerileri</span>
              </div>
              {data.ziyaretOnerileri.slice(0, 4).map((z, i) => (
                <div
                  key={i}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}
                  onClick={() => navigate(`/hastalar/${z.ciftciId}`)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{z.isletmeAdi || z.isim || 'Çiftlik'}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{z.neden || 'Sağlık skoru düşük'}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: z.skor < 50 ? '#fef2f2' : '#fef3c7', color: z.skor < 50 ? '#991b1b' : '#92400e' }}>
                    Skor: {z.skor}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Riskli çiftlikler */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>⚠️ Riskli Çiftlikler</span>
            </div>
            {data.riskliCiftlikler.map(s => (
              <div
                key={s.ciftciId}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}
                onClick={() => navigate(`/hastalar/${s.ciftciId}`)}
              >
                <div style={{ width: 34, height: 34, borderRadius: 8, background: s.skor < 50 ? '#fef2f2' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: s.skor < 50 ? '#dc2626' : '#d97706' }}>{s.skor}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{s.isletmeAdi || s.isim || 'Çiftlik'}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                    {[s.devamEdenTedavi > 0 && `${s.devamEdenTedavi} aktif tedavi`, s.gecikmisAsiSayisi > 0 && `${s.gecikmisAsiSayisi} gecikmiş aşı`].filter(Boolean).join(' · ') || 'Kontrol gerekiyor'}
                  </div>
                </div>
                <span style={{ fontSize: 14, color: '#d1d5db' }}>›</span>
              </div>
            ))}
          </div>

          {/* Açık alacaklar */}
          {data.cari?.list?.filter(c => c.bakiye > 0).length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>💰 Açık Alacaklar</span>
                <button onClick={() => navigate('/finans')} style={{ fontSize: 11, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Tümü →</button>
              </div>
              {data.cari.list.filter(c => c.bakiye > 0).slice(0, 4).map(c => (
                <div
                  key={c._id}
                  style={{ display: 'flex', alignItems: 'center', padding: '9px 16px', borderBottom: '1px solid #f9fafb', gap: 10, cursor: 'pointer' }}
                  onClick={() => navigate('/finans')}
                >
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#111827' }}>{c.isletmeAdi || c.isim || 'Çiftlik'}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#d97706' }}>{c.bakiye.toLocaleString('tr-TR')} ₺</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SAĞ KOLON */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <KupeArama navigate={navigate} />

          {/* Çiftlik listesi */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>🏡 Çiftlikler</span>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>{data.musteriler.length} kayıt</span>
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {data.musteriler.slice(0, 15).map(m => (
                <div
                  key={m._id}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}
                  onClick={() => navigate(`/hastalar/${m._id}`)}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#374151', flexShrink: 0 }}>
                    {(m.isletmeAdi || m.isim || 'Ç')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.isletmeAdi || m.isim || 'İsimsiz'}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>{m.sehir || ''}</div>
                  </div>
                  <span style={{ fontSize: 14, color: '#d1d5db' }}>›</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
