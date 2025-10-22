// client/src/pages/dashboard/LessonContentPage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
// --- FIX: Removed axios import ---
// import axios from 'axios';
import DOMPurify from 'dompurify';
import Preloader from '../../components/common/Preloader';
import { Modal, ModalText, ModalButtonContainer, ModalButton } from '../../components/common/Modal';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
// --- FIX: Added correct api import ---
import api from '../../services/api';

// --- Styled Components (remain the same) ---
const VideoContainer = styled.div`
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    margin-bottom: 1.5rem;
    border-radius: 12px;

    iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
    }
`;

const NoVideoPlaceholder = styled.div`
    width: 100%;
    height: 0;                  // <-- Changed
    padding-bottom: 56.25%;     // <-- Added: 16:9 aspect ratio
    background-color: #33333d;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a0a0a0;
    font-style: italic;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    position: relative;
    overflow: hidden;           // <-- Added
`;

const VideoControls = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const CreditLink = styled.a`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }

    @media (max-width: 768px) {
        text-align: center;
        order: 1;
    }
`;


const ChangeVideoButton = styled.button`
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    border: 1px solid #555;
    background-color: #33333d;
    color: white;
    cursor: pointer;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    @media (max-width: 768px) {
        order: 2;
    }
`;

const NavButton = styled.button`
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }
`;

const VideoNav = styled.div`
    display: flex;
    gap: 0.5rem;

    @media (max-width: 768px) {
        order: 3;
        justify-content: center;
    }
`;


const ContentBody = styled.div`
    line-height: 1.8;
    white-space: pre-wrap;
    font-size: 1.1rem;
`;

const ErrorMessage = styled.div`
    color: ${({ theme }) => theme.colors.error};
    text-align: center;
    margin-top: 2rem;
    font-size: 1.2rem;
`;

const PageContainer = styled.div`
  padding: 2rem;
  text-align: ${({ dir }) => (dir === 'rtl' ? 'right' : 'left')};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
`;


