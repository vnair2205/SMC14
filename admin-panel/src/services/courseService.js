// admin-panel/src/services/courseService.js
import api from '../utils/api'; // Import configured API instance

// We no longer need axios, API_URL, or getAuthHeaders

export const getCourseDetails = async (courseId) => {
    // FIX: Use 'api.get' with the path relative to /api/
    const response = await api.get(`/admin/courses/${courseId}`);
    return response.data;
};