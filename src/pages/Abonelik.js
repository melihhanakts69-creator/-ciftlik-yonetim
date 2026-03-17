import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import * as api from '../services/api';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;
const Page = styled.div`animation: ${fadeIn} 0.4s ease; font-family: 'Inter', sans-serif; color: #2c3e50; max-width: 900px; margin: 0 auto;`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px; padding: 28px 32px; margin-bottom: 32px; color: white; text-align: center;
  h1 { margin: 0 0 8px; font-size: 26px; font-weight: 800; }
  p { margin: 0; color: rgba(255,255,255,0.6); font-size: 14px; }
`;

const PlanGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 32px;
`;
const PlanCard = styled.div`
  background: white; border-radius: 16px; padding: 28px; box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  border: 2px solid ${p => p.$aktif ? '#16a34a' : '#e2e8f0'};
  position: relative; transition: all 0.2s;
  &:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
`;
const PlanBadge = styled.div`
  position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
  background: #16a34a; color: white; padding: 4px 16px; border-radius: 20px;
  font-size: 11px; font-weight: 800; text-transform: uppercase;
`;
const PlanName = styled.div`font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 4px;`;
const PlanFiyat = styled.div`
  font-size: 36px; font-weight: 900; color: #16a34a; line-height: 1;
  span { font-size: 14px; font-weight: 500; color: #94a3b8; }
`;
const PlanAciklama = styled.p`font-size: 13px; color: #64748b; line-height: 1.6; margin: 12px 0 20px;`;
const PlanBtn = styled.button`
  width: 100%; padding: 13px; border: none; border-radius: 10px; cursor: pointer;
  font-size: 14px; font-weight: 700; transition: all 0.2s;
  background: ${p => p.$aktif ? '#16a34a' : '#f1f5f9'};
  color: ${p => p.$aktif ? 'white' : '#475569'};
  &:hover { background: ${p => p.$aktif ? '#43a047' : '#e2e8f0'}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const MevcutPlanCard = styled.div`
  background: white; border-radius: 16px; padding: 28px 32px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04); margin-bottom: 28px;
  display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;
