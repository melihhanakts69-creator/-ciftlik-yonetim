import React from 'react';
import styled from 'styled-components';
import { colors, shadows, borderRadius, spacing } from '../../styles/colors';

const Card = styled.div`
  background: ${colors.bg.card};
  border-radius: 12px;
  padding: ${spacing.md};
  border: 1px solid #e5e7eb;
  transition: background 0.15s;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};

  &:hover {
    background: ${props => props.clickable ? '#f9fafb' : colors.bg.card};
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${spacing.sm}; /* Reduced from md */
`;

const Title = styled.h3`
  font-size: 13px; /* Reduced from 14px */
  font-weight: 600;
  color: ${colors.text.secondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const IconWrapper = styled.div`
  width: 32px; /* Reduced from 40px */
  height: 32px; /* Reduced from 40px */
  border-radius: ${borderRadius.md};
  background: ${props => props.bgColor || colors.bg.green};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px; /* Reduced from 20px */
`;

const Value = styled.div`
  font-size: 24px; /* Reduced from 32px */
  font-weight: 700;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.xs}; /* Reduced from sm */
  display: flex;
  align-items: baseline;
  gap: ${spacing.xs};
`;

const Unit = styled.span`
  font-size: 14px; /* Reduced from 16px */
  font-weight: 500;
  color: ${colors.text.secondary};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  font-size: 13px;
  margin-top: ${spacing.md};
`;

const Trend = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.positive ? colors.success : colors.danger};
  font-weight: 600;
`;

const Description = styled.span`
  color: ${colors.text.light};
`;

const StatsCard = ({
  title,
  value,
  unit,
  icon,
  color,
  bgColor,
  trend,
  trendValue,
  description,
  onClick,
  clickable
}) => {
  return (
    <Card color={color} clickable={clickable} onClick={onClick}>
      <Header>
        <Title>{title}</Title>
        {icon && (
          <IconWrapper bgColor={bgColor}>
            {icon}
          </IconWrapper>
        )}
      </Header>

      <Value>
        {value}
        {unit && <Unit>{unit}</Unit>}
      </Value>

      {(trend !== undefined || description) && (
        <Footer>
          {trend !== undefined && (
            <Trend positive={trend >= 0}>
              {trend >= 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </Trend>
          )}
          {description && <Description>{description}</Description>}
        </Footer>
      )}
    </Card>
  );
};

export default StatsCard;
