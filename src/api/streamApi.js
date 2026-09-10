import apiClient from './apiClient';

/**
 * Stream API Service
 * Maps to Postman 'Stream' folder
 */

// POST /api/v1/stream/set
export const setStream = async (url) => {
    return apiClient.post('/stream/set', { youtubeUrl: url, isActive: true });
};

// GET /api/v1/stream/current
export const getCurrentStream = async () => {
    return apiClient.get('/stream/current');
};

// DELETE /api/v1/stream/delete
export const deleteStream = async () => {
    return apiClient.delete('/stream/delete');
};
