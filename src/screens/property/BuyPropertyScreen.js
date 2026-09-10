import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Platform,
    StatusBar,
    Modal,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/colors';
import SearchBar from '../../components/SearchBar';
import PropertyCard, { normalizeProperty } from '../../components/PropertyCard';
import { PropertyCardSkeleton } from '../../components/SkeletonLoader';
import { getProperties, getPropertiesByAgent } from '../../api/propertyApi';
import { getDistricts, getAreas } from '../../api/districtApi';

const BuyPropertyScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const initialAgentId = route.params?.agentId || null;
    const agentName = route.params?.agentName || null;

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeAgentId, setActiveAgentId] = useState(initialAgentId);
    
    // Category & Selling Status filters
    const [selectedType, setSelectedType] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    
    // Location filters
    const [districts, setDistricts] = useState([]);
    const [areas, setAreas] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedArea, setSelectedArea] = useState(null);
    
    // Filter modal
    const [showFilterModal, setShowFilterModal] = useState(false);

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        try {
            let listings = [];
            if (activeAgentId) {
                const response = await getPropertiesByAgent(activeAgentId);
                listings = response.data?.data || response.data || [];
            } else {
                const params = {
                    search: search || undefined,
                    category: selectedType || undefined,
                    sellingType: selectedStatus || undefined,
                    district: selectedDistrict?.name || undefined,
                    area: selectedArea?.name || undefined
                };
                const response = await getProperties(params);
                listings = response.data?.data || response.data?.properties || response.data || [];
            }
            setProperties(Array.isArray(listings) ? listings.map(normalizeProperty) : []);
        } catch (error) {
            console.error('Error fetching properties:', error);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    }, [search, activeAgentId, selectedType, selectedStatus, selectedDistrict, selectedArea]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    useEffect(() => {
        const loadLocations = async () => {
            try {
                const [distRes, areaRes] = await Promise.all([getDistricts(), getAreas()]);
                setDistricts(distRes.data?.data || distRes.data?.districts || distRes.data || []);
                setAreas(areaRes.data?.data || areaRes.data?.areas || areaRes.data || []);
            } catch (err) {
                console.error('Location Load Error:', err);
            }
        };
        loadLocations();
    }, []);

    useEffect(() => {
        if (route.params?.agentId) setActiveAgentId(route.params.agentId);
    }, [route.params]);

    const clearFilters = () => {
        setSelectedType(null);
        setSelectedStatus(null);
        setSelectedDistrict(null);
        setSelectedArea(null);
        setShowFilterModal(false);
    };

    const activeFilterCount = [selectedType, selectedStatus, selectedDistrict, selectedArea].filter(Boolean).length;

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />

            <View style={[styles.topBar, { paddingTop: Platform.OS === 'ios' ? Math.max(insets.top, 50) : insets.top + 20 }]}>
                <View style={styles.screenHeaderTitle}>
                    <Icon name="business" size={24} color={Colors.primary} />
                    <Text style={styles.screenTitle}>
                        {agentName ? t('property.agentListings', { name: agentName }) : t('common.featured')}
                    </Text>
                </View>
                
                <View style={styles.searchRow}>
                    <SearchBar
                        value={search}
                        onChangeText={setSearch}
                        style={styles.searchBar}
                    />
                    {!activeAgentId && (
                        <TouchableOpacity 
                            style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
                            onPress={() => setShowFilterModal(true)}
                        >
                            <Icon name="options" size={20} color={activeFilterCount > 0 ? Colors.textWhite : Colors.primary} />
                            {activeFilterCount > 0 && (
                                <View style={styles.filterBadge}>
                                    <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Active Filters Display */}
                {!activeAgentId && activeFilterCount > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFiltersScroll}>
                        {selectedType && (
                            <View style={styles.activeFilterChip}>
                                <Icon name="business" size={12} color={Colors.primary} />
                                <Text style={styles.activeFilterText}>{selectedType}</Text>
                                <TouchableOpacity onPress={() => setSelectedType(null)}>
                                    <Icon name="close-circle" size={16} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        )}
                        {selectedStatus && (
                            <View style={styles.activeFilterChip}>
                                <Icon name="pricetag" size={12} color={Colors.primary} />
                                <Text style={styles.activeFilterText}>{selectedStatus}</Text>
                                <TouchableOpacity onPress={() => setSelectedStatus(null)}>
                                    <Icon name="close-circle" size={16} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        )}
                        {selectedDistrict && (
                            <View style={styles.activeFilterChip}>
                                <Icon name="location" size={12} color={Colors.primary} />
                                <Text style={styles.activeFilterText}>{selectedDistrict.name}</Text>
                                <TouchableOpacity onPress={() => { setSelectedDistrict(null); setSelectedArea(null); }}>
                                    <Icon name="close-circle" size={16} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        )}
                        {selectedArea && (
                            <View style={styles.activeFilterChip}>
                                <Icon name="pin" size={12} color={Colors.primary} />
                                <Text style={styles.activeFilterText}>{selectedArea.name}</Text>
                                <TouchableOpacity onPress={() => setSelectedArea(null)}>
                                    <Icon name="close-circle" size={16} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                )}
            </View>

            {loading ? (
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <PropertyCardSkeleton />
                    <PropertyCardSkeleton />
                    <PropertyCardSkeleton />
                </ScrollView>
            ) : (
                <FlatList
                    data={properties}
                    renderItem={({ item, index }) => (
                        <View style={{ animationDuration: `${(index % 5 + 1) * 200}ms` }}>
                            <PropertyCard
                                property={item}
                                onPress={() => navigation.navigate('PropertyDetail', { property: item })}
                            />
                        </View>
                    )}
                    keyExtractor={(item, idx) => String(item._id || item.id || idx)}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 120 + insets.bottom }]}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <Text style={styles.resultCount}>
                            {t('property.resultCount', { count: properties.length })}
                        </Text>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="search-outline" size={56} color={Colors.textLight} />
                            <Text style={styles.emptyTitle}>{t('home.noPremiumFound')}</Text>
                            <Text style={styles.emptyText}>{t('property.searchAdjust')}</Text>
                        </View>
                    }
                />
            )}

            {/* Filter Modal */}
            <Modal
                visible={showFilterModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter Properties</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <Icon name="close" size={28} color={Colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                            {/* Property Type Filter */}
                            <Text style={styles.filterLabel}>Property Type</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipScroll}>
                                <TouchableOpacity
                                    style={[styles.filterChip, !selectedType && styles.filterChipActive]}
                                    onPress={() => setSelectedType(null)}
                                >
                                    <Text style={[styles.filterChipText, !selectedType && styles.filterChipTextActive]}>All Types</Text>
                                </TouchableOpacity>
                                {['Plot', 'Residential', 'Industrial', 'Agricultural Land', 'Farm House', 'Warehouse'].map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
                                        onPress={() => setSelectedType(type)}
                                    >
                                        <Text style={[styles.filterChipText, selectedType === type && styles.filterChipTextActive]}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Status Filter */}
                            <Text style={styles.filterLabel}>Status</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipScroll}>
                                <TouchableOpacity
                                    style={[styles.filterChip, !selectedStatus && styles.filterChipActive]}
                                    onPress={() => setSelectedStatus(null)}
                                >
                                    <Text style={[styles.filterChipText, !selectedStatus && styles.filterChipTextActive]}>All Status</Text>
                                </TouchableOpacity>
                                {['Sale', 'Rent', 'Lease'].map(status => (
                                    <TouchableOpacity
                                        key={status}
                                        style={[styles.filterChip, selectedStatus === status && styles.filterChipActive]}
                                        onPress={() => setSelectedStatus(status)}
                                    >
                                        <Text style={[styles.filterChipText, selectedStatus === status && styles.filterChipTextActive]}>{status}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* District Filter */}
                            <Text style={styles.filterLabel}>District</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipScroll}>
                                <TouchableOpacity
                                    style={[styles.filterChip, !selectedDistrict && styles.filterChipActive]}
                                    onPress={() => { setSelectedDistrict(null); setSelectedArea(null); }}
                                >
                                    <Text style={[styles.filterChipText, !selectedDistrict && styles.filterChipTextActive]}>All Districts</Text>
                                </TouchableOpacity>
                                {districts.map(dist => (
                                    <TouchableOpacity
                                        key={dist._id || dist.id}
                                        style={[styles.filterChip, selectedDistrict?._id === dist._id && styles.filterChipActive]}
                                        onPress={() => { setSelectedDistrict(dist); setSelectedArea(null); }}
                                    >
                                        <Text style={[styles.filterChipText, selectedDistrict?._id === dist._id && styles.filterChipTextActive]}>{dist.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Area Filter */}
                            <Text style={styles.filterLabel}>Area</Text>
                            {areas.filter(a => !selectedDistrict || (a.district?._id || a.district) === (selectedDistrict._id || selectedDistrict.id)).length > 0 ? (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipScroll}>
                                    <TouchableOpacity
                                        style={[styles.filterChip, !selectedArea && styles.filterChipActive]}
                                        onPress={() => setSelectedArea(null)}
                                    >
                                        <Text style={[styles.filterChipText, !selectedArea && styles.filterChipTextActive]}>All Areas</Text>
                                    </TouchableOpacity>
                                    {areas
                                        .filter(a => !selectedDistrict || (a.district?._id || a.district) === (selectedDistrict._id || selectedDistrict.id))
                                        .map(area => (
                                            <TouchableOpacity
                                                key={area._id || area.id}
                                                style={[styles.filterChip, selectedArea?._id === area._id && styles.filterChipActive]}
                                                onPress={() => setSelectedArea(area)}
                                            >
                                                <Text style={[styles.filterChipText, selectedArea?._id === area._id && styles.filterChipTextActive]}>{area.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                </ScrollView>
                            ) : (
                                <View style={styles.disabledFilterSection}>
                                    <Icon name="alert-circle-outline" size={20} color={Colors.textLight} />
                                    <Text style={styles.disabledFilterText}>No areas available</Text>
                                </View>
                            )}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                                <Text style={styles.clearButtonText}>Clear All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyButton} onPress={() => setShowFilterModal(false)}>
                                <Text style={styles.applyButtonText}>Apply Filters</Text>
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
    topBar: {
        backgroundColor: Colors.background,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 10,
        shadowColor: Colors.shadowPremium,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        marginBottom: 10,
    },
    screenHeaderTitle: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
    screenTitle: { fontSize: 26, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
    searchRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 10 },
    searchBar: { flex: 1 },
    filterButton: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: Colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.borderLight,
        position: 'relative',
    },
    filterButtonActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primaryDark,
    },
    filterBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.error,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterBadgeText: {
        color: Colors.textWhite,
        fontSize: 11,
        fontWeight: '900',
    },
    activeFiltersScroll: {
        marginTop: 8,
    },
    activeFilterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.primarySoft,
        borderWidth: 1,
        borderColor: Colors.primary,
        marginRight: 8,
    },
    activeFilterText: {
        fontSize: 13,
        color: Colors.primary,
        fontWeight: '700',
    },
    listContent: { padding: 20 },
    resultCount: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600', marginBottom: 16 },
    emptyContainer: { alignItems: 'center', paddingVertical: 80 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginTop: 20, marginBottom: 8 },
    emptyText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '500' },
    
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 24,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: Colors.textPrimary,
    },
    modalScroll: {
        paddingHorizontal: 24,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginTop: 20,
        marginBottom: 12,
    },
    filterChipScroll: {
        marginBottom: 10,
    },
    filterChip: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        backgroundColor: Colors.surfaceSecondary,
        marginRight: 12,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    filterChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primaryDark,
    },
    filterChipText: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '700',
    },
    filterChipTextActive: {
        color: Colors.textWhite,
    },
    disabledFilterSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 16,
        backgroundColor: Colors.surfaceSecondary,
        borderRadius: 16,
        marginBottom: 10,
    },
    disabledFilterText: {
        flex: 1,
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 24,
        marginTop: 30,
    },
    clearButton: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.textSecondary,
    },
    applyButton: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.textWhite,
    },
});

export default BuyPropertyScreen;
