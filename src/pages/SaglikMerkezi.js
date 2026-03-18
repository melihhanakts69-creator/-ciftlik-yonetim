import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
    FaHeartbeat, FaSyringe, FaStethoscope, FaPills, FaPlus,
    FaFilter, FaTrash, FaEdit, FaTimes, FaExclamationTriangle,
    FaCheckCircle, FaCalendarAlt, FaClock, FaMoneyBillWave,
    FaCut, FaBaby, FaSearch, FaRobot
} from 'react-icons/fa';
import { GiCow } from 'react-icons/gi';
import { toast } from 'react-toastify';
import * as api from '../services/api';
import SaglikDanismani from '../components/Saglik/SaglikDanismani';
import { colors } from '../styles/colors';

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// --- Styled Components ---
const PageContainer = styled.div`
  padding: 0 0 80px;
  background: #f1f5f9;
  min-height: 100vh;
  font-family: 'Inter', system-ui, sans-serif;
  animation: ${fadeIn} .35s ease;
`;

// ── Page Header (standart beyaz) ───────────────────────────────────────────────
const PageHeader = styled.div`
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 24px 16px;

  @media (max-width: 768px) {
    padding: 14px 16px 12px;
  }
`;
const HeaderTop = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 16px; margin-bottom: 0;
`;
const HeaderLeft = styled.div`display: flex; align-items: center; gap: 14px;`;
const HeaderIcon = styled.div`
  width: 44px; height: 44px; border-radius: 12px;
  background: #f4f4f5;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; flex-shrink: 0;
  border: 1px solid #e5e7eb;
`;
const HeaderTitle = styled.h1`
  margin: 0; font-size: 20px; font-weight: 700; color: #111827; letter-spacing: -0.3px;
`;
const HeaderSub = styled.p`margin: 2px 0 0; font-size: 13px; color: #6b7280;`;
const BtnGroup = styled.div`display: flex; gap: 10px; flex-wrap: wrap;`;
const AddButton = styled.button`
  display: flex; align-items: center; gap: 8px; padding: 9px 16px;
  min-height: 48px;
  border-radius: 8px; font-weight: 600; font-size: 13px;
  cursor: pointer; transition: background 0.15s; white-space: nowrap;
  background: #16a34a;
  color: #fff;
  border: none;
  &:hover { background: #15803d; }
  @media (max-width: 768px) {
    padding: 10px 14px;
    min-height: 48px;
    span { display: none; }
  }
`;

// ── Stat Strip (header'dan ayrı) ────────────────────────────────────────────────
const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin: 16px 0 24px 0;
  overflow: hidden;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    margin: 12px 0 20px 0;
  }
