import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
    StatusBar,
    TouchableOpacity,
    Platform,
    Modal,
    FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/colors';
import CustomButton from '../../components/CustomButton';
import { createEnquiry } from '../../api/enquiryApi';
import { getDistricts } from '../../api/districtApi';
import { propertyTypes } from '../../constants/appConstants';

const EnquiryFormScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        city: '',
        requirement: '',
    });
    const [districts, setDistricts] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const res = await getDistricts();
                setDistricts(res.data?.data || res.data?.districts || res.data || []);
            } catch (e) {
                console.error(e);
            }
        };
        fetchDistricts();
    }, []);

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!form.name || !form.phone || !form.city || !form.requirement) {
            Alert.alert(t('auth.missingFields'), t('auth.missingFieldsDesc'));
            return;
        }

        setLoading(true);
        try {
            await createEnquiry({
                name: form.name,
                contact: form.phone,
                email: form.email || `${form.phone}@noemail.com`,
                city: form.city,
                message: form.requirement,
            });
            Alert.alert(
                t('home.enquirySuccess'),
                t('home.enquirySubtitle'),
                [{ text: t('common.ok'), onPress: () => navigation.goBack() }],
            );
        } catch (error) {
            Alert.alert(t('common.error'), t('home.enquiryError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? Math.max(insets.top, 50) : insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('home.enquiry')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled">
                {/* Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoIconWrapper}>
                        <Icon name="chatbubbles-outline" size={36} color={Colors.primary} />
                    </View>
                    <Text style={styles.infoTitle}>{t('home.premiumEnquiry')}</Text>
                    <Text style={styles.infoDesc}>
                        {t('home.enquirySubtitle')}
                    </Text>
                </View>

                {/* Form */}
                <Text style={styles.label}>{t('home.fullName')} *</Text>
                <TextInput
                    style={styles.input}
                    placeholder={t('home.fullName')}
                    placeholderTextColor={Colors.textLight}
                    value={form.name}
                    onChangeText={v => updateField('name', v)}
                />

                <Text style={styles.label}>{t('home.phoneNumber')} *</Text>
                <View style={styles.phoneContainer}>
                    <View style={styles.countryCode}>
                        <Text style={styles.flag}>🇮🇳</Text>
                        <Text style={styles.codeText}>+91</Text>
                    </View>
                    <TextInput
                        style={[styles.input, styles.phoneInput]}
                        placeholder={t('home.phoneNumber')}
                        placeholderTextColor={Colors.textLight}
                        keyboardType="phone-pad"
                        maxLength={10}
                        value={form.phone}
                        onChangeText={v => updateField('phone', v)}
                    />
                </View>

                <Text style={styles.label}>{t('auth.email')} ({t('common.optional')})</Text>
                <TextInput
                    style={styles.input}
                    placeholder={t('auth.email')}
                    placeholderTextColor={Colors.textLight}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={form.email}
                    onChangeText={v => updateField('email', v)}
                />

                <Text style={styles.label}>{t('property.districtLabel')} *</Text>
                <TouchableOpacity 
                    style={[styles.input, { justifyContent: 'center' }]} 
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={{ color: form.city ? Colors.textPrimary : Colors.textLight, fontSize: 16 }}>
                        {form.city || t('property.districtLabel')}
                    </Text>
                </TouchableOpacity>

                <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{t('property.districtLabel')}</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Icon name="close" size={24} color={Colors.textPrimary} />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search..."
                                placeholderTextColor={Colors.textLight}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            <FlatList
                                data={districts.filter(d => (d.name || d).toLowerCase().includes(searchQuery.toLowerCase()))}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => {
                                            updateField('city', item.name || item);
                                            setModalVisible(false);
                                            setSearchQuery('');
                                        }}>
                                        <Text style={styles.modalItemText}>{item.name || item}</Text>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={() => (
                                    <Text style={styles.emptyText}>No district found.</Text>
                                )}
                            />
                        </View>
                    </View>
                </Modal>

                <Text style={styles.label}>{t('profile.postRequirement')} *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder={t('home.lookingFor')}
                    placeholderTextColor={Colors.textLight}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    value={form.requirement}
                    onChangeText={v => updateField('requirement', v)}
                />

                <CustomButton
                    title={t('home.enquiry')}
                    onPress={handleSubmit}
                    loading={loading}
                    size="large"
                    icon="send"
                    style={styles.submitButton}
                />

                <View style={{ height: 30 }} />
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
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: Colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    backIcon: {
        fontSize: 22,
        color: Colors.textPrimary,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 120,
    },
    infoCard: {
        backgroundColor: Colors.primarySoft,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 24,
    },
    infoIconWrapper: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: 6,
    },
    infoDesc: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 8,
        marginTop: 4,
    },
    input: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 16,
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    countryCode: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 6,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    flag: {
        fontSize: 18,
    },
    codeText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    phoneInput: {
        flex: 1,
        marginBottom: 0,
    },
    textArea: {
        height: 120,
        paddingTop: 14,
    },
    cityContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    cityChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.backgroundSecondary,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cityChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    cityChipText: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    cityChipTextActive: {
        color: Colors.textWhite,
        fontWeight: '600',
    },
    submitButton: {
        marginTop: 8,
    },
});

export default EnquiryFormScreen;
