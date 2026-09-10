import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/colors';

const PrivacyPolicyScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
            <View style={[styles.header, { paddingTop: insets.top || 40 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('auth.privacyPolicy')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <Text style={styles.title}>{t('auth.privacyPolicy')}</Text>
                <Text style={styles.lastUpdated}>Last Updated: April 2026</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Information We Collect</Text>
                    <Text style={styles.paragraph}>
                        We collect information you provide directly to us, including your name, phone number, 
                        and property details when you register or list properties on SS Property Guru.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
                    <Text style={styles.paragraph}>
                        We use the information we collect to provide, maintain, and improve our services, 
                        to process your property listings, and to communicate with you about properties and services.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. Information Sharing</Text>
                    <Text style={styles.paragraph}>
                        We may share your information with other users when you list a property, and with 
                        service providers who assist us in operating our platform. We do not sell your personal information.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Data Security</Text>
                    <Text style={styles.paragraph}>
                        We implement appropriate security measures to protect your personal information. 
                        However, no method of transmission over the internet is 100% secure.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. Your Rights</Text>
                    <Text style={styles.paragraph}>
                        You have the right to access, update, or delete your personal information at any time 
                        through your account settings or by contacting us.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>6. Contact Us</Text>
                    <Text style={styles.paragraph}>
                        If you have any questions about this Privacy Policy, please contact us at:
                    </Text>
                    <Text style={styles.contactText}>Email: sspropertyguru1@gmail.com</Text>
                    <Text style={styles.contactText}>Phone: +91 7400763089</Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.backgroundCard,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    content: {
        padding: 24,
        paddingBottom: 100,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    lastUpdated: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 30,
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    contactText: {
        fontSize: 15,
        color: Colors.primary,
        fontWeight: '600',
        marginTop: 8,
    },
});

export default PrivacyPolicyScreen;
