import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaPlus, FaTrash, FaSave, FaCalculator, FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaChevronDown, FaChevronUp, FaLightbulb } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;

// --- STYLED COMPONENTS ---
const PageGrid = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 16px;
  align-items: flex-start;

  @media (max-width: 1000px) { grid-template-columns: 1fr; }
`;

const CalculatorContainer = styled.div`
  background: white; border-radius: 14px; padding: 22px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);

  @media (max-width: 768px) { padding: 16px; border-radius: 12px; }
`;

const InfoPanel = styled.div`
  background: #f8fafc; border-radius: 14px; padding: 20px;
  border: 1px solid #e2e8f0; position: sticky; top: 20px;
  animation: ${fadeIn} .3s ease;

  @media (max-width: 1000px) {
    position: static;
    display: ${p => p.$visible ? 'block' : 'none'};
  }
`;

const SectionTitle = styled.h3`
  color: #1e293b; margin: 0 0 16px 0; display: flex; align-items: center; gap: 10px;
  font-size: 15px; font-weight: 800;
`;

const TopFields = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 18px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
`;

const InputGroup = styled.div`
  label {
    display: block; margin-bottom: 5px; font-weight: 700; color: #334155; font-size: 12px;
    text-transform: uppercase; letter-spacing: 0.4px;
  }
  input, select {
    width: 100%; padding: 9px 11px; border: 1.5px solid #e2e8f0; border-radius: 9px;
    font-size: 13px; outline: none; background: #f8fafc; box-sizing: border-box;
    color: #1e293b;
    &:focus { border-color: #10b981; background: #fff; box-shadow: 0 0 0 3px rgba(16,185,129,.1); }
  }
`;

const FeedTableHeader = styled.div`
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr auto;
  gap: 10px;
  padding: 8px 12px;
  background: #f1f5f9;
  border-radius: 8px;
  font-weight: 700; font-size: 11px; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.4px;
  margin-bottom: 8px;

  @media (max-width: 600px) { display: none; }
`;

const FeedRow = styled.div`
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 12px;
  background: ${props => props.$active ? '#f0fdf4' : '#fff'};
  border: 1.5px solid ${props => props.$active ? '#86efac' : '#e2e8f0'};
  border-radius: 10px;
  margin-bottom: 8px;
  transition: all 0.2s;
  cursor: pointer;
  &:hover { border-color: #86efac; background: #f0fdf4; }

  select, input {
    width: 100%; padding: 8px 10px; border: 1.5px solid #e2e8f0; border-radius: 8px;
    font-size: 13px; outline: none; background: #f8fafc; box-sizing: border-box;
    &:focus { border-color: #10b981; background: #fff; }
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr auto;
    gap: 8px;
    
    .total-col { display: none; }
  }
`;

const DeleteBtn = styled.button`
  width: 34px; height: 34px; border: none; background: #fff1f2; color: #e11d48;
  border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all .2s; flex-shrink: 0;
  &:hover { background: #fecdd3; }
`;

const AddFeedBtn = styled.button`
  display: flex; align-items: center; gap: 7px; padding: 10px 16px;
  background: #f1f5f9; border: 1.5px dashed #cbd5e1; border-radius: 10px;
  font-size: 13px; font-weight: 700; color: #64748b; cursor: pointer; transition: all .2s;
  &:hover { background: #e2e8f0; border-color: #94a3b8; color: #334155; }
`;

const CostRow = styled.div`
  margin-top: 20px; padding-top: 18px; border-top: 2px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 10px;

  @media (max-width: 600px) { flex-direction: column; align-items: flex-start; }
`;

const CostBlock = styled.div`
  .lbl { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; margin-bottom: 3px; }
  .val { font-size: 22px; font-weight: 900; color: ${p => p.$green ? '#065f46' : '#1e293b'}; }
`;

const SaveBtn = styled.button`
  width: 100%; margin-top: 16px; background: linear-gradient(135deg,#065f46,#047857);
  color: white; border: none; padding: 14px; border-radius: 12px;
  font-size: 14px; font-weight: 800; cursor: pointer; transition: all .2s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  &:hover { filter: brightness(1.1); transform: translateY(-1px); }
`;

