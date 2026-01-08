import { useState, useEffect } from 'react';
import * as api from '../services/api';

function Tosunlar() {
  const [tosunlar, setTosunlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [tosunEkrani, setTosunEkrani] = useState(false);
  const [yeniTosun, setYeniTosun] = useState({
    isim: '',
    kupeNo: '',
    dogumTarihi: '',
    kilo: '',
    not: ''
  });

  useEffect(() => {
    tosunlariYukle();
  }, []);

  const tosunlariYukle = async () => {
    setYukleniyor(true);
    try {
      const response = await api.getTosunlar();
      setTosunlar(response.data);
    } catch (error) {
      console.error('Tosunlar yüklenemedi:', error);
    } finally {
      setYukleniyor(false);
    }
  };

  const tosunEkle = async () => {
    if (!yeniTosun.isim || !yeniTosun.kupeNo || !yeniTosun.dogumTarihi) {
      alert('Lütfen tüm zorunlu alanları doldurun!');
      return;
    }

    try {
      await api.createTosun(yeniTosun);
      alert('✅ Tosun eklendi!');
      setTosunEkrani(false);
      setYeniTosun({ isim: '', kupeNo: '', dogumTarihi: '', kilo: '', not: '' });
      tosunlariYukle();
    } catch (error) {
      alert('❌ Hata: ' + (error.response?.data?.message || 'Tosun eklenemedi!'));
    }
  };

  const tosunSil = async (id) => {
    if (!window.confirm('Bu tosunu silmek istediğinize emin misiniz?')) return;

    try {
      await api.deleteTosun(id);
      alert('✅ Tosun silindi!');
      tosunlariYukle();
    } catch (error) {
      alert('❌ Hata: Tosun silinemedi!');
    }
  };

  if (yukleniyor) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Yükleniyor...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>🐂 Tosunlar ({tosunlar.length})</h2>
        <button
          onClick={() => setTosunEkrani(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          + Tosun Ekle
        </button>
      </div>

      {tosunlar.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {tosunlar.map((tosun) => {
            const yas = Math.floor((new Date() - new Date(tosun.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
            
            return (
              <div
                key={tosun._id}
                style={{
                  backgroundColor: '#fff',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '2px solid #FF9800'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>
                      🐂 {tosun.isim}
                    </h3>
                    <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
                      <p style={{ margin: '5px 0' }}>
                        <strong>Küpe No:</strong> {tosun.kupeNo}
                      </p>
                      <p style={{ margin: '5px 0' }}>
                        <strong>Yaş:</strong> {yas} ay
                      </p>
                      <p style={{ margin: '5px 0' }}>
                        <strong>Doğum Tarihi:</strong> {new Date(tosun.dogumTarihi).toLocaleDateString('tr-TR')}
                      </p>
                      {tosun.kilo > 0 && (
                        <p style={{ margin: '5px 0' }}>
                          <strong>Kilo:</strong> {tosun.kilo} kg
                        </p>
                      )}
                      {tosun.satisTarihi && (
                        <p style={{ margin: '5px 0', color: '#4CAF50' }}>
                          <strong>Satış:</strong> {new Date(tosun.satisTarihi).toLocaleDateString('tr-TR')} - {tosun.satisFiyati} ₺
                        </p>
                      )}
                      {tosun.not && (
                        <p style={{ margin: '5px 0', fontStyle: 'italic' }}>
                          <strong>Not:</strong> {tosun.not}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => tosunSil(tosun._id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🐂</div>
          <p>Henüz tosun kaydı yok</p>
        </div>
      )}

      {/* TOSUN EKLEME MODAL */}
      {tosunEkrani && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            padding: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ marginTop: 0 }}>🐂 Yeni Tosun Ekle</h2>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                İsim: *
              </label>
              <input
                type="text"
                value={yeniTosun.isim}
                onChange={(e) => setYeniTosun({ ...yeniTosun, isim: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Küpe No: *
              </label>
              <input
                type="text"
                value={yeniTosun.kupeNo}
                onChange={(e) => setYeniTosun({ ...yeniTosun, kupeNo: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Doğum Tarihi: *
              </label>
              <input
                type="date"
                value={yeniTosun.dogumTarihi}
                onChange={(e) => setYeniTosun({ ...yeniTosun, dogumTarihi: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Kilo (kg):
              </label>
              <input
                type="number"
                value={yeniTosun.kilo}
                onChange={(e) => setYeniTosun({ ...yeniTosun, kilo: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Not:
              </label>
              <textarea
                value={yeniTosun.not}
                onChange={(e) => setYeniTosun({ ...yeniTosun, not: e.target.value })}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setTosunEkrani(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#e0e0e0',
                  color: '#666',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                İptal
              </button>
              <button
                onClick={tosunEkle}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tosunlar;