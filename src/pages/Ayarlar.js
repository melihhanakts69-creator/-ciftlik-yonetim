import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import * as api from '../services/api';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;

// ── Styled ────────────────────────────────────────────────────────
const Page = styled.div`
  max-width: 860px; margin: 0 auto; padding: 24px 16px; animation: ${fadeIn} 0.4s ease;
  font-family: 'Inter', system-ui, sans-serif;
`;
const PageTitle = styled.h1`
  font-size: 22px; font-weight: 900; color: #1e293b; margin: 0 0 24px;
  display: flex; align-items: center; gap: 10px;
`;
const Grid = styled.div`display: grid; gap: 20px;`;
const Card = styled.div`
  background: #fff; border-radius: 20px; box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  overflow: hidden;
`;
const CardHeader = styled.div`
  padding: 18px 24px; border-bottom: 1px solid #f1f5f9;
  font-size: 14px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;
  display: flex; align-items: center; gap: 8px;
`;
const CardBody = styled.div`padding: 24px;`;

// Profil Kartı
const ProfileBand = styled.div`
  background: linear-gradient(135deg, #0a1628 0%, #1a3a2a 100%);
  padding: 28px 24px; display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
  @media (max-width: 560px) { flex-direction: column; text-align: center; }
`;
const AvatarWrap = styled.div`position: relative; cursor: pointer;`;
const Avatar = styled.div`
  width: 80px; height: 80px; border-radius: 50%; border: 3px solid rgba(74,222,128,0.5);
  background: linear-gradient(135deg, #16a34a, #4ade80);
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; font-weight: 900; color: #fff; overflow: hidden; user-select: none;
  img { width: 100%; height: 100%; object-fit: cover; }
`;
const AvatarOverlay = styled.div`
  position: absolute; inset: 0; border-radius: 50%; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.2s;
  color: #fff; font-size: 20px;
  ${AvatarWrap}:hover & { opacity: 1; }
`;
const ProfileInfo = styled.div`flex: 1; min-width: 200px;`;
const ProfileName = styled.div`font-size: 20px; font-weight: 900; color: #fff; margin-bottom: 4px;`;
const ProfileSub = styled.div`font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 8px;`;
const RoleBadge = styled.span`
  background: rgba(74,222,128,0.15); border: 1px solid rgba(74,222,128,0.3);
  color: #4ade80; border-radius: 999px; padding: 3px 12px; font-size: 11px; font-weight: 700;
`;
const FarmIdBox = styled.div`
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px; padding: 10px 14px; margin-top: 12px; display: inline-flex;
  align-items: center; gap: 10px; cursor: pointer;
  &:hover { border-color: rgba(74,222,128,0.4); }
`;
const FarmIdLabel = styled.div`font-size: 10px; color: rgba(255,255,255,0.4); font-weight: 700; text-transform: uppercase;`;
const FarmIdValue = styled.div`font-size: 12px; color: #94a3b8; font-family: monospace; letter-spacing: 0.5px;`;
const CopyBtn = styled.button`
  background: none; border: 1px solid rgba(74,222,128,0.3); border-radius: 6px;
  color: #4ade80; font-size: 11px; font-weight: 700; padding: 3px 8px; cursor: pointer;
  &:hover { background: rgba(74,222,128,0.1); }
`;

