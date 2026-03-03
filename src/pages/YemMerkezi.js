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

// ─── Styled ────────────────────────────────────────────────────────
const Page = styled.div`
  padding: 0 0 80px;
  background: linear-gradient(160deg, #050d05 0%, #0a1f0a 40%, #0d1a0d 100%);
  min-height: 100vh;
  font-family: 'Inter', system-ui, sans-serif;
`;

// ── Hero Banner ──────────────────────────────────────────────
const HeroBanner = styled.div`
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #071a07 0%, #0f2d0f 50%, #0a1a0d 100%);
  border-bottom: 1px solid rgba(74,222,128,0.12);
  padding: 28px 28px 0;
`;
const HeroBg = styled.div`
  position: absolute; inset: 0; overflow: hidden; pointer-events: none;
  &::before { content:''; position:absolute; width:450px; height:450px;
    background: radial-gradient(circle, rgba(74,222,128,0.14) 0%, transparent 70%);
    top:-120px; right:-80px; border-radius:50%; }
  &::after { content:''; position:absolute; width:300px; height:300px;
    background: radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%);
    bottom:-60px; left:5%; border-radius:50%; }
`;
const HeroTop = styled.div`
  position: relative; z-index: 1;
  display: flex; align-items: flex-start; justify-content: space-between;
  flex-wrap: wrap; gap: 16px; margin-bottom: 24px;
`;
const HeroLeft = styled.div`display: flex; align-items: center; gap: 16px;`;
const HeroIconWrap = styled.div`
  width: 56px; height: 56px; border-radius: 18px;
  background: linear-gradient(135deg, #4ade80, #16a34a);
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; color: #fff;
  box-shadow: 0 8px 28px rgba(74,222,128,0.45);
`;
const HeroTitle = styled.h1`
  margin: 0; font-size: 26px; font-weight: 900;
  background: linear-gradient(135deg, #fff 40%, #86efac);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
`;
const HeroSub = styled.p`
  margin: 4px 0 0; font-size: 13px;
  color: rgba(255,255,255,0.4); font-weight: 500;
`;
const HeroBtnGroup = styled.div`display: flex; gap: 10px; flex-wrap: wrap;`;
const HeroBtn = styled.button`
  display: flex; align-items: center; gap: 8px;
  padding: 11px 20px;
  background: linear-gradient(135deg, #4ade80, #16a34a);
  color: #fff; border: none; border-radius: 12px;
  font-weight: 800; font-size: 13px; cursor: pointer;
  transition: all 0.25s; white-space: nowrap;
  box-shadow: 0 4px 16px rgba(74,222,128,0.35);
  &:hover { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(74,222,128,0.5); }
`;

// ── Stat Strip ───────────────────────────────────────────────
const StatRow = styled.div`
  position: relative; z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1px;
  background: rgba(74,222,128,0.07);
  border-top: 1px solid rgba(74,222,128,0.1);
`;
const Stat = styled.div`
  background: rgba(255,255,255,0.02);
  padding: 18px 22px;
  display: flex; align-items: center; gap: 12px;
  transition: background 0.2s;
  &:hover { background: rgba(74,222,128,0.05); }
  .ico { width:42px; height:42px; border-radius:13px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:18px;
    background:${p => p.$bg || 'rgba(74,222,128,0.12)'}; color:${p => p.$col || '#4ade80'}; }
  .lbl { font-size:10px; font-weight:700; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:.5px; }
  .val { font-size:24px; font-weight:900; color:#fff; line-height:1; }
`;

// ── Body ─────────────────────────────────────────────────────
const BodyWrap = styled.div`padding: 22px;`;

