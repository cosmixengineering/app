import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import Colors from '../../constants/colors';
import { getMe } from '../../api/authApi';
import authStore from '../../store/authStore';
import { applyForFranchise } from '../../api/franchiseApi';
import { getPropertiesByAgent } from '../../api/propertyApi';

const ProfileScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [propertyCount, setPropertyCount] = useState(0);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const storedUser = await AsyncStorage.getItem('userData');
            const parsedUser = storedUser ? JSON.parse(storedUser) : null;
            const userId = parsedUser?.id || parsedUser?._id;

            if (userId) {
                const response = await getMe(userId);
                const data = response.data?.data || response.data?.user || response.data;
                setUser(data);
                if (data) await AsyncStorage.setItem('userData', JSON.stringify(data));

                // Fetch property count for agents
                if (data?.role === 'agent' || data?.role === 'admin') {
                    try {
                        const propertiesRes = await getPropertiesByAgent(userId);
                        const properties = propertiesRes.data?.data || propertiesRes.data || [];
                        setPropertyCount(Array.isArray(properties) ? properties.length : 0);
                    } catch (err) {
                        console.error('Property count fetch error:', err);
                        setPropertyCount(0);
                    }
                }
            } else {
                setUser(parsedUser);
            }
        } catch (error) {
            console.error('Profile Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            const loggedIn = await authStore.isLoggedIn();
            if (!loggedIn) {
                navigation.navigate('Login');
            }
        };
        checkAuth();
        fetchProfile();
    }, [fetchProfile, navigation]);

    const handleApply = async () => {
        Alert.alert(
            t('home.franchise'),
            t('home.franchiseEnquirySubtitle'),
            [
                { text: t('common.cancel'), style: "cancel" },
                {
                    text: t('common.submit'),
                    onPress: async () => {
                        try {
                            const userDataStr = await AsyncStorage.getItem('userData');
                            const userData = userDataStr ? JSON.parse(userDataStr) : {};
                            await applyForFranchise({
                                name: userData.name || 'Interested Partner',
                                phone: userData.contact || userData.phone || '',
                                message: "Applying for a new franchise branch."
                            });
                            Alert.alert(t('common.success'), t('home.enquirySuccess'));
                        } catch (e) {
                            Alert.alert(t('common.error'), t('home.enquiryError'));
                        }
                    }
                }
            ]
        );
    };

    if (loading && !user) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const userData = user || {};

    const menuItems = [
        ...(userData.role === 'admin' ? [{
            icon: 'bar-chart-outline',
            title: t('profile.adminDashboard'),
            subtitle: t('profile.adminDashboardSubtitle'),
            onPress: () => navigation.navigate('AdminDashboard'),
        }] : []),
        ...(userData.role === 'franchise' ? [{
            icon: 'grid-outline',
            title: t('profile.franchiseDashboard'),
            subtitle: t('profile.franchiseDashboardSubtitle'),
            onPress: () => navigation.navigate('FranchiseDashboard'),
        }] : []),
        ...(userData.role === 'admin' ? [
            {
                icon: 'location-outline',
                title: t('profile.locationManager'),
                subtitle: t('profile.locationManagerSubtitle'),
                onPress: () => navigation.navigate('LocationManager'),
            },
        ] : []),
        {
            icon: 'business-outline',
            title: t('profile.myProperties'),
            subtitle: `${propertyCount} ${t('profile.listings')}`,
            onPress: () => navigation.navigate('MyProperties'),
        },
        {
            icon: 'add-circle-outline',
            title: t('profile.postRequirement'),
            subtitle: t('profile.postRequirementSubtitle'),
            onPress: () => navigation.navigate('PostRequirement'),
        },
        {
            icon: 'notifications-outline',
            title: t('profile.notifications'),
            subtitle: t('profile.notificationsSubtitle'),
            onPress: () => navigation.navigate('Notification'),
        },
        {
            icon: 'shield-checkmark-outline',
            title: t('profile.support'),
            subtitle: t('profile.supportSubtitle'),
            onPress: () => navigation.navigate('AboutContact'),
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="transparent" barStyle="light-content" translucent />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Premium Profile Header */}
                <LinearGradient
                    colors={Colors.gradientPrimary}
                    style={[styles.header, { paddingTop: Platform.OS === 'ios' ? Math.max(insets.top, 50) : insets.top + 20 }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}>
                    <View style={styles.profileSection}>
                        {userData.avatar ? (
                            <Image source={{ uri: userData.avatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }]}>
                                <Icon name="person" size={50} color="#FFFFFF" />
                            </View>
                        )}
                        <Text style={styles.userName}>{userData.name || t('profile.guestUser')}</Text>
                        <Text style={styles.userPhone}>
                            {userData.contact || userData.phone ||
                                (userData.email && !userData.email.includes('@noemail.local') ? userData.email : '') ||
                                t('profile.noContact')}
                        </Text>
                        <TouchableOpacity
                            style={styles.editProfileBtn}
                            onPress={() => navigation.navigate('EditProfile')}
                        >
                            <Icon name="pencil" size={16} color={Colors.textWhite} />
                        </TouchableOpacity>
                    </View>

                    {/* Elite Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{propertyCount}</Text>
                            <Text style={styles.statLabel}>{t('profile.listed')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{userData.enquiriesMade || 0}</Text>
                            <Text style={styles.statLabel}>{t('home.enquiry')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Icon name="person-circle-outline" size={24} color={Colors.accentMuted} />
                            <Text style={styles.statLabel}>{userData.role === 'agent' ? t('common.agent') : t('profile.newUser')}</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => navigation.navigate('AddProperty')}>
                        <View style={[styles.quickIconBox, { backgroundColor: Colors.primarySoft }]}>
                            <Icon name="add-circle-outline" size={24} color={Colors.primary} />
                        </View>
                        <Text style={styles.quickText}>{t('profile.addProperty').replace(' ', '\n')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => navigation.navigate('MyProperties')}>
                        <View style={[styles.quickIconBox, { backgroundColor: '#E8F5E9' }]}>
                            <Icon name="business-outline" size={24} color="#2E7D32" />
                        </View>
                        <Text style={styles.quickText}>{t('profile.myProperties').replace(' ', '\n')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Menu */}
                <View style={styles.menuSection}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={item.onPress}
                            activeOpacity={0.7}>
                            <View style={styles.menuLeft}>
                                <View style={styles.menuIconWrapper}>
                                    <Icon name={item.icon} size={22} color={Colors.primary} />
                                </View>
                                <View>
                                    <Text style={styles.menuTitle}>{item.title}</Text>
                                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                                </View>
                            </View>
                            <Icon name="chevron-forward" size={18} color={Colors.textLight} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={async () => {
                    Alert.alert(
                        t('auth.logout'),
                        t('auth.logoutConfirm'),
                        [
                            { text: t('common.cancel'), style: 'cancel' },
                            {
                                text: t('auth.logout'),
                                style: 'destructive',
                                onPress: async () => {
                                    try {
                                        const notificationService = require('../../services/notificationService').default;
                                        await notificationService.clearToken();
                                    } catch (e) { }
                                    await AsyncStorage.clear();
                                    navigation.dispatch(
                                        CommonActions.reset({
                                            index: 0,
                                            routes: [{ name: 'Login' }],
                                        })
                                    );
                                }
                            }
                        ]
                    );
                }}>
                    <Icon name="log-out-outline" size={20} color={Colors.error} />
                    <Text style={styles.logoutText}>{t('auth.logout')}</Text>
                </TouchableOpacity>

                {/* App Version */}
                <Text style={styles.versionText}>{t('common.appName')} v1.0.0</Text>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
    },
    // Header
    header: {
        paddingBottom: 35,
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        elevation: 10,
        shadowColor: Colors.shadowPremium,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 30,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
        marginBottom: 12,
        backgroundColor: Colors.primaryLight,
    },
    userName: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.textWhite,
        marginBottom: 4,
    },
    userPhone: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        marginBottom: 4,
    },
    memberSince: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 8,
    },
    editProfileBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 6,
        borderRadius: 10,
        marginTop: 5,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 30,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.textWhite,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    // Quick Actions
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginTop: -4,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    quickAction: {
        alignItems: 'center',
        gap: 8,
    },
    quickIconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    quickEmoji: {
        fontSize: 24,
    },
    quickText: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '600',
        textAlign: 'center',
    },
    // Menu
    menuSection: {
        marginTop: 24,
        marginHorizontal: 20,
        backgroundColor: Colors.backgroundCard,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: Colors.shadowPremium,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    menuIconWrapper: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: Colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    menuSubtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    menuArrow: {
        fontSize: 24,
        color: Colors.textLight,
    },
    // Logout
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginTop: 20,
        paddingVertical: 16,
        backgroundColor: '#FFEBEE',
        borderRadius: 14,
        gap: 8,
    },
    logoutIcon: {
        fontSize: 18,
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.error,
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 16,
    },
});

export default ProfileScreen;
