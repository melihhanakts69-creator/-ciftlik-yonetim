import { DashboardSection, UsersSection, BlogSection, SettingsSection } from './AdminSections';
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

const Sidebar = styled.div`
  width: 260px; min-height: 100vh; background: #10131f;
  border-right: 1px solid rgba(255,255,255,0.05);
  display: flex; flex-direction: column; flex-shrink: 0;
  position: sticky; top: 0; height: 100vh; overflow-y: auto;
`;

const SidebarBrand = styled.div`
  padding: 22px 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  .logo { font-size: 21px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
  .logo span { color: #4ade80; }
  .sub { font-size: 10px; color: #475569; margin-top: 3px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
`;

const SidebarSection = styled.div`
  padding: 10px 12px 2px;
  .lbl { font-size: 10px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 1px; padding: 0 8px; margin-bottom: 4px; }
`;

const MenuItem = styled.button`
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 10px; border: none;
  background: ${p => p.$active ? 'rgba(74,222,128,0.1)' : 'transparent'};
  color: ${p => p.$active ? '#4ade80' : '#64748b'};
  font-size: 13px; font-weight: ${p => p.$active ? '700' : '500'};
  cursor: pointer; text-align: left; transition: all 0.15s; margin-bottom: 2px;
  border-left: 2px solid ${p => p.$active ? '#4ade80' : 'transparent'};
  .icon { font-size: 14px; min-width: 18px; }
  &:hover { background: rgba(255,255,255,0.04); color: #e2e8f0; }
`;

const LoginBox = styled.div`
  margin: 12px; background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 14px;
  h4 { font-size: 11px; font-weight: 700; color: #94a3b8; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  input {
    width: 100%; background: #0a0c14; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px; padding: 8px 10px; color: #e2e8f0; font-size: 12px;
    font-family: inherit; outline: none; margin-bottom: 7px;
    &:focus { border-color: #4ade80; }
    &::placeholder { color: #334155; }
  }
  button {
    width: 100%; background: linear-gradient(135deg, #4ade80, #16a34a);
    border: none; border-radius: 7px; color: #fff; padding: 8px;
    font-size: 12px; font-weight: 700; cursor: pointer;
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
  .err { font-size: 11px; color: #f87171; margin-bottom: 7px; }
`;

const UserCard = styled.div`
  margin: 12px; background: rgba(74,222,128,0.06);
  border: 1px solid rgba(74,222,128,0.15); border-radius: 12px; padding: 13px;
  .name { font-size: 13px; font-weight: 700; color: #4ade80; margin-bottom: 2px; }
  .email { font-size: 11px; color: #475569; margin-bottom: 9px; word-break: break-all; }
  .row { display: flex; gap: 6px; }
  button {
    flex: 1; border: none; border-radius: 7px; padding: 6px 8px;
    font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s;
  }
  .app { background: rgba(74,222,128,0.15); color: #4ade80; }
  .app:hover { background: rgba(74,222,128,0.25); }
  .out { background: rgba(239,68,68,0.12); color: #f87171; }
  .out:hover { background: rgba(239,68,68,0.22); }
`;

const SidebarFooter = styled.div`
  margin-top: auto; padding: 14px; border-top: 1px solid rgba(255,255,255,0.04);
  font-size: 10px; color: #334155; text-align: center;
`;

const Main = styled.div`flex: 1; padding: 30px 34px; overflow-y: auto; max-width: 880px;`;

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
    font-family: inherit; outline: none; transition: border-color 0.15s; resize: vertical;
    &:focus { border-color: #4ade80; }
    &::placeholder { color: #334155; }
  }
  textarea { min-height: 70px; line-height: 1.5; }
  select { cursor: pointer; }
`;

const ColorField = styled.div`
  display: flex; flex-direction: column; gap: 5px;
  label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.4px; }
  .row { display: flex; align-items: center; gap: 8px; }
  input[type="color"] { width: 40px; height: 36px; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 2px; background: #0a0c14; cursor: pointer; }
  input[type="text"] {
    flex: 1; background: #0a0c14; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; padding: 9px 11px; color: #e2e8f0; font-size: 12px; font-family: monospace; outline: none;
    &:focus { border-color: #4ade80; }
  }
`;

const ImagePreview = styled.div`
  margin-top: 8px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);
  img { width: 100%; height: 130px; object-fit: cover; display: block; }
  .placeholder { height: 70px; background: #0a0c14; display: flex; align-items: center; justify-content: center; color: #334155; font-size: 12px; }
`;

const ItemCard = styled.div`
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px; padding: 15px; margin-bottom: 10px; position: relative;
`;

const DelBtn = styled.button`
  position: absolute; top: 11px; right: 11px;
  background: rgba(239,68,68,0.1); border: none; border-radius: 6px;
  color: #f87171; padding: 3px 9px; font-size: 11px; font-weight: 700;
  cursor: pointer; transition: all 0.15s;
  &:hover { background: rgba(239,68,68,0.22); }
`;

const AddBtn = styled.button`
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;
  background: rgba(74,222,128,0.05); border: 1px dashed rgba(74,222,128,0.2);
  border-radius: 10px; color: #4ade80; padding: 10px; font-size: 13px; font-weight: 600;
  cursor: pointer; margin-top: 8px; transition: all 0.15s;
  &:hover { background: rgba(74,222,128,0.1); border-color: rgba(74,222,128,0.4); }
`;

const SaveBtn = styled.button`
  display: flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #4ade80, #16a34a);
  border: none; border-radius: 10px; color: #fff;
  padding: 11px 26px; font-size: 14px; font-weight: 700;
  cursor: pointer; margin-top: 18px; transition: all 0.2s;
  box-shadow: 0 4px 18px rgba(74,222,128,0.22);
  &:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(74,222,128,0.32); }
  &:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
`;

const Loader = styled.div`
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

const Toast = styled.div`
  position: fixed; bottom: 26px; right: 26px;
  background: ${p => p.$error ? '#dc2626' : '#16a34a'};
  color: #fff; padding: 11px 18px; border-radius: 10px; font-size: 13px; font-weight: 700;
  z-index: 9999; animation: ${fadeIn} 0.3s ease; box-shadow: 0 8px 28px rgba(0,0,0,0.4);
`;

const Tip = styled.div`
  background: rgba(74,222,128,0.06); border: 1px solid rgba(74,222,128,0.14);
  border-radius: 8px; padding: 10px 13px; font-size: 12px; color: #86efac; margin-bottom: 14px;
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
  .th { font-size: 10px; font-weight: 700; color: #334155; text-transform: uppercase;
    letter-spacing: 0.5px; padding: 11px 0; }
`;

const TRow = styled.div`
  display: grid; grid-template-columns: ${p => p.$cols};
  padding: 0 18px; border-bottom: 1px solid rgba(255,255,255,0.03);
  align-items: center; transition: background 0.12s;
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

const SmBtn = styled.button`
  border: none; border-radius: 7px; padding: 5px 10px; font-size: 11px; font-weight: 700;
  cursor: pointer; transition: all 0.15s;
  background: ${p => p.$danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)'};
  color: ${p => p.$danger ? '#f87171' : '#94a3b8'};
  &:hover { opacity: 0.8; }
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
    width: 20px; height: 20px; border-radius: 50%;
    background: #fff; transition: left 0.2s;
  }
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

