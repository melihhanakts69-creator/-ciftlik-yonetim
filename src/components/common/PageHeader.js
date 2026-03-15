import styled from 'styled-components';

/**
 * Standart sayfa header bileşeni.
 * Renk sayfadan sayfaya değişir ama yapı sabit.
 * Kullanım: <PageHeader $gradient={gradients.primary}>...</PageHeader>
 */
const PageHeader = styled.div`
  padding: 24px 32px 20px;
  position: relative;
  overflow: hidden;
  background: ${p => p.$gradient || p.$background || 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'};
  color: ${p => p.$color || 'white'};
  border-radius: ${p => p.$radius || '20px'};
  margin-bottom: ${p => p.$marginBottom || '24px'};

  &::after {
    content: '';
    position: absolute;
    right: -40px;
    top: -40px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 16px 16px 14px;
  }
`;

export default PageHeader;
