import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import * as api from '../services/api';

const fadeUp = keyframes`from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}`;

const Page = styled.div`
  font-family: 'Inter', -apple-system, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 64px;
  min-height: calc(100vh - 80px);
  background: #f1f5f9;
  animation: ${fadeUp} 0.4s ease;
`;

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero = styled.div`
  background: linear-gradient(135deg, #2e1065 0%, #4c1d95 45%, #5b21b6 100%);
  border-radius: 22px;
  padding: 30px 36px;
  margin-bottom: 22px;
  display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;
  position: relative; overflow: hidden;

  &::before { content: ''; position: absolute; top: -80px; right: -60px; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(167,139,250,0.2), transparent 70%); }
  &::after { content: ''; position: absolute; bottom: -50px; left: 30%; width: 180px; height: 180px; border-radius: 50%; background: radial-gradient(circle, rgba(14,165,233,0.1), transparent 70%); }

  .h-left { z-index: 1; }
  .h-badge { font-size: 11px; font-weight: 800; color: rgba(167,139,250,0.9); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
  .h-title { font-size: 26px; font-weight: 900; color: #fff; letter-spacing: -0.03em; margin: 0 0 6px; }
  .h-sub { font-size: 13px; color: rgba(255,255,255,0.55); font-weight: 500; }

  .h-month { z-index: 1; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18); border-radius: 14px; padding: 12px 22px; text-align: center; }
  .h-month-lbl { font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
  .h-month-val { font-size: 18px; font-weight: 900; color: #fff; }
`;

// ─── Stats ────────────────────────────────────────────────────────────────────
const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 22px;
  @media(max-width: 700px) { grid-template-columns: 1fr; }
`;

const StatCard = styled.div`
  border-radius: 18px;
  padding: 22px 24px;
  position: relative; overflow: hidden;
  background: ${p => p.$gradient || '#fff'};
  border: 1px solid ${p => p.$gradient ? 'transparent' : '#e2e8f0'};
  box-shadow: ${p => p.$gradient ? '0 12px 30px -8px rgba(109,40,217,0.35)' : '0 2px 8px rgba(0,0,0,0.04)'};
  transition: all 0.2s;
  &:hover { transform: translateY(-2px); }

  .sc-icon { font-size: 26px; margin-bottom: 10px; }
  .sc-lbl { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: ${p => p.$gradient ? 'rgba(255,255,255,0.65)' : '#94a3b8'}; margin-bottom: 4px; }
  .sc-val { font-size: 32px; font-weight: 900; color: ${p => p.$gradient ? '#fff' : (p.$color || '#0f172a')}; letter-spacing: -0.03em; line-height: 1; }
  .sc-sub { font-size: 12px; color: ${p => p.$gradient ? 'rgba(255,255,255,0.6)' : '#64748b'}; margin-top: 6px; font-weight: 500; }
  .sc-bg { position: absolute; right: -10px; bottom: -10px; font-size: 60px; opacity: 0.06; }
`;

// ─── Grid ─────────────────────────────────────────────────────────────────────
const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  @media(max-width: 720px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: #fff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
`;

const CardHead = styled.div`
  padding: 16px 22px;
  border-bottom: 1px solid #f1f5f9;
  display: flex; align-items: center; gap: 10px;
  .ch-icon { font-size: 18px; }
  .ch-title { margin: 0; font-size: 14px; font-weight: 800; color: #0f172a; flex: 1; }
  .ch-badge { font-size: 11px; font-weight: 700; color: #94a3b8; background: #f1f5f9; border-radius: 20px; padding: 3px 10px; }
`;

// ─── Rank Items ───────────────────────────────────────────────────────────────
const RankItem = styled.div`
  display: flex; align-items: center; gap: 12px;
  padding: 12px 22px;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.15s;
  &:last-child { border-bottom: none; }
  &:hover { background: #fafbfd; }

  .rk-badge {
    width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 900; flex-shrink: 0;
    background: ${p => p.$r === 1 ? 'linear-gradient(135deg,#fef3c7,#fde68a)' : p.$r === 2 ? '#f3f4f6' : p.$r === 3 ? 'linear-gradient(135deg,#fff7ed,#fed7aa)' : '#f8fafc'};
    color: ${p => p.$r === 1 ? '#d97706' : p.$r === 2 ? '#4b5563' : p.$r === 3 ? '#c2410c' : '#94a3b8'};
    border: 1px solid ${p => p.$r === 1 ? '#fde68a' : p.$r === 2 ? '#e5e7eb' : p.$r === 3 ? '#fed7aa' : '#e5e7eb'};
  }
  .rk-info { flex: 1; min-width: 0; }
  .rk-name { font-size: 13px; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
  .rk-bar-bg { height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
  .rk-bar { height: 100%; border-radius: 10px; transition: width 0.8s cubic-bezier(0.16,1,0.3,1); }
  .rk-val { font-size: 14px; font-weight: 900; min-width: 36px; text-align: right; }
`;

