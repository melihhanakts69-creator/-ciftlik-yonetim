import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTrash, FaSave, FaCalculator, FaInfoCircle, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- STYLED COMPONENTS ---
const PageGrid = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 20px;
  @media (max-width: 1000px) { grid-template-columns: 1fr; }
`;

const CalculatorContainer = styled.div`
  background: white; border-radius: 12px; padding: 25px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
`;

const InfoPanel = styled.div`
  background: #f8f9fa; border-radius: 12px; padding: 25px;
  border: 1px solid #e9ecef; position: sticky; top: 20px; min-height: 500px;
`;

const SectionTitle = styled.h3`
  color: #2c3e50; margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px; font-size: 1.2rem;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
  label { display: block; margin-bottom: 8px; font-weight: 600; color: #2c3e50; }
  input, select {
    width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px;
    &:focus { border-color: #4caf50; outline: none; }
  }
`;

const FeedRow = styled.div`
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr auto;
  gap: 15px;
  align-items: center;
  padding: 15px;
  background: ${props => props.active ? '#e8f5e9' : '#fff'};
  border: 1px solid ${props => props.active ? '#c8e6c9' : '#eee'};
  border-radius: 10px;
  margin-bottom: 12px;
  transition: all 0.2s;
  &:hover { background: #f1f8e9; transform: translateX(5px); }
`;

const Badge = styled.span`
  background: ${props => props.color || '#eee'};
  color: ${props => props.textColor || '#333'};
  padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold;
`;

const StatCard = styled.div`
  background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.03);
  h4 { margin: 0 0 10px 0; font-size: 0.9rem; color: #666; }
  .value { font-size: 1.4rem; font-weight: 800; color: #2c3e50; }
  .sub { font-size: 0.8rem; color: #999; }
`;

const ProgressBar = styled.div`
  height: 8px; background: #eee; border-radius: 4px; overflow: hidden; margin-top: 5px;
  div { height: 100%; background: ${props => props.bg}; width: ${props => props.width}%; transition: width 0.5s; }
`;

// --- CONSTANTS ---
const NUTRIENT_TARGETS = {
    sagmal: { protein: [16, 18], enerji: [2.6, 2.8], km: [20, 24] },
    besi: { protein: [13, 15], enerji: [2.7, 2.9], km: [10, 15] },
    genc_duve: { protein: [14, 16], enerji: [2.4, 2.6], km: [15, 18] },
    buzagi: { protein: [18, 22], enerji: [2.8, 3.1], km: [5, 10] },
    kuru: { protein: [12, 14], enerji: [1.8, 2.1], km: [12, 14] }
};

const RasyonHesaplayici = ({ yemler = [], onSave }) => {
    const [rasyonAdi, setRasyonAdi] = useState('');
    const [hedefGrup, setHedefGrup] = useState('sagmal');
    const [hayvanSayisi, setHayvanSayisi] = useState(50);
    const [secilenYemler, setSecilenYemler] = useState([{ yemId: '', miktar: 0 }]);
    const [activeFeedId, setActiveFeedId] = useState(null);

    const [analysis, setAnalysis] = useState({ maliyet: 0, km: 0, proteinPct: 0, enerjiAvg: 0 });

    const calculateAnalysis = () => {
        let m = 0, k = 0, p = 0, e = 0;
        let totalKg = 0;

        secilenYemler.forEach(item => {
            const yem = yemler.find(y => y._id === item.yemId);
            if (yem && item.miktar > 0) {
                totalKg += item.miktar;
                m += item.miktar * (yem.birimFiyat || 0);
                k += (item.miktar * (yem.kuruMadde || 0)) / 100;
                e += (item.miktar * (yem.enerji || 0));
                p += (item.miktar * (yem.protein || 0)) / 100;
            }
        });

        let avgProtein = totalKg > 0 ? (p * 100 / totalKg) : 0;
        let avgEnerji = totalKg > 0 ? (e / totalKg) : 0;

        if (isNaN(avgProtein)) avgProtein = 0;
        if (isNaN(avgEnerji)) avgEnerji = 0;

        setAnalysis({ maliyet: m, km: k, proteinPct: avgProtein, enerjiAvg: avgEnerji, totalKg });
    };

    useEffect(() => {
        calculateAnalysis();
    }, [secilenYemler, yemler, hayvanSayisi]);

    const handleFeedChange = (index, field, value) => {
        const list = [...secilenYemler];
        list[index][field] = value;
        setSecilenYemler(list);
        if (field === 'yemId') setActiveFeedId(value);
    };

    const handleSave = () => {
        if (!rasyonAdi || secilenYemler.filter(x => x.yemId).length === 0) return alert('Lütfen isim ve en az bir yem giriniz.');
        onSave({
            ad: rasyonAdi,
            hedefGrup,
            icerik: secilenYemler.filter(x => x.yemId && x.miktar > 0),
            toplamMaliyet: analysis.maliyet
        });
    };

    const activeFeed = yemler.find(y => y._id === activeFeedId);
    const targets = NUTRIENT_TARGETS[hedefGrup] || NUTRIENT_TARGETS.sagmal;

    const getStatus = (val, min, max) => {
        if (val < min) return { color: '#ffebee', text: '#c62828', icon: <FaExclamationTriangle />, msg: 'Düşük' };
        if (val > max) return { color: '#fff3e0', text: '#ef6c00', icon: <FaExclamationTriangle />, msg: 'Yüksek' };
        return { color: '#e8f5e9', text: '#2e7d32', icon: <FaCheckCircle />, msg: 'İdeal' };
    };

    const proteinStatus = getStatus(analysis.proteinPct, targets.protein[0], targets.protein[1]);
    const energyStatus = getStatus(analysis.enerjiAvg, targets.enerji[0], targets.enerji[1]);

    // Safety for Pie Chart
    const pieData = secilenYemler
        .filter(x => x.yemId && x.miktar > 0)
        .map(x => ({
            name: yemler.find(y => y._id === x.yemId)?.ad || '?',
            value: x.miktar
        }));

    return (
        <PageGrid>
            <CalculatorContainer>
                <SectionTitle><FaCalculator /> Rasyon Planlama</SectionTitle>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15, marginBottom: 25 }}>
                    <InputGroup>
                        <label>Rasyon Adı</label>
                        <input value={rasyonAdi} onChange={e => setRasyonAdi(e.target.value)} placeholder="Tarih - Grup..." />
                    </InputGroup>
                    <InputGroup>
                        <label>Hedef Grup</label>
                        <select value={hedefGrup} onChange={e => setHedefGrup(e.target.value)}>
                            <option value="sagmal">Sağmal (Süt)</option>
                            <option value="besi">Besi (Et)</option>
                            <option value="buzagi">Buzağı</option>
                            <option value="kuru">Kuru Dönem</option>
                        </select>
                    </InputGroup>
                    <InputGroup>
                        <label>Hayvan Sayısı (Miks)</label>
                        <input type="number" value={hayvanSayisi} onChange={e => setHayvanSayisi(e.target.value)} />
                    </InputGroup>
                </div>

                <div style={{ background: '#f8f9fa', padding: 10, borderRadius: 8, marginBottom: 15, display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr auto', fontWeight: 'bold', color: '#666' }}>
                    <span>Yem Adı</span>
                    <span>1 Baş (Kg)</span>
                    <span>{hayvanSayisi} Baş (Kg)</span>
                    <span></span>
                </div>

                {secilenYemler.map((item, index) => (
                    <FeedRow key={index} active={item.yemId === activeFeedId} onClick={() => setActiveFeedId(item.yemId)}>
                        <select value={item.yemId} onChange={e => handleFeedChange(index, 'yemId', e.target.value)}>
                            <option value="">Yem Seç...</option>
                            {yemler && yemler.map(y => <option key={y._id} value={y._id}>{y.ad}</option>)}
                        </select>

                        <input
                            type="number" step="0.1"
                            value={item.miktar}
                            onChange={e => handleFeedChange(index, 'miktar', parseFloat(e.target.value))}
                            placeholder="Kg/Baş"
                        />

                        <div style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '1.1rem' }}>
                            {(item.miktar * hayvanSayisi).toFixed(0)} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Kg</span>
                        </div>

                        <button onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            const list = [...secilenYemler];
                            list.splice(index, 1);
                            setSecilenYemler(list);
                        }} style={{ border: 'none', background: 'transparent', color: '#ef5350', cursor: 'pointer' }}><FaTrash /></button>
                    </FeedRow>
                ))}

                <button
                    onClick={() => setSecilenYemler([...secilenYemler, { yemId: '', miktar: 0 }])}
                    style={{ background: '#eee', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', color: '#333' }}
                >
                    <FaPlus /> Yem Ekle
                </button>

                <div style={{ marginTop: 40, borderTop: '2px solid #eee', paddingTop: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>Hayvan Başı Maliyet</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2e7d32' }}>{analysis.maliyet.toFixed(2)} TL</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>Toplam Mikser ({hayvanSayisi} Baş)</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#333' }}>{(analysis.maliyet * hayvanSayisi).toFixed(2)} TL</div>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        style={{ width: '100%', marginTop: 20, background: '#2196f3', color: 'white', border: 'none', padding: '15px', borderRadius: 10, fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        <FaSave /> Rasyonu Kaydet
                    </button>
                </div>
            </CalculatorContainer>


            <InfoPanel>
                <SectionTitle><FaInfoCircle /> Analiz & Rehber</SectionTitle>

                {activeFeed ? (
                    <div style={{ background: 'white', padding: 15, borderRadius: 10, marginBottom: 20, borderLeft: '5px solid #2196f3' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{activeFeed.ad}</h4>
                            <Badge color="#e3f2fd" textColor="#1565c0">{activeFeed.birimFiyat} TL/Kg</Badge>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.9rem' }}>
                            <div><strong>Protein:</strong> %{activeFeed.protein}</div>
                            <div><strong>Enerji:</strong> {activeFeed.enerji} Mcal</div>
                            <div><strong>K. Madde:</strong> %{activeFeed.kuruMadde}</div>
                            <div><strong>Nişasta:</strong> %{activeFeed.nisasta || '-'}</div>
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: 20, textAlign: 'center', color: '#999', fontStyle: 'italic', background: 'white', borderRadius: 10, marginBottom: 20 }}>
                        Detaylarını görmek için soldaki listeden bir yeme tıkla.
                    </div>
                )}

                <h4 style={{ color: '#2c3e50', borderBottom: '1px solid #eee', paddingBottom: 5 }}>Rasyon Dengesi</h4>

                <StatCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Protein Dengesi</span>
                        <Badge color={proteinStatus.color} textColor={proteinStatus.text}>{proteinStatus.icon} {proteinStatus.msg}</Badge>
                    </div>
                    <div className="value">%{analysis.proteinPct.toFixed(1)}</div>
                    <div className="sub">Hedef: %{targets.protein[0]} - %{targets.protein[1]}</div>
                    <ProgressBar bg={proteinStatus.text} width={Math.min(100, (analysis.proteinPct / targets.protein[1]) * 100)} />
                </StatCard>

                <StatCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Enerji Yoğunluğu</span>
                        <Badge color={energyStatus.color} textColor={energyStatus.text}>{energyStatus.icon} {energyStatus.msg}</Badge>
                    </div>
                    <div className="value">{analysis.enerjiAvg.toFixed(2)} <span style={{ fontSize: '0.8rem' }}>Mcal/kg</span></div>
                    <div className="sub">Hedef: {targets.enerji[0]} - {targets.enerji[1]}</div>
                    <ProgressBar bg={energyStatus.text} width={Math.min(100, (analysis.enerjiAvg / targets.enerji[1]) * 100)} />
                </StatCard>

                <div style={{ height: 200, marginTop: 20 }}>
                    <h5 style={{ textAlign: 'center', margin: '0 0 10px' }}>Karışım Oranları</h5>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%" cy="50%" innerRadius={40} outerRadius={70} fill="#8884d8" paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'][index % 5]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

            </InfoPanel>
        </PageGrid>
    );
};

export default RasyonHesaplayici;
