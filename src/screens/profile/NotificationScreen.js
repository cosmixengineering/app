import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/colors';
import { getNotifications, deleteNotification } from '../../api/notificationApi';

import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NotificationScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await getNotifications();
            setNotifications(res.data?.data || res.data?.notifications || res.data || []);
        } catch (e) {
            console.error('Fetch Notifications Error:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleDelete = (id) => {
        Alert.alert(t('profile.notifications'), t('common.areYouSure'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
                text: t('common.delete'),
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteNotification(id);
                        setNotifications(prev => prev.filter(n => (n.id || n._id) !== id));
                    } catch (e) {
                        Alert.alert(t('common.error'), t('common.error'));
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.notificationCard}>
            <View style={styles.iconContainer}>
                <Icon
                    name={item.type === 'alert' ? 'alert-circle' : 'notifications'}
                    size={24}
                    color={item.type === 'alert' ? Colors.error : Colors.primary}
                />
            </View>
            <View style={styles.content}>
                <Text style={styles.notiTitle}>{item.title}</Text>
                <Text style={styles.notiDesc}>{item.message}</Text>
                <Text style={styles.notiTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id || item._id)} style={styles.deleteBtn}>
                <Icon name="trash-outline" size={20} color={Colors.textLight} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="transparent" barStyle="light-content" translucent />

            <LinearGradient
                colors={Colors.gradientPrimary}
                style={[styles.header, { paddingTop: Math.max(insets.top, 50) }]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color={Colors.textWhite} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('profile.notifications')}</Text>
                <View style={{ width: 44 }} />
            </LinearGradient>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={(item, idx) => String(item._id || item.id || idx)}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Icon name="notifications-off-outline" size={60} color={Colors.border} />
                            <Text style={styles.emptyText}>{t('common.noNotifications')}</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.backgroundSecondary },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 10,
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12
    },
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.textWhite },
    list: { padding: 16, paddingBottom: 120 },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: Colors.backgroundCard,
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        alignItems: 'center',
        elevation: 4,
        shadowColor: Colors.shadowPremium,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: Colors.borderLight
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: Colors.surfaceSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    content: { flex: 1 },
    notiTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
    notiDesc: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, lineHeight: 20 },
    notiTime: { fontSize: 11, color: Colors.textLight, marginTop: 8 },
    deleteBtn: { padding: 8 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: Colors.textLight, fontSize: 16, marginTop: 12, fontWeight: '600' }
});

export default NotificationScreen;
