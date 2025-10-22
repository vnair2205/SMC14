import api from '../utils/api'; // Import your configured API client

// Base route is defined relative to the configured API root (/api)
const BASE_ROUTE = '/pre-gen-course';

// We no longer need axios, API_URL, or getAuthHeaders

export const generateDescription = (data) => {
    // FIX: Use 'api.post'
    return api.post(`${BASE_ROUTE}/generate-description`, data);
};

export const createPreGenCourse = (data) => {
    // FIX: Use 'api.post'
    return api.post(`${BASE_ROUTE}/generate`, data);
};

export const getPreGenCourses = (page = 1, limit = 10, filters = {}) => {
    // FIX: Use the params object for clean query string creation
    const params = { page, limit };
    if (filters.category) params.category = filters.category;
    if (filters.subCategory1) params.subCategory1 = filters.subCategory1;
    if (filters.search) params.search = filters.search;
    
    // FIX: Use 'api.get' and pass params object
    return api.get(BASE_ROUTE, { params });
};

export const getPreGenCourseById = (id) => {
    // FIX: Use 'api.get'
    return api.get(`${BASE_ROUTE}/${id}`);
};

export const bulkGenerateCourses = (formData) => {
    // FIX: Use 'api.post' and override Content-Type for FormData
    return api.post(`${BASE_ROUTE}/bulk-generate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const getSubCategories2ByParent = (parentId) => {
    // FIX: Use 'api.get'
    return api.get(`${BASE_ROUTE}/subcategory2/by-parent/${parentId}`);
};

export const deletePreGenCourse = (id) => {
    // FIX: Use 'api.delete'
    return api.delete(`${BASE_ROUTE}/${id}`);
};