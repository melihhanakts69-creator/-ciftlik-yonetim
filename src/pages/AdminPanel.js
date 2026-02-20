import React, { useState, useEffect } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import axios from 'axios';

const API = 'https://ciftlik-yonetim.onrender.com';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;
const spin = keyframes`to { transform: rotate(360deg); }`;

const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #0a0c14; color: #e2e8f0; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0a0c14; } ::-webkit-scrollbar-thumb { background: #2d3148; border-radius: 3px; }
`;

const Shell = styled.div`display: flex; min-height: 100vh; background: #0a0c14;`;

/* ── SIDEBAR ── */
const Sidebar = styled.div`
  width: 260px; min-height: 100vh; background: #10131f;
  border-right: 1px solid rgba(255,255,255,0.05);
  display: flex; flex-direction: column; flex-shrink: 0; position: sticky; top: 0; height: 100vh; overflow-y: auto;
`;

const SidebarBrand = styled.div`
  padding: 24px 20px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  .logo { font-size: 22px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
  .logo span { color: #4ade80; }
  .sub { font-size: 11px; color: #475569; margin-top: 4px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
`;

const SidebarSection = styled.div`
  padding: 12px 12px 4px;
  .section-label { font-size: 10px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 1px; padding: 0 8px; margin-bottom: 6px; }
`;

const MenuItem = styled.button`
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 10px; border: none;
  background: ${p => p.$active ? 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(34,197,94,0.08))' : 'transparent'};
  color: ${p => p.$active ? '#4ade80' : '#64748b'};
  font-size: 13px; font-weight: ${p => p.$active ? '700' : '500'};
  cursor: pointer; text-align: left; transition: all 0.15s; margin-bottom: 2px;
  border-left: 2px solid ${p => p.$active ? '#4ade80' : 'transparent'};
  .icon { font-size: 15px; min-width: 20px; }
  &:hover { background: rgba(255,255,255,0.04); color: #e2e8f0; }
`;

const SidebarFooter = styled.div`
  margin-top: auto; padding: 16px 12px;
  border-top: 1px solid rgba(255,255,255,0.05);
  font-size: 11px; color: #334155; text-align: center;
`;

/* ── MAIN ── */
const Main = styled.div`flex: 1; padding: 32px 36px; overflow-y: auto; max-width: 900px;`;

const PageHeader = styled.div`
  margin-bottom: 28px;
  display: flex; align-items: center; gap: 14px;
  .emoji { font-size: 32px; }
  h1 { font-size: 22px; font-weight: 800; color: #fff; margin: 0; letter-spacing: -0.5px; }
  p { font-size: 13px; color: #475569; margin: 4px 0 0; }
`;

const Card = styled.div`
  background: #10131f; border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.05);
  padding: 22px; margin-bottom: 16px;
  animation: ${fadeIn} 0.25s ease;
  h3 { font-size: 13px; font-weight: 700; color: #94a3b8; margin: 0 0 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); text-transform: uppercase; letter-spacing: 0.5px; }
`;

const Grid = styled.div`display: grid; grid-template-columns: ${p => p.$cols || '1fr'}; gap: ${p => p.$gap || '14px'}; ${p => p.$mt && `margin-top: ${p.$mt}px;`}`;

const Field = styled.div`
  display: flex; flex-direction: column; gap: 5px;
  label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; }
  input, textarea, select {
    background: #0a0c14; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; padding: 9px 12px; color: #e2e8f0;
    font-size: 13px; font-family: inherit; outline: none;
    transition: border-color 0.15s; resize: vertical;
    &:focus { border-color: #4ade80; }
    &::placeholder { color: #334155; }
  }
  textarea { min-height: 72px; line-height: 1.5; }
  select { cursor: pointer; }
`;

const ColorField = styled.div`
  display: flex; flex-direction: column; gap: 5px;
  label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
  .color-row { display: flex; align-items: center; gap: 8px; }
  input[type="color"] { width: 42px; height: 36px; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 2px; background: #0a0c14; cursor: pointer; }
  input[type="text"] {
    flex: 1; background: #0a0c14; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; padding: 9px 12px; color: #e2e8f0; font-size: 13px; font-family: monospace; outline: none;
    &:focus { border-color: #4ade80; }
  }
`;

