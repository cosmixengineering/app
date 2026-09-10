import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Alert,
    TextInput,
    Platform,
    Modal,
    ScrollView
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/colors';
import { getDistricts, createDistrict, getAreas, createArea, deleteArea, updateArea } from '../../api/districtApi';
import CustomButton from '../../components/CustomButton';

const LocationManagerScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [tab, setTab] = useState('districts'); // 'districts' or 'areas'
    const [districts, setDistricts] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form state
    const [newName, setNewName] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [dRes, aRes] = await Promise.all([getDistricts(), getAreas()]);
            setDistricts(dRes.data?.data || dRes.data || []);
            setAreas(aRes.data?.data || aRes.data || []);
        } catch (error) {
            console.error('Fetch Location Data Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = async () => {
        if (!newName) return;

        try {
            if (tab === 'districts') {
                await createDistrict(newName);
            } else {
                if (!selectedDistrictId) {
                    Alert.alert(t('common.notice'), t('property.districtLabel'));
                    return;
                }
                await createArea(newName, selectedDistrictId);
            }
            setNewName('');
            setModalVisible(false);
            fetchData();
        } catch (error) {
            Alert.alert(t('common.error'), t('common.error'));
        }
    };

    const [editingItem, setEditingItem] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);

    const handleEdit = (item) => {
        setEditingItem(item);
        setNewName(item.name);
        setEditModalVisible(true);
    };

    const handleUpdate = async () => {
        if (!newName) return;
        try {
            await updateArea(editingItem.id || editingItem._id, newName);
            setNewName('');
            setEditModalVisible(false);
            setEditingItem(null);
            fetchData();
        } catch (error) {
            Alert.alert(t('common.error'), t('common.error'));
        }
    };

    const handleDelete = (id, type) => {
        Alert.alert(t('profile.deleteConfirmTitle', { item: type }), t('profile.deleteConfirmDesc'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
                text: t('common.delete'),
                style: 'destructive',
                onPress: async () => {
                    try {
                        if (type === 'Area') await deleteArea(id);
                        fetchData();
                    } catch (error) {
                        Alert.alert(t('common.error'), t('common.error'));
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {tab === 'areas' && (
                    <Text style={styles.itemSub}>{districts.find(d => (d.id || d._id) === item.districtId)?.name || t('property.districtLabel')}</Text>
                )}
            </View>
            <View style={styles.actions}>
                {tab === 'areas' && (
                    <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editBtn}>
                        <Icon name="create-outline" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleDelete(item.id || item._id, tab === 'districts' ? 'District' : 'Area')} style={styles.deleteBtn}>
                    <Icon name="trash-outline" size={20} color={Colors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />
            <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? Math.max(insets.top, 50) : insets.top + 20 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('profile.manageLocations')}</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addHeaderBtn}>
                    <Icon name="add-circle" size={28} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, tab === 'districts' && styles.activeTab]}
                    onPress={() => setTab('districts')}
                >
                    <Text style={[styles.tabText, tab === 'districts' && styles.activeTabText]}>{t('property.districtLabel')}s</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, tab === 'areas' && styles.activeTab]}
                    onPress={() => setTab('areas')}
                >
                    <Text style={[styles.tabText, tab === 'areas' && styles.activeTabText]}>{t('common.area')}s</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={tab === 'districts' ? districts : areas}
                    renderItem={renderItem}
                    keyExtractor={(item, idx) => String(item._id || item.id || idx)}
                    contentContainerStyle={styles.list}
                    onRefresh={fetchData}
                    refreshing={loading}
                />
            )}

            {/* Add Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('profile.addNew')} {tab === 'districts' ? t('property.districtLabel') : t('common.area')}</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder={t('home.locationPlaceholder')}
                            value={newName}
                            onChangeText={setNewName}
                        />
                        {tab === 'areas' && (
                            <View style={styles.districtPicker}>
                                <Text style={styles.pickerLabel}>{t('property.districtLabel')}:</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                                    {districts.map(d => (
                                        <TouchableOpacity
                                            key={d.id || d._id}
                                            style={[styles.chip, selectedDistrictId === (d.id || d._id) && styles.activeChip]}
                                            onPress={() => setSelectedDistrictId(d.id || d._id)}
                                        >
                                            <Text style={[styles.chipText, selectedDistrictId === (d.id || d._id) && styles.activeChipText]}>
                                                {d.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmBtn} onPress={handleAdd}>
                                <Text style={styles.confirmText}>{t('common.submit')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Modal (Areas) */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('common.edit')} {t('common.area')}</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder={t('home.locationPlaceholder')}
                            value={newName}
                            onChangeText={setNewName}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                                <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmBtn} onPress={handleUpdate}>
                                <Text style={styles.confirmText}>{t('profile.update')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        paddingBottom: 16,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border
    },
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
    addHeaderBtn: { padding: 8 },
    tabContainer: { flexDirection: 'row', margin: 16, backgroundColor: Colors.background, borderRadius: 12, padding: 4 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    activeTab: { backgroundColor: Colors.primarySoft },
    tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
    activeTabText: { color: Colors.primary },
    list: { padding: 16, paddingBottom: 100 },
    itemCard: {
        flexDirection: 'row',
        backgroundColor: Colors.background,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
        elevation: 1
    },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
    itemSub: { fontSize: 12, color: Colors.primary, marginTop: 2, fontWeight: '600' },
    deleteBtn: { padding: 8 },
    centered: { flex: 1, justifyContent: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
    modalContent: { backgroundColor: Colors.background, borderRadius: 24, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 20 },
    modalInput: { backgroundColor: Colors.backgroundSecondary, borderRadius: 12, height: 55, paddingHorizontal: 16, marginBottom: 16, fontSize: 16 },
    modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
    cancelBtn: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center' },
    confirmBtn: { flex: 2, height: 50, backgroundColor: Colors.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    cancelText: { fontWeight: '700', color: Colors.textSecondary },
    confirmText: { fontWeight: '700', color: Colors.textWhite },
    districtPicker: { marginBottom: 16 },
    pickerLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
    chipRow: { flexDirection: 'row' },
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.backgroundSecondary, marginRight: 8, borderWidth: 1, borderColor: Colors.border },
    activeChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    chipText: { fontSize: 12, color: Colors.textSecondary },
    activeChipText: { color: Colors.textWhite, fontWeight: '700' }
});

export default LocationManagerScreen;
