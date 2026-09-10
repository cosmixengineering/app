import React, { useState } from 'react';
import {
    View, Text, StyleSheet, StatusBar, KeyboardAvoidingView,
    Platform, ScrollView, Alert, TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/colors';
import FloatingLabelInput from '../../components/FloatingLabelInput';
import AnimatedButton from '../../components/AnimatedButton';
import { forgotPassword } from '../../api/authApi';

const ForgotPasswordScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async () => {
        const trimmedIdentifier = (identifier || '').trim();

        if (!trimmedIdentifier) {
            Alert.alert('Invalid Input', 'Please enter your registered email or phone number.');
            return;
        }

        setLoading(true);
        try {
            await forgotPassword(trimmedIdentifier);
            // Navigate to OTPScreen with mode='forgot'
            navigation.navigate('OTP', { email: trimmedIdentifier, mode: 'forgot' });
        } catch (error) {
            console.error('[FORGOT PASSWORD] Error:', error.response?.data);
            const message = error.response?.data?.message || 'Failed to send reset instructions. Please try again.';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.titleSection}>
                    <View style={styles.lockIconWrapper}>
                        <Icon name="lock-closed-outline" size={40} color={Colors.primary} />
                    </View>
                    <Text style={styles.title}>Forgot Password?</Text>
                    <Text style={styles.subtitle}>Enter your email or phone number to receive a password reset OTP.</Text>
                </View>

                <View style={styles.card}>
                    <FloatingLabelInput
                        label="Email or Phone"
                        value={identifier}
                        onChangeText={setIdentifier}
                        icon="person-outline"
                        style={{ marginBottom: 24 }}
                    />

                    <AnimatedButton
                        title="Send OTP"
                        onPress={handleForgotPassword}
                        loading={loading}
                        icon="paper-plane-outline"
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
    header: { marginBottom: 20 },
    backButton: {
        width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.surfaceSecondary,
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
    },
    titleSection: { alignItems: 'center', marginBottom: 40 },
    lockIconWrapper: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primarySoft,
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
    subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
    card: {
        backgroundColor: Colors.surface, borderRadius: 32, padding: 28, elevation: 6,
        shadowColor: Colors.shadowPremium, shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1, shadowRadius: 32, borderWidth: 1, borderColor: Colors.borderLight,
    }
});

export default ForgotPasswordScreen;
