import { useState, useEffect } from 'react';
import * as api from '../services/api';

function Tosunlar() {
  const [tosunlar, setTosunlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [tosunEkrani, setTosunEkrani] = useState(false);
  const [detayTosun, setDetayTosun] = useState(null);
  const [duzenlenecekTosun, setDuzenlenecekTosun] = useState(null);
  const [yeniTosun, setYeniTosun] = useState({
    isim: '',
    kupeNo: '',
    dogumTarihi: '',
    kilo: '',
    not: ''
  });

  useEffect(() => {
    tosunlariYukle();
  }, []);

  const tosunlariYukle = async () => {
    setYukleniyor(true);
    try {
      const response = await api.getTosunlar();
      setTosunlar(response.data);
    } catch (error) {
      console.error('Tosunlar yüklenemedi:', error);
    } finally {
      setYukleniyor(false);
    }
  };

  const tosunEkle = async () => {
    if (!yeniTosun.isim || !yeniTosun.kupeNo || !yeniTosun.dogumTarihi) {
      alert('Lütfen tüm zorunlu alanları doldurun!');
      return;
    }

    try {
      await api.createTosun(yeniTosun);
      alert('✅ Tosun eklendi!');
      setTosunEkrani(false);
      setYeniTosun({ isim: '', kupeNo: '', dogumTarihi: '', kilo: '', not: '' });
      tosunlariYukle();
    } catch (error) {
      alert('❌ Hata: ' + (error.response?.data?.message || 'Tosun eklenemedi!'));
    }
  };

  const tosunGuncelle = async () => {
    if (!duzenlenecekTosun.isim || !duzenlenecekTosun.kupeNo || !duzenlenecekTosun.dogumTarihi) {
      alert('Lütfen zorunlu alanları doldurun!');
      return;
    }

    try {
      await api.updateTosun(duzenlenecekTosun._id, duzenlenecekTosun);
      alert('✅ Tosun güncellendi!');
      setDuzenlenecekTosun(null);
      tosunlariYukle();
    } catch (error) {
      alert('❌ Hata: Tosun güncellenemedi!');
    }
  };

  const tosunSil = async (id) => {
    if (!window.confirm('Bu tosunu silmek istediğinize emin misiniz?')) return;

    try {
      await api.deleteTosun(id);
      alert('✅ Tosun silindi!');
      tosunlariYukle();
    } catch (error) {
      alert('❌ Hata: Tosun silinemedi!');
    }
  };

  if (yukleniyor) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Yükleniyor...</div>;
  }

  // Detay ekranı
  if (detayTosun) {
    const yas = Math.floor((new Date() - new Date(detayTosun.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));

    return (
      <div>
        <button
          onClick={() => setDetayTosun(null)}
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
                🐂 {detayTosun.isim}
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
                Küpe: {detayTosun.kupeNo}
              </div>
            </div>
          </div>

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
                {detayTosun.kilo || '-'} kg
              </div>
            </div>

            <div style={{
              backgroundColor: '#F5F5F5',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>DOĞUM TARİHİ</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                {new Date(detayTosun.dogumTarihi).toLocaleDateString('tr-TR')}
              </div>
            </div>
          </div>

          {detayTosun.not && (
            <div style={{
              backgroundColor: '#F9F9F9',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '10px' }}>📝 Notlar</h3>
              <p style={{ margin: 0, color: '#666' }}>{detayTosun.not}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button
              onClick={() => {
                setDetayTosun(null);
                setDuzenlenecekTosun(detayTosun);
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
                if (window.confirm('Bu tosunu silmek istediğinize emin misiniz?')) {
                  tosunSil(detayTosun._id);
                  setDetayTosun(null);
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
            🐂 Tosunlar
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
            Toplam {tosunlar.length} tosun kayıtlı
          </p>
        </div>
        <button
          onClick={() => setTosunEkrani(true)}
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
          + Tosun Ekle
        </button>
      </div>

      {tosunlar.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {tosunlar.map((tosun) => {
            const yas = Math.floor((new Date() - new Date(tosun.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));

            return (
              <div
                key={tosun._id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  border: '1px solid #e0e0e0',
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
                    🐂 {tosun.isim}
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
                    Küpe: {tosun.kupeNo}
                  </div>
                </div>

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
                      {tosun.kilo || '-'}
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
                      ♂
                    </div>
                    <div style={{ fontSize: '10px', color: '#999' }}>erkek</div>
                  </div>
                </div>

                {/* Not */}
                {tosun.not && (
                  <div style={{
                    backgroundColor: '#F9F9F9',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '15px',
                    fontSize: '13px',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    📝 {tosun.not}
                  </div>
                )}

                {/* Aksiyon Butonları */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '8px'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetayTosun(tosun);
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
                      setDuzenlenecekTosun({ ...tosun });
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
                      tosunSil(tosun._id);
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
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🐂</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Henüz tosun kaydı yok</h3>
          <p style={{ color: '#999', margin: 0 }}>Yeni tosun eklemek için yukarıdaki butonu kullanın</p>
        </div>
      )}

      {/* TOSUN EKLEME/DÜZENLEME MODAL */}
      {(tosunEkrani || duzenlenecekTosun) && (
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
              🐂 {duzenlenecekTosun ? 'Tosun Düzenle' : 'Yeni Tosun Ekle'}
            </h2>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                İsim: *
              </label>
              <input
                type="text"
                value={duzenlenecekTosun ? duzenlenecekTosun.isim : yeniTosun.isim}
                onChange={(e) => duzenlenecekTosun
                  ? setDuzenlenecekTosun({ ...duzenlenecekTosun, isim: e.target.value })
                  : setYeniTosun({ ...yeniTosun, isim: e.target.value })
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

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Küpe No: *
              </label>
              <input
                type="text"
                value={duzenlenecekTosun ? duzenlenecekTosun.kupeNo : yeniTosun.kupeNo}
                onChange={(e) => duzenlenecekTosun
                  ? setDuzenlenecekTosun({ ...duzenlenecekTosun, kupeNo: e.target.value })
                  : setYeniTosun({ ...yeniTosun, kupeNo: e.target.value })
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

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Doğum Tarihi: *
              </label>
              <input
                type="date"
                value={duzenlenecekTosun ? duzenlenecekTosun.dogumTarihi : yeniTosun.dogumTarihi}
                onChange={(e) => duzenlenecekTosun
                  ? setDuzenlenecekTosun({ ...duzenlenecekTosun, dogumTarihi: e.target.value })
                  : setYeniTosun({ ...yeniTosun, dogumTarihi: e.target.value })
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

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Kilo (kg):
              </label>
              <input
                type="number"
                value={duzenlenecekTosun ? duzenlenecekTosun.kilo : yeniTosun.kilo}
                onChange={(e) => duzenlenecekTosun
                  ? setDuzenlenecekTosun({ ...duzenlenecekTosun, kilo: e.target.value })
                  : setYeniTosun({ ...yeniTosun, kilo: e.target.value })
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Not:
              </label>
              <textarea
                value={duzenlenecekTosun ? duzenlenecekTosun.not : yeniTosun.not}
                onChange={(e) => duzenlenecekTosun
                  ? setDuzenlenecekTosun({ ...duzenlenecekTosun, not: e.target.value })
                  : setYeniTosun({ ...yeniTosun, not: e.target.value })
                }
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setTosunEkrani(false);
                  setDuzenlenecekTosun(null);
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
                onClick={duzenlenecekTosun ? tosunGuncelle : tosunEkle}
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
                {duzenlenecekTosun ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tosunlar;
