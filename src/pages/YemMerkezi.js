import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    FaLeaf, FaClipboardList, FaCheckCircle, FaTrash, FaCalculator,
    FaBoxOpen, FaExclamationTriangle, FaChartPie, FaSearch, FaUserMd
} from 'react-icons/fa';
import * as api from '../services/api';
import RasyonHesaplayici from '../components/Yem/RasyonHesaplayici';
import YemEkleModal from '../components/Yem/YemEkleModal';
import YemDeposu from '../components/YemDeposu';
import YemDanismani from '../components/Yem/YemDanismani';
import { showSuccess, showError } from '../utils/toast';

// --- STYLED COMPONENTS ---

const PageContainer = styled.div`
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
`;

const TitleSection = styled.div`
  h1 {
    font-size: 28px;
    font-weight: 800;
    color: #1a1a1a;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  p {
    color: #666;
    margin: 0;
    font-size: 15px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.06);
  }

  .icon-box {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }

  .content {
    display: flex;
    flex-direction: column;
    
    .label { font-size: 13px; color: #666; font-weight: 600; }
    .value { font-size: 20px; color: #1a1a1a; font-weight: 800; }
  }
`;

const TabContainer = styled.div`
  background: white;
  padding: 6px;
  border-radius: 16px;
  display: inline-flex;
  gap: 5px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  margin-bottom: 30px;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
`;

const TabButton = styled.button`
  padding: 10px 24px;
  border: none;
  background: ${props => props.active ? '#2e7d32' : 'transparent'};
  color: ${props => props.active ? 'white' : '#555'};
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;

  &:hover {
    background: ${props => props.active ? '#2e7d32' : '#f1f3f4'};
    color: ${props => props.active ? 'white' : '#1a1a1a'};
  }
`;


