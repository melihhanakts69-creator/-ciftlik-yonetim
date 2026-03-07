import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;

const DashboardContainer = styled.div`
  animation: ${fadeIn} 0.4s ease;
  font-family: 'Inter', sans-serif;
  color: #333;
`;

const WelcomeBanner = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px 30px;
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 5px solid #2196F3;
`;

const WelcomeInfo = styled.div`
  h1 { font-size: 24px; font-weight: 700; color: #2c3e50; margin: 0 0 8px; }
  p { color: #7f8c8d; font-size: 15px; margin: 0; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 10px; background: rgba(33, 150, 243, 0.1); color: #2196F3; }
`;

const WelcomeImage = styled.div`
  font-size: 48px;
  opacity: 0.8;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.2s;
  &:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }

  .icon-wrapper {
    width: 50px; height: 50px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; font-size: 24px;
    background: ${p => p.$bg || '#f1f5f9'}; color: ${p => p.$color || '#64748b'};
  }
  .info { flex: 1; display: flex; flex-direction: column; }
  .val { font-size: 24px; font-weight: 800; color: #2c3e50; line-height: 1.2; }
  .lbl { font-size: 13px; color: #95a5a6; font-weight: 500; margin-top: 2px; }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  
  h3 { font-size: 16px; font-weight: 700; color: #2c3e50; margin: 0 0 20px 0; border-bottom: 1px solid #eee; padding-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
  .badge-h { background: #E3F2FD; color: #1976D2; font-size: 11px; padding: 4px 8px; border-radius: 12px; }
`;

const UnapprovedAlert = styled.div`
  background: #FFF3E0; border: 1px solid #FFE0B2; border-radius: 8px;
  padding: 16px; margin-bottom: 20px; color: #E65100;
  display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 500;
`;

const QuickFarmCard = styled.div`
  padding: 14px 16px; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 10px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  cursor: pointer; transition: all 0.2s; background: #fff;
  &:hover { border-color: #2196F3; background: #f8fafc; box-shadow: 0 2px 8px rgba(33,150,243,0.08); }
  .farm-name { font-weight: 700; color: #2c3e50; font-size: 14px; }
  .farm-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
  .arrow { color: #94a3b8; font-size: 18px; }
`;

const CtaButton = styled.button`
  width: 100%; padding: 16px 24px; border-radius: 12px; border: 2px dashed #2196F3;
  background: rgba(33,150,243,0.06); color: #1976D2; font-size: 15px; font-weight: 700;
  cursor: pointer; transition: all 0.2s; margin-top: 8px;
  &:hover { background: rgba(33,150,243,0.12); border-color: #1976D2; }
`;

const SonKayitItem = styled.div`
  padding: 10px 12px; border-radius: 8px; margin-bottom: 8px; background: #f8fafc;
  border-left: 3px solid #2196F3; cursor: pointer; transition: background 0.2s;
  &:hover { background: #f1f5f9; }
  .row1 { font-size: 13px; font-weight: 600; color: #1e293b; }
  .row2 { font-size: 12px; color: #64748b; margin-top: 2px; }
`;

export default function VeterinerDashboard({ kullanici }) {
  const isApproved = kullanici?.onaylandi;
  const [musteriler, setMusteriler] = useState([]);
  const [sonSaglik, setSonSaglik] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.getVeterinerMusteriler(),
      api.getVeterinerSonSaglikKayitlari()
    ])
      .then(([mRes, sRes]) => {
        if (!cancelled) {
          setMusteriler(mRes.data || []);
          setSonSaglik(sRes.data || []);
        }
      })
      .catch(() => { if (!cancelled) setMusteriler([]); setSonSaglik([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const sonCiftlikler = musteriler.slice(0, 5);
  const tipEtiket = { hastalik: 'Hastalık', tedavi: 'Tedavi', asi: 'Aşı', muayene: 'Muayene', ameliyat: 'Ameliyat', dogum_komplikasyonu: 'Doğum' };

  return (
    <DashboardContainer>

      {!isApproved && (
        <UnapprovedAlert>
          <span style={{ fontSize: 20 }}>🔒</span>
          <div>
            <strong>Hesabınız Onay Bekliyor.</strong> Sisteme tam erişim sağlamak ve reçete/teşhis işlemlerine başlamak için yönetici onayını bekleyiniz.
          </div>
        </UnapprovedAlert>
      )}

      <WelcomeBanner>
        <WelcomeInfo>
          <h1>Hoş Geldiniz, Dr. {kullanici?.isim?.split(' ')[0] || ''}</h1>
          <p>
            {loading ? 'Yükleniyor...' : (
              <>Kayıtlı <strong>{musteriler.length}</strong> çiftliğiniz var. Birine tıklayıp hayvan varlığına ve sağlık kaydı eklemeye gidebilirsiniz.</>
            )}
          </p>
          <span className="badge">{kullanici?.klinikAdi || 'Serbest Veteriner'}</span>
        </WelcomeInfo>
        <WelcomeImage>🩺</WelcomeImage>
      </WelcomeBanner>

      <StatGrid>
        <StatCard $bg="#E3F2FD" $color="#1976D2">
          <div className="icon-wrapper">🐄</div>
          <div className="info">
            <span className="val">{loading ? '–' : musteriler.length}</span>
            <span className="lbl">Kayıtlı Çiftlik</span>
          </div>
        </StatCard>
        <StatCard $bg="#E8F5E9" $color="#388E3C">
          <div className="icon-wrapper">📋</div>
          <div className="info">
            <span className="val">Hastalar</span>
            <span className="lbl">Çiftliklere git →</span>
          </div>
        </StatCard>
        <StatCard $bg="#F3E5F5" $color="#7B1FA2">
          <div className="icon-wrapper">💊</div>
          <div className="info">
            <span className="val">Reçete & Stok</span>
            <span className="lbl">Klinik stokları</span>
          </div>
        </StatCard>
      </StatGrid>

      <MainGrid>
        <Card>
          <h3>Hızlı erişim – Çiftliklerim</h3>
          {loading ? (
            <p style={{ color: '#64748b' }}>Yükleniyor...</p>
          ) : sonCiftlikler.length === 0 ? (
            <p style={{ color: '#64748b', marginBottom: 12 }}>Henüz çiftlik eklemediniz. Çiftlik kodu veya ID ile Hastalar sayfasından ekleyin.</p>
          ) : (
            <>
              {sonCiftlikler.map(m => (
                <QuickFarmCard key={m._id} onClick={() => navigate(`/musteri-detay/${m._id}`)}>
                  <div>
                    <div className="farm-name">{m.isletmeAdi || m.isim || 'İsimsiz'}</div>
                    <div className="farm-sub">Çiftçi: {m.isim} · Hayvanlara git</div>
                  </div>
                  <span className="arrow">→</span>
                </QuickFarmCard>
              ))}
            </>
          )}
          <CtaButton onClick={() => navigate('/hastalar')}>
            Tüm çiftlikler / Yeni çiftlik ekle
          </CtaButton>
        </Card>

        <Card>
          <h3>Kısayollar</h3>
          <QuickFarmCard onClick={() => navigate('/hastalar')}>
            <div>
              <div className="farm-name">Hastalar</div>
              <div className="farm-sub">Çiftlik ekle, listele</div>
            </div>
            <span className="arrow">→</span>
          </QuickFarmCard>
          <QuickFarmCard onClick={() => navigate('/receteler')}>
            <div>
              <div className="farm-name">Reçete & Stok</div>
              <div className="farm-sub">İlaç, tohum stoğu</div>
            </div>
            <span className="arrow">→</span>
          </QuickFarmCard>
          <QuickFarmCard onClick={() => navigate('/takvim')}>
            <div>
              <div className="farm-name">Takvim</div>
              <div className="farm-sub">Planlama</div>
            </div>
            <span className="arrow">→</span>
          </QuickFarmCard>
        </Card>
      </MainGrid>

      {sonSaglik.length > 0 && (
        <Card style={{ marginTop: 24 }}>
          <h3>Son sağlık kayıtları</h3>
          {sonSaglik.slice(0, 8).map(k => (
            <SonKayitItem key={k._id} onClick={() => k.userId?._id && navigate(`/musteri-detay/${k.userId._id}`)}>
              <div className="row1">{k.userId?.isletmeAdi || k.userId?.isim || 'Çiftlik'} · {k.hayvanIsim || k.hayvanKupeNo || 'Hayvan'}</div>
              <div className="row2">{tipEtiket[k.tip] || k.tip} – {k.tani} · {k.tarih ? new Date(k.tarih).toLocaleDateString('tr-TR') : ''}</div>
            </SonKayitItem>
          ))}
        </Card>
      )}

    </DashboardContainer>
  );
}
