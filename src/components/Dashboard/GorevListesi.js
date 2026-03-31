import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../../services/api';

const ILK_GOSTER = 5;
const LISTE_MAX_YUKSEKLIK = 380;

// ─── Helper functions (pure, no state) ─────────────────────────────────────
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
    saglik_tedavi: { ico: '💊', bg: '#fef2f2' },
  };
  return map[tip] || { ico: '📋', bg: '#f3f4f6' };
};

const getZaman = (gorev, grup) => {
  if (gorev._kaynak === 'saglik') {
    return { text: 'Devam ediyor', color: '#d97706' };
  }
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
  if (gorev._kaynak === 'saglik') return { label: 'Tedavi', bg: '#fef3c7', color: '#92400e' };
  if (grup === 'geciken') return { label: 'Gecikmiş', bg: '#fef2f2', color: '#991b1b' };
  if (gorev.oncelik === 'acil') return { label: 'Acil', bg: '#fef2f2', color: '#991b1b' };
  if (gorev.oncelik === 'yuksek') return { label: 'Bugün', bg: '#fef3c7', color: '#92400e' };
  if (grup === 'yaklaşan') {
    const gun = gorev.metadata?.kalanGun;
    return { label: gun ? `${gun} gün` : 'Bu hafta', bg: '#ede9fe', color: '#5b21b6' };
  }
  return { label: 'Planla', bg: '#dcfce7', color: '#166534' };
};

function aramaEslesir(g, q) {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  const baslik = (g.baslik || '').toLowerCase();
  const kupe = (g.kupe_no || '').toLowerCase();
  return baslik.includes(s) || kupe.includes(s);
}

// ─── Components ─────────────────────────────────────────────────────────────
const GrupBaslik = ({ label, renk, sayi }) => (
  <div
    style={{
      fontSize: 10,
      fontWeight: 600,
      color: renk || '#9ca3af',
      textTransform: 'uppercase',
      letterSpacing: '.6px',
      padding: '8px 0 4px',
      borderBottom: '0.5px solid #f3f4f6',
      marginBottom: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    }}
  >
    <span>{label}</span>
    {sayi > 0 && (
      <span style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: 0 }}>{sayi}</span>
    )}
  </div>
);

const GorevSatir = ({ gorev, grup, onTamamla, onTikla, tamamlandi }) => {
  const [hover, setHover] = useState(false);
  if (tamamlandi) return null;
  const { ico, bg } = getTipIkon(gorev.tip);
  const zaman = getZaman(gorev, grup);
  const tag = getTag(gorev, grup);

  return (
    <div
      onClick={() => onTikla(gorev)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 4px',
        margin: '0 -4px',
        borderRadius: 8,
        borderBottom: '0.5px solid #f3f4f6',
        cursor: 'pointer',
        transition: 'background .12s',
        background: hover ? '#f9fafb' : 'transparent',
      }}
    >
      <div
        onClick={(e) => onTamamla(gorev, e)}
        role="presentation"
        title="Tamamlandı işaretle"
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: '1.5px solid #d1d5db',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
          transition: 'all .15s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = '#16a34a';
          e.currentTarget.style.background = '#dcfce7';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.background = '#fff';
        }}
      >
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M2 5l2.5 2.5L8 3" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 15,
          flexShrink: 0,
        }}
      >
        {ico}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          title={gorev.baslik}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#111827',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {gorev.baslik}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2, flexWrap: 'wrap' }}>
          {gorev.kupe_no && (
            <>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>Küpe: {gorev.kupe_no}</span>
              <span
                style={{ width: 3, height: 3, borderRadius: '50%', background: '#d1d5db', flexShrink: 0 }}
              />
            </>
          )}
          <span style={{ fontSize: 11, color: zaman.color, fontWeight: grup === 'geciken' ? 500 : 400 }}>
            {zaman.text}
          </span>
        </div>
      </div>

      <span
        style={{
          fontSize: 10,
          fontWeight: 500,
          padding: '3px 8px',
          borderRadius: 20,
          background: tag.bg,
          color: tag.color,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {tag.label}
      </span>

      <span style={{ fontSize: 14, color: '#d1d5db', flexShrink: 0 }} aria-hidden>
        ›
      </span>
    </div>
  );
};