/* â”€â”€ SECTIONS â”€â”€ */
const SECTIONS = [
    {
        group: 'Ä°Ã‡ERÄ°K', items: [
            { key: 'hero', label: 'Hero BÃ¶lÃ¼mÃ¼', icon: 'ðŸŽ¯' },
            { key: 'stats', label: 'Ä°statistikler', icon: 'ðŸ“Š' },
            { key: 'features', label: 'Ã–zellikler', icon: 'âœ¨' },
            { key: 'testimonials', label: 'Yorumlar', icon: 'ðŸ’¬' },
            { key: 'pricing', label: 'Fiyatlar', icon: 'ðŸ’°' },
        ]
    },
    {
        group: 'GÃ–RÃœNÃœM', items: [
            { key: 'appearance', label: 'Renkler & Tema', icon: 'ðŸŽ¨' },
            { key: 'images', label: 'GÃ¶rseller', icon: 'ðŸ–¼ï¸' },
        ]
    },
    {
        group: 'SÄ°TE', items: [
            { key: 'seo', label: 'SEO & Meta', icon: 'ðŸ”' },
            { key: 'footer', label: 'Footer & Ä°letiÅŸim', icon: 'ðŸ“¬' },
            { key: 'social', label: 'Sosyal Medya', icon: 'ðŸ“±' },
        ]
    },
    {
        group: 'HESAP', items: [
            { key: 'login', label: 'GiriÅŸ / Hesap', icon: 'ðŸ”' },
        ]
    },
    {
        group: 'YÃ–NETÄ°M', items: [
            { key: 'dashboard', label: 'Dashboard', icon: 'ðŸ“Š' },
            { key: 'users', label: 'KullanÄ±cÄ±lar', icon: 'ðŸ‘¥' },
            { key: 'blog', label: 'Blog / Duyurular', icon: 'ðŸ“' },
            { key: 'settings', label: 'Uygulama AyarlarÄ±', icon: 'âš™ï¸' },
        ]
    },
];

const DEFAULTS = {
    hero: { badge: 'ðŸš€ Modern Ã‡iftlik YÃ¶netimi', title: 'Ã‡iftliÄŸinizi GeleceÄŸe TaÅŸÄ±yÄ±n', subtitle: 'SÃ¼rÃ¼ takibi, sÃ¼t verimi analizi, stok yÃ¶netimi ve finansal raporlamalar tek bir platformda. VerimliliÄŸinizi %30 artÄ±rÄ±n.', btnPrimary: 'Hemen BaÅŸlayÄ±n', btnSecondary: 'NasÄ±l Ã‡alÄ±ÅŸÄ±r?' },
    stats: [{ value: '500+', label: 'Aktif Ã‡iftlik' }, { value: '100k+', label: 'KayÄ±tlÄ± Hayvan' }, { value: '%35', label: 'Ortalama Verim ArtÄ±ÅŸÄ±' }],
    features: [
        { icon: 'ðŸ“Š', title: 'AkÄ±llÄ± Raporlama', desc: 'KarmaÅŸÄ±k verileri anlaÅŸÄ±lÄ±r grafiklere dÃ¶nÃ¼ÅŸtÃ¼rÃ¼n.' },
        { icon: 'ðŸ””', title: 'AkÄ±llÄ± Bildirimler', desc: 'AÅŸÄ±, doÄŸum ve stok uyarÄ±larÄ±nÄ± zamanÄ±nda alÄ±n.' },
        { icon: 'ðŸ¥', title: 'SaÄŸlÄ±k Takibi', desc: 'Tedavi geÃ§miÅŸi, aÅŸÄ± takvimi ve hastalÄ±k kayÄ±tlarÄ±.' },
        { icon: 'ðŸ¥¡', title: 'Stok & Yem', desc: 'Yem ve ilaÃ§ stoklarÄ±nÄ± yÃ¶netin.' },
    ],
    testimonials: [
        { text: '"Agrolina sayesinde sÃ¼t verimimizi %25 artÄ±rdÄ±k."', name: 'Ahmet Demir', farm: 'Demir Ã‡iftliÄŸi', size: '50 BaÅŸ', initials: 'AD' },
        { text: '"Bildirim sistemi hayatÄ±mÄ±zÄ± kurtardÄ±."', name: 'Mehmet YÄ±lmaz', farm: 'YÄ±lmaz Besi', size: '120 BaÅŸ', initials: 'MY' },
    ],
    pricing: [
        { name: 'BaÅŸlangÄ±Ã§', price: 'â‚º0', period: '/ay', features: ['10 Hayvana Kadar', 'Temel SÃ¼rÃ¼ Takibi', 'SÃ¼t KaydÄ±'], popular: false, btnText: 'Ãœcretsiz BaÅŸla' },
        { name: 'Profesyonel', price: 'â‚º499', period: '/ay', features: ['100 Hayvana Kadar', 'TÃ¼m ModÃ¼ller Aktif', 'GeliÅŸmiÅŸ Raporlar'], popular: true, btnText: 'Åžimdi YÃ¼kselt' },
        { name: 'Kurumsal', price: 'â‚º999', period: '/ay', features: ['SÄ±nÄ±rsÄ±z Hayvan', 'Ã‡oklu Ã‡iftlik', '7/24 Destek'], popular: false, btnText: 'Ä°letiÅŸime GeÃ§' },
    ],
    appearance: { primaryColor: '#4CAF50', secondaryColor: '#2E7D32', heroBg: 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%)', accentColor: '#81C784' },
    images: { heroImage: '', featuresImage: '', logoUrl: '', ogImage: '' },
    seo: { siteTitle: 'Agrolina - Modern Ã‡iftlik YÃ¶netim Platformu', metaDescription: 'SÃ¼rÃ¼ takibi, sÃ¼t verimi analizi, stok yÃ¶netimi ve finansal raporlamalar tek bir platformda.', keywords: 'Ã§iftlik yÃ¶netimi, sÃ¼rÃ¼ takibi, sÃ¼t verimi, tarÄ±m yazÄ±lÄ±mÄ±' },
    footer: { companyName: 'Agrolina Teknoloji A.Åž.', slogan: 'Modern teknoloji ile geleneksel tarÄ±mÄ± buluÅŸturuyoruz.', email: 'info@agrolina.com', phone: '', address: '', copyright: 'Â© 2026 Agrolina Teknoloji A.Åž. TÃ¼m haklarÄ± saklÄ±dÄ±r.' },
    social: { instagram: '', facebook: '', linkedin: '', twitter: '', youtube: '' },
};

