import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); }`;

const Page = styled.div`
  animation: ${fadeIn} 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: 'Inter', -apple-system, sans-serif;
  color: #0f172a;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  min-height: calc(100vh - 70px);
  padding: 24px;

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
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  
  .title { font-size: 12px; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.1em; }
  .name { font-size: 32px; font-weight: 900; color: #0f172a; line-height: 1.1; letter-spacing: -0.02em; }
  .meta { font-size: 15px; color: #64748b; font-weight: 500; }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 28px;
  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const Stat = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 30px -10px rgba(0,0,0,0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: ''; position: absolute; top: 0; right: 0; width: 100px; height: 100px;
    background: radial-gradient(circle at top right, rgba(56, 189, 248, 0.1), transparent 70%);
    border-radius: 0 20px 0 100%;
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 15px 35px -10px rgba(0,0,0,0.1);
    border-color: #cbd5e1;
  }

  .value { font-size: 32px; font-weight: 900; color: #0f172a; line-height: 1; margin-bottom: 8px; letter-spacing: -0.02em;}
  .label { font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;}
  
  ${p => p.$highlight && `
    background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
    border: none;
    .value { color: #ffffff; }
    .label { color: rgba(255,255,255,0.8); }
    &::after { background: radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent 70%); }
    &:hover { box-shadow: 0 15px 35px -10px rgba(37,99,235,0.4); border-color: transparent; }
  `}
`;

const PrimaryAction = styled.button`
  width: 100%;
  padding: 18px 24px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
  color: white;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  margin-bottom: 28px;
  box-shadow: 0 10px 25px -8px rgba(37, 99, 235, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  
  &:hover { 
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 14px 30px -10px rgba(37, 99, 235, 0.5);
  }
`;

const Section = styled.section`
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 30px -10px rgba(0,0,0,0.05);
  border: 1px solid rgba(226, 232, 240, 0.6);
  h3 { font-size: 15px; font-weight: 900; color: #0f172a; letter-spacing: 0.02em; margin: 0 0 20px; display: flex; align-items: center; gap: 8px;}
  h3::before { content: ''; display: block; width: 4px; height: 18px; border-radius: 4px; background: #3b82f6; }
`;

const KupeAramaForm = styled.form`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  input {
    flex: 1;
    min-width: 200px;
    padding: 14px 18px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 500;
    background: #f8fafc;
    transition: all 0.2s;
    &:focus { outline: none; border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }
  }
  button {
    padding: 14px 28px;
    border-radius: 12px;
    border: none;
    background: #0f172a;
    color: white;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    &:hover:not(:disabled) { background: #1e293b; transform: translateY(-2px); box-shadow: 0 8px 16px rgba(15,23,42,0.15);}
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
`;

const HayvanSonucItem = styled.div`
  padding: 16px 20px;
  border-radius: 16px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover { background: #f8fafc; border-color: #bae6fd; transform: scale(1.02); box-shadow: 0 6px 16px rgba(0,0,0,0.03);}
  .info { display: flex; flex-direction: column; gap: 4px; }
  .ciftlik { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .hayvan { font-size: 16px; font-weight: 900; color: #0f172a; letter-spacing: -0.01em;}
  .tip { font-size: 12px; color: #0284c7; background: #e0f2fe; padding: 4px 12px; border-radius: 20px; font-weight: 800; display: inline-block;}
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
  padding: 16px 18px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 12px;
  margin-bottom: 4px;
  &:last-child { border-bottom: none; }
  &:hover { background: #f8fafc; transform: scale(1.01); box-shadow: 0 4px 12px -4px rgba(0,0,0,0.04); }
  .name { font-weight: 800; color: #0f172a; font-size: 15px; margin-bottom: 4px; letter-spacing: -0.01em;}
  .sub { font-size: 13px; color: #64748b; font-weight: 500;}
  .arrow { color: #cbd5e1; font-size: 20px; transition: color 0.2s; }
  &:hover .arrow { color: #3b82f6; transform: translateX(2px); }
`;

const LinkRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 12px;
  margin-bottom: 4px;
  &:last-child { border-bottom: none; }
  &:hover { background: #f8fafc; transform: scale(1.01); box-shadow: 0 4px 12px -4px rgba(0,0,0,0.04); }
  .name { font-weight: 800; color: #0f172a; font-size: 14px; margin-bottom: 2px; }
  .desc { font-size: 13px; color: #64748b; font-weight: 500;}
  .arrow { color: #cbd5e1; font-size: 18px; transition: all 0.2s; }
  &:hover .arrow { color: #3b82f6; transform: translateX(2px);}
`;

const RecordItem = styled.div`
  padding: 16px 18px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 12px;
  margin-bottom: 4px;
  &:last-child { border-bottom: none; }
  &:hover { background: #f8fafc; transform: scale(1.01); box-shadow: 0 4px 12px -4px rgba(0,0,0,0.04); }
  .line1 { font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;}
  .line2 { font-size: 13px; color: #64748b; font-weight: 600;}
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  @media (max-width: 1024px) { grid-template-columns: 1fr; }
`;

const EmptyState = styled.p`
  padding: 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
  margin: 0;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
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
