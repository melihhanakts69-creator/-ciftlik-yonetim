import { useState } from 'react';
import * as api from '../services/api';
import DuveDetay from './DuveDetay';
import { showSuccess, showError, showWarning } from '../utils/toast';

function Duveler({ duveler, setDuveler, inekler }) {
  const [duveEkrani, setDuveEkrani] = useState(false);
  const [secilenDuve, setSecilenDuve] = useState(null);
  const [duzenlenecekDuve, setDuzenlenecekDuve] = useState(null);
  const [dogumEkrani, setDogumEkrani] = useState(false);
  const [dogumYapacakDuve, setDogumYapacakDuve] = useState(null);
  const [dogumBilgileri, setDogumBilgileri] = useState({
    dogumTarihi: '',
    buzagiIsim: '',
    buzagiCinsiyet: 'disi',
    buzagiKilo: '',
    notlar: ''
  });
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
      showWarning('Lütfen zorunlu alanları doldurun!');
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

      setDuveler([...duveler, response.data]);

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
      showSuccess('Düve eklendi!');
    } catch (error) {
      showError(error.response?.data?.message || 'Düve eklenemedi!');
    }
  };

  const duveSil = async (id) => {
    if (!window.confirm('Bu düveyi silmek istediğinize emin misiniz?')) return;

    try {
      await api.deleteDuve(id);
      setDuveler(duveler.filter(d => d._id !== id));
      showSuccess('Düve silindi!');
    } catch (error) {
      showError('Düve silinemedi!');
    }
  };
  const duveGuncelle = async () => {
    if (!duzenlenecekDuve.isim || !duzenlenecekDuve.kupeNo || !duzenlenecekDuve.dogumTarihi) {
      showWarning('Lütfen zorunlu alanları doldurun!');
      return;
    }

    try {
      await api.updateDuve(duzenlenecekDuve._id, {
        isim: duzenlenecekDuve.isim,
        kupeNo: duzenlenecekDuve.kupeNo,
        dogumTarihi: duzenlenecekDuve.dogumTarihi,
        yas: parseInt(duzenlenecekDuve.yas),
        kilo: parseFloat(duzenlenecekDuve.kilo),
        anneKupeNo: duzenlenecekDuve.anneKupeNo,
        tohumlamaTarihi: duzenlenecekDuve.tohumlamaTarihi || null,
        gebelikDurumu: duzenlenecekDuve.gebelikDurumu,
        notlar: duzenlenecekDuve.notlar
      });

      setDuveler(duveler.map(d =>
        d._id === duzenlenecekDuve._id ? { ...duzenlenecekDuve } : d
      ));


      setDuzenlenecekDuve(null);
      showSuccess('Düve güncellendi!');
    } catch (error) {
      showError(error.response?.data?.message || 'Düve güncellenemedi!');
    }
  };

  const duveDogurdu = async () => {
    if (!dogumBilgileri.dogumTarihi || !dogumBilgileri.buzagiIsim || !dogumBilgileri.buzagiCinsiyet || !dogumBilgileri.buzagiKilo) {
      showWarning('Lütfen tüm zorunlu alanları doldurun!');
      return;
    }

    try {
      const response = await api.duveDogurdu(dogumYapacakDuve._id, {
        dogumTarihi: dogumBilgileri.dogumTarihi,
        buzagiIsim: dogumBilgileri.buzagiIsim,
        buzagiCinsiyet: dogumBilgileri.buzagiCinsiyet,
        buzagiKilo: parseFloat(dogumBilgileri.buzagiKilo),
        notlar: dogumBilgileri.notlar
      });

      // Düveyi listeden çıkar
      setDuveler(duveler.filter(d => d._id !== dogumYapacakDuve._id));

      setDogumEkrani(false);
      setDogumYapacakDuve(null);
      setDogumBilgileri({
        dogumTarihi: '',
        buzagiIsim: '',
        buzagiCinsiyet: 'disi',
        buzagiKilo: '',
        notlar: ''
      });

      showSuccess(`${dogumYapacakDuve.isim} doğurdu ve inek oldu! Buzağı: ${dogumBilgileri.buzagiIsim}`);
    } catch (error) {
      showError(error.response?.data?.message || 'Doğum işlemi başarısız!');
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
      {/* DETAY EKRANI */}
      {secilenDuve && (
        <DuveDetay
          duve={secilenDuve}
          onKapat={() => setSecilenDuve(null)}
        />
      )}

      {/* ANA LİSTE - Detay veya Düzenle açıksa gizle */}
      {!secilenDuve && (

        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <h1 style={{ margin: '0 0 5px 0', fontSize: '32px', fontWeight: 'bold' }}>
                🐄 Düveler
              </h1>
              <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
                Toplam {duveler.length} düve kayıtlı
                {duveler.filter(d => d.gebelikDurumu === 'Gebe').length > 0 &&
                  ` (${duveler.filter(d => d.gebelikDurumu === 'Gebe').length} gebe)`}
              </p>
            </div>
            <button
              onClick={() => setDuveEkrani(true)}
              style={{
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              + Düve Ekle
            </button>
          </div>

          {/* Özet Kartları */}
          {duveler.filter(d => {
            const kalan = kalanGunHesapla(d.tohumlamaTarihi);
            return kalan !== null && kalan > 0 && kalan <= 30;
          }).length > 0 && (
              <div style={{
                backgroundColor: '#FFF3E0',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '20px',
                border: '1px solid #FFB74D',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ fontSize: '24px' }}>⚠️</div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#E65100' }}>
                    Yaklaşan Doğumlar: {duveler.filter(d => {
                      const kalan = kalanGunHesapla(d.tohumlamaTarihi);
                      return kalan !== null && kalan > 0 && kalan <= 30;
                    }).length} düve
                  </div>
                  <div style={{ fontSize: '13px', color: '#F57C00' }}>
                    30 gün içinde doğum yapacak düveler
                  </div>
                </div>
              </div>
            )}

          {/* Düve Kartları */}
          {duveler.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '20px'
            }}>
              {duveler.map((duve) => {
                const yas = Math.floor((new Date() - new Date(duve.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
                const kalanGun = kalanGunHesapla(duve.tohumlamaTarihi);
                const dogumTarihi = dogumTarihiHesapla(duve.tohumlamaTarihi);

                return (
                  <div
                    key={duve._id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      border: duve.gebelikDurumu === 'Gebe' ? '2px solid #4CAF50' : '1px solid #e0e0e0',
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
                        🐄 {duve.isim}
                      </h3>
                      <div style={{
                        display: 'inline-block',
                        backgroundColor: '#E8F5E9',
                        color: '#2E7D32',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}>
                        Küpe: {duve.kupeNo}
                      </div>
                    </div>

                    {/* Gebelik Durumu Kartı */}
                    {duve.gebelikDurumu === 'Gebe' && duve.tohumlamaTarihi && (
                      <div style={{
                        backgroundColor: '#E8F5E9',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '15px',
                        borderLeft: '3px solid #4CAF50'
                      }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#2E7D32', marginBottom: '4px' }}>
                          🤰 Gebe
                        </div>
                        {kalanGun !== null && (
                          <div style={{ fontSize: '12px', color: kalanGun <= 30 ? '#f44336' : '#66BB6A' }}>
                            {kalanGun > 0
                              ? `📅 ${kalanGun} gün kaldı`
                              : kalanGun === 0
                                ? '⚠️ BUGÜN DOĞUM!'
                                : `❗ ${Math.abs(kalanGun)} gün geçti`
                            }
                          </div>
                        )}
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
                          {duve.kilo}
                        </div>
                        <div style={{ fontSize: '10px', color: '#999' }}>kg</div>
                      </div>

                      <div style={{
                        backgroundColor: duve.gebelikDurumu === 'Gebe' ? '#E8F5E9' :
                          duve.gebelikDurumu === 'Belirsiz' ? '#FFF3E0' : '#F5F5F5',
                        borderRadius: '8px',
                        padding: '10px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>DURUM</div>
                        <div style={{
                          fontSize: '14px', fontWeight: 'bold',
                          color: duve.gebelikDurumu === 'Gebe' ? '#2E7D32' :
                            duve.gebelikDurumu === 'Belirsiz' ? '#E65100' : '#666'
                        }}>
                          {duve.gebelikDurumu === 'Gebe' ? '🤰' :
                            duve.gebelikDurumu === 'Belirsiz' ? '❓' : '❌'}
                        </div>
                        <div style={{ fontSize: '10px', color: '#999' }}>
                          {duve.gebelikDurumu}
                        </div>
                      </div>
                    </div>

                    {/* Tohumlama Bilgisi */}
                    {duve.tohumlamaTarihi && dogumTarihi && (
                      <div style={{
                        backgroundColor: '#F9F9F9',
                        borderRadius: '8px',
                        padding: '10px',
                        marginBottom: '15px',
                        fontSize: '12px',
                        color: '#666'
                      }}>
                        <div><strong>Tohumlama:</strong> {new Date(duve.tohumlamaTarihi).toLocaleDateString('tr-TR')}</div>
                        <div><strong>Beklenen Doğum:</strong> {dogumTarihi.toLocaleDateString('tr-TR')}</div>
                      </div>
                    )}

                    {/* Aksiyon Butonları */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: duve.gebelikDurumu === 'Gebe' && duve.tohumlamaTarihi ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr',
                      gap: '8px'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSecilenDuve(duve);
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
                      {duve.gebelikDurumu === 'Gebe' && duve.tohumlamaTarihi && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDogumYapacakDuve(duve);
                            setDogumEkrani(true);
                            setDogumBilgileri({
                              dogumTarihi: new Date().toISOString().split('T')[0],
                              buzagiIsim: '',
                              buzagiCinsiyet: 'disi',
                              buzagiKilo: '',
                              notlar: ''
                            });
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
                          🤰 Doğurdu
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDuzenlenecekDuve({ ...duve });
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
                          duveSil(duve._id);
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
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🐄</div>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Henüz düve kaydı yok</h3>
              <p style={{ color: '#999', margin: 0 }}>Yeni düve eklemek için yukarıdaki butonu kullanın</p>
            </div>
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
                      <option key={inek._id} value={inek.kupeNo}>
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
          {/* DÜVE DÜZENLEME MODAL */}
          {duzenlenecekDuve && (
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
                  <h2 style={{ margin: 0 }}>✏️ Düve Düzenle</h2>
                  <button
                    onClick={() => setDuzenlenecekDuve(null)}
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
                    value={duzenlenecekDuve.isim}
                    onChange={(e) => setDuzenlenecekDuve({ ...duzenlenecekDuve, isim: e.target.value })}
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
                      value={duzenlenecekDuve.kupeNo}
                      onChange={(e) => setDuzenlenecekDuve({ ...duzenlenecekDuve, kupeNo: e.target.value })}
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
                      value={duzenlenecekDuve.dogumTarihi}
                      onChange={(e) => setDuzenlenecekDuve({ ...duzenlenecekDuve, dogumTarihi: e.target.value })}
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
                      value={duzenlenecekDuve.yas}
                      onChange={(e) => setDuzenlenecekDuve({ ...duzenlenecekDuve, yas: e.target.value })}
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
                      value={duzenlenecekDuve.kilo}
                      onChange={(e) => setDuzenlenecekDuve({ ...duzenlenecekDuve, kilo: e.target.value })}
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
                    value={duzenlenecekDuve.anneKupeNo || ''}
                    onChange={(e) => setDuzenlenecekDuve({ ...duzenlenecekDuve, anneKupeNo: e.target.value })}
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
                      <option key={inek._id} value={inek.kupeNo}>
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
                    value={duzenlenecekDuve.tohumlamaTarihi || ''}
                    onChange={(e) => setDuzenlenecekDuve({ ...duzenlenecekDuve, tohumlamaTarihi: e.target.value })}
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
                    value={duzenlenecekDuve.gebelikDurumu || 'Belirsiz'}
                    onChange={(e) => setDuzenlenecekDuve({ ...duzenlenecekDuve, gebelikDurumu: e.target.value })}
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
                    value={duzenlenecekDuve.notlar || ''}
                    onChange={(e) => setDuzenlenecekDuve({ ...duzenlenecekDuve, notlar: e.target.value })}
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
                    onClick={() => setDuzenlenecekDuve(null)}
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
                    onClick={duveGuncelle}
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
                    Güncelle
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DOĞUM MODAL */}
          {dogumEkrani && dogumYapacakDuve && (
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
                  <h2 style={{ margin: 0, color: '#4CAF50' }}>🤰 Düve Doğurdu</h2>
                  <button
                    onClick={() => {
                      setDogumEkrani(false);
                      setDogumYapacakDuve(null);
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
                    ✕
                  </button>
                </div>

                <div style={{
                  backgroundColor: '#e8f5e9',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <p style={{ margin: '5px 0', fontWeight: 'bold', fontSize: '16px' }}>
                    🐄 {dogumYapacakDuve.isim} (#{dogumYapacakDuve.kupeNo})
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                    Bu düve doğurduktan sonra otomatik olarak inek'e geçecektir.
                  </p>
                </div>

                {/* Doğum Tarihi */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Doğum Tarihi: *
                  </label>
                  <input
                    type="date"
                    value={dogumBilgileri.dogumTarihi}
                    onChange={(e) => setDogumBilgileri({ ...dogumBilgileri, dogumTarihi: e.target.value })}
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

                {/* Buzağı İsmi */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Buzağı İsmi: *
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Minnoş"
                    value={dogumBilgileri.buzagiIsim}
                    onChange={(e) => setDogumBilgileri({ ...dogumBilgileri, buzagiIsim: e.target.value })}
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

                {/* Buzağı Cinsiyeti & Kilo */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Buzağı Cinsiyeti: *
                    </label>
                    <select
                      value={dogumBilgileri.buzagiCinsiyet}
                      onChange={(e) => setDogumBilgileri({ ...dogumBilgileri, buzagiCinsiyet: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="disi">🐄 Dişi</option>
                      <option value="erkek">🐂 Erkek</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Buzağı Kilosu (kg): *
                    </label>
                    <input
                      type="number"
                      placeholder="30"
                      value={dogumBilgileri.buzagiKilo}
                      onChange={(e) => setDogumBilgileri({ ...dogumBilgileri, buzagiKilo: e.target.value })}
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

                {/* Notlar */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Notlar:
                  </label>
                  <textarea
                    placeholder="Doğum hakkında notlar..."
                    value={dogumBilgileri.notlar}
                    onChange={(e) => setDogumBilgileri({ ...dogumBilgileri, notlar: e.target.value })}
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
                    onClick={() => {
                      setDogumEkrani(false);
                      setDogumYapacakDuve(null);
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
                    onClick={duveDogurdu}
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
                    ✅ Kaydet
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Duveler;