/* eslint-env jest, node */
import React from 'react';
import { Alert, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import ForgotPasswordScreen from '../src/screens/auth/ForgotPasswordScreen';
import OTPScreen from '../src/screens/auth/OTPScreen';
import apiClient from '../src/api/apiClient';

jest.mock('../src/api/apiClient', () => ({ post: jest.fn() }));
jest.mock('../src/store/authStore', () => ({}));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 24, bottom: 0 }) }));
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
jest.mock('../src/components/FloatingLabelInput', () => 'FloatingLabelInput');
jest.mock('../src/components/AnimatedButton', () => 'AnimatedButton');
jest.mock('../src/components/CustomButton', () => 'CustomButton');
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key, options) => options?.defaultValue || key }) }));

let tree;
let navigation;
beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    navigation = { navigate: jest.fn(), goBack: jest.fn() };
});
afterEach(() => {
    if (tree) { act(() => tree.unmount()); }
    jest.restoreAllMocks();
    jest.useRealTimers();
});
const renderForgot = () => act(() => { tree = Renderer.create(<ForgotPasswordScreen navigation={navigation} />); });
const setIdentifier = value => act(() => tree.root.findByType('FloatingLabelInput').props.onChangeText(value));
const sendOtp = () => act(async () => { await tree.root.findByType('AnimatedButton').props.onPress(); });
const renderReset = () => act(() => {
    tree = Renderer.create(<OTPScreen navigation={navigation} route={{ params: { email: 'test@example.com', mode: 'forgot' } }} />);
});
const fillReset = (password = 'NewPass123', confirm = password, otp = '123456') => {
    const inputs = tree.root.findAllByType(TextInput);
    otp.split('').forEach((digit, index) => act(() => inputs[index].props.onChangeText(digit)));
    act(() => inputs[6].props.onChangeText(password));
    act(() => inputs[7].props.onChangeText(confirm));
};
const reset = () => act(async () => { await tree.root.findByType('CustomButton').props.onPress(); });

test('empty identifier stays on the form without requesting an OTP', async () => {
    renderForgot();
    setIdentifier('   ');
    await sendOtp();
    expect(apiClient.post).not.toHaveBeenCalled();
    expect(navigation.navigate).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalled();
});

test.each(['test@example.com', '9999999999'])('requests an OTP for %s and opens reset mode after success', async identifier => {
    apiClient.post.mockResolvedValue({ data: { success: true } });
    renderForgot();
    setIdentifier(` ${identifier} `);
    await sendOtp();
    expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: identifier, contact: identifier, phone: identifier,
    }, { timeout: 90000 });
    expect(navigation.navigate).toHaveBeenCalledWith('OTP', { email: identifier, mode: 'forgot' });
});

test('OTP request failure shows the server message and allows retry', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    apiClient.post.mockRejectedValue({ response: { data: { message: 'Account not found' } } });
    renderForgot();
    setIdentifier('test@example.com');
    await sendOtp();
    expect(navigation.navigate).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Account not found');
    expect(tree.root.findByType('AnimatedButton').props.loading).toBe(false);
});

test('submits the OTP and matching new passwords, then returns to login', async () => {
    apiClient.post.mockResolvedValue({ data: { success: true } });
    renderReset();
    fillReset();
    expect(tree.root.findByType(ScrollView).props.keyboardShouldPersistTaps).toBe('handled');
    await reset();
    expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password', {
        email: 'test@example.com', otp: '123456', password: 'NewPass123', confirmPassword: 'NewPass123',
    });
    const alert = Alert.alert.mock.calls[0];
    expect(alert[1]).toContain('password has been reset');
    act(() => alert[2][0].onPress());
    expect(navigation.navigate).toHaveBeenCalledWith('Login');
});

test.each([
    ['NewPass123', 'Different123', '123456'],
    ['123', '123', '123456'],
    ['NewPass123', 'NewPass123', '123'],
    ['NewPass123', 'NewPass123', 'abcdef'],
])('blocks invalid reset input (%s / %s / %s)', async (password, confirm, otp) => {
    renderReset();
    fillReset(password, confirm, otp);
    await reset();
    expect(apiClient.post).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalled();
    expect(tree.root.findByType('CustomButton').props.loading).toBe(false);
});

test('expired OTP stays on reset form and displays the server error', async () => {
    apiClient.post.mockRejectedValue({ response: { data: { message: 'OTP expired' } } });
    renderReset();
    fillReset();
    await reset();
    expect(Alert.alert).toHaveBeenCalledWith('auth.verificationFailed', 'OTP expired');
    expect(navigation.navigate).not.toHaveBeenCalled();
    expect(tree.root.findByType('CustomButton').props.loading).toBe(false);
});

test('resends once after cooldown and disables resend while waiting for the API', async () => {
    let resolveRequest;
    apiClient.post.mockImplementation(() => new Promise(resolve => { resolveRequest = resolve; }));
    renderReset();
    for (let second = 0; second < 30; second++) { act(() => jest.advanceTimersByTime(1000)); }
    const resend = () => tree.root.findAllByType(TouchableOpacity).find(node => node.props.accessibilityRole === 'button');
    act(() => { resend().props.onPress(); });
    expect(resend().props.disabled).toBe(true);
    act(() => { resend().props.onPress(); });
    expect(apiClient.post).toHaveBeenCalledTimes(1);
    await act(async () => { resolveRequest({ data: { success: true } }); });
    expect(resend()).toBeUndefined();
    expect(Alert.alert).toHaveBeenCalledWith('auth.otpSent', 'auth.otpSentDesc');
});
