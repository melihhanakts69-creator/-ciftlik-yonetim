import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import {
  FaHome, FaChartPie, FaGlassWhiskey, FaSeedling,
  FaFileAlt, FaBaby, FaVenus, FaMars, FaWarehouse, FaWallet,
  FaSignOutAlt, FaTimes, FaCog, FaBell, FaMoon, FaSun, FaHeartbeat, FaCalendar
} from 'react-icons/fa';
import { GiCow } from 'react-icons/gi';
import logo from '../../logo.png';
import * as api from '../../services/api';
import InstallButton from '../PWAInstallPrompt/InstallButton';

// --- Styled Components ---

const SidebarContainer = styled.div`
  width: 240px;
  background: #18181b;
  color: #fff;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #27272a;
  z-index: 1000;
  transition: transform 0.3s ease-in-out;

  @media (max-width: 768px) {
    transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(-100%)')};
    width: 260px;
    z-index: 1100;
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
  width: 60px;
  height: 60px;
  border-radius: 12px;
  object-fit: contain;
  background: #f4f4f5;
  padding: 4px;
  border: 1px solid #27272a;
`;

const BrandText = styled.div`
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.5px;
  }
  span {
    font-size: 10px;
    color: #71717a;
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
  overflow-y: auto;
  overscroll-behavior: contain;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
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
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.15s;
  gap: 8px;

  &:hover {
    background: #dc2626;
  }
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 9px 12px;
  text-decoration: none;
  color: #71717a;
  border-radius: 8px;
  margin-bottom: 2px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #d4d4d8;
  }

  &.active {
    background: #16a34a;
    color: #fff;
    font-weight: 600;
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
  const [okunmamisSayisi, setOkunmamisSayisi] = useState(0);
  const [abonelik, setAbonelik] = useState(null);

  // Okunmamış bildirim sayısı — /ozet/istatistik ile DB'de sayıyor (limit bypass)
  useEffect(() => {
    const fetchOkunmamis = async () => {
      try {
        const res = await api.getBildirimIstatistikleri();
        setOkunmamisSayisi(res.data?.okunmayan ?? 0);
      } catch (e) {
        console.log('Bildirim sayısı alınamadı');
      }
    };
    fetchOkunmamis();
    const interval = setInterval(fetchOkunmamis, 60000);
    return () => clearInterval(interval);
  }, []);

  // Abonelik durumunu çek
  useEffect(() => {
    api.getAbonelik().then(r => setAbonelik(r.data)).catch(() => {});
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.rol || 'ciftci';
  const ciftlikAdi = user.isletmeAdi || 'Agrolina';

  let menuItems = [];
  let yonetimItems = [];

  if (role === 'veteriner') {
    menuItems = [
      { path: '/', name: 'Ana Sayfa', icon: <FaHome /> },
      { path: '/hastalar', name: 'Hastalar', icon: <FaHeartbeat /> },
      { path: '/danismalar', name: 'Danışmalar', icon: <FaFileAlt /> },
      { path: '/finans', name: 'Fatura & Tahsilat', icon: <FaWallet /> },
      { path: '/receteler', name: 'Reçete & Stok', icon: <FaWarehouse /> },
      { path: '/takvim', name: 'Takvim', icon: <FaCalendar /> },
      { path: '/rapor', name: 'Aylık Rapor', icon: <FaChartPie /> },
    ];
    yonetimItems = [
      { path: '/bildirimler', name: 'Bildirimler', icon: <FaBell />, badge: okunmamisSayisi },
      { path: '/ayarlar', name: 'Profilim', icon: <FaCog /> },
    ];
  } else if (role === 'sutcu') {
    // İşçi (sub-account of çiftçi) — çiftçi verilerine erişir ama finansal/ayarları görmez
    menuItems = [
      { path: '/', name: 'Ana Sayfa', icon: <FaHome /> },
      { path: '/takvim', name: 'Takvim', icon: <FaCalendar /> },
      { path: '/inekler', name: 'İnekler', icon: <GiCow /> },
      { path: '/sut-kaydi', name: 'Süt Kaydı', icon: <FaGlassWhiskey /> },
      { path: '/buzagilar', name: 'Buzağılar', icon: <FaBaby /> },
      { path: '/duveler', name: 'Düveler', icon: <FaVenus /> },
      { path: '/tosunlar', name: 'Tosunlar', icon: <FaMars /> },
    ];
    yonetimItems = [
      { path: '/yem-merkezi', name: 'Yem & Stok', icon: <FaSeedling /> },
      { path: '/saglik-merkezi', name: 'Sağlık Merkezi', icon: <FaHeartbeat /> },
      { path: '/bildirimler', name: 'Bildirimler', icon: <FaBell />, badge: okunmamisSayisi },
      { path: '/ayarlar', name: 'Profilim', icon: <FaCog /> },
    ];
  } else if (role === 'toplayici') {
    menuItems = [
      { path: '/', name: 'Ana Sayfa', icon: <FaHome /> },
    ];
    yonetimItems = [
      { path: '/bildirimler', name: 'Bildirimler', icon: <FaBell />, badge: okunmamisSayisi },
      { path: '/ayarlar', name: 'Profilim', icon: <FaCog /> },
    ];
  } else {
    // Çiftçi (Ana Patron)
    menuItems = [
      { path: '/', name: 'Ana Sayfa', icon: <FaHome /> },
      { path: '/takvim', name: 'Takvim', icon: <FaCalendar /> },
      { path: '/inekler', name: 'İnekler', icon: <GiCow /> },
      { path: '/sut-kaydi', name: 'Süt Kaydı', icon: <FaGlassWhiskey /> },
      { path: '/buzagilar', name: 'Buzağılar', icon: <FaBaby /> },
      { path: '/duveler', name: 'Düveler', icon: <FaVenus /> },
      { path: '/tosunlar', name: 'Tosunlar', icon: <FaMars /> },
    ];
    yonetimItems = [
      { path: '/yem-merkezi', name: 'Yem & Stok', icon: <FaSeedling /> },
      { path: '/saglik-merkezi', name: 'Sağlık Merkezi', icon: <FaHeartbeat /> },
      { path: '/finansal', name: 'Finansal', icon: <FaWallet /> },
      { path: '/karlilik', name: 'Karlılık Analizi', icon: <FaChartPie /> },
      { path: '/bildirimler', name: 'Bildirimler', icon: <FaBell />, badge: okunmamisSayisi },
      { path: '/raporlar', name: 'Raporlar', icon: <FaFileAlt /> },
      { path: '/ayarlar', name: 'Ayarlar', icon: <FaCog /> },
    ];
  }

  return (
    <SidebarContainer isOpen={isOpen}>
      <SidebarHeader>
        <BrandContainer>
          <LogoImage src={user.logoUrl || logo} alt="Logo" />
          <BrandText>
            <h2>{ciftlikAdi}</h2>
            <span>Agrolina Çiftlik Y.</span>
          </BrandText>
        </BrandContainer>
        <CloseButton onClick={onClose} aria-label="Menüyü Kapat">
          <FaTimes />
        </CloseButton>
      </SidebarHeader>

      <MenuArea>
        <MenuSection>
          <SectionTitle>
            {role === 'veteriner' ? 'Klinik' : role === 'toplayici' ? 'Toplama' : 'Çiftlik'}
          </SectionTitle>
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
              style={{ position: 'relative' }}
            >
              <IconWrapper>{item.icon}</IconWrapper>
              {item.name}
              {item.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  right: '15px',
                  background: '#f44336',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  minWidth: '20px',
                  textAlign: 'center'
                }}>
                  {item.badge}
                </span>
              )}
            </StyledNavLink>
          ))}
        </MenuSection>
      </MenuArea>

      <FooterArea>
        <InstallButton outline hideWhenCannotInstall style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }} />
        {abonelik && (
          abonelik.plan === 'trial' && abonelik.trialKalanGun <= 7 ? (
            <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '8px 10px', marginBottom: 10, fontSize: 11, color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
              onClick={() => window.location.href = '/abonelik'}>
              ⏳ Deneme: {abonelik.trialKalanGun} gün kaldı → Plan seç
            </div>
          ) : !abonelik.aktif ? (
            <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 10px', marginBottom: 10, fontSize: 11, color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => window.location.href = '/abonelik'}>
              ❌ Abonelik süresi doldu → Yenile
            </div>
          ) : null
        )}
        <LogoutButton onClick={onLogout}>
          <FaSignOutAlt /> Çıkış Yap
        </LogoutButton>
      </FooterArea>
    </SidebarContainer>
  );
};

export default Sidebar;
