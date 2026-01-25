import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  padding: 20px;
  text-align: center;
`;

const Icon = styled.div`
  font-size: 120px;
  animation: ${float} 3s ease-in-out infinite;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 72px;
  font-weight: 800;
  background: linear-gradient(135deg, #2e7d32 0%, #81c784 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 10px 0;
`;

const Subtitle = styled.p`
  font-size: 24px;
  color: #666;
  margin: 0 0 30px 0;
`;

const Description = styled.p`
  font-size: 16px;
  color: #888;
  max-width: 400px;
  line-height: 1.6;
  margin-bottom: 40px;
`;

const Button = styled.button`
  padding: 16px 40px;
  background: linear-gradient(135deg, #2e7d32 0%, #43a047 100%);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(46, 125, 50, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(46, 125, 50, 0.4);
  }
`;

const QuickLinks = styled.div`
  margin-top: 40px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
`;

const QuickLink = styled.a`
  padding: 10px 20px;
  background: white;
  border-radius: 20px;
  color: #555;
  text-decoration: none;
  font-size: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
    color: #2e7d32;
    transform: translateY(-2px);
  }
`;

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Container>
            <Icon>🐄</Icon>
            <Title>404</Title>
            <Subtitle>Sayfa Bulunamadı</Subtitle>
            <Description>
                Aradığınız sayfa merada kaybolmuş olabilir.
                Belki başka bir çayırda aramak istersiniz?
            </Description>
            <Button onClick={() => navigate('/')}>
                🏠 Ana Sayfaya Dön
            </Button>
            <QuickLinks>
                <QuickLink href="/inekler">🐄 İnekler</QuickLink>
                <QuickLink href="/buzagilar">🍼 Buzağılar</QuickLink>
                <QuickLink href="/finansal">💰 Finansal</QuickLink>
                <QuickLink href="/yem-merkezi">🌾 Yem Merkezi</QuickLink>
            </QuickLinks>
        </Container>
    );
};

export default NotFound;