const AnalysisToggleBtn = styled.button`
  display: none;
  width: 100%; padding: 12px 16px; margin: 12px 0 0;
  background: linear-gradient(135deg,#eff6ff,#dbeafe);
  border: 1.5px solid #93c5fd; border-radius: 12px;
  color: #1d4ed8; font-size: 13px; font-weight: 800; cursor: pointer;
  align-items: center; justify-content: center; gap: 8px; transition: all .2s;
  &:hover { background: #dbeafe; }

  @media (max-width: 1000px) { display: flex; }
`;

const Badge = styled.span`
  background: ${props => props.$color || '#eee'};
  color: ${props => props.$textColor || '#333'};
  padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;
  display: inline-flex; align-items: center; gap: 4px;
`;

const StatCard = styled.div`
  background: white; padding: 14px; border-radius: 10px; margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;
  .label { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center; }
  .value { font-size: 20px; font-weight: 900; color: #1e293b; }
  .sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
`;

const ProgressBar = styled.div`
  height: 6px; background: #f1f5f9; border-radius: 4px; overflow: hidden; margin-top: 6px;
  div { height: 100%; background: ${props => props.$bg}; width: ${props => props.$width}%; transition: width 0.5s; border-radius: 4px; }
`;

const FeedDetailCard = styled.div`
  background: white; padding: 14px; border-radius: 10px; margin-bottom: 14px;
  border-left: 4px solid #3b82f6;
  .name { font-size: 14px; font-weight: 800; color: #1e293b; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .item { font-size: 12px; color: #475569; .v { font-weight: 700; color: #1e293b; } }
`;

const EmptyFeedNote = styled.div`
  padding: 16px; text-align: center; color: #94a3b8; font-size: 13px; font-style: italic;
  background: white; border-radius: 10px; margin-bottom: 14px; border: 1px dashed #e2e8f0;
`;

const RecommendationBox = styled.div`
  background: ${p => p.$bg || '#f0fdf4'}; border: 1px solid ${p => p.$border || '#86efac'};
  border-radius: 10px; padding: 12px 14px; margin-bottom: 10px;
  display: flex; gap: 10px; align-items: flex-start;
  .icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
  .text { font-size: 12px; color: ${p => p.$textColor || '#065f46'}; font-weight: 600; line-height: 1.5; }
`;

