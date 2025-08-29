import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FiCamera } from 'react-icons/fi';
import { FaGraduationCap, FaUserGraduate, FaClipboardList, FaFileAlt } from 'react-icons/fa';

import PersonalInfo from '../../components/profile/PersonalInfo';
import Bio from '../../components/profile/Bio';
import LearnsProfile from '../../components/profile/LearnsProfile';
import Preloader from '../../components/common/Preloader';

// --- Styled Components ---

const ProfilePageContainer = styled.div`
  padding: 2rem;
  color: white;
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  background-color: #1e1e2d;
  padding: 2rem;
  border-radius: 12px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const UserInfoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const AvatarContainer = styled.div`
  position: relative;
  cursor: pointer;
`;

const ProfilePicture = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 4px solid ${({ theme }) => theme.colors.primary};
  object-fit: cover;
`;

const ProfileInitials = styled.div`
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background-color: #03d9c5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    font-weight: bold;
    color: #1e1e2d;
    border: 4px solid ${({ theme }) => theme.colors.primary};
`;

const CameraOverlay = styled.div`
  position: absolute;
  bottom: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserDetails = styled.div`
  text-align: center;
  @media (min-width: 768px) {
    text-align: left;
  }

  h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2.5rem;
  }
  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.1rem;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 400px;
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    max-width: none;
  }
`;

const StatCard = styled.div`
  background-color: #33333d;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  
  .icon {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.5rem;
  }

  h3 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  span {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #444;
  margin-bottom: 2rem;
  overflow-x: auto;
`;

const TabButton = styled.button`
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  color: ${({ active, theme }) => (active ? theme.colors.primary : theme.colors.textSecondary)};
  cursor: pointer;
  font-size: 1.1rem;
  border-bottom: 3px solid ${({ active, theme }) => (active ? theme.colors.primary : 'transparent')};
  transition: all 0.2s ease;
  white-space: nowrap;
`;

const TabContent = styled.div`
  background-color: #1e1e2d;
  padding: 2rem;
  border-radius: 12px;
`;

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'bio', 'learns'

    useEffect(() => {
        const fetchProfileData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const config = { headers: { 'x-auth-token': token } };
                
                // Fetch user profile data
                const profileRes = await axios.get('/api/auth/profile', config);
                setUser(profileRes.data);

                // Fetch user stats
                const statsRes = await axios.get('/api/auth/profile/stats', config);
                setStats(statsRes.data);

            } catch (error) {
                console.error("Failed to fetch profile or stats:", error);
                // Handle error state appropriately
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, []);
    
    // Function to generate initials for the avatar
    const getInitials = (firstName, lastName) => {
        if (!firstName || !lastName) return '';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    };

    if (loading) return <Preloader />;

    return (
        <ProfilePageContainer>
            <ProfileHeader>
                <UserInfoSection>
                    <AvatarContainer>
                        {user?.profilePicture ? (
                            <ProfilePicture src={user.profilePicture} alt="Profile" />
                        ) : (
                            <ProfileInitials>{getInitials(user?.firstName, user?.lastName)}</ProfileInitials>
                        )}
                        <CameraOverlay><FiCamera size={20} /></CameraOverlay>
                    </AvatarContainer>
                    <UserDetails>
                        <h1>{`${user?.firstName} ${user?.lastName}`}</h1>
                        <p>{user?.email}</p>
                    </UserDetails>
                </UserInfoSection>

                <StatsContainer>
                    <StatCard>
                        <FaGraduationCap className="icon" />
                        <h3>{stats?.coursesGenerated || 0}</h3>
                        <span>Courses Generated</span>
                    </StatCard>
                    <StatCard>
                        <FaUserGraduate className="icon" />
                        <h3>{stats?.coursesCompleted || 0}</h3>
                        <span>Courses Completed</span>
                    </StatCard>
                    <StatCard>
                        <FaClipboardList className="icon" />
                        <h3>{stats?.preGeneratedAccessed || 0}</h3>
                        <span>Pre-gen. Accessed</span>
                    </StatCard>
                    <StatCard>
                        <FaFileAlt className="icon" />
                        <h3>{stats?.preGeneratedCompleted || 0}</h3>
                        <span>Pre-gen. Completed</span>
                    </StatCard>
                </StatsContainer>
            </ProfileHeader>

            <TabContainer>
                <TabButton active={activeTab === 'personal'} onClick={() => setActiveTab('personal')}>Personal Info</TabButton>
                <TabButton active={activeTab === 'bio'} onClick={() => setActiveTab('bio')}>Bio</TabButton>
                <TabButton active={activeTab === 'learns'} onClick={() => setActiveTab('learns')}>LEARNS Profile</TabButton>
            </TabContainer>

            <TabContent>
                {activeTab === 'personal' && <PersonalInfo user={user} />}
                {activeTab === 'bio' && <Bio user={user} />}
                {activeTab === 'learns' && <LearnsProfile user={user} />}
            </TabContent>
        </ProfilePageContainer>
    );
};

export default ProfilePage;