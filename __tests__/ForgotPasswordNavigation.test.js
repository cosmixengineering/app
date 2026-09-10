/* eslint-env jest, node */
import React from 'react';
import { Keyboard, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import App from '../App';
import LoginScreen from '../src/screens/auth/LoginScreen';
import ForgotPasswordScreen from '../src/screens/auth/ForgotPasswordScreen';

jest.mock('@react-navigation/native', () => ({ NavigationContainer: 'NavigationContainer' }));
jest.mock('@react-navigation/native-stack', () => ({ createNativeStackNavigator: () => ({ Navigator: 'Navigator', Screen: 'Screen' }) }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaProvider: 'SafeAreaProvider', useSafeAreaInsets: () => ({ top: 24, bottom: 0 }) }));
jest.mock('@react-native-firebase/messaging', () => () => ({ setBackgroundMessageHandler: jest.fn() }));
jest.mock('@notifee/react-native', () => ({ onForegroundEvent: () => jest.fn(), EventType: { PRESS: 1 } }));
jest.mock('../src/services/notificationService', () => ({ initialize: jest.fn() }));
jest.mock('../src/i18n/i18n', () => ({}));
jest.mock('../src/screens/splash/SplashScreen', () => 'SplashScreen');
jest.mock('../src/screens/auth/SignupScreen', () => 'SignupScreen');
jest.mock('../src/screens/auth/OTPScreen', () => 'OTPScreen');
jest.mock('../src/navigation/AppNavigator', () => 'AppNavigator');
jest.mock('../src/api/authApi', () => ({ signin: jest.fn(), forgotPassword: jest.fn() }));
jest.mock('../src/store/authStore', () => ({}));
jest.mock('../src/components/FloatingLabelInput', () => 'FloatingLabelInput');
jest.mock('../src/components/AnimatedButton', () => 'AnimatedButton');
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key, options) => options?.defaultValue || key }) }));

test('login reset button targets the Forgot Password screen registered in the active root stack', () => {
    jest.useFakeTimers();
    const dismiss = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});
    let app;
    let login;
    const navigate = jest.fn();
    act(() => {
        app = Renderer.create(<App />);
        login = Renderer.create(<LoginScreen navigation={{ navigate }} />);
    });
    const button = login.root.findAllByType(TouchableOpacity).find(node => node.props.testID === 'forgot-password-button');
    expect(button.props.accessibilityLabel).toBe('Forgot Password?');
    expect(StyleSheet.flatten(button.props.style).minHeight).toBeGreaterThanOrEqual(48);
    expect(login.root.findByType(ScrollView).props.keyboardShouldPersistTaps).toBe('handled');
    act(() => button.props.onPress());
    expect(dismiss).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('ForgotPassword');
    const destination = app.root.findAllByType('Screen').find(node => node.props.name === navigate.mock.calls[0][0]);
    expect(destination?.props.component).toBe(ForgotPasswordScreen);
    act(() => { login.unmount(); app.unmount(); });
    dismiss.mockRestore();
    jest.useRealTimers();
});

test.each(['en', 'hi', 'mr', 'gu', 'pa'])('%s contains a readable forgot password label', lang => {
    const translation = require(`../src/i18n/translations/${lang}.json`);
    expect(translation.auth.forgotPassword).toBeTruthy();
    expect(translation.auth.forgotPassword).not.toContain('auth.');
});
