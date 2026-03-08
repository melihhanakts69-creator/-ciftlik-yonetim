import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';

const Page = styled.div`
  font-family: 'Inter', -apple-system, sans-serif;
  color: #1a1a1a;
  display: flex;
  height: calc(100vh - 60px);
  min-height: 400px;
  background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
  position: relative;
  overflow: hidden;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: -50%; left: -50%; width: 200%; height: 200%;
    background: 
      radial-gradient(circle at 20% 30%, rgba(14, 165, 233, 0.08) 0%, transparent 25%),
      radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 25%);
    z-index: -1;
    pointer-events: none;
  }
  @media (max-width: 900px) { flex-direction: column; height: auto; min-height: auto; }
`;

const Sidebar = styled.aside`
  width: 340px;
  min-width: 300px;
  background: #fff;
  border-right: 1px solid #e0f2fe;
  box-shadow: 4px 0 24px rgba(14, 165, 233, 0.06);
  display: flex;
  flex-direction: column;
  @media (max-width: 900px) { width: 100%; border-right: none; border-bottom: 1px solid #e0f2fe; max-height: 40vh; box-shadow: 0 4px 24px rgba(14, 165, 233, 0.06); }
`;

const SidebarHeader = styled.div`
  padding: 28px 24px 20px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  .title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 6px; letter-spacing: -0.02em; }
  .title-sub { font-size: 13px; color: #3b82f6; font-weight: 700; }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 16px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 14px;
  box-sizing: border-box;
  background: #f8fafc;
  margin-top: 16px;
  transition: all 0.2s;
  &:focus { outline: none; border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
  &::placeholder { color: #94a3b8; font-weight: 500;}
`;

