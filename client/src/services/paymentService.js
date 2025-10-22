// client/src/services/paymentService.js
import axios from 'axios';

// --- START FIX: Use the environment variable as the base for all API calls ---
// process.env.REACT_APP_API_URL is 'https://api.seekmycourse.com/api'
const paymentApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL, 
});
// --- END FIX ---

paymentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// We must now ensure the paths here are correct relative to the new baseURL.
// The baseURL ends in /api. The payment endpoints are: /api/payments/...
// So, we need to prefix the endpoint routes with '/payments'.

const createOrder = (planId) => {
  // Path changed from '/create-order' to '/payments/create-order'
  return paymentApi.post('/payments/create-order', { planId });
};

const verifyPayment = (paymentData) => {
  // Path changed from '/verify-payment' to '/payments/verify-payment'
  return paymentApi.post('/payments/verify-payment', paymentData);
};

const paymentService = {
  createOrder,
  verifyPayment,
};

export default paymentService;