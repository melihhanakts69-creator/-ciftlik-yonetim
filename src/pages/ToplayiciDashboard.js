import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { toast } from 'react-toastify';

export default function ToplayiciDashboard({ kullanici }) {
  const navigate = useNavigate();
  const [ozet, setOzet] = useState(null);
  const [ciftlikler, setCiftlikler] = useState([]);
  const [fiyat, setFiyat] = useState(0);
  const [sonToplamalar, setSonToplamalar] = useState([]);
  const [buAyGelir, setBuAyGelir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fiyatEdit, setFiyatEdit] = useState(false);
  const [yeniFiyat, setYeniFiyat] = useState('');

  useEffect(() => {
    Promise.allSettled([
      api.getToplayiciOzet(),
      api.getToplayiciCiftlikler(),
      api.getToplayiciFiyat(),
      api.getToplayiciSonToplamalar(),
      api.getToplayiciGelirRaporu(),
    ]).then(([oR, cR, fR, sR, gR]) => {
      setOzet(oR.value?.data || null);
      setCiftlikler(cR.value?.data || []);
      setFiyat(fR.value?.data?.fiyat || 0);
      setSonToplamalar(sR.value?.data || []);
      const gel = gR.value?.data?.buAyGelir;
      setBuAyGelir(typeof gel === 'number' && Number.isFinite(gel) ? gel : null);
      setLoading(false);
    });
  }, []);

  const handleFiyatKaydet = async () => {
    const f = parseFloat(String(yeniFiyat).replace(',', '.'));
    if (!f || isNaN(f) || f <= 0) { toast.warning('Geçerli fiyat girin (örn: 12.5)'); return; }
    try {
      await api.setToplayiciFiyat(f);
      setFiyat(f);
      setFiyatEdit(false);
      toast.success('Fiyat güncellendi');
    } catch { toast.error('Güncellenemedi'); }
  };

  const saat = new Date().getHours();
  const selam = saat < 12 ? 'Günaydın' : saat < 18 ? 'İyi günler' : 'İyi akşamlar';

  return (
    <div style={{ background: '#f9fafb', minHeight: '100%', padding: '20px 20px 40px' }}>

      {/* Selamlama */}
      <div style={{ background: '#0f4c81', borderRadius: 14, padding: '20px 24px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: 'rgba(186,230,253,.7)', marginBottom: 4 }}>
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
            {selam}, {kullanici?.isim?.split(' ')[0] || 'Toplayıcı'} 🥛
          </div>
          <div style={{ fontSize: 13, color: 'rgba(186,230,253,.8)' }}>
            {loading ? '...' : `Bugün ${ozet?.bugunToplamLitre || 0} Lt toplandı · ${ozet?.bugunCiftlikSayisi || 0} çiftlik`}
          </div>
        </div>

        {/* Litre fiyatı */}
        <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 10, padding: '12px 16px', border: '1px solid rgba(255,255,255,.15)', minWidth: 160 }}>
          <div style={{ fontSize: 10, color: 'rgba(186,230,253,.7)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>
            Süt Litre Fiyatı
          </div>
          {fiyatEdit ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                value={yeniFiyat}
                onChange={e => setYeniFiyat(e.target.value)}
                type="number" step="0.01" min="0"
                placeholder="₺/Lt"
                autoFocus
                style={{ width: 80, padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,.3)', background: 'rgba(255,255,255,.15)', color: '#fff', fontSize: 13, outline: 'none' }}
              />
              <button onClick={handleFiyatKaydet} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', fontWeight: 500 }}>✓</button>
              <button onClick={() => setFiyatEdit(false)} style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>✕</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => { setYeniFiyat(String(fiyat)); setFiyatEdit(true); }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: fiyat > 0 ? '#bfdbfe' : '#fde68a' }}>
                {fiyat > 0 ? `${fiyat} ₺` : 'Girilmedi'}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(186,230,253,.6)' }}>Düzenle ✎</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { lbl: 'Bugün', val: `${ozet?.bugunToplamLitre || 0} Lt`, ico: '📅', bg: '#dbeafe', color: '#1e40af' },
          { lbl: 'Bu Hafta', val: `${ozet?.buHaftaToplamLitre || 0} Lt`, ico: '📊', bg: '#dcfce7', color: '#166534' },
          { lbl: 'Çiftliklerim', val: ciftlikler.length, ico: '🏡', bg: '#f3e8ff', color: '#5b21b6' },
          {
            lbl: 'Bu Ay Gelir',
            val:
              fiyat > 0 && buAyGelir != null && buAyGelir > 0
                ? `${buAyGelir.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺`
                : '—',
            ico: '💰',
            bg: '#fef3c7',
            color: '#92400e',
          },
        ].map((k, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{k.ico}</div>
              <span style={{ fontSize: 10, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>{k.lbl}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, color: k.color, letterSpacing: '-.3px' }}>
              {loading ? '—' : k.val}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14, alignItems: 'start' }}>

        {/* Sol — çiftlikler */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>🏡 Çiftliklerim</span>
              <button onClick={() => navigate('/ciftlikler')} style={{ fontSize: 11, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Tümü →</button>
            </div>
            {ciftlikler.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                Henüz çiftlik eklenmemiş.<br/>
                <button onClick={() => navigate('/ciftlikler')} style={{ marginTop: 10, padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                  Çiftlik Ekle
                </button>
              </div>
            ) : ciftlikler.slice(0, 6).map(c => (
              <div
                key={c._id}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderBottom: '1px solid #f9fafb', cursor: 'pointer', transition: 'background .1s' }}
                onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseOut={e => e.currentTarget.style.background = ''}
                onClick={() => navigate('/ciftlikler', { state: { secili: c._id } })}
              >
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#1e40af', flexShrink: 0 }}>
                  {(c.isletmeAdi || c.isim || 'Ç')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{c.isletmeAdi || c.isim || 'İsimsiz'}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{c.ciftlikKodu ? `Kod: ${c.ciftlikKodu}` : c.sehir || ''}</div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); navigate('/sut-girisi', { state: { ciftlik: c } }); }}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 11, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}
                >
                  🥛 Süt Gir
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sağ — son toplamalar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>Son Girişler</span>
            </div>
            {sonToplamalar.slice(0, 8).map((k) => (
              <div key={k._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: '1px solid #f9fafb' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>{k.tenantId?.name || k.tenantId?.ciftlikKodu || 'Çiftlik'}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{k.tarih} · {k.sagim === 'aksam' ? 'Akşam' : 'Sabah'}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#2563eb' }}>{k.litre} Lt</span>
              </div>
            ))}
            {sonToplamalar.length === 0 && (
              <div style={{ padding: '20px 14px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>Henüz giriş yok</div>
            )}
          </div>

          {/* Hızlı linkler */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: '🥛 Süt Gir', path: '/sut-girisi', bg: '#dbeafe', color: '#1e40af' },
              { label: '🏡 Çiftlikler', path: '/ciftlikler', bg: '#dcfce7', color: '#166534' },
              { label: '📊 Raporlar', path: '/raporlar', bg: '#f3e8ff', color: '#5b21b6' },
              { label: '💰 Gelir', path: '/gelir', bg: '#fef3c7', color: '#92400e' },
            ].map(b => (
              <button key={b.path} onClick={() => navigate(b.path)} style={{ padding: '10px 8px', borderRadius: 8, border: 'none', background: b.bg, color: b.color, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .tpl-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
