import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); }`;

const Page = styled.div`
  animation: ${fadeIn} 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: 'Inter', -apple-system, sans-serif;
  color: #0f172a;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  min-height: calc(100vh - 80px);
  padding: 40px;

  &::before {
    content: '';
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: 
      radial-gradient(circle at 15% 50%, rgba(56, 189, 248, 0.04), transparent 25%),
      radial-gradient(circle at 85% 30%, rgba(99, 102, 241, 0.05), transparent 25%);
    background-color: #f8fafc;
    z-index: -1;
  }
`;

const Header = styled.header`
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .title { font-size: 13px; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.1em; }
  .name { font-size: 42px; font-weight: 900; color: #0f172a; line-height: 1.1; letter-spacing: -0.03em; }
  .meta { font-size: 16px; color: #64748b; font-weight: 500; }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;
  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const Stat = styled.div`
  background: #ffffff;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: ''; position: absolute; top: 0; right: 0; width: 120px; height: 120px;
    background: radial-gradient(circle at top right, rgba(56, 189, 248, 0.1), transparent 70%);
    border-radius: 0 24px 0 100%;
  }

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.12);
    border-color: #cbd5e1;
  }

  .value { font-size: 42px; font-weight: 900; color: #0f172a; line-height: 1; margin-bottom: 12px; letter-spacing: -0.03em;}
  .label { font-size: 14px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;}
  
  ${p => p.$highlight && `
    background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
    border: none;
    .value { color: #ffffff; }
    .label { color: rgba(255,255,255,0.8); }
    &::after { background: radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent 70%); }
    &:hover { box-shadow: 0 20px 40px -10px rgba(37,99,235,0.4); border-color: transparent; }
  `}
`;

const PrimaryAction = styled.button`
  width: 100%;
  padding: 24px 32px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
  color: white;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  margin-bottom: 40px;
  box-shadow: 0 15px 35px -10px rgba(37, 99, 235, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  
  &:hover { 
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 25px 45px -15px rgba(37, 99, 235, 0.5);
  }
`;

const Section = styled.section`
  background: #ffffff;
  border-radius: 28px;
  padding: 40px;
  margin-bottom: 32px;
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
  border: 1px solid rgba(226, 232, 240, 0.6);
  h3 { font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: -0.01em; margin: 0 0 28px; display: flex; align-items: center; gap: 12px;}
  h3::before { content: ''; display: block; width: 6px; height: 24px; border-radius: 4px; background: #3b82f6; }
`;

const KupeAramaForm = styled.form`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  input {
    flex: 1;
    min-width: 280px;
    padding: 18px 24px;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 500;
    background: #f8fafc;
    transition: all 0.3s;
    &:focus { outline: none; border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }
  }
  button {
    padding: 18px 36px;
    border-radius: 16px;
    border: none;
    background: #0f172a;
    color: white;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    &:hover:not(:disabled) { background: #1e293b; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(15,23,42,0.15);}
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
`;

const HayvanSonucItem = styled.div`
  padding: 24px;
  border-radius: 20px;
  margin-bottom: 16px;
  background: #fff;
  border: 2px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover { background: #f8fafc; border-color: #bae6fd; transform: scale(1.01); box-shadow: 0 12px 24px rgba(0,0,0,0.04);}
  .info { display: flex; flex-direction: column; gap: 8px; }
  .ciftlik { font-size: 14px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .hayvan { font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.01em;}
  .tip { font-size: 13px; color: #0284c7; background: #e0f2fe; padding: 6px 14px; border-radius: 24px; font-weight: 800; display: inline-block;}
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
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 16px;
  margin-bottom: 8px;
  &:last-child { border-bottom: none; }
  &:hover { background: #f8fafc; transform: scale(1.02); box-shadow: 0 8px 24px -8px rgba(0,0,0,0.06); }
  .name { font-weight: 900; color: #0f172a; font-size: 18px; margin-bottom: 6px; letter-spacing: -0.01em;}
  .sub { font-size: 14px; color: #64748b; font-weight: 600;}
  .arrow { color: #cbd5e1; font-size: 24px; transition: color 0.3s; }
  &:hover .arrow { color: #3b82f6; transform: translateX(4px); }
`;

const LinkRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 16px;
  margin-bottom: 8px;
  &:last-child { border-bottom: none; }
  &:hover { background: #f8fafc; transform: scale(1.02); box-shadow: 0 8px 24px -8px rgba(0,0,0,0.06); }
  .name { font-weight: 800; color: #0f172a; font-size: 16px; margin-bottom: 4px; }
  .desc { font-size: 14px; color: #64748b; font-weight: 500;}
  .arrow { color: #cbd5e1; font-size: 20px; transition: all 0.3s; }
  &:hover .arrow { color: #3b82f6; transform: translateX(4px);}
`;

const RecordItem = styled.div`
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 16px;
  margin-bottom: 8px;
  &:last-child { border-bottom: none; }
  &:hover { background: #f8fafc; transform: scale(1.02); box-shadow: 0 8px 24px -8px rgba(0,0,0,0.06); }
  .line1 { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 8px;}
  .line2 { font-size: 14px; color: #64748b; font-weight: 600;}
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  @media (max-width: 1024px) { grid-template-columns: 1fr; }
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
