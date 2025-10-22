// client/src/pages/dashboard/CourseViewPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';
// --- FIX: Removed axios import ---
// import axios from 'axios';
import Preloader from '../../components/common/Preloader';
import CourseLayout from '../../components/layout/course/CourseLayout';
import { useTranslation } from 'react-i18next';
// --- FIX: Added correct api import ---
import api from '../../services/api';

const CourseViewPage = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshCourseData = () => {
        console.log('[CourseViewPage] Refresh triggered by child!');
        setRefreshTrigger(prev => prev + 1);
    };

    useEffect(() => {
        const fetchCourseDetails = async () => {
            setLoading(true);
            setError('');
            // --- FIX: Token check is okay, but we don't need to manually add it to headers ---
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // --- FIX: Use api.get and remove /api prefix ---
                // --- FIX: Removed manual config/token ---
                const res = await api.get(`/course/${courseId}`);
                setCourse(res.data);
            } catch (err) {
                console.error("Error fetching course details:", err.response ? err.response.data : err.message);
                setError(t(err.response?.data?.msgKey || 'errors.generic'));
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourseDetails();
        }
    }, [courseId, navigate, t, refreshTrigger]);

    useEffect(() => {
        // When the course data is loaded and no specific lesson is selected in the URL
        if (course && !lessonId) {
            // Find the first subtopic and the first lesson from the course index
            const firstSubtopic = course.index?.subtopics?.[0];
            const firstLesson = firstSubtopic?.lessons?.[0];

            // If a valid first lesson is found, navigate to its page
            if (firstSubtopic?._id && firstLesson?._id) {
                navigate(`/course/${courseId}/lesson/${firstSubtopic._id}/${firstLesson._id}`, { replace: true });
            }
        }
    }, [course, lessonId, courseId, navigate]);

    const courseCompletedAndPassed = course && course.status === 'Completed' && course.score !== undefined && course.quiz && course.quiz.length > 0 && (course.score / course.quiz.length) * 100 >= 60;

    if (loading) {
        return <Preloader />;
    }

    if (error) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;
    }

    if (!course) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>Course not found or no data available.</div>;
    }

    return (
        <CourseLayout course={course} courseCompletedAndPassed={courseCompletedAndPassed}>
            <Outlet context={{ refreshCourseData, course, courseCompletedAndPassed }} />
        </CourseLayout>
    );
};

export default CourseViewPage;