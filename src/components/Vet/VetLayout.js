import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV = [
  { path: '/', icon: '🏠', label: 'Ana Sayfa' },
  { path: '/hastalar', icon: '🐄', label: 'Hastalar' },
  { path: '/danismalar', icon: '💬', label: 'Danışmalar' },
  { path: '/takvim', icon: '📅', label: 'Takvim' },
  { path: '/receteler', icon: '💊', label: 'Stok & Reçete' },
  { path: '/finans', icon: '💰', label: 'Fatura & Tahsilat' },
  { path: '/rapor', icon: '📊', label: 'Raporlar' },
];

const BOTTOM_NAV = [
  { path: '/', icon: '🏠', label: 'Ana Sayfa' },
  { path: '/hastalar', icon: '🐄', label: 'Hastalar' },
  { path: '/takvim', icon: '📅', label: 'Takvim' },
  { path: '/finans', icon: '💰', label: 'Finans' },
  { path: '/danismalar', icon: '⋯', label: 'Diğer' },
];

export default function VetLayout({ kullanici, okunmamis = 0, danismaOkunmamis = 0, onLogout, children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = (p) => p === '/' ? pathname === '/' : pathname.startsWith(p);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── SIDEBAR (desktop) ── */}
      <aside style={{
        width: 220, background: '#0f172a', display: 'flex', flexDirection: 'column',
        flexShrink: 0, zIndex: 10,
      }}
        className="vet-sidebar"
      >
        {/* Profil */}
        <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: 'rgba(148,163,184,.6)', marginBottom: 4 }}>
            Veteriner Paneli
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>
            Dr. {kullanici?.isim || '—'}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(148,163,184,.55)', marginTop: 2 }}>
            {kullanici?.klinikAdi || 'Serbest Veteriner Hekim'}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {NAV.map(item => {
            const active = isActive(item.path);
            const badge = item.path === '/danismalar' ? danismaOkunmamis
                        : item.path === '/bildirimler' ? okunmamis : 0;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '8px 10px', borderRadius: 7, border: 'none',
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                  background: active ? 'rgba(59,130,246,.2)' : 'transparent',
                  transition: 'background .12s',
                }}
                onMouseOver={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.06)'; }}
                onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 14, width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 12, fontWeight: active ? 500 : 400, color: active ? '#93c5fd' : 'rgba(148,163,184,.8)', flex: 1 }}>
                  {item.label}
                </span>
                {badge > 0 && (
                  <span style={{ background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 500, padding: '1px 5px', borderRadius: 10 }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}

          <div style={{ height: '0.5px', background: 'rgba(255,255,255,.06)', margin: '8px 4px' }} />

          <button
            onClick={() => navigate('/bildirimler')}
            style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', background: 'transparent', width: '100%' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,.06)'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>🔔</span>
            <span style={{ fontSize: 12, color: 'rgba(148,163,184,.8)', flex: 1 }}>Bildirimler</span>
            {okunmamis > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 500, padding: '1px 5px', borderRadius: 10 }}>{okunmamis}</span>
            )}
          </button>
        </nav>

        {/* Alt */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,.07)' }}>
          <button
            onClick={() => navigate('/ayarlar')}
            style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', background: 'transparent', width: '100%' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,.06)'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>⚙️</span>
            <span style={{ fontSize: 12, color: 'rgba(148,163,184,.8)' }}>Profilim</span>
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', background: 'transparent', width: '100%', marginTop: 2 }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,.15)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>🚪</span>
              <span style={{ fontSize: 12, color: 'rgba(248,113,113,.9)' }}>Çıkış</span>
            </button>
          )}
        </div>
      </aside>

      {/* ── İÇERİK ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <main style={{ flex: 1, overflowY: 'auto', background: '#f9fafb', paddingBottom: 70 }}
          className="vet-main"
        >
          {children}
        </main>

        {/* ── BOTTOM NAV (mobile) ── */}
        <nav style={{ display: 'none', borderTop: '1px solid #e5e7eb', background: '#fff' }}
          className="vet-bottom-nav"
        >
          {BOTTOM_NAV.map(item => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '10px 4px 8px', border: 'none', background: 'none', cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 18, marginBottom: 3 }}>{item.icon}</span>
                <span style={{ fontSize: 9, color: active ? '#2563eb' : '#9ca3af', fontWeight: active ? 500 : 400 }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Responsive CSS ── */}
      <style>{`
        @media (max-width: 768px) {
          .vet-sidebar { display: none !important; }
          .vet-bottom-nav { display: flex !important; }
          .vet-main { padding-bottom: 80px !important; }
        }
      `}</style>
    </div>
  );
}
