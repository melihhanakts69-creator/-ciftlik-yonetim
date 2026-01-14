import React, { useState } from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { FaBars } from 'react-icons/fa';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #F5F7FA;
  position: relative;
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 260px;
  padding: 30px;
  max-width: calc(100% - 260px);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    margin-left: 0;
    max-width: 100%;
    padding: 15px; /* Mobilde padding biraz azalsın */
  }
`;

const MobileHeader = styled.div`
  display: none;
  padding-bottom: 15px;
  margin-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const HamburgerButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #333;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MobileTitle = styled.h1`
  font-size: 18px;
  margin: 0;
  color: #4CAF50;
  font-weight: bold;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  
  @media (min-width: 769px) {
    display: none; /* Desktopta asla görünmesin */
  }
`;

const Layout = ({ children, onLogout }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <LayoutContainer>
            {/* Mobile Overlay */}
            <Overlay isOpen={isSidebarOpen} onClick={() => setIsSidebarOpen(false)} />

            {/* Sidebar (Responsive Prop ile) */}
            <Sidebar
                onLogout={onLogout}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <MainContent>
                {/* TopBar'a menü açma yetkisi veriyoruz */}
                <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

                <div style={{ flex: 1 }}>
                    {children}
                </div>
            </MainContent>
        </LayoutContainer>
    );
};

export default Layout;
