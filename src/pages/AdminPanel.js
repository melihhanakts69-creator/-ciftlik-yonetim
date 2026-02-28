ï»¿import { DashboardSection, UsersSection, BlogSection, SettingsSection } from './AdminSections';
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

/* Ã¢â€â‚¬Ã¢â€â‚¬ SECTIONS Ã¢â€â‚¬Ã¢â€â‚¬ */
const SECTIONS = [
    {
        group: 'Ã„Â°Ãƒâ€¡ERÃ„Â°K', items: [
            { key: 'hero', label: 'Hero BÃƒÂ¶lÃƒÂ¼mÃƒÂ¼', icon: 'Ã°Å¸Å½Â¯' },
            { key: 'stats', label: 'Ã„Â°statistikler', icon: 'Ã°Å¸â€œÅ ' },
            { key: 'features', label: 'Ãƒâ€“zellikler', icon: 'Ã¢Å“Â¨' },
            { key: 'testimonials', label: 'Yorumlar', icon: 'Ã°Å¸â€™Â¬' },
            { key: 'pricing', label: 'Fiyatlar', icon: 'Ã°Å¸â€™Â°' },
        ]
    },
    {
        group: 'GÃƒâ€“RÃƒÅ“NÃƒÅ“M', items: [
            { key: 'appearance', label: 'Renkler & Tema', icon: 'Ã°Å¸Å½Â¨' },
            { key: 'images', label: 'GÃƒÂ¶rseller', icon: 'Ã°Å¸â€“Â¼Ã¯Â¸Â' },
        ]
    },
    {
        group: 'SÃ„Â°TE', items: [
            { key: 'seo', label: 'SEO & Meta', icon: 'Ã°Å¸â€Â' },
            { key: 'footer', label: 'Footer & Ã„Â°letiÃ…Å¸im', icon: 'Ã°Å¸â€œÂ¬' },
            { key: 'social', label: 'Sosyal Medya', icon: 'Ã°Å¸â€œÂ±' },
        ]
    },
    {
        group: 'HESAP', items: [
            { key: 'login', label: 'GiriÃ…Å¸ / Hesap', icon: 'Ã°Å¸â€Â' },
        ]
    },
    {
        group: 'YÃƒâ€“NETÃ„Â°M', items: [
            { key: 'dashboard', label: 'Dashboard', icon: 'Ã°Å¸â€œÅ ' },
            { key: 'users', label: 'KullanÃ„Â±cÃ„Â±lar', icon: 'Ã°Å¸â€˜Â¥' },
            { key: 'blog', label: 'Blog / Duyurular', icon: 'Ã°Å¸â€œÂ' },
            { key: 'settings', label: 'Uygulama AyarlarÃ„Â±', icon: 'Ã¢Å¡â„¢Ã¯Â¸Â' },
        ]
    },
];

