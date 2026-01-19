import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../../styles/colors';
import StatsCard from '../common/StatsCard';
import PerformansChart from './PerformansChart';
import YapilacaklarCard from './YapilacaklarCard';
import AktivitelerCard from './AktivitelerCard';
import HizliYemlemeWidget from './HizliYemlemeWidget';

const DashboardContainer = styled.div`
  padding: ${spacing.lg};
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${spacing.xl};
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${colors.text.primary};
  margin: 0 0 ${spacing.sm} 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${colors.text.secondary};
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${spacing.lg};
  margin-bottom: ${spacing.xl};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${spacing.lg};
  margin-bottom: ${spacing.xl};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${colors.text.secondary};
  font-size: 16px;
`;

const ErrorContainer = styled.div`
  background: ${colors.bg.red};
  border: 1px solid ${colors.danger};
  border-radius: 8px;
  padding: ${spacing.lg};
  color: ${colors.danger};
  text-align: center;
`;

const Dashboard = () => {
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

      // Verileri yenile
      fetchDashboardData();
    } catch (err) {
      console.error('Görev tamamlama hatası:', err);
    }
  };

  const getBugunTarih = () => {
    const bugun = new Date();
    return bugun.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingContainer>
          Yükleniyor...
        </LoadingContainer>
      </DashboardContainer>
    );
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
              marginTop: spacing.md,
              padding: '8px 16px',
              background: colors.danger,
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
        <Title>Dashboard</Title>
        <Subtitle>{getBugunTarih()}</Subtitle>
      </Header>

      {/* İstatistik Kartları */}
      <StatsGrid>
        <StatsCard
          title="Toplam Hayvan"
          value={stats?.toplamHayvan?.toplam || 0}
          icon="🐄"
          color={colors.primary}
          bgColor={colors.bg.green}
          description={`${stats?.toplamHayvan?.inek || 0} İnek, ${stats?.toplamHayvan?.duve || 0} Düve`}
        />
        <StatsCard
          title="Gebe Hayvanlar"
          value={stats?.gebe?.toplam || 0}
          icon="🤰"
          color={colors.success}
          bgColor={colors.bg.lightGreen}
          description={`${stats?.yaklaşanDogum || 0} yaklaşan doğum`}
        />
        <StatsCard
          title="Bugünün Süt Üretimi"
          value={stats?.bugunSut?.toFixed(1) || '0.0'}
          unit="lt"
          icon="🥛"
          color={colors.info}
          bgColor={colors.bg.blue}
          description={`${stats?.sagmal || 0} sağmal inek`}
        />
        <StatsCard
          title="Bildirimler"
          value={stats?.okunmayanBildirim || 0}
          icon="🔔"
          color={colors.warning}
          bgColor={colors.bg.orange}
          description="Okunmamış bildirim"
          clickable
          onClick={() => console.log('Bildirimlere git')}
        />
      </StatsGrid>

      {/* Performans Grafiği */}
      {performans && performans.length > 0 && (
        <div style={{ marginBottom: spacing.xl }}>
          <PerformansChart
            data={performans}
            title="Son 30 Günlük Süt Performansı"
            type="area"
            color={colors.primary}
          />
        </div>
      )}

      {/* Hızlı Yemleme Widget */}
      <HizliYemlemeWidget />



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

export default Dashboard;
