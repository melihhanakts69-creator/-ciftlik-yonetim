import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  FaLeaf, FaClipboardList, FaCheckCircle, FaTrash, FaCalculator,
  FaBoxOpen, FaExclamationTriangle, FaChartPie, FaSearch, FaUserMd, FaPlus,
  FaRobot, FaTimes
} from 'react-icons/fa';
import * as api from '../services/api';
import { useIsMobile } from '../hooks/useMediaQuery';
import RasyonHesaplayici from '../components/Yem/RasyonHesaplayici';
import YemEkleModal from '../components/Yem/YemEkleModal';
import YemDeposu from '../components/YemDeposu';
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
  gap: 24px;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
`;

const TabContent = styled.div`
  flex: 1;
  width: 100%;
  min-width: 0;
`;

// ── Tab Bar ────────────────────────────────────────────────────────
const TabBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: transparent;
  margin-bottom: 22px;
  width: 100%;
  max-width: 300px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    flex-direction: row;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 4px;
    margin-bottom: 16px;
    gap: 6px;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }
`;
const TabBtn = styled.button`
  padding: 12px 18px; border: none; border-radius: 12px; font-size: 14px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 12px; transition: all .2s;
  background: ${p => p.$active ? 'linear-gradient(135deg,#065f46,#047857)' : '#fff'};
  color: ${p => p.$active ? '#fff' : '#475569'};
  box-shadow: ${p => p.$active ? '0 4px 12px rgba(6,95,70,.25)' : '0 1px 3px rgba(0,0,0,0.05)'};
  border: 1px solid ${p => p.$active ? 'transparent' : '#e2e8f0'};
  &:hover { transform: translateX(4px); box-shadow: 0 4px 14px rgba(0,0,0,.1); }
  .icon-left { display: flex; align-items: center; gap: 10px; }

  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 13px;
    border-radius: 20px;
    flex-shrink: 0;
    white-space: nowrap;
    &:hover { transform: none; }
    .icon-left { gap: 6px; }
  }
`;
const NewBadge = styled.span`
  background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;
  font-size:9px;padding:2px 6px;border-radius:999px;font-weight:800;
  animation: ${pulseGlow} 2s ease-in-out infinite;
`;

const AiBanner = styled.div`
  display: flex; align-items: center; gap: 14px;
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  border: 1.5px solid #86efac; border-radius: 14px;
  padding: 14px 18px; margin-bottom: 16px;
  animation: ${fadeIn} .4s ease;
  
  @media (max-width: 768px) { padding: 12px 14px; gap: 10px; }
`;
const AiBannerIcon = styled.div`
  width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
  background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
  animation: ${pulseGlow} 2.5s ease-in-out infinite;
`;
const AiBannerText = styled.div`
  flex: 1;
  .title { font-size: 14px; font-weight: 800; color: #065f46; }
  .sub { font-size: 12px; color: #16a34a; margin-top: 2px; }
`;
const AiBannerBtn = styled.button`
  padding: 8px 16px; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;
  background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff;
  transition: all .2s; flex-shrink: 0;
  &:hover { filter: brightness(1.1); transform: translateY(-1px); }
`;
const AiBannerClose = styled.button`
  background: none; border: none; color: #86efac; cursor: pointer; padding: 4px; flex-shrink: 0;
  &:hover { color: #16a34a; }
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

// ─── Kütüphane ─────────────────────────────────────────────────────
const LibCard = styled.div`
  background:#fff;border-radius:16px;padding:24px;
  box-shadow:0 1px 3px rgba(0,0,0,.06),0 4px 16px rgba(0,0,0,.04);border:1px solid #e2e8f0;
