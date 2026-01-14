import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaThLarge, FaList } from 'react-icons/fa';

const Inekler = () => {
    const navigate = useNavigate();
    const [inekler, setInekler] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtre, setFiltre] = useState('');
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

    // Yeni İnek Form State
    // Yeni İnek Form State
    const [showModal, setShowModal] = useState(false);
    const [duzenlenecekId, setDuzenlenecekId] = useState(null);
    const [yeniInek, setYeniInek] = useState({
        isim: '', yas: '', kilo: '', kupeNo: '',
        dogumTarihi: '', buzagiSayisi: 0, notlar: ''
    });

    // Veri Yükleme
    useEffect(() => {
        fetchInekler();
    }, []);

    const fetchInekler = async () => {
        try {
            const { data } = await api.getInekler();
            setInekler(data);
        } catch (error) {
            console.error('İnekler yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    // Form Reset
    const resetForm = () => {
        setYeniInek({ isim: '', yas: '', kilo: '', kupeNo: '', dogumTarihi: '', buzagiSayisi: 0, notlar: '' });
        setDuzenlenecekId(null);
        setShowModal(false);
    };

    // İnek Ekleme/Güncelleme
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (duzenlenecekId) {
                await api.updateInek(duzenlenecekId, yeniInek);
                alert('İnek güncellendi! ✅');
            } else {
                await api.createInek(yeniInek);
                alert('İnek başarıyla eklendi! 🐄');
            }
            fetchInekler();
            resetForm();
        } catch (error) {
            alert('Hata: ' + (error.response?.data?.message || 'İşlem başarısız'));
        }
    };

    // Düzenleme Modunu Aç
    const handleEdit = (inek) => {
        setYeniInek(inek);
        setDuzenlenecekId(inek._id);
        setShowModal(true);
    };

    // İnek Silme
    const handleDelete = async (id) => {
        if (window.confirm('Bu ineği silmek istediğinden emin misin?')) {
            try {
                await api.deleteInek(id);
                setInekler(inekler.filter(i => i._id !== id));
            } catch (error) {
                alert('Silme başarısız!');
            }
        }
    };

    // Filtreleme
    const filteredInekler = inekler.filter(inek =>
        inek.isim.toLowerCase().includes(filtre.toLowerCase()) ||
        inek.kupeNo.toLowerCase().includes(filtre.toLowerCase())
    );

    return (
        <div style={{ padding: '20px' }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'
            }}>
                <h1 style={{ fontSize: '24px', color: '#2C3E50', fontWeight: 'bold' }}>
                    🐄 İnek Yönetimi
                </h1>
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
                        onClick={() => { resetForm(); setShowModal(true); }}
                        style={{
                            backgroundColor: '#4CAF50', color: 'white', padding: '10px 20px',
                            border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        <FaPlus /> Yeni İnek Ekle
                    </button>
                </div>
            </div>

            {/* Arama Barı */}
            <div style={{ marginBottom: '20px', position: 'relative' }}>
                <FaSearch style={{ position: 'absolute', left: '15px', top: '12px', color: '#95A5A6' }} />
                <input
                    type="text"
                    placeholder="İsim veya Küpe No ile ara..."
                    value={filtre}
                    onChange={(e) => setFiltre(e.target.value)}
                    style={{
                        width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #DDD', fontSize: '15px'
                    }}
                />
            </div>

            {/* Tablo Görünümü */}
            {viewMode === 'table' ? (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '12px', fontSize: '12px',
                                                backgroundColor: inek.gebelikDurumu === 'Gebe' ? '#E8F5E9' : '#FFF3E0',
                                                color: inek.gebelikDurumu === 'Gebe' ? '#2E7D32' : '#EF6C00'
                                            }}>
                                                {inek.gebelikDurumu || 'Boş'}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>{inek.sonBuzagilamaTarihi ? new Date(inek.sonBuzagilamaTarihi).toLocaleDateString() : '-'}</td>
                                        <td style={tdStyle}>
                                            <button onClick={() => navigate(`/inek-detay/${inek._id}`)} title="Detay Gör" style={actionBtnStyle('#F39C12')}><FaEye /></button>
                                            <button onClick={() => handleEdit(inek)} title="Düzenle" style={actionBtnStyle('#3498DB')}><FaEdit /></button>
                                            <button onClick={() => handleDelete(inek._id)} title="Sil" style={actionBtnStyle('#E74C3C')}><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Kart Görünümü */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px', width: '100%' }}>Yükleniyor...</div>
                    ) : filteredInekler.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', width: '100%' }}>Kayıt bulunamadı.</div>
                    ) : (
                        filteredInekler.map(inek => (
                            <div key={inek._id} style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                padding: '20px',
                                border: inek.gebelikDurumu === 'Gebe' ? '2px solid #4CAF50' : '1px solid #eee',
                                transition: 'transform 0.2s',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                onClick={() => navigate(`/inek-detay/${inek._id}`)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#333' }}>🐄 {inek.isim}</h3>
                                        <span style={{ fontSize: '14px', color: '#666', backgroundColor: '#f5f5f5', padding: '2px 8px', borderRadius: '4px' }}>
                                            {inek.kupeNo}
                                        </span>
                                    </div>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '12px', fontSize: '12px',
                                        backgroundColor: inek.gebelikDurumu === 'Gebe' ? '#E8F5E9' : '#FFF3E0',
                                        color: inek.gebelikDurumu === 'Gebe' ? '#2E7D32' : '#EF6C00',
                                        fontWeight: 'bold'
                                    }}>
                                        {inek.gebelikDurumu || 'Boş'}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                    <div style={{ backgroundColor: '#F8F9FA', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '12px', color: '#666' }}>YAŞ</div>
                                        <div style={{ fontWeight: 'bold' }}>{inek.yas}</div>
                                    </div>
                                    <div style={{ backgroundColor: '#F8F9FA', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '12px', color: '#666' }}>KİLO</div>
                                        <div style={{ fontWeight: 'bold' }}>{inek.kilo} kg</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/inek-detay/${inek._id}`); }}
                                        style={{ ...actionBtnStyle('#F39C12'), border: '1px solid #eee', padding: '6px', borderRadius: '4px' }}
                                    >
                                        <FaEye />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(inek); }}
                                        style={{ ...actionBtnStyle('#3498DB'), border: '1px solid #eee', padding: '6px', borderRadius: '4px' }}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(inek._id); }}
                                        style={{ ...actionBtnStyle('#E74C3C'), border: '1px solid #eee', padding: '6px', borderRadius: '4px' }}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal (Basit) */}
            {showModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2>{duzenlenecekId ? 'İnek Düzenle' : 'Yeni İnek Ekle'}</h2>
                        <form onSubmit={handleSubmit}>
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
                                <button type="button" onClick={() => setShowModal(false)} style={{ ...btnStyle, backgroundColor: '#95A5A6' }}>İptal</button>
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
