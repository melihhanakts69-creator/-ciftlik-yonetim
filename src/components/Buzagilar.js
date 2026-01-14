import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { FaBaby, FaMars, FaVenus, FaPlus, FaSearch, FaEllipsisV, FaEdit, FaTrash, FaArrowRight, FaThLarge, FaList } from 'react-icons/fa';

const Buzagilar = () => {
  const navigate = useNavigate();
  // Mobilde varsayılan olarak kart görünümü, PC'de tablo
  const [viewMode, setViewMode] = useState(window.innerWidth < 768 ? 'card' : 'table');
  // State
  const [buzagilar, setBuzagilar] = useState([]);
  const [inekler, setInekler] = useState([]); // Anne seçimi için
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Düzenleme/Ekleme State
  const [duzenlenecekBuzagi, setDuzenlenecekBuzagi] = useState(null);
  const [yeniBuzagi, setYeniBuzagi] = useState({
    isim: '', kupeNo: '', cinsiyet: 'disi',
    dogumTarihi: '', kilo: '',
    anneId: '', anneIsim: '', anneKupeNo: ''
  });

  // Veri Yükleme
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [buzagiRes, inekRes] = await Promise.all([
        api.getBuzagilar(),
        api.getInekler()
      ]);
      setBuzagilar(buzagiRes.data);
      setInekler(inekRes.data);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ekleme İşlemi
  const handleEkle = async (e) => {
    e.preventDefault();
    try {
      await api.createBuzagi(yeniBuzagi);
      fetchData();
      setShowModal(false);
      setShowModal(false);
      setYeniBuzagi({
        isim: '', kupeNo: '', cinsiyet: 'disi',
        dogumTarihi: '', kilo: '',
        anneId: '', anneIsim: '', anneKupeNo: ''
      });
      alert('Buzağı başarıyla eklendi! 🍼');
    } catch (error) {
      console.error('Ekleme Hatası:', error);
      alert('Hata: ' + (error.response?.data?.error || error.response?.data?.message || 'Ekleme başarısız'));
    }
  };

  // Güncelleme İşlemi
  const handleGuncelle = async (e) => {
    e.preventDefault();
    try {
      await api.updateBuzagi(duzenlenecekBuzagi._id, duzenlenecekBuzagi);
      fetchData();
      setShowModal(false);
      setDuzenlenecekBuzagi(null);
      alert('Buzağı güncellendi! ✅');
    } catch (error) {
      alert('Hata: Güncelleme başarısız');
    }
  };

  // Silme İşlemi
  const handleSil = async (id) => {
    if (window.confirm('Silmek istediğine emin misin?')) {
      try {
        await api.deleteBuzagi(id);
        setBuzagilar(buzagilar.filter(b => b._id !== id));
      } catch (error) {
        alert('Silme başarısız');
      }
    }
  };

  // Geçiş İşlemi (Düve/Tosun)
  const handleGecis = async (buzagi) => {
    const hedef = buzagi.cinsiyet === 'disi' ? 'Düve' : 'Tosun';
    if (window.confirm(`${buzagi.isim} adlı buzağıyı ${hedef} kategorisine transfer etmek istiyor musunuz?`)) {
      try {
        await api.buzagiGecisYap(buzagi._id);
        fetchData(); // Listeyi yenile
        alert(`Transfer başarılı: ${hedef} 🚀`);
      } catch (error) {
        alert('Transfer başarısız!');
      }
    }
  };

  // Filtreleme
  const filteredBuzagilar = buzagilar.filter(b =>
    (b.isim?.toLowerCase().includes(filtre.toLowerCase())) ||
    (b.kupeNo?.toLowerCase().includes(filtre.toLowerCase()))
  );

  // Modal Kapatma
  const closeModal = () => {
    setShowModal(false);
    setDuzenlenecekBuzagi(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Üst Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#333' }}>🍼 Buzağılar</h1>
          <p style={{ color: '#666', marginTop: '5px' }}>Çiftlikteki yeni nesil ({buzagilar.length})</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '10px',
                border: 'none',
                background: viewMode === 'table' ? '#e0e0e0' : 'white',
                cursor: 'pointer',
                color: '#333'
              }}
              title="Liste Görünümü"
            >
              <FaList />
            </button>
            <button
              onClick={() => setViewMode('card')}
              style={{
                padding: '10px',
                border: 'none',
                background: viewMode === 'card' ? '#e0e0e0' : 'white',
                cursor: 'pointer',
                color: '#333'
              }}
              title="Kart Görünümü"
            >
              <FaThLarge />
            </button>
          </div>
          <button
            onClick={() => { setDuzenlenecekBuzagi(null); setShowModal(true); }}
            style={{
              background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
              color: 'white', padding: '12px 24px', border: 'none', borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)'
            }}
          >
            <FaPlus /> Yeni Buzağı
          </button>
        </div>
      </div>

      {/* Arama */}
      <div style={{ position: 'relative', marginBottom: '25px', maxWidth: '400px' }}>
        <FaSearch style={{ position: 'absolute', left: '15px', top: '14px', color: '#aaa' }} />
        <input
          type="text"
          placeholder="İsim veya Küpe No ara..."
          value={filtre}
          onChange={(e) => setFiltre(e.target.value)}
          style={{
            width: '100%', padding: '12px 12px 12px 45px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '15px'
          }}
        />
      </div>

      {/* LİSTE GÖRÜNÜMÜ (TABLO VEYA KART) */}
      {viewMode === 'table' ? (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#F8F9FA', borderBottom: '2px solid #E9ECEF' }}>
              <tr>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '14px', color: '#666' }}>Küpe No</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '14px', color: '#666' }}>İsim</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '14px', color: '#666' }}>Cinsiyet</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '14px', color: '#666' }}>Yaş</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '14px', color: '#666' }}>Kilo</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '14px', color: '#666' }}>Anne</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '14px', color: '#666' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuzagilar.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Kayıt bulunamadı.</td></tr>
              ) : (
                filteredBuzagilar.map(buzagi => {
                  const yasAy = Math.floor((new Date() - new Date(buzagi.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
                  const transferUygun = yasAy >= 6;
                  return (
                    <tr key={buzagi._id} style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '15px', fontSize: '14px' }}>{buzagi.kupeNo}</td>
                      <td style={{ padding: '15px', fontSize: '14px' }}><strong>{buzagi.isim}</strong></td>
                      <td style={{ padding: '15px', fontSize: '14px' }}>
                        {buzagi.cinsiyet === 'disi' ? <span style={{ color: '#E91E63' }}><FaVenus /> Dişi</span> : <span style={{ color: '#2196F3' }}><FaMars /> Erkek</span>}
                      </td>
                      <td style={{ padding: '15px', fontSize: '14px' }}>{yasAy} Ay</td>
                      <td style={{ padding: '15px', fontSize: '14px' }}>{buzagi.kilo} kg</td>
                      <td style={{ padding: '15px', fontSize: '14px' }}>{inekler.find(i => i.kupeNo === buzagi.anneKupeNo)?.isim || buzagi.anneKupeNo || '-'}</td>
                      <td style={{ padding: '15px', fontSize: '14px', display: 'flex', gap: '8px' }}>
                        <button onClick={() => navigate(`/buzagi-detay/${buzagi._id}`)} title="Detay" style={{ border: 'none', background: 'none', color: '#2196F3', cursor: 'pointer' }}><FaList /></button>
                        <button onClick={() => { setDuzenlenecekBuzagi(buzagi); setShowModal(true); }} title="Düzenle" style={{ border: 'none', background: 'none', color: '#FF9800', cursor: 'pointer' }}><FaEdit /></button>
                        <button onClick={() => handleSil(buzagi._id)} title="Sil" style={{ border: 'none', background: 'none', color: '#f44336', cursor: 'pointer' }}><FaTrash /></button>
                        {transferUygun && <button onClick={() => handleGecis(buzagi)} title="Transfer" style={{ border: 'none', background: 'none', color: '#4CAF50', cursor: 'pointer' }}><FaArrowRight /></button>}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Kart Görünümü */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredBuzagilar.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#999' }}>Buzağı kaydı bulunamadı.</div>
          ) : (
            filteredBuzagilar.map(buzagi => {
              const yasAy = Math.floor((new Date() - new Date(buzagi.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
              const transferUygun = yasAy >= 6;

              return (
                <div key={buzagi._id} style={{
                  backgroundColor: 'white', borderRadius: '16px', padding: '20px',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.05)', position: 'relative',
                  borderLeft: `5px solid ${buzagi.cinsiyet === 'disi' ? '#E91E63' : '#2196F3'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{buzagi.isim}</h3>
                      <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>{buzagi.kupeNo}</div>
                    </div>
                    <div style={{
                      padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: buzagi.cinsiyet === 'disi' ? '#FCE4EC' : '#E3F2FD',
                      color: buzagi.cinsiyet === 'disi' ? '#C2185B' : '#1976D2'
                    }}>
                      {buzagi.cinsiyet === 'disi' ? '♀ Dişi' : '♂ Erkek'}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                    <div style={infoBoxStyle}>
                      <span>Yaş</span>
                      <strong>{yasAy} Ay</strong>
                    </div>
                    <div style={infoBoxStyle}>
                      <span>Kilo</span>
                      <strong>{buzagi.kilo || '-'} kg</strong>
                    </div>
                    <div style={{ ...infoBoxStyle, gridColumn: 'span 2' }}>
                      <span>Anne</span>
                      <strong>{inekler.find(i => i.kupeNo === buzagi.anneKupeNo)?.isim || buzagi.anneKupeNo || '-'}</strong>
                    </div>
                  </div>

                  {/* Aksiyonlar */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => navigate(`/buzagi-detay/${buzagi._id}`)}
                      style={{ ...actionBtnStyle, backgroundColor: '#2196F3' }}
                      title="Detay"
                    >
                      📄
                    </button>
                    {transferUygun && (
                      <button
                        title="Transfer Et"
                        onClick={() => handleGecis(buzagi)}
                        style={{ ...actionBtnStyle, backgroundColor: '#4CAF50', flex: 1 }}
                      >
                        <FaArrowRight /> Transfer
                      </button>
                    )}
                    <button onClick={() => { setDuzenlenecekBuzagi(buzagi); setShowModal(true); }} style={{ ...actionBtnStyle, backgroundColor: '#FFB74D' }}>
                      <FaEdit />
                    </button>
                    <button onClick={() => handleSil(buzagi._id)} style={{ ...actionBtnStyle, backgroundColor: '#EF5350' }}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2>{duzenlenecekBuzagi ? 'Buzağı Düzenle' : 'Yeni Buzağı Ekle'}</h2>
            <form onSubmit={duzenlenecekBuzagi ? handleGuncelle : handleEkle}>
              <div style={formGroupStyle}>
                <label>İsim</label>
                <input required type="text" style={inputStyle}
                  value={duzenlenecekBuzagi ? duzenlenecekBuzagi.isim : yeniBuzagi.isim}
                  onChange={e => duzenlenecekBuzagi ? setDuzenlenecekBuzagi({ ...duzenlenecekBuzagi, isim: e.target.value }) : setYeniBuzagi({ ...yeniBuzagi, isim: e.target.value })}
                />
              </div>
              <div style={formGroupStyle}>
                <label>Küpe No</label>
                <input required type="text" style={inputStyle}
                  value={duzenlenecekBuzagi ? duzenlenecekBuzagi.kupeNo : yeniBuzagi.kupeNo}
                  onChange={e => duzenlenecekBuzagi ? setDuzenlenecekBuzagi({ ...duzenlenecekBuzagi, kupeNo: e.target.value }) : setYeniBuzagi({ ...yeniBuzagi, kupeNo: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1, ...formGroupStyle }}>
                  <label>Cinsiyet</label>
                  <select style={inputStyle}
                    value={duzenlenecekBuzagi ? duzenlenecekBuzagi.cinsiyet : yeniBuzagi.cinsiyet}
                    onChange={e => duzenlenecekBuzagi ? setDuzenlenecekBuzagi({ ...duzenlenecekBuzagi, cinsiyet: e.target.value }) : setYeniBuzagi({ ...yeniBuzagi, cinsiyet: e.target.value })}
                  >
                    <option value="disi">Dişi</option>
                    <option value="erkek">Erkek</option>
                  </select>
                </div>
                <div style={{ flex: 1, ...formGroupStyle }}>
                  <label>Doğum Tarihi</label>
                  <input required type="date" style={inputStyle}
                    value={duzenlenecekBuzagi ? duzenlenecekBuzagi.dogumTarihi : yeniBuzagi.dogumTarihi}
                    onChange={e => duzenlenecekBuzagi ? setDuzenlenecekBuzagi({ ...duzenlenecekBuzagi, dogumTarihi: e.target.value }) : setYeniBuzagi({ ...yeniBuzagi, dogumTarihi: e.target.value })}
                  />
                </div>
              </div>

              <div style={formGroupStyle}>
                <label>Kilo (kg)</label>
                <input required type="number" style={inputStyle}
                  value={duzenlenecekBuzagi ? duzenlenecekBuzagi.kilo : yeniBuzagi.kilo}
                  onChange={e => duzenlenecekBuzagi ? setDuzenlenecekBuzagi({ ...duzenlenecekBuzagi, kilo: e.target.value }) : setYeniBuzagi({ ...yeniBuzagi, kilo: e.target.value })}
                />
              </div>

              <div style={formGroupStyle}>
                <label>Anne Seçimi (İsteğe Bağlı)</label>
                <select style={inputStyle}
                  value={duzenlenecekBuzagi ? (duzenlenecekBuzagi.anneId || '') : (yeniBuzagi.anneId || '')}
                  onChange={e => {
                    const secilenId = e.target.value;
                    const secilenAnne = inekler.find(i => i._id === secilenId);

                    const guncelVeri = {
                      anneId: secilenId,
                      anneIsim: secilenAnne ? secilenAnne.isim : '',
                      anneKupeNo: secilenAnne ? secilenAnne.kupeNo : ''
                    };

                    if (duzenlenecekBuzagi) {
                      setDuzenlenecekBuzagi({ ...duzenlenecekBuzagi, ...guncelVeri });
                    } else {
                      setYeniBuzagi({ ...yeniBuzagi, ...guncelVeri });
                    }
                  }}
                >
                  <option value="">Annesi Yok / Bilinmiyor</option>
                  {inekler.map(i => <option key={i._id} value={i._id}>{i.isim} ({i.kupeNo})</option>)}
                </select>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={closeModal} style={{ ...btnStyle, backgroundColor: '#90A4AE' }}>İptal</button>
                <button type="submit" style={{ ...btnStyle, backgroundColor: '#4CAF50' }}>Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const infoBoxStyle = { backgroundColor: '#F5F5F5', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', fontSize: '13px', color: '#555' };
const actionBtnStyle = { padding: '10px', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 };
const modalContentStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '500px', maxWidth: '90%' };
const formGroupStyle = { marginBottom: '15px' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #DDD', marginTop: '5px' };
const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' };

export default Buzagilar;
