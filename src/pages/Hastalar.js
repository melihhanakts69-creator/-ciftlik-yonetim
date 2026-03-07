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
  @media (max-width: 900px) { flex-direction: column; height: auto; min-height: auto; }
`;

const Sidebar = styled.aside`
  width: 320px;
  min-width: 280px;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  @media (max-width: 900px) { width: 100%; border-right: none; border-bottom: 1px solid #e5e7eb; max-height: 40vh; }
`;

const SidebarHeader = styled.div`
  padding: 20px 20px 16px;
  border-bottom: 1px solid #f3f4f6;
  .title { font-size: 15px; font-weight: 700; color: #111827; margin: 0 0 12px; }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  &:focus { outline: none; border-color: #3b82f6; }
  &::placeholder { color: #9ca3af; }
`;

const FarmList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
`;

const FarmItem = styled.div`
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.15s;
  border-left: 3px solid transparent;
  ${p => p.$active && 'background: #f0f9ff; border-left-color: #2563eb;'}
  &:hover { background: #f9fafb; }
  .name { font-weight: 600; color: #111827; font-size: 14px; }
  .sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
`;

const AddFarmBlock = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #f3f4f6;
  .btn { width: 100%; padding: 10px 16px; border: 1px dashed #d1d5db; border-radius: 8px; background: #fff; color: #6b7280; font-size: 13px; font-weight: 600; cursor: pointer; }
  .btn:hover { border-color: #2563eb; color: #2563eb; }
  form { display: flex; gap: 8px; margin-top: 10px; }
  form input { flex: 1; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; }
  form button { padding: 10px 16px; border-radius: 8px; border: none; background: #2563eb; color: white; font-weight: 600; font-size: 13px; cursor: pointer; }
`;

const DetailPanel = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #f9fafb;
  padding: 24px;
  @media (max-width: 900px) { min-height: 50vh; }
`;

const EmptyDetail = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  color: #6b7280;
  font-size: 15px;
  text-align: center;
  padding: 20px;
`;

const DetailHeader = styled.div`
  margin-bottom: 24px;
  .farm-name { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 4px; }
  .farm-sub { font-size: 13px; color: #6b7280; }
`;

const Block = styled.section`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px 22px;
  margin-bottom: 20px;
  h4 { font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 14px; }
`;

const AnimalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
`;

const AnimalCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 14px 16px;
  background: #fff;
  .row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .kupe { font-weight: 700; color: #111827; font-size: 14px; }
  .tag { font-size: 11px; padding: 2px 8px; border-radius: 20px; background: #f3f4f6; color: #6b7280; }
  .info { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
  .actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .actions button { padding: 8px 12px; border-radius: 6px; border: none; font-size: 12px; font-weight: 600; cursor: pointer; }
  .btn-saglik { background: #dcfce7; color: #166534; }
  .btn-saglik:hover { background: #bbf7d0; }
  .btn-tohum { background: #dbeafe; color: #1e40af; }
  .btn-tohum:hover { background: #bfdbfe; }
`;

const KayitList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const KayitItem = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
  &:last-child { border-bottom: none; }
  .line1 { font-size: 13px; font-weight: 600; color: #111827; }
  .line2 { font-size: 12px; color: #6b7280; margin-top: 2px; }
`;

const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;
`;

const ModalBox = styled.div`
  background: #fff; width: 100%; max-width: 480px; border-radius: 12px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  h2 { margin: 0 0 20px; font-size: 18px; color: #111827; }
  .form-group { margin-bottom: 14px; }
  .form-group label { display: block; font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 6px; }
  .form-group input, .form-group textarea { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
  .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #3b82f6; }
  .buttons { display: flex; gap: 10px; margin-top: 20px; }
  .btn-submit { flex: 2; background: #2563eb; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; }
  .btn-cancel { flex: 1; background: #f3f4f6; color: #374151; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; }
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
  const [addKod, setAddKod] = useState('');
  const [adding, setAdding] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [secilenHayvan, setSecilenHayvan] = useState(null);
  const [islemTipi, setIslemTipi] = useState('hastalik');
  const [formData, setFormData] = useState({ tani: '', tedavi: '', ilacAd: '', notlar: '' });

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

  const handleAddFarm = async (e) => {
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
            <button type="button" className="btn" onClick={() => setShowAddFarm(true)}>+ Çiftlik kodu ile ekle</button>
          ) : (
            <>
              <button type="button" className="btn" onClick={() => setShowAddFarm(false)}>İptal</button>
              <form onSubmit={handleAddFarm}>
                <input value={addKod} onChange={e => setAddKod(e.target.value.toUpperCase())} placeholder="Çiftlik kodu" maxLength={12} />
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
                <AnimalGrid>
                  {hayvanlar.map(h => (
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
            <h2>{islemTipi === 'tohumlama' ? 'Suni tohumlama' : 'Teşhis ve reçete'}</h2>
            <form onSubmit={handleKayitSubmit}>
              <div className="form-group" style={{ background: '#f9fafb', padding: 10, borderRadius: 8 }}>
                <strong>{secilenHayvan.kupeNo}</strong> ({secilenHayvan.tip})
              </div>
              {islemTipi === 'hastalik' ? (
                <>
                  <div className="form-group">
                    <label>Tanı / Teşhis</label>
                    <input required value={formData.tani} onChange={e => setFormData({ ...formData, tani: e.target.value })} placeholder="Örn: Mastitis" />
                  </div>
                  <div className="form-group">
                    <label>Tedavi</label>
                    <input required value={formData.tedavi} onChange={e => setFormData({ ...formData, tedavi: e.target.value })} placeholder="Uygulanan tedavi" />
                  </div>
                  <div className="form-group">
                    <label>İlaç / Aşı</label>
                    <input value={formData.ilacAd} onChange={e => setFormData({ ...formData, ilacAd: e.target.value })} placeholder="Opsiyonel" />
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label>Tohum (sperma) cinsi</label>
                  <input required value={formData.ilacAd} onChange={e => setFormData({ ...formData, ilacAd: e.target.value })} placeholder="Holstein, Simental..." />
                </div>
              )}
              <div className="form-group">
                <label>Notlar</label>
                <textarea rows={2} value={formData.notlar} onChange={e => setFormData({ ...formData, notlar: e.target.value })} placeholder="Çiftçiye iletilecek" />
              </div>
              <div className="buttons">
                <button type="submit" className="btn-submit">Kaydet ve bildir</button>
                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>İptal</button>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}
    </Page>
  );
}
