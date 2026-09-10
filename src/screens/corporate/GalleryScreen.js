import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, Image,
    TouchableOpacity, StatusBar, Dimensions, ActivityIndicator
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { getGallery } from '../../api/galleryApi';

const { width } = Dimensions.get('window');
const columnWidth = (width - 50) / 2;

const GalleryScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const res = await getGallery();
                const items = res.data?.data || res.data?.message || [];
                setImages(Array.isArray(items) ? items : []);
            } catch (e) {
                console.error('Gallery Fetch Error:', e);
                setImages([]);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.galleryItem}>
            <Image
                source={{ uri: item.image }}
                style={styles.image}
                defaultSource={{ uri: 'https://via.placeholder.com/300x200' }}
            />
            <Text style={styles.imageTitle} numberOfLines={2}>{item.title}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Property Gallery</Text>
                <View style={{ width: 44 }} />
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={images}
                    renderItem={renderItem}
                    keyExtractor={(item, idx) => String(item._id || idx)}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="images-outline" size={60} color={Colors.textLight} />
                            <Text style={styles.emptyText}>No gallery images yet</Text>
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
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.background,
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
    listContent: { padding: 12 },
    galleryItem: {
        width: columnWidth,
        margin: 6,
        backgroundColor: Colors.backgroundCard,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    image: { width: '100%', height: 160, resizeMode: 'cover' },
    imageTitle: {
        padding: 10,
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: 16,
        marginTop: 16,
        fontWeight: '500',
    },
});

export default GalleryScreen;
