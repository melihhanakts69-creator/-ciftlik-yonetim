import React, { useState, useEffect } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import axios from 'axios';

const API = process.env.NODE_ENV === 'production'
    ? 'https://ciftlik-yonetim.onrender.com'
    : 'http://localhost:5000';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;

const GlobalStyle = createGlobalStyle`
  body { margin: 0; font-family: 'Inter', -apple-system, sans-serif; background: #0f1117; }
`;

const Shell = styled.div`
  display: flex;
  min-height: 100vh;
  background: #0f1117;
  color: #e2e8f0;
`;

const Sidebar = styled.div`
  width: 240px;
  min-height: 100vh;
  background: #1a1d2e;
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  padding: 0;
  flex-shrink: 0;
`;

const SidebarHeader = styled.div`
  padding: 28px 20px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  .brand { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
  .sub { font-size: 11px; color: #64748b; margin-top: 3px; font-weight: 500; }
`;

const SidebarMenu = styled.div`
  padding: 16px 12px;
  flex: 1;
`;

const MenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: ${p => p.active ? 'linear-gradient(135deg, #4CAF50, #2E7D32)' : 'transparent'};
  color: ${p => p.active ? '#fff' : '#94a3b8'};
  font-size: 13px;
  font-weight: ${p => p.active ? '700' : '500'};
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  margin-bottom: 4px;
  .icon { font-size: 16px; }

  &:hover { background: ${p => p.active ? 'linear-gradient(135deg, #4CAF50, #2E7D32)' : 'rgba(255,255,255,0.06)'}; color: #fff; }
`;

const Main = styled.div`
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  animation: ${fadeIn} 0.3s ease;
`;

const PageTitle = styled.div`
  margin-bottom: 28px;
  h1 { font-size: 24px; font-weight: 800; color: #fff; margin: 0; letter-spacing: -0.5px; }
  p { font-size: 13px; color: #64748b; margin: 6px 0 0; }
`;

const Card = styled.div`
  background: #1a1d2e;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.06);
  padding: 24px;
  margin-bottom: 20px;
  animation: ${fadeIn} 0.3s ease;

  h3 { font-size: 15px; font-weight: 700; color: #fff; margin: 0 0 18px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: ${p => p.cols || '1fr'};
  gap: 16px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }

  input, textarea {
    background: #0f1117;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 10px 12px;
    color: #e2e8f0;
    font-size: 13px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
    resize: vertical;

    &:focus { border-color: #4CAF50; }
    &::placeholder { color: #475569; }
  }

  textarea { min-height: 70px; }
`;

const ArrayCard = styled.div`
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  position: relative;
`;

const DeleteBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(239,68,68,0.15);
  border: none;
  border-radius: 6px;
  color: #f87171;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  &:hover { background: rgba(239,68,68,0.3); }
`;

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(76,175,80,0.1);
  border: 1px dashed rgba(76,175,80,0.3);
  border-radius: 10px;
  color: #4CAF50;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  justify-content: center;
  margin-top: 8px;
  transition: all 0.2s;
  &:hover { background: rgba(76,175,80,0.2); }
`;

const SaveBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  border: none;
  border-radius: 10px;
  color: #fff;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(76,175,80,0.3);
  &:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(76,175,80,0.4); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

const Toast = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: ${p => p.error ? '#ef4444' : '#4CAF50'};
  color: #fff;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  z-index: 9999;
  animation: ${fadeIn} 0.3s ease;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
`;

const SECTIONS = [
    { key: 'hero', label: 'Hero Bölümü', icon: '🎯' },
    { key: 'stats', label: 'İstatistikler', icon: '📊' },
    { key: 'features', label: 'Özellikler', icon: '✨' },
    { key: 'testimonials', label: 'Yorumlar', icon: '💬' },
    { key: 'pricing', label: 'Fiyatlar', icon: '💰' },
];

export default function AdminPanel() {
    const [active, setActive] = useState('hero');
    const [content, setContent] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        axios.get(`${API}/api/admin/content`)
            .then(r => setContent(r.data))
            .catch(() => showToast('İçerik yüklenemedi', true));
    }, []);

    const showToast = (msg, error = false) => {
        setToast({ msg, error });
        setTimeout(() => setToast(null), 3000);
    };

    const save = async (key) => {
        setSaving(true);
        try {
            await axios.put(`${API}/api/admin/content/${key}`, { data: content[key] });
            showToast('✅ Kaydedildi!');
        } catch {
            showToast('❌ Hata oluştu', true);
        } finally {
            setSaving(false);
        }
    };

    const update = (key, val) => setContent(prev => ({ ...prev, [key]: val }));

    if (!content) return (
        <Shell>
            <GlobalStyle />
            <div style={{ margin: 'auto', color: '#64748b', fontSize: 16 }}>Yükleniyor...</div>
        </Shell>
    );

    return (
        <Shell>
            <GlobalStyle />
            <Sidebar>
                <SidebarHeader>
                    <div className="brand">🌱 Agrolina</div>
                    <div className="sub">Admin Paneli</div>
                </SidebarHeader>
                <SidebarMenu>
                    {SECTIONS.map(s => (
                        <MenuItem key={s.key} active={active === s.key} onClick={() => setActive(s.key)}>
                            <span className="icon">{s.icon}</span>
                            {s.label}
                        </MenuItem>
                    ))}
                </SidebarMenu>
            </Sidebar>

            <Main>
                {/* ── HERO ── */}
                {active === 'hero' && (
                    <>
                        <PageTitle><h1>🎯 Hero Bölümü</h1><p>Giriş sayfasındaki ana başlık ve metin</p></PageTitle>
                        <Card>
                            <h3>Üst Kısım</h3>
                            <FormGrid cols="1fr 1fr">
                                <Field><label>Badge Metni</label><input value={content.hero?.badge || ''} onChange={e => update('hero', { ...content.hero, badge: e.target.value })} /></Field>
                                <Field><label>Ana Başlık</label><input value={content.hero?.title || ''} onChange={e => update('hero', { ...content.hero, title: e.target.value })} /></Field>
                            </FormGrid>
                            <FormGrid style={{ marginTop: 16 }}>
                                <Field><label>Alt Başlık (açıklama)</label><textarea value={content.hero?.subtitle || ''} onChange={e => update('hero', { ...content.hero, subtitle: e.target.value })} /></Field>
                            </FormGrid>
                            <FormGrid cols="1fr 1fr" style={{ marginTop: 16 }}>
                                <Field><label>1. Buton</label><input value={content.hero?.btnPrimary || ''} onChange={e => update('hero', { ...content.hero, btnPrimary: e.target.value })} /></Field>
                                <Field><label>2. Buton</label><input value={content.hero?.btnSecondary || ''} onChange={e => update('hero', { ...content.hero, btnSecondary: e.target.value })} /></Field>
                            </FormGrid>
                        </Card>
                        <SaveBtn onClick={() => save('hero')} disabled={saving}>💾 Kaydet</SaveBtn>
                    </>
                )}

                {/* ── STATS ── */}
                {active === 'stats' && (
                    <>
                        <PageTitle><h1>📊 İstatistikler</h1><p>Hero altındaki 3 sayısal kart</p></PageTitle>
                        {(content.stats || []).map((s, i) => (
                            <Card key={i}>
                                <h3>İstatistik {i + 1}</h3>
                                <FormGrid cols="1fr 1fr">
                                    <Field><label>Değer</label><input value={s.value} onChange={e => { const a = [...content.stats]; a[i] = { ...a[i], value: e.target.value }; update('stats', a); }} /></Field>
                                    <Field><label>Açıklama</label><input value={s.label} onChange={e => { const a = [...content.stats]; a[i] = { ...a[i], label: e.target.value }; update('stats', a); }} /></Field>
                                </FormGrid>
                            </Card>
                        ))}
                        <SaveBtn onClick={() => save('stats')} disabled={saving}>💾 Kaydet</SaveBtn>
                    </>
                )}

                {/* ── FEATURES ── */}
                {active === 'features' && (
                    <>
                        <PageTitle><h1>✨ Özellikler</h1><p>Neden Agrolina? kartları</p></PageTitle>
                        {(content.features || []).map((f, i) => (
                            <ArrayCard key={i}>
                                <DeleteBtn onClick={() => update('features', content.features.filter((_, j) => j !== i))}>🗑 Sil</DeleteBtn>
                                <FormGrid cols="80px 1fr 1fr">
                                    <Field><label>Emoji</label><input value={f.icon} onChange={e => { const a = [...content.features]; a[i] = { ...a[i], icon: e.target.value }; update('features', a); }} /></Field>
                                    <Field><label>Başlık</label><input value={f.title} onChange={e => { const a = [...content.features]; a[i] = { ...a[i], title: e.target.value }; update('features', a); }} /></Field>
                                    <Field><label>Açıklama</label><input value={f.desc} onChange={e => { const a = [...content.features]; a[i] = { ...a[i], desc: e.target.value }; update('features', a); }} /></Field>
                                </FormGrid>
                            </ArrayCard>
                        ))}
                        <AddBtn onClick={() => update('features', [...(content.features || []), { icon: '⭐', title: 'Yeni Özellik', desc: 'Açıklama' }])}>+ Özellik Ekle</AddBtn>
                        <SaveBtn onClick={() => save('features')} disabled={saving}>💾 Kaydet</SaveBtn>
                    </>
                )}

                {/* ── TESTIMONIALS ── */}
                {active === 'testimonials' && (
                    <>
                        <PageTitle><h1>💬 Yorumlar</h1><p>Müşteri yorumları</p></PageTitle>
                        {(content.testimonials || []).map((t, i) => (
                            <ArrayCard key={i}>
                                <DeleteBtn onClick={() => update('testimonials', content.testimonials.filter((_, j) => j !== i))}>🗑 Sil</DeleteBtn>
                                <FormGrid cols="1fr 1fr">
                                    <Field><label>Ad Soyad</label><input value={t.name} onChange={e => { const a = [...content.testimonials]; a[i] = { ...a[i], name: e.target.value, initials: e.target.value.split(' ').map(w => w[0]).join('').toUpperCase() }; update('testimonials', a); }} /></Field>
                                    <Field><label>Çiftlik Adı</label><input value={t.farm} onChange={e => { const a = [...content.testimonials]; a[i] = { ...a[i], farm: e.target.value }; update('testimonials', a); }} /></Field>
                                </FormGrid>
                                <FormGrid style={{ marginTop: 12 }}>
                                    <Field><label>Yorum Metni</label><textarea value={t.text} onChange={e => { const a = [...content.testimonials]; a[i] = { ...a[i], text: e.target.value }; update('testimonials', a); }} /></Field>
                                </FormGrid>
                                <FormGrid cols="1fr 1fr" style={{ marginTop: 12 }}>
                                    <Field><label>Hayvan Sayısı (ör: 50 Baş)</label><input value={t.size} onChange={e => { const a = [...content.testimonials]; a[i] = { ...a[i], size: e.target.value }; update('testimonials', a); }} /></Field>
                                </FormGrid>
                            </ArrayCard>
                        ))}
                        <AddBtn onClick={() => update('testimonials', [...(content.testimonials || []), { text: '"Yorum metni..."', name: 'Ad Soyad', farm: 'Çiftlik Adı', size: '50 Baş', initials: 'AS' }])}>+ Yorum Ekle</AddBtn>
                        <SaveBtn onClick={() => save('testimonials')} disabled={saving}>💾 Kaydet</SaveBtn>
                    </>
                )}

                {/* ── PRICING ── */}
                {active === 'pricing' && (
                    <>
                        <PageTitle><h1>💰 Fiyatlar</h1><p>Fiyatlandırma paketleri</p></PageTitle>
                        {(content.pricing || []).map((p, i) => (
                            <ArrayCard key={i}>
                                <DeleteBtn onClick={() => update('pricing', content.pricing.filter((_, j) => j !== i))}>🗑 Sil</DeleteBtn>
                                <FormGrid cols="1fr 1fr 1fr">
                                    <Field><label>Paket Adı</label><input value={p.name} onChange={e => { const a = [...content.pricing]; a[i] = { ...a[i], name: e.target.value }; update('pricing', a); }} /></Field>
                                    <Field><label>Fiyat (ör: ₺499)</label><input value={p.price} onChange={e => { const a = [...content.pricing]; a[i] = { ...a[i], price: e.target.value }; update('pricing', a); }} /></Field>
                                    <Field><label>Dönem (ör: /ay)</label><input value={p.period} onChange={e => { const a = [...content.pricing]; a[i] = { ...a[i], period: e.target.value }; update('pricing', a); }} /></Field>
                                </FormGrid>
                                <FormGrid style={{ marginTop: 12 }}>
                                    <Field>
                                        <label>Özellikler (her satır ayrı özellik)</label>
                                        <textarea
                                            value={(p.features || []).join('\n')}
                                            onChange={e => { const a = [...content.pricing]; a[i] = { ...a[i], features: e.target.value.split('\n') }; update('pricing', a); }}
                                        />
                                    </Field>
                                </FormGrid>
                                <FormGrid cols="1fr 1fr" style={{ marginTop: 12 }}>
                                    <Field><label>Buton Metni</label><input value={p.btnText} onChange={e => { const a = [...content.pricing]; a[i] = { ...a[i], btnText: e.target.value }; update('pricing', a); }} /></Field>
                                    <Field>
                                        <label>En Popüler mi?</label>
                                        <select value={p.popular ? 'evet' : 'hayir'} onChange={e => { const a = [...content.pricing]; a[i] = { ...a[i], popular: e.target.value === 'evet' }; update('pricing', a); }} style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#e2e8f0', fontSize: 13, outline: 'none' }}>
                                            <option value="hayir">Hayır</option>
                                            <option value="evet">✅ Evet — "En Popüler" badge</option>
                                        </select>
                                    </Field>
                                </FormGrid>
                            </ArrayCard>
                        ))}
                        <AddBtn onClick={() => update('pricing', [...(content.pricing || []), { name: 'Yeni Paket', price: '₺0', period: '/ay', features: ['Özellik 1'], popular: false, btnText: 'Başla' }])}>+ Paket Ekle</AddBtn>
                        <SaveBtn onClick={() => save('pricing')} disabled={saving}>💾 Kaydet</SaveBtn>
                    </>
                )}
            </Main>

            {toast && <Toast error={toast.error}>{toast.msg}</Toast>}
        </Shell>
    );
}
