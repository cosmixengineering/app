import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './translations/en.json';
import hi from './translations/hi.json';
import mr from './translations/mr.json';
import gu from './translations/gu.json';
import pa from './translations/pa.json';

const resources = {
    en: { translation: en },
    hi: { translation: hi },
    mr: { translation: mr },
    gu: { translation: gu },
    pa: { translation: pa },
};

const LANGUAGE_KEY = 'user-language';

const languageDetector = {
    type: 'languageDetector',
    async: true,
    detect: async (callback) => {
        try {
            const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
            if (savedLanguage) {
                return callback(savedLanguage);
            }
            return callback('en');
        } catch (error) {
            console.log('Error picking up language', error);
            return callback('en');
        }
    },
    init: () => { },
    cacheUserLanguage: async (language) => {
        try {
            await AsyncStorage.setItem(LANGUAGE_KEY, language);
        } catch (error) {
            console.log('Error saving language', error);
        }
    },
};

// Full i18n initialization
i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        compatibilityJSON: 'v3',
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    });

export default i18n;