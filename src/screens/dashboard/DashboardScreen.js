import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
    Platform, RefreshControl, Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../constants/colors';
import { getPropertiesByAgent } from '../../api/propertyApi';
import { normalizeProperty } from '../../components/PropertyCard';
import { PropertyCardSkeleton } from '../../components/SkeletonLoader';

const DashboardScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState(null);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    const fetchDashboardData = useCallback(async (isRefreshing = false) => {
        if (isRefreshing) setRefreshing(true);
        else setLoading(true);

        try {
            const userDataStr = await AsyncStorage.getItem('userData');
            const userData = userDataStr ? JSON.parse(userDataStr) : null;
            setUser(userData);

            if (userData?.id || userData?._id) {
                const userId = userData.id || userData._id;
                const response = await getPropertiesByAgent(userId);
                const props = response.data?.data || response.data || [];
                setProperties(Array.isArray(props) ? props.map(p => normalizeProperty(p, t)) : []);
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);

            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 7, useNativeDriver: true })
            ]).start();
        }
    }, [fadeAnim, slideAnim, t]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const onRefresh = () => fetchDashboardData(true);

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
                }>

                {/* Premium Header */}
                <LinearGradient
                    colors={Colors.gradientPrimary}
                    style={[styles.header, { paddingTop: Platform.OS === 'ios' ? Math.max(insets.top, 50) : insets.top + 20 }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}>
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.userName}>{user?.name || '...'}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.profileButton}
                            onPress={() => navigation.navigate('Profile')}>
                            <Image
                                source={{ uri: user?.avatar || 'https://i.pravatar.cc/150' }}
                                style={styles.profileImage}
                            />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], paddingBottom: 100 }}>
                    {/* Elite Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <View style={styles.statIconBox}>
                                <Icon name="home" size={24} color={Colors.primary} />
                            </View>
                            <Text style={styles.statValue}>{properties.length}</Text>
                            <Text style={styles.statLabel}>{t('dashboard.myPortfolio')}</Text>
                        </View>
                    </View>

                    {/* Buy / Sell Actions */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('profile.agentTools')}</Text>

                        <View style={styles.actionGrid}>
                            <TouchableOpacity
                                style={[styles.actionCard, styles.buyCard]}
                                onPress={() => navigation.navigate('Buy', { screen: 'BuyMain' })}
                                activeOpacity={0.85}>
                                <View style={[styles.actionIconBox, { backgroundColor: Colors.primarySoft }]}>
                                    <Icon name="search" size={26} color={Colors.primary} />
                                </View>
                                <Text style={styles.actionTitle}>{t('dashboard.browseDb')}</Text>
                                <Text style={styles.actionCount}>{t('dashboard.findListings')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionCard, styles.sellCard]}
                                onPress={async () => {
                                    const token = await AsyncStorage.getItem('authToken');
                                    if (!token) navigation.navigate('Login');
                                    else navigation.navigate('AddProperty');
                                }}
                                activeOpacity={0.85}>
                                <View style={[styles.actionIconBox, { backgroundColor: '#E8F5E9' }]}>
                                    <Icon name="add-circle" size={26} color="#2E7D32" />
                                </View>
                                <Text style={styles.actionTitle}>{t('dashboard.listNewProperty')}</Text>
                                <Text style={styles.actionCount}>{t('dashboard.addAsset')}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Premium My Properties row */}
                        <TouchableOpacity
                            style={styles.myPropertiesRow}
                            onPress={() => navigation.navigate('MyProperties')}
                            activeOpacity={0.8}>
                            <View style={[styles.actionIconBox, { backgroundColor: Colors.surfaceSecondary, marginBottom: 0, width: 48, height: 48 }]}>
                                <Icon name="business" size={20} color={Colors.primary} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Text style={styles.actionTitle}>{t('dashboard.myPortfolio')}</Text>
                                <Text style={styles.actionCount}>{t('dashboard.activeAssets', { count: properties.length })}</Text>
                            </View>
                            <View style={styles.goIcon}>
                                <Icon name="arrow-forward" size={18} color={Colors.textWhite} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Recent Properties */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{t('dashboard.recentAssets')}</Text>
                            {properties.length > 0 && (
                                <TouchableOpacity onPress={() => navigation.navigate('MyProperties')}>
                                    <Text style={styles.viewAllText}>{t('common.viewAll')}</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {loading && !refreshing && properties.length === 0 ? (
                            <View>
                                <PropertyCardSkeleton horizontal={false} style={{ width: '100%', marginBottom: 16 }} />
                                <PropertyCardSkeleton horizontal={false} style={{ width: '100%', marginBottom: 16 }} />
                            </View>
                        ) : properties.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Icon name="analytics-outline" size={64} color={Colors.textLight} />
                                <Text style={styles.emptyTitle}>{t('dashboard.portfolioEmpty')}</Text>
                                <Text style={styles.emptyText}>{t('dashboard.portfolioEmptyDesc')}</Text>
                                <TouchableOpacity
                                    style={styles.emptyButton}
                                    onPress={() => navigation.navigate('AddProperty')}>
                                    <LinearGradient colors={Colors.gradientPrimary} style={styles.emptyBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                        <Text style={styles.emptyButtonText}>{t('dashboard.listNewProperty')}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            properties.slice(0, 3).map((property, index) => (
                                <TouchableOpacity
                                    key={String(property._id || index)}
                                    style={styles.propertyItem}
                                    onPress={() => navigation.navigate('PropertyDetail', { property })}>
                                    <Image
                                        source={{ uri: property.images?.[0] || 'https://via.placeholder.com/100' }}
                                        style={styles.propertyImage}
                                    />
                                    <View style={styles.propertyInfo}>
                                        <Text style={styles.propertyTitle} numberOfLines={1}>{property.title}</Text>
                                        <Text style={styles.propertyLocation} numberOfLines={1}>{property.area}, {property.city}</Text>
                                        <Text style={styles.propertyPrice}>{property.price}</Text>
                                    </View>
                                    <Icon name="chevron-forward" size={20} color={Colors.textLight} />
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.backgroundSecondary },
    header: {
        paddingBottom: 40,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        elevation: 10,
        shadowColor: Colors.shadowPremium,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
    },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    welcomeText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 2, letterSpacing: 0.5 },
    userName: { fontSize: 26, fontWeight: '900', color: Colors.textWhite, letterSpacing: -0.5 },
    profileButton: {
        width: 56, height: 56, borderRadius: 28, overflow: 'hidden',
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
    },
    profileImage: { width: '100%', height: '100%' },
    statsContainer: {
        flexDirection: 'row', paddingHorizontal: 20, marginTop: -25, gap: 16,
    },
    statCard: {
        flex: 1, backgroundColor: Colors.backgroundCard, borderRadius: 24,
        padding: 24, alignItems: 'center', elevation: 8,
        shadowColor: Colors.shadowPremium, shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15, shadowRadius: 16, borderWidth: 1, borderColor: Colors.borderLight,
    },
    statIconBox: {
        width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primarySoft,
        justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    },
    statValue: { fontSize: 32, fontWeight: '900', color: Colors.textPrimary, marginBottom: 4 },
    statLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '700' },
    section: { paddingHorizontal: 20, marginTop: 35 },
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 18,
    },
    sectionTitle: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
    viewAllText: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
    actionGrid: { flexDirection: 'row', gap: 16, marginBottom: 16 },
    actionCard: {
        flex: 1, backgroundColor: Colors.backgroundCard, borderRadius: 24,
        padding: 20, alignItems: 'center', elevation: 4,
        shadowColor: Colors.shadowPremium, shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1, shadowRadius: 12,
    },
    buyCard: { borderWidth: 1, borderColor: Colors.borderLight },
    sellCard: { borderWidth: 1, borderColor: Colors.borderLight },
    actionIconBox: {
        width: 56, height: 56, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    },
    actionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
    actionCount: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
    myPropertiesRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Colors.backgroundCard, borderRadius: 24,
        padding: 20, elevation: 6,
        borderWidth: 1, borderColor: Colors.primarySoft,
        shadowColor: Colors.shadowPremium, shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1, shadowRadius: 14,
    },
    goIcon: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center'
    },
    emptyState: { alignItems: 'center', paddingVertical: 40, backgroundColor: Colors.surfaceSecondary, borderRadius: 24 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginTop: 20, marginBottom: 8 },
    emptyText: { fontSize: 14, color: Colors.textSecondary, marginBottom: 24, paddingHorizontal: 40, textAlign: 'center' },
    emptyButton: { borderRadius: 16, overflow: 'hidden' },
    emptyBtnGradient: { paddingHorizontal: 32, paddingVertical: 16 },
    emptyButtonText: { color: Colors.textWhite, fontSize: 16, fontWeight: '800' },
    propertyItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.backgroundCard,
        borderRadius: 20, padding: 14, marginBottom: 14, elevation: 4,
        borderWidth: 1, borderColor: Colors.borderLight,
        shadowColor: Colors.shadowPremium, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08, shadowRadius: 10,
    },
    propertyImage: { width: 80, height: 80, borderRadius: 16, backgroundColor: Colors.border },
    propertyInfo: { flex: 1, marginLeft: 16 },
    propertyTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
    propertyLocation: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
    propertyPrice: { fontSize: 17, fontWeight: '900', color: Colors.primary },
});

export default DashboardScreen;
