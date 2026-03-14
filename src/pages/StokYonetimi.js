import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaBox, FaPlus, FaMinus, FaEdit, FaTrash, FaSearch, FaExclamationTriangle, FaTimes, FaThLarge, FaList } from 'react-icons/fa';
import * as api from '../services/api';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const fadeIn = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.6}`;

// ─── Styled ────────────────────────────────────────────────────────────────
const Page = styled.div`
  padding: 24px; min-height: 100vh; background: #f0f4f8;
  font-family: 'Inter', system-ui, sans-serif;
  animation: ${fadeIn} .4s ease;
`;
const TopRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  margin-bottom: 24px;
`;
const PageTitle = styled.h1`
  font-size: 22px; font-weight: 900; color: #0f172a; margin: 0;
  display: flex; align-items: center; gap: 10px;
`;
const TopActions = styled.div`display: flex; align-items: center; gap: 10px; flex-wrap: wrap;`;
const AddBtn = styled.button`
  background: linear-gradient(135deg,#4ade80,#16a34a); color:#fff; border:none;
  padding: 11px 22px; border-radius: 12px; font-size: 14px; font-weight: 800;
  cursor: pointer; display: flex; align-items: center; gap: 8px;
  box-shadow: 0 4px 14px rgba(74,222,128,.35); transition: all .2s;
  &:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(74,222,128,.45);}
`;
const ToggleViewBtns = styled.div`
  display: flex; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 10px; overflow: hidden;
`;
const TVBtn = styled.button`
  display: flex; align-items: center; gap: 5px; padding: 8px 14px; border: none; cursor: pointer;
  font-size: 12px; font-weight: 700; transition: all .2s;
  background: ${p => p.$active ? '#0f172a' : '#fff'};
  color: ${p => p.$active ? '#fff' : '#64748b'};
  &:hover { background: ${p => p.$active ? '#0f172a' : '#f1f5f9'}; }
`;

// Stat bar
const StatRow = styled.div`
  display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 22px;
  @media(max-width:700px){grid-template-columns:1fr 1fr;}
`;
const Stat = styled.div`
  background: #fff; border-radius: 16px; padding: 18px;
  box-shadow: 0 1px 8px rgba(0,0,0,.06);
  border-left: 4px solid ${p => p.$color || '#4ade80'};
  .val{font-size:26px;font-weight:900;color:${p => p.$color || '#4ade80'};}
  .lbl{font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-top:2px;}
`;

// Filters
const FilterBar = styled.div`
  display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;
`;
const SearchWrap = styled.div`
  position: relative; flex: 1; min-width: 200px;
  svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:13px;}
`;
const SearchInput = styled.input`
  width: 100%; padding: 10px 12px 10px 36px; border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 14px; background: #fff; outline: none; box-sizing: border-box;
  &:focus{border-color:#4ade80;}
`;
const CatBtn = styled.button`
  padding: 9px 16px; border-radius: 10px; border: 1.5px solid ${p => p.$active ? '#4ade80' : '#e2e8f0'};
  background: ${p => p.$active ? 'rgba(74,222,128,.1)' : '#fff'};
  color: ${p => p.$active ? '#16a34a' : '#64748b'}; font-size: 13px; font-weight: 700; cursor: pointer;
  transition: all .15s;
  &:hover{border-color:#4ade80;}
`;

// Stok grid
const Grid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: 16px;
`;
const Card = styled.div`
  background: #fff; border-radius: 18px; overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,.05); transition: all .2s;
  border-top: 4px solid ${p => p.$kritik ? '#ef4444' : '#4ade80'};
  &:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.1);}
`;
const CardBody = styled.div`padding:18px;`;
const CardHead = styled.div`
  display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px;
