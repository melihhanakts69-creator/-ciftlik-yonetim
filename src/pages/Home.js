import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/common/StatsCard';
import PerformansChart from '../components/Dashboard/PerformansChart';
import YapilacaklarCard from '../components/Dashboard/YapilacaklarCard';
import AktivitelerCard from '../components/Dashboard/AktivitelerCard';

// Styled Components (Dashboard.js'den uyarlandı)
const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 30px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
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
        yapilacaklar: [],
        aktiviteler: []
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

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Paralel istekler
            const [statsRes, performansRes, yapilacaklarRes, aktivitelerRes] = await Promise.all([
                fetch(`${API_URL}/dashboard/stats`, { headers }),
                fetch(`${API_URL}/dashboard/performans/sut?gun=30`, { headers }),
                fetch(`${API_URL}/dashboard/yapilacaklar`, { headers }),
                fetch(`${API_URL}/dashboard/aktiviteler?limit=10`, { headers })
            ]);

            if (!statsRes.ok || !performansRes.ok || !yapilacaklarRes.ok || !aktivitelerRes.ok) {
                throw new Error('Veri yüklenirken hata oluştu');
            }

            const [stats, performans, yapilacaklarData, aktiviteler] = await Promise.all([
                statsRes.json(),
                performansRes.json(),
                yapilacaklarRes.json(),
                aktivitelerRes.json()
            ]);

            setDashboardData({
                stats,
                performans,
                yapilacaklar: [...(yapilacaklarData.geciken || []), ...(yapilacaklarData.bugun || [])],
                aktiviteler
            });

            setError(null);
        } catch (err) {
            console.error('Dashboard yükleme hatası:', err);
            // Hata olsa bile kullanıcıya bir şeyler göstermek isteyebiliriz, şimdilik error state
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskComplete = async (bildirimId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/bildirimler/${bildirimId}/tamamlandi`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            fetchDashboardData(); // Verileri yenile
        } catch (err) {
            console.error('Görev tamamlama hatası:', err);
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

    if (loading) {
        return <LoadingContainer>Veriler yükleniyor...</LoadingContainer>;
    }

    if (error) {
        return (
            <DashboardContainer>
                <ErrorContainer>
                    ❌ Hata: {error}
                    <br />
                    <button
                        onClick={fetchDashboardData}
                        style={{
                            marginTop: '16px',
                            padding: '8px 16px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Tekrar Dene
                    </button>
                </ErrorContainer>
            </DashboardContainer>
        );
    }

    const { stats, performans, yapilacaklar, aktiviteler } = dashboardData;

    return (
        <DashboardContainer>
            <Header>
                <Title>Merhaba, {kullanici?.isim || 'Çiftçi'}! 👋</Title>
                <Subtitle>{getBugunTarih()}</Subtitle>
            </Header>

            {/* İstatistik Kartları */}
            <StatsGrid>
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/inekler')}>
                    <StatsCard
                        title="Toplam Hayvan"
                        value={stats?.toplamHayvan?.toplam || 0}
                        icon="🐄"
                        color="#4CAF50"
                        bgColor="#E8F5E9"
                        description={`${stats?.toplamHayvan?.inek || 0} İnek, ${stats?.toplamHayvan?.duve || 0} Düve, ${stats?.toplamHayvan?.buzagi || 0} Buzağı, ${stats?.toplamHayvan?.tosun || 0} Tosun`}
                    />
                </div>

                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/duveler')}>
                    <StatsCard
                        title="Gebe Hayvanlar"
                        value={stats?.gebe?.toplam || 0}
                        icon="🤰"
                        color="#2E7D32"
                        bgColor="#C8E6C9"
                        description={`${stats?.yaklaşanDogum || 0} yaklaşan doğum`}
                    />
                </div>

                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/sut-kaydi')}>
                    <StatsCard
                        title="Bugünün Süt Üretimi"
                        value={stats?.bugunSut?.toFixed(1) || '0.0'}
                        unit="lt"
                        icon="🥛"
                        color="#2196F3"
                        bgColor="#E3F2FD"
                        description={`${stats?.sagmal || 0} sağmal inek`}
                    />
                </div>

                <div style={{ cursor: 'pointer' }} onClick={() => console.log('Bildirimlere git')}>
                    <StatsCard
                        title="Bildirimler"
                        value={stats?.okunmayanBildirim || 0}
                        icon="🔔"
                        color="#FF9800"
                        bgColor="#FFF3E0"
                        description="Okunmamış bildirim"
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

            {/* Yapılacaklar ve Aktiviteler */}
            <ContentGrid>
                <YapilacaklarCard
                    bildirimler={yapilacaklar}
                    onTaskComplete={handleTaskComplete}
                    onTaskClick={(bildirim) => console.log('Bildirim detay:', bildirim)}
                    onViewAll={() => console.log('Tüm bildirimlere git')}
                />
                <AktivitelerCard aktiviteler={aktiviteler} />
            </ContentGrid>
        </DashboardContainer>
    );
};

export default Home;
