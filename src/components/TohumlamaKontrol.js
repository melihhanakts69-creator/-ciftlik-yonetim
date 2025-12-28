import { useState, useEffect } from 'react';
import axios from 'axios';
import * as api from '../services/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
function TohumlamaKontrol() {
  const [bekleyenler, setBekleyenler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    kontrolleriYukle();
  }, []);

 const kontrolleriYukle = async () => {
    setYukleniyor(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/timeline/kontrol-bekleyenler`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBekleyenler(response.data);
    } catch (error) {
      console.error('Kontroller yüklenemedi:', error);
    } finally {
      setYukleniyor(false);
    }
  };

  const durumGuncelle = async (inek, tohumlama, gebelikDurumu) => {
    try {
      // İnek durumunu güncelle
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_URL}/inekler/${inek._id}`, {
        ...inek,
        gebelikDurumu: gebelikDurumu,
        tohumlamaTarihi: gebelikDurumu === 'Gebe' ? tohumlama.tarih : null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await axios.post(`${API_URL}/timeline`, {
      });

      // Timeline kaydı ekle
      await api.createTimeline({
        hayvanId: inek._id,
        hayvanTipi: 'inek',
        tip: gebelikDurumu === 'Gebe' ? 'dogum' : 'tohumlama',
        tarih: new Date().toISOString().split('T')[0],
        aciklama: gebelikDurumu === 'Gebe' 
          ? `Gebelik kontrolü pozitif (${tohumlama.tarih} tohumlama)`
          : `Gebelik kontrolü negatif, yeni tohumlama gerekli`
      });

      alert(`✅ ${inek.isim} - ${gebelikDurumu === 'Gebe' ? 'Gebe olarak' : 'Gebe değil olarak'} kaydedildi!`);
      
      // Listeyi yenile
      kontrolleriYukle();
    } catch (error) {
      alert('❌ Hata: ' + (error.response?.data?.message || 'Güncelleme yapılamadı!'));
    }
  };

  if (yukleniyor) {
    return (
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <p style={{ color: '#666' }}>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
        🩺 Tohumlama Kontrolleri
        {bekleyenler.length > 0 && (
          <span style={{
            backgroundColor: '#FF9800',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '14px'
          }}>
            {bekleyenler.length}
          </span>
        )}
      </h2>

      {bekleyenler.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {bekleyenler.map((item) => (
            <div
              key={item.inek._id}
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '3px solid #FF9800',
                backgroundColor: '#fff3e0'
              }}
            >
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {item.inek.isim} (Küpe: {item.inek.kupeNo})
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                  Tohumlama: {new Date(item.tohumlama.tarih).toLocaleDateString('tr-TR')}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF9800' }}>
                  ⏰ {item.gecenGun} gün geçti - Kontrol zamanı!
                </div>
              </div>

              <div style={{ 
                backgroundColor: '#fff',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
                  ❓ Gebelik kontrolü yapıldı mı?
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => durumGuncelle(item.inek, item.tohumlama, 'Gebe')}
                    style={{
                      flex: 1,
                      minWidth: '120px',
                      padding: '12px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    ✅ Gebe
                  </button>
                  <button
                    onClick={() => durumGuncelle(item.inek, item.tohumlama, 'Gebe Değil')}
                    style={{
                      flex: 1,
                      minWidth: '120px',
                      padding: '12px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    ❌ Gebe Değil
                  </button>
                </div>
              </div>

              {item.tohumlama.aciklama && (
                <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                  Not: {item.tohumlama.aciklama}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#999'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
          <p style={{ margin: 0, fontSize: '16px' }}>
            Kontrol bekleyen tohumlama yok
          </p>
        </div>
      )}
    </div>
  );
}

export default TohumlamaKontrol;