`;
const UrunAdi = styled.div`font-size:16px;font-weight:800;color:#0f172a;`;
const KatBadge = styled.span`
  font-size:10px;font-weight:700;padding:3px 10px;border-radius:999px;
  background:${p => ({
        'Yem': 'rgba(74,222,128,.1)', 'İlaç': 'rgba(239,68,68,.1)',
        'Vitamin': 'rgba(251,146,60,.1)', 'Ekipman': 'rgba(96,165,250,.1)'
    }[p.$kat] || 'rgba(100,116,139,.1)')};
  color:${p => ({
        'Yem': '#16a34a', 'İlaç': '#ef4444',
        'Vitamin': '#ea580c', 'Ekipman': '#2563eb'
    }[p.$kat] || '#475569')};
`;
const MiktarWrap = styled.div`
  display: flex; align-items: baseline; gap: 5px; margin-bottom: 10px;
`;
const MiktarVal = styled.span`
  font-size: 32px; font-weight: 900; color: ${p => p.$kritik ? '#ef4444' : '#0f172a'};
  ${p => p.$kritik && css`animation:${pulse} 2s ease infinite;`}
`;
const Birim = styled.span`font-size:14px;color:#94a3b8;font-weight:600;`;
const ProgressBar = styled.div`
  height: 5px; background: #f1f5f9; border-radius: 999px; margin-bottom: 14px; overflow: hidden;
  div{
    height:100%;border-radius:999px;transition:width .4s;
    background:${p => p.$pct < 30 ? '#ef4444' : p.$pct < 70 ? '#f59e0b' : '#4ade80'};
    width:${p => Math.min(100, p.$pct)}%;
  }
`;
const KrtikLabel = styled.div`font-size:11px;color:#94a3b8;margin-bottom:12px;margin-top:-10px;`;