// ─── Hastalik Dagilimi ────────────────────────────────────────────────────────
const DagilimCard = styled.div`
  background: #fff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
  margin-bottom: 20px;
`;

const DagilimItem = styled.div`
  padding: 18px 22px;
  border-bottom: 1px solid #f8fafc;
  &:last-child { border-bottom: none; }
  &:hover { background: #fafbfd; }
  transition: background 0.15s;

  .di-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .di-name { font-size: 14px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px; }
  .di-dot { width: 10px; height: 10px; border-radius: 50%; }
  .di-vaka { font-size: 13px; font-weight: 800; }

  .di-ciftlikler { display: flex; flex-direction: column; gap: 6px; }
  .di-ciftlik { display: flex; align-items: center; gap: 10px; }
  .di-ciftlik-name { font-size: 11px; color: #64748b; font-weight: 600; width: 120px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .di-ciftlik-bar-bg { flex: 1; height: 8px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
  .di-ciftlik-bar { height: 100%; border-radius: 10px; transition: width 0.6s ease; }
  .di-ciftlik-sayi { font-size: 11px; font-weight: 800; width: 20px; text-align: right; }

  .di-total-bar { margin-top: 10px; height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
  .di-total-fill { height: 100%; border-radius: 10px; transition: width 0.8s ease; }
`;

// ─── Farm Rank ────────────────────────────────────────────────────────────────
const FarmItem = styled.div`
  display: flex; align-items: center; gap: 14px;
  padding: 14px 22px;
  border-bottom: 1px solid #f8fafc;
  &:last-child { border-bottom: none; }
  &:hover { background: #fafbfd; }
  transition: background 0.15s;

  .fi-rank { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; flex-shrink: 0; }
  .fi-name { flex: 1; font-size: 14px; font-weight: 700; color: #1e293b; }
  .fi-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; }
`;

const Empty = styled.p`
  padding: 24px 22px; color: #94a3b8; font-size: 13px; margin: 0; text-align: center;
`;

const RENK = ['#8b5cf6','#0ea5e9','#f59e0b','#10b981','#ef4444','#6366f1','#ec4899','#84cc16','#14b8a6','#f97316'];

const rankEmoji = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;

