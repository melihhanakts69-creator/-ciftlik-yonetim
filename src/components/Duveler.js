import { useState } from 'react';
import * as api from '../services/api';

function Duveler({ duveler, setDuveler, inekler }) {
  const [duveEkrani, setDuveEkrani] = useState(false);
  const [yeniDuve, setYeniDuve] = useState({
    isim: '',
    kupeNo: '',
    dogumTarihi: '',
    yas: '',
    kilo: '',
    anneKupeNo: '',
    tohumlamaTarihi: '',
    gebelikDurumu: 'Belirsiz',
    not: ''
  });

  const duveEkle = async () => {
    if (!yeniDuve.isim || !yeniDuve.kupeNo || !yeniDuve.dogumTarihi || !yeniDuve.yas || !yeniDuve.kilo) {
      alert('Lütfen zorunlu alanları doldurun!');
      return;
    }

    try {
      const response = await api.createDuve({
        isim: yeniDuve.isim,
        kupeNo: yeniDuve.kupeNo,
        dogumTarihi: yeniDuve.dogumTarihi,
        yas: parseInt(yeniDuve.yas),
        kilo: parseFloat(yeniDuve.kilo),
        anneKupeNo: yeniDuve.anneKupeNo,
        tohumlamaTarihi: yeniDuve.tohumlamaTarihi || null,
        gebelikDurumu: yeniDuve.gebelikDurumu,
        notlar: yeniDuve.not
      });

      const yeniData = { ...response.data, id: response.data._id };
      setDuveler([...duveler, yeniData]);
      
      setYeniDuve({
        isim: '',
        kupeNo: '',
        dogumTarihi: '',
        yas: '',
        kilo: '',
        anneKupeNo: '',
        tohumlamaTarihi: '',
        gebelikDurumu: 'Belirsiz',
        not: ''
      });
      
      setDuveEkrani(false);
      alert('✅ Düve eklendi!');
    } catch (error) {
      alert('❌ Hata: ' + (error.response?.data?.message || 'Düve eklenemedi!'));
    }
  };

  const duveSil = async (id) => {
    if (!window.confirm('Bu düveyi silmek istediğinize emin misiniz?')) return;

    try {
      await api.deleteDuve(id);
      setDuveler(duveler.filter(d => d.id !== id));
      alert('✅ Düve silindi!');
    } catch (error) {
      alert('❌ Hata: Düve silinemedi!');
    }
  };

  // Doğum tarihi hesaplama (283 gün)
  const dogumTarihiHesapla = (tohumlamaTarihi) => {
    if (!tohumlamaTarihi) return null;
    const tohumlama = new Date(tohumlamaTarihi);
    const dogum = new Date(tohumlama);
    dogum.setDate(dogum.getDate() + 283);
    return dogum;
  };

  // Kalan gün hesaplama
  const kalanGunHesapla = (tohumlamaTarihi) => {
    const dogum = dogumTarihiHesapla(tohumlamaTarihi);
    if (!dogum) return null;
    const bugun = new Date();
    const fark = Math.ceil((dogum - bugun) / (1000 * 60 * 60 * 24));
    return fark;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>🐄 Düveler ({duveler.length})</h2>
        <button
          onClick={() => setDuveEkrani(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          + Düve Ekle
        </button>
      </div>
      
      {/* Özet */}
      <div style={{ 
        backgroundColor: '#e8f5e9', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>📊 Özet</h3>
        <p><strong>Toplam Düve:</strong> {duveler.length}</p>
        <p><strong>Gebe:</strong> {duveler.filter(d => d.gebelikDurumu === 'Gebe').length}</p>
        <p><strong>Belirsiz:</strong> {duveler.filter(d => d.gebelikDurumu === 'Belirsiz').length}</p>
        <p><strong>Gebe Değil:</strong> {duveler.filter(d => d.gebelikDurumu === 'Gebe Değil').length}</p>
        
        {duveler.filter(d => {
          const kalan = kalanGunHesapla(d.tohumlamaTarihi);
          return kalan !== null && kalan > 0 && kalan <= 30;
        }).length > 0 && (
          <p style={{ color: '#FF9800', fontWeight: 'bold', marginTop: '10px' }}>
            ⚠️ 30 gün içinde doğum yapacak: {duveler.filter(d => {
              const kalan = kalanGunHesapla(d.tohumlamaTarihi);
              return kalan !== null && kalan > 0 && kalan <= 30;
            }).length}
          </p>
        )}
      </div>

      {/* Düve Listesi */}
      <h3>📋 Düve Listesi</h3>
      {duveler.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {duveler.map((duve) => {
            const yas = Math.floor((new Date() - new Date(duve.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
            const kalanGun = kalanGunHesapla(duve.tohumlamaTarihi);
            const dogumTarihi = dogumTarihiHesapla(duve.tohumlamaTarihi);
            
            return (
              <div
                key={duve.id}
                style={{
                  backgroundColor: duve.gebelikDurumu === 'Gebe' ? '#e8f5e9' : '#fff',
                  padding: '15px',
                  borderRadius: '8px',
                  border: duve.gebelikDurumu === 'Gebe' ? '2px solid #4CAF50' : '1px solid #ddd'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0' }}>
                      🐄 {duve.isim}
                    </h4>
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                      #{duve.kupeNo}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>
                      <strong>Yaş:</strong> {yas} aylık | 
                      <strong> Kilo:</strong> {duve.kilo} kg
                      {duve.anneKupeNo && <span> | <strong> Anne:</strong> {duve.anneKupeNo}</span>}
                    </p>

                    {/* Gebelik Durumu */}
                    <div style={{ marginTop: '10px' }}>
                      {duve.gebelikDurumu === 'Gebe' && duve.tohumlamaTarihi && (
                        <div style={{ 
                          padding: '8px', 
                          backgroundColor: '#4CAF50', 
                          color: 'white',
                          borderRadius: '4px',
                          display: 'inline-block',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          marginRight: '10px'
                        }}>
                          🤰 Gebe
                        </div>
                      )}
                      
                      {duve.gebelikDurumu === 'Belirsiz' && duve.tohumlamaTarihi && (
                        <div style={{ 
                          padding: '8px', 
                          backgroundColor: '#FF9800', 
                          color: 'white',
                          borderRadius: '4px',
                          display: 'inline-block',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          marginRight: '10px'
                        }}>
                          ❓ Belirsiz
                        </div>
                      )}

                      {duve.tohumlamaTarihi && kalanGun !== null && (
                        <div style={{ 
                          padding: '8px', 
                          backgroundColor: kalanGun <= 30 ? '#f44336' : '#2196F3',
                          color: 'white',
                          borderRadius: '4px',
                          display: 'inline-block',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          {kalanGun > 0 
                            ? `📅 ${kalanGun} gün kaldı` 
                            : kalanGun === 0 
                            ? '⚠️ BUGÜN DOĞUM!'
                            : `❗ ${Math.abs(kalanGun)} gün geçti`
                          }
                        </div>
                      )}
                    </div>

                    {duve.tohumlamaTarihi && dogumTarihi && (
                      <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#666' }}>
                        Tohumlama: {new Date(duve.tohumlamaTarihi).toLocaleDateString('tr-TR')} → 
                        Beklenen Doğum: {dogumTarihi.toLocaleDateString('tr-TR')}
                      </p>
                    )}

                    {duve.not && (
                      <p style={{ margin: '10px 0 0 0', fontSize: '14px', fontStyle: 'italic', color: '#666' }}>
                        📝 {duve.not}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => duveSil(duve.id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
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
        <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
          Henüz düve kaydı yok
        </p>
      )}

      {/* DÜVE EKLEME MODAL */}
      {duveEkrani && (
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
          padding: '20px',
          overflow: 'auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>🐄 Yeni Düve Ekle</h2>
              <button
                onClick={() => setDuveEkrani(false)}
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
                ✕
              </button>
            </div>

            {/* İsim */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Düve İsmi: *
              </label>
              <input
                type="text"
                placeholder="Örn: Papatya"
                value={yeniDuve.isim}
                onChange={(e) => setYeniDuve({ ...yeniDuve, isim: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Küpe No & Doğum Tarihi */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Küpe No: *
                </label>
                <input
                  type="text"
                  placeholder="DV001"
                  value={yeniDuve.kupeNo}
                  onChange={(e) => setYeniDuve({ ...yeniDuve, kupeNo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Doğum Tarihi: *
                </label>
                <input
                  type="date"
                  value={yeniDuve.dogumTarihi}
                  onChange={(e) => setYeniDuve({ ...yeniDuve, dogumTarihi: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Yaş & Kilo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Yaş (ay): *
                </label>
                <input
                  type="number"
                  placeholder="8"
                  value={yeniDuve.yas}
                  onChange={(e) => setYeniDuve({ ...yeniDuve, yas: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Kilo (kg): *
                </label>
                <input
                  type="number"
                  placeholder="150"
                  value={yeniDuve.kilo}
                  onChange={(e) => setYeniDuve({ ...yeniDuve, kilo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Anne İnek */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Anne İnek:
              </label>
              <select
                value={yeniDuve.anneKupeNo}
                onChange={(e) => setYeniDuve({ ...yeniDuve, anneKupeNo: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  boxSizing: 'border-box'
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

            {/* Tohumlama Tarihi */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Tohumlama Tarihi:
              </label>
              <input
                type="date"
                value={yeniDuve.tohumlamaTarihi}
                onChange={(e) => setYeniDuve({ ...yeniDuve, tohumlamaTarihi: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Gebelik Durumu */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Gebelik Durumu:
              </label>
              <select
                value={yeniDuve.gebelikDurumu}
                onChange={(e) => setYeniDuve({ ...yeniDuve, gebelikDurumu: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Belirsiz">❓ Belirsiz</option>
                <option value="Gebe">🤰 Gebe</option>
                <option value="Gebe Değil">❌ Gebe Değil</option>
              </select>
            </div>

            {/* Notlar */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Notlar:
              </label>
              <textarea
                placeholder="Özel notlar, sağlık durumu..."
                value={yeniDuve.not}
                onChange={(e) => setYeniDuve({ ...yeniDuve, not: e.target.value })}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Butonlar */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setDuveEkrani(false)}
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
                onClick={duveEkle}
                style={{
                  flex: 1,
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
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Duveler;