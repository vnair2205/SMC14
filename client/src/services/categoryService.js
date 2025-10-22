import api from '../utils/api'; // Import the configured API instance (assumed path: ../utils/api)

// We remove redundant imports, API_URL, and getAuthHeaders since 'api' handles them.

export const getCategoryCounts = () => {
    // FIX: Use 'api.get' with the relative path from the API root (/api)
    return api.get(`/public-pre-gen-courses/category-counts`);
};

// Function to get categories for filter dropdowns
export const getCategories = (page = 1, limit = 1000) => {
    // FIX: Use 'api.get' and pass query parameters via the 'params' object
    // The path here should be relative to /api/ (i.e., /pre-gen-category/category)
    return api.get(`/pre-gen-category/category`, {
        params: { page, limit }
    });
};

// Function to get subcategories for filter dropdowns
export const getSubCategories1ByParent = (parentId) => {
    // FIX: Use 'api.get' with the relative path
    return api.get(`/pre-gen-category/subcategory1/by-parent/${parentId}`);
};