export default function AdminPanel() {
    const [active, setActive] = useState('hero');
    const [content, setContent] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Hesap / Login
    const [user, setUser] = useState(null);
    const [loginForm, setLoginForm] = useState({ email: '', sifre: '' });
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    useEffect(() => {
        // Mevcut oturumu kontrol et
        const stored = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (stored && token) setUser(JSON.parse(stored));

        // Ä°Ã§erik yÃ¼kle
        axios.get(`${API}/api/admin/content`)
            .then(r => setContent({ ...DEFAULTS, ...r.data }))
            .catch(() => setContent(DEFAULTS));
    }, []);

    const toast_ = (msg, error = false) => { setToast({ msg, error }); setTimeout(() => setToast(null), 3500); };

    const doLogin = async () => {
        setLoginLoading(true); setLoginError('');
        try {
            const r = await axios.post(`${API}/api/auth/login`, loginForm);
            const { token, refreshToken, user: u } = r.data;
            localStorage.setItem('token', token);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(u));
            setUser(u);
            toast_('âœ… GiriÅŸ yapÄ±ldÄ±!');
        } catch (e) {
            setLoginError(e.response?.data?.message || 'E-posta veya ÅŸifre hatalÄ±');
        } finally { setLoginLoading(false); }
    };

    const doLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        toast_('Ã‡Ä±kÄ±ÅŸ yapÄ±ldÄ±');
    };

    const save = async (key) => {
        setSaving(true);
        try { await axios.put(`${API}/api/admin/content/${key}`, { data: content[key] }); toast_('âœ… Kaydedildi!'); }
        catch { toast_('âŒ KayÄ±t baÅŸarÄ±sÄ±z', true); }
        finally { setSaving(false); }
    };

    const upd = (key, val) => setContent(p => ({ ...p, [key]: val }));
    const updArr = (key, i, patch) => { const a = [...(content[key] || [])]; a[i] = { ...a[i], ...patch }; upd(key, a); };

    if (!content) return (
        <Shell style={{ alignItems: 'center', justifyContent: 'center' }}>
            <GlobalStyle />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <Loader style={{ width: 30, height: 30, borderTopColor: '#4ade80' }} />
                <div style={{ color: '#475569', fontSize: 14 }}>YÃ¼kleniyor...</div>
            </div>
        </Shell>
    );

    const sel = k => content[k] || DEFAULTS[k];

    return (
        <Shell>
            <GlobalStyle />
            <Sidebar>
                <SidebarBrand>
                    <div className="logo">ðŸŒ± Agro<span>lina</span></div>
                    <div className="sub">Admin Paneli</div>
                </SidebarBrand>

                {/* Hesap alanÄ± - her zaman sidebar Ã¼stÃ¼nde gÃ¶rÃ¼nÃ¼r */}
                {user ? (
                    <UserCard>
                        <div className="name">{user.isim || user.ad || user.name || 'Admin'}</div>
                        <div className="email">{user.email}</div>
                        <div className="row">
                            <button className="app" onClick={() => window.location.href = '/'}>ðŸ  Uygulamaya Git</button>
                            <button className="out" onClick={doLogout}>Ã‡Ä±kÄ±ÅŸ</button>
                        </div>
                    </UserCard>
                ) : (
                    <LoginBox>
                        <h4>ðŸ” GiriÅŸ Yap</h4>
                        {loginError && <div className="err">{loginError}</div>}
                        <input
                            type="email" placeholder="E-posta"
                            value={loginForm.email}
                            onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && doLogin()}
                        />
                        <input
                            type="password" placeholder="Åžifre"
                            value={loginForm.sifre}
                            onChange={e => setLoginForm(p => ({ ...p, sifre: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && doLogin()}
                        />
                        <button onClick={doLogin} disabled={loginLoading}>
                            {loginLoading ? 'GiriÅŸ yapÄ±lÄ±yor...' : 'GiriÅŸ Yap'}
                        </button>
                    </LoginBox>
                )}

                {/* MenÃ¼ */}
                {SECTIONS.map(g => (
                    <SidebarSection key={g.group}>
                        <div className="lbl">{g.group}</div>
                        {g.items.map(s => (
                            <MenuItem key={s.key} $active={active === s.key} onClick={() => setActive(s.key)}>
                                <span className="icon">{s.icon}</span>{s.label}
                            </MenuItem>
                        ))}
                    </SidebarSection>
                ))}

                <SidebarFooter>v2.1 Â· Agrolina Admin</SidebarFooter>
            </Sidebar>

            <Main key={active}>

                {/* â•â•â• HERO â•â•â• */}
                {active === 'hero' && <>
                    <PageHeader><span className="emoji">ðŸŽ¯</span><div><h1>Hero BÃ¶lÃ¼mÃ¼</h1><p>ZiyaretÃ§inin ilk gÃ¶rdÃ¼ÄŸÃ¼ ana ekran</p></div></PageHeader>
                    <Card>
                        <h3>BaÅŸlÄ±k & Metin</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>Badge Metni</label><input value={sel('hero').badge} onChange={e => upd('hero', { ...sel('hero'), badge: e.target.value })} /></Field>
                            <Field><label>Ana BaÅŸlÄ±k</label><input value={sel('hero').title} onChange={e => upd('hero', { ...sel('hero'), title: e.target.value })} /></Field>
                        </Grid>
                        <Grid $mt={11}>
                            <Field><label>Alt BaÅŸlÄ±k / AÃ§Ä±klama</label><textarea value={sel('hero').subtitle} onChange={e => upd('hero', { ...sel('hero'), subtitle: e.target.value })} /></Field>
                        </Grid>
                    </Card>
                    <Card>
                        <h3>Butonlar</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>Birincil Buton</label><input value={sel('hero').btnPrimary} onChange={e => upd('hero', { ...sel('hero'), btnPrimary: e.target.value })} /></Field>
                            <Field><label>Ä°kincil Buton</label><input value={sel('hero').btnSecondary} onChange={e => upd('hero', { ...sel('hero'), btnSecondary: e.target.value })} /></Field>
                        </Grid>
                    </Card>
                    <SaveBtn onClick={() => save('hero')} disabled={saving}>{saving ? <Loader /> : 'ðŸ’¾'} Kaydet</SaveBtn>
                </>}

                {/* â•â•â• STATS â•â•â• */}
                {active === 'stats' && <>
                    <PageHeader><span className="emoji">ðŸ“Š</span><div><h1>Ä°statistikler</h1><p>Hero altÄ±ndaki sayÄ±sal kartlar</p></div></PageHeader>
                    {sel('stats').map((s, i) => (
                        <Card key={i}>
                            <h3>Ä°statistik {i + 1}</h3>
                            <Grid $cols="1fr 1fr">
                                <Field><label>DeÄŸer (Ã¶r: 500+)</label><input value={s.value} onChange={e => updArr('stats', i, { value: e.target.value })} /></Field>
                                <Field><label>AÃ§Ä±klama</label><input value={s.label} onChange={e => updArr('stats', i, { label: e.target.value })} /></Field>
                            </Grid>
                        </Card>
                    ))}
                    <SaveBtn onClick={() => save('stats')} disabled={saving}>{saving ? <Loader /> : 'ðŸ’¾'} Kaydet</SaveBtn>
                </>}

                {/* â•â•â• FEATURES â•â•â• */}
                {active === 'features' && <>
                    <PageHeader><span className="emoji">âœ¨</span><div><h1>Ã–zellikler</h1><p>"Neden Agrolina?" kartlarÄ±</p></div></PageHeader>
                    {sel('features').map((f, i) => (
                        <ItemCard key={i}>
                            <DelBtn onClick={() => upd('features', sel('features').filter((_, j) => j !== i))}>ðŸ—‘ Sil</DelBtn>
                            <Grid $cols="55px 1fr 2fr">
                                <Field><label>Emoji</label><input value={f.icon} onChange={e => updArr('features', i, { icon: e.target.value })} /></Field>
                                <Field><label>BaÅŸlÄ±k</label><input value={f.title} onChange={e => updArr('features', i, { title: e.target.value })} /></Field>
                                <Field><label>AÃ§Ä±klama</label><input value={f.desc} onChange={e => updArr('features', i, { desc: e.target.value })} /></Field>
                            </Grid>
                        </ItemCard>
                    ))}
                    <AddBtn onClick={() => upd('features', [...sel('features'), { icon: 'â­', title: 'Yeni Ã–zellik', desc: 'AÃ§Ä±klama' }])}>+ Kart Ekle</AddBtn>
                    <SaveBtn onClick={() => save('features')} disabled={saving}>{saving ? <Loader /> : 'ðŸ’¾'} Kaydet</SaveBtn>
                </>}

                {/* â•â•â• TESTIMONIALS â•â•â• */}
                {active === 'testimonials' && <>
                    <PageHeader><span className="emoji">ðŸ’¬</span><div><h1>MÃ¼ÅŸteri YorumlarÄ±</h1><p>Referans ve baÅŸarÄ± hikayeleri</p></div></PageHeader>
                    {sel('testimonials').map((t, i) => (
                        <ItemCard key={i}>
                            <DelBtn onClick={() => upd('testimonials', sel('testimonials').filter((_, j) => j !== i))}>ðŸ—‘ Sil</DelBtn>
                            <Grid $cols="1fr 1fr">
                                <Field><label>Ad Soyad</label><input value={t.name} onChange={e => updArr('testimonials', i, { name: e.target.value, initials: e.target.value.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) })} /></Field>
                                <Field><label>Ã‡iftlik AdÄ±</label><input value={t.farm} onChange={e => updArr('testimonials', i, { farm: e.target.value })} /></Field>
                            </Grid>
                            <Grid $mt={10}>
                                <Field><label>Yorum Metni</label><textarea value={t.text} onChange={e => updArr('testimonials', i, { text: e.target.value })} /></Field>
                            </Grid>
                            <Grid $cols="1fr 1fr" $mt={10}>
                                <Field><label>Hayvan SayÄ±sÄ± (Ã¶r: 80 BaÅŸ)</label><input value={t.size} onChange={e => updArr('testimonials', i, { size: e.target.value })} /></Field>
                            </Grid>
                        </ItemCard>
                    ))}
                    <AddBtn onClick={() => upd('testimonials', [...sel('testimonials'), { text: '"Yorum buraya..."', name: 'Ad Soyad', farm: 'Ã‡iftlik AdÄ±', size: '50 BaÅŸ', initials: 'AS' }])}>+ Yorum Ekle</AddBtn>
                    <SaveBtn onClick={() => save('testimonials')} disabled={saving}>{saving ? <Loader /> : 'ðŸ’¾'} Kaydet</SaveBtn>
                </>}

                {/* â•â•â• PRICING â•â•â• */}
                {active === 'pricing' && <>
                    <PageHeader><span className="emoji">ðŸ’°</span><div><h1>FiyatlandÄ±rma</h1><p>Abonelik paketleri</p></div></PageHeader>
                    {sel('pricing').map((p, i) => (
                        <ItemCard key={i}>
                            <DelBtn onClick={() => upd('pricing', sel('pricing').filter((_, j) => j !== i))}>ðŸ—‘ Sil</DelBtn>
                            <Grid $cols="1fr 1fr 1fr">
                                <Field><label>Paket AdÄ±</label><input value={p.name} onChange={e => updArr('pricing', i, { name: e.target.value })} /></Field>
                                <Field><label>Fiyat (Ã¶r: â‚º499)</label><input value={p.price} onChange={e => updArr('pricing', i, { price: e.target.value })} /></Field>
                                <Field><label>DÃ¶nem (Ã¶r: /ay)</label><input value={p.period} onChange={e => updArr('pricing', i, { period: e.target.value })} /></Field>
                            </Grid>
                            <Grid $mt={10}>
                                <Field><label>Ã–zellikler â€” her satÄ±r bir Ã¶zellik</label>
                                    <textarea value={(p.features || []).join('\n')} onChange={e => updArr('pricing', i, { features: e.target.value.split('\n') })} style={{ minHeight: 85 }} />
                                </Field>
                            </Grid>
                            <Grid $cols="1fr 1fr" $mt={10}>
                                <Field><label>Buton YazÄ±sÄ±</label><input value={p.btnText} onChange={e => updArr('pricing', i, { btnText: e.target.value })} /></Field>
                                <Field><label>En PopÃ¼ler Badge</label>
                                    <select value={p.popular ? 'evet' : 'hayir'} onChange={e => updArr('pricing', i, { popular: e.target.value === 'evet' })}>
                                        <option value="hayir">HayÄ±r</option>
                                        <option value="evet">âœ… Evet â€” "En PopÃ¼ler"</option>
                                    </select>
                                </Field>
                            </Grid>
                        </ItemCard>
                    ))}
                    <AddBtn onClick={() => upd('pricing', [...sel('pricing'), { name: 'Yeni Paket', price: 'â‚º0', period: '/ay', features: ['Ã–zellik 1'], popular: false, btnText: 'BaÅŸla' }])}>+ Paket Ekle</AddBtn>
                    <SaveBtn onClick={() => save('pricing')} disabled={saving}>{saving ? <Loader /> : 'ðŸ’¾'} Kaydet</SaveBtn>
                </>}

                {/* â•â•â• APPEARANCE â•â•â• */}
                {active === 'appearance' && <>
                    <PageHeader><span className="emoji">ðŸŽ¨</span><div><h1>Renkler & Tema</h1><p>Site renk paleti ve gÃ¶rsel tema</p></div></PageHeader>
                    <Tip>ðŸ’¡ Renkleri deÄŸiÅŸtirdikten sonra kaydet â€” landing page gÃ¼ncel renkleri kullanÄ±r.</Tip>
                    <Card>
                        <h3>Ana Renkler</h3>
                        <Grid $cols="1fr 1fr">
                            <ColorField>
                                <label>Birincil Renk</label>
                                <div className="row">
                                    <input type="color" value={sel('appearance').primaryColor} onChange={e => upd('appearance', { ...sel('appearance'), primaryColor: e.target.value })} />
                                    <input type="text" value={sel('appearance').primaryColor} onChange={e => upd('appearance', { ...sel('appearance'), primaryColor: e.target.value })} />
                                </div>
                            </ColorField>
                            <ColorField>
                                <label>Ä°kincil Renk</label>
                                <div className="row">
                                    <input type="color" value={sel('appearance').secondaryColor} onChange={e => upd('appearance', { ...sel('appearance'), secondaryColor: e.target.value })} />
                                    <input type="text" value={sel('appearance').secondaryColor} onChange={e => upd('appearance', { ...sel('appearance'), secondaryColor: e.target.value })} />
                                </div>
                            </ColorField>
                        </Grid>
                    </Card>
                    <Card>
                        <h3>Hero Arka PlanÄ± (CSS background deÄŸeri)</h3>
                        <Field>
                            <label>Gradient veya renk kodu</label>
                            <textarea value={sel('appearance').heroBg} onChange={e => upd('appearance', { ...sel('appearance'), heroBg: e.target.value })} style={{ minHeight: 50, fontFamily: 'monospace', fontSize: 12 }} />
                        </Field>
                        <div style={{ marginTop: 10, height: 56, borderRadius: 8, background: sel('appearance').heroBg }} />
                    </Card>
                    <SaveBtn onClick={() => save('appearance')} disabled={saving}>{saving ? <Loader /> : 'ðŸ’¾'} Kaydet</SaveBtn>
                </>}

                {/* â•â•â• IMAGES â•â•â• */}
                {active === 'images' && <>
                    <PageHeader><span className="emoji">ðŸ–¼ï¸</span><div><h1>GÃ¶rseller</h1><p>Resim URL'leri â€” herhangi bir CDN ya da Unsplash linki</p></div></PageHeader>
                    <Tip>ðŸ’¡ Resim URL olarak Unsplash, ImgBB veya Cloudinary linki kullanabilirsin.</Tip>
                    <Card>
                        <h3>Hero GÃ¶rseli</h3>
                        <Field><label>Hero Arkaplan Resmi URL</label><input value={sel('images').heroImage} onChange={e => upd('images', { ...sel('images'), heroImage: e.target.value })} placeholder="https://images.unsplash.com/..." /></Field>
                        <ImagePreview>
                            {sel('images').heroImage ? <img src={sel('images').heroImage} alt="Hero" /> : <div className="placeholder">Resim URLsi girilmedi</div>}
                        </ImagePreview>
                    </Card>
                    <Card>
                        <h3>Logo</h3>
                        <Field><label>Logo URL (boÅŸ â†’ varsayÄ±lan)</label><input value={sel('images').logoUrl} onChange={e => upd('images', { ...sel('images'), logoUrl: e.target.value })} placeholder="https://..." /></Field>
                    </Card>
                    <Card>
                        <h3>OG Image (Sosyal medya paylaÅŸÄ±m gÃ¶rseli)</h3>
                        <Field><label>OG Image URL (1200Ã—630 Ã¶nerilir)</label><input value={sel('images').ogImage} onChange={e => upd('images', { ...sel('images'), ogImage: e.target.value })} placeholder="https://..." /></Field>
                        <ImagePreview>
                            {sel('images').ogImage ? <img src={sel('images').ogImage} alt="OG" /> : <div className="placeholder">Sosyal medya gÃ¶rseli</div>}
                        </ImagePreview>
                    </Card>
                    <SaveBtn onClick={() => save('images')} disabled={saving}>{saving ? <Loader /> : 'ðŸ’¾'} Kaydet</SaveBtn>
                </>}

                {/* â•â•â• SEO â•â•â• */}
                {active === 'seo' && <>
                    <PageHeader><span className="emoji">ðŸ”</span><div><h1>SEO & Meta Etiketler</h1><p>Google arama sonuÃ§larÄ± ve Ã¶nizleme</p></div></PageHeader>
                    <Card>
                        <h3>Sayfa BaÅŸlÄ±ÄŸÄ±</h3>
                        <Field><label>Site BaÅŸlÄ±ÄŸÄ±</label><input value={sel('seo').siteTitle} onChange={e => upd('seo', { ...sel('seo'), siteTitle: e.target.value })} /></Field>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 5 }}>{sel('seo').siteTitle?.length || 0} karakter (Ã¶nerilen: 50-60)</div>
                    </Card>
                    <Card>
                        <h3>Meta AÃ§Ä±klama</h3>
                        <Field><label>AÃ§Ä±klama (Google'da gÃ¶rÃ¼nÃ¼r)</label>
                            <textarea value={sel('seo').metaDescription} onChange={e => upd('seo', { ...sel('seo'), metaDescription: e.target.value })} />
                        </Field>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 5 }}>{sel('seo').metaDescription?.length || 0} karakter</div>
                    </Card>
                    <Card>
                        <h3>Anahtar Kelimeler</h3>
                        <Field><label>VirgÃ¼lle ayÄ±r</label><input value={sel('seo').keywords} onChange={e => upd('seo', { ...sel('seo'), keywords: e.target.value })} /></Field>
                    </Card>
                    <SaveBtn onClick={() => save('seo')} disabled={saving}>{saving ? <Loader /> : 'ðŸ’¾'} Kaydet</SaveBtn>
                </>}

                {/* â•â•â• FOOTER â•â•â• */}
                {active === 'footer' && <>
                    <PageHeader><span className="emoji">ðŸ“¬</span><div><h1>Footer & Ä°letiÅŸim</h1><p>SayfanÄ±n alt kÄ±smÄ±</p></div></PageHeader>
                    <Card>
                        <h3>Åžirket Bilgileri</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>Åžirket AdÄ±</label><input value={sel('footer').companyName} onChange={e => upd('footer', { ...sel('footer'), companyName: e.target.value })} /></Field>
                            <Field><label>Copyright Metni</label><input value={sel('footer').copyright} onChange={e => upd('footer', { ...sel('footer'), copyright: e.target.value })} /></Field>
                        </Grid>
                        <Grid $mt={11}>
                            <Field><label>Slogan</label><input value={sel('footer').slogan} onChange={e => upd('footer', { ...sel('footer'), slogan: e.target.value })} /></Field>
                        </Grid>
                    </Card>
                    <Card>
                        <h3>Ä°letiÅŸim</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>E-posta</label><input type="email" value={sel('footer').email} onChange={e => upd('footer', { ...sel('footer'), email: e.target.value })} /></Field>
                            <Field><label>Telefon</label><input value={sel('footer').phone} onChange={e => upd('footer', { ...sel('footer'), phone: e.target.value })} /></Field>
                        </Grid>
                        <Grid $mt={11}>
                            <Field><label>Adres</label><textarea value={sel('footer').address} onChange={e => upd('footer', { ...sel('footer'), address: e.target.value })} style={{ minHeight: 52 }} /></Field>
                        </Grid>
                    </Card>
                    <SaveBtn onClick={() => save('footer')} disabled={saving}>{saving ? <Loader /> : 'ðŸ’¾'} Kaydet</SaveBtn>
                </>}

                {/* â•â•â• SOCIAL â•â•â• */}
                {active === 'social' && <>
                    <PageHeader><span className="emoji">ðŸ“±</span><div><h1>Sosyal Medya</h1><p>Footer'da ikon olarak gÃ¶rÃ¼nÃ¼r</p></div></PageHeader>
                    <Card>
                        <h3>Profil Linkleri</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>ðŸ“· Instagram</label><input value={sel('social').instagram} onChange={e => upd('social', { ...sel('social'), instagram: e.target.value })} placeholder="https://instagram.com/..." /></Field>
                            <Field><label>ðŸ“˜ Facebook</label><input value={sel('social').facebook} onChange={e => upd('social', { ...sel('social'), facebook: e.target.value })} placeholder="https://facebook.com/..." /></Field>
                            <Field><label>ðŸ’¼ LinkedIn</label><input value={sel('social').linkedin} onChange={e => upd('social', { ...sel('social'), linkedin: e.target.value })} placeholder="https://linkedin.com/..." /></Field>
                            <Field><label>ðŸ¦ Twitter / X</label><input value={sel('social').twitter} onChange={e => upd('social', { ...sel('social'), twitter: e.target.value })} placeholder="https://twitter.com/..." /></Field>
                            <Field><label>â–¶ï¸ YouTube</label><input value={sel('social').youtube} onChange={e => upd('social', { ...sel('social'), youtube: e.target.value })} placeholder="https://youtube.com/..." /></Field>
                        </Grid>
                    </Card>
                    <SaveBtn onClick={() => save('social')} disabled={saving}>{saving ? <Loader /> : 'ðŸ’¾'} Kaydet</SaveBtn>
                </>}

                {/* â•â•â• LOGIN â•â•â• */}
                {active === 'login' && <>
                    <PageHeader><span className="emoji">ðŸ”</span><div><h1>GiriÅŸ / Hesap</h1><p>Uygulamaya giriÅŸ yapÄ±n</p></div></PageHeader>
                    {user ? (
                        <Card>
                            <h3>Aktif Hesap</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0' }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>
                                    {(user.ad || user.name || 'A')[0].toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>{user.ad || user.name || 'Admin'}</div>
                                    <div style={{ color: '#475569', fontSize: 13 }}>{user.email}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                                <SaveBtn onClick={() => window.location.href = '/'} style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', boxShadow: '0 4px 18px rgba(59,130,246,0.22)' }}>
                                    ðŸ  Uygulamaya Git
                                </SaveBtn>
                                <SaveBtn onClick={doLogout} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 18px rgba(239,68,68,0.22)', marginTop: 18 }}>
                                    Ã‡Ä±kÄ±ÅŸ Yap
                                </SaveBtn>
                            </div>
                        </Card>
                    ) : (
                        <Card>
                            <h3>GiriÅŸ Yap</h3>
                            {loginError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 14 }}>{loginError}</div>}
                            <Grid>
                                <Field><label>E-posta</label>
                                    <input type="email" value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} onKeyDown={e => e.key === 'Enter' && doLogin()} placeholder="kullanici@email.com" />
                                </Field>
                                <Field><label>Åžifre</label>
                                    <input type="password" value={loginForm.sifre} onChange={e => setLoginForm(p => ({ ...p, sifre: e.target.value }))} onKeyDown={e => e.key === 'Enter' && doLogin()} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
                                </Field>
                            </Grid>
                            <SaveBtn onClick={doLogin} disabled={loginLoading}>{loginLoading ? <Loader /> : 'ðŸ”'} {loginLoading ? 'GiriÅŸ yapÄ±lÄ±yor...' : 'GiriÅŸ Yap'}</SaveBtn>
                        </Card>
                    )}
                </>}

                {/* â•â•â• DASHBOARD â•â•â• */}
                {active === 'dashboard' && <DashboardSection API={API} toast_={toast_} />}

                {/* â•â•â• USERS â•â•â• */}
                {active === 'users' && <UsersSection API={API} toast_={toast_} />}

                {/* â•â•â• BLOG â•â•â• */}
                {active === 'blog' && <BlogSection API={API} toast_={toast_} />}

                {/* â•â•â• SETTINGS â•â•â• */}
                {active === 'settings' && <SettingsSection API={API} toast_={toast_} />}

            </Main>

            {toast && <Toast $error={toast.error}>{toast.msg}</Toast>}
        </Shell>
    );
}


