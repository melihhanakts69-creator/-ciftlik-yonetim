import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaSave, FaStore } from 'react-icons/fa';
import * as api from '../services/api';

function Ayarlar() {
    const [user, setUser] = useState({
        isim: '',
        email: '',
        isletmeAdi: ''
    });

    const [passwordData, setPasswordData] = useState({
        mevcutSifre: '',
        yeniSifre: '',
        yeniSifreTekrar: ''
    });

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', content: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser) {
                setUser({
                    isim: storedUser.isim || '',
                    email: storedUser.email || '',
                    isletmeAdi: storedUser.isletmeAdi || ''
                });
            }
            // Güncel bilgiyi API'den de çekebiliriz
            const res = await api.getProfile();
            if (res.data.user) {
                setUser({
                    isim: res.data.user.isim || '',
                    email: res.data.user.email || '',
                    isletmeAdi: res.data.user.isletmeAdi || ''
                });
            }
        } catch (error) {
            console.error('Profil yüklenemedi', error);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ type: '', content: '' });

        try {
            const res = await api.updateProfile({
                isim: user.isim,
                email: user.email,
                isletmeAdi: user.isletmeAdi
            });

            // LocalStorage güncelle
            const currentUser = JSON.parse(localStorage.getItem('user'));
            localStorage.setItem('user', JSON.stringify({ ...currentUser, ...res.data.user }));

            setMsg({ type: 'success', content: 'Profil bilgileri güncellendi! Lütfen sayfayı yenileyin.' });

            // Sayfayı yenilemek opsiyonel ama TopBar'daki ismin değişmesi için iyi olur
            setTimeout(() => window.location.reload(), 1500);

        } catch (error) {
            setMsg({ type: 'error', content: error.response?.data?.message || 'Güncelleme başarısız!' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ type: '', content: '' });

        if (passwordData.yeniSifre !== passwordData.yeniSifreTekrar) {
            setMsg({ type: 'error', content: 'Yeni şifreler eşleşmiyor!' });
            setLoading(false);
            return;
        }

        try {
            await api.updateProfile({
                mevcutSifre: passwordData.mevcutSifre,
                yeniSifre: passwordData.yeniSifre
            });

            setMsg({ type: 'success', content: 'Şifreniz başarıyla değiştirildi!' });
            setPasswordData({ mevcutSifre: '', yeniSifre: '', yeniSifreTekrar: '' });
        } catch (error) {
            setMsg({ type: 'error', content: error.response?.data?.message || 'Şifre değiştirilemedi!' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '28px', color: '#2c3e50', marginBottom: '30px' }}>⚙️ Ayarlar</h1>

            {msg.content && (
                <div style={{
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    backgroundColor: msg.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: msg.type === 'success' ? '#155724' : '#721c24'
                }}>
                    {msg.content}
                </div>
            )}

            <div style={{ display: 'grid', gap: '30px' }}>

                {/* Profil Kartı */}
                <div style={cardStyle}>
                    <h2 style={headerStyle}><FaUser style={{ marginRight: '10px' }} /> Profil Bilgileri</h2>
                    <form onSubmit={handleProfileUpdate}>
                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Ad Soyad</label>
                            <input
                                type="text"
                                value={user.isim}
                                onChange={(e) => setUser({ ...user, isim: e.target.value })}
                                style={inputStyle}
                                required
                            />
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>E-posta</label>
                            <input
                                type="email"
                                value={user.email}
                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                                style={inputStyle}
                                required
                            />
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}><FaStore style={{ marginRight: '5px' }} /> Çiftlik / İşletme Adı</label>
                            <input
                                type="text"
                                value={user.isletmeAdi}
                                onChange={(e) => setUser({ ...user, isletmeAdi: e.target.value })}
                                style={inputStyle}
                            />
                        </div>

                        <button type="submit" disabled={loading} style={buttonStyle}>
                            <FaSave style={{ marginRight: '8px' }} /> Kaydet
                        </button>
                    </form>
                </div>

                {/* Şifre Değiştirme Kartı */}
                <div style={cardStyle}>
                    <h2 style={headerStyle}><FaLock style={{ marginRight: '10px' }} /> Şifre Değiştir</h2>
                    <form onSubmit={handlePasswordUpdate}>
                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Mevcut Şifre</label>
                            <input
                                type="password"
                                value={passwordData.mevcutSifre}
                                onChange={(e) => setPasswordData({ ...passwordData, mevcutSifre: e.target.value })}
                                style={inputStyle}
                                required
                            />
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Yeni Şifre</label>
                            <input
                                type="password"
                                value={passwordData.yeniSifre}
                                onChange={(e) => setPasswordData({ ...passwordData, yeniSifre: e.target.value })}
                                style={inputStyle}
                                required
                                minLength="6"
                            />
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Yeni Şifre (Tekrar)</label>
                            <input
                                type="password"
                                value={passwordData.yeniSifreTekrar}
                                onChange={(e) => setPasswordData({ ...passwordData, yeniSifreTekrar: e.target.value })}
                                style={inputStyle}
                                required
                                minLength="6"
                            />
                        </div>

                        <button type="submit" disabled={loading} style={{ ...buttonStyle, backgroundColor: '#6c757d' }}>
                            <FaLock style={{ marginRight: '8px' }} /> Şifreyi Güncelle
                        </button>
                    </form>
                </div>

                {/* Hakkında */}
                <div style={{ textAlign: 'center', color: '#999', fontSize: '14px', marginTop: '20px' }}>
                    <p>Çiftlik Yönetim Sistemi v1.0.0</p>
                    <p>© 2026 Melihhan Aktaş</p>
                </div>

            </div>
        </div>
    );
}

// Stiller
const cardStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
};

const headerStyle = {
    fontSize: '20px',
    marginTop: 0,
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    color: '#34495e'
};

const formGroupStyle = {
    marginBottom: '20px'
};

const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#555'
};

const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px'
};

const buttonStyle = {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
};

export default Ayarlar;
