import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { toast } from 'react-toastify';
import * as api from '../services/api';
import VetPageShell, { VetBtn } from '../components/Vet/VetPageShell';

const fadeIn = keyframes`from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}`;

// ─── Layout ───────────────────────────────────────────────────────────────────
const Page = styled.div`
  animation: ${fadeIn} 0.4s ease;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  min-height: calc(100vh - 70px);
  background: #f9fafb;
  padding: 0;
`;

const Inner = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 20px 20px 64px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

// ─── Stat Cards ───────────────────────────────────────────────────────────────
const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
`;

const StatCard = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 18px 20px;
  border: 1px solid #e2e8f0;
  display: flex; align-items: center; gap: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.07); }

  .sc-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .sc-val  { font-size: 24px; font-weight: 900; color: #0f172a; line-height: 1; }
  .sc-lbl  { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 3px; }
  .sc-sub  { font-size: 11px; color: #94a3b8; margin-top: 2px; }
`;

// ─── Filter / Search Bar ──────────────────────────────────────────────────────
const FilterBar = styled.div`
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 14px 18px;
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);

  .search-wrap { position: relative; flex: 1; min-width: 180px; }
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 14px; }
  .search-input {
    width: 100%; padding: 10px 12px 10px 36px;
    border: 1.5px solid #e2e8f0; border-radius: 10px;
    font-size: 13px; font-weight: 500; box-sizing: border-box;
    transition: all 0.2s; background: #f8fafc;
    &:focus { outline: none; border-color: #3b82f6; background: #fff; }
    &::placeholder { color: #94a3b8; }
  }

  .kat-btn {
    padding: 8px 16px; border-radius: 10px;
    border: 1.5px solid transparent; font-size: 12px; font-weight: 700;
    cursor: pointer; transition: all 0.2s; white-space: nowrap;
    background: #f1f5f9; color: #64748b;
    &:hover { background: #e2e8f0; color: #0f172a; }
    &.active { background: #2563eb; color: #fff; border-color: #2563eb; box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
  }
`;