/* DASHBOARD SECTION */
function DashboardSection({ API, toast_ }) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    axios.get(`${API}/api/admin/dashboard`)
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => { toast_('Dashboard verisi alinamadi', true); setLoading(false); });
  }, []);
  if (loading) return <div style={{display:'flex',alignItems:'center',gap:10,padding:20,color:'#475569'}}><Loader style={{borderTopColor:'#4ade80'}}/>Yukleniyor...</div>;
  if (!data) return <div style={{color:'#f87171',padding:20}}>Veri alinamadi</div>;
  return (
    <>
      <PageHeader><span className="emoji">??</span><div><h1>Dashboard</h1><p>Genel istatistikler</p></div></PageHeader>
      <StatGrid>
        <StatCard $color="rgba(74,222,128,0.06)" $border="rgba(74,222,128,0.15)" $textColor="#4ade80"><div className="val">{data.kullanici.toplam}</div><div className="lbl">Toplam Kullanici</div><div className="sub">Bu hafta +{data.kullanici.buHafta}</div></StatCard>
        <StatCard $color="rgba(59,130,246,0.06)" $border="rgba(59,130,246,0.15)" $textColor="#60a5fa"><div className="val">{data.hayvan.toplam}</div><div className="lbl">Toplam Hayvan</div><div className="sub">Inek+Duve+Buzagi+Tosun</div></StatCard>
        <StatCard $color="rgba(168,85,247,0.06)" $border="rgba(168,85,247,0.15)" $textColor="#c084fc"><div className="val">{data.kullanici.aktif}</div><div className="lbl">Aktif Kullanici</div><div className="sub">Bu ay +{data.kullanici.buAy}</div></StatCard>
        <StatCard $color="rgba(251,146,60,0.06)" $border="rgba(251,146,60,0.15)" $textColor="#fb923c"><div className="val">{data.hayvan.buzagi + data.hayvan.duve}</div><div className="lbl">Genc Hayvan</div><div className="sub">Duve+Buzagi</div></StatCard>
      </StatGrid>
      <Card><h3>Son 7 Gun - Yeni Kayitlar</h3>
        <div style={{display:'flex',alignItems:'flex-end',gap:8,height:88,marginTop:8}}>
          {(data.gunlukKayitlar||[]).map((g,i)=>{const max=Math.max(...(data.gunlukKayitlar||[]).map(x=>x.sayi),1);const h=Math.max((g.sayi/max)*72,4);return(<div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}><div style={{fontSize:10,color:'#4ade80',fontWeight:700}}>{g.sayi||''}</div><div style={{width:'100%',height:h,background:'linear-gradient(180deg,#4ade80,#16a34a)',borderRadius:4,opacity:g.sayi?1:0.15}}/><div style={{fontSize:9,color:'#334155',textAlign:'center'}}>{g.tarih}</div></div>);})}
        </div>
      </Card>
      <Card><h3>Son Kayit Olan Kullanicilar</h3>
        <Table>
          <THead $cols="1fr 1fr 1fr 80px"><div className="th">Isim</div><div className="th">Isletme</div><div className="th">E-posta</div><div className="th">Durum</div></THead>
          {(data.sonKullanicilar||[]).map(u=>(<TRow key={u._id} $cols="1fr 1fr 1fr 80px"><div className="td name">{u.isim}</div><div className="td">{u.isletmeAdi||'—'}</div><div className="td" style={{fontSize:11}}>{u.email}</div><div className="td"><Badge $active={u.aktif!==false}>{u.aktif!==false?'Aktif':'Pasif'}</Badge></div></TRow>))}
        </Table>
      </Card>
    </>
  );
}

