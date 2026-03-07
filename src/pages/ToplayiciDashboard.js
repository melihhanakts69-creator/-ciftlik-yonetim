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

export default function ToplayiciDashboard({ kullanici }) {
  const [ciftlikler, setCiftlikler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ciftlikKodu, setCiftlikKodu] = useState('');
  const [adding, setAdding] = useState(false);

  const [sutCiftlikKodu, setSutCiftlikKodu] = useState('');
  const [tarih, setTarih] = useState(() => new Date().toISOString().split('T')[0]);
  const [litre, setLitre] = useState('');
  const [sagim, setSagim] = useState('sabah');
  const [sutSubmitting, setSutSubmitting] = useState(false);

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
  }, []);

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
              </FarmCard>
            ))}
          </FarmList>
        )}
      </Card>

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
    </Page>
  );
}
