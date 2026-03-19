import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { toast } from 'react-toastify';
import * as api from '../services/api';
import VetPageShell, { VetBtn } from '../components/Vet/VetPageShell';

const fadeUp = keyframes`from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}`;
const slideIn = keyframes`from{opacity:0;transform:translateX(16px);}to{opacity:1;transform:translateX(0);}`;

const Page = styled.div`
  font-family: 'Inter', system-ui, sans-serif;
  background: #f9fafb;
  min-height: 100%;
`;

// ─── Kötü Polis ───────────────────────────────────────────────────────────────
const KotuPolisPanel = styled.div`
  background: #fff;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 16px;
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;

  .kp-icon { font-size: 28px; flex-shrink: 0; }
  .kp-texts { flex: 1; min-width: 160px; }
  .kp-title { font-size: 15px; font-weight: 900; color: #991b1b; margin-bottom: 2px; }
  .kp-sub { font-size: 12px; color: #b91c1c; opacity: 0.75; }
  .kp-stats { display: flex; gap: 22px; }
  .kp-stat { text-align: center; }
  .kp-stat-val { font-size: 22px; font-weight: 900; color: #dc2626; }
  .kp-stat-lbl { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; }
  .kp-config { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .kp-config label { font-size: 12px; color: #64748b; white-space: nowrap; font-weight: 600; }
  .kp-config select { padding: 8px 10px; border-radius: 8px; border: 1.5px solid #fecaca; background: #fff7f7; color: #991b1b; font-size: 13px; font-weight: 700; cursor: pointer; &:focus { outline: none; border-color: #ef4444; } }
  .kp-btn { padding: 10px 20px; border-radius: 10px; border: none; background: #ef4444; color: #fff; font-size: 13px; font-weight: 800; cursor: pointer; transition: all 0.2s; white-space: nowrap; &:hover:not(:disabled) { background: #dc2626; } &:disabled { opacity: 0.5; cursor: not-allowed; } }
  .kp-ok-banner { width: 100%; padding: 10px 14px; border-radius: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; font-size: 12px; font-weight: 700; text-align: center; }
`;

// ─── Metrics ──────────────────────────────────────────────────────────────────
const MetricRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 22px;
  @media(max-width: 900px) { grid-template-columns: repeat(2,1fr); }
`;

const MetricCard = styled.div`
  background: ${p => p.$primary ? 'linear-gradient(135deg,#047857,#065f46)' : '#fff'};
  border-radius: 16px;
  padding: 20px 22px;
  border: 1px solid ${p => p.$primary ? 'transparent' : '#e2e8f0'};
  box-shadow: ${p => p.$primary ? '0 10px 28px -8px rgba(4,120,87,0.4)' : '0 2px 8px rgba(0,0,0,0.04)'};
  transition: all 0.2s;
  &:hover { transform: translateY(-2px); }
  position: relative; overflow: hidden;

  .mc-icon { font-size: 20px; margin-bottom: 8px; }
  .mc-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${p => p.$primary ? 'rgba(255,255,255,0.65)' : '#94a3b8'}; margin-bottom: 4px; }
  .mc-val { font-size: 20px; font-weight: 900; color: ${p => p.$primary ? '#fff' : (p.$color || '#0f172a')}; letter-spacing: -0.02em; }
  .mc-sub { font-size: 11px; color: ${p => p.$primary ? 'rgba(255,255,255,0.6)' : '#64748b'}; margin-top: 4px; }
  .mc-bg { position: absolute; right: -12px; bottom: -12px; font-size: 56px; opacity: 0.06; }
`;

// ─── Body ─────────────────────────────────────────────────────────────────────
const Body = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  @media(max-width: 900px) { grid-template-columns: 1fr; }
`;

// ─── Customer List ────────────────────────────────────────────────────────────
const CustomerList = styled.div`
  background: #fff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
  display: flex; flex-direction: column;
  max-height: 700px;
`;

const ListHead = styled.div`
  padding: 14px 18px;
  border-bottom: 1px solid #f1f5f9;
  display: flex; align-items: center; gap: 8px;
  h2 { margin: 0; font-size: 13px; font-weight: 800; color: #0f172a; flex: 1; }
  .count { font-size: 11px; color: #94a3b8; font-weight: 600; }
`;

