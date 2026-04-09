import React from 'react';
import styled, { keyframes } from 'styled-components';
import * as Icons from 'react-icons/fi';
import { FiX, FiInfo } from 'react-icons/fi';

const fadeIn = keyframes`
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(4px); }
`;

const slideUp = keyframes`
  from { transform: translateY(20px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ${fadeIn} 0.3s ease forwards;
`;

const ModalContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  width: 100%;
  max-width: 520px;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.5) inset;
  overflow: hidden;
  animation: ${slideUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
`;

const Header = styled.div`
  padding: 24px 24px 20px;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==') repeat;
    opacity: 0.5;
  }
`;

const HeaderText = styled.div`
  position: relative;
  color: white;
  
  display: flex;
  align-items: center;
  gap: 12px;

  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  .icon-wrap {
    width: 44px;
    height: 44px;
    background: rgba(255,255,255,0.2);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    border: 1px solid rgba(255,255,255,0.3);
  }
`;

const CloseButton = styled.button`
  background: rgba(255,255,255,0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  
  &:hover {
    background: rgba(255,255,255,0.3);
    transform: rotate(90deg);
  }
`;

const Body = styled.div`
  padding: 24px;
  overflow-y: auto;
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

const DescText = styled.p`
  margin: 0 0 24px 0;
  font-size: 15px;
  color: #475569;
  line-height: 1.6;
`;

const SectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionItem = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  transition: all 0.2s;
  
  &:hover {
    background: white;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
    border-color: #cbd5e1;
    transform: translateY(-2px);
  }

  .s-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #eff6ff;
    color: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }

  .s-content {
    h4 {
      margin: 0 0 6px 0;
      color: #0f172a;
      font-size: 15px;
      font-weight: 700;
    }
    p {
      margin: 0;
      color: #64748b;
      font-size: 13px;
      line-height: 1.5;
    }
  }
`;

const Footer = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
`;

const OkButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
  
  &:hover {
    background: #2563eb;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    transform: translateY(-1px);
  }
`;

const getIcon = (iconName) => {
  const IconCmp = Icons[iconName] || Icons.FiInfo;
  return <IconCmp />;
};

export default function PageGuideModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <Header>
          <HeaderText>
            <div className="icon-wrap">
              <FiInfo />
            </div>
            <h2>{data.title}</h2>
          </HeaderText>
          <CloseButton onClick={onClose}><FiX size={20} /></CloseButton>
        </Header>
        
        <Body>
          {data.description && <DescText>{data.description}</DescText>}
          
          <SectionList>
            {(data.sections || []).map((sec, i) => (
              <SectionItem key={i}>
                <div className="s-icon">
                  {getIcon(sec.icon)}
                </div>
                <div className="s-content">
                  <h4>{sec.subtitle}</h4>
                  <p>{sec.text}</p>
                </div>
              </SectionItem>
            ))}
          </SectionList>
        </Body>
        
        <Footer>
          <OkButton onClick={onClose}>Anladım</OkButton>
        </Footer>
      </ModalContainer>
    </Overlay>
  );
}
