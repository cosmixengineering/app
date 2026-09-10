import apiClient from './apiClient';

/**
 * Dashboard API Service
 * Maps to Postman 'Super Admin Dashboard' and 'Franchise Dashboard' folders
 */

// GET /api/v1/speradmindashboard (Matches typo in Postman)
export const getAdminStats = async () => {
    return apiClient.get('/speradmindashboard');
};

// GET /api/v1/franchisedashboard/stats/:franchiseId
export const getFranchiseStats = async (franchiseId) => {
    return apiClient.get(`/franchisedashboard/stats/${franchiseId}`);
};