`;
const LibTop = styled.div`display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px;`;
const SearchBox = styled.div`position:relative;svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:13px;}`;
const SInp = styled.input`
  padding:9px 14px 9px 34px;border:1.5px solid #e2e8f0;border-radius:10px;
  font-size:13px;outline:none;background:#f8fafc;color:#1e293b;width:240px;
  &::placeholder{color:#94a3b8;}
  &:focus{border-color:#10b981;background:#fff;box-shadow:0 0 0 3px rgba(16,185,129,.1);}
`;
const LibBtnGroup = styled.div`display:flex;gap:8px;`;
const Btn = styled.button`
  padding:9px 18px;border:none;border-radius:10px;font-size:13px;font-weight:700;
  cursor:pointer;display:flex;align-items:center;gap:7px;transition:.2s;color:#fff;
  background:${p => p.$blue ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : 'linear-gradient(135deg,#065f46,#047857)'};
  box-shadow:0 2px 6px rgba(0,0,0,0.12);
  &:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,.15);}
`;
const Table = styled.table`width:100%;border-collapse:collapse;font-size:13px;`;
const TH = styled.th`
  text-align:left;padding:10px 16px;color:#64748b;font-weight:700;
  font-size:11px;text-transform:uppercase;letter-spacing:.5px;
  border-bottom:2px solid #f1f5f9;background:#f8fafc;