// ─── Stok Grid ────────────────────────────────────────────────────────────────
const StokGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
`;

const KAT_RENK = {
  'İlaç':            { bg: '#eff6ff', border: '#bfdbfe', badge: '#2563eb', icon: '💊' },
  'Antibiyotik':     { bg: '#faf5ff', border: '#e9d5ff', badge: '#7c3aed', icon: '🧬' },
  'Vitamin':         { bg: '#f0fdf4', border: '#bbf7d0', badge: '#16a34a', icon: '🌿' },
  'Aşı':             { bg: '#fef3c7', border: '#fde68a', badge: '#d97706', icon: '💉' },
  'Biyolojik':       { bg: '#fdf2f8', border: '#f5d0fe', badge: '#9333ea', icon: '🔬' },
  'Anti-inflamatuar':{ bg: '#fff7ed', border: '#fed7aa', badge: '#ea580c', icon: '🩹' },
  'Paraziter':       { bg: '#ecfdf5', border: '#a7f3d0', badge: '#059669', icon: '🦠' },
  'Tohum':           { bg: '#f0fdf4', border: '#bbf7d0', badge: '#047857', icon: '🌱' },
  'Sperma':          { bg: '#f0fdf4', border: '#bbf7d0', badge: '#047857', icon: '🧫' },
  'Ekipman':         { bg: '#f8fafc', border: '#e2e8f0', badge: '#475569', icon: '🔧' },
};
const getKat = (k) => KAT_RENK[k] || { bg: '#f8fafc', border: '#e2e8f0', badge: '#64748b', icon: '📦' };

const StokCard = styled.div`
  background: ${p => p.$kritik ? '#fff5f5' : p.$az ? '#fffce8' : '#fff'};
  border-radius: 12px;
  border: 1px solid ${p => p.$kritik ? '#fecaca' : p.$az ? '#fde68a' : '#e5e7eb'};
  padding: 18px 20px;
  transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
  box-shadow: none;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: ${p => p.$kritik ? '#f87171' : p.$az ? '#fbbf24' : '#bae6fd'}; }

  .sc-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
  .sc-badge {
    padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 800;
    background: ${p => getKat(p.$kat).bg}; color: ${p => getKat(p.$kat).badge};
    border: 1px solid ${p => getKat(p.$kat).border};
    letter-spacing: 0.04em; white-space: nowrap; text-transform: uppercase;
  }
  .sc-actions { display: flex; gap: 6px; }
  .sc-act-btn {
    width: 28px; height: 28px; border-radius: 8px; border: 1px solid #e2e8f0;
    background: #f8fafc; cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 12px; transition: all 0.15s; color: #64748b;
    &:hover { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }
    &.del:hover { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
  }
  .sc-name { font-size: 16px; font-weight: 800; color: #0f172a; line-height: 1.2; }
  .sc-meta { font-size: 12px; color: #94a3b8; font-weight: 500; }

  .sc-middle { display: flex; align-items: center; justify-content: space-between; }
  .sc-miktar-wrap { display: flex; align-items: baseline; gap: 5px; }
  .sc-miktar { font-size: 32px; font-weight: 900; letter-spacing: -0.03em; color: ${p => p.$kritik ? '#dc2626' : p.$az ? '#d97706' : '#0f172a'}; line-height: 1; }
  .sc-birim  { font-size: 13px; font-weight: 600; color: #94a3b8; }

  .sc-bar-wrap { flex: 1; margin-left: 16px; }
  .sc-bar-bg { height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
  .sc-bar-fill { height: 100%; border-radius: 10px; transition: width 0.4s; background: ${p => p.$kritik ? '#ef4444' : p.$az ? '#f59e0b' : '#10b981'}; width: ${p => Math.min(100, Math.round(p.$pct)) || 0}%; }
  .sc-bar-lbl { font-size: 10px; color: #94a3b8; font-weight: 600; margin-top: 4px; text-align: right; }

  .sc-warn { font-size: 11px; font-weight: 700; color: ${p => p.$kritik ? '#dc2626' : '#d97706'}; display: flex; align-items: center; gap: 5px; }

  .sc-icon-bg {
    position: absolute; right: -10px; bottom: -10px;
    font-size: 68px; opacity: 0.04; pointer-events: none; user-select: none;
    transform: rotate(-12deg);
  }
`;

// ─── Bagaj ────────────────────────────────────────────────────────────────────
const BagajGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
`;

const BagajCard = styled.div`
  background: ${p => p.$kritik ? '#fff5f5' : p.$az ? '#fffce8' : '#fff'};
  border: 1.5px solid ${p => p.$kritik ? '#fecaca' : p.$az ? '#fde68a' : '#e2e8f0'};
  border-radius: 16px; padding: 18px; transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  &:hover { box-shadow: 0 6px 18px rgba(0,0,0,0.07); transform: translateY(-2px); }

  .bc-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
  .bc-name  { font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 14px; }
  .bc-warn  { font-size: 11px; font-weight: 700; color: ${p => p.$kritik ? '#dc2626' : '#d97706'}; margin-bottom: 10px; }
  .bc-ctrl  { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
  .bc-btn   { width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #f8fafc; font-size: 20px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; color: #374151; &:hover { background: #e2e8f0; } &:disabled { opacity: 0.3; cursor: not-allowed; } }
  .bc-val   { text-align: center; }
  .bc-num   { font-size: 28px; font-weight: 900; color: #0f172a; line-height: 1; }
  .bc-birim { font-size: 11px; color: #94a3b8; font-weight: 600; }
  .bc-dus   { width: 100%; padding: 8px; border-radius: 10px; border: 1.5px dashed #e2e8f0; background: transparent; font-size: 12px; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.15s; &:hover { border-color: #7c3aed; color: #7c3aed; background: #f5f3ff; } }
`;

// ─── Modal ─────────────────────────────────────────────────────────────────────
const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
`;

const Modal = styled.div`
  background: #fff; width: 100%; max-width: 520px; border-radius: 20px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.18); overflow: hidden;
  max-height: 90vh; display: flex; flex-direction: column;

  .m-head {
    padding: 22px 28px 18px;
    border-bottom: 1px solid #f1f5f9;
    background: linear-gradient(135deg, #f8fafc, #fff);
  }
  .m-head h2 { margin: 0; font-size: 18px; font-weight: 900; color: #0f172a; }
  .m-head p  { margin: 4px 0 0; font-size: 13px; color: #64748b; }
  .m-body { padding: 24px 28px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px; }
  .m-foot { padding: 16px 28px; border-top: 1px solid #f1f5f9; display: flex; gap: 12px; }

  .f-lbl { font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: 7px; }
  .f-inp {
    width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
    font-size: 14px; font-family: 'Inter', sans-serif; box-sizing: border-box;
    transition: all 0.2s; background: #f8fafc; color: #0f172a;
    &:focus { outline: none; border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
  }
  .f-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  .kat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .kat-chip {
    padding: 10px 8px; border-radius: 10px; border: 1.5px solid #e2e8f0;
    background: #f8fafc; cursor: pointer; transition: all 0.2s;
    text-align: center; font-size: 12px; font-weight: 700; color: #475569;
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    .chip-icon { font-size: 18px; }
    &:hover { border-color: #bfdbfe; background: #eff6ff; color: #2563eb; }
    ${p => p.$active && css`
      border-color: ${getKat(p.$kat).badge}; 
      background: ${getKat(p.$kat).bg};
      color: ${getKat(p.$kat).badge};
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    `}
  }

  .btn-submit {
    flex: 2; padding: 13px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #2563eb, #0ea5e9); color: #fff;
    font-size: 14px; font-weight: 800; cursor: pointer; transition: all 0.2s;
    &:hover { box-shadow: 0 6px 18px rgba(37,99,235,0.3); transform: translateY(-1px); }
    &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  }
  .btn-cancel {
    flex: 1; padding: 13px; border-radius: 10px;
    border: 1.5px solid #e2e8f0; background: #f8fafc;
    color: #64748b; font-size: 14px; font-weight: 700; cursor: pointer;
    &:hover { background: #f1f5f9; }
  }
`;

// ─── ComboDropdown ────────────────────────────────────────────────────────────
const ComboDrop = styled.div`
  position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 300;
  background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px;
  box-shadow: 0 8px 28px rgba(15,23,42,0.14);
  max-height: 240px; overflow-y: auto;

  .cd-sect { padding: 4px 0; }
  .cd-head { padding: 4px 14px; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; }
  .cd-item {
    padding: 9px 14px; cursor: pointer; font-size: 13px; font-weight: 600; color: #0f172a;
    display: flex; justify-content: space-between; align-items: center; transition: background 0.1s;
    &:hover { background: #eff6ff; color: #2563eb; }
  }
  .cd-badge { font-size: 10px; color: #94a3b8; }
`;

// ─── Stok Sabit Listeler ──────────────────────────────────────────────────────
const KATEGORI_LISTE = {
  'İlaç':             ['Penstrep', 'Amoxicillin', 'Enrofloksasin', 'Oxytetrasiklin', 'Tylosin', 'Seftiofur', 'Florfenikol', 'Ampisilin'],
  'Antibiyotik':      ['Penstrep', 'Amoxicillin', 'Enrofloksasin', 'Seftiofur', 'Florfenikol', 'Ampisilin', 'Tylosin'],
  'Vitamin':          ['Ca-Mg-P Solüsyonu', 'Vitamin AD3E', 'Selen + Vit E', 'B12 Vitamini', 'Kalsiyum Boroglükonat', 'B-Kompleks', 'Vit C'],
  'Anti-inflamatuar': ['Metacam (Meloxicam)', 'Flunixin', 'Ketoprofen', 'Deksametazon', 'Prednizolon'],
  'Aşı':              ['Şap Aşısı', 'Brucella Aşısı', 'IBR Aşısı', 'BVD Aşısı', 'Pasteurella Aşısı', 'Leptospira Aşısı', 'Botulizm Aşısı'],
  'Biyolojik':        ['Şap Aşısı', 'Brucella Aşısı', 'IBR Aşısı', 'BVD Aşısı'],
  'Paraziter':        ['İvermektin', 'Albendazol', 'Fenbendazol', 'Levamizol', 'Doramektin'],
  'Tohum':            ['Semen (Holstein)', 'Semen (Simental)', 'Semen (Montofon)', 'Semen (Jersey)', 'Sexed Semen (Holstein Dişi)', 'Sexed Semen (Simental Dişi)'],
  'Sperma':           ['Semen (Holstein)', 'Semen (Simental)', 'Semen (Montofon)', 'Semen (Jersey)', 'Sexed Semen (Holstein Dişi)'],
  'Ekipman':          ['Rektal Eldiven', 'İnjektör (10ml)', 'İnjektör (20ml)', 'Tohumlama Pipeti', 'Azot Deposu', 'Gıdım Sondası', 'El Feneri'],
};
const BIRIM_LISTE = { 'İlaç': 'şişe', 'Antibiyotik': 'kutu', 'Vitamin': 'şişe', 'Anti-inflamatuar': 'kutu', 'Aşı': 'doz', 'Biyolojik': 'doz', 'Paraziter': 'şişe', 'Tohum': 'pipet', 'Sperma': 'pipet', 'Ekipman': 'adet' };
const KAT_LISTESI = ['İlaç', 'Antibiyotik', 'Vitamin', 'Anti-inflamatuar', 'Aşı', 'Biyolojik', 'Paraziter', 'Tohum', 'Sperma', 'Ekipman'];
const ALL_BIRIMLER = ['adet', 'kutu', 'şişe', 'doz', 'ml', 'gram', 'litre', 'pipet', 'kg', 'lt', 'torba'];

// ─── StokCombo ────────────────────────────────────────────────────────────────
function StokCombo({ value, onChange, kategori, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const sabitListe = KATEGORI_LISTE[kategori] || [];
  const q = (value || '').toLowerCase().trim();
  const filtered = useMemo(() => sabitListe.filter(s => !q || s.toLowerCase().includes(q)).slice(0, 12), [sabitListe, q]);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <input
        className="f-inp"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        onBlur={e => { if (!ref.current?.contains(e.relatedTarget)) setOpen(false); }}
      />
      {open && filtered.length > 0 && (
        <ComboDrop>
          <div className="cd-sect">
            <div className="cd-head">📋 Sık Kullanılanlar</div>
            {filtered.map((s, i) => (
              <div key={i} className="cd-item" onMouseDown={() => { onChange(s); setOpen(false); }}>
                {s}
              </div>
            ))}
          </div>
        </ComboDrop>
      )}
    </div>
  );
}

// ─── Bagaj localStorage helpers ───────────────────────────────────────────────
const BAGAJ_KEY = 'vet_bagaj_v1';
const loadBagaj = () => { try { return JSON.parse(localStorage.getItem(BAGAJ_KEY) || '{}'); } catch { return {}; } };
const saveBagaj = d => localStorage.setItem(BAGAJ_KEY, JSON.stringify(d));

// ─────────────────────────────────────────────────────────────────────────────
export default function VeterinerStok() {
  const [stoklar, setStoklar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aktifTab, setAktifTab] = useState('stok');
  const [katFiltre, setKatFiltre] = useState('');
  const [arama, setArama] = useState('');

  // Modal — ekle/düzenle
  const [modal, setModal] = useState(null); // null | 'ekle' | 'duzenle'
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ urunAdi: '', kategori: 'İlaç', miktar: '', birim: 'şişe', kritikSeviye: 5, notlar: '' });
  const [saving, setSaving] = useState(false);

  // Düş modal
  const [dusModal, setDusModal] = useState(null);
  const [dusMiktar, setDusMiktar] = useState('');

  // Bagaj
  const [bagaj, setBagaj] = useState(loadBagaj);
  const [bagajEkleStok, setBagajEkleStok] = useState('');
  const [bagajEkleMiktar, setBagajEkleMiktar] = useState('');

  const fetchStok = useCallback(async () => {
    try {
      const res = await api.getStoklar();
      const items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setStoklar((items || []).filter(s => s.kategori !== 'Yem'));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStok(); }, [fetchStok]);

  const openEkle = () => {
    setEditId(null);
    setForm({ urunAdi: '', kategori: 'İlaç', miktar: '', birim: BIRIM_LISTE['İlaç'] || 'adet', kritikSeviye: 5, notlar: '' });
    setModal('ekle');
  };

  const openDuzenle = (s) => {
    setEditId(s._id);
    setForm({ urunAdi: s.urunAdi, kategori: s.kategori, miktar: s.miktar, birim: s.birim, kritikSeviye: s.kritikSeviye || 5, notlar: s.notlar || '' });
    setModal('duzenle');
  };

  const handleKatChange = (kat) => {
    setForm(f => ({ ...f, kategori: kat, birim: BIRIM_LISTE[kat] || f.birim, urunAdi: '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.urunAdi.trim()) { toast.warning('Ürün adı giriniz.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, miktar: Number(form.miktar), kritikSeviye: Number(form.kritikSeviye) };
      if (modal === 'duzenle' && editId) {
        await api.updateStok(editId, payload);
        toast.success('Stok güncellendi.');
      } else {
        await api.createStok(payload);
        toast.success('Stok eklendi.');
      }
      setModal(null);
      fetchStok();
    } catch { toast.error('Kaydedilemedi.'); }
    finally { setSaving(false); }
  };

  const handleSil = async (id, ad) => {
    if (!window.confirm(`"${ad}" silinsin mi?`)) return;
    try { await api.deleteStok(id); toast.success('Silindi.'); fetchStok(); }
    catch { toast.error('Silinemedi.'); }
  };

  // Bagaj
  const bagajGuncelle = d => { setBagaj(d); saveBagaj(d); };
  const handleBagajEkle = () => {
    if (!bagajEkleStok || !bagajEkleMiktar) { toast.warning('Ürün ve miktar seçin.'); return; }
    const mik = Number(bagajEkleMiktar);
    if (!(mik > 0)) { toast.warning('Geçerli miktar.'); return; }
    const s = stoklar.find(x => x._id === bagajEkleStok);
    if (!s) return;
    const nb = { ...bagaj, [bagajEkleStok]: { miktar: (bagaj[bagajEkleStok]?.miktar || 0) + mik, stokAdi: s.urunAdi, birim: s.birim, kritikSeviye: s.kritikSeviye || 5 } };
    bagajGuncelle(nb);
    setBagajEkleStok(''); setBagajEkleMiktar('');
    toast.success(`${s.urunAdi} bagaja eklendi.`);
  };
  const handleDus = () => {
    if (!dusModal) return;
    const mik = Number(dusMiktar);
    if (!(mik > 0)) { toast.warning('Geçerli miktar.'); return; }
    const entry = bagaj[dusModal.stokId];
    if (!entry) return;
    const nm = Math.max(0, entry.miktar - mik);
    const nb = nm === 0
      ? Object.fromEntries(Object.entries(bagaj).filter(([k]) => k !== dusModal.stokId))
      : { ...bagaj, [dusModal.stokId]: { ...entry, miktar: nm } };
    if (nm === 0) toast.info(`${entry.stokAdi} tükendi.`);
    else { toast.success(`${mik} ${entry.birim} düşüldü → ${nm} kaldı.`); if (nm <= entry.kritikSeviye) toast.warning(`⚠️ ${entry.stokAdi}: Stok azalıyor!`); }
    bagajGuncelle(nb);
    setDusModal(null);
  };

  const handleBagajKullan = async (stokId, entry) => {
    const miktar = prompt(`Kaç ${entry.birim || 'adet'} kullandınız? (Mevcut: ${entry.miktar})`);
    if (!miktar || isNaN(miktar) || Number(miktar) <= 0) return;
    const mik = Number(miktar);
    const s = stoklar.find(x => x._id === stokId);
    if (!s) { toast.error('Stok bulunamadı.'); return; }
    try {
      const yeniDepoMiktar = Math.max(0, s.miktar - mik);
      await api.updateStok(stokId, { miktar: yeniDepoMiktar });
      const nm = Math.max(0, entry.miktar - mik);
      const nb = nm === 0
        ? Object.fromEntries(Object.entries(bagaj).filter(([k]) => k !== stokId))
        : { ...bagaj, [stokId]: { ...entry, miktar: nm } };
      bagajGuncelle(nb);
      toast.success('Stok güncellendi');
      fetchStok();
    } catch { toast.error('Güncelleme hatası'); }
  };

  // Filtered
  const filteredStok = useMemo(() => {
    let l = stoklar;
    if (katFiltre) l = l.filter(s => s.kategori === katFiltre);
    if (arama.trim()) { const q = arama.toLowerCase(); l = l.filter(s => (s.urunAdi || '').toLowerCase().includes(q)); }
    return l;
  }, [stoklar, katFiltre, arama]);

  const kritikStoklar = stoklar.filter(s => s.miktar <= s.kritikSeviye);
  const bagajItems = Object.entries(bagaj);
  const bagajKritik = bagajItems.filter(([, e]) => e.miktar <= e.kritikSeviye);
  const kategoriSayilari = useMemo(() => {
    const m = {};
    stoklar.forEach(s => { m[s.kategori] = (m[s.kategori] || 0) + 1; });
    return m;
  }, [stoklar]);

  return (
    <Page>
      <VetPageShell
        title={aktifTab === 'stok' ? 'Depo Stoku' : 'Dijital Bagaj'}
        subtitle="İlaç · Aşı · Tohum · Ekipman"
        actions={<>
          <button
            style={aktifTab === 'bagaj' ? VetBtn.primary : VetBtn.secondary}
            onClick={() => setAktifTab(aktifTab === 'stok' ? 'bagaj' : 'stok')}
          >
            {aktifTab === 'stok' ? '🎒 Dijital Bagaj' : '📦 Depo Stoku'}
          </button>
          <button style={VetBtn.primary} onClick={openEkle}>+ Stok Ekle</button>
        </>}
      >
      <Inner>

        {/* ─── Stats ─── */}
        <StatsRow>
          <StatCard>
            <div className="sc-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>💊</div>
            <div>
              <div className="sc-val">{stoklar.filter(s => ['İlaç','Antibiyotik','Vitamin','Anti-inflamatuar','Paraziter'].includes(s.kategori)).length}</div>
              <div className="sc-lbl">İlaç & Vitamin</div>
            </div>
          </StatCard>
          <StatCard>
            <div className="sc-icon" style={{ background: '#fef3c7', color: '#d97706' }}>💉</div>
            <div>
              <div className="sc-val">{stoklar.filter(s => ['Aşı','Biyolojik'].includes(s.kategori)).reduce((a, b) => a + b.miktar, 0)}</div>
              <div className="sc-lbl">Aşı Dozu</div>
            </div>
          </StatCard>
          <StatCard>
            <div className="sc-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>🌱</div>
            <div>
              <div className="sc-val">{stoklar.filter(s => ['Tohum','Sperma'].includes(s.kategori)).reduce((a, b) => a + b.miktar, 0)}</div>
              <div className="sc-lbl">Tohum / Pipet</div>
            </div>
          </StatCard>
          <StatCard style={{ borderColor: kritikStoklar.length > 0 ? '#fecaca' : '#e2e8f0', background: kritikStoklar.length > 0 ? '#fff5f5' : '#fff' }}>
            <div className="sc-icon" style={{ background: kritikStoklar.length > 0 ? '#fee2e2' : '#f1f5f9', color: kritikStoklar.length > 0 ? '#dc2626' : '#64748b' }}>⚠️</div>
            <div>
              <div className="sc-val" style={{ color: kritikStoklar.length > 0 ? '#dc2626' : '#0f172a' }}>{kritikStoklar.length}</div>
              <div className="sc-lbl">Kritik Stok</div>
              {kritikStoklar.length > 0 && <div className="sc-sub">Acil sipariş gerekiyor</div>}
            </div>
          </StatCard>
          <StatCard style={{ borderColor: bagajKritik.length > 0 ? '#fde68a' : '#e2e8f0', background: bagajKritik.length > 0 ? '#fffce8' : '#fff' }}>
            <div className="sc-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>🎒</div>
            <div>
              <div className="sc-val">{bagajItems.length}</div>
              <div className="sc-lbl">Bagajda Ürün {bagajKritik.length > 0 && `· ⚠️ ${bagajKritik.length} az`}</div>
            </div>
          </StatCard>
        </StatsRow>

        {/* ─── Tab Buttons ─── */}
        <div style={{ display: 'flex', gap: 10, background: '#fff', padding: 8, borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          {[
            { id: 'stok', label: '📦 Depo Stoku', count: stoklar.length },
            { id: 'bagaj', label: '🎒 Dijital Bagaj', count: bagajItems.length },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setAktifTab(t.id)}
              style={{
                flex: 1, padding: '11px 16px', borderRadius: 10, border: '1px solid transparent',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                background: aktifTab === t.id ? '#dbeafe' : 'transparent',
                color: aktifTab === t.id ? '#1e40af' : '#64748b',
                boxShadow: 'none',
                borderColor: aktifTab === t.id ? '#bfdbfe' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {t.label}
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: aktifTab === t.id ? 'rgba(255,255,255,0.2)' : '#f1f5f9', color: aktifTab === t.id ? '#fff' : '#64748b', fontWeight: 800 }}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* ─── DEPO STOK ─── */}
        {aktifTab === 'stok' && (
          <>
            {/* Filter Bar */}
            <FilterBar>
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input
                  className="search-input"
                  placeholder="Ürün ara..."
                  value={arama}
                  onChange={e => setArama(e.target.value)}
                />
              </div>
              <button className={`kat-btn ${katFiltre === '' ? 'active' : ''}`} onClick={() => setKatFiltre('')}>
                Tümü ({stoklar.length})
              </button>
              {Object.entries(kategoriSayilari).map(([kat, sayi]) => (
                <button key={kat} className={`kat-btn ${katFiltre === kat ? 'active' : ''}`} onClick={() => setKatFiltre(kat)}>
                  {getKat(kat).icon} {kat} ({sayi})
                </button>
              ))}
            </FilterBar>

            {loading ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: 16 }}>Yükleniyor…</div>
            ) : filteredStok.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Stok bulunamadı</div>
                <div style={{ fontSize: 13, marginTop: 6, color: '#94a3b8' }}>{arama || katFiltre ? 'Filtreyi temizle' : 'Sağ üstten ürün ekleyin'}</div>
              </div>
            ) : (
              <StokGrid>
                {filteredStok.map(s => {
                  const kritik = s.miktar <= 0;
                  const az = !kritik && s.miktar <= s.kritikSeviye;
                  const pct = s.kritikSeviye > 0 ? (s.miktar / (s.kritikSeviye * 3)) * 100 : 100;
                  const kat = getKat(s.kategori);
                  return (
                    <StokCard key={s._id} $kritik={kritik} $az={az} $kat={s.kategori} $pct={pct}>
                      <div className="sc-icon-bg">{kat.icon}</div>
                      <div className="sc-top">
                        <span className="sc-badge" $kat={s.kategori}>{kat.icon} {s.kategori}</span>
                        <div className="sc-actions">
                          <button className="sc-act-btn" title="Düzenle" onClick={() => openDuzenle(s)}>✏️</button>
                          <button className="sc-act-btn del" title="Sil" onClick={() => handleSil(s._id, s.urunAdi)}>🗑️</button>
                        </div>
                      </div>
                      <div>
                        <div className="sc-name">{s.urunAdi}</div>
                        {s.notlar && <div className="sc-meta">{s.notlar}</div>}
                      </div>
                      <div className="sc-middle">
                        <div className="sc-miktar-wrap">
                          <span className="sc-miktar">{s.miktar}</span>
                          <span className="sc-birim">{s.birim}</span>
                        </div>
                        <div className="sc-bar-wrap">
                          <div className="sc-bar-bg"><div className="sc-bar-fill" /></div>
                          <div className="sc-bar-lbl">Min: {s.kritikSeviye} {s.birim}</div>
                        </div>
                      </div>
                      {(kritik || az) && (
                        <div className="sc-warn">
                          {kritik ? '🔴 Tükendi — sipariş ver!' : `⚠️ Azalıyor (min ${s.kritikSeviye})`}
                        </div>
                      )}
                    </StokCard>
                  );
                })}
              </StokGrid>
            )}
          </>
        )}

        {/* ─── DİJİTAL BAGAJ ─── */}
        {aktifTab === 'bagaj' && (
          <>
            {/* Bagaj Ekle Satırı */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#64748b', whiteSpace: 'nowrap' }}>🎒 Stoktan Bagaja Ekle:</span>
              <select
                value={bagajEkleStok}
                onChange={e => setBagajEkleStok(e.target.value)}
                style={{ flex: 1, minWidth: 180, padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, background: '#f8fafc', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              >
                <option value="">— Ürün seç —</option>
                {stoklar.map(s => (
                  <option key={s._id} value={s._id}>{getKat(s.kategori).icon} {s.urunAdi} · {s.miktar} {s.birim}</option>
                ))}
              </select>
              <input
                type="number" min="1"
                placeholder="Miktar"
                value={bagajEkleMiktar}
                onChange={e => setBagajEkleMiktar(e.target.value)}
                style={{ width: 90, padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontFamily: 'Inter, sans-serif' }}
              />
              <button
                onClick={handleBagajEkle}
                style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(124,58,237,0.25)' }}
              >
                Bagaja Ekle
              </button>
            </div>

            {bagajItems.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎒</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Bagaj boş</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Yukarıdan stok seçip ekleyin</div>
              </div>
            ) : (
              <BagajGrid>
                {bagajItems.map(([stokId, entry]) => {
                  const kritik = entry.miktar <= 0;
                  const az = !kritik && entry.miktar <= entry.kritikSeviye;
                  return (
                    <BagajCard key={stokId} $kritik={kritik} $az={az}>
                      <div className="bc-label">🎒 Araç Bagajı</div>
                      <div className="bc-name">{entry.stokAdi}</div>
                      {kritik && <div className="bc-warn">🔴 Tükendi!</div>}
                      {az && !kritik && <div className="bc-warn">⚠️ Az kaldı ({entry.miktar} {entry.birim})</div>}
                      <div className="bc-ctrl">
                        <button className="bc-btn" onClick={() => { const e2 = bagaj[stokId]; if (!e2 || e2.miktar <= 0) return; const nb = { ...bagaj, [stokId]: { ...e2, miktar: e2.miktar - 1 > 0 ? e2.miktar - 1 : e2.miktar } }; if (e2.miktar - 1 <= 0) { const nb2 = Object.fromEntries(Object.entries(bagaj).filter(([k]) => k !== stokId)); bagajGuncelle(nb2); } else bagajGuncelle(nb); }} disabled={entry.miktar <= 0}>−</button>
                        <div className="bc-val">
                          <div className="bc-num">{entry.miktar}</div>
                          <div className="bc-birim">{entry.birim}</div>
                        </div>
                        <button className="bc-btn" onClick={() => bagajGuncelle({ ...bagaj, [stokId]: { ...entry, miktar: entry.miktar + 1 } })}>+</button>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleBagajKullan(stokId, entry)}
                          style={{ background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 500, cursor: 'pointer', flex: 1, minWidth: 100 }}
                        >
                          Kullandım
                        </button>
                        <button className="bc-dus" onClick={() => { setDusModal({ stokId, stokAdi: entry.stokAdi, birim: entry.birim }); setDusMiktar(''); }} style={{ flex: 1, minWidth: 100 }}>
                          📋 Kullanım Kaydet (Düş)
                        </button>
                      </div>
                    </BagajCard>
                  );
                })}
              </BagajGrid>
            )}
          </>
        )}

      </Inner>

      {/* ─── DÜŞ MODAL ─── */}
      {dusModal && (
        <Overlay onClick={() => setDusModal(null)}>
          <Modal onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div className="m-head">
              <h2>📋 Kullanım Kaydet</h2>
              <p>{dusModal.stokAdi} — Kaç {dusModal.birim} kullandınız?</p>
            </div>
            <div className="m-body">
              <div>
                <label className="f-lbl">Kullanılan Miktar ({dusModal.birim})</label>
                <input className="f-inp" type="number" min="1" placeholder={`Kaç ${dusModal.birim}?`} value={dusMiktar} onChange={e => setDusMiktar(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="m-foot">
              <button className="btn-cancel" onClick={() => setDusModal(null)}>İptal</button>
              <button className="btn-submit" onClick={handleDus}>Düş</button>
            </div>
          </Modal>
        </Overlay>
      )}

      {/* ─── EKLE / DÜZENLE MODAL ─── */}
      {modal && (
        <Overlay onClick={() => setModal(null)}>
          <Modal onClick={e => e.stopPropagation()}>
            <div className="m-head">
              <h2>{modal === 'duzenle' ? '✏️ Stok Düzenle' : '+ Yeni Stok Kalemi'}</h2>
              <p>{modal === 'duzenle' ? 'Stok bilgilerini güncelleyin' : 'Kliniğinize yeni bir ürün ekleyin'}</p>
            </div>
            <form onSubmit={handleSave}>
              <div className="m-body">

                {/* Kategori Seçici */}
                <div>
                  <label className="f-lbl">Kategori</label>
                  <div className="kat-grid">
                    {KAT_LISTESI.map(kat => {
                      const k = getKat(kat);
                      return (
                        <div
                          key={kat}
                          className={`kat-chip`}
                          $active={form.kategori === kat}
                          $kat={kat}
                          onClick={() => handleKatChange(kat)}
                          style={{
                            padding: '10px 8px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                            textAlign: 'center', fontSize: 12, fontWeight: 700,
                            border: `1.5px solid ${form.kategori === kat ? k.badge : '#e2e8f0'}`,
                            background: form.kategori === kat ? k.bg : '#f8fafc',
                            color: form.kategori === kat ? k.badge : '#475569',
                            boxShadow: form.kategori === kat ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                          }}
                        >
                          <span style={{ fontSize: 18 }}>{k.icon}</span>
                          {kat}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ürün Adı — ComboSelect */}
                <div>
                  <label className="f-lbl">Ürün / İlaç Adı *</label>
                  <StokCombo
                    value={form.urunAdi}
                    onChange={v => setForm(f => ({ ...f, urunAdi: v }))}
                    kategori={form.kategori}
                    placeholder={`${getKat(form.kategori).icon} Yazın veya listeden seçin…`}
                  />
                </div>

                {/* Miktar + Birim */}
                <div className="f-row">
                  <div>
                    <label className="f-lbl">Mevcut Miktar *</label>
                    <input required type="number" min="0" step="0.5" className="f-inp" value={form.miktar} onChange={e => setForm(f => ({ ...f, miktar: e.target.value }))} placeholder="0" />
                  </div>
                  <div>
                    <label className="f-lbl">Birim</label>
                    <select className="f-inp" value={form.birim} onChange={e => setForm(f => ({ ...f, birim: e.target.value }))} style={{ cursor: 'pointer' }}>
                      {ALL_BIRIMLER.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                {/* Kritik Seviye */}
                <div>
                  <label className="f-lbl">⚠️ Uyarı Seviyesi (Minimum Stok)</label>
                  <input type="number" min="0" className="f-inp" value={form.kritikSeviye} onChange={e => setForm(f => ({ ...f, kritikSeviye: e.target.value }))} placeholder="5" />
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 5 }}>Bu seviyenin altına düşerse uyarı alırsınız.</div>
                </div>

                {/* Not */}
                <div>
                  <label className="f-lbl">Not (opsiyonel)</label>
                  <input className="f-inp" value={form.notlar} onChange={e => setForm(f => ({ ...f, notlar: e.target.value }))} placeholder="Tedarikçi, seri no, vb." />
                </div>

              </div>
              <div className="m-foot">
                <button type="button" className="btn-cancel" onClick={() => setModal(null)}>İptal</button>
                <button type="submit" className="btn-submit" disabled={saving}>{saving ? 'Kaydediliyor…' : (modal === 'duzenle' ? 'Güncelle' : 'Stoka Ekle')}</button>
              </div>
            </form>
          </Modal>
        </Overlay>
      )}
      </VetPageShell>
    </Page>
  );
}
