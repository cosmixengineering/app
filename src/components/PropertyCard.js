import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableWithoutFeedback,
    Dimensions,
    Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import Colors from '../constants/colors';
import { formatPrice } from '../utils/helpers';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.44;

const PLACEHOLDER = 'https://via.placeholder.com/300';

// Safely get image URI from property
const getImageUri = (images) => {
    if (!images || !Array.isArray(images) || images.length === 0) {
        console.log('PropertyCard: No images array found');
        return PLACEHOLDER;
    }
    const first = images[0];
    if (typeof first === 'string') {
        console.log('PropertyCard: Image is string:', first);
        return first || PLACEHOLDER;
    }
    if (first && typeof first === 'object') {
        const uri = first.url || first.secure_url || PLACEHOLDER;
        console.log('PropertyCard: Image is object, extracted URI:', uri);
        return uri;
    }
    console.log('PropertyCard: Unknown image format:', first);
    return PLACEHOLDER;
};

// Normalize backend property fields to what UI expects
export const normalizeProperty = (item, t) => {
    const translate = t || ((key) => key.split('.').pop() || key); // Fallback for when t is not provided
    if (!item || typeof item !== 'object') {
        console.warn('normalizeProperty received invalid item:', item);
        return {
            _id: String(Math.random()),
            title: translate('property.notFound'),
            type: translate('common.property'),
            city: '',
            area: '',
            price: translate('property.priceOnRequest'),
            sqft: '',
            bedrooms: 0,
            bathrooms: 0,
            featured: false,
            postedDate: '',
            images: [],
            agentPhone: '',
            agentAvatar: '',
            videoUrl: '',
        };
    }

    return {
        ...item,
        _id: item._id || item.id || String(Math.random()),
        title: item.title || translate('property.notFound'),
        type: item.type || item.category || item.sellingType || translate('common.property'),
        city: item.city || item.district || (typeof item.district === 'object' ? item.district?.name : '') || '',
        area: item.area || (typeof item.area === 'object' ? item.area?.name : '') || '',
        price: item.price
            ? (typeof item.price === 'string' && (item.price.includes('PKR') || item.price.includes('₹'))
                ? item.price.replace('PKR', '₹')
                : formatPrice(Number(item.price)))
            : translate('property.priceOnRequest'),
        sqft: item.sqft
            ? (typeof item.sqft === 'string' && (item.sqft.includes('sqft') || item.sqft.includes('Sq.Ft')) ? item.sqft : `${item.sqft} ${translate('common.sqft')}`)
            : (item.areaSize ? `${item.areaSize} ${translate('common.sqft')}` : ''),
        bedrooms: item.bedrooms || 0,
        bathrooms: item.bathrooms || 0,
        featured: item.featured || item.isFeatured || false,
        postedDate: item.postedDate || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''),
        images: item.images || [],
        // Agent info - backend has contactNumber on property and contact on agent
        agentPhone: item.contactNumber || (typeof item.agent === 'object' ? item.agent?.contact || item.agent?.phone : '') || item.agentPhone || '',
        agentAvatar: item.agentAvatar || (typeof item.agent === 'object' ? item.agent?.avatar : '') || '',
        agentName: typeof item.agent === 'object' ? item.agent?.name : (item.agent || translate('common.agent')),
        videoUrl: item.videoUrl || item.video || '',
    };
};

