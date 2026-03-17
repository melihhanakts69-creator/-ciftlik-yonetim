import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaHome, FaGlassWhiskey, FaHeartbeat, FaBars, FaLeaf } from 'react-icons/fa';
import { GiCow } from 'react-icons/gi';

const CIFTCI_EYLEMLER = [
  { label: 'Süt Ekle', icon: '🥛', bg: '#dcfce7', color: '#16a34a', path: '/sut-kaydi' },
  { label: 'Aşı Ekle', icon: '💉', bg: '#dbeafe', color: '#2563eb', path: '/saglik-merkezi', state: { openTab: 'asilar' } },
  { label: 'Yem Gir', icon: '🌿', bg: '#fef3c7', color: '#d97706', path: '/yem-merkezi', state: { openAdd: true } },
  { label: 'Masraf', icon: '💰', bg: '#f3e8ff', color: '#7c3aed', path: '/finansal', state: { openAdd: true } },
  { label: 'Doğum', icon: '🐄', bg: '#fce7f3', color: '#db2777', path: '/inekler', state: { openDogum: true } },
  { label: 'Muayene', icon: '🩺', bg: '#e0f2fe', color: '#0284c7', path: '/saglik-merkezi' },
  { label: 'İlaç', icon: '💊', bg: '#fdf4ff', color: '#9333ea', path: '/stok-yonetimi' },
  { label: 'Tohumlama', icon: '🔬', bg: '#ecfdf5', color: '#16a34a', path: '/inekler', state: { openTohumlama: true } },
];

const VET_EYLEMLER = [
  { label: 'Kayıt Ekle', icon: '📋', bg: '#dbeafe', color: '#2563eb', path: '/hastalar', state: { openAdd: true } },
  { label: 'Randevu', icon: '📅', bg: '#fef3c7', color: '#d97706', path: '/takvim', state: { openAdd: true } },
  { label: 'Reçete', icon: '💊', bg: '#fdf4ff', color: '#9333ea', path: '/hastalar', state: { openRecete: true } },
  { label: 'Fatura', icon: '🧾', bg: '#ecfdf5', color: '#16a34a', path: '/finans', state: { openAdd: true } },
];

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 998;
  animation: ${fadeIn} 0.2s ease;
`;

const Tray = styled.div`
  position: fixed;
  bottom: calc(60px + env(safe-area-inset-bottom, 0));
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 20px 20px 0 0;
  border-top: 1px solid #e5e7eb;
  padding: 16px 16px 8px;
  z-index: 999;
  animation: ${slideUp} 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
`;

const TrayHandle = styled.div`
  width: 36px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  margin: 0 auto 16px;
`;

const TrayTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
`;

const TrayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`;

const TrayBtn = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: 14px;
  border: 1px solid #f3f4f6;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
  &:active { transform: scale(0.93); background: #f3f4f6; }
`;

const TrayIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: ${p => p.$bg || '#f3f4f6'};
`;

const TrayLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: #374151;
  text-align: center;
  line-height: 1.2;
`;

