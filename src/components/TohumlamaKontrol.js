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

 const durumGuncelle = async (item, gebelikDurumu) => {
    const { hayvan, hayvanTipi } = item;
    
    try {
      const token = localStorage.getItem('token');
      
      // İnek veya Düve güncelle
      const endpoint = hayvanTipi === 'düve' 
        ? `${API_URL}/duveler/${hayvan._id}` 
        : `${API_URL}/inekler/${hayvan._id}`;
      
      await axios.put(endpoint, {
        ...hayvan,
        gebelikDurumu: gebelikDurumu,
        tohumlamaTarihi: gebelikDurumu === 'Gebe' ? item.tohumlama.tarih : hayvan.tohumlamaTarihi
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Timeline kaydı ekle
      if (item.tohumlama._id) {
        await axios.post(`${API_URL}/timeline`, {
          hayvanId: hayvan._id,
          hayvanTipi: hayvanTipi === 'düve' ? 'düve' : 'inek',
          tip: gebelikDurumu === 'Gebe' ? 'dogum' : 'tohumlama',
          tarih: new Date().toISOString().split('T')[0],
          aciklama: gebelikDurumu === 'Gebe' 
            ? `Gebelik kontrolü pozitif (${item.tohumlama.tarih} tohumlama)`
            : `Gebelik kontrolü negatif, yeni tohumlama gerekli`
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      alert(`✅ ${hayvan.isim} - ${gebelikDurumu === 'Gebe' ? 'Gebe olarak' : 'Gebe değil olarak'} kaydedildi!`);
      
      kontrolleriYukle();
    } catch (error) {
      alert('❌ Hata: ' + (error.response?.data?.message || 'Güncelleme yapılamadı!'));
    }
  }; // ← BURASI KAPANIŞI

 // TOHUMLAMA SİL FONKSİYONU
  const tohumlamaSil = async (item) => {  // ← tohumlama → item
    if (!window.confirm('Bu tohumlama kaydını silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Timeline kaydı varsa sil
      if (item.tohumlama._id) {
        await axios.delete(`${API_URL}/timeline/${item.tohumlama._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Hayvanın tohumlama tarihini temizle
      const endpoint = item.hayvanTipi === 'düve' 
        ? `${API_URL}/duveler/${item.hayvan._id}` 
        : `${API_URL}/inekler/${item.hayvan._id}`;
      
      await axios.put(endpoint, {
        ...item.hayvan,
        tohumlamaTarihi: null,
        gebelikDurumu: 'Belirsiz'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('✅ Tohumlama kaydı silindi!');
      kontrolleriYukle();
    } catch (error) {
      alert('❌ Hata: ' + (error.response?.data?.message || 'Kayıt silinemedi!'));
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
              key={item.hayvan._id}
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '3px solid #FF9800',
                backgroundColor: '#fff3e0'
              }}
            >
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {item.hayvanTipi === 'düve' ? '🐄' : '🐮'} {item.hayvan.isim} 
                  <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
                    (Küpe: {item.hayvan.kupeNo})
                  </span>
                  <span style={{ 
                    marginLeft: '10px', 
                    padding: '4px 8px', 
                    backgroundColor: item.hayvanTipi === 'düve' ? '#4CAF50' : '#2196F3',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {item.hayvanTipi === 'düve' ? 'DÜVE' : 'İNEK'}
                  </span>
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
                    onClick={() => durumGuncelle(item, 'Gebe')}
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
                    onClick={() => durumGuncelle(item, 'Gebe Değil')}
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
              <button
                onClick={() => tohumlamaSil(item)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginTop: '10px'
                }}
              >
                🗑️ Tohumlama Kaydını Sil
              </button>

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