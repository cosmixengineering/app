import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Linking,
    Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/colors';
import { getEnquiries, updateEnquiry } from '../../api/enquiryApi';
import { getRequirements } from '../../api/requirementApi';

const LeadsScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [tab, setTab] = useState('enquiries');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = tab === 'enquiries' ? await getEnquiries() : await getRequirements();
            setData(res.data?.data || res.data?.enquiries || res.data?.requirements || res.data || []);
        } catch (e) {
            console.error('Fetch Leads Error:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tab]);

    const handleCall = (phone) => {
        Linking.openURL(`tel:${phone}`);
    };

    const handleStatusUpdate = async (id, status) => {
        setUpdatingId(id);
        try {
            await updateEnquiry(id, status);
            setData(prev => prev.map(item => (item.id || item._id) === id ? { ...item, status } : item));
        } catch (e) {
            Alert.alert(t('common.error'), t('agent.statusUpdateError'));
        } finally {
            setUpdatingId(null);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.leadCard}>
            <View style={styles.leadHeader}>
                <Text style={styles.leadName}>{item.name}</Text>
                <View style={[styles.badge, { backgroundColor: tab === 'enquiries' ? Colors.primarySoft : Colors.accentSoft }]}>
                    <Text style={[styles.badgeText, { color: tab === 'enquiries' ? Colors.primary : Colors.accent }]}>
                        {tab === 'enquiries' ? (item.status ? t(`agent.${item.status.toLowerCase()}`, { defaultValue: item.status }) : t('agent.new')) : t('agent.requirements')}
                    </Text>
                </View>
            </View>
            <Text style={styles.leadDetails}>{item.message || item.details || item.requirement}</Text>

            {tab === 'enquiries' && (
                <View style={styles.statusActions}>
                    {['New', 'Contacted', 'Resolved'].map(s => (
                        <TouchableOpacity
                            key={s}
                            style={[
                                styles.statusChip,
                                item.status === s && styles.activeStatusChip,
                                updatingId === (item.id || item._id) && { opacity: 0.5 }
                            ]}
                            disabled={updatingId === (item.id || item._id)}
                            onPress={() => handleStatusUpdate(item.id || item._id, s)}
                        >
                            <Text style={[styles.statusChipText, item.status === s && styles.activeStatusChipText]}>{t(`agent.${s.toLowerCase()}`)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <View style={styles.leadFooter}>
                <TouchableOpacity onPress={() => handleCall(item.phone)} style={styles.callBtn}>
                    <Icon name="call" size={16} color={Colors.textWhite} />
                    <Text style={styles.callBtnText}>{item.phone}</Text>
                </TouchableOpacity>
                <Text style={styles.leadTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('agent.leadsManager')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, tab === 'enquiries' && styles.activeTab]}
                    onPress={() => setTab('enquiries')}
                >
                    <Text style={[styles.tabText, tab === 'enquiries' && styles.activeTabText]}>{t('agent.enquiries')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, tab === 'requirements' && styles.activeTab]}
                    onPress={() => setTab('requirements')}
                >
                    <Text style={[styles.tabText, tab === 'requirements' && styles.activeTabText]}>{t('agent.requirements')}</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item, idx) => String(item._id || item.id || idx)}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Icon name="file-tray-outline" size={60} color={Colors.border} />
                            <Text style={styles.emptyText}>{t('agent.noLeads')}</Text>
                        </View>
                    }
                    onRefresh={fetchData}
                    refreshing={loading}
                />
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
        paddingTop: 50,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border
    },
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
    tabContainer: {
        flexDirection: 'row',
        padding: 4,
        margin: 16,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 12
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10
    },
    activeTab: { backgroundColor: Colors.background },
    tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
    activeTabText: { color: Colors.primary },
    list: { padding: 16 },
    leadCard: {
        backgroundColor: Colors.background,
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        elevation: 1
    },
    leadHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    leadName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 10, fontWeight: '700' },
    leadDetails: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
    statusActions: { flexDirection: 'row', gap: 8, marginTop: 12, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
    statusChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.backgroundSecondary, borderWidth: 1, borderColor: Colors.border },
    activeStatusChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    statusChipText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
    activeStatusChipText: { color: Colors.textWhite },
    leadFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
    callBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6
    },
    callBtnText: { color: Colors.textWhite, fontSize: 12, fontWeight: '600' },
    leadTime: { fontSize: 11, color: Colors.textLight },
    centered: { flex: 1, justifyContent: 'center' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: Colors.textLight, fontSize: 14, marginTop: 10 }
});

export default LeadsScreen;
