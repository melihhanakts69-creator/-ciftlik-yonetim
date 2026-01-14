import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/common/StatsCard';
import PerformansChart from '../components/Dashboard/PerformansChart';
import AktivitelerCard from '../components/Dashboard/AktivitelerCard';
import FinansOzetCard from '../components/Dashboard/FinansOzetCard'; // Yeni
import StokUyariCard from '../components/Dashboard/StokUyariCard'; // Yeni
import * as api from '../services/api'; // API servisi

// Styled Components
const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 40px;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 10px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Biraz genişlettik */
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    
    /* Finans kartını tam genişlik yap */
    .full-width-mobile {
      grid-column: 1 / -1;
    }
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 30px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #666;
  font-size: 16px;
`;

const ErrorContainer = styled.div`
  background: #FFEBEE;
  border: 1px solid #f44336;
  border-radius: 8px;
  padding: 24px;
  color: #c62828;
  text-align: center;
`;

const Home = ({ kullanici }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        stats: null,
        performans: [],
        aktiviteler: [],
        finans: null, // Yeni
        stoklar: []   // Yeni
    });

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Oturum bulunamadı');
            }

            // fetch için header
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Paralel istekler (API servis fonksiyonlarını da kullanabiliriz ama mevcut yapı fetch üzerine kurulu, uyumlu gidelim dedik ama finans/stok için api.js kullanalım)
            const [statsRes, performansRes, aktivitelerRes, finansRes, stokRes] = await Promise.all([
                fetch(`${API_URL}/dashboard/stats`, { headers }),
                fetch(`${API_URL}/dashboard/performans/sut?gun=30`, { headers }),
                fetch(`${API_URL}/dashboard/aktiviteler?limit=10`, { headers }),
                api.getFinansalOzet({}), // Bu ayın özeti
                api.getYemStok()
            ]);

            const [stats, performans, aktiviteler] = await Promise.all([
                statsRes.json(),
                performansRes.json(),
                aktivitelerRes.json()
            ]);

            setDashboardData({
                stats,
                performans,
                aktiviteler,
                finans: finansRes.data,
                stoklar: stokRes.data
            });

            setError(null);
        } catch (err) {
            console.error('Dashboard yükleme hatası:', err);
            setError(err.message || 'Veri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const getBugunTarih = () => {
        return new Date().toLocaleDateString('tr-TR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) return <LoadingContainer>Mutlu Çiftlik Yükleniyor... 🚜</LoadingContainer>;

    if (error) {
        return (
            <DashboardContainer>
                <ErrorContainer>
                    ❌ Hata: {error}
                    <button onClick={fetchDashboardData} style={{ display: 'block', margin: '15px auto', padding: '10px' }}>Tekrar Dene</button>
                </ErrorContainer>
            </DashboardContainer>
        );
    }

    const { stats, performans, aktiviteler, finans, stoklar } = dashboardData;

    return (
        <DashboardContainer>
            <Header>
                <Title>Merhaba, {kullanici?.isim || 'Çiftçi'}! 👋</Title>
                <Subtitle>{getBugunTarih()}</Subtitle>
            </Header>

            {/* Stok Uyarısı */}
            {stoklar && <StokUyariCard stoklar={stoklar} onNavigate={() => navigate('/yem-deposu')} />}

            {/* İstatistik Grid */}
            <StatsGrid>
                {/* Finans Kartı - En başa veya sona */}
                {finans && (
                    <div className="full-width-mobile" style={{ cursor: 'pointer' }} onClick={() => navigate('/finansal')}>
                        <FinansOzetCard data={finans} />
                    </div>
                )}

                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/inekler')}>
                    <StatsCard
                        title="Toplam Hayvan"
                        value={stats?.toplamHayvan?.toplam || 0}
                        icon="🐄"
                        color="#4CAF50"
                        bgColor="#E8F5E9"
                        description={`${stats?.toplamHayvan?.inek || 0} İnek, ${stats?.toplamHayvan?.buzagi || 0} Buzağı`}
                    />
                </div>

                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/sut-kaydi')}>
                    <StatsCard
                        title="Günlük Süt"
                        value={stats?.bugunSut?.toFixed(1) || '0.0'}
                        unit="lt"
                        icon="🥛"
                        color="#2196F3"
                        bgColor="#E3F2FD"
                        description={`${stats?.sagmal || 0} sağmal inek`}
                    />
                </div>

                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/duveler')}>
                    <StatsCard
                        title="Yaklaşan Doğum"
                        value={stats?.yaklasanDogum || 0}
                        icon="🤰"
                        color="#9C27B0"
                        bgColor="#F3E5F5"
                        description="Takip edilen"
                    />
                </div>
            </StatsGrid>

            {/* Performans Grafiği */}
            {performans && performans.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                    <PerformansChart
                        data={performans}
                        title="Son 30 Günlük Süt Performansı"
                        type="area"
                        color="#4CAF50"
                    />
                </div>
            )}

            {/* Aktiviteler */}
            <ContentGrid>
                <AktivitelerCard aktiviteler={aktiviteler.slice(0, 5)} />
                <div style={{ textAlign: 'center', marginTop: '-15px' }}>
                    <button
                        onClick={() => navigate('/aktiviteler')}
                        style={{ background: 'none', border: 'none', color: '#4CAF50', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Tümünü Gör →
                    </button>
                </div>
            </ContentGrid>
        </DashboardContainer>
    );
};

export default Home;
