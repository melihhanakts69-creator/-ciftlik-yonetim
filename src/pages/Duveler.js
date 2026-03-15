import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import styled from 'styled-components';
import { FaThLarge, FaList, FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
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
  flex-wrap: wrap;
  gap: 12px;

  h1 { margin: 0; font-size: 28px; color: #2c3e50; font-weight: 800;
    @media (max-width: 768px) { font-size: 22px; }
  }
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
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
  transition: transform 0.2s;
  
  &:hover { transform: translateY(-2px); }
`;

function Duveler() {
    const navigate = useNavigate();
    const [duveler, setDuveler] = useState([]);
    const [filteredDuveler, setFilteredDuveler] = useState([]);
    const [inekler, setInekler] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(window.innerWidth < 768 ? 'card' : 'table');

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('');

    // Modal States
    const [duveEkrani, setDuveEkrani] = useState(false);
    const [duzenlenecekDuve, setDuzenlenecekDuve] = useState(null);
    const [gruplar, setGruplar] = useState([]);
    const [yeniDuve, setYeniDuve] = useState({
        isim: '', kupeNo: '', dogumTarihi: '', yas: '', kilo: '',
        anneKupeNo: '', tohumlamaTarihi: '', gebelikDurumu: 'Belirsiz', not: '', grupId: ''
    });
    const [satinAlma, setSatinAlma] = useState({
        aktif: false, fiyat: '', satici: '', odenenMiktar: '', tarih: new Date().toISOString().split('T')[0]
    });

    // Doğum Modal
    const [dogumEkrani, setDogumEkrani] = useState(false);
    const [dogumYapacakDuve, setDogumYapacakDuve] = useState(null);
    const [dogumBilgileri, setDogumBilgileri] = useState({
        dogumTarihi: '', buzagiIsim: '', buzagiCinsiyet: 'disi', buzagiKilo: '', notlar: ''
    });

    useEffect(() => {
        fetchData();
        const handleResize = () => { if (window.innerWidth < 768) setViewMode('card'); };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        api.getGruplar().then(r => setGruplar(Array.isArray(r?.data) ? r.data : [])).catch(() => setGruplar([]));
    }, []);

    useEffect(() => {
        filterAndSort();
    }, [searchTerm, statusFilter, sortBy, duveler]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [duvelerRes, ineklerRes] = await Promise.all([
                api.getDuveler(),
                api.getInekler()
            ]);
            setDuveler(duvelerRes.data);
            setInekler(ineklerRes.data);
            setFilteredDuveler(duvelerRes.data);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSort = () => {
        let result = [...duveler];

        // Search
        if (searchTerm) {
            const lowerIndex = searchTerm.toLowerCase();
            result = result.filter(d =>
                (d.isim && d.isim.toLowerCase().includes(lowerIndex)) ||
                (d.kupeNo && d.kupeNo.toLowerCase().includes(lowerIndex))
            );
        }

        // Status Filter
        if (statusFilter) {
            result = result.filter(d => {
                if (statusFilter === 'gebe') return d.gebelikDurumu === 'Gebe';
                if (statusFilter === 'bos') return d.gebelikDurumu !== 'Gebe';
                return true;
            });
        }

        // Sort
        if (sortBy) {
            result.sort((a, b) => {
                if (sortBy === 'ad_artan') return a.isim.localeCompare(b.isim);
                if (sortBy === 'ad_azalan') return b.isim.localeCompare(a.isim);
                if (sortBy === 'yas_genc') return new Date(b.dogumTarihi) - new Date(a.dogumTarihi);
                if (sortBy === 'yas_yasli') return new Date(a.dogumTarihi) - new Date(b.dogumTarihi);
                return 0;
            });
        }

        setFilteredDuveler(result);
    };

    // --- Helper Functions ---
    const dogumTarihiHesapla = (tarih) => {
        if (!tarih) return null;
        const tohum = new Date(tarih);
        tohum.setDate(tohum.getDate() + 283);
        return tohum;
    };

    const kalanGunHesapla = (tarih) => {
        const dogum = dogumTarihiHesapla(tarih);
        if (!dogum) return null;
        const bugun = new Date();
        return Math.ceil((dogum - bugun) / (1000 * 60 * 60 * 24));
    };

    const yasHesaplaAy = (dogumTarihi) => {
        if (!dogumTarihi) return 0;
        return Math.floor((new Date() - new Date(dogumTarihi)) / (1000 * 60 * 60 * 24 * 30.44));
    };

    const GEBELIK_KONTROL_GUN = 28;
    const GEBELIK_SURE_GUN = 283;
    const gebelikValidasyonHata = (durum, tohumStr) => {
        const d = durum ?? (duzenlenecekDuve ? duzenlenecekDuve.gebelikDurumu : yeniDuve.gebelikDurumu);
        const t = tohumStr ?? (duzenlenecekDuve ? duzenlenecekDuve.tohumlamaTarihi : yeniDuve.tohumlamaTarihi);
        const tohum = t ? new Date(t) : null;
        if (!tohum) return null;
        const bugun = new Date();
        bugun.setHours(0, 0, 0, 0);
        const gecenGun = Math.floor((bugun - tohum) / (1000 * 60 * 60 * 24));
        if (d === 'Gebe') {
            if (gecenGun < GEBELIK_KONTROL_GUN)
                return `Gebelik kontrolü henüz yapılmadı (${gecenGun} gün geçti). 'Belirsiz' seçmelisiniz.`;
            return null;
        }
        if (d === 'Belirsiz' && gecenGun >= GEBELIK_KONTROL_GUN && gecenGun < GEBELIK_SURE_GUN)
            return `Gebelik kontrolü yapıldı (${gecenGun} gün geçti). 'Gebe' veya 'Gebe Değil' seçmelisiniz.`;
        return null;
    };

    // --- CRUD Operations ---
    const duveEkle = async () => {
        const validasyonHata = gebelikValidasyonHata(yeniDuve.gebelikDurumu, yeniDuve.tohumlamaTarihi);
        if (validasyonHata) {
            toast.error(validasyonHata);
            return;
        }
        try {
            const yasAy = yasHesaplaAy(yeniDuve.dogumTarihi);
            const payload = { ...yeniDuve, yas: yasAy, kilo: parseFloat(yeniDuve.kilo) || 0, grupId: yeniDuve.grupId || null };
            if (payload.gebelikDurumu === 'Gebe Değil') payload.tohumlamaTarihi = '';

            if (satinAlma.aktif) {
                await api.createAlisIslemi({
                    hayvanTipi: 'duve',
                    ...payload,
                    fiyat: Number(satinAlma.fiyat),
                    aliciSatici: satinAlma.satici,
                    odenenMiktar: Number(satinAlma.odenenMiktar),
                    tarih: satinAlma.tarih,
                    notlar: `Satın Alındı. ${payload.not || ''}`
                });
            } else {
                await api.createDuve(payload);
            }
            fetchData();
            setDuveEkrani(false);
            resetForm();
            alert('✅ İşlem Başarılı!');
        } catch (error) {
            alert('❌ Hata: ' + (error.response?.data?.message || 'Ekleme başarısız'));
        }
    };

    const duveGuncelle = async () => {
        const validasyonHata = gebelikValidasyonHata(duzenlenecekDuve.gebelikDurumu, duzenlenecekDuve.tohumlamaTarihi);
        if (validasyonHata) {
            toast.error(validasyonHata);
            return;
        }
        try {
            const payload = { ...duzenlenecekDuve, grupId: duzenlenecekDuve.grupId || null };
            payload.yas = yasHesaplaAy(duzenlenecekDuve.dogumTarihi);
            payload.kilo = parseFloat(duzenlenecekDuve.kilo) || 0;
            if (payload.gebelikDurumu === 'Gebe Değil') payload.tohumlamaTarihi = '';
            await api.updateDuve(duzenlenecekDuve._id, payload);
            setDuveler(duveler.map(d => d._id === duzenlenecekDuve._id ? duzenlenecekDuve : d));
            setDuzenlenecekDuve(null);
            alert('✅ Düve güncellendi!');
        } catch (error) {
            alert('❌ Güncelleme başarısız');
        }
    };

    const duveSil = async (id) => {
        if (!window.confirm('Silmek istediğine emin misin?')) return;
        try {
            await api.deleteDuve(id);
            setDuveler(duveler.filter(d => d._id !== id));
        } catch (error) {
            alert('❌ Silme başarısız');
        }
    };

    const duveDogurdu = async () => {
        try {
            await api.duveDogurdu(dogumYapacakDuve._id, dogumBilgileri);
            setDuveler(duveler.filter(d => d._id !== dogumYapacakDuve._id));
            setDogumEkrani(false);
            alert('✅ Doğum kaydedildi, düve ineğe dönüştü!');
        } catch (error) {
            alert('❌ Doğum kaydı başarısız');
        }
    };

    const resetForm = () => {
        setYeniDuve({ isim: '', kupeNo: '', dogumTarihi: '', yas: '', kilo: '', anneKupeNo: '', tohumlamaTarihi: '', gebelikDurumu: 'Belirsiz', not: '', grupId: '' });
        setSatinAlma({ aktif: false, fiyat: '', satici: '', odenenMiktar: '', tarih: new Date().toISOString().split('T')[0] });
    };

    // Filter Options
    const filterOptions = [
        { value: 'gebe', label: 'Gebeler' },
        { value: 'bos', label: 'Boş/Belirsiz' }
    ];

    const sortOptions = [
        { value: 'ad_artan', label: 'İsim (A-Z)' },
        { value: 'yas_genc', label: 'En Genç' },
        { value: 'yas_yasli', label: 'En Yaşlı' }
    ];

    return (
        <PageContainer>
            <Header>
                <div>
                    <h1>🐄 Düveler ({filteredDuveler.length})</h1>
                    <p>Çiftlikteki genç dişiler</p>
                </div>
                <ActionGroup>
                    <div style={{ display: 'flex' }}>
                        <ToggleButton first active={viewMode === 'table'} onClick={() => setViewMode('table')}>
                            <FaList />
                        </ToggleButton>
                        <ToggleButton last active={viewMode === 'card'} onClick={() => setViewMode('card')}>
                            <FaThLarge />
                        </ToggleButton>
                    </div>
                    <AddButton onClick={() => { resetForm(); setDuveEkrani(true); }}>
                        <FaPlus /> <span>Yeni Düve</span>
                    </AddButton>
                </ActionGroup>
            </Header>

            <FilterBar
                onSearch={setSearchTerm}
                onFilterChange={setStatusFilter}
                onSortChange={setSortBy}
                filterOptions={filterOptions}
                sortOptions={sortOptions}
                placeholder="Düve ara..."
            />

            {/* Yaklaşan Doğum Uyarısı */}
            {duveler.some(d => {
                const k = kalanGunHesapla(d.tohumlamaTarihi);
                return k !== null && k > 0 && k <= 30;
            }) && (
                    <AlertBox>
                        ⚠️ <strong>Dikkat:</strong> 30 günden az kalan doğumlar var!
                    </AlertBox>
                )}

            {loading ? <div>Yükleniyor...</div> : viewMode === 'table' ? (
                <ResponsiveTable>
                    <table>
                        <thead>
                            <tr>
                                <th>Küpe No</th>
                                <th>İsim</th>
                                <th>Yaş (Ay)</th>
                                <th>Kilo</th>
                                <th>Durum</th>
                                <th>Beklenen Doğum</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDuveler.map(d => {
                                const yas = Math.floor((new Date() - new Date(d.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
                                const dogumTarihi = dogumTarihiHesapla(d.tohumlamaTarihi);
                                return (
                                    <tr key={d._id}>
                                        <td>{d.kupeNo}</td>
                                        <td><strong>{d.isim}</strong></td>
                                        <td>{yas}</td>
                                        <td>{d.kilo} kg</td>
                                        <td><StatusBadge status={d.gebelikDurumu} /></td>
                                        <td>{dogumTarihi ? dogumTarihi.toLocaleDateString() : '-'}</td>
                                        <td>
                                            <div className="actions">
                                                <button onClick={() => navigate(`/duve-detay/${d._id}`)} className="view"><FaEye /></button>
                                                <button onClick={() => setDuzenlenecekDuve(d)} className="edit"><FaEdit /></button>
                                                <button onClick={() => duveSil(d._id)} className="delete"><FaTrash /></button>
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
                    {filteredDuveler.map(d => {
                        const yas = Math.floor((new Date() - new Date(d.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
                        const kalanGun = kalanGunHesapla(d.tohumlamaTarihi);

                        return (
                            <Card key={d._id} status={d.gebelikDurumu} onClick={() => navigate(`/duve-detay/${d._id}`)}>
                                <div className="header">
                                    <h3>{d.isim}</h3>
                                    <span className="tag">{d.kupeNo}</span>
                                </div>

                                {d.gebelikDurumu === 'Gebe' && (
                                    <div className="info-badge">
                                        🤰 {kalanGun} gün kaldı
                                    </div>
                                )}

                                <div className="stats">
                                    <div className="stat-box">
                                        <span>YAŞ</span>
                                        <strong>{yas} Ay</strong>
                                    </div>
                                    <div className="stat-box">
                                        <span>KİLO</span>
                                        <strong>{d.kilo} kg</strong>
                                    </div>
                                    <div className="stat-box">
                                        <span>DURUM</span>
                                        <StatusBadge status={d.gebelikDurumu} />
                                    </div>
                                </div>

                                <div className="actions">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); navigate(`/duve-detay/${d._id}`); }} className="view"><FaEye /></button>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setDuzenlenecekDuve(d); }} className="edit"><FaEdit /></button>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); duveSil(d._id); }} className="delete"><FaTrash /></button>
                                </div>

                                {d.gebelikDurumu === 'Gebe' && d.tohumlamaTarihi && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setDogumYapacakDuve(d); setDogumEkrani(true); }}
                                        className="birth-btn"
                                    >
                                        🤰 Doğurdu
                                    </button>
                                )}
                            </Card>
                        );
                    })}
                </Grid>
            )}

            {/* Modals placed here (simplified for brevity, referencing original logic) */}
            {/* Duve Ekle/Duzenle Modal */}
            {(duveEkrani || duzenlenecekDuve) && (
                <ModalOverlay onClick={() => { setDuveEkrani(false); setDuzenlenecekDuve(null); }}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <h2>{duzenlenecekDuve ? 'Düve Düzenle' : 'Yeni Düve Ekle'}</h2>

                        {!duzenlenecekDuve && (
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

                        <div className="form-group">
                            <label>İsim *</label>
                            <input value={duzenlenecekDuve ? duzenlenecekDuve.isim : yeniDuve.isim} onChange={e => duzenlenecekDuve ? setDuzenlenecekDuve({ ...duzenlenecekDuve, isim: e.target.value }) : setYeniDuve({ ...yeniDuve, isim: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Küpe No *</label>
                            <input value={duzenlenecekDuve ? duzenlenecekDuve.kupeNo : yeniDuve.kupeNo} onChange={e => duzenlenecekDuve ? setDuzenlenecekDuve({ ...duzenlenecekDuve, kupeNo: e.target.value }) : setYeniDuve({ ...yeniDuve, kupeNo: e.target.value })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-group">
                                <label>Doğum Tarihi *</label>
                                <input type="date" value={duzenlenecekDuve ? (duzenlenecekDuve.dogumTarihi ? new Date(duzenlenecekDuve.dogumTarihi).toISOString().split('T')[0] : '') : yeniDuve.dogumTarihi} onChange={e => duzenlenecekDuve ? setDuzenlenecekDuve({ ...duzenlenecekDuve, dogumTarihi: e.target.value }) : setYeniDuve({ ...yeniDuve, dogumTarihi: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Kilo (kg) *</label>
                                <input type="number" min="0" step="0.1" value={duzenlenecekDuve ? duzenlenecekDuve.kilo : yeniDuve.kilo} onChange={e => duzenlenecekDuve ? setDuzenlenecekDuve({ ...duzenlenecekDuve, kilo: e.target.value }) : setYeniDuve({ ...yeniDuve, kilo: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Gebelik Durumu</label>
                            <select
                                value={duzenlenecekDuve ? duzenlenecekDuve.gebelikDurumu : yeniDuve.gebelikDurumu}
                                onChange={e => {
                                    const val = e.target.value;
                                    const mevcutTohum = duzenlenecekDuve ? duzenlenecekDuve.tohumlamaTarihi : yeniDuve.tohumlamaTarihi;
                                    const yeniTohum = val === 'Gebe Değil' ? '' : mevcutTohum;
                                    if (duzenlenecekDuve) setDuzenlenecekDuve({ ...duzenlenecekDuve, gebelikDurumu: val, tohumlamaTarihi: yeniTohum });
                                    else setYeniDuve({ ...yeniDuve, gebelikDurumu: val, tohumlamaTarihi: yeniTohum });
                                    const h = gebelikValidasyonHata(val, yeniTohum);
                                    if (h) toast.error(h);
                                }}
                                style={{ borderColor: gebelikValidasyonHata() ? '#dc2626' : undefined }}
                            >
                                <option value="Belirsiz">Belirsiz</option>
                                <option value="Gebe">Gebe</option>
                                <option value="Gebe Değil">Gebe Değil</option>
                            </select>
                        </div>
                        {((duzenlenecekDuve ? duzenlenecekDuve.gebelikDurumu : yeniDuve.gebelikDurumu) === 'Gebe' || (duzenlenecekDuve ? duzenlenecekDuve.gebelikDurumu : yeniDuve.gebelikDurumu) === 'Belirsiz') && (
                            <div className="form-group">
                                <label>Tohumlama Tarihi {((duzenlenecekDuve ? duzenlenecekDuve.gebelikDurumu : yeniDuve.gebelikDurumu) === 'Gebe') ? '*' : ''} {((duzenlenecekDuve ? duzenlenecekDuve.gebelikDurumu : yeniDuve.gebelikDurumu) === 'Belirsiz') && '(28 günden az olmalı)'}</label>
                                <input
                                    type="date"
                                    required={((duzenlenecekDuve ? duzenlenecekDuve.gebelikDurumu : yeniDuve.gebelikDurumu) === 'Gebe')}
                                    value={duzenlenecekDuve ? (duzenlenecekDuve.tohumlamaTarihi ? new Date(duzenlenecekDuve.tohumlamaTarihi).toISOString().split('T')[0] : '') : yeniDuve.tohumlamaTarihi}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (duzenlenecekDuve) setDuzenlenecekDuve({ ...duzenlenecekDuve, tohumlamaTarihi: val });
                                        else setYeniDuve({ ...yeniDuve, tohumlamaTarihi: val });
                                        const h = gebelikValidasyonHata(duzenlenecekDuve ? duzenlenecekDuve.gebelikDurumu : yeniDuve.gebelikDurumu, val);
                                        if (h) toast.error(h);
                                    }}
                                    style={{ borderColor: gebelikValidasyonHata() ? '#dc2626' : undefined }}
                                />
                                {gebelikValidasyonHata() && (
                                    <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4, display: 'block' }}>{gebelikValidasyonHata()}</span>
                                )}
                            </div>
                        )}
                        <div className="form-group">
                            <label>Grup (Yemleme)</label>
                            <select value={duzenlenecekDuve ? (duzenlenecekDuve.grupId?._id || duzenlenecekDuve.grupId || '') : (yeniDuve.grupId || '')} onChange={e => duzenlenecekDuve ? setDuzenlenecekDuve({ ...duzenlenecekDuve, grupId: e.target.value }) : setYeniDuve({ ...yeniDuve, grupId: e.target.value })}>
                                <option value="">— Grup seçin —</option>
                                {gruplar.map(g => <option key={g._id} value={g._id}>{g.ad} ({g.tip || 'karma'})</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Notlar</label>
                            <textarea rows={2} value={duzenlenecekDuve ? duzenlenecekDuve.not : yeniDuve.not} onChange={e => duzenlenecekDuve ? setDuzenlenecekDuve({ ...duzenlenecekDuve, not: e.target.value }) : setYeniDuve({ ...yeniDuve, not: e.target.value })} placeholder="İsteğe bağlı" />
                        </div>
                        {/* Kapat/Kaydet Butonları */}
                        <div className="btn-group">
                            <button onClick={() => { setDuveEkrani(false); setDuzenlenecekDuve(null); }}>İptal</button>
                            <button onClick={duzenlenecekDuve ? duveGuncelle : duveEkle} className="save">Kaydet</button>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}

            {/* Doğum Modal */}
            {dogumEkrani && (
                <ModalOverlay>
                    <ModalContent>
                        <h2>🤰 Doğum Kaydı</h2>
                        <div className="form-group">
                            <label>Buzağı Adı</label>
                            <input value={dogumBilgileri.buzagiIsim} onChange={e => setDogumBilgileri({ ...dogumBilgileri, buzagiIsim: e.target.value })} />
                        </div>
                        {/* ... Diğer inputlar ... */}
                        <div className="btn-group">
                            <button onClick={() => setDogumEkrani(false)}>İptal</button>
                            <button onClick={duveDogurdu} className="save">Kaydet</button>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}

        </PageContainer>
    );
}

// Sub-components
const StatusBadge = ({ status }) => (
    <span style={{
        padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
        backgroundColor: status === 'Gebe' ? '#E8F5E9' : '#FFF3E0',
        color: status === 'Gebe' ? '#2E7D32' : '#EF6C00'
    }}>
        {status}
    </span>
);

const AlertBox = styled.div`
    background-color: #FFF3E0;
    color: #E65100;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #FFB74D;
`;

const ResponsiveTable = styled.div`
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    overflow-x: auto;
    
    table {
        width: 100%;
        border-collapse: collapse;
        min-width: 800px;
        
        th { padding: 15px; text-align: left; background: #f8f9fa; border-bottom: 2px solid #e9ecef; }
        td { padding: 15px; border-bottom: 1px solid #eee; }
        
        .actions {
            display: flex; gap: 8px;
            button { border: none; background: none; cursor: pointer; font-size: 16px; }
            .view { color: #2196F3; }
            .edit { color: #FF9800; }
            .delete { color: #f44336; }
        }
    }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
`;

const Card = styled.div`
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    border: 1px solid ${props => props.status === 'Gebe' ? '#4CAF50' : '#eee'};
    cursor: pointer;
    transition: transform 0.2s;
    
    &:hover { transform: translateY(-3px); }

    .header {
        display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;
        h3 { margin: 0; font-size: 20px; color: #333; }
        .tag { background: #f5f5f5; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold; }
    }
    
    .info-badge {
        background: #E8F5E9; color: #2E7D32; padding: 8px; border-radius: 8px; 
        font-size: 13px; font-weight: bold; margin-bottom: 15px;
    }

    .stats {
        display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;
        .stat-box { 
            background: #f8f9fa; padding: 8px; border-radius: 8px; text-align: center; 
            span { display: block; font-size: 10px; color: #999; }
            strong { font-size: 14px; }
        }
    }

    .actions {
        display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #eee; padding-top: 15px;
        button {
            border: 1.5px solid #e2e8f0; background: white; padding: 10px 14px; border-radius: 10px;
            cursor: pointer; min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center;
            position: relative; z-index: 2; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
            transition: background 0.2s, transform 0.1s;
            &:hover { background: #f8fafc; }
            &:active { transform: scale(0.96); }
        }
        .view { color: #2196F3; }
        .edit { color: #FF9800; }
        .delete { color: #f44336; }
    }
    
    .birth-btn {
        width: 100%; margin-top: 10px; padding: 10px; background: #4CAF50; color: white;
        border: none; border-radius: 8px; font-weight: bold; cursor: pointer;
    }
`;

const ModalOverlay = styled.div`
    position: fixed; inset: 0;
    background: rgba(15,23,42,0.5);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    z-index: 1001;
    padding: 20px;
    overflow-y: auto;

    @media (max-width: 768px) {
        padding: 16px 12px 24px;
        align-items: flex-start;
        padding-top: max(16px, env(safe-area-inset-top));
    }
`;

const ModalContent = styled.div`
    background: white;
    padding: 28px 32px;
    border-radius: 20px;
    width: 100%;
    max-width: 480px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 24px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04);
    animation: modalIn 0.3s ease;

    h2 { margin: 0 0 24px 0; font-size: 20px; font-weight: 800; color: #0f172a; }
    .form-group { margin-bottom: 16px; label { display: block; margin-bottom: 6px; font-weight: 700; font-size: 13px; color: #334155; } input, select, textarea { width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; } }
    .btn-group { display: flex; gap: 10px; margin-top: 24px; button { flex: 1; padding: 12px; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; min-height: 44px; } .save { background: linear-gradient(135deg,#4CAF50,#45a049); color: white; } }

    @keyframes modalIn {
        from { opacity: 0; transform: scale(0.97) translateY(12px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
    }

    @media (max-width: 768px) {
        width: 100%; max-width: 100%;
        max-height: 85vh;
        border-radius: 16px;
        padding: 22px 18px;
        padding-bottom: calc(22px + env(safe-area-inset-bottom));
        box-shadow: 0 -4px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06);
    }
`;

export default Duveler;