const ListScroll = styled.div`
  overflow-y: auto; flex: 1;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
`;

const CustomerItem = styled.div`
  padding: 14px 18px;
  cursor: pointer;
  border-bottom: 1px solid #f8fafc;
  transition: all 0.15s;
  position: relative;
  background: ${p => p.$active ? 'linear-gradient(90deg,rgba(4,120,87,0.07),transparent)' : 'transparent'};
  ${p => p.$active && css`&::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: linear-gradient(180deg,#059669,#047857); border-radius: 0 3px 3px 0; }`}
  &:hover { background: ${p => p.$active ? 'linear-gradient(90deg,rgba(4,120,87,0.07),transparent)' : '#fafbfd'}; }
  &:last-child { border-bottom: none; }

  .c-name { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .c-row { display: flex; justify-content: space-between; align-items: center; }
  .c-bakiye { font-size: 12px; font-weight: 800; color: ${p => p.$b > 500 ? '#dc2626' : p.$b > 100 ? '#d97706' : p.$b > 0 ? '#0ea5e9' : '#16a34a'}; }
  .c-chip { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 10px; background: ${p => p.$b > 0 ? '#fff7ed' : '#f0fdf4'}; color: ${p => p.$b > 0 ? '#c2410c' : '#16a34a'}; border: 1px solid ${p => p.$b > 0 ? '#fed7aa' : '#bbf7d0'}; }
`;

// ─── Detail ───────────────────────────────────────────────────────────────────
const DetailArea = styled.div`
  display: flex; flex-direction: column; gap: 16px;
  animation: ${slideIn} 0.3s ease;
`;

const DetailCard = styled.div`
  background: #fff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
`;

const CardHead = styled.div`
  padding: 16px 22px;
  border-bottom: 1px solid #f1f5f9;
  display: flex; align-items: center; gap: 10px;
  h3 { margin: 0; font-size: 15px; font-weight: 800; color: #0f172a; flex: 1; }
`;

const ActBtn = styled.button`
  padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 700; border: none; cursor: pointer; transition: all 0.18s; white-space: nowrap;
  background: ${p => p.$variant === 'primary' ? 'linear-gradient(135deg,#059669,#047857)' : p.$variant === 'warn' ? '#fff7ed' : 'transparent'};
  color: ${p => p.$variant === 'primary' ? '#fff' : p.$variant === 'warn' ? '#c2410c' : '#64748b'};
  border: ${p => p.$variant === 'warn' ? '1px solid #fed7aa' : 'none'};
  box-shadow: ${p => p.$variant === 'primary' ? '0 4px 12px rgba(5,150,105,0.3)' : 'none'};
  &:hover { transform: translateY(-1px); ${p => p.$variant === 'primary' ? 'box-shadow: 0 6px 18px rgba(5,150,105,0.4);' : ''} }
`;

const SummaryRow = styled.div`
  display: grid; grid-template-columns: repeat(3,1fr); gap: 0;
  .item { padding: 18px 22px; text-align: center; border-right: 1px solid #f1f5f9; &:last-child { border-right: none; } }
  .s-lbl { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 5px; }
  .s-val { font-size: 22px; font-weight: 900; }
`;

const FaturaItem = styled.div`
  display: flex; align-items: flex-start; gap: 14px;
  padding: 16px 22px;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.15s;
  &:last-child { border-bottom: none; }
  &:hover { background: #fafbfd; }

  .fi-icon { width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 16px; background: ${p => p.$tip === 'saglik' ? '#eff6ff' : '#f5f3ff'}; }
  .fi-body { flex: 1; min-width: 0; }
  .fi-aciklama { font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .fi-meta { font-size: 11px; color: #94a3b8; display: flex; gap: 10px; }
  .fi-right { text-align: right; flex-shrink: 0; }
  .fi-tutar { font-size: 16px; font-weight: 900; color: #0f172a; }
  .fi-odenen { font-size: 11px; color: #16a34a; margin-top: 2px; }
  .fi-kalan { font-size: 11px; color: #dc2626; margin-top: 2px; }
`;

const StatusBadge = styled.span`
  padding: 3px 9px; border-radius: 10px; font-size: 10px; font-weight: 700; white-space: nowrap;
  background: ${p => p.$d === 'kapali' ? '#f0fdf4' : p.$k > p.$t * 0.5 ? '#fef2f2' : '#fff7ed'};
  color: ${p => p.$d === 'kapali' ? '#16a34a' : p.$k > p.$t * 0.5 ? '#dc2626' : '#d97706'};
  border: 1px solid ${p => p.$d === 'kapali' ? '#bbf7d0' : p.$k > p.$t * 0.5 ? '#fecaca' : '#fde68a'};
`;

const TipBadge = styled.span`
  padding: 3px 9px; border-radius: 10px; font-size: 10px; font-weight: 700;
  background: ${p => p.$t === 'saglik' ? '#eff6ff' : '#f5f3ff'};
  color: ${p => p.$t === 'saglik' ? '#2563eb' : '#7c3aed'};
  border: 1px solid ${p => p.$t === 'saglik' ? '#bfdbfe' : '#ddd6fe'};
`;

const HizmetList = styled.div`
  margin-top: 8px; padding: 10px 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9;
  .satir { display: flex; justify-content: space-between; font-size: 12px; padding: 3px 0; color: #374151; }
  .satir span:first-child { color: #475569; }
  .satir span:last-child { font-weight: 700; color: #0f172a; }
`;

const TahsilatForm = styled.form`
  padding: 18px 22px;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  h4 { margin: 0 0 14px; font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
  .fields { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; }
  .field { display: flex; flex-direction: column; gap: 4px; }
  .field label { font-size: 11px; color: #64748b; font-weight: 700; }
  .field input { padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; background: #fff; transition: all 0.2s; &:focus { outline: none; border-color: #059669; box-shadow: 0 0 0 3px rgba(5,150,105,0.1); } }
  .submit { padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer; background: linear-gradient(135deg,#059669,#047857); color: #fff; font-weight: 800; font-size: 13px; box-shadow: 0 3px 10px rgba(5,150,105,0.25); align-self: flex-end; white-space: nowrap; transition: all 0.2s; &:hover:not(:disabled) { box-shadow: 0 5px 14px rgba(5,150,105,0.35); transform: translateY(-1px); } &:disabled { opacity: 0.5; cursor: not-allowed; } }
`;

// ─── Modal ─────────────────────────────────────────────────────────────────────
const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(15,23,42,0.5); display: flex; align-items: center;
  justify-content: center; z-index: 1000; padding: 20px; backdrop-filter: blur(6px);
`;

const ModalBox = styled.div`
  background: #fff; border-radius: 22px; width: 100%; max-width: 580px; max-height: 90vh;
  overflow-y: auto; box-shadow: 0 25px 60px -15px rgba(0,0,0,0.25);
  animation: ${fadeUp} 0.3s ease;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
`;

const ModalHead = styled.div`
  padding: 22px 28px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px;
  h3 { margin: 0; font-size: 18px; font-weight: 900; color: #0f172a; flex: 1; }
  .m-ciftlik { font-size: 13px; color: #64748b; font-weight: 600; }
  .m-close { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 24px; line-height: 1; padding: 0 4px; &:hover { color: #ef4444; } }
`;

const ModalBody = styled.div`
  padding: 24px 28px;
  .sec-lbl { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 10px; display: block; }
  .field { margin-bottom: 14px; }
  .field label { display: block; font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 5px; }
  .field input, .field select, .field textarea { width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 13px; font-family: inherit; background: #f8fafc; box-sizing: border-box; resize: vertical; transition: all 0.2s; &:focus { outline: none; border-color: #059669; background: #fff; box-shadow: 0 0 0 3px rgba(5,150,105,0.1); } }
`;

const HizmetRow = styled.div`
  display: grid; grid-template-columns: 1fr 80px 100px 34px; gap: 8px; align-items: center; margin-bottom: 8px;
  input { padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; width: 100%; box-sizing: border-box; transition: all 0.2s; &:focus { outline: none; border-color: #059669; } }
  .remove { width: 34px; height: 34px; border-radius: 8px; border: 1px solid #fecaca; background: #fef2f2; color: #dc2626; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; &:hover { background: #fee2e2; } }
`;

const AddLineBtn = styled.button`
  width: 100%; padding: 9px; border-radius: 8px; border: 1.5px dashed #059669; background: #f0fdf4; color: #047857; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.18s; &:hover { background: #dcfce7; }
`;

const ModalFoot = styled.div`
  padding: 16px 28px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;
  .toplam { font-size: 16px; font-weight: 900; color: #0f172a; }
  .toplam span { color: #059669; }
  .actions { display: flex; gap: 10px; }
  .cancel { padding: 11px 20px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #fff; color: #475569; font-weight: 700; cursor: pointer; font-size: 13px; &:hover { background: #f8fafc; } }
  .save { padding: 11px 24px; border-radius: 10px; border: none; background: linear-gradient(135deg,#059669,#047857); color: #fff; font-weight: 900; cursor: pointer; font-size: 13px; box-shadow: 0 4px 12px rgba(5,150,105,0.3); &:hover:not(:disabled) { box-shadow: 0 6px 18px rgba(5,150,105,0.4); transform: translateY(-1px); } &:disabled { opacity: 0.5; cursor: not-allowed; } }
`;

const EmptyState = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 300px; background: #fff; border-radius: 18px; border: 1px solid #e2e8f0;
  color: #94a3b8; font-size: 14px; text-align: center; padding: 32px;
  .icon { font-size: 48px; margin-bottom: 14px; opacity: 0.35; }
  strong { display: block; font-size: 16px; color: #475569; margin-bottom: 8px; }
  p { font-size: 13px; max-width: 340px; line-height: 1.6; color: #94a3b8; margin: 0; }
`;

// ─────────────────────────────────────────────────────────────────────────────
const OTOMATIK_GUN_KEY = 'vet_otomatik_hatirlatma_gun';

export default function VeterinerFinans() {
  const [cari, setCari] = useState({ list: [], toplamBakiye: 0 });
  const [loading, setLoading] = useState(true);
  const [seciliId, setSeciliId] = useState(null);
  const [detay, setDetay] = useState(null);
  const [detayLoading, setDetayLoading] = useState(false);

  const [tahsilatTutar, setTahsilatTutar] = useState('');
  const [tahsilatAciklama, setTahsilatAciklama] = useState('');
  const [tahsilatYukleniyor, setTahsilatYukleniyor] = useState(false);

  const [modalAcik, setModalAcik] = useState(false);
  const [fModal, setFModal] = useState({ aciklama: '', vadeTarihi: '' });
  const [hizmetler, setHizmetler] = useState([{ ad: '', miktar: 1, birimFiyat: '' }]);
  const [faturaYukleniyor, setFaturaYukleniyor] = useState(false);

  const [topluGonderiyor, setTopluGonderiyor] = useState(false);
  const [otomatikGun, setOtomatikGun] = useState(() => {
    try { return parseInt(localStorage.getItem(OTOMATIK_GUN_KEY) || '15', 10); } catch { return 15; }
  });
  const [topluGonderildi, setTopluGonderildi] = useState(false);

  useEffect(() => {
    const bugunGun = new Date().getDate();
    if (bugunGun === otomatikGun) {
      const bugunKey = `vet_hatirlatma_${new Date().toISOString().slice(0,10)}`;
      if (!localStorage.getItem(bugunKey)) {
        toast.info(`📅 Bugün otomatik hatırlatma günü! "Tümüne Gönder" butonuna basın.`, { autoClose: 8000 });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCari = useCallback(() => {
    api.getVeterinerCari()
      .then(res => setCari({ list: res.data?.list || [], toplamBakiye: res.data?.toplamBakiye || 0 }))
      .catch(() => setCari({ list: [], toplamBakiye: 0 }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCari(); }, [fetchCari]);

  const fetchDetay = useCallback((id) => {
    if (!id) { setDetay(null); return; }
    setDetayLoading(true);
    api.getVeterinerCariDetay(id)
      .then(res => setDetay(res.data))
      .catch(() => setDetay(null))
      .finally(() => setDetayLoading(false));
  }, []);

  useEffect(() => { fetchDetay(seciliId); }, [seciliId, fetchDetay]);

  const secCiftci = (id) => { setSeciliId(id); setTahsilatTutar(''); setTahsilatAciklama(''); };

  const handleTahsilat = async (e) => {
    e.preventDefault();
    const tutar = parseFloat(String(tahsilatTutar).replace(',', '.'));
    if (!seciliId || !(tutar > 0) || tahsilatYukleniyor) return;
    setTahsilatYukleniyor(true);
    try {
      await api.postVeterinerTahsilat({ ciftciId: seciliId, tutar, aciklama: tahsilatAciklama.trim() || undefined });
      toast.success('✅ Tahsilat kaydedildi.');
      setTahsilatTutar(''); setTahsilatAciklama('');
      fetchCari(); fetchDetay(seciliId);
    } catch (err) { toast.error(err.response?.data?.message || 'Kaydedilemedi.'); }
    finally { setTahsilatYukleniyor(false); }
  };

  const handleHatirlatma = async (id, ad) => {
    try {
      await api.postVeterinerHatirlatma(id);
      toast.success(`📬 Borç hatırlatması "${ad}" çiftliğine gönderildi.`);
    } catch (err) { toast.error(err.response?.data?.message || 'Gönderilemedi.'); }
  };

  const handleTopluHatirlatma = async () => {
    const borcluList = cari.list.filter(r => (r.bakiye || 0) > 0);
    if (borcluList.length === 0) { toast.info('Borçlu çiftlik yok.'); return; }
    if (!window.confirm(`${borcluList.length} borçlu çiftliğe mesaj gönderilecek. Onaylıyor musunuz?`)) return;
    setTopluGonderiyor(true);
    let basarili = 0; let hatali = 0;
    for (const row of borcluList) {
      try { await api.postVeterinerHatirlatma(row.ciftciId); basarili++; } catch { hatali++; }
    }
    setTopluGonderiyor(false); setTopluGonderildi(true);
    localStorage.setItem(`vet_hatirlatma_${new Date().toISOString().slice(0,10)}`, '1');
    toast.success(`📬 ${basarili} çiftliğe mesaj gönderildi.${hatali > 0 ? ` ${hatali} gönderilemedi.` : ''}`);
    setTimeout(() => setTopluGonderildi(false), 10000);
  };

  const handleOtomatikGunChange = (gun) => {
    setOtomatikGun(gun);
    localStorage.setItem(OTOMATIK_GUN_KEY, String(gun));
    toast.success(`Otomatik hatırlatma: Her ayın ${gun}. günü`);
  };

  const addHizmet = () => setHizmetler(prev => [...prev, { ad: '', miktar: 1, birimFiyat: '' }]);
  const removeHizmet = (i) => setHizmetler(prev => prev.filter((_, idx) => idx !== i));
  const updateHizmet = (i, field, val) => setHizmetler(prev => prev.map((h, idx) => idx === i ? { ...h, [field]: val } : h));
  const toplamFatura = hizmetler.reduce((s, h) => s + (parseFloat(h.birimFiyat) || 0) * (parseFloat(h.miktar) || 1), 0);

  const handleFaturaKes = async (e) => {
    e.preventDefault();
    if (!seciliId || faturaYukleniyor) return;
    const temiz = hizmetler.filter(h => h.ad.trim() && h.birimFiyat > 0);
    if (temiz.length === 0) { toast.error('En az bir hizmet kalemi ekleyin.'); return; }
    setFaturaYukleniyor(true);
    try {
      await api.postVeterinerFatura({ ciftciId: seciliId, aciklama: fModal.aciklama.trim(), vadeTarihi: fModal.vadeTarihi || undefined, hizmetler: temiz });
      toast.success('🧾 Fatura kesildi ve çiftçiye bildirim gönderildi.');
      setModalAcik(false); setFModal({ aciklama: '', vadeTarihi: '' }); setHizmetler([{ ad: '', miktar: 1, birimFiyat: '' }]);
      fetchCari(); fetchDetay(seciliId);
    } catch (err) { toast.error(err.response?.data?.message || 'Oluşturulamadı.'); }
    finally { setFaturaYukleniyor(false); }
  };

  const toplamAlacak = cari.list.reduce((s, r) => s + (r.toplamAlacak || 0), 0);
  const toplamTahsilat = cari.list.reduce((s, r) => s + (r.toplamOdenen || 0), 0);
  const tahsilatOran = toplamAlacak > 0 ? Math.round(toplamTahsilat / toplamAlacak * 100) : 0;
  const borcluSayisi = cari.list.filter(r => (r.bakiye || 0) > 0).length;
  const toplamBorc = cari.list.filter(r => (r.bakiye || 0) > 0).reduce((s, r) => s + (r.bakiye || 0), 0);
  const seciliMusteri = cari.list.find(r => r.ciftciId === seciliId);

  return (
    <Page>
      <VetPageShell
        title="Fatura & Tahsilat"
        subtitle="Müşteri bazında cari takip"
        actions={<>
          <button style={VetBtn.secondary} onClick={handleTopluHatirlatma}>
            📬 Toplu Hatırlatma
          </button>
          <button style={VetBtn.primary} onClick={() => setModalAcik(true)}>
            + Fatura Kes
          </button>
        </>}
      >
      {/* Kötü Polis */}
      <KotuPolisPanel>
        <span className="kp-icon">🚨</span>
        <div className="kp-texts">
          <div className="kp-title">Otomatik Tahsilat Modülü</div>
          <div className="kp-sub">Sistem sizin adınıza borçlu çiftçilere kibarca mesaj atar.</div>
        </div>
        <div className="kp-stats">
          <div className="kp-stat">
            <div className="kp-stat-val">{borcluSayisi}</div>
            <div className="kp-stat-lbl">Borçlu</div>
          </div>
          <div className="kp-stat">
            <div className="kp-stat-val">{toplamBorc.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}₺</div>
            <div className="kp-stat-lbl">Toplam Borç</div>
          </div>
        </div>
        <div className="kp-config">
          <label>Her ayın</label>
          <select value={otomatikGun} onChange={e => handleOtomatikGunChange(Number(e.target.value))}>
            {[1,5,10,15,20,25].map(g => <option key={g} value={g}>{g}. günü</option>)}
          </select>
          <label>oto. gönder</label>
        </div>
        <button className="kp-btn" onClick={handleTopluHatirlatma} disabled={topluGonderiyor || borcluSayisi === 0}>
          {topluGonderiyor ? '📤 Gönderiliyor…' : `📬 ${borcluSayisi} Kişiye Gönder`}
        </button>
        {topluGonderildi && <div className="kp-ok-banner">✅ Hatırlatmalar gönderildi.</div>}
      </KotuPolisPanel>

      {/* Metrics */}
      <MetricRow>
        <MetricCard $primary>
          <div className="mc-icon">💰</div>
          <div className="mc-lbl">Net Alacak Bakiyesi</div>
          <div className="mc-val">{cari.toplamBakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
          <div className="mc-sub">{cari.list.filter(r => r.bakiye > 0).length} müşteride açık</div>
          <div className="mc-bg">💰</div>
        </MetricCard>
        <MetricCard>
          <div className="mc-icon">🧾</div>
          <div className="mc-lbl">Toplam Faturalandı</div>
          <div className="mc-val">{toplamAlacak.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
          <div className="mc-sub">{cari.list.length} müşteri</div>
        </MetricCard>
        <MetricCard>
          <div className="mc-icon">✅</div>
          <div className="mc-lbl">Toplam Tahsilat</div>
          <div className="mc-val" style={{ color: '#16a34a' }}>{toplamTahsilat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
          <div className="mc-sub">%{tahsilatOran} tahsil edildi</div>
        </MetricCard>
        <MetricCard>
          <div className="mc-icon">⏳</div>
          <div className="mc-lbl">Bekleyen Alacak</div>
          <div className="mc-val" style={{ color: '#d97706' }}>{(toplamAlacak - toplamTahsilat).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
          <div className="mc-sub">açık alacak</div>
        </MetricCard>
      </MetricRow>

      {loading ? (
        <EmptyState><div className="icon">⏳</div><strong>Yükleniyor…</strong></EmptyState>
      ) : cari.list.length === 0 ? (
        <EmptyState>
          <div className="icon">🧾</div>
          <strong>Henüz fatura kaydı yok</strong>
          <p>Hastalar panelinde sağlık kaydı girerken "Tutar" doldurun veya sağdan fatura oluşturun.</p>
        </EmptyState>
      ) : (
        <Body>
          <CustomerList>
            <ListHead>
              <h2>🏡 Müşteriler</h2>
              <span className="count">{cari.list.length} kişi</span>
            </ListHead>
            <ListScroll>
              {cari.list.map(row => (
                <CustomerItem key={row.ciftciId} $active={row.ciftciId === seciliId} $b={row.bakiye || 0} onClick={() => secCiftci(row.ciftciId)}>
                  <div className="c-name">{row.isletmeAdi || row.isim || '—'}</div>
                  <div className="c-row">
                    <span className="c-bakiye">{row.bakiye > 0 ? `${row.bakiye?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺ borç` : 'Hesap kapalı'}</span>
                    <span className="c-chip">{row.bakiye > 0 ? '⏳ Açık' : '✅ Tamam'}</span>
                  </div>
                </CustomerItem>
              ))}
            </ListScroll>
          </CustomerList>

          {!seciliId ? (
            <EmptyState>
              <div className="icon">👆</div>
              <strong>Müşteri Seçin</strong>
              <p>Sol listeden bir müşteriye tıklayın; faturalarını, alacak durumunu ve tahsilat formunu görün.</p>
            </EmptyState>
          ) : (
            <DetailArea>
              <DetailCard>
                <CardHead>
                  <h3>{seciliMusteri?.isletmeAdi || seciliMusteri?.isim || '—'} — Cari Hesap</h3>
                  <ActBtn $variant="primary" onClick={() => setModalAcik(true)}>🧾 Fatura Kes</ActBtn>
                  {(seciliMusteri?.bakiye || 0) > 0 && (
                    <ActBtn $variant="warn" onClick={() => handleHatirlatma(seciliId, seciliMusteri?.isletmeAdi || seciliMusteri?.isim)}>📬 Hatırlatma</ActBtn>
                  )}
                </CardHead>
                <SummaryRow>
                  <div className="item">
                    <div className="s-lbl">Toplam Faturalanan</div>
                    <div className="s-val" style={{ color: '#0f172a' }}>{(detay?.toplamAlacak || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                  </div>
                  <div className="item">
                    <div className="s-lbl">Tahsil Edilen</div>
                    <div className="s-val" style={{ color: '#16a34a' }}>{(detay?.toplamOdenen || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                  </div>
                  <div className="item">
                    <div className="s-lbl">Kalan Bakiye</div>
                    <div className="s-val" style={{ color: (detay?.bakiye || 0) > 0 ? '#dc2626' : '#16a34a' }}>
                      {(detay?.bakiye || 0) > 0 ? `${detay.bakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺` : '✅ Kapandı'}
                    </div>
                  </div>
                </SummaryRow>
              </DetailCard>

              <DetailCard>
                <CardHead>
                  <h3>📋 Faturalar & Kalemler</h3>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{(detay?.kalemler || []).length} kalem</span>
                </CardHead>
                {detayLoading ? (
                  <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Yükleniyor…</div>
                ) : (detay?.kalemler || []).length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Bu müşteri için henüz kalem yok.</div>
                ) : (
                  detay.kalemler.map(k => {
                    const kalan = (k.tutar || 0) - (k.odenenTutar || 0);
                    return (
                      <FaturaItem key={k._id} $tip={k.tip}>
                        <div className="fi-icon">{k.tip === 'saglik' ? '🩺' : '🧾'}</div>
                        <div className="fi-body">
                          <div className="fi-aciklama">
                            {k.aciklama || (k.tip === 'saglik' ? 'Sağlık hizmeti' : 'Fatura')}
                            <TipBadge $t={k.tip}>{k.tip === 'saglik' ? 'Sağlık' : 'Manuel'}</TipBadge>
                            <StatusBadge $d={k.durum} $k={kalan} $t={k.tutar}>
                              {k.durum === 'kapali' ? '✅ Ödendi' : kalan > k.tutar * 0.5 ? '🔴 Ödenmedi' : '🟡 Kısmi'}
                            </StatusBadge>
                          </div>
                          <div className="fi-meta">
                            <span>📅 {new Date(k.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            {k.fatura_no && <span>#{k.fatura_no}</span>}
                            {k.vadeTarihi && <span>⏰ Vade: {new Date(k.vadeTarihi).toLocaleDateString('tr-TR')}</span>}
                          </div>
                          {k.hizmetler?.length > 0 && (
                            <HizmetList>
                              {k.hizmetler.map((h, i) => (
                                <div key={i} className="satir">
                                  <span>{h.ad} × {h.miktar}</span>
                                  <span>{(h.birimFiyat * h.miktar).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                                </div>
                              ))}
                            </HizmetList>
                          )}
                        </div>
                        <div className="fi-right">
                          <div className="fi-tutar">{(k.tutar || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                          {k.odenenTutar > 0 && <div className="fi-odenen">✓ {k.odenenTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>}
                          {kalan > 0 && <div className="fi-kalan">{kalan.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺ kalan</div>}
                        </div>
                      </FaturaItem>
                    );
                  })
                )}

                {(detay?.bakiye || 0) > 0 && (
                  <TahsilatForm onSubmit={handleTahsilat}>
                    <h4>💳 Tahsilat Kaydet</h4>
                    <div className="fields">
                      <div className="field">
                        <label>Tutar (₺)</label>
                        <input type="number" min="0.01" step="0.01" value={tahsilatTutar} onChange={e => setTahsilatTutar(e.target.value)} placeholder="0.00" required style={{ width: 120 }} />
                      </div>
                      <div className="field">
                        <label>Ödeme Yöntemi</label>
                        <input type="text" value={tahsilatAciklama} onChange={e => setTahsilatAciklama(e.target.value)} placeholder="Nakit, havale, kart…" style={{ width: 180 }} />
                      </div>
                      <button type="submit" className="submit" disabled={tahsilatYukleniyor || !tahsilatTutar}>
                        {tahsilatYukleniyor ? '…' : '✅ Kaydet'}
                      </button>
                    </div>
                  </TahsilatForm>
                )}
              </DetailCard>
            </DetailArea>
          )}
        </Body>
      )}

      {/* Fatura Modal */}
      {modalAcik && (
        <Overlay onClick={() => setModalAcik(false)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <ModalHead>
              <h3>🧾 Fatura Kes</h3>
              <span className="m-ciftlik">{seciliMusteri?.isletmeAdi || seciliMusteri?.isim}</span>
              <button type="button" className="m-close" onClick={() => setModalAcik(false)}>×</button>
            </ModalHead>
            <form onSubmit={handleFaturaKes}>
              <ModalBody>
                <span className="sec-lbl">Hizmet Kalemleri</span>
                <div style={{ marginBottom: 8, display: 'grid', gridTemplateColumns: '1fr 80px 100px 34px', gap: 8 }}>
                  {['HİZMET / AÇIKLAMA','MİKTAR','BİRİM FİYAT (₺)',''].map((h, i) => (
                    <span key={i} style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', paddingLeft: i === 0 ? 4 : 0 }}>{h}</span>
                  ))}
                </div>
                {hizmetler.map((h, i) => (
                  <HizmetRow key={i}>
                    <input value={h.ad} onChange={e => updateHizmet(i, 'ad', e.target.value)} placeholder="Muayene, aşı, ilaç…" required />
                    <input type="number" min="1" step="1" value={h.miktar} onChange={e => updateHizmet(i, 'miktar', e.target.value)} />
                    <input type="number" min="0" step="0.01" value={h.birimFiyat} onChange={e => updateHizmet(i, 'birimFiyat', e.target.value)} placeholder="0.00" required />
                    <button type="button" className="remove" onClick={() => removeHizmet(i)} disabled={hizmetler.length === 1}>×</button>
                  </HizmetRow>
                ))}
                <AddLineBtn type="button" onClick={addHizmet}>+ Kalem Ekle</AddLineBtn>
                <div style={{ height: 18 }} />
                <span className="sec-lbl">Genel Bilgiler</span>
                <div className="field">
                  <label>Açıklama / Not (opsiyonel)</label>
                  <textarea rows={2} value={fModal.aciklama} onChange={e => setFModal(f => ({ ...f, aciklama: e.target.value }))} placeholder="Fatura açıklaması…" />
                </div>
                <div className="field">
                  <label>Son Ödeme Tarihi (opsiyonel)</label>
                  <input type="date" value={fModal.vadeTarihi} onChange={e => setFModal(f => ({ ...f, vadeTarihi: e.target.value }))} />
                </div>
              </ModalBody>
              <ModalFoot>
                <div className="toplam">Toplam: <span>{toplamFatura.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span></div>
                <div className="actions">
                  <button type="button" className="cancel" onClick={() => setModalAcik(false)}>İptal</button>
                  <button type="submit" className="save" disabled={faturaYukleniyor || toplamFatura === 0}>
                    {faturaYukleniyor ? '…' : '🧾 Faturayı Kes'}
                  </button>
                </div>
              </ModalFoot>
            </form>
          </ModalBox>
        </Overlay>
      )}
      </VetPageShell>
    </Page>
  );
}
