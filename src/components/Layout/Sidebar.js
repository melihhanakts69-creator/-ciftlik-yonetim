import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import {
  FaHome, FaChartPie, FaGlassWhiskey, FaSeedling,
  FaFileAlt, FaBaby, FaVenus, FaMars, FaWarehouse, FaWallet,
  FaSignOutAlt, FaTimes, FaCog
} from 'react-icons/fa';
import { GiCow } from 'react-icons/gi';
import logo from '../../agrolina-logo.png';

// --- Styled Components ---

const SidebarContainer = styled.div`
  width: 260px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0,0,0,0.2);
  z-index: 1000;
  transition: transform 0.3s ease-in-out;

  /* Mobile Logic */
  @media (max-width: 768px) {
    transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(-100%)')};
    width: 280px;
  }
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0,0,0,0.2);
`;

const BrandContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoImage = styled.img`
  width: 55px;
  height: 55px;
  border-radius: 12px;
  object-fit: contain;
  background: white;
  padding: 3px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
`;

const BrandText = styled.div`
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #4CAF50;
    letter-spacing: 0.5px;
  }
  span {
    font-size: 10px;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
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
  padding: 20px 12px;
  flex: 1;
`;

const MenuSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #666;
  padding: 8px 15px;
  margin-bottom: 8px;
`;

const FooterArea = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.2);
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);
  }
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 12px 15px;
  text-decoration: none;
  color: #a8a8b3;
  border-radius: 10px;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(76, 175, 80, 0.1);
    color: #fff;
    transform: translateX(4px);
  }

  &.active {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: #fff;
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  }
`;

const IconWrapper = styled.span`
  margin-right: 12px;
  font-size: 16px;
  display: flex;
  align-items: center;
  width: 20px;
  justify-content: center;
`;

const Sidebar = ({ onLogout, isOpen, onClose }) => {
  const menuItems = [
    { path: '/', name: 'Ana Sayfa', icon: <FaHome /> },
    { path: '/inekler', name: 'İnekler', icon: <GiCow /> },
    { path: '/sut-kaydi', name: 'Süt Kaydı', icon: <FaGlassWhiskey /> },
    { path: '/buzagilar', name: 'Buzağılar', icon: <FaBaby /> },
    { path: '/duveler', name: 'Düveler', icon: <FaVenus /> },
    { path: '/tosunlar', name: 'Tosunlar', icon: <FaMars /> },
  ];

  const yonetimItems = [
    { path: '/yem-merkezi', name: 'Yem Merkezi', icon: <FaSeedling /> },
    { path: '/finansal', name: 'Finansal', icon: <FaWallet /> },
    { path: '/raporlar', name: 'Raporlar', icon: <FaFileAlt /> },
    { path: '/ayarlar', name: 'Ayarlar', icon: <FaCog /> },
  ];

  return (
    <SidebarContainer isOpen={isOpen}>
      <SidebarHeader>
        <BrandContainer>
          <LogoImage src={logo} alt="Agrolina" />
          <BrandText>
            <h2>Agrolina</h2>
            <span>Çiftlik Yönetimi</span>
          </BrandText>
        </BrandContainer>
        <CloseButton onClick={onClose} aria-label="Menüyü Kapat">
          <FaTimes />
        </CloseButton>
      </SidebarHeader>

      <MenuArea>
        <MenuSection>
          <SectionTitle>Hayvanlar</SectionTitle>
          {menuItems.map((item, index) => (
            <StyledNavLink
              key={index}
              to={item.path}
              onClick={onClose}
            >
              <IconWrapper>{item.icon}</IconWrapper>
              {item.name}
            </StyledNavLink>
          ))}
        </MenuSection>

        <MenuSection>
          <SectionTitle>Yönetim</SectionTitle>
          {yonetimItems.map((item, index) => (
            <StyledNavLink
              key={index}
              to={item.path}
              onClick={onClose}
            >
              <IconWrapper>{item.icon}</IconWrapper>
              {item.name}
            </StyledNavLink>
          ))}
        </MenuSection>
      </MenuArea>

      <FooterArea>
        <LogoutButton onClick={onLogout}>
          <FaSignOutAlt /> Çıkış Yap
        </LogoutButton>
      </FooterArea>
    </SidebarContainer>
  );
};

export default Sidebar;
