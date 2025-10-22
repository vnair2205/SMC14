// client/src/pages/TermsOfServicePage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
// --- FIX 1: Import your central 'api' service ---
import api from '../services/api'; // Adjust path if needed
import Preloader from '../components/common/Preloader'; // Assuming you have a Preloader

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

const TermsOfServicePage = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // --- FIX 2: Define and call fetchContent ---
        const fetchContent = async () => {
            setLoading(true);
            setError(null);
            try {
                // --- FIX 3: Use 'api.get' and the correct path ---
                const response = await api.get('/legal'); // Use api service, path is relative to baseURL
                // Assuming backend returns { termsOfService: '...', privacyPolicy: '...' }
                setContent(response.data.termsOfService || '<p>Terms of Service content not available.</p>');
            } catch (err) {
                console.error("Failed to fetch terms of service", err);
                setError('Could not load Terms of Service. Please try again later.');
                setContent('<p>Error loading content.</p>'); // Set fallback content on error
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []); // Empty dependency array means this runs once on mount

    return (
        <PageContainer>
            <ContentWrapper>
                <h1>Terms Of Service</h1>
                {loading ? (
                    <Preloader />
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : (
                    // Render the HTML fetched from the backend
                    // WARNING: Only use this if you trust the source of the HTML (your backend)
                    // If the content could contain malicious scripts, use a sanitizing library like DOMPurify
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                )}
            </ContentWrapper>
        </PageContainer>
    );
};

export default TermsOfServicePage;