import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  FaLeaf, FaClipboardList, FaCheckCircle, FaTrash,
  FaBoxOpen, FaExclamationTriangle, FaChartPie, FaPlus,
  FaSeedling
} from 'react-icons/fa';
import * as api from '../services/api';
import RasyonHesaplayici from '../components/Yem/RasyonHesaplayici';
import YemEkleModal from '../components/Yem/YemEkleModal';
import StokYonetimi from './StokYonetimi';
import YemDanismani from '../components/Yem/YemDanismani';
import { showSuccess, showError } from '../utils/toast';

const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;
const pulseGlow = keyframes`0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.4)}50%{box-shadow:0 0 0 6px rgba(99,102,241,0)}`;
const shimmer = keyframes`0%{background-position:-200% 0}100%{background-position:200% 0}`;

// ─── Styled ──────────────────────────────────────────────────────────
const Page = styled.div`
  padding: 0 0 80px; background: #f1f5f9; min-height: 100vh;
  font-family: 'Inter', system-ui, sans-serif; animation: ${fadeIn} .35s ease;
`;

// ── Page Header (standart beyaz) ──────────────────────────────────────────
const PageHeader = styled.div`
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 24px 16px;

  @media (max-width: 768px) {
    padding: 14px 16px 12px;
  }
`;
const HeaderTop = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 16px; margin-bottom: 0;
`;
const HeaderLeft = styled.div`display: flex; align-items: center; gap: 14px;`;
const HeaderIcon = styled.div`
  width: 44px; height: 44px; border-radius: 12px;
  background: #f4f4f5;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; border: 1px solid #e5e7eb;
`;
const HeaderTitle = styled.h1`margin:0;font-size:20px;font-weight:700;color:#111827;letter-spacing:-0.3px;`;
const HeaderSub = styled.p`margin:2px 0 0;font-size:13px;color:#6b7280;`;
const HeaderBtns = styled.div`display:flex;gap:10px;flex-wrap:wrap;`;
const PrimaryBtn = styled.button`
  display:flex;align-items:center;gap:8px;padding:9px 16px;
  min-height: 48px;
  background:#16a34a;color:#fff;border:none;border-radius:8px;
  font-weight:600;font-size:13px;cursor:pointer;transition:background 0.15s;
  &:hover{background:#15803d;}
`;

