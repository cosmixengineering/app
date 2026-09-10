import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Linking
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAgents } from '../../api/agentApi';

const AgentsScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAgents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAgents();
            const data = response.data?.data?.agents || response.data?.data || response.data?.agents || response.data || [];
            setAgents(data);
        } catch (error) {
            console.error('Agents Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    const handleWhatsApp = (contact) => {
        const message = t('agent.whatsappMessage');
        const cleanPhone = contact ? contact.replace(/\s/g, '') : '1234567890';
        Linking.openURL(`whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`);
    };

    const renderAgent = ({ item }) => (
        <TouchableOpacity
            style={styles.agentCard}
            onPress={() => navigation.navigate('Projects', {
                agentId: item.id || item._id,
                agentName: item.name
            })}
        >
            <Image
                source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }}
                style={styles.avatar}
            />
            <View style={styles.agentInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.role}>{item.role || t('agent.eliteConsultant')}</Text>
                <View style={styles.statsRow}>
                    <Icon name="business-outline" size={14} color={Colors.primary} />
                    <Text style={styles.statsText}>{t('agent.listingsCount', { count: item.propertiesCount || item.properties?.length || 0 })}</Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.chatButton}
                onPress={() => handleWhatsApp(item.contact || item.phone)}
            >
                <Icon name="logo-whatsapp" size={20} color={Colors.textWhite} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('agent.ourAgents')}</Text>
                <View style={{ width: 44 }} />
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={agents}
                    renderItem={renderAgent}
                    keyExtractor={(item, idx) => String(item._id || item.id || idx)}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <Text style={{ color: Colors.textSecondary }}>{t('agent.noAgents')}</Text>
                        </View>
                    }
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
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
    listContent: { padding: 20 },
    agentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 20,
        padding: 15,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    avatar: { width: 60, height: 60, borderRadius: 30 },
    agentInfo: { flex: 1, marginLeft: 15 },
    name: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
    role: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
    statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 5 },
    statsText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
    chatButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#25D366',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AgentsScreen;