// Liste görünümü
const ListView = styled.div`display:flex;flex-direction:column;gap:8px;`;
const ListRow = styled.div`
  display:flex;align-items:center;gap:14px;background:#fff;border-radius:14px;
  padding:14px 16px;box-shadow:0 1px 6px rgba(0,0,0,.05);
  border-left:4px solid ${p => p.$kritik ? '#ef4444' : '#4ade80'};
  transition:all .2s;
  &:hover{box-shadow:0 4px 16px rgba(0,0,0,.09);}
  @media(max-width:600px){flex-wrap:wrap;}
`;
const ListMain = styled.div`flex:1;min-width:0;`;
const ListNameRow = styled.div`display:flex;align-items:center;gap:8px;margin-bottom:4px;`;
const ListName = styled.span`font-size:15px;font-weight:800;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;
const ListMeta = styled.div`display:flex;align-items:center;gap:12px;`;
const ListStock = styled.div`
  display:flex;align-items:baseline;gap:4px;min-width:80px;
  .v{font-size:20px;font-weight:900;color:${p => p.$kritik ? '#ef4444' : '#0f172a'};}
  .u{font-size:12px;color:#94a3b8;font-weight:600;}
`;
const ListProgress = styled.div`
  flex:1;height:4px;background:#f1f5f9;border-radius:999px;overflow:hidden;min-width:80px;max-width:180px;
  div{height:100%;border-radius:999px;background:${p => p.$pct < 30 ? '#ef4444' : p.$pct < 70 ? '#f59e0b' : '#4ade80'};width:${p => Math.min(100, p.$pct)}%;}
`;
const ListActions = styled.div`display:flex;gap:6px;flex-shrink:0;`;
const ActionBtns = styled.div`
  display: flex; gap: 8px; padding-top: 14px; border-top: 1px solid #f1f5f9;
`;
const AB = styled.button`
  flex: ${p => p.$flex || 1}; padding: 8px; border-radius: 9px; border: none;
  display: flex; align-items: center; justify-content: center; gap: 5px;
  font-size: 12px; font-weight: 700; cursor: pointer; transition: background .15s;
  background:${p => ({ add: '#dcfce7', sub: '#fee2e2', edit: '#dbeafe', del: 'transparent' }[p.$t] || '#f1f5f9')};
  color:${p => ({ add: '#16a34a', sub: '#dc2626', edit: '#1d4ed8', del: '#cbd5e1' }[p.$t] || '#475569')};
  &:hover{filter:brightness(.93);}
`;

// Kritik uyarı banner
const CritBanner = styled.div`
  background: linear-gradient(135deg,rgba(239,68,68,.08),rgba(239,68,68,.04));
  border: 1px solid rgba(239,68,68,.2); border-radius: 14px; padding: 14px 18px;
  display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
  color: #dc2626; font-size: 14px; font-weight: 700;
  svg{font-size:18px;flex-shrink:0;}
`;

// Chart card
const ChartCard = styled.div`
  background:#fff; border-radius:18px; padding:20px; box-shadow:0 2px 10px rgba(0,0,0,.05);
  margin-bottom:22px;
  h3{font-size:14px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:.5px;margin:0 0 16px;}
`;

// Modal
const Overlay = styled.div`
  position:fixed;inset:0;background:rgba(15,23,42,.6);backdrop-filter:blur(4px);
  display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;
`;
const Modal = styled.div`
  background:#fff;border-radius:24px;padding:32px;width:100%;max-width:520px;
  box-shadow:0 24px 60px rgba(0,0,0,.25);animation:${fadeIn} .25s ease;
`;
const ModalTitle = styled.div`font-size:18px;font-weight:900;color:#0f172a;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;`;
const CloseBtn = styled.button`background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;&:hover{color:#ef4444;}`;
const FGrid = styled.div`display:grid;grid-template-columns:${p => p.$cols || '1fr 1fr'};gap:14px;margin-bottom:14px;`;
const FG = styled.div``;
const Lbl = styled.label`font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;display:block;margin-bottom:5px;`;
const Inp = styled.input`
  width:100%;padding:10px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;
  outline:none;box-sizing:border-box;
  &:focus{border-color:#4ade80;}
`;
const Sel = styled.select`
  width:100%;padding:10px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;
  outline:none;background:#fff;box-sizing:border-box;
  &:focus{border-color:#4ade80;}
`;
const TextA = styled.textarea`
  width:100%;padding:10px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;
  outline:none;resize:vertical;box-sizing:border-box;font-family:inherit;
  &:focus{border-color:#4ade80;}
`;
const ModalBtns = styled.div`display:flex;gap:10px;justify-content:flex-end;margin-top:20px;`;
const CancelBtn = styled.button`padding:10px 22px;border:1.5px solid #e2e8f0;border-radius:10px;background:#fff;color:#64748b;font-weight:700;cursor:pointer;`;
const SaveBtn = styled.button`padding:10px 22px;border:none;border-radius:10px;background:linear-gradient(135deg,#4ade80,#16a34a);color:#fff;font-weight:800;cursor:pointer;`;

const CATS = ['Yem', 'İlaç', 'Vitamin', 'Ekipman', 'Diğer'];
const PIE_COLORS = ['#4ade80', '#60a5fa', '#fb923c', '#a78bfa', '#94a3b8'];

const EMPTY = { urunAdi: '', kategori: 'Diğer', miktar: 0, birim: 'adet', kritikSeviye: 10, notlar: '' };

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

    const openEdit = item => { setEditing(item); setForm({ urunAdi: item.urunAdi, kategori: item.kategori, miktar: item.miktar, birim: item.birim, kritikSeviye: item.kritikSeviye, notlar: item.notlar || '' }); setShowModal(true); };
    const openNew = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };

    const filtered = stoklar.filter(s =>
        s.urunAdi.toLowerCase().includes(filter.toLowerCase()) &&
        (catFilter === 'Tümü' || s.kategori === catFilter)
    );

    const kritikler = stoklar.filter(s => s.miktar <= s.kritikSeviye);
    const pieData = CATS.map((c, i) => ({ name: c, value: stoklar.filter(s => s.kategori === c).length, fill: PIE_COLORS[i] })).filter(d => d.value > 0);

    return (
        <Page>
            <TopRow>
                <PageTitle>📦 Stok Yönetimi</PageTitle>
                <TopActions>
                    <ToggleViewBtns>
                        <TVBtn $active={viewMode === 'kare'} onClick={() => setViewMode('kare')}><FaThLarge size={11} /> Kare</TVBtn>
                        <TVBtn $active={viewMode === 'liste'} onClick={() => setViewMode('liste')}><FaList size={11} /> Liste</TVBtn>
                    </ToggleViewBtns>
                    <AddBtn onClick={openNew}><FaPlus /> Yeni Stok Ekle</AddBtn>
                </TopActions>
            </TopRow>

            {/* İstatistikler */}
            <StatRow>
                <Stat $color="#4ade80"><div className="val">{stoklar.length}</div><div className="lbl">Toplam Ürün</div></Stat>
                <Stat $color="#ef4444"><div className="val">{kritikler.length}</div><div className="lbl">Kritik Stok</div></Stat>
                <Stat $color="#fb923c"><div className="val">{CATS.filter(c => stoklar.some(s => s.kategori === c)).length}</div><div className="lbl">Kategori</div></Stat>
                <Stat $color="#60a5fa"><div className="val">{stoklar.filter(s => s.miktar > s.kritikSeviye).length}</div><div className="lbl">Yeterli Stok</div></Stat>
            </StatRow>

            {/* Kritik uyarı */}
            {kritikler.length > 0 && (
                <CritBanner>
                    <FaExclamationTriangle />
                    <div>{kritikler.length} ürün kritik seviyenin altında: {kritikler.map(k => k.urunAdi).join(', ')}</div>
                </CritBanner>
            )}

            {/* Kategori pie chart */}
            {pieData.length > 0 && (
                <ChartCard>
                    <h3>📊 Kategori Dağılımı</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={70} paddingAngle={4}>
                                {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                            </Pie>
                            <Tooltip formatter={(v, n) => [`${v} ürün`, n]} />
                            <Legend iconType="circle" iconSize={10} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}

            {/* Filtreler */}
            <FilterBar>
                <SearchWrap>
                    <FaSearch />
                    <SearchInput value={filter} onChange={e => setFilter(e.target.value)} placeholder="Ürün ara..." />
                </SearchWrap>
                {['Tümü', ...CATS].map(c => (
                    <CatBtn key={c} $active={catFilter === c} onClick={() => setCatFilter(c)}>{c}</CatBtn>
                ))}
            </FilterBar>

            {/* Kart/Liste görünüm */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Yükleniyor...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Ürün bulunamadı</div>
            ) : viewMode === 'kare' ? (
                <Grid>
                    {filtered.map(item => {
                        const pct = item.kritikSeviye > 0 ? (item.miktar / item.kritikSeviye) * 100 : 100;
                        const kritik = item.miktar <= item.kritikSeviye;
                        return (
                            <Card key={item._id} $kritik={kritik}>
                                <CardBody>
                                    <CardHead>
                                        <div>
                                            <UrunAdi>{item.urunAdi}</UrunAdi>
                                            <KatBadge $kat={item.kategori}>{item.kategori}</KatBadge>
                                        </div>
                                        {kritik && <FaExclamationTriangle style={{ color: '#ef4444', marginTop: 2 }} />}
                                    </CardHead>

                                    <MiktarWrap>
                                        <MiktarVal $kritik={kritik}>{item.miktar}</MiktarVal>
                                        <Birim>{item.birim}</Birim>
                                    </MiktarWrap>

                                    <ProgressBar $pct={pct}><div /></ProgressBar>
                                    <KrtikLabel>Kritik seviye: {item.kritikSeviye} {item.birim} · {new Date(item.sonGuncelleme || item.updatedAt).toLocaleDateString('tr-TR')}</KrtikLabel>

                                    {item.notlar && <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10, fontStyle: 'italic' }}>"{item.notlar}"</div>}

                                    <ActionBtns>
                                        <AB $t="sub" onClick={() => quickUpdate(item._id, 'cikar', 1)}><FaMinus /></AB>
                                        <AB $t="add" onClick={() => quickUpdate(item._id, 'ekle', 1)}><FaPlus /></AB>
                                        <AB $t="edit" $flex={2} onClick={() => openEdit(item)}><FaEdit /> Düzenle</AB>
                                        <AB $t="del" $flex={.6} onClick={() => handleDelete(item._id)}><FaTrash /></AB>
                                    </ActionBtns>
                                </CardBody>
                            </Card>
                        );
                    })}
                </Grid>
            ) : (
                <ListView>
                    {filtered.map(item => {
                        const pct = item.kritikSeviye > 0 ? (item.miktar / item.kritikSeviye) * 100 : 100;
                        const kritik = item.miktar <= item.kritikSeviye;
                        return (
                            <ListRow key={item._id} $kritik={kritik}>
                                <ListMain>
                                    <ListNameRow>
                                        <ListName>{item.urunAdi}</ListName>
                                        <KatBadge $kat={item.kategori}>{item.kategori}</KatBadge>
                                        {kritik && <FaExclamationTriangle style={{ color: '#ef4444', fontSize: 12 }} />}
                                    </ListNameRow>
                                    <ListMeta>
                                        <ListStock $kritik={kritik}>
                                            <span className="v">{item.miktar}</span>
                                            <span className="u">{item.birim}</span>
                                        </ListStock>
                                        <ListProgress $pct={pct}><div /></ListProgress>
                                        <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                                            Min: {item.kritikSeviye} {item.birim}
                                        </span>
                                    </ListMeta>
                                </ListMain>
                                <ListActions>
                                    <AB $t="sub" style={{ flex: 'none', width: 34 }} onClick={() => quickUpdate(item._id, 'cikar', 1)}><FaMinus /></AB>
                                    <AB $t="add" style={{ flex: 'none', width: 34 }} onClick={() => quickUpdate(item._id, 'ekle', 1)}><FaPlus /></AB>
                                    <AB $t="edit" style={{ flex: 'none', padding: '8px 14px' }} onClick={() => openEdit(item)}><FaEdit /></AB>
                                    <AB $t="del" style={{ flex: 'none', width: 34 }} onClick={() => handleDelete(item._id)}><FaTrash /></AB>
                                </ListActions>
                            </ListRow>
                        );
                    })}
                </ListView>
            )}

            {/* Modal */}
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