const FarmList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
`;

const FarmItem = styled.div`
  padding: 20px 22px;
  margin-bottom: 12px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  ${p => p.$active ? `
    background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); 
    border-color: #7dd3fc; 
    box-shadow: 0 4px 15px rgba(14, 165, 233, 0.2);
    transform: translateY(-2px);
  ` : `
    background: #fff;
    border-color: #f1f5f9;
  `}
  &:hover { 
    ${p => !p.$active && `
      background: #f8fafc; 
      border-color: #e2e8f0; 
      transform: translateX(4px);
    `}
  }
  .name { font-weight: 800; color: #0f172a; font-size: 15px; }
  .sub { font-size: 13px; color: #64748b; margin-top: 6px; font-weight: 500;}
`;

const AddFarmBlock = styled.div`
  padding: 18px 22px;
  border-top: 1px solid #e0f2fe;
  background: #fafafa;
  .btn { width: 100%; padding: 12px 16px; border: 1px dashed #bae6fd; border-radius: 10px; background: #fff; color: #0369a1; font-size: 13px; font-weight: 600; cursor: pointer; margin-bottom: 8px; transition: all 0.2s; }
  .btn:last-child { margin-bottom: 0; }
  .btn:hover { border-color: #0ea5e9; color: #0c4a6e; background: #f0f9ff; }
  .btnRow { display: flex; flex-direction: column; gap: 8px; }
  form { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
  form input { flex: 1; min-width: 120px; padding: 10px 12px; border: 1px solid #e0f2fe; border-radius: 10px; font-size: 13px; }
  form button { padding: 10px 16px; border-radius: 10px; border: none; background: #0ea5e9; color: white; font-weight: 600; font-size: 13px; cursor: pointer; }
  .formLabel { font-size: 11px; color: #64748b; margin-bottom: 4px; font-weight: 600; }
`;

const DetailPanel = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #f8fafc;
  padding: 32px 40px;
  @media (max-width: 900px) { min-height: 50vh; padding: 24px; }
`;

const EmptyDetail = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  color: #64748b;
  font-size: 15px;
  text-align: center;
  padding: 32px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  border: 2px dashed #cbd5e1;
  margin: 0 16px;
  font-weight: 500;
`;

const DetailHeader = styled.div`
  margin-bottom: 32px;
  padding: 32px 36px;
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
  border-radius: 24px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  .farm-name { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 8px; letter-spacing: -0.02em; }
  .farm-sub { font-size: 15px; color: #64748b; font-weight: 500;}
`;

const Block = styled.section`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 24px;
  padding: 32px 36px;
  margin-bottom: 24px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.03);
  h4 { font-size: 13px; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 20px; display: flex; align-items: center; gap: 8px;}
  h4::before { content: ''; display: block; width: 6px; height: 6px; border-radius: 50%; background: #3b82f6; }
`;

const HayvanFiltreRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  .kategori-wrap { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .kategori-wrap span { font-size: 12px; font-weight: 600; color: #64748b; margin-right: 4px; }
  .kategori-btn {
    padding: 8px 14px;
    border-radius: 10px;
    border: 1px solid #e0f2fe;
    background: #fff;
    color: #0369a1;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .kategori-btn:hover { background: #f0f9ff; border-color: #0ea5e9; }
  .kategori-btn.active { background: #0ea5e9; color: #fff; border-color: #0ea5e9; }
  .kupe-search { flex: 1; min-width: 180px; max-width: 260px; padding: 10px 14px; border: 1px solid #e0f2fe; border-radius: 10px; font-size: 13px; }
  .kupe-search:focus { outline: none; border-color: #0ea5e9; }
  .kupe-search::placeholder { color: #94a3b8; }
`;

const AnimalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
  gap: 16px;
`;

const AnimalCard = styled.div`
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 16px;
  padding: 24px;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover { box-shadow: 0 10px 30px rgba(14, 165, 233, 0.12); border-color: #bae6fd; transform: translateY(-4px); background: #fff;}
  .row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  .kupe { font-weight: 800; color: #0f172a; font-size: 16px; }
  .tag { font-size: 12px; padding: 6px 12px; border-radius: 20px; background: #e0f2fe; color: #0284c7; font-weight: 700; text-transform: capitalize;}
  .info { font-size: 14px; color: #64748b; margin-bottom: 20px; font-weight: 500;}
  .actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .actions button { padding: 12px 16px; border-radius: 12px; border: none; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; flex: 1; display:flex; justify-content:center;}
  .btn-saglik { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);}
  .btn-saglik:hover { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3);}
  .btn-tohum { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #fff; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);}
  .btn-tohum:hover { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(59, 130, 246, 0.3);}
`;

const KayitList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const KayitItem = styled.div`
  padding: 14px 0;
  border-bottom: 1px solid #f0f9ff;
  &:last-child { border-bottom: none; }
  transition: background 0.15s;
  &:hover { background: #f8fafc; }
  .line1 { font-size: 14px; font-weight: 600; color: #0f172a; }
  .line2 { font-size: 12px; color: #64748b; margin-top: 4px; }
`;

const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
`;

const ModalBox = styled.div`
  background: #fff; width: 100%; max-width: 520px; border-radius: 14px; box-shadow: 0 24px 48px rgba(0,0,0,0.18);
  overflow: hidden;
  .modal-header { background: #f8fafc; padding: 18px 24px; border-bottom: 1px solid #e5e7eb; }
  .modal-header h2 { margin: 0; font-size: 17px; font-weight: 700; color: #111827; }
  .modal-header .sub { font-size: 13px; color: #6b7280; margin-top: 4px; }
  .modal-body { padding: 24px; }
  .hayvan-badge { display: inline-flex; align-items: center; gap: 8px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 10px 14px; border-radius: 8px; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
  .hayvan-badge .tip { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.9; }
  .form-section { margin-bottom: 20px; }
  .form-section-title { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
  .form-group { margin-bottom: 16px; }
  .form-group:last-child { margin-bottom: 0; }
  .form-group label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
  .form-group input, .form-group textarea { width: 100%; padding: 12px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box; transition: border-color 0.2s; }
  .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #2563eb; }
  .form-group textarea { min-height: 80px; resize: vertical; }
  .modal-footer { padding: 0 24px 24px; display: flex; gap: 12px; }
  .btn-submit { flex: 2; background: #2563eb; color: white; border: none; padding: 14px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .btn-submit:hover { background: #1d4ed8; }
  .btn-cancel { flex: 1; background: #f3f4f6; color: #374151; border: none; padding: 14px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .btn-cancel:hover { background: #e5e7eb; }
`;

const tipEtiket = { hastalik: 'Hastalık', tedavi: 'Tedavi', asi: 'Aşı', muayene: 'Muayene', ameliyat: 'Ameliyat', dogum_komplikasyonu: 'Doğum' };

export default function Hastalar() {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const [musteriler, setMusteriler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [arama, setArama] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [hayvanlar, setHayvanlar] = useState([]);
  const [saglikKayitlari, setSaglikKayitlari] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [addMode, setAddMode] = useState('kod');
  const [addKod, setAddKod] = useState('');
  const [addId, setAddId] = useState('');
  const [adding, setAdding] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [secilenHayvan, setSecilenHayvan] = useState(null);
  const [islemTipi, setIslemTipi] = useState('hastalik');
  const [formData, setFormData] = useState({ tani: '', tedavi: '', ilacAd: '', notlar: '' });
  const [hayvanKategori, setHayvanKategori] = useState('');
  const [hayvanKupeArama, setHayvanKupeArama] = useState('');

  const filteredMusteriler = useMemo(() => {
    if (!arama.trim()) return musteriler;
    const q = arama.trim().toLowerCase();
    return musteriler.filter(m =>
      (m.isletmeAdi || '').toLowerCase().includes(q) ||
      (m.isim || '').toLowerCase().includes(q) ||
      (m.sehir || '').toLowerCase().includes(q)
    );
  }, [musteriler, arama]);

  const selectedMusteri = useMemo(() => musteriler.find(m => m._id === selectedId), [musteriler, selectedId]);

  const filteredHayvanlar = useMemo(() => {
    let list = hayvanlar;
    if (hayvanKategori) list = list.filter(h => h.tip === hayvanKategori);
    if (hayvanKupeArama.trim()) {
      const q = hayvanKupeArama.trim().toLowerCase();
      list = list.filter(h => (h.kupeNo || '').toLowerCase().includes(q) || (h.isim || '').toLowerCase().includes(q));
    }
    return list;
  }, [hayvanlar, hayvanKategori, hayvanKupeArama]);

  const fetchMusteriler = async () => {
    try {
      const res = await api.getVeterinerMusteriler();
      setMusteriler(res.data || []);
    } catch (e) {
      toast.error('Müşteriler alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMusteriler(); }, []);

  useEffect(() => {
    if (urlId && urlId !== selectedId) setSelectedId(urlId);
  }, [urlId]);

  const selectFarm = (id) => {
    setSelectedId(id);
    if (id) navigate(`/hastalar/${id}`, { replace: true });
    else navigate('/hastalar', { replace: true });
  };

  useEffect(() => {
    setHayvanKategori('');
    setHayvanKupeArama('');
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setHayvanlar([]);
      setSaglikKayitlari([]);
      return;
    }
    setDetailLoading(true);
    Promise.all([
      api.getMusteriHayvanlar(selectedId),
      api.getVeterinerMusteriSaglikKayitlari(selectedId)
    ])
      .then(([hRes, sRes]) => {
        const data = hRes.data || {};
        const all = [
          ...(data.inekler || []).map(x => ({ ...x, tip: 'inek' })),
          ...(data.buzagilar || []).map(x => ({ ...x, tip: 'buzagi' })),
          ...(data.duveler || []).map(x => ({ ...x, tip: 'duve' })),
          ...(data.tosunlar || []).map(x => ({ ...x, tip: 'tosun' }))
        ];
        setHayvanlar(all);
        setSaglikKayitlari(sRes.data || []);
      })
      .catch(() => {
        setHayvanlar([]);
        setSaglikKayitlari([]);
      })
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  const handleAddFarmByKod = async (e) => {
    e.preventDefault();
    const kod = addKod.trim().toUpperCase();
    if (!kod) { toast.warning('Çiftlik kodu girin.'); return; }
    setAdding(true);
    try {
      await api.veterinerMusteriEkleKod(kod);
      toast.success('Çiftlik eklendi.');
      setAddKod('');
      setShowAddFarm(false);
      fetchMusteriler();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Eklenemedi.');
    } finally {
      setAdding(false);
    }
  };

  const handleAddFarmById = async (e) => {
    e.preventDefault();
    const id = addId.trim();
    if (!id) { toast.warning('Çiftçi ID girin.'); return; }
    setAdding(true);
    try {
      await api.veterinerMusteriEkle(id);
      toast.success('Çiftlik eklendi.');
      setAddId('');
      setShowAddFarm(false);
      fetchMusteriler();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Eklenemedi.');
    } finally {
      setAdding(false);
    }
  };

  const closeAddFarm = () => {
    setShowAddFarm(false);
    setAddKod('');
    setAddId('');
  };

  const openModal = (tip, hayvan) => {
    setIslemTipi(tip);
    setSecilenHayvan(hayvan);
    setFormData({ tani: '', tedavi: '', ilacAd: '', notlar: '' });
    setModalOpen(true);
  };

  const handleKayitSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId || !secilenHayvan) return;
    try {
      const payload = {
        hayvanTipi: secilenHayvan.tip,
        hayvanIsim: secilenHayvan.isim || '',
        hayvanKupeNo: secilenHayvan.kupeNo || '',
        tip: islemTipi === 'tohumlama' ? 'muayene' : 'hastalik',
        tani: islemTipi === 'tohumlama' ? 'Suni Tohumlama' : formData.tani,
        tedavi: islemTipi === 'tohumlama' ? formData.ilacAd : formData.tedavi,
        ilaclar: formData.ilacAd ? [{ ilacAdi: formData.ilacAd }] : [],
        notlar: formData.notlar
      };
      await api.postMusteriHayvanSaglik(selectedId, secilenHayvan._id, payload);
      toast.success('Kayıt eklendi, çiftçiye bildirildi.');
      setModalOpen(false);
      const sRes = await api.getVeterinerMusteriSaglikKayitlari(selectedId);
      setSaglikKayitlari(sRes.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'İşlem başarısız.');
    }
  };

  return (
    <Page>
      <Sidebar>
        <SidebarHeader>
          <h2 className="title">Hastalar</h2>
          <p className="title-sub">Çiftlikler & müşteri yönetimi</p>
          <SearchInput
            type="text"
            value={arama}
            onChange={e => setArama(e.target.value)}
            placeholder="İsim veya çiftlik ara..."
          />
        </SidebarHeader>
        <FarmList>
          {loading ? (
            <div style={{ padding: 20, color: '#6b7280', fontSize: 14 }}>Yükleniyor…</div>
          ) : filteredMusteriler.length === 0 ? (
            <div style={{ padding: 20, color: '#6b7280', fontSize: 14 }}>
              {arama.trim() ? 'Eşleşme yok.' : 'Henüz çiftlik eklenmedi.'}
            </div>
          ) : (
            filteredMusteriler.map(m => (
              <FarmItem key={m._id} $active={selectedId === m._id} onClick={() => selectFarm(m._id)}>
                <div className="name">{m.isletmeAdi || m.isim || 'İsimsiz'}</div>
                <div className="sub">{m.isim} {m.sehir ? `· ${m.sehir}` : ''}</div>
              </FarmItem>
            ))
          )}
        </FarmList>
        <AddFarmBlock>
          {!showAddFarm ? (
            <div className="btnRow">
              <button type="button" className="btn" onClick={() => { setAddMode('kod'); setShowAddFarm(true); }}>+ Çiftlik kodu ile ekle</button>
              <button type="button" className="btn" onClick={() => { setAddMode('id'); setShowAddFarm(true); }}>+ Çiftçi ID ile ekle</button>
            </div>
          ) : addMode === 'kod' ? (
            <>
              <button type="button" className="btn" onClick={closeAddFarm}>İptal</button>
              <div className="formLabel">Çiftlik kodu</div>
              <form onSubmit={handleAddFarmByKod}>
                <input value={addKod} onChange={e => setAddKod(e.target.value.toUpperCase())} placeholder="Örn: ABC12XYZ" maxLength={12} />
                <button type="submit" disabled={adding}>{adding ? '…' : 'Ekle'}</button>
              </form>
            </>
          ) : (
            <>
              <button type="button" className="btn" onClick={closeAddFarm}>İptal</button>
              <div className="formLabel">Çiftçi ID (24 karakter)</div>
              <form onSubmit={handleAddFarmById}>
                <input value={addId} onChange={e => setAddId(e.target.value.trim())} placeholder="MongoDB ObjectId" />
                <button type="submit" disabled={adding}>{adding ? '…' : 'Ekle'}</button>
              </form>
            </>
          )}
        </AddFarmBlock>
      </Sidebar>

      <DetailPanel>
        {!selectedId ? (
          <EmptyDetail>Sol listeden bir çiftlik seçin veya çiftlik kodu ile yeni ekleyin.</EmptyDetail>
        ) : detailLoading ? (
          <EmptyDetail>Yükleniyor…</EmptyDetail>
        ) : (
          <>
            <DetailHeader>
              <h1 className="farm-name">{selectedMusteri?.isletmeAdi || selectedMusteri?.isim || 'Çiftlik'}</h1>
              <p className="farm-sub">Çiftçi: {selectedMusteri?.isim} {selectedMusteri?.sehir ? `· ${selectedMusteri.sehir}` : ''}</p>
            </DetailHeader>

            <Block>
              <h4>Hayvanlar</h4>
              {hayvanlar.length === 0 ? (
                <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Bu çiftlikte kayıtlı hayvan yok.</p>
              ) : (
                <>
                  <HayvanFiltreRow>
                    <div className="kategori-wrap">
                      <span>Kategori:</span>
                      {['', 'inek', 'buzagi', 'duve', 'tosun'].map(k => (
                        <button
                          key={k || 'tumu'}
                          type="button"
                          className={`kategori-btn ${hayvanKategori === k ? 'active' : ''}`}
                          onClick={() => setHayvanKategori(k)}
                        >
                          {k === '' ? 'Tümü' : k === 'inek' ? 'İnek' : k === 'buzagi' ? 'Buzağı' : k === 'duve' ? 'Düve' : 'Tosun'}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      className="kupe-search"
                      placeholder="Küpe no veya isim ara..."
                      value={hayvanKupeArama}
                      onChange={e => setHayvanKupeArama(e.target.value)}
                    />
                  </HayvanFiltreRow>
                  <AnimalGrid>
                    {filteredHayvanlar.map(h => (
                      <AnimalCard key={h._id}>
                        <div className="row">
                          <span className="kupe">{h.kupeNo || '–'} {h.isim && `(${h.isim})`}</span>
                          <span className="tag">{h.tip}</span>
                        </div>
                        <div className="info">{h.irk || '–'} · {h.guncelDurum || h.saglikDurumu || '–'}</div>
                        <div className="actions">
                          <button type="button" className="btn-saglik" onClick={() => openModal('hastalik', h)}>+ Sağlık / İlaç</button>
                          {(h.tip === 'inek' || h.tip === 'duve') && (
                            <button type="button" className="btn-tohum" onClick={() => openModal('tohumlama', h)}>+ Tohumlama</button>
                          )}
                        </div>
                      </AnimalCard>
                    ))}
                  </AnimalGrid>
                  {filteredHayvanlar.length === 0 && (hayvanKategori || hayvanKupeArama.trim()) && (
                    <p style={{ margin: '12px 0 0', color: '#64748b', fontSize: 13 }}>Bu filtreye uygun hayvan bulunamadı.</p>
                  )}
                </>
              )}
            </Block>

            <Block>
              <h4>Geçmiş sağlık kayıtları</h4>
              {saglikKayitlari.length === 0 ? (
                <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Henüz kayıt yok.</p>
              ) : (
                <KayitList>
                  {saglikKayitlari.slice(0, 30).map(k => (
                    <KayitItem key={k._id}>
                      <div className="line1">{k.hayvanIsim || k.hayvanKupeNo || 'Hayvan'} · {tipEtiket[k.tip] || k.tip} — {k.tani}</div>
                      <div className="line2">{k.tarih ? new Date(k.tarih).toLocaleDateString('tr-TR') : ''} {k.tedavi ? `· ${k.tedavi}` : ''}</div>
                    </KayitItem>
                  ))}
                </KayitList>
              )}
            </Block>
          </>
        )}
      </DetailPanel>

      {modalOpen && secilenHayvan && (
        <ModalOverlay onClick={() => setModalOpen(false)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{islemTipi === 'tohumlama' ? 'Suni tohumlama kaydı' : 'Teşhis ve reçete'}</h2>
              <p className="sub">{islemTipi === 'tohumlama' ? 'Tohumlama bilgisini girin, çiftçiye bildirilecek.' : 'Tanı, tedavi ve reçete alanlarını doldurun.'}</p>
            </div>
            <form onSubmit={handleKayitSubmit}>
              <div className="modal-body">
                <div className="hayvan-badge">
                  <span>{secilenHayvan.kupeNo || '–'}</span>
                  {secilenHayvan.isim && <span>({secilenHayvan.isim})</span>}
                  <span className="tip">{secilenHayvan.tip}</span>
                </div>
                {islemTipi === 'hastalik' ? (
                  <>
                    <div className="form-section">
                      <div className="form-section-title">Klinik bilgiler</div>
                      <div className="form-group">
                        <label>Tanı / Teşhis *</label>
                        <input required value={formData.tani} onChange={e => setFormData({ ...formData, tani: e.target.value })} placeholder="Örn: Mastitis, Süt humması" />
                      </div>
                      <div className="form-group">
                        <label>Uygulanan tedavi *</label>
                        <input required value={formData.tedavi} onChange={e => setFormData({ ...formData, tedavi: e.target.value })} placeholder="Örn: 1 hafta gözlem, antibiyotik" />
                      </div>
                      <div className="form-group">
                        <label>İlaç / Aşı</label>
                        <input value={formData.ilacAd} onChange={e => setFormData({ ...formData, ilacAd: e.target.value })} placeholder="Reçete edilen ilaç (opsiyonel)" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="form-section">
                    <div className="form-section-title">Tohumlama bilgisi</div>
                    <div className="form-group">
                      <label>Tohum (sperma) cinsi *</label>
                      <input required value={formData.ilacAd} onChange={e => setFormData({ ...formData, ilacAd: e.target.value })} placeholder="Örn: Holstein, Simental" />
                    </div>
                  </div>
                )}
                <div className="form-section">
                  <div className="form-section-title">Not (çiftçiye iletilecek)</div>
                  <div className="form-group">
                    <textarea value={formData.notlar} onChange={e => setFormData({ ...formData, notlar: e.target.value })} placeholder="Ek not veya öneri..." rows={3} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>İptal</button>
                <button type="submit" className="btn-submit">Kaydet ve çiftçiye bildir</button>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}
    </Page>
  );
}
