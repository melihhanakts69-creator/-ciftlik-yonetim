import { useState, useEffect } from 'react';
import * as api from '../services/api';

function Finansal() {
  const [kayitlar, setKayitlar] = useState([]);
  const [ozet, setOzet] = useState(null);
  const [eklemeEkrani, setEklemeEkrani] = useState(false);
  const [filtreleme, setFiltreleme] = useState({
    tip: '', // 'gelir', 'gider', veya ''
    baslangic: '',
    bitis: ''
  });

  // Form state
  const [form, setForm] = useState({
    tip: 'gider',
    kategori: 'yem',
    miktar: '',
    tarih: new Date().toISOString().split('T')[0],
    aciklama: ''
  });

  const gelirKategorileri = [
    { value: 'sut-satisi', label: '🥛 Süt Satışı' },
    { value: 'hayvan-satisi', label: '🐄 Hayvan Satışı' },
    { value: 'diger-gelir', label: '💰 Diğer Gelir' }
  ];

  const giderKategorileri = [
    { value: 'yem', label: '🌾 Yem' },
    { value: 'veteriner', label: '💉 Veteriner' },
    { value: 'iscilik', label: '👷 İşçilik' },
    { value: 'elektrik', label: '💡 Elektrik' },
    { value: 'su', label: '💧 Su' },
    { value: 'bakim-onarim', label: '🔧 Bakım-Onarım' },
    { value: 'diger-gider', label: '💸 Diğer Gider' }
  ];

  useEffect(() => {
    kayitlariYukle();
    ozetYukle();
  }, [filtreleme]);

  const kayitlariYukle = async () => {
    try {
      const params = {};
      if (filtreleme.tip) params.tip = filtreleme.tip;
      if (filtreleme.baslangic) params.baslangic = filtreleme.baslangic;
      if (filtreleme.bitis) params.bitis = filtreleme.bitis;

      const response = await api.getFinansalKayitlar(params);
      setKayitlar(response.data);
    } catch (error) {
      console.error('Kayıtlar yüklenemedi:', error);
    }
  };

  const ozetYukle = async () => {
    try {
      const params = {};
      if (filtreleme.baslangic) params.baslangic = filtreleme.baslangic;
      if (filtreleme.bitis) params.bitis = filtreleme.bitis;

      const response = await api.getFinansalOzet(params);
      setOzet(response.data);
    } catch (error) {
      console.error('Özet yüklenemedi:', error);
    }
  };

  const kayitEkle = async () => {
    if (!form.miktar || form.miktar <= 0) {
      alert('Lütfen geçerli bir miktar girin');
      return;
    }

    try {
      await api.createFinansalKayit({
        tip: form.tip,
        kategori: form.kategori,
        miktar: parseFloat(form.miktar),
        tarih: form.tarih,
        aciklama: form.aciklama
      });

      setEklemeEkrani(false);
      setForm({
        tip: 'gider',
        kategori: 'yem',
        miktar: '',
        tarih: new Date().toISOString().split('T')[0],
        aciklama: ''
      });

      await kayitlariYukle();
      await ozetYukle();
      alert('✅ Kayıt eklendi!');
    } catch (error) {
      alert('❌ Hata: ' + (error.response?.data?.message || 'Kayıt eklenemedi!'));
    }
  };

  const kayitSil = async (id) => {
    if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;

    try {
      await api.deleteFinansalKayit(id);
      await kayitlariYukle();
      await ozetYukle();
      alert('✅ Kayıt silindi!');
    } catch (error) {
      alert('❌ Hata: ' + (error.response?.data?.message || 'Kayıt silinemedi!'));
    }
  };

  const kategoriGetir = (tip, kategori) => {
    const liste = tip === 'gelir' ? gelirKategorileri : giderKategorileri;
    const bulunan = liste.find(k => k.value === kategori);
    return bulunan ? bulunan.label : kategori;
  };

  return (
    <div>
      {/* Başlık */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '32px', fontWeight: 'bold' }}>
            💰 Finansal Yönetim
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
            Gelir ve gider takibi
          </p>
        </div>
        <button
          onClick={() => setEklemeEkrani(true)}
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
          + Kayıt Ekle
        </button>
      </div>

      {/* Özet Kartları */}
      {ozet && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Gelirler */}
          <div style={{
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            borderRadius: '16px',
            padding: '25px',
            color: 'white',
            boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Gelirler</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
              {ozet.toplamGelir.toLocaleString('tr-TR')} ₺
            </div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>Toplam gelir</div>
          </div>

          {/* Giderler */}
          <div style={{
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            borderRadius: '16px',
            padding: '25px',
            color: 'white',
            boxShadow: '0 4px 15px rgba(244, 67, 54, 0.3)'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Giderler</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
              {ozet.toplamGider.toLocaleString('tr-TR')} ₺
            </div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>Toplam gider</div>
          </div>

          {/* Net Kar/Zarar */}
          <div style={{
            background: ozet.netKar >= 0
              ? 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'
              : 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
            borderRadius: '16px',
            padding: '25px',
            color: 'white',
            boxShadow: ozet.netKar >= 0
              ? '0 4px 15px rgba(33, 150, 243, 0.3)'
              : '0 4px 15px rgba(255, 152, 0, 0.3)'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
              {ozet.netKar >= 0 ? 'Net Kar' : 'Net Zarar'}
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
              {Math.abs(ozet.netKar).toLocaleString('tr-TR')} ₺
            </div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>
              {ozet.netKar >= 0 ? 'Kâr durumu' : 'Zarar durumu'}
            </div>
          </div>
        </div>
      )}

      {/* Filtreler */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>Filtrele</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
              Tip:
            </label>
            <select
              value={filtreleme.tip}
              onChange={(e) => setFiltreleme({ ...filtreleme, tip: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}
            >
              <option value="">Tümü</option>
              <option value="gelir">Gelir</option>
              <option value="gider">Gider</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
              Başlangıç:
            </label>
            <input
              type="date"
              value={filtreleme.baslangic}
              onChange={(e) => setFiltreleme({ ...filtreleme, baslangic: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
              Bitiş:
            </label>
            <input
              type="date"
              value={filtreleme.bitis}
              onChange={(e) => setFiltreleme({ ...filtreleme, bitis: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}
            />
          </div>
        </div>
      </div>

      {/* Kayıt Listesi */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0 }}>Kayıtlar ({kayitlar.length})</h3>

        {kayitlar.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {kayitlar.map((kayit) => (
              <div
                key={kayit._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '12px',
                  borderLeft: `4px solid ${kayit.tip === 'gelir' ? '#4CAF50' : '#f44336'}`
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: kayit.tip === 'gelir' ? '#E8F5E9' : '#FFEBEE',
                    color: kayit.tip === 'gelir' ? '#2E7D32' : '#C62828',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '8px'
                  }}>
                    {kategoriGetir(kayit.tip, kayit.kategori)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                    📅 {new Date(kayit.tarih).toLocaleDateString('tr-TR')}
                  </div>
                  {kayit.aciklama && (
                    <div style={{ fontSize: '13px', color: '#999' }}>
                      {kayit.aciklama}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: kayit.tip === 'gelir' ? '#4CAF50' : '#f44336'
                  }}>
                    {kayit.tip === 'gelir' ? '+' : '-'}{kayit.miktar.toLocaleString('tr-TR')} ₺
                  </div>

                  <button
                    onClick={() => kayitSil(kayit._id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>💰</div>
            <p>Henüz kayıt yok</p>
          </div>
        )}
      </div>

      {/* Ekleme Modalı */}
      {eklemeEkrani && (
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
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>➕ Yeni Finansal Kayıt</h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Tip:</label>
              <select
                value={form.tip}
                onChange={(e) => setForm({
                  ...form,
                  tip: e.target.value,
                  kategori: e.target.value === 'gelir' ? 'sut-satisi' : 'yem'
                })}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              >
                <option value="gelir">Gelir</option>
                <option value="gider">Gider</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Kategori:</label>
              <select
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              >
                {(form.tip === 'gelir' ? gelirKategorileri : giderKategorileri).map((kat) => (
                  <option key={kat.value} value={kat.value}>{kat.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Miktar (₺):</label>
              <input
                type="number"
                value={form.miktar}
                onChange={(e) => setForm({ ...form, miktar: e.target.value })}
                placeholder="0.00"
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
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Tarih:</label>
              <input
                type="date"
                value={form.tarih}
                onChange={(e) => setForm({ ...form, tarih: e.target.value })}
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
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Açıklama (Opsiyonel):</label>
              <textarea
                value={form.aciklama}
                onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
                placeholder="Detaylar..."
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
                onClick={() => setEklemeEkrani(false)}
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
                onClick={kayitEkle}
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

export default Finansal;
