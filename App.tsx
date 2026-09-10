import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import notificationService from './src/services/notificationService';
import './src/i18n/i18n'; // Initialize i18n

// Screens
import SplashScreen from './src/screens/splash/SplashScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import OTPScreen from './src/screens/auth/OTPScreen';
import AppNavigator from './src/navigation/AppNavigator';

const RootStack = createNativeStackNavigator();

// Background message handler (must be outside component)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[Background] Message received:', remoteMessage);
  
  // Display notification using Notifee
  await notifee.displayNotification({
    title: remoteMessage.notification?.title || '🏠 SS Property Guru',
    body: remoteMessage.notification?.body || 'New update available',
    android: {
      channelId: remoteMessage.data?.type === 'new_property' ? 'property' : 'default',
      smallIcon: 'ic_launcher',
      color: '#16A085',
      pressAction: {
        id: 'default',
      },
    },
    data: remoteMessage.data || {},
  });
});

const App = () => {
  useEffect(() => {
    // Initialize push notifications
    try {
      notificationService.initialize();
    } catch (error) {
      console.log('[App] Notification service init failed:', error);
    }

    // Handle notification press events
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log('[App] Notification pressed:', detail.notification);
        // Handle navigation based on notification data
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootStack.Navigator
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <RootStack.Screen name="Splash" component={SplashScreen} />
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Signup" component={SignupScreen} />
          <RootStack.Screen name="OTP" component={OTPScreen} />
          <RootStack.Screen name="MainApp" component={AppNavigator} />
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