// Tab bar
const TabBar = styled.div`
  display:flex;gap:6px;background:rgba(255,255,255,0.04);padding:5px;
  border-radius:16px;border:1px solid rgba(255,255,255,0.06);
  margin-bottom:22px;flex-wrap:wrap;
`;
const TabBtn = styled.button`
  padding: 10px 18px; border:none; border-radius:11px; font-size:13px; font-weight:700;
  cursor:pointer; display:flex; align-items:center; gap:7px; transition:all .2s;
  background:${p => p.$active ? 'linear-gradient(135deg,#4ade80,#16a34a)' : 'transparent'};
  color:${p => p.$active ? '#fff' : 'rgba(255,255,255,0.4)'};
  box-shadow:${p => p.$active ? '0 4px 14px rgba(74,222,128,.4)' : 'none'};
  &:hover{background:${p => p.$active ? 'linear-gradient(135deg,#4ade80,#16a34a)' : 'rgba(74,222,128,0.1)'};color:${p => p.$active ? '#fff' : 'rgba(255,255,255,0.7)'};}
`;
const NewBadge = styled.span`
  background:rgba(96,165,250,.2);color:#93c5fd;font-size:9px;padding:2px 6px;
  border-radius:999px;font-weight:800;letter-spacing:.3px;
`;

// ─── Rasyon Kart (premium) ─────────────────────────────────────
const RGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;`;
const RCard = styled.div`
  background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06);
  transition:all .25s;border-top:4px solid #4ade80;
  &:hover{transform:translateY(-4px);box-shadow:0 10px 28px rgba(0,0,0,.1);}
`;
const RCardBody = styled.div`padding:20px;`;
const RHead = styled.div`display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;`;
const RAd = styled.div`font-size:16px;font-weight:800;color:#0f172a;`;
const RBadge = styled.span`
  background:rgba(74,222,128,.1);color:#16a34a;padding:3px 10px;border-radius:999px;
  font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;border:1px solid rgba(74,222,128,.2);
`;
const RMaliyet = styled.div`font-size:28px;font-weight:900;color:#0f172a;margin-bottom:14px;
  span{font-size:13px;color:#94a3b8;font-weight:500;margin-left:4px;}`;
const RIngredients = styled.div`
  background:#f8fafc;border-radius:12px;padding:12px 14px;margin-bottom:14px;
  div{display:flex;justify-content:space-between;align-items:center;padding:5px 0;
    border-bottom:1px solid #f1f5f9;&:last-child{border:none;}
    .iname{display:flex;align-items:center;gap:6px;font-size:13px;color:#475569;font-weight:600;}
    .iamt{font-size:13px;font-weight:800;color:#0f172a;}
  }
`;
const RActions = styled.div`display:flex;gap:8px;`;
const RBtn = styled.button`
  flex:${p => p.$flex || 1};padding:10px;border-radius:10px;border:none;font-weight:700;
  font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:.15s;
  background:${p => p.$danger ? 'rgba(239,68,68,.08)' : p.$primary ? 'linear-gradient(135deg,#4ade80,#16a34a)' : '#f1f5f9'};
  color:${p => p.$danger ? '#ef4444' : p.$primary ? '#fff' : '#475569'};
  &:hover{filter:brightness(.93);}
`;
const EmptyMsg = styled.div`
  text-align:center;padding:48px;color:#94a3b8;grid-column:1/-1;
  background:#fff;border-radius:18px;box-shadow:0 1px 8px rgba(0,0,0,.05);
  .icon{font-size:40px;margin-bottom:12px;}
  p{margin:0;font-size:14px;}
`;

// ─── Kütüphane tablosu ──────────────────────────────────────────
const LibCard = styled.div`background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:18px;padding:22px;`;
const LibTop = styled.div`display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:18px;`;
const SearchBox = styled.div`position:relative;width:260px;svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:13px;}`;
const SInp = styled.input`
  width:100%;padding:9px 12px 9px 34px;border:1.5px solid rgba(255,255,255,0.08);border-radius:10px;
  font-size:13px;outline:none;box-sizing:border-box;background:rgba(255,255,255,0.05);color:#e2e8f0;
  &::placeholder{color:#475569;}
  &:focus{border-color:#4ade80;background:rgba(74,222,128,0.05);}
`;
const LibBtnGroup = styled.div`display:flex;gap:8px;`;
const Btn = styled.button`
  padding:9px 16px;border:none;border-radius:10px;font-size:13px;font-weight:800;
  cursor:pointer;display:flex;align-items:center;gap:6px;transition:.15s;color:#fff;
  background:${p => p.$blue ? 'linear-gradient(135deg,#60a5fa,#2563eb)' : 'linear-gradient(135deg,#4ade80,#16a34a)'};
  &:hover{opacity:.88;transform:translateY(-1px);}
`;
const Table = styled.table`width:100%;border-collapse:collapse;font-size:13px;`;
const TH = styled.th`text-align:left;padding:10px 14px;color:rgba(255,255,255,0.4);font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid rgba(255,255,255,0.07);`;
const TD = styled.td`padding:11px 14px;border-bottom:1px solid rgba(255,255,255,0.05);color:#cbd5e1;font-weight:500;`;
const PriceBadge = styled.span`background:rgba(74,222,128,0.12);color:#4ade80;padding:3px 8px;border-radius:6px;font-size:12px;font-weight:800;border:1px solid rgba(74,222,128,0.2);`;

