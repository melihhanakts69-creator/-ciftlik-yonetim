import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    FaHome, FaChartPie, FaGlassWhiskey, FaSeedling,
    FaFileAlt, FaBaby, FaVenus, FaMars, FaWarehouse, FaWallet,
    FaSignOutAlt
} from 'react-icons/fa';
import { GiCow } from 'react-icons/gi';

const Sidebar = ({ onLogout }) => {
    const menuItems = [
        { path: '/', name: 'Ana Sayfa', icon: <FaHome /> },

        { path: '/inekler', name: 'İnekler', icon: <GiCow /> },
        { path: '/sut-kaydi', name: 'Süt Kaydı', icon: <FaGlassWhiskey /> },

        { path: '/raporlar', name: 'Raporlar', icon: <FaFileAlt /> },
        { path: '/buzagilar', name: 'Buzağılar', icon: <FaBaby /> },
        { path: '/duveler', name: 'Düveler', icon: <FaVenus /> },
        { path: '/tosunlar', name: 'Tosunlar', icon: <FaMars /> },
        { path: '/yem-deposu', name: 'Yem Deposu', icon: <FaWarehouse /> },
        { path: '/finansal', name: 'Finansal', icon: <FaWallet /> },
    ];

    return (
        <div style={{
            width: '260px',
            backgroundColor: '#1E1E2D',
            color: '#fff',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
        }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #333' }}>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#4CAF50', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    🚜 ÇiftlikMod
                </h2>
            </div>

            <div style={{ padding: '20px 10px', flex: 1 }}>
                {menuItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 15px',
                            textDecoration: 'none',
                            color: isActive ? '#fff' : '#A2A3B7',
                            backgroundColor: isActive ? '#4CAF50' : 'transparent',
                            borderRadius: '8px',
                            marginBottom: '5px',
                            fontSize: '15px',
                            transition: 'all 0.3s'
                        })}
                    >
                        <span style={{ marginRight: '15px', fontSize: '18px' }}>{item.icon}</span>
                        {item.name}
                    </NavLink>
                ))}
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid #333' }}>
                <button
                    onClick={onLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#FF4D4D',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '15px'
                    }}
                >
                    <FaSignOutAlt style={{ marginRight: '10px' }} /> Çıkış Yap
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