`;
const StatCard = styled.div`
  padding: 18px 24px; display: flex; align-items: center; gap: 14px;
  border-right: 1px solid #e5e7eb;
  &:last-child { border-right: none; }
  transition: background 0.15s;
  &:hover { background: #f9fafb; }

  @media (max-width: 768px) {
    padding: 14px 16px;
    gap: 10px;
    border-bottom: 1px solid #e5e7eb;
    &:nth-child(2n) { border-right: none; }
  }
`;
const StatIcon = styled.div`
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  background: #f4f4f5;
  color: #52525b;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
  border: 1px solid #e5e7eb;
`;
const StatInfo = styled.div`
  .value { font-size: 24px; font-weight: 700; color: #111827; line-height: 1; }
  .label { font-size: 11px; color: #6b7280; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.4px; margin-top: 3px; }
`;

// ── Body ─────────────────────────────────────────────────────
const BodyWrap = styled.div`
  padding: 24px;
  @media (max-width: 768px) { padding: 16px; }
`;

const TabLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const TabContent = styled.div`
  flex: 1;
  width: 100%;
  min-width: 0;
`;




const TabBar = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  margin-bottom: 20px;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0;
  &::-webkit-scrollbar { display: none; }
`;
const Tab = styled.button`
  padding: 9px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: ${p => p.active ? '500' : '400'};
  font-size: 13px;
  color: ${p => p.active ? '#16a34a' : '#6b7280'};
  border-bottom: 2px solid ${p => p.active ? '#16a34a' : 'transparent'};
  margin-bottom: -1px;
  white-space: nowrap;
  transition: color 0.15s;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;

  &:hover {
    color: #16a34a;
    transform: none;
  }
`;

const FilterRow = styled.div`
  display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; align-items: center;
`;
const FilterSelect = styled.select`
  padding: 8px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 13px; background: #f8fafc; color: #475569; cursor: pointer; font-weight: 500;
  &:focus { outline: none; border-color: ${colors.danger}; background: #fff; }
`;

const CardList = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  animation: ${fadeIn} 0.7s ease;
`;

const RecordCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-bottom: 0.5px solid #f3f4f6;
  transition: background 0.12s;
  cursor: default;

  &:hover { background: #fafafa; }
  &:last-child { border-bottom: none; }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 14px;
    button, .actions button { min-height: 44px; min-width: 44px; }
  }
`;

const RecordIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.bg};
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
`;

const RecordContent = styled.div`
  flex: 1;

  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 6px;
  }

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #2c3e50;
  }

  .hayvan-info {
    font-size: 13px;
    color: #7f8c8d;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .detail-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .detail {
    font-size: 12px;
    color: #95a5a6;
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  background: ${props => props.bg};
  color: ${props => props.color};
  white-space: nowrap;
`;

const ActionBtns = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  align-self: flex-start;

  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;

    &.iyilesti { color: #2e7d32; background: #e8f5e9; &:hover { background: #c8e6c9; } }
    &.edit { color: #2196F3; &:hover { background: #e3f2fd; } }
    &.delete { color: #f44336; &:hover { background: #ffebee; } }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #bdc3c7;
  animation: ${fadeIn} 0.5s ease;

  svg { font-size: 60px; margin-bottom: 16px; opacity: 0.3; }
  p { font-size: 16px; margin: 0; }
`;

// --- MODAL ---
const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.2s ease;

  @media (max-width: 768px) {
    align-items: flex-end;
  }
`;

const ModalBox = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  width: 90%;
  max-width: 560px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0,0,0,0.3);

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    max-height: 92vh;
    border-radius: 20px 20px 0 0;
    padding: 20px 16px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  button {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #999;
    padding: 4px;
    &:hover { color: #333; }
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;

  label {
    display: block;
    font-weight: 600;
    font-size: 13px;
    color: #444;
    margin-bottom: 6px;
  }

  input, select, textarea {
    width: 100%;
    padding: 12px 14px;
    border: 2px solid #e8e8e8;
    border-radius: 10px;
    font-size: 14px;
    transition: border-color 0.3s;
    box-sizing: border-box;
    background: #fafafa;

    &:focus {
      outline: none;
      border-color: #e91e63;
      background: white;
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }
`;

const HayvanSecimWrap = styled.div`
  .search-row {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }
  .search-input {
    flex: 1;
    padding: 10px 14px 10px 36px;
    border: 2px solid #e8e8e8;
    border-radius: 10px;
    font-size: 14px;
    background: #fafafa url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23999' viewBox='0 0 16 16'%3E%3Cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z'/%3E%3C/svg%3E") no-repeat 12px center;
    &:focus { outline: none; border-color: #e91e63; background-color: #fff; }
  }
  .tip-filter {
    min-width: 120px;
    padding: 10px 12px;
    border: 2px solid #e8e8e8;
    border-radius: 10px;
    font-size: 13px;
    background: #fafafa;
    &:focus { outline: none; border-color: #e91e63; }
  }
  .hayvan-select {
    max-height: 200px;
    overflow-y: auto;
    border: 2px solid #e8e8e8;
    border-radius: 10px;
    background: #fff;
  }
  .hayvan-option {
    padding: 12px 14px;
    cursor: pointer;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background 0.15s;
    &:hover { background: #fef2f2; }
    &:last-child { border-bottom: none; }
    &.secili { background: #fce7f3; border-left: 4px solid #e91e63; }
  }
  .hayvan-option .badge { font-size: 10px; padding: 2px 8px; border-radius: 10px; background: #f1f5f9; color: #64748b; font-weight: 700; }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #e91e63, #c2185b);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(233,30,99,0.4);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

// --- HELPERS ---
const getTipStyle = (tip) => {
    switch (tip) {
        case 'hastalik': return { icon: <FaHeartbeat />, color: '#f44336', bg: '#ffebee', label: 'Hastalık' };
        case 'tedavi': return { icon: <FaPills />, color: '#FF9800', bg: '#FFF3E0', label: 'Tedavi' };
        case 'asi': return { icon: <FaSyringe />, color: '#9C27B0', bg: '#F3E5F5', label: 'Aşı' };
        case 'muayene': return { icon: <FaStethoscope />, color: '#2196F3', bg: '#E3F2FD', label: 'Muayene' };
        case 'ameliyat': return { icon: <FaCut />, color: '#E91E63', bg: '#FCE4EC', label: 'Ameliyat' };
        case 'dogum_komplikasyonu': return { icon: <FaBaby />, color: '#795548', bg: '#EFEBE9', label: 'Doğum Komp.' };
        case 'tohumlama': return { icon: '🌡️', color: '#1565C0', bg: '#E3F2FD', label: 'Tohumlama' };
        default: return { icon: <FaHeartbeat />, color: '#607D8B', bg: '#ECEFF1', label: 'Diğer' };
    }
};

const getDurumBadge = (durum, tip) => {
    if (tip === 'tohumlama' && durum === 'devam_ediyor') {
        return { bg: '#E3F2FD', color: '#1565C0', label: '🌡️ Kontrol Bekleyen' };
    }
    switch (durum) {
        case 'devam_ediyor': return { bg: '#FFF3E0', color: '#E65100', label: '⏳ Devam Ediyor' };
        case 'iyilesti': return { bg: '#E8F5E9', color: '#2E7D32', label: '✅ İyileşti' };
        case 'kronik': return { bg: '#FFF9C4', color: '#F57F17', label: '🔄 Kronik' };
        case 'oldu': return { bg: '#FFEBEE', color: '#C62828', label: '❌ Öldü' };
        default: return { bg: '#ECEFF1', color: '#455A64', label: durum };
    }
};

const hayvanTipiLabel = {
    inek: '🐄 İnek',
    duve: '🐮 Düve',
    buzagi: '🐂 Buzağı',
    tosun: '🐃 Tosun'
};

// Veterinerler paneli için stiller
const VetPanelWrap = styled.div`
  animation: ${fadeIn} 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 24px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 8px 30px -10px rgba(0,0,0,0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
  margin-top: 24px;
`;
const VetPanelTitle = styled.h3`
  margin: 0 0 8px; font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.01em;
`;
const VetPanelSub = styled.p`
  margin: 0 0 24px; font-size: 15px; color: #64748b; line-height: 1.5; font-weight: 500;
`;
const VetLayout = styled.div`
  display: flex;
  gap: 24px;
  align-items: stretch;
  min-height: 500px;
  max-height: 700px;
  @media (max-width: 1024px) {
    flex-direction: column;
    max-height: none;
  }
`;
const VetListCol = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding-right: 12px;
  
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  &::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;
const VetCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 30px -10px rgba(0,0,0,0.04);
  border: 2px solid ${p => p.$secili ? 'rgba(79, 70, 229, 0.6)' : 'rgba(226, 232, 240, 0.8)'};
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  ${p => p.$secili && `
    &::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 6px;
      background: linear-gradient(180deg, #4f46e5, #818cf8);
    }
    background: linear-gradient(90deg, rgba(79, 70, 229, 0.04) 0%, rgba(255,255,255,0) 100%);
  `}

  &:hover { 
    box-shadow: 0 12px 30px -10px rgba(0,0,0,0.06); 
    border-color: ${p => p.$secili ? 'rgba(79, 70, 229, 0.8)' : 'rgba(203, 213, 225, 0.8)'}; 
    transform: translateY(-2px) scale(1.01);
  }
  
  .vet-name { font-size: 18px; font-weight: 900; color: #0f172a; margin-bottom: 6px; letter-spacing: -0.01em;}
  .vet-clinic { font-size: 13px; color: #4f46e5; font-weight: 800; margin-bottom: 12px; display: inline-block; padding: 4px 12px; background: rgba(79, 70, 229, 0.1); border-radius: 12px; text-transform: uppercase; letter-spacing: 0.05em;}
  .vet-contact { font-size: 14px; color: #64748b; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; font-weight: 500;}
  .vet-contact a { color: #3b82f6; text-decoration: none; transition: color 0.2s; font-weight: 600;}
  .vet-contact a:hover { color: #1d4ed8; }
  .vet-actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
  .vet-actions button { padding: 12px 20px; border-radius: 12px; font-size: 14px; font-weight: 800; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
  .btn-danis { background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #fff; box-shadow: 0 8px 16px -5px rgba(79, 70, 229, 0.3); }
  .btn-danis:hover { background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%); box-shadow: 0 12px 20px -5px rgba(79, 70, 229, 0.4); transform: translateY(-2px); }
  .btn-ara { background: #e0e7ff; color: #4338ca; }
  .btn-ara:hover { background: #c7d2fe; transform: translateY(-2px); }
`;
const DanismaPanel = styled.div`
  width: 420px;
  flex-shrink: 0;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeIn} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 8px 30px -10px rgba(0,0,0,0.05);
  @media (max-width: 1024px) {
    width: 100%;
    height: 500px;
  }

  .panel-header {
    padding: 24px;
    background: #ffffff;
    border-bottom: 1px solid rgba(226, 232, 240, 0.8);
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 10;
  }
  .panel-header h4 { margin: 0; font-size: 16px; font-weight: 800; color: #0f172a; }
  .panel-header .clinic { font-size: 12px; color: #64748b; font-weight: 500; }
  .panel-header .contacts { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; margin-top: 6px; font-weight: 500; }
  .panel-header .contacts a { color: #3b82f6; text-decoration: none; display: flex; align-items: center; gap: 4px; }
  .panel-header .contacts a:hover { color: #2563eb; }

  .msg-list {
    flex: 1;
    min-height: 240px;
    max-height: 380px;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #f8fafc;
    scroll-behavior: smooth;
    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    &::-webkit-scrollbar-track { background: transparent; }
  }

  .msg-row { display: flex; flex-direction: column; max-width: 100%; animation: fadeInMsg 0.2s ease; }
  @keyframes fadeInMsg { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .msg-row.ben { align-items: flex-end; }
  .msg-row.vet { align-items: flex-start; }

  .msg-bubble {
    max-width: 75%;
    padding: 12px 16px;
    font-size: 14px;
    line-height: 1.5;
    word-break: break-word;
    border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  }
  .msg-bubble.ben {
    background: linear-gradient(135deg, #0ea5e9, #0284c7);
    color: #fff;
    border-radius: 16px 16px 4px 16px;
    box-shadow: 0 4px 12px rgba(14,165,233,0.15);
  }
  .msg-bubble.vet {
    background: #fff;
    color: #1e293b;
    border-radius: 16px 16px 16px 4px;
    border: 1px solid rgba(226, 232, 240, 0.8);
  }
  .msg-bubble .msg-time { font-size: 11px; margin-top: 6px; text-align: right; font-weight: 500; }
  .msg-bubble.ben .msg-time { color: rgba(255,255,255,0.7); }
  .msg-bubble.vet .msg-time { color: #94a3b8; }

  .panel-input {
    padding: 16px 20px;
    background: #fff;
    border-top: 1px solid rgba(226, 232, 240, 0.8);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .input-wrapper {
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    padding: 10px 14px;
    transition: all 0.2s;
    &:focus-within {
      border-color: #0ea5e9;
      background: #fff;
      box-shadow: 0 0 0 4px rgba(14,165,233,0.1);
    }
  }

  .panel-input textarea {
    width: 100%;
    min-height: 24px;
    max-height: 120px;
    font-size: 15px;
    resize: none;
    font-family: inherit;
    background: transparent;
    border: none;
    color: #1e293b;
    line-height: 1.5;
    outline: none;
    &::placeholder { color: #94a3b8; }
  }
  
  .panel-input .row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; justify-content: flex-end;}
  .panel-input .row button { padding: 12px 20px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
  .btn-gonder { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: #fff; box-shadow: 0 4px 12px rgba(14,165,233,0.25); }
  .btn-gonder:hover:not(:disabled) { box-shadow: 0 6px 16px rgba(14,165,233,0.35); transform: translateY(-1px); }
  .btn-gonder:disabled { background: #cbd5e1; box-shadow: none; cursor: not-allowed; color: #f1f5f9; }
  .btn-wa { background: #25D366; color: #fff; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25); }
  .btn-wa:hover { box-shadow: 0 6px 16px rgba(37, 211, 102, 0.35); transform: translateY(-1px); }
  .btn-kapat { background: transparent; color: #64748b; }
  .btn-kapat:hover { background: #f1f5f9; color: #0f172a; }
`;
const VetEmpty = styled.div`
  text-align: center;
  padding: 48px 24px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px dashed #cbd5e1;
  color: #64748b;
  font-size: 15px;
  line-height: 1.6;
`;

function VeterinerlerPanel() {
    const [vets, setVets] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [seciliVet, setSeciliVet] = useState(null);
    const [mesaj, setMesaj] = useState('');
    const [mesajlar, setMesajlar] = useState([]);
    const [mesajYukleniyor, setMesajYukleniyor] = useState(false);
    const [gonderiyor, setGonderiyor] = useState(false);
    const [benimId, setBenimId] = useState(null);

    useEffect(() => {
        let cancelled = false;
        api.getProfile().then(res => {
            if (!cancelled && res?.data) {
                setBenimId(res.data.user?.parentUserId || res.data.user?._id || res.data.parentUserId || res.data._id);
            }
        }).catch(() => { });
        api.getVeterinerlerim()
            .then(res => { if (!cancelled) setVets(Array.isArray(res.data) ? res.data : []); })
            .catch(() => { if (!cancelled) setVets([]); })
            .finally(() => { if (!cancelled) setYukleniyor(false); });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!seciliVet?._id) { setMesajlar([]); return; }
        setMesajYukleniyor(true);
        api.getDanismaMesajlar(seciliVet._id)
            .then(res => { setMesajlar(Array.isArray(res.data) ? res.data : []); })
            .catch(() => setMesajlar([]))
            .finally(() => setMesajYukleniyor(false));
    }, [seciliVet?._id]);

    const handleGonder = async (e) => {
        e.preventDefault();
        const metin = (mesaj || '').trim();
        if (!metin || !seciliVet?._id || gonderiyor) return;
        setGonderiyor(true);
        try {
            await api.postDanismaMesaj(seciliVet._id, metin);
            setMesaj('');
            const res = await api.getDanismaMesajlar(seciliVet._id);
            setMesajlar(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Mesaj gönderilemedi.');
        } finally {
            setGonderiyor(false);
        }
    };

    const telNum = seciliVet?.telefon ? String(seciliVet.telefon).replace(/\D/g, '') : '';
    const whatsappUrl = telNum
        ? `https://wa.me/${telNum}?text=${encodeURIComponent(mesaj || 'Merhaba, çiftliğimden danışmak istiyorum.')}`
        : null;

    return (
        <VetPanelWrap>
            <VetPanelTitle>Veterinerler (Acil sağlık danışmanı)</VetPanelTitle>
            <VetPanelSub>
                Sizi müşteri olarak ekleyen veterinerler burada listelenir. Bir veteriner seçin; sağdaki pencereden uygulama içi yazışma yapabilir veya WhatsApp ile iletebilirsiniz.
            </VetPanelSub>
            {yukleniyor ? (
                <VetEmpty>Yükleniyor...</VetEmpty>
            ) : vets.length === 0 ? (
                <VetEmpty>
                    Henüz sizi listeleyen veteriner yok. Veterinerinize çiftlik kodunuzu veya hesabınızı vererek sizi &quot;Hastalarım&quot; listesine eklemesini isteyebilirsiniz.
                </VetEmpty>
            ) : (
                <VetLayout>
                    <VetListCol>
                        {vets.map(v => (
                            <VetCard
                                key={v._id}
                                $secili={seciliVet?._id === v._id}
                                onClick={() => setSeciliVet(v)}
                            >
                                <div className="vet-name">{v.isim}</div>
                                {v.klinikAdi && <div className="vet-clinic">{v.klinikAdi}</div>}
                                {v.telefon && <div className="vet-contact"><a href={`tel:${v.telefon}`} onClick={e => e.stopPropagation()}>{v.telefon}</a></div>}
                                {v.email && <div className="vet-contact"><a href={`mailto:${v.email}`} onClick={e => e.stopPropagation()}>{v.email}</a></div>}
                                <div className="vet-actions" onClick={e => e.stopPropagation()}>
                                    <button type="button" className="btn-danis" onClick={() => setSeciliVet(v)}>💬 Danış / Sohbet</button>
                                    {v.telefon && (
                                        <a href={`tel:${v.telefon}`} style={{ textDecoration: 'none' }}>
                                            <button type="button" className="btn-ara">📞 Ara</button>
                                        </a>
                                    )}
                                </div>
                            </VetCard>
                        ))}
                    </VetListCol>
                    {seciliVet && (
                        <DanismaPanel>
                            <div className="panel-header">
                                <h4>{seciliVet.isim}</h4>
                                {seciliVet.klinikAdi && <div className="clinic">{seciliVet.klinikAdi}</div>}
                                <div className="contacts">
                                    {seciliVet.telefon && <a href={`tel:${seciliVet.telefon}`} onClick={e => e.stopPropagation()}>📞 {seciliVet.telefon}</a>}
                                    {seciliVet.email && <a href={`mailto:${seciliVet.email}`} onClick={e => e.stopPropagation()}>✉️ E-posta</a>}
                                </div>
                            </div>
                            <div className="msg-list">
                                {mesajYukleniyor ? (
                                    <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 13 }}>Yükleniyor…</div>
                                ) : mesajlar.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Henüz mesaj yok. İlk mesajı siz yazın.</div>
                                ) : (
                                    mesajlar.map(m => {
                                        const gonderenId = (m.gonderenId && (m.gonderenId._id || m.gonderenId)) || '';
                                        const benim = String(gonderenId) === String(benimId);
                                        return (
                                            <div key={m._id} className={`msg-row ${benim ? 'ben' : 'vet'}`}>
                                                <div className={`msg-bubble ${benim ? 'ben' : 'vet'}`}>
                                                    <div>{m.mesaj}</div>
                                                    <div className="msg-time">{m.createdAt ? new Date(m.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <div className="panel-input">
                                <div className="input-wrapper">
                                    <textarea
                                        value={mesaj}
                                        onChange={e => {
                                            setMesaj(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                        }}
                                        placeholder="Mesajınızı yazın..."
                                        rows={1}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGonder(e); e.target.style.height = 'auto'; } }}
                                    />
                                </div>
                                <div className="row">
                                    <button type="button" className="btn-kapat" onClick={() => setSeciliVet(null)}>Kapat</button>
                                    {whatsappUrl && (
                                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <button type="button" className="btn-wa">WP</button>
                                        </a>
                                    )}
                                    <button type="button" className="btn-gonder" onClick={handleGonder} disabled={!mesaj.trim() || gonderiyor}>
                                        {gonderiyor ? '…' : 'Gönder'}
                                    </button>
                                </div>
                            </div>
                        </DanismaPanel>
                    )}
                </VetLayout>
            )}
        </VetPanelWrap>
    );
}

// =====================
//  COMPONENT
// =====================
function SaglikMerkezi() {
    const location = useLocation();
    const openTab = location.state?.openTab;
    const [aktifTab, setAktifTab] = useState(openTab || 'kayitlar');

    useEffect(() => {
        if (openTab && ['kayitlar', 'devamEdenler', 'asilar', 'yaklasan', 'ai', 'veterinerler', 'tohumlar'].includes(openTab)) {
            setAktifTab(openTab);
        }
    }, [openTab]);
    const [kayitlar, setKayitlar] = useState([]);
    const [devamEdenlerKayitlar, setDevamEdenlerKayitlar] = useState([]);
    const [asilar, setAsilar] = useState([]);
    const [istatistikler, setIstatistikler] = useState(null);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [modalAcik, setModalAcik] = useState(false);
    const [modalTip, setModalTip] = useState('saglik'); // 'saglik' veya 'asi'
    const [filtreTip, setFiltreTip] = useState('');
    const [filtreDurum, setFiltreDurum] = useState('');
    const [hayvanlar, setHayvanlar] = useState([]);
    const [hayvanArama, setHayvanArama] = useState('');
    const [hayvanTipFiltre, setHayvanTipFiltre] = useState('');
    const [asiHayvanArama, setAsiHayvanArama] = useState('');
    const [belirsizGebeler, setBelirsizGebeler] = useState([]);
    const [belirsizYukleniyor, setBelirsizYukleniyor] = useState(false);

    // Form state
    const [form, setForm] = useState({
        hayvanId: '', hayvanTipi: 'inek', tip: 'hastalik',
        tarih: new Date().toISOString().split('T')[0],
        tani: '', belirtiler: '', tedavi: '', veteriner: '',
        maliyet: '', durum: 'devam_ediyor', sonrakiKontrol: '', notlar: '',
        tahminiZarar: '', ilacAd: '', kullanilanMiktar: '', arinmaSut: '', arinmaEt: '',
        gunlukMiktar: '', gunlukBirim: 'ml'
    });

    const [asiForm, setAsiForm] = useState({
        hayvanId: '', hayvanTipi: 'hepsi', asiAdi: '',
        uygulamaTarihi: new Date().toISOString().split('T')[0],
        sonrakiTarih: '', tekrarPeriyodu: '', uygulayan: '',
        doz: '', maliyet: '', notlar: ''
    });

    // Veri yükleme
    const veriYukle = useCallback(async () => {
        setYukleniyor(true);
        try {
            const params = {};
            if (filtreTip) params.tip = filtreTip;
            if (filtreDurum) params.durum = filtreDurum;

            const [kayitRes, asiRes, istatRes] = await Promise.allSettled([
                api.getSaglikKayitlari(params),
                api.getAsiTakvimi(),
                api.getSaglikIstatistikleri()
            ]);

            if (kayitRes.status === 'fulfilled') {
                setKayitlar(kayitRes.value.data.kayitlar || []);
            }
            if (asiRes.status === 'fulfilled') {
                setAsilar(asiRes.value.data.asilar || []);
            }
            if (istatRes.status === 'fulfilled') {
                setIstatistikler(istatRes.value.data);
            }
        } catch (error) {
            console.error('Sağlık verileri yüklenemedi:', error);
        } finally {
            setYukleniyor(false);
        }
    }, [filtreTip, filtreDurum]);

    // Hayvanları yükle (modal için)
    const hayvanYukle = useCallback(async () => {
        try {
            const [inekRes, duveRes, buzagiRes, tosunRes] = await Promise.all([
                api.getInekler(),
                api.getDuveler(),
                api.getBuzagilar(),
                api.getTosunlar()
            ]);
            const hepsi = [
                ...(inekRes.data || []).map(h => ({ ...h, tip: 'inek' })),
                ...(duveRes.data || []).map(h => ({ ...h, tip: 'duve' })),
                ...(buzagiRes.data || []).map(h => ({ ...h, tip: 'buzagi' })),
                ...(tosunRes.data || []).map(h => ({ ...h, tip: 'tosun' }))
            ];
            setHayvanlar(hepsi);
        } catch (err) {
            console.error('Hayvanlar yüklenemedi:', err);
        }
    }, []);

    useEffect(() => { veriYukle(); }, [veriYukle]);
    useEffect(() => { hayvanYukle(); }, [hayvanYukle]);

    const devamEdenlerYukle = useCallback(async () => {
        const r = await api.getSaglikKayitlari({ durum: 'devam_ediyor' });
        const arr = r.data?.kayitlar ?? r.data ?? [];
        const filtered = (Array.isArray(arr) ? arr : []).filter(k =>
            !['tohumlama', 'asi'].includes(k.tip) && (k.ilaclar?.length > 0)
        );
        setDevamEdenlerKayitlar(filtered);
    }, []);

    useEffect(() => {
        if (aktifTab === 'devamEdenler') devamEdenlerYukle();
    }, [aktifTab, devamEdenlerYukle]);

    const belirsizGebelerYukle = useCallback(async () => {
        setBelirsizYukleniyor(true);
        try {
            const r = await api.getBelirsizGebeler();
            setBelirsizGebeler(Array.isArray(r.data) ? r.data : []);
        } catch (err) {
            setBelirsizGebeler([]);
        } finally {
            setBelirsizYukleniyor(false);
        }
    }, []);

    useEffect(() => {
        if (aktifTab === 'tohumlar') belirsizGebelerYukle();
    }, [aktifTab, belirsizGebelerYukle]);

    const handleBelirsizGebe = async (item) => {
        try {
            const h = item.hayvan;
            if (item.hayvanTipi === 'duve') {
                await api.updateDuve(h._id, { gebelikDurumu: 'Gebe', tohumlamaTarihi: item.tohumlamaTarihi });
            } else {
                await api.updateInek(h._id, { gebelikDurumu: 'Gebe', tohumlamaTarihi: item.tohumlamaTarihi });
            }
            toast.success(`${h.isim} gebe olarak kaydedildi`);
            belirsizGebelerYukle();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Güncellenemedi');
        }
    };

    const handleBelirsizGebeDegil = async (item) => {
        try {
            const h = item.hayvan;
            if (item.hayvanTipi === 'duve') {
                await api.updateDuve(h._id, { gebelikDurumu: 'Gebe Değil', tohumlamaTarihi: null });
            } else {
                await api.updateInek(h._id, { gebelikDurumu: 'Gebe Değil', tohumlamaTarihi: null });
            }
            toast.success(`${h.isim} gebe değil — tohum bekleyenlere eklendi`);
            belirsizGebelerYukle();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Güncellenemedi');
        }
    };

    // Sağlık kaydı oluştur
    const handleSaglikSubmit = async (e) => {
        e.preventDefault();
        if (!form.hayvanId) {
            toast.error('Lütfen bir hayvan seçin');
            return;
        }
        if (form.tip === 'tohumlama') {
            const seciliHayvan = hayvanlar.find(h => h._id === form.hayvanId);
            if (!seciliHayvan || !['inek', 'duve'].includes(seciliHayvan.tip)) {
                toast.error('Tohumlama için sadece inek veya düve seçebilirsiniz');
                return;
            }
        }
        if (form.durum === 'oldu' && (!form.tahminiZarar || parseFloat(form.tahminiZarar) <= 0)) {
            toast.error('Ölüm durumunda tahmini zarar (TL) giriniz');
            return;
        }
        try {
            const seciliHayvan = hayvanlar.find(h => h._id === form.hayvanId);
            const ilaclar = form.tip === 'tohumlama' ? [] : (form.ilacAd ? form.ilacAd.split(',').map((x, idx) => {
                const ilac = { ilacAdi: x.trim() };
                if (form.arinmaSut && parseFloat(form.arinmaSut) > 0) ilac.arinmaSuresiSut = parseFloat(form.arinmaSut);
                if (form.arinmaEt && parseFloat(form.arinmaEt) > 0) ilac.arinmaSuresiEt = parseFloat(form.arinmaEt);
                if (form.kullanilanMiktar && parseFloat(form.kullanilanMiktar) > 0 && idx === 0) {
                    ilac.kullanilanMiktar = parseFloat(form.kullanilanMiktar);
                    ilac.birim = 'ml';
                }
                if (form.durum === 'devam_ediyor' && form.gunlukMiktar && parseFloat(form.gunlukMiktar) > 0) {
                    ilac.gunlukMiktar = parseFloat(form.gunlukMiktar);
                    ilac.gunlukBirim = form.gunlukBirim || 'ml';
                }
                return ilac;
            }).filter(x => x.ilacAdi) : []);

            const taniDeger = form.tip === 'tohumlama' ? 'Suni Tohumlama' : form.tani;

            const data = {
                ...form,
                tani: taniDeger,
                hayvanTipi: seciliHayvan?.tip || form.hayvanTipi,
                hayvanIsim: seciliHayvan?.isim || '',
                hayvanKupeNo: seciliHayvan?.kupeNo || '',
                belirtiler: form.belirtiler ? form.belirtiler.split(',').map(s => s.trim()) : [],
                maliyet: parseFloat(form.maliyet) || 0,
                sonrakiKontrol: form.sonrakiKontrol || undefined,
                tahminiZarar: form.durum === 'oldu' ? parseFloat(form.tahminiZarar) || 0 : undefined,
                ilaclar
            };

            await api.createSaglikKaydi(data);
            toast.success(form.tip === 'tohumlama' ? 'Tohumlama kaydedildi! 🌡️' : 'Sağlık kaydı oluşturuldu! 🏥');
            setModalAcik(false);
            resetForms();
            veriYukle();
            devamEdenlerYukle();
            belirsizGebelerYukle();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Kayıt oluşturulamadı');
        }
    };

    // Aşı kaydı oluştur
    const handleAsiSubmit = async (e) => {
        e.preventDefault();
        try {
            const seciliHayvan = hayvanlar.find(h => h._id === asiForm.hayvanId);
            const data = {
                ...asiForm,
                hayvanIsim: seciliHayvan?.isim || '',
                hayvanKupeNo: seciliHayvan?.kupeNo || '',
                maliyet: parseFloat(asiForm.maliyet) || 0,
                tekrarPeriyodu: parseInt(asiForm.tekrarPeriyodu) || 0,
                sonrakiTarih: asiForm.sonrakiTarih || undefined
            };

            await api.createAsiKaydi(data);
            toast.success('Aşı kaydı oluşturuldu! 💉');
            setModalAcik(false);
            resetForms();
            veriYukle();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Aşı kaydı oluşturulamadı');
        }
    };

    // Silme
    const handleSil = async (id, tip) => {
        if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
        try {
            if (tip === 'asi') {
                await api.deleteAsiKaydi(id);
                toast.success('Aşı kaydı silindi');
            } else {
                await api.deleteSaglikKaydi(id);
                toast.success('Sağlık kaydı silindi');
            }
            veriYukle();
        } catch (error) {
            toast.error('Silme işlemi başarısız');
        }
    };

    // Tedavi için İyileşti olarak işaretle
    const handleIyilesti = async (id) => {
        try {
            await api.updateSaglikKaydi(id, { durum: 'iyilesti' });
            toast.success('İyileşti olarak işaretlendi');
            veriYukle();
            devamEdenlerYukle();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Güncellenemedi');
        }
    };

    const resetForms = () => {
        setForm({
            hayvanId: '', hayvanTipi: 'inek', tip: 'hastalik',
            tarih: new Date().toISOString().split('T')[0],
            tani: '', belirtiler: '', tedavi: '', veteriner: '',
            maliyet: '', durum: 'devam_ediyor', sonrakiKontrol: '', notlar: '',
            tahminiZarar: '', ilacAd: '', kullanilanMiktar: '', arinmaSut: '', arinmaEt: '',
            gunlukMiktar: '', gunlukBirim: 'ml'
        });
        setAsiForm({
            hayvanId: '', hayvanTipi: 'hepsi', asiAdi: '',
            uygulamaTarihi: new Date().toISOString().split('T')[0],
            sonrakiTarih: '', tekrarPeriyodu: '', uygulayan: '',
            doz: '', maliyet: '', notlar: ''
        });
        setHayvanArama('');
        setHayvanTipFiltre('');
        setAsiHayvanArama('');
    };

    const filtrelenmisHayvanlar = hayvanlar.filter(h => {
        const tohumlamaTipUygun = form.tip !== 'tohumlama' || ['inek', 'duve'].includes(h.tip);
        const tipUygun = !hayvanTipFiltre || h.tip === hayvanTipFiltre;
        const aramaUygun = !hayvanArama.trim() ||
            (h.isim && h.isim.toLowerCase().includes(hayvanArama.toLowerCase().trim())) ||
            (h.kupeNo && h.kupeNo.toLowerCase().includes(hayvanArama.toLowerCase().trim()));
        return tohumlamaTipUygun && tipUygun && aramaUygun;
    });

    const asiFiltrelenmisHayvanlar = hayvanlar.filter(h => {
        const tipUygun = asiForm.hayvanTipi === 'hepsi' || h.tip === asiForm.hayvanTipi;
        const aramaUygun = !asiHayvanArama.trim() ||
            (h.isim && h.isim.toLowerCase().includes(asiHayvanArama.toLowerCase().trim())) ||
            (h.kupeNo && h.kupeNo.toLowerCase().includes(asiHayvanArama.toLowerCase().trim()));
        return tipUygun && aramaUygun;
    });

    const openModal = (tip) => {
        setModalTip(tip);
        resetForms();
        setModalAcik(true);
    };

    // =====================
    //  RENDER
    // =====================
    return (
        <PageContainer>
            <PageHeader>
                <HeaderTop>
                    <HeaderLeft>
                        <HeaderIcon>🏥</HeaderIcon>
                        <div>
                            <HeaderTitle>Sağlık Merkezi</HeaderTitle>
                            <HeaderSub>Sağlık kayıtları · Aşı takvimi · Yaklaşan kontroller</HeaderSub>
                        </div>
                    </HeaderLeft>
                    <BtnGroup>
                        <AddButton $secondary onClick={() => openModal('asi')}>
                            <FaSyringe /> Aşı Ekle
                        </AddButton>
                        <AddButton onClick={() => openModal('saglik')}>
                            <FaPlus /> Sağlık Kaydı
                        </AddButton>
                    </BtnGroup>
                </HeaderTop>
            </PageHeader>
            <BodyWrap style={{ paddingTop: 16 }}>
                <StatGrid>
                    <StatCard>
                        <StatIcon style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}>
                            <FaHeartbeat />
                        </StatIcon>
                        <StatInfo>
                            <div className="value" style={{ color: istatistikler?.aktifTedavi > 0 ? '#dc2626' : '#111827' }}>
                                {istatistikler?.aktifTedavi || 0}
                            </div>
                            <div className="label">Aktif Tedavi</div>
                        </StatInfo>
                    </StatCard>
                    <StatCard>
                        <StatIcon style={{ background: '#dbeafe', color: '#2563eb', borderColor: '#bfdbfe' }}>
                            <FaSyringe />
                        </StatIcon>
                        <StatInfo>
                            <div className="value">{istatistikler?.buAyAsi || 0}</div>
                            <div className="label">Bu Ay Aşı</div>
                        </StatInfo>
                    </StatCard>
                    <StatCard>
                        <StatIcon style={{ background: '#fef3c7', color: '#d97706', borderColor: '#fde68a' }}>
                            <FaClock />
                        </StatIcon>
                        <StatInfo>
                            <div className="value" style={{ color: istatistikler?.yaklasanKontrol > 0 ? '#d97706' : '#111827' }}>
                                {istatistikler?.yaklasanKontrol || 0}
                            </div>
                            <div className="label">Yaklaşan Kontrol</div>
                        </StatInfo>
                    </StatCard>
                    <StatCard>
                        <StatIcon style={{ background: '#dcfce7', color: '#16a34a', borderColor: '#bbf7d0' }}>
                            <FaMoneyBillWave />
                        </StatIcon>
                        <StatInfo>
                            <div className="value">₺{(istatistikler?.aylikMaliyet || 0).toLocaleString('tr-TR')}</div>
                            <div className="label">Aylık Sağlık Gideri</div>
                        </StatInfo>
                    </StatCard>
                </StatGrid>

                {/* AI DANIŞMAN BAR — her zaman görünür */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
                        border: '1px solid #ddd6fe',
                        borderRadius: 10,
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 16,
                        cursor: 'pointer',
                    }}
                    onClick={() => setAktifTab('ai')}
                >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', flexShrink: 0 }}>
                        🤖
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6' }}>
                            Sağlık AI Danışmanı
                        </div>
                        <div style={{ fontSize: 11, color: '#7c3aed', opacity: .8, marginTop: 1 }}>
                            Hastalık teşhisi, ilaç bilgisi ve tedavi önerileri için tıkla
                        </div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#5b21b6', background: '#fff', padding: '5px 12px', borderRadius: 20, border: '1px solid #ddd6fe', flexShrink: 0 }}>
                        Danışmana Sor →
                    </div>
                </div>

                <TabLayout>
                    {/* TAB BAR */}
                    <TabBar>
                        <Tab active={aktifTab === 'kayitlar'} onClick={() => setAktifTab('kayitlar')}>
                            🏥 Sağlık Kayıtları
                        </Tab>
                        <Tab active={aktifTab === 'devamEdenler'} onClick={() => setAktifTab('devamEdenler')}>
                            💊 Devam Eden Tedaviler
                        </Tab>
                        <Tab active={aktifTab === 'asilar'} onClick={() => setAktifTab('asilar')}>
                            💉 Aşı Takvimi
                        </Tab>
                        <Tab active={aktifTab === 'yaklasan'} onClick={() => setAktifTab('yaklasan')}>
                            ⏰ Yaklaşan İşlemler
                        </Tab>
                        <Tab active={aktifTab === 'tohumlar'} onClick={() => setAktifTab('tohumlar')}>
                            🌡️ Tohumlar / Belirsiz Gebeler
                        </Tab>
                        <Tab active={aktifTab === 'ai'} onClick={() => setAktifTab('ai')}>
                            🤖 AI Danışman
                        </Tab>
                        <Tab active={aktifTab === 'veterinerler'} onClick={() => setAktifTab('veterinerler')}>
                            🩺 Veterinerler
                        </Tab>
                    </TabBar>

                    <TabContent>

                        {/* SAĞLIK KAYITLARI TAB */}
                        {aktifTab === 'kayitlar' && (
                            <>
                                <FilterRow>
                                    <FaFilter style={{ color: '#999' }} />
                                    <FilterSelect value={filtreTip} onChange={e => setFiltreTip(e.target.value)}>
                                        <option value="">Tüm Tipler</option>
                                        <option value="hastalik">Hastalık</option>
                                        <option value="tedavi">Tedavi</option>
                                        <option value="asi">Aşı</option>
                                        <option value="muayene">Muayene</option>
                                        <option value="ameliyat">Ameliyat</option>
                                    </FilterSelect>
                                    <FilterSelect value={filtreDurum} onChange={e => setFiltreDurum(e.target.value)}>
                                        <option value="">Tüm Durumlar</option>
                                        <option value="devam_ediyor">Devam Ediyor</option>
                                        <option value="iyilesti">İyileşti</option>
                                        <option value="kronik">Kronik</option>
                                    </FilterSelect>
                                </FilterRow>

                                <CardList>
                                    {yukleniyor ? (
                                        <EmptyState><p>Yükleniyor...</p></EmptyState>
                                    ) : kayitlar.length === 0 ? (
                                        <EmptyState>
                                            <FaHeartbeat />
                                            <p>Henüz sağlık kaydı yok</p>
                                            <p style={{ fontSize: '13px', marginTop: '8px' }}>İlk kaydı eklemek için yukarıdaki butona tıklayın</p>
                                        </EmptyState>
                                    ) : (
                                        kayitlar
                                            .filter(k => k.tip !== 'tohumlama' && !(k.tip === 'muayene' && k.tani === 'Suni Tohumlama'))
                                            .map(k => {
                                            const style = getTipStyle(k.tip);
                                            const durumBadge = getDurumBadge(k.durum, k.tip);
                                            return (
                                                <RecordCard key={k._id}>
                                                    <RecordIcon bg={style.bg} color={style.color}>
                                                        {style.icon}
                                                    </RecordIcon>
                                                    <RecordContent>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 2 }}>
                                                                    {k.tani}
                                                                </div>
                                                                <div style={{ fontSize: 11, color: '#9ca3af', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                                    {k.hayvanIsim && <span>🐄 {k.hayvanIsim} ({k.hayvanKupeNo})</span>}
                                                                    {k.tedavi && <span>💊 {k.tedavi.slice(0, 30)}</span>}
                                                                    {k.veteriner && <span>🩺 {k.veteriner}</span>}
                                                                    {k.maliyet > 0 && <span>₺{k.maliyet.toLocaleString('tr-TR')}</span>}
                                                                    <span>📅 {new Date(k.tarih).toLocaleDateString('tr-TR')}</span>
                                                                    {k.sonrakiKontrol && (
                                                                        <span style={{ color: new Date(k.sonrakiKontrol) < new Date() ? '#dc2626' : '#d97706', fontWeight: 500 }}>
                                                                            Kontrol: {new Date(k.sonrakiKontrol).toLocaleDateString('tr-TR')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                                                                <Badge bg={durumBadge.bg} color={durumBadge.color}>{durumBadge.label}</Badge>
                                                                {k.durum === 'devam_ediyor' && k.tip !== 'tohumlama' && (
                                                                    <button
                                                                        onClick={() => handleIyilesti(k._id)}
                                                                        style={{ fontSize: 11, color: '#16a34a', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontWeight: 500 }}
                                                                    >
                                                                        ✓ İyileşti
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </RecordContent>
                                                    <ActionBtns>
                                                        <button className="delete" onClick={() => handleSil(k._id, 'saglik')}><FaTrash /></button>
                                                    </ActionBtns>
                                                </RecordCard>
                                            );
                                        })
                                    )}
                                </CardList>
                            </>
                        )}

                        {/* DEVAM EDEN TEDAVİLER TAB */}
                        {aktifTab === 'devamEdenler' && (
                            <>
                                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                                    İlaç kullanan devam eden tedaviler. Tohumlama ve aşı kayıtları burada gösterilmez.
                                </div>
                                <CardList>
                                    {devamEdenlerKayitlar.length === 0 ? (
                                        <EmptyState>
                                            <FaPills />
                                            <p>Devam eden tedavi yok</p>
                                            <p style={{ fontSize: '13px', marginTop: '8px' }}>İyileşti butonuna basana kadar ilaç stoktan günlük düşülür</p>
                                        </EmptyState>
                                    ) : (
                                        devamEdenlerKayitlar.map(k => {
                                            const style = getTipStyle(k.tip);
                                            return (
                                                <RecordCard key={k._id}>
                                                    <RecordIcon bg={style.bg} color={style.color}>
                                                        {style.icon}
                                                    </RecordIcon>
                                                    <RecordContent>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 2 }}>
                                                                    {k.tani}
                                                                </div>
                                                                <div style={{ fontSize: 11, color: '#9ca3af', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                                    {k.hayvanIsim && <span>🐄 {k.hayvanIsim} ({k.hayvanKupeNo})</span>}
                                                                    <span>💊 {(k.ilaclar || []).map(i => i.ilacAdi).filter(Boolean).join(', ')}</span>
                                                                    {k.ilaclar?.some(i => (i.gunlukMiktar || 0) > 0) && (
                                                                        <span style={{ color: '#d97706', fontWeight: 500 }}>Günlük stok düşümü aktif</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleIyilesti(k._id)}
                                                                style={{ fontSize: 11, color: '#16a34a', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontWeight: 500, flexShrink: 0 }}
                                                            >
                                                                ✓ İyileşti
                                                            </button>
                                                        </div>
                                                    </RecordContent>
                                                </RecordCard>
                                            );
                                        })
                                    )}
                                </CardList>
                            </>
                        )}

                        {/* AŞI TAKVİMİ TAB */}
                        {aktifTab === 'asilar' && (
                            <>
                                {asilar.length === 0 ? (
                                    <CardList>
                                        <EmptyState>
                                            <FaSyringe />
                                            <p>Henüz aşı kaydı yok</p>
                                        </EmptyState>
                                    </CardList>
                                ) : (() => {
                                    const now = new Date();
                                    const weekLater = new Date(now); weekLater.setDate(now.getDate() + 7);
                                    const monthLater = new Date(now); monthLater.setDate(now.getDate() + 30);

                                    const groups = [
                                        { key: 'gecikti', label: '⚠️ Gecikmiş', color: '#f44336', bg: '#FFEBEE', filter: a => a.durum === 'bekliyor' && a.sonrakiTarih && new Date(a.sonrakiTarih) < now },
                                        { key: 'bu_hafta', label: '🔴 Bu Hafta', color: '#ef6c00', bg: '#FFF3E0', filter: a => a.durum === 'bekliyor' && a.sonrakiTarih && new Date(a.sonrakiTarih) >= now && new Date(a.sonrakiTarih) <= weekLater },
                                        { key: 'bu_ay', label: '🟡 Bu Ay', color: '#f59e0b', bg: '#fffbeb', filter: a => a.durum === 'bekliyor' && a.sonrakiTarih && new Date(a.sonrakiTarih) > weekLater && new Date(a.sonrakiTarih) <= monthLater },
                                        { key: 'yaklasan', label: '🟢 Yaklaşan', color: '#16a34a', bg: '#f0fdf4', filter: a => a.durum === 'bekliyor' && (!a.sonrakiTarih || new Date(a.sonrakiTarih) > monthLater) },
                                        { key: 'yapildi', label: '✅ Yapıldı', color: '#475569', bg: '#f8fafc', filter: a => a.durum === 'yapildi' },
                                    ];

                                    return groups.map(grp => {
                                        const items = asilar.filter(grp.filter);
                                        if (items.length === 0) return null;
                                        return (
                                            <div key={grp.key} style={{ marginBottom: 20 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                                    <span style={{ fontSize: 13, fontWeight: 800, color: grp.color }}>{grp.label}</span>
                                                    <span style={{ background: grp.bg, color: grp.color, borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{items.length} kayıt</span>
                                                    <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
                                                </div>
                                                <CardList style={{ marginBottom: 0 }}>
                                                    {items.map(a => (
                                                        <RecordCard key={a._id}>
                                                            <RecordIcon bg={grp.bg} color={grp.color}>
                                                                <FaSyringe />
                                                            </RecordIcon>
                                                            <RecordContent>
                                                                <div className="top-row">
                                                                    <div>
                                                                        <h3>{a.asiAdi}</h3>
                                                                        <div className="hayvan-info">
                                                                            {a.hayvanTipi === 'hepsi' ? '🐄 Toplu Aşı' : (hayvanTipiLabel[a.hayvanTipi] || a.hayvanTipi)}
                                                                            {a.hayvanIsim && ` • ${a.hayvanIsim}`}
                                                                            {a.hayvanKupeNo && ` (${a.hayvanKupeNo})`}
                                                                        </div>
                                                                    </div>
                                                                    <Badge bg={grp.bg} color={grp.color}>
                                                                        {a.durum === 'yapildi' ? '✅ Yapıldı' : a.sonrakiTarih ? new Date(a.sonrakiTarih).toLocaleDateString('tr-TR') : '⏳ Bekliyor'}
                                                                    </Badge>
                                                                </div>
                                                                <div className="detail-row">
                                                                    <span className="detail"><FaCalendarAlt /> {new Date(a.uygulamaTarihi).toLocaleDateString('tr-TR')}</span>
                                                                    {a.sonrakiTarih && <span className="detail"><FaClock /> Sonraki: {new Date(a.sonrakiTarih).toLocaleDateString('tr-TR')}</span>}
                                                                    {a.uygulayan && <span className="detail"><FaStethoscope /> {a.uygulayan}</span>}
                                                                    {a.doz && <span className="detail"><FaPills /> {a.doz}</span>}
                                                                    {a.maliyet > 0 && <span className="detail"><FaMoneyBillWave /> ₺{a.maliyet.toLocaleString('tr-TR')}</span>}
                                                                </div>
                                                            </RecordContent>
                                                            <ActionBtns>
                                                                <button className="delete" onClick={() => handleSil(a._id, 'asi')}><FaTrash /></button>
                                                            </ActionBtns>
                                                        </RecordCard>
                                                    ))}
                                                </CardList>
                                            </div>
                                        );
                                    });
                                })()}
                            </>
                        )}

                        {/* YAKLAŞAN İŞLEMLER TAB */}
                        {aktifTab === 'yaklasan' && (() => {
                            const now = new Date();
                            const haftaSonra = new Date(); haftaSonra.setDate(now.getDate() + 7);
                            const aySonra = new Date(); aySonra.setDate(now.getDate() + 30);

                            const tumItems = [
                                ...kayitlar
                                    .filter(k => k.sonrakiKontrol && k.durum === 'devam_ediyor')
                                    .map(k => ({
                                        _id: k._id, _tip: 'kontrol',
                                        baslik: `Kontrol: ${k.tani}`,
                                        hayvan: `${k.hayvanIsim || ''} ${k.hayvanKupeNo ? `(${k.hayvanKupeNo})` : ''}`.trim(),
                                        tarih: new Date(k.sonrakiKontrol),
                                        ikon: '🩺', ikonBg: '#dbeafe'
                                    })),
                                ...asilar
                                    .filter(a => a.sonrakiTarih && a.durum !== 'yapildi')
                                    .map(a => ({
                                        _id: a._id, _tip: 'asi',
                                        baslik: `Aşı: ${a.asiAdi}`,
                                        hayvan: a.hayvanTipi === 'hepsi' ? 'Toplu sürü' : `${a.hayvanIsim || ''} ${a.hayvanKupeNo ? `(${a.hayvanKupeNo})` : ''}`.trim(),
                                        tarih: new Date(a.sonrakiTarih),
                                        ikon: '💉', ikonBg: '#f3e8ff'
                                    }))
                            ].sort((a, b) => a.tarih - b.tarih);

                            const gecikmiş = tumItems.filter(i => i.tarih < now);
                            const buHafta = tumItems.filter(i => i.tarih >= now && i.tarih <= haftaSonra);
                            const buAy = tumItems.filter(i => i.tarih > haftaSonra && i.tarih <= aySonra);

                            const GrupBaslik = ({ label, count, renk }) => count > 0 && (
                                <div style={{ fontSize: 10, fontWeight: 500, color: renk, textTransform: 'uppercase', letterSpacing: '.5px', padding: '8px 14px 4px', background: '#f9fafb', borderBottom: '0.5px solid #f3f4f6' }}>
                                    {label} ({count})
                                </div>
                            );

                            const ItemRow = ({ item }) => {
                                const geciktiMi = item.tarih < now;
                                const gunFark = Math.ceil(Math.abs(item.tarih - now) / 86400000);
                                return (
                                    <div
                                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '0.5px solid #f3f4f6', transition: 'background .12s' }}
                                        onMouseOver={e => { e.currentTarget.style.background = '#fafafa'; }}
                                        onMouseOut={e => { e.currentTarget.style.background = ''; }}
                                    >
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: geciktiMi ? '#fef2f2' : item.ikonBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                                            {item.ikon}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{item.baslik}</div>
                                            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                                                🐄 {item.hayvan || '—'}
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 20, flexShrink: 0,
                                            background: geciktiMi ? '#fef2f2' : buHafta.includes(item) ? '#fef3c7' : '#ede9fe',
                                            color: geciktiMi ? '#991b1b' : buHafta.includes(item) ? '#92400e' : '#5b21b6'
                                        }}>
                                            {geciktiMi ? `${gunFark}g gecikmiş` : `${gunFark} gün`}
                                        </span>
                                    </div>
                                );
                            };

                            if (tumItems.length === 0) {
                                return (
                                    <div style={{ textAlign: 'center', padding: '48px 20px', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', color: '#9ca3af', fontSize: 13 }}>
                                        ✅ Yaklaşan işlem yok — her şey yolunda!
                                    </div>
                                );
                            }

                            return (
                                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                                    <GrupBaslik label="⏰ Gecikmiş" count={gecikmiş.length} renk="#dc2626" />
                                    {gecikmiş.map(i => <ItemRow key={i._id} item={i} />)}
                                    <GrupBaslik label="📅 Bu Hafta" count={buHafta.length} renk="#d97706" />
                                    {buHafta.map(i => <ItemRow key={i._id} item={i} />)}
                                    <GrupBaslik label="📆 Bu Ay" count={buAy.length} renk="#6b7280" />
                                    {buAy.map(i => <ItemRow key={i._id} item={i} />)}
                                </div>
                            );
                        })()}

                        {/* TOHUMLAR / BELİRSİZ GEBELER TAB */}
                        {aktifTab === 'tohumlar' && (
                            <>
                                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                                    28 günden az olan, tohumlama yapılmış düve ve inekler. Gebelik kontrolü yapıldığında Gebe veya Gebe Değil olarak işaretleyin.
                                </div>
                                <CardList>
                                    {belirsizYukleniyor ? (
                                        <EmptyState><p>Yükleniyor...</p></EmptyState>
                                    ) : belirsizGebeler.length === 0 ? (
                                        <EmptyState>
                                            <FaBaby />
                                            <p>Tohumlar / Belirsiz gebeler listesi boş</p>
                                            <p style={{ fontSize: '13px', marginTop: '8px' }}>28 günden az süredir tohumlama yapılmış ve henüz kontrol edilmemiş hayvan burada görünür</p>
                                        </EmptyState>
                                    ) : (
                                        belirsizGebeler.map(item => {
                                            const h = item.hayvan;
                                            const tipLabel = item.hayvanTipi === 'duve' ? '🐮 Düve' : '🐄 İnek';
                                            return (
                                                <RecordCard key={`${item.hayvanTipi}-${h._id}`}>
                                                    <RecordIcon bg="#fef3c7" color="#d97706">
                                                        🌡️
                                                    </RecordIcon>
                                                    <RecordContent>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 2 }}>
                                                                    {h.isim} ({h.kupeNo})
                                                                </div>
                                                                <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                                                    <span>{tipLabel}</span>
                                                                    <span>📅 Tohumlama: {new Date(item.tohumlamaTarihi).toLocaleDateString('tr-TR')}</span>
                                                                    <span style={{ color: '#d97706', fontWeight: 600 }}>⏱ {item.gecenGun} gün</span>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                                                                <button
                                                                    onClick={() => handleBelirsizGebe(item)}
                                                                    style={{
                                                                        fontSize: 12, fontWeight: 600, padding: '8px 14px', borderRadius: 8,
                                                                        background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    ✅ Gebe
                                                                </button>
                                                                <button
                                                                    onClick={() => handleBelirsizGebeDegil(item)}
                                                                    style={{
                                                                        fontSize: 12, fontWeight: 600, padding: '8px 14px', borderRadius: 8,
                                                                        background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    ❌ Gebe Değil
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </RecordContent>
                                                </RecordCard>
                                            );
                                        })
                                    )}
                                </CardList>
                            </>
                        )}

                        {/* 🤖 AI DANIŞMAN TAB */}
                        {aktifTab === 'ai' && (
                            <SaglikDanismani />
                        )}

                        {/* 🩺 VETERİNERLER (Acil sağlık danışmanı) TAB */}
                        {aktifTab === 'veterinerler' && (
                            <VeterinerlerPanel />
                        )}
                    </TabContent>
                </TabLayout>

                {/* MODAL */}
                {modalAcik && (
                    <Overlay onClick={() => setModalAcik(false)}>
                        <ModalBox onClick={e => e.stopPropagation()}>
                            {modalTip === 'saglik' ? (
                                <>
                                    <ModalHeader>
                                        <h2><FaHeartbeat style={{ color: '#e91e63' }} /> Yeni Sağlık Kaydı</h2>
                                        <button onClick={() => setModalAcik(false)}><FaTimes /></button>
                                    </ModalHeader>

                                    <form onSubmit={handleSaglikSubmit}>
                                        <FormGroup>
                                            <label>Hayvan *</label>
                                            <HayvanSecimWrap>
                                                <div className="search-row">
                                                    <input
                                                        type="text"
                                                        className="search-input"
                                                        placeholder="İsim veya küpe no ile ara..."
                                                        value={hayvanArama}
                                                        onChange={e => setHayvanArama(e.target.value)}
                                                    />
                                                    <select
                                                        className="tip-filter"
                                                        value={hayvanTipFiltre}
                                                        onChange={e => setHayvanTipFiltre(e.target.value)}
                                                    >
                                                        <option value="">Tüm Tipler</option>
                                                        <option value="inek">🐄 İnek</option>
                                                        <option value="duve">🐮 Düve</option>
                                                        <option value="buzagi">🐂 Buzağı</option>
                                                        <option value="tosun">🐃 Tosun</option>
                                                    </select>
                                                </div>
                                                <div className="hayvan-select">
                                                    {filtrelenmisHayvanlar.length === 0 ? (
                                                        <div style={{ padding: 16, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                                                            {hayvanArama || hayvanTipFiltre ? 'Eşleşen hayvan bulunamadı' : 'Hayvan listesi yükleniyor...'}
                                                        </div>
                                                    ) : (
                                                        filtrelenmisHayvanlar.map(h => (
                                                            <div
                                                                key={h._id}
                                                                className={`hayvan-option ${form.hayvanId === h._id ? 'secili' : ''}`}
                                                                onClick={() => setForm({ ...form, hayvanId: h._id, hayvanTipi: h.tip })}
                                                            >
                                                                <span><strong>{h.isim}</strong> ({h.kupeNo})</span>
                                                                <span className="badge">{hayvanTipiLabel[h.tip]}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                {form.hayvanId && !filtrelenmisHayvanlar.find(h => h._id === form.hayvanId) && (
                                                    <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>
                                                        Seçili: {hayvanlar.find(h => h._id === form.hayvanId)?.isim} ({hayvanlar.find(h => h._id === form.hayvanId)?.kupeNo})
                                                    </div>
                                                )}
                                            </HayvanSecimWrap>
                                        </FormGroup>

                                        <FormRow>
                                            <FormGroup>
                                                <label>İşlem Tipi *</label>
                                                <select value={form.tip} onChange={e => setForm({ ...form, tip: e.target.value })}>
                                                    <option value="hastalik">🤒 Hastalık</option>
                                                    <option value="tedavi">💊 Tedavi</option>
                                                    <option value="tohumlama">🌡️ Tohumlama</option>
                                                    <option value="muayene">🩺 Muayene</option>
                                                    <option value="ameliyat">🔪 Ameliyat</option>
                                                    <option value="dogum_komplikasyonu">⚠️ Doğum Komplikasyonu</option>
                                                </select>
                                            </FormGroup>
                                            <FormGroup>
                                                <label>Tarih *</label>
                                                <input type="date" value={form.tarih} onChange={e => setForm({ ...form, tarih: e.target.value })} required />
                                            </FormGroup>
                                        </FormRow>

                                        {form.tip !== 'tohumlama' && (
                                        <FormGroup>
                                            <label>Tanı / Hastalık Adı *</label>
                                            <input
                                                type="text"
                                                value={form.tani}
                                                onChange={e => setForm({ ...form, tani: e.target.value })}
                                                placeholder="Ör: Mastitis, Şap Hastalığı, Topallık..."
                                                required
                                            />
                                        </FormGroup>
                                        )}
                                        {form.tip === 'tohumlama' && (
                                        <div style={{ padding: '10px 14px', background: '#fef3c7', borderRadius: 10, fontSize: 13, color: '#92400e' }}>
                                            📅 Yukarıdaki tarih tohumlama tarihi olarak kullanılacak. Hayvan Tohumlar/Belirsiz Gebeler sayfasına eklenecek.
                                        </div>
                                        )}

                                        <FormGroup>
                                            <label>Belirtiler (virgülle ayırın)</label>
                                            <input
                                                type="text"
                                                value={form.belirtiler}
                                                onChange={e => setForm({ ...form, belirtiler: e.target.value })}
                                                placeholder="Ör: Ateş, İştahsızlık, Topallık"
                                            />
                                        </FormGroup>

                                        <FormGroup>
                                            <label>Tedavi / Uygulama</label>
                                            <textarea
                                                value={form.tedavi}
                                                onChange={e => setForm({ ...form, tedavi: e.target.value })}
                                                placeholder="Uygulanan tedaviyi yazın..."
                                            />
                                        </FormGroup>

                                        <FormGroup>
                                            <label>İlaçlar <span style={{ color: '#94a3b8', fontWeight: 500 }}>(virgülle ayırın — stoktan düşülür)</span></label>
                                            <input
                                                type="text"
                                                value={form.ilacAd}
                                                onChange={e => setForm({ ...form, ilacAd: e.target.value })}
                                                placeholder="Örn: Penstrep, Metacam"
                                            />
                                        </FormGroup>
                                        <FormRow>
                                            <FormGroup>
                                                <label>Kullanılan miktar (ml)</label>
                                                <input type="number" min="0" step="0.1" value={form.kullanilanMiktar} onChange={e => setForm({ ...form, kullanilanMiktar: e.target.value })} placeholder="İlk ilaca uygulanır" />
                                            </FormGroup>
                                            <FormGroup>
                                                <label>Süt arınma (gün)</label>
                                                <input type="number" min="0" value={form.arinmaSut} onChange={e => setForm({ ...form, arinmaSut: e.target.value })} placeholder="Opsiyonel" />
                                            </FormGroup>
                                            <FormGroup>
                                                <label>Et arınma (gün)</label>
                                                <input type="number" min="0" value={form.arinmaEt} onChange={e => setForm({ ...form, arinmaEt: e.target.value })} placeholder="Opsiyonel" />
                                            </FormGroup>
                                        </FormRow>

                                        {form.durum === 'devam_ediyor' && (
                                            <FormRow>
                                                <FormGroup>
                                                    <label>Günlük kullanım miktarı <span style={{ color: '#9ca3af', fontSize: 11 }}>(stoktan her gün düşülür)</span></label>
                                                    <input type="number" min="0" step="0.1" value={form.gunlukMiktar} onChange={e => setForm({ ...form, gunlukMiktar: e.target.value })} placeholder="Örn: 10" />
                                                </FormGroup>
                                                <FormGroup>
                                                    <label>Birim</label>
                                                    <select value={form.gunlukBirim} onChange={e => setForm({ ...form, gunlukBirim: e.target.value })}>
                                                        <option value="ml">ml</option>
                                                        <option value="adet">adet</option>
                                                        <option value="kutu">kutu</option>
                                                        <option value="gram">gram</option>
                                                    </select>
                                                </FormGroup>
                                            </FormRow>
                                        )}

                                        <FormRow>
                                            <FormGroup>
                                                <label>Veteriner</label>
                                                <input type="text" value={form.veteriner} onChange={e => setForm({ ...form, veteriner: e.target.value })} placeholder="Vet. adı" />
                                            </FormGroup>
                                            <FormGroup>
                                                <label>Maliyet (₺)</label>
                                                <input type="number" value={form.maliyet} onChange={e => setForm({ ...form, maliyet: e.target.value })} placeholder="0" min="0" />
                                            </FormGroup>
                                        </FormRow>

                                        <FormRow>
                                            <FormGroup>
                                                <label>Durum</label>
                                                <select value={form.durum} onChange={e => setForm({ ...form, durum: e.target.value })}>
                                                    <option value="devam_ediyor">⏳ Devam Ediyor</option>
                                                    <option value="iyilesti">✅ İyileşti</option>
                                                    <option value="kronik">🔄 Kronik</option>
                                                    <option value="oldu">❌ Öldü</option>
                                                </select>
                                            </FormGroup>
                                            <FormGroup>
                                                <label>Sonraki Kontrol</label>
                                                <input type="date" value={form.sonrakiKontrol} onChange={e => setForm({ ...form, sonrakiKontrol: e.target.value })} />
                                            </FormGroup>
                                        </FormRow>

                                        {form.durum === 'oldu' && (
                                            <FormGroup>
                                                <label>Tahmini Zarar (TL) *</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={form.tahminiZarar}
                                                    onChange={e => setForm({ ...form, tahminiZarar: e.target.value })}
                                                    placeholder="Örn: 15000"
                                                />
                                            </FormGroup>
                                        )}

                                        <FormGroup>
                                            <label>Notlar</label>
                                            <textarea value={form.notlar} onChange={e => setForm({ ...form, notlar: e.target.value })} placeholder="Ek notlar..." />
                                        </FormGroup>

                                        <SubmitBtn type="submit">Kaydet</SubmitBtn>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <ModalHeader>
                                        <h2><FaSyringe style={{ color: '#9C27B0' }} /> Yeni Aşı Kaydı</h2>
                                        <button onClick={() => setModalAcik(false)}><FaTimes /></button>
                                    </ModalHeader>

                                    <form onSubmit={handleAsiSubmit}>
                                        <FormGroup>
                                            <label>Aşı Adı *</label>
                                            <input
                                                type="text"
                                                value={asiForm.asiAdi}
                                                onChange={e => setAsiForm({ ...asiForm, asiAdi: e.target.value })}
                                                placeholder="Ör: Şap Aşısı, Brusella, IBR..."
                                                required
                                            />
                                        </FormGroup>

                                        <FormRow>
                                            <FormGroup>
                                                <label>Hayvan Tipi</label>
                                                <select value={asiForm.hayvanTipi} onChange={e => { setAsiForm({ ...asiForm, hayvanTipi: e.target.value, hayvanId: '' }); setAsiHayvanArama(''); }}>
                                                    <option value="hepsi">Tüm Sürü (Toplu)</option>
                                                    <option value="inek">İnekler</option>
                                                    <option value="duve">Düveler</option>
                                                    <option value="buzagi">Buzağılar</option>
                                                    <option value="tosun">Tosunlar</option>
                                                </select>
                                            </FormGroup>
                                            <FormGroup>
                                                <label>Belirli Hayvan (opsiyonel)</label>
                                                <HayvanSecimWrap>
                                                    <input
                                                        type="text"
                                                        className="search-input"
                                                        placeholder="İsim veya küpe no ile ara..."
                                                        value={asiHayvanArama}
                                                        onChange={e => setAsiHayvanArama(e.target.value)}
                                                        style={{ marginBottom: 8 }}
                                                    />
                                                    <div className="hayvan-select" style={{ maxHeight: 140 }}>
                                                        <div
                                                            className={`hayvan-option ${!asiForm.hayvanId ? 'secili' : ''}`}
                                                            onClick={() => setAsiForm({ ...asiForm, hayvanId: '' })}
                                                        >
                                                            <span>Toplu Aşı (Belirli hayvan yok)</span>
                                                        </div>
                                                        {asiFiltrelenmisHayvanlar.map(h => (
                                                            <div
                                                                key={h._id}
                                                                className={`hayvan-option ${asiForm.hayvanId === h._id ? 'secili' : ''}`}
                                                                onClick={() => setAsiForm({ ...asiForm, hayvanId: h._id })}
                                                            >
                                                                <span><strong>{h.isim}</strong> ({h.kupeNo})</span>
                                                                <span className="badge">{hayvanTipiLabel[h.tip]}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </HayvanSecimWrap>
                                            </FormGroup>
                                        </FormRow>

                                        <FormRow>
                                            <FormGroup>
                                                <label>Uygulama Tarihi *</label>
                                                <input type="date" value={asiForm.uygulamaTarihi} onChange={e => setAsiForm({ ...asiForm, uygulamaTarihi: e.target.value })} required />
                                            </FormGroup>
                                            <FormGroup>
                                                <label>Sonraki Aşı Tarihi</label>
                                                <input type="date" value={asiForm.sonrakiTarih} onChange={e => setAsiForm({ ...asiForm, sonrakiTarih: e.target.value })} />
                                            </FormGroup>
                                        </FormRow>

                                        <FormRow>
                                            <FormGroup>
                                                <label>Tekrar Periyodu (gün)</label>
                                                <input type="number" value={asiForm.tekrarPeriyodu} onChange={e => setAsiForm({ ...asiForm, tekrarPeriyodu: e.target.value })} placeholder="Ör: 180" min="0" />
                                            </FormGroup>
                                            <FormGroup>
                                                <label>Doz</label>
                                                <input type="text" value={asiForm.doz} onChange={e => setAsiForm({ ...asiForm, doz: e.target.value })} placeholder="Ör: 2 ml" />
                                            </FormGroup>
                                        </FormRow>

                                        <FormRow>
                                            <FormGroup>
                                                <label>Uygulayan</label>
                                                <input type="text" value={asiForm.uygulayan} onChange={e => setAsiForm({ ...asiForm, uygulayan: e.target.value })} placeholder="Veteriner adı" />
                                            </FormGroup>
                                            <FormGroup>
                                                <label>Maliyet (₺)</label>
                                                <input type="number" value={asiForm.maliyet} onChange={e => setAsiForm({ ...asiForm, maliyet: e.target.value })} placeholder="0" min="0" />
                                            </FormGroup>
                                        </FormRow>

                                        <FormGroup>
                                            <label>Notlar</label>
                                            <textarea value={asiForm.notlar} onChange={e => setAsiForm({ ...asiForm, notlar: e.target.value })} placeholder="Ek notlar..." />
                                        </FormGroup>

                                        <SubmitBtn type="submit" style={{ background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)' }}>
                                            Kaydet
                                        </SubmitBtn>
                                    </form>
                                </>
                            )}
                        </ModalBox>
                    </Overlay>
                )}
            </BodyWrap>
        </PageContainer>
    );
}

export default SaglikMerkezi;
