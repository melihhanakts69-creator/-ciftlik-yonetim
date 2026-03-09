import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import * as api from '../services/api';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;

const Page = styled.div`animation: ${fadeIn} 0.4s ease; font-family: 'Inter', sans-serif; color: #2c3e50;`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px; padding: 28px 32px; margin-bottom: 28px; color: white;
  display: flex; justify-content: space-between; align-items: center; gap: 20px;
  flex-wrap: wrap;
`;
const PageTitle = styled.div`
  h1 { margin: 0 0 6px; font-size: 24px; font-weight: 800; }
  p { margin: 0; color: rgba(255,255,255,0.6); font-size: 14px; }
`;
const MonthBadge = styled.div`
  background: rgba(255,255,255,0.1); padding: 10px 18px; border-radius: 10px;
  font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.9);
`;

const MetricRow = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 18px; margin-bottom: 28px;
`;
const MetricCard = styled.div`
  background: white; border-radius: 14px; padding: 22px 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  border-left: 4px solid ${p => p.$color || '#4CAF50'};
  .label { font-size: 12px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .val { font-size: 26px; font-weight: 800; color: ${p => p.$color || '#2c3e50'}; line-height: 1.1; }
  .sub { font-size: 12px; color: #94a3b8; margin-top: 4px; }
  .trend { font-size: 12px; font-weight: 700; margin-top: 4px; }
`;

const Grid2 = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 24px; @media (max-width: 900px) { grid-template-columns: 1fr; }`;

const SectionCard = styled.div`background: white; border-radius: 14px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); margin-bottom: 24px;`;
const SectionTitle = styled.h3`margin: 0 0 18px; font-size: 16px; font-weight: 700; color: #34495e; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;`;

const InekRow = styled.div`
  display: flex; align-items: center; gap: 12px; padding: 12px 14px;
  border-radius: 10px; margin-bottom: 8px; background: #f8fafc;
  border: 1px solid #e2e8f0; transition: all 0.2s;
  &:hover { background: #f1f5f9; transform: translateX(2px); }
  .rank { width: 28px; height: 28px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #64748b; flex-shrink: 0; }
  .info { flex: 1; }
  .isim { font-size: 14px; font-weight: 700; color: #2c3e50; }
  .kupe { font-size: 12px; color: #94a3b8; margin-top: 2px; }
  .sut { font-size: 15px; font-weight: 800; color: #4CAF50; }
  .avg { font-size: 11px; color: #94a3b8; margin-top: 2px; }
`;
const RankBadge = styled.div`
  ${p => p.$rank === 1 ? 'background: #fef3c7; color: #d97706;' : p.$rank === 2 ? 'background: #f1f5f9; color: #64748b;' : p.$rank === 3 ? 'background: #fef1e7; color: #c2703e;' : 'background: #e2e8f0; color: #64748b;'}
  width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: ${p => p.$rank <= 3 ? '16px' : '12px'}; font-weight: 800; flex-shrink: 0;
`;

const GiderBar = styled.div`
  .item { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
  .kat { font-size: 13px; font-weight: 600; color: #475569; width: 100px; flex-shrink: 0; }
  .bar-bg { flex: 1; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; background: #ef4444; transition: width 0.6s ease; }
  .tutar { font-size: 12px; font-weight: 700; color: #64748b; width: 80px; text-align: right; }
`;

const EmptyBox = styled.div`text-align: center; padding: 40px 20px; color: #94a3b8; font-size: 14px;`;

const AYLAR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