const PropertyCard = ({ property: rawProperty, onPress, style, horizontal = false }) => {
    const { t } = useTranslation();
    const property = normalizeProperty(rawProperty, t);
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const imageUri = getImageUri(property.images);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
    };

    if (horizontal) {
        return (
            <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
                <Animated.View style={[styles.horizontalCard, style, { transform: [{ scale: scaleAnim }] }]}>
                    <Image source={{ uri: imageUri }} style={styles.horizontalImage} resizeMode="cover" />
                    <View style={styles.horizontalBadge}>
                        <Text style={styles.badgeText}>{property.type}</Text>
                    </View>
                    <View style={styles.horizontalContent}>
                        <Text style={styles.horizontalTitle} numberOfLines={1}>{property.title}</Text>
                        <View style={styles.locationRow}>
                            <Icon name="location-outline" size={12} color={Colors.textSecondary} style={{ marginRight: 4 }} />
                            <Text style={styles.locationText} numberOfLines={1}>
                                {[property.area, property.city]
                                    .filter(val => val && val.length > 0 && !/^[a-f\d]{24}$/i.test(val))
                                    .join(', ') || t('common.locationNA')}
                            </Text>
                        </View>
                        <View style={styles.horizontalFooter}>
                            <Text style={styles.price}>{property.price}</Text>
                            {!!property.sqft && (
                                <View style={styles.sqftBadge}>
                                    <Text style={styles.sqftText}>{property.sqft}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </Animated.View>
            </TouchableWithoutFeedback>
        );
    }

    return (
        <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
            <Animated.View style={[styles.card, style, { transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{property.type}</Text>
                    </View>
                    {property.featured && (
                        <View style={styles.featuredBadge}>
                            <Icon name="star" size={10} color={Colors.textWhite} style={{ marginRight: 4 }} />
                            <Text style={styles.featuredText}>{t('common.featured')}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.content}>
                    <Text style={styles.title} numberOfLines={2}>{property.title}</Text>
                    <View style={styles.locationRow}>
                        <Icon name="location-outline" size={14} color={Colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={styles.locationText} numberOfLines={1}>
                            {[property.area, property.city]
                                .filter(val => val && val.length > 0 && !/^[a-f\d]{24}$/i.test(val))
                                .join(', ') || t('common.locationNA')}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        {!!property.sqft && (
                            <View style={styles.infoItem}>
                                <Icon name="resize-outline" size={14} color={Colors.textSecondary} />
                                <Text style={styles.infoText}>{property.sqft}</Text>
                            </View>
                        )}
                        {property.type && (
                            <View style={styles.infoItem}>
                                <Icon name="pricetag-outline" size={14} color={Colors.textSecondary} />
                                <Text style={styles.infoText}>{property.type}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.footer}>
                        <Text style={styles.price}>{property.price}</Text>
                        <Text style={styles.dateText}>{property.postedDate}</Text>
                    </View>
                </View>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: 24,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.borderLight,
        elevation: 6,
        shadowColor: Colors.shadowPremium,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    imageContainer: { position: 'relative' },
    image: { width: '100%', height: 220, backgroundColor: Colors.borderLight },
    badge: {
        position: 'absolute', top: 16, left: 16,
        backgroundColor: Colors.primary,
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3,
    },
    badgeText: { color: Colors.textWhite, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
    featuredBadge: {
        position: 'absolute', top: 16, right: 16,
        backgroundColor: Colors.accent,
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
        flexDirection: 'row', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3,
    },
    featuredText: { color: Colors.textWhite, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    content: { padding: 18 },
    title: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8, lineHeight: 24 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    locationText: { fontSize: 14, color: Colors.textSecondary, flex: 1 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 16 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
    footer: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 14,
    },
    price: { fontSize: 20, fontWeight: '900', color: Colors.primary },
    dateText: { fontSize: 12, color: Colors.textLight, fontWeight: '500' },
    // Horizontal
    horizontalCard: {
        width: width * 0.75, backgroundColor: Colors.backgroundCard,
        borderRadius: 20, marginRight: 16, overflow: 'hidden',
        borderWidth: 1, borderColor: Colors.borderLight,
        elevation: 6, shadowColor: Colors.shadowPremium,
        shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 16,
        marginBottom: 10,
    },
    horizontalImage: { width: '100%', height: 160, backgroundColor: Colors.borderLight },
    horizontalBadge: {
        position: 'absolute', top: 12, left: 12,
        backgroundColor: Colors.primary,
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    },
    horizontalContent: { padding: 14 },
    horizontalTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
    horizontalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    sqftBadge: { backgroundColor: Colors.primarySoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    sqftText: { fontSize: 11, color: Colors.primaryDark, fontWeight: '700' },
});

export default PropertyCard;
