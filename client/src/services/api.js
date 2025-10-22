// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

/* !!! IMPORTANT FIX !!!
  This interceptor automatically adds the user's 'token' 
  from localStorage to every API request.
*/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Use 'token' for the client app
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;