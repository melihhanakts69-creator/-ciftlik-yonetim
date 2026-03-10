import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

// ─── Animations ────────────────────────────────────────────────
const fadeIn = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); }`;
const pulseRed = keyframes`0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 70% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }`;
const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

// ─── Urgency Config ─────────────────────────────────────────────
const URGENCY = {
  overdue:  { bg: '#fef2f2', border: '#fca5a5', accent: '#dc2626', label: 'GECİKMİŞ!',   pill: '#dc2626', pillText: '#fff' },
  critical: { bg: '#fff7ed', border: '#fdba74', accent: '#ea580c', label: 'YAKINDA!',    pill: '#ea580c', pillText: '#fff' },
  warning:  { bg: '#fefce8', border: '#fde047', accent: '#ca8a04', label: 'Yaklaşıyor', pill: '#eab308', pillText: '#fff' },
  soon:     { bg: '#f0fdf4', border: '#86efac', accent: '#16a34a', label: 'Bu Ay',       pill: '#16a34a', pillText: '#fff' },
  normal:   { bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb', label: 'Planlı',      pill: '#2563eb', pillText: '#fff' },
};

const getUrgency = (kalanGun) => {
  if (kalanGun < 0)   return 'overdue';
  if (kalanGun <= 7)  return 'critical';
  if (kalanGun <= 14) return 'warning';
  if (kalanGun <= 30) return 'soon';
  return 'normal';
};

const GESTATION_DAYS = 283; // İnek/düve gebelik süresi

// ─── Helpers ────────────────────────────────────────────────────
const calcTahminiDogum = (tohumlamaTarihi) => {
  if (!tohumlamaTarihi) return null;
  return new Date(new Date(tohumlamaTarihi).getTime() + GESTATION_DAYS * 86400000);
};

const calcKalanGun = (tahminiDogum) => {
  if (!tahminiDogum) return null;
  return Math.round((tahminiDogum - new Date()) / 86400000);
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const calcProgress = (tohumlamaTarihi) => {
  if (!tohumlamaTarihi) return 0;
  const gecen = Math.round((new Date() - new Date(tohumlamaTarihi)) / 86400000);
  return Math.min(100, Math.max(0, (gecen / GESTATION_DAYS) * 100));
};

// ─── Styled Components ──────────────────────────────────────────
const Panel = styled.div`
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.05);
  overflow: hidden;
  animation: ${fadeIn} 0.4s ease;
`;

const PanelHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(to right, #fafafa, #fff);

  .left { display: flex; align-items: center; gap: 10px; }
  .icon { font-size: 22px; }
  .title { font-size: 15px; font-weight: 800; color: #0f172a; }
  .subtitle { font-size: 12px; color: #94a3b8; margin-top: 1px; }

  .right { display: flex; align-items: center; gap: 8px; }
`;

const CountBadge = styled.span`
  background: ${p => p.$urgent ? '#fee2e2' : '#f1f5f9'};
  color: ${p => p.$urgent ? '#b91c1c' : '#475569'};
  font-size: 12px; font-weight: 800;
  padding: 4px 10px; border-radius: 20px;
  border: 1px solid ${p => p.$urgent ? '#fecaca' : '#e2e8f0'};
  ${p => p.$urgent && css`animation: ${pulseRed} 2s infinite;`}
`;

const TabRow = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 1px solid #f1f5f9;
`;

const Tab = styled.button`
  flex: 1; padding: 10px 16px;
  border: none; background: none; cursor: pointer;
  font-size: 13px; font-weight: 600;
  color: ${p => p.$active ? '#2563eb' : '#94a3b8'};
  border-bottom: 2px solid ${p => p.$active ? '#2563eb' : 'transparent'};
  transition: all 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  &:hover { color: ${p => p.$active ? '#2563eb' : '#475569'}; }
`;

const CardList = styled.div`
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 420px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: #f8fafc; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
`;

const Card = styled.div`
  padding: 14px 16px;
  border-radius: 12px;
  border: 1.5px solid ${p => URGENCY[p.$urgency].border};
  background: ${p => URGENCY[p.$urgency].bg};
  cursor: pointer;
  transition: all 0.2s;
  ${p => (p.$urgency === 'critical' || p.$urgency === 'overdue') && css`
    animation: ${pulseRed} 3s infinite;
  `}

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
`;

const AnimalName = styled.div`
  font-size: 14px; font-weight: 800; color: #0f172a;
  margin-bottom: 3px;
`;

const AnimalMeta = styled.div`
  font-size: 12px; color: #64748b; font-weight: 500;
`;

const CountdownPill = styled.div`
  background: ${p => URGENCY[p.$urgency].pill};
  color: ${p => URGENCY[p.$urgency].pillText};
  font-size: 13px; font-weight: 900;
  padding: 5px 12px; border-radius: 20px;
  white-space: nowrap; flex-shrink: 0;
  text-align: center;

  .days { font-size: 18px; line-height: 1; }
  .label { font-size: 10px; letter-spacing: 0.04em; opacity: 0.9; }