// --- CONSTANTS ---
const NUTRIENT_TARGETS = {
  sagmal: { protein: [16, 18], enerji: [2.6, 2.8], km: [20, 24] },
  besi: { protein: [13, 15], enerji: [2.7, 2.9], km: [10, 15] },
  genc_duve: { protein: [14, 16], enerji: [2.4, 2.6], km: [15, 18] },
  buzagi: { protein: [18, 22], enerji: [2.8, 3.1], km: [5, 10] },
  kuru: { protein: [12, 14], enerji: [1.8, 2.1], km: [12, 14] }
};

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const RasyonHesaplayici = ({ yemler = [], onSave }) => {
  const [rasyonAdi, setRasyonAdi] = useState('');
  const [hedefGrup, setHedefGrup] = useState('sagmal');
  const [hayvanSayisi, setHayvanSayisi] = useState(50);
  const [secilenYemler, setSecilenYemler] = useState([{ yemId: '', miktar: 0 }]);
  const [activeFeedId, setActiveFeedId] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState({ maliyet: 0, km: 0, proteinPct: 0, enerjiAvg: 0, totalKg: 0 });

  const calculateAnalysis = () => {
    let m = 0, k = 0, p = 0, e = 0, totalKg = 0;
    secilenYemler.forEach(item => {
      const yem = yemler.find(y => y._id === item.yemId);
      if (yem && item.miktar > 0) {
        totalKg += item.miktar;
        m += item.miktar * (yem.birimFiyat || 0);
        k += (item.miktar * (yem.kuruMadde || 0)) / 100;
        e += item.miktar * (yem.enerji || 0);
        p += (item.miktar * (yem.protein || 0)) / 100;
      }
    });
    const avgProtein = totalKg > 0 ? (p * 100 / totalKg) : 0;
    const avgEnerji = totalKg > 0 ? (e / totalKg) : 0;
    setAnalysis({ maliyet: m, km: k, proteinPct: isNaN(avgProtein) ? 0 : avgProtein, enerjiAvg: isNaN(avgEnerji) ? 0 : avgEnerji, totalKg });
  };

  useEffect(() => { calculateAnalysis(); }, [secilenYemler, yemler, hayvanSayisi]);

  const handleFeedChange = (index, field, value) => {
    const list = [...secilenYemler];
    list[index][field] = value;
    setSecilenYemler(list);
    if (field === 'yemId') setActiveFeedId(value);
  };

  const handleSave = () => {
    if (!rasyonAdi || secilenYemler.filter(x => x.yemId).length === 0) return alert('Lütfen isim ve en az bir yem giriniz.');
    onSave({ ad: rasyonAdi, hedefGrup, icerik: secilenYemler.filter(x => x.yemId && x.miktar > 0), toplamMaliyet: analysis.maliyet });
  };

  const activeFeed = yemler.find(y => y._id === activeFeedId);
  const targets = NUTRIENT_TARGETS[hedefGrup] || NUTRIENT_TARGETS.sagmal;

  const getStatus = (val, min, max) => {
    if (val < min) return { color: '#ffebee', text: '#c62828', icon: <FaExclamationTriangle />, msg: 'Düşük' };
    if (val > max) return { color: '#fff3e0', text: '#ef6c00', icon: <FaExclamationTriangle />, msg: 'Yüksek' };
    return { color: '#e8f5e9', text: '#2e7d32', icon: <FaCheckCircle />, msg: 'İdeal' };
  };

  const getRecommendations = () => {
    const recs = [];
    const pSt = getStatus(analysis.proteinPct, targets.protein[0], targets.protein[1]);
    const eSt = getStatus(analysis.enerjiAvg, targets.enerji[0], targets.enerji[1]);

    if (pSt.msg === 'Düşük') recs.push({ type: 'warn', text: `Protein oranı (%${analysis.proteinPct.toFixed(1)}) hedefin altında. Küspe, konsantre veya soya küspesi ekleyin.` });
    if (pSt.msg === 'Yüksek') recs.push({ type: 'warn', text: `Protein fazla (%${analysis.proteinPct.toFixed(1)}). Nişastalı yemleri artırarak dengeyi sağlayın.` });
    if (eSt.msg === 'Düşük') recs.push({ type: 'warn', text: `Enerji yoğunluğu düşük (${analysis.enerjiAvg.toFixed(2)} Mcal). Mısır, arpa gibi tahıl yemlerini artırın.` });
    if (eSt.msg === 'Yüksek') recs.push({ type: 'warn', text: `Enerji yoğunluğu yüksek. Kaba yem miktarını artırın.` });
    if (pSt.msg === 'İdeal' && eSt.msg === 'İdeal') recs.push({ type: 'ok', text: `Rasyon dengeli. Protein ve enerji hedef aralıklarında.` });
    if (analysis.totalKg < 10) recs.push({ type: 'info', text: `Toplam rasyon miktarı çok düşük (${analysis.totalKg.toFixed(1)} kg). Sağmal inek için günde 18-24 kg KM önerilir.` });
    return recs;
  };

  const pieData = secilenYemler
    .filter(x => x.yemId && x.miktar > 0)
    .map(x => ({ name: yemler.find(y => y._id === x.yemId)?.ad || '?', value: x.miktar }));

  return (
    <PageGrid>
      {/* ─ Sol: Hesaplayıcı ─ */}
      <CalculatorContainer>
        <SectionTitle><FaCalculator /> Rasyon Planlama</SectionTitle>

        <TopFields>
          <InputGroup style={{ gridColumn: '1 / -1' }}>
            <label>Rasyon Adı</label>
            <input value={rasyonAdi} onChange={e => setRasyonAdi(e.target.value)} placeholder="örn: Haziran Sağmal Rasyon" />
          </InputGroup>
          <InputGroup>
            <label>Hedef Grup</label>
            <select value={hedefGrup} onChange={e => setHedefGrup(e.target.value)}>
              <option value="sagmal">Sağmal (Süt)</option>
              <option value="besi">Besi (Et)</option>
              <option value="genc_duve">Genç Düve</option>
              <option value="buzagi">Buzağı</option>
              <option value="kuru">Kuru Dönem</option>
            </select>
          </InputGroup>
          <InputGroup>
            <label>Hayvan Sayısı</label>
            <input type="number" value={hayvanSayisi} onChange={e => setHayvanSayisi(Number(e.target.value))} />
          </InputGroup>
        </TopFields>

        <FeedTableHeader>
          <span>Yem Adı</span>
          <span>1 Baş (Kg)</span>
          <span>{hayvanSayisi} Baş (Kg)</span>
          <span />
        </FeedTableHeader>

        {secilenYemler.map((item, index) => (
          <FeedRow key={index} $active={item.yemId === activeFeedId} onClick={() => setActiveFeedId(item.yemId)}>
            <select value={item.yemId} onChange={e => handleFeedChange(index, 'yemId', e.target.value)}>
              <option value="">Yem Seç...</option>
              {yemler.map(y => <option key={y._id} value={y._id}>{y.ad}</option>)}
            </select>
            <input
              type="number" step="0.1"
              value={item.miktar}
              onChange={e => handleFeedChange(index, 'miktar', parseFloat(e.target.value))}
              placeholder="Kg/Baş"
            />
            <div className="total-col" style={{ fontWeight: 700, color: '#334155', fontSize: 13 }}>
              {(item.miktar * hayvanSayisi).toFixed(0)} <span style={{ fontSize: 11, color: '#94a3b8' }}>Kg</span>
            </div>
            <DeleteBtn onClick={e => { e.stopPropagation(); const l = [...secilenYemler]; l.splice(index, 1); setSecilenYemler(l); }}>
              <FaTrash size={12} />
            </DeleteBtn>
          </FeedRow>
        ))}

        <AddFeedBtn onClick={() => setSecilenYemler([...secilenYemler, { yemId: '', miktar: 0 }])}>
          <FaPlus size={11} /> Yem Ekle
        </AddFeedBtn>

        <CostRow>
          <CostBlock $green>
            <div className="lbl">Hayvan Başı</div>
            <div className="val">{analysis.maliyet.toFixed(2)} TL</div>
          </CostBlock>
          <CostBlock>
            <div className="lbl">Toplam ({hayvanSayisi} Baş)</div>
            <div className="val">{(analysis.maliyet * hayvanSayisi).toFixed(2)} TL</div>
          </CostBlock>
          <CostBlock>
            <div className="lbl">Toplam Miktar</div>
            <div className="val">{analysis.totalKg.toFixed(1)} kg/Baş</div>
          </CostBlock>
        </CostRow>

        {/* Analiz & Rehber Toggle (sadece mobilde görünür) */}
        <AnalysisToggleBtn onClick={() => setShowAnalysis(p => !p)}>
          <FaLightbulb size={13} />
          {showAnalysis ? 'Analizi Gizle' : 'Analiz & Rehber Görüntüle'}
          {showAnalysis ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
        </AnalysisToggleBtn>

        <SaveBtn onClick={handleSave}>
          <FaSave /> Rasyonu Kaydet
        </SaveBtn>
      </CalculatorContainer>

      {/* ─ Sağ: Analiz & Rehber ─ */}
      <InfoPanel $visible={showAnalysis}>
        <SectionTitle><FaInfoCircle /> Analiz & Rehber</SectionTitle>

        {activeFeed ? (
          <FeedDetailCard>
            <div className="name">
              {activeFeed.ad}
              <Badge $color="#e3f2fd" $textColor="#1565c0">{activeFeed.birimFiyat} TL/Kg</Badge>
            </div>
            <div className="grid">
              <div className="item">Protein <div className="v">%{activeFeed.protein}</div></div>
              <div className="item">Enerji <div className="v">{activeFeed.enerji} Mcal</div></div>
              <div className="item">Kuru Madde <div className="v">%{activeFeed.kuruMadde}</div></div>
              <div className="item">Nişasta <div className="v">%{activeFeed.nisasta || '-'}</div></div>
            </div>
          </FeedDetailCard>
        ) : (
          <EmptyFeedNote>Detay için soldaki listeden bir yeme tıklayın.</EmptyFeedNote>
        )}

        <h4 style={{ color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, fontSize: 13, margin: '0 0 12px' }}>
          Rasyon Dengesi ({hedefGrup === 'sagmal' ? 'Sağmal' : hedefGrup === 'besi' ? 'Besi' : hedefGrup === 'buzagi' ? 'Buzağı' : hedefGrup === 'kuru' ? 'Kuru Dönem' : 'Genç Düve'})
        </h4>

        <StatCard>
          <div className="label">
            <span>Protein Dengesi</span>
            <Badge $color={getStatus(analysis.proteinPct, targets.protein[0], targets.protein[1]).color}
                   $textColor={getStatus(analysis.proteinPct, targets.protein[0], targets.protein[1]).text}>
              {getStatus(analysis.proteinPct, targets.protein[0], targets.protein[1]).icon}{' '}
              {getStatus(analysis.proteinPct, targets.protein[0], targets.protein[1]).msg}
            </Badge>
          </div>
          <div className="value">%{analysis.proteinPct.toFixed(1)}</div>
          <div className="sub">Hedef: %{targets.protein[0]} – %{targets.protein[1]}</div>
          <ProgressBar $bg={getStatus(analysis.proteinPct, targets.protein[0], targets.protein[1]).text}
                       $width={Math.min(100, (analysis.proteinPct / targets.protein[1]) * 100)} />
        </StatCard>

        <StatCard>
          <div className="label">
            <span>Enerji Yoğunluğu</span>
            <Badge $color={getStatus(analysis.enerjiAvg, targets.enerji[0], targets.enerji[1]).color}
                   $textColor={getStatus(analysis.enerjiAvg, targets.enerji[0], targets.enerji[1]).text}>
              {getStatus(analysis.enerjiAvg, targets.enerji[0], targets.enerji[1]).icon}{' '}
              {getStatus(analysis.enerjiAvg, targets.enerji[0], targets.enerji[1]).msg}
            </Badge>
          </div>
          <div className="value">{analysis.enerjiAvg.toFixed(2)} <span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>Mcal/kg</span></div>
          <div className="sub">Hedef: {targets.enerji[0]} – {targets.enerji[1]}</div>
          <ProgressBar $bg={getStatus(analysis.enerjiAvg, targets.enerji[0], targets.enerji[1]).text}
                       $width={Math.min(100, (analysis.enerjiAvg / targets.enerji[1]) * 100)} />
        </StatCard>

        {/* Öneriler */}
        {getRecommendations().map((rec, i) => (
          <RecommendationBox
            key={i}
            $bg={rec.type === 'ok' ? '#f0fdf4' : rec.type === 'warn' ? '#fffbeb' : '#eff6ff'}
            $border={rec.type === 'ok' ? '#86efac' : rec.type === 'warn' ? '#fde68a' : '#bfdbfe'}
            $textColor={rec.type === 'ok' ? '#065f46' : rec.type === 'warn' ? '#92400e' : '#1d4ed8'}
          >
            <span className="icon">{rec.type === 'ok' ? '✅' : rec.type === 'warn' ? '⚠️' : 'ℹ️'}</span>
            <span className="text">{rec.text}</span>
          </RecommendationBox>
        ))}

        {/* Karışım Oranları Pie Chart */}
        {pieData.length > 1 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Karışım Oranları
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} kg`, n]} />
                <Legend verticalAlign="bottom" height={36} iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </InfoPanel>
    </PageGrid>
  );
};

export default RasyonHesaplayici;
