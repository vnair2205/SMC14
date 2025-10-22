import api from '../utils/api'; // Import your configured API client (assumed path: ../utils/api)

// Base route is now defined relative to the API root (/api)
const CATEGORY_BASE_ROUTE = '/pre-gen-category';

// We no longer need axios, API_URL, or getAuthHeaders

export const getCategories = (page = 1, limit = 10) => {
    // FIX: Use 'api.get' with query parameters passed via the 'params' object
    return api.get(`${CATEGORY_BASE_ROUTE}/category`, { 
        params: { page, limit } 
    });
};

export const getSubCategories1ByParent = (parentId) => {
    // FIX: Use 'api.get'
    return api.get(`${CATEGORY_BASE_ROUTE}/subcategory1/by-parent/${parentId}`);
};

export const getSubCategories2ByParent = (parentId) => {
    // FIX: Use 'api.get'
    return api.get(`${CATEGORY_BASE_ROUTE}/subcategory2/by-parent/${parentId}`);
};

export const getSubCategories1 = (page = 1, limit = 10) => {
    // FIX: Use 'api.get'
    return api.get(`${CATEGORY_BASE_ROUTE}/subcategory1`, { 
        params: { page, limit } 
    });
};

export const getSubCategories2 = (page = 1, limit = 10) => {
    // FIX: Use 'api.get'
    return api.get(`${CATEGORY_BASE_ROUTE}/subcategory2`, { 
        params: { page, limit } 
    });
};

export const createCategory = (data) => {
    // FIX: Use 'api.post'
    return api.post(`${CATEGORY_BASE_ROUTE}/category`, data);
};

export const createSubCategory1 = (data) => {
    // FIX: Use 'api.post'
    return api.post(`${CATEGORY_BASE_ROUTE}/subcategory1`, data);
};

export const createSubCategory2 = (data) => {
    // FIX: Use 'api.post'
    return api.post(`${CATEGORY_BASE_ROUTE}/subcategory2`, data);
};

export const updateCategory = (id, data) => {
    // FIX: Use 'api.put'
    return api.put(`${CATEGORY_BASE_ROUTE}/category/${id}`, data);
};
export const updateSubCategory1 = (id, data) => {
    // FIX: Use 'api.put'
    return api.put(`${CATEGORY_BASE_ROUTE}/subcategory1/${id}`, data);
};
export const updateSubCategory2 = (id, data) => {
    // FIX: Use 'api.put'
    return api.put(`${CATEGORY_BASE_ROUTE}/subcategory2/${id}`, data);
};

export const deleteCategory = (id) => {
    // FIX: Use 'api.delete'
    return api.delete(`${CATEGORY_BASE_ROUTE}/category/${id}`);
};
export const deleteSubCategory1 = (id) => {
    // FIX: Use 'api.delete'
    return api.delete(`${CATEGORY_BASE_ROUTE}/subcategory1/${id}`);
};
export const deleteSubCategory2 = (id) => {
    // FIX: Use 'api.delete'
    return api.delete(`${CATEGORY_BASE_ROUTE}/subcategory2/${id}`);
};

export const bulkUpload = (formData) => {
    // FIX: Use 'api.post'
    // The configured API instance should handle the general JSON header,
    // but we explicitly override for multipart/form-data here.
    return api.post(`${CATEGORY_BASE_ROUTE}/bulk-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' } 
    });
};