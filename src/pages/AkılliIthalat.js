import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import {
  FiUploadCloud, FiCheckCircle, FiAlertTriangle, FiTrash2,
  FiZap, FiCpu, FiArrowRight, FiArrowLeft, FiInfo, FiX,
  FiHelpCircle, FiExternalLink, FiDownload, FiFileText, FiCamera
} from 'react-icons/fi';
import * as api from '../services/api';
import { toast } from 'react-toastify';

// ─── ANIMATIONS ───────────────────────────────────────────────────────────────
const fadeIn   = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;
const slideIn  = keyframes`from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}`;
const pulse    = keyframes`0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.3)}50%{box-shadow:0 0 0 16px rgba(99,102,241,0)}`;
const spin     = keyframes`to{transform:rotate(360deg)}`;
const badgePop = keyframes`0%{transform:scale(1)}50%{transform:scale(1.2)}100%{transform:scale(1)}`;

// ─── STYLED COMPONENTS ────────────────────────────────────────────────────────
const Page = styled.div`
  min-height:100vh;
  background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%);
  padding:32px 24px 80px;
  animation:${fadeIn} .4s ease;
`;
const Inner = styled.div`max-width:1000px;margin:0 auto;position:relative`;

const PageHeader = styled.div`
  margin-bottom:40px;
  display:flex;align-items:flex-start;justify-content:space-between;gap:16px;
  h1{margin:0 0 8px;font-size:32px;font-weight:800;color:#fff;
    span{background:linear-gradient(90deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent}}
  p{margin:0;color:#94a3b8;font-size:15px}
`;

// ─── REHBER PANELİ ────────────────────────────────────────────────────────────
const HelpBtn = styled.button`
  flex-shrink:0;
  width:44px;height:44px;border-radius:50%;
  background:linear-gradient(135deg,#f59e0b,#d97706);
  border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  color:#fff;font-size:20px;font-weight:900;
  box-shadow:0 4px 15px rgba(245,158,11,.4);
  transition:all .2s;
  animation:${badgePop} 2s ease infinite;
  &:hover{transform:scale(1.1);box-shadow:0 6px 20px rgba(245,158,11,.5)}
  margin-top:6px;
`;

const Overlay = styled.div`
  position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:998;
  animation:${fadeIn} .2s ease;
`;

const HelpPanel = styled.div`
  position:fixed;top:0;right:0;bottom:0;
  width:min(480px,100vw);
  background:linear-gradient(180deg,#1e1b4b 0%,#0f172a 100%);
  border-left:1px solid rgba(255,255,255,.1);
  z-index:999;
  overflow-y:auto;
  animation:${slideIn} .3s ease;
  padding:0 0 40px;
  &::-webkit-scrollbar{width:4px}
  &::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:4px}
`;

const PanelHeader = styled.div`
  padding:24px;
  background:linear-gradient(135deg,rgba(99,102,241,.2),rgba(139,92,246,.1));
  border-bottom:1px solid rgba(255,255,255,.08);
  position:sticky;top:0;z-index:10;
  backdrop-filter:blur(16px);
  display:flex;align-items:center;justify-content:space-between;
  h2{margin:0;font-size:18px;font-weight:700;color:#fff;
    span{font-size:22px;margin-right:10px}}
`;
const CloseBtn = styled.button`
  background:rgba(255,255,255,.08);border:none;color:#94a3b8;
  width:36px;height:36px;border-radius:50%;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:all .2s;&:hover{background:rgba(255,255,255,.15);color:#fff}
`;

const Section = styled.div`
  padding:20px 24px 0;
`;
const SectionTitle = styled.div`
  display:flex;align-items:center;gap:10px;margin-bottom:14px;
  .icon{
    width:32px;height:32px;border-radius:10px;
    background:${p=>p.$color||'rgba(99,102,241,.2)'};
    display:flex;align-items:center;justify-content:center;font-size:16px;
  }
  h3{margin:0;font-size:15px;font-weight:700;color:#e2e8f0}
`;
const Divider = styled.div`
  height:1px;background:rgba(255,255,255,.06);margin:20px 0;
`;

const StepList = styled.div`display:flex;flex-direction:column;gap:12px`;
const Step = styled.div`
  display:flex;gap:14px;align-items:flex-start;
  padding:14px;background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.06);border-radius:12px;
  transition:all .2s;
  &:hover{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.1)}
  .num{
    width:28px;height:28px;border-radius:50%;flex-shrink:0;margin-top:1px;
    display:flex;align-items:center;justify-content:center;
    font-size:13px;font-weight:700;
    background:${p=>p.$color||'rgba(99,102,241,.25)'};
    color:${p=>p.$textColor||'#a5b4fc'};
  }
  .content{flex:1}
  .title{font-size:13px;font-weight:700;color:#e2e8f0;margin-bottom:4px}
  .desc{font-size:12px;color:#64748b;line-height:1.6}
  .tip{
    margin-top:8px;padding:8px 10px;border-radius:8px;
    background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);
    font-size:11px;color:#fcd34d;line-height:1.5;
  }
  .code{
    margin-top:6px;padding:6px 10px;border-radius:6px;
    background:rgba(0,0,0,.3);font-family:monospace;font-size:11px;
    color:#86efac;border:1px solid rgba(255,255,255,.05);
  }
`;

