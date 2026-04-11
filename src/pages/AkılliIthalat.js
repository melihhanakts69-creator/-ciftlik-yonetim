import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import {
  FiUploadCloud, FiCheckCircle, FiAlertTriangle, FiTrash2,
  FiZap, FiCpu, FiArrowRight, FiArrowLeft, FiInfo, FiChevronDown
} from 'react-icons/fi';
import * as api from '../services/api';
import { toast } from 'react-toastify';

// ─── ANIMATIONS ───────────────────────────────────────────────────────────────
const fadeIn  = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;
const pulse   = keyframes`0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.3)}50%{box-shadow:0 0 0 16px rgba(99,102,241,0)}`;
const spin    = keyframes`to{transform:rotate(360deg)}`;

// ─── STYLED COMPONENTS ────────────────────────────────────────────────────────
const Page = styled.div`
  min-height:100vh;
  background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%);
  padding:32px 24px 80px;
  animation:${fadeIn} .4s ease;
`;
const Inner = styled.div`max-width:1000px;margin:0 auto`;

const PageHeader = styled.div`
  margin-bottom:40px;
  h1{margin:0 0 8px;font-size:32px;font-weight:800;color:#fff;
    span{background:linear-gradient(90deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent}}
  p{margin:0;color:#94a3b8;font-size:15px}
`;

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
const FormatChips = styled.div`
  display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:20px
`;
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
const TypeStats = styled.div`
  display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;
`;
const TypePill = styled.div`
  padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;
  background:${p=>({inek:'rgba(16,185,129,.12)',duve:'rgba(59,130,246,.12)',buzagi:'rgba(245,158,11,.12)',tosun:'rgba(239,68,68,.12)'})[p.$type]||'rgba(255,255,255,.06)'};
  color:${p=>({inek:'#6ee7b7',duve:'#93c5fd',buzagi:'#fcd34d',tosun:'#fca5a5'})[p.$type]||'#94a3b8'};
  border:1px solid ${p=>({inek:'rgba(16,185,129,.3)',duve:'rgba(59,130,246,.3)',buzagi:'rgba(245,158,11,.3)',tosun:'rgba(239,68,68,.3)'})[p.$type]||'rgba(255,255,255,.1)'};
`;
const TableWrap = styled.div`
  overflow-x:auto;margin-top:16px;border-radius:12px;
  border:1px solid rgba(255,255,255,.08);
`;
const Table = styled.table`
  width:100%;border-collapse:collapse;min-width:900px;
  th{padding:12px 10px;text-align:left;font-size:10px;font-weight:700;
    text-transform:uppercase;letter-spacing:1px;color:#64748b;
    background:rgba(255,255,255,.03);border-bottom:1px solid rgba(255,255,255,.06)}
  td{padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.05);
    font-size:12px;color:#e2e8f0;vertical-align:middle}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:rgba(255,255,255,.02)}
`;
const EditInput = styled.input`
  background:transparent;border:none;
  border-bottom:1px dashed rgba(255,255,255,.12);
  color:#e2e8f0;font-size:12px;width:100%;padding:2px 4px;
  &:focus{outline:none;border-bottom-color:#818cf8}
`;
const TypeSelect = styled.select`
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);
  border-radius:6px;color:#e2e8f0;font-size:11px;padding:4px 6px;width:100%;
  &:focus{outline:none;border-color:#818cf8}
  option{background:#1e293b}
`;
const DeleteBtn = styled.button`
  background:transparent;border:none;color:#ef4444;cursor:pointer;
  padding:4px;border-radius:4px;display:flex;align-items:center;
  opacity:.6;transition:opacity .2s;&:hover{opacity:1}
`;
const ActionRow = styled.div`
  display:flex;gap:12px;justify-content:flex-end;margin-top:24px;flex-wrap:wrap
`;
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
    box-shadow:0 4px 15px rgba(16,185,129,.35);
    &:hover{transform:translateY(-1px)}}
  &:disabled{opacity:.5;cursor:not-allowed;transform:none!important}
`;
const Spinner = styled.div`
  width:18px;height:18px;border:2px solid rgba(255,255,255,.2);
  border-top-color:#fff;border-radius:50%;animation:${spin} .7s linear infinite;
`;
const BigSpinner = styled.div`
  width:40px;height:40px;border:3px solid rgba(255,255,255,.1);
  border-top-color:#818cf8;border-radius:50%;
  animation:${spin} .8s linear infinite;margin:0 auto 16px;
