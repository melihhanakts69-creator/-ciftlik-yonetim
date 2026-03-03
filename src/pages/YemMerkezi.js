import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  FaLeaf, FaClipboardList, FaCheckCircle, FaTrash, FaCalculator,
  FaBoxOpen, FaExclamationTriangle, FaChartPie, FaSearch, FaUserMd, FaPlus
} from 'react-icons/fa';
import * as api from '../services/api';
import RasyonHesaplayici from '../components/Yem/RasyonHesaplayici';
import YemEkleModal from '../components/Yem/YemEkleModal';
import YemDeposu from '../components/YemDeposu';
import YemDanismani from '../components/Yem/YemDanismani';
import { showSuccess, showError } from '../utils/toast';

const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;

// ─── Styled ──────────────────────────────────────────────────────────
const Page = styled.div`
  padding: 0 0 80px; background: #f1f5f9; min-height: 100vh;
  font-family: 'Inter', system-ui, sans-serif; animation: ${fadeIn} .35s ease;
`;

// ── Page Header (gradient) ──────────────────────────────────────────
const PageHeader = styled.div`
  background: linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%);
  padding: 28px 32px 0; position: relative; overflow: hidden;
  &::after {
    content: ''; position: absolute; right: -60px; top: -60px;
    width: 260px; height: 260px; border-radius: 50%;
    background: rgba(255,255,255,0.06); pointer-events: none;
  }
`;
const HeaderTop = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 16px; margin-bottom: 24px;
`;
const HeaderLeft = styled.div`display: flex; align-items: center; gap: 14px;`;
const HeaderIcon = styled.div`
  width: 52px; height: 52px; border-radius: 16px;
  background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; border: 1px solid rgba(255,255,255,0.2);
`;
const HeaderTitle = styled.h1`margin:0;font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.3px;`;
const HeaderSub = styled.p`margin:3px 0 0;font-size:13px;color:rgba(255,255,255,0.6);font-weight:400;`;
const HeaderBtns = styled.div`display:flex;gap:10px;flex-wrap:wrap;`;
const PrimaryBtn = styled.button`
  display:flex;align-items:center;gap:8px;padding:11px 22px;
  background:#fff;color:#065f46;border:none;border-radius:10px;
  font-weight:700;font-size:13px;cursor:pointer;transition:all .2s;
  box-shadow:0 2px 8px rgba(0,0,0,0.15);
  &:hover{background:#f0fdf4;transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,0.15);}
`;

// ── Stat Strip ────────────────────────────────────────────────────
const StatRow = styled.div`
  display:grid;grid-template-columns:repeat(3,1fr);gap:0;
  background:rgba(255,255,255,0.08);border-top:1px solid rgba(255,255,255,0.1);
  @media(max-width:600px){grid-template-columns:1fr;}
`;
const Stat = styled.div`
  padding:18px 24px;display:flex;align-items:center;gap:14px;
  border-right:1px solid rgba(255,255,255,0.1);
  &:last-child{border-right:none;}
  transition:background .2s;&:hover{background:rgba(255,255,255,0.07);}
  .ico{width:42px;height:42px;border-radius:12px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px;background:rgba(255,255,255,0.15);color:#fff;}
  .lbl{font-size:11px;font-weight:600;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:.4px;}
  .val{font-size:26px;font-weight:900;color:#fff;line-height:1;}
`;

// ── Body ──────────────────────────────────────────────────────────
const BodyWrap = styled.div`padding:24px;`;

// ── Tab Bar ────────────────────────────────────────────────────────
const TabBar = styled.div`
  display:flex;gap:4px;background:#fff;padding:5px;border-radius:14px;
  box-shadow:0 1px 4px rgba(0,0,0,.07);margin-bottom:22px;flex-wrap:wrap;
  border:1px solid #e2e8f0;
`;
const TabBtn = styled.button`
  padding:9px 18px;border:none;border-radius:10px;font-size:13px;font-weight:700;
  cursor:pointer;display:flex;align-items:center;gap:7px;transition:all .2s;
  background:${p => p.$active ? 'linear-gradient(135deg,#065f46,#047857)' : 'transparent'};
  color:${p => p.$active ? '#fff' : '#64748b'};
  box-shadow:${p => p.$active ? '0 2px 8px rgba(6,95,70,.35)' : 'none'};
  &:hover{background:${p => p.$active ? 'linear-gradient(135deg,#065f46,#047857)' : '#f1f5f9'};color:${p => p.$active ? '#fff' : '#1e293b'};}
`;
const NewBadge = styled.span`
  background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;
  font-size:9px;padding:2px 6px;border-radius:999px;font-weight:800;
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

// ─── Component ────────────────────────────────────────────────────
export default function YemMerkezi() {
  const [tab, setTab] = useState('stok');
  const [yemler, setYemler] = useState([]);
  const [rasyonlar, setRasyonlar] = useState([]);
  const [kritikSayisi, setKritikSayisi] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [yr, rr, sr] = await Promise.all([api.getYemKutuphanesi(), api.getRasyonlar(), api.getYemStok()]);
      setYemler(yr.data);
      setRasyonlar(rr.data);
      setKritikSayisi(sr.data.filter(s => s.miktar <= s.minimumStok).length);
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

  const TABS = [
    { key: 'stok', label: 'Stok & Depo', icon: <FaBoxOpen /> },
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
      </PageHeader>

      <BodyWrap>
        <TabBar>
          {TABS.map(t => (
            <TabBtn key={t.key} $active={tab === t.key} onClick={() => setTab(t.key)}>
              {t.icon} {t.label}
              {t.isNew && <NewBadge>YENİ</NewBadge>}
              {t.badge && <span style={{ background: '#ecfdf5', color: '#065f46', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 800 }}>{t.badge}</span>}
            </TabBtn>
          ))}
        </TabBar>

        {tab === 'danisman' && <YemDanismani />}
        {tab === 'stok' && <YemDeposu isEmbedded={true} />}
        {tab === 'hesapla' && <RasyonHesaplayici yemler={yemler} onSave={handleCreateRasyon} />}

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
          </LibCard>
        )}

        {showAddModal && (
          <YemEkleModal onClose={() => setShowAddModal(false)} onSave={() => { loadData(); setShowAddModal(false); }} />
        )}
      </BodyWrap>
    </Page>
  );
}