const HizliBtn = styled.button`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  gap: 3px;
  border: none;
  background: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  .inner {
    width: 38px;
    height: 28px;
    border-radius: 20px;
    background: ${p => p.$open ? '#dc2626' : '#16a34a'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: white;
    transition: background 0.2s;
  }

  span {
    font-size: 10px;
    font-weight: 600;
    color: ${p => p.$open ? '#dc2626' : '#16a34a'};
  }

  &:active .inner { transform: scale(0.9); }
`;

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
  const navigate = useNavigate();
  const [trayAcik, setTrayAcik] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const rol = user.rol || 'ciftci';

  const eylemler = rol === 'veteriner' ? VET_EYLEMLER : CIFTCI_EYLEMLER;

  const handleEylem = (eylem) => {
    setTrayAcik(false);
    setTimeout(() => {
      navigate(eylem.path, { state: eylem.state });
    }, 150);
  };

  if (rol === 'veteriner') {
    return (
      <>
        {trayAcik && <Overlay onClick={() => setTrayAcik(false)} />}
        {trayAcik && (
          <Tray>
            <TrayHandle />
            <TrayTitle>Hızlı İşlem</TrayTitle>
            <TrayGrid>
              {eylemler.map((e, i) => (
                <TrayBtn key={i} onClick={() => handleEylem(e)}>
                  <TrayIcon $bg={e.bg}>{e.icon}</TrayIcon>
                  <TrayLabel>{e.label}</TrayLabel>
                </TrayBtn>
              ))}
            </TrayGrid>
          </Tray>
        )}
        <Nav>
          <NavItem to="/" end><FaHome /><span>Ana Sayfa</span></NavItem>
          <NavItem to="/hastalar"><FaHeartbeat /><span>Hastalar</span></NavItem>
          <NavItem to="/takvim"><FaLeaf /><span>Takvim</span></NavItem>
          <CenterBtn onClick={onMenuClick}><FaBars /><span>Menü</span></CenterBtn>
          <HizliBtn $open={trayAcik} onClick={() => setTrayAcik(p => !p)} aria-label="Hızlı işlemler">
            <div className="inner">{trayAcik ? '✕' : '⚡'}</div>
            <span>{trayAcik ? 'Kapat' : 'Hızlı'}</span>
          </HizliBtn>
        </Nav>
      </>
    );
  }

  if (rol === 'toplayici') {
    return (
      <>
        {trayAcik && <Overlay onClick={() => setTrayAcik(false)} />}
        {trayAcik && (
          <Tray>
            <TrayHandle />
            <TrayTitle>Hızlı İşlem</TrayTitle>
            <TrayGrid>
              {eylemler.map((e, i) => (
                <TrayBtn key={i} onClick={() => handleEylem(e)}>
                  <TrayIcon $bg={e.bg}>{e.icon}</TrayIcon>
                  <TrayLabel>{e.label}</TrayLabel>
                </TrayBtn>
              ))}
            </TrayGrid>
          </Tray>
        )}
        <Nav>
          <NavItem to="/" end><FaHome /><span>Ana Sayfa</span></NavItem>
          <NavItem to="/takvim"><FaLeaf /><span>Takvim</span></NavItem>
          <CenterBtn onClick={onMenuClick}><FaBars /><span>Menü</span></CenterBtn>
          <HizliBtn $open={trayAcik} onClick={() => setTrayAcik(p => !p)} aria-label="Hızlı işlemler">
            <div className="inner">{trayAcik ? '✕' : '⚡'}</div>
            <span>{trayAcik ? 'Kapat' : 'Hızlı'}</span>
          </HizliBtn>
        </Nav>
      </>
    );
  }

  // Çiftçi ve sütçü
  return (
    <>
      {trayAcik && <Overlay onClick={() => setTrayAcik(false)} />}
      {trayAcik && (
        <Tray>
          <TrayHandle />
          <TrayTitle>Hızlı İşlem</TrayTitle>
          <TrayGrid>
            {eylemler.map((e, i) => (
              <TrayBtn key={i} onClick={() => handleEylem(e)}>
                <TrayIcon $bg={e.bg}>{e.icon}</TrayIcon>
                <TrayLabel>{e.label}</TrayLabel>
              </TrayBtn>
            ))}
          </TrayGrid>
        </Tray>
      )}
      <Nav>
        <NavItem to="/" end><FaHome /><span>Ana Sayfa</span></NavItem>
        <NavItem to="/inekler"><GiCow /><span>İnekler</span></NavItem>
        <NavItem to="/sut-kaydi"><FaGlassWhiskey /><span>Süt</span></NavItem>
        <NavItem to="/saglik-merkezi"><FaHeartbeat /><span>Sağlık</span></NavItem>
        <CenterBtn onClick={onMenuClick}><FaBars /><span>Menü</span></CenterBtn>
        <HizliBtn $open={trayAcik} onClick={() => setTrayAcik(p => !p)} aria-label="Hızlı işlemler">
          <div className="inner">{trayAcik ? '✕' : '⚡'}</div>
          <span>{trayAcik ? 'Kapat' : 'Hızlı'}</span>
        </HizliBtn>
      </Nav>
    </>
  );
}
