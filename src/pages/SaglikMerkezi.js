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

// ── Page Header ───────────────────────────────────────────────
const PageHeader = styled.div`
  background: linear-gradient(135deg, #881337 0%, #be123c 50%, #e11d48 100%);
  padding: 28px 32px 0;
  position: relative; overflow: hidden;
  &::after {
    content: ''; position: absolute; right: -60px; top: -60px;
    width: 260px; height: 260px; border-radius: 50%;
    background: rgba(255,255,255,0.06); pointer-events: none;
  }
  @media (max-width: 768px) {
    padding: 20px 16px 0;
  }
`;
const HeaderTop = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 16px; margin-bottom: 24px;
`;
const HeaderLeft = styled.div`display: flex; align-items: center; gap: 14px;`;
const HeaderIcon = styled.div`
  width: 52px; height: 52px; border-radius: 16px;
  background: rgba(255,255,255,0.18); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.25);
`;
const HeaderTitle = styled.h1`
  margin: 0; font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.3px;
`;
const HeaderSub = styled.p`margin: 3px 0 0; font-size: 13px; color: rgba(255,255,255,0.65); font-weight: 400;`;
const BtnGroup = styled.div`display: flex; gap: 10px; flex-wrap: wrap;`;
const AddButton = styled.button`
  display: flex; align-items: center; gap: 8px; padding: 10px 20px;
  border-radius: 10px; font-weight: 700; font-size: 13px;
  cursor: pointer; transition: all .2s; white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  background: ${p => p.$secondary ? 'rgba(255,255,255,0.15)' : '#fff'};
  color: ${p => p.$secondary ? '#fff' : '#be123c'};
  border: ${p => p.$secondary ? '1px solid rgba(255,255,255,0.3)' : 'none'};
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(0,0,0,0.18);
    background: ${p => p.$secondary ? 'rgba(255,255,255,0.25)' : '#fff1f2'};
  }
  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 13px;
    min-height: 44px;
    span { display: none; }
  }
`;

// ── Stat Strip ────────────────────────────────────────────────
const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0;
  background: rgba(255,255,255,0.08);
  border-top: 1px solid rgba(255,255,255,0.12);

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;
const StatCard = styled.div`
  padding: 18px 24px; display: flex; align-items: center; gap: 14px;
  border-right: 1px solid rgba(255,255,255,0.12);
  &:last-child { border-right: none; }
  transition: background .2s;
  &:hover { background: rgba(255,255,255,0.07); }

  @media (max-width: 768px) {
    padding: 14px 16px;
    gap: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    &:nth-child(2n) { border-right: none; }
  }
`;
const StatIcon = styled.div`
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  background: rgba(255,255,255,0.15); color: #fff;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
`;
const StatInfo = styled.div`
  .value { font-size: 24px; font-weight: 900; color: #fff; line-height: 1; }
  .label { font-size: 11px; color: rgba(255,255,255,0.6); font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.4px; margin-top: 3px; }
`;

// ── Body ─────────────────────────────────────────────────────
const BodyWrap = styled.div`
  padding: 24px;
  @media (max-width: 768px) { padding: 16px; }
`;

const TabLayout = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
`;

const TabContent = styled.div`
  flex: 1;
  width: 100%;
  min-width: 0;
`;




const TabBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: transparent;
  margin-bottom: 22px;
  width: 100%;
  max-width: 300px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    flex-direction: row;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 4px;
    margin-bottom: 16px;
    gap: 6px;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }
`;
const Tab = styled.button`
  padding: 12px 18px; border: none; border-radius: 12px;
  cursor: pointer; font-weight: 700; font-size: 14px;
  white-space: nowrap; transition: all 0.2s;
  display: flex; align-items: center; justify-content: flex-start; gap: 12px;
  background: ${p => p.active ? 'linear-gradient(135deg, #be123c, #e11d48)' : '#fff'};
  color: ${p => p.active ? '#fff' : '#475569'};
  box-shadow: ${p => p.active ? '0 4px 12px rgba(190,18,60,.25)' : '0 1px 3px rgba(0,0,0,0.05)'};
  border: 1px solid ${p => p.active ? 'transparent' : '#e2e8f0'};
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 14px rgba(0,0,0,.1);
    color: ${p => p.active ? '#fff' : '#be123c'};
  }

  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 13px;
    border-radius: 20px;
    gap: 6px;
    flex-shrink: 0;
    &:hover { transform: none; }
  }
