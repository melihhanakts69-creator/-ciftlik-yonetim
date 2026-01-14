import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import * as api from '../services/api';

const PageContainer = styled.div`
  padding: 20px;
  background-color: #f4f7f6;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Header = styled.div`
  margin-bottom: 20px;
  h1 {
    font-size: 28px;
    font-weight: 800;
    color: #2c3e50;
    margin: 0;
    @media (max-width: 768px) { font-size: 24px; }
  }
  p {
    color: #7f8c8d;
    margin-top: 5px;
    @media (max-width: 768px) { font-size: 14px; }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr; /* Mobilde yan yana 2'li */
    gap: 10px;
    margin-bottom: 20px;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  @media (max-width: 768px) {
    padding: 15px; /* Mobilde daha az padding */
    border-radius: 12px;
  }
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: ${props => props.color || '#2c3e50'};
  margin: 10px 0;

  @media (max-width: 768px) {
    font-size: 24px; /* Mobilde daha küçük font */
    margin: 5px 0;
  }
`;

const StatLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #95a5a6;
  text-transform: uppercase;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 11px; /* Mobilde daha küçük label */
  }
`;

const ChartContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  height: 400px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    height: 300px; /* Mobilde daha kısa grafik */
    padding: 15px;
    border-radius: 12px;
  }
`;

const ChartTitle = styled.h3`
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 10px;
  }
`;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Raporlar = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        inek: 0,
        duve: 0,
        tosun: 0,
        buzagi: 0,
        toplamHayvan: 0
    });
    const [sutVerileri, setSutVerileri] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [inekRes, duveRes, tosunRes, buzagiRes, sutRes] = await Promise.all([
                api.getInekler(),
                api.getDuveler(),
                api.getTosunlar(),
                api.getBuzagilar(),
                api.topluSutGecmis(30) // Son 30 gün
            ]);

            const inekCount = inekRes.data.length;
            const duveCount = duveRes.data.length;
            const tosunCount = tosunRes.data.length;
            const buzagiCount = buzagiRes.data.length;

            setStats({
                inek: inekCount,
                duve: duveCount,
                tosun: tosunCount,
                buzagi: buzagiCount,
                toplamHayvan: inekCount + duveCount + tosunCount + buzagiCount
            });

            // Süt verilerini formatla (Tarihe göre ters çevirip grafik formatına sokuyoruz)
            const formattedSut = sutRes.data.reverse().map(item => ({
                tarih: new Date(item.tarih).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
                miktar: item.toplamSut,
                fullDate: item.tarih // Sıralama için
            }));

            setSutVerileri(formattedSut);

        } catch (error) {
            console.error('Veri yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const animalData = [
        { name: 'İnek', value: stats.inek },
        { name: 'Düve', value: stats.duve },
        { name: 'Tosun', value: stats.tosun },
        { name: 'Buzağı', value: stats.buzagi },
    ];

    // Süt Ortalaması
    const avgSut = sutVerileri.length > 0
        ? (sutVerileri.reduce((acc, curr) => acc + curr.miktar, 0) / sutVerileri.length).toFixed(1)
        : 0;

    if (loading) return <div style={{ padding: 20 }}>Yükleniyor...</div>;

    return (
        <PageContainer>
            <Header>
                <h1>📊 Çiftlik Raporları</h1>
                <p>Çiftlik durumunun genel özeti ve performans grafikleri</p>
            </Header>

            {/* Özet Kartlar */}
            <Grid>
                <Card>
                    <div style={{ fontSize: '32px' }}>🐄</div>
                    <StatValue color="#2196F3">{stats.toplamHayvan}</StatValue>
                    <StatLabel>Toplam Hayvan</StatLabel>
                </Card>
                <Card>
                    <div style={{ fontSize: '32px' }}>🥛</div>
                    <StatValue color="#4CAF50">{avgSut} Lt</StatValue>
                    <StatLabel>Günlük Ort. Süt (Son 30 Gün)</StatLabel>
                </Card>
                <Card>
                    <div style={{ fontSize: '32px' }}>🍼</div>
                    <StatValue color="#FF9800">{stats.buzagi}</StatValue>
                    <StatLabel>Buzağı Sayısı</StatLabel>
                </Card>
            </Grid>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                {/* Süt Grafiği */}
                <ChartContainer>
                    <ChartTitle>🥛 Son 30 Günlük Süt Üretimi</ChartTitle>
                    <ResponsiveContainer width="100%" height="90%">
                        <AreaChart data={sutVerileri}>
                            <defs>
                                <linearGradient id="colorSut" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="tarih" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <RechartsTooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Area type="monotone" dataKey="miktar" stroke="#4CAF50" fillOpacity={1} fill="url(#colorSut)" name="Günlük Süt (Lt)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>

                {/* Hayvan Dağılımı */}
                <ChartContainer>
                    <ChartTitle>🐄 Hayvan Dağılımı</ChartTitle>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie
                                data={animalData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {animalData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

        </PageContainer>
    );
};

export default Raporlar;
