import apiClient from './apiClient';

export const getGallery = () => apiClient.get('/gallery');
