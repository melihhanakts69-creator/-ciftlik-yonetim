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
import YemDeposu from '../components/YemDeposu';
import YemDanismani from '../components/Yem/YemDanismani';
import BugunYemlemeCard from '../components/Dashboard/BugunYemlemeCard';
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

// ─── Component ────────────────────────────────────────────────────
export default function YemMerkezi() {
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
  const [rasyonAlt, setRasyonAlt] = useState('liste');
  const [yemlemeMod, setYemlemeMod] = useState(() => localStorage.getItem('yemleme_mod') || 'grup');
  const [stokData, setStokData] = useState([]);
  const [yemlemeOzet, setYemlemeOzet] = useState({ toplamGrup: 0, yapilanGrup: 0, bekleyenGrup: 0 });
  const [gruplarBasCount, setGruplarBasCount] = useState({});

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [yr, rr, sr, gr, yb] = await Promise.all([
        api.getYemKutuphanesi(),
        api.getRasyonlar(),
        api.getYemStok(),
        api.getGruplar().catch(() => ({ data: [] })),
        api.getYemlemeBugun().catch(() => ({ data: {} }))
      ]);
      setYemler(Array.isArray(yr?.data) ? yr.data : []);
      const rasyonData = rr?.data;
      setRasyonlar(Array.isArray(rasyonData) ? rasyonData : (Array.isArray(rasyonData?.data) ? rasyonData.data : []));
      const stokArr = Array.isArray(sr?.data) ? sr.data : [];
      setStokData(stokArr);
      setKritikSayisi(stokArr.filter(s => s && (s.miktar ?? 0) <= (s.minimumStok ?? 0)).length);
      setGruplar(Array.isArray(gr?.data) ? gr.data : []);

      const yemlemeData = yb?.data;
      if (yemlemeData?.gruplar) {
        const basMap = {};
        yemlemeData.gruplar.forEach(g => { basMap[g.grup?._id] = g.basCount ?? 0; });
        setGruplarBasCount(basMap);
        setYemlemeOzet({
          toplamGrup: yemlemeData.ozet?.toplamGrup ?? 0,
          yapilanGrup: yemlemeData.ozet?.yapilanGrup ?? 0,
          bekleyenGrup: yemlemeData.ozet?.bekleyenGrup ?? 0
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

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
    { key: 'stok', label: 'Stok', icon: <FaBoxOpen />, badge: null },
    { key: 'rasyon', label: 'Rasyonlar', icon: <FaChartPie />, badge: rasyonlar.length || null },
    { key: 'gruplar', label: 'Gruplar', icon: <FaClipboardList />, badge: gruplar.length || null },
    { key: 'yemleme', label: 'Günlük Yemleme', icon: <FaSeedling />, badge: null },
  ];

  const kritikYemler = stokData.filter(s => s && (s.miktar ?? 0) <= (s.minimumStok ?? 0));

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
                  {t.badge != null && t.badge > 0 && <span style={{ background: '#ecfdf5', color: '#065f46', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 800 }}>{t.badge}</span>}
                </div>
              </TabBtn>
            ))}
          </TabBar>

          <TabContent>
            {tab === 'stok' && (
              <>
                {kritikYemler.length > 0 && (
                  <div style={{
                    background: '#fef3c7', border: '1px solid #fde68a',
                    borderRadius: 10, padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    marginBottom: 14, fontSize: 13
                  }}>
                    <span>⚠️</span>
                    <span style={{ fontWeight: 500, color: '#92400e' }}>
                      {kritikYemler.length} yem kritik seviyede:
                      <strong> {kritikYemler.map(y => y.yemTipi || y.urunAdi || y.ad).join(', ')}</strong>
                    </span>
                  </div>
                )}
                <YemDeposu isEmbedded={true} />
              </>
            )}

            {tab === 'rasyon' && (
              <>
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  {[
                    { key: 'liste', label: 'Rasyonlarım' },
                    { key: 'olustur', label: '+ Yeni Rasyon' },
                    { key: 'ai', label: '🤖 AI Öner' },
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
                {rasyonAlt === 'ai' && <YemDanismani />}
              </>
            )}

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
                ) : gruplar.map(g => {
                  const basCount = gruplarBasCount[g._id] ?? '—';
                  const rasyonAdi = g.rasyonId?.ad || (g.rasyonId && typeof g.rasyonId === 'object' ? g.rasyonId.ad : null);
                  const kgPerBas = g.rasyonId?.icerik?.reduce((s, i) => s + (i.miktar || 0), 0);
                  return (
                  <RCard key={g._id}>
                    <RCardBody>
                      <RHead>
                        <RAd style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 12, height: 12, borderRadius: 4, background: g.renk || '#10b981' }} />
                          {g.ad}
                        </RAd>
                        <RBadge>{basCount !== '—' ? `${basCount} baş` : (g.tip || 'karma')}</RBadge>
                      </RHead>
                      {g.rasyonId ? (
                        <div style={{ fontSize: 12, color: '#16a34a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                          🌿 {rasyonAdi || 'Rasyon atanmış'}
                          {kgPerBas != null && kgPerBas > 0 && <span style={{ color: '#9ca3af', marginLeft: 4 }}>→ {kgPerBas.toFixed(1)} kg/baş/gün</span>}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: '#d97706', marginBottom: 10 }}>⚠️ Rasyon atanmamış — Yemleme hesaplanamaz</div>
                      )}
                      <div style={{
                        borderTop: '1px solid #f3f4f6',
                        paddingTop: 10,
                        marginTop: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, flexShrink: 0 }}>
                          Rasyon:
                        </span>
                        <select
                          value={g.rasyonId?._id || g.rasyonId || ''}
                          onChange={e => handleGrupRasyonGuncelle(g._id, e.target.value || null)}
                          style={{
                            flex: 1,
                            padding: '5px 8px',
                            borderRadius: 7,
                            border: '1px solid #e5e7eb',
                            fontSize: 12,
                            color: g.rasyonId ? '#111827' : '#9ca3af',
                            background: '#fff',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">— Rasyon seç —</option>
                          {rasyonlar.map(r => (
                            <option key={r._id} value={r._id}>
                              {r.ad} ({r.hedefGrup})
                            </option>
                          ))}
                        </select>
                        {g.rasyonId ? (
                          <span style={{ fontSize: 16 }} title="Rasyon atanmış">✅</span>
                        ) : (
                          <span style={{ fontSize: 16 }} title="Rasyon atanmamış">⚠️</span>
                        )}
                      </div>
                    </RCardBody>
                  </RCard>
                );}))}
              </RGrid>
              </>
            )}

            {tab === 'yemleme' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Toplam Grup</div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{yemlemeOzet.toplamGrup}</div>
                  </div>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 11, color: '#166534', marginBottom: 4 }}>Yapılan</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#16a34a' }}>{yemlemeOzet.yapilanGrup}</div>
                  </div>
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 11, color: '#92400e', marginBottom: 4 }}>Bekleyen</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#d97706' }}>{yemlemeOzet.bekleyenGrup}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  {[
                    { key: 'grup', label: 'Grup bazlı' },
                    { key: 'tur', label: 'Tür bazlı' },
                  ].map(m => (
                    <button
                      key={m.key}
                      onClick={() => { setYemlemeMod(m.key); localStorage.setItem('yemleme_mod', m.key); }}
                      style={{
                        padding: '6px 14px', borderRadius: 20, border: '1px solid',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        background: yemlemeMod === m.key ? '#dcfce7' : '#fff',
                        color: yemlemeMod === m.key ? '#166534' : '#6b7280',
                        borderColor: yemlemeMod === m.key ? '#16a34a' : '#e5e7eb',
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <BugunYemlemeCard mod={yemlemeMod} compact={false} />
              </>
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