const FiltreChip = ({ active, children, onClick, title }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={{
      padding: '5px 10px',
      borderRadius: 20,
      border: `1px solid ${active ? '#16a34a' : '#e5e7eb'}`,
      background: active ? '#dcfce7' : '#fff',
      color: active ? '#166534' : '#4b5563',
      fontSize: 11,
      fontWeight: 600,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'all .15s',
    }}
  >
    {children}
  </button>
);

// ─── Main component ────────────────────────────────────────────────────────
const GorevListesi = ({ geciken = [], bugun = [], yaklaşan = [], devamEdenTedaviler = [], onRefresh }) => {
  const navigate = useNavigate();
  const [tamamlananlar, setTamamlananlar] = useState({});
  const [filtre, setFiltre] = useState('tumu');
  const [arama, setArama] = useState('');
  const [genisGrup, setGenisGrup] = useState({});

  const gecikenIdSet = useMemo(
    () => new Set((geciken || []).map((g) => String(g._id))),
    [geciken]
  );

  const oncelikListesi = useMemo(() => {
    const acilBugun = (bugun || []).filter((g) => g.oncelik === 'acil');
    return [...(geciken || []), ...acilBugun];
  }, [geciken, bugun]);

  const filtrelenmis = useMemo(() => {
    const q = arama;
    const f = (arr, grup) => (arr || []).filter((g) => aramaEslesir(g, q)).map((g) => ({ gorev: g, grup }));

    switch (filtre) {
      case 'oncelik':
        return oncelikListesi.filter((g) => aramaEslesir(g, q)).map((g) => ({
          gorev: g,
          grup: gecikenIdSet.has(String(g._id)) ? 'geciken' : 'bugun',
        }));
      case 'geciken':
        return f(geciken, 'geciken');
      case 'bugun':
        return f(bugun, 'bugun');
      case 'yaklasan':
        return f(yaklaşan, 'yaklaşan');
      case 'tedavi':
        return f(devamEdenTedaviler, 'devamEden');
      default:
        return null;
    }
  }, [filtre, arama, geciken, bugun, yaklaşan, devamEdenTedaviler, oncelikListesi, gecikenIdSet]);

  const handleTamamla = async (gorev, e) => {
    e.stopPropagation();
    const id = gorev._id;
    try {
      if (gorev._kaynak === 'saglik') {
        await api.updateSaglikKaydi(id, { durum: 'iyilesti' });
        toast.success('Tedavi "iyileşti" olarak işaretlendi');
      } else {
        await api.bildirimTamamlandiIsaretle(id);
        toast.success('Görev tamamlandı');
      }
      setTamamlananlar((p) => ({ ...p, [id]: true }));
      if (typeof onRefresh === 'function') {
        setTimeout(() => onRefresh(), 300);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'İşlem yapılamadı';
      toast.error(msg);
    }
  };

  const handleTikla = (gorev) => {
    if (gorev._kaynak === 'saglik') {
      navigate('/saglik-merkezi');
      return;
    }
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

  const renderSatir = (g, grup) => (
    <GorevSatir
      key={`${grup}-${g._id}`}
      gorev={g}
      grup={grup}
      tamamlandi={!!tamamlananlar[g._id]}
      onTamamla={handleTamamla}
      onTikla={handleTikla}
    />
  );

  const renderGrup = (label, renk, arr, grupKey, grupId) => {
    const filtered = (arr || []).filter((g) => aramaEslesir(g, arama));
    if (!filtered.length) return null;
    const acik = !!genisGrup[grupId];
    const goster = acik ? filtered : filtered.slice(0, ILK_GOSTER);
    const kalan = filtered.length - goster.length;

    return (
      <div key={grupId}>
        <GrupBaslik label={label} renk={renk} sayi={filtered.length} />
        {goster.map((g) => renderSatir(g, grupKey))}
        {kalan > 0 && (
          <button
            type="button"
            onClick={() => setGenisGrup((p) => ({ ...p, [grupId]: !acik }))}
            style={{
              width: '100%',
              marginTop: 4,
              padding: '8px',
              border: '1px dashed #e5e7eb',
              borderRadius: 8,
              background: '#fafafa',
              color: '#16a34a',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {acik ? 'Daha az göster' : `+${kalan} görev daha göster`}
          </button>
        )}
      </div>
    );
  };

  const toplam =
    (geciken?.length || 0) +
    (bugun?.length || 0) +
    (yaklaşan?.length || 0) +
    (devamEdenTedaviler?.length || 0);

  const tekListeModu = filtre !== 'tumu';

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <input
          type="search"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Küpe veya başlık ara..."
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            fontSize: 13,
            outline: 'none',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          marginBottom: 10,
        }}
      >
        <FiltreChip active={filtre === 'tumu'} onClick={() => setFiltre('tumu')} title="Tüm gruplar">
          Tümü
        </FiltreChip>
        <FiltreChip
          active={filtre === 'oncelik'}
          onClick={() => setFiltre('oncelik')}
          title="Gecikmiş + bugün acil"
        >
          Öncelik {oncelikListesi.length ? `(${oncelikListesi.length})` : ''}
        </FiltreChip>
        <FiltreChip active={filtre === 'geciken'} onClick={() => setFiltre('geciken')}>
          Gecikmiş {geciken.length ? `(${geciken.length})` : ''}
        </FiltreChip>
        <FiltreChip active={filtre === 'bugun'} onClick={() => setFiltre('bugun')}>
          Bugün {bugun.length ? `(${bugun.length})` : ''}
        </FiltreChip>
        <FiltreChip active={filtre === 'yaklasan'} onClick={() => setFiltre('yaklasan')}>
          Yakın {yaklaşan.length ? `(${yaklaşan.length})` : ''}
        </FiltreChip>
        <FiltreChip active={filtre === 'tedavi'} onClick={() => setFiltre('tedavi')}>
          Tedavi {devamEdenTedaviler.length ? `(${devamEdenTedaviler.length})` : ''}
        </FiltreChip>
      </div>

      <div style={{ maxHeight: LISTE_MAX_YUKSEKLIK, overflowY: 'auto', paddingRight: 4, marginRight: -4 }}>
        {tekListeModu ? (
          (() => {
            const liste = filtrelenmis || [];
            if (!liste.length) {
              return (
                <div style={{ textAlign: 'center', padding: '20px 8px', color: '#9ca3af', fontSize: 13 }}>
                  {toplam === 0 ? '✅ Bekleyen görev yok' : 'Bu filtreye uygun görev yok'}
                </div>
              );
            }
            const acik = !!genisGrup.tek;
            const limit = filtre === 'oncelik' ? 12 : ILK_GOSTER;
            const goster = acik ? liste : liste.slice(0, limit);
            const kalan = liste.length - goster.length;
            return (
              <>
                {filtre === 'oncelik' && (
                  <GrupBaslik label="🔥 Öncelikli (gecikmiş + bugün acil)" renk="#dc2626" sayi={liste.length} />
                )}
                {goster.map(({ gorev, grup }) => renderSatir(gorev, grup))}
                {kalan > 0 && (
                  <button
                    type="button"
                    onClick={() => setGenisGrup((p) => ({ ...p, tek: !acik }))}
                    style={{
                      width: '100%',
                      marginTop: 6,
                      padding: '8px',
                      border: '1px dashed #e5e7eb',
                      borderRadius: 8,
                      background: '#fafafa',
                      color: '#16a34a',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {acik ? 'Daha az göster' : `+${kalan} görev daha`}
                  </button>
                )}
              </>
            );
          })()
        ) : (
          <>
            {renderGrup('⏰ Gecikmiş', '#dc2626', geciken, 'geciken', 'geciken')}
            {renderGrup('📅 Bugün', '#d97706', bugun, 'bugun', 'bugun')}
            {renderGrup('📆 Bu hafta', '#6b7280', yaklaşan, 'yaklaşan', 'yaklasan')}
            {renderGrup('💊 Devam eden tedaviler', '#d97706', devamEdenTedaviler, 'devamEden', 'tedavi')}
            {!geciken.length && !bugun.length && !yaklaşan.length && !devamEdenTedaviler.length && (
              <div style={{ textAlign: 'center', padding: '16px 8px', color: '#9ca3af', fontSize: 13 }}>
                ✅ Bekleyen görev yok
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GorevListesi;
