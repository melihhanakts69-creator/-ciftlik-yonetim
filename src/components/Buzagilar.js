import { useState, useEffect } from 'react';
import * as api from '../services/api';

function Buzagilar({ buzagilar, setBuzagilar, inekler }) {
  const [buzagiEkrani, setBuzagiEkrani] = useState(false);
  const [detayBuzagi, setDetayBuzagi] = useState(null);
  const [duzenlenecekBuzagi, setDuzenlenecekBuzagi] = useState(null);
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
    if (!yeniBuzagi.isim || !yeniBuzagi.kupeNo || !yeniBuzagi.dogumTarihi || !yeniBuzagi.anneKupeNo) {
      alert('Lütfen zorunlu alanları doldurun (İsim, Küpe No, Doğum Tarihi, Anne İnek)!');
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

  const buzagiGuncelle = async () => {
    if (!duzenlenecekBuzagi.isim || !duzenlenecekBuzagi.kupeNo || !duzenlenecekBuzagi.dogumTarihi) {
      alert('Lütfen zorunlu alanları doldurun!');
      return;
    }

    try {
      const response = await api.updateBuzagi(duzenlenecekBuzagi._id || duzenlenecekBuzagi.id, duzenlenecekBuzagi);
      setBuzagilar(buzagilar.map(b =>
        (b._id === duzenlenecekBuzagi._id || b.id === duzenlenecekBuzagi.id)
          ? { ...response.data, id: response.data._id }
          : b
      ));
      setDuzenlenecekBuzagi(null);
      alert('✅ Buzağı güncellendi!');
    } catch (error) {
      alert('❌ Hata: Buzağı güncellenemedi!');
    }
  };

  const buzagiSil = async (id) => {
    if (!window.confirm('Bu buzağıyı silmek istediğinize emin misiniz?')) return;

    try {
      await api.deleteBuzagi(id);
      setBuzagilar(buzagilar.filter(b => b.id !== id && b._id !== id));
      alert('✅ Buzağı silindi!');
    } catch (error) {
      alert('❌ Hata: Buzağı silinemedi!');
    }
  };

  const buzagiGecisYap = async (buzagi) => {
    const hedef = buzagi.cinsiyet === 'disi' ? 'Düve' : 'Tosun';
    if (!window.confirm(`${buzagi.isim} buzağısını ${hedef}'a geçirmek istediğinize emin misiniz?`)) return;

    try {
      await api.buzagiGecisYap(buzagi._id);
      setBuzagilar(buzagilar.filter(b => b._id !== buzagi._id));
      alert(`✅ ${buzagi.isim} başarıyla ${hedef}'a geçirildi!`);
    } catch (error) {
      alert('❌ Hata: ' + (error.response?.data?.message || 'Geçiş yapılamadı!'));
    }
  };

  // Detay ekranındayken
  if (detayBuzagi) {
    const yas = Math.floor((new Date() - new Date(detayBuzagi.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
    const anneInek = inekler.find(i => i.kupeNo === detayBuzagi.anneKupeNo);
    const gecisHazir = yas >= 12;

    return (
      <div>
        <button
          onClick={() => setDetayBuzagi(null)}
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

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>
                {detayBuzagi.cinsiyet === 'disi' ? '♀' : '♂'} {detayBuzagi.isim}
              </h1>
              <div style={{
                display: 'inline-block',
                backgroundColor: '#FFF3E0',
                color: '#E65100',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                Küpe: {detayBuzagi.kupeNo}
              </div>
            </div>

            {gecisHazir && (
              <button
                onClick={() => buzagiGecisYap(detayBuzagi)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                ➡️ {detayBuzagi.cinsiyet === 'disi' ? 'Düve' : 'Tosun'}ye Geçir
              </button>
            )}
          </div>

          {gecisHazir && (
            <div style={{
              backgroundColor: '#E8F5E9',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              borderLeft: '4px solid #4CAF50'
            }}>
              <div style={{ fontSize: '14px', color: '#2E7D32', fontWeight: 'bold' }}>
                ✅ {detayBuzagi.cinsiyet === 'disi' ? 'Düve' : 'Tosun'}ye Geçiş Hazır
              </div>
              <div style={{ fontSize: '13px', color: '#66BB6A', marginTop: '4px' }}>
                12 ay ve üzeri buzağılar geçiş yapabilir
              </div>
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '30px'
          }}>
            <div style={{
              backgroundColor: '#F5F5F5',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>YAŞ</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                {yas} aylık
              </div>
            </div>

            <div style={{
              backgroundColor: '#F5F5F5',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>KİLO</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                {detayBuzagi.kilo || '-'} kg
              </div>
            </div>

            <div style={{
              backgroundColor: '#F5F5F5',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>CİNSİYET</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                {detayBuzagi.cinsiyet === 'disi' ? '♀ Dişi' : '♂ Erkek'}
              </div>
            </div>

            <div style={{
              backgroundColor: '#F5F5F5',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>DOĞUM TARİHİ</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                {new Date(detayBuzagi.dogumTarihi).toLocaleDateString('tr-TR')}
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#F9F9F9',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>👨‍👩‍👧 Aile Bilgileri</h3>
            <div style={{ marginBottom: '10px' }}>
              <strong>Anne:</strong> {anneInek ? `${anneInek.isim} (${anneInek.kupeNo})` : detayBuzagi.anneKupeNo || 'Belirtilmemiş'}
            </div>
            {detayBuzagi.babaKupeNo && (
              <div>
                <strong>Baba Küpe No:</strong> {detayBuzagi.babaKupeNo}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button
              onClick={() => {
                setDetayBuzagi(null);
                setDuzenlenecekBuzagi(detayBuzagi);
              }}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              ✏️ Düzenle
            </button>
            <button
              onClick={() => {
                if (window.confirm('Bu buzağıyı silmek istediğinize emin misiniz?')) {
                  buzagiSil(detayBuzagi._id || detayBuzagi.id);
                  setDetayBuzagi(null);
                }
              }}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              🗑️ Sil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '32px', fontWeight: 'bold' }}>
            🍼 Buzağılar
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
            Toplam {buzagilar.length} buzağı kayıtlı
            {buzagilar.filter(b => b.cinsiyet === 'disi').length > 0 && ` (${buzagilar.filter(b => b.cinsiyet === 'disi').length} ♀ dişi, ${buzagilar.filter(b => b.cinsiyet === 'erkek').length} ♂ erkek)`}
          </p>
        </div>
        <button
          onClick={() => setBuzagiEkrani(true)}
          style={{
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          + Buzağı Ekle
        </button>
      </div>

      {/* Özet Kartları */}
      {buzagilar.filter(b => {
        const farkAy = Math.floor((new Date() - new Date(b.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
        return farkAy >= 12;
      }).length > 0 && (
        <div style={{
          backgroundColor: '#E8F5E9',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          border: '1px solid #81C784',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ fontSize: '24px' }}>✅</div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2E7D32' }}>
              Geçişe Hazır: {buzagilar.filter(b => {
                const farkAy = Math.floor((new Date() - new Date(b.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
                return farkAy >= 12;
              }).length} buzağı
            </div>
            <div style={{ fontSize: '13px', color: '#66BB6A' }}>
              12 ay ve üzeri buzağılar Düve/Tosun'a geçirilebilir
            </div>
          </div>
        </div>
      )}

      {/* Buzağı Kartları */}
      {buzagilar.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {buzagilar.map((buzagi) => {
            const yas = Math.floor((new Date() - new Date(buzagi.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
            const gecisHazir = yas >= 12;
            const anneInek = inekler.find(i => i.kupeNo === buzagi.anneKupeNo);

            return (
              <div
                key={buzagi.id || buzagi._id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  border: gecisHazir ? '2px solid #4CAF50' : '1px solid #e0e0e0',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                }}
              >
                {/* Başlık */}
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    {buzagi.cinsiyet === 'disi' ? '♀' : '♂'} {buzagi.isim}
                  </h3>
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: '#FFF3E0',
                    color: '#E65100',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 'bold'
                  }}>
                    Küpe: {buzagi.kupeNo}
                  </div>
                </div>

                {/* Geçiş Hazır Etiketi */}
                {gecisHazir && (
                  <div style={{
                    backgroundColor: '#E8F5E9',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '15px',
                    borderLeft: '3px solid #4CAF50'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#2E7D32' }}>
                      ✅ {buzagi.cinsiyet === 'disi' ? 'Düve' : 'Tosun'}ye Geçiş Hazır
                    </div>
                  </div>
                )}

                {/* İstatistikler Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    backgroundColor: '#F5F5F5',
                    borderRadius: '8px',
                    padding: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>YAŞ</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                      {yas}
                    </div>
                    <div style={{ fontSize: '10px', color: '#999' }}>aylık</div>
                  </div>

                  <div style={{
                    backgroundColor: '#F5F5F5',
                    borderRadius: '8px',
                    padding: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>KİLO</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                      {buzagi.kilo || '-'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#999' }}>kg</div>
                  </div>

                  <div style={{
                    backgroundColor: '#F5F5F5',
                    borderRadius: '8px',
                    padding: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>CİNSİYET</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                      {buzagi.cinsiyet === 'disi' ? '♀' : '♂'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#999' }}>
                      {buzagi.cinsiyet === 'disi' ? 'dişi' : 'erkek'}
                    </div>
                  </div>
                </div>

                {/* Anne Bilgisi */}
                <div style={{
                  backgroundColor: '#F9F9F9',
                  borderRadius: '8px',
                  padding: '10px',
                  marginBottom: '15px'
                }}>
                  <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>ANNE</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                    {anneInek ? `${anneInek.isim} (${anneInek.kupeNo})` : buzagi.anneKupeNo || 'Belirtilmemiş'}
                  </div>
                </div>

                {/* Aksiyon Butonları */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: gecisHazir ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr',
                  gap: '8px'
                }}>
                  {gecisHazir && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        buzagiGecisYap(buzagi);
                      }}
                      style={{
                        padding: '10px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
                    >
                      ➡️
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetayBuzagi(buzagi);
                    }}
                    style={{
                      padding: '10px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1976D2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
                  >
                    📋 Detay
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDuzenlenecekBuzagi({...buzagi});
                    }}
                    style={{
                      padding: '10px',
                      backgroundColor: '#FF9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F57C00'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF9800'}
                  >
                    ✏️ Düzenle
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      buzagiSil(buzagi.id || buzagi._id);
                    }}
                    style={{
                      padding: '10px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d32f2f'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f44336'}
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🍼</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Henüz buzağı kaydı yok</h3>
          <p style={{ color: '#999', margin: 0 }}>Yeni buzağı eklemek için yukarıdaki butonu kullanın</p>
        </div>
      )}

      {/* BUZAĞI EKLEME/DÜZENLEME MODAL */}
      {(buzagiEkrani || duzenlenecekBuzagi) && (
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
              <h2 style={{ margin: 0 }}>
                🍼 {duzenlenecekBuzagi ? 'Buzağı Düzenle' : 'Yeni Buzağı Ekle'}
              </h2>
              <button
                onClick={() => {
                  setBuzagiEkrani(false);
                  setDuzenlenecekBuzagi(null);
                }}
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
                value={duzenlenecekBuzagi ? duzenlenecekBuzagi.isim : yeniBuzagi.isim}
                onChange={(e) => duzenlenecekBuzagi
                  ? setDuzenlenecekBuzagi({ ...duzenlenecekBuzagi, isim: e.target.value })
                  : setYeniBuzagi({ ...yeniBuzagi, isim: e.target.value })
                }
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
                  value={duzenlenecekBuzagi ? duzenlenecekBuzagi.anneKupeNo : yeniBuzagi.anneKupeNo}
                  onChange={(e) => {
                    const secilenKupeNo = e.target.value;
                    const secilenInek = inekler.find(i => i.kupeNo === secilenKupeNo);
                    if (duzenlenecekBuzagi) {
                      setDuzenlenecekBuzagi({
                        ...duzenlenecekBuzagi,
                        anneKupeNo: secilenKupeNo,
                        anneId: secilenInek?._id || '',
                        anneIsim: secilenInek?.isim || ''
                      });
                    } else {
                      setYeniBuzagi({
                        ...yeniBuzagi,
                        anneKupeNo: secilenKupeNo,
                        anneId: secilenInek?._id || '',
                        anneIsim: secilenInek?.isim || ''
                      });
                    }
                  }}
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
                    <option key={inek._id} value={inek.kupeNo}>
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
                  value={duzenlenecekBuzagi ? duzenlenecekBuzagi.dogumTarihi : yeniBuzagi.dogumTarihi}
                  onChange={(e) => duzenlenecekBuzagi
                    ? setDuzenlenecekBuzagi({ ...duzenlenecekBuzagi, dogumTarihi: e.target.value })
                    : setYeniBuzagi({ ...yeniBuzagi, dogumTarihi: e.target.value })
                  }
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
                  value={duzenlenecekBuzagi ? duzenlenecekBuzagi.kupeNo : yeniBuzagi.kupeNo}
                  onChange={(e) => duzenlenecekBuzagi
                    ? setDuzenlenecekBuzagi({ ...duzenlenecekBuzagi, kupeNo: e.target.value })
                    : setYeniBuzagi({ ...yeniBuzagi, kupeNo: e.target.value })
                  }
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
                  value={duzenlenecekBuzagi ? duzenlenecekBuzagi.cinsiyet : yeniBuzagi.cinsiyet}
                  onChange={(e) => duzenlenecekBuzagi
                    ? setDuzenlenecekBuzagi({ ...duzenlenecekBuzagi, cinsiyet: e.target.value })
                    : setYeniBuzagi({ ...yeniBuzagi, cinsiyet: e.target.value })
                  }
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
                value={duzenlenecekBuzagi ? duzenlenecekBuzagi.kilo : yeniBuzagi.kilo}
                onChange={(e) => duzenlenecekBuzagi
                  ? setDuzenlenecekBuzagi({ ...duzenlenecekBuzagi, kilo: e.target.value })
                  : setYeniBuzagi({ ...yeniBuzagi, kilo: e.target.value })
                }
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
                onClick={() => {
                  setBuzagiEkrani(false);
                  setDuzenlenecekBuzagi(null);
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
                onClick={duzenlenecekBuzagi ? buzagiGuncelle : buzagiEkle}
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
                {duzenlenecekBuzagi ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Buzagilar;
