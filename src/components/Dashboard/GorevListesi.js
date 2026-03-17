import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/api';

const GorevListesi = ({ geciken = [], bugun = [], yaklaşan = [], onRefresh }) => {
  const navigate = useNavigate();
  const [tamamlananlar, setTamamlananlar] = useState({});

  const getTipIkon = (tip) => {
    const map = {
      dogum: { ico: '🤰', bg: '#fce7f3' },
      dogum_beklenen: { ico: '🤰', bg: '#fce7f3' },
      dogum_gecikme: { ico: '⚠️', bg: '#fef2f2' },
      asi: { ico: '💉', bg: '#dbeafe' },
      muayene: { ico: '🩺', bg: '#fef2f2' },
      postpartum: { ico: '🩺', bg: '#fef2f2' },
      gebelik_muayenesi: { ico: '🔬', bg: '#f3e8ff' },
      kizginlik: { ico: '🌡️', bg: '#fef3c7' },
      tohumlama_zamani: { ico: '🌡️', bg: '#fef3c7' },
      kuruya_alma: { ico: '🐄', bg: '#f3e8ff' },
      yem: { ico: '🌾', bg: '#fef3c7' },
      stok: { ico: '📦', bg: '#fef3c7' },
      saglik: { ico: '❤️', bg: '#fef2f2' },
    };
    return map[tip] || { ico: '📋', bg: '#f3f4f6' };
  };

  const getZaman = (gorev, grup) => {
    if (grup === 'geciken') {
      const tarih = new Date(gorev.hatirlatmaTarihi);
      const fark = Math.floor((Date.now() - tarih) / 86400000);
      return { text: `${fark} gün gecikmiş`, color: '#dc2626' };
    }
    if (gorev.metadata?.kalanGun != null) {
      return { text: `${gorev.metadata.kalanGun} gün kaldı`, color: '#374151' };
    }
    if (gorev.metadata?.gecenGun != null) {
      return { text: `${gorev.metadata.gecenGun} gün geçti`, color: '#6b7280' };
    }
    return { text: 'Bugün', color: '#6b7280' };
  };

  const getTag = (gorev, grup) => {
    if (grup === 'geciken') return { label: 'Gecikmiş', bg: '#fef2f2', color: '#991b1b' };
    if (gorev.oncelik === 'acil') return { label: 'Acil', bg: '#fef2f2', color: '#991b1b' };
    if (gorev.oncelik === 'yuksek') return { label: 'Bugün', bg: '#fef3c7', color: '#92400e' };
    if (grup === 'yaklaşan') {
      const gun = gorev.metadata?.kalanGun;
      return { label: gun ? `${gun} gün` : 'Bu hafta', bg: '#ede9fe', color: '#5b21b6' };
    }
    return { label: 'Planla', bg: '#dcfce7', color: '#166534' };
  };

  const handleTamamla = async (gorev, e) => {
    e.stopPropagation();
    try {
      await api.bildirimOkunduIsaretle(gorev._id);
      setTamamlananlar(p => ({ ...p, [gorev._id]: true }));
      if (typeof onRefresh === 'function') setTimeout(onRefresh, 500);
    } catch {}
  };

  const handleTikla = (gorev) => {
    if (gorev.hayvanId && gorev.hayvanTipi === 'inek') {
      navigate(`/inek-detay/${gorev.hayvanId}`);
    } else if (gorev.tip === 'stok') {
      navigate('/yem-merkezi');
    } else if (gorev.tip === 'yem') {
      navigate('/yem-merkezi');
    } else {
      navigate('/bildirimler');
    }
  };

  const GorevSatir = ({ gorev, grup }) => {
    if (tamamlananlar[gorev._id]) return null;
    const { ico, bg } = getTipIkon(gorev.tip);
    const zaman = getZaman(gorev, grup);
    const tag = getTag(gorev, grup);

    return (
      <div
        onClick={() => handleTikla(gorev)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 0', borderBottom: '0.5px solid #f3f4f6',
          cursor: 'pointer', transition: 'background .12s',
        }}
      >
        <div
          onClick={(e) => handleTamamla(gorev, e)}
          title="Tamamlandı işaretle"
          style={{
            width: 20, height: 20, borderRadius: '50%',
            border: '1.5px solid #d1d5db', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, cursor: 'pointer', transition: 'all .15s',
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.background = '#dcfce7'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fff'; }}
        >
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
          {ico}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {gorev.baslik}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            {gorev.kupe_no && (
              <>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>Küpe: {gorev.kupe_no}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#d1d5db', flexShrink: 0 }}/>
              </>
            )}
            <span style={{ fontSize: 11, color: zaman.color, fontWeight: grup === 'geciken' ? 500 : 400 }}>
              {zaman.text}
            </span>
          </div>
        </div>

        <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 20, background: tag.bg, color: tag.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {tag.label}
        </span>

        <span style={{ fontSize: 14, color: '#d1d5db', flexShrink: 0 }}>›</span>
      </div>
    );
  };

  const GrupBaslik = ({ label, renk }) => (
    <div style={{ fontSize: 10, fontWeight: 500, color: renk || '#9ca3af', textTransform: 'uppercase', letterSpacing: '.6px', padding: '8px 0 4px', borderBottom: '0.5px solid #f3f4f6', marginBottom: 2 }}>
      {label}
    </div>
  );

  return (
    <div>
      {geciken.length > 0 && (
        <>
          <GrupBaslik label="⏰ Gecikmiş" renk="#dc2626" />
          {geciken.slice(0, 3).map(g => <GorevSatir key={g._id} gorev={g} grup="geciken" />)}
        </>
      )}

      {bugun.length > 0 && (
        <>
          <GrupBaslik label="📅 Bugün" renk="#d97706" />
          {bugun.slice(0, 3).map(g => <GorevSatir key={g._id} gorev={g} grup="bugun" />)}
        </>
      )}

      {yaklaşan.length > 0 && (
        <>
          <GrupBaslik label="📆 Bu Hafta" renk="#6b7280" />
          {yaklaşan.slice(0, 2).map(g => <GorevSatir key={g._id} gorev={g} grup="yaklaşan" />)}
        </>
      )}
    </div>
  );
};

export default GorevListesi;
