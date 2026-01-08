import { useState, useEffect } from 'react';
import * as api from '../services/api';

function Buzagilar({ buzagilar, setBuzagilar , inekler }) {
  const [buzagiEkrani, setBuzagiEkrani] = useState(false);
  const [yeniBuzagi, setYeniBuzagi] = useState({
    isim: '',
    kupeNo: '',
    cinsiyet: 'disi',
    dogumTarihi: '',
    anneKupeNo: '',
    babaKupeNo: '',
    kilo: ''
  });

  const buzagiEkle = async () => {
    if (!yeniBuzagi.isim || !yeniBuzagi.kupeNo || !yeniBuzagi.dogumTarihi) {
      alert('Lütfen zorunlu alanları doldurun!');
      return;
    }

    try {
      const response = await api.createBuzagi(yeniBuzagi);
      const yeniData = { ...response.data, id: response.data._id };
      setBuzagilar([...buzagilar, yeniData]);
      
      setYeniBuzagi({
        isim: '',
        kupeNo: '',
        cinsiyet: 'disi',
        dogumTarihi: '',
        anneKupeNo: '',
        babaKupeNo: '',
        kilo: ''
      });
      
      setBuzagiEkrani(false);
      alert('✅ Buzağı eklendi!');
    } catch (error) {
      alert('❌ Hata: ' + (error.response?.data?.message || 'Buzağı eklenemedi!'));
    }
  };

  const buzagiSil = async (id) => {
    if (!window.confirm('Bu buzağıyı silmek istediğinize emin misiniz?')) return;

    try {
      await api.deleteBuzagi(id);
      setBuzagilar(buzagilar.filter(b => b.id !== id));
      alert('✅ Buzağı silindi!');
    } catch (error) {
      alert('❌ Hata: Buzağı silinemedi!');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>🍼 Buzağılar ({buzagilar.length})</h2>
        <button
          onClick={() => setBuzagiEkrani(true)}
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
          + Buzağı Ekle
        </button>
      </div>
      
      {/* Özet */}
      <div style={{ 
        backgroundColor: '#fff3e0', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>📊 Özet</h3>
        <p><strong>Toplam Buzağı:</strong> {buzagilar.length}</p>
        <p><strong>Dişi:</strong> {buzagilar.filter(b => b.cinsiyet === 'disi').length}</p>
        <p><strong>Erkek:</strong> {buzagilar.filter(b => b.cinsiyet === 'erkek').length}</p>
        {buzagilar.filter(b => {
          const farkAy = Math.floor((new Date() - new Date(b.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
          return farkAy >= 6;
        }).length > 0 && (
          <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>
            ✅ Düveye geçmeye hazır: {buzagilar.filter(b => {
              const farkAy = Math.floor((new Date() - new Date(b.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
              return farkAy >= 6;
            }).length}
          </p>
        )}
      </div>

      {/* Buzağı Listesi */}
      <h3>📋 Buzağı Listesi</h3>
      {buzagilar.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {buzagilar.map((buzagi) => {
            const yas = Math.floor((new Date() - new Date(buzagi.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
            const gecisHazir = yas >= 6;
            
            return (
              <div
                key={buzagi.id}
                style={{
                  backgroundColor: gecisHazir ? '#e8f5e9' : '#fff',
                  padding: '15px',
                  borderRadius: '8px',
                  border: gecisHazir ? '2px solid #4CAF50' : '1px solid #ddd'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>
                      {buzagi.cinsiyet === 'disi' ? '♀' : '♂'} {buzagi.isim}
                    </h4>
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                      #{buzagi.kupeNo}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>
                      <strong>Anne:</strong> {buzagi.anneKupeNo || 'Belirtilmemiş'} | 
                      <strong> Yaş:</strong> {yas} aylık | 
                      <strong> Kilo:</strong> {buzagi.kilo || '-'} kg
                    </p>
                    {gecisHazir && (
                      <p style={{ 
                        margin: '10px 0 0 0', 
                        padding: '8px', 
                        backgroundColor: '#4CAF50', 
                        color: 'white',
                        borderRadius: '4px',
                        display: 'inline-block',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        📊 Düveye Geçiş Hazır
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => buzagiSil(buzagi.id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
          Henüz buzağı kaydı yok
        </p>
      )}

      {/* BUZAĞI EKLEME MODAL */}
      {buzagiEkrani && (
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
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            padding: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>🍼 Yeni Buzağı Ekle</h2>
              <button
                onClick={() => setBuzagiEkrani(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✕ Kapat
              </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Buzağı İsmi: *
              </label>
              <input
                type="text"
                placeholder="Örn: Minnoş"
                value={yeniBuzagi.isim}
                onChange={(e) => setYeniBuzagi({ ...yeniBuzagi, isim: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Anne İnek: *
                </label>
                <select
                  value={yeniBuzagi.anneKupeNo}
                  onChange={(e) => setYeniBuzagi({ ...yeniBuzagi, anneKupeNo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                >
                  <option value="">Seçiniz...</option>
                  {inekler && inekler.map(inek => (
                    <option key={inek.id} value={inek.kupeNo}>
                      {inek.isim} ({inek.kupeNo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Doğum Tarihi: *
                </label>
                <input
                  type="date"
                  value={yeniBuzagi.dogumTarihi}
                  onChange={(e) => setYeniBuzagi({ ...yeniBuzagi, dogumTarihi: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Küpe No: *
                </label>
                <input
                  type="text"
                  placeholder="Örn: BZ001"
                  value={yeniBuzagi.kupeNo}
                  onChange={(e) => setYeniBuzagi({ ...yeniBuzagi, kupeNo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Cinsiyet: *
                </label>
                <select
                  value={yeniBuzagi.cinsiyet}
                  onChange={(e) => setYeniBuzagi({ ...yeniBuzagi, cinsiyet: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                >
                  <option value="disi">♀ Dişi</option>
                  <option value="erkek">♂ Erkek</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Kilo (kg):
              </label>
              <input
                type="number"
                placeholder="Örn: 45"
                value={yeniBuzagi.kilo}
                onChange={(e) => setYeniBuzagi({ ...yeniBuzagi, kilo: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setBuzagiEkrani(false)}
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
                onClick={buzagiEkle}
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

export default Buzagilar;