export default function Karlilik() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getKarlilik()
      .then(r => setData(r.data))
      .catch(e => console.error('Karlılık verisi alınamadı', e))
      .finally(() => setLoading(false));
  }, []);

  const bugun = new Date();
  const ayAd = AYLAR[bugun.getMonth()] + ' ' + bugun.getFullYear();

  if (loading) return <Page><SectionCard><EmptyBox>Yükleniyor…</EmptyBox></SectionCard></Page>;
  if (!data) return <Page><SectionCard><EmptyBox>Veri alınamadı.</EmptyBox></SectionCard></Page>;

  const { ozet, topInekler, giderKategoriler, gelirKategoriler, aylikTrend } = data;
  const maxGider = Math.max(...(giderKategoriler || []).map(g => g.toplam), 1);

  const katLabels = {
    veteriner: 'Veteriner', yem: 'Yem', ilac: 'İlaç', iscilik: 'İşçilik',
    bakim: 'Bakım', diger: 'Diğer', genel: 'Genel'
  };

  const trendColor = Number(ozet.karDegisim) >= 0 ? '#22c55e' : '#ef4444';

  return (
    <Page>
      <PageHeader>
        <PageTitle>
          <h1>💰 Karlılık Analizi</h1>
          <p>Baş başına maliyet, gelir/gider dengesi ve verimlilik raporu</p>
        </PageTitle>
        <MonthBadge>📅 {ayAd}</MonthBadge>
      </PageHeader>

      {/* Metrik Kartları */}
      <MetricRow>
        <MetricCard $color="#22c55e">
          <div className="label">Net Kâr / Zarar</div>
          <div className="val">{ozet.netKar >= 0 ? '+' : ''}{ozet.netKar.toFixed(0)} ₺</div>
          <div className="trend" style={{ color: trendColor }}>
            {Number(ozet.karDegisim) >= 0 ? '▲' : '▼'} {Math.abs(ozet.karDegisim)}% geçen aya göre
          </div>
        </MetricCard>
        <MetricCard $color="#3b82f6">
          <div className="label">Toplam Gelir</div>
          <div className="val">{ozet.toplamGelir.toFixed(0)} ₺</div>
          <div className="sub">Bu ay</div>
        </MetricCard>
        <MetricCard $color="#ef4444">
          <div className="label">Toplam Gider</div>
          <div className="val">{ozet.toplamGider.toFixed(0)} ₺</div>
          <div className="sub">Bu ay</div>
        </MetricCard>
        <MetricCard $color="#f59e0b">
          <div className="label">Baş Başına Maliyet</div>
          <div className="val">{ozet.basBasinaMaliyet.toFixed(0)} ₺</div>
          <div className="sub">{ozet.inekSayisi} aktif inek için</div>
        </MetricCard>
        <MetricCard $color="#8b5cf6">
          <div className="label">Toplam Süt</div>
          <div className="val">{ozet.toplamSut} L</div>
          <div className="sub">Bu ay</div>
        </MetricCard>
      </MetricRow>

      {/* Aylık Trend Grafiği */}
      {aylikTrend && aylikTrend.length > 0 && (
        <SectionCard>
          <SectionTitle>📊 Son 6 Ay Gelir / Gider / Net Kâr Trendi</SectionTitle>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aylikTrend.map(a => ({
                ...a,
                ayLabel: AYLAR[parseInt(a.ay.slice(5, 7)) - 1] || a.ay
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="ayLabel" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(v, name) => [`${v.toFixed(0)} ₺`, name === 'gelir' ? 'Gelir' : name === 'gider' ? 'Gider' : 'Net Kâr']}
                />
                <Legend formatter={v => v === 'gelir' ? 'Gelir' : v === 'gider' ? 'Gider' : 'Net Kâr'} />
                <Bar dataKey="gelir" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gider" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net" radius={[4, 4, 0, 0]}>
                  {aylikTrend.map((entry, i) => (
                    <Cell key={i} fill={entry.net >= 0 ? '#3b82f6' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      )}

      <Grid2>
        {/* En Verimli İnekler */}
        <SectionCard>
          <SectionTitle>🏆 Bu Ay En Fazla Süt Veren İnekler</SectionTitle>
          {topInekler && topInekler.length > 0 ? (
            topInekler.map((inek, i) => (
              <InekRow key={inek._id}>
                <RankBadge $rank={i + 1}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </RankBadge>
                <div className="info">
                  <div className="isim">{inek.isim || 'İsimsiz'}</div>
                  <div className="kupe">#{inek.kupeNo || '—'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="sut">{inek.toplamSut?.toFixed(1)} L</div>
                  <div className="avg">Ort. {inek.ortalama?.toFixed(1)} L/gün</div>
                </div>
              </InekRow>
            ))
          ) : (
            <EmptyBox>Bu ay için süt kaydı bulunamadı.</EmptyBox>
          )}
        </SectionCard>

        {/* Gider Kategorileri */}
        <SectionCard>
          <SectionTitle>📉 Gider Dağılımı</SectionTitle>
          {giderKategoriler && giderKategoriler.length > 0 ? (
            <GiderBar>
              {giderKategoriler.map((g, i) => (
                <div className="item" key={i}>
                  <span className="kat">{katLabels[g._id] || g._id || 'Diğer'}</span>
                  <div className="bar-bg">
                    <div className="bar-fill" style={{ width: `${(g.toplam / maxGider) * 100}%` }} />
                  </div>
                  <span className="tutar">{g.toplam.toFixed(0)} ₺</span>
                </div>
              ))}
            </GiderBar>
          ) : (
            <EmptyBox>Bu ay için gider kaydı bulunamadı.</EmptyBox>
          )}
          {gelirKategoriler && gelirKategoriler.length > 0 && (
            <>
              <SectionTitle style={{ marginTop: 24 }}>📈 Gelir Dağılımı</SectionTitle>
              <GiderBar>
                {gelirKategoriler.map((g, i) => {
                  const maxGelir = Math.max(...gelirKategoriler.map(x => x.toplam), 1);
                  return (
                    <div className="item" key={i}>
                      <span className="kat">{katLabels[g._id] || g._id || 'Diğer'}</span>
                      <div className="bar-bg">
                        <div className="bar-fill" style={{ width: `${(g.toplam / maxGelir) * 100}%`, background: '#22c55e' }} />
                      </div>
                      <span className="tutar">{g.toplam.toFixed(0)} ₺</span>
                    </div>
                  );
                })}
              </GiderBar>
            </>
          )}
        </SectionCard>
      </Grid2>
    </Page>
  );
}
