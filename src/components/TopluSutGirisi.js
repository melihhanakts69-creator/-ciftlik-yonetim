import { useState } from 'react';
import * as api from '../services/api';

function TopluSutGirisi({ onKapat, onKaydet }) {
  const bugun = new Date().toISOString().split('T')[0];
  
  const [tarih, setTarih] = useState(bugun);
  const [sagim, setSagim] = useState('sabah');
  const [toplamSut, setToplamSut] = useState('');
  const [dagilimTipi, setDagilimTipi] = useState('akilli');
  const [notlar, setNotlar] = useState('');
  
  const [onizleme, setOnizleme] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [adim, setAdim] = useState(1);

  const onizlemeAl = async () => {
    if (!toplamSut || toplamSut <= 0) {
      alert('Lütfen geçerli bir süt miktarı girin!');
      return;
    }

    setYukleniyor(true);
    try {
      const response = await api.topluSutOnizleme({
        toplamSut: parseFloat(toplamSut),
        dagilimTipi,
        tarih,
        sagim
      });

      setOnizleme(response.data);
      setAdim(2);
    } catch (error) {
      alert('❌ Hata: ' + (error.response?.data?.message || 'Önizleme alınamadı!'));
    } finally {
      setYukleniyor(false);
    }
  };

  const miktarDuzenle = (inekId, yeniMiktar) => {
    const guncelDetaylar = onizleme.detaylar.map(detay => {
      if (detay.inekId === inekId) {
        return {
          ...detay,
          miktar: parseFloat(yeniMiktar),
          duzenlenmis: true,
          otomatikMi: false
        };
      }
      return detay;
    });

    const yeniToplam = guncelDetaylar.reduce((sum, d) => sum + d.miktar, 0);

    setOnizleme({
      ...onizleme,
      detaylar: guncelDetaylar,
      hesaplananToplam: parseFloat(yeniToplam.toFixed(2))
    });
  };

  const silVeKaydet = async () => {
    setYukleniyor(true);
    try {
      await api.topluSutSilByTarihSagim(tarih, sagim);
      await api.topluSutKaydet({
        tarih,
        sagim,
        toplamSut: onizleme.toplamSut,
        dagilimTipi,
        detaylar: onizleme.detaylar,
        notlar,
        ustundenKaydet: true
      });
      alert('✅ Toplu süt girişi kaydedildi!');
      onKaydet && onKaydet();
      onKapat();
    } catch (silmeHatasi) {
      console.error('Silme hatası:', silmeHatasi);
      alert('❌ Eski kayıtlar silinirken hata oluştu!');
    } finally {
      setYukleniyor(false);
    }
  };

  const kaydet = async () => {
    const fark = Math.abs(onizleme.toplamSut - onizleme.hesaplananToplam);
    if (fark > 0.5) {
      const onay = window.confirm(
        `⚠️ Toplam fark: ${fark.toFixed(2)} lt\n\nGirilen: ${onizleme.toplamSut} lt\nHesaplanan: ${onizleme.hesaplananToplam} lt\n\nYine de kaydetmek istiyor musunuz?`
      );
      if (!onay) return;
    }

    setYukleniyor(true);
    try {
      await api.topluSutKaydet({
        tarih,
        sagim,
        toplamSut: onizleme.toplamSut,
        dagilimTipi,
        detaylar: onizleme.detaylar,
        notlar
      });

      alert('✅ Toplu süt girişi kaydedildi!');
      onKaydet && onKaydet();
      onKapat();
    } catch (error) {
      if (error.response?.status === 409) {
        const data = error.response.data;
        const onay = window.confirm(
          `⚠️ ${new Date(tarih).toLocaleDateString('tr-TR')} ${sagim === 'sabah' ? 'Sabah' : 'Akşam'} sağımı için zaten süt kayıtları mevcut!\n\n` +
          `Kayıtlı Süt: ${data.toplamSut} lt (${data.kayitSayisi} inek)\n\n` +
          `Yeni veriyle değiştirmek ister misiniz?`
        );
        
        if (onay) {
          silVeKaydet();
        }
      } else {
        console.error('Kayıt hatası:', error);
        alert('❌ Hata: ' + (error.response?.data?.message || 'Kayıt yapılamadı!'));
      }
    } finally {
      setYukleniyor(false);
    }
    
  };
  return (
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
        maxWidth: adim === 1 ? '500px' : '700px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '2px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 10
        }}>
          <h2 style={{ margin: 0 }}>
            🥛 {adim === 1 ? 'Toplu Süt Girişi' : 'Önizleme'}
          </h2>
          <button
            onClick={onKapat}
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

        <div style={{ padding: '20px' }}>
          {adim === 1 && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Tarih:</label>
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Sağım Zamanı:</label>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="sagim"
                      value="sabah"
                      checked={sagim === 'sabah'}
                      onChange={(e) => setSagim(e.target.value)}
                      style={{ marginRight: '8px', cursor: 'pointer' }}
                    />
                    🌅 Sabah
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="sagim"
                      value="aksam"
                      checked={sagim === 'aksam'}
                      onChange={(e) => setSagim(e.target.value)}
                      style={{ marginRight: '8px', cursor: 'pointer' }}
                    />
                    🌙 Akşam
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Toplam Süt (Litre):</label>
                <input
                  type="number"
                  value={toplamSut}
                  onChange={(e) => setToplamSut(e.target.value)}
                  placeholder="Örn: 450"
                  min="0"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '20px',
                    borderRadius: '8px',
                    border: '2px solid #4CAF50',
                    fontWeight: 'bold'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Dağılım Yöntemi:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{
                    padding: '12px',
                    border: '2px solid ' + (dagilimTipi === 'akilli' ? '#4CAF50' : '#ddd'),
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: dagilimTipi === 'akilli' ? '#f1f8f4' : 'white'
                  }}>
                    <input
                      type="radio"
                      name="dagilim"
                      value="akilli"
                      checked={dagilimTipi === 'akilli'}
                      onChange={(e) => setDagilimTipi(e.target.value)}
                      style={{ marginRight: '8px' }}
                    />
                    <strong>🧠 Akıllı Dağılım (Önerilen)</strong>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '5px', marginLeft: '24px' }}>
                      Son 7 günlük performansa göre otomatik dağıtır
                    </div>
                  </label>

                  <label style={{
                    padding: '12px',
                    border: '2px solid ' + (dagilimTipi === 'esit' ? '#4CAF50' : '#ddd'),
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: dagilimTipi === 'esit' ? '#f1f8f4' : 'white'
                  }}>
                    <input
                      type="radio"
                      name="dagilim"
                      value="esit"
                      checked={dagilimTipi === 'esit'}
                      onChange={(e) => setDagilimTipi(e.target.value)}
                      style={{ marginRight: '8px' }}
                    />
                    <strong>⚖️ Eşit Dağılım</strong>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '5px', marginLeft: '24px' }}>
                      Her ineğe eşit miktar dağıtır
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Notlar (Opsiyonel):</label>
                <textarea
                  value={notlar}
                  onChange={(e) => setNotlar(e.target.value)}
                  placeholder="Bugüne dair notlarınızı yazabilirsiniz..."
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
                  onClick={onKapat}
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
                  onClick={onizlemeAl}
                  disabled={yukleniyor || !toplamSut}
                  style={{
                    flex: 2,
                    padding: '14px',
                    backgroundColor: yukleniyor || !toplamSut ? '#ccc' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: yukleniyor || !toplamSut ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  {yukleniyor ? 'Hesaplanıyor...' : '👁️ Önizle'}
                </button>
              </div>
            </>
          )}{adim === 2 && onizleme && (
            <>
              <div style={{
                backgroundColor: '#f5f5f5',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Tarih:</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {new Date(tarih).toLocaleDateString('tr-TR')} - {sagim === 'sabah' ? '🌅 Sabah' : '🌙 Akşam'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', color: '#666' }}>Dağılım:</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {dagilimTipi === 'akilli' ? '🧠 Akıllı' : '⚖️ Eşit'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Toplam Süt:</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
                      {onizleme.toplamSut} lt
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', color: '#666' }}>İnek Sayısı:</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {onizleme.inekSayisi}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                marginBottom: '15px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>İnek</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Miktar (lt)</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd', width: '60px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {onizleme.detaylar.map((detay, index) => (
                      <InekSatiri
                        key={detay.inekId}
                        detay={detay}
                        index={index}
                        onDuzenle={(yeniMiktar) => miktarDuzenle(detay.inekId, yeniMiktar)}
                      />
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
                      <td style={{ padding: '12px', borderTop: '2px solid #ddd' }}>TOPLAM</td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'right',
                        borderTop: '2px solid #ddd',
                        color: Math.abs(onizleme.toplamSut - onizleme.hesaplananToplam) > 0.5 ? '#f44336' : '#4CAF50'
                      }}>
                        {onizleme.hesaplananToplam} lt
                      </td>
                      <td style={{ borderTop: '2px solid #ddd' }}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {Math.abs(onizleme.toplamSut - onizleme.hesaplananToplam) > 0.5 && (
                <div style={{
                  backgroundColor: '#fff3e0',
                  border: '2px solid #FF9800',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  fontSize: '14px'
                }}>
                  ⚠️ <strong>Dikkat:</strong> Hesaplanan toplam ({onizleme.hesaplananToplam} lt) ile girilen toplam ({onizleme.toplamSut} lt) arasında {Math.abs(onizleme.toplamSut - onizleme.hesaplananToplam).toFixed(2)} lt fark var!
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setAdim(1)}
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
                  ← Geri
                </button>
                <button
                  onClick={kaydet}
                  disabled={yukleniyor}
                  style={{
                    flex: 2,
                    padding: '14px',
                    backgroundColor: yukleniyor ? '#ccc' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: yukleniyor ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  {yukleniyor ? 'Kaydediliyor...' : '✅ Onayla ve Kaydet'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InekSatiri({ detay, index, onDuzenle }) {
  const [duzenle, setDuzenle] = useState(false);
  const [yeniMiktar, setYeniMiktar] = useState(detay.miktar);

  const kaydet = () => {
    if (yeniMiktar !== detay.miktar) {
      onDuzenle(yeniMiktar);
    }
    setDuzenle(false);
  };

  return (
    <tr style={{
      backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <td style={{ padding: '12px' }}>
        <div style={{ fontWeight: 'bold' }}>{detay.inekIsim}</div>
        {detay.duzenlenmis && (
          <div style={{ fontSize: '12px', color: '#FF9800' }}>✏️ Düzenlendi</div>
        )}
      </td>
      <td style={{ padding: '12px', textAlign: 'right' }}>
        {duzenle ? (
          <input
            type="number"
            value={yeniMiktar}
            onChange={(e) => setYeniMiktar(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.1"
            style={{
              width: '80px',
              padding: '6px',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #4CAF50',
              textAlign: 'right'
            }}
            autoFocus
          />
        ) : (
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {detay.miktar.toFixed(2)}
          </span>
        )}
      </td>
      <td style={{ padding: '12px', textAlign: 'center' }}>
        {duzenle ? (
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={kaydet}
              style={{
                padding: '4px 8px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ✓
            </button>
            <button
              onClick={() => {
                setYeniMiktar(detay.miktar);
                setDuzenle(false);
              }}
              style={{
                padding: '4px 8px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setDuzenle(true)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ✏️
          </button>
        )}
      </td>
    </tr>
  );
}

export default TopluSutGirisi;