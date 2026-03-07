import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { toast } from 'react-toastify';
import * as api from '../services/api';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;

const Page = styled.div`
  animation: ${fadeIn} 0.4s ease;
  font-family: 'Inter', sans-serif;
  color: #333;
  max-width: 900px;
  margin: 0 auto;
`;

const WelcomeBanner = styled.div`
  background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
  border-radius: 12px;
  padding: 24px 28px;
  margin-bottom: 24px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  h1 { font-size: 22px; font-weight: 800; margin: 0 0 6px; }
  p { margin: 0; opacity: 0.9; font-size: 14px; }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  margin-bottom: 24px;
  h3 { font-size: 16px; font-weight: 700; color: #2c3e50; margin: 0 0 20px; padding-bottom: 12px; border-bottom: 1px solid #eee; }
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  @media (max-width: 600px) { flex-direction: column; }
`;

const Field = styled.div`
  flex: ${p => p.$flex || 1};
  min-width: 140px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; }
  input, select {
    padding: 12px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    background: #f8fafc;
    outline: none;
    transition: border-color 0.2s;
    &:focus { border-color: #a78bfa; background: white; }
  }
`;

const Btn = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const BtnPrimary = styled(Btn)`
  background: #7c3aed;
  color: white;
  &:hover:not(:disabled) { background: #6d28d9; }
`;

const FarmList = styled.div`
  display: grid;
  gap: 12px;
`;

const FarmCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  .name { font-weight: 700; color: #1e293b; }
  .kod { font-size: 12px; color: #64748b; font-family: monospace; }
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  border-left: 4px solid ${p => p.$color || '#7c3aed'};
  .val { font-size: 22px; font-weight: 800; color: #1e293b; }
  .lbl { font-size: 12px; color: #64748b; margin-top: 4px; }
`;

const BtnSmall = styled.button`
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: #7c3aed;
  color: white;
  white-space: nowrap;
  &:hover:not(:disabled) { background: #6d28d9; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`;

const ModalBox = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  h4 { margin: 0 0 16px; font-size: 16px; color: #1e293b; }
`;

const SonToplamItem = styled.div`
  padding: 10px 14px; border-radius: 8px; margin-bottom: 8px; background: #f8fafc;
  border-left: 3px solid #7c3aed; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;
  .ciftlik { font-weight: 600; color: #1e293b; font-size: 13px; }
  .detay { font-size: 12px; color: #64748b; }
`;

export default function ToplayiciDashboard({ kullanici }) {
  const [ciftlikler, setCiftlikler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ozet, setOzet] = useState(null);
  const [sonToplamalar, setSonToplamalar] = useState([]);
  const [ciftlikKodu, setCiftlikKodu] = useState('');
  const [adding, setAdding] = useState(false);

  const [sutCiftlikKodu, setSutCiftlikKodu] = useState('');
  const [tarih, setTarih] = useState(() => new Date().toISOString().split('T')[0]);
  const [litre, setLitre] = useState('');
  const [sagim, setSagim] = useState('sabah');
  const [sutSubmitting, setSutSubmitting] = useState(false);

  const [quickFarm, setQuickFarm] = useState(null);
  const [quickLitre, setQuickLitre] = useState('');
  const [quickTarih, setQuickTarih] = useState(() => new Date().toISOString().split('T')[0]);
  const [quickSagim, setQuickSagim] = useState('sabah');
  const [quickSubmitting, setQuickSubmitting] = useState(false);

  const fetchOzet = () => {
    api.getToplayiciOzet().then(res => setOzet(res.data)).catch(() => setOzet(null));
  };
  const fetchSonToplamalar = () => {
    api.getToplayiciSonToplamalar().then(res => setSonToplamalar(res.data || [])).catch(() => setSonToplamalar([]));
  };

  const fetchCiftlikler = async () => {
    try {
      const res = await api.getToplayiciCiftlikler();
      setCiftlikler(res.data || []);
    } catch (e) {
      toast.error('Çiftlik listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCiftlikler();
    fetchOzet();
    fetchSonToplamalar();
  }, []);

  const openQuickSut = (c) => {
    setQuickFarm(c);
    setQuickLitre('');
    setQuickTarih(new Date().toISOString().split('T')[0]);
    setQuickSagim('sabah');
  };

  const submitQuickSut = async (e) => {
    e.preventDefault();
    if (!quickFarm?.ciftlikKodu || quickLitre === '' || quickLitre == null) {
      toast.warning('Litre girin.');
      return;
    }
    setQuickSubmitting(true);
    try {
      await api.toplayiciSutToplama({
        ciftlikKodu: quickFarm.ciftlikKodu,
        tarih: quickTarih,
        litre: parseFloat(quickLitre),
        sagim: quickSagim
      });
      toast.success('Kayıt çiftliğe işlendi.');
      setQuickFarm(null);
      fetchOzet();
      fetchSonToplamalar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kayıt eklenemedi.');
    } finally {
      setQuickSubmitting(false);
    }
  };

  const handleCiftlikEkle = async (e) => {
    e.preventDefault();
    if (!ciftlikKodu.trim()) {
      toast.warning('Çiftlik kodunu girin.');
      return;
    }
    setAdding(true);
    try {
      await api.toplayiciCiftlikEkle(ciftlikKodu.trim().toUpperCase());
      toast.success('Çiftlik eklendi.');
      setCiftlikKodu('');
      fetchCiftlikler();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Çiftlik eklenemedi.');
    } finally {
      setAdding(false);
    }
  };

  const handleSutToplama = async (e) => {
    e.preventDefault();
    const kod = sutCiftlikKodu.trim().toUpperCase();
    if (!kod || !tarih || litre === '' || litre == null) {
      toast.warning('Çiftlik, tarih ve litre girin.');
      return;
    }
    setSutSubmitting(true);
    try {
      await api.toplayiciSutToplama({
        ciftlikKodu: kod,
        tarih,
        litre: parseFloat(litre),
        sagim
      });
      toast.success('Süt toplama kaydı çiftliğe işlendi.');
      setLitre('');
      fetchOzet();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Kayıt eklenemedi.');
    } finally {
      setSutSubmitting(false);
    }
  };

  return (
    <Page>
      <WelcomeBanner>
        <div>
          <h1>Hoş geldiniz, {kullanici?.isim?.split(' ')[0] || 'Süt Toplayıcı'}</h1>
          <p>Çiftlik kodları ile çiftlik ekleyin; topladığınız sütü ilgili çiftliğe kaydedin.</p>
        </div>
        <span style={{ fontSize: 40, opacity: 0.9 }}>🥛</span>
      </WelcomeBanner>

      <StatRow>
        <StatCard $color="#7c3aed">
          <div className="val">{ozet ? `${ozet.bugunToplamLitre ?? 0} L` : '–'}</div>
          <div className="lbl">Bugün topladığınız</div>
        </StatCard>
        <StatCard $color="#0ea5e9">
          <div className="val">{ozet ? (ozet.bugunCiftlikSayisi ?? 0) : '–'}</div>
          <div className="lbl">Bugün çiftlik sayısı</div>
        </StatCard>
        <StatCard $color="#10b981">
          <div className="val">{ozet ? `${ozet.buHaftaToplamLitre ?? 0} L` : '–'}</div>
          <div className="lbl">Bu hafta toplam</div>
        </StatCard>
      </StatRow>

      <Card>
        <h3>Çiftlik ekle (çiftlik kodu)</h3>
        <form onSubmit={handleCiftlikEkle}>
          <FormRow>
            <Field $flex="1">
              <label>Çiftlik kodu</label>
              <input
                value={ciftlikKodu}
                onChange={e => setCiftlikKodu(e.target.value.toUpperCase())}
                placeholder="Çiftçinin paylaştığı 8 karakterlik kod"
                maxLength={12}
              />
            </Field>
            <Field $flex="0 0 auto" style={{ alignSelf: 'flex-end' }}>
              <BtnPrimary type="submit" disabled={adding}>
                {adding ? 'Ekleniyor...' : '+ Çiftlik ekle'}
              </BtnPrimary>
            </Field>
          </FormRow>
        </form>
      </Card>

      <Card>
        <h3>Topladığım çiftlikler</h3>
        {loading ? (
          <p style={{ color: '#64748b' }}>Yükleniyor...</p>
        ) : ciftlikler.length === 0 ? (
          <p style={{ color: '#64748b' }}>Henüz çiftlik eklemediniz. Yukarıdan çiftlik kodu ile ekleyin.</p>
        ) : (
          <FarmList>
            {ciftlikler.map(c => (
              <FarmCard key={c._id}>
                <div>
                  <div className="name">{c.isletmeAdi || c.isim || 'İsimsiz'}</div>
                  <div className="kod">{c.ciftlikKodu ? `Kod: ${c.ciftlikKodu}` : ''}</div>
                </div>
                {c.ciftlikKodu && (
                  <BtnSmall type="button" onClick={() => openQuickSut(c)}>
                    Süt gir
                  </BtnSmall>
                )}
              </FarmCard>
            ))}
          </FarmList>
        )}
      </Card>

      {sonToplamalar.length > 0 && (
        <Card>
          <h3>Son toplamalar</h3>
          {sonToplamalar.slice(0, 10).map(k => (
            <SonToplamItem key={k._id}>
              <div>
                <div className="ciftlik">{k.tenantId?.name || k.tenantId?.ciftlikKodu || 'Çiftlik'}</div>
                <div className="detay">{k.tarih} · {k.sagim === 'aksam' ? 'Akşam' : 'Sabah'}</div>
              </div>
              <span style={{ fontWeight: 700, color: '#7c3aed' }}>{Number(k.litre)} L</span>
            </SonToplamItem>
          ))}
        </Card>
      )}

      <Card>
        <h3>Süt toplama kaydı</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          Topladığınız süt miktarını girin; kayıt ilgili çiftliğe otomatik işlenir.
        </p>
        <form onSubmit={handleSutToplama}>
          <FormRow>
            <Field $flex="1">
              <label>Çiftlik kodu *</label>
              <input
                value={sutCiftlikKodu}
                onChange={e => setSutCiftlikKodu(e.target.value.toUpperCase())}
                placeholder="Örn: ABC12XYZ"
                list="ciftlik-list"
              />
              <datalist id="ciftlik-list">
                {ciftlikler.filter(c => c.ciftlikKodu).map(c => (
                  <option key={c._id} value={c.ciftlikKodu} />
                ))}
              </datalist>
            </Field>
            <Field $flex="1">
              <label>Tarih *</label>
              <input type="date" value={tarih} onChange={e => setTarih(e.target.value)} required />
            </Field>
            <Field $flex="0.6">
              <label>Litre *</label>
              <input type="number" step="0.1" min="0" value={litre} onChange={e => setLitre(e.target.value)} placeholder="120" required />
            </Field>
            <Field $flex="0.6">
              <label>Sağım</label>
              <select value={sagim} onChange={e => setSagim(e.target.value)}>
                <option value="sabah">Sabah</option>
                <option value="aksam">Akşam</option>
              </select>
            </Field>
          </FormRow>
          <BtnPrimary type="submit" disabled={sutSubmitting}>
            {sutSubmitting ? 'Kaydediliyor...' : 'Süt toplama kaydı gönder'}
          </BtnPrimary>
        </form>
      </Card>

      {quickFarm && (
        <ModalOverlay onClick={() => !quickSubmitting && setQuickFarm(null)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <h4>🥛 Süt gir – {quickFarm.isletmeAdi || quickFarm.isim || quickFarm.ciftlikKodu}</h4>
            <form onSubmit={submitQuickSut}>
              <FormRow>
                <Field $flex="1">
                  <label>Çiftlik kodu</label>
                  <input value={quickFarm.ciftlikKodu} readOnly style={{ background: '#f1f5f9', cursor: 'default' }} />
                </Field>
              </FormRow>
              <FormRow>
                <Field $flex="1">
                  <label>Tarih</label>
                  <input type="date" value={quickTarih} onChange={e => setQuickTarih(e.target.value)} />
                </Field>
                <Field $flex="1">
                  <label>Litre *</label>
                  <input type="number" step="0.1" min="0" value={quickLitre} onChange={e => setQuickLitre(e.target.value)} placeholder="120" required />
                </Field>
              </FormRow>
              <FormRow>
                <Field $flex="1">
                  <label>Sağım</label>
                  <select value={quickSagim} onChange={e => setQuickSagim(e.target.value)}>
                    <option value="sabah">Sabah</option>
                    <option value="aksam">Akşam</option>
                  </select>
                </Field>
              </FormRow>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <BtnPrimary type="submit" disabled={quickSubmitting}>
                  {quickSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                </BtnPrimary>
                <Btn type="button" onClick={() => setQuickFarm(null)} style={{ background: '#f1f5f9', color: '#475569' }}>
                  İptal
                </Btn>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}
    </Page>
  );
}
