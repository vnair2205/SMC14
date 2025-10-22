// client/src/pages/dashboard/CertificatePage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
// --- FIX: Removed axios import ---
// import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Preloader from '../../components/common/Preloader';
import certificateBg from '../../assets/SMC-Certificate.jpg';
import { FiDownload, FiX, FiHome } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
// --- FIX: Added correct api import ---
import api from '../../services/api';

// --- (Styled Components remain the same) ---
const PageContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 1rem;
    justify-content: flex-start;
  }
`;

const CertificateWrapper = styled.div`
  width: 595px;
  height: 842px;
  position: relative;
  background-image: url(${certificateBg});
  background-size: 100% 100%;
  font-family: 'Calisto MT', serif;
  color: #1e1e2d;

  @media (max-width: 768px) {
    width: 95vw;
    height: calc(95vw * 1.414);
  }
`;

const UserName = styled.h1`
  position: absolute;
  top: 59.8%;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 4.5vw;
  }
`;

const CourseName = styled.p`
  position: absolute;
  top: 69.1%;
  left: 0;
  width: 100%;
  padding: 0 10%;
  box-sizing: border-box;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  line-height: 1.4;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 2.5vw;
    line-height: 1.5;
  }
`;

const CompletionDate = styled.p`
  position: absolute;
  bottom: 5.9%;
  left: 3.7%;
  width: 25.2%;
  text-align: center;
  font-size: 14px;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 2vw;
  }
`;

const QrCodeContainer = styled.div`
  position: absolute;
  bottom: 5.9%;
  left: 49%;
  transform: translateX(-50%);
  background-color: white;
  padding: 5px;
  border: 1px solid #ccc;

  @media (max-width: 768px) {
    padding: 0.8vw;
    
    & > svg {
        width: 12vw;
        height: 12vw;
    }
  }
`;

const BottomActionsContainer = styled.div`
  margin-top: 2rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  max-width: 650px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
    max-width: 90%;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  background-color: ${({ theme, primary }) => (primary ? theme.colors.primary : '#555')};
  color: ${({ theme, primary }) => (primary ? theme.colors.background : 'white')};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme, primary }) => (primary ? '#03a092' : '#777')};
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;


const CertificatePage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const certificateRef = useRef();

    const [course, setCourse] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verificationUrl, setVerificationUrl] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            // --- FIX: Removed manual token & config ---
            try {
                // --- FIX: Use api.get and remove /api prefixes ---
                const [courseRes, userRes] = await Promise.all([
                    api.get(`/course/${courseId}`), // Corrected call
                    api.get('/dashboard')           // Corrected call
                ]);

                const fetchedUser = userRes.data.user;
                setCourse(courseRes.data);
                setUser(fetchedUser);

                if (fetchedUser && fetchedUser._id) {
                    const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';
                    setVerificationUrl(`${baseUrl}/verify/${courseId}/${fetchedUser._id}`);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                // Optionally show an error message before navigating
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId, navigate]);

    const formatName = (firstName, lastName) => {
        const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '');
        return `${capitalize(firstName)} ${capitalize(lastName)}`;
    };

    const formatDate = (dateString) => {
        // Ensure dateString is valid before creating a Date object
        if (!dateString) return 'N/A';
        try {
            const d = new Date(dateString);
            // Check if the date is valid
            if (isNaN(d.getTime())) {
                return 'N/A';
            }
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        } catch (e) {
            console.error("Error formatting date:", e);
            return 'N/A';
        }
    };


    const handleDownload = () => {
        const certificateNode = certificateRef.current;
        if (!certificateNode) return;

        html2canvas(certificateNode, {
            scale: 3,
            useCORS: true,
            backgroundColor: null
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

            const sanitizedTopic = (course.englishTopic || course.topic).replace(/[^a-zA-Z0-9]/g, '_');
            pdf.save(`SeekMYCOURSE-Certificate-${sanitizedTopic}.pdf`);
        });
    };

    const handleBackToHome = () => {
        navigate('/dashboard');
    };

    if (loading || !verificationUrl || !course || !user) { // Added checks for course and user
        return <Preloader />;
    }

    return (
        <PageContainer>
            <CertificateWrapper ref={certificateRef}>
                <UserName>{formatName(user.firstName, user.lastName)}</UserName>
                <CourseName>{(course.englishTopic || course.topic).toUpperCase()}</CourseName>
                {/* Use course.completionDate which should be set when quiz is completed */}
                <CompletionDate>{formatDate(course.completionDate)}</CompletionDate>
                <QrCodeContainer>
                    <QRCodeSVG
                        value={verificationUrl}
                        size={80} // Adjust size as needed
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="L" // Error correction level
                    />
                </QrCodeContainer>
            </CertificateWrapper>

            <BottomActionsContainer>
                <ActionButton primary onClick={handleDownload}>
                    <FiDownload /> {t('certificate_page.download_button', { defaultValue: 'Download Certificate' })}
                </ActionButton>
                <ActionButton onClick={handleBackToHome}>
                    <FiHome /> {t('certificate_page.back_home_button', { defaultValue: 'Back to Home' })}
                </ActionButton>
                <ActionButton onClick={() => navigate(`/course/${courseId}`)}>
                    <FiX /> {t('certificate_page.close_button', { defaultValue: 'Close' })}
                </ActionButton>
            </BottomActionsContainer>
        </PageContainer>
    );
};

export default CertificatePage;