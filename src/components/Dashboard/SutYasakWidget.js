import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';

const SutYasakWidget = () => {
  const [yasaklar, setYasaklar] = useState([]);

  useEffect(() => {
    api.getSutYasak()
      .then(r => setYasaklar(r.data || []))
      .catch(() => {});
  }, []);

  if (yasaklar.length === 0) return null;

  return (
    <div style={{
      background: '#fff1f2',
      border: '1.5px solid #fca5a5',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20
    }}>
      <div style={{ fontWeight: 700, color: '#991b1b', marginBottom: 10 }}>
        ⚠️ Bugün {yasaklar.length} hayvan — Süt Yasağı Aktif
      </div>
      {yasaklar.map((h, i) => (
        <div key={i} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 0',
          borderTop: i > 0 ? '1px solid #fecaca' : 'none',
          fontSize: 13
        }}>
          <div>
            <span style={{ fontWeight: 600 }}>{h.hayvanIsim || h.hayvanKupeNo}</span>
            <span style={{ color: '#6b7280', marginLeft: 8 }}>{h.ilaclar}</span>
          </div>
          <div style={{
            background: h.kalanGun <= 1 ? '#dc2626' : '#f97316',
            color: 'white',
            borderRadius: 20,
            padding: '2px 10px',
            fontSize: 12,
            fontWeight: 700
          }}>
            {h.kalanGun} gün kaldı
          </div>
        </div>
      ))}
    </div>
  );
};

export default SutYasakWidget;
