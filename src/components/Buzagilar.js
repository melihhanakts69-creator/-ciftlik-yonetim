import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import styled from 'styled-components';
import { FaBaby, FaMars, FaVenus, FaPlus, FaEllipsisV, FaEdit, FaTrash, FaArrowRight, FaThLarge, FaList } from 'react-icons/fa';
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
  
  &:hover { transform: translateY(-2px); }
`;

const Buzagilar = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState(window.innerWidth < 768 ? 'card' : 'table');
  const [buzagilar, setBuzagilar] = useState([]);
  const [filteredBuzagilar, setFilteredBuzagilar] = useState([]);
  const [inekler, setInekler] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // 'disi', 'erkek', 'transfer'
  const [sortBy, setSortBy] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [duzenlenecekBuzagi, setDuzenlenecekBuzagi] = useState(null);
  const [yeniBuzagi, setYeniBuzagi] = useState({
    isim: '', kupeNo: '', cinsiyet: 'disi', dogumTarihi: '', kilo: '', anneId: '', anneIsim: '', anneKupeNo: ''
  });
  const [satinAlma, setSatinAlma] = useState({
    aktif: false, fiyat: '', satici: '', odenenMiktar: '', tarih: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
    const handleResize = () => { if (window.innerWidth < 768) setViewMode('card'); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    filterAndSort();
  }, [searchTerm, statusFilter, sortBy, buzagilar]);

  const fetchData = async () => {
    try {
      const [buzagiRes, inekRes] = await Promise.all([
        api.getBuzagilar(),
        api.getInekler()
      ]);
      setBuzagilar(buzagiRes.data);
      setInekler(inekRes.data);
      setFilteredBuzagilar(buzagiRes.data);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSort = () => {
    let result = [...buzagilar];

    // Search
    if (searchTerm) {
      const lowerIndex = searchTerm.toLowerCase();
      result = result.filter(b =>
        (b.isim && b.isim.toLowerCase().includes(lowerIndex)) ||
        (b.kupeNo && b.kupeNo.toLowerCase().includes(lowerIndex))
      );
    }

    // Filter
    if (statusFilter) {
      if (statusFilter === 'disi') result = result.filter(b => b.cinsiyet === 'disi');
      if (statusFilter === 'erkek') result = result.filter(b => b.cinsiyet === 'erkek');
      if (statusFilter === 'transfer') {
        result = result.filter(b => {
          const yasAy = Math.floor((new Date() - new Date(b.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
          return yasAy >= 6;
        });
      }
    }

    // Sort
    if (sortBy) {
      result.sort((a, b) => {
        if (sortBy === 'ad_artan') return a.isim.localeCompare(b.isim);
        if (sortBy === 'yas_genc') return new Date(b.dogumTarihi) - new Date(a.dogumTarihi);
        if (sortBy === 'yas_yasli') return new Date(a.dogumTarihi) - new Date(b.dogumTarihi);
        return 0;
      });
    }

    setFilteredBuzagilar(result);
  };

  const handleEkle = async (e) => {
    e.preventDefault();
    try {
      if (satinAlma.aktif) {
        await api.createAlisIslemi({
          hayvanTipi: 'buzagi',
          ...yeniBuzagi,
          kilo: Number(yeniBuzagi.kilo),
          fiyat: Number(satinAlma.fiyat),
          aliciSatici: satinAlma.satici,
          odenenMiktar: Number(satinAlma.odenenMiktar),
          tarih: satinAlma.tarih,
          notlar: `Satın Alındı`
        });
      } else {
        await api.createBuzagi(yeniBuzagi);
      }
      fetchData();
      closeModal();
      alert('İşlem Başarılı!');
    } catch (error) {
      alert('Ekleme başarısız: ' + (error.response?.data?.message || ''));
    }
  };

  const handleGuncelle = async (e) => {
    e.preventDefault();
    try {
      await api.updateBuzagi(duzenlenecekBuzagi._id, duzenlenecekBuzagi);
      fetchData();
      closeModal();
      alert('Güncellendi!');
    } catch (error) {
      alert('Güncelleme başarısız');
    }
  };

  const handleSil = async (id) => {
    if (window.confirm('Emin misiniz?')) {
      try {
        await api.deleteBuzagi(id);
        setBuzagilar(buzagilar.filter(b => b._id !== id));
      } catch (error) {
        alert('Silme başarısız');
      }
    }
  };

  const handleGecis = async (buzagi) => {
    const hedef = buzagi.cinsiyet === 'disi' ? 'Düve' : 'Tosun';
    if (window.confirm(`${buzagi.isim} buzağısını ${hedef} kategorisine transfer et?`)) {
      try {
        await api.buzagiGecisYap(buzagi._id);
        fetchData();
        alert(`Transfer başarılı: ${hedef}`);
      } catch (error) {
        alert('Transfer başarısız');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setDuzenlenecekBuzagi(null);
    setYeniBuzagi({ isim: '', kupeNo: '', cinsiyet: 'disi', dogumTarihi: '', kilo: '', anneId: '', anneIsim: '', anneKupeNo: '' });
    setSatinAlma({ aktif: false, fiyat: '', satici: '', odenenMiktar: '', tarih: new Date().toISOString().split('T')[0] });
  };

  const filterOptions = [
    { value: 'disi', label: 'Dişiler' },
    { value: 'erkek', label: 'Erkekler' },
    { value: 'transfer', label: 'Transfer Uygun (6+ Ay)' }
  ];

  const sortOptions = [
    { value: 'ad_artan', label: 'İsim (A-Z)' },
    { value: 'yas_genc', label: 'En Genç' },
    { value: 'yas_yasli', label: 'En Yaşlı' }
  ];

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <PageContainer>
      <Header>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#333' }}>🍼 Buzağılar ({filteredBuzagilar.length})</h1>
          <p style={{ margin: '5px 0 0', color: '#666' }}>Çiftliğin geleceği</p>
        </div>
        <ActionGroup>
          <div style={{ display: 'flex' }}>
            <ToggleButton first active={viewMode === 'table'} onClick={() => setViewMode('table')}><FaList /></ToggleButton>
            <ToggleButton last active={viewMode === 'card'} onClick={() => setViewMode('card')}><FaThLarge /></ToggleButton>
          </div>
          <AddButton onClick={() => { closeModal(); setShowModal(true); }}>
            <FaPlus /> <span>Yeni Buzağı</span>
          </AddButton>
        </ActionGroup>
      </Header>

      <FilterBar
        onSearch={setSearchTerm}
        onFilterChange={setStatusFilter}
        onSortChange={setSortBy}
        filterOptions={filterOptions}
        sortOptions={sortOptions}
        placeholder="Buzağı ara..."
      />

      {viewMode === 'table' ? (
        <ResponsiveTable>
          <table>
            <thead>
              <tr>
                <th>Küpe No</th>
                <th>İsim</th>
                <th>Cinsiyet</th>
                <th>Yaş</th>
                <th>Kilo</th>
                <th>Anne</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuzagilar.map(b => {
                const yasAy = Math.floor((new Date() - new Date(b.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
                const transferUygun = yasAy >= 6;
                return (
                  <tr key={b._id}>
                    <td>{b.kupeNo}</td>
                    <td><strong>{b.isim}</strong></td>
                    <td>
                      {b.cinsiyet === 'disi'
                        ? <span style={{ color: '#E91E63', fontWeight: 'bold' }}><FaVenus /> Dişi</span>
                        : <span style={{ color: '#2196F3', fontWeight: 'bold' }}><FaMars /> Erkek</span>}
                    </td>
                    <td>{yasAy} Ay</td>
                    <td>{b.kilo} kg</td>
                    <td>{inekler.find(i => i.kupeNo === b.anneKupeNo)?.isim || b.anneKupeNo || '-'}</td>
                    <td>
                      <div className="actions">
                        <button onClick={() => navigate(`/buzagi-detay/${b._id}`)} className="view">👁️</button>
                        {transferUygun && <button onClick={() => handleGecis(b)} className="transfer"><FaArrowRight /></button>}
                        <button onClick={() => { setDuzenlenecekBuzagi(b); setShowModal(true); }} className="edit"><FaEdit /></button>
                        <button onClick={() => handleSil(b._id)} className="delete"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </ResponsiveTable>
      ) : (
        <Grid>
          {filteredBuzagilar.map(b => {
            const yasAy = Math.floor((new Date() - new Date(b.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
            const transferUygun = yasAy >= 6;
            return (
              <Card key={b._id} gender={b.cinsiyet} onClick={() => navigate(`/buzagi-detay/${b._id}`)}>
                <div className="header">
                  <h3>{b.isim}</h3>
                  <Badge gender={b.cinsiyet}>{b.cinsiyet === 'disi' ? '♀ Dişi' : '♂ Erkek'}</Badge>
                </div>
                <div className="stats">
                  <div className="stat-box"><span>YAŞ</span><strong>{yasAy} Ay</strong></div>
                  <div className="stat-box"><span>KİLO</span><strong>{b.kilo} kg</strong></div>
                  <div className="stat-box"><span>KÜPE</span><strong>{b.kupeNo}</strong></div>
                </div>
                <div className="actions">
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/buzagi-detay/${b._id}`) }} className="view">👁️</button>
                  {transferUygun && <button onClick={(e) => { e.stopPropagation(); handleGecis(b) }} className="transfer"><FaArrowRight /></button>}
                  <button onClick={(e) => { e.stopPropagation(); setDuzenlenecekBuzagi(b); setShowModal(true) }} className="edit"><FaEdit /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleSil(b._id) }} className="delete"><FaTrash /></button>
                </div>
              </Card>
            )
          })}
        </Grid>
      )}

      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <h2>{duzenlenecekBuzagi ? 'Düzenle' : 'Yeni Ekle'}</h2>

            {!duzenlenecekBuzagi && (
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
            <div className="form-group"><label>İsim</label><input value={duzenlenecekBuzagi ? duzenlenecekBuzagi.isim : yeniBuzagi.isim} onChange={e => duzenlenecekBuzagi ? setDuzenlenecekBuzagi({ ...duzenlenecekBuzagi, isim: e.target.value }) : setYeniBuzagi({ ...yeniBuzagi, isim: e.target.value })} /></div>
            <div className="form-group"><label>Küpe No</label><input value={duzenlenecekBuzagi ? duzenlenecekBuzagi.kupeNo : yeniBuzagi.kupeNo} onChange={e => duzenlenecekBuzagi ? setDuzenlenecekBuzagi({ ...duzenlenecekBuzagi, kupeNo: e.target.value }) : setYeniBuzagi({ ...yeniBuzagi, kupeNo: e.target.value })} /></div>
            <div className="form-group"><label>Cinsiyet</label>
              <select value={duzenlenecekBuzagi ? duzenlenecekBuzagi.cinsiyet : yeniBuzagi.cinsiyet} onChange={e => duzenlenecekBuzagi ? setDuzenlenecekBuzagi({ ...duzenlenecekBuzagi, cinsiyet: e.target.value }) : setYeniBuzagi({ ...yeniBuzagi, cinsiyet: e.target.value })}>
                <option value="disi">Dişi</option>
                <option value="erkek">Erkek</option>
              </select>
            </div>
            <div className="form-group"><label>Doğum</label><input type="date" value={duzenlenecekBuzagi ? duzenlenecekBuzagi.dogumTarihi : yeniBuzagi.dogumTarihi} onChange={e => duzenlenecekBuzagi ? setDuzenlenecekBuzagi({ ...duzenlenecekBuzagi, dogumTarihi: e.target.value }) : setYeniBuzagi({ ...yeniBuzagi, dogumTarihi: e.target.value })} /></div>
            <div className="form-group"><label>Kilo</label><input type="number" value={duzenlenecekBuzagi ? duzenlenecekBuzagi.kilo : yeniBuzagi.kilo} onChange={e => duzenlenecekBuzagi ? setDuzenlenecekBuzagi({ ...duzenlenecekBuzagi, kilo: e.target.value }) : setYeniBuzagi({ ...yeniBuzagi, kilo: e.target.value })} /></div>

            <div className="btn-group">
              <button onClick={closeModal}>İptal</button>
              <button onClick={duzenlenecekBuzagi ? handleGuncelle : handleEkle} className="save">Kaydet</button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

    </PageContainer>
  );
};

