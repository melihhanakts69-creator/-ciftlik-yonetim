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
  padding: 24px; background: #f0f4f8; min-height: 100vh;
  font-family: 'Inter', system-ui, sans-serif; animation: ${fadeIn} .35s ease;
`;
const TopRow = styled.div`display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:22px;`;
const PageTitle = styled.h1`font-size:22px;font-weight:900;color:#0f172a;margin:0;display:flex;align-items:center;gap:10px;`;
const SubText = styled.p`font-size:14px;color:#64748b;margin:4px 0 0;`;

// Stat cards
const StatRow = styled.div`display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:22px;@media(max-width:600px){grid-template-columns:1fr;}`;
const Stat = styled.div`
  background:#fff;border-radius:16px;padding:16px 20px;box-shadow:0 1px 8px rgba(0,0,0,.06);
  display:flex;align-items:center;gap:14px;
  .ico{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;background:${p => p.$bg || '#dcfce7'};color:${p => p.$col || '#16a34a'};}
  .lbl{font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;}
  .val{font-size:22px;font-weight:900;color:#0f172a;}
`;

// Tab bar
const TabBar = styled.div`
  display:flex;gap:6px;background:#fff;padding:6px;border-radius:16px;
  box-shadow:0 1px 8px rgba(0,0,0,.06);margin-bottom:22px;flex-wrap:wrap;
`;
const TabBtn = styled.button`
  padding: 10px 18px; border:none; border-radius:11px; font-size:13px; font-weight:700;
  cursor:pointer; display:flex; align-items:center; gap:7px; transition:all .2s;
  background:${p => p.$active ? 'linear-gradient(135deg,#4ade80,#16a34a)' : 'transparent'};
  color:${p => p.$active ? '#fff' : '#64748b'};
  box-shadow:${p => p.$active ? '0 4px 12px rgba(74,222,128,.3)' : 'none'};
  &:hover{background:${p => p.$active ? 'linear-gradient(135deg,#4ade80,#16a34a)' : '#f1f5f9'};color:${p => p.$active ? '#fff' : '#0f172a'};}
`;
const NewBadge = styled.span`
  background:rgba(96,165,250,.15);color:#2563eb;font-size:9px;padding:2px 6px;
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
const LibCard = styled.div`background:#fff;border-radius:18px;padding:22px;box-shadow:0 1px 8px rgba(0,0,0,.06);`;
const LibTop = styled.div`display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:18px;`;
const SearchBox = styled.div`position:relative;width:260px;svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:13px;}`;
const SInp = styled.input`
  width:100%;padding:9px 12px 9px 34px;border:1.5px solid #e2e8f0;border-radius:10px;
  font-size:13px;outline:none;box-sizing:border-box;
  &:focus{border-color:#4ade80;}
`;
const BtnGroup = styled.div`display:flex;gap:8px;`;
const Btn = styled.button`
  padding:9px 16px;border:none;border-radius:10px;font-size:13px;font-weight:800;
  cursor:pointer;display:flex;align-items:center;gap:6px;transition:.15s;color:#fff;
  background:${p => p.$blue ? 'linear-gradient(135deg,#60a5fa,#2563eb)' : 'linear-gradient(135deg,#4ade80,#16a34a)'};
  &:hover{opacity:.9;}
`;
const Table = styled.table`width:100%;border-collapse:collapse;font-size:13px;`;
const TH = styled.th`text-align:left;padding:10px 14px;color:#64748b;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.4px;border-bottom:2px solid #f1f5f9;`;
const TD = styled.td`padding:11px 14px;border-bottom:1px solid #f8fafc;color:#1e293b;font-weight:500;`;
const PriceBadge = styled.span`background:#dcfce7;color:#16a34a;padding:3px 8px;border-radius:6px;font-size:12px;font-weight:800;`;

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
            <TopRow>
                <div>
                    <PageTitle><FaLeaf color="#16a34a" /> Yem Yönetim Merkezi</PageTitle>
                    <SubText>Yem stoklarını yönet, rasyon hazırla ve günlük yemleme yap.</SubText>
                </div>
            </TopRow>

            {/* İstatistikler */}
            <StatRow>
                <Stat $bg="rgba(96,165,250,.1)" $col="#2563eb">
                    <div className="ico"><FaClipboardList /></div>
                    <div><div className="lbl">Aktif Rasyonlar</div><div className="val">{rasyonlar.length}</div></div>
                </Stat>
                <Stat $bg="rgba(74,222,128,.1)" $col="#16a34a">
                    <div className="ico"><FaBoxOpen /></div>
                    <div><div className="lbl">Tanımlı Yemler</div><div className="val">{yemler.length}</div></div>
                </Stat>
                <Stat $bg={kritikSayisi > 0 ? "rgba(239,68,68,.1)" : "rgba(251,146,60,.1)"} $col={kritikSayisi > 0 ? "#ef4444" : "#ea580c"}>
                    <div className="ico"><FaExclamationTriangle /></div>
                    <div><div className="lbl">Kritik Stok</div><div className="val">{kritikSayisi}</div></div>
                </Stat>
            </StatRow>

            {/* Tab bar */}
            <TabBar>
                {TABS.map(t => (
                    <TabBtn key={t.key} $active={tab === t.key} onClick={() => setTab(t.key)}>
                        {t.icon} {t.label}
                        {t.isNew && <NewBadge>YENİ</NewBadge>}
                        {t.badge && <span style={{ background: 'rgba(255,255,255,.2)', borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 900 }}>{t.badge}</span>}
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
                        <BtnGroup>
                            <Btn $blue onClick={async () => {
                                if (!window.confirm('Depodaki yemler kütüphaneye aktarılacak. Onaylıyor musun?')) return;
                                setLoading(true);
                                try { const r = await api.syncStokToLibrary(); showSuccess(`${r.data.added} yem eklendi, ${r.data.matched} tanımlandı.`); loadData(); }
                                catch { showError('Hata oluştu'); }
                                finally { setLoading(false); }
                            }}><FaClipboardList /> Akıllı Eşitle</Btn>
                            <Btn onClick={() => setShowAddModal(true)}><FaPlus /> Yeni Yem</Btn>
                        </BtnGroup>
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
        </Page>
    );
}
