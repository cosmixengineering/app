import apiClient from './apiClient';

/**
 * Requirements API Service
 * Maps to Postman 'Requirements' folder
 */

// POST /api/v1/requirements
export const addRequirement = async (data) => {
    return apiClient.post('/requirements', data);
};

// GET /api/v1/requirements
export const getRequirements = async () => {
    return apiClient.get('/requirements');
};

// DELETE /api/v1/requirements/:id
export const deleteRequirement = async (id) => {
    return apiClient.delete(`/requirements/${id}`);
};
