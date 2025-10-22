// client/src/services/blogService.js
import api from './api'; // <-- FIX: Import the central api instance

// const API_URL = '/api/public/blogs'; // <-- This was the problem

// --- FIX: Use the 'api' instance for all requests ---
export const getBlogs = (params) => api.get('/public/blogs', { params });
export const getBlogById = (id) => api.get(`/public/blogs/${id}`);
export const getCategories = () => api.get('/public/blogs/categories');