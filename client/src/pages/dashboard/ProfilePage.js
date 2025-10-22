// client/src/pages/dashboard/ProfilePage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../../services/api';
import PersonalInfo from '../../components/profile/PersonalInfo';
import LearnsProfile from '../../components/profile/LearnsProfile';
import Preloader from '../../components/common/Preloader';

const ProfilePageContainer = styled.div`
  padding: 2rem;
  color: white;
  display: flex;
  gap: 2rem;
  align-items: flex-start;

  @media (max-width: 1024px) {
    flex-direction: column;
  }

  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
    gap: 1rem;
  }
`;

const LeftColumn = styled.div`
  flex: 1;
  min-width: 300px;
  width: 100%;

  @media (max-width: 768px) {
    min-width: unset;
  }
`;

const RightColumn = styled.div`
  flex: 2;
  width: 100%;
`;

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const profileRes = await api.get('/profile');
            setUser(profileRes.data);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    if (loading) return <Preloader />;
    if (!user) return <ProfilePageContainer><h2>Could not load user profile.</h2></ProfilePageContainer>;

    return (
        <ProfilePageContainer>
            <LeftColumn>
                {/* This one is correct */}
                <PersonalInfo user={user} onUpdate={fetchProfileData} />
            </LeftColumn>
            <RightColumn>
                {/* --- THIS IS THE FIX --- */}
                {/* You must pass the 'onUpdate' prop to LearnsProfile here. */}
                <LearnsProfile user={user} onUpdate={fetchProfileData} />
            </RightColumn>
        </ProfilePageContainer>
    );
};

export default ProfilePage;