import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); }`;

const Page = styled.div`
  animation: ${fadeIn} 0.35s ease;
  font-family: 'Inter', -apple-system, sans-serif;
  color: #1a1a1a;
  max-width: 1100px;
  margin: 0 auto;
`;

const Header = styled.header`
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
  .title { font-size: 15px; font-weight: 600; color: #6b7280; letter-spacing: 0.02em; margin: 0 0 4px; }
  .name { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
  .meta { font-size: 13px; color: #6b7280; margin-top: 6px; }
`;

const UnapprovedAlert = styled.div`
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 24px;
  color: #92400e;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
`;

const Stat = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 18px 20px;
  .value { font-size: 26px; font-weight: 800; color: #111827; line-height: 1.2; }
  .label { font-size: 12px; color: #6b7280; font-weight: 500; margin-top: 4px; }
  ${p => p.$highlight && `
    border-color: #3b82f6;
    background: #f8fafc;
    .value { color: #1d4ed8; }
  `}
`;

const PrimaryAction = styled.button`
  width: 100%;
  padding: 18px 24px;
  border-radius: 10px;
  border: none;
  background: #2563eb;
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 24px;
  &:hover { background: #1d4ed8; }
`;

const Section = styled.section`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 22px 24px;
  margin-bottom: 20px;
  h3 { font-size: 13px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 16px; }
`;

const QuickAddForm = styled.form`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  input {
    flex: 1;
    min-width: 160px;
    padding: 12px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    text-transform: uppercase;
    &::placeholder { text-transform: none; }
    &:focus { outline: none; border-color: #3b82f6; }
  }
  button {
    padding: 12px 20px;
    border-radius: 8px;
    border: none;
    background: #111827;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    &:hover:not(:disabled) { background: #374151; }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }
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
  padding: 14px 0;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background 0.15s;
  &:last-child { border-bottom: none; }
  &:hover { background: #f9fafb; }
  .name { font-weight: 600; color: #111827; font-size: 14px; }
  .sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .arrow { color: #9ca3af; font-size: 14px; }
`;

const LinkRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background 0.15s;
  &:last-child { border-bottom: none; }
  &:hover { background: #f9fafb; }
  .name { font-weight: 600; color: #111827; font-size: 14px; }
  .desc { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .arrow { color: #9ca3af; font-size: 14px; }
`;

const RecordItem = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background 0.15s;
  &:last-child { border-bottom: none; }
  &:hover { background: #f9fafb; }
  .line1 { font-size: 13px; font-weight: 600; color: #111827; }
  .line2 { font-size: 12px; color: #6b7280; margin-top: 2px; }
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
  const isApproved = kullanici?.onaylandi;
  const [ozet, setOzet] = useState(null);
  const [musteriler, setMusteriler] = useState([]);
  const [sonSaglik, setSonSaglik] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addCode, setAddCode] = useState('');
  const [adding, setAdding] = useState(false);
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

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    const kod = addCode.trim().toUpperCase();
    if (!kod) {
      toast.warning('Çiftlik kodunu girin.');
      return;
    }
    setAdding(true);
    try {
      await api.veterinerMusteriEkleKod(kod);
      toast.success('Çiftlik listenize eklendi.');
      setAddCode('');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Eklenemedi.');
    } finally {
      setAdding(false);
    }
  };

  const sonCiftlikler = musteriler.slice(0, 6);

  return (
    <Page>
      {!isApproved && (
        <UnapprovedAlert>
          <span>Hesabınız onay bekliyor.</span>
          <span>Sisteme tam erişim ve reçete/teşhis işlemleri için yönetici onayı gereklidir.</span>
        </UnapprovedAlert>
      )}

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
        <h3>Çiftlik kodu ile hızlı ekle</h3>
        <QuickAddForm onSubmit={handleQuickAdd}>
          <input
            type="text"
            value={addCode}
            onChange={e => setAddCode(e.target.value.toUpperCase())}
            placeholder="Çiftlik kodu (örn. ABC12XYZ)"
            maxLength={12}
            disabled={!isApproved}
          />
          <button type="submit" disabled={adding || !addCode.trim()}>
            {adding ? 'Ekleniyor…' : 'Ekle'}
          </button>
        </QuickAddForm>
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
                <FarmRow key={m._id} onClick={() => navigate(`/musteri-detay/${m._id}`)}>
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
                <RecordItem key={k._id} onClick={() => k.userId?._id && navigate(`/musteri-detay/${k.userId._id}`)}>
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
