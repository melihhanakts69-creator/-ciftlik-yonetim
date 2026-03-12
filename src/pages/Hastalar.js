import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';
import { indirRecetePdf } from '../utils/recetePdf';
import { indirCiftlikSaglikRaporu } from '../utils/ciftlikSaglikRaporu';

const Page = styled.div`
  display: flex;
  height: calc(100vh - 70px);
  min-height: 500px;
  background-color: #f8fafc;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  position: relative;
  overflow: hidden;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: 
      radial-gradient(circle at 10% 20%, rgba(14, 165, 233, 0.04) 0%, transparent 40%),
      radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 40%);
    z-index: -1;
    pointer-events: none;
  }
  @media (max-width: 900px) { flex-direction: column; height: auto; min-height: auto; }
`;

const Sidebar = styled.aside`
  width: 320px;
  min-width: 300px;
  background: #ffffff;
  border-right: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 10px 0 30px -10px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  z-index: 2;
  @media (max-width: 900px) { width: 100%; border-right: none; border-bottom: 1px solid rgba(226, 232, 240, 0.8); max-height: 40vh; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.03); }
`;

const SidebarHeader = styled.div`
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  background: #ffffff;

  .bubble {
    background: linear-gradient(135deg, #1e40af 0%, #2563eb 55%, #0ea5e9 100%);
    padding: 20px 22px;
    display: flex;
    align-items: center;
    gap: 14px;
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute; right: -20px; top: -20px;
      width: 100px; height: 100px; border-radius: 50%;
      background: rgba(255,255,255,0.06);
    }
  }

  .bubble-icon {
    font-size: 30px; flex-shrink: 0; z-index: 1;
  }

  .bubble-texts { z-index: 1; }

  .bubble-title {
    font-size: 13px; font-weight: 900; color: #fff;
    letter-spacing: 0.08em; text-transform: uppercase;
    margin-bottom: 3px;
  }

  .bubble-sub {
    font-size: 11px; color: rgba(255,255,255,0.65);
    font-weight: 600; letter-spacing: 0.02em;
  }

  .search-wrap {
    padding: 14px 18px 16px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 11px 14px 11px 38px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  box-sizing: border-box;
  background: #f8fafc;
  transition: all 0.2s;
  &:focus { outline: none; border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
  &::placeholder { color: #94a3b8; }
`;

