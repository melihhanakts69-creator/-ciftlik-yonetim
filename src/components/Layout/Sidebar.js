import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import {
    FaHome, FaChartPie, FaGlassWhiskey, FaSeedling,
    FaFileAlt, FaBaby, FaVenus, FaMars, FaWarehouse, FaWallet,
    FaSignOutAlt, FaTimes
} from 'react-icons/fa';
import { GiCow } from 'react-icons/gi';

// --- Styled Components ---

const SidebarContainer = styled.div`
  width: 260px;
  background-color: #1E1E2D;
  color: #fff;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  z-index: 1000;
  transition: transform 0.3s ease-in-out;

  /* Mobile Logic */
  @media (max-width: 768px) {
    transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(-100%)')};
    width: 280px; /* Biraz daha geniş olabilir mobilde */
  }
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Brand = styled.h2`
  margin: 0;
  font-size: 20px;
  color: #4CAF50;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  display: none;
  padding: 5px;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MenuArea = styled.div`
  padding: 20px 10px;
  flex: 1;
`;

const FooterArea = styled.div`
  padding: 20px;
  border-top: 1px solid #333;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px;
  background-color: #FF4D4D;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.2s;

  &:hover {
    background-color: #FF3333;
  }
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 12px 15px;
  text-decoration: none;
  color: #A2A3B7;
  border-radius: 8px;
  margin-bottom: 5px;
  font-size: 15px;
  transition: all 0.3s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: #fff;
  }

  &.active {
    background-color: #4CAF50;
    color: #fff;
  }
`;

const IconWrapper = styled.span`
  margin-right: 15px;
  font-size: 18px;
  display: flex;
  align-items: center;
`;

const Sidebar = ({ onLogout, isOpen, onClose }) => {
    const menuItems = [
        { path: '/', name: 'Ana Sayfa', icon: <FaHome /> },
        { path: '/inekler', name: 'İnekler', icon: <GiCow /> },
        { path: '/sut-kaydi', name: 'Süt Kaydı', icon: <FaGlassWhiskey /> },
        { path: '/buzagilar', name: 'Buzağılar', icon: <FaBaby /> },
        { path: '/duveler', name: 'Düveler', icon: <FaVenus /> },
        { path: '/tosunlar', name: 'Tosunlar', icon: <FaMars /> },
        { path: '/yem-deposu', name: 'Yem Deposu', icon: <FaWarehouse /> },
        { path: '/finansal', name: 'Finansal', icon: <FaWallet /> },
        { path: '/raporlar', name: 'Raporlar', icon: <FaFileAlt /> },
    ];

    return (
        <SidebarContainer isOpen={isOpen}>
            <SidebarHeader>
                <Brand>🚜 ÇiftlikMod</Brand>
                <CloseButton onClick={onClose} aria-label="Menüyü Kapat">
                    <FaTimes />
                </CloseButton>
            </SidebarHeader>

            <MenuArea>
                {menuItems.map((item, index) => (
                    <StyledNavLink
                        key={index}
                        to={item.path}
                        onClick={onClose} // Mobilde linke tıklayınca menü kapansın
                    >
                        <IconWrapper>{item.icon}</IconWrapper>
                        {item.name}
                    </StyledNavLink>
                ))}
            </MenuArea>

            <FooterArea>
                <LogoutButton onClick={onLogout}>
                    <FaSignOutAlt style={{ marginRight: '10px' }} /> Çıkış Yap
                </LogoutButton>
            </FooterArea>
        </SidebarContainer>
    );
};

export default Sidebar;
