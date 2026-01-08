import { useState, useEffect } from 'react';
import * as api from '../services/api';

function YemDeposu() {
  const [stoklar, setStoklar] = useState([]);
  const [ayarlar, setAyarlar] = useState(null);
  const [otomatikCalisiyor, setOtomatikCalisiyor] = useState(false);
  const [hareketler, setHareketler] = useState([]);
  const [aktifSekme, setAktifSekme] = useState('stok');
  const [hareketEkrani, setHareketEkrani] = useState(false);

  // Hareket formu
  const [yemTipi, setYemTipi] = useState('Karma Yem');
  const [hareketTipi, setHareketTipi] = useState('Alım');
  const [miktar, setMiktar] = useState('');
  const [birimFiyat, setBirimFiyat] = useState('');
  const [tarih, setTarih] = useState(new Date().toISOString().split('T')[0]);
  const [aciklama, setAciklama] = useState('');

  const yemTipleri = ['Karma Yem', 'Arpa', 'Mısır', 'Saman', 'Yonca', 'Kepek', 'Diğer'];

  // Stokları yükle
  useEffect(() => {
    stoklariYukle();
    hareketleriYukle();
    
    ayarlariYukle();
  }, []);

  const stoklariYukle = async () => {
    try {
      const response = await api.getYemStok();
      setStoklar(response.data);
    } catch (error) {
      console.error('Stoklar yüklenemedi:', error);
    }
  };

  const hareketleriYukle = async () => {
    try {
      const response = await api.getYemHareketler();
      setHareketler(response.data);
    } catch (error) {
      console.error('Hareketler yüklenemedi:', error);
    }
  };

 const hareketEkle = async () => {
    if (!miktar || miktar <= 0) {
      alert('Geçerli bir miktar girin!');
      return;
    }

    try {
      await api.createYemHareket({
        yemTipi,
        hareketTipi,
        miktar: parseFloat(miktar),
        birimFiyat: parseFloat(birimFiyat) || 0,
        tarih,
        aciklama
      });

      setMiktar('');
      setBirimFiyat('');
      setAciklama('');
      setHareketEkrani(false);

      await stoklariYukle();
      await hareketleriYukle();

      alert(`✅ ${hareketTipi} kaydedildi!`);
    } catch (error) {
      alert('❌ Hata: ' + (error.response?.data?.message || 'Hareket eklenemedi!'));
    }
  };

  const ayarlariYukle = async () => {
    try {
      const response = await api.getAyarlar();
      setAyarlar(response.data);
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error);
    }
  };

  const otomatikToggle = async () => {
    if (!ayarlar) return;

    try {
      const response = await api.updateAyarlar({
        otomatikYemTuketim: !ayarlar.otomatikYemTuketim
      });
      setAyarlar(response.data);
      alert(`Otomatik tüketim ${response.data.otomatikYemTuketim ? 'açıldı' : 'kapatıldı'}!`);
    } catch (error) {
      alert('❌ Hata: ' + (error.response?.data?.message || 'Ayar güncellenemedi!'));
    }
  };

  const otomatikTuketimCalistir = async () => {
    if (!ayarlar || !ayarlar.otomatikYemTuketim) {
      alert('❌ Otomatik tüketim kapalı!');
      return;
    }

    if (window.confirm('Bugün için otomatik yem tüketimi yapılsın mı?')) {
      setOtomatikCalisiyor(true);
      try {
        const response = await api.otomatikTuketimCalistir();
        alert(`✅ ${response.data.message}\n\n${response.data.tuketimler.map(t => `${t.yemTipi}: ${t.miktar} kg`).join('\n')}`);
        
        await stoklariYukle();
        await hareketleriYukle();
        await ayarlariYukle();
      } catch (error) {
        alert('❌ Hata: ' + (error.response?.data?.message || 'Otomatik tüketim yapılamadı!'));
      } finally {
        setOtomatikCalisiyor(false);
      }
    }
  };

  // Stok uyarısı kontrolü
  const stokUyarisi = (stok) => {
    if (stok.miktar <= stok.minimumStok) {
      return '⚠️ Kritik Seviye!';
    } else if (stok.miktar <= stok.minimumStok * 2) {
      return '⚡ Azalıyor!';
    }
    return '✅ Yeterli';
  };

  const stokRenk = (stok) => {
    if (stok.miktar <= stok.minimumStok) {
      return '#f44336';
    } else if (stok.miktar <= stok.minimumStok * 2) {
      return '#FF9800';
    }
    return '#4CAF50';
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0 }}>🌾 Yem Deposu</h2>
          <button
            onClick={() => setHareketEkrani(true)}
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
            + Yem Hareketi Ekle
          </button>
        </div>

        {/* OTOMATİK TÜKETİM KONTROL PANELİ */}
        {ayarlar && (
          <div style={{
            backgroundColor: ayarlar.otomatikYemTuketim ? '#e8f5e9' : '#fff3e0',
            padding: '15px 20px',
            borderRadius: '12px',
            border: `2px solid ${ayarlar.otomatikYemTuketim ? '#4CAF50' : '#FF9800'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                  🤖 Otomatik Tüketim:
                </span>
                <button
                  onClick={otomatikToggle}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: ayarlar.otomatikYemTuketim ? '#4CAF50' : '#9e9e9e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s'
                  }}
                >
                  {ayarlar.otomatikYemTuketim ? '● AÇIK' : '○ KAPALI'}
                </button>
              </div>

              {ayarlar.sonTuketimTarihi && (
                <div style={{ fontSize: '13px', color: '#666' }}>
                  Son tüketim: {new Date(ayarlar.sonTuketimTarihi).toLocaleDateString('tr-TR')}
                </div>
              )}
            </div>

            {ayarlar.otomatikYemTuketim && (
              <button
                onClick={otomatikTuketimCalistir}
                disabled={otomatikCalisiyor || ayarlar.sonTuketimTarihi === new Date().toISOString().split('T')[0]}
                style={{
                  padding: '10px 20px',
                  backgroundColor: otomatikCalisiyor || ayarlar.sonTuketimTarihi === new Date().toISOString().split('T')[0] ? '#ccc' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: otomatikCalisiyor || ayarlar.sonTuketimTarihi === new Date().toISOString().split('T')[0] ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {otomatikCalisiyor ? '⏳ İşleniyor...' : ayarlar.sonTuketimTarihi === new Date().toISOString().split('T')[0] ? '✅ Bugün Yapıldı' : '▶️ Bugün İçin Çalıştır'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sekmeler */}
      <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '2px solid #e0e0e0' }}>
        <button
          onClick={() => setAktifSekme('stok')}
          style={{
            padding: '12px 24px',
            border: 'none',
            backgroundColor: 'transparent',
            borderBottom: aktifSekme === 'stok' ? '3px solid #4CAF50' : 'none',
            fontWeight: aktifSekme === 'stok' ? 'bold' : 'normal',
            fontSize: '16px',
            cursor: 'pointer',
            color: aktifSekme === 'stok' ? '#4CAF50' : '#666'
          }}
        >
          📦 Stok Durumu
        </button>
        <button
          onClick={() => setAktifSekme('hareketler')}
          style={{
            padding: '12px 24px',
            border: 'none',
            backgroundColor: 'transparent',
            borderBottom: aktifSekme === 'hareketler' ? '3px solid #4CAF50' : 'none',
            fontWeight: aktifSekme === 'hareketler' ? 'bold' : 'normal',
            fontSize: '16px',
            cursor: 'pointer',
            color: aktifSekme === 'hareketler' ? '#4CAF50' : '#666'
          }}
        >
          📋 Hareketler
        </button>
      </div>

      {/* STOK DURUMU */}
      {aktifSekme === 'stok' && (
        <div>
          {stoklar.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {stoklar.map((stok) => (
                <div
                  key={stok._id}
                  style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: `3px solid ${stokRenk(stok)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, fontSize: '20px' }}>🌾 {stok.yemTipi}</h3>
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: stokRenk(stok),
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {stokUyarisi(stok)}
                    </span>
                  </div>

                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: stokRenk(stok), marginBottom: '10px' }}>
                    {stok.miktar.toFixed(0)} {stok.birim}
                  </div>

                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                    Minimum: {stok.minimumStok} {stok.birim}
                  </div>

                  {stok.birimFiyat > 0 && (
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      Birim Fiyat: {stok.birimFiyat.toFixed(2)} ₺/{stok.birim}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f5f5f5', borderRadius: '12px' }}>
              <p style={{ fontSize: '18px', color: '#666' }}>📦 Henüz yem stoku yok</p>
              <p style={{ fontSize: '14px', color: '#999' }}>Yem hareketi ekleyerek başlayın!</p>
            </div>
          )}
        </div>
      )}

      {/* HAREKETLER */}
      {aktifSekme === 'hareketler' && (
        <div>
          {hareketler.length > 0 ? (
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              {hareketler.map((hareket, index) => (
                <div
                  key={hareket._id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: index < hareketler.length - 1 ? '1px solid #e0e0e0' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                      {hareket.hareketTipi === 'Alım' ? '📥' : hareket.hareketTipi === 'Tüketim' ? '📤' : '🔥'} {hareket.yemTipi}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {new Date(hareket.tarih).toLocaleDateString('tr-TR')}
                      {hareket.aciklama && ` • ${hareket.aciklama}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: hareket.hareketTipi === 'Alım' ? '#4CAF50' : '#f44336'
                    }}>
                      {hareket.hareketTipi === 'Alım' ? '+' : '-'}{hareket.miktar} kg
                    </div>
                    {hareket.toplamTutar > 0 && (
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {hareket.toplamTutar.toFixed(2)} ₺
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f5f5f5', borderRadius: '12px' }}>
              <p style={{ fontSize: '18px', color: '#666' }}>📋 Henüz hareket kaydı yok</p>
            </div>
          )}
        </div>
      )}

      {/* HAREKET EKLEME MODAL */}
      {hareketEkrani && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>➕ Yem Hareketi Ekle</h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Yem Tipi:</label>
              <select
                value={yemTipi}
                onChange={(e) => setYemTipi(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              >
                {yemTipleri.map(tip => (
                  <option key={tip} value={tip}>{tip}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Hareket Tipi:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setHareketTipi('Alım')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: hareketTipi === 'Alım' ? '#4CAF50' : '#e0e0e0',
                    color: hareketTipi === 'Alım' ? 'white' : '#666',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  📥 Alım
                </button>
                <button
                  onClick={() => setHareketTipi('Tüketim')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: hareketTipi === 'Tüketim' ? '#FF9800' : '#e0e0e0',
                    color: hareketTipi === 'Tüketim' ? 'white' : '#666',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  📤 Tüketim
                </button>
                <button
                  onClick={() => setHareketTipi('Fire')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: hareketTipi === 'Fire' ? '#f44336' : '#e0e0e0',
                    color: hareketTipi === 'Fire' ? 'white' : '#666',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🔥 Fire
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Miktar (kg): *</label>
              <input
                type="number"
                value={miktar}
                onChange={(e) => setMiktar(e.target.value)}
                placeholder="Örn: 500"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            {hareketTipi === 'Alım' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Birim Fiyat (₺/kg):</label>
                <input
                  type="number"
                  value={birimFiyat}
                  onChange={(e) => setBirimFiyat(e.target.value)}
                  placeholder="Örn: 15.50"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Tarih: *</label>
              <input
                type="date"
                value={tarih}
                onChange={(e) => setTarih(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Açıklama:</label>
              <textarea
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                placeholder="Opsiyonel açıklama..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setHareketEkrani(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: '#e0e0e0',
                  color: '#666',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                İptal
              </button>
              <button
                onClick={hareketEkle}
                style={{
                  flex: 1,
                  padding: '14px',
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

export default YemDeposu;