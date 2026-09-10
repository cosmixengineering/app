import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/splash/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import PrivacyPolicyScreen from '../screens/corporate/PrivacyPolicyScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </Stack.Navigator>
    );
};

export default AuthNavigator;
