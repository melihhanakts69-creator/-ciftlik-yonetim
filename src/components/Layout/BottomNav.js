import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { FaHome, FaBars, FaGlassWhiskey, FaHeartbeat, FaFileAlt, FaCalendar, FaCog } from 'react-icons/fa';
import { GiCow } from 'react-icons/gi';

const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(56px + env(safe-area-inset-bottom, 0));
  padding-bottom: env(safe-area-inset-bottom, 0);
  background: #fff;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  z-index: 1000;
  /* Sadece mobilde görünür - Layout'ta kontrol ediliyor */
`;

const NavItem = styled(NavLink)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  min-height: 56px;
  color: #6b7280;
  text-decoration: none;
  font-size: 10px;
  font-weight: 500;
  transition: color 0.2s, background 0.2s;
  -webkit-tap-highlight-color: transparent;

  &.active {
    color: #4CAF50;
  }

  svg {
    font-size: 22px;
    margin-bottom: 2px;
  }
`;

const MenuButton = styled.button`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  min-height: 56px;
  min-width: 44px;
  color: #6b7280;
  background: none;
  border: none;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &.active {
    color: #4CAF50;
  }

  svg {
    font-size: 22px;
    margin-bottom: 2px;
  }
`;

function getNavItems(role) {
  if (role === 'veteriner') {
    return [
      { to: '/', label: 'Ana Sayfa', icon: <FaHome /> },
      { to: '/hastalar', label: 'Hastalar', icon: <FaHeartbeat /> },
      { to: '/danismalar', label: 'Danışmalar', icon: <FaFileAlt /> },
      { type: 'menu', label: 'Menü', icon: <FaBars /> },
    ];
  }
  if (role === 'toplayici') {
    return [
      { to: '/', label: 'Ana Sayfa', icon: <FaHome /> },
      { to: '/takvim', label: 'Takvim', icon: <FaCalendar /> },
      { type: 'menu', label: 'Menü', icon: <FaBars /> },
      { to: '/ayarlar', label: 'Ayarlar', icon: <FaCog /> },
    ];
  }
  // Çiftçi ve sütçü
  return [
    { to: '/', label: 'Ana Sayfa', icon: <FaHome /> },
    { to: '/inekler', label: 'İnekler', icon: <GiCow /> },
    { to: '/sut-kaydi', label: 'Süt', icon: <FaGlassWhiskey /> },
    { type: 'menu', label: 'Menü', icon: <FaBars /> },
  ];
}

export default function BottomNav({ onMenuClick }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.rol || 'ciftci';
  const items = getNavItems(role);

  return (
    <Nav role="navigation" aria-label="Mobil ana menü">
      {items.map((item, i) =>
        item.type === 'menu' ? (
          <MenuButton
            key={i}
            type="button"
            onClick={onMenuClick}
            className={undefined}
            aria-label="Menüyü aç"
          >
            {item.icon}
            {item.label}
          </MenuButton>
        ) : (
          <NavItem key={i} to={item.to} end={item.to === '/'}>
            {item.icon}
            {item.label}
          </NavItem>
        )
      )}
    </Nav>
  );
}
