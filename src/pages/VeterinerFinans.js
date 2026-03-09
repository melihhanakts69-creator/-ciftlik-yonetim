import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { toast } from 'react-toastify';
import * as api from '../services/api';

const fadeUp = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;
const slideIn = keyframes`from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); }`;

// ─── Layout ─────────────────────────────────────────────────────────────────
const Page = styled.div`
  font-family: 'Inter', -apple-system, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 64px;
  background: #f8fafc;
  min-height: calc(100vh - 80px);
  animation: ${fadeUp} 0.4s ease;
`;

const PageHeader = styled.header`
  margin-bottom: 24px;
  padding: 22px 28px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  position: relative;
  overflow: hidden;
  &::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 5px; background: linear-gradient(180deg, #0ea5e9, #6366f1);
    border-radius: 10px 0 0 10px;
  }
  .left { padding-left: 8px; }
  .eyebrow { font-size: 11px; font-weight: 800; color: #0ea5e9; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 4px; }
  .title { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
  .desc { font-size: 13px; color: #64748b; margin: 5px 0 0; }
`;

const MetricRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 22px;
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 520px) { grid-template-columns: 1fr; }
`;

const MetricCard = styled.div`
  background: ${p => p.$primary ? 'linear-gradient(135deg,#0ea5e9,#2563eb)' : '#fff'};
  border-radius: 14px;
  padding: 18px 20px;
  border: 1px solid ${p => p.$primary ? 'transparent' : '#e2e8f0'};
  box-shadow: ${p => p.$primary ? '0 10px 28px -8px rgba(37,99,235,0.35)' : '0 2px 8px rgba(0,0,0,0.04)'};
  transition: transform 0.2s;
  &:hover { transform: translateY(-2px); }
  .icon { font-size: 20px; margin-bottom: 8px; }
  .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
    color: ${p => p.$primary ? 'rgba(255,255,255,0.75)' : '#94a3b8'}; margin-bottom: 3px; }
  .value { font-size: 22px; font-weight: 900;
    color: ${p => p.$primary ? '#fff' : (p.$color || '#0f172a')}; letter-spacing: -0.02em; }
  .sub { font-size: 11px; color: ${p => p.$primary ? 'rgba(255,255,255,0.6)' : '#64748b'}; margin-top: 4px; }
