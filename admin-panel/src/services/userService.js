// admin-panel/src/services/userService.js
// --- FIX 1: Only import 'api' which is configured in utils ---
import api from '../utils/api';

// --- FIX 2: Removed unused constant and redundant getAuthHeaders, as 'api' handles them ---

export const getUserStats = async () => {
  try {
    // Correctly uses 'api'
    const res = await api.get('/admin/users/stats');
    return res.data;
  } catch (error) {
    console.error('Failed to fetch user stats', error);
    throw error;
  }
};

export const getUsers = async (page = 1, limit = 10, searchTerm = '', statusFilter = '') => {
  try {
    // Correctly uses 'api'
    const res = await api.get('/admin/users', {
      params: { page, limit, search: searchTerm, status: statusFilter }
    });
    return res.data;
  } catch (error) {
    console.error('Failed to fetch users', error);
    throw error;
  }
};

export const getUserDetails = async (id) => {
    // FIX: Use 'api.get' without manual headers
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
};

export const updateUserDetails = async (userId, data) => {
    // FIX: Use 'api.put' without manual headers
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data;
};

// This function is also needed by UserDetailsPage
export const updateUserStatus = async (userId, data) => {
    // FIX: Use 'api.put' without manual headers
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data;
};

export const changeUserPlan = async (userId, newPlanId) => {
    // FIX: Use 'api.post' without manual headers. Body is implicitly converted to JSON.
    const body = { userId, newPlanId };
    const response = await api.post(`/admin/users/change-plan`, body);
    return response.data;
};

export const addCourseCount = async (userId, additionalCourses) => {
    // FIX: Use 'api.post' without manual headers.
    const body = { userId, additionalCourses };
    const response = await api.post(`/admin/users/add-course-count`, body);
    return response.data;
};

export const getUserCourses = async (userId) => {
    // FIX: Use 'api.get' without manual headers
    const response = await api.get(`/admin/users/${userId}/courses`);
    return response.data;
};

export const getCourseForUser = async (userId, courseId) => {
  // Already correct, uses 'api'
  const response = await api.get(`/admin/users/${userId}/courses/${courseId}`);
  return response.data;
};


export const getChatForUserCourse = async (userId, courseId) => {
  // Already correct, uses 'api'
  const response = await api.get(`/admin/users/${userId}/courses/${courseId}/chat`);
  return response.data;
};


export const getUserAllCourses = async (userId) => {
    try {
        // Already correct, uses 'api'
        const res = await api.get(`/admin/users/${userId}/courses`);
        return res.data;
    } catch (err) {
        console.error('Failed to fetch user courses', err);
        throw err;
    }
};