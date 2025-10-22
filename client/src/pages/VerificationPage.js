// client/src/pages/VerificationPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
// --- FIX: Removed axios import ---
// import axios from 'axios';
import Preloader from '../components/common/Preloader';
import logo from '../assets/seekmycourse_logo.png';
// --- FIX: Added correct api import ---
import api from '../services/api'; // Adjust path if needed

// --- Styled Components (Remain the same) ---
const PageContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: 100vh;
  padding: 2rem;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Logo = styled.img`
  width: 200px;
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background-color: #33333d; // Default background
  padding: 2rem;            // Default padding
  border-radius: 12px;       // Default border-radius

  @media (max-width: 768px) {
    background-color: transparent; // Remove background on mobile
    padding: 0;                   // Remove padding on mobile
    border-radius: 0;          // Remove border-radius on mobile
    box-shadow: none;           // Remove any potential shadow
    border: none;               // Remove any potential border
  }
  
`;
const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  border-bottom: 1px solid #555;
  padding-bottom: 0.5rem;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: white; // Ensure text is visible
`;

const DetailLabel = styled.strong`
  color: #a0a0a0;
  margin-right: 1rem; // Add some spacing
`;

const FormattedList = styled.ol`
    margin-left: 1.5rem;
    padding-left: 0;
    li {
        margin-bottom: 0.5rem;
        color: white;
    }
`;

const IndexSubtopicTitle = styled.h4`
    color: ${({ theme }) => theme.colors.primary};
    margin-top: 1rem;
    margin-bottom: 0.5rem;
`;

const IndexLessonList = styled.ul`
    list-style: disc; // Use standard bullets for lessons
    padding-left: 20px;
    margin-left: 1.5rem;
    li {
        color: white;
        margin-bottom: 0.3rem;
    }
`;


const FooterText = styled.p`
  text-align: center;
  margin-top: 3rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const ErrorContainer = styled(PageContainer)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
`;

const ErrorMessage = styled.h1`
    color: ${({ theme }) => theme.colors.error || 'red'};
    margin-top: 1rem;
`;


const VerificationPage = () => {
    const { courseId, userId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVerificationData = async () => {
            setLoading(true); // Ensure loading is true at the start
            setError(''); // Clear previous errors
            try {
                // --- FIX: Use api.get and remove /api prefix ---
                const res = await api.get(`/course/verify/${courseId}/${userId}`); // Corrected Call
                setData(res.data);
            } catch (err) {
                 console.error("Verification fetch error:", err.response || err); // Log the actual error
                setError("This certificate could not be verified or has expired.");
            } finally {
                setLoading(false);
            }
        };
        // Ensure courseId and userId are present before fetching
        if (courseId && userId) {
             fetchVerificationData();
        } else {
             setError("Invalid verification link.");
             setLoading(false);
        }
    }, [courseId, userId]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return 'N/A';
            return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch (e) {
            console.error("Error formatting date:", e);
            return 'N/A';
        }
    };


    if (loading) return <Preloader />;

    if (error || !data) {
        return (
            <ErrorContainer>
                 <Header>
                    <Logo src={logo} alt="SeekMyCourse Logo" />
                 </Header>
                 <ErrorMessage>{error || "Certificate data not found."}</ErrorMessage>
            </ErrorContainer>
        );
    }

    // Split objectives and outcomes into lines for numbered list display
    const objectiveLines = data.course.objective ? data.course.objective.split('\n').filter(line => line.trim() !== '') : [];
    const outcomeLines = data.course.outcome ? data.course.outcome.split('\n').filter(line => line.trim() !== '') : [];

    return (
        <PageContainer>
            <Header>
                <Logo src={logo} alt="SeekMyCourse Logo" />
            </Header>
            <ContentWrapper>
                <SectionTitle>Student Details</SectionTitle>
                <DetailRow><DetailLabel>First Name:</DetailLabel> <span>{data.user.firstName}</span></DetailRow>
                <DetailRow><DetailLabel>Last Name:</DetailLabel> <span>{data.user.lastName}</span></DetailRow>

                <SectionTitle>Course Details</SectionTitle>
                <DetailRow><DetailLabel>Course Topic:</DetailLabel> <span>{data.course.topic}</span></DetailRow>
                <DetailRow><DetailLabel>Started On:</DetailLabel> <span>{formatDate(data.course.startDate)}</span></DetailRow>
                <DetailRow><DetailLabel>Completed On:</DetailLabel> <span>{formatDate(data.course.completionDate)}</span></DetailRow>
                <DetailRow><DetailLabel>Score:</DetailLabel> <span>{data.course.percentageScored}%</span></DetailRow>

                <SectionTitle>Course Objective</SectionTitle>
                {objectiveLines.length > 0 ? (
                    <FormattedList>
                        {objectiveLines.map((line, i) => (
                            <li key={`obj-${i}`}>{line.trim()}</li>
                        ))}
                    </FormattedList>
                ) : (
                    <p style={{color: 'white'}}>No objectives provided.</p>
                )}

                <SectionTitle>Course Outcome</SectionTitle>
                {outcomeLines.length > 0 ? (
                    <FormattedList>
                        {outcomeLines.map((line, i) => (
                            <li key={`out-${i}`}>{line.trim()}</li>
                        ))}
                    </FormattedList>
                ) : (
                    <p style={{color: 'white'}}>No outcomes provided.</p>
                )}

                <SectionTitle>Course Index</SectionTitle>
                {data.course.index && data.course.index.subtopics ? (
                     data.course.index.subtopics.map((subtopic, index) => (
                        <div key={index}>
                            <IndexSubtopicTitle>{index + 1}. {subtopic.title}</IndexSubtopicTitle>
                            <IndexLessonList>
                                {subtopic.lessons && subtopic.lessons.map((lesson, i) => <li key={i}>{lesson.title}</li>)}
                            </IndexLessonList>
                        </div>
                    ))
                 ) : (
                     <p style={{color: 'white'}}>Course index not available.</p>
                 )}
            </ContentWrapper>
            <FooterText>Start your learning journey with SeekMYCOURSE TODAY!</FooterText>
        </PageContainer>
    );
};

export default VerificationPage;