const ImagePreview = styled.div`
  margin-top: 8px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);
  img { width: 100%; height: 140px; object-fit: cover; display: block; }
  .placeholder { height: 80px; background: #0a0c14; display: flex; align-items: center; justify-content: center; color: #334155; font-size: 12px; }
`;

const ItemCard = styled.div`
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px; padding: 16px; margin-bottom: 10px; position: relative;
`;

const DelBtn = styled.button`
  position: absolute; top: 12px; right: 12px;
  background: rgba(239,68,68,0.12); border: none; border-radius: 6px;
  color: #f87171; padding: 4px 10px; font-size: 11px; font-weight: 700;
  cursor: pointer; transition: all 0.15s;
  &:hover { background: rgba(239,68,68,0.25); }
`;

const AddBtn = styled.button`
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;
  background: rgba(74,222,128,0.06); border: 1px dashed rgba(74,222,128,0.25);
  border-radius: 10px; color: #4ade80; padding: 10px; font-size: 13px; font-weight: 600;
  cursor: pointer; margin-top: 8px; transition: all 0.15s;
  &:hover { background: rgba(74,222,128,0.12); border-color: rgba(74,222,128,0.5); }
`;

const SaveBtn = styled.button`
  display: flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #4ade80, #16a34a);
  border: none; border-radius: 10px; color: #fff;
  padding: 12px 28px; font-size: 14px; font-weight: 700;
  cursor: pointer; margin-top: 20px; transition: all 0.2s;
  box-shadow: 0 4px 20px rgba(74,222,128,0.25);
  &:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(74,222,128,0.35); }
  &:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
`;

const Loader = styled.div`
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

const Toast = styled.div`
  position: fixed; bottom: 28px; right: 28px;
  background: ${p => p.$error ? '#dc2626' : '#16a34a'};
  color: #fff; padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 700;
  z-index: 9999; animation: ${fadeIn} 0.3s ease;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  display: flex; align-items: center; gap: 8px;
`;

const Tip = styled.div`
  background: rgba(74,222,128,0.06); border: 1px solid rgba(74,222,128,0.15);
  border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #86efac; margin-bottom: 16px;
