import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaLeaf, FaSyringe, FaWallet, FaStethoscope, FaBars, FaGlassWhiskey } from 'react-icons/fa';

const Wrap = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 0;
  pointer-events: none;
  z-index: 999;
  
  @media (min-width: 769px) { display: none; }
`;

const OvalTrack = styled.div`
  position: absolute;
  bottom: calc(16px + env(safe-area-inset-bottom, 0));
  left: 50%;
  transform: translateX(-50%);
  width: min(92%, 340px);
  height: 64px;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 8px;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  border-radius: 32px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04);
`;

const ActionBtn = styled.button`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 4px;
  min-width: 0;
  border: none;
  background: transparent;
  color: #475569;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;

  &:hover, &:active {
    background: rgba(74,222,128,0.15);
    color: #16a34a;
  }

  svg {
    font-size: 18px;
    flex-shrink: 0;
  }
`;

const MenuBtn = styled(ActionBtn)`
  color: #64748b;
  &:hover, &:active { background: #f1f5f9; color: #334155; }
`;

const QuickActionsFAB = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const rol = user.rol || 'ciftci';
  const isCiftci = rol === 'ciftci' || rol === 'sutcu';

  if (!isCiftci) return null;

  const allActions = [
    { id: 'menu', label: 'Menü', icon: <FaBars />, onClick: onMenuClick, isMenu: true },
    { id: 'yem', label: 'Yem', icon: <FaLeaf />, path: '/yem-merkezi', state: { openAdd: true } },
    { id: 'asi', label: 'Aşı', icon: <FaSyringe />, path: '/saglik-merkezi', state: { openTab: 'asilar' } },
    { id: 'masraf', label: 'Masraf', icon: <FaWallet />, path: '/finansal', state: { openAdd: true }, ciftciOnly: true },
    { id: 'veteriner', label: 'Vet', icon: <FaStethoscope />, path: '/saglik-merkezi', state: { openTab: 'veterinerler' } },
    { id: 'sut', label: 'Süt', icon: <FaGlassWhiskey />, path: '/sut-kaydi' },
  ];
  const actions = allActions.filter(a => !a.ciftciOnly || rol === 'ciftci');

  const handleClick = (a) => {
    if (a.isMenu) {
      onMenuClick?.();
      return;
    }
    if (a.path) navigate(a.path, { state: a.state });
  };

  return (
    <Wrap>
      <OvalTrack>
        {actions.map((a) => {
          const Btn = a.isMenu ? MenuBtn : ActionBtn;
          return (
            <Btn key={a.id} onClick={() => handleClick(a)} title={a.label}>
              {a.icon}
              <span>{a.label}</span>
            </Btn>
          );
        })}
      </OvalTrack>
    </Wrap>
  );
};

export default QuickActionsFAB;
