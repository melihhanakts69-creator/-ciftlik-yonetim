import { useState } from 'react';
import * as api from '../services/api';


function Buzagilar({ buzagilar, setBuzagilar, inekler }) {
const [yeniBuzagiIsim, setYeniBuzagiIsim] = useState('');
  const [yeniBuzagiAnne, setYeniBuzagiAnne] = useState('');
  const [yeniBuzagiDogumTarihi, setYeniBuzagiDogumTarihi] = useState('');
  const [yeniBuzagiCinsiyet, setYeniBuzagiCinsiyet] = useState('disi');
  const [yeniBuzagiKilo, setYeniBuzagiKilo] = useState('');
  const [yeniBuzagiNotlar, setYeniBuzagiNotlar] = useState('');

 const buzagiEkle = async () => {
    console.log('1️⃣ Buzağı ekleme başladı!', {
      yeniBuzagiIsim,
      yeniBuzagiAnne,
      yeniBuzagiDogumTarihi,
      yeniBuzagiCinsiyet,
      yeniBuzagiKilo
    });
    
    if (yeniBuzagiIsim && yeniBuzagiAnne && yeniBuzagiDogumTarihi && yeniBuzagiCinsiyet && yeniBuzagiKilo) {
      console.log('2️⃣ Validasyon geçti!');
      try {
        console.log('3️⃣ İnek bulunuyor...');
        const anneInek = inekler.find(i => i.id === yeniBuzagiAnne);
        console.log('4️⃣ Anne inek:', anneInek);
        
        console.log('5️⃣ API çağrısı yapılıyor...');
        
        const response = await api.createBuzagi({
          isim: yeniBuzagiIsim,
          anneId: anneInek.id,
          anneIsim: anneInek.isim,
          dogumTarihi: yeniBuzagiDogumTarihi,
          cinsiyet: yeniBuzagiCinsiyet,
          kilo: parseFloat(yeniBuzagiKilo),
          notlar: yeniBuzagiNotlar,
          eklemeTarihi: new Date().toISOString().split('T')[0]
        });

        const yeniBuzagi = { ...response.data, id: response.data._id };
        setBuzagilar([...buzagilar, yeniBuzagi]);
        
      // Formu temizle
        setYeniBuzagiIsim('');
        setYeniBuzagiAnne('');
        setYeniBuzagiDogumTarihi('');
        setYeniBuzagiCinsiyet('disi');
        setYeniBuzagiKilo('');
        setYeniBuzagiNotlar('');
        
        alert('Buzağı başarıyla eklendi! 🍼');
      } catch (error) {
        alert('❌ Hata: ' + (error.response?.data?.message || 'Buzağı eklenemedi!'));
      }
    } else {
      alert('Lütfen tüm zorunlu alanları doldurun!');
    }
  };

  const buzagiSil = async (id) => {
    if (window.confirm('Bu buzağıyı silmek istediğinden emin misin?')) {
      try {
        await api.deleteBuzagi(id);
        setBuzagilar(buzagilar.filter(b => b.id !== id));
        alert('Buzağı silindi! 🗑️');
      } catch (error) {
        alert('❌ Hata: ' + (error.response?.data?.message || 'Buzağı silinemedi!'));
      }
    }
  };

  const yasHesapla = (dogumTarihi) => {
    const dogum = new Date(dogumTarihi);
    const bugun = new Date();
    const farkMs = bugun - dogum;
    const farkGun = Math.floor(farkMs / (1000 * 60 * 60 * 24));
    const farkAy = Math.floor(farkGun / 30);
    
    if (farkAy < 1) {
      return `${farkGun} günlük`;
    } else if (farkAy < 12) {
      return `${farkAy} aylık`;
    } else {
      const yil = Math.floor(farkAy / 12);
      const kalanAy = farkAy % 12;
      return `${yil} yıl ${kalanAy} ay`;
    }
  };

  const durmBelirle = (dogumTarihi) => {
    const dogum = new Date(dogumTarihi);
    const bugun = new Date();
    const farkGun = Math.floor((bugun - dogum) / (1000 * 60 * 60 * 24));
    const farkAy = Math.floor(farkGun / 30);
    
    if (farkAy < 2) {
      return { durum: 'Süt İçme Dönemi', renk: '#fff3cd', border: '#ffc107' };
    } else if (farkAy < 6) {
      return { durum: 'Büyüme Dönemi', renk: '#e3f2fd', border: '#2196F3' };
    } else {
      return { durum: 'Düveye Geçiş Hazır', renk: '#e8f5e9', border: '#4CAF50' };
    }
  };

  return (
    <div>
      <h2>🍼 Buzağı Yönetimi</h2>
      
      {/* Özet */}
      <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <p><strong>Toplam Buzağı:</strong> {buzagilar.length}</p>
        <p><strong>Dişi:</strong> {buzagilar.filter(b => b.cinsiyet === 'disi').length}</p>
        <p><strong>Erkek:</strong> {buzagilar.filter(b => b.cinsiyet === 'erkek').length}</p>
        <p><strong>Düveye Geçmeye Hazır:</strong> {buzagilar.filter(b => {
          const farkAy = Math.floor((new Date() - new Date(b.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
          return farkAy >= 6;
        }).length}</p>
      </div>

      {/* Buzağı Listesi */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Buzağı Listesi</h3>
        {buzagilar.length > 0 ? (
          <div style={{ display: 'grid', gap: '15px' }}>
            {buzagilar.map((buzagi) => {
              const durum = durmBelirle(buzagi.dogumTarihi);
              return (
                <div 
                  key={buzagi.id}
                  style={{
                    backgroundColor: durum.renk,
                    padding: '15px',
                    borderRadius: '8px',
                    border: `2px solid ${durum.border}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0' }}>
                        {buzagi.isim} {buzagi.cinsiyet === 'disi' ? '♀' : '♂'}
                        <span style={{ color: '#666', fontSize: '14px' }}> #{buzagi.id}</span>
                      </h3>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Anne:</strong> {buzagi.anneIsim} | 
                        <strong> Yaş:</strong> {yasHesapla(buzagi.dogumTarihi)} | 
                        <strong> Kilo:</strong> {buzagi.kilo} kg
                      </p>
                      <p style={{ margin: '5px 0', fontWeight: 'bold', color: durum.border }}>
                        📊 {durum.durum}
                      </p>
                      {buzagi.notlar && (
                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                          📝 {buzagi.notlar}
                        </p>
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => buzagiSil(buzagi.id)}
                        style={{
                          padding: '8px 15px',
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
                </div>
              );
            })}
          </div>
        ) : (
          <p>Henüz buzağı eklenmemiş.</p>
        )}
      </div>

      {/* Yeni Buzağı Ekle */}
      <div style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '8px' }}>
        <h3>➕ Yeni Buzağı Ekle</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Buzağı İsmi: *
          </label>
          <input 
            type="text"
            value={yeniBuzagiIsim}
            onChange={(e) => setYeniBuzagiIsim(e.target.value)}
            placeholder="Örn: Minnoş"
            style={{ 
              width: '100%', 
              padding: '8px', 
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Anne İnek: *
            </label>
            <select
              value={yeniBuzagiAnne}
              onChange={(e) => setYeniBuzagiAnne(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px', 
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            >
              <option value="">Seçiniz...</option>
              {inekler.map(inek => (
                <option key={inek.id} value={inek.id}>
                  {inek.isim} (#{inek.id})
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
              value={yeniBuzagiDogumTarihi}
              onChange={(e) => setYeniBuzagiDogumTarihi(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={{ 
                width: '100%', 
                padding: '8px', 
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Cinsiyet: *
            </label>
            <select
              value={yeniBuzagiCinsiyet}
              onChange={(e) => setYeniBuzagiCinsiyet(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px', 
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            >
              <option value="disi">Dişi ♀</option>
              <option value="erkek">Erkek ♂</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Kilo (kg): *
            </label>
            <input 
              type="number"
              value={yeniBuzagiKilo}
              onChange={(e) => setYeniBuzagiKilo(e.target.value)}
              placeholder="Örn: 35"
              style={{ 
                width: '100%', 
                padding: '8px', 
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Notlar:
          </label>
          <textarea 
            value={yeniBuzagiNotlar}
            onChange={(e) => setYeniBuzagiNotlar(e.target.value)}
            rows="3"
            placeholder="Sağlık durumu, özellikler..."
            style={{ 
              width: '100%', 
              padding: '8px', 
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontFamily: 'Arial'
            }}
          />
        </div>

        <button 
          onClick={buzagiEkle}
          style={{ 
            padding: '12px 30px', 
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '20px'
          }}
        >
          Buzağı Ekle
        </button>
      </div>
    </div>
  );
}

export default Buzagilar;