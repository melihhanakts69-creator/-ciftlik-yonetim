import React from 'react';
import styled from 'styled-components';
import { colors, shadows, borderRadius, spacing } from '../../styles/colors';

const CardContainer = styled.div`
  background: ${colors.bg.card};
  border-radius: ${borderRadius.lg};
  padding: ${props => props.padding || spacing.lg};
  box-shadow: ${shadows.md};
  transition: all 0.3s ease;

  ${props => props.hover && `
    cursor: pointer;
    &:hover {
      box-shadow: ${shadows.hover};
      transform: translateY(-2px);
    }
  `}
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.md};
  padding-bottom: ${props => props.withBorder ? spacing.md : '0'};
  border-bottom: ${props => props.withBorder ? `1px solid ${colors.border.light}` : 'none'};
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const CardSubtitle = styled.p`
  font-size: 14px;
  color: ${colors.text.secondary};
  margin: 0;
  margin-top: ${spacing.xs};
`;

const CardBody = styled.div`
  color: ${colors.text.primary};
`;

const CardFooter = styled.div`
  margin-top: ${spacing.md};
  padding-top: ${spacing.md};
  border-top: 1px solid ${colors.border.light};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Card = ({
  children,
  title,
  subtitle,
  action,
  footer,
  hover,
  padding,
  headerBorder = false,
  ...props
}) => {
  return (
    <CardContainer hover={hover} padding={padding} {...props}>
      {(title || action) && (
        <CardHeader withBorder={headerBorder}>
          <div>
            <CardTitle>{title}</CardTitle>
            {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
          </div>
          {action}
        </CardHeader>
      )}
      <CardBody>{children}</CardBody>
      {footer && <CardFooter>{footer}</CardFooter>}
    </CardContainer>
  );
};

export { Card, CardHeader, CardTitle, CardBody, CardFooter };
export default Card;
