import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
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
  h1 { font-size: 24px; font-weight: 700; color: #2c3e50; margin: 0; display: flex; align-items: center; gap: 10px;}
  .back-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #7f8c8d; }
`;

const Grid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;
`;

const AnimalCard = styled.div`
  background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02); display: flex; flex-direction: column; transition: all 0.2s;
  
  .header-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
  .icon { width: 44px; height: 44px; border-radius: 10px; background: #FFF3E0; color: #E65100; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .tag { background: #f1f5f9; color: #64748b; font-size: 11px; padding: 4px 8px; border-radius: 20px; font-weight: 600; height: fit-content; }
  
  .name { font-size: 16px; font-weight: 700; color: #2c3e50; }
  .sub { font-size: 13px; color: #7f8c8d; margin-bottom: 16px; margin-top: 4px; }
  
  .actions {
    display: flex; gap: 8px; margin-top: auto;
    button { flex: 1; padding: 10px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .btn-health { background: #E8F5E9; color: #2E7D32; }
    .btn-health:hover { background: #C8E6C9; }
    .btn-seed { background: #E3F2FD; color: #1565C0; }
    .btn-seed:hover { background: #BBDEFB; }
  }
`;

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
`;

const ModalBox = styled.div`
  background: white; width: 90%; max-width: 500px; border-radius: 16px;
  padding: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  h2 { margin: 0 0 20px 0; font-size: 20px; color: #2c3e50; }
  
  .form-group {
    margin-bottom: 16px;
    label { display: block; font-size: 13px; font-weight: 600; color: #34495e; margin-bottom: 6px; }
    input, select, textarea {
      width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px;
      font-size: 14px; outline: none; transition: 0.2s; background: #f8fafc; box-sizing: border-box;
      &:focus { border-color: #2196F3; background: white; }
    }
  }

  .buttons { display: flex; gap: 10px; margin-top: 24px; }
  .btn-submit { flex: 2; background: #2196F3; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 700; cursor: pointer; }
  .btn-cancel { flex: 1; background: #f1f5f9; color: #64748b; border: none; padding: 12px; border-radius: 8px; font-weight: 700; cursor: pointer; }
`;


export default function MusteriDetay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hayvanlar, setHayvanlar] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [islemTipi, setIslemTipi] = useState('hastalik'); // 'hastalik' or 'tohumlama'
  const [secilenHayvan, setSecilenHayvan] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    tani: '', tedavi: '', ilacAd: '', notlar: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/veteriner/musteri/${id}/hayvanlar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Tüm kategorileri düzleştir (İnek, Düve vb)
      const allAnimals = [
        ...res.data.inekler,
        ...res.data.buzagilar,
        ...res.data.duveler,
        ...res.data.tosunlar
      ];
      setHayvanlar(allAnimals);
    } catch (e) {
      toast.error('Çiftlik verileri yüklenirken bir sorun oluştu.');
      if(e.response?.status === 403) navigate('/hastalar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const openForm = (tip, hayvan) => {
    setIslemTipi(tip);
    setSecilenHayvan(hayvan);
    setFormData({ tani: '', tedavi: '', ilacAd: '', notlar: '' });
    setModalOpen(true);
  };

  const handleKayıtSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        hayvanTipi: secilenHayvan.tip,
        hayvanIsim: secilenHayvan.isim || '',
        hayvanKupeNo: secilenHayvan.kupeNo || '',
        tip: islemTipi === 'tohumlama' ? 'muayene' : 'hastalik', // Backend'deki validasyona uygun
        tani: islemTipi === 'tohumlama' ? 'Suni Tohumlama' : formData.tani,
        tedavi: islemTipi === 'tohumlama' ? formData.ilacAd : formData.tedavi, // Tohum cinsini ilacAd alanından da alabiliriz
        ilaclar: formData.ilacAd ? [{ ilacAdi: formData.ilacAd }] : [],
        notlar: formData.notlar
      };

      await axios.post(`${API}/api/veteriner/musteri/${id}/hayvan/${secilenHayvan._id}/saglik`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Kayıt başarıyla oluşturuldu ve çiftçiye bildirim gönderildi!');
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'İşlem başarısız.');
    }
  };

  return (
    <PageContainer>
      <Header>
        <h1>
          <button className="back-btn" onClick={() => navigate('/hastalar')}>←</button>
          Çiftlik Hayvanları
        </h1>
      </Header>

      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <Grid>
          {hayvanlar.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: 20, textAlign: 'center', background: 'white', borderRadius: 12 }}>Bu çiftliğe ait aktif hayvan kaydı bulunmuyor.</div>
          ) : hayvanlar.map(h => (
            <AnimalCard key={h._id}>
              <div className="header-row">
                <div className="icon">🐄</div>
                <div className="tag">{h.tip.toUpperCase()}</div>
              </div>
              <div className="name">{h.kupeNo ? `${h.kupeNo} Küpeli` : 'İsimsiz'} {h.isim && `(${h.isim})`}</div>
              <div className="sub">{h.irk || 'Irk Belirtilmemiş'} • Durum: {h.guncelDurum || h.saglikDurumu || 'Bilinmiyor'}</div>
              
              <div className="actions">
                <button className="btn-health" onClick={() => openForm('hastalik', h)}>+ Sağlık & İlaç</button>
                {h.tip === 'inek' || h.tip === 'duve' ? (
                  <button className="btn-seed" onClick={() => openForm('tohumlama', h)}>+ Tohumlama</button>
                ) : null}
              </div>
            </AnimalCard>
          ))}
        </Grid>
      )}

      {/* İşlem Modalı */}
      {modalOpen && (
        <ModalOverlay>
          <ModalBox>
            <h2>{islemTipi === 'tohumlama' ? 'Suni Tohumlama Uygulaması' : 'Teşhis ve Reçete Yaz'}</h2>
            <form onSubmit={handleKayıtSubmit}>
              <div className="form-group" style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 20 }}>
                <strong style={{color: '#2c3e50'}}>{secilenHayvan?.kupeNo}</strong> ({secilenHayvan?.tip})
              </div>

              {islemTipi === 'hastalik' ? (
                <>
                  <div className="form-group">
                    <label>Tanı / Teşhis</label>
                    <input required value={formData.tani} onChange={e => setFormData({...formData, tani: e.target.value})} placeholder="Örn: Süt Humması, Mastitis" />
                  </div>
                  <div className="form-group">
                    <label>Uygulanan Tedavi</label>
                    <input required value={formData.tedavi} onChange={e => setFormData({...formData, tedavi: e.target.value})} placeholder="1 Hafta Gözlem, Antibiyotik" />
                  </div>
                  <div className="form-group">
                    <label>Reçete Edilen İlaç / Aşı</label>
                    <input value={formData.ilacAd} onChange={e => setFormData({...formData, ilacAd: e.target.value})} placeholder="İlaç Adı (Opsiyonel)" />
                  </div>
                </>
              ) : (
                 <>
                  <div className="form-group">
                    <label>Kullanılan Tohum (Sperma) Cinsi</label>
                    <input required value={formData.ilacAd} onChange={e => setFormData({...formData, ilacAd: e.target.value})} placeholder="Holstein, Simental vs..." />
                  </div>
                 </>
              )}

              <div className="form-group">
                <label>Notlar (Çiftçiye İletilecek)</label>
                <textarea rows="3" value={formData.notlar} onChange={e => setFormData({...formData, notlar: e.target.value})} placeholder="Çiftçinin görmesi için not..." />
              </div>

              <div className="buttons">
                <button type="submit" className="btn-submit">Kaydet ve Müşteriye Bildir</button>
                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>İptal</button>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}

    </PageContainer>
  );
}
