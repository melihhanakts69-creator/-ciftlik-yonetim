import React, { useState } from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import PWAInstallPrompt from '../PWAInstallPrompt/PWAInstallPrompt';
import { useIsMobile } from '../../hooks/useMediaQuery';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #F5F7FA;
  position: relative;

  @media (max-width: 768px) {
    padding-top: env(safe-area-inset-top, 0);
    padding-left: env(safe-area-inset-left, 0);
    padding-right: env(safe-area-inset-right, 0);
  }
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 240px;
  padding: 0;
  max-width: calc(100% - 240px);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    margin-left: 0;
    max-width: 100%;
    padding: 0;
    padding-bottom: ${({ $isMobile }) => ($isMobile ? 'calc(70px + env(safe-area-inset-bottom, 0))' : '0')};
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1099;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const Layout = ({ children, onLogout }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isMobile = useIsMobile();

    return (
        <LayoutContainer>
            <Overlay isOpen={isSidebarOpen} onClick={() => setIsSidebarOpen(false)} />

            <Sidebar
                onLogout={onLogout}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <MainContent $isMobile={isMobile}>
                <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

                <div style={{ flex: 1 }}>
                    {children}
                </div>
            </MainContent>

            {isMobile && <BottomNav onMenuClick={() => setIsSidebarOpen(true)} />}
            <PWAInstallPrompt />
        </LayoutContainer>
    );
};

export default Layout;
