import apiClient from './apiClient';

/**
 * Authentication API Service
 * Maps to Postman 'Auth' folder
 */

// POST /api/v1/auth/signup
export const signup = async (data) => {
    if (data instanceof FormData) {
        // For FormData, let axios handle Content-Type with boundary
        return apiClient.post('/auth/signup', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 90000 // Increased timeout for OTP sending
        });
    } else {
        // For JSON, send as plain object (axios will serialize)
        // Ensure data is not null/undefined
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid signup data');
        }
        return apiClient.post('/auth/signup', data, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 90000 // Increased timeout for OTP sending
        });
    }
};

// POST /api/v1/auth/signin
export const signin = async (email, password) => {
    return apiClient.post('/auth/signin', { email, password });
};

// GET /api/v1/auth/me/:id
export const getMe = async (id) => {
    return apiClient.get(`/auth/me/${id}`);
};

// POST /api/v1/auth/forgot-password
export const forgotPassword = async (identifier) => {
    return apiClient.post('/auth/forgot-password', { email: identifier, contact: identifier, phone: identifier }, {
        timeout: 90000 // Increased timeout for OTP sending
    });
};

// POST /api/v1/auth/verify-otp
export const verifyOtp = async (email, otp) => {
    return apiClient.post('/auth/verify-otp', { email, otp });
};

// POST /api/v1/auth/reset-password
export const resetPassword = async (data) => {
    return apiClient.post('/auth/reset-password', data);
};

// Legacy support if needed for old phone logic (Mapped to forgot-password if it's OTP based)
export const sendOtp = async (email) => {
    return forgotPassword(email);
};
