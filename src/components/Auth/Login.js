import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { login, register } from '../../services/api';
import logo from '../../agrolina-logo.png';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// Styled Components
const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 50%, #4CAF50 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: ${float} 6s ease-in-out infinite;
  }
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 48px 40px;
  border-radius: 24px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  max-width: 420px;
  width: 90%;
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  z-index: 1;
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Logo = styled.img`
  width: 180px;
  height: auto;
  margin-bottom: 12px;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));
`;

const Tagline = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0;
  font-weight: 500;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 28px;
  background: #f5f5f5;
  border-radius: 12px;
  padding: 4px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${props => props.active ? '#4CAF50' : '#888'};
  box-shadow: ${props => props.active ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'};

  &:hover {
    color: #4CAF50;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 13px;
  color: #444;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  font-size: 15px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: #fafafa;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4CAF50;
    background: white;
    box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.1);
  }

  &::placeholder {
    color: #aaa;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  margin-bottom: 8px;
  animation: ${fadeIn} 0.3s ease;
`;

const SuccessMessage = styled.div`
  background: #e8f5e9;
  color: #2e7d32;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  margin-bottom: 8px;
  animation: ${fadeIn} 0.3s ease;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 16px 0;
  color: #aaa;
  font-size: 12px;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e0e0e0;
  }

  span {
    padding: 0 12px;
  }
`;

function Login({ onLoginSuccess }) {
  const [kayitModu, setKayitModu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setLoading(true);
    setError('');
    try {
      const response = await login({ email: loginEmail, sifre: loginSifre });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
      setTimeout(() => onLoginSuccess(response.data.user), 1000);
    } catch (error) {
      setError(error.response?.data?.message || 'Giriş başarısız! Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
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
      setSuccess('Kayıt başarılı! Hoş geldiniz...');
      setTimeout(() => onLoginSuccess(response.data.user), 1000);
    } catch (error) {
      setError(error.response?.data?.message || 'Kayıt başarısız! Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LogoContainer>
          <Logo src={logo} alt="Agrolina Logo" />
          <Tagline>Akıllı Çiftlik Yönetim Sistemi</Tagline>
        </LogoContainer>

        <TabContainer>
          <Tab active={!kayitModu} onClick={() => { setKayitModu(false); setError(''); }}>
            Giriş Yap
          </Tab>
          <Tab active={kayitModu} onClick={() => { setKayitModu(true); setError(''); }}>
            Kayıt Ol
          </Tab>
        </TabContainer>

        {error && <ErrorMessage>❌ {error}</ErrorMessage>}
        {success && <SuccessMessage>✅ {success}</SuccessMessage>}

        {/* GİRİŞ YAP FORMU */}
        {!kayitModu && (
          <Form onSubmit={handleLogin}>
            <InputGroup>
              <Label>Email</Label>
              <Input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
              />
            </InputGroup>

            <InputGroup>
              <Label>Şifre</Label>
              <Input
                type="password"
                value={loginSifre}
                onChange={(e) => setLoginSifre(e.target.value)}
                placeholder="••••••••"
                required
              />
            </InputGroup>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </SubmitButton>
          </Form>
        )}

        {/* KAYIT OL FORMU */}
        {kayitModu && (
          <Form onSubmit={handleRegister}>
            <InputGroup>
              <Label>İsim Soyisim *</Label>
              <Input
                type="text"
                value={registerIsim}
                onChange={(e) => setRegisterIsim(e.target.value)}
                placeholder="Adınız Soyadınız"
                required
              />
            </InputGroup>

            <InputGroup>
              <Label>Email *</Label>
              <Input
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
              />
            </InputGroup>

            <InputGroup>
              <Label>Şifre *</Label>
              <Input
                type="password"
                value={registerSifre}
                onChange={(e) => setRegisterSifre(e.target.value)}
                placeholder="En az 6 karakter"
                required
                minLength="6"
              />
            </InputGroup>

            <InputGroup>
              <Label>İşletme Adı *</Label>
              <Input
                type="text"
                value={registerIsletme}
                onChange={(e) => setRegisterIsletme(e.target.value)}
                placeholder="Çiftliğinizin adı"
                required
              />
            </InputGroup>

            <InputGroup>
              <Label>Telefon</Label>
              <Input
                type="tel"
                value={registerTelefon}
                onChange={(e) => setRegisterTelefon(e.target.value)}
                placeholder="05XX XXX XX XX"
              />
            </InputGroup>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </SubmitButton>
          </Form>
        )}

        <Divider><span>Agrolina © 2026</span></Divider>
      </LoginCard>
    </LoginContainer>
  );
}

export default Login;