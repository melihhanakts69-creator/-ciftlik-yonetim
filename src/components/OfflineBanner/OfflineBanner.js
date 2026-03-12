import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Banner = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top, 0));
  background: #f59e0b;
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  z-index: 1101;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
`;

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isOnline) {
      document.body.style.paddingTop = '';
    } else {
      document.body.style.paddingTop = '52px';
    }
    return () => { document.body.style.paddingTop = ''; };
  }, [isOnline]);

  if (isOnline) return null;

  return (
    <Banner role="alert">
      Çevrimdışısınız. Bazı özellikler kısıtlı olabilir.
    </Banner>
  );
}
