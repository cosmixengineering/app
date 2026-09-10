import apiClient from './apiClient';

export const createPaymentOrder = async (amount) => {
    return apiClient.post('/payments/create-order', { amount });
};

export const verifyPayment = async (paymentDetails) => {
    return apiClient.post('/payments/verify-payment', paymentDetails);
};
