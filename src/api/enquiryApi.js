import apiClient from './apiClient';

/**
 * Enquiry API Service
 * Maps to Postman 'Enquiries' folder
 */

// POST /api/v1/enquiries
export const createEnquiry = async (data) => {
    return apiClient.post('/enquiries', data);
};

// GET /api/v1/enquiries
export const getEnquiries = async () => {
    return apiClient.get('/enquiries');
};

// PUT /api/v1/enquiries/:id
export const updateEnquiry = async (id, status) => {
    return apiClient.put(`/enquiries/${id}`, { status });
};

// DELETE /api/v1/enquiries/:id
export const deleteEnquiry = async (id) => {
    return apiClient.delete(`/enquiries/${id}`);
};
