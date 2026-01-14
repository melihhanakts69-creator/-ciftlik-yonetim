import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import styled from 'styled-components';
import { FaThLarge, FaList, FaEdit, FaTrash, FaPlus, FaMars } from 'react-icons/fa';
import FilterBar from '../components/common/FilterBar';

const PageContainer = styled.div`
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 { margin: 0; font-size: 28px; color: #2c3e50; font-weight: 800; display: flex; align-items: center; gap: 10px; }
  p { margin: 5px 0 0; color: #7f8c8d; font-size: 14px; }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const ToggleButton = styled.button`
  padding: 10px;
  border: none;
  background: ${props => props.active ? '#e0e0e0' : 'white'};
  cursor: pointer;
  color: #333;
  border-radius: ${props => props.first ? '8px 0 0 8px' : props.last ? '0 8px 8px 0' : '0'};
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AddButton = styled.button`
  padding: 12px 20px;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 10px rgba(255, 152, 0, 0.3);
  transition: transform 0.2s;
  
  &:hover { transform: translateY(-2px); }
`;

function Tosunlar() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState(window.innerWidth < 768 ? 'card' : 'table');
  const [tosunlar, setTosunlar] = useState([]);
  const [filteredTosunlar, setFilteredTosunlar] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Modal
  const [tosunEkrani, setTosunEkrani] = useState(false);
  const [duzenlenecekTosun, setDuzenlenecekTosun] = useState(null);
  const [yeniTosun, setYeniTosun] = useState({ isim: '', kupeNo: '', dogumTarihi: '', kilo: '', not: '' });
  const [satinAlma, setSatinAlma] = useState({
    aktif: false, fiyat: '', satici: '', odenenMiktar: '', tarih: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    tosunlariYukle();
    const handleResize = () => { if (window.innerWidth < 768) setViewMode('card'); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    filterAndSort();
  }, [searchTerm, sortBy, tosunlar]);

  const tosunlariYukle = async () => {
    setLoading(true);
    try {
      const response = await api.getTosunlar();
      setTosunlar(response.data);
      setFilteredTosunlar(response.data);
    } catch (error) {
      console.error('Tosunlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSort = () => {
    let result = [...tosunlar];

    // Search
    if (searchTerm) {
      const lowerIndex = searchTerm.toLowerCase();
      result = result.filter(t =>
        (t.isim && t.isim.toLowerCase().includes(lowerIndex)) ||
        (t.kupeNo && t.kupeNo.toLowerCase().includes(lowerIndex))
      );
    }

    // Sort
    if (sortBy) {
      result.sort((a, b) => {
        if (sortBy === 'ad_artan') return a.isim.localeCompare(b.isim);
        if (sortBy === 'ad_azalan') return b.isim.localeCompare(a.isim);
        if (sortBy === 'yas_genc') return new Date(b.dogumTarihi) - new Date(a.dogumTarihi);
        if (sortBy === 'yas_yasli') return new Date(a.dogumTarihi) - new Date(b.dogumTarihi);
        if (sortBy === 'kilo_artan') return (a.kilo || 0) - (b.kilo || 0);
        if (sortBy === 'kilo_azalan') return (b.kilo || 0) - (a.kilo || 0);
        return 0;
      });
    }

    setFilteredTosunlar(result);
  };

  const tosunEkle = async () => {
    try {
      if (satinAlma.aktif) {
        await api.createAlisIslemi({
          hayvanTipi: 'tosun',
          ...yeniTosun,
          kilo: Number(yeniTosun.kilo),
          fiyat: Number(satinAlma.fiyat),
          aliciSatici: satinAlma.satici,
          odenenMiktar: Number(satinAlma.odenenMiktar),
          tarih: satinAlma.tarih,
          notlar: `Satın Alındı. ${yeniTosun.not || ''}`
        });
      } else {
        await api.createTosun(yeniTosun);
      }
      alert('✅ İşlem Başarılı!');
      setTosunEkrani(false);
      resetForm();
      tosunlariYukle();
    } catch (error) {
      alert('❌ Hata: ' + (error.response?.data?.message || 'Ekleme başarısız'));
    }
  };

  const tosunGuncelle = async () => {
    try {
      await api.updateTosun(duzenlenecekTosun._id, duzenlenecekTosun);
      alert('✅ Tosun güncellendi!');
      setDuzenlenecekTosun(null);
      tosunlariYukle();
    } catch (error) {
      alert('❌ Güncelleme başarısız');
    }
  };

  const tosunSil = async (id) => {
    if (!window.confirm('Bu tosunu silmek istediğinize emin misiniz?')) return;
    try {
      await api.deleteTosun(id);
      alert('✅ Tosun silindi!');
      tosunlariYukle();
    } catch (error) {
      alert('❌ Silme başarısız');
    }
  };

  const resetForm = () => {
    setYeniTosun({ isim: '', kupeNo: '', dogumTarihi: '', kilo: '', not: '' });
    setSatinAlma({ aktif: false, fiyat: '', satici: '', odenenMiktar: '', tarih: new Date().toISOString().split('T')[0] });
  };

  const sortOptions = [
    { value: 'ad_artan', label: 'İsim (A-Z)' },
    { value: 'yas_genc', label: 'En Genç' },
    { value: 'yas_yasli', label: 'En Yaşlı' },
    { value: 'kilo_azalan', label: 'En Ağır' }
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Yükleniyor...</div>;

  return (
    <PageContainer>
      <Header>
        <div>
          <h1>🐂 Tosunlar ({filteredTosunlar.length})</h1>
          <p>Besideki erkek hayvanlar</p>
        </div>
        <ActionGroup>
          <div style={{ display: 'flex' }}>
            <ToggleButton first active={viewMode === 'table'} onClick={() => setViewMode('table')}><FaList /></ToggleButton>
            <ToggleButton last active={viewMode === 'card'} onClick={() => setViewMode('card')}><FaThLarge /></ToggleButton>
          </div>
          <AddButton onClick={() => { resetForm(); setTosunEkrani(true); }}>
            <FaPlus /> <span>Yeni Tosun</span>
          </AddButton>
        </ActionGroup>
      </Header>

      <FilterBar
        onSearch={setSearchTerm}
        onSortChange={setSortBy}
        sortOptions={sortOptions}
        placeholder="Tosun ara..."
      />

      {viewMode === 'table' ? (
        <ResponsiveTable>
          <table>
            <thead>
              <tr>
                <th>Küpe No</th>
                <th>İsim</th>
                <th>Yaş</th>
                <th>Kilo</th>
                <th>Kesim Durumu</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredTosunlar.map(t => {
                const yas = Math.floor((new Date() - new Date(t.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
                const kesimUygun = yas >= 18;
                return (
                  <tr key={t._id}>
                    <td>{t.kupeNo}</td>
                    <td><strong>{t.isim}</strong></td>
                    <td>{yas} Ay</td>
                    <td>{t.kilo} kg</td>
                    <td>
                      <Badge suitable={kesimUygun}>
                        {kesimUygun ? '🥩 Kesime Uygun' : '⏳ Büyütülüyor'}
                      </Badge>
                    </td>
                    <td>
                      <div className="actions">
                        <button onClick={() => navigate(`/tosun-detay/${t._id}`)} className="view">👁️</button>
                        <button onClick={() => setDuzenlenecekTosun(t)} className="edit"><FaEdit /></button>
                        <button onClick={() => tosunSil(t._id)} className="delete"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ResponsiveTable>
      ) : (
        <Grid>
          {filteredTosunlar.map(t => {
            const yas = Math.floor((new Date() - new Date(t.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
            return (
              <Card key={t._id} onClick={() => navigate(`/tosun-detay/${t._id}`)}>
                <div className="header">
                  <h3>{t.isim}</h3>
                  <span className="tag">#{t.kupeNo}</span>
                </div>
                <div className="stats">
                  <div className="stat-box"><span>YAŞ</span><strong>{yas} Ay</strong></div>
                  <div className="stat-box"><span>KİLO</span><strong>{t.kilo} kg</strong></div>
                  <div className="stat-box"><span>CİNSİYET</span><strong>♂ Erkek</strong></div>
                </div>
                <div className="actions">
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/tosun-detay/${t._id}`) }} className="view">👁️</button>
                  <button onClick={(e) => { e.stopPropagation(); setDuzenlenecekTosun(t) }} className="edit"><FaEdit /></button>
                  <button onClick={(e) => { e.stopPropagation(); tosunSil(t._id) }} className="delete"><FaTrash /></button>
                </div>
              </Card>
            );
          })}
        </Grid>
      )}

      {/* Modal (Simplified) */}
      {(tosunEkrani || duzenlenecekTosun) && (
        <ModalOverlay>
          <ModalContent>
            <h2>{duzenlenecekTosun ? 'Tosun Düzenle' : 'Yeni Tosun Ekle'}</h2>

            {!duzenlenecekTosun && (
              <div style={{ marginBottom: '20px', padding: '10px', background: '#f1f8e9', borderRadius: '8px', border: '1px solid #c5e1a5' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px', fontWeight: 'bold', color: '#2e7d32' }}>
                  <input
                    type="checkbox"
                    checked={satinAlma.aktif}
                    onChange={e => setSatinAlma({ ...satinAlma, aktif: e.target.checked })}
                    style={{ width: '20px', height: '20px' }}
                  />
                  Satın Alma İşlemi Gir
                </label>
                {satinAlma.aktif && (
                  <div style={{ marginTop: '10px' }}>
                    <div className="form-group"><label>Satıcı</label><input value={satinAlma.satici} onChange={e => setSatinAlma({ ...satinAlma, satici: e.target.value })} /></div>
                    <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}><label>Fiyat</label><input type="number" value={satinAlma.fiyat} onChange={e => setSatinAlma({ ...satinAlma, fiyat: e.target.value })} /></div>
                      <div style={{ flex: 1 }}><label>Ödenen</label><input type="number" value={satinAlma.odenenMiktar} onChange={e => setSatinAlma({ ...satinAlma, odenenMiktar: e.target.value })} /></div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Inputs similar to other forms */}
            <div className="form-group"><label>İsim</label><input value={duzenlenecekTosun ? duzenlenecekTosun.isim : yeniTosun.isim} onChange={e => duzenlenecekTosun ? setDuzenlenecekTosun({ ...duzenlenecekTosun, isim: e.target.value }) : setYeniTosun({ ...yeniTosun, isim: e.target.value })} /></div>
            <div className="form-group"><label>Küpe No</label><input value={duzenlenecekTosun ? duzenlenecekTosun.kupeNo : yeniTosun.kupeNo} onChange={e => duzenlenecekTosun ? setDuzenlenecekTosun({ ...duzenlenecekTosun, kupeNo: e.target.value }) : setYeniTosun({ ...yeniTosun, kupeNo: e.target.value })} /></div>
            <div className="form-group"><label>Doğum Tarihi</label><input type="date" value={duzenlenecekTosun ? duzenlenecekTosun.dogumTarihi : yeniTosun.dogumTarihi} onChange={e => duzenlenecekTosun ? setDuzenlenecekTosun({ ...duzenlenecekTosun, dogumTarihi: e.target.value }) : setYeniTosun({ ...yeniTosun, dogumTarihi: e.target.value })} /></div>
            <div className="form-group"><label>Kilo</label><input type="number" value={duzenlenecekTosun ? duzenlenecekTosun.kilo : yeniTosun.kilo} onChange={e => duzenlenecekTosun ? setDuzenlenecekTosun({ ...duzenlenecekTosun, kilo: e.target.value }) : setYeniTosun({ ...yeniTosun, kilo: e.target.value })} /></div>

            <div className="btn-group">
              <button onClick={() => { setTosunEkrani(false); setDuzenlenecekTosun(null); }}>İptal</button>
              <button onClick={duzenlenecekTosun ? tosunGuncelle : tosunEkle} className="save">Kaydet</button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

    </PageContainer>
  );
}

// Styled Components (Reusing some patterns)
const ResponsiveTable = styled.div`
    background: white; border-radius: 12px; overflow-x: auto; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    table { width: 100%; border-collapse: collapse; min-width: 600px;
        th { padding: 15px; text-align: left; background: #f8f9fa; border-bottom: 2px solid #ddd; }
        td { padding: 15px; border-bottom: 1px solid #eee; }
    }
    .actions { display: flex; gap: 8px; button { border: none; background: none; cursor: pointer; font-size: 16px; } .view { color: #2196F3; } .edit { color: #FF9800; } .delete { color: #f44336; } }
`;
const Grid = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; `;
const Card = styled.div`
    background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #eee; cursor: pointer; transition: transform 0.2s;
    &:hover { transform: translateY(-3px); }
    .header { display: flex; justify-content: space-between; margin-bottom: 15px; h3 { margin: 0; } .tag { background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 8px; font-weight: bold; font-size: 12px;} }
    .stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px; .stat-box { background: #f8f9fa; padding: 8px; text-align: center; border-radius: 8px; span { display: block; font-size: 10px; color: #999; } } }
    .actions { display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #eee; padding-top: 15px; button { border: 1px solid #eee; background: white; padding: 8px; border-radius: 6px; cursor: pointer; } .view { color: #2196F3; } .edit { color: #FF9800; } .delete { color: #f44336; } }
`;
const Badge = styled.span`
    padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;
    background: ${props => props.suitable ? '#E8F5E9' : '#ECEFF1'};
    color: ${props => props.suitable ? '#2E7D32' : '#607D8B'};
`;
const ModalOverlay = styled.div` position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; `;
const ModalContent = styled.div` background: white; padding: 30px; border-radius: 16px; width: 400px; max-width: 90%; .form-group { margin-bottom: 15px; label { display: block; font-weight: bold; margin-bottom: 5px; } input { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd; } } .btn-group { display: flex; gap: 10px; button { flex: 1; padding: 10px; border: none; border-radius: 8px; cursor: pointer; } .save { background: #FF9800; color: white; font-weight: bold; } } `;

export default Tosunlar;
