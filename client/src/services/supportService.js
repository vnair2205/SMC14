// client/src/services/supportService.js
import api from './api'; // Assuming api.js is in the same folder

export const getCategories = () => {
    // Fetches public categories - path is relative to baseURL
    return api.get('/public/support/categories');
};

export const getUserTickets = (params) => {
    // Fetches tickets for the logged-in user - path is relative to baseURL
    return api.get('/support', { params }); // Ensure path is just /support
};

export const createTicket = (formData) => {
    // Creates a ticket for the logged-in user - path is relative to baseURL
    return api.post('/support', formData, { // Ensure path is just /support
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const getTicketById = (id) => {
    // Fetches a specific ticket for the logged-in user - path is relative to baseURL
    return api.get(`/support/${id}`); // Ensure path starts with /support/
};

export const addReply = (id, formData) => {
    // Adds a reply to a specific ticket for the logged-in user - path is relative to baseURL
    return api.post(`/support/reply/${id}`, formData, { // Ensure path starts with /support/reply/
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};