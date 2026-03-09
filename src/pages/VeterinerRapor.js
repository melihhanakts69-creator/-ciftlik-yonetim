import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import * as api from '../services/api';

const fadeUp = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;

const Page = styled.div`
  font-family: 'Inter', -apple-system, sans-serif;
  max-width: 1000px;
  margin: 0 auto;
  padding: 28px 24px 64px;
  background: #f8fafc;
  min-height: calc(100vh - 100px);
  animation: ${fadeUp} 0.4s ease;
`;

const PageHeader = styled.header`
  margin-bottom: 28px;
  padding: 24px 28px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 5px;
    background: linear-gradient(180deg, #8b5cf6, #0ea5e9);
    border-radius: 10px 0 0 10px;
  }
  .left { padding-left: 8px; }
  .eyebrow { font-size: 11px; font-weight: 800; color: #8b5cf6; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 4px; }
  .title { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
  .desc { font-size: 13px; color: #64748b; margin: 6px 0 0; }
  .badge { padding: 6px 14px; background: #f5f3ff; color: #7c3aed; border-radius: 20px; font-size: 12px; font-weight: 700; white-space: nowrap; border: 1px solid #ddd6fe; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  @media (max-width: 700px) { grid-template-columns: 1fr; }
`;

const StatCard = styled.div`
  background: ${p => p.$gradient || '#fff'};
  border-radius: 14px;
  padding: 20px 22px;
  border: 1px solid ${p => p.$gradient ? 'transparent' : '#e2e8f0'};
  box-shadow: ${p => p.$gradient
    ? '0 12px 28px -8px rgba(139,92,246,0.3)'
    : '0 2px 8px rgba(0,0,0,0.04)'};
  transition: transform 0.2s;
  &:hover { transform: translateY(-2px); }
  .icon { font-size: 24px; margin-bottom: 8px; }
  .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${p => p.$gradient ? 'rgba(255,255,255,0.75)' : '#94a3b8'}; margin-bottom: 4px; }
  .value { font-size: 30px; font-weight: 900; color: ${p => p.$gradient ? '#fff' : (p.$color || '#0f172a')}; letter-spacing: -0.02em; line-height: 1; }
  .sub { font-size: 12px; color: ${p => p.$gradient ? 'rgba(255,255,255,0.65)' : '#64748b'}; margin-top: 6px; }
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  @media (max-width: 720px) { grid-template-columns: 1fr; }
`;