/* USERS SECTION */
function UsersSection({ API, toast_ }) {
  const [users, setUsers] = React.useState([]);
  const [q, setQ] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [toplam, setToplam] = React.useState(0);
  const fetchUsers = async (s='') => {
    setLoading(true);
    try { const r=await axios.get(`${API}/api/admin/users?q=${s}&limit=50`); setUsers(r.data.users); setToplam(r.data.toplam); }
    catch { toast_('Kullanicilar alinamadi', true); }
    finally { setLoading(false); }
  };
  React.useEffect(()=>{ fetchUsers(); },[]);
  const toggleAktif = async (id, cur) => {
    try { await axios.patch(`${API}/api/admin/users/${id}`,{aktif:!cur}); setUsers(p=>p.map(u=>u._id===id?{...u,aktif:!cur}:u)); toast_(!cur?'Kullanici aktiflestirildi':'Pasife alindi'); }
    catch { toast_('Islem basarisiz',true); }
  };
  const deleteUser = async (id, isim) => {
    if (!window.confirm(`"${isim}" silinsin mi?`)) return;
    try { await axios.delete(`${API}/api/admin/users/${id}`); setUsers(p=>p.filter(u=>u._id!==id)); toast_('Kullanici silindi'); }
    catch { toast_('Silme basarisiz',true); }
  };
  return (
    <>
      <PageHeader><span className="emoji">??</span><div><h1>Kullanicilar</h1><p>Toplam {toplam} kayitli kullanici</p></div></PageHeader>
      <SearchBar><input placeholder="Ara..." value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchUsers(q)}/><button onClick={()=>fetchUsers(q)}>Ara</button></SearchBar>
      {loading?<div style={{color:'#475569',padding:16}}>Yukleniyor...</div>:
      <Table>
        <THead $cols="1.4fr 1fr 1.5fr 75px 85px 85px"><div className="th">Isim</div><div className="th">Isletme</div><div className="th">E-posta</div><div className="th">Durum</div><div className="th">Kayit</div><div className="th">Islem</div></THead>
        {users.map(u=>(
          <TRow key={u._id} $cols="1.4fr 1fr 1.5fr 75px 85px 85px">
            <div className="td name">{u.isim}</div><div className="td">{u.isletmeAdi||'—'}</div>
            <div className="td" style={{fontSize:11}}>{u.email}</div>
            <div className="td"><Badge $active={u.aktif!==false}>{u.aktif!==false?'Aktif':'Pasif'}</Badge></div>
            <div className="td" style={{fontSize:11}}>{new Date(u.createdAt||u.kayitTarihi).toLocaleDateString('tr-TR')}</div>
            <div className="td" style={{display:'flex',gap:5}}>
              <SmBtn onClick={()=>toggleAktif(u._id,u.aktif!==false)}>{u.aktif!==false?'?':'??'}</SmBtn>
              <SmBtn $danger onClick={()=>deleteUser(u._id,u.isim)}>??</SmBtn>
            </div>
          </TRow>
        ))}
        {users.length===0&&<div style={{padding:20,color:'#334155',textAlign:'center',fontSize:13}}>Kullanici bulunamadi</div>}
      </Table>}
    </>
  );
}

