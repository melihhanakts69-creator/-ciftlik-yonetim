»¿Ã¯Â»Â¿import { DashboardSection, UsersSection, BlogSection, SettingsSection } from './AdminSections';
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

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ SECTIONS ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
const SECTIONS = [
    {
        group: 'Ãƒâ€žÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¡ERÃƒâ€žÃ‚Â°K', items: [
            { key: 'hero', label: 'Hero BÃƒÆ’Ã‚Â¶lÃƒÆ’Ã‚Â¼mÃƒÆ’Ã‚Â¼', icon: 'ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¯' },
            { key: 'stats', label: 'Ãƒâ€žÃ‚Â°statistikler', icon: 'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â ' },
            { key: 'features', label: 'ÃƒÆ’Ã¢â‚¬â€œzellikler', icon: 'ÃƒÂ¢Ã…â€œÃ‚Â¨' },
            { key: 'testimonials', label: 'Yorumlar', icon: 'ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¬' },
            { key: 'pricing', label: 'Fiyatlar', icon: 'ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â°' },
        ]
    },
    {
        group: 'GÃƒÆ’Ã¢â‚¬â€œRÃƒÆ’Ã…â€œNÃƒÆ’Ã…â€œM', items: [
            { key: 'appearance', label: 'Renkler & Tema', icon: 'ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¨' },
            { key: 'images', label: 'GÃƒÆ’Ã‚Â¶rseller', icon: 'ÃƒÂ°Ã…Â¸Ã¢â‚¬â€œÃ‚Â¼ÃƒÂ¯Ã‚Â¸Ã‚Â' },
        ]
    },
    {
        group: 'SÃƒâ€žÃ‚Â°TE', items: [
            { key: 'seo', label: 'SEO & Meta', icon: 'ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â' },
            { key: 'footer', label: 'Footer & Ãƒâ€žÃ‚Â°letiÃƒâ€¦Ã…Â¸im', icon: 'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¬' },
            { key: 'social', label: 'Sosyal Medya', icon: 'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â±' },
        ]
    },
    {
        group: 'HESAP', items: [
            { key: 'login', label: 'GiriÃƒâ€¦Ã…Â¸ / Hesap', icon: 'ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â' },
        ]
    },
    {
        group: 'YÃƒÆ’Ã¢â‚¬â€œNETÃƒâ€žÃ‚Â°M', items: [
            { key: 'dashboard', label: 'Dashboard', icon: 'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â ' },
            { key: 'users', label: 'KullanÃƒâ€žÃ‚Â±cÃƒâ€žÃ‚Â±lar', icon: 'ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¥' },
            { key: 'blog', label: 'Blog / Duyurular', icon: 'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â' },
            { key: 'settings', label: 'Uygulama AyarlarÃƒâ€žÃ‚Â±', icon: 'ÃƒÂ¢Ã…Â¡Ã¢â€žÂ¢ÃƒÂ¯Ã‚Â¸Ã‚Â' },
        ]
    },
];