const DEFAULTS = {
    hero: { badge: 'Ã°Å¸Å¡â‚¬ Modern Ãƒâ€¡iftlik YÃƒÂ¶netimi', title: 'Ãƒâ€¡iftliÃ„Å¸inizi GeleceÃ„Å¸e TaÃ…Å¸Ã„Â±yÃ„Â±n', subtitle: 'SÃƒÂ¼rÃƒÂ¼ takibi, sÃƒÂ¼t verimi analizi, stok yÃƒÂ¶netimi ve finansal raporlamalar tek bir platformda. VerimliliÃ„Å¸inizi %30 artÃ„Â±rÃ„Â±n.', btnPrimary: 'Hemen BaÃ…Å¸layÃ„Â±n', btnSecondary: 'NasÃ„Â±l Ãƒâ€¡alÃ„Â±Ã…Å¸Ã„Â±r?' },
    stats: [{ value: '500+', label: 'Aktif Ãƒâ€¡iftlik' }, { value: '100k+', label: 'KayÃ„Â±tlÃ„Â± Hayvan' }, { value: '%35', label: 'Ortalama Verim ArtÃ„Â±Ã…Å¸Ã„Â±' }],
    features: [
        { icon: 'Ã°Å¸â€œÅ ', title: 'AkÃ„Â±llÃ„Â± Raporlama', desc: 'KarmaÃ…Å¸Ã„Â±k verileri anlaÃ…Å¸Ã„Â±lÃ„Â±r grafiklere dÃƒÂ¶nÃƒÂ¼Ã…Å¸tÃƒÂ¼rÃƒÂ¼n.' },
        { icon: 'Ã°Å¸â€â€', title: 'AkÃ„Â±llÃ„Â± Bildirimler', desc: 'AÃ…Å¸Ã„Â±, doÃ„Å¸um ve stok uyarÃ„Â±larÃ„Â±nÃ„Â± zamanÃ„Â±nda alÃ„Â±n.' },
        { icon: 'Ã°Å¸ÂÂ¥', title: 'SaÃ„Å¸lÃ„Â±k Takibi', desc: 'Tedavi geÃƒÂ§miÃ…Å¸i, aÃ…Å¸Ã„Â± takvimi ve hastalÃ„Â±k kayÃ„Â±tlarÃ„Â±.' },
        { icon: 'Ã°Å¸Â¥Â¡', title: 'Stok & Yem', desc: 'Yem ve ilaÃƒÂ§ stoklarÃ„Â±nÃ„Â± yÃƒÂ¶netin.' },
    ],
    testimonials: [
        { text: '"Agrolina sayesinde sÃƒÂ¼t verimimizi %25 artÃ„Â±rdÃ„Â±k."', name: 'Ahmet Demir', farm: 'Demir Ãƒâ€¡iftliÃ„Å¸i', size: '50 BaÃ…Å¸', initials: 'AD' },
        { text: '"Bildirim sistemi hayatÃ„Â±mÃ„Â±zÃ„Â± kurtardÃ„Â±."', name: 'Mehmet YÃ„Â±lmaz', farm: 'YÃ„Â±lmaz Besi', size: '120 BaÃ…Å¸', initials: 'MY' },
    ],
    pricing: [
        { name: 'BaÃ…Å¸langÃ„Â±ÃƒÂ§', price: 'Ã¢â€šÂº0', period: '/ay', features: ['10 Hayvana Kadar', 'Temel SÃƒÂ¼rÃƒÂ¼ Takibi', 'SÃƒÂ¼t KaydÃ„Â±'], popular: false, btnText: 'ÃƒÅ“cretsiz BaÃ…Å¸la' },
        { name: 'Profesyonel', price: 'Ã¢â€šÂº499', period: '/ay', features: ['100 Hayvana Kadar', 'TÃƒÂ¼m ModÃƒÂ¼ller Aktif', 'GeliÃ…Å¸miÃ…Å¸ Raporlar'], popular: true, btnText: 'Ã…Å¾imdi YÃƒÂ¼kselt' },
        { name: 'Kurumsal', price: 'Ã¢â€šÂº999', period: '/ay', features: ['SÃ„Â±nÃ„Â±rsÃ„Â±z Hayvan', 'Ãƒâ€¡oklu Ãƒâ€¡iftlik', '7/24 Destek'], popular: false, btnText: 'Ã„Â°letiÃ…Å¸ime GeÃƒÂ§' },
    ],
    appearance: { primaryColor: '#4CAF50', secondaryColor: '#2E7D32', heroBg: 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%)', accentColor: '#81C784' },
    images: { heroImage: '', featuresImage: '', logoUrl: '', ogImage: '' },
    seo: { siteTitle: 'Agrolina - Modern Ãƒâ€¡iftlik YÃƒÂ¶netim Platformu', metaDescription: 'SÃƒÂ¼rÃƒÂ¼ takibi, sÃƒÂ¼t verimi analizi, stok yÃƒÂ¶netimi ve finansal raporlamalar tek bir platformda.', keywords: 'ÃƒÂ§iftlik yÃƒÂ¶netimi, sÃƒÂ¼rÃƒÂ¼ takibi, sÃƒÂ¼t verimi, tarÃ„Â±m yazÃ„Â±lÃ„Â±mÃ„Â±' },
    footer: { companyName: 'Agrolina Teknoloji A.Ã…Å¾.', slogan: 'Modern teknoloji ile geleneksel tarÃ„Â±mÃ„Â± buluÃ…Å¸turuyoruz.', email: 'info@agrolina.com', phone: '', address: '', copyright: 'Ã‚Â© 2026 Agrolina Teknoloji A.Ã…Å¾. TÃƒÂ¼m haklarÃ„Â± saklÃ„Â±dÃ„Â±r.' },
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

        // Ã„Â°ÃƒÂ§erik yÃƒÂ¼kle
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
            toast_('Ã¢Å“â€¦ GiriÃ…Å¸ yapÃ„Â±ldÃ„Â±!');
        } catch (e) {
            setLoginError(e.response?.data?.message || 'E-posta veya Ã…Å¸ifre hatalÃ„Â±');
        } finally { setLoginLoading(false); }
    };

    const doLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        toast_('Ãƒâ€¡Ã„Â±kÃ„Â±Ã…Å¸ yapÃ„Â±ldÃ„Â±');
    };

    const save = async (key) => {
        setSaving(true);
        try { await axios.put(`${API}/api/admin/content/${key}`, { data: content[key] }); toast_('Ã¢Å“â€¦ Kaydedildi!'); }
        catch { toast_('Ã¢ÂÅ’ KayÃ„Â±t baÃ…Å¸arÃ„Â±sÃ„Â±z', true); }
        finally { setSaving(false); }
    };

    const upd = (key, val) => setContent(p => ({ ...p, [key]: val }));
    const updArr = (key, i, patch) => { const a = [...(content[key] || [])]; a[i] = { ...a[i], ...patch }; upd(key, a); };

    if (!content) return (
        <Shell style={{ alignItems: 'center', justifyContent: 'center' }}>
            <GlobalStyle />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <Loader style={{ width: 30, height: 30, borderTopColor: '#4ade80' }} />
                <div style={{ color: '#475569', fontSize: 14 }}>YÃƒÂ¼kleniyor...</div>
            </div>
        </Shell>
    );

    const sel = k => content[k] || DEFAULTS[k];

    return (
        <Shell>
            <GlobalStyle />
            <Sidebar>
                <SidebarBrand>
                    <div className="logo">Ã°Å¸Å’Â± Agro<span>lina</span></div>
                    <div className="sub">Admin Paneli</div>
                </SidebarBrand>

                {/* Hesap alanÃ„Â± - her zaman sidebar ÃƒÂ¼stÃƒÂ¼nde gÃƒÂ¶rÃƒÂ¼nÃƒÂ¼r */}
                {user ? (
                    <UserCard>
                        <div className="name">{user.isim || user.ad || user.name || 'Admin'}</div>
                        <div className="email">{user.email}</div>
                        <div className="row">
                            <button className="app" onClick={() => window.location.href = '/'}>Ã°Å¸ÂÂ  Uygulamaya Git</button>
                            <button className="out" onClick={doLogout}>Ãƒâ€¡Ã„Â±kÃ„Â±Ã…Å¸</button>
                        </div>
                    </UserCard>
                ) : (
                    <LoginBox>
                        <h4>Ã°Å¸â€Â GiriÃ…Å¸ Yap</h4>
                        {loginError && <div className="err">{loginError}</div>}
                        <input
                            type="email" placeholder="E-posta"
                            value={loginForm.email}
                            onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && doLogin()}
                        />
                        <input
                            type="password" placeholder="Ã…Å¾ifre"
                            value={loginForm.sifre}
                            onChange={e => setLoginForm(p => ({ ...p, sifre: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && doLogin()}
                        />
                        <button onClick={doLogin} disabled={loginLoading}>
                            {loginLoading ? 'GiriÃ…Å¸ yapÃ„Â±lÃ„Â±yor...' : 'GiriÃ…Å¸ Yap'}
                        </button>
                    </LoginBox>
                )}

                {/* MenÃƒÂ¼ */}
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

                <SidebarFooter>v2.1 Ã‚Â· Agrolina Admin</SidebarFooter>
            </Sidebar>

            <Main key={active}>

                {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â HERO Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
                {active === 'hero' && <>
                    <PageHeader><span className="emoji">Ã°Å¸Å½Â¯</span><div><h1>Hero BÃƒÂ¶lÃƒÂ¼mÃƒÂ¼</h1><p>ZiyaretÃƒÂ§inin ilk gÃƒÂ¶rdÃƒÂ¼Ã„Å¸ÃƒÂ¼ ana ekran</p></div></PageHeader>
                    <Card>
                        <h3>BaÃ…Å¸lÃ„Â±k & Metin</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>Badge Metni</label><input value={sel('hero').badge} onChange={e => upd('hero', { ...sel('hero'), badge: e.target.value })} /></Field>
                            <Field><label>Ana BaÃ…Å¸lÃ„Â±k</label><input value={sel('hero').title} onChange={e => upd('hero', { ...sel('hero'), title: e.target.value })} /></Field>
                        </Grid>
                        <Grid $mt={11}>
                            <Field><label>Alt BaÃ…Å¸lÃ„Â±k / AÃƒÂ§Ã„Â±klama</label><textarea value={sel('hero').subtitle} onChange={e => upd('hero', { ...sel('hero'), subtitle: e.target.value })} /></Field>
                        </Grid>
                    </Card>
                    <Card>
                        <h3>Butonlar</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>Birincil Buton</label><input value={sel('hero').btnPrimary} onChange={e => upd('hero', { ...sel('hero'), btnPrimary: e.target.value })} /></Field>
                            <Field><label>Ã„Â°kincil Buton</label><input value={sel('hero').btnSecondary} onChange={e => upd('hero', { ...sel('hero'), btnSecondary: e.target.value })} /></Field>
                        </Grid>
                    </Card>
                    <SaveBtn onClick={() => save('hero')} disabled={saving}>{saving ? <Loader /> : 'Ã°Å¸â€™Â¾'} Kaydet</SaveBtn>
                </>}

                {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â STATS Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
                {active === 'stats' && <>
                    <PageHeader><span className="emoji">Ã°Å¸â€œÅ </span><div><h1>Ã„Â°statistikler</h1><p>Hero altÃ„Â±ndaki sayÃ„Â±sal kartlar</p></div></PageHeader>
                    {sel('stats').map((s, i) => (
                        <Card key={i}>
                            <h3>Ã„Â°statistik {i + 1}</h3>
                            <Grid $cols="1fr 1fr">
                                <Field><label>DeÃ„Å¸er (ÃƒÂ¶r: 500+)</label><input value={s.value} onChange={e => updArr('stats', i, { value: e.target.value })} /></Field>
                                <Field><label>AÃƒÂ§Ã„Â±klama</label><input value={s.label} onChange={e => updArr('stats', i, { label: e.target.value })} /></Field>
                            </Grid>
                        </Card>
                    ))}
                    <SaveBtn onClick={() => save('stats')} disabled={saving}>{saving ? <Loader /> : 'Ã°Å¸â€™Â¾'} Kaydet</SaveBtn>
                </>}

                {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â FEATURES Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
                {active === 'features' && <>
                    <PageHeader><span className="emoji">Ã¢Å“Â¨</span><div><h1>Ãƒâ€“zellikler</h1><p>"Neden Agrolina?" kartlarÃ„Â±</p></div></PageHeader>
                    {sel('features').map((f, i) => (
                        <ItemCard key={i}>
                            <DelBtn onClick={() => upd('features', sel('features').filter((_, j) => j !== i))}>Ã°Å¸â€”â€˜ Sil</DelBtn>
                            <Grid $cols="55px 1fr 2fr">
                                <Field><label>Emoji</label><input value={f.icon} onChange={e => updArr('features', i, { icon: e.target.value })} /></Field>
                                <Field><label>BaÃ…Å¸lÃ„Â±k</label><input value={f.title} onChange={e => updArr('features', i, { title: e.target.value })} /></Field>
                                <Field><label>AÃƒÂ§Ã„Â±klama</label><input value={f.desc} onChange={e => updArr('features', i, { desc: e.target.value })} /></Field>
                            </Grid>
                        </ItemCard>
                    ))}
                    <AddBtn onClick={() => upd('features', [...sel('features'), { icon: 'Ã¢Â­Â', title: 'Yeni Ãƒâ€“zellik', desc: 'AÃƒÂ§Ã„Â±klama' }])}>+ Kart Ekle</AddBtn>
                    <SaveBtn onClick={() => save('features')} disabled={saving}>{saving ? <Loader /> : 'Ã°Å¸â€™Â¾'} Kaydet</SaveBtn>
                </>}

                {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â TESTIMONIALS Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
                {active === 'testimonials' && <>
                    <PageHeader><span className="emoji">Ã°Å¸â€™Â¬</span><div><h1>MÃƒÂ¼Ã…Å¸teri YorumlarÃ„Â±</h1><p>Referans ve baÃ…Å¸arÃ„Â± hikayeleri</p></div></PageHeader>
                    {sel('testimonials').map((t, i) => (
                        <ItemCard key={i}>
                            <DelBtn onClick={() => upd('testimonials', sel('testimonials').filter((_, j) => j !== i))}>Ã°Å¸â€”â€˜ Sil</DelBtn>
                            <Grid $cols="1fr 1fr">
                                <Field><label>Ad Soyad</label><input value={t.name} onChange={e => updArr('testimonials', i, { name: e.target.value, initials: e.target.value.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) })} /></Field>
                                <Field><label>Ãƒâ€¡iftlik AdÃ„Â±</label><input value={t.farm} onChange={e => updArr('testimonials', i, { farm: e.target.value })} /></Field>
                            </Grid>
                            <Grid $mt={10}>
                                <Field><label>Yorum Metni</label><textarea value={t.text} onChange={e => updArr('testimonials', i, { text: e.target.value })} /></Field>
                            </Grid>
                            <Grid $cols="1fr 1fr" $mt={10}>
                                <Field><label>Hayvan SayÃ„Â±sÃ„Â± (ÃƒÂ¶r: 80 BaÃ…Å¸)</label><input value={t.size} onChange={e => updArr('testimonials', i, { size: e.target.value })} /></Field>
                            </Grid>
                        </ItemCard>
                    ))}
                    <AddBtn onClick={() => upd('testimonials', [...sel('testimonials'), { text: '"Yorum buraya..."', name: 'Ad Soyad', farm: 'Ãƒâ€¡iftlik AdÃ„Â±', size: '50 BaÃ…Å¸', initials: 'AS' }])}>+ Yorum Ekle</AddBtn>
                    <SaveBtn onClick={() => save('testimonials')} disabled={saving}>{saving ? <Loader /> : 'Ã°Å¸â€™Â¾'} Kaydet</SaveBtn>
                </>}

                {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â PRICING Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
                {active === 'pricing' && <>
                    <PageHeader><span className="emoji">Ã°Å¸â€™Â°</span><div><h1>FiyatlandÃ„Â±rma</h1><p>Abonelik paketleri</p></div></PageHeader>
                    {sel('pricing').map((p, i) => (
                        <ItemCard key={i}>
                            <DelBtn onClick={() => upd('pricing', sel('pricing').filter((_, j) => j !== i))}>Ã°Å¸â€”â€˜ Sil</DelBtn>
                            <Grid $cols="1fr 1fr 1fr">
                                <Field><label>Paket AdÃ„Â±</label><input value={p.name} onChange={e => updArr('pricing', i, { name: e.target.value })} /></Field>
                                <Field><label>Fiyat (ÃƒÂ¶r: Ã¢â€šÂº499)</label><input value={p.price} onChange={e => updArr('pricing', i, { price: e.target.value })} /></Field>
                                <Field><label>DÃƒÂ¶nem (ÃƒÂ¶r: /ay)</label><input value={p.period} onChange={e => updArr('pricing', i, { period: e.target.value })} /></Field>
                            </Grid>
                            <Grid $mt={10}>
                                <Field><label>Ãƒâ€“zellikler Ã¢â‚¬â€ her satÃ„Â±r bir ÃƒÂ¶zellik</label>
                                    <textarea value={(p.features || []).join('\n')} onChange={e => updArr('pricing', i, { features: e.target.value.split('\n') })} style={{ minHeight: 85 }} />
                                </Field>
                            </Grid>
                            <Grid $cols="1fr 1fr" $mt={10}>
                                <Field><label>Buton YazÃ„Â±sÃ„Â±</label><input value={p.btnText} onChange={e => updArr('pricing', i, { btnText: e.target.value })} /></Field>
                                <Field><label>En PopÃƒÂ¼ler Badge</label>
                                    <select value={p.popular ? 'evet' : 'hayir'} onChange={e => updArr('pricing', i, { popular: e.target.value === 'evet' })}>
                                        <option value="hayir">HayÃ„Â±r</option>
                                        <option value="evet">Ã¢Å“â€¦ Evet Ã¢â‚¬â€ "En PopÃƒÂ¼ler"</option>
                                    </select>
                                </Field>
                            </Grid>
                        </ItemCard>
                    ))}
                    <AddBtn onClick={() => upd('pricing', [...sel('pricing'), { name: 'Yeni Paket', price: 'Ã¢â€šÂº0', period: '/ay', features: ['Ãƒâ€“zellik 1'], popular: false, btnText: 'BaÃ…Å¸la' }])}>+ Paket Ekle</AddBtn>
                    <SaveBtn onClick={() => save('pricing')} disabled={saving}>{saving ? <Loader /> : 'Ã°Å¸â€™Â¾'} Kaydet</SaveBtn>
                </>}

                {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â APPEARANCE Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
                {active === 'appearance' && <>
                    <PageHeader><span className="emoji">Ã°Å¸Å½Â¨</span><div><h1>Renkler & Tema</h1><p>Site renk paleti ve gÃƒÂ¶rsel tema</p></div></PageHeader>
                    <Tip>Ã°Å¸â€™Â¡ Renkleri deÃ„Å¸iÃ…Å¸tirdikten sonra kaydet Ã¢â‚¬â€ landing page gÃƒÂ¼ncel renkleri kullanÃ„Â±r.</Tip>
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
                                <label>Ã„Â°kincil Renk</label>
                                <div className="row">
                                    <input type="color" value={sel('appearance').secondaryColor} onChange={e => upd('appearance', { ...sel('appearance'), secondaryColor: e.target.value })} />
                                    <input type="text" value={sel('appearance').secondaryColor} onChange={e => upd('appearance', { ...sel('appearance'), secondaryColor: e.target.value })} />
                                </div>
                            </ColorField>
                        </Grid>
                    </Card>
                    <Card>
                        <h3>Hero Arka PlanÃ„Â± (CSS background deÃ„Å¸eri)</h3>
                        <Field>
                            <label>Gradient veya renk kodu</label>
                            <textarea value={sel('appearance').heroBg} onChange={e => upd('appearance', { ...sel('appearance'), heroBg: e.target.value })} style={{ minHeight: 50, fontFamily: 'monospace', fontSize: 12 }} />
                        </Field>
                        <div style={{ marginTop: 10, height: 56, borderRadius: 8, background: sel('appearance').heroBg }} />
                    </Card>
                    <SaveBtn onClick={() => save('appearance')} disabled={saving}>{saving ? <Loader /> : 'Ã°Å¸â€™Â¾'} Kaydet</SaveBtn>
                </>}

                {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â IMAGES Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
                {active === 'images' && <>
                    <PageHeader><span className="emoji">Ã°Å¸â€“Â¼Ã¯Â¸Â</span><div><h1>GÃƒÂ¶rseller</h1><p>Resim URL'leri Ã¢â‚¬â€ herhangi bir CDN ya da Unsplash linki</p></div></PageHeader>
                    <Tip>Ã°Å¸â€™Â¡ Resim URL olarak Unsplash, ImgBB veya Cloudinary linki kullanabilirsin.</Tip>
                    <Card>
                        <h3>Hero GÃƒÂ¶rseli</h3>
                        <Field><label>Hero Arkaplan Resmi URL</label><input value={sel('images').heroImage} onChange={e => upd('images', { ...sel('images'), heroImage: e.target.value })} placeholder="https://images.unsplash.com/..." /></Field>
                        <ImagePreview>
                            {sel('images').heroImage ? <img src={sel('images').heroImage} alt="Hero" /> : <div className="placeholder">Resim URLsi girilmedi</div>}
                        </ImagePreview>
                    </Card>
                    <Card>
                        <h3>Logo</h3>
                        <Field><label>Logo URL (boÃ…Å¸ Ã¢â€ â€™ varsayÃ„Â±lan)</label><input value={sel('images').logoUrl} onChange={e => upd('images', { ...sel('images'), logoUrl: e.target.value })} placeholder="https://..." /></Field>
                    </Card>
                    <Card>
                        <h3>OG Image (Sosyal medya paylaÃ…Å¸Ã„Â±m gÃƒÂ¶rseli)</h3>
                        <Field><label>OG Image URL (1200Ãƒâ€”630 ÃƒÂ¶nerilir)</label><input value={sel('images').ogImage} onChange={e => upd('images', { ...sel('images'), ogImage: e.target.value })} placeholder="https://..." /></Field>
                        <ImagePreview>
                            {sel('images').ogImage ? <img src={sel('images').ogImage} alt="OG" /> : <div className="placeholder">Sosyal medya gÃƒÂ¶rseli</div>}
                        </ImagePreview>
                    </Card>
                    <SaveBtn onClick={() => save('images')} disabled={saving}>{saving ? <Loader /> : 'Ã°Å¸â€™Â¾'} Kaydet</SaveBtn>
                </>}

                {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â SEO Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
                {active === 'seo' && <>
                    <PageHeader><span className="emoji">Ã°Å¸â€Â</span><div><h1>SEO & Meta Etiketler</h1><p>Google arama sonuÃƒÂ§larÃ„Â± ve ÃƒÂ¶nizleme</p></div></PageHeader>
                    <Card>
                        <h3>Sayfa BaÃ…Å¸lÃ„Â±Ã„Å¸Ã„Â±</h3>
                        <Field><label>Site BaÃ…Å¸lÃ„Â±Ã„Å¸Ã„Â±</label><input value={sel('seo').siteTitle} onChange={e => upd('seo', { ...sel('seo'), siteTitle: e.target.value })} /></Field>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 5 }}>{sel('seo').siteTitle?.length || 0} karakter (ÃƒÂ¶nerilen: 50-60)</div>
                    </Card>
                    <Card>
                        <h3>Meta AÃƒÂ§Ã„Â±klama</h3>
                        <Field><label>AÃƒÂ§Ã„Â±klama (Google'da gÃƒÂ¶rÃƒÂ¼nÃƒÂ¼r)</label>
                            <textarea value={sel('seo').metaDescription} onChange={e => upd('seo', { ...sel('seo'), metaDescription: e.target.value })} />
                        </Field>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 5 }}>{sel('seo').metaDescription?.length || 0} karakter</div>
                    </Card>
                    <Card>
                        <h3>Anahtar Kelimeler</h3>
                        <Field><label>VirgÃƒÂ¼lle ayÃ„Â±r</label><input value={sel('seo').keywords} onChange={e => upd('seo', { ...sel('seo'), keywords: e.target.value })} /></Field>
                    </Card>
                    <SaveBtn onClick={() => save('seo')} disabled={saving}>{saving ? <Loader /> : 'Ã°Å¸â€™Â¾'} Kaydet</SaveBtn>
                </>}

                {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â FOOTER Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
                {active === 'footer' && <>
                    <PageHeader><span className="emoji">Ã°Å¸â€œÂ¬</span><div><h1>Footer & Ã„Â°letiÃ…Å¸im</h1><p>SayfanÃ„Â±n alt kÃ„Â±smÃ„Â±</p></div></PageHeader>
                    <Card>
                        <h3>Ã…Å¾irket Bilgileri</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>Ã…Å¾irket AdÃ„Â±</label><input value={sel('footer').companyName} onChange={e => upd('footer', { ...sel('footer'), companyName: e.target.value })} /></Field>
                            <Field><label>Copyright Metni</label><input value={sel('footer').copyright} onChange={e => upd('footer', { ...sel('footer'), copyright: e.target.value })} /></Field>
                        </Grid>
                        <Grid $mt={11}>
                            <Field><label>Slogan</label><input value={sel('footer').slogan} onChange={e => upd('footer', { ...sel('footer'), slogan: e.target.value })} /></Field>
                        </Grid>
                    </Card>
                    <Card>
                        <h3>Ã„Â°letiÃ…Å¸im</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>E-posta</label><input type="email" value={sel('footer').email} onChange={e => upd('footer', { ...sel('footer'), email: e.target.value })} /></Field>
                            <Field><label>Telefon</label><input value={sel('footer').phone} onChange={e => upd('footer', { ...sel('footer'), phone: e.target.value })} /></Field>
                        </Grid>
                        <Grid $mt={11}>
                            <Field><label>Adres</label><textarea value={sel('footer').address} onChange={e => upd('footer', { ...sel('footer'), address: e.target.value })} style={{ minHeight: 52 }} /></Field>
                        </Grid>
                    </Card>
                    <SaveBtn onClick={() => save('footer')} disabled={saving}>{saving ? <Loader /> : 'Ã°Å¸â€™Â¾'} Kaydet</SaveBtn>
                </>}

                {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â SOCIAL Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
                {active === 'social' && <>
                    <PageHeader><span className="emoji">Ã°Å¸â€œÂ±</span><div><h1>Sosyal Medya</h1><p>Footer'da ikon olarak gÃƒÂ¶rÃƒÂ¼nÃƒÂ¼r</p></div></PageHeader>
                    <Card>
                        <h3>Profil Linkleri</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>Ã°Å¸â€œÂ· Instagram</label><input value={sel('social').instagram} onChange={e => upd('social', { ...sel('social'), instagram: e.target.value })} placeholder="https://instagram.com/..." /></Field>
                            <Field><label>Ã°Å¸â€œËœ Facebook</label><input value={sel('social').facebook} onChange={e => upd('social', { ...sel('social'), facebook: e.target.value })} placeholder="https://facebook.com/..." /></Field>
                            <Field><label>Ã°Å¸â€™Â¼ LinkedIn</label><input value={sel('social').linkedin} onChange={e => upd('social', { ...sel('social'), linkedin: e.target.value })} placeholder="https://linkedin.com/..." /></Field>
                            <Field><label>Ã°Å¸ÂÂ¦ Twitter / X</label><input value={sel('social').twitter} onChange={e => upd('social', { ...sel('social'), twitter: e.target.value })} placeholder="https://twitter.com/..." /></Field>
                            <Field><label>Ã¢â€“Â¶Ã¯Â¸Â YouTube</label><input value={sel('social').youtube} onChange={e => upd('social', { ...sel('social'), youtube: e.target.value })} placeholder="https://youtube.com/..." /></Field>
                        </Grid>
                    </Card>
                    <SaveBtn onClick={() => save('social')} disabled={saving}>{saving ? <Loader /> : 'Ã°Å¸â€™Â¾'} Kaydet</SaveBtn>
                </>}

                {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â LOGIN Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
                {active === 'login' && <>
                    <PageHeader><span className="emoji">Ã°Å¸â€Â</span><div><h1>GiriÃ…Å¸ / Hesap</h1><p>Uygulamaya giriÃ…Å¸ yapÃ„Â±n</p></div></PageHeader>
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
                                    Ã°Å¸ÂÂ  Uygulamaya Git
                                </SaveBtn>
                                <SaveBtn onClick={doLogout} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 18px rgba(239,68,68,0.22)', marginTop: 18 }}>
                                    Ãƒâ€¡Ã„Â±kÃ„Â±Ã…Å¸ Yap
                                </SaveBtn>
                            </div>
                        </Card>
                    ) : (
                        <Card>
                            <h3>GiriÃ…Å¸ Yap</h3>
                            {loginError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 14 }}>{loginError}</div>}
                            <Grid>
                                <Field><label>E-posta</label>
                                    <input type="email" value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} onKeyDown={e => e.key === 'Enter' && doLogin()} placeholder="kullanici@email.com" />
                                </Field>
                                <Field><label>Ã…Å¾ifre</label>
                                    <input type="password" value={loginForm.sifre} onChange={e => setLoginForm(p => ({ ...p, sifre: e.target.value }))} onKeyDown={e => e.key === 'Enter' && doLogin()} placeholder="Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢" />
                                </Field>
                            </Grid>
                            <SaveBtn onClick={doLogin} disabled={loginLoading}>{loginLoading ? <Loader /> : 'Ã°Å¸â€Â'} {loginLoading ? 'GiriÃ…Å¸ yapÃ„Â±lÃ„Â±yor...' : 'GiriÃ…Å¸ Yap'}</SaveBtn>
                        </Card>
                    )}
                </>}

                {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â DASHBOARD Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
                {active === 'dashboard' && <DashboardSection API={API} toast_={toast_} />}

                {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â USERS Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
                {active === 'users' && <UsersSection API={API} toast_={toast_} />}

                {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â BLOG Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
                {active === 'blog' && <BlogSection API={API} toast_={toast_} />}

                {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â SETTINGS Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
                {active === 'settings' && <SettingsSection API={API} toast_={toast_} />}

            </Main>

            {toast && <Toast $error={toast.error}>{toast.msg}</Toast>}
        </Shell>
    );
}

