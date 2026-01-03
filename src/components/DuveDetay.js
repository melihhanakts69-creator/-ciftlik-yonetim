import { useState, useEffect } from 'react';
import * as api from '../services/api';

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
      alert('Tarih seçin!');
      return;
    }

    try {
      await api.createTimeline({
        hayvanId: duve._id,
        hayvanTipi: 'düve',
        tip: timelineTip || 'genel',
        tarih: yeniTimeline.tarih,
        aciklama: yeniTimeline.aciklama
      });

      setYeniTimeline({
        tarih: new Date().toISOString().split('T')[0],
        aciklama: ''
      });
      setTimelineEkrani(false);
      setTimelineTip('');
      timelineYukle();
      alert('✅ Kayıt eklendi!');
    } catch (error) {
      alert('❌ Hata: Kayıt eklenemedi!');
    }
  };

  const timelineSil = async (id) => {
    if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;

    try {
      await api.deleteTimeline(id);
      timelineYukle();
      alert('✅ Kayıt silindi!');
    } catch (error) {
      alert('❌ Hata: Kayıt silinemedi!');
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

  const yas = Math.floor((new Date() - new Date(duve.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
  const kalanGun = kalanGunHesapla();
  const dogumTarihi = dogumTarihiHesapla();

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
          marginBottom: '20px'
        }}
      >
        ← Geri
      </button>

      {/* DÜVE BİLGİLERİ */}
      <div style={{
        backgroundColor: '#e8f5e9',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <h2 style={{ marginTop: 0 }}>🐄 {duve.isim}</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
          <div>
            <p><strong>Küpe No:</strong> {duve.kupeNo}</p>
            <p><strong>Yaş:</strong> {yas} aylık</p>
            <p><strong>Kilo:</strong> {duve.kilo} kg</p>
          </div>
          <div>
            <p><strong>Doğum Tarihi:</strong> {new Date(duve.dogumTarihi).toLocaleDateString('tr-TR')}</p>
            {duve.anneKupeNo && <p><strong>Anne:</strong> {duve.anneKupeNo}</p>}
            <p><strong>Gebelik Durumu:</strong> {duve.gebelikDurumu}</p>
          </div>
        </div>

        {/* GEBELİK BİLGİLERİ */}
        {duve.tohumlamaTarihi && (
          <div style={{
            marginTop: '15px',
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '8px'
          }}>
            <h3 style={{ marginTop: 0 }}>🤰 Gebelik Bilgileri</h3>
            <p><strong>Tohumlama Tarihi:</strong> {new Date(duve.tohumlamaTarihi).toLocaleDateString('tr-TR')}</p>
            {dogumTarihi && (
              <>
                <p><strong>Beklenen Doğum:</strong> {dogumTarihi.toLocaleDateString('tr-TR')}</p>
                {kalanGun !== null && (
                  <p style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: kalanGun <= 30 ? '#f44336' : '#4CAF50'
                  }}>
                    {kalanGun > 0
                      ? `📅 ${kalanGun} gün kaldı`
                      : kalanGun === 0
                      ? '⚠️ BUGÜN DOĞUM!'
                      : `❗ ${Math.abs(kalanGun)} gün geçti`
                    }
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {duve.notlar && (
          <div style={{ marginTop: '15px', fontStyle: 'italic', color: '#666' }}>
            📝 {duve.notlar}
          </div>
        )}
      </div>

      {/* GEÇMİŞ / TİMELİNE */}
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>📜 Geçmiş</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                setTimelineTip('tohumlama');
                setTimelineEkrani(true);
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🐄 Tohumlama
            </button>
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
        </div>

        {timeline.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {timeline.map((kayit) => (
              <div
                key={kayit._id}
                style={{
                  padding: '12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  borderLeft: '4px solid #4CAF50'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      {kayit.tip === 'tohumlama' && '🐄 Tohumlama'}
                      {kayit.tip === 'dogum' && '🍼 Doğum'}
                      {kayit.tip === 'genel' && '📝 Genel Kayıt'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      {new Date(kayit.tarih).toLocaleDateString('tr-TR')}
                    </div>
                    {kayit.aciklama && (
                      <div style={{ fontSize: '14px', marginTop: '5px' }}>
                        {kayit.aciklama}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => timelineSil(kayit._id)}
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
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#999' }}>Henüz kayıt yok</p>
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