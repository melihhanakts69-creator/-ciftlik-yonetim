import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaLeaf, FaClipboardList, FaCheckCircle, FaTrash } from 'react-icons/fa';
import * as api from '../../services/api';
import RasyonHesaplayici from '../../components/Yem/RasyonHesaplayici';

const PageContainer = styled.div`
  padding: 20px;
  background-color: #f4f7f6;
  min-height: 100vh;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  margin-bottom: 20px;

  h2 { font-size: 1.2rem; color: #2c3e50; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
`;

const TabButton = styled.button`
  padding: 10px 20px;
  border: none;
  background: ${props => props.active ? '#2e7d32' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 20px;
  margin-right: 10px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);

  &:hover { background: ${props => props.active ? '#1b5e20' : '#f1f8e9'}; }
`;

const YemMerkezi = () => {
    const [activeTab, setActiveTab] = useState('gunluk'); // gunluk | kutuphane | rasyon
    const [yemler, setYemler] = useState([]);
    const [rasyonlar, setRasyonlar] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [yemRes, rasyonRes] = await Promise.all([
                api.getYemKutuphanesi(),
                api.getRasyonlar()
            ]);
            setYemler(yemRes.data);
            setRasyonlar(rasyonRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRasyon = async (data) => {
        try {
            await api.createRasyon(data);
            alert('Rasyon başarıyla oluşturuldu!');
            setActiveTab('gunluk');
            loadData();
        } catch (error) {
            alert('Hata oluştu');
        }
    };

    const handleYemle = async (rasyonId) => {
        if (!window.confirm('Bu rasyon grubundaki tüm hayvanlar için stoktan düşülecek ve maliyet yazılacak. Onaylıyor musun?')) return;

        try {
            const res = await api.rasyonDagit({ rasyonId });
            alert(`İşlem Başarılı!\n${res.data.hayvanSayisi} hayvan yemlendi.\nToplam Maliyet: ${res.data.toplamMaliyet} TL`);
        } catch (error) {
            alert('Yemleme başarısız: ' + (error.response?.data?.message || 'Hata'));
        }
    };

    const handleDeleteRasyon = async (id) => {
        if (window.confirm('Silmek istediğine emin misin?')) {
            await api.deleteRasyon(id);
            loadData();
        }
    };

    return (
        <PageContainer>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ margin: 0, color: '#2c3e50' }}>🌾 Yem Yönetim Merkezi</h1>
                <div>
                    <TabButton active={activeTab === 'gunluk'} onClick={() => setActiveTab('gunluk')}>Günlük Plan</TabButton>
                    <TabButton active={activeTab === 'rasyon'} onClick={() => setActiveTab('rasyon')}>Rasyon Hazırla</TabButton>
                    <TabButton active={activeTab === 'kutuphane'} onClick={() => setActiveTab('kutuphane')}>Yem Kütüphanesi</TabButton>
                </div>
            </div>

            {activeTab === 'rasyon' && (
                <ContentGrid>
                    <RasyonHesaplayici yemler={yemler} onSave={handleCreateRasyon} />
                    <Card>
                        <h2>💡 İpuçları</h2>
                        <ul style={{ lineHeight: '1.6', color: '#555' }}>
                            <li>Rasyon hazırlarken kuru madde oranına dikkat edin.</li>
                            <li>Protein ve Enerji dengesi süt verimini doğrudan etkiler.</li>
                            <li>Kış aylarında enerji ihtiyacı artar.</li>
                        </ul>
                    </Card>
                </ContentGrid>
            )}

            {activeTab === 'gunluk' && (
                <ContentGrid>
                    {rasyonlar.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', gridColumn: '1 / -1', color: '#888' }}>
                            Henüz rasyon tanımlanmamış. "Rasyon Hazırla" sekmesinden başlayın.
                        </div>
                    ) : (
                        rasyonlar.map(rasyon => (
                            <Card key={rasyon._id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0', color: '#2e7d32' }}>{rasyon.ad}</h3>
                                        <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                            {rasyon.hedefGrup.toUpperCase()} GRUBU
                                        </span>
                                    </div>
                                    <button onClick={() => handleDeleteRasyon(rasyon._id)} style={{ border: 'none', background: 'transparent', color: '#999', cursor: 'pointer' }}><FaTrash /></button>
                                </div>

                                <div style={{ margin: '15px 0', fontSize: '0.9rem', color: '#666' }}>
                                    {rasyon.icerik.map((item, i) => (
                                        <div key={i}>• {item.yemId.ad}: {item.miktar} Kg</div>
                                    ))}
                                </div>

                                <div style={{ borderTop: '1px solid #eee', paddingTop: 10, marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{rasyon.toplamMaliyet.toFixed(2)} TL <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>/ Baş</span></div>
                                    <button
                                        onClick={() => handleYemle(rasyon._id)}
                                        style={{ background: '#2196f3', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                                    >
                                        <FaCheckCircle /> Yemle
                                    </button>
                                </div>
                            </Card>
                        ))
                    )}
                </ContentGrid>
            )}

            {activeTab === 'kutuphane' && (
                <Card>
                    <h2>Mevcut Yemler</h2>
                    {yemler.map(yem => (
                        <div key={yem._id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{yem.ad}</span>
                            <span style={{ fontWeight: 'bold' }}>{yem.birimFiyat} TL/Kg</span>
                        </div>
                    ))}
                    <div style={{ marginTop: 20, textAlign: 'center', color: '#888' }}>
                        * Yem ekleme özelliği yakında eklenecek. Şimdilik veritabanından ekleyin veya `YemStok` ile entegre.
                    </div>
                </Card>
            )}

        </PageContainer>
    );
};

export default YemMerkezi;
