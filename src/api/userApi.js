import apiClient from './apiClient';

/**
 * User API Service
 * Maps to Postman 'Users' folder (excluding generic auth)
 */

// GET /api/v1/users
export const getUsers = async (params = {}) => {
    return apiClient.get('/users', { params });
};

// GET /api/v1/users/:id
export const getUserById = async (id) => {
    return apiClient.get(`/users/${id}`);
};

// PUT /api/v1/users/:id
export const updateUser = async (id, data, headers = {}) => {
    return apiClient.put(`/users/${id}`, data, { headers });
};

// DELETE /api/v1/users/:id
export const deleteUser = async (id) => {
    return apiClient.delete(`/users/${id}`);
};

// POST /api/v1/users/fcm-token - Save FCM token for push notifications
export const saveFCMToken = async (token) => {
    return apiClient.post('/users/fcm-token', { fcmToken: token });
};

// DELETE /api/v1/users/fcm-token - Remove FCM token on logout
export const removeFCMToken = async () => {
    return apiClient.delete('/users/fcm-token');
};
