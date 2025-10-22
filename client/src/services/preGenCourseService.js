// client/src/services/preGenCourseService.js
// --- FIX: Change import path to the configured API client (which includes token interceptor) ---
import api from '../utils/api'; 
// The configured client/src/utils/api.js should have the interceptor to add the 'x-auth-token'.

// We no longer need the API_URL constant.

export const getPreGenCourses = (filters = {}, page = 1) => {
    // Set the limit to 50 
    const params = { page, limit: 50 }; 
    if (filters.category) params.category = filters.category;
    if (filters.language) params.language = filters.language;
    if (filters.search) params.search = filters.search;

    // Use api.get with relative path and params object
    // The configured API instance in utils/api adds the token automatically.
    return api.get('/public-pre-gen-courses', { params });
};

export const getCategoryCounts = () => {
    // Use api.get with relative path
    return api.get('/public-pre-gen-courses/category-counts');
};

export const getPreGenCourseById = (id) => {
    // Use api.get with relative path
    return api.get(`/public-pre-gen-courses/${id}`);
};

export const startCourse = (id) => {
    // Use api.post with relative path
    return api.post(`/public-pre-gen-courses/${id}/start`, {}); 
};