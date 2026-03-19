import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import VetPageShell, { VetBtn, VetCard, VetRow } from '../components/Vet/VetPageShell';

export default function VeterinerDashboard({ kullanici }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    ozet: null, musteriler: [], sonKayitlar: [], riskliCiftlikler: [],
    bugunRandevular: [], ziyaretOnerileri: [], cari: null,
  });
  const [kupeQ, setKupeQ] = useState('');
  const [kupeSonuc, setKupeSonuc] = useState([]);
  const [kupeLoading, setKupeLoading] = useState(false);

  useEffect(() => {
    const bugun = new Date().toISOString().split('T')[0];
    Promise.allSettled([
      api.getVeterinerOzet(),
      api.getVeterinerMusteriler(),
      api.getVeterinerSonSaglikKayitlari(),
      api.getVeterinerSaglikSkoru(),
      api.getVeterinerRandevu(bugun, bugun),
      api.getVeterinerZiyaretOnerileri(),
      api.getVeterinerCari(),
    ]).then(([oR, mR, sR, skR, rR, zR, cR]) => {
      setData({
        ozet: oR.status === 'fulfilled' ? oR.value?.data : null,
        musteriler: mR.status === 'fulfilled' ? (mR.value?.data || []) : [],
        sonKayitlar: sR.status === 'fulfilled' ? (sR.value?.data || []) : [],
        riskliCiftlikler: (skR.status === 'fulfilled' ? (skR.value?.data || []) : []).sort((a, b) => a.skor - b.skor).slice(0, 5),
        bugunRandevular: rR.status === 'fulfilled' ? (rR.value?.data || []) : [],
        ziyaretOnerileri: zR.status === 'fulfilled' ? (zR.value?.data || []) : [],
        cari: cR.status === 'fulfilled' ? cR.value?.data : null,
      });
      setLoading(false);
    });
  }, []);

  const handleKupeAra = async (e) => {
    e.preventDefault();
    if (kupeQ.trim().length < 2) return;
    setKupeLoading(true);
    setKupeSonuc([]);
    try {
      const res = await api.getVeterinerHayvanAra(kupeQ.trim());
      const list = res.data || [];
      if (list.length === 1) { navigate(`/hastalar/${list[0].ciftciId}`); return; }
      setKupeSonuc(list);
    } catch {} finally { setKupeLoading(false); }
  };

  const borcluList = (data.cari?.list || []).filter(c => (c.bakiye || 0) > 0);
  const ciftciIdFromRandevu = (r) => r.ciftciId?._id || r.ciftciId;

  // KPI renkleri
  const KPI = [
    { label: 'Çiftlik', value: data.ozet?.musteriSayisi ?? 0, ico: '🏡', bg: '#dbeafe' },
    { label: 'Hayvan', value: data.ozet?.toplamHayvan ?? 0, ico: '🐄', bg: '#dcfce7' },
    { label: 'Bu Ay Kayıt', value: data.ozet?.buAySaglikKaydi ?? 0, ico: '📋', bg: '#f3e8ff' },
    { label: 'Aktif Tedavi', value: data.ozet?.devamEdenTedavi ?? 0, ico: '💊', bg: '#fef2f2', valColor: (data.ozet?.devamEdenTedavi || 0) > 0 ? '#dc2626' : '#111827' },
    { label: 'Açık Alacak', value: data.cari?.toplamBakiye > 0 ? `${Math.round(data.cari.toplamBakiye / 1000)}K ₺` : '—', ico: '💰', bg: '#fef3c7', valColor: data.cari?.toplamBakiye > 0 ? '#d97706' : '#111827' },
  ];

  return (
    <VetPageShell
      title="Ana Sayfa"
      subtitle={`${new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}`}
      actions={<>
        <button style={VetBtn.secondary} onClick={() => navigate('/takvim')}>+ Randevu</button>
        <button style={VetBtn.primary} onClick={() => navigate('/hastalar')}>+ Sağlık Kaydı</button>
      </>}
    >
      {/* KPI strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 0, background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: 12, overflow: 'hidden', marginBottom: 16,
      }}>
        {KPI.map((k, i) => (
          <div key={i} style={{
            padding: '12px 14px', borderRight: i < 4 ? '1px solid #e5e7eb' : 'none',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
              {k.ico}
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>{k.label}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: k.valColor || '#111827', letterSpacing: '-.3px', marginTop: 1 }}>
                {loading ? '—' : k.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: 14, alignItems: 'start' }}
        className="vet-dashboard-grid"
      >
        {/* SOL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Randevular */}
          <VetCard title="📅 Bugünün Randevuları" action={() => navigate('/takvim')} actionLabel="Takvim →">
            {data.bugunRandevular.length === 0 ? (
              <div style={{ padding: '20px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>
                Bugün randevu yok
              </div>
            ) : data.bugunRandevular.map(r => (
              <VetRow
                key={r._id}
                icon="📅" iconBg="#dbeafe"
                title={r.ciftciId?.isletmeAdi || r.ciftciId?.isim || 'Çiftlik'}
                meta={`${new Date(r.tarih).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} · ${r.baslik || r.aciklama || 'Randevu'}`}
                badge={r.durum === 'tamamlandi' ? '✓ Tamamlandı' : new Date(r.tarih).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                badgeBg={r.durum === 'tamamlandi' ? '#dcfce7' : '#dbeafe'}
                badgeColor={r.durum === 'tamamlandi' ? '#166534' : '#1e40af'}
                onClick={() => navigate(`/hastalar/${ciftciIdFromRandevu(r)}`)}
              />
            ))}
          </VetCard>

          {/* Son kayıtlar */}
          <VetCard title="📋 Son Sağlık Kayıtları" action={() => navigate('/hastalar')} actionLabel="Tümü →">
            {data.sonKayitlar.slice(0, 6).map(k => {
              const tipRenk = { hastalik: { bg: '#fef2f2', ico: '🦠' }, asi: { bg: '#dbeafe', ico: '💉' }, tedavi: { bg: '#fef3c7', ico: '💊' } };
              const t = tipRenk[k.tip] || { bg: '#f3e8ff', ico: '🔬' };
              return (
                <VetRow
                  key={k._id}
                  icon={t.ico} iconBg={t.bg}
                  title={`${k.hayvanIsim || k.hayvanKupeNo || 'Hayvan'} — ${k.userId?.isletmeAdi || k.userId?.isim || 'Çiftlik'}`}
                  meta={`${k.tani}${k.maliyet > 0 ? ` · ${k.maliyet.toLocaleString('tr-TR')} ₺` : ''}`}
                  badge={k.tarih ? new Date(k.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : ''}
                  onClick={() => navigate(`/hastalar/${k.userId?._id}`)}
                />
              );
            })}
          </VetCard>
        </div>

        {/* ORTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Ziyaret önerileri */}
          {data.ziyaretOnerileri.length > 0 && (
            <VetCard title="⚡ Ziyaret Önerileri">
              {data.ziyaretOnerileri.slice(0, 4).map((z, i) => (
                <VetRow
                  key={i}
                  icon="📍" iconBg="#fef3c7"
                  title={z.isletmeAdi || z.isim || 'Çiftlik'}
                  meta={z.neden || 'Sağlık skoru düşük'}
                  badge={`Skor: ${z.skor}`}
                  badgeBg={z.skor < 50 ? '#fef2f2' : '#fef3c7'}
                  badgeColor={z.skor < 50 ? '#991b1b' : '#92400e'}
                  onClick={() => navigate(`/hastalar/${z.ciftciId}`)}
                />
              ))}
            </VetCard>
          )}

          {/* Riskli çiftlikler */}
          <VetCard title="⚠️ Riskli Çiftlikler">
            {data.riskliCiftlikler.length === 0 ? (
              <div style={{ padding: '20px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>Riskli çiftlik yok</div>
            ) : data.riskliCiftlikler.map(s => (
              <VetRow
                key={s.ciftciId}
                icon={<span style={{ fontSize: 11, fontWeight: 700, color: s.skor < 50 ? '#dc2626' : '#d97706' }}>{s.skor}</span>}
                iconBg={s.skor < 50 ? '#fef2f2' : '#fef3c7'}
                title={s.isletmeAdi || s.isim || 'Çiftlik'}
                meta={[s.devamEdenTedavi > 0 && `${s.devamEdenTedavi} tedavi`, s.gecikmisAsiSayisi > 0 && `${s.gecikmisAsiSayisi} gecikmiş aşı`].filter(Boolean).join(' · ') || 'Kontrol gerekiyor'}
                onClick={() => navigate(`/hastalar/${s.ciftciId}`)}
              />
            ))}
          </VetCard>

          {/* Açık alacaklar */}
          {borcluList.length > 0 && (
            <VetCard title="💰 Açık Alacaklar" action={() => navigate('/finans')} actionLabel="Finans →">
              {borcluList.slice(0, 4).map((c, i) => (
                <VetRow
                  key={i}
                  title={c.isletmeAdi || c.isim || 'Çiftlik'}
                  right={<span style={{ fontSize: 12, fontWeight: 600, color: '#d97706', flexShrink: 0 }}>{c.bakiye.toLocaleString('tr-TR')} ₺</span>}
                  onClick={() => navigate('/finans')}
                />
              ))}
            </VetCard>
          )}
        </div>

        {/* SAĞ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Küpe arama */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
              🔍 Küpe No ile Ara
            </div>
            <form onSubmit={handleKupeAra} style={{ display: 'flex', gap: 6 }}>
              <input
                value={kupeQ}
                onChange={e => { setKupeQ(e.target.value); setKupeSonuc([]); }}
                placeholder="TR-123456..."
                style={{ flex: 1, padding: '8px 10px', borderRadius: 7, border: '1px solid #e5e7eb', fontSize: 12, outline: 'none', minWidth: 0 }}
              />
              <button type="submit" disabled={kupeLoading || kupeQ.trim().length < 2} style={VetBtn.primary}>
                {kupeLoading ? '...' : 'Ara'}
              </button>
            </form>
            {kupeSonuc.length > 0 && (
              <div style={{ marginTop: 8, border: '1px solid #e5e7eb', borderRadius: 7, overflow: 'hidden' }}>
                {kupeSonuc.map((r, i) => (
                  <div key={i} style={{ padding: '8px 10px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', fontSize: 12 }}
                    onClick={() => navigate(`/hastalar/${r.ciftciId}`)}
                    onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseOut={e => e.currentTarget.style.background = ''}
                  >
                    <div style={{ fontWeight: 500, color: '#111827' }}>{r.ciftlikAdi || r.ciftciIsim}</div>
                    <div style={{ color: '#9ca3af', fontSize: 10, marginTop: 1 }}>{r.hayvan?.kupeNo} · {r.hayvan?.isim}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Çiftlik listesi */}
          <VetCard title="🏡 Müşterilerim" action={() => navigate('/hastalar')} actionLabel="Tümü →">
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {data.musteriler.length === 0 ? (
                <div style={{ padding: '20px 14px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>
                  Henüz müşteri yok
                </div>
              ) : data.musteriler.slice(0, 15).map(m => (
                <VetRow
                  key={m._id}
                  icon={(m.isletmeAdi || m.isim || 'Ç')[0].toUpperCase()}
                  iconBg="#f3f4f6"
                  title={m.isletmeAdi || m.isim || 'İsimsiz'}
                  meta={m.sehir || ''}
                  onClick={() => navigate(`/hastalar/${m._id}`)}
                />
              ))}
            </div>
          </VetCard>

          {/* Hızlı git */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: '+ Randevu', path: '/takvim', bg: '#dbeafe', color: '#1e40af' },
              { label: '💊 Stok', path: '/receteler', bg: '#f3e8ff', color: '#5b21b6' },
              { label: '🧾 Fatura', path: '/finans', bg: '#dcfce7', color: '#166534' },
              { label: '📊 Rapor', path: '/rapor', bg: '#fef3c7', color: '#92400e' },
            ].map(b => (
              <button
                key={b.path}
                onClick={() => navigate(b.path)}
                style={{ padding: '10px 8px', borderRadius: 8, border: 'none', background: b.bg, color: b.color, fontSize: 12, fontWeight: 500, cursor: 'pointer', textAlign: 'center' }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile grid */}
      <style>{`
        @media (max-width: 900px) {
          .vet-dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </VetPageShell>
  );
}
