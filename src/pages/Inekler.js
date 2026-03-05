import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaEye, FaThLarge, FaList, FaTable, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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

  h1 {
    font-size: 24px;
    color: #2C3E50;
    font-weight: 800;
    margin: 0;
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

const ExportBtn = styled.button`
  background-color: ${p => p.$pdf ? '#ef4444' : '#10b981'};
  color: white;
  padding: 10px 15px;
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
    background-color: ${p => p.$pdf ? '#dc2626' : '#059669'};
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
        isim: '', yas: '', kilo: '', kupeNo: '',
        dogumTarihi: '', buzagiSayisi: 0, notlar: ''
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
                if (sortBy === 'yas_genc') return (parseFloat(a.yas) || 0) - (parseFloat(b.yas) || 0);
                if (sortBy === 'yas_yasli') return (parseFloat(b.yas) || 0) - (parseFloat(a.yas) || 0);
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
            } catch (error) {
                alert('Silme başarısız!');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (duzenlenecekId) {
                await api.updateInek(duzenlenecekId, yeniInek);
            } else {
                if (satinAlma.aktif) {
                    await api.createAlisIslemi({
                        hayvanTipi: 'inek',
                        ...yeniInek,
                        fiyat: Number(satinAlma.fiyat),
                        aliciSatici: satinAlma.satici,
                        odenenMiktar: Number(satinAlma.odenenMiktar),
                        tarih: satinAlma.tarih,
                        notlar: `Satın Alındı. ${yeniInek.notlar || ''}`
                    });
                } else {
                    await api.createInek(yeniInek);
                }
            }
            fetchInekler();
            resetModal();
            alert('İşlem başarılı!');
        } catch (error) {
            alert('İşlem başarısız: ' + (error.response?.data?.message || error.message));
        }
    };

    const resetModal = () => {
        setYeniInek({ isim: '', yas: '', kilo: '', kupeNo: '', dogumTarihi: '', buzagiSayisi: 0, notlar: '' });
        setSatinAlma({ aktif: false, fiyat: '', satici: '', odenenMiktar: '', tarih: new Date().toISOString().split('T')[0] });
        setDuzenlenecekId(null);
        setShowModal(false);
    };

    const openEdit = (inek) => {
        setYeniInek(inek);
        setDuzenlenecekId(inek._id);
        setShowModal(true);
    };

    const prepareExportData = () => {
        return filteredInekler.map(i => ({
            'Küpe No': i.kupeNo,
            'İsim': i.isim,
            'Yaş': i.yas,
            'Kilo (kg)': i.kilo,
            'Durum': i.gebelikDurumu || 'Boş',
            'Son Doğum': i.sonBuzagilamaTarihi ? new Date(i.sonBuzagilamaTarihi).toLocaleDateString('tr-TR') : '-',
            'Laktasyon': i.laktasyonSayisi || 0
        }));
    };

    const exportToExcel = () => {
        const exportData = prepareExportData();
        if (!exportData.length) return alert('Dışa aktarılacak veri bulunamadı.');

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inekler");
        XLSX.writeFile(wb, `Agrolina_Inekler_Listesi_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const exportToPDF = () => {
        const exportData = prepareExportData();
        if (!exportData.length) return alert('Dışa aktarılacak veri bulunamadı.');

        const doc = new jsPDF();
        doc.setFont("helvetica");
        doc.setFontSize(18);
        doc.text('Agrolina - Inekler Listesi', 14, 20);
        doc.setFontSize(11);
        doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')} | Toplam: ${filteredInekler.length} inek`, 14, 28);

        const columns = Object.keys(exportData[0]).map(key => ({ header: key, dataKey: key }));

        doc.autoTable({
            head: [columns.map(c => c.header)],
            body: exportData.map(row => columns.map(c => row[c.dataKey])),
            startY: 35,
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [44, 62, 80] },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        doc.save(`Agrolina_Inekler_Listesi_${new Date().toISOString().slice(0, 10)}.pdf`);
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
                    <ExportBtn onClick={exportToExcel} title="Excel İndir"><FaFileExcel /> <span>Excel</span></ExportBtn>
                    <ExportBtn $pdf onClick={exportToPDF} title="PDF İndir"><FaFilePdf /> <span>PDF</span></ExportBtn>
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
                                        <td style={tdStyle}>{inek.yas}</td>
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
                                <div className="stat"><span>YAŞ</span><strong>{inek.yas}</strong></div>
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
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
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
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={formGroupStyle}>
                                    <label>Yaş:</label>
                                    <input type="number" required value={yeniInek.yas} onChange={e => setYeniInek({ ...yeniInek, yas: e.target.value })} style={inputStyle} />
                                </div>
                                <div style={formGroupStyle}>
                                    <label>Kilo:</label>
                                    <input type="number" required value={yeniInek.kilo} onChange={e => setYeniInek({ ...yeniInek, kilo: e.target.value })} style={inputStyle} />
                                </div>
                            </div>
                            <div style={formGroupStyle}>
                                <label>Doğum Tarihi:</label>
                                <input type="date" value={yeniInek.dogumTarihi} onChange={e => setYeniInek({ ...yeniInek, dogumTarihi: e.target.value })} style={inputStyle} />
                            </div>
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={resetModal} style={{ ...btnStyle, backgroundColor: '#95A5A6' }}>İptal</button>
                                <button type="submit" style={{ ...btnStyle, backgroundColor: '#4CAF50' }}>Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PageContainer>
    );
};

// --- Sub Components & Styles ---

const StatusBadge = ({ status }) => (
    <span style={{
        padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
        backgroundColor: status === 'Gebe' ? '#E8F5E9' : '#FFF3E0',
        color: status === 'Gebe' ? '#2E7D32' : '#EF6C00'
    }}>
        {status || 'Boş'}
    </span>
);

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
      border: 1px solid #eee;
      background: white;
      padding: 8px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      
      &.view { color: #F39C12; }
      &.edit { color: #3498DB; }
      &.delete { color: #E74C3C; }
      
      &:hover { background: #f9f9f9; }
    }
  }
`;

const thStyle = { padding: '15px', textAlign: 'left', fontSize: '14px', color: '#666' };
const tdStyle = { padding: '15px', fontSize: '14px', color: '#333' };
const actionBtnStyle = (color) => ({
    border: 'none', background: 'none', cursor: 'pointer', color: color, fontSize: '16px', marginRight: '10px'
});
const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};
const modalContentStyle = {
    backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', maxWidth: '90%'
};
const formGroupStyle = { marginBottom: '15px' };
const inputStyle = { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #DDD', marginTop: '5px' };
const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer' };

export default Inekler;
