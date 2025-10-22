// client/src/components/common/AttachmentModal.js
import React from 'react';
import styled from 'styled-components';
import { FiX, FiDownload } from 'react-icons/fi';

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: #1e1e2d;
    color: ${({ theme }) => theme.colors.text};
    border-radius: 8px;
    padding: 1.5rem;
    width: 90%;
    max-width: 900px;
    height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 5px 15px rgba(0,0,0,0.5);

    @media (max-width: 768px) {
        padding: 1rem;
        height: 95vh;
        width: 95%;
    }
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #444;
    padding-bottom: 1rem;
    margin-bottom: 1rem;

    /* --- FIX: Stacks header on mobile --- */
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }
`;

// --- FIX: Added a wrapper for the title ---
const HeaderTitle = styled.h3`
    margin: 0;
    font-size: 1.2rem;
    word-break: break-all;
    
    @media (max-width: 768px) {
        font-size: 1.1rem;
        text-align: center;
    }
`;

// --- FIX: Added a wrapper for the buttons ---
const HeaderControls = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;

    /* Stacks buttons on mobile */
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const CloseButton = styled.button`
    /* Desktop style */
    background: transparent;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    line-height: 1;

    /* --- FIX: Mobile style (full button) --- */
    @media (max-width: 768px) {
        order: 2; /* Shows close button last */
        background: #333;
        font-size: 1rem;
        font-weight: 600;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
`;

const DownloadLink = styled.a`
    /* Desktop style */
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: ${({ theme }) => theme.colors.primary};
    color: #000;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    margin-left: 1rem;

    /* --- FIX: Mobile style (full button) --- */
    @media (max-width: 768px) {
        order: 1; /* Shows download button first */
        margin-left: 0;
        padding: 0.75rem 1.5rem;
        justify-content: center;
    }
`;

const Viewport = styled.div`
    flex-grow: 1;
    background: #111;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;

    img, object, iframe {
        width: 100%;
        height: 100%;
        border: none;
        object-fit: contain;
    }
`;

// Helper to determine file type for rendering
const AttachmentViewer = ({ attachment }) => {
    if (!attachment || !attachment.filePath) return null;

    const { fileType, filePath } = attachment;

    if (fileType.startsWith('image/')) {
        return <img src={filePath} alt="Attachment" />;
    }
    
    if (fileType === 'application/pdf') {
        return (
            <object 
                data={filePath} 
                type="application/pdf"
                aria-label="PDF attachment"
            >
                <iframe 
                    src={filePath}
                    title="PDF attachment"
                />
            </object>
        );
    }

    // Fallback for other file types
    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Cannot preview this file type: <strong>{fileType}</strong></p>
            <p>Please download the file to view it.</p>
        </div>
    );
};


const AttachmentModal = ({ attachment, onClose }) => {
    if (!attachment) return null;

    const handleContentClick = (e) => e.stopPropagation();

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={handleContentClick}>
                <ModalHeader>
                    {/* --- FIX: Wrapped title --- */}
                    <HeaderTitle>{attachment.fileName}</HeaderTitle>
                    
                    {/* --- FIX: Wrapped controls --- */}
                    <HeaderControls>
                        <DownloadLink href={attachment.filePath} download={attachment.fileName} target="_blank" rel="noopener noreferrer">
                            <FiDownload /> Download
                        </DownloadLink>
                        
                        <CloseButton onClick={onClose}>
                            <FiX /> 
                            {/* --- FIX: Show text only on mobile --- */}
                            <span style={{ display: 'none' }} className="mobile-only">Close</span>
                        </CloseButton>
                    </HeaderControls>
                </ModalHeader>
                <Viewport>
                    <AttachmentViewer attachment={attachment} />
                </Viewport>
            </ModalContent>
            
            {/* --- FIX: Added a style tag to show mobile-only text --- */}
            <style>{`
                @media (max-width: 768px) {
                    .mobile-only {
                        display: inline !important;
                    }
                }
            `}</style>
        </ModalOverlay>
    );
};

export default AttachmentModal;