/* BLOG SECTION */
const EMPTY_POST_DATA = { title:'', excerpt:'', content:'', imageUrl:'', published:false, author:'Agrolina Admin', tags:'' };
function BlogSection({ API, toast_ }) {
  const [posts, setPosts] = React.useState([]);
  const [editing, setEditing] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const fetchPosts = async () => { setLoading(true); try{const r=await axios.get(`${API}/api/admin/blog`);setPosts(r.data);}catch{toast_('Blog alinamadi',true);}finally{setLoading(false);}};
  React.useEffect(()=>{fetchPosts();},[]);
  const savePost = async () => {
    if (!editing.title) return toast_('Baslik gerekli',true);
    setSaving(true);
    try {
      const payload={...editing,tags:editing.tags?editing.tags.split(',').map(t=>t.trim()):[]};
      if(editing._id){const r=await axios.put(`${API}/api/admin/blog/${editing._id}`,payload);setPosts(p=>p.map(x=>x._id===editing._id?r.data.post:x));}
      else{const r=await axios.post(`${API}/api/admin/blog`,payload);setPosts(p=>[r.data.post,...p]);}
      toast_('Yazi kaydedildi!'); setEditing(null);
    }catch{toast_('Kayit basarisiz',true);}finally{setSaving(false);}
  };
  const deletePost = async (id) => {
    if(!window.confirm('Silinsin mi?'))return;
    try{await axios.delete(`${API}/api/admin/blog/${id}`);setPosts(p=>p.filter(x=>x._id!==id));toast_('Yazi silindi');}
    catch{toast_('Silme basarisiz',true);}
  };
  if(editing) return (
    <>
      <PageHeader><span className="emoji">??</span><div><h1>{editing._id?'Duzenle':'Yeni Yazi'}</h1><p>Blog</p></div></PageHeader>
      <Card><h3>Icerik</h3>
        <Grid><Field><label>Baslik</label><input value={editing.title} onChange={e=>setEditing(p=>({...p,title:e.target.value}))} placeholder="Yazi basligi..."/></Field></Grid>
        <Grid $mt={10}><Field><label>Ozet</label><textarea value={editing.excerpt} onChange={e=>setEditing(p=>({...p,excerpt:e.target.value}))} style={{minHeight:55}} placeholder="Kisa ozet..."/></Field></Grid>
        <Grid $mt={10}><Field><label>Icerik</label><textarea value={editing.content} onChange={e=>setEditing(p=>({...p,content:e.target.value}))} style={{minHeight:160}} placeholder="Yazi icerigi..."/></Field></Grid>
        <Grid $cols="1fr 1fr" $mt={10}>
          <Field><label>Yazar</label><input value={editing.author} onChange={e=>setEditing(p=>({...p,author:e.target.value}))}/></Field>
          <Field><label>Etiketler</label><input value={editing.tags} onChange={e=>setEditing(p=>({...p,tags:e.target.value}))} placeholder="teknoloji, ciftlik"/></Field>
        </Grid>
        <Grid $mt={10}><Field><label>Gorsel URL</label><input value={editing.imageUrl} onChange={e=>setEditing(p=>({...p,imageUrl:e.target.value}))} placeholder="https://..."/></Field></Grid>
        {editing.imageUrl&&<img src={editing.imageUrl} alt="" style={{width:'100%',height:130,objectFit:'cover',borderRadius:8,marginTop:8}}/>}
      </Card>
      <Card><h3>Yayin Durumu</h3>
        <ToggleRow><div className="info"><div className="name">Yayinla</div><div className="desc">Landing page blog listesinde gozuksun</div></div><Toggle $on={editing.published} onClick={()=>setEditing(p=>({...p,published:!p.published}))}/></ToggleRow>
      </Card>
      <div style={{display:'flex',gap:10}}><SaveBtn onClick={savePost} disabled={saving}>{saving?<Loader/>:'??'} Kaydet</SaveBtn><SaveBtn onClick={()=>setEditing(null)} style={{background:'rgba(255,255,255,0.06)',boxShadow:'none',color:'#94a3b8'}}>Iptal</SaveBtn></div>
    </>
  );
  return (
    <>
      <PageHeader><span className="emoji">??</span><div><h1>Blog / Duyurular</h1><p>{posts.length} yazi</p></div></PageHeader>
      <AddBtn onClick={()=>setEditing({...EMPTY_POST_DATA})} style={{marginBottom:16}}>+ Yeni Yazi Ekle</AddBtn>
      {loading?<div style={{color:'#475569',padding:16}}>Yukleniyor...</div>:posts.length===0?<Card><div style={{color:'#334155',textAlign:'center',padding:'20px 0'}}>Hic yazi yok. Ilk yaziyi ekle!</div></Card>:posts.map(p=>(
        <ItemCard key={p._id}>
          <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
            {p.imageUrl&&<img src={p.imageUrl} alt="" style={{width:80,height:60,objectFit:'cover',borderRadius:8,flexShrink:0}}/>}
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}><span style={{fontWeight:700,color:'#e2e8f0',fontSize:14}}>{p.title}</span><Badge $active={p.published}>{p.published?'Yayinda':'Taslak'}</Badge></div>
              <div style={{color:'#475569',fontSize:12}}>{p.excerpt||(p.content||'').slice(0,80)+'...'}</div>
              <div style={{color:'#334155',fontSize:11,marginTop:5}}>{p.author} · {new Date(p.createdAt).toLocaleDateString('tr-TR')}</div>
            </div>
          </div>
          <div style={{display:'flex',gap:6,marginTop:10}}><SmBtn onClick={()=>setEditing({...p,tags:(p.tags||[]).join(', ')})}>?? Duzenle</SmBtn><SmBtn $danger onClick={()=>deletePost(p._id)}>?? Sil</SmBtn></div>
        </ItemCard>
      ))}
    </>
  );
}

