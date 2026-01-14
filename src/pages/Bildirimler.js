import React, { useState, useEffect } from 'react';
import {
    FaBell, FaCalendarCheck, FaExclamationTriangle, FaCheckDouble,
    FaTrash, FaSyringe, FaBaby, FaStethoscope, FaInfoCircle, FaCheck
} from 'react-icons/fa';
import * as api from '../services/api';

function Bildirimler() {
    const [bildirimler, setBildirimler] = useState([]);
    const [istatistikler, setIstatistikler] = useState(null);
    const [aktifTab, setAktifTab] = useState('hepsi'); // 'hepsi', 'okunmamis', 'tamamlanacak'
    const [yukleniyor, setYukleniyor] = useState(true);

    useEffect(() => {
        veriYukle();
    }, [aktifTab]);

    const veriYukle = async () => {
        setYukleniyor(true);
        try {
            // İstatistikleri çek
            const istRes = await api.getBildirimIstatistikleri();
            setIstatistikler(istRes.data);

            // Bildirimleri çek
            const params = { limit: 50 };
            if (aktifTab === 'okunmamis') {
                params.okundu = false;
            } else if (aktifTab === 'tamamlanacak') {
                params.tamamlandi = false;
                // Sadece aksiyon gerektiren tipler (isteğe bağlı filtreleme)
            }

            const res = await api.getBildirimler(params);
            setBildirimler(res.data.bildirimler);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        } finally {
            setYukleniyor(false);
        }
    };

    const okunduIsaretle = async (id, e) => {
        e.stopPropagation();
        try {
            await api.bildirimOkunduIsaretle(id);
            // Listeyi güncellemeden sadece UI'da değiştir
            setBildirimler(prev => prev.map(b =>
                b._id === id ? { ...b, okundu: true } : b
            ));
            // İstatistik güncelle
            veriYukle();
        } catch (error) {
            console.error('İşlem hatası:', error);
        }
    };

    const sil = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Bildirimi silmek istiyor musunuz?')) return;
        try {
            await api.bildirimSil(id);
            setBildirimler(prev => prev.filter(b => b._id !== id));
            veriYukle();
        } catch (error) {
            console.error('Silme hatası:', error);
        }
    };

    const tumunuOkunduYap = async () => {
        try {
            await api.tumunuOkunduIsaretle();
            veriYukle();
        } catch (error) {
            console.error('Toplu işlem hatası:', error);
        }
    };

    // İkon seçimi
    const getIcon = (tip) => {
        switch (tip) {
            case 'asi': return <FaSyringe style={{ color: '#E91E63' }} />; // Pembe
            case 'dogum': return <FaBaby style={{ color: '#9C27B0' }} />; // Mor
            case 'muayene': return <FaStethoscope style={{ color: '#2196F3' }} />; // Mavi
            case 'sistem': return <FaInfoCircle style={{ color: '#607D8B' }} />; // Gri
            case 'yem': return <FaExclamationTriangle style={{ color: '#FF9800' }} />; // Turuncu
            default: return <FaBell style={{ color: '#4CAF50' }} />; // Yeşil
        }
    };

    const getOncelikColor = (oncelik) => {
        switch (oncelik) {
            case 'yuksek': return '#FFEBEE'; // Kırmızımsı arka plan
            case 'acil': return '#FFCDD2';
            default: return 'white';
        }
    };

    return (
        <div>
            {/* Başlık ve Butonlar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', color: '#2c3e50' }}>🔔 Bildirim Merkezi</h1>
                    <p style={{ margin: 0, color: '#7f8c8d' }}>Çiftliğinizdeki önemli olaylar ve hatırlatmalar</p>
                </div>
                <button
                    onClick={tumunuOkunduYap}
                    style={{
                        backgroundColor: 'white', border: '1px solid #ddd', padding: '10px 20px',
                        borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                        color: '#555', fontWeight: '500'
                    }}
                >
                    <FaCheckDouble /> Tümünü Okundu İşaretle
                </button>
            </div>

            {/* İstatistik Kartları */}
            {istatistikler && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div style={statCardStyle}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Okunmamış</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>{istatistikler.okunmayan}</div>
                    </div>
                    <div style={statCardStyle}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Geciken Görevler</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f44336' }}>{istatistikler.geciken}</div>
                    </div>
                    <div style={statCardStyle}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Tamamlanan</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>{istatistikler.tamamlanan}</div>
                    </div>
                    <div style={statCardStyle}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Toplam</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>{istatistikler.toplam}</div>
                    </div>
                </div>
            )}

            {/* Sekmeler */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '1px' }}>
                {['hepsi', 'okunmamis', 'tamamlanacak'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setAktifTab(tab)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: aktifTab === tab ? '#4CAF50' : 'transparent',
                            color: aktifTab === tab ? 'white' : '#666',
                            border: 'none',
                            borderRadius: '8px 8px 0 0',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            textTransform: 'capitalize'
                        }}
                    >
                        {tab === 'hepsi' ? 'Tüm Bildirimler' : tab === 'okunmamis' ? 'Okunmamış' : 'Yapılacaklar'}
                    </button>
                ))}
            </div>

            {/* Liste */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {yukleniyor ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Yükleniyor...</div>
                ) : bildirimler.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px', color: '#999' }}>
                        <FaBell style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.2 }} />
                        <p>Bildirim bulunamadı.</p>
                    </div>
                ) : (
                    bildirimler.map(b => (
                        <div key={b._id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: getOncelikColor(b.oncelik),
                            padding: '20px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            borderLeft: `5px solid ${b.okundu ? '#ddd' : '#2196F3'}`,
                            opacity: b.okundu ? 0.8 : 1
                        }}>
                            {/* İkon */}
                            <div style={{
                                width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#f0f2f5',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                                marginRight: '20px', flexShrink: 0
                            }}>
                                {getIcon(b.tip)}
                            </div>

                            {/* İçerik */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
                                        {b.baslik}
                                        {b.kupe_no && <span style={{ marginLeft: '10px', fontSize: '12px', padding: '2px 8px', backgroundColor: '#e3f2fd', color: '#2196F3', borderRadius: '10px' }}>{b.kupe_no}</span>}
                                    </h3>
                                    <span style={{ fontSize: '12px', color: '#999' }}>
                                        {new Date(b.hatirlatmaTarihi).toLocaleDateString()}
                                    </span>
                                </div>
                                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{b.mesaj}</p>
                            </div>

                            {/* Aksiyonlar */}
                            <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                                {!b.okundu && (
                                    <button
                                        onClick={(e) => okunduIsaretle(b._id, e)}
                                        title="Okundu İşaretle"
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#2196F3' }}
                                    >
                                        <FaCheck />
                                    </button>
                                )}
                                <button
                                    onClick={(e) => sil(b._id, e)}
                                    title="Sil"
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#f44336' }}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const statCardStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    textAlign: 'center'
};

export default Bildirimler;