const LessonContentPage = () => {
    const { courseId, subtopicId, lessonId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { refreshCourseData, course: parentCourse, courseCompletedAndPassed } = useOutletContext();

    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [videoHistory, setVideoHistory] = useState([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(-1);
    const [videoChangeCount, setVideoChangeCount] = useState(0);
    const [quizAvailabilityModal, setQuizAvailabilityModal] = useState({ isOpen: false, message: '' });

    const isGeneratingRef = useRef(false);

    const isRTL = ['ar', 'ur'].includes(parentCourse?.language);
    const isEnglishCourse = parentCourse?.language === 'en';
    
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const getYouTubeSearchEmbedUrl = (query) => {
        const cleanedQuery = encodeURIComponent(query + " educational video tutorial");
        return `https://www.youtube.com/embed?listType=search&list=${cleanedQuery}&autoplay=0`;
    };
    
    const fetchCourseData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Check token validity locally first (optional but good practice)
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            if (!parentCourse) {
                // Parent course data isn't loaded yet, wait for the next render
                return;
            }

            const currentSubtopic = parentCourse.index?.subtopics.find(sub => sub._id === subtopicId);
            const currentLessonFromParent = currentSubtopic ? currentSubtopic.lessons.find(l => l._id === lessonId) : null;

            if (!currentSubtopic || !currentLessonFromParent) {
                setError(t('errors.content_not_found'));
                setLoading(false);
                return;
            }

            // Set initial state from parent course data
            setLesson(currentLessonFromParent);
            const initialHistory = currentLessonFromParent.videoHistory || (currentLessonFromParent.videoUrl ? [{ videoUrl: currentLessonFromParent.videoUrl, videoChannelId: currentLessonFromParent.videoChannelId, videoChannelTitle: currentLessonFromParent.videoChannelTitle }] : []);
            setVideoHistory(initialHistory);
            setCurrentVideoIndex(initialHistory.length > 0 ? initialHistory.length - 1 : -1);
            setVideoChangeCount(currentLessonFromParent.videoChangeCount || 0);

            // If lesson is already completed and has content/video, no need to generate
            if (currentLessonFromParent.isCompleted && currentLessonFromParent.content && currentLessonFromParent.videoUrl) {
                setLoading(false);
                return;
            }

            // Prevent multiple simultaneous generation requests
            if (isGeneratingRef.current) {
                return;
            }
            isGeneratingRef.current = true;
            
            try {
                // --- FIX: Use api.post and remove /api prefix ---
                // --- FIX: Removed manual config/token ---
                const body = { courseId, subtopicId, lessonId };
                const res = await api.post('/course/lesson/generate', body);
                
                const updatedLesson = res.data;
                const wasCompletedBefore = currentLessonFromParent?.isCompleted || false;

                // Update state with the newly generated data
                setLesson(updatedLesson);
                const history = updatedLesson.videoHistory && updatedLesson.videoHistory.length > 0
                    ? updatedLesson.videoHistory
                    : (updatedLesson.videoUrl ? [{ videoUrl: updatedLesson.videoUrl, videoChannelId: updatedLesson.videoChannelId, videoChannelTitle: updatedLesson.videoChannelTitle }] : []);
                
                setVideoHistory(history);
                setCurrentVideoIndex(history.length - 1);
                setVideoChangeCount(updatedLesson.videoChangeCount || 0);

                // If the lesson was just completed, trigger a refresh of the parent course data
                if (updatedLesson.isCompleted && !wasCompletedBefore) {
                    refreshCourseData();
                }

            } catch (err) {
                console.error("[LessonContentPage] Error generating lesson content:", err);
                setError(t(err.response?.data?.msgKey || 'errors.generic'));
            } finally {
                setLoading(false);
                isGeneratingRef.current = false; // Allow new requests
            }
        } catch (err) {
            // Catch errors related to finding the lesson in parentCourse or token check
            console.error("[LessonContentPage] Error setting up lesson data:", err);
            setError(t('errors.failed_to_load_content'));
            setLoading(false);
        }
    }, [courseId, subtopicId, lessonId, navigate, refreshCourseData, parentCourse, t]); // Added parentCourse and t to dependencies

    useEffect(() => {
        // Fetch data only if the parent course data is available
        if (parentCourse) {
            fetchCourseData();
        }
        // This effect should re-run if parentCourse changes (e.g., after refresh)
    }, [fetchCourseData, parentCourse]);

    const handleChangeVideo = async () => {
        setShowModal(false);
        setLoading(true);
        try {
            // --- FIX: Use api.post and remove /api prefix ---
            // --- FIX: Removed manual config/token ---
            const body = { courseId, subtopicId, lessonId };
            const res = await api.post('/course/lesson/change-video', body);
            
            const updatedLesson = res.data;
            setLesson(updatedLesson); // Update local lesson state
            setVideoHistory(updatedLesson.videoHistory);
            setCurrentVideoIndex(updatedLesson.videoHistory.length - 1);
            setVideoChangeCount(updatedLesson.videoChangeCount);

            // Trigger parent refresh to update sidebar/completion status
            refreshCourseData();

        } catch (err) {
            console.error("Error changing video:", err);
            setError(t(err.response?.data?.msgKey || 'errors.generic'));
        } finally {
            setLoading(false);
        }
    };

    const handlePrevVideo = () => {
        if (currentVideoIndex > 0) {
            setCurrentVideoIndex(currentVideoIndex - 1);
        }
    };

    const handleNextVideo = () => {
        if (currentVideoIndex < videoHistory.length - 1) {
            setCurrentVideoIndex(currentVideoIndex + 1);
        }
    };

    // Show preloader if still loading or if parent course data isn't ready
    if (loading || !parentCourse) {
        return <Preloader />;
    }

    if (error) {
        return <ErrorMessage>{error}</ErrorMessage>;
    }

    // Find the current subtopic again based on potentially refreshed parentCourse data
    const currentSubtopic = parentCourse.index?.subtopics.find(sub => sub._id === subtopicId);

    // Ensure lesson data derived from parentCourse is available
    if (!lesson || !currentSubtopic) {
        return <ErrorMessage>{t('errors.content_not_found')}</ErrorMessage>;
    }
    
    // Determine video to display
    const youtubeSearchQuery = `${lesson.englishTitle || lesson.title} ${parentCourse.englishTopic || parentCourse.topic}`;
    const currentVideo = videoHistory[currentVideoIndex];
    const videoId = currentVideo ? getYouTubeId(currentVideo.videoUrl) : null;
    
    return (
        <PageContainer dir={isRTL ? 'rtl' : 'ltr'}>
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={t('change_video_modal_title', { defaultValue: 'Change Video' })}>
                <ModalText>{t('change_video_modal_message', { defaultValue: 'You can change the video for this lesson up to 3 times.' })}</ModalText>
                <ModalButtonContainer>
                    <ModalButton onClick={() => setShowModal(false)}>{t('errors.cancel_button')}</ModalButton>
                    <ModalButton primary onClick={handleChangeVideo}>{t('change_video_button', { defaultValue: 'Change' })}</ModalButton>
                </ModalButtonContainer>
            </Modal>

            <Modal isOpen={quizAvailabilityModal.isOpen} onClose={() => setQuizAvailabilityModal({ isOpen: false, message: '' })} title={t('quiz_not_available_title', { defaultValue: 'Quiz Not Available' })}>
                <ModalText>{quizAvailabilityModal.message}</ModalText>
                <ModalButtonContainer>
                    <ModalButton primary onClick={() => setQuizAvailabilityModal({ isOpen: false, message: '' })}>{t('course_generation.ok_button')}</ModalButton>
                </ModalButtonContainer>
            </Modal>

            <Title>
                {isEnglishCourse ?
                    `${currentSubtopic.title} - ${lesson.title}`
                :
                    `${currentSubtopic.title} ${currentSubtopic.englishTitle && `(${currentSubtopic.englishTitle})`} - ${lesson.title} ${lesson.englishTitle && `(${lesson.englishTitle})`}`
                }
            </Title>
            
            {videoId ? (
                <VideoContainer>
                    <iframe
                        key={videoId + '-' + currentVideoIndex} // Ensure iframe re-renders on index change
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={lesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen>
                    </iframe>
                </VideoContainer>
            ) : (
              <NoVideoPlaceholder>
         {/* Text is now centered correctly due to flexbox */}
         {t('errors.no_suitable_video_found_placeholder')}
         {/* Apply positioning directly to the iframe */}
         <iframe
             style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0, borderRadius: '12px' }} // <-- Added styles here
             src={getYouTubeSearchEmbedUrl(youtubeSearchQuery)}
             title="YouTube video player search results"
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
             allowFullScreen
         ></iframe>
     </NoVideoPlaceholder>
            )}

            <VideoControls>
                {currentVideo && currentVideo.videoChannelId && (
                    <CreditLink href={`https://www.youtube.com/channel/${currentVideo.videoChannelId}`} target="_blank" rel="noopener noreferrer">
                        {t('video_credit_label', { defaultValue: 'Credit' })}: {currentVideo.videoChannelTitle}
                    </CreditLink>
                )}
                 {/* Ensure VideoNav is always rendered even if credit link isn't */}
                <VideoNav>
                    <NavButton onClick={handlePrevVideo} disabled={currentVideoIndex <= 0}>
                        <FiChevronLeft />
                    </NavButton>
                    <NavButton onClick={handleNextVideo} disabled={currentVideoIndex >= videoHistory.length - 1}>
                        <FiChevronRight />
                    </NavButton>
                    <ChangeVideoButton onClick={() => setShowModal(true)} disabled={videoChangeCount >= 3 || courseCompletedAndPassed}>
                        {t('change_video_button_text', { defaultValue: 'Change Video' })} ({3 - videoChangeCount} {t('change_video_button_remaining', { defaultValue: 'left' })})
                    </ChangeVideoButton>
                </VideoNav>
            </VideoControls>

            {/* Display lesson content */}
            <ContentBody dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.content || t('course_generation.loading_text')) }} />
       
        </PageContainer>
    );
};

export default LessonContentPage;