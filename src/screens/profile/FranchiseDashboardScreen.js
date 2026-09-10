import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/colors';
import { getFranchiseStats } from '../../api/dashboardApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const StatItem = ({ label, value, color, icon }) => (
    <View style={styles.statItem}>
        <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
            <Icon name={icon} size={20} color={color} />
        </View>
        <View>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
        </View>
    </View>
);

const FranchiseDashboardScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [franchiseId, setFranchiseId] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const userData = await AsyncStorage.getItem('userData');
                const user = JSON.parse(userData);
                const fid = user?.franchiseId || user?.franchise || 'default';
                setFranchiseId(fid);

                const res = await getFranchiseStats(fid);
                const statsData = res.data?.data || res.data;
                setStats({
                    totalProperties: statsData?.propertyCount || statsData?.totalProperties || 0,
                    totalAgents: statsData?.agentCount || statsData?.totalAgents || 0,
                    totalEnquiries: statsData?.totalEnquiries || 0,
                    totalSalesValue: statsData?.totalSalesValue || '0',
                });
            } catch (error) {
                console.error('Fetch Franchise Stats Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="transparent" barStyle="light-content" translucent />

            <LinearGradient
                colors={Colors.gradientPrimary}
                style={[styles.header, { paddingTop: Math.max(insets.top, 50) }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color={Colors.textWhite} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('profile.franchiseDashboard')}</Text>
                <View style={{ width: 44 }} />
            </LinearGradient>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.welcomeCard}>
                        <Text style={styles.welcomeTitle}>{t('profile.branchInsights')}</Text>
                        <Text style={styles.welcomeSub}>{t('profile.performanceOverview')}</Text>
                    </View>

                    <View style={styles.statsGrid}>
                        <StatItem
                            label={t('profile.ourProperties')}
                            value={stats?.totalProperties || 0}
                            color={Colors.primary}
                            icon="business"
                        />
                        <StatItem
                            label={t('profile.branchAgents')}
                            value={stats?.totalAgents || 0}
                            color={Colors.accent}
                            icon="people"
                        />
                        <StatItem
                            label={t('profile.activeEnquiries')}
                            value={stats?.totalEnquiries || 0}
                            color="#673AB7"
                            icon="chatbubbles"
                        />
                        <StatItem
                            label={t('profile.salesValue')}
                            value={`₹ ${stats?.totalSalesValue || '0'}`}
                            color="#2E7D32"
                            icon="trending-up"
                        />
                    </View>

                    <Text style={styles.sectionTitle}>{t('profile.managementTools')}</Text>
                    <View style={styles.tools}>
                        <TouchableOpacity
                            style={styles.toolBtn}
                            onPress={() => navigation.navigate('ManagementList', { mode: 'agents' })}
                        >
                            <View style={styles.toolIconBox}>
                                <Icon name="people-outline" size={24} color={Colors.primary} />
                            </View>
                            <Text style={styles.toolLabel}>{t('profile.manageAgents').replace(' ', '\n')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.toolBtn}
                            onPress={() => navigation.navigate('Leads')}
                        >
                            <View style={[styles.toolIconBox, { backgroundColor: '#FFF3E0' }]}>
                                <Icon name="flash-outline" size={24} color="#E65100" />
                            </View>
                            <Text style={styles.toolLabel}>{t('profile.viewLeads').replace(' ', '\n')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.toolBtn}
                            onPress={() => navigation.navigate('AddProperty')}
                        >
                            <View style={[styles.toolIconBox, { backgroundColor: '#E8F5E9' }]}>
                                <Icon name="add-circle-outline" size={24} color="#2E7D32" />
                            </View>
                            <Text style={styles.toolLabel}>{t('profile.newListing').replace(' ', '\n')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
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
        paddingBottom: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 8,
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10
    },
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.textWhite },
    content: { padding: 20 },
    welcomeCard: { marginBottom: 30 },
    welcomeTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
    welcomeSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
        backgroundColor: Colors.backgroundSecondary,
        padding: 20,
        borderRadius: 24
    },
    statItem: {
        width: (width - 85) / 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 10
    },
    statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    statLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
    statValue: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginTop: 40, marginBottom: 20 },
    tools: { flexDirection: 'row', gap: 15 },
    toolBtn: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border
    },
    toolIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.primarySoft, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    toolLabel: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default FranchiseDashboardScreen;
