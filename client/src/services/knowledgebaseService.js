// client/src/services/knowledgebaseService.js
import axios from 'axios';

const API_URL = '/api/public/kb';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  // Return empty object if no token, to avoid sending 'null' header
  return token ? { headers: { 'x-auth-token': token } } : {};
};

export const getCategories = () => axios.get(`${API_URL}/categories`, getAuthHeaders());

export const getArticles = (params) => axios.get(`${API_URL}/articles`, { ...getAuthHeaders(), params });

export const getArticleById = (id) => axios.get(`${API_URL}/articles/${id}`, getAuthHeaders());

// MODIFIED LINE: Added getAuthHeaders() to the search request
export const searchArticles = (query) => axios.get(`${API_URL}/search`, { ...getAuthHeaders(), params: { q: query } });