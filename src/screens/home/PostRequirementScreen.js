import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
    StatusBar,
    TouchableOpacity,
    Platform
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/colors';
import CustomButton from '../../components/CustomButton';
import { addRequirement } from '../../api/requirementApi';

const PostRequirementScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [form, setForm] = useState({
        name: '',
        phone: '',
        details: '',
        budget: '',
        location: '',
        propertyType: 'Residential'
    });
    const [loading, setLoading] = useState(false);

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!form.name || !form.phone || !form.details) {
            Alert.alert(t('home.incompleteForm'), t('home.fillBasicDetails'));
            return;
        }

        setLoading(true);
        try {
            await addRequirement({
                name: form.name,
                phone: form.phone,
                requirement: `${form.details}${form.budget ? '\nBudget: ' + form.budget : ''}${form.location ? '\nLocation: ' + form.location : ''}`,
            });
            Alert.alert(
                t('home.postSuccess'),
                t('home.postSuccessDesc'),
                [{ text: t('common.ok'), onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('Submit Requirement Error:', error);
            Alert.alert(t('common.error'), t('home.enquiryError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? Math.max(insets.top, 50) : insets.top + 20 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('home.postRequirement')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.infoBox}>
                    <Icon name="bulb-outline" size={24} color={Colors.primary} />
                    <Text style={styles.infoText}>{t('home.postRequirementDesc')}</Text>
                </View>

                <Text style={styles.label}>{t('home.fullName')} *</Text>
                <TextInput
                    style={styles.input}
                    placeholder={t('home.fullName')}
                    value={form.name}
                    onChangeText={v => updateField('name', v)}
                />

                <Text style={styles.label}>{t('home.phoneNumber')} *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="+91 00000 00000"
                    keyboardType="phone-pad"
                    value={form.phone}
                    onChangeText={v => updateField('phone', v)}
                />

                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>{t('home.budgetRange')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('home.budgetPlaceholder')}
                            value={form.budget}
                            onChangeText={v => updateField('budget', v)}
                        />
                    </View>
                    <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text style={styles.label}>{t('common.location')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('home.locationPlaceholder')}
                            value={form.location}
                            onChangeText={v => updateField('location', v)}
                        />
                    </View>
                </View>

                <Text style={styles.label}>{t('home.specificRequirement')} *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder={t('home.requirementPlaceholder')}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    value={form.details}
                    onChangeText={v => updateField('details', v)}
                />

                <CustomButton
                    title={t('home.postRequirement')}
                    onPress={handleSubmit}
                    loading={loading}
                    style={styles.submitBtn}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: Colors.primarySoft,
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        gap: 12,
        marginBottom: 25
    },
    infoText: { flex: 1, fontSize: 13, color: Colors.primary, lineHeight: 18, fontWeight: '500' },
    label: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
    input: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 20,
        fontSize: 15,
        color: Colors.textPrimary
    },
    textArea: { height: 120 },
    row: { flexDirection: 'row' },
    submitBtn: { marginTop: 10 }
});

export default PostRequirementScreen;
