// admin-panel/src/services/knowledgebaseService.js
import api from './api'; // FIX: Import the configured API instance instead of generic axios

// --- CATEGORY API ---
// FIX: Removed the redundant '/api' prefix since the base URL already includes it
const CATEGORY_API_URL = '/knowledgebase/category';
// --- ARTICLE API ---
// FIX: Removed the redundant '/api' prefix since the base URL already includes it
const ARTICLE_API_URL = '/knowledgebase/article';

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return { headers: { 'x-auth-token': token } };
};

// Category Functions
export const getCategories = () => api.get(CATEGORY_API_URL, getAuthHeaders()); // FIX: Use 'api'
export const addCategory = (name) => api.post(CATEGORY_API_URL, { name }, getAuthHeaders()); // FIX: Use 'api'
export const updateCategory = (id, name) => api.put(`${CATEGORY_API_URL}/${id}`, { name }, getAuthHeaders()); // FIX: Use 'api'
export const deleteCategory = (id) => api.delete(`${CATEGORY_API_URL}/${id}`, getAuthHeaders()); // FIX: Use 'api'

// --- NEW ARTICLE FUNCTIONS ---
export const getArticles = (params) => api.get(ARTICLE_API_URL, { ...getAuthHeaders(), params }); // FIX: Use 'api'
export const addArticle = (articleData) => api.post(ARTICLE_API_URL, articleData, getAuthHeaders()); // FIX: Use 'api'
export const updateArticle = (id, articleData) => api.put(`${ARTICLE_API_URL}/${id}`, articleData, getAuthHeaders()); // FIX: Use 'api'
export const deleteArticle = (id) => api.delete(`${ARTICLE_API_URL}/${id}`, getAuthHeaders()); // FIX: Use 'api'
export const getArticleById = (id) => api.get(`${ARTICLE_API_URL}/${id}`, getAuthHeaders()); // FIX: Use 'api'