import { useState } from 'react';
import { login, register } from '../../services/api';

function Login({ onLoginSuccess }) {
  const [kayitModu, setKayitModu] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSifre, setLoginSifre] = useState('');
  
  // Register state
  const [registerIsim, setRegisterIsim] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerSifre, setRegisterSifre] = useState('');
  const [registerIsletme, setRegisterIsletme] = useState('');
  const [registerTelefon, setRegisterTelefon] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ email: loginEmail, sifre: loginSifre });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      alert('✅ Giriş başarılı!');
      onLoginSuccess(response.data.user);
    } catch (error) {
      alert('❌ ' + (error.response?.data?.message || 'Giriş başarısız!'));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await register({
        isim: registerIsim,
        email: registerEmail,
        sifre: registerSifre,
        isletmeAdi: registerIsletme,
        telefon: registerTelefon
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      alert('✅ Kayıt başarılı!');
      onLoginSuccess(response.data.user);
    } catch (error) {
      alert('❌ ' + (error.response?.data?.message || 'Kayıt başarısız!'));
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f0f0'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#4CAF50' }}>
          🐄 Çiftlik Yönetim
        </h1>

        {/* Mod Değiştir */}
        <div style={{ 
          display: 'flex', 
          marginBottom: '20px',
          borderBottom: '2px solid #f0f0f0'
        }}>
          <button
            onClick={() => setKayitModu(false)}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: !kayitModu ? '3px solid #4CAF50' : 'none',
              fontWeight: !kayitModu ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Giriş Yap
          </button>
          <button
            onClick={() => setKayitModu(true)}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: kayitModu ? '3px solid #4CAF50' : 'none',
              fontWeight: kayitModu ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Kayıt Ol
          </button>
        </div>

        {/* GİRİŞ YAP FORMU */}
        {!kayitModu && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Email:
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Şifre:
              </label>
              <input
                type="password"
                value={loginSifre}
                onChange={(e) => setLoginSifre(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Giriş Yap
            </button>
          </form>
        )}

        {/* KAYIT OL FORMU */}
        {kayitModu && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                İsim Soyisim: *
              </label>
              <input
                type="text"
                value={registerIsim}
                onChange={(e) => setRegisterIsim(e.target.value)}
                placeholder="Melih Yılmaz"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Email: *
              </label>
              <input
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Şifre: *
              </label>
              <input
                type="password"
                value={registerSifre}
                onChange={(e) => setRegisterSifre(e.target.value)}
                placeholder="••••••••"
                required
                minLength="6"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                İşletme Adı: *
              </label>
              <input
                type="text"
                value={registerIsletme}
                onChange={(e) => setRegisterIsletme(e.target.value)}
                placeholder="Yılmaz Çiftliği"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Telefon:
              </label>
              <input
                type="tel"
                value={registerTelefon}
                onChange={(e) => setRegisterTelefon(e.target.value)}
                placeholder="05XX XXX XX XX"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Kayıt Ol
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;