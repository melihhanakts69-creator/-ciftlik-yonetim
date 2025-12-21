import { useState, useEffect } from 'react';
import * as api from '../services/api';

function InekDetay({ inek, onGeri, onInekGuncelle }) {
  const [timeline, setTimeline] = useState([]);
  const [timelineEkrani, setTimelineEkrani] = useState(false);
  const [duzenleEkrani, setDuzenleEkrani] = useState(false);

  // Düzenleme formu state'leri
  const [tohumlamaTarihi, setTohumlamaTarihi] = useState(inek.tohumlamaTarihi || '');
  const [sonBuzagilamaTarihi, setSonBuzagilamaTarihi] = useState(inek.sonBuzagilamaTarihi || '');
  const [gebelikDurumu, setGebelikDurumu] = useState(inek.gebelikDurumu || 'Belirsiz');
  const [laktasyonDonemi, setLaktasyonDonemi] = useState(inek.laktasyonDonemi || 1);

  // Timeline formu
  const [timelineTip, setTimelineTip] = useState('tohumlama');
  const [timelineTarih, setTimelineTarih] = useState(new Date().toISOString().split('T')[0]);
  const [timelineAciklama, setTimelineAciklama] = useState('');

  useEffect(() => {
    timelineYukle();
  }, []);

  const timelineYukle = async () => {
    try {
      const response = await api.getTimeline(inek._id);
      setTimeline(response.data);
    } catch (error) {
      console.error('Timeline yüklenemedi:', error);
    }
  };

  const timelineEkle = async () => {
    try {
      await api.createTimeline({
        hayvanId: inek._id,
        hayvanTipi: 'inek',
        tip: timelineTip,
        tarih: timelineTarih,
        aciklama: timelineAciklama
      });

      setTimelineTarih(new Date().toISOString().split('T')[0]);
      setTimelineAciklama('');
      setTimelineEkrani(false);

      await timelineYukle();
      alert('✅ Kayıt eklendi!');
    } catch (error) {
      alert('❌ Hata: ' + (error.response?.data?.message || 'Kayıt eklenemedi!'));
    }
  };

  const inekGuncelle = async () => {
    try {
      const guncelData = {
        ...inek,
        tohumlamaTarihi,
        sonBuzagilamaTarihi,
        gebelikDurumu,
        laktasyonDonemi: parseInt(laktasyonDonemi)
      };

      await api.updateInek(inek._id, guncelData);
      
      onInekGuncelle(guncelData);
      setDuzenleEkrani(false);
      alert('✅ İnek güncellendi!');
    } catch (error) {
      alert('❌ Hata: ' + (error.response?.data?.message || 'Güncellenemedi!'));
    }
  };

  // Tahmini doğum hesaplama
  const tahminiDogumHesapla = () => {
    if (!tohumlamaTarihi) return null;
    
    const tohumlama = new Date(tohumlamaTarihi);
    const tahminiDoğum = new Date(tohumlama);
    tahminiDoğum.setDate(tahminiDoğum.getDate() + 283);
    
    const bugun = new Date();
    const kalanGun = Math.ceil((tahminiDoğum - bugun) / (1000 * 60 * 60 * 24));
    
    return {
      tarih: tahminiDoğum.toLocaleDateString('tr-TR'),
      kalanGun: kalanGun > 0 ? kalanGun : 0,
      gecti: kalanGun < 0
    };
  };

  const tahminiDogum = tahminiDogumHesapla();

  const timelineIkonlari = {
    dogum: '🐄',
    tohumlama: '📅',
    buzagi: '🐮',
    hastalik: '🩺',
    asi: '💉',
    satis: '💰',
    'kuru-donem': '🛑',
    diger: '📝'
  };

  const timelineBasliklar = {
    dogum: 'Doğum',
    tohumlama: 'Tohumlama',
    buzagi: 'Buzağı',
    hastalik: 'Hastalık',
    asi: 'Aşı',
    satis: 'Satış',
    'kuru-donem': 'Kuru Dönem',
    diger: 'Diğer'
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
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        {/* BAŞLIK */}
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
          <h2 style={{ margin: 0 }}>🐄 {inek.isim} (#{inek.kupeNo})</h2>
          <button
            onClick={onGeri}
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
          {/* TEMEL BİLGİLER */}
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginTop: 0 }}>📋 Temel Bilgiler</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Küpe No:</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{inek.kupeNo}</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Yaş:</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{inek.yas} yaşında</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Kilo:</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{inek.kilo} kg</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Toplam Buzağı:</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{inek.buzagiSayisi}</div>
              </div>
            </div>
            {inek.notlar && (
              <div style={{ marginTop: '15px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Notlar:</div>
                <div style={{ fontSize: '16px', padding: '10px', backgroundColor: 'white', borderRadius: '8px' }}>
                  {inek.notlar}
                </div>
              </div>
            )}
          </div>

          {/* DURUM KARTI */}
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid #e0e0e0',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>📊 Durum Bilgileri</h3>
              <button
                onClick={() => setDuzenleEkrani(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ✏️ Düzenle
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Gebelik Durumu:</div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: gebelikDurumu === 'Gebe' ? '#4CAF50' : gebelikDurumu === 'Gebe Değil' ? '#f44336' : '#FF9800'
                }}>
                  {gebelikDurumu === 'Gebe' ? '✅ Gebe' : gebelikDurumu === 'Gebe Değil' ? '❌ Gebe Değil' : '❓ Belirsiz'}
                </div>
              </div>

              {gebelikDurumu === 'Gebe' && tohumlamaTarihi && tahminiDogum && !tahminiDogum.gecti && (
                <>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Tahmini Doğum:</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>
                      {tahminiDogum.tarih}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Kalan Gün:</div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: tahminiDogum.kalanGun <= 7 ? '#f44336' : tahminiDogum.kalanGun <= 30 ? '#FF9800' : '#4CAF50'
                    }}>
                      {tahminiDogum.kalanGun} gün
                    </div>
                  </div>
                </>
              )}

              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Laktasyon Dönemi:</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {laktasyonDonemi}. Buzağı
                </div>
              </div>

              {sonBuzagilamaTarihi && (
                <div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Son Buzağılama:</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {new Date(sonBuzagilamaTarihi).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TIMELINE */}
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid #e0e0e0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>📜 Geçmiş</h3>
              <button
                onClick={() => setTimelineEkrani(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                + Kayıt Ekle
              </button>
            </div>

            {timeline.length > 0 ? (
              <div style={{ position: 'relative', paddingLeft: '30px' }}>
                {/* Dikey çizgi */}
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '10px',
                  bottom: '10px',
                  width: '2px',
                  backgroundColor: '#e0e0e0'
                }}></div>

                {timeline.map((kayit) => (
                  <div
                    key={kayit._id}
                    style={{
                      position: 'relative',
                      marginBottom: '20px',
                      paddingBottom: '15px',
                      borderBottom: '1px solid #f0f0f0'
                    }}
                  >
                    {/* Nokta */}
                    <div style={{
                      position: 'absolute',
                      left: '-26px',
                      top: '5px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#4CAF50',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px'
                    }}>
                      {timelineIkonlari[kayit.tip]}
                    </div>

                    <div style={{ fontSize: '14px', color: '#999', marginBottom: '5px' }}>
                      {new Date(kayit.tarih).toLocaleDateString('tr-TR')}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
                      {timelineBasliklar[kayit.tip]}
                    </div>
                    {kayit.aciklama && (
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {kayit.aciklama}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                Henüz kayıt yok
              </div>
            )}
          </div>
        </div>

        {/* DÜZENLEME MODAL */}
        {duzenleEkrani && (
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
            zIndex: 2000
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
              <h2 style={{ marginTop: 0 }}>✏️ İnek Bilgilerini Düzenle</h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Gebelik Durumu:</label>
                <select
                  value={gebelikDurumu}
                  onChange={(e) => setGebelikDurumu(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                >
                  <option value="Belirsiz">Belirsiz</option>
                  <option value="Gebe">Gebe</option>
                  <option value="Gebe Değil">Gebe Değil</option>
                </select>
              </div>

              {gebelikDurumu === 'Gebe' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Tohumlama Tarihi:</label>
                  <input
                    type="date"
                    value={tohumlamaTarihi}
                    onChange={(e) => setTohumlamaTarihi(e.target.value)}
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Son Buzağılama Tarihi:</label>
                <input
                  type="date"
                  value={sonBuzagilamaTarihi}
                  onChange={(e) => setSonBuzagilamaTarihi(e.target.value)}
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Laktasyon Dönemi:</label>
                <input
                  type="number"
                  value={laktasyonDonemi}
                  onChange={(e) => setLaktasyonDonemi(e.target.value)}
                  min="1"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setDuzenleEkrani(false)}
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
                  onClick={inekGuncelle}
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

        {/* TIMELINE EKLEME MODAL */}
        {timelineEkrani && (
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
            zIndex: 2000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '90%'
            }}>
              <h2 style={{ marginTop: 0 }}>➕ Geçmiş Kaydı Ekle</h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Kayıt Tipi:</label>
                <select
                  value={timelineTip}
                  onChange={(e) => setTimelineTip(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                >
                  <option value="tohumlama">📅 Tohumlama</option>
                  <option value="dogum">🐄 Doğum</option>
                  <option value="buzagi">🐮 Buzağı</option>
                  <option value="hastalik">🩺 Hastalık</option>
                  <option value="asi">💉 Aşı</option>
                  <option value="kuru-donem">🛑 Kuru Dönem</option>
                  <option value="diger">📝 Diğer</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Tarih:</label>
                <input
                  type="date"
                  value={timelineTarih}
                  onChange={(e) => setTimelineTarih(e.target.value)}
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
                  value={timelineAciklama}
                  onChange={(e) => setTimelineAciklama(e.target.value)}
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
                  onClick={() => setTimelineEkrani(false)}
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
                  onClick={timelineEkle}
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
    </div>
  );
}

export default InekDetay;