const FormatGrid = styled.div`
  display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;
`;
const FormatCard = styled.div`
  padding:14px;border-radius:12px;
  background:${p=>p.$bg||'rgba(99,102,241,.08)'};
  border:1px solid ${p=>p.$border||'rgba(99,102,241,.2)'};
  .ext{font-size:18px;font-weight:800;color:${p=>p.$color||'#818cf8'};margin-bottom:6px}
  .name{font-size:12px;font-weight:600;color:#94a3b8;margin-bottom:4px}
  .desc{font-size:11px;color:#4b5563;line-height:1.5}
`;

const TypeTable = styled.div`margin-top:12px`;
const TypeRow = styled.div`
  display:flex;align-items:center;gap:10px;padding:10px 12px;
  border-radius:8px;margin-bottom:6px;
  background:${p=>p.$bg||'rgba(255,255,255,.03)'};
  border:1px solid ${p=>p.$border||'rgba(255,255,255,.06)'};
  .icon{font-size:18px;flex-shrink:0}
  .type{font-size:12px;font-weight:700;color:${p=>p.$color||'#94a3b8'};min-width:60px}
  .rule{font-size:11px;color:#4b5563}
`;

const TipBox = styled.div`
  padding:14px;border-radius:12px;margin-top:4px;
  background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.2);
  font-size:12px;color:#6ee7b7;line-height:1.7;
  strong{color:#a7f3d0}
`;

