// client/src/pages/dashboard/MyCertificatesPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import Preloader from '../../components/common/Preloader';
import CertificateThumbnail from '../../components/common/CertificateThumbnail';
import api from '../../services/api';
import { Modal, ModalText, ModalButtonContainer, ModalButton } from '../../components/common/Modal';

// --- Styled Components (No Changes Here) ---
const PageContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
`;

const HeaderTitle = styled.h1`
  font-size: 2.5rem;
  color: white;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 0.75rem 1rem;
  margin-bottom: 2rem;
  background-color: #1e1e2d;
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: box-shadow 0.2s;

  &:focus {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary};
  }
`;

const CertificateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  flex-grow: 1;
`;

const CertificateCard = styled.div`
  background-color: #1e1e2d;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
`;

const CardThumbnail = styled.div`
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-bottom: 3px solid ${({ theme }) => theme.colors.primary};
  justify-content: center;
  align-items: center;
  background-color: #333;
`;

const CardContent = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.75rem;
`;

const CardDetail = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0.4rem;
  span {
    font-weight: bold;
    color: white;
  }
`;

const CardButton = styled.button`
  margin-top: 1.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.9;
  }
`;

const NoCertificatesMessage = styled.div`
  text-align: center;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 3rem;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const MyCertificatesPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [certificates, setCertificates] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  // --- FIX: CONSOLIDATED DATA FETCHING INTO A SINGLE useEffect ---
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError('');
      try {
        // Step 1: Fetch user data if it's not already loaded.
        let currentUser = user;
        if (!currentUser) {
            const userResponse = await api.get('/dashboard');
            currentUser = userResponse.data.user;
            setUser(currentUser);
        }

        // Step 2: Fetch certificates using the current (or new) user data.
        const params = {
            certified: true,
            limit: 100,
            search: debouncedSearchTerm,
        };
        const certResponse = await api.get('/course', { params });
        setCertificates(certResponse.data.docs);

      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(t('errors.generic', 'An unexpected error occurred.'));
        setCertificates([]); // Clear data on error
      } finally {
        // This will now run regardless of success or failure
        setLoading(false);
      }
    };

    fetchAllData();
    // This effect now depends on the debounced search term, ensuring it refetches on search.
  }, [debouncedSearchTerm, navigate, t]);


  if (loading) {
    return <Preloader />;
  }
  
  // --- Simplified Error Display ---
  if (error) {
    return (
        <PageContainer>
            <HeaderTitle>{t('my_certificates_page.title', { defaultValue: 'My Certificates' })}</HeaderTitle>
            <NoCertificatesMessage style={{color: 'red'}}>{error}</NoCertificatesMessage>
        </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderTitle>{t('my_certificates_page.title', { defaultValue: 'My Certificates' })}</HeaderTitle>
      
      <SearchInput
        type="text"
        placeholder={t('my_certificates_page.search_placeholder', 'Search by course name...')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      {certificates.length === 0 ? (
        <NoCertificatesMessage>{t('my_certificates_page.no_certificates')}</NoCertificatesMessage>
      ) : (
        <CertificateGrid>
          {certificates.map((course) => (
            <CertificateCard key={course._id}>
              <CardThumbnail>
                {user && <CertificateThumbnail course={course} user={user} />}
              </CardThumbnail>
              <CardContent>
                <CardTitle title={course.englishTopic || course.topic}>{course.englishTopic || course.topic}</CardTitle>
                <CardDetail>{t('sidebar.created_on')}: <span>{format(new Date(course.createdAt), 'dd/MM/yyyy')}</span></CardDetail>
                <CardDetail>{t('sidebar.course_completion_date')}: <span>{format(new Date(course.completionDate), 'dd/MM/yyyy')}</span></CardDetail>
                <CardDetail>
                  {t('score_card.score_label')}: <span>{course.quiz && course.quiz.length > 0 ? ((course.score / course.quiz.length) * 100).toFixed(0) : 'N/A'}%</span>
                </CardDetail>
                <CardButton onClick={() => navigate(`/course/${course._id}/certificate`)}>
                  {t('my_certificates_page.view_certificate_button')}
                </CardButton>
              </CardContent>
            </CertificateCard>
          ))}
        </CertificateGrid>
      )}

       <Modal isOpen={errorModal.isOpen} onClose={() => setErrorModal({ isOpen: false, message: '' })} title={t('error_modal_title', { defaultValue: 'Error' })}>
           <ModalText>{errorModal.message}</ModalText>
           <ModalButtonContainer>
               <ModalButton primary onClick={() => setErrorModal({ isOpen: false, message: '' })}>{t('ok_button', { defaultValue: 'OK' })}</ModalButton>
           </ModalButtonContainer>
       </Modal>
    </PageContainer>
  );
};

export default MyCertificatesPage;