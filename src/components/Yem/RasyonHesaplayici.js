import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import * as api from '../../services/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const CalculatorContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
`;

const SectionTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
  }
  input, select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }
`;

const FeedRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 15px;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 10px;
`;

const TotalBar = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  background: #2e7d32;
  color: white;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;

  div {
    display: flex;
    flex-direction: column;
    span.val { font-size: 1.2rem; font-weight: bold; }
    span.lbl { font-size: 0.8rem; opacity: 0.8; }
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: ${props => props.danger ? '#ef5350' : '#4caf50'};
  color: white;
  cursor: pointer;
  font-weight: bold;
`;

const RasyonHesaplayici = ({ yemler, onSave }) => {
    const [rasyonAdi, setRasyonAdi] = useState('');
    const [hedefGrup, setHedefGrup] = useState('sagmal');
    const [secilenYemler, setSecilenYemler] = useState([]); // [{ yemId, miktar }]

    // Totals
    const [totals, setTotals] = useState({ maliyet: 0, km: 0, protein: 0 });

    useEffect(() => {
        let m = 0, k = 0, p = 0;
        secilenYemler.forEach(item => {
            const yem = yemler.find(y => y._id === item.yemId);
            if (yem) {
                m += item.miktar * yem.birimFiyat;
                k += (item.miktar * yem.kuruMadde) / 100; // KG cinsinden KM
                p += (item.miktar * yem.protein) / 1000; // Varsayım: protein % değil gr/kg ise
                // Not: Sadelik için protein yüzdesini doğrudan topluyoruz gibi
            }
        });
        setTotals({ maliyet: m, km: k, protein: p });
    }, [secilenYemler, yemler]);

    const handleAddFeed = () => {
        setSecilenYemler([...secilenYemler, { yemId: '', miktar: 0 }]);
    };

    const handleFeedChange = (index, field, value) => {
        const list = [...secilenYemler];
        list[index][field] = value;
        setSecilenYemler(list);
    };

    const handleRemoveFeed = (index) => {
        const list = [...secilenYemler];
        list.splice(index, 1);
        setSecilenYemler(list);
    };

    const handleSave = () => {
        if (!rasyonAdi || secilenYemler.length === 0) return alert('İsim ve içerik giriniz');
        onSave({
            ad: rasyonAdi,
            hedefGrup,
            icerik: secilenYemler.filter(x => x.yemId && x.miktar > 0)
        });
    };

    return (
        <CalculatorContainer>
            <SectionTitle><FaPlus /> Yeni Rasyon Oluştur</SectionTitle>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                <InputGroup>
                    <label>Rasyon Adı (Örn: Kışlık Karışım)</label>
                    <input value={rasyonAdi} onChange={e => setRasyonAdi(e.target.value)} placeholder="Rasyon adı..." />
                </InputGroup>
                <InputGroup>
                    <label>Hedef Grup</label>
                    <select value={hedefGrup} onChange={e => setHedefGrup(e.target.value)}>
                        <option value="sagmal">Sağmal İnekler</option>
                        <option value="kuru">Kuru Dönem</option>
                        <option value="genc_duve">Genç Düveler</option>
                        <option value="buzagi">Buzağılar</option>
                    </select>
                </InputGroup>
            </div>

            <h4 style={{ margin: '20px 0 10px' }}>Rasyon İçeriği (Hayvan Başı)</h4>
            {secilenYemler.map((item, index) => (
                <FeedRow key={index}>
                    <select
                        value={item.yemId}
                        onChange={e => handleFeedChange(index, 'yemId', e.target.value)}
                    >
                        <option value="">Yem Seç...</option>
                        {yemler.map(y => <option key={y._id} value={y._id}>{y.ad} ({y.birimFiyat} TL/kg)</option>)}
                    </select>

                    <input
                        type="number"
                        value={item.miktar}
                        onChange={e => handleFeedChange(index, 'miktar', parseFloat(e.target.value))}
                        placeholder="Kg"
                    />

                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {item.yemId && yemler.find(y => y._id === item.yemId) ?
                            `${(item.miktar * yemler.find(y => y._id === item.yemId).birimFiyat).toFixed(2)} TL`
                            : '0 TL'}
                    </div>

                    <button onClick={() => handleRemoveFeed(index)} style={{ border: 'none', background: 'transparent', color: 'red', cursor: 'pointer' }}>
                        <FaTrash />
                    </button>
                </FeedRow>
            ))}

            <Button onClick={handleAddFeed} style={{ marginTop: 10, background: '#eee', color: '#333' }}>+ Yem Ekle</Button>

            <TotalBar>
                <div>
                    <span className="val">{totals.maliyet.toFixed(2)} TL</span>
                    <span className="lbl">Günlük Maliyet (Baş)</span>
                </div>
                <div>
                    <span className="val">{totals.km.toFixed(1)} Kg</span>
                    <span className="lbl">Kuru Madde</span>
                </div>
                <div>
                    <span className="val">ANALİZ</span>
                    <span className="lbl">Yakında...</span>
                </div>
            </TotalBar>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 30 }}>
                {/* Dağılım Grafiği */}
                <div style={{ height: 250, background: '#f8f9fa', borderRadius: 12, padding: 10 }}>
                    <h4 style={{ textAlign: 'center', margin: '5px 0' }}>Yem Dağılımı (Kg)</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={secilenYemler.filter(x => x.yemId).map(x => ({
                                    name: yemler.find(y => y._id === x.yemId)?.ad || '?',
                                    value: x.miktar
                                }))}
                                cx="50%" cy="50%" outerRadius={80} fill="#8884d8"
                                dataKey="value" label
                            >
                                {secilenYemler.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'][index % 5]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Besin Değerleri Grafiği */}
                <div style={{ height: 250, background: '#f8f9fa', borderRadius: 12, padding: 10 }}>
                    <h4 style={{ textAlign: 'center', margin: '5px 0' }}>Besin Değerleri (Analiz)</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={[
                                { name: 'KM (kg)', value: totals.km },
                                { name: 'Prot (kg)', value: totals.protein },
                                { name: 'Enerji (Mcal)', value: totals.enerji || 0 }
                            ]}
                            layout="vertical"
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ marginTop: 20, textAlign: 'right' }}>
                <Button onClick={handleSave}><FaSave /> Rasyonu Kaydet</Button>
            </div>
        </CalculatorContainer>
    );
};

export default RasyonHesaplayici;
