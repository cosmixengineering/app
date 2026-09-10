import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
    StatusBar, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
    Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import Colors from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { applyForFranchise } from '../../api/franchiseApi';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const FranchiseScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [form, setForm] = useState({
        name: '', phone: '', agreed: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            const userDataStr = await AsyncStorage.getItem('userData');
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                setForm(prev => ({
                    ...prev,
                    name: userData.name || '',
                    phone: userData.contact || userData.phone || '',
                    email: userData.email || '',
                }));
            }
        };
        loadUser();
    }, []);

    const handleSubmit = async () => {
        if (!form.name || !form.phone) {
            Alert.alert(t('corporate.incomplete'), t('corporate.fillMandatory'));
            return;
        }
        if (!form.agreed) {
            Alert.alert(t('corporate.termsPrivacy'), t('corporate.agreeToProceed'));
            return;
        }

        setLoading(true);
        try {
            await applyForFranchise({
                name: form.name,
                phone: form.phone,
                email: `${form.phone}@franchise.com`,
                city: 'N/A',
                message: 'Franchise application submitted.',
            });
            Alert.alert(t('common.success'), t('corporate.teamContactSoon'), [
                { text: t('common.ok'), onPress: () => navigation.goBack() }
            ]);
            setForm({ name: '', phone: '', agreed: false });
        } catch (error) {
            Alert.alert(t('common.error'), t('home.enquiryError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
            <View style={[styles.header, { paddingTop: insets.top || 40 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                <View style={styles.titleSection}>
                    <Text style={styles.title}>{t('corporate.franchiseTitle')}</Text>
                    <Text style={styles.subtitle}>{t('corporate.franchiseSubtitle')}</Text>
                </View>

                <View style={styles.formCard}>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('corporate.fullName')} *</Text>
                        <TextInput
                            style={styles.input}
                            value={form.name}
                            onChangeText={txt => setForm({ ...form, name: txt })}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('corporate.mobileNumber')} *</Text>
                        <TextInput
                            style={styles.input}
                            value={form.phone}
                            keyboardType="phone-pad"
                            onChangeText={txt => setForm({ ...form, phone: txt })}
                        />
                    </View>

                    <TouchableOpacity style={styles.checkboxRow} activeOpacity={0.8} onPress={() => setForm({ ...form, agreed: !form.agreed })}>
                        <View style={[styles.checkbox, form.agreed && styles.checkboxActive]}>
                            {form.agreed && <Icon name="checkmark" size={14} color="#FFF" />}
                        </View>
                        <Text style={styles.checkboxText}>
                            {t('corporate.agreeTerms')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>{t('corporate.submitApplication')}</Text>}
                    </TouchableOpacity>

                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 15,
        backgroundColor: '#FAFAFA',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    titleSection: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 25,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#2E7D32', // Deep green matching web
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    formCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#333',
    },
    textArea: {
        height: 100,
        paddingTop: 14, // helps with vertical alignment in multiline
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 10,
        marginBottom: 25,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: '#CCC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
        backgroundColor: '#FFF',
    },
    checkboxActive: {
        backgroundColor: '#2E7D32',
        borderColor: '#2E7D32',
    },
    checkboxText: {
        flex: 1,
        fontSize: 13,
        color: '#555',
        lineHeight: 20,
    },
    submitBtn: {
        backgroundColor: '#2E7D32',
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default FranchiseScreen;
