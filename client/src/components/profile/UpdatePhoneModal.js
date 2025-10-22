// client/src/components/profile/UpdatePhoneModal.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
// --- FIX 1: Import 'api' service instead of 'axios' ---
import api from '../../services/api';
import { Modal } from '../common/Modal';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

// (All styled-components remain the same)
const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  text-align: center;
`;
// ... (rest of styled components: Input, ButtonGroup, Button, ErrorText, SuccessIcon, ResendText) ...
const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background-color: #2c2f48;
  border: 1px solid #444;
  border-radius: 6px;
  color: white;
  text-align: center;
`;
const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  width: 100%;
`;
const Button = styled.button`
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  border: 1px solid transparent;
  font-weight: bold;
  cursor: pointer;
  background-color: ${({ theme, primary }) => (primary ? theme.colors.primary : '#555')};
  color: ${({ theme, primary }) => (primary ? '#1e1e2d' : 'white')}; /* Adjusted color for primary */
  &:disabled {
    background-color: #444;
    cursor: not-allowed;
  }
`;
const ErrorText = styled.p`
  color: #ff6b6b;
  margin-top: -1rem;
  margin-bottom: 1rem;
`;
const SuccessIcon = styled.div`
    font-size: 3rem;
    color: #28a745;
    border: 3px solid #28a745;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
`;
const ResendText = styled.p`
  color: ${({ theme, disabled }) => (disabled ? '#777' : theme.colors.primary)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  text-decoration: underline;
  font-size: 0.9rem;
`;


const UpdatePhoneModal = ({ isOpen, onClose, onUpdateSuccess, currentPhone }) => {
    const [step, setStep] = useState('input'); // 'input', 'otp', 'success'
    const [newPhoneNumber, setNewPhoneNumber] = useState(currentPhone || '');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(0);

    // Timer effect (no changes needed)
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);


    const handleSendOtp = async () => {
        if (!newPhoneNumber || newPhoneNumber === currentPhone) {
            setError('Please enter a new phone number.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            // --- FIX 2: Use 'api.post', remove '/api' prefix, remove token ---
            await api.post('/auth/update-phone', { newPhoneNumber });
            setStep('otp');
            setTimer(60);
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setIsLoading(true);
        setError('');
        try {
            // --- FIX 3: Use 'api.post', remove '/api' prefix, remove token ---
            await api.post('/auth/verify-phone', { otp });
            setStep('success');
            // Inform parent about the successful update
            if (onUpdateSuccess) {
                 onUpdateSuccess(newPhoneNumber); // Pass the new number back if needed
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        // Reset state (no changes needed)
        setStep('input');
        setNewPhoneNumber(currentPhone || '');
        setOtp('');
        setError('');
        setIsLoading(false);
        setTimer(0); // Reset timer on close
        onClose();
    };

    const handleSuccess = () => {
        handleClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalContent>
                {step === 'input' && (
                    <>
                        <h2>Update Phone Number</h2>
                        <p>Enter your new phone number below. We'll send a verification code to confirm.</p>
                        {error && <ErrorText>{error}</ErrorText>}
                        {/* Ensure PhoneInput uses correct className for styling if needed */}
                        <PhoneInput
                            international
                            defaultCountry="IN" // Set default country if applicable
                            value={newPhoneNumber}
                            onChange={setNewPhoneNumber}
                            style={{ width: '100%', marginBottom: '1rem' }} // Basic styling example
                            inputStyle={{ // Style the input itself
                                padding: '0.75rem',
                                backgroundColor: '#2c2f48',
                                border: '1px solid #444',
                                borderRadius: '6px',
                                color: 'white',
                                width: '100%'
                            }}
                        />
                        <ButtonGroup>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button
                                primary
                                onClick={handleSendOtp}
                                disabled={isLoading || !newPhoneNumber || newPhoneNumber === currentPhone}
                            >
                                {isLoading ? 'Sending...' : 'Send OTP'}
                            </Button>
                        </ButtonGroup>
                    </>
                )}

                {step === 'otp' && (
                    <>
                        <h2>Verify Your New Number</h2>
                        <p>Please enter the 4-digit code sent to {newPhoneNumber}.</p>
                        {error && <ErrorText>{error}</ErrorText>}
                        <Input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength="4"
                        />
                        <ResendText disabled={timer > 0} onClick={timer === 0 ? handleSendOtp : null}>
                            {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                        </ResendText>
                        <ButtonGroup>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button
                                primary
                                onClick={handleVerifyOtp}
                                disabled={isLoading || otp.length < 4}
                            >
                                {isLoading ? 'Verifying...' : 'Verify'}
                            </Button>
                        </ButtonGroup>
                    </>
                )}

                {step === 'success' && (
                    <>
                        <SuccessIcon>✓</SuccessIcon>
                        <h2>Success!</h2>
                        <p>Your phone number has been updated successfully.</p>
                        <ButtonGroup>
                            <Button primary onClick={handleSuccess}>Done</Button>
                        </ButtonGroup>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default UpdatePhoneModal;