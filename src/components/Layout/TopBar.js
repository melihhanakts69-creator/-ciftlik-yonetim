import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaBell, FaUserCircle, FaBars } from 'react-icons/fa';
import * as api from '../../services/api';
import { useIsMobile } from '../../hooks/useMediaQuery';
import InstallButton from '../PWAInstallPrompt/InstallButton';
import { FiHelpCircle } from 'react-icons/fi';
import PageGuideModal from '../modals/PageGuideModal';
import { pageGuides } from '../../data/pageGuides';

// --- Styled Components ---

const TopBarContainer = styled.div`
  height: 56px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 0;
  border-radius: 0;
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: 768px) {
    padding: 0 12px;
    height: 50px;
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
    display: none;
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

const ProfileAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #E1E3EA;
`;

const InstallBtnWrap = styled.div`
  @media (min-width: 769px) {
    display: none;
  }
`;

const HelpButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px;
  color: #3b82f6;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background: #eff6ff;
    color: #2563eb;
    transform: scale(1.05);
  }
`;

const TopBar = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();
    const [unreadCount, setUnreadCount] = useState(0);
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    const currentGuideKey = Object.keys(pageGuides).find(k => location.pathname === k || location.pathname.startsWith(k + '/'));
    const guideData = currentGuideKey ? pageGuides[currentGuideKey] : null;

    useEffect(() => {
        const onUserUpdate = () => setUser(JSON.parse(localStorage.getItem('user') || '{}'));
        window.addEventListener('agrolina:userUpdated', onUserUpdate);
        return () => window.removeEventListener('agrolina:userUpdated', onUserUpdate);
    }, []);

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
                {isMobile && (
                    <InstallBtnWrap>
                        <InstallButton hideWhenCannotInstall />
                    </InstallBtnWrap>
                )}
                
                {guideData && (
                    <HelpButton onClick={() => setIsGuideOpen(true)} title="Nasıl Kullanılır?">
                        <FiHelpCircle style={{ fontSize: '22px' }} />
                    </HelpButton>
                )}

                <NotificationWrapper onClick={() => navigate('/bildirimler')}>
                    <FaBell style={{ fontSize: '20px', color: '#A2A3B7', transition: 'color 0.3s' }} />
                    {unreadCount > 0 && <Badge>{unreadCount > 9 ? '9+' : unreadCount}</Badge>}
                </NotificationWrapper>

                <UserSection onClick={() => navigate('/ayarlar')}>
                    <UserInfo>
                        <UserName>{user.isim || user.name || 'Kullanıcı'}</UserName>
                        <UserRole>{user.isletmeAdi || (user.rol === 'veteriner' ? 'Veteriner' : user.rol === 'sutcu' ? 'İşçi' : user.rol === 'toplayici' ? 'Süt Toplayıcı' : 'Çiftlik')}</UserRole>
                    </UserInfo>
                    {user.profilFoto ? (
                        <ProfileAvatar src={user.profilFoto} alt="Profil" />
                    ) : (
                        <FaUserCircle style={{ fontSize: '36px', color: '#E1E3EA' }} />
                    )}
                </UserSection>
            </RightSection>

            <PageGuideModal 
              isOpen={isGuideOpen} 
              onClose={() => setIsGuideOpen(false)} 
              data={guideData} 
            />
        </TopBarContainer>
    );
};

export default TopBar;
