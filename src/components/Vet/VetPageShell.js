import React from 'react';

export default function VetPageShell({ title, subtitle, actions, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Topbar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        padding: '13px 20px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        gap: 12, flexWrap: 'wrap', flexShrink: 0,
        position: 'sticky', top: 0, zIndex: 5,
      }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0, letterSpacing: '-.2px' }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>{subtitle}</p>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>{actions}</div>
        )}
      </div>

      {/* İçerik */}
      <div style={{ flex: 1, padding: '18px 20px' }}>
        {children}
      </div>
    </div>
  );
}

// Buton stilleri — her sayfada kullan
export const VetBtn = {
  primary: {
    background: '#2563eb', color: '#fff', border: 'none',
    borderRadius: 8, padding: '8px 14px', fontSize: 12,
    fontWeight: 500, cursor: 'pointer', display: 'inline-flex',
    alignItems: 'center', gap: 5, minHeight: 34,
  },
  secondary: {
    background: '#fff', color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: 8, padding: '8px 14px',
    fontSize: 12, cursor: 'pointer', minHeight: 34,
  },
  danger: {
    background: '#fef2f2', color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: 8, padding: '8px 14px',
    fontSize: 12, cursor: 'pointer', minHeight: 34,
  },
};

// Kart bileşeni
export function VetCard({ title, action, actionLabel, children, style }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb',
      borderRadius: 12, overflow: 'hidden', ...style
    }}>
      {title && (
        <div style={{
          padding: '10px 16px', borderBottom: '1px solid #f3f4f6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.5px' }}>
            {title}
          </span>
          {action && (
            <button onClick={action} style={{ fontSize: 11, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
              {actionLabel || 'Tümü →'}
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// Liste satırı
export function VetRow({ icon, iconBg, title, meta, badge, badgeBg, badgeColor, onClick, right }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 16px', borderBottom: '1px solid #f9fafb',
        cursor: onClick ? 'pointer' : 'default', transition: 'background .1s',
      }}
      onMouseOver={e => { if (onClick) e.currentTarget.style.background = '#fafafa'; }}
      onMouseOut={e => e.currentTarget.style.background = ''}
    >
      {icon && (
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: iconBg || '#f3f4f6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, flexShrink: 0,
        }}>
          {icon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </div>
        {meta && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{meta}</div>}
      </div>
      {badge && (
        <span style={{
          fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20, flexShrink: 0,
          background: badgeBg || '#f3f4f6', color: badgeColor || '#6b7280',
        }}>
          {badge}
        </span>
      )}
      {right}
      {onClick && <span style={{ fontSize: 13, color: '#d1d5db', flexShrink: 0 }}>›</span>}
    </div>
  );
}
