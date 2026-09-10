import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    StatusBar,
    Platform,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/colors';
import Loader from '../../components/Loader';
import { normalizeProperty } from '../../components/PropertyCard';
import { getMyProperties, deleteProperty, updateProperty } from '../../api/propertyApi';

const MyPropertiesScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchMyProperties = useCallback(async () => {
        setLoading(true);
        try {
            const storedUser = await AsyncStorage.getItem('userData');
            const parsedUser = storedUser ? JSON.parse(storedUser) : null;
            const userId = parsedUser?.id || parsedUser?._id;

            if (!userId) {
                setLoading(false);
                return;
            }

            const response = await getMyProperties(userId);
            const listings = response.data?.data || response.data?.properties || response.data || [];
            setProperties(Array.isArray(listings) ? listings.map(item => normalizeProperty(item, t)) : []);
        } catch (error) {
            console.error('MyProperties Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchMyProperties();
    }, [fetchMyProperties]);

    const handleToggleStatus = async (item) => {
        const newStatus = !item.isLive;
        setUpdatingId(item.id || item._id);
        try {
            const fd = new FormData();
            fd.append('isLive', String(newStatus));
            await updateProperty(item.id || item._id, fd);
            setProperties(prev => prev.map(p => String(p._id || p.id) === String(item._id || item.id) ? { ...p, isLive: newStatus } : p));
            Alert.alert(t('common.success'), `${t('common.details')} ${newStatus ? t('common.live') : t('common.hidden')}`);
        } catch (error) {
            Alert.alert(t('common.error'), t('home.enquiryError'));
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = id => {
        Alert.alert(
            t('common.delete'),
            t('common.deleteConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteProperty(id);
                            setProperties(prev => prev.filter(p => String(p._id || p.id) !== String(id)));
                            Alert.alert(t('common.success'), t('common.success'));
                        } catch (error) {
                            Alert.alert(t('common.error'), t('home.enquiryError'));
                        }
                    },
                },
            ],
        );
    };

    const renderProperty = ({ item }) => (
        <View style={styles.card}>
            <Image
                source={{ uri: item.images?.[0]?.url || item.images?.[0] || 'https://via.placeholder.com/300' }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.title} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <TouchableOpacity
                        style={[styles.statusBadge, { backgroundColor: item.isLive ? Colors.primarySoft : Colors.borderLight }]}
                        onPress={() => handleToggleStatus(item)}
                        disabled={updatingId === (item.id || item._id)}
                    >
                        {updatingId === (item.id || item._id) ? (
                            <ActivityIndicator size="small" color={Colors.primary} />
                        ) : (
                            <Text style={[styles.statusText, { color: item.isLive ? Colors.primary : Colors.textSecondary }]}>
                                {item.isLive ? t('common.live') : t('common.hidden')}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
                <Text style={styles.price}>{item.price}</Text>
                <View style={styles.locationRow}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text style={styles.locationText}>
                        {item.area}, {item.city}
                    </Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() =>
                            navigation.navigate('PropertyDetail', { property: item })
                        }>
                        <Icon name="eye-outline" size={16} color={Colors.textSecondary} />
                        <Text style={styles.actionText}>{t('common.viewAll').split(' ')[0]}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editAction]}
                        onPress={() => navigation.navigate('AddProperty', { editMode: true, propertyData: item })}
                    >
                        <Icon name="create-outline" size={16} color={Colors.primary} />
                        <Text style={[styles.actionText, styles.editText]}>{t('common.edit')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteAction]}
                        onPress={() => handleDelete(item.id || item._id)}>
                        <Icon name="trash-outline" size={16} color={Colors.error} />
                        <Text style={[styles.actionText, styles.deleteText]}>{t('common.delete')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

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
                <Text style={styles.headerTitle}>{t('profile.myProperties')}</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddProperty')}>
                    <Icon name="add" size={28} color={Colors.textWhite} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <Loader message={t('home.loadingProps')} fullScreen={false} />
            ) : (
                <FlatList
                    data={properties}
                    renderItem={renderProperty}
                    keyExtractor={(item, idx) => String(item._id || item.id || idx)}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 120 }]}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconBox}>
                                <Icon name="business-outline" size={60} color={Colors.primarySoft} />
                            </View>
                            <Text style={styles.emptyTitle}>{t('home.noPremiumFound')}</Text>
                            <Text style={styles.emptyText}>
                                {t('home.sellDesc')}
                            </Text>
                            <TouchableOpacity
                                style={styles.addFirstButton}
                                onPress={() => navigation.navigate('AddProperty')}>
                                <Text style={styles.addFirstText}>+ {t('profile.addProperty')}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
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
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addIcon: {
        fontSize: 24,
        color: Colors.textWhite,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    // Card
    card: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        elevation: 3,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    image: {
        width: '100%',
        height: 160,
        backgroundColor: Colors.borderLight,
    },
    cardContent: {
        padding: 14,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        backgroundColor: Colors.primarySoft,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.primary,
    },
    price: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.primary,
        marginBottom: 6,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    locationIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    locationText: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        paddingTop: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: Colors.backgroundSecondary,
        gap: 4,
    },
    editAction: {
        backgroundColor: Colors.primarySoft,
    },
    deleteAction: {
        backgroundColor: '#FFEBEE',
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    editText: {
        color: Colors.primary,
    },
    deleteText: {
        color: Colors.error,
    },
    viewIcon: { fontSize: 14 },
    editIcon: { fontSize: 14 },
    deleteIcon: { fontSize: 14 },
    // Empty State
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyIconBox: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.surfaceSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
        paddingHorizontal: 40,
    },
    addFirstButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 14,
    },
    addFirstText: {
        color: Colors.textWhite,
        fontWeight: '700',
        fontSize: 14,
    },
});

export default MyPropertiesScreen;