const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.04);
  margin-bottom: 24px;

  h2 {
    font-size: 20px;
    color: #1a1a1a;
    margin: 0 0 20px 0;
    font-weight: 700;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const RationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

const RationCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(0,0,0,0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 6px;
    background: linear-gradient(90deg, #2e7d32, #81c784);
    opacity: 0.8;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.08);
    border-color: transparent;
    
    .actions {
        opacity: 1;
        transform: translateY(0);
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;

    h3 { 
        margin: 0; 
        font-size: 19px; 
        color: #1a1a1a; 
        font-weight: 700;
        letter-spacing: -0.5px;
    }
  }

  .badge {
    background: #e8f5e9; color: #2e7d32;
    padding: 6px 14px; border-radius: 30px;
    font-size: 11px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.5px;
    border: 1px solid #c8e6c9;
  }

  .cost {
    font-size: 28px;
    font-weight: 800;
    color: #1a1a1a;
    margin: 10px 0 20px 0;
    display: flex;
    align-items: baseline;
    gap: 5px;
    
    span { font-size: 14px; color: #888; font-weight: 500; }
  }

  .ingredients {
    flex: 1;
    margin-bottom: 20px;
    padding: 15px;
    background: #fafafa;
    border-radius: 16px;
    font-size: 13px;
    color: #555;
    border: 1px solid #f5f5f5;
    
    div { 
        margin-bottom: 8px; 
        display: flex; 
        justify-content: space-between;
        align-items: center;
        &:last-child { margin-bottom: 0; }
        
        span { display: flex; align-items: center; gap: 6px; }
    }
  }

  .actions {
    display: flex;
    gap: 12px;
    margin-top: auto;
    background: white;
  }
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  font-size: 14px;
  
  ${props => props.variant === 'primary' && `
    background: linear-gradient(135deg, #2e7d32 0%, #43a047 100%); 
    color: white;
    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
    
    &:hover { 
        filter: brightness(1.1);
        transform: scale(1.02);
        box-shadow: 0 6px 16px rgba(46, 125, 50, 0.3);
    }
  `}

  ${props => props.variant === 'danger' && `
    background: #ffebee; color: #d32f2f;
    border: 1px solid #ffcdd2;
    &:hover { background: #ffcdd2; transform: scale(1.02); }
  `}
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 15px;
    color: #666;
    font-weight: 600;
    border-bottom: 2px solid #f0f0f0;
    font-size: 13px;
    text-transform: uppercase;
  }
  
  td {
    padding: 15px;
    border-bottom: 1px solid #f8f9fa;
    color: #1a1a1a;
    font-weight: 500;
  }

  tr:hover td { background: #fafafa; }
`;

// --- COMPONENT ---

const YemMerkezi = () => {
    const [activeTab, setActiveTab] = useState('stok'); // stok | rasyon | hesapla | kutuphane
    const [yemler, setYemler] = useState([]);
    const [rasyonlar, setRasyonlar] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, [activeTab]); // Tab değişince veriyi tazele

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
            showSuccess('Rasyon başarıyla oluşturuldu! 🎉');
            setActiveTab('rasyon');
            loadData();
        } catch (error) {
            showError('Hata oluştu');
        }
    };

    const handleYemle = async (rasyonId) => {
        if (!window.confirm('Bu rasyon grubundaki tüm hayvanlar için stoktan düşülecek ve maliyet yazılacak. Onaylıyor musun?')) return;

        try {
            const res = await api.rasyonDagit({ rasyonId });
            showSuccess(`İşlem Başarılı! ${res.data.hayvanSayisi} hayvan yemlendi. Toplam Maliyet: ${res.data.toplamMaliyet.toFixed(2)} TL`);
        } catch (error) {
            showError('Yemleme başarısız: ' + (error.response?.data?.message || 'Hata'));
        }
    };

    const handleDeleteRasyon = async (id) => {
        if (window.confirm('Bu rasyonu silmek istediğine emin misin?')) {
            await api.deleteRasyon(id);
            loadData();
        }
    };

    // --- RENDER HELPERS ---
    const filteredYemler = yemler.filter(y => y.ad.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <PageContainer>
            <Header>
                <TitleSection>
                    <h1><FaLeaf color="#2e7d32" /> Yem Yönetim Merkezi</h1>
                    <p>Yem stoklarını yönet, rasyon hazırla ve günlük yemleme yap.</p>
                </TitleSection>
            </Header>

            <StatsGrid>
                <StatCard>
                    <div className="icon-box" style={{ background: '#e3f2fd', color: '#1565c0' }}>
                        <FaClipboardList />
                    </div>
                    <div className="content">
                        <span className="label">Aktif Rasyonlar</span>
                        <span className="value">{rasyonlar.length}</span>
                    </div>
                </StatCard>
                <StatCard>
                    <div className="icon-box" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                        <FaBoxOpen />
                    </div>
                    <div className="content">
                        <span className="label">Tanımlı Yemler</span>
                        <span className="value">{yemler.length}</span>
                    </div>
                </StatCard>
                <StatCard>
                    <div className="icon-box" style={{ background: '#fff3e0', color: '#ef6c00' }}>
                        <FaExclamationTriangle />
                    </div>
                    <div className="content">
                        <span className="label">Kritik Stok</span>
                        <span className="value">--</span>
                    </div>
                </StatCard>
            </StatsGrid>

            <TabContainer>
                <TabButton active={activeTab === 'stok'} onClick={() => setActiveTab('stok')}>
                    <FaBoxOpen /> Stok & Depo
                </TabButton>
                <TabButton active={activeTab === 'rasyon'} onClick={() => setActiveTab('rasyon')}>
                    <FaChartPie /> Rasyonlarım
                </TabButton>
                <TabButton active={activeTab === 'hesapla'} onClick={() => setActiveTab('hesapla')}>
                    <FaCalculator /> Hesaplayıcı
                </TabButton>
                <TabButton active={activeTab === 'danisman'} onClick={() => setActiveTab('danisman')}>
                    <FaUserMd /> Yem Danışmanı
                    <span style={{ background: '#e3f2fd', color: '#1565c0', fontSize: 10, padding: '2px 6px', borderRadius: 10, marginLeft: -2 }}>YENİ</span>
                </TabButton>
                <TabButton active={activeTab === 'kutuphane'} onClick={() => setActiveTab('kutuphane')}>
                    <FaLeaf /> Yem Kütüphanesi
                </TabButton>
            </TabContainer>

            {/* --- TAB CONTENT --- */}

            {activeTab === 'danisman' && (
                <YemDanismani />
            )}

            {activeTab === 'stok' && (
                // YemDeposu bileşenini direkt kullanıyoruz, bu bileşen kendi içinde API çağrılarını yapıyor
                <YemDeposu isEmbedded={true} />
            )}

            {activeTab === 'rasyon' && (
                <RationGrid>
                    {rasyonlar.length === 0 && (
                        <div style={{ padding: 40, textAlign: 'center', gridColumn: '1 / -1', color: '#888' }}>
                            Henüz rasyon tanımlamadınız. "Hesaplayıcı" sekmesinden yeni bir rasyon oluşturun.
                        </div>
                    )}
                    {rasyonlar.map(rasyon => (
                        <RationCard key={rasyon._id} color="#2e7d32">
                            <div className="header">
                                <div>
                                    <h3 style={{ marginBottom: 6 }}>{rasyon.ad}</h3>
                                    <div className="badge">{rasyon.hedefGrup.toUpperCase()}</div>
                                </div>
                            </div>

                            <div className="cost">
                                {rasyon.toplamMaliyet.toFixed(2)} TL
                                <span> / Baş</span>
                            </div>

                            <div className="ingredients">
                                {rasyon.icerik.map((item, i) => (
                                    <div key={i}>
                                        <span><FaLeaf size={10} color="#81c784" /> {item.yemId?.ad || 'Silinmiş Yem'}</span>
                                        <strong>{item.miktar} Kg</strong>
                                    </div>
                                ))}
                            </div>

                            <div className="actions">
                                <ActionButton variant="primary" onClick={() => handleYemle(rasyon._id)}>
                                    <FaCheckCircle /> Yemle
                                </ActionButton>
                                <ActionButton variant="danger" style={{ flex: '0 0 50px' }} onClick={() => handleDeleteRasyon(rasyon._id)}>
                                    <FaTrash />
                                </ActionButton>
                            </div>
                        </RationCard>
                    ))}
                </RationGrid>
            )}

            {activeTab === 'hesapla' && (
                <RasyonHesaplayici yemler={yemler} onSave={handleCreateRasyon} />
            )}

            {activeTab === 'kutuphane' && (
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <FaSearch style={{ position: 'absolute', left: 15, top: 12, color: '#999' }} />
                            <input
                                placeholder="Yem ara..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{
                                    padding: '10px 10px 10px 40px', width: '100%',
                                    borderRadius: '20px', border: '1px solid #eee', outline: 'none'
                                }}
                            />
                        </div>
                        <div>
                            <button
                                onClick={async () => {
                                    if (window.confirm('Depodaki yemler kütüphaneye aktarılacak ve besin değerleri otomatik doldurulacak. Onaylıyor musun?')) {
                                        setLoading(true);
                                        try {
                                            const res = await api.syncStokToLibrary();
                                            showSuccess(`İşlem Tamam! ${res.data.added} yem eklendi, ${res.data.matched} tanesi otomatik tanımlandı.`);
                                            loadData();
                                        } catch (e) { showError('Hata oluştu'); } finally { setLoading(false); }
                                    }
                                }}
                                style={{ background: '#0288d1', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', marginRight: 10 }}
                            >
                                <FaClipboardList /> Akıllı Eşitle
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                <FaLeaf /> Yeni Yem
                            </button>
                        </div>
                    </div>

                    <Table>
                        <thead>
                            <tr>
                                <th>Yem Adı</th>
                                <th>KM (%)</th>
                                <th>Protein (%)</th>
                                <th>Enerji (Mcal)</th>
                                <th>Birim Fiyat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredYemler.map(yem => (
                                <tr key={yem._id}>
                                    <td style={{ fontWeight: 'bold' }}>{yem.ad}</td>
                                    <td>{yem.kuruMadde}</td>
                                    <td>{yem.protein}</td>
                                    <td>{yem.enerji}</td>
                                    <td>
                                        <span style={{ background: '#e0f2f1', color: '#00695c', padding: '4px 8px', borderRadius: 4, fontSize: '13px' }}>
                                            {yem.birimFiyat} TL/Kg
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            )}

            {showAddModal && (
                <YemEkleModal
                    onClose={() => setShowAddModal(false)}
                    onSave={() => {
                        loadData();
                        setShowAddModal(false);
                    }}
                />
            )}
        </PageContainer>
    );
};

export default YemMerkezi;
