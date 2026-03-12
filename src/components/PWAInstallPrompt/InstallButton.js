import React from 'react';
import styled from 'styled-components';
import { usePWAInstall } from '../../context/PWAInstallContext';
import { FaDownload } from 'react-icons/fa';

const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  min-height: 44px;
  background: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: #43A047;
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const BtnOutline = styled(Btn)`
  background: transparent;
  color: #4CAF50;
  border: 2px solid #4CAF50;

  &:hover {
    background: rgba(76, 175, 80, 0.1);
  }
`;

/**
 * "Uygulamayı indir" / "Ana ekrana ekle" butonu.
 * canInstall false ise (zaten yüklü veya destek yok) null döner veya disabled gösterir.
 */
export default function InstallButton({ outline, hideWhenCannotInstall, ...props }) {
  const ctx = usePWAInstall();
  if (!ctx) return null;
  const { canInstall, triggerInstall, showInstallBanner, isIOSDevice } = ctx;

  if (hideWhenCannotInstall && !canInstall) return null;

  const handleClick = async () => {
    const triggered = await triggerInstall();
    if (!triggered && canInstall) showInstallBanner();
  };

  const Component = outline ? BtnOutline : Btn;

  return (
    <Component onClick={handleClick} disabled={!canInstall} type="button" {...props}>
      <FaDownload size={18} />
      {isIOSDevice ? 'Ana Ekrana Ekle' : 'Uygulamayı İndir'}
    </Component>
  );
}