`;
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

const TYPE_LABEL = { inek: '🐄 İnek', duve: '🐮 Düve', buzagi: '🐣 Buzağı', tosun: '🐂 Tosun' };
const TYPE_COLOR = { inek: '#6ee7b7', duve: '#93c5fd', buzagi: '#fcd34d', tosun: '#fca5a5' };

// ─── ANA COMPONENT ────────────────────────────────────────────────────────────
export default function AkılliIthalat() {
  const navigate = useNavigate();
  const inputRef = useRef();

  const [step, setStep]           = useState(1);
  const [dragging, setDragging]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [analiz, setAnaliz]       = useState(null);
  const [items, setItems]         = useState([]);
  const [kayitSonucu, setKayitSonucu] = useState(null);

  // ─── DOSYA İŞLEME ─────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { toast.error('Dosya 15 MB sınırını aşıyor'); return; }
    const ext = file.name.split('.').pop().toLowerCase();
    const allowed = ['xlsx','xls','csv','pdf','jpg','jpeg','png','webp'];
    if (!allowed.includes(ext)) { toast.error(`Desteklenmeyen format: .${ext}`); return; }

    setLoading(true);
    setLoadingMsg(
      ['jpg','jpeg','png','webp'].includes(ext) ? '🤖 AI görüntüyü analiz ediyor...' :
      ext === 'pdf' ? '📄 PDF okunuyor...' : '📊 Excel/CSV içe aktarılıyor...'
    );

    try {
      const formData = new FormData();
      formData.append('dosya', file);
      const { data } = await api.aiImportAnaliz(formData);
      setAnaliz(data);
      setItems(data.items || []);
      setStep(2);
      toast.success(`${data.count} hayvan tespit edildi!`);
    } catch (err) {
      toast.error('Dosya işlenemedi: ' + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // ─── SATIR OPS ────────────────────────────────────────────────────────────
  const updateItem = (idx, field, val) =>
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));

  const deleteItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
    toast.info('Satır silindi', { autoClose: 1200 });
  };

  // Otomatik tip renkli badge
  const typeStats = items.reduce((acc, i) => {
    const t = i.hayvanTipi || i.autoType || 'inek';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  // ─── KAYDET ───────────────────────────────────────────────────────────────
  const handleKaydet = async () => {
    const valid = items.filter(i => i.ear_tag);
    if (!valid.length) { toast.error('Kaydedilecek geçerli hayvan yok'); return; }
    setLoading(true); setLoadingMsg(`${valid.length} hayvan kaydediliyor...`);
    try {
      const { data } = await api.aiImportKaydet({ items: valid });
      setKayitSonucu(data);
      setStep(3);
      toast.success(data.message);
    } catch (err) {
      toast.error('Kayıt hatası: ' + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <Page>
      <Inner>
        <PageHeader>
          <h1>📥 <span>Akıllı İthalat</span></h1>
          <p>Excel, CSV, PDF veya görsel yükleyerek hayvan listesini otomatik içe aktarın.</p>
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
                Metin tabanlı PDF → Küpe no + diğer bilgiler pattern eşlemesiyle çıkarılır.
                Görsel veya taranmış PDF → Gemini AI tüm alanları okur ve hayvan türünü otomatik tespit eder.
              </p>
            </InfoBox>

            {loading ? (
              <div style={{textAlign:'center',padding:'48px 0'}}>
                <BigSpinner/><p style={{color:'#94a3b8',margin:0}}>{loadingMsg}</p>
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
                <strong style={{color:'#6b7280'}}> Hiçbir dosya sunucuya kaydedilmez.</strong> TC Kimlik No, İşletme No gibi kişisel veriler otomatik olarak filtrelenir.
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

            {/* Tür dağılımı */}
            <TypeStats>
              {Object.entries(typeStats).map(([tip,sayi])=>(
                <TypePill key={tip} $type={tip}>{TYPE_LABEL[tip]||tip}: {sayi} adet</TypePill>
              ))}
            </TypeStats>

            <p style={{margin:'0 0 6px',fontSize:12,color:'#64748b'}}>
              💡 Her satırda hayvan türünü değiştirebilir, yanlış verileri düzeltebilir veya satırı silebilirsiniz.
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
                      <th style={{width:30}}>#</th>
                      <th>TÜR</th>
                      <th>KÜPE NO</th>
                      <th>İSİM</th>
                      <th>IRK</th>
                      <th>CİNSİYET</th>
                      <th>D. TARİHİ</th>
                      <th>YAŞ</th>
                      <th>KİLO</th>
                      <th>ANNE KÜPE</th>
                      <th>BABA KÜPE</th>
                      <th>D. YERİ</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const tip = item.hayvanTipi || item.autoType || 'inek';
                      const ageStr = item.ageMonths != null
                        ? item.ageMonths < 24
                          ? `${item.ageMonths} ay`
                          : `${Math.floor(item.ageMonths/12)} yıl`
                        : '—';
                      return (
                        <tr key={idx}>
                          <td style={{color:'#4b5563',fontSize:11}}>{idx+1}</td>
                          <td>
                            <TypeSelect
                              value={tip}
                              onChange={e=>updateItem(idx,'hayvanTipi',e.target.value)}
                              style={{borderColor: TYPE_COLOR[tip]+'66'}}>
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
                {loading
                  ? <><Spinner/> {loadingMsg}</>
                  : <><FiCheckCircle size={15}/> {items.length} Hayvanı Kaydet</>}
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
                {kayitSonucu.atlanan>0 && (
                  <div className="item">
                    <div className="num" style={{color:'#f59e0b'}}>{kayitSonucu.atlanan}</div>
                    <div className="lbl">Atlandı</div>
                  </div>
                )}
              </div>

              {/* Tür özeti */}
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
