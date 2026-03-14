import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); }`;

// ─── Sayfa: tam yükseklik, scroll yok ────────────────────────────────────────
const Page = styled.div`
  min-height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  font-family: 'Inter', -apple-system, sans-serif;
  background: #f1f5f9;
  overflow-y: auto;
  animation: ${fadeIn} 0.4s ease;
  
  @media (max-width: 768px) {
    padding-bottom: 80px;
  }
`;

// ─── Üst Hero Bar ─────────────────────────────────────────────────────────────
const HeroBar = styled.div`
  background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
  padding: 0 28px;
  min-height: 72px;
  display: flex;
  align-items: center;
  gap: 22px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    padding: 14px 16px;
    gap: 12px;
  }

  &::before {
    content: '';
    position: absolute; top: -40px; right: 80px;
    width: 180px; height: 180px; border-radius: 50%;
    background: rgba(255,255,255,0.03);
  }
  &::after {
    content: '';
    position: absolute; bottom: -50px; right: -20px;
    width: 120px; height: 120px; border-radius: 50%;
    background: rgba(56,189,248,0.07);
  }
`;

const DoctorBlock = styled.div`
  flex-shrink: 0;
  z-index: 1;
  .dr-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.12em; }
  .dr-name { font-size: 17px; font-weight: 900; color: #fff; letter-spacing: -0.02em; line-height: 1.1; }
  .dr-sub { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 1px; }
`;

const HeroDivider = styled.div`
  width: 1px; height: 38px;
  background: rgba(255,255,255,0.1);
  flex-shrink: 0; z-index: 1;
`;

const SearchBlock = styled.div`
  flex: 1; z-index: 1;
  max-width: 460px;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    padding: 10px 16px;
    border: 1.5px solid rgba(255,255,255,0.14);
    border-radius: 10px;
    font-size: 13px; font-weight: 500;
    background: rgba(255,255,255,0.08);
    color: #fff;
    transition: all 0.2s;

    &::placeholder { color: rgba(255,255,255,0.3); }
    &:focus {
      outline: none;
      border-color: rgba(255,255,255,0.35);
      background: rgba(255,255,255,0.13);
    }
  }

  button {
    padding: 10px 20px;
    border-radius: 10px; border: none;
    background: #3b82f6; color: #fff;
    font-size: 13px; font-weight: 700;
    cursor: pointer; white-space: nowrap;
    transition: all 0.2s;
    &:hover:not(:disabled) { background: #2563eb; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
`;

const DateBlock = styled.div`
  margin-left: auto; flex-shrink: 0; z-index: 1;
  text-align: right;
  .date { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.75); }
  .day  { font-size: 10px; color: rgba(255,255,255,0.35); margin-top: 2px; letter-spacing: 0.04em; }
`;

// ─── İstatistik Kartları ──────────────────────────────────────────────────────
const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4,1fr);
  gap: 10px;
  padding: 10px 20px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    padding: 10px 12px;
  }
`;

const StatCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 13px 16px;
  border: 1px solid #e2e8f0;
  display: flex; align-items: center; gap: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: all 0.2s;

  &:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.07); transform: translateY(-1px); }

  .sc-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: ${p => p.$iconBg || '#f1f5f9'};
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; flex-shrink: 0;
  }
  .sc-texts { min-width: 0; }
  .sc-val {
    font-size: 22px; font-weight: 900;
    color: ${p => p.$valColor || '#0f172a'};
    line-height: 1; letter-spacing: -0.02em;
  }
  .sc-lbl { font-size: 11px; font-weight: 600; color: #64748b; margin-top: 2px; white-space: nowrap; }

  ${p => p.$primary && css`
    background: linear-gradient(135deg, #0ea5e9, #2563eb);
    border-color: transparent;
    box-shadow: 0 4px 16px rgba(37,99,235,0.28);
    .sc-icon { background: rgba(255,255,255,0.2); }
    .sc-val { color: #fff; }
    .sc-lbl { color: rgba(255,255,255,0.72); }
    &:hover { box-shadow: 0 6px 20px rgba(37,99,235,0.38); }
  `}
`;

// ─── Ana İçerik Grid ─────────────────────────────────────────────────────────
const MainBody = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 308px;
  gap: 10px;
  padding: 0 20px 12px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding: 0 12px 12px;
  }
`;

const LeftCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
`;

const RightCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
`;

// İki bölüm: çiftlikler + kayıtlar yan yana
const LeftGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  flex: 1;
  min-height: 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// ─── Panel & Card Bileşenleri ─────────────────────────────────────────────────
const Panel = styled.div`
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
`;

const PanelHead = styled.div`
  padding: 11px 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0;

  h3 {
    margin: 0;
    font-size: 11px; font-weight: 800;
    color: #0f172a;
    text-transform: uppercase; letter-spacing: 0.07em;
    display: flex; align-items: center; gap: 6px;
  }
  .count {
    font-size: 10px; color: #94a3b8; font-weight: 600;
    background: #f1f5f9; padding: 2px 8px; border-radius: 20px;
  }
`;

const PanelScroll = styled.div`
  flex: 1; overflow-y: auto;
  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px; }
`;

// ─── Hızlı Geçiş 2×2 Grid ────────────────────────────────────────────────────
const QuickGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 10px;
`;

const QuickBtn = styled.button`
  padding: 13px 12px;
  border-radius: 10px;
  border: 1.5px solid ${p => p.$border || '#e2e8f0'};
  background: ${p => p.$bg || '#fff'};
  text-align: left; cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${p => p.$hBorder || '#3b82f6'};
    background: ${p => p.$hBg || '#f8fafc'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  }

  .qb-icon { font-size: 19px; margin-bottom: 5px; display: block; }
  .qb-title { font-size: 12px; font-weight: 800; color: #0f172a; display: block; }
  .qb-desc  { font-size: 10px; color: #94a3b8; margin-top: 1px; display: block; }
`;

// ─── Satır Bileşenleri ────────────────────────────────────────────────────────
const FarmRow = styled.div`
  padding: 10px 16px;
  display: flex; align-items: center; gap: 10px;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer; transition: all 0.14s;

  &:last-child { border-bottom: none; }
  &:hover { background: #f8fafc; }

  .fa-av {
    width: 32px; height: 32px; border-radius: 8px;
    background: linear-gradient(135deg, #0ea5e9, #2563eb);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 12px; font-weight: 900; flex-shrink: 0;
  }
  .fa-info { flex: 1; min-width: 0; }
  .fa-name { font-size: 12px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fa-sub  { font-size: 10px; color: #94a3b8; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fa-arr  { color: #cbd5e1; font-size: 12px; transition: all 0.15s; }
  &:hover .fa-arr { color: #3b82f6; }
`;

const RecRow = styled.div`
  padding: 9px 16px;
  display: flex; align-items: flex-start; gap: 10px;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer; transition: all 0.14s;

  &:last-child { border-bottom: none; }
  &:hover { background: #f8fafc; }

  .rc-dot {
    width: 7px; height: 7px; border-radius: 50%; margin-top: 4px;
    background: ${p => p.$col || '#3b82f6'}; flex-shrink: 0;
  }
  .rc-info { flex: 1; min-width: 0; }
  .rc-l1 { font-size: 12px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rc-l2 { font-size: 10px; color: #94a3b8; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rc-date { font-size: 10px; color: #cbd5e1; font-weight: 600; flex-shrink: 0; white-space: nowrap; }
`;

const RiskRow = styled.div`
  padding: 9px 16px;
  display: flex; align-items: center; gap: 10px;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer; transition: all 0.14s;

  &:last-child { border-bottom: none; }
  &:hover { background: #f8fafc; }

  .rk-info { flex: 1; min-width: 0; }
  .rk-name { font-size: 12px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rk-sub  { font-size: 10px; color: #94a3b8; margin-top: 1px; }

  .rk-badge {
    padding: 3px 9px; border-radius: 20px;
    font-size: 11px; font-weight: 800; flex-shrink: 0;
    background: ${p => p.$s >= 80 ? '#dcfce7' : p.$s >= 50 ? '#fef9c3' : '#fee2e2'};
    color: ${p => p.$s >= 80 ? '#15803d' : p.$s >= 50 ? '#854d0e' : '#b91c1c'};
  }
`;

const SearchResRow = styled.div`
  padding: 10px 16px;
  display: flex; align-items: center; gap: 10px;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer; transition: all 0.14s;

  &:last-child { border-bottom: none; }
  &:hover { background: #f0f9ff; }

  .sr-texts { flex: 1; min-width: 0; }
  .sr-farm   { font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
  .sr-hayvan { font-size: 13px; font-weight: 800; color: #0f172a; }
  .sr-tip    { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; background: #e0f2fe; color: #0284c7; flex-shrink: 0; }
`;

const EmptyMsg = styled.div`
  padding: 20px 16px;
  text-align: center; color: #94a3b8; font-size: 12px;
`;

// ─── Sabitler ─────────────────────────────────────────────────────────────────
const tipRenk = {
  hastalik: '#ef4444', tedavi: '#10b981', asi: '#8b5cf6',
  muayene: '#3b82f6', ameliyat: '#f59e0b', dogum_komplikasyonu: '#ec4899',
};
const tipLabel = {
  hastalik: 'Hastalık', tedavi: 'Tedavi', asi: 'Aşı',
  muayene: 'Muayene', ameliyat: 'Ameliyat', dogum_komplikasyonu: 'Doğum',
};
const hayvanLabel = { inek: 'İnek', buzagi: 'Buzağı', duve: 'Düve', tosun: 'Tosun' };

const QUICK_LINKS = [
  { path: '/hastalar', icon: '🏡', title: 'Hastalar', desc: 'Çiftlikler & hayvanlar', border: '#bfdbfe', bg: '#eff6ff', hBorder: '#2563eb', hBg: '#eff6ff' },
  { path: '/finans',   icon: '🧾', title: 'Fatura & Tahsilat', desc: 'Cari hesap & tahsilat', border: '#a7f3d0', bg: '#f0fdf4', hBorder: '#059669', hBg: '#f0fdf4' },
  { path: '/receteler',icon: '💊', title: 'Reçete & Stok', desc: 'İlaç & tohum stoğu', border: '#ddd6fe', bg: '#f5f3ff', hBorder: '#7c3aed', hBg: '#f5f3ff' },
  { path: '/takvim',   icon: '📅', title: 'Takvim', desc: 'Randevu & planlama', border: '#fed7aa', bg: '#fff7ed', hBorder: '#ea580c', hBg: '#fff7ed' },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function VeterinerDashboard({ kullanici }) {
  const [ozet, setOzet] = useState(null);
  const [musteriler, setMusteriler] = useState([]);
  const [sonSaglik, setSonSaglik] = useState([]);
  const [saglikSkorlar, setSaglikSkorlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kupeArama, setKupeArama] = useState('');
  const [kupeSonuc, setKupeSonuc] = useState([]);
  const [kupeLoading, setKupeLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getVeterinerOzet(),
      api.getVeterinerMusteriler(),
      api.getVeterinerSonSaglikKayitlari(),
      api.getVeterinerSaglikSkoru(),
    ])
      .then(([oRes, mRes, sRes, skRes]) => {
        setOzet(oRes.data || null);
        setMusteriler(mRes.data || []);
        setSonSaglik(sRes.data || []);
        setSaglikSkorlar(skRes.data || []);
      })
      .catch(() => {
        setOzet(null);
        setMusteriler([]);
        setSonSaglik([]);
        setSaglikSkorlar([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleKupeAra = async (e) => {
    e.preventDefault();
    const q = kupeArama.trim();
    if (!q || q.length < 2) { toast.warning('En az 2 karakter girin.'); return; }
    setKupeLoading(true);
    setKupeSonuc([]);
    try {
      const res = await api.getVeterinerHayvanAra(q);
      const list = res.data || [];
      if (list.length === 1) { navigate(`/hastalar/${list[0].ciftciId}`); return; }
      setKupeSonuc(list);
      if (list.length === 0) toast.info('Bu küpe numarasına ait hayvan bulunamadı.');
    } catch {
      toast.error('Arama yapılamadı.');
    } finally {
      setKupeLoading(false);
    }
  };

  const now = new Date();
  const tarih = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const gun = now.toLocaleDateString('tr-TR', { weekday: 'long' });

  // Riskli çiftlikler: skor düşükten yükseğe
  const riskliCiftlikler = [...saglikSkorlar]
    .sort((a, b) => a.skor - b.skor)
    .slice(0, 6);

  return (
    <Page>
      {/* ─── Hero Bar ─── */}
      <HeroBar>
        <DoctorBlock>
          <div className="dr-label">Veteriner Paneli</div>
          <div className="dr-name">Dr. {kullanici?.isim || '—'}</div>
          <div className="dr-sub">{kullanici?.klinikAdi || 'Serbest Veteriner Hekim'}</div>
        </DoctorBlock>

        <HeroDivider />

        <SearchBlock>
          <SearchForm onSubmit={handleKupeAra}>
            <input
              type="text"
              value={kupeArama}
              onChange={e => setKupeArama(e.target.value)}
              placeholder="🔍  Küpe no ile hayvan ara… (örn. TR-123)"
            />
            <button type="submit" disabled={kupeLoading || !kupeArama.trim()}>
              {kupeLoading ? 'Aranıyor…' : 'Ara'}
            </button>
          </SearchForm>
        </SearchBlock>

        <DateBlock>
          <div className="date">{tarih}</div>
          <div className="day">{gun}</div>
        </DateBlock>
      </HeroBar>

      {/* ─── İstatistikler ─── */}
      <StatsRow>
        <StatCard $primary>
          <div className="sc-icon">🏡</div>
          <div className="sc-texts">
            <div className="sc-val">{loading ? '–' : (ozet?.musteriSayisi ?? 0)}</div>
            <div className="sc-lbl">Kayıtlı çiftlik</div>
          </div>
        </StatCard>
        <StatCard $iconBg="#e0f2fe" $valColor="#0369a1">
          <div className="sc-icon">🐄</div>
          <div className="sc-texts">
            <div className="sc-val">{loading ? '–' : (ozet?.toplamHayvan ?? 0)}</div>
            <div className="sc-lbl">Toplam hayvan</div>
          </div>
        </StatCard>
        <StatCard $iconBg="#dcfce7" $valColor="#15803d">
          <div className="sc-icon">📋</div>
          <div className="sc-texts">
            <div className="sc-val">{loading ? '–' : (ozet?.buAySaglikKaydi ?? 0)}</div>
            <div className="sc-lbl">Bu ay kayıt</div>
          </div>
        </StatCard>
        <StatCard $iconBg="#fef9c3" $valColor="#92400e">
          <div className="sc-icon">💊</div>
          <div className="sc-texts">
            <div className="sc-val">{loading ? '–' : (ozet?.devamEdenTedavi ?? 0)}</div>
            <div className="sc-lbl">Devam eden tedavi</div>
          </div>
        </StatCard>
      </StatsRow>

      {/* ─── Ana İçerik ─── */}
      <MainBody>
        {/* Sol: Çiftlikler + Kayıtlar */}
        <LeftGrid>
          {/* Çiftlikler / Arama sonucu */}
          <Panel>
            <PanelHead>
              <h3>🏡 Çiftlikler</h3>
              <span className="count">{musteriler.length}</span>
            </PanelHead>
            <PanelScroll>
              {kupeSonuc.length > 1 ? (
                kupeSonuc.map((r, i) => (
                  <SearchResRow
                    key={`${r.ciftciId}-${i}`}
                    onClick={() => navigate(`/hastalar/${r.ciftciId}`)}
                  >
                    <div className="sr-texts">
                      <div className="sr-farm">{r.ciftlikAdi || r.ciftciIsim}</div>
                      <div className="sr-hayvan">{r.hayvan?.kupeNo || r.hayvan?.isim || '–'}</div>
                    </div>
                    <span className="sr-tip">{hayvanLabel[r.tip] || r.tip}</span>
                  </SearchResRow>
                ))
              ) : loading ? (
                <EmptyMsg>Yükleniyor…</EmptyMsg>
              ) : musteriler.length === 0 ? (
                <EmptyMsg>Henüz çiftlik yok. Hastalar sayfasından ekleyin.</EmptyMsg>
              ) : (
                musteriler.slice(0, 12).map(m => (
                  <FarmRow key={m._id} onClick={() => navigate(`/hastalar/${m._id}`)}>
                    <div className="fa-av">
                      {(m.isletmeAdi || m.isim || 'Ç')[0].toUpperCase()}
                    </div>
                    <div className="fa-info">
                      <div className="fa-name">{m.isletmeAdi || m.isim || 'İsimsiz çiftlik'}</div>
                      <div className="fa-sub">{m.isim}{m.sehir ? ` · ${m.sehir}` : ''}</div>
                    </div>
                    <span className="fa-arr">›</span>
                  </FarmRow>
                ))
              )}
            </PanelScroll>
          </Panel>

          {/* Son sağlık kayıtları */}
          <Panel>
            <PanelHead>
              <h3>📋 Son Kayıtlar</h3>
              <span className="count">{sonSaglik.length}</span>
            </PanelHead>
            <PanelScroll>
              {loading ? (
                <EmptyMsg>Yükleniyor…</EmptyMsg>
              ) : sonSaglik.length === 0 ? (
                <EmptyMsg>Henüz sağlık kaydı yok.</EmptyMsg>
              ) : (
                sonSaglik.slice(0, 15).map(k => (
                  <RecRow
                    key={k._id}
                    $col={tipRenk[k.tip] || '#3b82f6'}
                    onClick={() => k.userId?._id && navigate(`/hastalar/${k.userId._id}`)}
                  >
                    <div className="rc-dot" />
                    <div className="rc-info">
                      <div className="rc-l1">
                        {k.userId?.isletmeAdi || k.userId?.isim || 'Çiftlik'} · {k.hayvanIsim || k.hayvanKupeNo || 'Hayvan'}
                      </div>
                      <div className="rc-l2">
                        {tipLabel[k.tip] || k.tip} — {k.tani}
                      </div>
                    </div>
                    <span className="rc-date">
                      {k.tarih ? new Date(k.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : ''}
                    </span>
                  </RecRow>
                ))
              )}
            </PanelScroll>
          </Panel>
        </LeftGrid>

        {/* Sağ Kolon */}
        <RightCol>
          {/* Hızlı Geçiş */}
          <Panel style={{ flexShrink: 0 }}>
            <PanelHead>
              <h3>⚡ Hızlı Geçiş</h3>
            </PanelHead>
            <QuickGrid>
              {QUICK_LINKS.map(({ path, icon, title, desc, border, bg, hBorder, hBg }) => (
                <QuickBtn
                  key={path}
                  type="button"
                  $border={border} $bg={bg} $hBorder={hBorder} $hBg={hBg}
                  onClick={() => navigate(path)}
                >
                  <span className="qb-icon">{icon}</span>
                  <span className="qb-title">{title}</span>
                  <span className="qb-desc">{desc}</span>
                </QuickBtn>
              ))}
            </QuickGrid>
          </Panel>

          {/* En Riskli Çiftlikler */}
          <Panel style={{ flex: 1, minHeight: 0 }}>
            <PanelHead>
              <h3>⚠️ Riskli Çiftlikler</h3>
              <span className="count">{riskliCiftlikler.length}</span>
            </PanelHead>
            <PanelScroll>
              {loading ? (
                <EmptyMsg>Yükleniyor…</EmptyMsg>
              ) : riskliCiftlikler.length === 0 ? (
                <EmptyMsg>Risk skoru verisi yok.</EmptyMsg>
              ) : (
                riskliCiftlikler.map(s => (
                  <RiskRow
                    key={s.ciftciId}
                    $s={s.skor}
                    onClick={() => navigate(`/hastalar/${s.ciftciId}`)}
                  >
                    <div className="rk-info">
                      <div className="rk-name">{s.isletmeAdi || s.isim || 'Çiftlik'}</div>
                      <div className="rk-sub">
                        {s.devamEdenTedavi > 0 && `${s.devamEdenTedavi} tedavi`}
                        {s.devamEdenTedavi > 0 && s.gecikmisAsiSayisi > 0 && ' · '}
                        {s.gecikmisAsiSayisi > 0 && `${s.gecikmisAsiSayisi} gecikmiş aşı`}
                        {!s.devamEdenTedavi && !s.gecikmisAsiSayisi && 'Normal'}
                      </div>
                    </div>
                    <span className="rk-badge">{s.skor}/100</span>
                  </RiskRow>
                ))
              )}
            </PanelScroll>
          </Panel>
        </RightCol>
      </MainBody>
    </Page>
  );
}