`;

const ProgressWrap = styled.div`
  margin: 8px 0;
`;

const ProgressBar = styled.div`
  height: 5px; border-radius: 4px;
  background: rgba(0,0,0,0.07);
  overflow: hidden;

  .fill {
    height: 100%;
    width: ${p => p.$pct}%;
    background: ${p => URGENCY[p.$urgency].accent};
    border-radius: 4px;
    transition: width 0.4s ease;
  }
`;

const ProgressLabel = styled.div`
  display: flex; justify-content: space-between;
  font-size: 10px; color: #94a3b8; font-weight: 600;
  margin-top: 4px;
`;

const CardBottom = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 6px;
`;

const DateInfo = styled.div`
  font-size: 11px; color: #475569; font-weight: 600;
`;

const UrgencyTag = styled.span`
  font-size: 10px; font-weight: 800;
  color: ${p => URGENCY[p.$urgency].accent};
  text-transform: uppercase; letter-spacing: 0.06em;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 36px 20px;
  color: #94a3b8;

  .em-icon { font-size: 40px; margin-bottom: 10px; }
  .em-title { font-size: 14px; font-weight: 700; color: #64748b; margin-bottom: 4px; }
  .em-sub { font-size: 12px; }
`;

const SkeletonLine = styled.div`
  height: ${p => p.$h || 16}px;
  width: ${p => p.$w || '100%'};
  border-radius: 6px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 400px 100%;
  animation: ${shimmer} 1.4s infinite;
  margin-bottom: ${p => p.$mb || 0}px;
`;

