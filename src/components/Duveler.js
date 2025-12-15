import { useState } from 'react';
import * as api from '../services/api';


function Duveler({ duveler, setDuveler }) {
const [yeniDuveIsim, setYeniDuveIsim] = useState('');
  const [yeniDuveYas, setYeniDuveYas] = useState('');
  const [yeniDuveKilo, setYeniDuveKilo] = useState('');
  const [yeniDuveKupeNo, setYeniDuveKupeNo] = useState('');
  const [yeniDuveDogumTarihi, setYeniDuveDogumTarihi] = useState('');
  const [yeniDuveTohumlamaTarihi, setYeniDuveTohumlamaTarihi] = useState('');
  const [yeniDuveNotlar, setYeniDuveNotlar] = useState('');

 const duveEkle = async () => {
    if (yeniDuveIsim && yeniDuveYas && yeniDuveKilo && yeniDuveKupeNo) {
      try {
        const response = await api.createDuve({
          isim: yeniDuveIsim,
          yas: parseInt(yeniDuveYas),
          kilo: parseFloat(yeniDuveKilo),
          kupeNo: yeniDuveKupeNo,
          dogumTarihi: yeniDuveDogumTarihi,
          tohumlamaTarihi: yeniDuveTohumlamaTarihi,
          notlar: yeniDuveNotlar,
          eklemeTarihi: new Date().toISOString().split('T')[0]
        });

        const yeniDuve = { ...response.data, id: response.data._id };
        setDuveler([...duveler, yeniDuve]);
        
        // Formu temizle
        setYeniDuveIsim('');
        setYeniDuveYas('');
        setYeniDuveKilo('');
        setYeniDuveKupeNo('');
        setYeniDuveDogumTarihi('');
        setYeniDuveTohumlamaTarihi('');
        setYeniDuveNotlar('');
        
        alert('Düve başarıyla eklendi! 🐄');
      } catch (error) {
        alert('❌ Hata: ' + (error.response?.data?.message || 'Düve eklenemedi!'));
      }
    } else {
      alert('Lütfen zorunlu alanları doldurun!');
    }
  };

 const duveSil = async (id) => {
    if (window.confirm('Bu düveyi silmek istediğinden emin misin?')) {
      try {
        await api.deleteDuve(id);
        setDuveler(duveler.filter(d => d.id !== id));
        alert('Düve silindi! 🗑️');
      } catch (error) {
        alert('❌ Hata: ' + (error.response?.data?.message || 'Düve silinemedi!'));
      }
    }
  };

  const buzagilamaTarihiHesapla = (tohumlamaTarihi) => {
    if (!tohumlamaTarihi) return null;
    const tohumlama = new Date(tohumlamaTarihi);
    const buzagilama = new Date(tohumlama);
    buzagilama.setDate(buzagilama.getDate() + 283); // 9 ay 10 gün
    return buzagilama;
  };

  const kalanGunHesapla = (tohumlamaTarihi) => {
    const buzagilama = buzagilamaTarihiHesapla(tohumlamaTarihi);
    if (!buzagilama) return null;
    const bugun = new Date();
    const farkMs = buzagilama - bugun;
    const farkGun = Math.ceil(farkMs / (1000 * 60 * 60 * 24));
    return farkGun;
  };

  const durumBelirle = (duve) => {
    if (!duve.tohumlamaTarihi) {
      return { durum: 'Tohumlama Bekliyor', renk: '#fff3cd', border: '#ffc107' };
    }
    
    const kalanGun = kalanGunHesapla(duve.tohumlamaTarihi);
    
    if (kalanGun > 30) {
      return { durum: `Gebe (${kalanGun} gün kaldı)`, renk: '#e3f2fd', border: '#2196F3' };
    } else if (kalanGun > 0) {
      return { durum: `Buzağılamaya Yakın (${kalanGun} gün)`, renk: '#fff3cd', border: '#FF9800' };
    } else {
      return { durum: 'Buzağılama Zamanı!', renk: '#ffebee', border: '#f44336' };
    }
  };

  return (
    <div>
      <h2>🐄 Düve Yönetimi</h2>
      
      {/* Özet */}
      <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <p><strong>Toplam Düve:</strong> {duveler.length}</p>
        <p><strong>Gebe:</strong> {duveler.filter(d => d.tohumlamaTarihi).length}</p>
        <p><strong>Tohumlama Bekliyor:</strong> {duveler.filter(d => !d.tohumlamaTarihi).length}</p>
        <p><strong>30 Gün İçinde Buzağılayacak:</strong> {duveler.filter(d => {
          const kalanGun = kalanGunHesapla(d.tohumlamaTarihi);
          return kalanGun && kalanGun <= 30 && kalanGun > 0;
        }).length}</p>
      </div>

      {/* Düve Listesi */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Düve Listesi</h3>
        {duveler.length > 0 ? (
          <div style={{ display: 'grid', gap: '15px' }}>
            {duveler.map((duve) => {
              const durum = durumBelirle(duve);
              const buzagilamaTarihi = buzagilamaTarihiHesapla(duve.tohumlamaTarihi);
              
              return (
                <div 
                  key={duve.id}
                  style={{
                    backgroundColor: durum.renk,
                    padding: '15px',
                    borderRadius: '8px',
                    border: `2px solid ${durum.border}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 5px 0' }}>
                        {duve.isim}
                        <span style={{ color: '#666', fontSize: '14px' }}> #{duve.id} | Küpe: {duve.kupeNo}</span>
                      </h3>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Yaş:</strong> {duve.yas} ay | 
                        <strong> Kilo:</strong> {duve.kilo} kg
                      </p>
                      <p style={{ margin: '5px 0', fontWeight: 'bold', color: durum.border }}>
                        📊 {durum.durum}
                      </p>
                      {buzagilamaTarihi && (
                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                          📅 Tahmini Buzağılama: {buzagilamaTarihi.toLocaleDateString('tr-TR')}
                        </p>
                      )}
                      {duve.notlar && (
                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                          📝 {duve.notlar}
                        </p>
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => duveSil(duve.id)}
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
          <p>Henüz düve eklenmemiş.</p>
        )}
      </div>

      {/* Yeni Düve Ekle */}
      <div style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '8px' }}>
        <h3>➕ Yeni Düve Ekle</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Düve İsmi: *
          </label>
          <input 
            type="text"
            value={yeniDuveIsim}
            onChange={(e) => setYeniDuveIsim(e.target.value)}
            placeholder="Örn: Gülizar"
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
              Yaş (ay): *
            </label>
            <input 
              type="number"
              value={yeniDuveYas}
              onChange={(e) => setYeniDuveYas(e.target.value)}
              placeholder="Örn: 14"
              style={{ 
                width: '100%', 
                padding: '8px', 
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Kilo (kg): *
            </label>
            <input 
              type="number"
              value={yeniDuveKilo}
              onChange={(e) => setYeniDuveKilo(e.target.value)}
              placeholder="Örn: 280"
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
              Küpe Numarası: *
            </label>
            <input 
              type="text"
              value={yeniDuveKupeNo}
              onChange={(e) => setYeniDuveKupeNo(e.target.value)}
              placeholder="Örn: D001"
              style={{ 
                width: '100%', 
                padding: '8px', 
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Doğum Tarihi:
            </label>
            <input 
              type="date"
              value={yeniDuveDogumTarihi}
              onChange={(e) => setYeniDuveDogumTarihi(e.target.value)}
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

        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Tohumlama Tarihi:
          </label>
          <input 
            type="date"
            value={yeniDuveTohumlamaTarihi}
            onChange={(e) => setYeniDuveTohumlamaTarihi(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            style={{ 
              width: '100%', 
              padding: '8px', 
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
          {yeniDuveTohumlamaTarihi && (
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
              💡 Tahmini buzağılama tarihi: {buzagilamaTarihiHesapla(yeniDuveTohumlamaTarihi)?.toLocaleDateString('tr-TR')}
            </p>
          )}
        </div>

        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Notlar:
          </label>
          <textarea 
            value={yeniDuveNotlar}
            onChange={(e) => setYeniDuveNotlar(e.target.value)}
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
          onClick={duveEkle}
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
          Düve Ekle
        </button>
      </div>
    </div>
  );
}

export default Duveler;