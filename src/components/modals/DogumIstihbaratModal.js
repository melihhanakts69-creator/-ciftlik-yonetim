import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FiX, FiCheckCircle, FiAlertTriangle, FiDroplet, FiHeart, FiShield } from 'react-icons/fi';

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
  background: rgba(15, 23, 42, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ${fadeIn} 0.3s ease forwards;
`;

const ModalContainer = styled.div`
  background: white;
  width: 100%;
  max-width: 550px;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  animation: ${slideUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 24px;
  background: #fffbfa;
  border-bottom: 1px solid #fee2e2;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const HeaderText = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    color: #991b1b;
  }

  .icon-wrap {
    width: 44px;
    height: 44px;
    background: #fef2f2;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #dc2626;
  }
`;

const Body = styled.div`
  padding: 24px;
  background: #ffffff;
`;

const AlertBox = styled.div`
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  p {
    margin: 0;
    color: #7f1d1d;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.5;
  }
`;

const CardGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TaskCard = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;

  .icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }

  .content {
    h4 {
      margin: 0 0 4px 0;
      color: #0f172a;
      font-size: 15px;
      font-weight: 700;
    }
    p {
      margin: 0;
      color: #475569;
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
  gap: 12px;
`;

const ActionButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);
  
  &:hover {
    background: #dc2626;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    transform: translateY(-1px);
  }
`;

export default function DogumIstihbaratModal({ isOpen, onClose, onAcknowledge }) {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <Header>
          <HeaderText>
            <div className="icon-wrap">
              <FiAlertTriangle />
            </div>
            <h2>Doğum Sonrası Acil İşlemler</h2>
          </HeaderText>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
            <FiX size={24} />
          </button>
        </Header>
        
        <Body>
          <AlertBox>
            <p>Doğum başarıyla gerçekleşti! Ancak sağlıklı bir yavru gelişimi ve anne ineğin toparlanması için aşağıdaki adımları derhal uygulamalısınız. (Bu adımlar Yapılacaklar listenize otomatik eklenecektir.)</p>
          </AlertBox>

          <CardGrid>
            <TaskCard>
              <div className="icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <FiDroplet />
              </div>
              <div className="content">
                <h4>1. Ağız Sütü (Kolostrum) İçirin</h4>
                <p>Doğar doğmaz ilk 2 saat içinde buzağıya mutlaka en az 2-3 Litre ağız sütü içirilmelidir. Bu, bağışıklık sisteminin kurulması için hayati önem taşır.</p>
              </div>
            </TaskCard>
            
            <TaskCard>
              <div className="icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                <FiShield />
              </div>
              <div className="content">
                <h4>2. Göbek Kordonu İyotlaması</h4>
                <p>Buzağının göbek bağını %7'lik iyot solüsyonu ile bolca dezenfekte edin. Enfeksiyonların yavruya girmesini önleyen en kritik bariyerdir.</p>
              </div>
            </TaskCard>

            <TaskCard>
              <div className="icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <FiHeart />
              </div>
              <div className="content">
                <h4>3. Septisemi ve İlk Aşılar</h4>
                <p>Eğer sürünüzde septisemi (E. coli) gibi riskler varsa hekiminizin önerdiği doğum asılarını uygulayın.</p>
              </div>
            </TaskCard>

            <TaskCard>
              <div className="icon" style={{ background: '#fce7f3', color: '#db2777' }}>
                <FiDroplet />
              </div>
              <div className="content">
                <h4>4. İnek C Vitamini ve Kalsiyum</h4>
                <p>Anneyi süt humması (süt felci) ve yorgunluktan korumak için deri altı / damar içi hekiminizin önerdiği Kalsiyum takviyesini gerçekleştirin.</p>
              </div>
            </TaskCard>
          </CardGrid>
        </Body>
        
        <Footer>
          <ActionButton onClick={onAcknowledge}>
            <FiCheckCircle size={18} /> Anladım ve Doğumu Kaydet
          </ActionButton>
        </Footer>
      </ModalContainer>
    </Overlay>
  );
}