const FarmList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FarmItem = styled.div`
  padding: 16px 20px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border: 2px solid transparent;
  ${p => p.$active ? `
    background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); 
    box-shadow: 0 8px 20px -5px rgba(37, 99, 235, 0.3);
    transform: translateY(-2px) scale(1.01);
    .name { color: #ffffff; }
    .sub { color: rgba(255,255,255,0.8); }
  ` : `
    background: #ffffff;
    border-color: #f1f5f9;
    box-shadow: 0 4px 15px -5px rgba(0,0,0,0.03);
    .name { color: #0f172a; }
    .sub { color: #64748b; }
  `}
  &:hover { 
    ${p => !p.$active && `
      background: #f8fafc; 
      border-color: #e2e8f0; 
      transform: translateY(-2px);
      box-shadow: 0 6px 16px -5px rgba(0,0,0,0.05);
    `}
  }
  .name { font-weight: 800; font-size: 15px; line-height: 1.2; margin-bottom: 4px; letter-spacing: -0.01em;}
  .sub { font-size: 13px; font-weight: 600;}
`;

const AddFarmBlock = styled.div`
  padding: 14px 18px;
  border-top: 1px solid #f1f5f9;
  background: #fafbfd;

  .add-main-btn {
    width: 100%; padding: 11px 16px;
    border: 1.5px dashed #bfdbfe; border-radius: 10px;
    background: #fff; color: #2563eb;
    font-size: 13px; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: all 0.2s;
    &:hover { border-color: #2563eb; background: #eff6ff; }
  }

  .form-label {
    font-size: 11px; font-weight: 700; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.06em;
    margin-bottom: 6px;
  }

  .id-input {
    width: 100%; padding: 10px 12px;
    border: 1.5px solid #e2e8f0; border-radius: 8px;
    font-size: 13px; box-sizing: border-box; margin-bottom: 8px;
    &:focus { outline: none; border-color: #2563eb; }
  }

  .btn-row { display: flex; gap: 8px; }

  .submit-btn {
    flex: 2; padding: 10px 14px; border-radius: 8px;
    border: none; background: #2563eb; color: #fff;
    font-size: 13px; font-weight: 700; cursor: pointer;
    transition: all 0.15s;
    &:hover:not(:disabled) { background: #1d4ed8; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }

  .cancel-btn {
    flex: 1; padding: 10px 14px; border-radius: 8px;
    border: 1px solid #e2e8f0; background: #fff;
    color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer;
    &:hover { background: #f1f5f9; }
  }
`;

const DetailPanel = styled.div`
  flex: 1;
  overflow-y: auto;
  background: transparent;
  padding: 32px 40px;
  @media (max-width: 1024px) { padding: 24px; }
  @media (max-width: 900px) { min-height: 50vh; padding: 24px 20px; }
`;

const EmptyStateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0 16px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 40px -12px rgba(0,0,0,0.08);
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.9);
`;

const EmptyStateBar = styled.div`
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #1e40af 70%, #2563eb 100%);
  padding: 28px 32px 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
  }
  &::after {
    content: '';
    position: absolute;
    bottom: -40px; left: -40px;
    width: 120px; height: 120px;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.2);
  }

  .bar-inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .bar-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .bar-icon {
    width: 52px; height: 52px;
    border-radius: 14px;
    background: rgba(255,255,255,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
  }
  .bar-title {
    font-size: 20px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.02em;
    margin: 0 0 4px;
  }
  .bar-sub {
    font-size: 13px;
    color: rgba(255,255,255,0.75);
    font-weight: 600;
  }

  .bar-stats {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .stat-pill {
    padding: 8px 16px;
    border-radius: 12px;
    background: rgba(255,255,255,0.12);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const EmptyDetail = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  color: #64748b;
  font-size: 15px;
  text-align: center;
  padding: 32px 40px;
  font-weight: 600;
  border-top: 1px solid #e2e8f0;
  background: linear-gradient(180deg, #fafbfd 0%, #ffffff 100%);
`;

const DetailHeader = styled.div`
  margin-bottom: 48px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .farm-name { font-size: 42px; font-weight: 900; color: #0f172a; margin: 0; line-height: 1.1; letter-spacing: -0.03em; }
  .farm-sub { font-size: 18px; color: #64748b; font-weight: 600;}
`;

const Block = styled.section`
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 30px -10px rgba(0,0,0,0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
  h4 { font-size: 15px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 20px; display: flex; align-items: center; gap: 8px;}
  h4::before { content: ''; display: block; width: 4px; height: 18px; border-radius: 4px; background: #3b82f6; }
`;

const HayvanFiltreRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  .kategori-wrap { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .kategori-wrap span { font-size: 12px; font-weight: 600; color: #64748b; margin-right: 4px; }
  .kategori-btn {
    padding: 8px 14px;
    border-radius: 10px;
    border: 1px solid #e0f2fe;
    background: #fff;
    color: #0369a1;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .kategori-btn:hover { background: #f0f9ff; border-color: #0ea5e9; }
  .kategori-btn.active { background: #0ea5e9; color: #fff; border-color: #0ea5e9; }
  .kupe-search { flex: 1; min-width: 180px; max-width: 260px; padding: 10px 14px; border: 1px solid #e0f2fe; border-radius: 10px; font-size: 13px; }
  .kupe-search:focus { outline: none; border-color: #0ea5e9; }
  .kupe-search::placeholder { color: #94a3b8; }
`;

const AnimalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AnimalCard = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  background: #ffffff;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 15px -5px rgba(0,0,0,0.02);

  &:hover {
    box-shadow: 0 8px 20px -8px rgba(14, 165, 233, 0.12);
    border-color: #bae6fd;
    transform: translateY(-2px) scale(1.01);
  }

  .row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .kupe { font-weight: 800; color: #0f172a; font-size: 16px; letter-spacing: -0.01em;}
  .tag { font-size: 11px; padding: 4px 10px; border-radius: 20px; background: #e0f2fe; color: #0284c7; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;}
  .info { font-size: 13px; color: #64748b; margin-bottom: 20px; font-weight: 600; line-height: 1.5;}

  .actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .actions button { padding: 10px 14px; border-radius: 10px; border: none; font-size: 12px; font-weight: 800; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); flex: 1; display:flex; justify-content:center; align-items: center; gap: 6px;}
  .btn-saglik { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; box-shadow: 0 4px 10px -4px rgba(16, 185, 129, 0.3);}
  .btn-saglik:hover { transform: translateY(-1px); box-shadow: 0 6px 14px -5px rgba(16, 185, 129, 0.4);}
  .btn-tohum { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #fff; box-shadow: 0 4px 10px -4px rgba(59, 130, 246, 0.3);}
  .btn-tohum:hover { transform: translateY(-1px); box-shadow: 0 6px 14px -5px rgba(59, 130, 246, 0.4);}
  @media (max-width: 768px) {
    .actions button { min-height: 44px; }
  }
`;

const KayitList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const KayitItem = styled.div`
  padding: 18px 24px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 8px -2px rgba(0,0,0,0.02);
  
  &:hover { box-shadow: 0 6px 16px -4px rgba(0,0,0,0.04); transform: translateY(-1px); border-color: #cbd5e1; }
  .icon-box { 
    width: 44px; height: 44px; border-radius: 12px; 
    background: ${p => p.$bg || '#f1f5f9'}; color: ${p => p.$color || '#64748b'}; 
    display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;
  }
  .content { flex: 1; min-width: 0; }
  .baslik { font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px; letter-spacing: -0.01em;}
  .alt { font-size: 13px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;}
  .tarih { font-size: 12px; color: #94a3b8; white-space: nowrap; font-weight: 600;}
  .line1 { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
  .line2 { font-size: 12px; color: #64748b; }
  .btn-pdf { flex-shrink: 0; padding: 8px 14px; border-radius: 10px; font-size: 12px; font-weight: 600; border: 1px solid #e2e8f0; background: #f8fafc; color: #0ea5e9; cursor: pointer; }
  .btn-pdf:hover { background: #e0f2fe; border-color: #0ea5e9; }
  
  @media (max-width: 600px) { flex-direction: column; align-items: flex-start; gap: 8px; .tarih { align-self: flex-start; } }
`;

const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
`;

const ModalBox = styled.div`
  background: #fff; width: 100%; max-width: 520px; border-radius: 14px; box-shadow: 0 24px 48px rgba(0,0,0,0.18);
  max-height: 92vh; overflow-y: auto;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
  .modal-header { background: #f8fafc; padding: 18px 24px; border-bottom: 1px solid #e5e7eb; }
  .modal-header h2 { margin: 0; font-size: 17px; font-weight: 700; color: #111827; }
  .modal-header .sub { font-size: 13px; color: #6b7280; margin-top: 4px; }
  .modal-body { padding: 24px; }
  .hayvan-badge { display: inline-flex; align-items: center; gap: 8px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 10px 14px; border-radius: 8px; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
  .hayvan-badge .tip { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.9; }
  .form-section { margin-bottom: 20px; }
  .form-section-title { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
  .form-group { margin-bottom: 16px; }
  .form-group:last-child { margin-bottom: 0; }
  .form-group label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
  .form-group input, .form-group textarea { width: 100%; padding: 12px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box; transition: border-color 0.2s; }
  .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #2563eb; }
  .form-group textarea { min-height: 80px; resize: vertical; }
  .modal-footer { padding: 0 24px 24px; display: flex; gap: 12px; }
  .btn-submit { flex: 2; background: #2563eb; color: white; border: none; padding: 14px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .btn-submit:hover { background: #1d4ed8; }
  .btn-cancel { flex: 1; background: #f3f4f6; color: #374151; border: none; padding: 14px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .btn-cancel:hover { background: #e5e7eb; }
`;

const ScoreBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  background: ${p => p.$bg || '#f1f5f9'};
  color: ${p => p.$color || '#64748b'};
  white-space: nowrap;
  flex-shrink: 0;
`;

const ModalSelect = styled.select`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  box-sizing: border-box;
  transition: border-color 0.2s;
  cursor: pointer;
  &:focus { outline: none; border-color: #2563eb; }
`;

const ProtocolHint = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12px;
  color: #1e40af;
  margin-bottom: 12px;
  strong { font-weight: 700; }
`;

const AnamnezGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 4px;
`;

const PdfRaporBtn = styled.button`
  padding: 10px 18px;
  border-radius: 10px;
  border: 1px solid #e0f2fe;
  background: #f0f9ff;
  color: #0284c7;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  &:hover { background: #bae6fd; border-color: #0ea5e9; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const AsiModal = styled.div`
  .asi-form { display: flex; flex-direction: column; gap: 12px; }
  .asi-form input, .asi-form select { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; box-sizing: border-box; }
  .asi-form input:focus, .asi-form select:focus { outline: none; border-color: #2563eb; }
  .asi-form label { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px; display: block; }
  .asi-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
`;

const ArinmaBox = styled.div`
  border: 1.5px solid #fde68a;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 8px;

  &.aktif { border-color: #f59e0b; }

  .ar-toggle {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 14px; background: #fffbeb;
    cursor: pointer; user-select: none;
    transition: background 0.15s;
  }
  .ar-toggle:hover { background: #fef3c7; }
  .ar-icon { font-size: 17px; flex-shrink: 0; }
  .ar-texts { flex: 1; }
  .ar-title { font-size: 13px; font-weight: 800; color: #92400e; }
  .ar-sub   { font-size: 11px; color: #b45309; margin-top: 1px; }
  .ar-chk   {
    width: 20px; height: 20px; border-radius: 6px;
    border: 2px solid ${p => p.$aktif ? '#f59e0b' : '#d1d5db'};
    background: ${p => p.$aktif ? '#f59e0b' : '#fff'};
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.15s; color: #fff; font-size: 12px; font-weight: 900;
  }

  .ar-body {
    padding: 14px 16px;
    border-top: 1.5px solid #fde68a;
    background: #fffbeb;
    display: flex; flex-direction: column; gap: 12px;
  }
  .ar-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .ar-field label {
    display: block; font-size: 11px; font-weight: 700;
    color: #92400e; margin-bottom: 4px;
    text-transform: uppercase; letter-spacing: 0.04em;
  }
  .ar-field input {
    width: 100%; padding: 9px 12px; border: 1.5px solid #fde68a;
    border-radius: 8px; font-size: 13px; box-sizing: border-box;
    background: #fff; font-family: inherit;
  }
  .ar-field input:focus { outline: none; border-color: #f59e0b; }
  .ar-warning {
    background: #fef2f2; border: 1px solid #fecaca;
    border-radius: 8px; padding: 9px 12px;
    font-size: 12px; font-weight: 600; color: #b91c1c;
    line-height: 1.5;
  }
`;

const ArinmaUyariPanel = styled.div`
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border: 1.5px solid #f59e0b;
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 20px;

  .au-title {
    font-size: 13px; font-weight: 900; color: #92400e;
    display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
  }
  .au-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px 12px; background: #fff; border-radius: 10px;
    border: 1px solid #fde68a; margin-bottom: 8px;
  }
  .au-item:last-child { margin-bottom: 0; }
  .au-dot { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .au-texts { flex: 1; min-width: 0; }
  .au-hayvan { font-size: 13px; font-weight: 800; color: #0f172a; }
  .au-detail { font-size: 12px; color: #92400e; margin-top: 2px; }
  .au-kalan { font-size: 11px; font-weight: 700; color: #b91c1c; white-space: nowrap; flex-shrink: 0; }
`;

const FaturaBolumu = styled.div`
  margin-top: 8px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s;

  &.active { border-color: #2563eb; }

  .toggle-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 16px;
    background: #f8fafc;
    cursor: pointer;
    user-select: none;
    transition: background 0.15s;
  }
  .toggle-row:hover { background: #f1f5f9; }

  .toggle-icon { font-size: 18px; flex-shrink: 0; }
  .toggle-texts { flex: 1; }
  .toggle-title { font-size: 13px; font-weight: 800; color: #374151; }
  .toggle-sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .toggle-arrow {
    font-size: 13px; font-weight: 900;
    color: ${p => p.$active ? '#2563eb' : '#94a3b8'};
    background: ${p => p.$active ? '#eff6ff' : '#f1f5f9'};
    border-radius: 50%; width: 24px; height: 24px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.2s;
  }

  .fatura-body {
    padding: 16px;
    border-top: 1.5px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: #fff;
  }

  .f-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .f-field label {
    display: block; font-size: 11px; font-weight: 700;
    color: #6b7280; margin-bottom: 5px;
    text-transform: uppercase; letter-spacing: 0.04em;
  }
  .f-field input, .f-field select {
    width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0;
    border-radius: 8px; font-size: 13px; box-sizing: border-box;
    background: #fafbfc; font-family: inherit;
    transition: border-color 0.15s;
  }
  .f-field input:focus, .f-field select:focus {
    outline: none; border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
  }

  .pesin-badge {
    background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;
    border-radius: 8px; padding: 9px 14px; font-size: 12px; font-weight: 700;
  }
  .vadeli-badge {
    background: #fef9c3; color: #854d0e; border: 1px solid #fde68a;
    border-radius: 8px; padding: 9px 14px; font-size: 12px; font-weight: 700;
  }
`;

const tipEtiket = { hastalik: 'Hastalık', tedavi: 'Tedavi', asi: 'Aşı', muayene: 'Muayene', ameliyat: 'Ameliyat', dogum_komplikasyonu: 'Doğum' };

// ─── Sabit Veteriner Listeleri ────────────────────────────────────────────────
const SIK_HASTALIKLAR = [
  'Mastitis', 'Süt Humması', 'Ketozis', 'Rumen Asidozu', 'Şap',
  'Brucella', 'Topallık', 'Döl Tutmaması', 'Doğum Felci', 'Metritis',
  'Pnömoni', 'İshal', 'Karın Şişkinliği (Timpani)', 'Göz İltihabı',
  'Yavru Atma', 'Ağız Yarası', 'Parazitoz', 'Hipomagnezemi',
  'Karaciğer Yağlanması', 'Laminitis', 'Yanık Hastalığı', 'Nekrobazilloz',
];

const INEK_IRKLARI = [
  'Holstein', 'Simental', 'Montofon', 'Jersey', 'Brown Swiss',
  'Esmer', 'Yerli Kara', 'Doğu Anadolu Kırmızısı', 'Boz Irk',
  'Kangal', 'Şarole', 'Limuzin', 'Angus', 'Hereford',
];

const TOHUM_CINSLERI = [
  'Holstein', 'Simental', 'Montofon', 'Jersey', 'Brown Swiss',
  'Angus', 'Hereford', 'Limuzin', 'Şarole', 'Esmer',
  'Sexed (Dişi Cinsiyet Ayrımlı)', 'Yerli Irk',
];

const SIK_ILACLAR = [
  // Antibiyotikler
  'Penstrep', 'Amoxicillin', 'Enrofloksasin', 'Oxytetrasiklin',
  'Tylosin', 'Seftiofur', 'Florfenikol', 'Ampisilin',
  // Anti-inflam
  'Metacam (Meloxicam)', 'Flunixin', 'Ketoprofen', 'Deksametazon',
  // Vitamin / Mineral
  'Ca-Mg-P Solüsyonu', 'Vitamin AD3E', 'Selen + Vit E', 'B12 Vitamini',
  'Kalsiyum Boroglükonat',
  // Paraziter
  'İvermektin', 'Albendazol', 'Fenbendazol',
  // Diğer
  'Oksitoksin', 'Progesteron', 'GnRH (Buserelin)',
];

const SIK_TOHUMLAR = [
  'Semen (Holstein)', 'Semen (Simental)', 'Semen (Montofon)',
  'Semen (Jersey)', 'Semen (Brown Swiss)', 'Semen (Angus)',
  'Semen (Hereford)', 'Semen (Limuzin)', 'Semen (Şarole)',
  'Sexed Semen (Holstein Dişi)', 'Sexed Semen (Simental Dişi)',
];

// ─── ComboSelect: Stok + Sabit Liste Birleşimi ───────────────────────────────
const ComboDropdown = styled.div`
  position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 200;
  background: #fff; border: 1.5px solid #e2e8f0; border-radius: 10px;
  box-shadow: 0 8px 24px rgba(15,23,42,0.12);
  max-height: 240px; overflow-y: auto;

  .combo-section { padding: 5px 0; }
  .combo-label {
    padding: 4px 12px; font-size: 10px; font-weight: 800;
    color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em;
  }
  .combo-item {
    padding: 8px 12px; cursor: pointer; font-size: 13px; font-weight: 600;
    color: #0f172a; display: flex; justify-content: space-between; align-items: center;
    transition: background 0.1s; border-radius: 0;
    &:hover { background: #eff6ff; color: #2563eb; }
  }
  .combo-badge { font-size: 10px; color: #94a3b8; font-weight: 500; }
`;

function ComboSelect({ value, onChange, placeholder, sabitListe, stoklar = [], stokKategoriler = [], multiWord = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const currentWord = multiWord
    ? (value || '').split(',').pop().trim()
    : (value || '').trim();

  const q = currentWord.toLowerCase();

  const stokFiltered = useMemo(() =>
    stoklar
      .filter(s => !stokKategoriler.length || stokKategoriler.includes(s.kategori))
      .filter(s => !q || (s.urunAdi || '').toLowerCase().includes(q))
      .slice(0, 6),
    [stoklar, stokKategoriler, q]
  );

  const sabitFiltered = useMemo(() =>
    sabitListe.filter(s => !q || s.toLowerCase().includes(q)).slice(0, 10),
    [sabitListe, q]
  );

  const showDropdown = open && (stokFiltered.length > 0 || sabitFiltered.length > 0);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (name) => {
    if (multiWord) {
      const parts = (value || '').split(',');
      parts[parts.length - 1] = ' ' + name;
      onChange(parts.join(',').replace(/^,\s*/, '').trimStart());
    } else {
      onChange(name);
    }
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
        onBlur={e => { if (!ref.current?.contains(e.relatedTarget)) setOpen(false); }}
      />
      {showDropdown && (
        <ComboDropdown>
          {stokFiltered.length > 0 && (
            <div className="combo-section">
              <div className="combo-label">📦 Stoğumdan</div>
              {stokFiltered.map((s, i) => (
                <div key={s._id || i} className="combo-item" onMouseDown={() => handleSelect(s.urunAdi)}>
                  {s.urunAdi}
                  <span className="combo-badge">{s.miktar ?? ''} {s.birim ?? ''}</span>
                </div>
              ))}
            </div>
          )}
          {sabitFiltered.length > 0 && (
            <div className="combo-section">
              <div className="combo-label">📋 Sık Kullanılanlar</div>
              {sabitFiltered.map((s, i) => (
                <div key={i} className="combo-item" onMouseDown={() => handleSelect(s)}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </ComboDropdown>
      )}
    </div>
  );
}



const StokDropdown = styled.ul`
  position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 200;
  margin: 0; padding: 6px; list-style: none;
  background: #fff; border: 1.5px solid #e2e8f0; border-radius: 10px;
  box-shadow: 0 8px 24px rgba(15,23,42,0.12);
  max-height: 210px; overflow-y: auto;

  li {
    padding: 9px 12px; border-radius: 7px; cursor: pointer;
    display: flex; justify-content: space-between; align-items: center;
    transition: background 0.12s;
    &:hover { background: #eff6ff; }
  }
  .sd-name { font-size: 13px; font-weight: 700; color: #0f172a; }
  .sd-meta { font-size: 11px; color: #94a3b8; font-weight: 500; }
`;

function StokAutocomplete({ value, onChange, placeholder, stoklar, kategoriler, multiWord = false, inputStyle = {} }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const currentWord = multiWord
    ? (value || '').split(',').pop().trim()
    : (value || '').trim();

  const filtered = useMemo(() => {
    if (!currentWord || currentWord.length < 1) return [];
    const q = currentWord.toLowerCase();
    return stoklar
      .filter(s => !kategoriler || kategoriler.includes(s.kategori))
      .filter(s => (s.urunAdi || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [stoklar, currentWord, kategoriler]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (name) => {
    let newValue;
    if (multiWord) {
      const parts = (value || '').split(',');
      parts[parts.length - 1] = ' ' + name;
      newValue = parts.join(',').replace(/^,\s*/, '').trimStart();
    } else {
      newValue = name;
    }
    onChange(newValue);
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => currentWord.length >= 1 && setOpen(true)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb',
          borderRadius: 8, fontSize: 13, boxSizing: 'border-box',
          fontFamily: 'inherit', transition: 'border-color 0.2s',
          ...inputStyle,
        }}
        onBlur={e => { if (!ref.current?.contains(e.relatedTarget)) setOpen(false); }}
      />
      {open && filtered.length > 0 && (
        <StokDropdown>
          {filtered.map((s, i) => (
            <li key={s._id || i} onMouseDown={() => handleSelect(s.urunAdi)}>
              <span className="sd-name">{s.urunAdi}</span>
              <span className="sd-meta">{s.kategori} · {s.miktar ?? ''} {s.birim ?? ''}</span>
            </li>
          ))}
        </StokDropdown>
      )}
    </div>
  );
}

export default function Hastalar() {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const [musteriler, setMusteriler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [arama, setArama] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [hayvanlar, setHayvanlar] = useState([]);
  const [saglikKayitlari, setSaglikKayitlari] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [addId, setAddId] = useState('');
  const [stoklar, setStoklar] = useState([]);
  const [adding, setAdding] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [secilenHayvan, setSecilenHayvan] = useState(null);
  const [islemTipi, setIslemTipi] = useState('hastalik');
  const [formData, setFormData] = useState({ tani: '', tedavi: '', ilacAd: '', notlar: '', maliyet: '' });
  const [hayvanKategori, setHayvanKategori] = useState('');
  const [hayvanKupeArama, setHayvanKupeArama] = useState('');

  // Geçmiş kayıtlar filtre + scroll ref
  const gecmisKayitlarRef = useRef(null);
  const [kayitTipFiltri, setKayitTipFiltri] = useState('');
  const [kayitHayvanFiltri, setKayitHayvanFiltri] = useState('');
  const [kayitTarihFiltri, setKayitTarihFiltri] = useState('');

  // Sağlık skoru
  const [saglikSkorlar, setSaglikSkorlar] = useState({});
  // Protokoller
  const [protokoller, setProtokoller] = useState([]);
  const [secilenProtokol, setSecilenProtokol] = useState('');
  // Anamnez alanları
  const [anamnez, setAnamnez] = useState({ sikayet: '', suresi: '', atesli: '', istah: '', bulgular: '' });
  // Aşı modal
  const [asiModalOpen, setAsiModalOpen] = useState(false);
  const [asiHayvan, setAsiHayvan] = useState(null);
  const [asiForm, setAsiForm] = useState({ asiAdi: '', uygulamaTarihi: '', sonrakiTarih: '', doz: '', notlar: '' });
  const [asiGonderiyor, setAsiGonderiyor] = useState(false);
  // PDF rapor
  const [raporYukleniyor, setRaporYukleniyor] = useState(false);
  // Protokol yönetim modal
  const [protokolModalOpen, setProtokolModalOpen] = useState(false);
  const [yeniProtokol, setYeniProtokol] = useState({ ad: '', hastalik: '', tip: 'hastalik', tani: '', tedaviNotu: '', ilaclar: [{ ilacAdi: '', doz: '', sure: '' }] });

  // Fatura Kes (işlem modallarında ortak)
  const initFatura = { enabled: false, tutar: '', odemeTipi: 'pesin', vadeTarihi: '' };
  const [faturaData, setFaturaData] = useState(initFatura);

  // Arınma Süresi Kalkanı
  const initArinma = { aktif: false, sut: '', et: '' };
  const [arinma, setArinma] = useState(initArinma);

  // Aktif arınma uyarıları — saglikKayitlari'ndan hesapla
  const aktifArinmalar = useMemo(() => {
    const bugun = new Date();
    return saglikKayitlari
      .filter(k => k.arinmaSuresiSut > 0 || k.arinmaSuresiEt > 0)
      .map(k => {
        const baslangic = k.tarih ? new Date(k.tarih) : new Date();
        const sutBitis = k.arinmaSuresiSut > 0
          ? new Date(baslangic.getTime() + k.arinmaSuresiSut * 86400000)
          : null;
        const etBitis = k.arinmaSuresiEt > 0
          ? new Date(baslangic.getTime() + k.arinmaSuresiEt * 86400000)
          : null;
        return {
          hayvan: k.hayvanKupeNo || k.hayvanIsim || 'Hayvan',
          tani: k.tani || '',
          sutAktif: sutBitis && sutBitis > bugun,
          sutBitis,
          sutGun: k.arinmaSuresiSut,
          etAktif: etBitis && etBitis > bugun,
          etBitis,
          etGun: k.arinmaSuresiEt,
        };
      })
      .filter(x => x.sutAktif || x.etAktif);
  }, [saglikKayitlari]);

  const filteredMusteriler = useMemo(() => {
    if (!arama.trim()) return musteriler;
    const q = arama.trim().toLowerCase();
    return musteriler.filter(m =>
      (m.isletmeAdi || '').toLowerCase().includes(q) ||
      (m.isim || '').toLowerCase().includes(q) ||
      (m.sehir || '').toLowerCase().includes(q)
    );
  }, [musteriler, arama]);

  const selectedMusteri = useMemo(() => musteriler.find(m => m._id === selectedId), [musteriler, selectedId]);

  const filteredHayvanlar = useMemo(() => {
    let list = hayvanlar;
    if (hayvanKategori) list = list.filter(h => h.tip === hayvanKategori);
    if (hayvanKupeArama.trim()) {
      const q = hayvanKupeArama.trim().toLowerCase();
      list = list.filter(h => (h.kupeNo || '').toLowerCase().includes(q) || (h.isim || '').toLowerCase().includes(q));
    }
    return list;
  }, [hayvanlar, hayvanKategori, hayvanKupeArama]);

  const filteredKayitlar = useMemo(() => {
    let list = saglikKayitlari;
    if (kayitTipFiltri) list = list.filter(k => k.tip === kayitTipFiltri || (kayitTipFiltri === 'tohumlama' && k.tani === 'Suni Tohumlama'));
    if (kayitHayvanFiltri.trim()) {
      const q = kayitHayvanFiltri.trim().toLowerCase();
      list = list.filter(k => (k.hayvanKupeNo || '').toLowerCase().includes(q) || (k.hayvanIsim || '').toLowerCase().includes(q));
    }
    if (kayitTarihFiltri) {
      const secilen = new Date(kayitTarihFiltri);
      const ay = secilen.getMonth();
      const yil = secilen.getFullYear();
      list = list.filter(k => {
        if (!k.tarih) return false;
        const t = new Date(k.tarih);
        return t.getMonth() === ay && t.getFullYear() === yil;
      });
    }
    return list;
  }, [saglikKayitlari, kayitTipFiltri, kayitHayvanFiltri, kayitTarihFiltri]);

  const fetchMusteriler = async () => {
    try {
      const res = await api.getVeterinerMusteriler();
      setMusteriler(res.data || []);
    } catch (e) {
      toast.error('Müşteriler alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoklar = async () => {
    try {
      const res = await api.getStoklar();
      const items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setStoklar((items || []).filter(s => s.kategori !== 'Yem'));
    } catch (_) {}
  };

  const fetchSaglikSkorlar = async () => {
    try {
      const res = await api.getVeterinerSaglikSkoru();
      const map = {};
      (res.data || []).forEach(s => { map[s.ciftciId] = s; });
      setSaglikSkorlar(map);
    } catch (_) {}
  };

  const fetchProtokoller = async () => {
    try {
      const res = await api.getVeterinerProtokoller();
      setProtokoller(res.data || []);
    } catch (_) {}
  };

  useEffect(() => {
    fetchMusteriler();
    fetchSaglikSkorlar();
    fetchProtokoller();
    fetchStoklar();
  }, []);

  useEffect(() => {
    if (urlId && urlId !== selectedId) setSelectedId(urlId);
  }, [urlId]);

  const selectFarm = (id) => {
    setSelectedId(id);
    if (id) navigate(`/hastalar/${id}`, { replace: true });
    else navigate('/hastalar', { replace: true });
  };

  useEffect(() => {
    setHayvanKategori('');
    setHayvanKupeArama('');
    setKayitTipFiltri('');
    setKayitHayvanFiltri('');
    setKayitTarihFiltri('');
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setHayvanlar([]);
      setSaglikKayitlari([]);
      return;
    }
    setDetailLoading(true);
    Promise.all([
      api.getMusteriHayvanlar(selectedId),
      api.getVeterinerMusteriSaglikKayitlari(selectedId)
    ])
      .then(([hRes, sRes]) => {
        const data = hRes.data || {};
        const all = [
          ...(data.inekler || []).map(x => ({ ...x, tip: 'inek' })),
          ...(data.buzagilar || []).map(x => ({ ...x, tip: 'buzagi' })),
          ...(data.duveler || []).map(x => ({ ...x, tip: 'duve' })),
          ...(data.tosunlar || []).map(x => ({ ...x, tip: 'tosun' }))
        ];
        setHayvanlar(all);
        setSaglikKayitlari(sRes.data || []);
      })
      .catch(() => {
        setHayvanlar([]);
        setSaglikKayitlari([]);
      })
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  const handleAddFarmById = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const id = addId.trim();
    if (!id) { toast.warning('Çiftçi ID girin.'); return; }
    setAdding(true);
    try {
      await api.veterinerMusteriEkle(id);
      toast.success('Çiftlik eklendi.');
      setAddId('');
      setShowAddFarm(false);
      fetchMusteriler();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Eklenemedi.');
    } finally {
      setAdding(false);
    }
  };

  const closeAddFarm = () => {
    setShowAddFarm(false);
    setAddId('');
  };

  const openModal = (tip, hayvan) => {
    setIslemTipi(tip);
    setSecilenHayvan(hayvan);
    setFormData({ tani: '', tedavi: '', ilacAd: '', notlar: '' });
    setAnamnez({ sikayet: '', suresi: '', atesli: '', istah: '', bulgular: '' });
    setSecilenProtokol('');
    setFaturaData(initFatura);
    setArinma(initArinma);
    setModalOpen(true);
  };

  const submitFatura = async (aciklama, hizmetAd) => {
    if (!faturaData.enabled) return;
    const tutar = parseFloat(String(faturaData.tutar).replace(',', '.'));
    if (!(tutar > 0)) return;
    await api.postVeterinerFatura({
      ciftciId: selectedId,
      aciklama,
      hizmetler: [{ ad: hizmetAd, miktar: 1, birimFiyat: tutar }],
      ...(faturaData.odemeTipi === 'vadeli' && faturaData.vadeTarihi
        ? { vadeTarihi: faturaData.vadeTarihi }
        : {}),
    });
    if (faturaData.odemeTipi === 'pesin') {
      await api.postVeterinerTahsilat({
        ciftciId: selectedId,
        tutar,
        aciklama: `Peşin tahsilat — ${aciklama}`,
      });
    }
  };

  const handleProtokolSec = async (protokolId) => {
    setSecilenProtokol(protokolId);
    if (!protokolId) return;
    const p = protokoller.find(x => x._id === protokolId);
    if (!p) return;
    setFormData(prev => ({
      ...prev,
      tani: p.tani || prev.tani,
      tedavi: p.tedaviNotu || prev.tedavi,
      ilacAd: (p.ilaclar || []).map(x => x.ilacAdi).filter(Boolean).join(', ') || prev.ilacAd
    }));
    // Kullanım sayacını artır (fire and forget)
    api.patchVeterinerProtokolKullan(protokolId).catch(() => {});
  };

  const handleKayitSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId || !secilenHayvan) return;
    try {
      let anamnezNot = '';
      if (anamnez.sikayet) anamnezNot += `Şikayet: ${anamnez.sikayet}. `;
      if (anamnez.suresi) anamnezNot += `Süre: ${anamnez.suresi} gün. `;
      if (anamnez.atesli) anamnezNot += `Ateş: ${anamnez.atesli}. `;
      if (anamnez.istah) anamnezNot += `İştah: ${anamnez.istah}. `;
      if (anamnez.bulgular) anamnezNot += `Bulgular: ${anamnez.bulgular}. `;
      const birlesikNot = [anamnezNot.trim(), formData.notlar].filter(Boolean).join('\n');

      // Arınma süresi — notlara ekle ve payload'a ekle
      let arinmaNotStr = '';
      if (islemTipi === 'hastalik' && arinma.aktif && arinma.sut) {
        const baslangic = new Date();
        const sutBitisTarih = new Date(baslangic.getTime() + Number(arinma.sut) * 86400000);
        const sutBitisStr = sutBitisTarih.toLocaleDateString('tr-TR');
        arinmaNotStr = `⚠️ ARINMA SÜRESİ: Süt ${arinma.sut} gün boyunca tanka karıştırılmamalıdır (bitiş: ${sutBitisStr})`;
        if (arinma.et) {
          const etBitisTarih = new Date(baslangic.getTime() + Number(arinma.et) * 86400000);
          arinmaNotStr += ` | Et arınma: ${arinma.et} gün (bitiş: ${etBitisTarih.toLocaleDateString('tr-TR')})`;
        }
      }
      const tumNotlar = [birlesikNot, arinmaNotStr].filter(Boolean).join('\n');

      const payload = {
        hayvanTipi: secilenHayvan.tip,
        hayvanIsim: secilenHayvan.isim || '',
        hayvanKupeNo: secilenHayvan.kupeNo || '',
        tip: islemTipi === 'tohumlama' ? 'muayene' : 'hastalik',
        tani: islemTipi === 'tohumlama' ? 'Suni Tohumlama' : formData.tani,
        tedavi: islemTipi === 'tohumlama' ? formData.ilacAd : formData.tedavi,
        ilaclar: formData.ilacAd ? formData.ilacAd.split(',').map(x => ({ ilacAdi: x.trim() })).filter(x => x.ilacAdi) : [],
        notlar: tumNotlar,
        ...(islemTipi === 'hastalik' && arinma.aktif && arinma.sut
          ? { arinmaSuresiSut: Number(arinma.sut), ...(arinma.et ? { arinmaSuresiEt: Number(arinma.et) } : {}) }
          : {}),
      };
      await api.postMusteriHayvanSaglik(selectedId, secilenHayvan._id, payload);

      const hizmetAd = islemTipi === 'tohumlama'
        ? `Suni Tohumlama — ${secilenHayvan.kupeNo || secilenHayvan.isim || 'Hayvan'}`
        : `Veteriner Muayenesi — ${formData.tani || 'Sağlık kaydı'} (${secilenHayvan.kupeNo || secilenHayvan.isim || 'Hayvan'})`;
      const aciklama = islemTipi === 'tohumlama'
        ? `Suni tohumlama: ${secilenHayvan.kupeNo || secilenHayvan.isim || ''} (${formData.ilacAd || ''})`
        : `Muayene: ${formData.tani || ''} — ${secilenHayvan.kupeNo || secilenHayvan.isim || ''}`;
      await submitFatura(aciklama.trim(), hizmetAd.trim());

      const faturaMsg = faturaData.enabled && parseFloat(faturaData.tutar) > 0
        ? faturaData.odemeTipi === 'pesin' ? ' Fatura kesildi, peşin tahsilat kaydedildi.' : ' Vadeli fatura kesildi.'
        : '';
      const arinmaMsg = islemTipi === 'hastalik' && arinma.aktif && arinma.sut
        ? ` 🛡️ Arınma uyarısı çiftçiye bildirildi.` : '';
      toast.success(`Kayıt eklendi, çiftçiye bildirildi.${faturaMsg}${arinmaMsg}`);
      setModalOpen(false);
      setFaturaData(initFatura);
      setArinma(initArinma);
      const sRes = await api.getVeterinerMusteriSaglikKayitlari(selectedId);
      setSaglikKayitlari(sRes.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'İşlem başarısız.');
    }
  };

  const handleAsiSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId || !asiForm.asiAdi || !asiForm.uygulamaTarihi) return;
    setAsiGonderiyor(true);
    try {
      await api.postVeterinerAsiTakvimi({
        ciftciId: selectedId,
        hayvanId: asiHayvan?._id || null,
        hayvanTipi: asiHayvan?.tip || 'hepsi',
        hayvanIsim: asiHayvan?.isim || '',
        hayvanKupeNo: asiHayvan?.kupeNo || '',
        ...asiForm
      });

      const hizmetAd = `Aşı Uygulaması — ${asiForm.asiAdi}${asiHayvan ? ` (${asiHayvan.kupeNo || asiHayvan.isim})` : ' (Sürü)'}`;
      const aciklama = `Aşı: ${asiForm.asiAdi}${asiHayvan ? ` — ${asiHayvan.kupeNo || asiHayvan.isim}` : ' — Sürü'}`;
      await submitFatura(aciklama.trim(), hizmetAd.trim());

      const faturaMsg = faturaData.enabled && parseFloat(faturaData.tutar) > 0
        ? faturaData.odemeTipi === 'pesin' ? ' Fatura kesildi, peşin tahsilat kaydedildi.' : ' Vadeli fatura kesildi.'
        : '';
      toast.success(`Aşı kaydı eklendi, çiftçiye bildirildi.${faturaMsg}`);
      setAsiModalOpen(false);
      setAsiForm({ asiAdi: '', uygulamaTarihi: '', sonrakiTarih: '', doz: '', notlar: '' });
      setAsiHayvan(null);
      setFaturaData(initFatura);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Aşı eklenemedi.');
    } finally {
      setAsiGonderiyor(false);
    }
  };

  const handlePdfRapor = async () => {
    if (!selectedId) return;
    setRaporYukleniyor(true);
    try {
      const res = await api.getVeterinerCiftlikRaporu(selectedId);
      indirCiftlikSaglikRaporu(res.data);
      toast.success('Rapor oluşturuldu.');
    } catch (err) {
      toast.error('Rapor oluşturulamadı.');
    } finally {
      setRaporYukleniyor(false);
    }
  };

  const handleProtokolKaydet = async (e) => {
    e.preventDefault();
    try {
      await api.postVeterinerProtokol(yeniProtokol);
      toast.success('Protokol kaydedildi.');
      setProtokolModalOpen(false);
      setYeniProtokol({ ad: '', hastalik: '', tip: 'hastalik', tani: '', tedaviNotu: '', ilaclar: [{ ilacAdi: '', doz: '', sure: '' }] });
      fetchProtokoller();
    } catch (err) {
      toast.error('Protokol kaydedilemedi.');
    }
  };

  const handleProtokolSil = async (id) => {
    if (!window.confirm('Bu protokolü silmek istiyor musunuz?')) return;
    try {
      await api.deleteVeterinerProtokol(id);
      toast.success('Protokol silindi.');
      fetchProtokoller();
    } catch (_) {
      toast.error('Silinemedi.');
    }
  };

  return (
    <Page>
      <Sidebar>
        <SidebarHeader>
          <div className="bubble">
            <span className="bubble-icon">🏥</span>
            <div className="bubble-texts">
              <div className="bubble-title">Hastalar</div>
              <div className="bubble-sub">Çiftlikler &amp; Müşteri Yönetimi</div>
            </div>
          </div>
          <div className="search-wrap">
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <SearchInput
                type="text"
                value={arama}
                onChange={e => setArama(e.target.value)}
                placeholder="İsim veya çiftlik ara..."
              />
            </div>
          </div>
        </SidebarHeader>
        <FarmList>
          {loading ? (
            <div style={{ padding: 20, color: '#6b7280', fontSize: 14 }}>Yükleniyor…</div>
          ) : filteredMusteriler.length === 0 ? (
            <div style={{ padding: 20, color: '#6b7280', fontSize: 14 }}>
              {arama.trim() ? 'Eşleşme yok.' : 'Henüz çiftlik eklenmedi.'}
            </div>
          ) : (
            filteredMusteriler.map(m => {
              const skor = saglikSkorlar[m._id];
              return (
                <FarmItem key={m._id} $active={selectedId === m._id} onClick={() => selectFarm(m._id)}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <div className="name">{m.isletmeAdi || m.isim || 'İsimsiz'}</div>
                      <div className="sub">{m.isim} {m.sehir ? `· ${m.sehir}` : ''}</div>
                    </div>
                    {skor && (
                      <ScoreBadge
                        $bg={skor.skor >= 80 ? '#dcfce7' : skor.skor >= 50 ? '#fef9c3' : '#fee2e2'}
                        $color={skor.skor >= 80 ? '#15803d' : skor.skor >= 50 ? '#854d0e' : '#b91c1c'}
                      >
                        {skor.skor}
                      </ScoreBadge>
                    )}
                  </div>
                </FarmItem>
              );
            })
          )}
        </FarmList>
        <AddFarmBlock>
          {!showAddFarm ? (
            <button type="button" className="add-main-btn" onClick={() => setShowAddFarm(true)}>
              <span>＋</span> Yeni Çiftlik Ekle
            </button>
          ) : (
            <>
              <div className="form-label">Çiftçi ID</div>
              <input
                className="id-input"
                value={addId}
                onChange={e => setAddId(e.target.value.trim())}
                placeholder="MongoDB ID (24 karakter)"
                autoFocus
              />
              <div className="btn-row">
                <button type="button" className="submit-btn" disabled={adding} onClick={handleAddFarmById}>{adding ? '…' : 'Ekle'}</button>
                <button type="button" className="cancel-btn" onClick={closeAddFarm}>İptal</button>
              </div>
            </>
          )}
        </AddFarmBlock>
      </Sidebar>

      <DetailPanel>
        {!selectedId ? (
          <EmptyStateWrapper>
            <EmptyStateBar>
              <div className="bar-inner">
                <div className="bar-left">
                  <div className="bar-icon">🩺</div>
                  <div>
                    <h2 className="bar-title">Hasta Paneli</h2>
                    <p className="bar-sub">Çiftlik seçerek sağlık kayıtlarına erişin</p>
                  </div>
                </div>
                <div className="bar-stats">
                  <span className="stat-pill">📋 {musteriler.length} çiftlik</span>
                  <span className="stat-pill">🛡️ Sağlık takibi</span>
                </div>
              </div>
            </EmptyStateBar>
            <EmptyDetail>Sol listeden bir çiftlik seçin veya ID ile yeni çiftlik ekleyin.</EmptyDetail>
          </EmptyStateWrapper>
        ) : detailLoading ? (
          <EmptyDetail>Yükleniyor…</EmptyDetail>
        ) : (
          <>
            <DetailHeader>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <h1 className="farm-name">{selectedMusteri?.isletmeAdi || selectedMusteri?.isim || 'Çiftlik'}</h1>
                  <p className="farm-sub">Çiftçi: {selectedMusteri?.isim} {selectedMusteri?.sehir ? `· ${selectedMusteri.sehir}` : ''}</p>
                  {saglikSkorlar[selectedId] && (() => {
                    const s = saglikSkorlar[selectedId];
                    return (
                      <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                        <span style={{ padding: '5px 14px', borderRadius: 20, background: s.skor >= 80 ? '#dcfce7' : s.skor >= 50 ? '#fef9c3' : '#fee2e2', color: s.skor >= 80 ? '#15803d' : s.skor >= 50 ? '#854d0e' : '#b91c1c', fontSize: 13, fontWeight: 800 }}>
                          🛡️ Sağlık Skoru: {s.skor}/100
                        </span>
                        {s.devamEdenTedavi > 0 && <span style={{ padding: '5px 14px', borderRadius: 20, background: '#fff7ed', color: '#c2410c', fontSize: 12, fontWeight: 700 }}>⚠️ {s.devamEdenTedavi} devam eden tedavi</span>}
                        {s.gecikmisAsiSayisi > 0 && <span style={{ padding: '5px 14px', borderRadius: 20, background: '#fef2f2', color: '#b91c1c', fontSize: 12, fontWeight: 700 }}>💉 {s.gecikmisAsiSayisi} gecikmiş aşı</span>}
                      </div>
                    );
                  })()}
                </div>
                <PdfRaporBtn onClick={handlePdfRapor} disabled={raporYukleniyor}>
                  {raporYukleniyor ? '⏳ Hazırlanıyor…' : '📄 Aylık Sağlık Raporu'}
                </PdfRaporBtn>
              </div>
            </DetailHeader>

            {/* AKTİF ARINMA UYARILARI */}
            {aktifArinmalar.length > 0 && (
              <ArinmaUyariPanel>
                <div className="au-title">
                  🛡️ Aktif Arınma Süreleri — {aktifArinmalar.length} hayvan
                </div>
                {aktifArinmalar.map((a, i) => {
                  const bugun = new Date();
                  const sutKalan = a.sutAktif
                    ? Math.ceil((a.sutBitis - bugun) / 86400000)
                    : null;
                  const etKalan = a.etAktif
                    ? Math.ceil((a.etBitis - bugun) / 86400000)
                    : null;
                  return (
                    <div key={i} className="au-item">
                      <span className="au-dot">🐄</span>
                      <div className="au-texts">
                        <div className="au-hayvan">{a.hayvan} {a.tani ? `— ${a.tani}` : ''}</div>
                        <div className="au-detail">
                          {a.sutAktif && `🥛 Süt tanka karıştırılmamalı (${a.sutGun} gün, bitiş: ${a.sutBitis?.toLocaleDateString('tr-TR')})`}
                          {a.sutAktif && a.etAktif && ' · '}
                          {a.etAktif && `🥩 Et arınma (${a.etGun} gün, bitiş: ${a.etBitis?.toLocaleDateString('tr-TR')})`}
                        </div>
                      </div>
                      <div className="au-kalan">
                        {sutKalan !== null ? `${sutKalan} gün kaldı` : `${etKalan} gün kaldı`}
                      </div>
                    </div>
                  );
                })}
              </ArinmaUyariPanel>
            )}

            <Block>
              <h4 style={{ justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>🐄 Hayvanlar</span>
                <button
                  type="button"
                  onClick={() => gecmisKayitlarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e0f2fe', background: '#f0f9ff', color: '#0284c7', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  📋 Geçmiş Kayıtlar
                </button>
              </h4>
              {hayvanlar.length === 0 ? (
                <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Bu çiftlikte kayıtlı hayvan yok.</p>
              ) : (
                <>
                  <HayvanFiltreRow>
                    <div className="kategori-wrap">
                      <span>Kategori:</span>
                      {['', 'inek', 'buzagi', 'duve', 'tosun'].map(k => (
                        <button
                          key={k || 'tumu'}
                          type="button"
                          className={`kategori-btn ${hayvanKategori === k ? 'active' : ''}`}
                          onClick={() => setHayvanKategori(k)}
                        >
                          {k === '' ? 'Tümü' : k === 'inek' ? 'İnek' : k === 'buzagi' ? 'Buzağı' : k === 'duve' ? 'Düve' : 'Tosun'}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      className="kupe-search"
                      placeholder="Küpe no veya isim ara..."
                      value={hayvanKupeArama}
                      onChange={e => setHayvanKupeArama(e.target.value)}
                    />
                  </HayvanFiltreRow>
                  <AnimalGrid>
                    {filteredHayvanlar.map(h => (
                      <AnimalCard key={h._id}>
                        <div className="row">
                          <span className="kupe">{h.kupeNo || '–'} {h.isim && `(${h.isim})`}</span>
                          <span className="tag">{h.tip}</span>
                        </div>
                        <div className="info">{h.irk || '–'} · {h.guncelDurum || h.saglikDurumu || '–'}</div>
                        <div className="actions">
                          <button type="button" className="btn-saglik" onClick={() => openModal('hastalik', h)}>+ Sağlık / İlaç</button>
                          {(h.tip === 'inek' || h.tip === 'duve') && (
                            <button type="button" className="btn-tohum" onClick={() => openModal('tohumlama', h)}>+ Tohumlama</button>
                          )}
                          <button type="button" style={{ padding: '10px 14px', borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 800, cursor: 'pointer', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }} onClick={() => { setAsiHayvan(h); setFaturaData(initFatura); setAsiModalOpen(true); }}>+ Aşı</button>
                        </div>
                      </AnimalCard>
                    ))}
                  </AnimalGrid>
                  {filteredHayvanlar.length === 0 && (hayvanKategori || hayvanKupeArama.trim()) && (
                    <p style={{ margin: '12px 0 0', color: '#64748b', fontSize: 13 }}>Bu filtreye uygun hayvan bulunamadı.</p>
                  )}
                </>
              )}
            </Block>

            <Block ref={gecmisKayitlarRef}>
              <h4 style={{ justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>📋 Geçmiş Sağlık Kayıtları</span>
                <button type="button" onClick={() => setProtokolModalOpen(true)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e0e7ff', background: '#eef2ff', color: '#4338ca', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Protokol Ekle</button>
              </h4>

              {/* Filtre Satırı */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <select
                  value={kayitTipFiltri}
                  onChange={e => setKayitTipFiltri(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 600, background: '#fff', cursor: 'pointer', color: '#0f172a' }}
                >
                  <option value="">🔖 Tüm Tipler</option>
                  <option value="hastalik">🔴 Hastalık</option>
                  <option value="tedavi">🟢 Tedavi</option>
                  <option value="asi">🟣 Aşı</option>
                  <option value="muayene">🔵 Muayene</option>
                  <option value="tohumlama">💉 Suni Tohumlama</option>
                  <option value="ameliyat">🟡 Ameliyat</option>
                  <option value="dogum_komplikasyonu">🩷 Doğum</option>
                </select>
                <input
                  type="text"
                  value={kayitHayvanFiltri}
                  onChange={e => setKayitHayvanFiltri(e.target.value)}
                  placeholder="🐄 Küpe no / isim ara..."
                  style={{ flex: 1, minWidth: 160, padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: '#fff' }}
                />
                <input
                  type="month"
                  value={kayitTarihFiltri}
                  onChange={e => setKayitTarihFiltri(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: '#fff', cursor: 'pointer' }}
                />
                {(kayitTipFiltri || kayitHayvanFiltri || kayitTarihFiltri) && (
                  <button
                    type="button"
                    onClick={() => { setKayitTipFiltri(''); setKayitHayvanFiltri(''); setKayitTarihFiltri(''); }}
                    style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #fee2e2', background: '#fff5f5', color: '#b91c1c', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    ✕ Temizle
                  </button>
                )}
                <span style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {filteredKayitlar.length} kayıt
                </span>
              </div>

              {saglikKayitlari.length === 0 ? (
                <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Henüz kayıt yok.</p>
              ) : filteredKayitlar.length === 0 ? (
                <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Bu filtreye uygun kayıt bulunamadı.</p>
              ) : (
                <KayitList>
                  {filteredKayitlar.slice(0, 50).map(k => (
                    <KayitItem key={k._id}>
                      <div className="content">
                        <div className="line1">{k.hayvanIsim || k.hayvanKupeNo || 'Hayvan'} · {k.tani === 'Suni Tohumlama' ? '💉 Suni Tohumlama' : (tipEtiket[k.tip] || k.tip)} {k.tani !== 'Suni Tohumlama' ? `— ${k.tani}` : ''}</div>
                        <div className="line2">{k.tarih ? new Date(k.tarih).toLocaleDateString('tr-TR') : ''} {k.tedavi ? `· ${k.tedavi}` : ''}</div>
                      </div>
                      <button type="button" className="btn-pdf" onClick={e => { e.stopPropagation(); indirRecetePdf(k); }}>PDF İndir</button>
                    </KayitItem>
                  ))}
                </KayitList>
              )}
            </Block>
          </>
        )}
      </DetailPanel>

      {/* AŞI EKLEME MODAL */}
      {asiModalOpen && (
        <ModalOverlay onClick={() => { setAsiModalOpen(false); setFaturaData(initFatura); }}>
          <ModalBox onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2>💉 Aşı Kaydı Ekle</h2>
              <p className="sub">{asiHayvan ? `${asiHayvan.kupeNo || asiHayvan.isim} — ${asiHayvan.tip}` : 'Sürü genelinde aşı'}</p>
            </div>
            <form onSubmit={handleAsiSubmit}>
              <div className="modal-body">
                <AsiModal>
                  <div className="asi-form">
                    <div>
                      <label>Aşı Adı *</label>
                      <StokAutocomplete
                        value={asiForm.asiAdi}
                        onChange={v => setAsiForm({ ...asiForm, asiAdi: v })}
                        placeholder="Örn: Şap aşısı, Brucella — yazın veya listeden seçin"
                        stoklar={stoklar}
                        kategoriler={['Aşı', 'Biyolojik']}
                      />
                    </div>
                    <div className="asi-row">
                      <div>
                        <label>Uygulama Tarihi *</label>
                        <input required type="date" value={asiForm.uygulamaTarihi} onChange={e => setAsiForm({ ...asiForm, uygulamaTarihi: e.target.value })} />
                      </div>
                      <div>
                        <label>Sonraki Aşı Tarihi</label>
                        <input type="date" value={asiForm.sonrakiTarih} onChange={e => setAsiForm({ ...asiForm, sonrakiTarih: e.target.value })} />
                      </div>
                    </div>
                    <div className="asi-row">
                      <div>
                        <label>Doz</label>
                        <input value={asiForm.doz} onChange={e => setAsiForm({ ...asiForm, doz: e.target.value })} placeholder="Örn: 2ml IM" />
                      </div>
                      <div>
                        <label>Not</label>
                        <input value={asiForm.notlar} onChange={e => setAsiForm({ ...asiForm, notlar: e.target.value })} placeholder="Opsiyonel not" />
                      </div>
                    </div>
                  </div>
                </AsiModal>

                {/* FATURA KES BÖLÜMÜ */}
                <FaturaBolumu $active={faturaData.enabled} style={{ marginTop: 16 }}>
                  <div className="toggle-row" onClick={() => setFaturaData(f => ({ ...f, enabled: !f.enabled }))}>
                    <span className="toggle-icon">🧾</span>
                    <div className="toggle-texts">
                      <div className="toggle-title">Fatura Kes</div>
                      <div className="toggle-sub">Bu aşı için fatura oluştur ve çiftçiye bildir</div>
                    </div>
                    <span className="toggle-arrow">{faturaData.enabled ? '✓' : '+'}</span>
                  </div>
                  {faturaData.enabled && (
                    <div className="fatura-body">
                      <div className="f-row">
                        <div className="f-field">
                          <label>Tutar (₺) *</label>
                          <input
                            type="number" min="0.01" step="0.01"
                            value={faturaData.tutar}
                            onChange={e => setFaturaData(f => ({ ...f, tutar: e.target.value }))}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="f-field">
                          <label>Ödeme Tipi</label>
                          <select
                            value={faturaData.odemeTipi}
                            onChange={e => setFaturaData(f => ({ ...f, odemeTipi: e.target.value, vadeTarihi: '' }))}
                          >
                            <option value="pesin">Peşin Alındı</option>
                            <option value="vadeli">Vadeli (Sonradan)</option>
                          </select>
                        </div>
                      </div>
                      {faturaData.odemeTipi === 'pesin' ? (
                        <div className="pesin-badge">✅ Ödeme peşin alındı — fatura anında kapatılacak</div>
                      ) : (
                        <div className="f-field">
                          <label>Son Ödeme Tarihi (Vade)</label>
                          <input
                            type="date"
                            value={faturaData.vadeTarihi}
                            onChange={e => setFaturaData(f => ({ ...f, vadeTarihi: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </FaturaBolumu>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => { setAsiModalOpen(false); setAsiHayvan(null); setFaturaData(initFatura); }}>İptal</button>
                <button type="submit" className="btn-submit" disabled={asiGonderiyor} style={{ background: '#7c3aed' }}>{asiGonderiyor ? 'Kaydediliyor…' : 'Kaydet ve bildir'}</button>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* PROTOKOL YÖNETİM MODAL */}
      {protokolModalOpen && (
        <ModalOverlay onClick={() => setProtokolModalOpen(false)}>
          <ModalBox onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2>📋 Yeni Tedavi Protokolü</h2>
              <p className="sub">Sık kullandığınız tanı + ilaç kombinasyonlarını şablon olarak kaydedin.</p>
            </div>
            <form onSubmit={handleProtokolKaydet}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Protokol Adı *</label>
                  <input required value={yeniProtokol.ad} onChange={e => setYeniProtokol({ ...yeniProtokol, ad: e.target.value })} placeholder="Örn: Mastitis Standart Protokolü" />
                </div>
                <div className="form-group">
                  <label>Tanı / Teşhis *</label>
                  <ComboSelect
                    value={yeniProtokol.tani}
                    onChange={v => setYeniProtokol({ ...yeniProtokol, tani: v })}
                    placeholder="Örn: Mastitis, Süt Humması"
                    sabitListe={SIK_HASTALIKLAR}
                    stoklar={[]}
                  />
                </div>
                <div className="form-group">
                  <label>Tedavi Notu</label>
                  <input value={yeniProtokol.tedaviNotu} onChange={e => setYeniProtokol({ ...yeniProtokol, tedaviNotu: e.target.value })} placeholder="Örn: 5 gün antibiyotik, günde 2 kez" />
                </div>
                <div className="form-section-title" style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 10px' }}>İlaçlar</div>
                {yeniProtokol.ilaclar.map((il, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px auto', gap: 8, marginBottom: 8 }}>
                    <ComboSelect
                      value={il.ilacAdi}
                      onChange={v => { const ils = [...yeniProtokol.ilaclar]; ils[i] = { ...ils[i], ilacAdi: v }; setYeniProtokol({ ...yeniProtokol, ilaclar: ils }); }}
                      placeholder="İlaç adı — yazın veya seçin"
                      sabitListe={SIK_ILACLAR}
                      stoklar={stoklar}
                      stokKategoriler={['İlaç', 'Antibiyotik', 'Vitamin', 'Anti-inflamatuar', 'Paraziter', 'Biyolojik']}
                    />
                    <input placeholder="Doz" value={il.doz} onChange={e => { const ils = [...yeniProtokol.ilaclar]; ils[i] = { ...ils[i], doz: e.target.value }; setYeniProtokol({ ...yeniProtokol, ilaclar: ils }); }} style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }} />
                    <input placeholder="Süre" value={il.sure} onChange={e => { const ils = [...yeniProtokol.ilaclar]; ils[i] = { ...ils[i], sure: e.target.value }; setYeniProtokol({ ...yeniProtokol, ilaclar: ils }); }} style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }} />
                    <button type="button" onClick={() => setYeniProtokol({ ...yeniProtokol, ilaclar: yeniProtokol.ilaclar.filter((_, j) => j !== i) })} style={{ padding: '8px 10px', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => setYeniProtokol({ ...yeniProtokol, ilaclar: [...yeniProtokol.ilaclar, { ilacAdi: '', doz: '', sure: '' }] })} style={{ padding: '8px 14px', border: '1px dashed #d1d5db', borderRadius: 8, background: '#f9fafb', color: '#374151', fontSize: 13, cursor: 'pointer', marginTop: 4 }}>+ İlaç Ekle</button>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setProtokolModalOpen(false)}>İptal</button>
                <button type="submit" className="btn-submit">Kaydet</button>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}

      {modalOpen && secilenHayvan && (
        <ModalOverlay onClick={() => setModalOpen(false)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{islemTipi === 'tohumlama' ? 'Suni tohumlama kaydı' : 'Teşhis ve reçete'}</h2>
              <p className="sub">{islemTipi === 'tohumlama' ? 'Tohumlama bilgisini girin, çiftçiye bildirilecek.' : 'Tanı, tedavi ve reçete alanlarını doldurun.'}</p>
            </div>
            <form onSubmit={handleKayitSubmit}>
              <div className="modal-body">
                <div className="hayvan-badge">
                  <span>{secilenHayvan.kupeNo || '–'}</span>
                  {secilenHayvan.isim && <span>({secilenHayvan.isim})</span>}
                  <span className="tip">{secilenHayvan.tip}</span>
                </div>
                {islemTipi === 'hastalik' ? (
                  <>
                    {/* Protokol Seç */}
                    {protokoller.length > 0 && (
                      <div className="form-section">
                        <div className="form-section-title">⚡ Hızlı Protokol Şablonu</div>
                        <ModalSelect value={secilenProtokol} onChange={e => handleProtokolSec(e.target.value)}>
                          <option value="">— Protokol seç (opsiyonel) —</option>
                          {protokoller.map(p => (
                            <option key={p._id} value={p._id}>{p.ad} {p.kullanilmaSayisi > 0 ? `(${p.kullanilmaSayisi}x)` : ''}</option>
                          ))}
                        </ModalSelect>
                        {secilenProtokol && (
                          <ProtocolHint>
                            Seçilen şablon alanları otomatik doldurdu. Üzerine yazarak değiştirebilirsiniz.
                          </ProtocolHint>
                        )}
                      </div>
                    )}

                    {/* Anamnez / Hikaye */}
                    <div className="form-section">
                      <div className="form-section-title">🩺 Anamnez / Hasta Hikayesi</div>
                      <div className="form-group">
                        <label>Şikayet / Semptomlar</label>
                        <ComboSelect
                          value={anamnez.sikayet}
                          onChange={v => setAnamnez({ ...anamnez, sikayet: v })}
                          placeholder="Örn: İştahsızlık, topallık..."
                          sabitListe={['İştahsızlık', 'Topallık', 'Şişlik (Timpani)', 'Süt Azalması', 'Ateş', 'Sümüklü Akıntı', 'Zayıflama', 'İshal', 'Kabızlık', 'Doğum Güçlüğü', 'Döl Tutmaması', 'Ağız Yaraları', 'Göz İltihabı', 'Yürüyüş Bozukluğu']}
                          stoklar={[]}
                        />
                      </div>
                      <AnamnezGrid>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label>Şikayet Süresi (gün)</label>
                          <input type="number" min="0" value={anamnez.suresi} onChange={e => setAnamnez({ ...anamnez, suresi: e.target.value })} placeholder="Örn: 3" />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label>İştah Durumu</label>
                          <ModalSelect value={anamnez.istah} onChange={e => setAnamnez({ ...anamnez, istah: e.target.value })}>
                            <option value="">Seçin</option>
                            <option>Normal</option>
                            <option>Azalmış</option>
                            <option>Yok</option>
                            <option>Artmış</option>
                          </ModalSelect>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label>Ateş</label>
                          <ModalSelect value={anamnez.atesli} onChange={e => setAnamnez({ ...anamnez, atesli: e.target.value })}>
                            <option value="">Seçin</option>
                            <option>Normal (38-39°C)</option>
                            <option>Düşük (&lt;38°C)</option>
                            <option>Yüksek (39-40°C)</option>
                            <option>Çok Yüksek (&gt;40°C)</option>
                          </ModalSelect>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label>Klinik Bulgular</label>
                          <input value={anamnez.bulgular} onChange={e => setAnamnez({ ...anamnez, bulgular: e.target.value })} placeholder="Gözlem notları" />
                        </div>
                      </AnamnezGrid>
                    </div>

                    {/* Klinik Bilgiler */}
                    <div className="form-section">
                      <div className="form-section-title">Tanı ve Tedavi</div>
                      <div className="form-group">
                        <label>Tanı / Teşhis *</label>
                        <ComboSelect
                          value={formData.tani}
                          onChange={v => setFormData({ ...formData, tani: v })}
                          placeholder="Örn: Mastitis, Süt Humması — yazın veya seçin"
                          sabitListe={SIK_HASTALIKLAR}
                          stoklar={[]}
                        />
                      </div>
                      <div className="form-group">
                        <label>Uygulanan Tedavi</label>
                        <ComboSelect
                          value={formData.tedavi}
                          onChange={v => setFormData({ ...formData, tedavi: v })}
                          placeholder="Örn: Antibiyotik + dinlenme"
                          sabitListe={['Antibiyotik tedavisi', 'Anti-inflamatuar', 'Vitamin + mineral desteği', 'Sıvı tedavisi (IV)', 'Lokal uygulama', 'Sürüden ayırma ve gözlem', 'Pansuman', 'Cerrahi müdahale']}
                          stoklar={[]}
                        />
                      </div>
                      <div className="form-group">
                        <label>İlaçlar <span style={{ fontWeight: 500, color: '#94a3b8' }}>(virgülle birden fazla ekle)</span></label>
                        <ComboSelect
                          value={formData.ilacAd}
                          onChange={v => setFormData({ ...formData, ilacAd: v })}
                          placeholder="Penstrep, Metacam... — yazın veya listeden seçin"
                          sabitListe={SIK_ILACLAR}
                          stoklar={stoklar}
                          stokKategoriler={['İlaç', 'Antibiyotik', 'Vitamin', 'Anti-inflamatuar', 'Paraziter', 'Biyolojik']}
                          multiWord
                        />
                      </div>
                    </div>

                    {/* ARINMA SÜRESİ KALKANI */}
                    <ArinmaBox $aktif={arinma.aktif} className={arinma.aktif ? 'aktif' : ''}>
                      <div className="ar-toggle" onClick={() => setArinma(a => ({ ...a, aktif: !a.aktif }))}>
                        <span className="ar-icon">🛡️</span>
                        <div className="ar-texts">
                          <div className="ar-title">Süt / Et Arınma Süresi</div>
                          <div className="ar-sub">Etkinleştir → çiftçiye otomatik tank uyarısı gönderilir</div>
                        </div>
                        <span className="ar-chk">{arinma.aktif ? '✓' : ''}</span>
                      </div>
                      {arinma.aktif && (
                        <div className="ar-body">
                          <div className="ar-row">
                            <div className="ar-field">
                              <label>🥛 Süt Arınma (gün) *</label>
                              <input
                                type="number" min="1" max="30"
                                value={arinma.sut}
                                onChange={e => setArinma(a => ({ ...a, sut: e.target.value }))}
                                placeholder="Örn: 4"
                              />
                            </div>
                            <div className="ar-field">
                              <label>🥩 Et Arınma (gün)</label>
                              <input
                                type="number" min="1" max="60"
                                value={arinma.et}
                                onChange={e => setArinma(a => ({ ...a, et: e.target.value }))}
                                placeholder="Opsiyonel"
                              />
                            </div>
                          </div>
                          {arinma.sut && (
                            <div className="ar-warning">
                              ⚠️ Çiftçiye bildirim gönderilecek: <strong>{secilenHayvan?.kupeNo || 'Hayvan'}</strong> için süt{' '}
                              <strong>{arinma.sut} gün</strong> boyunca sağım tankına kesinlikle karıştırılmamalıdır.
                              {arinma.et && ` Et arınma süresi: ${arinma.et} gün.`}{' '}
                              Bu kayıt yasal kanıt olarak tutulur.
                            </div>
                          )}
                        </div>
                      )}
                    </ArinmaBox>
                  </>
                ) : (
                  <div className="form-section">
                    <div className="form-section-title">Tohumlama bilgisi</div>
                    <div className="form-group">
                      <label>Tohum Cinsi / Irk *</label>
                      <ComboSelect
                        value={formData.ilacAd}
                        onChange={v => setFormData({ ...formData, ilacAd: v })}
                        placeholder="Örn: Holstein, Simental — yazın veya seçin"
                        sabitListe={SIK_TOHUMLAR}
                        stoklar={stoklar}
                        stokKategoriler={['Tohum', 'Sperma', 'Tohumlama']}
                      />
                    </div>
                    <div className="form-group">
                      <label>Tohumlama Yöntemi</label>
                      <ModalSelect
                        value={formData.tani}
                        onChange={e => setFormData({ ...formData, tani: e.target.value })}
                      >
                        <option value="">— Seçin (opsiyonel) —</option>
                        <option value="Dondurulmuş Semen">❄️ Dondurulmuş Semen</option>
                        <option value="Taze Semen">🧪 Taze Semen</option>
                        <option value="Sexed Semen">🎯 Sexed Semen (Cinsiyet Ayrımlı)</option>
                        <option value="Embriyo Transferi">🔬 Embriyo Transferi</option>
                      </ModalSelect>
                    </div>
                  </div>
                )}
                <div className="form-section">
                  <div className="form-section-title">Ek Not (çiftçiye iletilecek)</div>
                  <div className="form-group">
                    <textarea value={formData.notlar} onChange={e => setFormData({ ...formData, notlar: e.target.value })} placeholder="Ek not veya öneri..." rows={2} />
                  </div>
                </div>

                {/* FATURA KES BÖLÜMÜ */}
                <FaturaBolumu $active={faturaData.enabled}>
                  <div className="toggle-row" onClick={() => setFaturaData(f => ({ ...f, enabled: !f.enabled }))}>
                    <span className="toggle-icon">🧾</span>
                    <div className="toggle-texts">
                      <div className="toggle-title">Fatura Kes</div>
                      <div className="toggle-sub">Bu işlem için fatura oluştur ve çiftçiye bildir</div>
                    </div>
                    <span className="toggle-arrow">{faturaData.enabled ? '✓' : '+'}</span>
                  </div>
                  {faturaData.enabled && (
                    <div className="fatura-body">
                      <div className="f-row">
                        <div className="f-field">
                          <label>Tutar (₺) *</label>
                          <input
                            type="number" min="0.01" step="0.01"
                            value={faturaData.tutar}
                            onChange={e => setFaturaData(f => ({ ...f, tutar: e.target.value }))}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="f-field">
                          <label>Ödeme Tipi</label>
                          <select
                            value={faturaData.odemeTipi}
                            onChange={e => setFaturaData(f => ({ ...f, odemeTipi: e.target.value, vadeTarihi: '' }))}
                          >
                            <option value="pesin">Peşin Alındı</option>
                            <option value="vadeli">Vadeli (Sonradan)</option>
                          </select>
                        </div>
                      </div>
                      {faturaData.odemeTipi === 'pesin' ? (
                        <div className="pesin-badge">✅ Ödeme peşin alındı — fatura anında kapatılacak</div>
                      ) : (
                        <div className="f-field">
                          <label>Son Ödeme Tarihi (Vade)</label>
                          <input
                            type="date"
                            value={faturaData.vadeTarihi}
                            onChange={e => setFaturaData(f => ({ ...f, vadeTarihi: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </FaturaBolumu>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>İptal</button>
                <button type="submit" className="btn-submit">Kaydet ve çiftçiye bildir</button>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}
    </Page>
  );
}
