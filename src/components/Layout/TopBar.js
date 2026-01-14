import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBell, FaUserCircle } from 'react-icons/fa';
import * as api from '../../services/api';

const TopBar = () => {
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchUnreadCount();
        // Poll for new notifications every minute
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.getOkunmayanBildirimler();
            setUnreadCount(res.data.length);
        } catch (error) {
            console.error('Bildirim sayısı alınamadı', error);
        }
    };

    return (
        <div style={{
            height: '80px',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 30px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            marginBottom: '30px',
            borderRadius: '16px'
        }}>
            {/* Arama Barı */}
            <div style={{ position: 'relative', width: '300px' }}>
                <FaSearch style={{ position: 'absolute', left: '15px', top: '14px', color: '#A2A3B7' }} />
                <input
                    type="text"
                    placeholder="Ara..."
                    style={{
                        width: '100%',
                        padding: '12px 12px 12px 45px',
                        backgroundColor: '#F5F7FA',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: '#5E6278',
                        outline: 'none'
                    }}
                />
            </div>

            {/* Sağ Taraf - Aksiyonlar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

                {/* Bildirim Zili */}
                <div
                    onClick={() => navigate('/bildirimler')}
                    style={{ position: 'relative', cursor: 'pointer', padding: '8px' }}
                >
                    <FaBell style={{ fontSize: '20px', color: '#A2A3B7' }} />
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            backgroundColor: '#F1416C',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            height: '16px',
                            minWidth: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            padding: '0 4px'
                        }}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </div>

                {/* Profil */}
                <div
                    onClick={() => navigate('/ayarlar')}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                >
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#3F4254' }}>
                            {user.name || 'Kullanıcı'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#B5B5C3' }}>
                            Yönetici
                        </div>
                    </div>
                    <FaUserCircle style={{ fontSize: '36px', color: '#E1E3EA' }} />
                </div>
            </div>
        </div>
    );
};

export default TopBar;
