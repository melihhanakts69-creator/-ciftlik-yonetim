import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PWAInstallProvider } from './context/PWAInstallContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <PWAInstallProvider>
          <App />
        </PWAInstallProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

serviceWorkerRegistration.register({
  onSuccess: () => console.log('Agrolina PWA yüklendi.'),
  onUpdate: (registration) => {
    if (window.confirm('Yeni sürüm var. Yenilemek ister misiniz?')) {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    }
  },
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

reportWebVitals();
