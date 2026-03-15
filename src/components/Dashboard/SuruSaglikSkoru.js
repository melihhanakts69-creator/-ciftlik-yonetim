import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';

const SuruSaglikSkoru = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getSaglikSkoru()
      .then(r => setData(r.data))
      .catch(() => {});
  }, []);

  if (!data) return null;

  const renk = data.skor >= 80 ? '#16a34a'
    : data.skor >= 60 ? '#d97706'
      : '#dc2626';

  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: 20,
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
        Sürü Sağlık Skoru
      </div>
      <div style={{ fontSize: 42, fontWeight: 800, color: renk, lineHeight: 1 }}>
        {data.skor}
        <span style={{ fontSize: 18, color: '#9ca3af' }}>/100</span>
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
        {data.detay?.aktifTedavi > 0 && <div>Aktif tedavi: {data.detay.aktifTedavi} baş</div>}
        {data.detay?.gecikmisAsi > 0 && <div>Gecikmiş aşı: {data.detay.gecikmisAsi}</div>}
        {data.detay?.olumler > 0 && <div>Son 30 gün ölüm: {data.detay.olumler}</div>}
        {data.detay?.sutYasakAktif > 0 && <div>Süt yasağı: {data.detay.sutYasakAktif} hayvan</div>}
      </div>
    </div>
  );
};

export default SuruSaglikSkoru;