`;

/* ── DATA ── */
const SECTIONS = [
    {
        group: 'İÇERİK', items: [
            { key: 'hero', label: 'Hero Bölümü', icon: '🎯' },
            { key: 'stats', label: 'İstatistikler', icon: '📊' },
            { key: 'features', label: 'Özellikler', icon: '✨' },
            { key: 'testimonials', label: 'Yorumlar', icon: '💬' },
            { key: 'pricing', label: 'Fiyatlar', icon: '💰' },
        ]
    },
    {
        group: 'GÖRÜNÜM', items: [
            { key: 'appearance', label: 'Renkler & Tema', icon: '🎨' },
            { key: 'images', label: 'Görseller', icon: '🖼️' },
        ]
    },
    {
        group: 'SİTE', items: [
            { key: 'seo', label: 'SEO & Meta', icon: '🔍' },
            { key: 'footer', label: 'Footer & İletişim', icon: '📬' },
            { key: 'social', label: 'Sosyal Medya', icon: '📱' },
        ]
    },
];

const DEFAULTS = {
    hero: { badge: '🚀 Modern Çiftlik Yönetimi', title: 'Çiftliğinizi Geleceğe Taşıyın', subtitle: 'Sürü takibi, süt verimi analizi, stok yönetimi ve finansal raporlamalar tek bir platformda. Verimliliğinizi %30 artırın.', btnPrimary: 'Hemen Başlayın', btnSecondary: 'Nasıl Çalışır?' },
    stats: [{ value: '500+', label: 'Aktif Çiftlik' }, { value: '100k+', label: 'Kayıtlı Hayvan' }, { value: '%35', label: 'Ortalama Verim Artışı' }],
    features: [
        { icon: '📊', title: 'Akıllı Raporlama', desc: 'Karmaşık verileri anlaşılır grafiklere dönüştürün.' },
        { icon: '🔔', title: 'Akıllı Bildirimler', desc: 'Aşı, doğum ve stok uyarılarını zamanında alın.' },
        { icon: '🏥', title: 'Sağlık Takibi', desc: 'Tedavi geçmişi, aşı takvimi ve hastalık kayıtları.' },
        { icon: '🥡', title: 'Stok & Yem', desc: 'Yem ve ilaç stoklarını yönetin.' },
    ],
    testimonials: [
        { text: '"Agrolina sayesinde süt verimimizi %25 artırdık."', name: 'Ahmet Demir', farm: 'Demir Çiftliği', size: '50 Baş', initials: 'AD' },
        { text: '"Bildirim sistemi hayatımızı kurtardı."', name: 'Mehmet Yılmaz', farm: 'Yılmaz Besi', size: '120 Baş', initials: 'MY' },
    ],
    pricing: [
        { name: 'Başlangıç', price: '₺0', period: '/ay', features: ['10 Hayvana Kadar', 'Temel Sürü Takibi', 'Süt Kaydı'], popular: false, btnText: 'Ücretsiz Başla' },
        { name: 'Profesyonel', price: '₺499', period: '/ay', features: ['100 Hayvana Kadar', 'Tüm Modüller Aktif', 'Gelişmiş Raporlar'], popular: true, btnText: 'Şimdi Yükselt' },
        { name: 'Kurumsal', price: '₺999', period: '/ay', features: ['Sınırsız Hayvan', 'Çoklu Çiftlik', '7/24 Destek'], popular: false, btnText: 'İletişime Geç' },
    ],
    appearance: { primaryColor: '#4CAF50', secondaryColor: '#2E7D32', heroBg: 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%)', accentColor: '#81C784' },
    images: { heroImage: '', featuresImage: '', logoUrl: '', ogImage: '' },
    seo: { siteTitle: 'Agrolina - Modern Çiftlik Yönetim Platformu', metaDescription: 'Sürü takibi, süt verimi analizi, stok yönetimi ve finansal raporlamalar tek bir platformda.', keywords: 'çiftlik yönetimi, sürü takibi, süt verimi, tarım yazılımı' },
    footer: { companyName: 'Agrolina Teknoloji A.Ş.', slogan: 'Modern teknoloji ile geleneksel tarımı buluşturuyoruz.', email: 'info@agrolina.com', phone: '', address: '', copyright: '© 2026 Agrolina Teknoloji A.Ş. Tüm hakları saklıdır.' },
    social: { instagram: '', facebook: '', linkedin: '', twitter: '', youtube: '' },
};

export default function AdminPanel() {
    const [active, setActive] = useState('hero');
    const [content, setContent] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        axios.get(`${API}/api/admin/content`)
            .then(r => setContent(d => ({ ...DEFAULTS, ...r.data })))
            .catch(() => setContent(DEFAULTS));
    }, []);

    const toast_ = (msg, error = false) => { setToast({ msg, error }); setTimeout(() => setToast(null), 3500); };
    const save = async (key) => {
        setSaving(true);
        try { await axios.put(`${API}/api/admin/content/${key}`, { data: content[key] }); toast_('✅ Kaydedildi!'); }
        catch { toast_('❌ Kayıt başarısız', true); }
        finally { setSaving(false); }
    };
    const upd = (key, val) => setContent(p => ({ ...p, [key]: val }));
    const updArr = (key, i, patch) => { const a = [...(content[key] || [])]; a[i] = { ...a[i], ...patch }; upd(key, a); };

    if (!content) return (
        <Shell style={{ alignItems: 'center', justifyContent: 'center' }}>
            <GlobalStyle />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <Loader style={{ width: 32, height: 32, borderTopColor: '#4ade80' }} />
                <div style={{ color: '#475569', fontSize: 14 }}>Admin paneli yükleniyor...</div>
            </div>
        </Shell>
    );

    const sel = c => content[c] || DEFAULTS[c];

    return (
        <Shell>
            <GlobalStyle />
            <Sidebar>
                <SidebarBrand>
                    <div className="logo">🌱 Agro<span>lina</span></div>
                    <div className="sub">Admin Paneli</div>
                </SidebarBrand>

                {SECTIONS.map(g => (
                    <SidebarSection key={g.group}>
                        <div className="section-label">{g.group}</div>
                        {g.items.map(s => (
                            <MenuItem key={s.key} $active={active === s.key} onClick={() => setActive(s.key)}>
                                <span className="icon">{s.icon}</span>{s.label}
                            </MenuItem>
                        ))}
                    </SidebarSection>
                ))}

                <SidebarFooter>v2.0 · Agrolina Admin</SidebarFooter>
            </Sidebar>

            <Main key={active}>

                {/* ═══ HERO ═══ */}
                {active === 'hero' && <>
                    <PageHeader><span className="emoji">🎯</span><div><h1>Hero Bölümü</h1><p>Ziyaretçinin ilk gördüğü ana ekran</p></div></PageHeader>
                    <Card>
                        <h3>Başlık & Metin</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>Badge Metni</label><input value={sel('hero').badge} onChange={e => upd('hero', { ...sel('hero'), badge: e.target.value })} placeholder="🚀 Modern Çiftlik Yönetimi" /></Field>
                            <Field><label>Ana Başlık</label><input value={sel('hero').title} onChange={e => upd('hero', { ...sel('hero'), title: e.target.value })} /></Field>
                        </Grid>
                        <Grid $mt={12}>
                            <Field><label>Alt Başlık / Açıklama</label><textarea value={sel('hero').subtitle} onChange={e => upd('hero', { ...sel('hero'), subtitle: e.target.value })} /></Field>
                        </Grid>
                    </Card>
                    <Card>
                        <h3>Butonlar</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>Birincil Buton</label><input value={sel('hero').btnPrimary} onChange={e => upd('hero', { ...sel('hero'), btnPrimary: e.target.value })} /></Field>
                            <Field><label>İkincil Buton</label><input value={sel('hero').btnSecondary} onChange={e => upd('hero', { ...sel('hero'), btnSecondary: e.target.value })} /></Field>
                        </Grid>
                    </Card>
                    <SaveBtn onClick={() => save('hero')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

                {/* ═══ STATS ═══ */}
                {active === 'stats' && <>
                    <PageHeader><span className="emoji">📊</span><div><h1>İstatistikler</h1><p>Hero altındaki sayısal kartlar</p></div></PageHeader>
                    {(sel('stats')).map((s, i) => (
                        <Card key={i}>
                            <h3>İstatistik {i + 1}</h3>
                            <Grid $cols="1fr 1fr">
                                <Field><label>Değer (ör: 500+)</label><input value={s.value} onChange={e => updArr('stats', i, { value: e.target.value })} /></Field>
                                <Field><label>Açıklama</label><input value={s.label} onChange={e => updArr('stats', i, { label: e.target.value })} /></Field>
                            </Grid>
                        </Card>
                    ))}
                    <SaveBtn onClick={() => save('stats')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

                {/* ═══ FEATURES ═══ */}
                {active === 'features' && <>
                    <PageHeader><span className="emoji">✨</span><div><h1>Özellikler</h1><p>"Neden Agrolina?" kartları</p></div></PageHeader>
                    {(sel('features')).map((f, i) => (
                        <ItemCard key={i}>
                            <DelBtn onClick={() => upd('features', sel('features').filter((_, j) => j !== i))}>🗑 Sil</DelBtn>
                            <Grid $cols="60px 1fr 2fr">
                                <Field><label>Emoji</label><input value={f.icon} onChange={e => updArr('features', i, { icon: e.target.value })} /></Field>
                                <Field><label>Başlık</label><input value={f.title} onChange={e => updArr('features', i, { title: e.target.value })} /></Field>
                                <Field><label>Açıklama</label><input value={f.desc} onChange={e => updArr('features', i, { desc: e.target.value })} /></Field>
                            </Grid>
                        </ItemCard>
                    ))}
                    <AddBtn onClick={() => upd('features', [...sel('features'), { icon: '⭐', title: 'Yeni Özellik', desc: 'Açıklama metni' }])}>+ Kart Ekle</AddBtn>
                    <SaveBtn onClick={() => save('features')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

                {/* ═══ TESTIMONIALS ═══ */}
                {active === 'testimonials' && <>
                    <PageHeader><span className="emoji">💬</span><div><h1>Müşteri Yorumları</h1><p>Referans ve başarı hikayeleri</p></div></PageHeader>
                    {(sel('testimonials')).map((t, i) => (
                        <ItemCard key={i}>
                            <DelBtn onClick={() => upd('testimonials', sel('testimonials').filter((_, j) => j !== i))}>🗑 Sil</DelBtn>
                            <Grid $cols="1fr 1fr">
                                <Field><label>Ad Soyad</label><input value={t.name} onChange={e => updArr('testimonials', i, { name: e.target.value, initials: e.target.value.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) })} /></Field>
                                <Field><label>Çiftlik Adı</label><input value={t.farm} onChange={e => updArr('testimonials', i, { farm: e.target.value })} /></Field>
                            </Grid>
                            <Grid $mt={10}>
                                <Field><label>Yorum metni</label><textarea value={t.text} onChange={e => updArr('testimonials', i, { text: e.target.value })} /></Field>
                            </Grid>
                            <Grid $cols="1fr 1fr" $mt={10}>
                                <Field><label>Hayvan Sayısı (ör: 80 Baş)</label><input value={t.size} onChange={e => updArr('testimonials', i, { size: e.target.value })} /></Field>
                            </Grid>
                        </ItemCard>
                    ))}
                    <AddBtn onClick={() => upd('testimonials', [...sel('testimonials'), { text: '"Yorum buraya..."', name: 'Ad Soyad', farm: 'Çiftlik Adı', size: '50 Baş', initials: 'AS' }])}>+ Yorum Ekle</AddBtn>
                    <SaveBtn onClick={() => save('testimonials')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

                {/* ═══ PRICING ═══ */}
                {active === 'pricing' && <>
                    <PageHeader><span className="emoji">💰</span><div><h1>Fiyatlandırma</h1><p>Abonelik paketleri</p></div></PageHeader>
                    {(sel('pricing')).map((p, i) => (
                        <ItemCard key={i}>
                            <DelBtn onClick={() => upd('pricing', sel('pricing').filter((_, j) => j !== i))}>🗑 Sil</DelBtn>
                            <Grid $cols="1fr 1fr 1fr">
                                <Field><label>Paket Adı</label><input value={p.name} onChange={e => updArr('pricing', i, { name: e.target.value })} /></Field>
                                <Field><label>Fiyat (ör: ₺499)</label><input value={p.price} onChange={e => updArr('pricing', i, { price: e.target.value })} /></Field>
                                <Field><label>Dönem (ör: /ay)</label><input value={p.period} onChange={e => updArr('pricing', i, { period: e.target.value })} /></Field>
                            </Grid>
                            <Grid $mt={10}>
                                <Field><label>Özellikler — her satır bir özellik</label>
                                    <textarea value={(p.features || []).join('\n')} onChange={e => updArr('pricing', i, { features: e.target.value.split('\n') })} style={{ minHeight: 90 }} />
                                </Field>
                            </Grid>
                            <Grid $cols="1fr 1fr" $mt={10}>
                                <Field><label>Buton Yazısı</label><input value={p.btnText} onChange={e => updArr('pricing', i, { btnText: e.target.value })} /></Field>
                                <Field><label>En Popüler Badge</label>
                                    <select value={p.popular ? 'evet' : 'hayir'} onChange={e => updArr('pricing', i, { popular: e.target.value === 'evet' })}>
                                        <option value="hayir">Hayır</option>
                                        <option value="evet">✅ Evet — "En Popüler"</option>
                                    </select>
                                </Field>
                            </Grid>
                        </ItemCard>
                    ))}
                    <AddBtn onClick={() => upd('pricing', [...sel('pricing'), { name: 'Yeni Paket', price: '₺0', period: '/ay', features: ['Özellik 1'], popular: false, btnText: 'Başla' }])}>+ Paket Ekle</AddBtn>
                    <SaveBtn onClick={() => save('pricing')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

                {/* ═══ APPEARANCE ═══ */}
                {active === 'appearance' && <>
                    <PageHeader><span className="emoji">🎨</span><div><h1>Renkler & Tema</h1><p>Site renk paleti ve görsel tema</p></div></PageHeader>
                    <Tip>💡 Renkleri değiştirdikten sonra kaydet — landing page bir sonraki yüklemede güncel renkleri kullanır.</Tip>
                    <Card>
                        <h3>Ana Renkler</h3>
                        <Grid $cols="1fr 1fr">
                            <ColorField>
                                <label>Birincil Renk</label>
                                <div className="color-row">
                                    <input type="color" value={sel('appearance').primaryColor} onChange={e => upd('appearance', { ...sel('appearance'), primaryColor: e.target.value })} />
                                    <input type="text" value={sel('appearance').primaryColor} onChange={e => upd('appearance', { ...sel('appearance'), primaryColor: e.target.value })} placeholder="#4CAF50" />
                                </div>
                            </ColorField>
                            <ColorField>
                                <label>İkincil Renk</label>
                                <div className="color-row">
                                    <input type="color" value={sel('appearance').secondaryColor} onChange={e => upd('appearance', { ...sel('appearance'), secondaryColor: e.target.value })} />
                                    <input type="text" value={sel('appearance').secondaryColor} onChange={e => upd('appearance', { ...sel('appearance'), secondaryColor: e.target.value })} placeholder="#2E7D32" />
                                </div>
                            </ColorField>
                        </Grid>
                    </Card>
                    <Card>
                        <h3>Hero Arka Planı</h3>
                        <Field><label>CSS Gradient veya Renk (background: değeri)</label>
                            <textarea value={sel('appearance').heroBg} onChange={e => upd('appearance', { ...sel('appearance'), heroBg: e.target.value })} style={{ minHeight: 56, fontFamily: 'monospace', fontSize: 12 }} placeholder="linear-gradient(135deg, #0a1628 0%, #0d2137 100%)" />
                        </Field>
                        <div style={{ marginTop: 10, height: 60, borderRadius: 8, background: sel('appearance').heroBg }} />
                    </Card>
                    <SaveBtn onClick={() => save('appearance')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

                {/* ═══ IMAGES ═══ */}
                {active === 'images' && <>
                    <PageHeader><span className="emoji">🖼️</span><div><h1>Görseller</h1><p>Resim URL'leri — Unsplash, Cloudinary veya herhangi bir CDN linki</p></div></PageHeader>
                    <Tip>💡 Resim URL'i olarak Unsplash (unsplash.com), ImgBB (imgbb.com) veya herhangi bir direkt görüntü linki kullanabilirsin.</Tip>
                    <Card>
                        <h3>Hero Görseli</h3>
                        <Field><label>Hero Arkaplan Resmi URL</label><input value={sel('images').heroImage} onChange={e => upd('images', { ...sel('images'), heroImage: e.target.value })} placeholder="https://images.unsplash.com/..." /></Field>
                        <ImagePreview>
                            {sel('images').heroImage ? <img src={sel('images').heroImage} alt="Hero" onError={e => e.target.style.display = 'none'} /> : <div className="placeholder">Resim URLsi girilmedi</div>}
                        </ImagePreview>
                    </Card>
                    <Card>
                        <h3>Logo</h3>
                        <Field><label>Logo Resim URL'i (boş bırakabilirsin, varsayılan logo kullanılır)</label><input value={sel('images').logoUrl} onChange={e => upd('images', { ...sel('images'), logoUrl: e.target.value })} placeholder="https://..." /></Field>
                        {sel('images').logoUrl && <ImagePreview><img src={sel('images').logoUrl} alt="Logo" style={{ height: 60, width: 'auto', objectFit: 'contain', display: 'block', margin: '12px auto' }} onError={e => e.target.style.display = 'none'} /></ImagePreview>}
                    </Card>
                    <Card>
                        <h3>OG Image (Sosyal Medya Paylaşım Görseli)</h3>
                        <Field><label>OG Image URL (1200×630 önerilir)</label><input value={sel('images').ogImage} onChange={e => upd('images', { ...sel('images'), ogImage: e.target.value })} placeholder="https://..." /></Field>
                        <ImagePreview>
                            {sel('images').ogImage ? <img src={sel('images').ogImage} alt="OG" onError={e => e.target.style.display = 'none'} /> : <div className="placeholder">Sosyal medya paylaşım görseli</div>}
                        </ImagePreview>
                    </Card>
                    <SaveBtn onClick={() => save('images')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

                {/* ═══ SEO ═══ */}
                {active === 'seo' && <>
                    <PageHeader><span className="emoji">🔍</span><div><h1>SEO & Meta Etiketler</h1><p>Google arama sonuçları ve sosyal medya önizleme</p></div></PageHeader>
                    <Card>
                        <h3>Sayfa Başlığı</h3>
                        <Field><label>Site Başlığı (tarayıcı sekmesinde görünür)</label><input value={sel('seo').siteTitle} onChange={e => upd('seo', { ...sel('seo'), siteTitle: e.target.value })} placeholder="Agrolina - Modern Çiftlik Yönetim Platformu" /></Field>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>⚠️ Önerilen uzunluk: 50–60 karakter ({sel('seo').siteTitle?.length || 0} karakter)</div>
                    </Card>
                    <Card>
                        <h3>Meta Açıklama</h3>
                        <Field><label>Açıklama (Google sonuçlarında görünür, 150-160 karakter)</label>
                            <textarea value={sel('seo').metaDescription} onChange={e => upd('seo', { ...sel('seo'), metaDescription: e.target.value })} />
                        </Field>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>{sel('seo').metaDescription?.length || 0} karakter</div>
                    </Card>
                    <Card>
                        <h3>Anahtar Kelimeler</h3>
                        <Field><label>Virgülle ayır (çiftlik yönetimi, sürü takibi, ...)</label><input value={sel('seo').keywords} onChange={e => upd('seo', { ...sel('seo'), keywords: e.target.value })} /></Field>
                    </Card>
                    <SaveBtn onClick={() => save('seo')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

                {/* ═══ FOOTER ═══ */}
                {active === 'footer' && <>
                    <PageHeader><span className="emoji">📬</span><div><h1>Footer & İletişim</h1><p>Sayfanın alt kısmı ve iletişim bilgileri</p></div></PageHeader>
                    <Card>
                        <h3>Şirket Bilgileri</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>Şirket Adı</label><input value={sel('footer').companyName} onChange={e => upd('footer', { ...sel('footer'), companyName: e.target.value })} /></Field>
                            <Field><label>Copyright Metni</label><input value={sel('footer').copyright} onChange={e => upd('footer', { ...sel('footer'), copyright: e.target.value })} /></Field>
                        </Grid>
                        <Grid $mt={12}>
                            <Field><label>Slogan</label><input value={sel('footer').slogan} onChange={e => upd('footer', { ...sel('footer'), slogan: e.target.value })} /></Field>
                        </Grid>
                    </Card>
                    <Card>
                        <h3>İletişim</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>E-posta</label><input type="email" value={sel('footer').email} onChange={e => upd('footer', { ...sel('footer'), email: e.target.value })} placeholder="info@agrolina.com" /></Field>
                            <Field><label>Telefon</label><input value={sel('footer').phone} onChange={e => upd('footer', { ...sel('footer'), phone: e.target.value })} placeholder="+90 555 000 0000" /></Field>
                        </Grid>
                        <Grid $mt={12}>
                            <Field><label>Adres</label><textarea value={sel('footer').address} onChange={e => upd('footer', { ...sel('footer'), address: e.target.value })} style={{ minHeight: 56 }} placeholder="Tarım Mah. Yeşil Cad. No:1 İstanbul" /></Field>
                        </Grid>
                    </Card>
                    <SaveBtn onClick={() => save('footer')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

                {/* ═══ SOCIAL ═══ */}
                {active === 'social' && <>
                    <PageHeader><span className="emoji">📱</span><div><h1>Sosyal Medya</h1><p>Profil URL'leri — footer'da ikonlar olarak görünür</p></div></PageHeader>
                    <Card>
                        <h3>Profil Linkleri</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>📷 Instagram</label><input value={sel('social').instagram} onChange={e => upd('social', { ...sel('social'), instagram: e.target.value })} placeholder="https://instagram.com/agrolina" /></Field>
                            <Field><label>📘 Facebook</label><input value={sel('social').facebook} onChange={e => upd('social', { ...sel('social'), facebook: e.target.value })} placeholder="https://facebook.com/agrolina" /></Field>
                            <Field><label>💼 LinkedIn</label><input value={sel('social').linkedin} onChange={e => upd('social', { ...sel('social'), linkedin: e.target.value })} placeholder="https://linkedin.com/company/agrolina" /></Field>
                            <Field><label>🐦 Twitter / X</label><input value={sel('social').twitter} onChange={e => upd('social', { ...sel('social'), twitter: e.target.value })} placeholder="https://twitter.com/agrolina" /></Field>
                            <Field><label>▶️ YouTube</label><input value={sel('social').youtube} onChange={e => upd('social', { ...sel('social'), youtube: e.target.value })} placeholder="https://youtube.com/@agrolina" /></Field>
                        </Grid>
                    </Card>
                    <SaveBtn onClick={() => save('social')} disabled={saving}>{saving ? <Loader /> : '💾'} Kaydet</SaveBtn>
                </>}

            </Main>

            {toast && <Toast $error={toast.error}>{toast.msg}</Toast>}
        </Shell>
    );
}
