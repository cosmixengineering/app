import apiClient from './apiClient';

/**
 * Notifications API Service
 * Maps to Postman 'Notifications' folder
 */

// GET /api/v1/notifications
export const getNotifications = async () => {
    return apiClient.get('/notifications');
};

// DELETE /api/v1/notifications/:id
export const deleteNotification = async (id) => {
    return apiClient.delete(`/notifications/${id}`);
};
