import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { toast } from 'react-toastify';
import { FaPlus, FaPills, FaTrash, FaEdit, FaBriefcaseMedical } from 'react-icons/fa';
import { GiSpotedFlower } from 'react-icons/gi';
import * as api from '../services/api';

const fadeIn = keyframes`from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}`;

const PageContainer = styled.div`
  animation: ${fadeIn} 0.4s ease;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  min-height: calc(100vh - 70px);
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background: #f8fafc;
`;

// ─── Tab Navigation ───────────────────────────────────────────────────────────
const TabRow = styled.div`
  display: flex;
  gap: 0;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 6px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;
const Tab = styled.button`
  flex: 1;
  padding: 11px 16px;
  border-radius: 10px;
  border: none;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  background: ${p => p.$active ? 'linear-gradient(135deg,#10b981,#059669)' : 'transparent'};
  color: ${p => p.$active ? '#fff' : '#64748b'};
  box-shadow: ${p => p.$active ? '0 4px 12px rgba(16,185,129,0.25)' : 'none'};

  &:hover:not([data-active="true"]) { background: #f1f5f9; color: #0f172a; }
`;

// ─── Shared ───────────────────────────────────────────────────────────────────
const Header = styled.header`
  margin-bottom: 20px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: ''; position: absolute; top: 0; left: 0; width: 5px; height: 100%;
    background: linear-gradient(180deg,#10b981,#3b82f6);
    border-radius: 10px 0 0 10px;
  }

  h1 { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; }
  p { font-size: 13px; color: #64748b; margin-top: 4px; }
  .btn-add {
    background: linear-gradient(135deg,#10b981,#059669); color: #fff;
    border: none; padding: 10px 20px; border-radius: 10px;
    font-size: 13px; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; gap: 6px;
    transition: all 0.2s; white-space: nowrap;
    box-shadow: 0 4px 12px rgba(16,185,129,0.25);
  }
  .btn-add:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(16,185,129,0.35); }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(240px,1fr));
  gap: 14px;
  margin-bottom: 20px;
`;
const StatCard = styled.div`
  background: #fff; border-radius: 14px; padding: 18px 20px;
  border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: all 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.07); }
  .icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .val { font-size: 26px; font-weight: 900; color: #0f172a; line-height: 1; }
  .lbl { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 3px; }
`;

const Card = styled.div`
  background: #fff; border-radius: 16px; padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;
`;

const Table = styled.table`
  width: 100%; border-collapse: separate; border-spacing: 0; text-align: left;
  th {
    background: #f8fafc; color: #475569;
    font-size: 11px; font-weight: 800; text-transform: uppercase;
    padding: 13px 18px; border-bottom: 2px solid #e2e8f0; letter-spacing: 0.08em;
  }
  td { padding: 14px 18px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; }
  tbody tr:hover td { background: #f8fafc; }
  tbody tr:last-child td { border-bottom: none; }
  .badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
  .bg-blue { background: #e0f2fe; color: #0284c7; }
  .bg-green { background: #dcfce7; color: #16a34a; }
  .bg-orange { background: #ffedd5; color: #ea580c; }
  .actions button {
    background: none; border: none; cursor: pointer; color: #94a3b8;
    font-size: 16px; margin-right: 12px; transition: all 0.15s;
    padding: 4px;
  }
  .actions button:hover { color: #3b82f6; transform: scale(1.15); }
`;

// ─── Dijital Bagaj ────────────────────────────────────────────────────────────
const BagajHeader = styled.div`
  display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
  .bh-title { font-size: 18px; font-weight: 900; color: #0f172a; }
  .bh-sub   { font-size: 13px; color: #64748b; margin-top: 2px; }
  .bh-badge {
    margin-left: auto; background: #7c3aed; color: #fff;
    padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800;
    white-space: nowrap;
  }
`;

const BagajGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
`;

const BagajItem = styled.div`
  background: ${p => p.$kritik ? '#fef2f2' : p.$az ? '#fffbeb' : '#fff'};
  border: 1.5px solid ${p => p.$kritik ? '#fecaca' : p.$az ? '#fde68a' : '#e2e8f0'};
  border-radius: 14px;
  padding: 16px;
  position: relative;
  transition: all 0.2s;
  &:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.06); }

  .bi-kat  { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
  .bi-isim { font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
  .bi-warn { font-size: 10px; font-weight: 700;
    color: ${p => p.$kritik ? '#dc2626' : '#d97706'};
    margin-bottom: 8px;
  }

  .bi-ctrl {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
  }
  .bi-btn {
    width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid #e2e8f0;
    background: #f8fafc; font-size: 18px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.15s; line-height: 1; color: #374151;
    &:hover { background: #e2e8f0; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  }
  .bi-miktar {
    flex: 1; text-align: center;
    font-size: 20px; font-weight: 900; color: #0f172a;
  }
  .bi-birim { font-size: 11px; color: #64748b; font-weight: 600; }

  .bi-dus-btn {
    width: 100%; margin-top: 10px; padding: 7px;
    border-radius: 8px; border: 1.5px dashed #e2e8f0;
    background: transparent; font-size: 12px; font-weight: 700;
    color: #64748b; cursor: pointer; transition: all 0.15s;
    &:hover { border-color: #7c3aed; color: #7c3aed; background: #f5f3ff; }
  }

  .bi-stok-uyari {
    position: absolute; top: 10px; right: 10px;
    width: 22px; height: 22px; border-radius: 50%;
    background: ${p => p.$kritik ? '#ef4444' : '#f59e0b'};
    color: #fff; font-size: 11px; font-weight: 900;
    display: flex; align-items: center; justify-content: center;
  }
`;

const BagajEkleRow = styled.div`
  margin-top: 16px;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1.5px dashed #cbd5e1;
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;

  select { flex: 1; min-width: 180px; padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; background: #fff; }
  input  { width: 80px; padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; }
  select:focus, input:focus { outline: none; border-color: #7c3aed; }
  .ekle-btn {
    padding: 9px 18px; border-radius: 8px; border: none;
    background: #7c3aed; color: #fff; font-size: 13px; font-weight: 700;
    cursor: pointer; white-space: nowrap; transition: all 0.15s;
    &:hover { background: #6d28d9; }
  }
`;

const DusModal = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
  .dm-box {
    background: #fff; border-radius: 16px; padding: 24px;
    max-width: 360px; width: 100%;
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  }
  h3 { margin: 0 0 16px; font-size: 16px; font-weight: 800; color: #0f172a; }
  p  { margin: 0 0 14px; font-size: 13px; color: #64748b; }
  .dm-input {
    width: 100%; padding: 12px 14px; border: 1.5px solid #e2e8f0;
    border-radius: 10px; font-size: 15px; font-weight: 700; box-sizing: border-box;
    margin-bottom: 14px;
    &:focus { outline: none; border-color: #7c3aed; }
  }
  .dm-btns { display: flex; gap: 10px; }
  .dm-ok {
    flex: 2; padding: 12px; border-radius: 10px; border: none;
    background: #7c3aed; color: #fff; font-size: 14px; font-weight: 700;
    cursor: pointer;
    &:hover { background: #6d28d9; }
  }
  .dm-cancel {
    flex: 1; padding: 12px; border-radius: 10px;
    border: 1px solid #e2e8f0; background: #f8fafc;
    color: #64748b; font-size: 14px; font-weight: 700; cursor: pointer;
  }
`;

// ─── Stok Modal ───────────────────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(15,23,42,0.4);
  backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 1000;
`;
const ModalBox = styled.div`
  background: #fff; width: 90%; max-width: 500px; border-radius: 20px; padding: 28px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  h2 { margin: 0 0 20px; font-size: 20px; color: #0f172a; font-weight: 900; }
  .form-group { margin-bottom: 16px; }
  .form-group label { display: block; font-size: 11px; font-weight: 800; color: #475569; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
  .form-group input, .form-group select {
    width: 100%; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
    font-size: 14px; outline: none; box-sizing: border-box; background: #f8fafc;
    &:focus { border-color: #3b82f6; background: #fff; }
  }
  .row { display: grid; grid-template-columns: 2fr 1fr; gap: 10px; }
  .buttons { display: flex; gap: 10px; margin-top: 20px; }
  .btn-submit { flex: 2; background: linear-gradient(135deg,#10b981,#059669); color: #fff; border: none; padding: 14px; border-radius: 10px; font-weight: 800; font-size: 14px; cursor: pointer; }
  .btn-cancel { flex: 1; background: #f1f5f9; color: #64748b; border: none; padding: 14px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; }
`;

// ─── localStorage bagaj helpers ───────────────────────────────────────────────
const BAGAJ_KEY = 'vet_bagaj_v1';
const loadBagaj = () => { try { return JSON.parse(localStorage.getItem(BAGAJ_KEY) || '{}'); } catch { return {}; } };
const saveBagaj = (data) => localStorage.setItem(BAGAJ_KEY, JSON.stringify(data));

// ─── Component ────────────────────────────────────────────────────────────────
export default function VeterinerStok() {
  const [stoklar, setStoklar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ urunAdi: '', kategori: 'İlaç', miktar: '', birim: 'kutu', kritikSeviye: 5 });
  const [aktifTab, setAktifTab] = useState('stok'); // 'stok' | 'bagaj'

  // Bagaj state (localStorage)
  const [bagaj, setBagaj] = useState(loadBagaj);

  // Bagaj ekle formu
  const [bagajEkleStok, setBagajEkleStok] = useState('');
  const [bagajEkleMiktar, setBagajEkleMiktar] = useState('');

  // Manuel düş modal
  const [dusModal, setDusModal] = useState(null); // { stokId, stokAdi, birim }
  const [dusMiktar, setDusMiktar] = useState('');

  const fetchStok = useCallback(async () => {
    try {
      const res = await api.getStoklar();
      const items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setStoklar((items || []).filter(s => s.kategori !== 'Yem'));
    } catch (e) {
      console.error('Stok çekilemedi', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStok(); }, [fetchStok]);

  // Bagaj kaydet
  const bagajGuncelle = (newBagaj) => {
    setBagaj(newBagaj);
    saveBagaj(newBagaj);
  };

  const handleBagajEkle = () => {
    if (!bagajEkleStok || !bagajEkleMiktar) { toast.warning('Ürün ve miktar seçin.'); return; }
    const miktar = Number(bagajEkleMiktar);
    if (!(miktar > 0)) { toast.warning('Geçerli miktar girin.'); return; }
    const s = stoklar.find(x => x._id === bagajEkleStok);
    if (!s) return;
    const newBagaj = { ...bagaj, [bagajEkleStok]: { miktar: (bagaj[bagajEkleStok]?.miktar || 0) + miktar, stokAdi: s.urunAdi, birim: s.birim, kritikSeviye: s.kritikSeviye || 5 } };
    bagajGuncelle(newBagaj);
    setBagajEkleStok('');
    setBagajEkleMiktar('');
    toast.success(`${s.urunAdi} bagaja eklendi: ${newBagaj[bagajEkleStok].miktar} ${s.birim}`);
  };

  const handleBagajArtir = (stokId) => {
    const entry = bagaj[stokId];
    if (!entry) return;
    const newBagaj = { ...bagaj, [stokId]: { ...entry, miktar: entry.miktar + 1 } };
    bagajGuncelle(newBagaj);
  };

  const handleBagajAzalt = (stokId) => {
    const entry = bagaj[stokId];
    if (!entry || entry.miktar <= 0) return;
    const newMiktar = entry.miktar - 1;
    const newBagaj = newMiktar === 0
      ? Object.fromEntries(Object.entries(bagaj).filter(([k]) => k !== stokId))
      : { ...bagaj, [stokId]: { ...entry, miktar: newMiktar } };
    bagajGuncelle(newBagaj);
  };

  const handleBagajSil = (stokId) => {
    const newBagaj = Object.fromEntries(Object.entries(bagaj).filter(([k]) => k !== stokId));
    bagajGuncelle(newBagaj);
  };

  const openDusModal = (stokId, entry) => {
    setDusModal({ stokId, stokAdi: entry.stokAdi, birim: entry.birim });
    setDusMiktar('');
  };

  const handleDus = () => {
    if (!dusModal) return;
    const miktar = Number(dusMiktar);
    if (!(miktar > 0)) { toast.warning('Geçerli miktar girin.'); return; }
    const entry = bagaj[dusModal.stokId];
    if (!entry) return;
    const newMiktar = Math.max(0, entry.miktar - miktar);
    let newBagaj;
    if (newMiktar === 0) {
      newBagaj = Object.fromEntries(Object.entries(bagaj).filter(([k]) => k !== dusModal.stokId));
      toast.info(`${entry.stokAdi} bagajdan tükendi.`);
    } else {
      newBagaj = { ...bagaj, [dusModal.stokId]: { ...entry, miktar: newMiktar } };
      toast.success(`${miktar} ${entry.birim} düşüldü. Bagajda kalan: ${newMiktar} ${entry.birim}`);
      if (newMiktar <= entry.kritikSeviye) {
        toast.warning(`⚠️ ${entry.stokAdi}: Bagajda sadece ${newMiktar} ${entry.birim} kaldı! Toptancıyı ara.`, { autoClose: 6000 });
      }
    }
    bagajGuncelle(newBagaj);
    setDusModal(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.createStok({ ...form, miktar: Number(form.miktar), kritikSeviye: Number(form.kritikSeviye) });
      toast.success('Stok kaydedildi.');
      setModalOpen(false);
      fetchStok();
    } catch { toast.error('Kaydedilirken hata oluştu.'); }
  };

  const getKatBadgeClass = (kat) => {
    if (kat === 'İlaç') return 'bg-blue';
    if (kat === 'Vitamin' || kat === 'Tohum') return 'bg-green';
    return 'bg-orange';
  };

  const bagajItems = Object.entries(bagaj);
  const bagajKritik = bagajItems.filter(([, e]) => e.miktar <= e.kritikSeviye);

  return (
    <PageContainer>
      <Header>
        <div>
          <h1>Reçete, Stok & Dijital Bagaj</h1>
          <p>Klinik depo stoğunuzu ve araç bagajınızı buradan takip edin.</p>
        </div>
        <button className="btn-add" onClick={() => { setForm({ urunAdi: '', kategori: 'İlaç', miktar: '', birim: 'kutu', kritikSeviye: 5 }); setModalOpen(true); }}>
          <FaPlus /> Ürün Ekle
        </button>
      </Header>

      {/* İstatistikler */}
      <StatsGrid>
        <StatCard>
          <div className="icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><FaPills /></div>
          <div>
            <div className="val">{stoklar.filter(s => s.kategori === 'İlaç').length}</div>
            <div className="lbl">Aktif İlaç</div>
          </div>
        </StatCard>
        <StatCard>
          <div className="icon" style={{ background: '#dcfce7', color: '#16a34a' }}><GiSpotedFlower /></div>
          <div>
            <div className="val">{stoklar.filter(s => s.kategori === 'Tohum').reduce((a, b) => a + b.miktar, 0)}</div>
            <div className="lbl">Toplam Tohum / Sperma</div>
          </div>
        </StatCard>
        <StatCard>
          <div className="icon" style={{ background: '#fee2e2', color: '#dc2626' }}><FaTrash /></div>
          <div>
            <div className="val">{stoklar.filter(s => s.miktar <= s.kritikSeviye).length}</div>
            <div className="lbl">Kritik Stok</div>
          </div>
        </StatCard>
        <StatCard style={{ borderColor: bagajKritik.length > 0 ? '#fde68a' : '#e2e8f0', background: bagajKritik.length > 0 ? '#fffbeb' : '#fff' }}>
          <div className="icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><FaBriefcaseMedical /></div>
          <div>
            <div className="val">{bagajItems.length}</div>
            <div className="lbl">Bagajda Ürün {bagajKritik.length > 0 && `· ⚠️ ${bagajKritik.length} az`}</div>
          </div>
        </StatCard>
      </StatsGrid>

      {/* Tab Navigation */}
      <TabRow>
        <Tab $active={aktifTab === 'stok'} onClick={() => setAktifTab('stok')}>
          💊 Klinik Stok Deposu
        </Tab>
        <Tab $active={aktifTab === 'bagaj'} onClick={() => setAktifTab('bagaj')}>
          🎒 Dijital Bagaj — Araç Stoğu
        </Tab>
      </TabRow>

      {/* ─── STOK TABLOSU ─── */}
      {aktifTab === 'stok' && (
        <Card>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Yükleniyor…</div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Ürün Adı</th>
                  <th>Kategori</th>
                  <th>Mevcut Miktar</th>
                  <th>Kritik Seviye</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {stoklar.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>Henüz ürün eklenmemiş.</td></tr>
                ) : stoklar.map(s => (
                  <tr key={s._id}>
                    <td><strong>{s.urunAdi}</strong></td>
                    <td><span className={`badge ${getKatBadgeClass(s.kategori)}`}>{s.kategori}</span></td>
                    <td style={{ color: s.miktar <= s.kritikSeviye ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                      {s.miktar} {s.birim}
                    </td>
                    <td style={{ color: '#64748b' }}>{s.kritikSeviye} {s.birim}</td>
                    <td className="actions">
                      <button title="Düzenle"><FaEdit /></button>
                      <button title="Sil" style={{ color: '#ef4444' }}><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}

      {/* ─── DİJİTAL BAGAJ ─── */}
      {aktifTab === 'bagaj' && (
        <Card>
          <BagajHeader>
            <div style={{ fontSize: 28 }}>🎒</div>
            <div>
              <div className="bh-title">Dijital Bagaj</div>
              <div className="bh-sub">
                Araç stoğunuzu buradan takip edin. İşlem yaptığınızda düş, azaldığında bildirim alın.
              </div>
            </div>
            {bagajKritik.length > 0 && (
              <div className="bh-badge">⚠️ {bagajKritik.length} ürün az kaldı</div>
            )}
          </BagajHeader>

          {/* Stoktan Bagaja Ekle */}
          <BagajEkleRow>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>+ Stoktan ekle:</span>
            <select
              value={bagajEkleStok}
              onChange={e => setBagajEkleStok(e.target.value)}
            >
              <option value="">— Ürün seç —</option>
              {stoklar.map(s => (
                <option key={s._id} value={s._id}>{s.urunAdi} ({s.miktar} {s.birim})</option>
              ))}
            </select>
            <input
              type="number" min="1" placeholder="Miktar"
              value={bagajEkleMiktar}
              onChange={e => setBagajEkleMiktar(e.target.value)}
            />
            <button className="ekle-btn" onClick={handleBagajEkle}>Bagaja Ekle</button>
          </BagajEkleRow>

          {bagajItems.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
              Bagaj boş. Yukarıdan stok seçip ekleyin.
            </div>
          ) : (
            <BagajGrid style={{ marginTop: 16 }}>
              {bagajItems.map(([stokId, entry]) => {
                const kritik = entry.miktar <= 0;
                const az = !kritik && entry.miktar <= entry.kritikSeviye;
                return (
                  <BagajItem key={stokId} $kritik={kritik} $az={az}>
                    {(kritik || az) && (
                      <div className="bi-stok-uyari">!</div>
                    )}
                    <div className="bi-kat">Bagaj</div>
                    <div className="bi-isim">{entry.stokAdi}</div>
                    {kritik && <div className="bi-warn">🔴 Tükendi — toptancıyı ara!</div>}
                    {az && !kritik && <div className="bi-warn">⚠️ Azalıyor ({entry.miktar} {entry.birim})</div>}
                    <div className="bi-ctrl">
                      <button
                        className="bi-btn"
                        onClick={() => handleBagajAzalt(stokId)}
                        disabled={entry.miktar <= 0}
                      >−</button>
                      <div>
                        <div className="bi-miktar">{entry.miktar}</div>
                        <div className="bi-birim">{entry.birim}</div>
                      </div>
                      <button className="bi-btn" onClick={() => handleBagajArtir(stokId)}>+</button>
                    </div>
                    <button className="bi-dus-btn" onClick={() => openDusModal(stokId, entry)}>
                      📋 Kullanım kaydet (Düş)
                    </button>
                  </BagajItem>
                );
              })}
            </BagajGrid>
          )}
        </Card>
      )}

      {/* Düş Modal */}
      {dusModal && (
        <DusModal onClick={() => setDusModal(null)}>
          <div className="dm-box" onClick={e => e.stopPropagation()}>
            <h3>📋 Kullanım Kaydet</h3>
            <p>
              <strong>{dusModal.stokAdi}</strong> — Kaç {dusModal.birim} kullandınız?
              Bagajdan otomatik düşülecek.
            </p>
            <input
              className="dm-input"
              type="number" min="1"
              placeholder={`Kullanılan ${dusModal.birim} sayısı`}
              value={dusMiktar}
              onChange={e => setDusMiktar(e.target.value)}
              autoFocus
            />
            <div className="dm-btns">
              <button className="dm-ok" onClick={handleDus}>Düş</button>
              <button className="dm-cancel" onClick={() => setDusModal(null)}>İptal</button>
            </div>
          </div>
        </DusModal>
      )}

      {/* Stok Ekleme Modal */}
      {modalOpen && (
        <ModalOverlay onClick={() => setModalOpen(false)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <h2>Stok Kalemi Ekle</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Ürün / Tohum Adı</label>
                <input required value={form.urunAdi} onChange={e => setForm({ ...form, urunAdi: e.target.value })} placeholder="Örn: Holstein Sperma, Şap Aşısı" />
              </div>
              <div className="form-group">
                <label>Kategori</label>
                <select value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}>
                  <option value="İlaç">İlaç & Antibiyotik</option>
                  <option value="Vitamin">Vitamin & Mineral</option>
                  <option value="Tohum">Suni Tohum / Sperma</option>
                  <option value="Ekipman">Klinik Ekipman</option>
                </select>
              </div>
              <div className="row">
                <div className="form-group">
                  <label>Miktar</label>
                  <input required type="number" min="0" value={form.miktar} onChange={e => setForm({ ...form, miktar: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Birim</label>
                  <select value={form.birim} onChange={e => setForm({ ...form, birim: e.target.value })}>
                    <option value="adet">Adet</option>
                    <option value="kutu">Kutu</option>
                    <option value="doz">Doz</option>
                    <option value="ml">ML</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Uyarı Seviyesi (Minimum Stok)</label>
                <input type="number" value={form.kritikSeviye} onChange={e => setForm({ ...form, kritikSeviye: e.target.value })} />
              </div>
              <div className="buttons">
                <button type="submit" className="btn-submit">Kaydet</button>
                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>İptal</button>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}
    </PageContainer>
  );
}
