import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Modal, ModalTitle, ModalText, ModalButtonContainer, ModalButton } from '../common/Modal';
import { FiAlertTriangle } from 'react-icons/fi';

const IconContainer = styled.div`
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: 1.5rem;
  text-align: center;
`;

const DetailRow = styled.p`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin: 0.75rem 0;
  padding: 0 1rem;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  span:first-child {
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const SessionConflictModal = ({ isOpen, activeSession, onCancel, onForceLogin }) => {
    const { t } = useTranslation();

    if (!isOpen || !activeSession) return null;

    // Destructure the data provided by the server
    const { ipAddress, device, location } = activeSession;

    return (
        <Modal isOpen={isOpen} onClose={onCancel} maxWidth="500px">
            <IconContainer>
                <FiAlertTriangle size={48} />
            </IconContainer>
            <ModalTitle>{t('session_conflict_title', 'Active Session Detected')}</ModalTitle>
            
            <ModalText>
                {t('session_conflict_message', 'Another active session was detected. Logging in will terminate the following session:')}
            </ModalText>

            <DetailRow>
                <span>{t('ip_address', 'IP Address')}:</span>
                <span>{ipAddress}</span>
            </DetailRow>
            <DetailRow>
                <span>{t('location', 'Location')}:</span>
                <span>{location || 'Unknown Location'}</span>
            </DetailRow>
            <DetailRow>
                <span>{t('device', 'Device')}:</span>
                <span>{device || 'Unknown Device'}</span>
            </DetailRow>

            <ModalText style={{ marginTop: '1.5rem', fontWeight: 'bold' }}>
                {t('proceed_warning', 'Do you wish to forcefully log in and terminate the active session?')}
            </ModalText>

            <ModalButtonContainer>
                <ModalButton onClick={onCancel}>
                    {t('cancel_button', 'Cancel')}
                </ModalButton>
                <ModalButton variant="danger" onClick={onForceLogin}>
                    {t('force_login_button', 'Force Login')}
                </ModalButton>
            </ModalButtonContainer>
        </Modal>
    );
};

export default SessionConflictModal;