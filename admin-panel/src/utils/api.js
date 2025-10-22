import axios from 'axios';

const api = axios.create({
  // --- FIX: Use environment variable which now contains the deployed domain and /api suffix ---
  baseURL: process.env.REACT_APP_API_URL, 
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  config => {
    // This token logic is correct for the Admin Panel
    const token = localStorage.getItem('adminToken'); 
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default api;