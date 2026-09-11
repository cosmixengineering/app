import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, StatusBar, KeyboardAvoidingView,
    Platform, ScrollView, Alert, TouchableOpacity, Animated, Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import Colors from '../../constants/colors';
import FloatingLabelInput from '../../components/FloatingLabelInput';
import AnimatedButton from '../../components/AnimatedButton';
import { signup } from '../../api/authApi';
import authStore from '../../store/authStore';
import GetLocation from 'react-native-get-location';

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const SignupScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [loading, setLoading] = useState(false);

    // Staggered Animations
    const headerAnim = useRef(new Animated.Value(0)).current;
    const headerSlide = useRef(new Animated.Value(-30)).current;
    const avatarAnim = useRef(new Animated.Value(0)).current;
    const avatarSlide = useRef(new Animated.Value(20)).current;
    const field1Anim = useRef(new Animated.Value(0)).current;
    const field1Slide = useRef(new Animated.Value(20)).current;
    const field2Anim = useRef(new Animated.Value(0)).current;
    const field2Slide = useRef(new Animated.Value(20)).current;
    const field3Anim = useRef(new Animated.Value(0)).current;
    const field3Slide = useRef(new Animated.Value(20)).current;
    const field4Anim = useRef(new Animated.Value(0)).current;
    const field4Slide = useRef(new Animated.Value(20)).current;
    const btnAnim = useRef(new Animated.Value(0)).current;
    const btnSlide = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.stagger(80, [
            Animated.parallel([
                Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.spring(headerSlide, { toValue: 0, tension: 20, friction: 6, useNativeDriver: true })
            ]),
            Animated.parallel([
                Animated.timing(avatarAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.spring(avatarSlide, { toValue: 0, tension: 30, friction: 7, useNativeDriver: true })
            ]),
            Animated.parallel([
                Animated.timing(field1Anim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.spring(field1Slide, { toValue: 0, tension: 30, friction: 7, useNativeDriver: true })
            ]),
            Animated.parallel([
                Animated.timing(field2Anim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.spring(field2Slide, { toValue: 0, tension: 30, friction: 7, useNativeDriver: true })
            ]),
            Animated.parallel([
                Animated.timing(field3Anim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.spring(field3Slide, { toValue: 0, tension: 30, friction: 7, useNativeDriver: true })
            ]),
            Animated.parallel([
                Animated.timing(field4Anim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.spring(field4Slide, { toValue: 0, tension: 30, friction: 7, useNativeDriver: true })
            ]),
            Animated.parallel([
                Animated.timing(btnAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.spring(btnSlide, { toValue: 0, tension: 30, friction: 7, useNativeDriver: true })
            ]),
        ]).start();
    }, []);

    const isSubmitting = useRef(false);

    const handlePickImage = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (response) => {
            if (response.assets && response.assets.length > 0) {
                const file = response.assets[0];
                if (file.fileSize && file.fileSize > 5 * 1024 * 1024) {
                    Alert.alert('Image Too Large', 'Please select an image under 5MB.');
                    return;
                }
                setAvatar(file);
            }
        });
    };

    const handleSignup = async () => {
        if (loading || isSubmitting.current) return;

        const trimmedName = (name || '').trim();
        const trimmedPhone = (phone || '').trim();
        const trimmedPassword = (password || '').trim();
        const trimmedConfirm = (confirmPassword || '').trim();

        // Validations
        if (!trimmedName || !trimmedPhone) {
            return Alert.alert(t('auth.missingFields'), t('auth.missingFieldsDesc'));
        }
        if (trimmedPhone.length < 10) {
            return Alert.alert(t('auth.invalidPhone'), t('auth.invalidPhoneDesc'));
        }
        if (!trimmedPassword) {
            return Alert.alert('Invalid Password', 'Password is required.');
        }
        if (trimmedPassword !== trimmedConfirm) {
            return Alert.alert('Password Mismatch', 'Password and Confirm Password do not match.');
        }

        isSubmitting.current = true;
        setLoading(true);
        try {
            // Get current location (automatically)
            let locationData = { latitude: 0, longitude: 0 };

            try {
                let hasPermission = true;

                if (Platform.OS === 'android') {
                    const { PermissionsAndroid } = require('react-native');
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                        {
                            title: 'Location Permission',
                            message: 'App needs access to your location.',
                            buttonNeutral: 'Ask Me Later',
                            buttonNegative: 'Cancel',
                            buttonPositive: 'OK',
                        }
                    );
                    hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
                }

                if (hasPermission) {
                    const location = await GetLocation.getCurrentPosition({
                        enableHighAccuracy: true,
                        timeout: 15000,
                    });
                    locationData = {
                        latitude: location.latitude,
                        longitude: location.longitude,
                    };
                    console.log('Location Captured:', locationData);
                } else {
                    console.log('Location permission denied, proceeding with default (0,0)');
                }
            } catch (err) {
                console.warn('Location Capture Failed:', err.code, err.message);
            }

            const formData = new FormData();
            formData.append('name', trimmedName);
            formData.append('email', `${trimmedPhone}@sspropertyguru.com`);
            formData.append('contact', trimmedPhone);
            formData.append('password', trimmedPassword);
            formData.append('role', 'user');
            formData.append('latitude', locationData.latitude);
            formData.append('longitude', locationData.longitude);

            if (avatar) {
                formData.append('avatar', {
                    uri: Platform.OS === 'android' ? avatar.uri : avatar.uri.replace('file://', ''),
                    type: avatar.type || 'image/jpeg',
                    name: avatar.fileName || `avatar_${Date.now()}.jpg`,
                });
            } else {
                formData.append('avatar', DEFAULT_AVATAR);
            }

            const response = await signup(formData);

            if (response.data) {
                const devOtp = response.data?.data?.devOtp;
                // Navigate to OTP screen for phone number verification
                navigation.navigate('OTP', { email: trimmedPhone, mode: 'verify', prefillOtp: devOtp || null });
                if (devOtp) setTimeout(() => Alert.alert('Dev Mode OTP', `Your OTP: ${devOtp}`), 500);
            }
        } catch (error) {
            console.error('Signup Error detail:', error.response?.data || error.message || error);
            let message = t('auth.failedToCreateAccount');

            const status = error.response?.status || error.response?.data?.statusCode;
            const serverMessage = error.response?.data?.message || error.response?.data?.error || error.message;

            if (status === 409 || serverMessage?.toLowerCase().includes('already exists') || serverMessage?.toLowerCase().includes('registered')) {
                message = 'This phone number is already registered. Please login instead or use a different number.';
            } else if (serverMessage) {
                message = serverMessage;
            }

            Alert.alert('Signup Failed', message);
        } finally {
            setLoading(false);
            isSubmitting.current = false;
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                <View style={styles.topDecoration}>
                    <LinearGradient colors={[Colors.primarySoft, Colors.background]} style={styles.decorCircle} />
                </View>

                <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerSlide }] }]}>
                    <Text style={styles.title}>{t('auth.createAccount')}</Text>
                    <Text style={styles.subtitle}>{t('auth.signupSubtitle')}</Text>
                </Animated.View>

                <Animated.View style={[styles.avatarSection, { opacity: avatarAnim, transform: [{ translateY: avatarSlide }] }]}>
                    <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrapper} activeOpacity={0.7}>
                        {avatar ? (
                            <Image source={{ uri: avatar.uri }} style={styles.avatarImage} />
                        ) : (
                            <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
                                <Icon name="person" size={50} color="#B0B0B0" />
                            </View>
                        )}
                        <View style={styles.cameraIcon}>
                            <Icon name="camera" size={18} color={Colors.textWhite} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.avatarHint}>Add Profile Photo</Text>
                </Animated.View>

                <View style={styles.card}>
                    {/* Name */}
                    <Animated.View style={{ opacity: field1Anim, transform: [{ translateY: field1Slide }] }}>
                        <FloatingLabelInput
                            label={t('auth.name')}
                            value={name}
                            onChangeText={setName}
                            icon="person-outline"
                            style={{ marginBottom: 20 }}
                        />
                    </Animated.View>

                    {/* Phone */}
                    <Animated.View style={{ opacity: field2Anim, transform: [{ translateY: field2Slide }] }}>
                        <FloatingLabelInput
                            label={t('auth.phone')}
                            value={phone}
                            onChangeText={setPhone}
                            icon="call-outline"
                            prefix="+91"
                            keyboardType="phone-pad"
                            maxLength={10}
                            style={{ marginBottom: 20 }}
                        />
                    </Animated.View>

                    {/* Password */}
                    <Animated.View style={{ opacity: field3Anim, transform: [{ translateY: field3Slide }] }}>
                        <FloatingLabelInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            icon="lock-closed-outline"
                            secureTextEntry
                            style={{ marginBottom: 20 }}
                        />
                    </Animated.View>

                    {/* Confirm Password */}
                    <Animated.View style={{ opacity: field4Anim, transform: [{ translateY: field4Slide }] }}>
                        <FloatingLabelInput
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            icon="lock-closed-outline"
                            secureTextEntry
                            style={{ marginBottom: 28 }}
                        />
                    </Animated.View>

                    {/* Submit Button */}
                    <Animated.View style={{ opacity: btnAnim, transform: [{ translateY: btnSlide }] }}>
                        <AnimatedButton
                            title={t('auth.createAccount')}
                            onPress={handleSignup}
                            loading={loading}
                        />

                        <View style={styles.loginContainer}>
                            <Text style={styles.alreadyAccountText}>{t('auth.alreadyHaveAccount')}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                                <Text style={styles.loginLink}>{t('auth.signIn')}</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>

                <Animated.View style={[styles.footer, { opacity: btnAnim }]}>
                    <Text style={styles.footerText}>
                        {t('auth.agreeToSignup')}
                        <Text style={styles.link}>{t('auth.terms')}</Text>{t('auth.and')}
                        <Text style={styles.link} onPress={() => navigation.navigate('PrivacyPolicy')}>{t('auth.privacyPolicy')}</Text>
                    </Text>
                </Animated.View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
    topDecoration: { position: 'absolute', top: -150, right: -150, zIndex: -1 },
    decorCircle: { width: 400, height: 400, borderRadius: 200, opacity: 0.5 },
    header: { alignItems: 'center', marginTop: 30, marginBottom: 40 },
    title: { fontSize: 32, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 8 },
    subtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 20, lineHeight: 22 },
    card: {
        backgroundColor: Colors.surface, borderRadius: 32, padding: 28, elevation: 6,
        shadowColor: Colors.shadowPremium, shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1, shadowRadius: 32, borderWidth: 1, borderColor: Colors.borderLight,
        paddingBottom: 24,
    },
    loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
    alreadyAccountText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
    loginLink: { color: Colors.primary, fontSize: 14, fontWeight: '800' },
    footer: { marginTop: 30, marginBottom: 40, paddingHorizontal: 20 },
    footerText: { fontSize: 12, color: Colors.textLight, textAlign: 'center', lineHeight: 18 },
    link: { color: Colors.primary, fontWeight: '700' },
    avatarSection: { alignItems: 'center', marginBottom: 24 },
    avatarWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        backgroundColor: Colors.surfaceSecondary,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    avatarImage: { width: '100%', height: '100%' },
    avatarPlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8E8E8' },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        padding: 7,
        borderTopLeftRadius: 14,
        borderBottomRightRadius: 14,
    },
    avatarHint: { marginTop: 10, fontSize: 13, color: Colors.primary, fontWeight: '600' },
});

export default SignupScreen;