/* SETTINGS SECTION */
const DEFAULT_APP_SETTINGS = { bakimModu:false, kayitAcik:true, yemDanismaniAktif:true, finansalModulAktif:true, saglikModulAktif:true, maxHayvanLimiti:500, destek_email:'destek@agrolina.com' };
function SettingsSection({ API, toast_ }) {
  const [settings, setSettings] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  React.useEffect(()=>{ axios.get(`${API}/api/admin/settings`).then(r=>setSettings({...DEFAULT_APP_SETTINGS,...r.data})).catch(()=>setSettings(DEFAULT_APP_SETTINGS)); },[]);
  const toggle = (k) => setSettings(p=>({...p,[k]:!p[k]}));
  const upd = (k,v) => setSettings(p=>({...p,[k]:v}));
  const save = async () => { setSaving(true); try{await axios.put(`${API}/api/admin/settings`,settings);toast_('Ayarlar kaydedildi!');}catch{toast_('Kayit basarisiz',true);}finally{setSaving(false);} };
  if(!settings) return <div style={{color:'#475569',padding:20}}>Yukleniyor...</div>;
  const flags=[{key:'bakimModu',name:'?? Bakim Modu',desc:'Aciksa landing page\'de bakim banner gozukur',danger:true},{key:'kayitAcik',name:'?? Yeni Kayit Acik',desc:'Kapatirsan Kayit Ol butonu devre disi kalir'},{key:'yemDanismaniAktif',name:'?? Yem Danismani AI',desc:'Uygulamada AI yem danismani modulu'},{key:'finansalModulAktif',name:'?? Finansal Modul',desc:'Kullanicilarin finansal raporlara erisimi'},{key:'saglikModulAktif',name:'?? Saglik Modulu',desc:'Saglik kaydi ve asi takip modulu'}];
  return (
    <>
      <PageHeader><span className="emoji">??</span><div><h1>Uygulama Ayarlari</h1><p>Ozellik bayraklari ve sistem limitleri</p></div></PageHeader>
      <Card><h3>Ozellik Bayraklari</h3>
        {flags.map(f=>(<ToggleRow key={f.key}><div className="info"><div className="name" style={f.danger&&settings[f.key]?{color:'#f87171'}:{}}>{f.name}</div><div className="desc">{f.desc}</div></div><Toggle $on={settings[f.key]} onClick={()=>toggle(f.key)}/></ToggleRow>))}
      </Card>
      <Card><h3>Limitler ve Iletisim</h3>
        <Grid $cols="1fr 1fr">
          <Field><label>Max Hayvan Limiti (kullanici basina)</label><input type="number" value={settings.maxHayvanLimiti} onChange={e=>upd('maxHayvanLimiti',parseInt(e.target.value))}/></Field>
          <Field><label>Destek E-posta</label><input type="email" value={settings.destek_email} onChange={e=>upd('destek_email',e.target.value)}/></Field>
        </Grid>
      </Card>
      {settings.bakimModu&&<div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,padding:'10px 14px',fontSize:12,color:'#f87171',marginBottom:14}}>Bakim modu aktif!</div>}
      <SaveBtn onClick={save} disabled={saving}>{saving?<Loader/>:'??'} Ayarlari Kaydet</SaveBtn>
    </>
  );
}
