// client/src/pages/PrivacyPolicyPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
// --- FIX 1: Import your central 'api' service ---
import api from '../services/api'; // Adjust path if needed
import DOMPurify from 'dompurify';
import Preloader from '../components/common/Preloader'; // Import Preloader

const PageContainer = styled.div`
    padding: 2rem;
    color: ${({ theme }) => theme.colors.text};
    background-color: #1e1e2d; /* Match dashboard theme */
    min-height: calc(100vh - 80px); /* Adjust based on header/footer */

    @media (max-width: 768px) {
        padding: 1rem;
    }
`;

const ContentWrapper = styled.div`
    background-color: #2a2a3e; /* Slightly lighter card background */
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    max-width: 900px; /* Limit width */
    margin: 0 auto; /* Center the content */

    h1 {
        color: ${({ theme }) => theme.colors.primary};
        margin-top: 0;
        border-bottom: 1px solid #444;
        padding-bottom: 1rem;
        margin-bottom: 1.5rem;
    }

    /* Add basic styling for HTML content */
    h2 { margin-top: 1.5rem; margin-bottom: 0.5rem; color: #eee; }
    p { line-height: 1.6; margin-bottom: 1rem; color: #ccc; }
    ul, ol { margin-left: 1.5rem; margin-bottom: 1rem; color: #ccc; }
    li { margin-bottom: 0.5rem; }
    a { color: ${({ theme }) => theme.colors.primary}; text-decoration: none; &:hover { text-decoration: underline; } }
`;

const ErrorMessage = styled.p`
    color: #ff6b6b; /* Red color for errors */
    text-align: center;
`;


const PrivacyPolicyPage = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            setError(null);
            try {
                // --- FIX 2: Use 'api.get' and the correct path ---
                const res = await api.get('/legal');
                // Sanitize and set content
                setContent(DOMPurify.sanitize(res.data.privacyPolicy || '<p>Privacy Policy content not available.</p>'));
            } catch (error) {
                console.error('Failed to fetch privacy policy', error);
                setError('Could not load Privacy Policy. Please try again later.');
                setContent('<p>Error loading content.</p>');
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    return (
        <PageContainer>
            <ContentWrapper>
                <h1>Privacy Policy</h1>
                 {loading ? (
                    <Preloader /> // Use your Preloader component
                ) : error ? (
                    <ErrorMessage>{error}</ErrorMessage> // Display error message
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                )}
            </ContentWrapper>
        </PageContainer>
    );
};

export default PrivacyPolicyPage;