// ─── MEVCUT STILLER ───────────────────────────────────────────────────────────
const StepsBar = styled.div`
  display:flex;gap:0;margin-bottom:40px;
  background:rgba(255,255,255,.05);border-radius:14px;padding:6px;
  border:1px solid rgba(255,255,255,.08);
`;
const StepBtn = styled.div`
  flex:1;padding:12px 16px;border-radius:10px;
  display:flex;align-items:center;gap:10px;
  font-size:14px;font-weight:600;
  color:${p=>p.$active?'#fff':p.$done?'#818cf8':'#4b5563'};
  background:${p=>p.$active?'linear-gradient(135deg,#6366f1,#8b5cf6)':'transparent'};
  transition:all .3s;cursor:${p=>p.$done?'pointer':'default'};
  .num{width:26px;height:26px;border-radius:50%;
    background:${p=>p.$active?'rgba(255,255,255,.2)':p.$done?'#818cf8':'rgba(255,255,255,.06)'};
    display:flex;align-items:center;justify-content:center;
    font-size:12px;font-weight:700;color:${p=>(p.$done||p.$active)?'#fff':'#6b7280'}}
  @media(max-width:600px){font-size:0;padding:12px;.num{font-size:12px};justify-content:center}
`;
const Card = styled.div`
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);
  border-radius:20px;padding:32px;backdrop-filter:blur(12px);
  animation:${fadeIn} .3s ease;
  @media(max-width:600px){padding:20px 16px}
`;
const Dropzone = styled.div`
  border:2px dashed ${p=>p.$dragging?'#818cf8':'rgba(255,255,255,.15)'};
  border-radius:16px;padding:64px 24px;text-align:center;
  cursor:pointer;transition:all .3s;
  background:${p=>p.$dragging?'rgba(99,102,241,.08)':'transparent'};
  ${p=>p.$dragging&&css`animation:${pulse} 2s infinite`};
  &:hover{border-color:#818cf8;background:rgba(99,102,241,.05)}
  .dz-icon{font-size:56px;color:${p=>p.$dragging?'#818cf8':'#4b5563'};margin-bottom:16px;transition:color .3s}
  h3{margin:0 0 8px;font-size:20px;font-weight:700;color:#e2e8f0}
  p{margin:0 0 4px;color:#64748b;font-size:14px}
`;
const FormatChips = styled.div`display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:20px`;
const FormatChip = styled.span`
  padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;
  background:rgba(255,255,255,.06);color:#94a3b8;border:1px solid rgba(255,255,255,.1);
`;
const SourceBadge = styled.div`
  display:inline-flex;align-items:center;gap:8px;padding:8px 16px;
  border-radius:30px;font-size:13px;font-weight:600;margin-bottom:16px;
  background:${p=>p.$ai?'rgba(139,92,246,.15)':'rgba(16,185,129,.15)'};
  border:1px solid ${p=>p.$ai?'rgba(139,92,246,.4)':'rgba(16,185,129,.4)'};
  color:${p=>p.$ai?'#c4b5fd':'#6ee7b7'};
`;
const TypeStats = styled.div`display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;`;
const TypePill = styled.div`
  padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;
  background:${p=>({inek:'rgba(16,185,129,.12)',duve:'rgba(59,130,246,.12)',buzagi:'rgba(245,158,11,.12)',tosun:'rgba(239,68,68,.12)'})[p.$type]||'rgba(255,255,255,.06)'};
  color:${p=>({inek:'#6ee7b7',duve:'#93c5fd',buzagi:'#fcd34d',tosun:'#fca5a5'})[p.$type]||'#94a3b8'};
  border:1px solid ${p=>({inek:'rgba(16,185,129,.3)',duve:'rgba(59,130,246,.3)',buzagi:'rgba(245,158,11,.3)',tosun:'rgba(239,68,68,.3)'})[p.$type]||'rgba(255,255,255,.1)'};
`;
const TableWrap = styled.div`overflow-x:auto;margin-top:16px;border-radius:12px;border:1px solid rgba(255,255,255,.08);`;
const Table = styled.table`
  width:100%;border-collapse:collapse;min-width:900px;
  th{padding:12px 10px;text-align:left;font-size:10px;font-weight:700;
    text-transform:uppercase;letter-spacing:1px;color:#64748b;
    background:rgba(255,255,255,.03);border-bottom:1px solid rgba(255,255,255,.06)}
  td{padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.05);font-size:12px;color:#e2e8f0;vertical-align:middle}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:rgba(255,255,255,.02)}
`;
const EditInput = styled.input`
  background:transparent;border:none;border-bottom:1px dashed rgba(255,255,255,.12);
  color:#e2e8f0;font-size:12px;width:100%;padding:2px 4px;
  &:focus{outline:none;border-bottom-color:#818cf8}
`;
const TypeSelect = styled.select`
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);
  border-radius:6px;color:#e2e8f0;font-size:11px;padding:4px 6px;width:100%;
  &:focus{outline:none;border-color:#818cf8} option{background:#1e293b}
`;
const DeleteBtn = styled.button`
  background:transparent;border:none;color:#ef4444;cursor:pointer;
  padding:4px;border-radius:4px;display:flex;align-items:center;
  opacity:.6;transition:opacity .2s;&:hover{opacity:1}
`;
const ActionRow = styled.div`display:flex;gap:12px;justify-content:flex-end;margin-top:24px;flex-wrap:wrap`;
const Btn = styled.button`
  display:flex;align-items:center;gap:8px;padding:12px 24px;
  border-radius:12px;border:none;font-size:14px;font-weight:600;
  cursor:pointer;transition:all .2s;
  &.primary{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;
    box-shadow:0 4px 15px rgba(99,102,241,.35);
    &:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(99,102,241,.45)}}
  &.secondary{background:rgba(255,255,255,.06);color:#94a3b8;
    border:1px solid rgba(255,255,255,.1);
    &:hover{background:rgba(255,255,255,.1);color:#e2e8f0}}
  &.success{background:linear-gradient(135deg,#10b981,#059669);color:#fff;
    box-shadow:0 4px 15px rgba(16,185,129,.35);&:hover{transform:translateY(-1px)}}
  &:disabled{opacity:.5;cursor:not-allowed;transform:none!important}
`;
const Spinner     = styled.div`width:18px;height:18px;border:2px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:${spin} .7s linear infinite;`;
const BigSpinner  = styled.div`width:40px;height:40px;border:3px solid rgba(255,255,255,.1);border-top-color:#818cf8;border-radius:50%;animation:${spin} .8s linear infinite;margin:0 auto 16px;`;
const InfoBox = styled.div`
  background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.2);
  border-radius:12px;padding:14px 18px;display:flex;gap:12px;
  align-items:flex-start;margin-bottom:24px;
  .icon{color:#818cf8;margin-top:2px;flex-shrink:0}
  p{margin:0;font-size:13px;color:#94a3b8;line-height:1.6}
`;
const ResultCard = styled.div`
  text-align:center;padding:40px;
  .big-icon{font-size:64px;margin-bottom:16px}
  h2{margin:0 0 8px;color:#fff;font-size:24px;font-weight:700}
  p{margin:0 0 8px;color:#64748b;font-size:15px}
  .detail{display:flex;gap:24px;justify-content:center;margin:24px 0;flex-wrap:wrap;
    .item{background:rgba(255,255,255,.05);border-radius:10px;padding:16px 24px;
      .num{font-size:28px;font-weight:800}.lbl{font-size:12px;color:#64748b;margin-top:4px}}}
`;

const TYPE_LABEL = { inek:'🐄 İnek', duve:'🐮 Düve', buzagi:'🐣 Buzağı', tosun:'🐂 Tosun' };
const TYPE_COLOR = { inek:'#6ee7b7', duve:'#93c5fd', buzagi:'#fcd34d', tosun:'#fca5a5' };