`;

const Body = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

// ─── Sol Müşteri Listesi ─────────────────────────────────────────────────────
const CustomerList = styled.div`
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 680px;
`;

const ListHead = styled.div`
  padding: 14px 18px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 8px;
  h2 { margin: 0; font-size: 13px; font-weight: 800; color: #0f172a; flex: 1; }
  .count { font-size: 11px; color: #94a3b8; font-weight: 600; }
`;

const ListScroll = styled.div`
  overflow-y: auto;
  flex: 1;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
`;

const CustomerItem = styled.div`
  padding: 14px 18px;
  cursor: pointer;
  border-bottom: 1px solid #f8fafc;
  transition: all 0.15s;
  position: relative;
  background: ${p => p.$active ? 'linear-gradient(90deg,rgba(14,165,233,0.07),transparent)' : 'transparent'};

  ${p => p.$active && css`
    &::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
      background: linear-gradient(180deg, #0ea5e9, #2563eb); border-radius: 0 3px 3px 0; }
  `}

  &:hover { background: ${p => p.$active ? 'linear-gradient(90deg,rgba(14,165,233,0.07),transparent)' : '#fafbfd'}; }
  &:last-child { border-bottom: none; }

  .name { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row { display: flex; justify-content: space-between; align-items: center; }
  .bakiye-text { font-size: 12px; font-weight: 800;
    color: ${p => p.$b > 500 ? '#dc2626' : p.$b > 100 ? '#d97706' : p.$b > 0 ? '#0ea5e9' : '#16a34a'}; }
  .chip {
    font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 10px;
    background: ${p => p.$b > 0 ? '#fff7ed' : '#f0fdf4'};
    color: ${p => p.$b > 0 ? '#c2410c' : '#16a34a'};
    border: 1px solid ${p => p.$b > 0 ? '#fed7aa' : '#bbf7d0'};
  }
`;

const EmptyList = styled.div`
  padding: 40px 18px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  .icon { font-size: 32px; margin-bottom: 10px; opacity: 0.4; }
`;

// ─── Sağ Detay Panel ─────────────────────────────────────────────────────────
const DetailArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${slideIn} 0.3s ease;
`;

const DetailCard = styled.div`
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
`;

const CardHead = styled.div`
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 10px;
  h3 { margin: 0; font-size: 14px; font-weight: 800; color: #0f172a; flex: 1; }
  button { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; border: none; cursor: pointer;
    transition: all 0.18s; white-space: nowrap; }
  .btn-fatura { background: linear-gradient(135deg,#0ea5e9,#2563eb); color: #fff;
    box-shadow: 0 3px 10px rgba(14,165,233,0.25); }
  .btn-fatura:hover { box-shadow: 0 5px 14px rgba(14,165,233,0.35); transform: translateY(-1px); }
  .btn-hatirlat { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
  .btn-hatirlat:hover { background: #fed7aa; }
`;

const SummaryRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 0;
  .item { padding: 16px 20px; text-align: center; border-right: 1px solid #f1f5f9;
    &:last-child { border-right: none; } }
  .s-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
  .s-value { font-size: 20px; font-weight: 900; color: ${p => p.$color || '#0f172a'}; }
`;

const FaturaList = styled.div``;

const FaturaItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.15s;
  &:last-child { border-bottom: none; }
  &:hover { background: #fafbfd; }

  .tip-icon {
    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 16px;
    background: ${p => p.$tip === 'saglik' ? '#eff6ff' : '#f5f3ff'};
  }

  .body { flex: 1; min-width: 0; }
  .aciklama { font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 3px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .meta { font-size: 11px; color: #94a3b8; display: flex; gap: 10px; }

  .right { text-align: right; flex-shrink: 0; }
  .tutar { font-size: 15px; font-weight: 900; color: #0f172a; }
  .odenen { font-size: 11px; color: #16a34a; margin-top: 2px; }
  .kalan { font-size: 11px; color: #dc2626; margin-top: 2px; }
`;

const StatusBadge = styled.span`
  padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; white-space: nowrap;
  background: ${p => p.$d === 'kapali' ? '#f0fdf4' : p.$k > p.$t * 0.5 ? '#fef2f2' : '#fff7ed'};
  color: ${p => p.$d === 'kapali' ? '#16a34a' : p.$k > p.$t * 0.5 ? '#dc2626' : '#d97706'};
  border: 1px solid ${p => p.$d === 'kapali' ? '#bbf7d0' : p.$k > p.$t * 0.5 ? '#fecaca' : '#fde68a'};
`;

const TipBadge = styled.span`
  padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700;
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
  padding: 18px 20px;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  h4 { margin: 0 0 12px; font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
  .fields { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; }
  .field { display: flex; flex-direction: column; gap: 4px; }
  .field label { font-size: 11px; color: #64748b; font-weight: 700; }
  .field input { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; background: #fff; }
  .field input:focus { outline: none; border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.1); }
  .submit { padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; border: none; cursor: pointer;
    background: linear-gradient(135deg,#0ea5e9,#2563eb); color: #fff; box-shadow: 0 3px 10px rgba(14,165,233,0.22);
    align-self: flex-end; white-space: nowrap; transition: all 0.2s; }
  .submit:hover:not(:disabled) { box-shadow: 0 5px 14px rgba(14,165,233,0.33); transform: translateY(-1px); }
  .submit:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const EmptyDetail = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 340px; background: #fff; border-radius: 14px; border: 1px solid #e2e8f0;
  color: #94a3b8; font-size: 14px; text-align: center; padding: 32px;
  .icon { font-size: 52px; margin-bottom: 14px; opacity: 0.3; }
  strong { display: block; font-size: 16px; color: #475569; margin-bottom: 8px; }
`;

// ─── Fatura Kesme Modal ───────────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(15,23,42,0.45); display: flex; align-items: center;
  justify-content: center; z-index: 1000; padding: 20px;
  backdrop-filter: blur(4px);
`;

const ModalBox = styled.div`
  background: #fff; border-radius: 20px; width: 100%; max-width: 560px; max-height: 90vh;
  overflow-y: auto; box-shadow: 0 25px 60px -15px rgba(0,0,0,0.25);
  animation: ${fadeUp} 0.3s ease;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
`;

const ModalHead = styled.div`
  padding: 20px 24px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px;
  h3 { margin: 0; font-size: 16px; font-weight: 800; color: #0f172a; flex: 1; }
  button { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 22px; line-height: 1; padding: 0 4px; }
  button:hover { color: #ef4444; }
`;

const ModalBody = styled.div`
  padding: 20px 24px;
  .section-label { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 10px; }
  .field { margin-bottom: 14px; }
  .field label { display: block; font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 5px; }
  .field input, .field select, .field textarea {
    width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px;
    font-family: inherit; background: #fafbfc; box-sizing: border-box; resize: vertical;
  }
  .field input:focus, .field select:focus, .field textarea:focus {
    outline: none; border-color: #0ea5e9; background: #fff; box-shadow: 0 0 0 3px rgba(14,165,233,0.1);
  }
`;

const HizmetRow = styled.div`
  display: grid; grid-template-columns: 1fr 80px 100px 32px; gap: 8px; align-items: center; margin-bottom: 8px;
  input { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; width: 100%; box-sizing: border-box; }
  input:focus { outline: none; border-color: #0ea5e9; }
  .remove { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #fecaca; background: #fef2f2;
    color: #dc2626; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
  .remove:hover { background: #fee2e2; }
`;

const AddBtn = styled.button`
  padding: 8px 14px; border-radius: 8px; border: 1px dashed #0ea5e9; background: #f0f9ff;
  color: #0284c7; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.18s; width: 100%;
  &:hover { background: #e0f2fe; }
`;

const ModalFooter = styled.div`
  padding: 16px 24px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between;
  align-items: center; gap: 12px; flex-wrap: wrap;
  .toplam { font-size: 16px; font-weight: 900; color: #0f172a; }
  .toplam span { color: #2563eb; }
  .actions { display: flex; gap: 10px; }
  .cancel { padding: 10px 18px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff;
    color: #475569; font-weight: 700; cursor: pointer; font-size: 13px; }
  .cancel:hover { background: #f8fafc; }
  .save { padding: 10px 22px; border-radius: 10px; border: none; background: linear-gradient(135deg,#0ea5e9,#2563eb);
    color: #fff; font-weight: 800; cursor: pointer; font-size: 13px; box-shadow: 0 4px 12px rgba(14,165,233,0.25); }
  .save:hover:not(:disabled) { box-shadow: 0 6px 18px rgba(14,165,233,0.35); transform: translateY(-1px); }
  .save:disabled { opacity: 0.5; cursor: not-allowed; }
`;

// ─── Kötü Polis Styled ────────────────────────────────────────────────────────
const KotuPolisPanel = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 22px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute; top: -20px; right: -20px;
    width: 120px; height: 120px; border-radius: 50%;
    background: rgba(239,68,68,0.08);
  }

  .kp-icon { font-size: 32px; flex-shrink: 0; z-index: 1; }

  .kp-texts { flex: 1; z-index: 1; }
  .kp-title { font-size: 15px; font-weight: 900; color: #fff; margin-bottom: 2px; }
  .kp-sub   { font-size: 12px; color: rgba(255,255,255,0.5); }

  .kp-config { display: flex; align-items: center; gap: 8px; z-index: 1; }
  .kp-config label { font-size: 12px; color: rgba(255,255,255,0.6); white-space: nowrap; }
  .kp-config select {
    padding: 7px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.1); color: #fff; font-size: 13px; font-weight: 700;
    cursor: pointer;
    option { background: #1e293b; }
  }

  .kp-stats { display: flex; gap: 16px; z-index: 1; }
  .kp-stat { text-align: center; }
  .kp-stat-val { font-size: 18px; font-weight: 900; color: #f87171; }
  .kp-stat-lbl { font-size: 10px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.06em; }

  .kp-btn {
    padding: 10px 18px; border-radius: 10px; border: none;
    background: #ef4444; color: #fff;
    font-size: 13px; font-weight: 800; cursor: pointer;
    transition: all 0.2s; white-space: nowrap; z-index: 1;
    box-shadow: 0 4px 14px rgba(239,68,68,0.35);
    &:hover:not(:disabled) { background: #dc2626; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(239,68,68,0.45); }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }

  .kp-ok-banner {
    width: 100%; padding: 10px 14px; border-radius: 10px;
    background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.25);
    color: #4ade80; font-size: 12px; font-weight: 700;
    text-align: center; z-index: 1;
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────
const OTOMATIK_GUN_KEY = 'vet_otomatik_hatirlatma_gun';

export default function VeterinerFinans() {
  const [cari, setCari] = useState({ list: [], toplamBakiye: 0 });
  const [loading, setLoading] = useState(true);
  const [seciliId, setSeciliId] = useState(null);
  const [detay, setDetay] = useState(null);
  const [detayLoading, setDetayLoading] = useState(false);

  // Tahsilat
  const [tahsilatTutar, setTahsilatTutar] = useState('');
  const [tahsilatAciklama, setTahsilatAciklama] = useState('');
  const [tahsilatYukleniyor, setTahsilatYukleniyor] = useState(false);

  // Fatura modal
  const [modalAcik, setModalAcik] = useState(false);
  const [fModal, setFModal] = useState({ aciklama: '', vadeTarihi: '' });
  const [hizmetler, setHizmetler] = useState([{ ad: '', miktar: 1, birimFiyat: '' }]);
  const [faturaYukleniyor, setFaturaYukleniyor] = useState(false);

  // Kötü Polis
  const [topluGonderiyor, setTopluGonderiyor] = useState(false);
  const [otomatikGun, setOtomatikGun] = useState(() => {
    try { return parseInt(localStorage.getItem(OTOMATIK_GUN_KEY) || '15', 10); } catch { return 15; }
  });
  const [topluGonderildi, setTopluGonderildi] = useState(false);

  // Otomatik hatırlatma: bugün ayarlanmış günse sayfa açıldığında bildir
  useEffect(() => {
    const bugunGun = new Date().getDate();
    if (bugunGun === otomatikGun) {
      const bugunKey = `vet_hatirlatma_${new Date().toISOString().slice(0,10)}`;
      if (!localStorage.getItem(bugunKey)) {
        toast.info(`📅 Bugün otomatik hatırlatma günü (ayın ${otomatikGun}.)! Borçlu çiftçilere mesaj göndermek için "Tümüne Gönder" butonuna basın.`, { autoClose: 8000 });
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
    } catch (err) { toast.error(err.response?.data?.message || 'Tahsilat kaydedilemedi.'); }
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
    if (!window.confirm(`${borcluList.length} borçlu çiftliğe otomatik hatırlatma mesajı gönderilecek. Onaylıyor musunuz?`)) return;
    setTopluGonderiyor(true);
    let basarili = 0;
    let hatali = 0;
    for (const row of borcluList) {
      try {
        await api.postVeterinerHatirlatma(row.ciftciId);
        basarili++;
      } catch { hatali++; }
    }
    setTopluGonderiyor(false);
    setTopluGonderildi(true);
    const bugunKey = `vet_hatirlatma_${new Date().toISOString().slice(0,10)}`;
    localStorage.setItem(bugunKey, '1');
    toast.success(`📬 ${basarili} çiftliğe mesaj gönderildi.${hatali > 0 ? ` ${hatali} gönderilemedi.` : ''}`);
    setTimeout(() => setTopluGonderildi(false), 10000);
  };

  const handleOtomatikGunChange = (gun) => {
    setOtomatikGun(gun);
    localStorage.setItem(OTOMATIK_GUN_KEY, String(gun));
    toast.success(`Otomatik hatırlatma günü ayarlandı: Her ayın ${gun}.`);
  };

  const addHizmet = () => setHizmetler(prev => [...prev, { ad: '', miktar: 1, birimFiyat: '' }]);
  const removeHizmet = (i) => setHizmetler(prev => prev.filter((_, idx) => idx !== i));
  const updateHizmet = (i, field, val) => setHizmetler(prev => prev.map((h, idx) => idx === i ? { ...h, [field]: val } : h));

  const toplamFatura = hizmetler.reduce((s, h) => s + (parseFloat(h.birimFiyat) || 0) * (parseFloat(h.miktar) || 1), 0);

  const handleFaturaKes = async (e) => {
    e.preventDefault();
    if (!seciliId || faturaYukleniyor) return;
    const temizHizmetler = hizmetler.filter(h => h.ad.trim() && h.birimFiyat > 0);
    if (temizHizmetler.length === 0) { toast.error('En az bir hizmet kalemi ekleyin.'); return; }
    setFaturaYukleniyor(true);
    try {
      await api.postVeterinerFatura({
        ciftciId: seciliId,
        aciklama: fModal.aciklama.trim(),
        vadeTarihi: fModal.vadeTarihi || undefined,
        hizmetler: temizHizmetler,
      });
      toast.success('🧾 Fatura kesildi ve çiftçiye bildirim gönderildi.');
      setModalAcik(false);
      setFModal({ aciklama: '', vadeTarihi: '' });
      setHizmetler([{ ad: '', miktar: 1, birimFiyat: '' }]);
      fetchCari(); fetchDetay(seciliId);
    } catch (err) { toast.error(err.response?.data?.message || 'Fatura oluşturulamadı.'); }
    finally { setFaturaYukleniyor(false); }
  };

  const toplamAlacak = cari.list.reduce((s, r) => s + (r.toplamAlacak || 0), 0);
  const toplamTahsilat = cari.list.reduce((s, r) => s + (r.toplamOdenen || 0), 0);
  const tahsilatOran = toplamAlacak > 0 ? Math.round(toplamTahsilat / toplamAlacak * 100) : 0;
  const buAy = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  const seciliMusteri = cari.list.find(r => r.ciftciId === seciliId);

  return (
    <Page>
      <PageHeader>
        <div className="left">
          <p className="eyebrow">Finans</p>
          <h1 className="title">Fatura ve Tahsilat</h1>
          <p className="desc">Müşteri bazında fatura kesilebilir; alacak ve verecek takibi yapılabilir. {buAy}</p>
        </div>
      </PageHeader>

      {/* ─── KÖTÜ POLİS MODÜLÜ ─── */}
      {(() => {
        const borcluSayisi = cari.list.filter(r => (r.bakiye || 0) > 0).length;
        const toplamBorc = cari.list.filter(r => (r.bakiye || 0) > 0).reduce((s, r) => s + (r.bakiye || 0), 0);
        return (
          <KotuPolisPanel>
            <span className="kp-icon">🚨</span>
            <div className="kp-texts">
              <div className="kp-title">Kötü Polis — Otomatik Tahsilat Modülü</div>
              <div className="kp-sub">
                Sistem sizin adınıza borçlu çiftçilere kibarca mesaj atar. Yüz yüze bakmanıza gerek yok.
              </div>
            </div>
            <div className="kp-stats">
              <div className="kp-stat">
                <div className="kp-stat-val">{borcluSayisi}</div>
                <div className="kp-stat-lbl">Borçlu</div>
              </div>
              <div className="kp-stat">
                <div className="kp-stat-val">{toplamBorc.toLocaleString('tr-TR',{maximumFractionDigits:0})}₺</div>
                <div className="kp-stat-lbl">Toplam Borç</div>
              </div>
            </div>
            <div className="kp-config">
              <label>Her ayın</label>
              <select
                value={otomatikGun}
                onChange={e => handleOtomatikGunChange(Number(e.target.value))}
              >
                {[1,5,10,15,20,25].map(g => (
                  <option key={g} value={g}>{g}. günü</option>
                ))}
              </select>
              <label>oto. gönder</label>
            </div>
            <button
              className="kp-btn"
              onClick={handleTopluHatirlatma}
              disabled={topluGonderiyor || borcluSayisi === 0}
            >
              {topluGonderiyor ? '📤 Gönderiliyor…' : `📬 ${borcluSayisi} Kişiye Gönder`}
            </button>
            {topluGonderildi && (
              <div className="kp-ok-banner">
                ✅ Hatırlatmalar gönderildi — çiftçiler bilgilendirildi. Bir sonraki gönderim: ayın {otomatikGun}.
              </div>
            )}
          </KotuPolisPanel>
        );
      })()}

      <MetricRow>
        <MetricCard $primary>
          <div className="icon">💰</div>
          <div className="label">Net alacak bakiyesi</div>
          <div className="value">{cari.toplamBakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
          <div className="sub">{cari.list.filter(r => r.bakiye > 0).length} müşteride açık</div>
        </MetricCard>
        <MetricCard>
          <div className="icon">🧾</div>
          <div className="label">Toplam faturalandı</div>
          <div className="value" style={{ color: '#0f172a' }}>{toplamAlacak.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
          <div className="sub">{cari.list.length} müşteri</div>
        </MetricCard>
        <MetricCard>
          <div className="icon">✅</div>
          <div className="label">Toplam tahsilat</div>
          <div className="value" style={{ color: '#16a34a' }}>{toplamTahsilat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
          <div className="sub">{tahsilatOran}% tahsil edildi</div>
        </MetricCard>
        <MetricCard>
          <div className="icon">⏳</div>
          <div className="label">Tahsilat bekleyen</div>
          <div className="value" style={{ color: '#d97706' }}>{(toplamAlacak - toplamTahsilat).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
          <div className="sub">açık alacak</div>
        </MetricCard>
      </MetricRow>

      {loading ? (
        <EmptyDetail><div className="icon">⏳</div><strong>Yükleniyor…</strong></EmptyDetail>
      ) : cari.list.length === 0 ? (
        <EmptyDetail>
          <div className="icon">🧾</div>
          <strong>Henüz fatura kaydı yok</strong>
          Hastalar panelinde sağlık kaydı girerken "Tutar (TL)" doldurduğunuzda veya aşağıdan "Fatura Kes" ile fatura oluşturduğunuzda burada listelenir.
        </EmptyDetail>
      ) : (
        <Body>
          {/* Sol: Müşteri Listesi */}
          <CustomerList>
            <ListHead>
              <h2>🏡 Müşteriler</h2>
              <span className="count">{cari.list.length} kişi</span>
            </ListHead>
            <ListScroll>
              {cari.list.map(row => (
                <CustomerItem
                  key={row.ciftciId}
                  $active={row.ciftciId === seciliId}
                  $b={row.bakiye || 0}
                  onClick={() => secCiftci(row.ciftciId)}
                >
                  <div className="name">{row.isletmeAdi || row.isim || '—'}</div>
                  <div className="row">
                    <span className="bakiye-text">
                      {row.bakiye > 0 ? `${row.bakiye?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺ borç` : 'Hesap kapalı'}
                    </span>
                    <span className="chip">{row.bakiye > 0 ? '⏳ Açık' : '✅ Tamam'}</span>
                  </div>
                </CustomerItem>
              ))}
            </ListScroll>
          </CustomerList>

          {/* Sağ: Detay */}
          {!seciliId ? (
            <EmptyDetail>
              <div className="icon">👆</div>
              <strong>Müşteri seçin</strong>
              Sol listeden bir müşteriye tıklayın; faturalarını, alacak/verecek durumunu ve tahsilat formunu görün.
            </EmptyDetail>
          ) : (
            <DetailArea>
              {/* Üst özet */}
              <DetailCard>
                <CardHead>
                  <h3>
                    {seciliMusteri?.isletmeAdi || seciliMusteri?.isim || '—'}
                    <span style={{ fontWeight: 500, color: '#94a3b8', fontSize: 13, marginLeft: 8 }}>— cari hesap</span>
                  </h3>
                  <button type="button" className="btn-fatura" onClick={() => setModalAcik(true)}>🧾 Fatura Kes</button>
                  {(seciliMusteri?.bakiye || 0) > 0 && (
                    <button type="button" className="btn-hatirlat" onClick={() => handleHatirlatma(seciliId, seciliMusteri?.isletmeAdi || seciliMusteri?.isim)}>
                      📬 Hatırlatma
                    </button>
                  )}
                </CardHead>
                <SummaryRow>
                  <div className="item">
                    <div className="s-label">Toplam faturalanan</div>
                    <div className="s-value" style={{ color: '#0f172a' }}>
                      {(detay?.toplamAlacak || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </div>
                  </div>
                  <div className="item">
                    <div className="s-label">Tahsil edilen</div>
                    <div className="s-value" style={{ color: '#16a34a' }}>
                      {(detay?.toplamOdenen || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </div>
                  </div>
                  <div className="item">
                    <div className="s-label">Kalan bakiye</div>
                    <div className="s-value" style={{ color: (detay?.bakiye || 0) > 0 ? '#dc2626' : '#16a34a' }}>
                      {(detay?.bakiye || 0) > 0
                        ? `${detay.bakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`
                        : '✅ Kapandı'}
                    </div>
                  </div>
                </SummaryRow>
              </DetailCard>

              {/* Fatura listesi */}
              <DetailCard>
                <CardHead>
                  <h3>📋 Faturalar ve kalemler</h3>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{(detay?.kalemler || []).length} kalem</span>
                </CardHead>
                {detayLoading ? (
                  <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Yükleniyor…</div>
                ) : (detay?.kalemler || []).length === 0 ? (
                  <EmptyList>
                    <div className="icon">🧾</div>
                    <p>Bu müşteri için henüz kalem yok.</p>
                  </EmptyList>
                ) : (
                  <FaturaList>
                    {detay.kalemler.map(k => {
                      const kalan = (k.tutar || 0) - (k.odenenTutar || 0);
                      return (
                        <FaturaItem key={k._id} $tip={k.tip}>
                          <div className="tip-icon">{k.tip === 'saglik' ? '🩺' : '🧾'}</div>
                          <div className="body">
                            <div className="aciklama">
                              {k.aciklama || (k.tip === 'saglik' ? 'Sağlık hizmeti' : 'Fatura')}
                              <TipBadge $t={k.tip}>{k.tip === 'saglik' ? 'Sağlık' : 'Manuel'}</TipBadge>
                              <StatusBadge $d={k.durum} $k={kalan} $t={k.tutar}>
                                {k.durum === 'kapali' ? '✅ Ödendi' : kalan > k.tutar * 0.5 ? '🔴 Ödenmedi' : '🟡 Kısmi'}
                              </StatusBadge>
                            </div>
                            <div className="meta">
                              <span>📅 {new Date(k.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              {k.fatura_no && <span>#{k.fatura_no}</span>}
                              {k.vadeTarihi && <span>⏰ Vade: {new Date(k.vadeTarihi).toLocaleDateString('tr-TR')}</span>}
                            </div>
                            {k.hizmetler && k.hizmetler.length > 0 && (
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
                          <div className="right">
                            <div className="tutar">{(k.tutar || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                            {k.odenenTutar > 0 && <div className="odenen">✓ {k.odenenTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>}
                            {kalan > 0 && <div className="kalan">{kalan.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺ kalan</div>}
                          </div>
                        </FaturaItem>
                      );
                    })}
                  </FaturaList>
                )}

                {/* Tahsilat formu */}
                {(detay?.bakiye || 0) > 0 && (
                  <TahsilatForm onSubmit={handleTahsilat}>
                    <h4>💳 Tahsilat kaydet</h4>
                    <div className="fields">
                      <div className="field">
                        <label>Tutar (₺)</label>
                        <input type="number" min="0.01" step="0.01" value={tahsilatTutar}
                          onChange={e => setTahsilatTutar(e.target.value)} placeholder="0.00" required style={{ width: 110 }} />
                      </div>
                      <div className="field">
                        <label>Ödeme yöntemi</label>
                        <input type="text" value={tahsilatAciklama}
                          onChange={e => setTahsilatAciklama(e.target.value)}
                          placeholder="Nakit, havale, kart…" style={{ width: 170 }} />
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

      {/* Fatura Kesme Modal */}
      {modalAcik && (
        <ModalOverlay onClick={() => setModalAcik(false)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <ModalHead>
              <h3>🧾 Fatura Kes</h3>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                {seciliMusteri?.isletmeAdi || seciliMusteri?.isim}
              </span>
              <button type="button" onClick={() => setModalAcik(false)}>×</button>
            </ModalHead>
            <form onSubmit={handleFaturaKes}>
              <ModalBody>
                <p className="section-label">Hizmet kalemleri</p>
                <div style={{ marginBottom: 4, display: 'grid', gridTemplateColumns: '1fr 80px 100px 32px', gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', paddingLeft: 4 }}>HİZMET / AÇIKLAMA</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>MİKTAR</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>BİRİM FİYAT (₺)</span>
                  <span />
                </div>
                {hizmetler.map((h, i) => (
                  <HizmetRow key={i}>
                    <input value={h.ad} onChange={e => updateHizmet(i, 'ad', e.target.value)}
                      placeholder="Muayene, aşı, ilaç…" required />
                    <input type="number" min="1" step="1" value={h.miktar}
                      onChange={e => updateHizmet(i, 'miktar', e.target.value)} />
                    <input type="number" min="0" step="0.01" value={h.birimFiyat}
                      onChange={e => updateHizmet(i, 'birimFiyat', e.target.value)} placeholder="0.00" required />
                    <button type="button" className="remove" onClick={() => removeHizmet(i)} disabled={hizmetler.length === 1}>×</button>
                  </HizmetRow>
                ))}
                <AddBtn type="button" onClick={addHizmet}>+ Kalem ekle</AddBtn>

                <div style={{ height: 16 }} />
                <p className="section-label">Genel bilgiler</p>
                <div className="field">
                  <label>Açıklama / Not (opsiyonel)</label>
                  <textarea rows={2} value={fModal.aciklama}
                    onChange={e => setFModal(f => ({ ...f, aciklama: e.target.value }))}
                    placeholder="Fatura açıklaması…" />
                </div>
                <div className="field">
                  <label>Son ödeme tarihi (opsiyonel)</label>
                  <input type="date" value={fModal.vadeTarihi}
                    onChange={e => setFModal(f => ({ ...f, vadeTarihi: e.target.value }))} />
                </div>
              </ModalBody>
              <ModalFooter>
                <div className="toplam">Toplam: <span>{toplamFatura.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span></div>
                <div className="actions">
                  <button type="button" className="cancel" onClick={() => setModalAcik(false)}>İptal</button>
                  <button type="submit" className="save" disabled={faturaYukleniyor || toplamFatura === 0}>
                    {faturaYukleniyor ? '…' : '🧾 Faturayı Kes'}
                  </button>
                </div>
              </ModalFooter>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}
    </Page>
  );
}
