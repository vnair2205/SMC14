// admin-panel/src/components/layout/course/AdminCourseLayout.js
import React, { useState, useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import styled from 'styled-components';
// --- FIX 1: Import the configured API instance ---
import api from '../../../utils/api'; 
// --- FIX 2: axios is no longer needed
import AdminCourseSidebar from './AdminCourseSidebar';
import Preloader from '../../common/Preloader';

// --- FIX: Renamed this component from LayoutContainer ---
const CourseLayoutContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const MainContent = styled.main`
  flex-grow: 1;
  height: 100vh;
  overflow-y: auto;
  /* Adjust this margin to account for the fixed sidebar's width */
  margin-left: 300px; 
`;

const AdminCourseLayout = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            setLoading(true);
            try {
                // --- FIX 3: Removed manual token fetching. Use 'api.get' only. ---
                // The configured API instance (api from ../../../utils/api) handles the token automatically.
                const res = await api.get(`/admin/course-details/${courseId}`);
                setCourse(res.data);
            } catch (error) {
                console.error("Failed to fetch course data", error);
                // Redirect to login if unauthorized
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('adminToken');
                    window.location.href = '/admin/login';
                }
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    if (loading) return <Preloader />;

    return (
        <CourseLayoutContainer>
            {/* The sidebar will be passed the correct base path */}
            <AdminCourseSidebar course={course} basePath="/admin/view-course" />
            
            <MainContent>
                <Outlet context={{ course }} />
            </MainContent>
        </CourseLayoutContainer>
    );
};

export default AdminCourseLayout;