// Styles
const ResponsiveTable = styled.div`
    background: white; border-radius: 12px; overflow-x: auto; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    table { width: 100%; border-collapse: collapse; min-width: 700px;
        th { padding: 15px; text-align: left; background: #f8f9fa; border-bottom: 2px solid #ddd; }
        td { padding: 15px; border-bottom: 1px solid #eee; }
    }
    .actions { display: flex; gap: 8px; button { border: none; background: none; cursor: pointer; font-size: 16px; } .view { color: #2196F3; } .edit { color: #FF9800; } .delete { color: #f44336; } .transfer { color: #4CAF50; } }
`;
const Grid = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; `;
const Card = styled.div`
    background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border-left: 5px solid ${props => props.gender === 'disi' ? '#E91E63' : '#2196F3'}; cursor: pointer; transition: transform 0.2s;
    &:hover { transform: translateY(-3px); }
    .header { display: flex; justify-content: space-between; margin-bottom: 15px; h3 { margin: 0; } }
    .stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px; .stat-box { background: #f8f9fa; padding: 8px; text-align: center; border-radius: 8px; span { display: block; font-size: 10px; color: #999; } } }
    .actions { display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #eee; padding-top: 15px; button { border: 1px solid #eee; background: white; padding: 8px; border-radius: 6px; cursor: pointer; } .view { color: #2196F3; } .edit { color: #FF9800; } .delete { color: #f44336; } .transfer { color: #4CAF50; }}
`;
const Badge = styled.span` padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; background: ${props => props.gender === 'disi' ? '#FCE4EC' : '#E3F2FD'}; color: ${props => props.gender === 'disi' ? '#C2185B' : '#1976D2'}; `;
const ModalOverlay = styled.div` position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; `;
const ModalContent = styled.div` background: white; padding: 30px; border-radius: 16px; width: 400px; max-width: 90%; .form-group { margin-bottom: 15px; label { display: block; font-weight: bold; margin-bottom: 5px; } input, select { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd; } } .btn-group { display: flex; gap: 10px; button { flex: 1; padding: 10px; border: none; border-radius: 8px; cursor: pointer; } .save { background: #FF9800; color: white; font-weight: bold; } } `;

export default Buzagilar;
