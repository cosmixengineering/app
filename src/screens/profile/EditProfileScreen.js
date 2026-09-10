import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    StatusBar,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../constants/colors';
import CustomButton from '../../components/CustomButton';
import { updateAgentProfile } from '../../api/agentApi';
import { updateUser } from '../../api/userApi';
import { getMe } from '../../api/authApi';

const EditProfileScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState(''); // Email usually read-only or requires extra verification
    const [avatar, setAvatar] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [userRole, setUserRole] = useState('user');
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('userData');
                const parsedUser = storedUser ? JSON.parse(storedUser) : null;
                const userId = parsedUser?.id || parsedUser?._id;

                if (userId) {
                    const res = await getMe(userId);
                    const user = res.data?.data || res.data?.user || res.data;
                    if (user) {
                        setName(user.name || '');
                        setPhone(user.contact || user.phone || ''); // Check both contact and phone
                        setEmail(user.email || '');
                        setUserRole(user.role || 'user');
                        setUserId(user.id || user._id);
                    }
                } else if (parsedUser) {
                    setName(parsedUser.name || '');
                    setPhone(parsedUser.contact || parsedUser.phone || ''); // Check both contact and phone
                    setEmail(parsedUser.email || '');
                    setUserRole(parsedUser.role || 'user');
                    setUserId(parsedUser.id || parsedUser._id);
                }
            } catch (error) {
                console.error('Load User Error:', error);
            } finally {
                setFetching(false);
            }
        };
        loadUserData();
    }, []);

    const handlePickImage = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (response) => {
            if (response.assets && response.assets.length > 0) {
                setAvatar(response.assets[0]);
            }
        });
    };

    const handleSave = async () => {
        if (!name || !phone) {
            Alert.alert(t('common.error'), t('auth.missingFieldsDesc'));
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('contact', phone); // Backend expects 'contact' field
            formData.append('phone', phone); // Also send as 'phone' for compatibility

            if (avatar) {
                formData.append('avatar', {
                    uri: Platform.OS === 'android' ? avatar.uri : avatar.uri.replace('file://', ''),
                    type: avatar.type,
                    name: avatar.fileName || `avatar_${Date.now()}.jpg`,
                });
            }

            let response;
            const headers = { 'Content-Type': 'multipart/form-data' };
            if (userRole === 'agent') {
                response = await updateAgentProfile(formData, headers);
            } else {
                response = await updateUser(userId, formData, headers);
            }

            // Update AsyncStorage with new data
            const updatedUser = response.data?.data || response.data?.user || response.data;
            if (updatedUser) {
                await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
            }

            Alert.alert(t('common.success'), t('profile.profileUpdateSuccess'), [
                { text: t('common.ok'), onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Update Profile Error:', error);
            Alert.alert(t('common.error'), error.response?.data?.message || t('profile.profileUpdateError'));
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />

            <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? Math.max(insets.top, 50) : insets.top + 20 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('profile.editProfile')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrapper}>
                        {avatar ? (
                            <Image source={{ uri: avatar.uri }} style={styles.avatarImage} />
                        ) : (
                            <View style={[styles.avatarImage, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
                                <Icon name="person" size={60} color="#FFFFFF" />
                            </View>
                        )}
                        <View style={styles.cameraIcon}>
                            <Icon name="camera" size={20} color={Colors.textWhite} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.avatarHint}>{t('dashboard.changeAvatar')}</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>{t('auth.name')}</Text>
                    <View style={styles.inputWrapper}>
                        <Icon name="person-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder={t('auth.name')}
                        />
                    </View>

                    <Text style={styles.label}>{t('auth.phone')}</Text>
                    <View style={styles.inputWrapper}>
                        <Icon name="call-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder={t('auth.phone')}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <Text style={styles.label}>{t('dashboard.protectedEmail')}</Text>
                    <View style={[styles.inputWrapper, styles.disabledInput]}>
                        <Icon name="mail-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: Colors.textLight }]}
                            value={email}
                            editable={false}
                        />
                    </View>

                    <CustomButton
                        title={t('dashboard.updateProfile')}
                        onPress={handleSave}
                        loading={loading}
                        size="large"
                        style={styles.saveBtn}
                        icon="checkmark-circle-outline"
                    />
                </View>
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
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
    scrollContent: { padding: 24, paddingBottom: 150 },
    avatarSection: { alignItems: 'center', marginBottom: 32 },
    avatarWrapper: {
        width: 120,
        height: 120,
        borderRadius: 40,
        overflow: 'hidden',
        backgroundColor: Colors.surfaceSecondary,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10
    },
    avatarImage: { width: '100%', height: '100%' },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        padding: 8,
        borderTopLeftRadius: 12
    },
    avatarHint: { marginTop: 12, fontSize: 14, color: Colors.primary, fontWeight: '600' },
    form: { gap: 20 },
    label: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, textTransform: 'uppercase', marginLeft: 4 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceSecondary,
        borderRadius: 16,
        height: 60,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)'
    },
    disabledInput: { backgroundColor: '#F5F5F5', opacity: 0.8 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
    saveBtn: { marginTop: 20 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default EditProfileScreen;
