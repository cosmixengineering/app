// Auth state management
// This is a simple store using AsyncStorage
// Can be upgraded to Redux/Zustand when the app grows

import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';
const IS_LOGGED_IN_KEY = 'isLoggedIn';

const authStore = {
    // Save auth data after successful login
    saveAuthData: async (token, userData) => {
        try {
            // Backend might return { token, user: {...} } or { token, ...userFields }
            const user = userData.user || userData;

            await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
            await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
            await AsyncStorage.setItem(IS_LOGGED_IN_KEY, 'true');
        } catch (error) {
            console.log('Error saving auth data:', error);
        }
    },

    // Get stored auth token
    getToken: async () => {
        try {
            return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        } catch (error) {
            console.log('Error getting token:', error);
            return null;
        }
    },

    // Get stored user data
    getUser: async () => {
        try {
            const data = await AsyncStorage.getItem(USER_DATA_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.log('Error getting user:', error);
            return null;
        }
    },

    // Check if user is logged in
    isLoggedIn: async () => {
        try {
            const value = await AsyncStorage.getItem(IS_LOGGED_IN_KEY);
            return value === 'true';
        } catch (error) {
            return false;
        }
    },

    // Clear all auth data (logout)
    clearAuth: async () => {
        try {
            await AsyncStorage.multiRemove([
                AUTH_TOKEN_KEY,
                USER_DATA_KEY,
                IS_LOGGED_IN_KEY,
            ]);
        } catch (error) {
            console.log('Error clearing auth:', error);
        }
    },
};

export default authStore;
