import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { FaHome, FaGlassWhiskey, FaHeartbeat, FaBars, FaLeaf } from 'react-icons/fa';
import { GiCow } from 'react-icons/gi';

const Nav = styled.nav`
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: calc(60px + env(safe-area-inset-bottom, 0));
  padding-bottom: env(safe-area-inset-bottom, 0);
  background: #fff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  z-index: 1000;
`;

const NavItem = styled(NavLink)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  min-height: 60px;
  color: #9ca3af;
  text-decoration: none;
  font-size: 10px;
  font-weight: 500;
  gap: 3px;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.15s;

  &.active { color: #16a34a; }
  svg { font-size: 20px; }
`;

// Ortadaki büyük ana eylem butonu
const CenterBtn = styled.button`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 10px;
  font-weight: 500;
  gap: 3px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  svg { font-size: 20px; }
`;

export default function BottomNav({ onMenuClick }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const rol = user.rol || 'ciftci';

  if (rol === 'veteriner') {
    return (
      <Nav>
        <NavItem to="/" end><FaHome /><span>Ana Sayfa</span></NavItem>
        <NavItem to="/hastalar"><FaHeartbeat /><span>Hastalar</span></NavItem>
        <NavItem to="/takvim"><FaLeaf /><span>Takvim</span></NavItem>
        <CenterBtn onClick={onMenuClick}><FaBars /><span>Menü</span></CenterBtn>
      </Nav>
    );
  }

  if (rol === 'toplayici') {
    return (
      <Nav>
        <NavItem to="/" end><FaHome /><span>Ana Sayfa</span></NavItem>
        <NavItem to="/takvim"><FaLeaf /><span>Takvim</span></NavItem>
        <CenterBtn onClick={onMenuClick}><FaBars /><span>Menü</span></CenterBtn>
      </Nav>
    );
  }

  // Çiftçi ve sütçü
  return (
    <Nav>
      <NavItem to="/" end><FaHome /><span>Ana Sayfa</span></NavItem>
      <NavItem to="/inekler"><GiCow /><span>İnekler</span></NavItem>
      <NavItem to="/sut-kaydi"><FaGlassWhiskey /><span>Süt</span></NavItem>
      <NavItem to="/saglik-merkezi"><FaHeartbeat /><span>Sağlık</span></NavItem>
      <CenterBtn onClick={onMenuClick}><FaBars /><span>Menü</span></CenterBtn>
    </Nav>
  );
}