const SkeletonCard = () => (
  <div style={{ padding: '14px 16px', borderRadius: 12, border: '1.5px solid #f1f5f9', background: '#fafafa' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{ flex: 1 }}>
        <SkeletonLine $h={14} $w="60%" $mb={6} />
        <SkeletonLine $h={11} $w="40%" />
      </div>
      <SkeletonLine $h={36} $w={60} />
    </div>
    <SkeletonLine $h={5} $mb={8} />
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <SkeletonLine $h={11} $w="45%" />
      <SkeletonLine $h={11} $w="20%" />
    </div>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────
function YaklasanDogumlar({ compact = false }) {
  const navigate = useNavigate();
  const [inekler, setInekler] = useState([]);
  const [duveler, setDuveler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [activeTab, setActiveTab] = useState('hepsi');

  useEffect(() => {
    yuklе();
  }, []);

  const yuklе = async () => {
    setYukleniyor(true);
    try {
      const [inekRes, duveRes] = await Promise.allSettled([
        api.getInekler(),
        api.getDuveler(),
      ]);
      const inekData = inekRes.status === 'fulfilled'
        ? (Array.isArray(inekRes.value?.data) ? inekRes.value.data : [])
        : [];
      const duveData = duveRes.status === 'fulfilled'
        ? (Array.isArray(duveRes.value?.data) ? duveRes.value.data : [])
        : [];

      setInekler(inekData);
      setDuveler(duveData);
    } catch (_) {}
    finally { setYukleniyor(false); }
  };

  // ─── Hesapla ─────────────────────────────────────────────────
  const gebeInekler = useMemo(() =>
    inekler
      .filter(h => h.gebelikDurumu === 'Gebe' && h.tohumlamaTarihi)
      .map(h => {
        const tahminiDogum = calcTahminiDogum(h.tohumlamaTarihi);
        const kalanGun     = calcKalanGun(tahminiDogum);
        const pct          = calcProgress(h.tohumlamaTarihi);
        const urgency      = getUrgency(kalanGun);
        return { ...h, tahminiDogum, kalanGun, pct, urgency, tip: 'inek' };
      })
      .sort((a, b) => a.kalanGun - b.kalanGun),
  [inekler]);

  const gebeDuveler = useMemo(() =>
    duveler
      .filter(h => h.gebelikDurumu === 'Gebe' && h.tohumlamaTarihi)
      .map(h => {
        const tahminiDogum = calcTahminiDogum(h.tohumlamaTarihi);
        const kalanGun     = calcKalanGun(tahminiDogum);
        const pct          = calcProgress(h.tohumlamaTarihi);
        const urgency      = getUrgency(kalanGun);
        return { ...h, tahminiDogum, kalanGun, pct, urgency, tip: 'duve' };
      })
      .sort((a, b) => a.kalanGun - b.kalanGun),
  [duveler]);

  const allGebe = useMemo(() =>
    [...gebeInekler, ...gebeDuveler].sort((a, b) => a.kalanGun - b.kalanGun),
  [gebeInekler, gebeDuveler]);

  const displayed = activeTab === 'hepsi' ? allGebe
    : activeTab === 'inek' ? gebeInekler
    : gebeDuveler;

  const urgentCount = allGebe.filter(h => h.kalanGun <= 7).length;

  const handleCardClick = (h) => {
    if (h.tip === 'inek') navigate(`/inekler/${h._id}`);
    else navigate(`/duveler/${h._id}`);
  };

  const formatKalanGun = (kalanGun) => {
    if (kalanGun < 0) return `${Math.abs(kalanGun)}g gecikti`;
    if (kalanGun === 0) return 'Bugün!';
    if (kalanGun === 1) return 'Yarın';
    return `${kalanGun} gün`;
  };

  return (
    <Panel>
      <PanelHead>
        <div className="left">
          <span className="icon">🤰</span>
          <div>
            <div className="title">Yaklaşan Doğumlar</div>
            <div className="subtitle">{GESTATION_DAYS} günlük gebelik hesabına göre</div>
          </div>
        </div>
        <div className="right">
          {urgentCount > 0 && (
            <CountBadge $urgent>⚠️ {urgentCount} acil</CountBadge>
          )}
          {allGebe.length > 0 && (
            <CountBadge>{allGebe.length} gebe hayvan</CountBadge>
          )}
        </div>
      </PanelHead>

      {allGebe.length > 0 && (
        <TabRow>
          <Tab $active={activeTab === 'hepsi'} onClick={() => setActiveTab('hepsi')}>
            Tümü <span style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 7px', borderRadius: 10, fontWeight: 700 }}>{allGebe.length}</span>
          </Tab>
          <Tab $active={activeTab === 'inek'} onClick={() => setActiveTab('inek')}>
            🐄 İnekler
            {gebeInekler.length > 0 && <span style={{ fontSize: 11, background: '#eff6ff', color: '#2563eb', padding: '2px 7px', borderRadius: 10, fontWeight: 700 }}>{gebeInekler.length}</span>}
          </Tab>
          <Tab $active={activeTab === 'duve'} onClick={() => setActiveTab('duve')}>
            🐄 Düveler
            {gebeDuveler.length > 0 && <span style={{ fontSize: 11, background: '#f0fdf4', color: '#16a34a', padding: '2px 7px', borderRadius: 10, fontWeight: 700 }}>{gebeDuveler.length}</span>}
          </Tab>
        </TabRow>
      )}

      <CardList>
        {yukleniyor ? (
          [1, 2, 3].map(i => <SkeletonCard key={i} />)
        ) : displayed.length === 0 ? (
          <EmptyState>
            <div className="em-icon">✅</div>
            <div className="em-title">
              {allGebe.length === 0
                ? 'Şu an gebe hayvan bulunmuyor'
                : activeTab === 'inek' ? 'Gebe inek yok' : 'Gebe düve yok'}
            </div>
            <div className="em-sub">
              {allGebe.length === 0
                ? 'Tohumlama kaydı girildiğinde burada görünür.'
                : 'Diğer sekmeyi kontrol edin.'}
            </div>
          </EmptyState>
        ) : (
          displayed.map(h => {
            const cfg = URGENCY[h.urgency];
            return (
              <Card key={h._id} $urgency={h.urgency} onClick={() => handleCardClick(h)}>
                <CardTop>
                  <div>
                    <AnimalName>
                      {h.tip === 'inek' ? '🐄' : '🐄'}{' '}
                      {h.isim || 'İsimsiz'}{' '}
                      <span style={{ fontWeight: 600, color: '#64748b', fontSize: 13 }}>
                        #{h.kupeNo}
                      </span>
                    </AnimalName>
                    <AnimalMeta>
                      {h.tip === 'inek' ? 'İnek' : 'Düve'} · Tohumlama: {fmtDate(h.tohumlamaTarihi)}
                    </AnimalMeta>
                  </div>
                  <CountdownPill $urgency={h.urgency}>
                    <div className="days">
                      {h.kalanGun < 0 ? `+${Math.abs(h.kalanGun)}` : h.kalanGun === 0 ? '🔴' : h.kalanGun}
                    </div>
                    <div className="label">
                      {h.kalanGun < 0 ? 'GÜN GEÇTİ' : h.kalanGun === 0 ? 'BUGÜN' : 'GÜN KALDI'}
                    </div>
                  </CountdownPill>
                </CardTop>

                <ProgressWrap>
                  <ProgressBar $urgency={h.urgency} $pct={h.pct}>
                    <div className="fill" />
                  </ProgressBar>
                  <ProgressLabel>
                    <span>Tohumlama</span>
                    <span style={{ color: cfg.accent, fontWeight: 700 }}>%{Math.round(h.pct)} tamamlandı</span>
                    <span>Doğum</span>
                  </ProgressLabel>
                </ProgressWrap>

                <CardBottom>
                  <DateInfo>
                    📅 Tahmini: <strong>{fmtDate(h.tahminiDogum)}</strong>
                  </DateInfo>
                  <UrgencyTag $urgency={h.urgency}>{cfg.label}</UrgencyTag>
                </CardBottom>
              </Card>
            );
          })
        )}
      </CardList>
    </Panel>
  );
}

export default YaklasanDogumlar;
