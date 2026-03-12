import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'agrolina_pwa_install_dismissed';

const PWAInstallContext = createContext(null);

export function usePWAInstall() {
  return useContext(PWAInstallContext);
}

function isIOS() {
  return typeof navigator !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export function PWAInstallProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const ios = isIOS();
    setIsIOSDevice(ios);

    if (ios) {
      setShowBanner(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const triggerInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowBanner(false);
      setDeferredPrompt(null);
      return true;
    }
    if (isIOSDevice) {
      setShowBanner(true);
      return true;
    }
    return false;
  }, [deferredPrompt, isIOSDevice]);

  const showInstallBanner = useCallback(() => {
    if (!isStandalone()) setShowBanner(true);
  }, []);

  const dismissBanner = useCallback(() => {
    setShowBanner(false);
    localStorage.setItem(STORAGE_KEY, '1');
  }, []);

  const canInstall = !isStandalone() && (!!deferredPrompt || isIOSDevice);

  const value = {
    canInstall,
    isIOSDevice,
    showBanner,
    showInstallBanner,
    dismissBanner,
    triggerInstall,
    deferredPrompt,
  };

  return (
    <PWAInstallContext.Provider value={value}>
      {children}
    </PWAInstallContext.Provider>
  );
}