// ─── Component ──────────────────────────────────────────────────
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
            {/* ── HERO ── */}
            <HeroBanner>
                <HeroBg />
                <HeroTop>
                    <HeroLeft>
                        <HeroIconWrap>🌿</HeroIconWrap>
                        <div>
                            <HeroTitle>Yem Yönetim Merkezi</HeroTitle>
                            <HeroSub>Stok takibi · Rasyon planlama · Günlük yemleme · AI danışman</HeroSub>
                        </div>
                    </HeroLeft>
                    <HeroBtnGroup>
                        <HeroBtn onClick={() => setShowAddModal(true)}>
                            <FaPlus /> Yem Ekle
                        </HeroBtn>
                    </HeroBtnGroup>
                </HeroTop>

                {/* İstatistikler */}
                <StatRow>
                    <Stat $bg="rgba(96,165,250,.12)" $col="#60a5fa">
                        <div className="ico"><FaClipboardList /></div>
                        <div><div className="lbl">Aktif Rasyonlar</div><div className="val">{rasyonlar.length}</div></div>
                    </Stat>
                    <Stat $bg="rgba(74,222,128,.12)" $col="#4ade80">
                        <div className="ico"><FaBoxOpen /></div>
                        <div><div className="lbl">Tanımlı Yemler</div><div className="val">{yemler.length}</div></div>
                    </Stat>
                    <Stat $bg={kritikSayisi > 0 ? "rgba(239,68,68,.12)" : "rgba(251,146,60,.12)"} $col={kritikSayisi > 0 ? "#f87171" : "#fb923c"}>
                        <div className="ico"><FaExclamationTriangle /></div>
                        <div><div className="lbl">Kritik Stok</div><div className="val">{kritikSayisi}</div></div>
                    </Stat>
                </StatRow>
            </HeroBanner>

            <BodyWrap>
                {/* Tab bar */}
                <TabBar>
                    {TABS.map(t => (
                        <TabBtn key={t.key} $active={tab === t.key} onClick={() => setTab(t.key)}>
                            {t.icon} {t.label}
                            {t.isNew && <NewBadge>YENİ</NewBadge>}
                            {t.badge && <span style={{ background: 'rgba(255,255,255,.15)', borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 900 }}>{t.badge}</span>}
                        </TabBtn>
                    ))}
                </TabBar>

                {/* ── Tab içerikleri ── */}

                {tab === 'danisman' && <YemDanismani />}
                {tab === 'stok' && <YemDeposu isEmbedded={true} />}
                {tab === 'hesapla' && <RasyonHesaplayici yemler={yemler} onSave={handleCreateRasyon} />}

                {tab === 'rasyon' && (
                    <RGrid>
                        {rasyonlar.length === 0 ? (
                            <EmptyMsg>
                                <div className="icon">🌿</div>
                                <p>Henüz rasyon tanımlamadınız.<br />
                                    <strong style={{ color: '#4ade80' }}>Hesaplayıcı</strong> sekmesinden yeni bir rasyon oluşturun.</p>
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
                                                <span className="iname"><FaLeaf size={9} color="#4ade80" />{item.yemId?.ad || 'Silinmiş Yem'}</span>
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
                                        <TD style={{ fontWeight: 800, color: '#0f172a' }}>{y.ad}</TD>
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
