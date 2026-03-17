import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import * as api from '../services/api';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;

const Page = styled.div`
  animation: ${fadeIn} 0.4s ease;
  font-family: 'Inter', sans-serif;
  padding: 0 24px 80px;
  max-width: 1100px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 0 16px 80px;
  }
`;

const PageHeader = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const SectionCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 18px 20px;
  border: 1px solid #e5e7eb;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 10px;
`;

const GiderBar = styled.div`
  .item { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
  .kat { font-size: 13px; font-weight: 600; color: #475569; width: 100px; flex-shrink: 0; }
  .bar-bg { flex: 1; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; background: #ef4444; transition: width 0.6s ease; }
  .tutar { font-size: 12px; font-weight: 700; color: #64748b; width: 80px; text-align: right; }
`;

const EmptyBox = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
  font-size: 14px;
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const AYLAR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const DONEM_GUN = { 'Bu Ay': 30, '3 Ay': 90, '6 Ay': 180 };

export default function Karlilik() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donem, setDonem] = useState('Bu Ay');
  const [yemFiyatArtis, setYemFiyatArtis] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.getKarlilik(DONEM_GUN[donem] || 30)
      .then(r => setData(r.data))
      .catch(e => console.error('Karlılık verisi alınamadı', e))
      .finally(() => setLoading(false));
  }, [donem]);

  const bugun = new Date();
  const ayAd = AYLAR[bugun.getMonth()] + ' ' + bugun.getFullYear();

  if (loading) return <Page><SectionCard><EmptyBox>Yükleniyor…</EmptyBox></SectionCard></Page>;
  if (!data) return <Page><SectionCard><EmptyBox>Veri alınamadı.</EmptyBox></SectionCard></Page>;

  const { ozet, inekKarliligi = [], giderKategoriler = [], gelirKategoriler = [], aylikTrend = [] } = data;
  const maxGider = Math.max(...(giderKategoriler || []).map(g => g.toplam), 1);

  const katLabels = {
    veteriner: 'Veteriner', yem: 'Yem', ilac: 'İlaç', iscilik: 'İşçilik',
    bakim: 'Bakım', diger: 'Diğer', genel: 'Genel', 'diger-gider': 'Diğer'
  };

  const yemGider = giderKategoriler.find(g => g._id === 'yem')?.toplam || 0;
  const simule = (artis) => {
    const yemArtisMiktari = yemGider * (artis / 100);
    const yeniGider = ozet.toplamGider + yemArtisMiktari;
    const yeniNetKar = ozet.toplamGelir - yeniGider;
    const yeniLtMaliyet = ozet.toplamSut > 0 ? yeniGider / ozet.toplamSut : 0;
    return { yeniNetKar, yeniLtMaliyet, yemArtisMiktari };
  };

  return (
    <Page>
      <PageHeader>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>
            Karlılık Analizi
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>
            {ayAd} · {(ozet.toplamHayvan ?? ozet.inekSayisi) || 0} baş toplam
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Bu Ay', '3 Ay', '6 Ay'].map(p => (
            <button
              key={p}
              onClick={() => setDonem(p)}
              style={{
                padding: '6px 12px', borderRadius: 20, border: '1px solid',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: donem === p ? '#dcfce7' : '#fff',
                color: donem === p ? '#166534' : '#6b7280',
                borderColor: donem === p ? '#16a34a' : '#e5e7eb'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* 4 KPI Kartları */}
      <KpiGrid>
        {[
          { label: 'Net Kâr', value: `${ozet.netKar >= 0 ? '+' : ''}${ozet.netKar.toLocaleString('tr-TR')} ₺`, trend: `↑ %${Math.abs(ozet.karDegisim || 0)} önceki dönem`, trendColor: ozet.netKar >= 0 ? '#16a34a' : '#dc2626' },
          { label: 'Lt Başına Maliyet', value: `${(ozet.litreBasinaMaliyet || 0).toFixed(2)} ₺/Lt`, trend: 'Yem + sağlık toplam', trendColor: '#9ca3af' },
          { label: 'FCR', value: `${(ozet.fcr || 0).toFixed(1)} kg/Lt`, trend: 'Yem çevirme oranı', trendColor: '#9ca3af' },
          { label: 'Baş Başına Kâr', value: `${(ozet.hayvanBasinaKar ?? ozet.netKar / (ozet.inekSayisi || 1)).toLocaleString('tr-TR')} ₺`, trend: `${(ozet.toplamHayvan ?? ozet.inekSayisi) || 0} baş toplam`, trendColor: '#9ca3af' },
        ].map((k, i) => (
          <div key={i} style={{
            background: '#f9fafb', border: '1px solid #e5e7eb',
            borderRadius: 12, padding: '14px 16px'
          }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 6 }}>
              {k.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-.4px', lineHeight: 1 }}>
              {k.value}
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: k.trendColor, marginTop: 5 }}>
              {k.trend}
            </div>
          </div>
        ))}
      </KpiGrid>

      {/* Hayvan Başı Analiz Kartları */}
      {ozet.toplamHayvan > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 14 }}>
            Hayvan Başına Analiz — {ozet.toplamHayvan} baş toplam
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {[
              { label: 'Yem Gideri', value: `${(ozet.hayvanBasinaYem || 0).toFixed(0)} ₺`, color: '#d97706', pct: `Toplam giderin %${ozet.yemGiderOrani || 0}'i` },
              { label: 'Sağlık Gideri', value: `${(ozet.hayvanBasinaSaglik || 0).toFixed(0)} ₺`, color: '#3b82f6', pct: 'Vet + ilaç' },
              { label: 'Toplam Gider', value: `${(ozet.hayvanBasinaToplamGider || 0).toFixed(0)} ₺`, color: '#ef4444', pct: 'Tüm kategoriler' },
              { label: 'Gelir', value: `${(ozet.hayvanBasinaGelir || 0).toFixed(0)} ₺`, color: '#16a34a', pct: 'Süt + satış' },
              { label: 'Net Kâr', value: `${(ozet.hayvanBasinaKar || 0) >= 0 ? '+' : ''}${(ozet.hayvanBasinaKar || 0).toFixed(0)} ₺`, color: (ozet.hayvanBasinaKar || 0) >= 0 ? '#16a34a' : '#ef4444', pct: 'Baş başına' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '12px 8px', background: '#f9fafb', borderRadius: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: item.color, letterSpacing: '-.3px' }}>{item.value}</div>
                <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>{item.pct}</div>
              </div>
            ))}
          </div>
          {ozet.toplamGider > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>Gider yapısı</div>
              <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 1 }}>
                <div style={{ width: `${ozet.yemGiderOrani || 0}%`, background: '#d97706', minWidth: 0 }} title={`Yem: %${ozet.yemGiderOrani}`} />
                <div style={{ width: `${ozet.toplamGider > 0 ? ((ozet.toplamSaglikMaliyet || 0) / ozet.toplamGider * 100).toFixed(0) : 0}%`, background: '#3b82f6', minWidth: 0 }} title="Sağlık" />
                <div style={{ flex: 1, background: '#e5e7eb', minWidth: 0 }} title="Diğer" />
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
                <span style={{ fontSize: 10, color: '#d97706', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: '#d97706', display: 'inline-block' }} />
                  Yem %{ozet.yemGiderOrani || 0}
                </span>
                <span style={{ fontSize: 10, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: '#3b82f6', display: 'inline-block' }} />
                  Sağlık %{ozet.toplamGider > 0 ? ((ozet.toplamSaglikMaliyet / ozet.toplamGider) * 100).toFixed(0) : 0}
                </span>
                <span style={{ fontSize: 10, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: '#e5e7eb', display: 'inline-block' }} />
                  Diğer
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sürü Hareketleri — Piyasa Değeri Etkisi */}
      {(ozet.toplamBuzagiGeliri > 0 || ozet.toplamOlumKaybi > 0) && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 14 }}>
            Sürü Hareketleri — Piyasa Değeri Etkisi
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: '#166534', fontWeight: 500, marginBottom: 6 }}>🐄 Buzağılama Geliri</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#16a34a' }}>
                +{(ozet.toplamBuzagiGeliri || 0).toLocaleString('tr-TR')} ₺
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                Bu dönem doğan buzağıların piyasa değeri
              </div>
            </div>
            <div style={{ background: ozet.toplamOlumKaybi > 0 ? '#fef2f2' : '#f9fafb', border: `1px solid ${ozet.toplamOlumKaybi > 0 ? '#fecaca' : '#e5e7eb'}`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: ozet.toplamOlumKaybi > 0 ? '#991b1b' : '#9ca3af', fontWeight: 500, marginBottom: 6 }}>
                💔 Ölüm Kayıpları
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: ozet.toplamOlumKaybi > 0 ? '#dc2626' : '#9ca3af' }}>
                {ozet.toplamOlumKaybi > 0 ? `-${(ozet.toplamOlumKaybi).toLocaleString('tr-TR')} ₺` : 'Yok'}
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                Ölen hayvanların piyasa değeri kaybı
              </div>
            </div>
          </div>
        </div>
      )}

      {/* İnek Bazlı Karlılık */}
      {inekKarliligi && inekKarliligi.length > 0 && (
        <SectionCard style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>
              İnek Bazlı Karlılık
            </h3>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>
              Süt geliri − (yem payı + sağlık masrafı)
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '22px 1fr 70px 80px 70px 80px',
            gap: 8, padding: '6px 0',
            borderBottom: '1px solid #e5e7eb',
            fontSize: 10, fontWeight: 600, color: '#9ca3af',
            textTransform: 'uppercase', letterSpacing: '.4px',
            minWidth: 480
          }}>
            <span>#</span>
            <span>İnek</span>
            <span style={{ textAlign: 'right' }}>Süt</span>
            <span style={{ textAlign: 'right' }}>Lt/Maliyet</span>
            <span style={{ textAlign: 'right' }}>Sağlık</span>
            <span style={{ textAlign: 'right' }}>Net Kâr</span>
          </div>

          {inekKarliligi.map((inek, i) => {
            const zararda = inek.netKar < 0;
            return (
              <div
                key={inek._id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '22px 1fr 70px 80px 70px 80px',
                  gap: 8, padding: '9px 0',
                  borderBottom: '1px solid #f3f4f6',
                  opacity: zararda ? 0.75 : 1,
                  alignItems: 'center',
                  minWidth: 480
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#d97706' : '#e5e7eb',
                  color: i < 3 ? '#fff' : '#6b7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700
                }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>
                    {inek.isim || 'İsimsiz'}
                  </div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>
                    #{inek.kupeNo || '—'} · {inek.durum || 'Aktif'}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 500, color: '#16a34a' }}>
                  {(inek.toplamSut || 0).toFixed(0)} Lt
                </div>
                <div style={{
                  textAlign: 'right', fontSize: 12, fontWeight: 500,
                  color: (inek.litreBasinaMaliyet || 0) > 5 ? '#dc2626'
                    : (inek.litreBasinaMaliyet || 0) > 3.5 ? '#d97706'
                    : '#16a34a'
                }}>
                  {(inek.litreBasinaMaliyet || 0).toFixed(2)} ₺/Lt
                </div>
                <div style={{ textAlign: 'right', fontSize: 12, color: '#6b7280' }}>
                  {(inek.saglikMasrafi || 0) > 0 ? `${(inek.saglikMasrafi || 0).toLocaleString('tr-TR')} ₺` : '—'}
                </div>
                <div style={{
                  textAlign: 'right', fontSize: 13, fontWeight: 700,
                  color: zararda ? '#dc2626' : '#16a34a'
                }}>
                  {zararda ? '' : '+'}{(inek.netKar || 0).toLocaleString('tr-TR')} ₺
                </div>
              </div>
            );
          })}

          {inekKarliligi.some(i => i.netKar < 0) && (
            <div style={{
              marginTop: 10, padding: '8px 12px',
              background: '#fef3c7', borderRadius: 8,
              fontSize: 11, color: '#92400e', fontWeight: 500
            }}>
              ⚠️ {inekKarliligi.filter(i => i.netKar < 0).length} inek bu ay zarar ettiriyor.
              Tedavi maliyeti veya düşük süt verimi kontrol edilmeli.
            </div>
          )}
        </SectionCard>
      )}

      {/* Fiyat Simülatörü */}
      <SectionCard>
        <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#111827' }}>
          Fiyat Simülatörü
        </h3>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 16px' }}>
          Karma yem fiyatı değişirse ne olur?
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>Fiyat artışı</span>
          <input
            type="range"
            min="-20"
            max="50"
            step="5"
            value={yemFiyatArtis}
            onChange={e => setYemFiyatArtis(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{
            fontSize: 14, fontWeight: 700, minWidth: 40, textAlign: 'right',
            color: yemFiyatArtis > 0 ? '#dc2626' : '#16a34a'
          }}>
            {yemFiyatArtis > 0 ? '+' : ''}{yemFiyatArtis}%
          </span>
        </div>

        {(() => {
          const s = simule(yemFiyatArtis);
          return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 60px', gap: 8, fontSize: 12 }}>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}></div>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Mevcut</div>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Yeni</div>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Fark</div>

              {[
                { lbl: 'Lt başına maliyet', base: `${(ozet.litreBasinaMaliyet || 0).toFixed(2)} ₺`, yeni: `${s.yeniLtMaliyet.toFixed(2)} ₺`, delta: `${(s.yeniLtMaliyet - (ozet.litreBasinaMaliyet || 0)).toFixed(2)} ₺`, neg: yemFiyatArtis > 0 },
                { lbl: 'Net kâr', base: `${ozet.netKar.toLocaleString('tr-TR')} ₺`, yeni: `${s.yeniNetKar.toLocaleString('tr-TR')} ₺`, delta: `${(s.yeniNetKar - ozet.netKar).toLocaleString('tr-TR')} ₺`, neg: yemFiyatArtis > 0 },
              ].map((row, i) => (
                <React.Fragment key={i}>
                  <span style={{ color: '#374151' }}>{row.lbl}</span>
                  <span style={{ textAlign: 'right', color: '#374151' }}>{row.base}</span>
                  <span style={{ textAlign: 'right', fontWeight: 500, color: row.neg ? '#dc2626' : '#16a34a' }}>{row.yeni}</span>
                  <span style={{ textAlign: 'right', fontWeight: 500, color: row.neg ? '#dc2626' : '#16a34a' }}>{row.delta}</span>
                </React.Fragment>
              ))}
            </div>
          );
        })()}
      </SectionCard>

      {/* Aylık Trend Grafiği */}
      {aylikTrend && aylikTrend.length > 0 && (
        <SectionCard>
          <SectionTitle>📊 Son 6 Ay Gelir / Gider / Net Kâr Trendi</SectionTitle>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aylikTrend.map(a => ({
                ...a,
                ayLabel: AYLAR[parseInt((a.ay || '').slice(5, 7), 10) - 1] || a.ay
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="ayLabel" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(v, name) => [`${Number(v).toFixed(0)} TL`, name === 'gelir' ? 'Gelir' : name === 'gider' ? 'Gider' : 'Net Kar']}
                />
                <Legend formatter={(v) => (v === 'gelir' ? 'Gelir' : v === 'gider' ? 'Gider' : 'Net Kar')} />
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

      {/* Gider Dağılımı */}
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
    </Page>
  );
}
