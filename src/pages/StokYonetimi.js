import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBox, FaPlus, FaMinus, FaEdit, FaTrash, FaSearch, FaExclamationTriangle, FaFilter } from 'react-icons/fa';
import * as api from '../services/api';
import { toast } from 'react-toastify';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend
} from 'recharts';

const PageContainer = styled.div`
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;

  h1 {
    font-size: 24px;
    font-weight: 800;
    color: #2c3e50;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const ActionButton = styled.button`
  background: ${props => props.danger ? '#ef5350' : '#4CAF50'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const SearchFilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;

  input {
    flex: 1;
    min-width: 200px;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 10px;
    font-size: 14px;
  }

  select {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 10px;
    font-size: 14px;
    background: white;
    min-width: 150px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const StokCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  border-left: 5px solid ${props => props.kritik ? '#ef5350' : '#4CAF50'};
  position: relative;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #2c3e50;
  }
  
  .badge {
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 8px;
    background: #f0f2f5;
    color: #666;
    font-weight: 600;
  }
`;

const MiktarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;

  .value {
    font-size: 24px;
    font-weight: 800;
    color: ${props => props.kritik ? '#ef5350' : '#2c3e50'};
  }
  .unit {
    font-size: 14px;
    color: #999;
    margin-left: 4px;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;

  button {
    flex: 1;
    padding: 8px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background 0.2s;
  }

  .btn-add { background: #E8F5E9; color: #2E7D32; &:hover { background: #C8E6C9; } }
  .btn-sub { background: #FFEBEE; color: #C62828; &:hover { background: #FFCDD2; } }
  .btn-edit { background: #E3F2FD; color: #1565C0; &:hover { background: #BBDEFB; } }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);

  h2 { margin-top: 0; color: #2c3e50; }

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #555;
    font-size: 14px;
  }

  input, select, textarea {
    width: 100%;
    padding: 12px;
    margin-bottom: 20px;
    border: 1px solid #ddd;
    border-radius: 10px;
    font-size: 14px;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #4CAF50;
      box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
    }
  }

  .btn-group {
    display: flex;
    gap: 12px;
    margin-top: 10px;
    justify-content: flex-end;
  }
`;

const ChartContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  height: 300px;
`;

const StokYonetimi = () => {
    const [stoklar, setStoklar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Tümü');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        urunAdi: '', kategori: 'Diğer', miktar: 0, birim: 'adet', kritikSeviye: 10, notlar: ''
    });

    useEffect(() => {
        fetchStoklar();
    }, []);

    const fetchStoklar = async () => {
        try {
            setLoading(true);
            const res = await api.getStoklar();
            setStoklar(res.data);
        } catch (err) {
            toast.error('Stok verileri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.updateStok(editingItem._id, { ...formData, islem: 'guncelle' });
                toast.success('Stok güncellendi');
            } else {
                await api.createStok(formData);
                toast.success('Yeni stok eklendi');
            }
            setShowModal(false);
            setEditingItem(null);
            setFormData({ urunAdi: '', kategori: 'Diğer', miktar: 0, birim: 'adet', kritikSeviye: 10, notlar: '' });
            fetchStoklar();
        } catch (err) {
            toast.error('İşlem başarısız');
        }
    };

    const handleQuickUpdate = async (id, type, amount) => {
        try {
            await api.updateStok(id, { miktar: amount, islem: type });
            toast.success(type === 'ekle' ? 'Miktar artırıldı' : 'Miktar azaltıldı');
            fetchStoklar();
        } catch (err) {
            toast.error('Güncelleme hatası');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu stoğu silmek istediğinize emin misiniz?')) return;
        try {
            await api.deleteStok(id);
            toast.success('Stok silindi');
            fetchStoklar();
        } catch (err) {
            toast.error('Silme hatası');
        }
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setFormData({
            urunAdi: item.urunAdi,
            kategori: item.kategori,
            miktar: item.miktar,
            birim: item.birim,
            kritikSeviye: item.kritikSeviye,
            notlar: item.notlar || ''
        });
        setShowModal(true);
    };

    const openNew = () => {
        setEditingItem(null);
        setFormData({ urunAdi: '', kategori: 'Diğer', miktar: 0, birim: 'adet', kritikSeviye: 10, notlar: '' });
        setShowModal(true);
    };

    const filteredStoklar = stoklar.filter(item => {
        const matchesSearch = item.urunAdi.toLowerCase().includes(filter.toLowerCase());
        const matchesCategory = categoryFilter === 'Tümü' || item.kategori === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Chart Data
    const categories = ['Yem', 'İlaç', 'Vitamin', 'Ekipman', 'Diğer'];
    const chartData = categories.map(cat => ({
        name: cat,
        value: stoklar.filter(s => s.kategori === cat).length
    })).filter(d => d.value > 0);

    const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#607D8B'];

    return (
        <PageContainer>
            <Header>
                <h1><FaBox color="#FF9800" /> Stok Yönetimi</h1>
                <ActionButton onClick={openNew}>
                    <FaPlus /> Yeni Stok Ekle
                </ActionButton>
            </Header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 30 }}>
                {/* Stok Özeti Chart */}
                <ChartContainer>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: 16 }}>📦 Kategori Dağılımı</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="middle" align="right" layout="vertical" />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>

                {/* Kritik Stok Uyarısı */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    {stoklar.filter(s => s.miktar <= s.kritikSeviye).length > 0 ? (
                        <div style={{ background: '#FFEBEE', padding: 20, borderRadius: 16, borderLeft: '5px solid #ef5350' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#c62828', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FaExclamationTriangle /> Kritik Stoklar!
                            </h3>
                            <p style={{ margin: 0, color: '#b71c1c' }}>
                                {stoklar.filter(s => s.miktar <= s.kritikSeviye).length} ürün kritik seviyenin altında. Lütfen tedarik sağlayın.
                            </p>
                        </div>
                    ) : (
                        <div style={{ background: '#E8F5E9', padding: 20, borderRadius: 16, borderLeft: '5px solid #2e7d32' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 8 }}>
                                ✅ Stok Durumu İyi
                            </h3>
                            <p style={{ margin: 0, color: '#1b5e20' }}>
                                Tüm ürünler yeterli seviyede.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <SearchFilterBar>
                <div style={{ position: 'relative', flex: 1 }}>
                    <FaSearch style={{ position: 'absolute', left: 15, top: 15, color: '#999' }} />
                    <input
                        type="text"
                        placeholder="Ürün adı ara..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        style={{ paddingLeft: 40 }}
                    />
                </div>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    <option value="Tümü">Tüm Kategoriler</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </SearchFilterBar>

            {loading ? (
                <div>Yükleniyor...</div>
            ) : (
                <Grid>
                    {filteredStoklar.map(item => (
                        <StokCard key={item._id} kritik={item.miktar <= item.kritikSeviye}>
                            {item.miktar <= item.kritikSeviye && (
                                <div style={{ position: 'absolute', top: 10, right: 10, color: '#ef5350' }} title="Kritik Seviye">
                                    <FaExclamationTriangle />
                                </div>
                            )}
                            <HeaderRow>
                                <div>
                                    <h3>{item.urunAdi}</h3>
                                    <span className="badge">{item.kategori}</span>
                                </div>
                            </HeaderRow>

                            <MiktarRow kritik={item.miktar <= item.kritikSeviye}>
                                <div>
                                    <span className="value">{item.miktar}</span>
                                    <span className="unit">{item.birim}</span>
                                </div>
                                <div style={{ fontSize: 12, color: '#999', textAlign: 'right' }}>
                                    Kritik: {item.kritikSeviye} {item.birim}
                                    <br />
                                    Son: {new Date(item.sonGuncelleme).toLocaleDateString()}
                                </div>
                            </MiktarRow>

                            {item.notlar && <p style={{ fontSize: 12, color: '#666', margin: '0 0 10px 0' }}>{item.notlar}</p>}

                            <ActionsRow>
                                <button className="btn-sub" onClick={() => handleQuickUpdate(item._id, 'cikar', 1)}><FaMinus /></button>
                                <button className="btn-add" onClick={() => handleQuickUpdate(item._id, 'ekle', 1)}><FaPlus /></button>
                                <button className="btn-edit" onClick={() => openEdit(item)} style={{ flex: 2 }}><FaEdit /> Düzenle</button>
                                <button onClick={() => handleDelete(item._id)} style={{ background: 'none', color: '#ccc', flex: 0.5 }}><FaTrash /></button>
                            </ActionsRow>
                        </StokCard>
                    ))}
                </Grid>
            )}

            {showModal && (
                <ModalOverlay onClick={() => setShowModal(false)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <h2>{editingItem ? 'Stok Düzenle' : 'Yeni Stok Ekle'}</h2>
                        <form onSubmit={handleSubmit}>
                            <label>Ürün Adı</label>
                            <input
                                required
                                value={formData.urunAdi}
                                onChange={e => setFormData({ ...formData, urunAdi: e.target.value })}
                                placeholder="Örn: Penisilin"
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                                <div>
                                    <label>Kategori</label>
                                    <select value={formData.kategori} onChange={e => setFormData({ ...formData, kategori: e.target.value })}>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label>Birim</label>
                                    <select value={formData.birim} onChange={e => setFormData({ ...formData, birim: e.target.value })}>
                                        <option value="adet">Adet</option>
                                        <option value="kg">Kg</option>
                                        <option value="lt">Litre</option>
                                        <option value="kutu">Kutu</option>
                                        <option value="doz">Doz</option>
                                        <option value="torba">Torba</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                                <div>
                                    <label>Miktar</label>
                                    <input
                                        type="number" required min="0" step="0.1"
                                        value={formData.miktar}
                                        onChange={e => setFormData({ ...formData, miktar: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label>Kritik Seviye</label>
                                    <input
                                        type="number" required min="0"
                                        value={formData.kritikSeviye}
                                        onChange={e => setFormData({ ...formData, kritikSeviye: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <label>Notlar</label>
                            <textarea
                                rows="3"
                                value={formData.notlar}
                                onChange={e => setFormData({ ...formData, notlar: e.target.value })}
                                placeholder="Ek bilgiler..."
                            />

                            <div className="btn-group">
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', border: 'none', background: '#eee', borderRadius: 8, cursor: 'pointer' }}>İptal</button>
                                <button type="submit" style={{ padding: '10px 20px', border: 'none', background: '#4CAF50', color: 'white', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>Kaydet</button>
                            </div>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default StokYonetimi;