const DEFAULTS = {
    hero: { badge: 'ÃƒÂ°Ã…Â¸Ã…Â¡Ã¢â€šÂ¬ Modern ÃƒÆ’Ã¢â‚¬Â¡iftlik YÃƒÆ’Ã‚Â¶netimi', title: 'ÃƒÆ’Ã¢â‚¬Â¡iftliÃƒâ€žÃ…Â¸inizi GeleceÃƒâ€žÃ…Â¸e TaÃƒâ€¦Ã…Â¸Ãƒâ€žÃ‚Â±yÃƒâ€žÃ‚Â±n', subtitle: 'SÃƒÆ’Ã‚Â¼rÃƒÆ’Ã‚Â¼ takibi, sÃƒÆ’Ã‚Â¼t verimi analizi, stok yÃƒÆ’Ã‚Â¶netimi ve finansal raporlamalar tek bir platformda. VerimliliÃƒâ€žÃ…Â¸inizi %30 artÃƒâ€žÃ‚Â±rÃƒâ€žÃ‚Â±n.', btnPrimary: 'Hemen BaÃƒâ€¦Ã…Â¸layÃƒâ€žÃ‚Â±n', btnSecondary: 'NasÃƒâ€žÃ‚Â±l ÃƒÆ’Ã¢â‚¬Â¡alÃƒâ€žÃ‚Â±Ãƒâ€¦Ã…Â¸Ãƒâ€žÃ‚Â±r?' },
    stats: [{ value: '500+', label: 'Aktif ÃƒÆ’Ã¢â‚¬Â¡iftlik' }, { value: '100k+', label: 'KayÃƒâ€žÃ‚Â±tlÃƒâ€žÃ‚Â± Hayvan' }, { value: '%35', label: 'Ortalama Verim ArtÃƒâ€žÃ‚Â±Ãƒâ€¦Ã…Â¸Ãƒâ€žÃ‚Â±' }],
    features: [
        { icon: 'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â ', title: 'AkÃƒâ€žÃ‚Â±llÃƒâ€žÃ‚Â± Raporlama', desc: 'KarmaÃƒâ€¦Ã…Â¸Ãƒâ€žÃ‚Â±k verileri anlaÃƒâ€¦Ã…Â¸Ãƒâ€žÃ‚Â±lÃƒâ€žÃ‚Â±r grafiklere dÃƒÆ’Ã‚Â¶nÃƒÆ’Ã‚Â¼Ãƒâ€¦Ã…Â¸tÃƒÆ’Ã‚Â¼rÃƒÆ’Ã‚Â¼n.' },
        { icon: 'ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Â', title: 'AkÃƒâ€žÃ‚Â±llÃƒâ€žÃ‚Â± Bildirimler', desc: 'AÃƒâ€¦Ã…Â¸Ãƒâ€žÃ‚Â±, doÃƒâ€žÃ…Â¸um ve stok uyarÃƒâ€žÃ‚Â±larÃƒâ€žÃ‚Â±nÃƒâ€žÃ‚Â± zamanÃƒâ€žÃ‚Â±nda alÃƒâ€žÃ‚Â±n.' },
        { icon: 'ÃƒÂ°Ã…Â¸Ã‚ÂÃ‚Â¥', title: 'SaÃƒâ€žÃ…Â¸lÃƒâ€žÃ‚Â±k Takibi', desc: 'Tedavi geÃƒÆ’Ã‚Â§miÃƒâ€¦Ã…Â¸i, aÃƒâ€¦Ã…Â¸Ãƒâ€žÃ‚Â± takvimi ve hastalÃƒâ€žÃ‚Â±k kayÃƒâ€žÃ‚Â±tlarÃƒâ€žÃ‚Â±.' },
        { icon: 'ÃƒÂ°Ã…Â¸Ã‚Â¥Ã‚Â¡', title: 'Stok & Yem', desc: 'Yem ve ilaÃƒÆ’Ã‚Â§ stoklarÃƒâ€žÃ‚Â±nÃƒâ€žÃ‚Â± yÃƒÆ’Ã‚Â¶netin.' },
    ],
    testimonials: [
        { text: '"Agrolina sayesinde sÃƒÆ’Ã‚Â¼t verimimizi %25 artÃƒâ€žÃ‚Â±rdÃƒâ€žÃ‚Â±k."', name: 'Ahmet Demir', farm: 'Demir ÃƒÆ’Ã¢â‚¬Â¡iftliÃƒâ€žÃ…Â¸i', size: '50 BaÃƒâ€¦Ã…Â¸', initials: 'AD' },
        { text: '"Bildirim sistemi hayatÃƒâ€žÃ‚Â±mÃƒâ€žÃ‚Â±zÃƒâ€žÃ‚Â± kurtardÃƒâ€žÃ‚Â±."', name: 'Mehmet YÃƒâ€žÃ‚Â±lmaz', farm: 'YÃƒâ€žÃ‚Â±lmaz Besi', size: '120 BaÃƒâ€¦Ã…Â¸', initials: 'MY' },
    ],
    pricing: [
        { name: 'BaÃƒâ€¦Ã…Â¸langÃƒâ€žÃ‚Â±ÃƒÆ’Ã‚Â§', price: 'ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Âº0', period: '/ay', features: ['10 Hayvana Kadar', 'Temel SÃƒÆ’Ã‚Â¼rÃƒÆ’Ã‚Â¼ Takibi', 'SÃƒÆ’Ã‚Â¼t KaydÃƒâ€žÃ‚Â±'], popular: false, btnText: 'ÃƒÆ’Ã…â€œcretsiz BaÃƒâ€¦Ã…Â¸la' },
        { name: 'Profesyonel', price: 'ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Âº499', period: '/ay', features: ['100 Hayvana Kadar', 'TÃƒÆ’Ã‚Â¼m ModÃƒÆ’Ã‚Â¼ller Aktif', 'GeliÃƒâ€¦Ã…Â¸miÃƒâ€¦Ã…Â¸ Raporlar'], popular: true, btnText: 'Ãƒâ€¦Ã…Â¾imdi YÃƒÆ’Ã‚Â¼kselt' },
        { name: 'Kurumsal', price: 'ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Âº999', period: '/ay', features: ['SÃƒâ€žÃ‚Â±nÃƒâ€žÃ‚Â±rsÃƒâ€žÃ‚Â±z Hayvan', 'ÃƒÆ’Ã¢â‚¬Â¡oklu ÃƒÆ’Ã¢â‚¬Â¡iftlik', '7/24 Destek'], popular: false, btnText: 'Ãƒâ€žÃ‚Â°letiÃƒâ€¦Ã…Â¸ime GeÃƒÆ’Ã‚Â§' },
    ],
    appearance: { primaryColor: '#4CAF50', secondaryColor: '#2E7D32', heroBg: 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%)', accentColor: '#81C784' },
    images: { heroImage: '', featuresImage: '', logoUrl: '', ogImage: '' },
    seo: { siteTitle: 'Agrolina - Modern ÃƒÆ’Ã¢â‚¬Â¡iftlik YÃƒÆ’Ã‚Â¶netim Platformu', metaDescription: 'SÃƒÆ’Ã‚Â¼rÃƒÆ’Ã‚Â¼ takibi, sÃƒÆ’Ã‚Â¼t verimi analizi, stok yÃƒÆ’Ã‚Â¶netimi ve finansal raporlamalar tek bir platformda.', keywords: 'ÃƒÆ’Ã‚Â§iftlik yÃƒÆ’Ã‚Â¶netimi, sÃƒÆ’Ã‚Â¼rÃƒÆ’Ã‚Â¼ takibi, sÃƒÆ’Ã‚Â¼t verimi, tarÃƒâ€žÃ‚Â±m yazÃƒâ€žÃ‚Â±lÃƒâ€žÃ‚Â±mÃƒâ€žÃ‚Â±' },
    footer: { companyName: 'Agrolina Teknoloji A.Ãƒâ€¦Ã…Â¾.', slogan: 'Modern teknoloji ile geleneksel tarÃƒâ€žÃ‚Â±mÃƒâ€žÃ‚Â± buluÃƒâ€¦Ã…Â¸turuyoruz.', email: 'info@agrolina.com', phone: '', address: '', copyright: 'Ãƒâ€šÃ‚Â© 2026 Agrolina Teknoloji A.Ãƒâ€¦Ã…Â¾. TÃƒÆ’Ã‚Â¼m haklarÃƒâ€žÃ‚Â± saklÃƒâ€žÃ‚Â±dÃƒâ€žÃ‚Â±r.' },
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

        // Ãƒâ€žÃ‚Â°ÃƒÆ’Ã‚Â§erik yÃƒÆ’Ã‚Â¼kle
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
            toast_('ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ GiriÃƒâ€¦Ã…Â¸ yapÃƒâ€žÃ‚Â±ldÃƒâ€žÃ‚Â±!');
        } catch (e) {
            setLoginError(e.response?.data?.message || 'E-posta veya Ãƒâ€¦Ã…Â¸ifre hatalÃƒâ€žÃ‚Â±');
        } finally { setLoginLoading(false); }
    };

    const doLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        toast_('ÃƒÆ’Ã¢â‚¬Â¡Ãƒâ€žÃ‚Â±kÃƒâ€žÃ‚Â±Ãƒâ€¦Ã…Â¸ yapÃƒâ€žÃ‚Â±ldÃƒâ€žÃ‚Â±');
    };

    const save = async (key) => {
        setSaving(true);
        try { await axios.put(`${API}/api/admin/content/${key}`, { data: content[key] }); toast_('ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Kaydedildi!'); }
        catch { toast_('ÃƒÂ¢Ã‚ÂÃ…â€™ KayÃƒâ€žÃ‚Â±t baÃƒâ€¦Ã…Â¸arÃƒâ€žÃ‚Â±sÃƒâ€žÃ‚Â±z', true); }
        finally { setSaving(false); }
    };

    const upd = (key, val) => setContent(p => ({ ...p, [key]: val }));
    const updArr = (key, i, patch) => { const a = [...(content[key] || [])]; a[i] = { ...a[i], ...patch }; upd(key, a); };

    if (!content) return (
        <Shell style={{ alignItems: 'center', justifyContent: 'center' }}>
            <GlobalStyle />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <Loader style={{ width: 30, height: 30, borderTopColor: '#4ade80' }} />
                <div style={{ color: '#475569', fontSize: 14 }}>YÃƒÆ’Ã‚Â¼kleniyor...</div>
            </div>
        </Shell>
    );

    const sel = k => content[k] || DEFAULTS[k];

    return (
        <Shell>
            <GlobalStyle />
            <Sidebar>
                <SidebarBrand>
                    <div className="logo">ÃƒÂ°Ã…Â¸Ã…â€™Ã‚Â± Agro<span>lina</span></div>
                    <div className="sub">Admin Paneli</div>
                </SidebarBrand>

                {/* Hesap alanÃƒâ€žÃ‚Â± - her zaman sidebar ÃƒÆ’Ã‚Â¼stÃƒÆ’Ã‚Â¼nde gÃƒÆ’Ã‚Â¶rÃƒÆ’Ã‚Â¼nÃƒÆ’Ã‚Â¼r */}
                {user ? (
                    <UserCard>
                        <div className="name">{user.isim || user.ad || user.name || 'Admin'}</div>
                        <div className="email">{user.email}</div>
                        <div className="row">
                            <button className="app" onClick={() => window.location.href = '/'}>ÃƒÂ°Ã…Â¸Ã‚ÂÃ‚Â  Uygulamaya Git</button>
                            <button className="out" onClick={doLogout}>ÃƒÆ’Ã¢â‚¬Â¡Ãƒâ€žÃ‚Â±kÃƒâ€žÃ‚Â±Ãƒâ€¦Ã…Â¸</button>
                        </div>
                    </UserCard>
                ) : (
                    <LoginBox>
                        <h4>ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â GiriÃƒâ€¦Ã…Â¸ Yap</h4>
                        {loginError && <div className="err">{loginError}</div>}
                        <input
                            type="email" placeholder="E-posta"
                            value={loginForm.email}
                            onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && doLogin()}
                        />
                        <input
                            type="password" placeholder="Ãƒâ€¦Ã…Â¾ifre"
                            value={loginForm.sifre}
                            onChange={e => setLoginForm(p => ({ ...p, sifre: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && doLogin()}
                        />
                        <button onClick={doLogin} disabled={loginLoading}>
                            {loginLoading ? 'GiriÃƒâ€¦Ã…Â¸ yapÃƒâ€žÃ‚Â±lÃƒâ€žÃ‚Â±yor...' : 'GiriÃƒâ€¦Ã…Â¸ Yap'}
                        </button>
                    </LoginBox>
                )}

                {/* MenÃƒÆ’Ã‚Â¼ */}
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

                <SidebarFooter>v2.1 Ãƒâ€šÃ‚Â· Agrolina Admin</SidebarFooter>
            </Sidebar>

            <Main key={active}>

                {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â HERO ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
                {active === 'hero' && <>
                    <PageHeader><span className="emoji">ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¯</span><div><h1>Hero BÃƒÆ’Ã‚Â¶lÃƒÆ’Ã‚Â¼mÃƒÆ’Ã‚Â¼</h1><p>ZiyaretÃƒÆ’Ã‚Â§inin ilk gÃƒÆ’Ã‚Â¶rdÃƒÆ’Ã‚Â¼Ãƒâ€žÃ…Â¸ÃƒÆ’Ã‚Â¼ ana ekran</p></div></PageHeader>
                    <Card>
                        <h3>BaÃƒâ€¦Ã…Â¸lÃƒâ€žÃ‚Â±k & Metin</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>Badge Metni</label><input value={sel('hero').badge} onChange={e => upd('hero', { ...sel('hero'), badge: e.target.value })} /></Field>
                            <Field><label>Ana BaÃƒâ€¦Ã…Â¸lÃƒâ€žÃ‚Â±k</label><input value={sel('hero').title} onChange={e => upd('hero', { ...sel('hero'), title: e.target.value })} /></Field>
                        </Grid>
                        <Grid $mt={11}>
                            <Field><label>Alt BaÃƒâ€¦Ã…Â¸lÃƒâ€žÃ‚Â±k / AÃƒÆ’Ã‚Â§Ãƒâ€žÃ‚Â±klama</label><textarea value={sel('hero').subtitle} onChange={e => upd('hero', { ...sel('hero'), subtitle: e.target.value })} /></Field>
                        </Grid>
                    </Card>
                    <Card>
                        <h3>Butonlar</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>Birincil Buton</label><input value={sel('hero').btnPrimary} onChange={e => upd('hero', { ...sel('hero'), btnPrimary: e.target.value })} /></Field>
                            <Field><label>Ãƒâ€žÃ‚Â°kincil Buton</label><input value={sel('hero').btnSecondary} onChange={e => upd('hero', { ...sel('hero'), btnSecondary: e.target.value })} /></Field>
                        </Grid>
                    </Card>
                    <SaveBtn onClick={() => save('hero')} disabled={saving}>{saving ? <Loader /> : 'ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¾'} Kaydet</SaveBtn>
                </>}

                {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â STATS ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
                {active === 'stats' && <>
                    <PageHeader><span className="emoji">ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â </span><div><h1>Ãƒâ€žÃ‚Â°statistikler</h1><p>Hero altÃƒâ€žÃ‚Â±ndaki sayÃƒâ€žÃ‚Â±sal kartlar</p></div></PageHeader>
                    {sel('stats').map((s, i) => (
                        <Card key={i}>
                            <h3>Ãƒâ€žÃ‚Â°statistik {i + 1}</h3>
                            <Grid $cols="1fr 1fr">
                                <Field><label>DeÃƒâ€žÃ…Â¸er (ÃƒÆ’Ã‚Â¶r: 500+)</label><input value={s.value} onChange={e => updArr('stats', i, { value: e.target.value })} /></Field>
                                <Field><label>AÃƒÆ’Ã‚Â§Ãƒâ€žÃ‚Â±klama</label><input value={s.label} onChange={e => updArr('stats', i, { label: e.target.value })} /></Field>
                            </Grid>
                        </Card>
                    ))}
                    <SaveBtn onClick={() => save('stats')} disabled={saving}>{saving ? <Loader /> : 'ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¾'} Kaydet</SaveBtn>
                </>}

                {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â FEATURES ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
                {active === 'features' && <>
                    <PageHeader><span className="emoji">ÃƒÂ¢Ã…â€œÃ‚Â¨</span><div><h1>ÃƒÆ’Ã¢â‚¬â€œzellikler</h1><p>"Neden Agrolina?" kartlarÃƒâ€žÃ‚Â±</p></div></PageHeader>
                    {sel('features').map((f, i) => (
                        <ItemCard key={i}>
                            <DelBtn onClick={() => upd('features', sel('features').filter((_, j) => j !== i))}>ÃƒÂ°Ã…Â¸Ã¢â‚¬â€Ã¢â‚¬Ëœ Sil</DelBtn>
                            <Grid $cols="55px 1fr 2fr">
                                <Field><label>Emoji</label><input value={f.icon} onChange={e => updArr('features', i, { icon: e.target.value })} /></Field>
                                <Field><label>BaÃƒâ€¦Ã…Â¸lÃƒâ€žÃ‚Â±k</label><input value={f.title} onChange={e => updArr('features', i, { title: e.target.value })} /></Field>
                                <Field><label>AÃƒÆ’Ã‚Â§Ãƒâ€žÃ‚Â±klama</label><input value={f.desc} onChange={e => updArr('features', i, { desc: e.target.value })} /></Field>
                            </Grid>
                        </ItemCard>
                    ))}
                    <AddBtn onClick={() => upd('features', [...sel('features'), { icon: 'ÃƒÂ¢Ã‚Â­Ã‚Â', title: 'Yeni ÃƒÆ’Ã¢â‚¬â€œzellik', desc: 'AÃƒÆ’Ã‚Â§Ãƒâ€žÃ‚Â±klama' }])}>+ Kart Ekle</AddBtn>
                    <SaveBtn onClick={() => save('features')} disabled={saving}>{saving ? <Loader /> : 'ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¾'} Kaydet</SaveBtn>
                </>}

                {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â TESTIMONIALS ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
                {active === 'testimonials' && <>
                    <PageHeader><span className="emoji">ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¬</span><div><h1>MÃƒÆ’Ã‚Â¼Ãƒâ€¦Ã…Â¸teri YorumlarÃƒâ€žÃ‚Â±</h1><p>Referans ve baÃƒâ€¦Ã…Â¸arÃƒâ€žÃ‚Â± hikayeleri</p></div></PageHeader>
                    {sel('testimonials').map((t, i) => (
                        <ItemCard key={i}>
                            <DelBtn onClick={() => upd('testimonials', sel('testimonials').filter((_, j) => j !== i))}>ÃƒÂ°Ã…Â¸Ã¢â‚¬â€Ã¢â‚¬Ëœ Sil</DelBtn>
                            <Grid $cols="1fr 1fr">
                                <Field><label>Ad Soyad</label><input value={t.name} onChange={e => updArr('testimonials', i, { name: e.target.value, initials: e.target.value.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) })} /></Field>
                                <Field><label>ÃƒÆ’Ã¢â‚¬Â¡iftlik AdÃƒâ€žÃ‚Â±</label><input value={t.farm} onChange={e => updArr('testimonials', i, { farm: e.target.value })} /></Field>
                            </Grid>
                            <Grid $mt={10}>
                                <Field><label>Yorum Metni</label><textarea value={t.text} onChange={e => updArr('testimonials', i, { text: e.target.value })} /></Field>
                            </Grid>
                            <Grid $cols="1fr 1fr" $mt={10}>
                                <Field><label>Hayvan SayÃƒâ€žÃ‚Â±sÃƒâ€žÃ‚Â± (ÃƒÆ’Ã‚Â¶r: 80 BaÃƒâ€¦Ã…Â¸)</label><input value={t.size} onChange={e => updArr('testimonials', i, { size: e.target.value })} /></Field>
                            </Grid>
                        </ItemCard>
                    ))}
                    <AddBtn onClick={() => upd('testimonials', [...sel('testimonials'), { text: '"Yorum buraya..."', name: 'Ad Soyad', farm: 'ÃƒÆ’Ã¢â‚¬Â¡iftlik AdÃƒâ€žÃ‚Â±', size: '50 BaÃƒâ€¦Ã…Â¸', initials: 'AS' }])}>+ Yorum Ekle</AddBtn>
                    <SaveBtn onClick={() => save('testimonials')} disabled={saving}>{saving ? <Loader /> : 'ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¾'} Kaydet</SaveBtn>
                </>}

                {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â PRICING ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
                {active === 'pricing' && <>
                    <PageHeader><span className="emoji">ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â°</span><div><h1>FiyatlandÃƒâ€žÃ‚Â±rma</h1><p>Abonelik paketleri</p></div></PageHeader>
                    {sel('pricing').map((p, i) => (
                        <ItemCard key={i}>
                            <DelBtn onClick={() => upd('pricing', sel('pricing').filter((_, j) => j !== i))}>ÃƒÂ°Ã…Â¸Ã¢â‚¬â€Ã¢â‚¬Ëœ Sil</DelBtn>
                            <Grid $cols="1fr 1fr 1fr">
                                <Field><label>Paket AdÃƒâ€žÃ‚Â±</label><input value={p.name} onChange={e => updArr('pricing', i, { name: e.target.value })} /></Field>
                                <Field><label>Fiyat (ÃƒÆ’Ã‚Â¶r: ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Âº499)</label><input value={p.price} onChange={e => updArr('pricing', i, { price: e.target.value })} /></Field>
                                <Field><label>DÃƒÆ’Ã‚Â¶nem (ÃƒÆ’Ã‚Â¶r: /ay)</label><input value={p.period} onChange={e => updArr('pricing', i, { period: e.target.value })} /></Field>
                            </Grid>
                            <Grid $mt={10}>
                                <Field><label>ÃƒÆ’Ã¢â‚¬â€œzellikler ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â her satÃƒâ€žÃ‚Â±r bir ÃƒÆ’Ã‚Â¶zellik</label>
                                    <textarea value={(p.features || []).join('\n')} onChange={e => updArr('pricing', i, { features: e.target.value.split('\n') })} style={{ minHeight: 85 }} />
                                </Field>
                            </Grid>
                            <Grid $cols="1fr 1fr" $mt={10}>
                                <Field><label>Buton YazÃƒâ€žÃ‚Â±sÃƒâ€žÃ‚Â±</label><input value={p.btnText} onChange={e => updArr('pricing', i, { btnText: e.target.value })} /></Field>
                                <Field><label>En PopÃƒÆ’Ã‚Â¼ler Badge</label>
                                    <select value={p.popular ? 'evet' : 'hayir'} onChange={e => updArr('pricing', i, { popular: e.target.value === 'evet' })}>
                                        <option value="hayir">HayÃƒâ€žÃ‚Â±r</option>
                                        <option value="evet">ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Evet ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â "En PopÃƒÆ’Ã‚Â¼ler"</option>
                                    </select>
                                </Field>
                            </Grid>
                        </ItemCard>
                    ))}
                    <AddBtn onClick={() => upd('pricing', [...sel('pricing'), { name: 'Yeni Paket', price: 'ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Âº0', period: '/ay', features: ['ÃƒÆ’Ã¢â‚¬â€œzellik 1'], popular: false, btnText: 'BaÃƒâ€¦Ã…Â¸la' }])}>+ Paket Ekle</AddBtn>
                    <SaveBtn onClick={() => save('pricing')} disabled={saving}>{saving ? <Loader /> : 'ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¾'} Kaydet</SaveBtn>
                </>}

                {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â APPEARANCE ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
                {active === 'appearance' && <>
                    <PageHeader><span className="emoji">ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¨</span><div><h1>Renkler & Tema</h1><p>Site renk paleti ve gÃƒÆ’Ã‚Â¶rsel tema</p></div></PageHeader>
                    <Tip>ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¡ Renkleri deÃƒâ€žÃ…Â¸iÃƒâ€¦Ã…Â¸tirdikten sonra kaydet ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â landing page gÃƒÆ’Ã‚Â¼ncel renkleri kullanÃƒâ€žÃ‚Â±r.</Tip>
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
                                <label>Ãƒâ€žÃ‚Â°kincil Renk</label>
                                <div className="row">
                                    <input type="color" value={sel('appearance').secondaryColor} onChange={e => upd('appearance', { ...sel('appearance'), secondaryColor: e.target.value })} />
                                    <input type="text" value={sel('appearance').secondaryColor} onChange={e => upd('appearance', { ...sel('appearance'), secondaryColor: e.target.value })} />
                                </div>
                            </ColorField>
                        </Grid>
                    </Card>
                    <Card>
                        <h3>Hero Arka PlanÃƒâ€žÃ‚Â± (CSS background deÃƒâ€žÃ…Â¸eri)</h3>
                        <Field>
                            <label>Gradient veya renk kodu</label>
                            <textarea value={sel('appearance').heroBg} onChange={e => upd('appearance', { ...sel('appearance'), heroBg: e.target.value })} style={{ minHeight: 50, fontFamily: 'monospace', fontSize: 12 }} />
                        </Field>
                        <div style={{ marginTop: 10, height: 56, borderRadius: 8, background: sel('appearance').heroBg }} />
                    </Card>
                    <SaveBtn onClick={() => save('appearance')} disabled={saving}>{saving ? <Loader /> : 'ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¾'} Kaydet</SaveBtn>
                </>}

                {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â IMAGES ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
                {active === 'images' && <>
                    <PageHeader><span className="emoji">ÃƒÂ°Ã…Â¸Ã¢â‚¬â€œÃ‚Â¼ÃƒÂ¯Ã‚Â¸Ã‚Â</span><div><h1>GÃƒÆ’Ã‚Â¶rseller</h1><p>Resim URL'leri ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â herhangi bir CDN ya da Unsplash linki</p></div></PageHeader>
                    <Tip>ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¡ Resim URL olarak Unsplash, ImgBB veya Cloudinary linki kullanabilirsin.</Tip>
                    <Card>
                        <h3>Hero GÃƒÆ’Ã‚Â¶rseli</h3>
                        <Field><label>Hero Arkaplan Resmi URL</label><input value={sel('images').heroImage} onChange={e => upd('images', { ...sel('images'), heroImage: e.target.value })} placeholder="https://images.unsplash.com/..." /></Field>
                        <ImagePreview>
                            {sel('images').heroImage ? <img src={sel('images').heroImage} alt="Hero" /> : <div className="placeholder">Resim URLsi girilmedi</div>}
                        </ImagePreview>
                    </Card>
                    <Card>
                        <h3>Logo</h3>
                        <Field><label>Logo URL (boÃƒâ€¦Ã…Â¸ ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ varsayÃƒâ€žÃ‚Â±lan)</label><input value={sel('images').logoUrl} onChange={e => upd('images', { ...sel('images'), logoUrl: e.target.value })} placeholder="https://..." /></Field>
                    </Card>
                    <Card>
                        <h3>OG Image (Sosyal medya paylaÃƒâ€¦Ã…Â¸Ãƒâ€žÃ‚Â±m gÃƒÆ’Ã‚Â¶rseli)</h3>
                        <Field><label>OG Image URL (1200ÃƒÆ’Ã¢â‚¬â€630 ÃƒÆ’Ã‚Â¶nerilir)</label><input value={sel('images').ogImage} onChange={e => upd('images', { ...sel('images'), ogImage: e.target.value })} placeholder="https://..." /></Field>
                        <ImagePreview>
                            {sel('images').ogImage ? <img src={sel('images').ogImage} alt="OG" /> : <div className="placeholder">Sosyal medya gÃƒÆ’Ã‚Â¶rseli</div>}
                        </ImagePreview>
                    </Card>
                    <SaveBtn onClick={() => save('images')} disabled={saving}>{saving ? <Loader /> : 'ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¾'} Kaydet</SaveBtn>
                </>}

                {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â SEO ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
                {active === 'seo' && <>
                    <PageHeader><span className="emoji">ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â</span><div><h1>SEO & Meta Etiketler</h1><p>Google arama sonuÃƒÆ’Ã‚Â§larÃƒâ€žÃ‚Â± ve ÃƒÆ’Ã‚Â¶nizleme</p></div></PageHeader>
                    <Card>
                        <h3>Sayfa BaÃƒâ€¦Ã…Â¸lÃƒâ€žÃ‚Â±Ãƒâ€žÃ…Â¸Ãƒâ€žÃ‚Â±</h3>
                        <Field><label>Site BaÃƒâ€¦Ã…Â¸lÃƒâ€žÃ‚Â±Ãƒâ€žÃ…Â¸Ãƒâ€žÃ‚Â±</label><input value={sel('seo').siteTitle} onChange={e => upd('seo', { ...sel('seo'), siteTitle: e.target.value })} /></Field>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 5 }}>{sel('seo').siteTitle?.length || 0} karakter (ÃƒÆ’Ã‚Â¶nerilen: 50-60)</div>
                    </Card>
                    <Card>
                        <h3>Meta AÃƒÆ’Ã‚Â§Ãƒâ€žÃ‚Â±klama</h3>
                        <Field><label>AÃƒÆ’Ã‚Â§Ãƒâ€žÃ‚Â±klama (Google'da gÃƒÆ’Ã‚Â¶rÃƒÆ’Ã‚Â¼nÃƒÆ’Ã‚Â¼r)</label>
                            <textarea value={sel('seo').metaDescription} onChange={e => upd('seo', { ...sel('seo'), metaDescription: e.target.value })} />
                        </Field>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 5 }}>{sel('seo').metaDescription?.length || 0} karakter</div>
                    </Card>
                    <Card>
                        <h3>Anahtar Kelimeler</h3>
                        <Field><label>VirgÃƒÆ’Ã‚Â¼lle ayÃƒâ€žÃ‚Â±r</label><input value={sel('seo').keywords} onChange={e => upd('seo', { ...sel('seo'), keywords: e.target.value })} /></Field>
                    </Card>
                    <SaveBtn onClick={() => save('seo')} disabled={saving}>{saving ? <Loader /> : 'ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¾'} Kaydet</SaveBtn>
                </>}

                {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â FOOTER ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
                {active === 'footer' && <>
                    <PageHeader><span className="emoji">ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¬</span><div><h1>Footer & Ãƒâ€žÃ‚Â°letiÃƒâ€¦Ã…Â¸im</h1><p>SayfanÃƒâ€žÃ‚Â±n alt kÃƒâ€žÃ‚Â±smÃƒâ€žÃ‚Â±</p></div></PageHeader>
                    <Card>
                        <h3>Ãƒâ€¦Ã…Â¾irket Bilgileri</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>Ãƒâ€¦Ã…Â¾irket AdÃƒâ€žÃ‚Â±</label><input value={sel('footer').companyName} onChange={e => upd('footer', { ...sel('footer'), companyName: e.target.value })} /></Field>
                            <Field><label>Copyright Metni</label><input value={sel('footer').copyright} onChange={e => upd('footer', { ...sel('footer'), copyright: e.target.value })} /></Field>
                        </Grid>
                        <Grid $mt={11}>
                            <Field><label>Slogan</label><input value={sel('footer').slogan} onChange={e => upd('footer', { ...sel('footer'), slogan: e.target.value })} /></Field>
                        </Grid>
                    </Card>
                    <Card>
                        <h3>Ãƒâ€žÃ‚Â°letiÃƒâ€¦Ã…Â¸im</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>E-posta</label><input type="email" value={sel('footer').email} onChange={e => upd('footer', { ...sel('footer'), email: e.target.value })} /></Field>
                            <Field><label>Telefon</label><input value={sel('footer').phone} onChange={e => upd('footer', { ...sel('footer'), phone: e.target.value })} /></Field>
                        </Grid>
                        <Grid $mt={11}>
                            <Field><label>Adres</label><textarea value={sel('footer').address} onChange={e => upd('footer', { ...sel('footer'), address: e.target.value })} style={{ minHeight: 52 }} /></Field>
                        </Grid>
                    </Card>
                    <SaveBtn onClick={() => save('footer')} disabled={saving}>{saving ? <Loader /> : 'ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¾'} Kaydet</SaveBtn>
                </>}

                {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â SOCIAL ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
                {active === 'social' && <>
                    <PageHeader><span className="emoji">ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â±</span><div><h1>Sosyal Medya</h1><p>Footer'da ikon olarak gÃƒÆ’Ã‚Â¶rÃƒÆ’Ã‚Â¼nÃƒÆ’Ã‚Â¼r</p></div></PageHeader>
                    <Card>
                        <h3>Profil Linkleri</h3>
                        <Grid $cols="1fr 1fr">
                            <Field><label>ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â· Instagram</label><input value={sel('social').instagram} onChange={e => upd('social', { ...sel('social'), instagram: e.target.value })} placeholder="https://instagram.com/..." /></Field>
                            <Field><label>ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‹Å“ Facebook</label><input value={sel('social').facebook} onChange={e => upd('social', { ...sel('social'), facebook: e.target.value })} placeholder="https://facebook.com/..." /></Field>
                            <Field><label>ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¼ LinkedIn</label><input value={sel('social').linkedin} onChange={e => upd('social', { ...sel('social'), linkedin: e.target.value })} placeholder="https://linkedin.com/..." /></Field>
                            <Field><label>ÃƒÂ°Ã…Â¸Ã‚ÂÃ‚Â¦ Twitter / X</label><input value={sel('social').twitter} onChange={e => upd('social', { ...sel('social'), twitter: e.target.value })} placeholder="https://twitter.com/..." /></Field>
                            <Field><label>ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¶ÃƒÂ¯Ã‚Â¸Ã‚Â YouTube</label><input value={sel('social').youtube} onChange={e => upd('social', { ...sel('social'), youtube: e.target.value })} placeholder="https://youtube.com/..." /></Field>
                        </Grid>
                    </Card>
                    <SaveBtn onClick={() => save('social')} disabled={saving}>{saving ? <Loader /> : 'ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¾'} Kaydet</SaveBtn>
                </>}

                {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â LOGIN ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
                {active === 'login' && <>
                    <PageHeader><span className="emoji">ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â</span><div><h1>GiriÃƒâ€¦Ã…Â¸ / Hesap</h1><p>Uygulamaya giriÃƒâ€¦Ã…Â¸ yapÃƒâ€žÃ‚Â±n</p></div></PageHeader>
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
                                    ÃƒÂ°Ã…Â¸Ã‚ÂÃ‚Â  Uygulamaya Git
                                </SaveBtn>
                                <SaveBtn onClick={doLogout} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 18px rgba(239,68,68,0.22)', marginTop: 18 }}>
                                    ÃƒÆ’Ã¢â‚¬Â¡Ãƒâ€žÃ‚Â±kÃƒâ€žÃ‚Â±Ãƒâ€¦Ã…Â¸ Yap
                                </SaveBtn>
                            </div>
                        </Card>
                    ) : (
                        <Card>
                            <h3>GiriÃƒâ€¦Ã…Â¸ Yap</h3>
                            {loginError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 14 }}>{loginError}</div>}
                            <Grid>
                                <Field><label>E-posta</label>
                                    <input type="email" value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} onKeyDown={e => e.key === 'Enter' && doLogin()} placeholder="kullanici@email.com" />
                                </Field>
                                <Field><label>Ãƒâ€¦Ã…Â¾ifre</label>
                                    <input type="password" value={loginForm.sifre} onChange={e => setLoginForm(p => ({ ...p, sifre: e.target.value }))} onKeyDown={e => e.key === 'Enter' && doLogin()} placeholder="ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢" />
                                </Field>
                            </Grid>
                            <SaveBtn onClick={doLogin} disabled={loginLoading}>{loginLoading ? <Loader /> : 'ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â'} {loginLoading ? 'GiriÃƒâ€¦Ã…Â¸ yapÃƒâ€žÃ‚Â±lÃƒâ€žÃ‚Â±yor...' : 'GiriÃƒâ€¦Ã…Â¸ Yap'}</SaveBtn>
                        </Card>
                    )}
                </>}

                {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â DASHBOARD ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
                {active === 'dashboard' && <DashboardSection API={API} toast_={toast_} />}

                {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â USERS ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
                {active === 'users' && <UsersSection API={API} toast_={toast_} />}

                {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â BLOG ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
                {active === 'blog' && <BlogSection API={API} toast_={toast_} />}

                {/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â SETTINGS ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */}
                {active === 'settings' && <SettingsSection API={API} toast_={toast_} />}

            </Main>

            {toast && <Toast $error={toast.error}>{toast.msg}</Toast>}
        </Shell>
    );
}

