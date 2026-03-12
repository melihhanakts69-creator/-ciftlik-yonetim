import React from 'react';
import styled from 'styled-components';
import { usePWAInstall } from '../../context/PWAInstallContext';

const Banner = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  padding: 16px 20px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0));
  box-shadow: 0 -4px 20px rgba(0,0,0,0.2);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (min-width: 769px) {
    display: none;
  }
`;

const Text = styled.div`
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
`;

const Title = styled.div`
  font-weight: 700;
  color: #4CAF50;
  margin-bottom: 2px;
`;

const Buttons = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const InstallBtn = styled(Button)`
  background: #4CAF50;
  color: #fff;
`;

const DismissBtn = styled(Button)`
  background: rgba(255,255,255,0.15);
  color: #fff;
`;

const IOSHint = styled.div`
  font-size: 12px;
  color: rgba(255,255,255,0.8);
  margin-top: 4px;
`;

export default function PWAInstallPrompt() {
  const ctx = usePWAInstall();
  if (!ctx) return null;
  const { showBanner, dismissBanner, triggerInstall, isIOSDevice, deferredPrompt } = ctx;

  if (!showBanner) return null;

  const handleInstall = async () => {
    await triggerInstall();
  };

  return (
    <Banner>
      <Text>
        <Title>Agrolina'yı yükle</Title>
        Ana ekrana ekleyerek uygulama gibi kullan.
        {isIOSDevice && (
          <IOSHint>Safari'de Paylaş → Ana Ekrana Ekle</IOSHint>
        )}
      </Text>
      <Buttons>
        {!isIOSDevice && deferredPrompt && (
          <InstallBtn onClick={handleInstall}>Yükle</InstallBtn>
        )}
        <DismissBtn onClick={dismissBanner}>Kapat</DismissBtn>
      </Buttons>
    </Banner>
  );
}
