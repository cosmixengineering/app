import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL - Railway production server
const BASE_URL = 'https://sspropertyguru-production.up.railway.app/api/v1';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 60000, // Increased to 60 seconds for slow connections
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Debug logging for signup requests
        if (config.url?.includes('/auth/signup')) {
            console.log('=== SIGNUP REQUEST DEBUG ===');
            console.log('URL:', config.url);
            console.log('Method:', config.method);
            console.log('Headers:', config.headers);
            console.log('Data type:', typeof config.data);
            console.log('Data instanceof FormData:', config.data instanceof FormData);
            console.log('Data:', config.data);
            console.log('===========================');
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global Errors
apiClient.interceptors.response.use(
    (response) => {
        // Fix ApiResponse.success() arg order bug in backend:
        // Backend controllers call ApiResponse.success('message string', actualData)
        // but the static method signature is success(data, message)
        // This puts the string in .data and actual array/object in .message
        // Detect and swap them so all screens get consistent res.data.data = actual data
        const d = response.data;
        if (
            d &&
            typeof d === 'object' &&
            typeof d.data === 'string' &&
            (Array.isArray(d.message) || (d.message && typeof d.message === 'object' && !Array.isArray(d.message) && d.message !== null))
        ) {
            console.log('🔄 API Response Swap:', response.config.url);
            console.log('   Before: data =', typeof d.data, ', message =', typeof d.message);
            // Swap: real data is in .message, string label is in .data
            response.data = { ...d, data: d.message, message: d.data };
            console.log('   After: data =', typeof response.data.data, ', message =', typeof response.data.message);
        }
        return response;
    },
    async (error) => {
        // Log detailed error for debugging
        console.log('=== API ERROR DEBUG ===');
        console.log('Error Code:', error.code);
        console.log('Error Message:', error.message);
        console.log('Response Status:', error.response?.status);
        console.log('Response Data:', error.response?.data);
        console.log('Request URL:', error.config?.url);
        console.log('Request Method:', error.config?.method);
        console.log('======================');

        if (error.code === 'ECONNABORTED') {
            console.error('API Timeout:', error);
            error.message = 'Request timeout. Please check your connection and try again.';
        }
        
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            console.error('Network Error:', error);
            error.message = 'Network Error. Please check your internet connection.';
        }

        if (error.response?.status === 401) {
            // Token expired - clear storage and redirect to login
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userData');
        }
        
        return Promise.reject(error);
    },
);

export default apiClient;
