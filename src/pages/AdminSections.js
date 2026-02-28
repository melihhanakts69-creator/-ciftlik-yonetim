import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`to { transform: rotate(360deg); }`;
const fadeIn = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;

// ── Shared mini styled components ────────────────────────────────────────────
const PageHeader = styled.div`
  margin-bottom: 24px; display: flex; align-items: center; gap: 14px;
  .emoji { font-size: 30px; }
  h1 { font-size: 21px; font-weight: 800; color: #fff; margin: 0; letter-spacing: -0.5px; }
  p { font-size: 13px; color: #475569; margin: 4px 0 0; }
`;
const Card = styled.div`
  background: #10131f; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05);
  padding: 20px; margin-bottom: 14px; animation: ${fadeIn} 0.25s ease;
  h3 { font-size: 11px; font-weight: 700; color: #475569; margin: 0 0 14px;
    padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);
    text-transform: uppercase; letter-spacing: 0.5px; }
`;
const Grid = styled.div`
  display: grid; grid-template-columns: ${p => p.$cols || '1fr'};
  gap: ${p => p.$gap || '13px'}; ${p => p.$mt && `margin-top: ${p.$mt}px;`}
`;
const Field = styled.div`
  display: flex; flex-direction: column; gap: 5px;
  label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.4px; }
  input, textarea {
    background: #0a0c14; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; padding: 9px 11px; color: #e2e8f0; font-size: 13px;
    font-family: inherit; outline: none; resize: vertical;
    &:focus { border-color: #4ade80; }
    &::placeholder { color: #334155; }
  }
  textarea { min-height: 70px; line-height: 1.5; }
`;
const SaveBtn = styled.button`
  display: flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #4ade80, #16a34a);
  border: none; border-radius: 10px; color: #fff;
  padding: 11px 26px; font-size: 14px; font-weight: 700;
  cursor: pointer; margin-top: 18px; transition: all 0.2s;
  box-shadow: 0 4px 18px rgba(74,222,128,0.22);
  &:hover { transform: translateY(-1px); }
  &:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
`;
const AddBtn = styled.button`
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;
  background: rgba(74,222,128,0.05); border: 1px dashed rgba(74,222,128,0.2);
  border-radius: 10px; color: #4ade80; padding: 10px; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
  &:hover { background: rgba(74,222,128,0.1); }
`;
const ItemCard = styled.div`
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px; padding: 15px; margin-bottom: 10px;
`;
const SmBtn = styled.button`
  border: none; border-radius: 7px; padding: 5px 10px; font-size: 11px; font-weight: 700;
  cursor: pointer; transition: all 0.15s;
  background: ${p => p.$danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)'};
  color: ${p => p.$danger ? '#f87171' : '#94a3b8'};
  &:hover { opacity: 0.8; }
`;
const Loader = styled.div`
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;
const StatGrid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 22px;
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
`;
const StatCard = styled.div`
  background: ${p => p.$color || 'rgba(74,222,128,0.06)'};
  border: 1px solid ${p => p.$border || 'rgba(74,222,128,0.15)'};
  border-radius: 14px; padding: 18px 20px;
  .val { font-size: 30px; font-weight: 900; color: ${p => p.$textColor || '#4ade80'}; letter-spacing: -1px; }
  .lbl { font-size: 11px; color: #475569; margin-top: 3px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
  .sub { font-size: 11px; color: ${p => p.$textColor || '#4ade80'}; margin-top: 6px; opacity: 0.7; }
`;
const Table = styled.div`
  background: #10131f; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden;
`;
const THead = styled.div`
  display: grid; grid-template-columns: ${p => p.$cols};
  background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.06);
  padding: 0 18px;
  .th { font-size: 10px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; padding: 11px 0; }
`;
const TRow = styled.div`
  display: grid; grid-template-columns: ${p => p.$cols};
  padding: 0 18px; border-bottom: 1px solid rgba(255,255,255,0.03); align-items: center;
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(255,255,255,0.02); }
  .td { font-size: 13px; color: #94a3b8; padding: 12px 0; }
  .name { color: #e2e8f0; font-weight: 600; }
`;
const Badge = styled.span`
  display: inline-block; padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 700;
  background: ${p => p.$active ? 'rgba(74,222,128,0.12)' : 'rgba(239,68,68,0.1)'};
  color: ${p => p.$active ? '#4ade80' : '#f87171'};
`;
const SearchBar = styled.div`
  display: flex; gap: 10px; margin-bottom: 16px;
  input {
    flex: 1; background: #10131f; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px; padding: 10px 14px; color: #e2e8f0; font-size: 13px;
    font-family: inherit; outline: none;
    &:focus { border-color: #4ade80; }
    &::placeholder { color: #334155; }
  }
  button {
    background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.2);
    border-radius: 10px; color: #4ade80; padding: 10px 18px;
    font-size: 13px; font-weight: 700; cursor: pointer;
    &:hover { background: rgba(74,222,128,0.18); }
  }
`;
const ToggleRow = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
  &:last-child { border-bottom: none; padding-bottom: 0; }
  .info { flex: 1; }
  .name { font-size: 13px; font-weight: 700; color: #e2e8f0; }
  .desc { font-size: 11px; color: #475569; margin-top: 2px; }
`;
const Toggle = styled.button`
  width: 46px; height: 26px; border-radius: 13px; border: none;
  background: ${p => p.$on ? 'linear-gradient(135deg, #4ade80, #16a34a)' : 'rgba(255,255,255,0.08)'};
  cursor: pointer; position: relative; transition: all 0.2s; flex-shrink: 0;
  &::after {
    content: ''; position: absolute;
    top: 3px; left: ${p => p.$on ? '23px' : '3px'};
    width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: left 0.2s;
  }
`;

// ═════════════════════════════════════════════
// DASHBOARD SECTION
// ═════════════════════════════════════════════
export function DashboardSection({ API, toast_ }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API}/api/admin/dashboard`)
            .then(r => { setData(r.data); setLoading(false); })
            .catch(() => { toast_('Dashboard verisi alinamadi', true); setLoading(false); });
    }, [API]);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 20, color: '#475569' }}>
            <Loader style={{ borderTopColor: '#4ade80' }} /> Yukleniyor...
        </div>
    );
    if (!data) return <div style={{ color: '#f87171', padding: 20 }}>Veri alinamadi</div>;

    return (
        <>
            <PageHeader><span className="emoji">📊</span><div><h1>Dashboard</h1><p>Genel istatistikler ve ozet</p></div></PageHeader>
            <StatGrid>
                <StatCard $color="rgba(74,222,128,0.06)" $border="rgba(74,222,128,0.15)" $textColor="#4ade80">
                    <div className="val">{data.kullanici.toplam}</div>
                    <div className="lbl">Toplam Kullanici</div>
                    <div className="sub">Bu hafta +{data.kullanici.buHafta}</div>
                </StatCard>
                <StatCard $color="rgba(59,130,246,0.06)" $border="rgba(59,130,246,0.15)" $textColor="#60a5fa">
                    <div className="val">{data.hayvan.toplam}</div>
                    <div className="lbl">Toplam Hayvan</div>
                    <div className="sub">Inek · Duve · Buzagi · Tosun</div>
                </StatCard>
                <StatCard $color="rgba(168,85,247,0.06)" $border="rgba(168,85,247,0.15)" $textColor="#c084fc">
                    <div className="val">{data.kullanici.aktif}</div>
                    <div className="lbl">Aktif Kullanici</div>
                    <div className="sub">Bu ay +{data.kullanici.buAy}</div>
                </StatCard>
                <StatCard $color="rgba(251,146,60,0.06)" $border="rgba(251,146,60,0.15)" $textColor="#fb923c">
                    <div className="val">{(data.hayvan.buzagi || 0) + (data.hayvan.duve || 0)}</div>
                    <div className="lbl">Genc Hayvan</div>
                    <div className="sub">Duve + Buzagi</div>
                </StatCard>
            </StatGrid>

            <Card>
                <h3>Son 7 Gun — Yeni Kayitlar</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 88, marginTop: 8 }}>
                    {(data.gunlukKayitlar || []).map((g, i) => {
                        const max = Math.max(...(data.gunlukKayitlar || []).map(x => x.sayi), 1);
                        const h = Math.max((g.sayi / max) * 72, 4);
                        return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <div style={{ fontSize: 10, color: '#4ade80', fontWeight: 700 }}>{g.sayi || ''}</div>
                                <div style={{ width: '100%', height: h, background: 'linear-gradient(180deg,#4ade80,#16a34a)', borderRadius: 4, opacity: g.sayi ? 1 : 0.15 }} />
                                <div style={{ fontSize: 9, color: '#334155', textAlign: 'center' }}>{g.tarih}</div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            <Card>
                <h3>Son Kayit Olan Kullanicilar</h3>
                <Table>
                    <THead $cols="1fr 1fr 1fr 80px">
                        <div className="th">Isim</div><div className="th">Isletme</div>
                        <div className="th">E-posta</div><div className="th">Durum</div>
                    </THead>
                    {(data.sonKullanicilar || []).map(u => (
                        <TRow key={u._id} $cols="1fr 1fr 1fr 80px">
                            <div className="td name">{u.isim}</div>
                            <div className="td">{u.isletmeAdi || '—'}</div>
                            <div className="td" style={{ fontSize: 11 }}>{u.email}</div>
                            <div className="td"><Badge $active={u.aktif !== false}>{u.aktif !== false ? 'Aktif' : 'Pasif'}</Badge></div>
                        </TRow>
                    ))}
                </Table>
            </Card>
        </>
    );
}

// ═════════════════════════════════════════════
// USERS SECTION
// ═════════════════════════════════════════════
export function UsersSection({ API, toast_ }) {
    const [users, setUsers] = useState([]);
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(true);
    const [toplam, setToplam] = useState(0);

    const fetchUsers = async (s = '') => {
        setLoading(true);
        try {
            const r = await axios.get(`${API}/api/admin/users?q=${s}&limit=50`);
            setUsers(r.data.users); setToplam(r.data.toplam);
        } catch { toast_('Kullanicilar alinamadi', true); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, [API]);

    const toggleAktif = async (id, cur) => {
        try {
            await axios.patch(`${API}/api/admin/users/${id}`, { aktif: !cur });
            setUsers(p => p.map(u => u._id === id ? { ...u, aktif: !cur } : u));
            toast_(!cur ? 'Kullanici aktiflestirildi' : 'Pasife alindi');
        } catch { toast_('Islem basarisiz', true); }
    };

    const deleteUser = async (id, isim) => {
        if (!window.confirm(`"${isim}" silinsin mi?`)) return;
        try {
            await axios.delete(`${API}/api/admin/users/${id}`);
            setUsers(p => p.filter(u => u._id !== id));
            toast_('Kullanici silindi');
        } catch { toast_('Silme basarisiz', true); }
    };

    return (
        <>
            <PageHeader><span className="emoji">👥</span><div><h1>Kullanicilar</h1><p>Toplam {toplam} kayitli kullanici</p></div></PageHeader>
            <SearchBar>
                <input placeholder="Isim, e-posta veya isletme ara..."
                    value={q} onChange={e => setQ(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchUsers(q)} />
                <button onClick={() => fetchUsers(q)}>Ara</button>
            </SearchBar>
            {loading ? <div style={{ color: '#475569', padding: 16 }}>Yukleniyor...</div> : (
                <Table>
                    <THead $cols="1.4fr 1fr 1.5fr 70px 80px 80px">
                        <div className="th">Isim</div><div className="th">Isletme</div><div className="th">E-posta</div>
                        <div className="th">Durum</div><div className="th">Kayit</div><div className="th">Islem</div>
                    </THead>
                    {users.map(u => (
                        <TRow key={u._id} $cols="1.4fr 1fr 1.5fr 70px 80px 80px">
                            <div className="td name">{u.isim}</div>
                            <div className="td">{u.isletmeAdi || '—'}</div>
                            <div className="td" style={{ fontSize: 11 }}>{u.email}</div>
                            <div className="td"><Badge $active={u.aktif !== false}>{u.aktif !== false ? 'Aktif' : 'Pasif'}</Badge></div>
                            <div className="td" style={{ fontSize: 11 }}>
                                {new Date(u.createdAt || u.kayitTarihi).toLocaleDateString('tr-TR')}
                            </div>
                            <div className="td" style={{ display: 'flex', gap: 5 }}>
                                <SmBtn onClick={() => toggleAktif(u._id, u.aktif !== false)}>
                                    {u.aktif !== false ? '⏸' : '▶️'}
                                </SmBtn>
                                <SmBtn $danger onClick={() => deleteUser(u._id, u.isim)}>🗑</SmBtn>
                            </div>
                        </TRow>
                    ))}
                    {users.length === 0 && (
                        <div style={{ padding: 20, color: '#334155', textAlign: 'center', fontSize: 13 }}>
                            Kullanici bulunamadi
                        </div>
                    )}
                </Table>
            )}
        </>
    );
}

// ═════════════════════════════════════════════
// BLOG SECTION
// ═════════════════════════════════════════════
const EMPTY_POST = { title: '', excerpt: '', content: '', imageUrl: '', published: false, author: 'Agrolina Admin', tags: '' };

export function BlogSection({ API, toast_ }) {
    const [posts, setPosts] = useState([]);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchPosts = async () => {
        setLoading(true);
        try { const r = await axios.get(`${API}/api/admin/blog`); setPosts(r.data); }
        catch { toast_('Blog alinamadi', true); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPosts(); }, [API]);

    const savePost = async () => {
        if (!editing.title) return toast_('Baslik gerekli', true);
        setSaving(true);
        try {
            const payload = { ...editing, tags: editing.tags ? editing.tags.split(',').map(t => t.trim()) : [] };
            if (editing._id) {
                const r = await axios.put(`${API}/api/admin/blog/${editing._id}`, payload);
                setPosts(p => p.map(x => x._id === editing._id ? r.data.post : x));
            } else {
                const r = await axios.post(`${API}/api/admin/blog`, payload);
                setPosts(p => [r.data.post, ...p]);
            }
            toast_('Yazi kaydedildi!'); setEditing(null);
        } catch { toast_('Kayit basarisiz', true); }
        finally { setSaving(false); }
    };

    const deletePost = async (id) => {
        if (!window.confirm('Silinsin mi?')) return;
        try { await axios.delete(`${API}/api/admin/blog/${id}`); setPosts(p => p.filter(x => x._id !== id)); toast_('Yazi silindi'); }
        catch { toast_('Silme basarisiz', true); }
    };

    if (editing) return (
        <>
            <PageHeader><span className="emoji">✏️</span><div><h1>{editing._id ? 'Duzenle' : 'Yeni Yazi'}</h1><p>Blog</p></div></PageHeader>
            <Card>
                <h3>Icerik</h3>
                <Grid><Field><label>Baslik</label><input value={editing.title} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} placeholder="Yazi basligi..." /></Field></Grid>
                <Grid $mt={10}><Field><label>Ozet</label><textarea value={editing.excerpt} onChange={e => setEditing(p => ({ ...p, excerpt: e.target.value }))} style={{ minHeight: 55 }} placeholder="Kisa ozet..." /></Field></Grid>
                <Grid $mt={10}><Field><label>Icerik</label><textarea value={editing.content} onChange={e => setEditing(p => ({ ...p, content: e.target.value }))} style={{ minHeight: 160 }} placeholder="Yazi icerigi..." /></Field></Grid>
                <Grid $cols="1fr 1fr" $mt={10}>
                    <Field><label>Yazar</label><input value={editing.author} onChange={e => setEditing(p => ({ ...p, author: e.target.value }))} /></Field>
                    <Field><label>Etiketler (virgul)</label><input value={editing.tags} onChange={e => setEditing(p => ({ ...p, tags: e.target.value }))} placeholder="teknoloji, ciftlik" /></Field>
                </Grid>
                <Grid $mt={10}><Field><label>Gorsel URL</label><input value={editing.imageUrl} onChange={e => setEditing(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." /></Field></Grid>
                {editing.imageUrl && <img src={editing.imageUrl} alt="" style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
            </Card>
            <Card>
                <h3>Yayin Durumu</h3>
                <ToggleRow>
                    <div className="info"><div className="name">Yayinla</div><div className="desc">Landing page blog listesinde gozuksun</div></div>
                    <Toggle $on={editing.published} onClick={() => setEditing(p => ({ ...p, published: !p.published }))} />
                </ToggleRow>
            </Card>
            <div style={{ display: 'flex', gap: 10 }}>
                <SaveBtn onClick={savePost} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                <SaveBtn onClick={() => setEditing(null)} style={{ background: 'rgba(255,255,255,0.06)', boxShadow: 'none', color: '#94a3b8' }}>Iptal</SaveBtn>
            </div>
        </>
    );

    return (
        <>
            <PageHeader><span className="emoji">📝</span><div><h1>Blog / Duyurular</h1><p>{posts.length} yazi</p></div></PageHeader>
            <AddBtn onClick={() => setEditing({ ...EMPTY_POST })} style={{ marginBottom: 16 }}>+ Yeni Yazi Ekle</AddBtn>
            {loading ? <div style={{ color: '#475569', padding: 16 }}>Yukleniyor...</div>
                : posts.length === 0
                    ? <Card><div style={{ color: '#334155', textAlign: 'center', padding: '20px 0' }}>Hic yazi yok. Ilk yaziyi ekle!</div></Card>
                    : posts.map(p => (
                        <ItemCard key={p._id}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                {p.imageUrl && <img src={p.imageUrl} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 14 }}>{p.title}</span>
                                        <Badge $active={p.published}>{p.published ? 'Yayinda' : 'Taslak'}</Badge>
                                    </div>
                                    <div style={{ color: '#475569', fontSize: 12 }}>{p.excerpt || (p.content || '').slice(0, 80) + '...'}</div>
                                    <div style={{ color: '#334155', fontSize: 11, marginTop: 5 }}>{p.author} · {new Date(p.createdAt).toLocaleDateString('tr-TR')}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                                <SmBtn onClick={() => setEditing({ ...p, tags: (p.tags || []).join(', ') })}>Duzenle</SmBtn>
                                <SmBtn $danger onClick={() => deletePost(p._id)}>Sil</SmBtn>
                            </div>
                        </ItemCard>
                    ))
            }
        </>
    );
}

// ═════════════════════════════════════════════
// SETTINGS SECTION
// ═════════════════════════════════════════════
const DEFAULT_APP_SETTINGS = {
    bakimModu: false, kayitAcik: true,
    yemDanismaniAktif: true, finansalModulAktif: true, saglikModulAktif: true,
    maxHayvanLimiti: 500, destek_email: 'destek@agrolina.com',
};

export function SettingsSection({ API, toast_ }) {
    const [settings, setSettings] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        axios.get(`${API}/api/admin/settings`)
            .then(r => setSettings({ ...DEFAULT_APP_SETTINGS, ...r.data }))
            .catch(() => setSettings(DEFAULT_APP_SETTINGS));
    }, [API]);

    const toggle = (k) => setSettings(p => ({ ...p, [k]: !p[k] }));
    const upd = (k, v) => setSettings(p => ({ ...p, [k]: v }));

    const save = async () => {
        setSaving(true);
        try { await axios.put(`${API}/api/admin/settings`, settings); toast_('Ayarlar kaydedildi!'); }
        catch { toast_('Kayit basarisiz', true); }
        finally { setSaving(false); }
    };

    if (!settings) return <div style={{ color: '#475569', padding: 20 }}>Yukleniyor...</div>;

    const flags = [
        { key: 'bakimModu', name: 'Bakim Modu', desc: "Aciksa landing page'de bakim banner gozukur", danger: true },
        { key: 'kayitAcik', name: 'Yeni Kayit Acik', desc: 'Kapatirsan kayit ol devre disi kalir' },
        { key: 'yemDanismaniAktif', name: 'Yem Danismani AI', desc: 'Uygulamada AI yem danismani modulu' },
        { key: 'finansalModulAktif', name: 'Finansal Modul', desc: 'Kullanicilarin finansal raporlara erisimi' },
        { key: 'saglikModulAktif', name: 'Saglik Modulu', desc: 'Saglik kaydi ve asi takip modulu' },
    ];

    return (
        <>
            <PageHeader><span className="emoji">⚙️</span><div><h1>Uygulama Ayarlari</h1><p>Ozellik bayraklari ve sistem limitleri</p></div></PageHeader>
            <Card>
                <h3>Ozellik Bayraklari</h3>
                {flags.map(f => (
                    <ToggleRow key={f.key}>
                        <div className="info">
                            <div className="name" style={f.danger && settings[f.key] ? { color: '#f87171' } : {}}>{f.name}</div>
                            <div className="desc">{f.desc}</div>
                        </div>
                        <Toggle $on={settings[f.key]} onClick={() => toggle(f.key)} />
                    </ToggleRow>
                ))}
            </Card>
            <Card>
                <h3>Limitler ve Iletisim</h3>
                <Grid $cols="1fr 1fr">
                    <Field><label>Max Hayvan Limiti</label><input type="number" value={settings.maxHayvanLimiti} onChange={e => upd('maxHayvanLimiti', parseInt(e.target.value))} /></Field>
                    <Field><label>Destek E-posta</label><input type="email" value={settings.destek_email} onChange={e => upd('destek_email', e.target.value)} /></Field>
                </Grid>
            </Card>
            {settings.bakimModu && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#f87171', marginBottom: 14 }}>
                    Bakim modu aktif! Landing page ziyaretcilere bakim mesaji gosteriyor.
                </div>
            )}
            <SaveBtn onClick={save} disabled={saving}>{saving ? <Loader /> : '💾'} Ayarlari Kaydet</SaveBtn>
        </>
    );
}
