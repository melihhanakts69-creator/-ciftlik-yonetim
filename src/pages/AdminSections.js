import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`to { transform: rotate(360deg); }`;
const fadeIn = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;

// ── Shared styled components ──────────────────────────────────────────────────
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
  input, textarea, select {
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
  background: ${p => p.$danger ? 'rgba(239,68,68,0.1)' : p.$primary ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.06)'};
  color: ${p => p.$danger ? '#f87171' : p.$primary ? '#4ade80' : '#94a3b8'};
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
  .td { font-size: 13px; color: #94a3b8; padding: 11px 0; }
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
const ErrBox = styled.div`
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.18);
  border-radius: 10px; padding: 14px 16px; color: #f87171; font-size: 12px;
  margin-bottom: 14px;
  strong { display: block; font-size: 13px; margin-bottom: 4px; }
`;

// Axios instance with auth header
function authAxios() {
    const token = localStorage.getItem('token');
    return axios.create({
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 15000,
    });
}

// ═════════════════════════════════════════════
// DASHBOARD SECTION
// ═════════════════════════════════════════════
export function DashboardSection({ API, toast_ }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true); setError('');
        authAxios().get(`${API}/api/admin/dashboard`)
            .then(r => { setData(r.data); setLoading(false); })
            .catch(e => {
                const msg = e.response?.data?.message || e.message || 'Bilinmeyen hata';
                setError(msg); setLoading(false);
                toast_('Dashboard verisi alinamadi: ' + msg, true);
            });
    }, [API]);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 20, color: '#475569' }}>
            <Loader style={{ borderTopColor: '#4ade80' }} /> Yukleniyor...
        </div>
    );
    if (error) return (
        <div>
            <PageHeader><span className="emoji">📊</span><div><h1>Dashboard</h1></div></PageHeader>
            <ErrBox>
                <strong>Veri alinamadi</strong>
                {error}<br /><br />
                <span style={{ color: '#94a3b8', fontSize: 11 }}>
                    Cozum: Once <strong>Giris / Hesap</strong> bolumunden giris yapin, sonra tekrar deneyin.
                    Backend sunucusunun calisiyor olmasi gerekiyor.
                </span>
            </ErrBox>
            <SmBtn $primary onClick={() => { setLoading(true); setError(''); authAxios().get(`${API}/api/admin/dashboard`).then(r => { setData(r.data); setLoading(false); }).catch(e => { setError(e.response?.data?.message || e.message); setLoading(false); }); }}>
                Tekrar Dene
            </SmBtn>
        </div>
    );

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <Card style={{ marginBottom: 0 }}>
                    <h3>Hayvan Dagilimi</h3>
                    {[
                        { label: 'Inek', val: data.hayvan.inek || 0, color: '#4ade80' },
                        { label: 'Duve', val: data.hayvan.duve || 0, color: '#60a5fa' },
                        { label: 'Buzagi', val: data.hayvan.buzagi || 0, color: '#c084fc' },
                        { label: 'Tosun', val: data.hayvan.tosun || 0, color: '#fb923c' },
                    ].map(h => {
                        const pct = data.hayvan.toplam ? Math.round((h.val / data.hayvan.toplam) * 100) : 0;
                        return (
                            <div key={h.label} style={{ marginBottom: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                                    <span>{h.label}</span><span style={{ color: h.color, fontWeight: 700 }}>{h.val}</span>
                                </div>
                                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)' }}>
                                    <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: h.color, transition: 'width 0.5s' }} />
                                </div>
                            </div>
                        );
                    })}
                </Card>
                <Card style={{ marginBottom: 0 }}>
                    <h3>Son 7 Gun — Yeni Kayitlar</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
                        {(data.gunlukKayitlar || []).map((g, i) => {
                            const max = Math.max(...(data.gunlukKayitlar || []).map(x => x.sayi), 1);
                            const h = Math.max((g.sayi / max) * 78, 4);
                            return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                                    <div style={{ fontSize: 9, color: '#4ade80', fontWeight: 700 }}>{g.sayi || ''}</div>
                                    <div style={{ width: '100%', height: h, background: 'linear-gradient(180deg,#4ade80,#16a34a)', borderRadius: 4, opacity: g.sayi ? 1 : 0.12 }} />
                                    <div style={{ fontSize: 8, color: '#334155', textAlign: 'center', lineHeight: 1.2 }}>{g.tarih}</div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

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
                    {(!data.sonKullanicilar || data.sonKullanicilar.length === 0) && (
                        <div style={{ padding: '16px 18px', color: '#334155', fontSize: 13 }}>Henuz kullanici kaydi yok.</div>
                    )}
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
    const [error, setError] = useState('');

    const fetchUsers = async (s = '') => {
        setLoading(true); setError('');
        try {
            const r = await authAxios().get(`${API}/api/admin/users?q=${encodeURIComponent(s)}&limit=50`);
            setUsers(r.data.users || []); setToplam(r.data.toplam || 0);
        } catch (e) {
            const msg = e.response?.data?.message || e.message;
            setError(msg); toast_('Kullanicilar alinamadi: ' + msg, true);
        }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, [API]);

    const toggleAktif = async (id, cur) => {
        try {
            await authAxios().patch(`${API}/api/admin/users/${id}`, { aktif: !cur });
            setUsers(p => p.map(u => u._id === id ? { ...u, aktif: !cur } : u));
            toast_(!cur ? 'Kullanici aktiflestirildi' : 'Pasife alindi');
        } catch (e) { toast_('Islem basarisiz: ' + (e.response?.data?.message || e.message), true); }
    };

    const deleteUser = async (id, isim) => {
        if (!window.confirm(`"${isim}" silinsin mi? Bu islem geri alinamaz.`)) return;
        try {
            await authAxios().delete(`${API}/api/admin/users/${id}`);
            setUsers(p => p.filter(u => u._id !== id)); setToplam(p => p - 1);
            toast_('Kullanici silindi');
        } catch (e) { toast_('Silme basarisiz: ' + (e.response?.data?.message || e.message), true); }
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
            {error && <ErrBox><strong>Hata</strong>{error}</ErrBox>}
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
                                <SmBtn onClick={() => toggleAktif(u._id, u.aktif !== false)} title={u.aktif !== false ? 'Pasife Al' : 'Aktifestir'}>
                                    {u.aktif !== false ? '⏸' : '▶️'}
                                </SmBtn>
                                <SmBtn $danger onClick={() => deleteUser(u._id, u.isim)} title="Sil">🗑</SmBtn>
                            </div>
                        </TRow>
                    ))}
                    {users.length === 0 && !loading && (
                        <div style={{ padding: 20, color: '#334155', textAlign: 'center', fontSize: 13 }}>
                            Kullanici bulunamadi.
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
    const [error, setError] = useState('');

    const fetchPosts = async () => {
        setLoading(true); setError('');
        try { const r = await authAxios().get(`${API}/api/admin/blog`); setPosts(r.data || []); }
        catch (e) { setError(e.response?.data?.message || e.message); toast_('Blog alinamadi', true); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchPosts(); }, [API]);

    const savePost = async () => {
        if (!editing.title) return toast_('Baslik gerekli', true);
        setSaving(true);
        try {
            const payload = { ...editing, tags: editing.tags ? editing.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
            if (editing._id) {
                const r = await authAxios().put(`${API}/api/admin/blog/${editing._id}`, payload);
                setPosts(p => p.map(x => x._id === editing._id ? r.data.post : x));
            } else {
                const r = await authAxios().post(`${API}/api/admin/blog`, payload);
                setPosts(p => [r.data.post, ...p]);
            }
            toast_('Yazi kaydedildi!'); setEditing(null);
        } catch (e) { toast_('Kayit basarisiz: ' + (e.response?.data?.message || e.message), true); }
        finally { setSaving(false); }
    };

    const deletePost = async (id) => {
        if (!window.confirm('Bu yazi silinsin mi?')) return;
        try { await authAxios().delete(`${API}/api/admin/blog/${id}`); setPosts(p => p.filter(x => x._id !== id)); toast_('Yazi silindi'); }
        catch (e) { toast_('Silme basarisiz', true); }
    };

    if (editing) return (
        <>
            <PageHeader><span className="emoji">✏️</span><div><h1>{editing._id ? 'Yaziyi Duzenle' : 'Yeni Yazi'}</h1><p>Blog / Duyurular</p></div></PageHeader>
            <Card>
                <h3>Icerik</h3>
                <Grid><Field><label>Baslik *</label><input value={editing.title} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} placeholder="Yazi basligi..." /></Field></Grid>
                <Grid $mt={10}><Field><label>Ozet</label><textarea value={editing.excerpt} onChange={e => setEditing(p => ({ ...p, excerpt: e.target.value }))} style={{ minHeight: 55 }} placeholder="Kisa ozet..." /></Field></Grid>
                <Grid $mt={10}><Field><label>Icerik</label><textarea value={editing.content} onChange={e => setEditing(p => ({ ...p, content: e.target.value }))} style={{ minHeight: 160 }} placeholder="Yazi icerigi..." /></Field></Grid>
                <Grid $cols="1fr 1fr" $mt={10}>
                    <Field><label>Yazar</label><input value={editing.author} onChange={e => setEditing(p => ({ ...p, author: e.target.value }))} /></Field>
                    <Field><label>Etiketler (virgulle)</label><input value={editing.tags} onChange={e => setEditing(p => ({ ...p, tags: e.target.value }))} placeholder="teknoloji, ciftlik" /></Field>
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
                <SaveBtn onClick={() => setEditing(null)} style={{ background: 'rgba(255,255,255,0.06)', boxShadow: 'none', color: '#94a3b8', marginTop: 18 }}>Iptal</SaveBtn>
            </div>
        </>
    );

    return (
        <>
            <PageHeader><span className="emoji">📝</span><div><h1>Blog / Duyurular</h1><p>{posts.length} yazi</p></div></PageHeader>
            {error && <ErrBox><strong>Hata</strong>{error}</ErrBox>}
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
                                    <div style={{ color: '#475569', fontSize: 12 }}>{p.excerpt || (p.content || '').slice(0, 90) + '...'}</div>
                                    <div style={{ color: '#334155', fontSize: 11, marginTop: 5 }}>{p.author} · {new Date(p.createdAt).toLocaleDateString('tr-TR')}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                                <SmBtn $primary onClick={() => setEditing({ ...p, tags: (p.tags || []).join(', ') })}>Duzenle</SmBtn>
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
    const [error, setError] = useState('');

    useEffect(() => {
        authAxios().get(`${API}/api/admin/settings`)
            .then(r => setSettings({ ...DEFAULT_APP_SETTINGS, ...r.data }))
            .catch(e => { setError(e.response?.data?.message || e.message); setSettings(DEFAULT_APP_SETTINGS); });
    }, [API]);

    const toggle = (k) => setSettings(p => ({ ...p, [k]: !p[k] }));
    const upd = (k, v) => setSettings(p => ({ ...p, [k]: v }));

    const save = async () => {
        setSaving(true);
        try { await authAxios().put(`${API}/api/admin/settings`, settings); toast_('Ayarlar kaydedildi!'); }
        catch (e) { toast_('Kayit basarisiz: ' + (e.response?.data?.message || e.message), true); }
        finally { setSaving(false); }
    };

    if (!settings) return <div style={{ color: '#475569', padding: 20 }}>Yukleniyor...</div>;

    const flags = [
        { key: 'bakimModu', name: 'Bakim Modu', desc: "Aciksa landing page'de bakim banner gozukur", danger: true },
        { key: 'kayitAcik', name: 'Yeni Kayit Acik', desc: 'Kapatirsan kayit ol devre disi kalir' },
        { key: 'yemDanismaniAktif', name: 'Yem Danismani AI', desc: 'Uygulamada AI yem danismani' },
        { key: 'finansalModulAktif', name: 'Finansal Modul', desc: 'Kullanicilarin finansal raporlara erisimi' },
        { key: 'saglikModulAktif', name: 'Saglik Modulu', desc: 'Saglik kaydi ve asi takip modulu' },
    ];

    return (
        <>
            <PageHeader><span className="emoji">⚙️</span><div><h1>Uygulama Ayarlari</h1><p>Ozellik bayraklari ve sistem limitleri</p></div></PageHeader>
            {error && <ErrBox><strong>Ayarlar yuklenemedi (varsayilan degerler kullaniliyor)</strong>{error}</ErrBox>}
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
                    <Field><label>Max Hayvan Limiti</label><input type="number" value={settings.maxHayvanLimiti} onChange={e => upd('maxHayvanLimiti', parseInt(e.target.value) || 0)} /></Field>
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

// ═════════════════════════════════════════════
// MEDIA MANAGER SECTION (Gorsel Yonetimi)
// ═════════════════════════════════════════════
const MediaGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px; margin-bottom: 16px;
`;
const MediaCard = styled.div`
  background: #10131f; border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px; overflow: hidden; position: relative;
  transition: border-color 0.15s;
  &:hover { border-color: rgba(74,222,128,0.25); }
  img { width: 100%; height: 130px; object-fit: cover; display: block; }
  .placeholder { width: 100%; height: 130px; background: rgba(255,255,255,0.02);
    display: flex; align-items: center; justify-content: center; font-size: 28px;
    border-bottom: 1px solid rgba(255,255,255,0.05); }
  .body { padding: 10px 12px; }
  .label { font-size: 12px; font-weight: 700; color: #e2e8f0; margin-bottom: 3px; }
  .url-txt { font-size: 10px; color: #334155; word-break: break-all; line-height: 1.4; margin-bottom: 8px; }
  .actions { display: flex; gap: 6px; }
`;
const UrlInput = styled.div`
  display: flex; gap: 8px; margin-top: 6px;
  input {
    flex: 1; background: #0a0c14; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; padding: 8px 10px; color: #e2e8f0; font-size: 12px;
    font-family: inherit; outline: none;
    &:focus { border-color: #4ade80; }
    &::placeholder { color: #334155; }
  }
  button {
    background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.2);
    border-radius: 8px; color: #4ade80; padding: 8px 14px; font-size: 12px;
    font-weight: 700; cursor: pointer; white-space: nowrap;
    &:hover { background: rgba(74,222,128,0.18); }
  }
`;
const NewsCard = styled.div`
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px; overflow: hidden; display: flex; gap: 0;
  margin-bottom: 10px; position: relative;
  img { width: 120px; height: 90px; object-fit: cover; flex-shrink: 0; }
  .no-img { width: 120px; height: 90px; background: rgba(255,255,255,0.03);
    display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
  .content { padding: 12px 14px; flex: 1; }
  .title { font-size: 13px; font-weight: 700; color: #e2e8f0; margin-bottom: 4px; }
  .meta { font-size: 11px; color: #475569; }
  .del { position: absolute; top: 8px; right: 8px; background: rgba(239,68,68,0.12);
    border: none; border-radius: 6px; color: #f87171; padding: 3px 8px;
    font-size: 11px; font-weight: 700; cursor: pointer; }
`;

const STATIC_SLOTS = [
    { key: 'heroImage', label: 'Hero Arkaplan', icon: '🌄', desc: 'Ana sayfa arka plan gorseli (1920x1080 onerilen)' },
    { key: 'logoUrl', label: 'Logo', icon: '🏷️', desc: 'Site logosu PNG/SVG' },
    { key: 'ogImage', label: 'OG Gorseli', icon: '📤', desc: 'Sosyal medya paylasim gorseli (1200x630)' },
    { key: 'featuresImage', label: 'Ozellikler Gorseli', icon: '✨', desc: 'Ozellikler bolumu gorseli' },
];

export function MediaSection({ API, toast_ }) {
    const [images, setImages] = useState({ heroImage: '', logoUrl: '', ogImage: '', featuresImage: '' });
    const [newsItems, setNewsItems] = useState([]);
    const [newNews, setNewNews] = useState({ title: '', imageUrl: '', link: '', date: '' });
    const [editingSlot, setEditingSlot] = useState(null);
    const [slotDraft, setSlotDraft] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authAxios().get(`${API}/api/admin/content`)
            .then(r => {
                setImages(r.data.images || {});
                setNewsItems(r.data.newsItems || []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [API]);

    const saveImages = async () => {
        setSaving(true);
        try {
            await authAxios().put(`${API}/api/admin/content/images`, { data: images });
            toast_('Gorseller kaydedildi!');
        } catch { toast_('Kayit basarisiz', true); }
        finally { setSaving(false); }
    };

    const saveNews = async (items) => {
        try {
            await authAxios().put(`${API}/api/admin/content/newsItems`, { data: items });
        } catch { toast_('Haber kaydedilemedi', true); }
    };

    const addNews = async () => {
        if (!newNews.title) return toast_('Baslik gerekli', true);
        const item = { ...newNews, id: Date.now(), date: newNews.date || new Date().toLocaleDateString('tr-TR') };
        const updated = [item, ...newsItems];
        setNewsItems(updated);
        setNewNews({ title: '', imageUrl: '', link: '', date: '' });
        await saveNews(updated);
        toast_('Haber eklendi!');
    };

    const removeNews = async (id) => {
        const updated = newsItems.filter(n => n.id !== id);
        setNewsItems(updated);
        await saveNews(updated);
        toast_('Haber silindi');
    };

    if (loading) return <div style={{ color: '#475569', padding: 20 }}>Yukleniyor...</div>;

    return (
        <>
            <PageHeader><span className="emoji">🖼️</span><div><h1>Gorsel Yonetimi</h1><p>Site gorselleri ve haftalik haberler</p></div></PageHeader>

            {/* STATIC SLOTS */}
            <Card>
                <h3>Site Gorselleri</h3>
                <MediaGrid>
                    {STATIC_SLOTS.map(slot => (
                        <MediaCard key={slot.key}>
                            {images[slot.key]
                                ? <img src={images[slot.key]} alt={slot.label} onError={e => e.target.style.display = 'none'} />
                                : <div className="placeholder">{slot.icon}</div>
                            }
                            <div className="body">
                                <div className="label">{slot.label}</div>
                                <div className="url-txt">{images[slot.key] ? images[slot.key] : 'Gorsel eklenmemis'}</div>
                                {editingSlot === slot.key ? (
                                    <UrlInput>
                                        <input
                                            autoFocus
                                            value={slotDraft}
                                            onChange={e => setSlotDraft(e.target.value)}
                                            placeholder="https://..."
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') { setImages(p => ({ ...p, [slot.key]: slotDraft })); setEditingSlot(null); }
                                                if (e.key === 'Escape') setEditingSlot(null);
                                            }}
                                        />
                                        <button onClick={() => { setImages(p => ({ ...p, [slot.key]: slotDraft })); setEditingSlot(null); }}>Tamam</button>
                                    </UrlInput>
                                ) : (
                                    <div className="actions">
                                        <SmBtn $primary onClick={() => { setSlotDraft(images[slot.key] || ''); setEditingSlot(slot.key); }}>
                                            Gorsel Degistir
                                        </SmBtn>
                                        {images[slot.key] && <SmBtn $danger onClick={() => setImages(p => ({ ...p, [slot.key]: '' }))}>Kaldir</SmBtn>}
                                    </div>
                                )}
                            </div>
                        </MediaCard>
                    ))}
                </MediaGrid>
                <div style={{ fontSize: 11, color: '#475569', marginBottom: 12 }}>
                    Gorsel URL'sini girdikten sonra "Tum Gorselleri Kaydet" ile kaydet.
                </div>
                <SaveBtn onClick={saveImages} disabled={saving}>{saving ? <Loader /> : '💾'} Tum Gorselleri Kaydet</SaveBtn>
            </Card>

            {/* NEWS / PROMO IMAGES */}
            <Card>
                <h3>Haftalik Haberler ve Duyurular</h3>
                <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.12)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', marginBottom: 10 }}>Yeni Haber / Tanitim Ekle</div>
                    <Grid $cols="1fr 1fr">
                        <Field>
                            <label>Baslik *</label>
                            <input value={newNews.title} onChange={e => setNewNews(p => ({ ...p, title: e.target.value }))} placeholder="Haber basligi..." />
                        </Field>
                        <Field>
                            <label>Tarih</label>
                            <input value={newNews.date} onChange={e => setNewNews(p => ({ ...p, date: e.target.value }))} placeholder="01.03.2026" />
                        </Field>
                    </Grid>
                    <Grid $mt={8}>
                        <Field>
                            <label>Gorsel URL</label>
                            <input value={newNews.imageUrl} onChange={e => setNewNews(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://... (Unsplash, ImgBB vs.)" />
                        </Field>
                    </Grid>
                    {newNews.imageUrl && (
                        <img src={newNews.imageUrl} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />
                    )}
                    <Grid $mt={8}>
                        <Field>
                            <label>Link (Opsiyonel)</label>
                            <input value={newNews.link} onChange={e => setNewNews(p => ({ ...p, link: e.target.value }))} placeholder="https://... (tiklayinca gidecegi sayfa)" />
                        </Field>
                    </Grid>
                    <button
                        onClick={addNews}
                        style={{ marginTop: 12, background: 'linear-gradient(135deg,#4ade80,#16a34a)', border: 'none', borderRadius: 8, color: '#fff', padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                    >
                        + Haberi Ekle
                    </button>
                </div>

                {newsItems.length === 0 ? (
                    <div style={{ color: '#334155', textAlign: 'center', padding: '16px 0', fontSize: 13 }}>
                        Hic haber eklenmemis. Yukardaki formu kullan!
                    </div>
                ) : (
                    newsItems.map(n => (
                        <NewsCard key={n.id}>
                            {n.imageUrl ? <img src={n.imageUrl} alt="" /> : <div className="no-img">📰</div>}
                            <div className="content">
                                <div className="title">{n.title}</div>
                                <div className="meta">{n.date}{n.link && <> · <a href={n.link} target="_blank" rel="noreferrer" style={{ color: '#4ade80', textDecoration: 'none' }}>Link</a></>}</div>
                            </div>
                            <button className="del" onClick={() => removeNews(n.id)}>Sil</button>
                        </NewsCard>
                    ))
                )}
            </Card>
        </>
    );
}
