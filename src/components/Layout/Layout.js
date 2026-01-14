import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = ({ children, onLogout }) => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
            <Sidebar onLogout={onLogout} />
            <div style={{
                flex: 1,
                marginLeft: '260px',
                padding: '30px',
                maxWidth: 'calc(100% - 260px)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <TopBar />
                <div style={{ flex: 1 }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
