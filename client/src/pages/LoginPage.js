import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { FiEye, FiEyeOff, FiAlertTriangle, FiMapPin, FiWifi, FiClock } from 'react-icons/fi';
import api from '../services/api';
import logo from '../assets/seekmycourse_logo.png';
import loginBanner from '../assets/SMC_Login_Banner.png';
import Preloader from '../components/common/Preloader';
import { Modal, ModalTitle, ModalText, ModalButtonContainer, ModalButton } from '../components/common/Modal';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

// --- Styled Components ---
const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
`;

const FormContainer = styled.div`
  width: 30%;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
  @media (max-width: 768px) {
    width: 100%;
    padding: 2rem;
  }
`;

const BannerContainer = styled.div`
  width: 70%;
  background-image: url(${loginBanner});
  background-size: cover;
  background-position: center;
  @media (max-width: 768px) {
    display: none;
  }
`;

const Logo = styled.img`
  width: 180px;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 1.5rem;
  text-align: center;
`;

const FormWrapper = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  color: #333;
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const PasswordIcon = styled.div`
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FormErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 1.5rem;
  min-height: 20px;
`;

const ForgotPasswordLink = styled(Link)`
  width: 100%;
  text-align: right;
  font-size: 0.875rem;
  margin-top: -0.75rem;
  margin-bottom: 1.5rem;
  padding-right: 0.25rem;
  color: ${({ theme }) => theme.colors.primary};
  &:hover {
    text-decoration: underline;
  }
`;

const SignInButton = styled.button`
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.9;
  }
`;

const SignUpText = styled.p`
  margin-top: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// --- START: NEW STYLED COMPONENT ---
const FooterText = styled.div`
  text-align: center;
  margin-top: 3rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;

  p {
    margin: 0.5rem 0;
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;



// --- NEW MODAL DETAIL COMPONENTS FOR CLEAN DISPLAY ---
const ConflictDetailsContainer = styled.div`
    width: 100%;
    margin: 1rem 0;
    padding: 1rem;
    border-radius: 8px;
    background-color: #3b3b52;
    text-align: left;
`;

const DetailRow = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.textSecondary};

    svg {
        margin-right: 0.5rem;
        color: ${({ theme }) => theme.colors.primary};
        min-width: 1rem;
    }

    span:last-child {
        color: ${({ theme }) => theme.colors.text};
        font-weight: 500;
        margin-left: auto;
    }
`;
// --- END: NEW STYLED COMPONENT ---

// --- Component ---
const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSessionConflict, setShowSessionConflict] = useState(false);
  const [sessionDetails, setSessionDetails] = useState(null);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

 const handleForceLogin = async () => {
        setShowSessionConflict(false);
        setIsLoading(true);
        try {
            // Note: The /auth/force-login endpoint does the same as login but ignores the activeSession check.
            const res = await api.post('/auth/force-login', formData);
            localStorage.setItem('token', res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(t(err.response?.data?.msgKey || 'errors.generic'));
            setIsLoading(false);
        }
    };

  const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            navigate('/dashboard');
        } catch (err) {
            if (err.response?.status === 409) {
                setSessionDetails(err.response.data.activeSession);
                setShowSessionConflict(true);
            } else {
                setError(t(err.response?.data?.msgKey || 'errors.generic'));
            }
            setIsLoading(false);
        }
    };

  return (
        <PageContainer>
            {isLoading && <Preloader />}
            
            {/* --- REFACTORED SESSION CONFLICT MODAL --- */}
            <Modal isOpen={showSessionConflict} onClose={() => setShowSessionConflict(false)} maxWidth="500px">
                <FiAlertTriangle size={48} style={{ color: '#d95c03', marginBottom: '1rem' }} />
                <ModalTitle>{t('session_conflict_title', 'Active Session Detected')}</ModalTitle>
                
                <ModalText>
                    {t('session_conflict_message', 'Another active session was detected. Logging in will terminate the following session:')}
                </ModalText>

                {sessionDetails && (
                    <ConflictDetailsContainer>
                        <DetailRow>
                            <FiMapPin />
                            {t('location_label', 'Location')}: 
                            <span>{sessionDetails.location || t('location_unknown', 'Unknown')}</span>
                        </DetailRow>
                        <DetailRow>
                            <FiWifi />
                            {t('ip_address_label', 'IP Address')}:
                            <span>{sessionDetails.ipAddress || t('ip_unknown', 'Unknown')}</span>
                        </DetailRow>
                        <DetailRow>
                            <FiClock />
                            {t('time_label', 'Logged In At')}:
                            <span>{new Date(sessionDetails.loggedInAt).toLocaleString()}</span>
                        </DetailRow>
                        <DetailRow>
                            <FiEye />
                            {t('device_label', 'Device')}:
                            <span>{sessionDetails.device || t('device_unknown', 'Unknown')}</span>
                        </DetailRow>
                    </ConflictDetailsContainer>
                )}

                <ModalText style={{ marginTop: '1.5rem', fontWeight: 'bold' }}>
                    {t('proceed_warning', 'Do you wish to forcefully log in and terminate the active session?')}
                </ModalText>

                <ModalButtonContainer>
                    <ModalButton onClick={() => setShowSessionConflict(false)}>{t('cancel_button', 'Cancel')}</ModalButton>
                    <ModalButton variant="danger" onClick={handleForceLogin}>{t('force_login_button', 'Force Login')}</ModalButton>
                </ModalButtonContainer>
            </Modal>

      <FormContainer>
                <Logo src={logo} alt="SeekMYCOURSE Logo" />
                <Title>{t('welcome_back')}</Title>
                <Subtitle>{t('signin_continue')}</Subtitle>
                <FormErrorText>{error}</FormErrorText>
                <FormWrapper onSubmit={handleSubmit}>
                    <LanguageSwitcher />
                    <InputGroup>
                        <Input
                            type="email"
                            placeholder={t('email_placeholder')}
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                        />
                    </InputGroup>
                    <InputGroup>
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t('password_placeholder')}
                            name="password"
                            value={password}
                            onChange={onChange}
                            required
                        />
                        <PasswordIcon onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                        </PasswordIcon>
                    </InputGroup>
                    <ForgotPasswordLink to="/forgot-password">
                        {t('forgot_password')}
                    </ForgotPasswordLink>
                    <SignInButton type="submit">{t('signin_button')}</SignInButton>
                </FormWrapper>
                <SignUpText>
                    {t('no_account')}{' '}
                    <Link to="/signup">{t('signup_link')}</Link>
                </SignUpText>
                <FooterText>
                    <p>
                        <Trans i18nKey="login_trouble">
                            Having trouble logging in? <a href="mailto:support@seekmycourse.com">support@seekmycourse.com</a>
                        </Trans>
                    </p>
                    <p>&copy; {new Date().getFullYear()} SeekMyCourse AI Technologies Pvt Ltd.</p>
                </FooterText>
            </FormContainer>
      <BannerContainer />
    </PageContainer>
  );
};

export default LoginPage;