`;

const FilterRow = styled.div`
  display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; align-items: center;
`;
const FilterSelect = styled.select`
  padding: 8px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 13px; background: #f8fafc; color: #475569; cursor: pointer; font-weight: 500;
  &:focus { outline: none; border-color: #be123c; background: #fff; }
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: ${fadeIn} 0.7s ease;
`;

const RecordCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  display: flex;
  gap: 16px;
  transition: all 0.2s;
  border-left: 5px solid ${props => props.color};

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
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
        default: return { icon: <FaHeartbeat />, color: '#607D8B', bg: '#ECEFF1', label: 'Diğer' };
    }
};

const getDurumBadge = (durum) => {
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
        if (openTab && ['kayitlar', 'asilar', 'yaklasan', 'ai', 'veterinerler'].includes(openTab)) {
            setAktifTab(openTab);
        }
    }, [openTab]);
    const [kayitlar, setKayitlar] = useState([]);
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

    // Form state
    const [form, setForm] = useState({
        hayvanId: '', hayvanTipi: 'inek', tip: 'hastalik',
        tarih: new Date().toISOString().split('T')[0],
        tani: '', belirtiler: '', tedavi: '', veteriner: '',
        maliyet: '', durum: 'devam_ediyor', sonrakiKontrol: '', notlar: ''
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

    // Sağlık kaydı oluştur
    const handleSaglikSubmit = async (e) => {
        e.preventDefault();
        if (!form.hayvanId) {
            toast.error('Lütfen bir hayvan seçin');
            return;
        }
        try {
            const seciliHayvan = hayvanlar.find(h => h._id === form.hayvanId);
            const data = {
                ...form,
                hayvanTipi: seciliHayvan?.tip || form.hayvanTipi,
                hayvanIsim: seciliHayvan?.isim || '',
                hayvanKupeNo: seciliHayvan?.kupeNo || '',
                belirtiler: form.belirtiler ? form.belirtiler.split(',').map(s => s.trim()) : [],
                maliyet: parseFloat(form.maliyet) || 0,
                sonrakiKontrol: form.sonrakiKontrol || undefined
            };

            await api.createSaglikKaydi(data);
            toast.success('Sağlık kaydı oluşturuldu! 🏥');
            setModalAcik(false);
            resetForms();
            veriYukle();
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
        } catch (error) {
            toast.error(error.response?.data?.message || 'Güncellenemedi');
        }
    };

    const resetForms = () => {
        setForm({
            hayvanId: '', hayvanTipi: 'inek', tip: 'hastalik',
            tarih: new Date().toISOString().split('T')[0],
            tani: '', belirtiler: '', tedavi: '', veteriner: '',
            maliyet: '', durum: 'devam_ediyor', sonrakiKontrol: '', notlar: ''
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
        const tipUygun = !hayvanTipFiltre || h.tip === hayvanTipFiltre;
        const aramaUygun = !hayvanArama.trim() ||
            (h.isim && h.isim.toLowerCase().includes(hayvanArama.toLowerCase().trim())) ||
            (h.kupeNo && h.kupeNo.toLowerCase().includes(hayvanArama.toLowerCase().trim()));
        return tipUygun && aramaUygun;
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
                <StatGrid>
                    <StatCard>
                        <StatIcon><FaHeartbeat /></StatIcon>
                        <StatInfo>
                            <div className="value">{istatistikler?.aktifTedavi || 0}</div>
                            <div className="label">Aktif Tedavi</div>
                        </StatInfo>
                    </StatCard>
                    <StatCard>
                        <StatIcon><FaSyringe /></StatIcon>
                        <StatInfo>
                            <div className="value">{istatistikler?.buAyAsi || 0}</div>
                            <div className="label">Bu Ay Aşı</div>
                        </StatInfo>
                    </StatCard>
                    <StatCard>
                        <StatIcon><FaClock /></StatIcon>
                        <StatInfo>
                            <div className="value">{istatistikler?.yaklasanKontrol || 0}</div>
                            <div className="label">Yaklaşan Kontrol</div>
                        </StatInfo>
                    </StatCard>
                    <StatCard>
                        <StatIcon><FaMoneyBillWave /></StatIcon>
                        <StatInfo>
                            <div className="value">₺{(istatistikler?.aylikMaliyet || 0).toLocaleString('tr-TR')}</div>
                            <div className="label">Aylık Sağlık Gideri</div>
                        </StatInfo>
                    </StatCard>
                </StatGrid>
            </PageHeader>

            <BodyWrap>
                <TabLayout>
                    {/* TAB BAR */}
                    <TabBar>
                        <Tab active={aktifTab === 'kayitlar'} onClick={() => setAktifTab('kayitlar')}>
                            🏥 Sağlık Kayıtları
                        </Tab>
                        <Tab active={aktifTab === 'asilar'} onClick={() => setAktifTab('asilar')}>
                            💉 Aşı Takvimi
                        </Tab>
                        <Tab active={aktifTab === 'yaklasan'} onClick={() => setAktifTab('yaklasan')}>
                            ⏰ Yaklaşan İşlemler
                        </Tab>

                        <Tab active={aktifTab === 'ai'} onClick={() => setAktifTab('ai')}
                            style={{
                                background: aktifTab === 'ai' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'linear-gradient(135deg,#faf5ff,#f3e8ff)',
                                color: aktifTab === 'ai' ? '#fff' : '#7c3aed',
                                borderColor: aktifTab === 'ai' ? 'transparent' : '#ddd6fe',
                                fontWeight: 800
                            }}>
                            <FaRobot /> 🤖 AI Danışman
                            {aktifTab !== 'ai' && <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: 999, fontWeight: 800, marginLeft: 2 }}>AI</span>}
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
                                        kayitlar.map(k => {
                                            const style = getTipStyle(k.tip);
                                            const durumBadge = getDurumBadge(k.durum);
                                            return (
                                                <RecordCard key={k._id} color={style.color}>
                                                    <RecordIcon bg={style.bg} color={style.color}>
                                                        {style.icon}
                                                    </RecordIcon>
                                                    <RecordContent>
                                                        <div className="top-row">
                                                            <div>
                                                                <h3>{k.tani}</h3>
                                                                <div className="hayvan-info">
                                                                    {hayvanTipiLabel[k.hayvanTipi] || k.hayvanTipi}
                                                                    {k.hayvanIsim && ` • ${k.hayvanIsim}`}
                                                                    {k.hayvanKupeNo && ` (${k.hayvanKupeNo})`}
                                                                </div>
                                                            </div>
                                                            <Badge bg={durumBadge.bg} color={durumBadge.color}>
                                                                {durumBadge.label}
                                                            </Badge>
                                                        </div>
                                                        {k.tedavi && <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>💊 {k.tedavi}</div>}
                                                        <div className="detail-row">
                                                            <span className="detail"><FaCalendarAlt /> {new Date(k.tarih).toLocaleDateString('tr-TR')}</span>
                                                            {k.veteriner && <span className="detail"><FaStethoscope /> {k.veteriner}</span>}
                                                            {k.maliyet > 0 && <span className="detail"><FaMoneyBillWave /> ₺{k.maliyet.toLocaleString('tr-TR')}</span>}
                                                            {k.sonrakiKontrol && <span className="detail"><FaClock /> Kontrol: {new Date(k.sonrakiKontrol).toLocaleDateString('tr-TR')}</span>}
                                                        </div>
                                                    </RecordContent>
                                                    <ActionBtns>
                                                        {k.durum === 'devam_ediyor' && (
                                                            <button className="iyilesti" onClick={() => handleIyilesti(k._id)} title="İyileşti olarak işaretle">
                                                                <FaCheckCircle /> İyileşti
                                                            </button>
                                                        )}
                                                        <button className="delete" onClick={() => handleSil(k._id, 'saglik')}><FaTrash /></button>
                                                    </ActionBtns>
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
                                                        <RecordCard key={a._id} color={grp.color}>
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
                        {aktifTab === 'yaklasan' && (
                            <CardList>
                                {(() => {
                                    const yaklasanItems = [
                                        ...kayitlar
                                            .filter(k => k.sonrakiKontrol && k.durum === 'devam_ediyor')
                                            .map(k => ({ ...k, _itemType: 'kontrol', _sortDate: k.sonrakiKontrol })),
                                        ...asilar
                                            .filter(a => a.sonrakiTarih && a.durum !== 'yapildi')
                                            .map(a => ({ ...a, _itemType: 'asi', _sortDate: a.sonrakiTarih }))
                                    ].sort((a, b) => new Date(a._sortDate) - new Date(b._sortDate));

                                    if (yaklasanItems.length === 0) {
                                        return (
                                            <EmptyState>
                                                <FaCheckCircle />
                                                <p>Yaklaşan işlem yok — her şey yolunda! 🎉</p>
                                            </EmptyState>
                                        );
                                    }

                                    return yaklasanItems.map(item => {
                                        const gecikti = new Date(item._sortDate) < new Date();
                                        if (item._itemType === 'kontrol') {
                                            return (
                                                <RecordCard key={item._id} color={gecikti ? '#f44336' : '#2196F3'}>
                                                    <RecordIcon bg={gecikti ? '#FFEBEE' : '#E3F2FD'} color={gecikti ? '#f44336' : '#2196F3'}>
                                                        <FaStethoscope />
                                                    </RecordIcon>
                                                    <RecordContent>
                                                        <div className="top-row">
                                                            <h3>Kontrol: {item.tani}</h3>
                                                            <Badge bg={gecikti ? '#FFEBEE' : '#E3F2FD'} color={gecikti ? '#C62828' : '#1565C0'}>
                                                                {gecikti ? '⚠️ GECİKTİ' : `📅 ${new Date(item.sonrakiKontrol).toLocaleDateString('tr-TR')}`}
                                                            </Badge>
                                                        </div>
                                                        <div className="hayvan-info">
                                                            {hayvanTipiLabel[item.hayvanTipi]} {item.hayvanIsim && `• ${item.hayvanIsim}`}
                                                        </div>
                                                    </RecordContent>
                                                </RecordCard>
                                            );
                                        } else {
                                            return (
                                                <RecordCard key={item._id} color={gecikti ? '#f44336' : '#9C27B0'}>
                                                    <RecordIcon bg={gecikti ? '#FFEBEE' : '#F3E5F5'} color={gecikti ? '#f44336' : '#9C27B0'}>
                                                        <FaSyringe />
                                                    </RecordIcon>
                                                    <RecordContent>
                                                        <div className="top-row">
                                                            <h3>Aşı: {item.asiAdi}</h3>
                                                            <Badge bg={gecikti ? '#FFEBEE' : '#F3E5F5'} color={gecikti ? '#C62828' : '#7B1FA2'}>
                                                                {gecikti ? '⚠️ GECİKTİ' : `📅 ${new Date(item.sonrakiTarih).toLocaleDateString('tr-TR')}`}
                                                            </Badge>
                                                        </div>
                                                        <div className="hayvan-info">
                                                            {item.hayvanTipi === 'hepsi' ? '🐄 Toplu' : hayvanTipiLabel[item.hayvanTipi]}
                                                            {item.hayvanIsim && ` • ${item.hayvanIsim}`}
                                                        </div>
                                                    </RecordContent>
                                                </RecordCard>
                                            );
                                        }
                                    });
                                })()}
                            </CardList>
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