`;
const PlanInfo = styled.div`
  .label { font-size: 12px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
  .val { font-size: 22px; font-weight: 800; color: #1e293b; }
  .sub { font-size: 13px; color: #64748b; margin-top: 2px; }
`;
const StatusBadge = styled.div`
  padding: 8px 18px; border-radius: 20px; font-size: 13px; font-weight: 700;
  background: ${p => p.$aktif ? '#dcfce7' : '#fee2e2'};
  color: ${p => p.$aktif ? '#166534' : '#991b1b'};
`;
const TrialBar = styled.div`
  margin-top: 12px;
  .bar-bg { width: 100%; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; margin-top: 6px; }
  .bar-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease;
    background: ${p => p.$yuzde > 50 ? '#22c55e' : p.$yuzde > 20 ? '#f59e0b' : '#ef4444'}; }
  .label { font-size: 12px; color: #64748b; }
`;

const AlertBox = styled.div`
  background: ${p => p.$err ? '#fee2e2' : p.$ok ? '#dcfce7' : '#fef3c7'};
  border: 1px solid ${p => p.$err ? '#fecaca' : p.$ok ? '#bbf7d0' : '#fde68a'};
  color: ${p => p.$err ? '#dc2626' : p.$ok ? '#166534' : '#d97706'};
  border-radius: 10px; padding: 12px 16px; font-size: 13px; font-weight: 600;
  margin-bottom: 20px;
`;

const PLAN_EMOJIS = { pro: '🐄', vet_pro: '🩺', isletme: '🏢', free: '🆓', trial: '⏳' };
const PLAN_ADLARI = { pro: 'Çiftçi Pro', vet_pro: 'Veteriner Pro', isletme: 'İşletme', free: 'Ücretsiz', trial: 'Deneme' };

export default function Abonelik() {
  const [abonelik, setAbonelik] = useState(null);
  const [planlar, setPlanlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aktifIslm, setAktifIslm] = useState(null);
  const [mesaj, setMesaj] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const rol = user.rol || 'ciftci';

  useEffect(() => {
    Promise.all([
      api.getAbonelik().catch(() => ({ data: null })),
      api.getPlanlar().catch(() => ({ data: [] }))
    ]).then(([ab, pl]) => {
      setAbonelik(ab.data);
      const filtrelenenPlanlar = (pl.data || []).filter(p => p.roller?.includes(rol));
      setPlanlar(filtrelenenPlanlar);
    }).finally(() => setLoading(false));
  }, []);

  const handlePlanSec = async (planKey) => {
    setAktifIslm(planKey);
    setMesaj(null);
    try {
      const res = await api.createCheckout({ planKey });
      if (res.data.mod === 'demo') {
        // Demo ortamı — direkt aktive et
        const aktivRes = await api.demoAktif(planKey);
        setMesaj({ type: 'ok', text: aktivRes.data.message });
        // Abonelik bilgisini güncelle
        const ab = await api.getAbonelik();
        setAbonelik(ab.data);
      } else if (res.data.checkoutFormContent) {
        // İyzico formu — embed et
        document.getElementById('iyzico-container').innerHTML = res.data.checkoutFormContent;
      }
    } catch (e) {
      setMesaj({ type: 'err', text: e.response?.data?.message || 'Ödeme başlatılamadı.' });
    } finally {
      setAktifIslm(null);
    }
  };

  if (loading) return <Page><MevcutPlanCard><PlanInfo><div className="val">Yükleniyor…</div></PlanInfo></MevcutPlanCard></Page>;

  const trialYuzde = abonelik?.trialKalanGun ? Math.round((abonelik.trialKalanGun / 14) * 100) : 0;

  return (
    <Page>
      <PageHeader>
        <h1>💳 Abonelik Yönetimi</h1>
        <p>Planınızı seçin, çiftliğinizi büyütün. İstediğiniz zaman değiştirin.</p>
      </PageHeader>

      {/* Mevcut Plan Durumu */}
      {abonelik && (
        <MevcutPlanCard>
          <PlanInfo>
            <div className="label">Mevcut Plan</div>
            <div className="val">{PLAN_EMOJIS[abonelik.plan]} {PLAN_ADLARI[abonelik.plan] || abonelik.plan}</div>
            <div className="sub">
              {abonelik.plan === 'trial' && abonelik.trialEndsAt &&
                `Deneme bitiş: ${new Date(abonelik.trialEndsAt).toLocaleDateString('tr-TR')}`}
              {['pro', 'vet_pro', 'isletme'].includes(abonelik.plan) && abonelik.planEndsAt &&
                `Plan bitiş: ${new Date(abonelik.planEndsAt).toLocaleDateString('tr-TR')}`}
            </div>
          </PlanInfo>
          <StatusBadge $aktif={abonelik.aktif}>
            {abonelik.aktif ? '✅ Aktif' : '❌ Süresi Dolmuş'}
          </StatusBadge>
        </MevcutPlanCard>
      )}

      {/* Trial kalan gün bar */}
      {abonelik?.plan === 'trial' && abonelik?.trialKalanGun > 0 && (
        <div style={{ background: 'white', borderRadius: 14, padding: '20px 24px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <TrialBar $yuzde={trialYuzde}>
            <div className="label">⏳ Deneme süreniz: <strong>{abonelik.trialKalanGun} gün</strong> kaldı</div>
            <div className="bar-bg"><div className="bar-fill" style={{ width: `${trialYuzde}%` }} /></div>
          </TrialBar>
        </div>
      )}

      {!abonelik?.aktif && (
        <AlertBox>
          ⚠️ Aboneliğiniz aktif değil. Yeni kayıt ekleyebilmek için aşağıdan bir plan seçin.
        </AlertBox>
      )}

      {mesaj && (
        <AlertBox $ok={mesaj.type === 'ok'} $err={mesaj.type === 'err'}>
          {mesaj.type === 'ok' ? '✅' : '❌'} {mesaj.text}
        </AlertBox>
      )}

      {/* Plan Kartları */}
      <PlanGrid>
        {planlar.map((plan, i) => (
          <PlanCard key={plan.key} $aktif={abonelik?.plan === plan.key}>
            {i === 0 && <PlanBadge>Popüler</PlanBadge>}
            {abonelik?.plan === plan.key && <PlanBadge style={{ background: '#3b82f6' }}>Mevcut Plan</PlanBadge>}
            <PlanName>{PLAN_EMOJIS[plan.key] || '📦'} {plan.ad}</PlanName>
            <PlanFiyat>
              {plan.fiyat} ₺ <span>/ ay</span>
            </PlanFiyat>
            <PlanAciklama>{plan.aciklama}</PlanAciklama>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, marginBottom: 16 }}>
              {[
                plan.hayvanLimiti ? `En fazla ${plan.hayvanLimiti} hayvan` : 'Sınırsız hayvan',
                'Tüm raporlar & grafikler',
                'Karlılık analizi',
                plan.key === 'vet_pro' ? 'Fatura & reçete sistemi' : 'AI danışman',
                plan.key === 'isletme' ? 'API erişimi & öncelikli destek' : 'Bildirim sistemi'
              ].map((ozellik, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: '#475569' }}>
                  <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> {ozellik}
                </div>
              ))}
            </div>
            <PlanBtn
              $aktif={abonelik?.plan !== plan.key}
              disabled={aktifIslm === plan.key || abonelik?.plan === plan.key}
              onClick={() => handlePlanSec(plan.key)}
            >
              {aktifIslm === plan.key ? 'İşleniyor…' :
               abonelik?.plan === plan.key ? '✓ Aktif Plan' :
               'Bu Planı Seç'}
            </PlanBtn>
          </PlanCard>
        ))}
      </PlanGrid>

      {/* İyzico embed alanı */}
      <div id="iyzico-container" />

      <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginTop: 16 }}>
        Tüm planlar aylık faturalandırılır. İstediğiniz zaman iptal edebilirsiniz.
        <br />Sorular için: destek@agrolina.com
      </div>
    </Page>
  );
}
