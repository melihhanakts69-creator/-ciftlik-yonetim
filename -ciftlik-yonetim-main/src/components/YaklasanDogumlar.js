import { useState, useEffect } from 'react';
import * as api from '../services/api';

function YaklasanDogumlar({ onInekSec, onDuveSec }) {
  const [yaklasanlar, setYaklasanlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    yaklasanlariYukle();
  }, []);

  const yaklasanlariYukle = async () => {
    try {
      setYukleniyor(true);
      const response = await api.getYaklasanDogumlar();
      setYaklasanlar(response.data);
    } catch (error) {
      console.error('Yaklaşan doğumlar yüklenemedi:', error);
    } finally {
      setYukleniyor(false);
    }
  };

  const aciliyetRengi = (kalanGun) => {
    if (kalanGun <= 3) return '#f44336';
    if (kalanGun <= 7) return '#FF9800';
    if (kalanGun <= 14) return '#FFC107';
    return '#4CAF50';
  };

  const aciliyetIkon = (kalanGun) => {
    if (kalanGun <= 3) return '🚨';
    if (kalanGun <= 7) return '⚠️';
    if (kalanGun <= 14) return '⚡';
    return '📅';
  };

  const aciliyetMetin = (kalanGun) => {
    if (kalanGun <= 3) return 'KRİTİK!';
    if (kalanGun <= 7) return 'YAKIN!';
    if (kalanGun <= 14) return 'Yaklaşıyor';
    return 'Normal';
  };

  if (yukleniyor) {
    return (
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <p style={{ color: '#666' }}>Yükleniyor...</p>
      </div>
    );
  }

  // İnek ve düveleri grupla
  const inekler = yaklasanlar.filter(item => item.hayvanTipi === 'inek');
  const duveler = yaklasanlar.filter(item => item.hayvanTipi === 'duve');

  return (
    <div style={{
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
        🚨 Yaklaşan Doğumlar
        {yaklasanlar.length > 0 && (
          <span style={{
            backgroundColor: '#f44336',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '14px'
          }}>
            {yaklasanlar.length}
          </span>
        )}
      </h2>

      {yaklasanlar.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* İNEKLER */}
          {inekler.length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: '#2196F3', fontSize: '16px' }}>
                🐮 İNEKLER ({inekler.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {inekler.map((item) => (
                  <div
                    key={item.hayvan._id}
                    style={{
                      padding: '15px',
                      borderRadius: '12px',
                      border: `3px solid ${aciliyetRengi(item.kalanGun)}`,
                      backgroundColor: item.kalanGun <= 7 ? '#fff3e0' : '#f5f5f5',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                    }}
                    onClick={() => onInekSec && onInekSec(item.hayvan)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                          {aciliyetIkon(item.kalanGun)} {item.hayvan.isim} (#{item.hayvan.kupeNo})
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          Tahmini Doğum: {new Date(item.tahminiDoğum).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '32px',
                          fontWeight: 'bold',
                          color: aciliyetRengi(item.kalanGun),
                          lineHeight: 1
                        }}>
                          {item.kalanGun}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          gün kaldı
                        </div>
                      </div>
                    </div>

                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: aciliyetRengi(item.kalanGun),
                      color: 'white',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}>
                      {aciliyetMetin(item.kalanGun)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DÜVELER */}
          {duveler.length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: '#4CAF50', fontSize: '16px' }}>
                🐄 DÜVELER ({duveler.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {duveler.map((item) => (
                  <div
                    key={item.hayvan._id}
                    style={{
                      padding: '15px',
                      borderRadius: '12px',
                      border: `3px solid ${aciliyetRengi(item.kalanGun)}`,
                      backgroundColor: item.kalanGun <= 7 ? '#fff3e0' : '#f5f5f5',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                    }}
                    onClick={() => onDuveSec && onDuveSec(item.hayvan)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                          {aciliyetIkon(item.kalanGun)} {item.hayvan.isim} (#{item.hayvan.kupeNo})
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          Tahmini Doğum: {new Date(item.tahminiDoğum).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '32px',
                          fontWeight: 'bold',
                          color: aciliyetRengi(item.kalanGun),
                          lineHeight: 1
                        }}>
                          {item.kalanGun}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          gün kaldı
                        </div>
                      </div>
                    </div>

                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: aciliyetRengi(item.kalanGun),
                      color: 'white',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}>
                      {aciliyetMetin(item.kalanGun)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#999'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
          <p style={{ margin: 0, fontSize: '16px' }}>
            Önümüzdeki 30 günde doğum beklenen hayvan yok
          </p>
        </div>
      )}
    </div>
  );
}

export default YaklasanDogumlar;