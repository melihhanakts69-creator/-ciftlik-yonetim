import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaBox, FaPlus, FaMinus, FaEdit, FaTrash, FaSearch, FaExclamationTriangle, FaTimes, FaThLarge, FaList, FaLeaf, FaPills, FaVial, FaWrench, FaBoxOpen } from 'react-icons/fa';
import * as api from '../services/api';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.5}`;
const shimmer = keyframes`0%{background-position:-200% 0}100%{background-position:200% 0}`;

// ─── Category Config ───────────────────────────────────────────────────────────
const CAT_CONFIG = {
  'Yem':      { color: '#16a34a', bg: '#dcfce7', light: '#f0fdf4', icon: FaLeaf,    emoji: '🌿' },
  'İlaç':     { color: '#dc2626', bg: '#fee2e2', light: '#fef2f2', icon: FaPills,   emoji: '💊' },
  'Vitamin':  { color: '#ea580c', bg: '#ffedd5', light: '#fff7ed', icon: FaVial,    emoji: '💉' },
  'Ekipman':  { color: '#2563eb', bg: '#dbeafe', light: '#eff6ff', icon: FaWrench,  emoji: '🔧' },
  'Diğer':    { color: '#7c3aed', bg: '#ede9fe', light: '#f5f3ff', icon: FaBoxOpen, emoji: '📦' },
};
const getCat = k => CAT_CONFIG[k] || CAT_CONFIG['Diğer'];

// ─── Styled ────────────────────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', system-ui, sans-serif;
  animation: ${fadeIn} .4s ease;
  
  @media(max-width:768px){ background: #f1f5f9; }
`;

const Header = styled.div`
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 24px 16px;
  
  @media(max-width:768px){ padding: 14px 16px 12px; }
`;

const HeaderTop = styled.div`
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  margin-bottom: 0;
`;

const PageTitle = styled.h1`
  font-size: 20px; font-weight: 700; margin: 0;
  color: #111827; display: flex; align-items: center; gap: 10px;
  
  @media(max-width:768px){ font-size: 18px; }
`;

const HeaderActions = styled.div`display: flex; align-items: center; gap: 10px; flex-wrap: wrap;`;

const ToggleViewBtns = styled.div`
  display: flex;
  background: #f4f4f5;
  border: 1px solid #e5e7eb;
  border-radius: 8px; overflow: hidden;
`;

const TVBtn = styled.button`
  display: flex; align-items: center; gap: 5px; padding: 8px 14px;
  border: none; cursor: pointer; font-size: 12px; font-weight: 600; transition: background 0.15s;
  background: ${p => p.$active ? '#e5e7eb' : 'transparent'};
  color: ${p => p.$active ? '#111827' : '#6b7280'};
  &:hover { background: #e4e4e7; }
`;

const AddBtn = styled.button`
  background: #16a34a; color:#fff; border:none;
  padding: 9px 16px; min-height: 48px;
  border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 8px;
  transition: background 0.15s;
  white-space: nowrap;
  &:hover{background:#15803d;}
`;

const StatRow = styled.div`
  display: grid; grid-template-columns: repeat(4,1fr); gap: 12px;
  margin-top: 16px;
  
  @media(max-width:700px){ grid-template-columns: 1fr 1fr; gap: 8px; }
`;

const Stat = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px; padding: 16px;
  
  .val { font-size: 26px; font-weight: 700; color: #111827; line-height: 1; margin-bottom: 4px; }
  .lbl { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: .5px; }
  
  @media(max-width:768px){ padding: 12px; .val{font-size:22px;} }
`;

const Content = styled.div`
  padding: 20px 24px;
  
  @media(max-width:768px){ padding: 14px 12px; }
`;

const FilterBar = styled.div`
  display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; align-items: center;
`;

const SearchWrap = styled.div`
  position: relative; flex: 1; min-width: 180px;
  svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:13px; }