`;
const TD = styled.td`
  padding:13px 16px;border-bottom:1px solid #f8fafc;color:#334155;font-weight:500;
  &:first-child{font-weight:700;color:#0f172a;}
`;
const PriceBadge = styled.span`
  background:#ecfdf5;color:#065f46;padding:4px 10px;border-radius:8px;
  font-size:12px;font-weight:700;border:1px solid #d1fae5;
`;

const YemKutuphaneCardWrap = styled.div`
  display: flex; flex-direction: column; gap: 12px;
  @media (min-width: 769px) { display: none; }
`;
const YemKutuphaneCard = styled.div`
  background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  .ad { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
  .row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #64748b; margin-bottom: 4px; }
  .row strong { color: #334155; }
  .fiyat { margin-top: 10px; }
`;

const TableWrap = styled.div`
  @media (max-width: 768px) { display: none; }
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

// ─── Component ────────────────────────────────────────────────────
export default function YemMerkezi() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [tab, setTab] = useState('stok');
  const [yemler, setYemler] = useState([]);
  const [rasyonlar, setRasyonlar] = useState([]);
  const [gruplar, setGruplar] = useState([]);
  const [kritikSayisi, setKritikSayisi] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(!!location.state?.openAdd);
  const [showGrupEkleModal, setShowGrupEkleModal] = useState(false);
  const [grupForm, setGrupForm] = useState({ ad: '', tip: 'sagmal' });
  const [search, setSearch] = useState('');
  const [showAiBanner, setShowAiBanner] = useState(() => !sessionStorage.getItem('yem_ai_banner_dismissed'));

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [yr, rr, sr, gr] = await Promise.all([
        api.getYemKutuphanesi(),
        api.getRasyonlar(),
        api.getYemStok(),
        api.getGruplar().catch(() => ({ data: [] }))
      ]);
      setYemler(Array.isArray(yr?.data) ? yr.data : []);
      const rasyonData = rr?.data;
      setRasyonlar(Array.isArray(rasyonData) ? rasyonData : (Array.isArray(rasyonData?.data) ? rasyonData.data : []));
      const stokData = Array.isArray(sr?.data) ? sr.data : [];
      setKritikSayisi(stokData.filter(s => s && (s.miktar ?? 0) <= (s.minimumStok ?? 0)).length);
      setGruplar(Array.isArray(gr?.data) ? gr.data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreateRasyon = async (data) => {
    try { await api.createRasyon(data); showSuccess('Rasyon oluşturuldu! 🎉'); setTab('rasyon'); loadData(); }
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

  const filteredYemler = yemler.filter(y => y.ad.toLowerCase().includes(search.toLowerCase()));

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
    { key: 'stok', label: 'Stok & Depo', icon: <FaBoxOpen /> },
    { key: 'gruplar', label: 'Gruplar', icon: <FaClipboardList />, badge: gruplar.length || null },
    { key: 'rasyon', label: 'Rasyonlarım', icon: <FaChartPie />, badge: rasyonlar.length || null },
    { key: 'hesapla', label: 'Hesaplayıcı', icon: <FaCalculator /> },
    { key: 'danisman', label: 'Yem Danışmanı', icon: <FaUserMd />, isNew: true },
    { key: 'kutuphane', label: 'Yem Kütüphanesi', icon: <FaLeaf /> },
  ];

  return (
    <Page>
      <PageHeader>
        <HeaderTop>
          <HeaderLeft>
            <HeaderIcon>🌿</HeaderIcon>
            <div>
              <HeaderTitle>Yem Yönetim Merkezi</HeaderTitle>
              <HeaderSub>Stok takibi · Rasyon planlama · Günlük yemleme · AI danışman</HeaderSub>
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
        <StatRow>
          <Stat>
            <div className="ico"><FaClipboardList /></div>
            <div><div className="lbl">Aktif Rasyonlar</div><div className="val">{rasyonlar.length}</div></div>
          </Stat>
          <Stat>
            <div className="ico"><FaBoxOpen /></div>
            <div><div className="lbl">Tanımlı Yemler</div><div className="val">{yemler.length}</div></div>
          </Stat>
          <Stat>
            <div className="ico"><FaExclamationTriangle /></div>
            <div><div className="lbl">Kritik Stok</div><div className="val">{kritikSayisi}</div></div>
          </Stat>
        </StatRow>
        <TabLayout>
          <TabBar>
            {TABS.map(t => (
              <TabBtn key={t.key} $active={tab === t.key} onClick={() => setTab(t.key)}>
                <div className="icon-left">
                  {t.icon} {t.label}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {t.isNew && <NewBadge>YENİ</NewBadge>}
                  {t.badge && <span style={{ background: '#ecfdf5', color: '#065f46', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 800 }}>{t.badge}</span>}
                </div>
              </TabBtn>
            ))}
          </TabBar>

          <TabContent>
            {/* AI Danışman Keşif Banneri */}
            {showAiBanner && tab !== 'danisman' && (
              <AiBanner>
                <AiBannerIcon><FaRobot /></AiBannerIcon>
                <AiBannerText>
                  <div className="title">Ziraat AI Yem Danışmanı</div>
                  <div className="sub">Rasyon optimizasyonu, besin analizi ve yemleme önerileri için AI'dan yardım alın</div>
                </AiBannerText>
                <AiBannerBtn onClick={() => setTab('danisman')}>Dene</AiBannerBtn>
                <AiBannerClose onClick={() => { setShowAiBanner(false); sessionStorage.setItem('yem_ai_banner_dismissed', '1'); }}>
                  <FaTimes size={14} />
                </AiBannerClose>
              </AiBanner>
            )}
            {tab === 'danisman' && <YemDanismani />}
            {tab === 'stok' && <YemDeposu isEmbedded={true} />}
            {tab === 'hesapla' && <RasyonHesaplayici yemler={yemler} onSave={handleCreateRasyon} />}

            {tab === 'gruplar' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  <Btn onClick={() => setShowGrupEkleModal(true)}>
                    <FaPlus /> Grup Ekle
                  </Btn>
                </div>
                <RGrid>
                {gruplar.length === 0 ? (
                  <EmptyMsg>
                    <div className="icon">📋</div>
                    <p>Henüz grup tanımlamadınız.<br />
                      <strong>Grup Ekle</strong> ile yeni grup oluşturun, sonra hayvanlarınıza bu grupları atayın.</p>
                    <Btn style={{ marginTop: 16 }} onClick={() => setShowGrupEkleModal(true)}>
                      <FaPlus /> İlk Grubu Oluştur
                    </Btn>
                  </EmptyMsg>
                ) : gruplar.map(g => (
                  <RCard key={g._id}>
                    <RCardBody>
                      <RHead>
                        <RAd style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 12, height: 12, borderRadius: 4, background: g.renk || '#10b981' }} />
                          {g.ad}
                        </RAd>
                        <RBadge>{g.tip || 'karma'}</RBadge>
                      </RHead>
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>Rasyon ata</label>
                        <select
                          value={g.rasyonId?._id || g.rasyonId || ''}
                          onChange={e => handleGrupRasyonGuncelle(g._id, e.target.value || null)}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13 }}
                        >
                          <option value="">— Rasyon seçin —</option>
                          {rasyonlar.map(r => (
                            <option key={r._id} value={r._id}>{r.ad} ({r.hedefGrup})</option>
                          ))}
                        </select>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                        Gruba rasyon atayın. Dashboard'da günlük yemleme bu gruplara göre yapılır.
                      </p>
                    </RCardBody>
                  </RCard>
                ))}
              </RGrid>
              </>
            )}

            {tab === 'rasyon' && (
              <RGrid>
                {rasyonlar.length === 0 ? (
                  <EmptyMsg>
                    <div className="icon">🌿</div>
                    <p>Henüz rasyon tanımlamadınız.<br />
                      <strong style={{ color: '#10b981' }}>Hesaplayıcı</strong> sekmesinden yeni bir rasyon oluşturun.</p>
                  </EmptyMsg>
                ) : rasyonlar.map(r => (
                  <RCard key={r._id}>
                    <RCardBody>
                      <RHead>
                        <RAd>{r.ad}</RAd>
                        <RBadge>{r.hedefGrup?.toUpperCase()}</RBadge>
                      </RHead>
                      <RMaliyet>{r.toplamMaliyet.toFixed(2)} TL<span>/ Baş</span></RMaliyet>
                      <RIngredients>
                        {r.icerik.map((item, i) => (
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

            {tab === 'kutuphane' && (
              <LibCard>
                <LibTop>
                  <SearchBox>
                    <FaSearch />
                    <SInp value={search} onChange={e => setSearch(e.target.value)} placeholder="Yem ara..." />
                  </SearchBox>
                  <LibBtnGroup>
                    <Btn $blue onClick={async () => {
                      if (!window.confirm('Depodaki yemler kütüphaneye aktarılacak. Onaylıyor musun?')) return;
                      setLoading(true);
                      try { const r = await api.syncStokToLibrary(); showSuccess(`${r.data.added} yem eklendi, ${r.data.matched} tanımlandı.`); loadData(); }
                      catch { showError('Hata oluştu'); }
                      finally { setLoading(false); }
                    }}><FaClipboardList /> Akıllı Eşitle</Btn>
                    <Btn onClick={() => setShowAddModal(true)}><FaPlus /> Yeni Yem</Btn>
                  </LibBtnGroup>
                </LibTop>
                {isMobile ? (
                  <YemKutuphaneCardWrap>
                    {filteredYemler.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>Yem bulunamadı</div>
                    ) : (
                      filteredYemler.map(y => (
                        <YemKutuphaneCard key={y._id}>
                          <div className="ad">{y.ad}</div>
                          <div className="row"><span>KM</span><strong>%{y.kuruMadde}</strong></div>
                          <div className="row"><span>Protein</span><strong>%{y.protein}</strong></div>
                          <div className="row"><span>Enerji</span><strong>{y.enerji} Mcal</strong></div>
                          <div className="row fiyat"><span>Birim Fiyat</span><PriceBadge>{y.birimFiyat} TL/Kg</PriceBadge></div>
                        </YemKutuphaneCard>
                      ))
                    )}
                  </YemKutuphaneCardWrap>
                ) : (
                  <TableWrap>
                    <Table>
                      <thead>
                        <tr>
                          <TH>Yem Adı</TH><TH>KM (%)</TH><TH>Protein (%)</TH><TH>Enerji (Mcal)</TH><TH>Birim Fiyat</TH>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredYemler.map(y => (
                          <tr key={y._id}>
                            <TD>{y.ad}</TD>
                            <TD>{y.kuruMadde}</TD>
                            <TD>{y.protein}</TD>
                            <TD>{y.enerji}</TD>
                            <TD><PriceBadge>{y.birimFiyat} TL/Kg</PriceBadge></TD>
                          </tr>
                        ))}
                        {filteredYemler.length === 0 && <tr><TD colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>Yem bulunamadı</TD></tr>}
                      </tbody>
                    </Table>
                  </TableWrap>
                )}
              </LibCard>
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
