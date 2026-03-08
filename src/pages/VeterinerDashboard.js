import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); }`;

const Page = styled.div`
  animation: ${fadeIn} 0.4s ease;
  font-family: 'Inter', -apple-system, sans-serif;
  color: #1a1a1a;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;

  &::before {
    content: '';
    position: fixed;
    top: -50%; left: -50%; width: 200%; height: 200%;
    background: 
      radial-gradient(circle at 50% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 20%),
      radial-gradient(circle at 80% 60%, rgba(14, 165, 233, 0.08) 0%, transparent 20%),
      radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.08) 0%, transparent 20%);
    z-index: -1;
    pointer-events: none;
  }
`;

const Header = styled.header`
  margin-bottom: 32px;
  padding: 32px 36px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0; right: 0; width: 300px; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.05));
    border-radius: 0 24px 24px 0;
  }
  
  .title { font-size: 14px; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 6px; }
  .name { font-size: 32px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
  .meta { font-size: 15px; color: #64748b; margin-top: 8px; font-weight: 500; }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
`;

const Stat = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.06);
    background: #fff;
  }

  .value { font-size: 32px; font-weight: 800; color: #0f172a; line-height: 1.2; margin-bottom: 8px;}
  .label { font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em;}
  
  ${p => p.$highlight && `
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border-color: #bfdbfe;
    .value { color: #1d4ed8; }
    .label { color: #1e3a8a; }
    &:hover { background: linear-gradient(135deg, #e0f2fe 0%, #bfdbfe 100%); }
  `}
`;

const PrimaryAction = styled.button`
  width: 100%;
  padding: 20px 32px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 32px;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  
  &:hover { 
    transform: translateY(-2px);
    box-shadow: 0 14px 30px rgba(37, 99, 235, 0.4);
    background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  }
`;

const Section = styled.section`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.7);
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 24px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.03);
  h3 { font-size: 14px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 20px; display: flex; align-items: center; gap: 8px;}
  h3::before { content: ''; display: block; width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; }
`;

const KupeAramaForm = styled.form`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  input {
    flex: 1;
    min-width: 220px;
    padding: 14px 18px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 15px;
    background: #f8fafc;
    transition: all 0.2s;
    &:focus { outline: none; border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
  }
  button {
    padding: 14px 28px;
    border-radius: 12px;
    border: none;
    background: #0f172a;
    color: white;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    &:hover:not(:disabled) { background: #334155; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15,23,42,0.2);}
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }
`;

const HayvanSonucItem = styled.div`
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover { background: #f0f9ff; border-color: #7dd3fc; transform: translateX(4px); box-shadow: 0 4px 12px rgba(125, 211, 252, 0.15);}
  .info { display: flex; flex-direction: column; gap: 4px; }
  .ciftlik { font-size: 13px; color: #64748b; font-weight: 500; }
  .hayvan { font-size: 16px; font-weight: 800; color: #0f172a; }
  .tip { font-size: 12px; color: #0284c7; background: #e0f2fe; padding: 4px 10px; border-radius: 20px; font-weight: 700; display: inline-block;}
`;

const FarmList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const FarmRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 12px;
  &:last-child { border-bottom: none; }
  &:hover { background: #f8fafc; transform: translateX(4px); }
  .name { font-weight: 800; color: #0f172a; font-size: 15px; margin-bottom: 4px; }
  .sub { font-size: 13px; color: #64748b; font-weight: 500;}
  .arrow { color: #94a3b8; font-size: 18px; transition: color 0.2s; }
  &:hover .arrow { color: #3b82f6; }
`;

const LinkRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 12px;
  &:last-child { border-bottom: none; }
  &:hover { background: #f8fafc; transform: translateX(4px); }
  .name { font-weight: 800; color: #0f172a; font-size: 15px; margin-bottom: 4px; }
  .desc { font-size: 13px; color: #64748b; font-weight: 500;}
  .arrow { color: #94a3b8; font-size: 18px; transition: color 0.2s; }
  &:hover .arrow { color: #3b82f6; }
`;

const RecordItem = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 12px;
  &:last-child { border-bottom: none; }
  &:hover { background: #f8fafc; transform: translateX(4px); }
  .line1 { font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;}
  .line2 { font-size: 13px; color: #64748b; font-weight: 500;}
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const EmptyState = styled.p`
  color: #6b7280;
  font-size: 14px;
  margin: 0;
  padding: 20px 0;
`;

const tipEtiket = { hastalik: 'Hastalık', tedavi: 'Tedavi', asi: 'Aşı', muayene: 'Muayene', ameliyat: 'Ameliyat', dogum_komplikasyonu: 'Doğum' };

export default function VeterinerDashboard({ kullanici }) {
  const [ozet, setOzet] = useState(null);
  const [musteriler, setMusteriler] = useState([]);
  const [sonSaglik, setSonSaglik] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kupeArama, setKupeArama] = useState('');
  const [kupeSonuc, setKupeSonuc] = useState([]);
  const [kupeLoading, setKupeLoading] = useState(false);
  const navigate = useNavigate();

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      api.getVeterinerOzet(),
      api.getVeterinerMusteriler(),
      api.getVeterinerSonSaglikKayitlari()
    ])
      .then(([oRes, mRes, sRes]) => {
        setOzet(oRes.data || null);
        setMusteriler(mRes.data || []);
        setSonSaglik(sRes.data || []);
      })
      .catch(() => {
        setOzet(null);
        setMusteriler([]);
        setSonSaglik([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleKupeAra = async (e) => {
    e.preventDefault();
    const q = kupeArama.trim();
    if (!q || q.length < 2) {
      toast.warning('En az 2 karakter girin.');
      return;
    }
    setKupeLoading(true);
    setKupeSonuc([]);
    try {
      const res = await api.getVeterinerHayvanAra(q);
      const list = res.data || [];
      setKupeSonuc(list);
      if (list.length === 1) {
        navigate(`/hastalar/${list[0].ciftciId}`);
        return;
      }
      if (list.length === 0) toast.info('Bu küpe numarasına ait hayvan bulunamadı.');
    } catch (err) {
      toast.error('Arama yapılamadı.');
    } finally {
      setKupeLoading(false);
    }
  };

  const tipLabel = { inek: 'İnek', buzagi: 'Buzağı', duve: 'Düve', tosun: 'Tosun' };

  const sonCiftlikler = musteriler.slice(0, 6);

  return (
    <Page>
      <Header>
        <p className="title">Veteriner Paneli</p>
        <h1 className="name">Dr. {kullanici?.isim || ''}</h1>
        <p className="meta">{kullanici?.klinikAdi || 'Serbest veteriner hekim'}</p>
      </Header>

      <StatsRow>
        <Stat $highlight>
          <div className="value">{loading ? '–' : (ozet?.musteriSayisi ?? 0)}</div>
          <div className="label">Kayıtlı çiftlik</div>
        </Stat>
        <Stat>
          <div className="value">{loading ? '–' : (ozet?.toplamHayvan ?? 0)}</div>
          <div className="label">Toplam hayvan</div>
        </Stat>
        <Stat>
          <div className="value">{loading ? '–' : (ozet?.buAySaglikKaydi ?? 0)}</div>
          <div className="label">Bu ay eklenen kayıt</div>
        </Stat>
        <Stat>
          <div className="value">{loading ? '–' : (ozet?.devamEdenTedavi ?? 0)}</div>
          <div className="label">Devam eden tedavi</div>
        </Stat>
      </StatsRow>

      <PrimaryAction type="button" onClick={() => navigate('/hastalar')}>
        Hastalarım — Çiftliklere git
      </PrimaryAction>

      <Section>
        <h3>Küpe no ile hayvan bul</h3>
        <KupeAramaForm onSubmit={handleKupeAra}>
          <input
            type="text"
            value={kupeArama}
            onChange={e => setKupeArama(e.target.value)}
            placeholder="Küpe numarası (örn. TR-123)"
          />
          <button type="submit" disabled={kupeLoading || !kupeArama.trim()}>
            {kupeLoading ? 'Aranıyor…' : 'Ara'}
          </button>
        </KupeAramaForm>
        {kupeSonuc.length > 1 && (
          <FarmList>
            {kupeSonuc.map((r, i) => (
              <HayvanSonucItem key={`${r.ciftciId}-${r.hayvan?._id}-${i}`} onClick={() => navigate(`/hastalar/${r.ciftciId}`)}>
                <div className="info">
                  <div className="ciftlik">{r.ciftlikAdi || r.ciftciIsim}</div>
                  <div className="hayvan">{r.hayvan?.kupeNo || r.hayvan?.isim || '–'} {r.hayvan?.isim && `(${r.hayvan.isim})`}</div>
                </div>
                <div className="tip">{tipLabel[r.tip] || r.tip}</div>
              </HayvanSonucItem>
            ))}
          </FarmList>
        )}
      </Section>

      <TwoCol>
        <Section>
          <h3>Son çalıştığınız çiftlikler</h3>
          {loading ? (
            <EmptyState>Yükleniyor…</EmptyState>
          ) : sonCiftlikler.length === 0 ? (
            <EmptyState>Henüz çiftlik eklemediniz. Yukarıdaki alana çiftlik kodu yazarak ekleyin veya Hastalar sayfasından ekleyin.</EmptyState>
          ) : (
            <FarmList>
              {sonCiftlikler.map(m => (
                <FarmRow key={m._id} onClick={() => navigate(`/hastalar/${m._id}`)}>
                  <div>
                    <div className="name">{m.isletmeAdi || m.isim || 'İsimsiz çiftlik'}</div>
                    <div className="sub">{m.isim} · Hayvanlar ve sağlık kayıtları</div>
                  </div>
                  <span className="arrow">→</span>
                </FarmRow>
              ))}
            </FarmList>
          )}
        </Section>

        <div>
          <Section>
            <h3>Hızlı geçiş</h3>
            <LinkRow onClick={() => navigate('/hastalar')}>
              <div>
                <div className="name">Hastalar</div>
                <div className="desc">Tüm çiftlikler, yeni ekle</div>
              </div>
              <span className="arrow">→</span>
            </LinkRow>
            <LinkRow onClick={() => navigate('/receteler')}>
              <div>
                <div className="name">Reçete & Stok</div>
                <div className="desc">İlaç ve tohum stoğu</div>
              </div>
              <span className="arrow">→</span>
            </LinkRow>
            <LinkRow onClick={() => navigate('/takvim')}>
              <div>
                <div className="name">Takvim</div>
                <div className="desc">Randevu ve planlama</div>
              </div>
              <span className="arrow">→</span>
            </LinkRow>
          </Section>

          {sonSaglik.length > 0 && (
            <Section>
              <h3>Son eklediğiniz kayıtlar</h3>
              {sonSaglik.slice(0, 6).map(k => (
                <RecordItem key={k._id} onClick={() => k.userId?._id && navigate(`/hastalar/${k.userId._id}`)}>
                  <div className="line1">{k.userId?.isletmeAdi || k.userId?.isim || 'Çiftlik'} · {k.hayvanIsim || k.hayvanKupeNo || 'Hayvan'}</div>
                  <div className="line2">{tipEtiket[k.tip] || k.tip} — {k.tani} · {k.tarih ? new Date(k.tarih).toLocaleDateString('tr-TR') : ''}</div>
                </RecordItem>
              ))}
            </Section>
          )}
        </div>
      </TwoCol>
    </Page>
  );
}
