import React from 'react';

export const VetBtnPrimary = {
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '8px 14px',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer'
};

export const VetBtnSecondary = {
  background: '#fff',
  color: '#374151',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: '8px 14px',
  fontSize: 12,
  cursor: 'pointer'
};

export default function VetPageHeader({ title, subtitle, actions }) {
  return (
    <div style={{
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: 0, letterSpacing: '-.2px' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: '#6b7280', margin: '3px 0 0' }}>{subtitle}</p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