const SectionCard = styled.div`
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

const SectionHead = styled.div`
  padding: 16px 22px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 8px;
  .icon { font-size: 18px; }
  h2 { margin: 0; font-size: 14px; font-weight: 800; color: #0f172a; flex: 1; }
  .count { font-size: 11px; color: #94a3b8; font-weight: 700; }
`;

const RankList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 12px 0;
`;

const RankItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 22px;
  transition: background 0.15s;
  &:hover { background: #fafbfc; }

  .rank {
    width: 26px; height: 26px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 900; flex-shrink: 0;
    background: ${p => p.$r === 1 ? '#fef3c7' : p.$r === 2 ? '#f3f4f6' : p.$r === 3 ? '#fff7ed' : '#f8fafc'};
    color: ${p => p.$r === 1 ? '#d97706' : p.$r === 2 ? '#6b7280' : p.$r === 3 ? '#c2410c' : '#94a3b8'};
    border: 1px solid ${p => p.$r === 1 ? '#fde68a' : p.$r === 2 ? '#e5e7eb' : p.$r === 3 ? '#fed7aa' : '#e5e7eb'};
  }

  .info { flex: 1; min-width: 0; }
  .name { font-size: 13px; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .bar-wrap { flex: 1; height: 6px; background: #f1f5f9; border-radius: 6px; overflow: hidden; }
  .bar { height: 100%; border-radius: 6px; background: ${p => p.$color || '#0ea5e9'}; transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1); }

  .sayi { font-size: 13px; font-weight: 800; color: ${p => p.$color || '#0ea5e9'}; min-width: 32px; text-align: right; }
`;

const EmptySection = styled.p`
  padding: 20px 22px;
  color: #94a3b8;
  font-size: 13px;
  margin: 0;
`;

const FarmRankItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 22px;
  transition: background 0.15s;
  &:hover { background: #fafbfc; }
  .rank {
    width: 26px; height: 26px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 900; flex-shrink: 0;
    background: ${p => p.$r === 1 ? '#fef3c7' : p.$r === 2 ? '#f3f4f6' : '#fff7ed'};
    color: ${p => p.$r === 1 ? '#d97706' : p.$r === 2 ? '#6b7280' : '#c2410c'};
  }
  .name { flex: 1; font-size: 13px; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .badge {
    padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
    background: ${p => p.$r === 1 ? '#fef9c3' : p.$r === 2 ? '#f3f4f6' : '#fff7ed'};
    color: ${p => p.$r === 1 ? '#92400e' : p.$r === 2 ? '#374151' : '#c2410c'};
    border: 1px solid ${p => p.$r === 1 ? '#fde68a' : p.$r === 2 ? '#d1d5db' : '#fcd34d'};
  }
`;

export default function VeterinerRapor() {
  const [rapor, setRapor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hastalikDagilimi, setHastalikDagilimi] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getVeterinerRaporAylik(),
      api.getVeterinerHastalikDagilimi()
    ])
      .then(([rRes, hRes]) => {
        setRapor(rRes.data);
        setHastalikDagilimi(hRes.data || []);
      })
      .catch(() => { setRapor(null); setHastalikDagilimi([]); })
      .finally(() => setLoading(false));
  }, []);

  const buAy = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <Page>
        <PageHeader>
          <div className="left">
            <p className="eyebrow">Rapor</p>
            <h1 className="title">Klinik istatistikler</h1>
          </div>
        </PageHeader>
        <p style={{ padding: 24, color: '#94a3b8' }}>Yükleniyor…</p>
      </Page>
    );
  }

  const {
    enCokHastalik = [],
    enCokIlac = [],
    problemliCiftlikler = [],
    toplamKayit = 0,
    ciftlikSayisi = 0,
    ilacSayisi = 0,
  } = rapor || {};

  const maxH = enCokHastalik[0]?.sayi || 1;
  const maxI = enCokIlac[0]?.sayi || 1;

  const rankEmoji = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;

  return (
    <Page>
      <PageHeader>
        <div className="left">
          <p className="eyebrow">Rapor</p>
          <h1 className="title">Klinik Raporlama</h1>
          <p className="desc">Bu ay en çok karşılaşılan hastalıklar, kullanılan ilaçlar ve aktif çiftlikler.</p>
        </div>
        <span className="badge">📅 {buAy}</span>
      </PageHeader>

      <StatsGrid>
        <StatCard $gradient="linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)">
          <div className="icon">📋</div>
          <div className="label">Toplam kayıt</div>
          <div className="value">{toplamKayit}</div>
          <div className="sub">bu ay tüm müşteriler</div>
        </StatCard>
        <StatCard>
          <div className="icon">🏥</div>
          <div className="label">Aktif çiftlik</div>
          <div className="value" style={{ color: '#0ea5e9' }}>{ciftlikSayisi || problemliCiftlikler.length}</div>
          <div className="sub">kayıt girilen müşteri</div>
        </StatCard>
        <StatCard>
          <div className="icon">💊</div>
          <div className="label">Farklı ilaç</div>
          <div className="value" style={{ color: '#059669' }}>{ilacSayisi || enCokIlac.length}</div>
          <div className="sub">bu ay kullanıldı</div>
        </StatCard>
      </StatsGrid>

      <Grid2>
        <SectionCard>
          <SectionHead>
            <span className="icon">🦠</span>
            <h2>En çok karşılaşılan tanı</h2>
            <span className="count">{enCokHastalik.length} kayıt</span>
          </SectionHead>
          {enCokHastalik.length === 0 ? (
            <EmptySection>Bu ay henüz veri yok.</EmptySection>
          ) : (
            <RankList>
              {enCokHastalik.map((x, i) => (
                <RankItem key={i} $r={i + 1} $color="#8b5cf6">
                  <div className="rank">{rankEmoji(i)}</div>
                  <div className="info">
                    <div className="name" title={x.ad}>{x.ad}</div>
                    <div className="bar-wrap">
                      <div className="bar" style={{ width: `${Math.round(x.sayi / maxH * 100)}%`, background: '#8b5cf6' }} />
                    </div>
                  </div>
                  <span className="sayi" style={{ color: '#8b5cf6' }}>{x.sayi}</span>
                </RankItem>
              ))}
            </RankList>
          )}
        </SectionCard>

        <SectionCard>
          <SectionHead>
            <span className="icon">💊</span>
            <h2>En çok kullanılan ilaç</h2>
            <span className="count">{enCokIlac.length} çeşit</span>
          </SectionHead>
          {enCokIlac.length === 0 ? (
            <EmptySection>Bu ay henüz ilaç kaydı yok.</EmptySection>
          ) : (
            <RankList>
              {enCokIlac.map((x, i) => (
                <RankItem key={i} $r={i + 1} $color="#0ea5e9">
                  <div className="rank">{rankEmoji(i)}</div>
                  <div className="info">
                    <div className="name" title={x.ad}>{x.ad}</div>
                    <div className="bar-wrap">
                      <div className="bar" style={{ width: `${Math.round(x.sayi / maxI * 100)}%`, background: '#0ea5e9' }} />
                    </div>
                  </div>
                  <span className="sayi" style={{ color: '#0ea5e9' }}>{x.sayi}</span>
                </RankItem>
              ))}
            </RankList>
          )}
        </SectionCard>
      </Grid2>

      <SectionCard>
        <SectionHead>
          <span className="icon">🏆</span>
          <h2>En çok kayıt oluşan çiftlikler</h2>
          <span className="count">{problemliCiftlikler.length} çiftlik</span>
        </SectionHead>
        {problemliCiftlikler.length === 0 ? (
          <EmptySection>Bu ay henüz veri yok.</EmptySection>
        ) : (
          <RankList>
            {problemliCiftlikler.map((x, i) => (
              <FarmRankItem key={i} $r={i + 1}>
                <div className="rank">{rankEmoji(i)}</div>
                <span className="name">{x.isletmeAdi || x.isim || 'Çiftlik'}</span>
                <span className="badge">{x.kayitSayisi} kayıt</span>
              </FarmRankItem>
            ))}
          </RankList>
        )}
      </SectionCard>

      {/* HASTALIK DAĞILIM HARİTASI — Son 3 ay */}
      {hastalikDagilimi.length > 0 && (
        <SectionCard style={{ marginTop: 24 }}>
          <SectionHead>
            <span className="icon">🗺️</span>
            <h2>Hastalık Dağılım Haritası</h2>
            <span className="count">Son 3 ay · {hastalikDagilimi.length} farklı tanı</span>
          </SectionHead>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {hastalikDagilimi.map((h, i) => {
              const max = hastalikDagilimi[0]?.toplamSayi || 1;
              const renkler = ['#8b5cf6','#0ea5e9','#f59e0b','#10b981','#ef4444','#6366f1','#ec4899','#84cc16','#14b8a6','#f97316'];
              const renk = renkler[i % renkler.length];
              return (
                <div key={i} style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{h.tani}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: renk }}>{h.toplamSayi} vaka</span>
                  </div>
                  {/* Çiftlik bazında dağılım barları */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {h.ciftlikler.slice(0, 5).map((c, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, width: 110, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.ciftlik}</span>
                        <div style={{ flex: 1, background: '#e2e8f0', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.round((c.sayi / h.toplamSayi) * 100)}%`, height: '100%', background: renk, borderRadius: 4, transition: 'width 0.5s ease' }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: renk, minWidth: 16 }}>{c.sayi}</span>
                      </div>
                    ))}
                  </div>
                  {/* Genel bar */}
                  <div style={{ marginTop: 8, background: '#e2e8f0', borderRadius: 6, height: 6 }}>
                    <div style={{ width: `${Math.round((h.toplamSayi / max) * 100)}%`, height: '100%', background: renk, borderRadius: 6 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}
    </Page>
  );
}
