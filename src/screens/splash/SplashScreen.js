import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, StatusBar, Dimensions, Animated, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../constants/colors';
import authStore from '../../store/authStore';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
    const scaleAnim = useRef(new Animated.Value(0.6)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 15,
                friction: 5,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 2200,
            useNativeDriver: false,
        }).start();

        const timer = setTimeout(async () => {
            try {
                const loggedIn = await authStore.isLoggedIn();
                if (loggedIn) {
                    navigation.replace('MainApp', {
                        screen: 'Home'
                    });
                } else {
                    // User NOT logged in → Go to Signup page
                    navigation.replace('Signup');
                }
            } catch (e) {
                // Error → Go to Signup page
                navigation.replace('Signup');
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigation, scaleAnim, opacityAnim, progressAnim]);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <LinearGradient
                colors={Colors.gradientDark}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>

                <Animated.View style={[
                    styles.logoWrapper,
                    { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }
                ]}>
                    <View style={styles.logoCircle}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                </Animated.View>

                <View style={styles.footer}>
                    <Text style={styles.versionLabel}>Premium Experience v1.0</Text>
                    <View style={styles.loadingContainer}>
                        <View style={styles.loadingTrack}>
                            <Animated.View style={[styles.loadingFill, { width: progressWidth }]} />
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoCircle: {
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: width * 0.25,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    footer: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 60 : 40,
        width: '100%',
        alignItems: 'center',
    },
    versionLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 15,
        textTransform: 'uppercase',
    },
    loadingContainer: {
        width: 140,
        height: 3,
    },
    loadingTrack: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    loadingFill: {
        height: '100%',
        backgroundColor: Colors.accentMuted,
        borderRadius: 2,
    },
});

export default SplashScreen;