// Form
const FormGrid = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  @media (max-width: 560px) { grid-template-columns: 1fr; }`;
const FG = styled.div``;
const Label = styled.label`font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px; display: block; margin-bottom: 6px;`;
const Input = styled.input`
  width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 14px; color: #1e293b; outline: none; box-sizing: border-box; font-family: inherit;
  transition: border-color 0.2s;
  &:focus { border-color: #4ade80; box-shadow: 0 0 0 3px rgba(74,222,128,0.1); }
`;
const FullRow = styled.div`grid-column: 1 / -1;`;
const SaveBtn = styled.button`
  background: linear-gradient(135deg, #4ade80, #16a34a); border: none; border-radius: 10px;
  color: #fff; padding: 12px 28px; font-size: 14px; font-weight: 800; cursor: pointer;
  transition: all 0.2s; margin-top: 4px;
  &:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(74,222,128,0.3); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;
const SecondaryBtn = styled(SaveBtn)`background: linear-gradient(135deg, #64748b, #475569);`;
const AlertBox = styled.div`
  padding: 11px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 16px;
  background: ${p => p.$err ? 'rgba(239,68,68,0.08)' : 'rgba(74,222,128,0.08)'};
  border: 1px solid ${p => p.$err ? 'rgba(239,68,68,0.2)' : 'rgba(74,222,128,0.2)'};
  color: ${p => p.$err ? '#ef4444' : '#16a34a'};
`;

const TabContainer = styled.div`display: flex; gap: 8px; margin-bottom: 24px;`;
const TabBtn = styled.button`
    padding: 12px 24px; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer;
    background: ${p => p.$active ? '#1e293b' : '#fff'}; color: ${p => p.$active ? '#fff' : '#64748b'};
    box-shadow: ${p => p.$active ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.04)'};
    transition: all 0.2s;
    &:hover { background: ${p => p.$active ? '#0f172a' : '#f8fafc'}; }
`;

const Table = styled.table`
    width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;
    th { padding: 12px 16px; background: #f8fafc; color: #64748b; font-weight: 700; border-bottom: 2px solid #e2e8f0; }
    td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; font-weight: 500; }
    tr:last-child td { border-bottom: none; }
`;

const DeleteBtn = styled.button`
    background: none; border: none; color: #ef4444; font-size: 13px; font-weight: 700; cursor: pointer; padding: 6px 10px; border-radius: 6px;
    &:hover { background: rgba(239,68,68,0.1); }
`;

// ── Component ─────────────────────────────────────────────────────
export default function Ayarlar() {
    const [user, setUser] = useState({ isim: '', email: '', isletmeAdi: '', sehir: '', telefon: '', profilFoto: '', _id: '', rol: '' });
    const [pForm, setPForm] = useState({ mevcutSifre: '', yeniSifre: '', yeniSifreTekrar: '' });
    const [loading, setLoading] = useState(false);
    const [pLoading, setPLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [pMsg, setPMsg] = useState('');
    const [msgErr, setMsgErr] = useState(false);
    const [pMsgErr, setPMsgErr] = useState(false);
    const [copied, setCopied] = useState(false);

    // Tab State
    const [activeTab, setActiveTab] = useState('profil');

    // SubAccounts State
    const [subAccounts, setSubAccounts] = useState([]);
    const [saForm, setSaForm] = useState({ isim: '', email: '', sifre: '', telefon: '', rol: 'sutcu' });
    const [saMsg, setSaMsg] = useState({ text: '', err: false });
    const [saLoading, setSaLoading] = useState(false);

    useEffect(() => { loadProfile(); }, []);
    useEffect(() => {
        if (activeTab === 'personel' && user.rol === 'ciftci') {
            loadSubAccounts();
        }
    }, [activeTab, user.rol]);

    const loadProfile = async () => {
        try {
            const local = JSON.parse(localStorage.getItem('user') || '{}');
            setUser(u => ({ ...u, ...local }));
            const res = await api.getProfile();
            if (res.data.user) {
                const u = res.data.user;
                setUser({ isim: u.isim || '', email: u.email || '', isletmeAdi: u.isletmeAdi || '', sehir: u.sehir || '', telefon: u.telefon || '', profilFoto: u.profilFoto || '', _id: u._id || local.id || '', rol: u.rol || 'ciftci' });
            }
        } catch (e) { console.error(e); }
    };

    const loadSubAccounts = async () => {
        try {
            const res = await api.getSubAccounts();
            setSubAccounts(res.data);
        } catch (error) { console.error("Alt hesaplar yüklenemedi", error); }
    };

    const handleCreateSubAccount = async (e) => {
        e.preventDefault(); setSaLoading(true); setSaMsg({ text: '', err: false });
        try {
            await api.createSubAccount(saForm);
            setSaMsg({ text: '✅ Personel hesabı başarıyla oluşturuldu!', err: false });
            setSaForm({ isim: '', email: '', sifre: '', telefon: '', rol: 'sutcu' });
            loadSubAccounts();
        } catch (error) {
            setSaMsg({ text: error.response?.data?.message || '❌ Personel eklenemedi.', err: true });
        } finally { setSaLoading(false); }
    };

    const handleDeleteSubAccount = async (id, isim) => {
        if (!window.confirm(`${isim} adlı personelin hesabını kalıcı olarak silmek istediğinize emin misiniz?`)) return;
        try {
            await api.deleteSubAccount(id);
            setSubAccounts(prev => prev.filter(sa => sa._id !== id));
        } catch (error) { alert(error.response?.data?.message || 'Silinemedi'); }
    };

    const handleAvatarUpload = () => {
        const inp = document.createElement('input');
        inp.type = 'file'; inp.accept = 'image/*';
        inp.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const size = Math.min(img.width, img.height);
                    canvas.width = 200; canvas.height = 200;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, 200, 200);
                    setUser(u => ({ ...u, profilFoto: canvas.toDataURL('image/jpeg', 0.85) }));
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        };
        inp.click();
    };

    const handleSave = async (e) => {
        e.preventDefault(); setLoading(true); setMsg('');
        try {
            const res = await api.updateProfile({ isim: user.isim, email: user.email, isletmeAdi: user.isletmeAdi, sehir: user.sehir, telefon: user.telefon, profilFoto: user.profilFoto });
            const curr = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...curr, ...res.data.user }));
            setMsg('✅ Profil güncellendi!'); setMsgErr(false);
        } catch (e) { setMsg(e.response?.data?.message || '❌ Güncellenemedi!'); setMsgErr(true); }
        finally { setLoading(false); }
    };

    const handlePassword = async (e) => {
        e.preventDefault(); setPLoading(true); setPMsg('');
        if (pForm.yeniSifre !== pForm.yeniSifreTekrar) { setPMsg('❌ Yeni şifreler eşleşmiyor!'); setPMsgErr(true); setPLoading(false); return; }
        try {
            await api.updateProfile({ mevcutSifre: pForm.mevcutSifre, yeniSifre: pForm.yeniSifre });
            setPMsg('✅ Şifre değiştirildi!'); setPMsgErr(false);
            setPForm({ mevcutSifre: '', yeniSifre: '', yeniSifreTekrar: '' });
        } catch (e) { setPMsg(e.response?.data?.message || '❌ Şifre değiştirilemedi!'); setPMsgErr(true); }
        finally { setPLoading(false); }
    };

    const farmId = user._id || user.id || '—';
    const initials = user.isim ? user.isim.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '🐄';

    const copyId = () => {
        navigator.clipboard.writeText(farmId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Page>
            <PageTitle>⚙️ Kurumsal Ayarlar {user.rol === 'ciftci' && '& Personel Yönetimi'}</PageTitle>

            {user.rol === 'ciftci' && (
                <TabContainer>
                    <TabBtn $active={activeTab === 'profil'} onClick={() => setActiveTab('profil')}>🏠 Çiftlik Profili</TabBtn>
                    <TabBtn $active={activeTab === 'personel'} onClick={() => setActiveTab('personel')}>👥 Personeller (İşçi/Sağımcı)</TabBtn>
                </TabContainer>
            )}

            <Grid style={{ display: activeTab === 'profil' ? 'grid' : 'none' }}>
                {/* ── Profil Bandı ── */}
                <Card>
                    <ProfileBand>
                        <AvatarWrap onClick={handleAvatarUpload} title="Fotoğraf yükle/değiştir">
                            <Avatar>{user.profilFoto ? <img src={user.profilFoto} alt="avatar" /> : initials}</Avatar>
                            <AvatarOverlay>📷</AvatarOverlay>
                        </AvatarWrap>

                        <ProfileInfo>
                            <ProfileName>{user.isim || 'İsim belirtilmedi'}</ProfileName>
                            <ProfileSub>{user.isletmeAdi || 'İşletme adı yok'}{user.sehir ? ` · ${user.sehir}` : ''}</ProfileSub>
                            <RoleBadge>🐄 {user.rol === 'ciftci' ? 'Çiftlik Sahibi' : user.rol}</RoleBadge>

                            {user.rol === 'ciftci' && (
                                <FarmIdBox onClick={copyId} title="Bu ID Alt hesaplar için anahtardır">
                                    <div>
                                        <FarmIdLabel>🔑 Çiftlik ID</FarmIdLabel>
                                        <FarmIdValue>{farmId}</FarmIdValue>
                                    </div>
                                    <CopyBtn>{copied ? '✅ Kopyalandı' : 'Kopyala'}</CopyBtn>
                                </FarmIdBox>
                            )}
                        </ProfileInfo>
                    </ProfileBand>
                </Card>

                {/* ── Profil Bilgileri ── */}
                <Card>
                    <CardHeader>🙍 Çiftlik / Profil Bilgileri</CardHeader>
                    <CardBody>
                        {msg && <AlertBox $err={msgErr}>{msg}</AlertBox>}
                        <form onSubmit={handleSave}>
                            <FormGrid>
                                <FG><Label>Ad Soyad *</Label><Input value={user.isim} onChange={e => setUser(u => ({ ...u, isim: e.target.value }))} placeholder="Adınız Soyadınız" required /></FG>
                                <FG><Label>E-posta *</Label><Input type="email" value={user.email} onChange={e => setUser(u => ({ ...u, email: e.target.value }))} placeholder="email@ornek.com" required /></FG>
                                {user.rol === 'ciftci' && <FG><Label>🏠 İşletme / Çiftlik Adı</Label><Input value={user.isletmeAdi} onChange={e => setUser(u => ({ ...u, isletmeAdi: e.target.value }))} placeholder="Çiftliğinizin adı" /></FG>}
                                {user.rol === 'ciftci' && <FG><Label>📍 Şehir / İlçe</Label><Input value={user.sehir} onChange={e => setUser(u => ({ ...u, sehir: e.target.value }))} placeholder="örn: Konya" /></FG>}
                                <FullRow><Label>📞 Telefon</Label><Input type="tel" value={user.telefon} onChange={e => setUser(u => ({ ...u, telefon: e.target.value }))} placeholder="05XX XXX XX XX" /></FullRow>
                            </FormGrid>
                            <SaveBtn type="submit" disabled={loading} style={{ marginTop: 16 }}>
                                {loading ? 'Kaydediliyor...' : '💾 Kurumsal Bilgileri Kaydet'}
                            </SaveBtn>
                        </form>
                    </CardBody>
                </Card>

                {/* ── Şifre ── */}
                <Card>
                    <CardHeader>🔒 Şifre Değiştir</CardHeader>
                    <CardBody>
                        {pMsg && <AlertBox $err={pMsgErr}>{pMsg}</AlertBox>}
                        <form onSubmit={handlePassword}>
                            <FormGrid>
                                <FG><Label>Mevcut Şifre *</Label><Input type="password" value={pForm.mevcutSifre} onChange={e => setPForm(p => ({ ...p, mevcutSifre: e.target.value }))} placeholder="••••••••" required /></FG>
                                <FullRow />
                                <FG><Label>Yeni Şifre *</Label><Input type="password" value={pForm.yeniSifre} onChange={e => setPForm(p => ({ ...p, yeniSifre: e.target.value }))} placeholder="En az 6 karakter" required minLength="6" /></FG>
                                <FG><Label>Yeni Şifre (Tekrar) *</Label><Input type="password" value={pForm.yeniSifreTekrar} onChange={e => setPForm(p => ({ ...p, yeniSifreTekrar: e.target.value }))} placeholder="Tekrar girin" required minLength="6" /></FG>
                            </FormGrid>
                            <SecondaryBtn type="submit" disabled={pLoading} style={{ marginTop: 16 }}>
                                {pLoading ? 'Değiştiriliyor...' : '🔐 Şifreyi Güncelle'}
                            </SecondaryBtn>
                        </form>
                    </CardBody>
                </Card>
            </Grid>

            {/* ── PERSONEL YÖNETİMİ TABU ── */}
            {user.rol === 'ciftci' && (
                <Grid style={{ display: activeTab === 'personel' ? 'grid' : 'none' }}>
                    <Card>
                        <CardHeader>👨‍⚕️ Yeni Personel / Alt Hesap Ekle</CardHeader>
                        <CardBody>
                            {saMsg.text && <AlertBox $err={saMsg.err}>{saMsg.text}</AlertBox>}
                            <form onSubmit={handleCreateSubAccount}>
                                <FormGrid>
                                    <FG><Label>Görevi (Rolü) *</Label>
                                        <select value={saForm.rol} onChange={e => setSaForm({ ...saForm, rol: e.target.value })} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', outline: 'none' }}>
                                            <option value="sutcu">👷‍♂️ İşçi / Sağımcı</option>
                                        </select>
                                    </FG>
                                    <FG><Label>Ad Soyad *</Label><Input value={saForm.isim} onChange={e => setSaForm({ ...saForm, isim: e.target.value })} placeholder="Personel Adı" required /></FG>
                                    <FG><Label>Giriş E-postası *</Label><Input type="email" value={saForm.email} onChange={e => setSaForm({ ...saForm, email: e.target.value })} placeholder="personel@ciftlik.com" required /></FG>
                                    <FG><Label>Giriş Şifresi *</Label><Input type="text" value={saForm.sifre} onChange={e => setSaForm({ ...saForm, sifre: e.target.value })} placeholder="Geçici şifre belirle" required minLength="6" /></FG>
                                </FormGrid>
                                <SaveBtn type="submit" disabled={saLoading} style={{ marginTop: 16 }}>
                                    {saLoading ? 'Ekleniyor...' : '➕ Personel Hesabı Oluştur (Yetki Ver)'}
                                </SaveBtn>
                            </form>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>📋 Aktif Personeller ({subAccounts.length})</CardHeader>
                        <div style={{ padding: '0 24px 24px', overflowX: 'auto' }}>
                            {subAccounts.length > 0 ? (
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>Personel Adı</th>
                                            <th>E-posta</th>
                                            <th>Görev</th>
                                            <th>Kayıt Tarihi</th>
                                            <th>İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subAccounts.map(sa => (
                                            <tr key={sa._id}>
                                                <td>{sa.isim}</td>
                                                <td>{sa.email}</td>
                                                <td>
                                                    <RoleBadge style={{ background: sa.rol === 'veteriner' ? '#ebf8ff' : '#fefcbf', color: sa.rol === 'veteriner' ? '#3182ce' : '#d69e2e', borderColor: sa.rol === 'veteriner' ? '#90cdf4' : '#f6e05e' }}>
                                                        {sa.rol === 'veteriner' ? '🩺 Veteriner' : '👷‍♂️ İşçi / Sağımcı'}
                                                    </RoleBadge>
                                                </td>
                                                <td>{new Date(sa.createdAt).toLocaleDateString('tr-TR')}</td>
                                                <td><DeleteBtn onClick={() => handleDeleteSubAccount(sa._id, sa.isim)}>Sil / Çıkar</DeleteBtn></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                                    Henüz Çiftliğinize ait işçi veya personel eklenmemiş.<br />Yukarıdaki formdan hemen bir hesap tanımlayabilirsiniz.
                                </div>
                            )}
                        </div>
                    </Card>
                </Grid>
            )}

            {/* ── Hakkında ── */}
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, padding: '24px 0 16px' }}>
                Agrolina v2.0 · Kurumsal Sürüm · Akıllı Çiftlik Yönetim Sistemi
            </div>
        </Page>
    );
}
