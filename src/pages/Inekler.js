import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaEye, FaThLarge, FaTable } from 'react-icons/fa';
import { toast } from 'react-toastify';
import FilterBar from '../components/common/FilterBar';

const PageContainer = styled.div`
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 10px;
    padding-bottom: 80px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 12px;

  h1 {
    font-size: 24px;
    color: #2C3E50;
    font-weight: 800;
    margin: 0;

    @media (max-width: 768px) {
      font-size: 20px;
    }
  }

  .actions {
    display: flex;
    gap: 10px;
  }
`;

const ToggleViewButtons = styled.div`
  display: flex;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #ddd;
  overflow: hidden;

  button {
    padding: 10px;
    border: none;
    background: white;
    cursor: pointer;
    color: #555;
    transition: all 0.2s;

    &.active {
      background: #e0e0e0;
      color: #333;
      font-weight: bold;
    }

    &:hover {
      background: #f5f5f5;
    }
  }
`;

const AddButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    background-color: #43A047;
  }

  @media (max-width: 768px) {
    span { display: none; }
    padding: 10px;
  }
`;

const Inekler = () => {
    const navigate = useNavigate();
    const [inekler, setInekler] = useState([]);
    const [filteredInekler, setFilteredInekler] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(window.innerWidth < 768 ? 'card' : 'table');

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('');

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [duzenlenecekId, setDuzenlenecekId] = useState(null);
    const [yeniInek, setYeniInek] = useState({
        isim: '', kilo: '', kupeNo: '',
        dogumTarihi: '', buzagiSayisi: 0, notlar: '',
        gebelikDurumu: 'Belirsiz', tohumlamaTarihi: ''
    });
    const [satinAlma, setSatinAlma] = useState({
        aktif: false,
        fiyat: '',
        satici: '',
        odenenMiktar: '',
        tarih: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchInekler();

        const handleResize = () => {
            if (window.innerWidth < 768) setViewMode('card');
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = [...inekler];

        // 1. Search (Name or Ear Tag)
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(inek =>
                (inek.isim && inek.isim.toLowerCase().includes(lowerTerm)) ||
                (inek.kupeNo && inek.kupeNo.toLowerCase().includes(lowerTerm))
            );
        }

        // 2. Status Filter
        if (statusFilter) {
            result = result.filter(inek => {
                if (statusFilter === 'gebe') return inek.gebelikDurumu === 'Gebe';
                if (statusFilter === 'sagmal') return !inek.kuruda && inek.gebelikDurumu !== 'Gebe';
                if (statusFilter === 'kuruda') return inek.kuruda;
                return true;
            });
        }

        // 3. Sorting
        if (sortBy) {
            result.sort((a, b) => {
                if (sortBy === 'ad_artan') return a.isim.localeCompare(b.isim);
                if (sortBy === 'ad_azalan') return b.isim.localeCompare(a.isim);
                if (sortBy === 'yas_genc') return new Date(b.dogumTarihi || 0) - new Date(a.dogumTarihi || 0);
                if (sortBy === 'yas_yasli') return new Date(a.dogumTarihi || 0) - new Date(b.dogumTarihi || 0);
                return 0;
            });
        }

        setFilteredInekler(result);
    }, [searchTerm, statusFilter, sortBy, inekler]);

    const fetchInekler = async () => {
        try {
            const { data } = await api.getInekler();
            setInekler(data);
            setFilteredInekler(data);
        } catch (error) {
            console.error('İnekler yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu ineği silmek istediğinden emin misin?')) {
            try {
                await api.deleteInek(id);
                setInekler(prev => prev.filter(i => i._id !== id));
                toast.success('İnek silindi');
            } catch (error) {
                toast.error('Silme başarısız!');
            }
        }
    };

    const yasHesapla = (dogumTarihi) => {
        if (!dogumTarihi) return null;
        return Math.floor((new Date() - new Date(dogumTarihi)) / (365.25 * 24 * 60 * 60 * 1000));
    };

    const GEBELIK_KONTROL_GUN = 28; // Gebelik kontrolü 21-28 gün sonra yapılır
    const tohumlamaGebeValidasyonu = () => {
        if (yeniInek.gebelikDurumu !== 'Gebe' || !yeniInek.tohumlamaTarihi) return null;
        const tohum = new Date(yeniInek.tohumlamaTarihi);
        const bugun = new Date();
        const gecenGun = Math.floor((bugun - tohum) / (1000 * 60 * 60 * 24));
        if (gecenGun < GEBELIK_KONTROL_GUN) {
            return `Gebelik kontrolü henüz yapılmadığı için (tohumlama üzerinden ${gecenGun} gün geçti, kontrol 28 gün sonra yapılır) 'Belirsiz' seçmelisiniz.`;
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validasyonHata = tohumlamaGebeValidasyonu();
        if (validasyonHata) {
            toast.error(validasyonHata);
            return;
        }
        try {
            const payload = {
                ...yeniInek,
                kilo: parseFloat(yeniInek.kilo) || 0,
                buzagiSayisi: parseInt(yeniInek.buzagiSayisi, 10) || 0
            };
            if (payload.gebelikDurumu !== 'Gebe') payload.tohumlamaTarihi = '';

            if (duzenlenecekId) {
                await api.updateInek(duzenlenecekId, payload);
            } else {
                if (satinAlma.aktif) {
                    await api.createAlisIslemi({
                        hayvanTipi: 'inek',
                        ...payload,
                        yas: yasHesapla(payload.dogumTarihi) ?? 0,
                        fiyat: Number(satinAlma.fiyat),
                        aliciSatici: satinAlma.satici,
                        odenenMiktar: Number(satinAlma.odenenMiktar),
                        tarih: satinAlma.tarih,
                        notlar: `Satın Alındı. ${payload.notlar || ''}`
                    });
                } else {
                    await api.createInek(payload);
                }
            }
            fetchInekler();
            resetModal();
            toast.success('İşlem başarılı!');
        } catch (error) {
            toast.error('İşlem başarısız: ' + (error.response?.data?.message || error.message));
        }
    };

    const resetModal = () => {
        setYeniInek({ isim: '', kilo: '', kupeNo: '', dogumTarihi: '', buzagiSayisi: 0, notlar: '', gebelikDurumu: 'Belirsiz', tohumlamaTarihi: '' });
        setSatinAlma({ aktif: false, fiyat: '', satici: '', odenenMiktar: '', tarih: new Date().toISOString().split('T')[0] });
        setDuzenlenecekId(null);
        setShowModal(false);
    };

    const openEdit = (inek) => {
        setYeniInek({
            ...inek,
            gebelikDurumu: inek.gebelikDurumu || 'Belirsiz',
            tohumlamaTarihi: inek.tohumlamaTarihi ? new Date(inek.tohumlamaTarihi).toISOString().split('T')[0] : ''
        });
        setDuzenlenecekId(inek._id);
        setShowModal(true);
    };

    const filterOptions = [
        { value: 'gebe', label: 'Gebeler' },
        { value: 'sagmal', label: 'Sağmallar' },
        { value: 'kuruda', label: 'Kurudakiler' }
    ];

    const sortOptions = [
        { value: 'ad_artan', label: 'İsim (A-Z)' },
        { value: 'ad_azalan', label: 'İsim (Z-A)' },
        { value: 'yas_genc', label: 'En Genç' },
        { value: 'yas_yasli', label: 'En Yaşlı' }
    ];

    return (
        <PageContainer>
            <Header>
                <h1>🐄 İneklerimiz ({filteredInekler.length})</h1>
                <div className="actions">
                    <ToggleViewButtons>
                        <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}><FaTable /></button>
                        <button className={viewMode === 'card' ? 'active' : ''} onClick={() => setViewMode('card')}><FaThLarge /></button>
                    </ToggleViewButtons>
                    <AddButton onClick={() => { resetModal(); setShowModal(true); }}>
                        <FaPlus /> <span>Yeni İnek</span>
                    </AddButton>
                </div>
            </Header>

            <FilterBar
                onSearch={setSearchTerm}
                onFilterChange={setStatusFilter}
                onSortChange={setSortBy}
                filterOptions={filterOptions}
                sortOptions={sortOptions}
                placeholder="İsim veya Küpe No ara..."
            />

            {/* Content */}
            {viewMode === 'table' ? (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                    <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#F8F9FA', borderBottom: '2px solid #E9ECEF' }}>
                            <tr>
                                <th style={thStyle}>Küpe No</th>
                                <th style={thStyle}>İsim</th>
                                <th style={thStyle}>Yaş</th>
                                <th style={thStyle}>Durum</th>
                                <th style={thStyle}>Son Doğum</th>
                                <th style={thStyle}>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Yükleniyor...</td></tr>
                            ) : filteredInekler.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Kayıt bulunamadı.</td></tr>
                            ) : (
                                filteredInekler.map(inek => (
                                    <tr key={inek._id} style={{ borderBottom: '1px solid #EEE' }}>
                                        <td style={tdStyle}>{inek.kupeNo}</td>
                                        <td style={tdStyle}><strong>{inek.isim}</strong></td>
                                        <td style={tdStyle}>{inek.yas ?? yasHesapla(inek.dogumTarihi) ?? '-'}</td>
                                        <td style={tdStyle}>
                                            <StatusBadge status={inek.gebelikDurumu} />
                                        </td>
                                        <td style={tdStyle}>{inek.sonBuzagilamaTarihi ? new Date(inek.sonBuzagilamaTarihi).toLocaleDateString() : '-'}</td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex' }}>
                                                <button onClick={() => navigate(`/inek-detay/${inek._id}`)} title="Detay" style={actionBtnStyle('#F39C12')}><FaEye /></button>
                                                <button onClick={() => openEdit(inek)} title="Düzenle" style={actionBtnStyle('#3498DB')}><FaEdit /></button>
                                                <button onClick={() => handleDelete(inek._id)} title="Sil" style={actionBtnStyle('#E74C3C')}><FaTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {loading ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center' }}>Yükleniyor...</div>
                    ) : filteredInekler.map(inek => (
                        <Card key={inek._id} onClick={() => navigate(`/inek-detay/${inek._id}`)}>
                            <div className="card-header">
                                <div>
                                    <h3>🐄 {inek.isim}</h3>
                                    <span className="tag">#{inek.kupeNo}</span>
                                </div>
                                <StatusBadge status={inek.gebelikDurumu} />
                            </div>
                            <div className="card-stats">
                                <div className="stat"><span>YAŞ</span><strong>{inek.yas ?? yasHesapla(inek.dogumTarihi) ?? '-'}</strong></div>
                                <div className="stat"><span>KİLO</span><strong>{inek.kilo} kg</strong></div>
                            </div>
                            <div className="card-actions">
                                <button onClick={(e) => { e.stopPropagation(); navigate(`/inek-detay/${inek._id}`); }} className="btn view"><FaEye /></button>
                                <button onClick={(e) => { e.stopPropagation(); openEdit(inek); }} className="btn edit"><FaEdit /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(inek._id); }} className="btn delete"><FaTrash /></button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <ModalOverlay onClick={() => resetModal()}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <h2>{duzenlenecekId ? 'İnek Düzenle' : 'Yeni İnek Ekle'}</h2>
                        <form onSubmit={handleSubmit}>
                            {!duzenlenecekId && (
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
                                        <div style={{ marginTop: '10px', display: 'grid', gap: '10px' }}>
                                            <input placeholder="Satıcı Adı" required={satinAlma.aktif} value={satinAlma.satici} onChange={e => setSatinAlma({ ...satinAlma, satici: e.target.value })} style={inputStyle} />
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <input type="number" placeholder="Fiyat (TL)" required={satinAlma.aktif} value={satinAlma.fiyat} onChange={e => setSatinAlma({ ...satinAlma, fiyat: e.target.value })} style={inputStyle} />
                                                <input type="number" placeholder="Ödenen (TL)" value={satinAlma.odenenMiktar} onChange={e => setSatinAlma({ ...satinAlma, odenenMiktar: e.target.value })} style={inputStyle} />
                                            </div>
                                            <input type="date" value={satinAlma.tarih} onChange={e => setSatinAlma({ ...satinAlma, tarih: e.target.value })} style={inputStyle} />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={formGroupStyle}>
                                <label>İsim:</label>
                                <input type="text" required value={yeniInek.isim} onChange={e => setYeniInek({ ...yeniInek, isim: e.target.value })} style={inputStyle} />
                            </div>
                            <div style={formGroupStyle}>
                                <label>Küpe No:</label>
                                <input type="text" required value={yeniInek.kupeNo} onChange={e => setYeniInek({ ...yeniInek, kupeNo: e.target.value })} style={inputStyle} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={formGroupStyle}>
                                    <label>Doğum Tarihi: *</label>
                                    <input type="date" required value={yeniInek.dogumTarihi} onChange={e => setYeniInek({ ...yeniInek, dogumTarihi: e.target.value })} style={inputStyle} />
                                </div>
                                <div style={formGroupStyle}>
                                    <label>Kilo (kg): *</label>
                                    <input type="number" required min="0" step="0.1" value={yeniInek.kilo} onChange={e => setYeniInek({ ...yeniInek, kilo: e.target.value })} style={inputStyle} />
                                </div>
                            </div>
                            <div style={formGroupStyle}>
                                <label>Gebelik Durumu:</label>
                                <select value={yeniInek.gebelikDurumu} onChange={e => setYeniInek({ ...yeniInek, gebelikDurumu: e.target.value, tohumlamaTarihi: e.target.value === 'Gebe' ? yeniInek.tohumlamaTarihi : '' })} style={{ ...inputStyle, padding: '10px 12px' }}>
                                    <option value="Belirsiz">❓ Belirsiz</option>
                                    <option value="Gebe">✅ Gebe</option>
                                    <option value="Gebe Değil">❌ Gebe Değil</option>
                                </select>
                            </div>
                            {yeniInek.gebelikDurumu === 'Gebe' && (
                                <div style={formGroupStyle}>
                                    <label>Tohumlama Tarihi: *</label>
                                    <input type="date" required value={yeniInek.tohumlamaTarihi} onChange={e => setYeniInek({ ...yeniInek, tohumlamaTarihi: e.target.value })} style={inputStyle} />
                                </div>
                            )}
                            <div style={formGroupStyle}>
                                <label>Notlar:</label>
                                <textarea rows={3} value={yeniInek.notlar || ''} onChange={e => setYeniInek({ ...yeniInek, notlar: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} placeholder="İsteğe bağlı notlar..." />
                            </div>
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={resetModal} style={{ ...btnStyle, backgroundColor: '#95A5A6' }}>İptal</button>
                                <button type="submit" style={{ ...btnStyle, backgroundColor: '#4CAF50' }}>Kaydet</button>
                            </div>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

// --- Sub Components & Styles ---

const StatusBadge = ({ status }) => {
    const style = status === 'Gebe' ? { bg: '#E8F5E9', color: '#2E7D32', label: 'Gebe' }
        : status === 'Gebe Değil' ? { bg: '#FFEBEE', color: '#C62828', label: 'Gebe Değil' }
        : { bg: '#FFF8E1', color: '#F57F17', label: 'Belirsiz' };
    return (
        <span style={{
            padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
            backgroundColor: style.bg, color: style.color
        }}>
            {style.label}
        </span>
    );
};

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  transition: transform 0.2s;
  cursor: pointer;
  border: 1px solid #eee;

  &:hover {
    transform: translateY(-3px);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;

    h3 { margin: 0 0 5px 0; font-size: 18px; color: #333; }
    .tag { font-size: 13px; color: #666; background: #f5f5f5; padding: 2px 8px; border-radius: 4px; }
  }

  .card-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 15px;
    
    .stat {
      background: #f8f9fa;
      padding: 8px;
      border-radius: 6px;
      text-align: center;
      span { display: block; font-size: 11px; color: #999; }
      strong { font-size: 14px; color: #333; }
    }
  }

  .card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    border-top: 1px solid #eee;
    padding-top: 15px;

    .btn {
      border: 1px solid #e2e8f0;
      background: white;
      padding: 10px 12px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 15px;
      min-width: 44px;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      -webkit-tap-highlight-color: transparent;
      
      &.view { color: #F59E0B; }
      &.edit { color: #3B82F6; }
      &.delete { color: #EF4444; }
      
      &:hover { background: #f8fafc; }
      &:active { transform: scale(0.97); }
    }
  }
`;

const thStyle = { padding: '15px', textAlign: 'left', fontSize: '14px', color: '#666' };
const tdStyle = { padding: '15px', fontSize: '14px', color: '#333' };
const actionBtnStyle = (color) => ({
    border: 'none', background: 'transparent', cursor: 'pointer', color: color, fontSize: '18px',
    marginRight: '8px', padding: '10px', minWidth: '44px', minHeight: '44px',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '10px', transition: 'background 0.2s'
});
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  padding: 16px;
  overflow-y: auto;
  @media (max-width: 768px) {
    align-items: flex-start;
    padding: 0;
  }
`;
const ModalContent = styled.div`
  background: white;
  padding: 28px 32px;
  border-radius: 20px;
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0,0,0,0.2);
  animation: modalIn 0.25s ease;

  h2 {
    margin: 0 0 24px 0;
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.96) translateY(-10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    min-height: 100vh;
    border-radius: 0;
    padding: 24px 20px;
    padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  }
`;
const formGroupStyle = { marginBottom: '16px' };
const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: '1.5px solid #e2e8f0', marginTop: '6px', fontSize: '14px',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
};
const btnStyle = { padding: '10px 22px', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '14px' };

export default Inekler;
