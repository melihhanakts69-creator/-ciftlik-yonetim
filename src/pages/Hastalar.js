import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const API = process.env.REACT_APP_API_URL || 'https://ciftlik-yonetim.onrender.com';

const PageContainer = styled.div`
  animation: fadeIn 0.4s ease;
  font-family: 'Inter', sans-serif;
  color: #333;
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px;
  h1 { font-size: 24px; font-weight: 700; color: #2c3e50; margin: 0; }
  p { color: #7f8c8d; font-size: 14px; margin: 4px 0 0 0; }
`;

const Card = styled.div`
  background: white; border-radius: 12px; padding: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03); margin-bottom: 24px;
`;

const AddForm = styled.form`
  display: flex; gap: 16px; align-items: flex-end;
  @media (max-width: 600px) { flex-direction: column; align-items: stretch; }
  
  .field {
    flex: 1; display: flex; flex-direction: column; gap: 8px;
    label { font-size: 13px; font-weight: 600; color: #34495e; }
    input { padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 14px; outline: none; transition: all 0.2s; }
    input:focus { border-color: #2196F3; background: white; box-shadow: 0 0 0 3px rgba(33,150,243,0.1); }
  }
  
  button {
    padding: 12px 24px; background: #2196F3; color: white; border: none; border-radius: 8px;
    font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; height: 43px; display: flex; align-items: center; justify-content: center;
    &:hover { background: #1E88E5; }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }
`;

const Grid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;
`;

const ClientCard = styled.div`
  background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02); display: flex; flex-direction: column; transition: all 0.2s;
  cursor: pointer;
  
  &:hover { border-color: #2196F3; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(33,150,243,0.1); }
  
  .icon { width: 44px; height: 44px; border-radius: 10px; background: #E3F2FD; color: #1976D2; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 16px; }
  .name { font-size: 16px; font-weight: 700; color: #2c3e50; margin-bottom: 4px; }
  .farm { font-size: 13px; color: #7f8c8d; font-weight: 500; margin-bottom: 12px; }
  .contact { font-size: 12px; color: #95a5a6; display: flex; align-items: center; gap: 6px; margin-top: auto; }
`;

export default function Hastalar() {
  const [musteriler, setMusteriler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ciftciId, setCiftciId] = useState('');
  const [ciftlikKodu, setCiftlikKodu] = useState('');
  const [eklemeModu, setEklemeModu] = useState('kod'); // 'kod' | 'id'
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  const fetchMusteriler = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/veteriner/musteriler`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMusteriler(res.data);
    } catch (e) {
      toast.error('Müşteriler alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMusteriler();
  }, []);

  const handleMusteriEkle = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (eklemeModu === 'kod') {
      if (!ciftlikKodu.trim()) return toast.warning('Lütfen çiftlik kodunu girin.');
      setAdding(true);
      try {
        const res = await axios.post(`${API}/api/veteriner/musteri-ekle-kod`, { ciftlikKodu: ciftlikKodu.trim() }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(res.data.message || 'Çiftlik başarıyla kliniğinize bağlandı!');
        setCiftlikKodu('');
        fetchMusteriler();
      } catch (e) {
        toast.error(e.response?.data?.message || 'Çiftlik eklenirken hata oluştu.');
      } finally {
        setAdding(false);
      }
      return;
    }

    if (!ciftciId.trim()) return toast.warning('Lütfen Çiftçi ID numarasını girin.');
    if (ciftciId.length < 20) return toast.warning('Geçersiz bir ID numarası gibi görünüyor.');
    setAdding(true);
    try {
      const res = await axios.post(`${API}/api/veteriner/musteri-ekle`, { ciftciId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message || 'Çiftlik başarıyla kliniğinize bağlandı!');
      setCiftciId('');
      fetchMusteriler();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Çiftlik eklenirken hata oluştu.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <PageContainer>
      <Header>
        <div>
          <h1>Müşteri & Çiftlik Yönetimi</h1>
          <p>Takip ettiğiniz kayıtlı çiftlikler ve ahırları yönetin.</p>
        </div>
      </Header>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setEklemeModu('kod')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: eklemeModu === 'kod' ? '2px solid #2196F3' : '1px solid #e2e8f0',
              background: eklemeModu === 'kod' ? '#E3F2FD' : 'white',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            Çiftlik kodu ile ekle
          </button>
          <button
            type="button"
            onClick={() => setEklemeModu('id')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: eklemeModu === 'id' ? '2px solid #2196F3' : '1px solid #e2e8f0',
              background: eklemeModu === 'id' ? '#E3F2FD' : 'white',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            Çiftçi ID ile ekle
          </button>
        </div>
        <AddForm onSubmit={handleMusteriEkle}>
          {eklemeModu === 'kod' ? (
            <div className="field" style={{ maxWidth: '400px' }}>
              <label>Çiftlik kodu</label>
              <input
                value={ciftlikKodu}
                onChange={e => setCiftlikKodu(e.target.value.toUpperCase())}
                placeholder="Örn: ABC12XYZ (çiftçinin paylaştığı 8 karakterlik kod)"
                maxLength={12}
              />
            </div>
          ) : (
            <div className="field" style={{ maxWidth: '400px' }}>
              <label>Çiftçi ID</label>
              <input
                value={ciftciId}
                onChange={e => setCiftciId(e.target.value)}
                placeholder="24 haneli MongoDB ID..."
              />
            </div>
          )}
          <button type="submit" disabled={adding}>
            {adding ? 'Ekleniyor...' : '+ Bağla / Ekle'}
          </button>
        </AddForm>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>Yükleniyor...</div>
      ) : (
        <Grid>
          {musteriler.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#95a5a6', background: 'white', borderRadius: 12, border: '1px dashed #ced4da' }}>
              Henüz kliniğinize bağlı bir çiftlik bulunmuyor. Yukarıdan ID girerek ekleyebilirsiniz.
            </div>
          ) : (
            musteriler.map(m => (
              <ClientCard key={m._id} onClick={() => navigate(`/musteri-detay/${m._id}`)}>
                <div className="icon">🐄</div>
                <div className="name">{m.isletmeAdi || 'İsimsiz İşletme'}</div>
                <div className="farm">Çiftçi Sahibi: {m.isim}</div>
                <div className="contact">
                  <span>📍 {m.sehir || 'Konum Bilinmiyor'}</span>
                </div>
              </ClientCard>
            ))
          )}
        </Grid>
      )}
    </PageContainer>
  );
}
