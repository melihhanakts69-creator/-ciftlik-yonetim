import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';

import IneklerPage from './pages/Inekler';
import Buzagilar from './components/Buzagilar';
import Duveler from './pages/Duveler';
import Tosunlar from './components/Tosunlar';
import SutKaydiPage from './pages/SutKaydi';
import Finansal from './components/Finansal';
import InekDetay from './pages/InekDetay';
import Ayarlar from './pages/Ayarlar';
import DuveDetay from './pages/DuveDetay';
import TosunDetay from './pages/TosunDetay';
import BuzagiDetay from './pages/BuzagiDetay';
import Bildirimler from './pages/Bildirimler';
import Aktiviteler from './pages/Aktiviteler';
import Raporlar from './pages/Raporlar';
import YemMerkezi from './pages/YemMerkezi';
import SaglikMerkezi from './pages/SaglikMerkezi';
import Takvim from './pages/Takvim';
import StokYonetimi from './pages/StokYonetimi';
import NotFound from './pages/NotFound';
import AdminPanel from './pages/AdminPanel';

function App() {
  const [girisYapildi, setGirisYapildi] = useState(false);
  const [kullanici, setKullanici] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setGirisYapildi(true);
      setKullanici(JSON.parse(user));
    }
  }, []);

  const navigate = useNavigate();

  const handleLoginSuccess = (user) => {
    setGirisYapildi(true);
    setKullanici(user);
    localStorage.setItem('user', JSON.stringify(user));
    navigate('/', { replace: true });
  };

  const handleLogout = () => {
    import('./services/api').then(({ logout }) => logout()).catch(() => { });
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setGirisYapildi(false);
    setKullanici(null);
  };

  // Admin panel her zaman Layout olmadan full-screen açılır
  if (location.pathname === '/admin') {
    return <AdminPanel />;
  }

  if (!girisYapildi) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Home kullanici={kullanici} />} />
          <Route path="/inekler" element={<IneklerPage />} />
          <Route path="/ayarlar" element={<Ayarlar />} />
          <Route path="/buzagilar" element={<Buzagilar />} />
          <Route path="/duveler" element={<Duveler />} />
          <Route path="/tosunlar" element={<Tosunlar />} />
          <Route path="/sut-kaydi" element={<SutKaydiPage />} />
          <Route path="/inek-detay/:id" element={<InekDetay />} />
          <Route path="/duve-detay/:id" element={<DuveDetay />} />
          <Route path="/tosun-detay/:id" element={<TosunDetay />} />
          <Route path="/buzagi-detay/:id" element={<BuzagiDetay />} />
          <Route path="/finansal" element={<Finansal />} />
          <Route path="/bildirimler" element={<Bildirimler />} />
          <Route path="/aktiviteler" element={<Aktiviteler />} />
          <Route path="/raporlar" element={<Raporlar />} />
          <Route path="/yem-merkezi" element={<YemMerkezi />} />
          <Route path="/saglik-merkezi" element={<SaglikMerkezi />} />
          <Route path="/takvim" element={<Takvim />} />
          <Route path="/stok-yonetimi" element={<StokYonetimi />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;