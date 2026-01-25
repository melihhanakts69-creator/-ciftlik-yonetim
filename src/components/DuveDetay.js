import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { showSuccess, showError, showWarning } from '../utils/toast';

function DuveDetay({ duve, onKapat, onGuncelle }) {
  const [timeline, setTimeline] = useState([]);
  const [timelineEkrani, setTimelineEkrani] = useState(false);
  const [timelineTip, setTimelineTip] = useState('');
  const [yeniTimeline, setYeniTimeline] = useState({
    tarih: new Date().toISOString().split('T')[0],
    aciklama: ''
  });

  useEffect(() => {
    timelineYukle();
  }, []);

  const timelineYukle = async () => {
    try {
      const response = await api.getTimeline(duve._id);
      setTimeline(response.data);
    } catch (error) {
      console.error('Timeline yüklenemedi:', error);
    }
  };

  const timelineEkle = async () => {
    if (!yeniTimeline.tarih) {
      showWarning('Tarih seçin!');
      return;
    }

    try {
      const yeniKayit = {
        hayvanId: duve._id,
        hayvanTipi: 'duve',          // ✅ enum uyumlu
        tip: timelineTip || 'diger', // ✅ enum uyumlu
        tarih: yeniTimeline.tarih,  // ✅ STRING
        aciklama: yeniTimeline.aciklama
      };

      console.log('Timeline ekleniyor:', yeniKayit);

      await api.createTimeline(yeniKayit);

      setYeniTimeline({
        tarih: new Date().toISOString().split('T')[0],
        aciklama: ''
      });


      setTimelineEkrani(false);
      setTimelineTip('');
      timelineYukle();
      showSuccess('Kayıt eklendi!');
    } catch (error) {
      console.error('Timeline ekleme hatası:', error);
      showError(error.response?.data?.message || 'Kayıt eklenemedi!');
    }
  };


  const timelineSil = async (id) => {
    if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;

    try {
      await api.deleteTimeline(id);
      timelineYukle();
      showSuccess('Kayıt silindi!');
    } catch (error) {
      showError('Kayıt silinemedi!');
    }
  };

  // Doğum tarihi hesaplama
  const dogumTarihiHesapla = () => {
    if (!duve.tohumlamaTarihi) return null;
    const tohumlama = new Date(duve.tohumlamaTarihi);
    const dogum = new Date(tohumlama);
    dogum.setDate(dogum.getDate() + 283);
    return dogum;
  };

  const kalanGunHesapla = () => {
    const dogum = dogumTarihiHesapla();
    if (!dogum) return null;
    const bugun = new Date();
    return Math.ceil((dogum - bugun) / (1000 * 60 * 60 * 24));
  };


  const gunFarkiHesapla = (tarih) => {
    if (!tarih) return null;

    const bugun = new Date();
    const girilenTarih = new Date(tarih + 'T00:00:00');
    // 👆 kritik nokta

    const farkMs = bugun.getTime() - girilenTarih.getTime();
    return Math.floor(farkMs / (1000 * 60 * 60 * 24));
  };


  const yas = Math.floor((new Date() - new Date(duve.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
  const kalanGun = kalanGunHesapla();
  const dogumTarihi = dogumTarihiHesapla();
  const gecenGun = gunFarkiHesapla(duve.tohumlamaTarihi);


  return (
    <div>
      <button
        onClick={onKapat}
        style={{
          padding: '10px 20px',
          backgroundColor: '#666',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '20px',
          fontSize: '16px'
        }}
      >
        ← Geri
      </button>

      {/* DÜVE BİLGİLERİ */}
      <div style={{
        backgroundColor: '#fff',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>🐄 {duve.isim}</h2>
            <p style={{ margin: 0, fontSize: '16px', color: '#666' }}>
              Küpe No: <strong>{duve.kupeNo}</strong>
            </p>
          </div>
          <div style={{
            padding: '10px 20px',
            backgroundColor: duve.gebelikDurumu === 'Gebe' ? '#4CAF50' : duve.gebelikDurumu === 'Belirsiz' ? '#FF9800' : '#f44336',
            color: 'white',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            {duve.gebelikDurumu === 'Gebe' ? '🤰 Gebe' : duve.gebelikDurumu === 'Belirsiz' ? '❓ Belirsiz' : '❌ Gebe Değil'}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>Yaş</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{yas} aylık</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>Kilo</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{duve.kilo} kg</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>Doğum Tarihi</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {new Date(duve.dogumTarihi).toLocaleDateString('tr-TR')}
            </div>
          </div>
          {duve.anneKupeNo && (
            <div>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>Anne</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{duve.anneKupeNo}</div>
            </div>
          )}
        </div>

        {/* GEBELİK BİLGİLERİ */}
        {duve.tohumlamaTarihi && (
          <div style={{
            marginTop: '20px',
            padding: '20px',
            backgroundColor: duve.gebelikDurumu === 'Gebe' ? '#e8f5e9' : '#fff3e0',
            borderRadius: '8px',
            border: `2px solid ${duve.gebelikDurumu === 'Gebe' ? '#4CAF50' : '#FF9800'}`
          }}>
            <h3 style={{ marginTop: 0, fontSize: '18px' }}>🤰 Gebelik Bilgileri</h3>

            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>Tohumlama Tarihi:</span>
                <strong>{new Date(duve.tohumlamaTarihi).toLocaleDateString('tr-TR')}</strong>
              </div>

              {gecenGun !== null && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Tohumlamadan Geçen:</span>
                  <strong style={{ color: '#FF9800' }}>{gecenGun} gün</strong>
                </div>
              )}

              {/* 21-28 gün arası uyarı */}
              {gecenGun !== null && gecenGun >= 21 && gecenGun <= 28 && duve.gebelikDurumu === 'Belirsiz' && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#fff',
                  border: '2px solid #FF9800',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#FF9800'
                }}>
                  ⚠️ Gebelik kontrolü zamanı! ({gecenGun}. gün)
                </div>
              )}

              {/* Gebe ise doğum bilgileri */}
              {duve.gebelikDurumu === 'Gebe' && dogumTarihi && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Beklenen Doğum:</span>
                    <strong style={{ color: '#4CAF50' }}>
                      {dogumTarihi.toLocaleDateString('tr-TR')}
                    </strong>
                  </div>

                  {kalanGun !== null && (
                    <div style={{
                      padding: '15px',
                      backgroundColor: kalanGun <= 30 ? '#ffebee' : '#fff',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: kalanGun <= 30 ? '2px solid #f44336' : 'none'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: kalanGun <= 30 ? '#f44336' : '#4CAF50' }}>
                        {kalanGun > 0
                          ? `📅 ${kalanGun} gün kaldı`
                          : kalanGun === 0
                            ? '⚠️ BUGÜN DOĞUM!'
                            : `❗ ${Math.abs(kalanGun)} gün geçti`
                        }
                      </div>
                      {kalanGun <= 30 && kalanGun > 0 && (
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                          Doğuma az kaldı, hazırlık yapın!
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {duve.notlar && (
          <div style={{
            marginTop: '15px',
            padding: '15px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            fontStyle: 'italic',
            color: '#666',
            borderLeft: '4px solid #2196F3'
          }}>
            📝 <strong>Notlar:</strong> {duve.notlar}
          </div>
        )}
      </div>

      {/* GEÇMİŞ / TİMELİNE */}
      <div style={{
        backgroundColor: '#fff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '20px' }}>📜 Geçmiş</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                setTimelineTip('tohumlama');
                setTimelineEkrani(true);
              }}
              style={{
                padding: '10px 16px',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🐄 Tohumlama Ekle
            </button>
            <button
              onClick={() => {
                setTimelineTip('');
                setTimelineEkrani(true);
              }}
              style={{
                padding: '10px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              + Kayıt Ekle
            </button>
          </div>
        </div>

        {timeline.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {timeline.sort((a, b) => new Date(b.tarih) - new Date(a.tarih)).map((kayit) => {
              const iconMap = {
                'tohumlama': '🐄',
                'dogum': '🍼',
                'asi': '💉',
                'muayene': '🩺',
                'genel': '📝'
              };

              const colorMap = {
                'tohumlama': '#FF9800',
                'dogum': '#4CAF50',
                'asi': '#2196F3',
                'muayene': '#9C27B0',
                'genel': '#666'
              };

              return (
                <div
                  key={kayit._id}
                  style={{
                    padding: '15px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${colorMap[kayit.tip] || '#666'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '20px' }}>{iconMap[kayit.tip] || '📝'}</span>
                        <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
                          {kayit.tip === 'tohumlama' && 'Tohumlama'}
                          {kayit.tip === 'dogum' && 'Doğum'}
                          {kayit.tip === 'asi' && 'Aşı'}
                          {kayit.tip === 'muayene' && 'Muayene'}
                          {kayit.tip === 'genel' && 'Genel Kayıt'}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                        📅 {new Date(kayit.tarih).toLocaleDateString('tr-TR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      {kayit.aciklama && (
                        <div style={{ fontSize: '14px', color: '#333', marginTop: '8px' }}>
                          {kayit.aciklama}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => timelineSil(kayit._id)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
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
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#999',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📋</div>
            <p style={{ margin: 0 }}>Henüz kayıt yok</p>
          </div>
        )}
      </div>

      {/* TİMELİNE EKLEME MODAL */}
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
            <h2 style={{ marginTop: 0 }}>
              {timelineTip === 'tohumlama' ? '🐄 Tohumlama Ekle' : '📝 Kayıt Ekle'}
            </h2>

            {!timelineTip && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Kayıt Tipi:
                </label>
                <select
                  value={timelineTip}
                  onChange={(e) => setTimelineTip(e.target.value)}
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
                  <option value="genel">📝 Genel</option>
                  <option value="asi">💉 Aşı</option>
                  <option value="muayene">🩺 Muayene</option>
                </select>
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Tarih: *
              </label>
              <input
                type="date"
                value={yeniTimeline.tarih}
                onChange={(e) => setYeniTimeline({ ...yeniTimeline, tarih: e.target.value })}
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Açıklama:
              </label>
              <textarea
                value={yeniTimeline.aciklama}
                onChange={(e) => setYeniTimeline({ ...yeniTimeline, aciklama: e.target.value })}
                rows="3"
                placeholder={timelineTip === 'tohumlama' ? 'Tohumlama detayları...' : 'Açıklama...'}
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

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setTimelineEkrani(false);
                  setTimelineTip('');
                  setYeniTimeline({
                    tarih: new Date().toISOString().split('T')[0],
                    aciklama: ''
                  });
                }}
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
                onClick={timelineEkle}
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

export default DuveDetay;