`;

const SearchInput = styled.input`
  width: 100%; padding: 10px 12px 10px 34px;
  border: 1.5px solid #e2e8f0; border-radius: 11px;
  font-size: 14px; background: #fff; outline: none; box-sizing: border-box;
  transition: border-color .2s;
  &:focus { border-color: #4ade80; box-shadow: 0 0 0 3px rgba(74,222,128,.1); }
`;

const CatBtn = styled.button`
  display: flex; align-items: center; gap: 5px;
  padding: 8px 14px; border-radius: 10px; font-size: 12px; font-weight: 700;
  border: 1.5px solid ${p => p.$active ? getCat(p.$k).color : '#e2e8f0'};
  background: ${p => p.$active ? getCat(p.$k).bg : '#fff'};
  color: ${p => p.$active ? getCat(p.$k).color : '#64748b'};
  cursor: pointer; transition: all .15s;
  &:hover { border-color: ${p => getCat(p.$k).color}; background: ${p => getCat(p.$k).light}; }
  
  @media(max-width:480px){ padding: 7px 10px; font-size: 11px; }
`;

const CritBanner = styled.div`
  background: linear-gradient(135deg, #fef2f2, #fff5f5);
  border: 1px solid #fecaca;
  border-left: 4px solid #ef4444;
  border-radius: 12px; padding: 12px 16px;
  display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
  color: #dc2626; font-size: 13px; font-weight: 600;
  svg { font-size:16px; flex-shrink:0; }
`;

const ChartCard = styled.div`
  background: #fff; border-radius: 16px; padding: 18px 20px;
  box-shadow: 0 1px 8px rgba(0,0,0,.06); margin-bottom: 16px;
  border: 1px solid #f1f5f9;
  
  h3 { font-size: 13px; font-weight: 800; color: #475569; text-transform: uppercase;
       letter-spacing: .5px; margin: 0 0 14px; display: flex; align-items: center; gap: 6px; }
`;

// ─── Kare (Card) Görünüm ──────────────────────────────────────────────────────
const Grid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill,minmax(260px,1fr)); gap: 14px;
  
  @media(max-width:768px){ grid-template-columns: repeat(auto-fill,minmax(160px,1fr)); gap: 10px; }
`;

const Card = styled.div`
  background: #fff; border-radius: 18px; overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,.05); transition: all .2s;
  border: 1px solid #f1f5f9;
  border-top: 3px solid ${p => p.$kritik ? '#ef4444' : p.$catColor || '#4ade80'};
  animation: ${fadeIn} .3s ease both;
  
  &:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,.1); }
`;

const CardBody = styled.div`padding: 16px;`;

const CardHead = styled.div`
  display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px;
`;

const CardIconWrap = styled.div`
  width: 38px; height: 38px; border-radius: 11px;
  background: ${p => p.$bg || '#dcfce7'};
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; flex-shrink: 0;
`;

const UrunAdi = styled.div`
  font-size: 15px; font-weight: 800; color: #0f172a;
  margin-bottom: 4px; line-height: 1.2;
`;

const KatBadge = styled.span`
  font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px;
  background: ${p => getCat(p.$kat).bg};
  color: ${p => getCat(p.$kat).color};
`;

const MiktarWrap = styled.div`
  display: flex; align-items: baseline; gap: 4px; margin: 10px 0 6px;
`;

const MiktarVal = styled.span`
  font-size: 30px; font-weight: 900;
  color: ${p => p.$kritik ? '#ef4444' : '#0f172a'};
  ${p => p.$kritik && css`animation: ${pulse} 2s ease infinite;`}
  
  @media(max-width:768px){ font-size: 24px; }
`;

const Birim = styled.span`font-size: 13px; color: #94a3b8; font-weight: 600;`;

const ProgressBar = styled.div`
  height: 5px; background: #f1f5f9; border-radius: 999px;
  margin-bottom: 8px; overflow: hidden;
  div {
    height: 100%; border-radius: 999px; transition: width .5s;
    background: ${p => p.$pct < 30 ? '#ef4444' : p.$pct < 70 ? '#f59e0b' : '#4ade80'};
    width: ${p => Math.min(100, p.$pct)}%;
  }
`;

const KrtikLabel = styled.div`
  font-size: 10px; color: #94a3b8; margin-bottom: 10px;
  display: flex; align-items: center; gap: 4px;
`;

const ActionBtns = styled.div`
  display: flex; gap: 6px; padding-top: 12px;
  border-top: 1px solid #f8fafc;
`;

const AB = styled.button`
  flex: ${p => p.$flex || 1}; padding: 8px 6px; border-radius: 9px; border: none;
  display: flex; align-items: center; justify-content: center; gap: 5px;
  font-size: 12px; font-weight: 700; cursor: pointer; transition: all .15s;
  background: ${p => ({ add:'#dcfce7', sub:'#fee2e2', edit:'#dbeafe', del:'transparent' }[p.$t] || '#f1f5f9')};
  color: ${p => ({ add:'#16a34a', sub:'#dc2626', edit:'#1d4ed8', del:'#cbd5e1' }[p.$t] || '#475569')};
  &:hover { filter: brightness(.9); transform: scale(1.03); }
`;

// ─── Liste Görünüm ────────────────────────────────────────────────────────────
const ListView = styled.div`display: flex; flex-direction: column; gap: 6px;`;

const ListRow = styled.div`
  display: flex; align-items: center; gap: 12px;
  background: #fff; border-radius: 14px;
  padding: 12px 14px;
  box-shadow: 0 1px 5px rgba(0,0,0,.05);
  border: 1px solid #f1f5f9;
  border-left: 4px solid ${p => p.$kritik ? '#ef4444' : p.$catColor || '#4ade80'};
  transition: all .2s; animation: ${fadeIn} .3s ease both;
  
  &:hover { box-shadow: 0 4px 18px rgba(0,0,0,.09); transform: translateX(2px); }
  
  @media(max-width:600px){ flex-wrap: wrap; gap: 8px; }
`;

const ListIconWrap = styled.div`
  width: 40px; height: 40px; border-radius: 11px;
  background: ${p => p.$bg || '#dcfce7'};
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; flex-shrink: 0;
`;

const ListMain = styled.div`flex: 1; min-width: 0;`;

const ListNameRow = styled.div`
  display: flex; align-items: center; gap: 6px; margin-bottom: 5px; flex-wrap: wrap;
`;

const ListName = styled.span`
  font-size: 14px; font-weight: 800; color: #0f172a;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 160px;
`;

const ListMetaRow = styled.div`
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
`;

const ListStock = styled.div`
  display: flex; align-items: baseline; gap: 3px; min-width: 70px;
  .v { font-size: 18px; font-weight: 900; color: ${p => p.$kritik ? '#ef4444' : '#0f172a'}; line-height: 1; }
  .u { font-size: 11px; color: #94a3b8; font-weight: 600; }
`;

const ListProgress = styled.div`
  flex: 1; height: 5px; background: #f1f5f9; border-radius: 999px; overflow: hidden;
  min-width: 60px; max-width: 160px;
  div {
    height: 100%; border-radius: 999px;
    background: ${p => p.$pct < 30 ? '#ef4444' : p.$pct < 70 ? '#f59e0b' : '#4ade80'};
    width: ${p => Math.min(100, p.$pct)}%;
  }
`;

const ListMinLabel = styled.span`
  font-size: 10px; color: #94a3b8; white-space: nowrap;
`;

const ListActions = styled.div`
  display: flex; gap: 5px; flex-shrink: 0;
  
  @media(max-width:600px){ width: 100%; justify-content: flex-end; }
`;

const ListAB = styled.button`
  width: 32px; height: 32px; border-radius: 8px; border: none;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; cursor: pointer; transition: all .15s;
  background: ${p => ({ add:'#dcfce7', sub:'#fee2e2', edit:'#dbeafe', del:'#f8fafc' }[p.$t] || '#f1f5f9')};
  color: ${p => ({ add:'#16a34a', sub:'#dc2626', edit:'#1d4ed8', del:'#94a3b8' }[p.$t] || '#475569')};
  &:hover { filter: brightness(.9); transform: scale(1.08); }
`;

// ─── Modal ────────────────────────────────────────────────────────────────────
const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(15,23,42,.65);
  backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
`;

const Modal = styled.div`
  background: #fff; border-radius: 22px; padding: 28px;
  width: 100%; max-width: 500px;
  box-shadow: 0 24px 60px rgba(0,0,0,.25); animation: ${fadeIn} .25s ease;
  
  @media(max-width:480px){ padding: 20px 16px; border-radius: 18px; }
`;

const ModalTitle = styled.div`
  font-size: 17px; font-weight: 900; color: #0f172a;
  margin-bottom: 22px; display: flex; align-items: center; justify-content: space-between;
`;

const CloseBtn = styled.button`
  background: #f1f5f9; border: none; color: #64748b; font-size: 14px;
  cursor: pointer; width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: #fee2e2; color: #ef4444; }
`;

const FGrid = styled.div`
  display: grid; grid-template-columns: ${p => p.$cols || '1fr 1fr'}; gap: 12px; margin-bottom: 12px;
  @media(max-width:400px){ grid-template-columns: 1fr; }
`;

const FG = styled.div``;
const Lbl = styled.label`
  font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;
  letter-spacing: .5px; display: block; margin-bottom: 4px;
`;

const Inp = styled.input`
  width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 14px; outline: none; box-sizing: border-box; transition: border-color .2s;
  &:focus { border-color: #4ade80; box-shadow: 0 0 0 3px rgba(74,222,128,.1); }
`;

const Sel = styled.select`
  width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 14px; outline: none; background: #fff; box-sizing: border-box;
  &:focus { border-color: #4ade80; }
`;

const TextA = styled.textarea`
  width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 14px; outline: none; resize: vertical; box-sizing: border-box; font-family: inherit;
  &:focus { border-color: #4ade80; }
`;

const ModalBtns = styled.div`
  display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px;
`;

const CancelBtn = styled.button`
  padding: 10px 20px; border: 1.5px solid #e2e8f0; border-radius: 10px;
  background: #fff; color: #64748b; font-weight: 700; cursor: pointer;
  &:hover { background: #f8fafc; }
`;

const SaveBtn = styled.button`
  padding: 10px 22px; border: none; border-radius: 10px;
  background: linear-gradient(135deg,#4ade80,#16a34a); color: #fff;
  font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px;
  &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(74,222,128,.4); }
`;

const EmptyState = styled.div`
  text-align: center; padding: 50px 20px; color: #94a3b8;
  font-size: 14px; display: flex; flex-direction: column; align-items: center; gap: 8px;
  .icon { font-size: 40px; opacity: .4; }
`;

// ─── Constants ────────────────────────────────────────────────────────────────
const CATS = ['Yem', 'İlaç', 'Vitamin', 'Ekipman', 'Diğer'];
const PIE_COLORS = ['#16a34a', '#dc2626', '#ea580c', '#2563eb', '#7c3aed'];
const EMPTY = { urunAdi: '', kategori: 'Diğer', miktar: 0, birim: 'adet', kritikSeviye: 10, notlar: '' };

// ─── Component ────────────────────────────────────────────────────────────────
export default function StokYonetimi() {
  const [stoklar, setStoklar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [catFilter, setCatFilter] = useState('Tümü');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [viewMode, setViewMode] = useState(window.innerWidth < 768 ? 'liste' : 'kare');
  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const r = await api.getStoklar(); setStoklar(r.data); }
    catch { toast.error('Stok verileri yüklenemedi'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editing) await api.updateStok(editing._id, { ...form, islem: 'guncelle' });
      else await api.createStok(form);
      toast.success(editing ? 'Stok güncellendi' : 'Yeni stok eklendi');
      setShowModal(false); setEditing(null); setForm(EMPTY); load();
    } catch { toast.error('İşlem başarısız'); }
  };

  const quickUpdate = async (id, type, amt) => {
    try { await api.updateStok(id, { miktar: amt, islem: type }); load(); }
    catch { toast.error('Güncelleme hatası'); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Bu stoğu silmek istediğinize emin misiniz?')) return;
    try { await api.deleteStok(id); toast.success('Silindi'); load(); }
    catch { toast.error('Silme hatası'); }
  };

  const openEdit = item => {
    setEditing(item);
    setForm({ urunAdi: item.urunAdi, kategori: item.kategori, miktar: item.miktar, birim: item.birim, kritikSeviye: item.kritikSeviye, notlar: item.notlar || '' });
    setShowModal(true);
  };
  const openNew = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };

  const filtered = stoklar.filter(s =>
    s.urunAdi.toLowerCase().includes(filter.toLowerCase()) &&
    (catFilter === 'Tümü' || s.kategori === catFilter)
  );

  const kritikler = stoklar.filter(s => s.miktar <= s.kritikSeviye);
  const pieData = CATS.map((c, i) => ({ name: c, value: stoklar.filter(s => s.kategori === c).length, fill: PIE_COLORS[i] })).filter(d => d.value > 0);

  return (
    <Page>
      {/* ── Header ────────────────────────────────────────────── */}
      <Header>
        <HeaderTop>
          <PageTitle>📦 Stok Yönetimi</PageTitle>
          <HeaderActions>
            <ToggleViewBtns>
              <TVBtn $active={viewMode === 'kare'} onClick={() => setViewMode('kare')}>
                <FaThLarge size={11} /> Kare
              </TVBtn>
              <TVBtn $active={viewMode === 'liste'} onClick={() => setViewMode('liste')}>
                <FaList size={11} /> Liste
              </TVBtn>
            </ToggleViewBtns>
            <AddBtn onClick={openNew}><FaPlus /> Yeni Stok</AddBtn>
          </HeaderActions>
        </HeaderTop>

        <StatRow>
          <Stat $accent="#4ade80">
            <div className="val">{stoklar.length}</div>
            <div className="lbl">Toplam Ürün</div>
          </Stat>
          <Stat $accent="#f87171">
            <div className="val">{kritikler.length}</div>
            <div className="lbl">Kritik Stok</div>
          </Stat>
          <Stat $accent="#fb923c">
            <div className="val">{CATS.filter(c => stoklar.some(s => s.kategori === c)).length}</div>
            <div className="lbl">Kategori</div>
          </Stat>
          <Stat $accent="#60a5fa">
            <div className="val">{stoklar.filter(s => s.miktar > s.kritikSeviye).length}</div>
            <div className="lbl">Yeterli</div>
          </Stat>
        </StatRow>
      </Header>

      <Content>
        {/* ── Kritik uyarı ──────────────────────────────────────── */}
        {kritikler.length > 0 && (
          <CritBanner>
            <FaExclamationTriangle />
            <div>
              <strong>{kritikler.length} ürün</strong> kritik seviyenin altında:{' '}
              {kritikler.map(k => k.urunAdi).join(', ')}
            </div>
          </CritBanner>
        )}

        {/* ── Kategori pie ───────────────────────────────────────── */}
        {pieData.length > 0 && (
          <ChartCard>
            <h3>📊 Kategori Dağılımı</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={45} outerRadius={65} paddingAngle={4}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} ürün`, n]} />
                <Legend iconType="circle" iconSize={9} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* ── Filtreler ──────────────────────────────────────────── */}
        <FilterBar>
          <SearchWrap>
            <FaSearch />
            <SearchInput value={filter} onChange={e => setFilter(e.target.value)} placeholder="Ürün ara..." />
          </SearchWrap>
          {['Tümü', ...CATS].map(c => (
            <CatBtn key={c} $active={catFilter === c} $k={c === 'Tümü' ? 'Diğer' : c}
              onClick={() => setCatFilter(c)}>
              {c === 'Tümü' ? '🔷 Tümü' : `${getCat(c).emoji} ${c}`}
            </CatBtn>
          ))}
        </FilterBar>

        {/* ── İçerik ────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 50, color: '#94a3b8', fontSize: 14 }}>Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <EmptyState>
            <div className="icon">📦</div>
            <div>Ürün bulunamadı</div>
          </EmptyState>
        ) : viewMode === 'kare' ? (
          // ── Kare Görünüm ─────────────────────────────────────
          <Grid>
            {filtered.map(item => {
              const pct = item.kritikSeviye > 0 ? (item.miktar / item.kritikSeviye) * 100 : 100;
              const kritik = item.miktar <= item.kritikSeviye;
              const cat = getCat(item.kategori);
              const Ico = cat.icon;
              return (
                <Card key={item._id} $kritik={kritik} $catColor={cat.color}>
                  <CardBody>
                    <CardHead>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <UrunAdi>{item.urunAdi}</UrunAdi>
                        <KatBadge $kat={item.kategori}>{cat.emoji} {item.kategori}</KatBadge>
                      </div>
                      <CardIconWrap $bg={kritik ? '#fee2e2' : cat.bg}>
                        {kritik ? '⚠️' : cat.emoji}
                      </CardIconWrap>
                    </CardHead>

                    <MiktarWrap>
                      <MiktarVal $kritik={kritik}>{item.miktar}</MiktarVal>
                      <Birim>{item.birim}</Birim>
                    </MiktarWrap>

                    <ProgressBar $pct={pct}><div /></ProgressBar>
                    <KrtikLabel>
                      Min: {item.kritikSeviye} {item.birim}
                      {item.notlar && <> · <em style={{fontStyle:'italic'}}>{item.notlar.slice(0,20)}{item.notlar.length > 20 ? '…' : ''}</em></>}
                    </KrtikLabel>

                    <ActionBtns>
                      <AB $t="sub" onClick={() => quickUpdate(item._id, 'cikar', 1)}><FaMinus size={10} /></AB>
                      <AB $t="add" onClick={() => quickUpdate(item._id, 'ekle', 1)}><FaPlus size={10} /></AB>
                      <AB $t="edit" $flex={2} onClick={() => openEdit(item)}><FaEdit size={10} /> Düzenle</AB>
                      <AB $t="del" $flex={.6} onClick={() => handleDelete(item._id)}><FaTrash size={10} /></AB>
                    </ActionBtns>
                  </CardBody>
                </Card>
              );
            })}
          </Grid>
        ) : (
          // ── Liste Görünüm ─────────────────────────────────────
          <ListView>
            {filtered.map(item => {
              const pct = item.kritikSeviye > 0 ? (item.miktar / item.kritikSeviye) * 100 : 100;
              const kritik = item.miktar <= item.kritikSeviye;
              const cat = getCat(item.kategori);
              return (
                <ListRow key={item._id} $kritik={kritik} $catColor={cat.color}>
                  <ListIconWrap $bg={kritik ? '#fee2e2' : cat.bg}>
                    {kritik ? '⚠️' : cat.emoji}
                  </ListIconWrap>

                  <ListMain>
                    <ListNameRow>
                      <ListName>{item.urunAdi}</ListName>
                      <KatBadge $kat={item.kategori}>{item.kategori}</KatBadge>
                      {kritik && <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 700, background: '#fee2e2', padding: '1px 6px', borderRadius: 999 }}>KRİTİK</span>}
                    </ListNameRow>
                    <ListMetaRow>
                      <ListStock $kritik={kritik}>
                        <span className="v">{item.miktar}</span>
                        <span className="u">{item.birim}</span>
                      </ListStock>
                      <ListProgress $pct={pct}><div /></ListProgress>
                      <ListMinLabel>Min: {item.kritikSeviye} {item.birim}</ListMinLabel>
                    </ListMetaRow>
                  </ListMain>

                  <ListActions>
                    <ListAB $t="sub" title="Çıkar" onClick={() => quickUpdate(item._id, 'cikar', 1)}><FaMinus size={11} /></ListAB>
                    <ListAB $t="add" title="Ekle" onClick={() => quickUpdate(item._id, 'ekle', 1)}><FaPlus size={11} /></ListAB>
                    <ListAB $t="edit" title="Düzenle" onClick={() => openEdit(item)}><FaEdit size={11} /></ListAB>
                    <ListAB $t="del" title="Sil" onClick={() => handleDelete(item._id)}><FaTrash size={11} /></ListAB>
                  </ListActions>
                </ListRow>
              );
            })}
          </ListView>
        )}
      </Content>

      {/* ── Modal ────────────────────────────────────────────────── */}
      {showModal && (
        <Overlay onClick={() => setShowModal(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalTitle>
              {editing ? '📝 Stok Düzenle' : '📦 Yeni Stok Ekle'}
              <CloseBtn onClick={() => setShowModal(false)}><FaTimes /></CloseBtn>
            </ModalTitle>
            <form onSubmit={handleSubmit}>
              <FGrid $cols="1fr">
                <FG><Lbl>Ürün Adı *</Lbl><Inp required value={form.urunAdi} onChange={upd('urunAdi')} placeholder="örn: Penisilin Şurup" /></FG>
              </FGrid>
              <FGrid>
                <FG><Lbl>Kategori</Lbl>
                  <Sel value={form.kategori} onChange={upd('kategori')}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </Sel>
                </FG>
                <FG><Lbl>Birim</Lbl>
                  <Sel value={form.birim} onChange={upd('birim')}>
                    {['adet', 'kg', 'lt', 'kutu', 'doz', 'torba'].map(b => <option key={b}>{b}</option>)}
                  </Sel>
                </FG>
              </FGrid>
              <FGrid>
                <FG><Lbl>Mevcut Miktar *</Lbl><Inp type="number" required min="0" step=".1" value={form.miktar} onChange={e => setForm(p => ({ ...p, miktar: Number(e.target.value) }))} /></FG>
                <FG><Lbl>Kritik Seviye</Lbl><Inp type="number" required min="0" value={form.kritikSeviye} onChange={e => setForm(p => ({ ...p, kritikSeviye: Number(e.target.value) }))} /></FG>
              </FGrid>
              <FG><Lbl>Notlar</Lbl><TextA rows={3} value={form.notlar} onChange={upd('notlar')} placeholder="Ek açıklamalar..." /></FG>
              <ModalBtns>
                <CancelBtn type="button" onClick={() => setShowModal(false)}>İptal</CancelBtn>
                <SaveBtn type="submit">💾 Kaydet</SaveBtn>
              </ModalBtns>
            </form>
          </Modal>
        </Overlay>
      )}
    </Page>
  );
}