// ── Stat Strip ────────────────────────────────────────────────────
const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin: 0 0 24px 0;
  overflow: hidden;

  @media (max-width: 600px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;
const Stat = styled.div`
  padding: 18px 24px; display: flex; align-items: center; gap: 14px;
  border-right: 1px solid #e5e7eb;
  &:last-child { border-right: none; }
  transition: background 0.15s;
  &:hover { background: #f9fafb; }
  .ico { width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 18px; background: #f4f4f5; color: #52525b; border: 1px solid #e5e7eb; }
  .lbl { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: .4px; }
  .val { font-size: 26px; font-weight: 700; color: #111827; line-height: 1; }

  @media (max-width: 600px) {
    padding: 12px 10px;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
    .ico { width: 32px; height: 32px; font-size: 14px; }
    .val { font-size: 18px; }
    .lbl { font-size: 9px; letter-spacing: 0; }
  }
`;

// ── Body ──────────────────────────────────────────────────────────
const BodyWrap = styled.div`
  padding: 24px;
  @media (max-width: 768px) { padding: 16px; }
`;

const TabLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TabContent = styled.div`
  flex: 1;
  width: 100%;
  min-width: 0;
`;

const PageLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 16px;
  align-items: flex-start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const MainCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
`;

const SideCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: 70px;

  @media (max-width: 900px) {
    position: static;
  }
`;

const TabBar = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const TabBtn = styled.button`
  padding: 10px 18px;
  font-size: 13px;
  font-weight: ${p => p.$active ? '500' : '400'};
  color: ${p => p.$active ? '#16a34a' : '#6b7280'};
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid ${p => p.$active ? '#16a34a' : 'transparent'};
  margin-bottom: -1px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.15s;

  .badge {
    background: #dc2626;
    color: #fff;
    font-size: 9px;
    font-weight: 500;
    padding: 1px 5px;
    border-radius: 10px;
  }
`;
// ─── Rasyon Kartları ───────────────────────────────────────────────
const RGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;`;
const RCard = styled.div`
  background:#fff;border-radius:16px;overflow:hidden;
  box-shadow:0 1px 3px rgba(0,0,0,.06),0 4px 16px rgba(0,0,0,.06);
  transition:all .25s;border-left:4px solid #10b981;
  &:hover{transform:translateY(-3px);box-shadow:0 4px 24px rgba(0,0,0,.1);}
`;
const RCardBody = styled.div`padding:20px;`;
const RHead = styled.div`display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;`;
const RAd = styled.div`font-size:16px;font-weight:800;color:#0f172a;`;
const RBadge = styled.span`
  background:#ecfdf5;color:#065f46;padding:4px 10px;border-radius:999px;
  font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;border:1px solid #d1fae5;
`;
const RMaliyet = styled.div`font-size:26px;font-weight:900;color:#0f172a;margin-bottom:14px;
  span{font-size:13px;color:#94a3b8;font-weight:500;margin-left:4px;}`;
const RIngredients = styled.div`
  background:#f8fafc;border-radius:10px;padding:12px 14px;margin-bottom:14px;
  div{display:flex;justify-content:space-between;align-items:center;padding:5px 0;
    border-bottom:1px solid #f1f5f9;&:last-child{border:none;}
    .iname{display:flex;align-items:center;gap:6px;font-size:13px;color:#475569;font-weight:600;}
    .iamt{font-size:13px;font-weight:700;color:#0f172a;}
  }
`;
const RActions = styled.div`display:flex;gap:8px;`;
const RBtn = styled.button`
  flex:${p => p.$flex || 1};padding:10px;border-radius:10px;border:none;font-weight:700;
  font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:.2s;
  background:${p => p.$danger ? '#fff1f2' : p.$primary ? 'linear-gradient(135deg,#065f46,#047857)' : '#f1f5f9'};
  color:${p => p.$danger ? '#e11d48' : p.$primary ? '#fff' : '#475569'};
  border:${p => p.$danger ? '1px solid #fecdd3' : 'none'};
  &:hover{transform:translateY(-1px);filter:brightness(.96);}
`;
const EmptyMsg = styled.div`
  text-align:center;padding:52px;color:#94a3b8;grid-column:1/-1;
  background:#fff;border-radius:16px;box-shadow:0 1px 4px rgba(0,0,0,.06);border:1px solid #e2e8f0;
  .icon{font-size:44px;margin-bottom:14px;opacity:.7;}
  p{margin:0;font-size:14px;line-height:1.6;}
`;

const Btn = styled.button`
  padding:9px 18px;border:none;border-radius:10px;font-size:13px;font-weight:700;
  cursor:pointer;display:flex;align-items:center;gap:7px;transition:.2s;color:#fff;
  background:${p => p.$blue ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : 'linear-gradient(135deg,#065f46,#047857)'};
  box-shadow:0 2px 6px rgba(0,0,0,0.12);
  &:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,.15);}
`;
const ModalOverlay = styled.div`
  position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);
  display:flex;align-items:center;justify-content:center;z-index:1100;padding:16px;
`;
const ModalBox = styled.div`
  background:#fff;border-radius:16px;padding:24px;max-width:400px;width:100%;
  box-shadow:0 10px 40px rgba(0,0,0,.15);
`;
const ModalTitle = styled.h3`margin:0 0 16px;font-size:18px;font-weight:800;color:#0f172a;`;
const ModalInput = styled.input`
  width:100%;padding:12px 14px;border:1.5px solid #e2e8f0;border-radius:10px;
  font-size:14px;margin-bottom:12px;box-sizing:border-box;
  &:focus{outline:none;border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.1);}
`;
const ModalSelect = styled.select`
  width:100%;padding:12px 14px;border:1.5px solid #e2e8f0;border-radius:10px;
  font-size:14px;margin-bottom:16px;box-sizing:border-box;background:#fff;
`;
const ModalActions = styled.div`display:flex;gap:10px;justify-content:flex-end;`;

const YemlemeListesi = ({ gruplar, gruplarBasCount, rasyonlar, yemlemeMod, setYemlemeMod, onYemlemeYapildi, setTab }) => {
  const [yemlemeData, setYemlemeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalGrup, setModalGrup] = useState(null);
  useEffect(() => {
    api.getYemlemeBugun().then(r => setYemlemeData(r.data)).catch(() => {});
  }, []);
  const handleYemleme = async (grup, planlananlaAyni = true, verilenKalemler) => {
    setLoading(true);
    try {
      await api.postYemleme({
        grupId: grup.grup._id,
        tarih: yemlemeData.tarih,
        planlananlaAyni,
        verilenKalemler
      });
      setModalGrup(null);
      api.getYemlemeBugun().then(r => setYemlemeData(r.data));
      onYemlemeYapildi?.();
      showSuccess('Yemleme kaydedildi!');
    } catch (err) {
      showError(err.response?.data?.message || 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };
  if (!yemlemeData) return null;
  const grupListesi = yemlemeData.gruplar || [];
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>Günlük Yemleme</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ key: 'grup', label: 'Grup bazlı' }, { key: 'tur', label: 'Tür bazlı' }].map(m => (
            <button key={m.key} onClick={() => { setYemlemeMod(m.key); localStorage.setItem('yemleme_mod', m.key); }}
              style={{ padding: '4px 10px', borderRadius: 20, border: '1px solid', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                background: yemlemeMod === m.key ? '#dcfce7' : '#fff', color: yemlemeMod === m.key ? '#166534' : '#6b7280',
                borderColor: yemlemeMod === m.key ? '#16a34a' : '#e5e7eb' }}>{m.label}</button>
          ))}
        </div>
      </div>
      {grupListesi.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Aktif grup yok. Gruplar sekmesinden grup oluşturun.</div>
      ) : grupListesi.map(g => {
        const rasyonAdi = g.grup.rasyonId?.ad;
        const kgPerBas = g.grup.rasyonId?.icerik?.reduce((s, i) => s + (i.miktar || 0), 0);
        const hasRasyon = !!g.grup.rasyonId;
        return (
          <div key={g.grup._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid #f3f4f6', background: g.yapildi ? '#fff' : '#fafafa', opacity: g.yapildi ? .85 : 1 }}>
            <div style={{ width: 4, height: 44, borderRadius: 2, background: g.grup.renk || '#16a34a', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 2 }}>{g.grup.ad}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>{g.basCount} baş{kgPerBas ? ` · ${kgPerBas.toFixed(1)} kg/baş` : ''}</div>
              {hasRasyon ? <div style={{ fontSize: 10, color: '#16a34a', fontWeight: 500, marginTop: 2 }}>🌿 {rasyonAdi}</div> : <div style={{ fontSize: 10, color: '#d97706', fontWeight: 500, marginTop: 2 }}>⚠️ Rasyon atanmamış</div>}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{g.planlanenKg ? `${g.planlanenKg.toFixed(0)} kg` : '—'}</div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>planlanan</div>
            </div>
            {g.yapildi ? (
              <div style={{ padding: '6px 14px', borderRadius: 7, background: '#dcfce7', color: '#166534', fontSize: 12, fontWeight: 500, flexShrink: 0 }}>✓ Yapıldı</div>
            ) : hasRasyon ? (
              <button onClick={() => setModalGrup(g)} disabled={loading} style={{ padding: '7px 14px', borderRadius: 7, background: '#16a34a', color: '#fff', border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>🍽️ Yemle</button>
            ) : (
              <button onClick={() => setTab('gruplar')} style={{ padding: '6px 12px', borderRadius: 7, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontSize: 11, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>Rasyon Ata</button>
            )}
          </div>
        );
      })}
      {modalGrup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }} onClick={() => setModalGrup(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 400, width: '100%' }} onClick={e => e.stopPropagation()}>
            <h4 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: '#111827' }}>{modalGrup.grup.ad}</h4>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>{modalGrup.basCount} baş · Planlanan: <strong>{modalGrup.planlanenKg?.toFixed(0)} kg</strong></p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => handleYemleme(modalGrup, true)} style={{ width: '100%', padding: 12, borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>✓ Evet, planlanan kadar verildi ({modalGrup.planlanenKg?.toFixed(0)} kg)</button>
              <button onClick={() => setModalGrup(null)} style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>İptal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StokOzet = ({ stokData, onTumunuGor }) => {
  const yemStoklar = stokData.filter(s => s && s.kategori === 'Yem').slice(0, 5);
  if (yemStoklar.length === 0) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>Yem Stoku</span>
        <button onClick={onTumunuGor} style={{ fontSize: 11, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Tümünü gör →</button>
      </div>
      {yemStoklar.map(s => {
        const gun = (s.gunlukTuketim || 0) > 0 ? Math.floor((s.miktar || 0) / s.gunlukTuketim) : 999;
        const renk = gun >= 30 ? '#16a34a' : gun >= 14 ? '#d97706' : '#dc2626';
        const pct = Math.min((gun / 60) * 100, 100);
        return (
          <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: '1px solid #f9fafb' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: gun < 14 ? '#fef2f2' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🌾</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>{s.urunAdi || s.ad || 'Yem'}</div>
              <div style={{ height: 3, background: '#f3f4f6', borderRadius: 2, marginTop: 4, overflow: 'hidden', width: '100%' }}>
                <div style={{ height: '100%', background: renk, width: `${pct}%`, borderRadius: 2, transition: 'width .6s' }} />
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>{Number(s.miktar || 0).toLocaleString('tr-TR')} {s.birim || 'kg'}</div>
              <div style={{ fontSize: 10, fontWeight: 500, color: renk, marginTop: 1 }}>{gun >= 999 ? '—' : `${gun} gün`}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RasyonOzet = ({ rasyonlar, gruplar, gruplarBasCount }) => {
  if (rasyonlar.length === 0) return null;
  const aktifRasyonlar = rasyonlar.filter(r => gruplar.some(g => g.rasyonId?._id === r._id || g.rasyonId === r._id));
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>Aktif Rasyonlar</span>
      </div>
      {aktifRasyonlar.slice(0, 4).map(r => {
        const kullanilan = gruplar.filter(g => g.rasyonId?._id === r._id || g.rasyonId === r._id);
        const toplamBas = kullanilan.reduce((s, g) => s + (gruplarBasCount[g._id] || 0), 0);
        return (
          <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid #f9fafb' }}>
            <div style={{ width: 3, height: 36, borderRadius: 2, background: '#16a34a', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{r.ad}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{toplamBas} baş · {r.icerik?.length || 0} bileşen</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{(r.toplamMaliyet || 0).toFixed(2)} ₺</div>
              <div style={{ fontSize: 10, color: '#9ca3af' }}>baş/gün</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const BugunOzetPanel = ({ yemlemeData, gunlukMaliyet }) => {
  const ozet = yemlemeData?.ozet || {};
  const pct = ozet.toplamGrup > 0 ? Math.round((ozet.yapilanGrup / ozet.toplamGrup) * 100) : 0;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>Bugün Özeti</span>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', border: `5px solid ${pct === 100 ? '#16a34a' : '#dcfce7'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: pct === 100 ? '#16a34a' : '#374151' }}>%{pct}</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{ozet.yapilanGrup}/{ozet.toplamGrup} grup yapıldı</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{ozet.bekleyenGrup > 0 ? `${ozet.bekleyenGrup} grup bekliyor` : 'Tümü tamamlandı'}</div>
          </div>
        </div>
        {[{ lbl: 'Tahmini maliyet', val: `${(gunlukMaliyet || 0).toLocaleString('tr-TR')} ₺` }, { lbl: 'Aktif grup', val: `${ozet.toplamGrup}` }].map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: i < 1 ? '1px solid #f3f4f6' : 'none' }}>
            <span style={{ color: '#9ca3af' }}>{row.lbl}</span>
            <span style={{ fontWeight: 500, color: '#111827' }}>{row.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AlimOnerisiPanel = ({ alimOnerisi }) => {
  if (!alimOnerisi?.oneriler?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>Alım Önerisi</span>
      </div>
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {alimOnerisi.oneriler.map(o => (
          <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f9fafb' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>{o.urunAdi}</div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{o.gerekliKg} kg · ~{(o.tahminiMaliyet || 0).toLocaleString('tr-TR')} ₺</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 20, background: o.oncelik === 'acil' ? '#fef2f2' : '#fef3c7', color: o.oncelik === 'acil' ? '#991b1b' : '#92400e' }}>
              {o.oncelik === 'acil' ? 'Acil' : 'Bu hafta'}
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingTop: 6, borderTop: '1px solid #e5e7eb' }}>
          <span style={{ color: '#9ca3af', fontWeight: 500 }}>Toplam tahmini</span>
          <span style={{ fontWeight: 500, color: '#111827' }}>{(alimOnerisi.toplamMaliyet || 0).toLocaleString('tr-TR')} ₺</span>
        </div>
      </div>
    </div>
  );
};

const TutarlilikPanel = ({ yemAnaliz }) => {
  if (!yemAnaliz?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>30 Günlük Tutarlılık</span>
      </div>
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {yemAnaliz.map(g => (
          <div key={g.grupId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: g.grupRenk || '#16a34a', flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 12, color: '#374151' }}>{g.grupAdi}</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: g.tutarlilik >= 80 ? '#16a34a' : g.tutarlilik >= 50 ? '#d97706' : '#dc2626' }}>%{g.tutarlilik}</div>
          </div>
        ))}
        {yemAnaliz.some(g => g.uyari) && (
          <div style={{ fontSize: 11, color: '#d97706', padding: '6px 8px', background: '#fffbeb', borderRadius: 6, marginTop: 2 }}>
            ⚠️ {yemAnaliz.filter(g => g.uyari).map(g => g.grupAdi).join(', ')} — düzensiz yemleme
          </div>
        )}
      </div>
    </div>
  );
};

const GecmisYemleme = () => {
  const [gecmis, setGecmis] = useState([]);
  const [gun, setGun] = useState(7);
  useEffect(() => {
    const bitis = new Date().toISOString().split('T')[0];
    const baslangic = new Date();
    baslangic.setDate(baslangic.getDate() - gun);
    const basStr = baslangic.toISOString().split('T')[0];
    api.getYemlemeGecmis({ baslangic: basStr, bitis, limit: 100 }).then(r => setGecmis(r.data || [])).catch(() => {});
  }, [gun]);
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[7, 14, 30].map(g => (
          <button key={g} onClick={() => setGun(g)} style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid', fontSize: 11, fontWeight: 500, cursor: 'pointer', background: gun === g ? '#dcfce7' : '#fff', color: gun === g ? '#166534' : '#6b7280', borderColor: gun === g ? '#16a34a' : '#e5e7eb' }}>Son {g} Gün</button>
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        {gecmis.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Bu dönemde yemleme kaydı yok</div>
        ) : gecmis.map((kayit, i) => (
          <div key={kayit._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: i < gecmis.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{kayit.grupId?.ad || 'Grup'}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{kayit.tarih} · {kayit.basCount} baş</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{(kayit.verilenKg || 0).toFixed(0)} kg</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>{(kayit.maliyet || 0).toLocaleString('tr-TR')} ₺</div>
            </div>
            {kayit.sapmaYuzde && Math.abs(kayit.sapmaYuzde) > 5 && (
              <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 20, background: '#fef3c7', color: '#92400e' }}>
                {kayit.sapmaYuzde > 0 ? '+' : ''}{kayit.sapmaYuzde.toFixed(0)}% sapma
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────
export default function YemMerkezi() {
  const location = useLocation();
  const [tab, setTab] = useState('bugun');
  const [yemler, setYemler] = useState([]);
  const [rasyonlar, setRasyonlar] = useState([]);
  const [gruplar, setGruplar] = useState([]);
  const [kritikSayisi, setKritikSayisi] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(!!location.state?.openAdd);
  const [showGrupEkleModal, setShowGrupEkleModal] = useState(false);
  const [grupForm, setGrupForm] = useState({ ad: '', tip: 'sagmal' });
  const [rasyonAlt, setRasyonAlt] = useState('liste');
  const [yemlemeMod, setYemlemeMod] = useState(() => localStorage.getItem('yemleme_mod') || 'grup');
  const [stokData, setStokData] = useState([]);
  const [yemlemeOzet, setYemlemeOzet] = useState({ toplamGrup: 0, yapilanGrup: 0, bekleyenGrup: 0 });
  const [gruplarBasCount, setGruplarBasCount] = useState({});
  const [yemlemeData, setYemlemeData] = useState(null);
  const [alimOnerisi, setAlimOnerisi] = useState(null);
  const [yemAnaliz, setYemAnaliz] = useState([]);
  const [showAiModal, setShowAiModal] = useState(false);
  const [acikGruplar, setAcikGruplar] = useState({});
  const toggleGrup = (id) => setAcikGruplar(p => ({ ...p, [id]: !p[id] }));

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [yr, rr, sr, gr, yb, ya, ao] = await Promise.all([
        api.getYemKutuphanesi(),
        api.getRasyonlar(),
        api.getStoklar({ kategori: 'Yem' }),
        api.getGruplar().catch(() => ({ data: [] })),
        api.getYemlemeBugun().catch(() => ({ data: {} })),
        api.getYemlemeAnaliz(30).catch(() => ({ data: {} })),
        api.getAlimOnerisi().catch(() => ({ data: null }))
      ]);
      setYemler(Array.isArray(yr?.data) ? yr.data : []);
      const rasyonData = rr?.data;
      setRasyonlar(Array.isArray(rasyonData) ? rasyonData : (Array.isArray(rasyonData?.data) ? rasyonData.data : []));
      const stokArr = Array.isArray(sr?.data) ? sr.data : [];
      setStokData(stokArr);
      setKritikSayisi(stokArr.filter(s => s && (s.miktar ?? 0) <= (s.kritikSeviye ?? 0)).length);
      setGruplar(Array.isArray(gr?.data) ? gr.data : []);
      setYemlemeData(yb?.data || null);
      setYemAnaliz(ya?.data?.analiz || []);
      setAlimOnerisi(ao?.data || null);

      const yemlemeDataRes = yb?.data;
      if (yemlemeDataRes?.gruplar) {
        const basMap = {};
        yemlemeDataRes.gruplar.forEach(g => { basMap[g.grup?._id] = g.basCount ?? 0; });
        setGruplarBasCount(basMap);
        setYemlemeOzet({
          toplamGrup: yemlemeDataRes.ozet?.toplamGrup ?? 0,
          yapilanGrup: yemlemeDataRes.ozet?.yapilanGrup ?? 0,
          bekleyenGrup: yemlemeDataRes.ozet?.bekleyenGrup ?? 0
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const gunlukMaliyet = gruplar.reduce((total, g) => {
    const rasyonMaliyet = g.rasyonId?.toplamMaliyet ?? rasyonlar.find(r => r._id === (g.rasyonId?._id || g.rasyonId))?.toplamMaliyet ?? 0;
    const basCount = gruplarBasCount[g._id] || 0;
    return total + (rasyonMaliyet * basCount);
  }, 0);

  const handleCreateRasyon = async (data) => {
    try { await api.createRasyon(data); showSuccess('Rasyon oluşturuldu! 🎉'); setRasyonAlt('liste'); loadData(); }
    catch { showError('Hata oluştu'); }
  };

  const handleYemle = async (id) => {
    if (!window.confirm('Bu rasyon için stoktan düşülecek ve maliyet yazılacak. Onaylıyor musun?')) return;
    try {
      const res = await api.rasyonDagit({ rasyonId: id });
      showSuccess(`${res.data.hayvanSayisi} hayvan yemlendi — ${res.data.toplamMaliyet.toFixed(2)} TL`);
    } catch (e) { showError('Yemleme başarısız: ' + (e.response?.data?.message || 'Hata')); }
  };

  const handleDeleteRasyon = async (id) => {
    if (!window.confirm('Bu rasyonu silmek istiyor musun?')) return;
    await api.deleteRasyon(id);
    loadData();
  };

  const handleGrupRasyonGuncelle = async (grupId, rasyonId) => {
    try {
      await api.updateGrup(grupId, { rasyonId: rasyonId || null });
      showSuccess('Rasyon atandı');
      loadData();
    } catch (e) {
      showError(e.response?.data?.message || 'Güncellenemedi');
    }
  };

  const handleGrupEkle = async () => {
    if (!grupForm.ad?.trim()) {
      showError('Grup adı girin');
      return;
    }
    try {
      await api.createGrup({ ad: grupForm.ad.trim(), tip: grupForm.tip });
      showSuccess('Grup oluşturuldu');
      setGrupForm({ ad: '', tip: 'sagmal' });
      setShowGrupEkleModal(false);
      loadData();
    } catch (e) {
      showError(e.response?.data?.message || 'Grup oluşturulamadı');
    }
  };

  const TABS = [
    { key: 'bugun', label: 'Bugün', icon: '📅', badge: null },
    { key: 'stok', label: 'Stok', icon: '📦', badge: kritikSayisi || null },
    { key: 'rasyon', label: 'Rasyonlar', icon: '🌿', badge: rasyonlar.length || null },
    { key: 'gruplar', label: 'Gruplar', icon: '👥', badge: gruplar.length || null },
    { key: 'gecmis', label: 'Geçmiş', icon: '📋', badge: null },
  ];

  const kritikYemler = stokData.filter(s => s && (s.miktar ?? 0) <= (s.kritikSeviye ?? 0));
  const toplamBas = gruplar.reduce((s, g) => s + (gruplarBasCount[g._id] || 0), 0);

  return (
    <Page>
      <PageHeader>
        <HeaderTop>
          <HeaderLeft>
            <HeaderIcon>🌿</HeaderIcon>
            <div>
              <HeaderTitle>Yem Yönetim Merkezi</HeaderTitle>
              <HeaderSub>Stok takibi · Rasyon planlama · Günlük yemleme</HeaderSub>
            </div>
          </HeaderLeft>
          <HeaderBtns>
            <PrimaryBtn onClick={() => setShowAddModal(true)}>
              <FaPlus /> Yem Ekle
            </PrimaryBtn>
          </HeaderBtns>
        </HeaderTop>
      </PageHeader>

      <BodyWrap>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Bugün Yemleme', value: `${yemlemeOzet.yapilanGrup}/${yemlemeOzet.toplamGrup} grup`, sub: yemlemeOzet.bekleyenGrup > 0 ? `${yemlemeOzet.bekleyenGrup} bekliyor` : 'Tamamlandı', subColor: yemlemeOzet.bekleyenGrup > 0 ? '#d97706' : '#16a34a' },
            { label: 'Günlük Yem Maliyeti', value: `${gunlukMaliyet.toLocaleString('tr-TR')} ₺`, sub: toplamBas > 0 ? `${(gunlukMaliyet / toplamBas).toFixed(1)} ₺/baş` : '—', subColor: '#9ca3af' },
            { label: 'Kritik Stok', value: `${kritikSayisi} ürün`, sub: kritikSayisi > 0 ? 'Alım gerekiyor' : 'Stok yeterli', subColor: kritikSayisi > 0 ? '#dc2626' : '#16a34a' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: '#111827', letterSpacing: '-.3px' }}>{k.value}</div>
              <div style={{ fontSize: 11, color: k.subColor, marginTop: 3 }}>{k.sub}</div>
            </div>
          ))}
        </div>
        <TabLayout>
          <TabBar>
            {TABS.map(t => (
              <TabBtn key={t.key} $active={tab === t.key} onClick={() => setTab(t.key)}>
                <span>{t.icon}</span>
                <span>{t.label}</span>
                {t.badge != null && t.badge > 0 && <span className="badge">{t.badge}</span>}
              </TabBtn>
            ))}
          </TabBar>

          {/* AI DANIŞMAN — her zaman görünür yatay bar */}
          <div
            style={{
              background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
              border: '1px solid #bbf7d0',
              borderRadius: 10,
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
              cursor: 'pointer',
            }}
            onClick={() => setShowAiModal(true)}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: '#16a34a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#fff', flexShrink: 0
            }}>
              🤖
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>
                Ziraat AI — Yem & Rasyon Danışmanı
              </div>
              <div style={{ fontSize: 11, color: '#16a34a', opacity: .8, marginTop: 1 }}>
                Rasyon optimizasyonu, stok analizi ve yemleme önerileri için tıkla
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', background: '#fff', padding: '5px 12px', borderRadius: 20, border: '1px solid #bbf7d0', flexShrink: 0 }}>
              Danışmana Sor →
            </div>
          </div>

          <TabContent>
            {tab === 'bugun' && (
              <PageLayout>
                <MainCol>
                  <YemlemeListesi gruplar={gruplar} gruplarBasCount={gruplarBasCount} rasyonlar={rasyonlar} yemlemeMod={yemlemeMod} setYemlemeMod={setYemlemeMod} onYemlemeYapildi={loadData} setTab={setTab} />
                  <StokOzet stokData={stokData} onTumunuGor={() => setTab('stok')} />
                  <RasyonOzet rasyonlar={rasyonlar} gruplar={gruplar} gruplarBasCount={gruplarBasCount} />
                </MainCol>
                <SideCol>
                  <BugunOzetPanel yemlemeData={yemlemeData} gunlukMaliyet={gunlukMaliyet} />
                  <AlimOnerisiPanel alimOnerisi={alimOnerisi} />
                  <TutarlilikPanel yemAnaliz={yemAnaliz} />
                </SideCol>
              </PageLayout>
            )}

            {tab === 'gecmis' && <GecmisYemleme />}

            {tab === 'stok' && <StokYonetimi embedded />}

            {tab === 'rasyon' && (
              <>
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  {[
                    { key: 'liste', label: 'Rasyonlarım' },
                    { key: 'olustur', label: '+ Yeni Rasyon' },
                  ].map(a => (
                    <button
                      key={a.key}
                      onClick={() => setRasyonAlt(a.key)}
                      style={{
                        padding: '6px 14px', borderRadius: 20, border: '1px solid',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        background: rasyonAlt === a.key ? '#dcfce7' : '#fff',
                        color: rasyonAlt === a.key ? '#166534' : '#6b7280',
                        borderColor: rasyonAlt === a.key ? '#16a34a' : '#e5e7eb',
                      }}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
                {rasyonAlt === 'liste' && (
                  <RGrid>
                    {rasyonlar.length === 0 ? (
                      <EmptyMsg>
                        <div className="icon">🌿</div>
                        <p>Henüz rasyon tanımlamadınız.<br />
                          <strong style={{ color: '#10b981' }}>+ Yeni Rasyon</strong> ile oluşturun.</p>
                        <Btn style={{ marginTop: 16 }} onClick={() => setRasyonAlt('olustur')}>
                          <FaPlus /> Yeni Rasyon Oluştur
                        </Btn>
                      </EmptyMsg>
                    ) : rasyonlar.map(r => (
                      <RCard key={r._id}>
                        <RCardBody>
                          <RHead>
                            <RAd>{r.ad}</RAd>
                            <RBadge>{r.hedefGrup?.toUpperCase()}</RBadge>
                          </RHead>
                          <RMaliyet>{r.toplamMaliyet?.toFixed(2) ?? '0'} TL<span>/ Baş</span></RMaliyet>
                          <RIngredients>
                            {r.icerik?.map((item, i) => (
                              <div key={i}>
                                <span className="iname"><FaLeaf size={9} color="#10b981" />{item.yemId?.ad || 'Silinmiş Yem'}</span>
                                <span className="iamt">{item.miktar} kg</span>
                              </div>
                            ))}
                          </RIngredients>
                          <RActions>
                            <RBtn $primary onClick={() => handleYemle(r._id)}><FaCheckCircle /> Yemle</RBtn>
                            <RBtn $danger $flex={.5} onClick={() => handleDeleteRasyon(r._id)}><FaTrash /></RBtn>
                          </RActions>
                        </RCardBody>
                      </RCard>
                    ))}
                  </RGrid>
                )}
                {rasyonAlt === 'olustur' && <RasyonHesaplayici yemler={yemler} onSave={handleCreateRasyon} />}
              </>
            )}

            {tab === 'gruplar' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Üst bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>
                    {gruplar.length} grup · {Object.values(gruplarBasCount).reduce((s, v) => s + v, 0)} baş toplam
                  </div>
                  <button
                    onClick={() => setShowGrupEkleModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    <FaPlus size={10} /> Grup Ekle
                  </button>
                </div>

                {gruplar.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 24px', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6 }}>Henüz grup yok</div>
                    <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>
                      Gruplar hayvanlarını kategorize etmeni sağlar. Her gruba bir rasyon atanır ve günlük yemleme bu gruplara göre hesaplanır.
                    </div>
                    <button onClick={() => setShowGrupEkleModal(true)} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      İlk Grubu Oluştur
                    </button>
                  </div>
                ) : gruplar.map(g => {
                  const basCount = gruplarBasCount[g._id] || 0;
                  const rasyonAdi = g.rasyonId?.ad;
                  const icerik = g.rasyonId?.icerik || [];
                  const kgPerBas = icerik.reduce((s, i) => s + (i.miktar || 0), 0);
                  const gunlukToplamKg = kgPerBas * basCount;
                  const gunlukMaliyetGrup = (g.rasyonId?.toplamMaliyet || 0) * basCount;
                  const acik = acikGruplar[g._id];

                  return (
                    <div key={g._id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                      {/* Grup başlık satırı */}
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', transition: 'background .15s' }}
                        onClick={() => toggleGrup(g._id)}
                      >
                        <div style={{ width: 4, height: 36, borderRadius: 2, background: g.renk || '#16a34a', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {g.ad}
                            <span style={{ fontSize: 11, fontWeight: 500, background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 20 }}>
                              {basCount} baş
                            </span>
                          </div>
                          {rasyonAdi ? (
                            <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 500, marginTop: 2 }}>
                              🌿 {rasyonAdi} · {kgPerBas.toFixed(1)} kg/baş · {gunlukToplamKg.toFixed(0)} kg/gün
                            </div>
                          ) : (
                            <div style={{ fontSize: 11, color: '#d97706', fontWeight: 500, marginTop: 2 }}>
                              ⚠️ Rasyon atanmamış — yemleme hesaplanamıyor
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          {gunlukMaliyetGrup > 0 && (
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                              {gunlukMaliyetGrup.toFixed(0)} ₺/gün
                            </div>
                          )}
                          <div style={{ fontSize: 10, color: '#9ca3af' }}>
                            {g.tip || 'karma'}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: '#9ca3af', transform: acik ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>▾</div>
                      </div>

                      {/* Açılan detay */}
                      {acik && (
                        <div style={{ borderTop: '1px solid #f3f4f6', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                          {/* Rasyon atama */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', flexShrink: 0 }}>Rasyon:</span>
                            <select
                              value={g.rasyonId?._id || g.rasyonId || ''}
                              onChange={e => handleGrupRasyonGuncelle(g._id, e.target.value || null)}
                              style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, color: '#111827', background: '#fff', cursor: 'pointer' }}
                            >
                              <option value="">— Rasyon seç —</option>
                              {rasyonlar.map(r => (
                                <option key={r._id} value={r._id}>
                                  {r.ad} — {r.hedefGrup} — {(r.toplamMaliyet || 0).toFixed(2)} ₺/baş
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => { setTab('rasyon'); setRasyonAlt('olustur'); }}
                              style={{ fontSize: 11, color: '#16a34a', background: 'none', border: '1px solid #bbf7d0', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontWeight: 500, flexShrink: 0 }}
                            >
                              + Yeni Rasyon
                            </button>
                          </div>

                          {/* Rasyon içeriği — varsa göster */}
                          {icerik.length > 0 && (
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 8 }}>
                                Rasyon İçeriği — {basCount} baş için günlük toplam
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid #f3f4f6', borderRadius: 8, overflow: 'hidden' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', gap: 8, padding: '7px 12px', background: '#f9fafb', fontSize: 10, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>
                                  <span>Yem</span>
                                  <span style={{ textAlign: 'right' }}>kg/baş</span>
                                  <span style={{ textAlign: 'right' }}>Toplam</span>
                                  <span style={{ textAlign: 'right' }}>Stok</span>
                                </div>
                                {icerik.map((item, i) => {
                                  const yemId = item.yemId?._id || item.yemId;
                                  const yemAd = item.yemId?.ad || item.yemAdi || '';
                                  const stokItem = stokData.find(s =>
                                    (yemId && s.yemKutuphanesiId && String(s.yemKutuphanesiId) === String(yemId)) ||
                                    (yemAd && s.urunAdi?.toLowerCase() === yemAd.toLowerCase())
                                  );
                                  const stokGun = stokItem?.gunlukTuketim > 0
                                    ? Math.floor(stokItem.miktar / stokItem.gunlukTuketim)
                                    : null;

                                  return (
                                    <div
                                      key={i}
                                      style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', gap: 8, padding: '8px 12px', borderTop: i > 0 ? '1px solid #f9fafb' : 'none', alignItems: 'center' }}
                                    >
                                      <span style={{ fontSize: 12, color: '#374151' }}>
                                        {item.yemId?.ad || item.yemAdi || 'Bilinmiyor'}
                                      </span>
                                      <span style={{ fontSize: 12, fontWeight: 500, color: '#111827', textAlign: 'right' }}>
                                        {item.miktar} kg
                                      </span>
                                      <span style={{ fontSize: 12, fontWeight: 500, color: '#111827', textAlign: 'right' }}>
                                        {(item.miktar * basCount).toFixed(0)} kg
                                      </span>
                                      <span style={{
                                        fontSize: 11, fontWeight: 500, textAlign: 'right',
                                        color: stokGun === null ? '#9ca3af' : stokGun < 7 ? '#dc2626' : stokGun < 14 ? '#d97706' : '#16a34a'
                                      }}>
                                        {stokGun === null ? '—' : `${stokGun}g`}
                                      </span>
                                    </div>
                                  );
                                })}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', gap: 8, padding: '8px 12px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Toplam</span>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: '#111827', textAlign: 'right' }}>{kgPerBas.toFixed(1)} kg</span>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', textAlign: 'right' }}>{gunlukToplamKg.toFixed(0)} kg</span>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: '#111827', textAlign: 'right' }}>{gunlukMaliyetGrup.toFixed(0)} ₺</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Aksiyonlar */}
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => alert('Hayvan atama yakında eklenecek')}
                              style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                            >
                              Hayvanları Gör
                            </button>
                            <button
                              onClick={() => api.deleteGrup(g._id).then(loadData).catch(() => showError('Silinemedi'))}
                              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #fecaca', background: '#fff', color: '#dc2626', fontSize: 12, cursor: 'pointer' }}
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {showAiModal && (
              <div
                style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}
                onClick={() => setShowAiModal(false)}
              >
                <div
                  style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 800, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>🤖 Ziraat AI Danışmanı</div>
                    <button onClick={() => setShowAiModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 18 }}>✕</button>
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <YemDanismani />
                  </div>
                </div>
              </div>
            )}
            {showAddModal && (
              <YemEkleModal onClose={() => setShowAddModal(false)} onSave={() => { loadData(); setShowAddModal(false); }} />
            )}
            {showGrupEkleModal && (
              <ModalOverlay onClick={() => setShowGrupEkleModal(false)}>
                <ModalBox onClick={e => e.stopPropagation()}>
                  <ModalTitle>Yeni Grup Oluştur</ModalTitle>
                  <ModalInput
                    placeholder="Grup adı (örn: Sağmal A, Kuru Dönem)"
                    value={grupForm.ad}
                    onChange={e => setGrupForm(f => ({ ...f, ad: e.target.value }))}
                  />
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>Grup tipi</label>
                  <ModalSelect
                    value={grupForm.tip}
                    onChange={e => setGrupForm(f => ({ ...f, tip: e.target.value }))}
                  >
                    <option value="sagmal">Sağmal</option>
                    <option value="kuru">Kuru Dönem</option>
                    <option value="duve">Düve</option>
                    <option value="buzagi">Buzağı</option>
                    <option value="besi">Besi / Tosun</option>
                    <option value="karma">Karma</option>
                  </ModalSelect>
                  <ModalActions>
                    <RBtn onClick={() => setShowGrupEkleModal(false)}>İptal</RBtn>
                    <RBtn $primary onClick={handleGrupEkle}><FaCheckCircle /> Oluştur</RBtn>
                  </ModalActions>
                </ModalBox>
              </ModalOverlay>
            )}
          </TabContent>
        </TabLayout>
      </BodyWrap>
    </Page>
  );
}
