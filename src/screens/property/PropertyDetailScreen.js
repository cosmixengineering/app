import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Linking,
    Platform,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import Video from 'react-native-video';
import Colors from '../../constants/colors';
import { normalizeProperty } from '../../components/PropertyCard';

const { width, height } = Dimensions.get('window');

const ADMIN_PHONE = '917400763089'; // Admin WhatsApp number

const PropertyDetailScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { property: initialProperty } = route.params || {};
    const [property, setProperty] = useState(initialProperty ? normalizeProperty(initialProperty) : {});
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

    if (!property || Object.keys(property).length === 0) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: Colors.textSecondary }}>{t('property.notFound')}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: Colors.primary, marginTop: 10 }}>{t('common.back')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const images = property.images?.length ? property.images : ['https://via.placeholder.com/300'];

    const checkAuthAndProceed = async () => {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            Alert.alert(
                t('auth.login'),
                t('auth.loginSubtitle'),
                [
                    { text: t('common.cancel'), style: 'cancel' },
                    { text: t('auth.login'), onPress: () => navigation.navigate('Login') },
                    { text: t('auth.signup'), onPress: () => navigation.navigate('Signup') }
                ]
            );
            return false;
        }
        return true;
    };

    const handleCall = async () => {
        if (!await checkAuthAndProceed()) return;
        Linking.openURL(`tel:+${ADMIN_PHONE}`);
    };

    const handleWhatsApp = async () => {
        if (!await checkAuthAndProceed()) return;

        const propertyTitle = property.title || 'Property';
        const propertyPrice = property.price || 'Contact for price';
        const propertyLocation = `${property.area || ''}, ${property.city || ''}`;
        const propertyId = property._id ? `(ID: ${property._id.slice(-8).toUpperCase()})` : '';

        const greeting = "Hello SS Property Guru Admin,\n\n";
        const body = `I am interested in this property: *${propertyTitle}*\nPrice: *${propertyPrice}*\nLocation: *${propertyLocation}*\n${propertyId}\n\nPlease provide more details.`;

        const message = greeting + body;
        Linking.openURL(`whatsapp://send?phone=${ADMIN_PHONE}&text=${encodeURIComponent(message)}`);
    };

    const handleShare = async () => {
        const message = t('property.shareMessage', {
            title: property.title,
            price: property.price,
            location: `${property.area}, ${property.city}`
        });

        try {
            const { Share } = require('react-native');
            await Share.share({
                message: message,
                title: property.title,
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        Alert.alert(
            isFavorite ? t('property.removedFavorite') : t('property.addedFavorite'),
            isFavorite ? t('property.removedFavoriteDesc') : t('property.addedFavoriteDesc')
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Image Section */}
                <View style={styles.imageSection}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={e => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / width);
                            setActiveImageIndex(index);
                        }}>
                        {images.map((img, index) => (
                            <Image
                                key={index}
                                source={{ uri: typeof img === 'string' ? img : img.url }}
                                style={styles.propertyImage}
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>

                    {/* Gradient Overlay */}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.imageGradient}
                    />

                    {/* Back Button */}
                    <TouchableOpacity
                        style={[styles.backButton, { top: Platform.OS === 'ios' ? Math.max(insets.top, 50) : insets.top + 15 }]}
                        onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color={Colors.textWhite} />
                    </TouchableOpacity>

                    {/* Action Buttons - Share & Favorite */}
                    <View style={[styles.topRightActions, { top: Platform.OS === 'ios' ? Math.max(insets.top, 50) : insets.top + 15 }]}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                            <Icon name="share-social-outline" size={20} color={Colors.textWhite} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={toggleFavorite}>
                            <Icon
                                name={isFavorite ? "heart" : "heart-outline"}
                                size={20}
                                color={isFavorite ? "#FF0000" : Colors.textWhite}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Image Counter Badge */}
                    <View style={[styles.imageCounter, { top: Platform.OS === 'ios' ? Math.max(insets.top + 60, 110) : insets.top + 75 }]}>
                        <Icon name="images-outline" size={14} color={Colors.textWhite} />
                        <Text style={styles.imageCounterText}>
                            {activeImageIndex + 1}/{images.length}
                        </Text>
                    </View>

                    {/* Price Header inside Image */}
                    <View style={styles.priceContainer}>
                        <View>
                            <Text style={styles.priceText}>{property.price}</Text>
                            {property.sellingType && (
                                <View style={styles.sellingTypeBadge}>
                                    <Text style={styles.sellingTypeText}>{t('property.for')} {t(`common.${property.sellingType.toLowerCase()}`)}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText} numberOfLines={1}>{t(`common.${property.type.toLowerCase()}`, { defaultValue: property.type })}</Text>
                        </View>
                    </View>
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    <Text style={styles.title}>{property.title}</Text>

                    {/* Property ID */}
                    {property._id && (
                        <View style={styles.propertyIdRow}>
                            <Icon name="pricetag-outline" size={14} color={Colors.textLight} />
                            <Text style={styles.propertyIdText}>{t('property.idLabel')}: {property._id.slice(-8).toUpperCase()}</Text>
                        </View>
                    )}

                    <View style={styles.locationWrapper}>
                        <Icon name="location-outline" size={16} color={Colors.primary} />
                        <Text style={styles.locationText}>
                            {[property.area, property.city]
                                .filter(val => val && val.length > 0 && !/^[a-f\d]{24}$/i.test(val))
                                .join(', ') || t('common.locationNA')}
                        </Text>
                    </View>

                    {/* Info Grid */}
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <View style={styles.infoIconBox}>
                                <Icon name="expand-outline" size={20} color={Colors.primary} />
                            </View>
                            <Text style={styles.infoValue} numberOfLines={1}>{property.sqft || property.areaSize || '-'}</Text>
                            <Text style={styles.infoLabel}>{t('common.area')}</Text>
                        </View>
                        <View style={styles.infoDivider} />
                        <View style={styles.infoItem}>
                            <View style={styles.infoIconBox}>
                                <Icon name="location-outline" size={20} color={Colors.primary} />
                            </View>
                            <Text style={styles.infoValue} numberOfLines={1}>
                                {(!property.city || /^[a-f\d]{24}$/i.test(property.city)) ? '-' : property.city}
                            </Text>
                            <Text style={styles.infoLabel}>{t('property.cityLabel')}</Text>
                        </View>
                        <View style={styles.infoDivider} />
                        <View style={styles.infoItem}>
                            <View style={styles.infoIconBox}>
                                <Icon name="pricetag-outline" size={20} color={Colors.primary} />
                            </View>
                            <Text style={styles.infoValue} numberOfLines={2}>{property.type || '-'}</Text>
                            <Text style={styles.infoLabel}>{t('common.type')}</Text>
                        </View>
                    </View>

                    {/* Description Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('common.description')}</Text>
                        <Text style={styles.descriptionText}>{property.description}</Text>
                    </View>

                    {/* Property Video */}
                    {property.videoUrl && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t('property.tourVideo')}</Text>
                            <View style={styles.videoWrapper}>
                                <Video
                                    source={{ uri: property.videoUrl }}
                                    style={styles.videoPlayer}
                                    controls={true}
                                    resizeMode="cover"
                                    paused={true}
                                />
                            </View>
                        </View>
                    )}

                    {/* Features List */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('common.features')}</Text>
                        <View style={styles.featuresGrid}>
                            {(property.features || [t('property.eliteDesign'), t('property.premiumLocation'), t('property.vastuCompliant')]).map((feature, idx) => (
                                <View key={idx} style={styles.featureItem}>
                                    <Icon name="checkmark-circle" size={18} color={Colors.primary} />
                                    <Text style={styles.featureText}>{feature}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.dateRow}>
                        <Icon name="time-outline" size={14} color={Colors.textLight} />
                        <Text style={styles.dateText}>{t('profile.listed')} {property.postedDate || t('common.justNow')}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Premium Action Bar */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.callActionButton} onPress={handleCall}>
                    <Icon name="call" size={20} color={Colors.primary} />
                    <Text style={styles.callLabel}>{t('common.call')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.whatsappActionButton} onPress={handleWhatsApp}>
                    <LinearGradient
                        colors={[Colors.primary, '#1B5E20']}
                        style={styles.whatsappGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}>
                        <Icon name="logo-whatsapp" size={20} color={Colors.textWhite} />
                        <Text style={styles.whatsappLabel}>{t('common.contactAdmin')}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    // Image Section
    imageSection: {
        height: height * 0.55,
        backgroundColor: Colors.border,
    },
    propertyImage: {
        width,
        height: '100%',
    },
    imageGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    backButton: {
        position: 'absolute',
        left: 20,
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    topRightActions: {
        position: 'absolute',
        right: 20,
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    imageCounter: {
        position: 'absolute',
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    imageCounterText: {
        color: Colors.textWhite,
        fontSize: 12,
        fontWeight: '700',
    },
    priceContainer: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    priceText: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.textWhite,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        marginBottom: 5,
    },
    sellingTypeBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    sellingTypeText: {
        color: Colors.textWhite,
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    typeBadge: {
        backgroundColor: Colors.accentMuted,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        maxWidth: 120,
        overflow: 'hidden',
        flexShrink: 1,
    },
    typeBadgeText: {
        color: Colors.textWhite,
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    // Content
    content: {
        marginTop: -20,
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        backgroundColor: Colors.background,
        padding: 30,
        paddingTop: 35,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 8,
        lineHeight: 34,
    },
    propertyIdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    propertyIdText: {
        fontSize: 12,
        color: Colors.textLight,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    locationWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 30,
    },
    locationText: {
        fontSize: 15,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    // Elite Grid
    infoGrid: {
        flexDirection: 'row',
        backgroundColor: Colors.surfaceSecondary,
        borderRadius: 24,
        padding: 24,
        marginBottom: 35,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: Colors.borderLight,
        elevation: 4,
        shadowColor: Colors.shadowPremium,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    infoItem: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    infoIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(27, 94, 32, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '800',
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: 4,
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    infoDivider: {
        width: 1,
        height: 50,
        backgroundColor: 'rgba(0,0,0,0.07)',
        marginTop: 10,
    },
    // Description
    section: {
        marginBottom: 35,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 15,
    },
    descriptionText: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 26,
    },
    // Agent Card
    agentCard: {
        backgroundColor: Colors.background,
        borderRadius: 28,
        padding: 24,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        marginBottom: 20,
        shadowColor: Colors.shadowPremium,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 6,
    },
    agentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 18,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.textWhite,
    },
    agentTextContainer: {
        flex: 1,
        marginLeft: 15,
    },
    agentName: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    agentRole: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    miniCall: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingLeft: 4,
    },
    dateText: {
        fontSize: 13,
        color: Colors.textLight,
        fontWeight: '500',
    },
    // Video
    videoWrapper: {
        height: 220,
        backgroundColor: '#000',
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: 10,
    },
    videoPlayer: {
        width: '100%',
        height: '100%',
    },
    // Features
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 5,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.surfaceSecondary,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 12,
        width: '100%', // Take full width to avoid overflow
        minHeight: 50,
    },
    featureText: {
        fontSize: 13,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 110,
        left: 20,
        right: 20,
        backgroundColor: Colors.backgroundCard,
        borderRadius: 35,
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexDirection: 'row',
        gap: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
        elevation: 15,
        shadowColor: Colors.shadowDark,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
    },
    callActionButton: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        borderWidth: 1.5,
        borderColor: Colors.borderLight,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.surfaceSecondary,
    },
    callLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.primary,
        marginTop: 2,
    },
    whatsappActionButton: {
        flex: 1,
        height: 65,
    },
    whatsappGradient: {
        flex: 1,
        borderRadius: 32.5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    whatsappLabel: {
        color: Colors.textWhite,
        fontSize: 17,
        fontWeight: '800',
    },
});

export default PropertyDetailScreen;

