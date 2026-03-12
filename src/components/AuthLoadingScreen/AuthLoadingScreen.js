import React from 'react';
import styled, { keyframes } from 'styled-components';
import logo from '../../logo.png';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const Wrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 24px;
`;

const Logo = styled.img`
  width: 120px;
  height: auto;
  margin-bottom: 24px;
  filter: drop-shadow(0 4px 20px rgba(76, 175, 80, 0.25));
`;

const Text = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
  animation: ${pulse} 1.2s ease-in-out infinite;
`;

/** Uygulama açılışında localStorage kontrol edilirken gösterilir; login sayfası yanıp sönmez. */
export default function AuthLoadingScreen() {
  return (
    <Wrap>
      <Logo src={logo} alt="Agrolina" />
      <Text>Yükleniyor...</Text>
    </Wrap>
  );
}