// ─── REHBER PANELİ İÇERİĞİ ───────────────────────────────────────────────────
function RehberPaneli({ onClose }) {
  return (
    <>
      <Overlay onClick={onClose}/>
      <HelpPanel>
        <PanelHeader>
          <h2><span>📋</span>Nasıl Kullanılır? — Rehber</h2>
          <CloseBtn onClick={onClose}><FiX size={18}/></CloseBtn>
        </PanelHeader>

        {/* ── 1. BÖLÜM: Türkvet ── */}
        <Section>
          <SectionTitle $color="rgba(59,130,246,.2)">
            <div className="icon">🏛️</div>
            <h3>1. Türkvet'ten Hayvan Listesi Alma</h3>
          </SectionTitle>
          <StepList>
            <Step $color="rgba(59,130,246,.25)" $textColor="#93c5fd">
              <div className="num">1</div>
              <div className="content">
                <div className="title">Türkvet'e Giriş Yapın</div>
                <div className="desc">e-Devlet şifresi veya Türkvet kullanıcı adınızla <strong style={{color:'#93c5fd'}}>turkvet.tarimorman.gov.tr</strong> adresine giriş yapın.</div>
              </div>
            </Step>
            <Step $color="rgba(59,130,246,.25)" $textColor="#93c5fd">
              <div className="num">2</div>
              <div className="content">
                <div className="title">İşletme → Hayvan Listesi</div>
                <div className="desc">Sol menüden <strong>İşletme Yönetimi → Hayvan Sorgulama</strong> bölümüne girin.</div>
              </div>
            </Step>
            <Step $color="rgba(59,130,246,.25)" $textColor="#93c5fd">
              <div className="num">3</div>
              <div className="content">
                <div className="title">Excel Olarak İndir</div>
                <div className="desc">Tablonun sağ üstündeki <strong>"Excele Aktar"</strong> veya <strong>"Dışa Aktar"</strong> butonuna tıklayın.</div>
                <div className="tip">⚡ Bu <strong>.xlsx</strong> dosyasını sisteme yükleyince tüm kolonlar (küpe no, irk, cinsiyet, doğum tarihi) otomatik okunur. AI gerekmez!</div>
              </div>
            </Step>
          </StepList>
        </Section>

        <Divider/>

        {/* ── 2. BÖLÜM: TARSIM ── */}
        <Section>
          <SectionTitle $color="rgba(245,158,11,.2)">
            <div className="icon">🧾</div>
            <h3>2. TARSIM Poliçe Belgesi Yükleme</h3>
          </SectionTitle>
          <StepList>
            <Step $color="rgba(245,158,11,.25)" $textColor="#fcd34d">
              <div className="num">1</div>
              <div className="content">
                <div className="title">Poliçe PDF'ini Edinin</div>
                <div className="desc">TARSIM'den aldığınız <strong>Büyükbaş Hayvan Zati Sermaye Sigortası</strong> poliçe PDF'ini hazırlayın.</div>
              </div>
            </Step>
            <Step $color="rgba(245,158,11,.25)" $textColor="#fcd34d">
              <div className="num">2</div>
              <div className="content">
                <div className="title">Metin Tabanlı mı Kontrol Edin</div>
                <div className="desc">PDF'i tarayıcıda açın. İçindeki metni seçip kopyalayabiliyorsanız <strong>metin tabanlıdır</strong> — direkt yükleyin. Seçemiyorsanız taranmış görseldir, AI kullanılır.</div>
              </div>
            </Step>
            <Step $color="rgba(245,158,11,.25)" $textColor="#fcd34d">
              <div className="num">3</div>
              <div className="content">
                <div className="title">Direkt Yükleyin</div>
                <div className="desc">PDF'i sürükle bırak alanına bırakın. Sistem küpe numaralarını, doğum tarihlerini ve cinsiyet bilgilerini otomatik çıkartır.</div>
                <div className="tip">⚠️ Taranmış (fotoğraf) PDF ise Gemini AI devreye girer ve görüntüyü okur.</div>
              </div>
            </Step>
          </StepList>
        </Section>

        <Divider/>

        {/* ── 3. BÖLÜM: Kendi Excel Şablonunuz ── */}
        <Section>
          <SectionTitle $color="rgba(16,185,129,.2)">
            <div className="icon">📊</div>
            <h3>3. Kendi Excel Listenizi Hazırlama</h3>
          </SectionTitle>
          <div style={{fontSize:12,color:'#64748b',marginBottom:12,lineHeight:1.6}}>
            Kendi Excel veya CSV dosyanızdaki kolonlar şu başlıklardan herhangi birini içeriyorsa sistem otomatik tanır:
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {[
              ['Küpe No', 'Küpe No, KupeNo, Hayvan No, No'],
              ['Irk', 'Irk, Irkı, Breed'],
              ['Cinsiyet', 'Cinsiyet, Gender, Cins'],
              ['Doğum Tarihi', 'Doğum Tarihi, DogumTarihi, D.Tarihi'],
              ['Anne Küpe', 'Anne Küpe, AnneKupe, Anne No'],
              ['Baba Küpe', 'Baba Küpe, BabaKupe, Boğa Küpe'],
              ['Kilo', 'Kilo, Ağırlık, Kg'],
            ].map(([field, alts])=>(
              <div key={field} style={{display:'flex',gap:8,padding:'8px 10px',background:'rgba(255,255,255,.03)',borderRadius:8,border:'1px solid rgba(255,255,255,.05)'}}>
                <span style={{fontSize:11,fontWeight:700,color:'#6ee7b7',minWidth:90}}>{field}</span>
                <span style={{fontSize:11,color:'#374151',fontFamily:'monospace'}}>{alts}</span>
              </div>
            ))}
          </div>
        </Section>

        <Divider/>

        {/* ── 4. BÖLÜM: Desteklenen Formatlar ── */}
        <Section>
          <SectionTitle $color="rgba(139,92,246,.2)">
            <div className="icon">📁</div>
            <h3>4. Desteklenen Dosya Formatları</h3>
          </SectionTitle>
          <FormatGrid>
            <FormatCard $bg="rgba(16,185,129,.06)" $border="rgba(16,185,129,.2)" $color="#6ee7b7">
              <div className="ext">.xlsx</div>
              <div className="name">Excel (Önerilen)</div>
              <div className="desc">Türkvet ve benzeri sistemlerin standart çıktısı. En hızlı ve güvenilir yöntem.</div>
            </FormatCard>
            <FormatCard $bg="rgba(59,130,246,.06)" $border="rgba(59,130,246,.2)" $color="#93c5fd">
              <div className="ext">.csv</div>
              <div className="name">CSV Metin</div>
              <div className="desc">Virgülle ayrılmış veri. Herhangi bir programa aktarılmış listeler için.</div>
            </FormatCard>
            <FormatCard $bg="rgba(245,158,11,.06)" $border="rgba(245,158,11,.2)" $color="#fcd34d">
              <div className="ext">.pdf</div>
              <div className="name">PDF Belge</div>
              <div className="desc">TARSIM, e-Devlet çıktıları. Metin tabanlıysa direkt, taranmışsa AI ile okunur.</div>
            </FormatCard>
            <FormatCard $bg="rgba(139,92,246,.06)" $border="rgba(139,92,246,.2)" $color="#c4b5fd">
              <div className="ext">.jpg / .png</div>
              <div className="name">Fotoğraf</div>
              <div className="desc">Ahırda tablonun fotoğrafı. Gemini AI ile tüm veriler okunmaya çalışılır.</div>
            </FormatCard>
          </FormatGrid>
        </Section>

        <Divider/>

        {/* ── 5. BÖLÜM: Otomatik Tür Tespiti ── */}
        <Section>
          <SectionTitle $color="rgba(239,68,68,.15)">
            <div className="icon">🧠</div>
            <h3>5. Otomatik Hayvan Türü Tespiti</h3>
          </SectionTitle>
          <div style={{fontSize:12,color:'#64748b',marginBottom:12}}>Doğum tarihinden yaş hesaplanarak hayvan türü otomatik belirlenir. Önizleme tablosunda düzenleyebilirsiniz.</div>
          <TypeTable>
            <TypeRow $bg="rgba(245,158,11,.06)" $border="rgba(245,158,11,.15)" $color="#fcd34d">
              <div className="icon">🐣</div>
              <div className="type">Buzağı</div>
              <div className="rule">Yaş 0–6 ay (dişi veya erkek)</div>
            </TypeRow>
            <TypeRow $bg="rgba(59,130,246,.06)" $border="rgba(59,130,246,.15)" $color="#93c5fd">
              <div className="icon">🐮</div>
              <div className="type">Düve</div>
              <div className="rule">Yaş 6–36 ay + Dişi</div>
            </TypeRow>
            <TypeRow $bg="rgba(239,68,68,.06)" $border="rgba(239,68,68,.15)" $color="#fca5a5">
              <div className="icon">🐂</div>
              <div className="type">Tosun</div>
              <div className="rule">Yaş 6–36 ay + Erkek</div>
            </TypeRow>
            <TypeRow $bg="rgba(16,185,129,.06)" $border="rgba(16,185,129,.15)" $color="#6ee7b7">
              <div className="icon">🐄</div>
              <div className="type">İnek</div>
              <div className="rule">Yaş 36+ ay veya bilgi yoksa</div>
            </TypeRow>
          </TypeTable>
        </Section>

        <Divider/>

        {/* ── 6. BÖLÜM: Gizlilik ── */}
        <Section>
          <TipBox>
            <strong>🔐 Gizlilik Taahhüdü</strong><br/>
            Yüklenen dosyalar yalnızca küpe no ve hayvan bilgilerini çıkarmak için anlık olarak işlenir.
            <strong> Hiçbir dosya sunucuya kaydedilmez.</strong> TC Kimlik No, İşletme No, telefon gibi
            kişisel veriler otomatik olarak filtrelenir ve sisteme asla işlenmez.
          </TipBox>
        </Section>
      </HelpPanel>
    </>
  );
}

