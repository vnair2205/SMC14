// admin-panel/src/services/subscriptionService.js
// --- FIX 1: Removed unused 'axios' import ---
import api from './api'; // Configured API instance is used here

// --- FIX 2: Removed unused constants and manual token handling ---

const getPlans = () => {
    // FIX: Use the configured 'api' instance
    return api.get('/subscriptions'); 
};

// 👇 This is the new function for the admin panel
const getAllPlans = () => {
    // FIX: Use the configured 'api' instance
    // The base URL already ends in /api, so the path is /subscriptions/all
    return api.get('/subscriptions/all');
};

const addPlan = (planData) => {
    // FIX: Use the configured 'api' instance
    return api.post('/subscriptions', planData);
};

const updatePlan = (id, planData) => {
    // FIX: Use the configured 'api' instance
    return api.put(`/subscriptions/${id}`, planData);
};

const deletePlan = (id) => {
    // FIX: Use the configured 'api' instance
    return api.delete(`/subscriptions/${id}`);
};

const subscriptionService = {
    getPlans,
    getAllPlans,
    addPlan,
    updatePlan,
    deletePlan,
};


/**
 * Gets a single subscription's details by its ID (for admins).
 * This function was already correct and serves as the model for the fix.
 * @param {string} id - The ID of the subscription.
 * @returns {Promise<Object>} The subscription data.
 */
export const getSubscriptionById = async (id) => {
    try {
        const response = await api.get(`/subscriptions/invoice/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching subscription details for ID ${id}:`, error);
        throw error;
    }
};

export default subscriptionService;