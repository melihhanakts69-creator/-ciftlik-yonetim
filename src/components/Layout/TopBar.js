import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaBell, FaUserCircle, FaBars } from 'react-icons/fa';
import * as api from '../../services/api';

// --- Styled Components ---

const TopBarContainer = styled.div`
  height: 80px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  margin-bottom: 30px;
  border-radius: 16px;

  @media (max-width: 768px) {
    padding: 0 15px;
    height: 70px;
    margin-bottom: 20px;
    border-radius: 12px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
`;

const HamburgerButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #333;
  cursor: pointer;
  padding: 5px;
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;

  @media (max-width: 768px) {
    width: 100%;
    max-width: 200px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 45px;
  background-color: #F5F7FA;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  color: #5E6278;
  outline: none;
  transition: all 0.3s;

  &:focus {
    background-color: #fff;
    box-shadow: 0 0 0 2px #4CAF50;
  }

  @media (max-width: 768px) {
    padding: 10px 10px 10px 35px;
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #A2A3B7;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const NotificationWrapper = styled.div`
  position: relative;
  cursor: pointer;
  padding: 8px;
  
  &:hover svg {
    color: #4CAF50;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background-color: #F1416C;
  color: white;
  font-size: 10px;
  font-weight: bold;
  height: 16px;
  min-width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 0 4px;
  border: 2px solid white;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;

const UserInfo = styled.div`
  text-align: right;
  
  @media (max-width: 768px) {
    display: none; /* Mobilde sadece avatar görünsün */
  }
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: #3F4254;
`;

const UserRole = styled.div`
  font-size: 12px;
  color: #B5B5C3;
`;

const TopBar = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.getOkunmayanBildirimler();
            setUnreadCount(res.data.length);
        } catch (error) {
            console.error('Bildirim sayısı alınamadı', error);
        }
    };

    return (
        <TopBarContainer>
            <LeftSection>
                <HamburgerButton onClick={onMenuClick}>
                    <FaBars />
                </HamburgerButton>

                <SearchContainer>
                    <SearchIcon />
                    <SearchInput type="text" placeholder="Ara..." />
                </SearchContainer>
            </LeftSection>

            <RightSection>
                <NotificationWrapper onClick={() => navigate('/bildirimler')}>
                    <FaBell style={{ fontSize: '20px', color: '#A2A3B7', transition: 'color 0.3s' }} />
                    {unreadCount > 0 && <Badge>{unreadCount > 9 ? '9+' : unreadCount}</Badge>}
                </NotificationWrapper>

                <UserSection onClick={() => navigate('/ayarlar')}>
                    <UserInfo>
                        <UserName>{user.name || 'Kullanıcı'}</UserName>
                        <UserRole>Yönetici</UserRole>
                    </UserInfo>
                    <FaUserCircle style={{ fontSize: '36px', color: '#E1E3EA' }} />
                </UserSection>
            </RightSection>
        </TopBarContainer>
    );
};

export default TopBar;