// ─── ANA COMPONENT ────────────────────────────────────────────────────────────
export default function AkılliIthalat() {
  const navigate  = useNavigate();
  const inputRef  = useRef();

  const [step, setStep]             = useState(1);
  const [dragging, setDragging]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [coldStart, setColdStart]   = useState(false); // Render uyanıyor mesajı
  const [analiz, setAnaliz]         = useState(null);
  const [items, setItems]           = useState([]);
  const [kayitSonucu, setKayitSonucu] = useState(null);
  const [showHelp, setShowHelp]     = useState(false);

  // ─── DOSYA ────────────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { toast.error('Dosya 15 MB sınırını aşıyor'); return; }
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx','xls','csv','pdf','jpg','jpeg','png','webp'].includes(ext)) {
      toast.error(`Desteklenmeyen format: .${ext}`); return;
    }
    setLoading(true);
    setLoadingMsg(
      ['jpg','jpeg','png','webp'].includes(ext) ? '🤖 AI görüntüyü analiz ediyor...' :
      ext === 'pdf' ? '📄 PDF okunuyor...' : '📊 Excel/CSV içe aktarılıyor...'
    );
    // Render cold start tespiti: 8 saniye geçerse uyarı göster
    const coldTimer = setTimeout(() => setColdStart(true), 8000);
    try {
      const formData = new FormData();
      formData.append('dosya', file);
      const { data } = await api.aiImportAnaliz(formData);
      setAnaliz(data); setItems(data.items || []); setStep(2);
      toast.success(`${data.count} hayvan tespit edildi!`);
    } catch (err) {
      toast.error('Dosya içe aktarma başarısız: ' + (err.response?.data?.message || err.message));
    } finally { clearTimeout(coldTimer); setLoading(false); setColdStart(false); }
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const updateItem = (idx, field, val) =>
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));

  const deleteItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
    toast.info('Satır silindi', { autoClose: 1200 });
  };

  const typeStats = items.reduce((acc, i) => {
    const t = i.hayvanTipi || i.autoType || 'inek';
    acc[t] = (acc[t] || 0) + 1; return acc;
  }, {});

  const handleKaydet = async () => {
    const valid = items.filter(i => i.ear_tag);
    if (!valid.length) { toast.error('Kaydedilecek geçerli hayvan yok'); return; }
    setLoading(true); setLoadingMsg(`${valid.length} hayvan kaydediliyor...`);
    try {
      const { data } = await api.aiImportKaydet({ items: valid });
      setKayitSonucu(data); setStep(3); toast.success(data.message);
    } catch (err) {
      toast.error('Kayıt hatası: ' + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <Page>
      {showHelp && <RehberPaneli onClose={() => setShowHelp(false)} />}

      <Inner>
        <PageHeader>
          <div>
            <h1>📥 <span>Akıllı İthalat</span></h1>
            <p>Excel, CSV, PDF veya görsel yükleyerek hayvan listesini otomatik içe aktarın.</p>
          </div>
          {/* ── YARDIM BUTONU ── */}
          <HelpBtn onClick={() => setShowHelp(true)} title="Nasıl Kullanılır? Rehberi Aç">
            !
          </HelpBtn>
        </PageHeader>

        <StepsBar>
          {[['Dosya Yükle',1],['Önizle & Düzenle',2],['İçe Aktar',3]].map(([lbl,n]) => (
            <StepBtn key={n} $active={step===n} $done={step>n} onClick={()=>step>n&&setStep(n)}>
              <div className="num">{step>n?<FiCheckCircle size={13}/>:n}</div>{lbl}
            </StepBtn>
          ))}
        </StepsBar>

        {/* ── ADIM 1 ── */}
        {step === 1 && (
          <Card>
            <InfoBox>
              <FiInfo size={16} className="icon"/>
              <p>
                <strong style={{color:'#c4b5fd'}}>Nasıl Çalışır?</strong><br/>
                Excel/CSV → Tüm kolonlar (küpe no, irk, cinsiyet, doğum tarihi, anne/baba küpe, kilo) direkt okunur.
                Metin PDF → Küpe no + diğer bilgiler pattern eşlemesiyle çıkarılır.
                Görsel veya taranmış PDF → Gemini AI tüm alanları okur ve hayvan türünü otomatik tespit eder.{' '}
                <span
                  style={{color:'#f59e0b',cursor:'pointer',textDecoration:'underline',fontWeight:600}}
                  onClick={()=>setShowHelp(true)}>
                  ! Detaylı rehbere bak
                </span>
              </p>
            </InfoBox>

            {loading ? (
              <div style={{textAlign:'center',padding:'48px 0'}}>
                <BigSpinner/>
                <p style={{color:'#94a3b8',margin:0}}>{loadingMsg}</p>
                {coldStart && (
                  <div style={{marginTop:16,padding:'12px 20px',background:'rgba(245,158,11,.1)',border:'1px solid rgba(245,158,11,.3)',borderRadius:12,maxWidth:360,margin:'16px auto 0'}}>
                    <p style={{margin:0,fontSize:13,color:'#fcd34d',fontWeight:600}}>🌙 Sunucu Uyanıyor...</p>
                    <p style={{margin:'4px 0 0',fontSize:12,color:'#92400e',lineHeight:1.6}}>
                      Render.com üzerindeki sunucu kısa süreıñinde uyumuştu. 30-60 saniye içinde hazır olacak. Lütfen bekleyin...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Dropzone $dragging={dragging}
                  onDragEnter={e=>{e.preventDefault();setDragging(true)}}
                  onDragLeave={()=>setDragging(false)}
                  onDragOver={e=>e.preventDefault()}
                  onDrop={onDrop}
                  onClick={()=>inputRef.current?.click()}>
                  <div className="dz-icon"><FiUploadCloud/></div>
                  <h3>Dosyayı Sürükle veya Tıkla</h3>
                  <p>Türkvet listesi, TARSIM belgesi veya özel Excel şablonunuz</p>
                  <p style={{fontSize:12,color:'#374151'}}>Maks. 15 MB</p>
                  <FormatChips>
                    {['.xlsx','.xls','.csv','.pdf','.jpg','.png'].map(f=>(
                      <FormatChip key={f}>{f}</FormatChip>
                    ))}
                  </FormatChips>
                </Dropzone>
                <input ref={inputRef} type="file"
                  accept=".xlsx,.xls,.csv,.pdf,.jpg,.jpeg,.png,.webp"
                  style={{display:'none'}}
                  onChange={e=>{if(e.target.files[0])handleFile(e.target.files[0]);e.target.value='';}}
                />
              </>
            )}

            <div style={{marginTop:28,padding:'14px 18px',background:'rgba(255,255,255,.03)',borderRadius:10,border:'1px solid rgba(255,255,255,.06)'}}>
              <p style={{margin:'0 0 6px',fontSize:13,fontWeight:700,color:'#94a3b8'}}>🔐 Gizlilik Taahhüdü</p>
              <p style={{margin:0,fontSize:12,color:'#4b5563',lineHeight:1.6}}>
                Yüklenen dosyalar yalnızca küpe no ve hayvan bilgilerini çıkarmak için anlık olarak işlenir.
                <strong style={{color:'#6b7280'}}> Hiçbir dosya sunucuya kaydedilmez.</strong> TC Kimlik No ve kişisel veriler otomatik filtrelenir.
              </p>
            </div>
          </Card>
        )}

        {/* ── ADIM 2 ── */}
        {step === 2 && analiz && (
          <Card>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,flexWrap:'wrap',gap:12}}>
              <div>
                <SourceBadge $ai={analiz.usedAi}>
                  {analiz.usedAi
                    ? <><FiCpu size={14}/> 🤖 Gemini AI analiz etti</>
                    : <><FiZap size={14}/> ✅ {analiz.source==='excel'?'Excel':analiz.source==='csv'?'CSV':'PDF'} direkt okundu — AI kullanılmadı</>}
                </SourceBadge>
                <p style={{margin:0,color:'#64748b',fontSize:13}}>
                  <strong style={{color:'#e2e8f0'}}>{items.length}</strong> hayvan — {analiz.dosyaAdi} ({analiz.dosyaBoyutu})
                </p>
              </div>
            </div>

            <TypeStats>
              {Object.entries(typeStats).map(([tip,sayi])=>(
                <TypePill key={tip} $type={tip}>{TYPE_LABEL[tip]||tip}: {sayi} adet</TypePill>
              ))}
            </TypeStats>

            <p style={{margin:'0 0 6px',fontSize:12,color:'#64748b'}}>
              💡 Her satırda hayvan türünü değiştirebilir, verileri düzeltebilir veya satırı silebilirsiniz.
            </p>

            {items.length === 0 ? (
              <div style={{textAlign:'center',padding:'32px',color:'#64748b'}}>
                <FiAlertTriangle size={40} style={{marginBottom:12,color:'#f59e0b'}}/>
                <p>Hiç hayvan bulunamadı. Geri dönüp farklı bir dosya yükleyin.</p>
              </div>
            ) : (
              <TableWrap>
                <Table>
                  <thead>
                    <tr>
                      <th>#</th><th>TÜR</th><th>KÜPE NO</th><th>İSİM</th><th>IRK</th>
                      <th>CİNS</th><th>D. TARİHİ</th><th>YAŞ</th><th>KİLO</th>
                      <th>ANNE KÜPE</th><th>BABA KÜPE</th><th>D. YERİ</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const tip = item.hayvanTipi || item.autoType || 'inek';
                      const ageStr = item.ageMonths != null
                        ? item.ageMonths < 24 ? `${item.ageMonths} ay` : `${Math.floor(item.ageMonths/12)} yıl`
                        : '—';
                      return (
                        <tr key={idx}>
                          <td style={{color:'#4b5563',fontSize:11}}>{idx+1}</td>
                          <td>
                            <TypeSelect value={tip} onChange={e=>updateItem(idx,'hayvanTipi',e.target.value)} style={{borderColor:TYPE_COLOR[tip]+'66'}}>
                              <option value="inek">🐄 İnek</option>
                              <option value="duve">🐮 Düve</option>
                              <option value="buzagi">🐣 Buzağı</option>
                              <option value="tosun">🐂 Tosun</option>
                            </TypeSelect>
                          </td>
                          <td><EditInput value={item.ear_tag} onChange={e=>updateItem(idx,'ear_tag',e.target.value)}/></td>
                          <td><EditInput value={item.name} placeholder="—" onChange={e=>updateItem(idx,'name',e.target.value)}/></td>
                          <td><EditInput value={item.breed} onChange={e=>updateItem(idx,'breed',e.target.value)}/></td>
                          <td>
                            <TypeSelect value={item.gender} onChange={e=>updateItem(idx,'gender',e.target.value)}>
                              <option value="">—</option>
                              <option value="disi">Dişi</option>
                              <option value="erkek">Erkek</option>
                            </TypeSelect>
                          </td>
                          <td><EditInput type="date" value={item.birth_date} onChange={e=>updateItem(idx,'birth_date',e.target.value)}/></td>
                          <td style={{color:'#94a3b8',fontSize:11,whiteSpace:'nowrap'}}>{ageStr}</td>
                          <td><EditInput type="number" value={item.weight||''} placeholder="0" onChange={e=>updateItem(idx,'weight',e.target.value)}/></td>
                          <td><EditInput value={item.anne_kupe_no} placeholder="TR..." onChange={e=>updateItem(idx,'anne_kupe_no',e.target.value)}/></td>
                          <td><EditInput value={item.baba_kupe_no} placeholder="TR..." onChange={e=>updateItem(idx,'baba_kupe_no',e.target.value)}/></td>
                          <td><EditInput value={item.dogum_yeri} placeholder="—" onChange={e=>updateItem(idx,'dogum_yeri',e.target.value)}/></td>
                          <td><DeleteBtn onClick={()=>deleteItem(idx)}><FiTrash2 size={13}/></DeleteBtn></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </TableWrap>
            )}

            <ActionRow>
              <Btn className="secondary" onClick={()=>setStep(1)}><FiArrowLeft size={15}/> Geri</Btn>
              <Btn className="success" onClick={handleKaydet} disabled={loading||!items.length}>
                {loading ? <><Spinner/> {loadingMsg}</> : <><FiCheckCircle size={15}/> {items.length} Hayvanı Kaydet</>}
              </Btn>
            </ActionRow>
          </Card>
        )}

        {/* ── ADIM 3 ── */}
        {step === 3 && kayitSonucu && (
          <Card>
            <ResultCard>
              <div className="big-icon">🎉</div>
              <h2>İçe Aktarma Tamamlandı!</h2>
              <p>{kayitSonucu.message}</p>
              <div className="detail">
                <div className="item">
                  <div className="num" style={{color:'#10b981'}}>{kayitSonucu.eklenen}</div>
                  <div className="lbl">Eklendi</div>
                </div>
                {kayitSonucu.atlanan > 0 && (
                  <div className="item">
                    <div className="num" style={{color:'#f59e0b'}}>{kayitSonucu.atlanan}</div>
                    <div className="lbl">Atlandı</div>
                  </div>
                )}
              </div>

              {kayitSonucu.tipOzet && Object.keys(kayitSonucu.tipOzet).length > 0 && (
                <TypeStats style={{justifyContent:'center',marginBottom:16}}>
                  {Object.entries(kayitSonucu.tipOzet).map(([tip,sayi])=>(
                    <TypePill key={tip} $type={tip}>{TYPE_LABEL[tip]||tip}: {sayi}</TypePill>
                  ))}
                </TypeStats>
              )}

              {kayitSonucu.atlanmaDetay?.length > 0 && (
                <div style={{background:'rgba(245,158,11,.08)',border:'1px solid rgba(245,158,11,.2)',borderRadius:10,padding:'12px 16px',textAlign:'left',marginTop:16}}>
                  <p style={{margin:'0 0 8px',fontSize:13,fontWeight:700,color:'#f59e0b'}}>Atlanan Kayıtlar</p>
                  {kayitSonucu.atlanmaDetay.map((a,i)=>(
                    <p key={i} style={{margin:'2px 0',fontSize:12,color:'#92400e'}}>{a.kupeNo} — {a.sebep}</p>
                  ))}
                </div>
              )}

              <ActionRow style={{justifyContent:'center',marginTop:32}}>
                <Btn className="secondary" onClick={()=>{setStep(1);setAnaliz(null);setItems([]);setKayitSonucu(null);}}>
                  <FiUploadCloud size={15}/> Yeni Dosya Yükle
                </Btn>
                <Btn className="primary" onClick={()=>navigate('/inekler')}>
                  <FiArrowRight size={15}/> Hayvanlarımı Görüntüle
                </Btn>
              </ActionRow>
            </ResultCard>
          </Card>
        )}
      </Inner>
    </Page>
  );
}