export default function VeterinerRapor() {
  const [rapor, setRapor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hastalikDagilimi, setHastalikDagilimi] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getVeterinerRaporAylik(),
      api.getVeterinerHastalikDagilimi()
    ])
      .then(([rRes, hRes]) => { setRapor(rRes.data); setHastalikDagilimi(hRes.data || []); })
      .catch(() => { setRapor(null); setHastalikDagilimi([]); })
      .finally(() => setLoading(false));
  }, []);

  const buAy = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

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

  return (
    <Page>
      <Hero>
        <div className="h-left">
          <div className="h-badge">📊 Aylık Rapor</div>
          <div className="h-title">Klinik Raporlama & İstatistikler</div>
          <div className="h-sub">Bu ay en çok karşılaşılan hastalıklar, kullanılan ilaçlar ve çiftlik analizleri</div>
        </div>
        <div className="h-month">
          <div className="h-month-lbl">Aktif Dönem</div>
          <div className="h-month-val">📅 {buAy}</div>
        </div>
      </Hero>

      {loading ? (
        <Card><Empty>⏳ Yükleniyor…</Empty></Card>
      ) : (
        <>
          {/* Stats */}
          <StatsRow>
            <StatCard $gradient="linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)">
              <div className="sc-icon">📋</div>
              <div className="sc-lbl">Toplam Kayıt</div>
              <div className="sc-val">{toplamKayit}</div>
              <div className="sc-sub">bu ay tüm müşteriler</div>
              <div className="sc-bg">📋</div>
            </StatCard>
            <StatCard $color="#0ea5e9">
              <div className="sc-icon">🏥</div>
              <div className="sc-lbl">Aktif Çiftlik</div>
              <div className="sc-val" style={{ color: '#0ea5e9' }}>{ciftlikSayisi || problemliCiftlikler.length}</div>
              <div className="sc-sub">kayıt girilen müşteri</div>
            </StatCard>
            <StatCard $color="#16a34a">
              <div className="sc-icon">💊</div>
              <div className="sc-lbl">Farklı İlaç</div>
              <div className="sc-val" style={{ color: '#16a34a' }}>{ilacSayisi || enCokIlac.length}</div>
              <div className="sc-sub">bu ay kullanıldı</div>
            </StatCard>
          </StatsRow>

          {/* 2 col: hastalık & ilaç */}
          <Grid2>
            <Card>
              <CardHead>
                <span className="ch-icon">🦠</span>
                <span className="ch-title">En Çok Karşılaşılan Tanı</span>
                <span className="ch-badge">{enCokHastalik.length} kayıt</span>
              </CardHead>
              {enCokHastalik.length === 0 ? <Empty>Bu ay henüz veri yok.</Empty> : (
                enCokHastalik.map((x, i) => (
                  <RankItem key={i} $r={i + 1}>
                    <div className="rk-badge">{rankEmoji(i)}</div>
                    <div className="rk-info">
                      <div className="rk-name" title={x.ad}>{x.ad}</div>
                      <div className="rk-bar-bg"><div className="rk-bar" style={{ width: `${Math.round(x.sayi / maxH * 100)}%`, background: '#8b5cf6' }} /></div>
                    </div>
                    <span className="rk-val" style={{ color: '#8b5cf6' }}>{x.sayi}</span>
                  </RankItem>
                ))
              )}
            </Card>

            <Card>
              <CardHead>
                <span className="ch-icon">💊</span>
                <span className="ch-title">En Çok Kullanılan İlaç</span>
                <span className="ch-badge">{enCokIlac.length} çeşit</span>
              </CardHead>
              {enCokIlac.length === 0 ? <Empty>Bu ay henüz ilaç kaydı yok.</Empty> : (
                enCokIlac.map((x, i) => (
                  <RankItem key={i} $r={i + 1}>
                    <div className="rk-badge">{rankEmoji(i)}</div>
                    <div className="rk-info">
                      <div className="rk-name" title={x.ad}>{x.ad}</div>
                      <div className="rk-bar-bg"><div className="rk-bar" style={{ width: `${Math.round(x.sayi / maxI * 100)}%`, background: '#0ea5e9' }} /></div>
                    </div>
                    <span className="rk-val" style={{ color: '#0ea5e9' }}>{x.sayi}</span>
                  </RankItem>
                ))
              )}
            </Card>
          </Grid2>

          {/* En çok kayıt oluşan çiftlikler */}
          <Card style={{ marginBottom: 20 }}>
            <CardHead>
              <span className="ch-icon">🏆</span>
              <span className="ch-title">En Çok Kayıt Oluşan Çiftlikler</span>
              <span className="ch-badge">{problemliCiftlikler.length} çiftlik</span>
            </CardHead>
            {problemliCiftlikler.length === 0 ? <Empty>Bu ay henüz veri yok.</Empty> : (
              problemliCiftlikler.map((x, i) => {
                const renk = RENK[i % RENK.length];
                const rankColors = [
                  { bg: 'linear-gradient(135deg,#fef3c7,#fde68a)', color: '#d97706' },
                  { bg: '#f3f4f6', color: '#4b5563' },
                  { bg: 'linear-gradient(135deg,#fff7ed,#fed7aa)', color: '#c2410c' },
                ];
                const rc = rankColors[i] || { bg: '#f8fafc', color: renk };
                return (
                  <FarmItem key={i}>
                    <div className="fi-rank" style={{ background: rc.bg, color: rc.color }}>{rankEmoji(i)}</div>
                    <span className="fi-name">{x.isletmeAdi || x.isim || 'Çiftlik'}</span>
                    <span className="fi-badge" style={{ background: `${renk}18`, color: renk, border: `1px solid ${renk}33` }}>
                      {x.kayitSayisi} kayıt
                    </span>
                  </FarmItem>
                );
              })
            )}
          </Card>

          {/* Hastalık Dağılım Haritası */}
          {hastalikDagilimi.length > 0 && (
            <DagilimCard>
              <CardHead>
                <span className="ch-icon">🗺️</span>
                <span className="ch-title">Hastalık Dağılım Haritası</span>
                <span className="ch-badge">Son 3 ay · {hastalikDagilimi.length} tanı</span>
              </CardHead>
              {hastalikDagilimi.map((h, i) => {
                const max = hastalikDagilimi[0]?.toplamSayi || 1;
                const renk = RENK[i % RENK.length];
                return (
                  <DagilimItem key={i}>
                    <div className="di-head">
                      <div className="di-name">
                        <div className="di-dot" style={{ background: renk }} />
                        {h.tani}
                      </div>
                      <span className="di-vaka" style={{ color: renk }}>{h.toplamSayi} vaka</span>
                    </div>
                    <div className="di-ciftlikler">
                      {h.ciftlikler.slice(0, 5).map((c, j) => (
                        <div key={j} className="di-ciftlik">
                          <span className="di-ciftlik-name" title={c.ciftlik}>{c.ciftlik}</span>
                          <div className="di-ciftlik-bar-bg">
                            <div className="di-ciftlik-bar" style={{ width: `${Math.round(c.sayi / h.toplamSayi * 100)}%`, background: renk }} />
                          </div>
                          <span className="di-ciftlik-sayi" style={{ color: renk }}>{c.sayi}</span>
                        </div>
                      ))}
                    </div>
                    <div className="di-total-bar">
                      <div className="di-total-fill" style={{ width: `${Math.round(h.toplamSayi / max * 100)}%`, background: `linear-gradient(90deg,${renk},${renk}99)` }} />
                    </div>
                  </DagilimItem>
                );
              })}
            </DagilimCard>
          )}
        </>
      )}
    </Page>
  );
}
