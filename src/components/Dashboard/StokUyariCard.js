import React from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle } from 'react-icons/fa';

const AlertContainer = styled.div`
  background: #FFF3E0;
  border-left: 5px solid #FF9800;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const AlertContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  .icon {
    color: #FF9800;
    font-size: 24px;
  }

  .text {
    h4 {
      margin: 0 0 4px 0;
      color: #e65100;
      font-size: 16px;
    }
    p {
      margin: 0;
      color: #f57c00;
      font-size: 14px;
    }
  }
`;

const ActionButton = styled.button`
  background: #ffe0b2;
  color: #e65100;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  
  &:hover {
    background: #ffcc80;
  }
`;

const StokUyariCard = ({ stoklar, onNavigate }) => {
    // Kritik veya Azalan stokları filtrele
    const warnings = stoklar.filter(s => s.miktar <= s.minimumStok * 1.5);

    if (warnings.length === 0) return null;

    const criticalCount = warnings.filter(s => s.miktar <= s.minimumStok).length;
    const message = criticalCount > 0
        ? `${criticalCount} yem kritik seviyenin altında!`
        : `${warnings.length} yem azalıyor.`;

    return (
        <AlertContainer>
            <AlertContent>
                <div className="icon">
                    <FaExclamationTriangle />
                </div>
                <div className="text">
                    <h4>Stok Uyarısı</h4>
                    <p>{message} Kontrol etmen gerekiyor.</p>
                </div>
            </AlertContent>
            <ActionButton onClick={onNavigate}>
                Depoya Git →
            </ActionButton>
        </AlertContainer>
    );
};

export default StokUyariCard;
