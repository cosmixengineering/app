import apiClient from './apiClient';

/**
 * Districts & Areas API Service
 * Maps to Postman 'Districts' and 'Areas' folders
 */

// Districts
export const getDistricts = async () => {
    return apiClient.get('/districts');
};

export const createDistrict = async (name) => {
    return apiClient.post('/districts', { name });
};

// Areas
export const getAreas = async () => {
    return apiClient.get('/areas');
};

export const getAreaById = async (id) => {
    return apiClient.get(`/areas/${id}`);
};

export const createArea = async (name, districtId) => {
    return apiClient.post('/areas', { name, district: districtId });
};

export const updateArea = async (id, name) => {
    return apiClient.put(`/areas/${id}`, { name });
};

export const deleteArea = async (id) => {
    return apiClient.delete(`/areas/${id}`);
};
