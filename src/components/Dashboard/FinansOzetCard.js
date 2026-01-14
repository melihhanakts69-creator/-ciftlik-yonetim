import React from 'react';
import styled from 'styled-components';
import { FaWallet, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const Title = styled.h3`
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MainValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: ${props => props.color};
  margin-bottom: 5px;
`;

const SubValues = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid #eee;
`;

const SubItem = styled.div`
  display: flex;
  flex-direction: column;
  
  span.label {
    font-size: 12px;
    color: #95a5a6;
  }
  
  span.val {
    font-size: 14px;
    font-weight: 700;
    color: ${props => props.color};
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 24px;
  color: #f1f2f6;
  transform: scale(1.5);
`;

const FinansOzetCard = ({ data }) => {
    if (!data) return null;

    const netColor = data.netKar >= 0 ? '#4CAF50' : '#f44336';

    return (
        <Card>
            <Title>
                <FaWallet />
                Finansal Durum (Bu Ay)
            </Title>

            <MainValue color={netColor}>
                {data.netKar > 0 ? '+' : ''}{data.netKar.toLocaleString()} ₺
            </MainValue>

            <SubValues>
                <SubItem color="#4CAF50">
                    <span className="label">Gelir</span>
                    <span className="val"><FaArrowUp size={10} /> {data.toplamGelir.toLocaleString()} ₺</span>
                </SubItem>
                <SubItem color="#f44336">
                    <span className="label">Gider</span>
                    <span className="val"><FaArrowDown size={10} /> {data.toplamGider.toLocaleString()} ₺</span>
                </SubItem>
            </SubValues>

            <IconWrapper>
                <FaWallet />
            </IconWrapper>
        </Card>
    );
};

export default FinansOzetCard;
