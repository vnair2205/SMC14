// client/src/services/knowledgebaseService.js
// --- FIX: Removed axios import ---
// import axios from 'axios';
// --- FIX: Added api import ---
import api from './api'; // Assuming api.js is in the same folder

// --- FIX: Removed API_URL constant and getAuthHeaders ---
// const API_URL = '/api/public/kb';
// const getAuthHeaders = () => { ... };

export const getCategories = () => {
    // --- FIX: Use api.get with relative path ---
    // Note: This endpoint '/public/kb/categories' might need auth depending on your backend setup.
    // If it's truly public and doesn't need a token, this is fine.
    // If it DOES need a token (like other dashboard features), the api instance automatically adds it.
    return api.get('/public/kb/categories');
};

export const getArticles = (params) => {
    // --- FIX: Use api.get with relative path and params object ---
    return api.get('/public/kb/articles', { params });
};

export const getArticleById = (id) => {
    // --- FIX: Use api.get with relative path ---
    return api.get(`/public/kb/articles/${id}`);
};

export const searchArticles = (query) => {
    // --- FIX: Use api.get with relative path and params object ---
    return api.get('/public/kb/search', { params: { q: query } });
};