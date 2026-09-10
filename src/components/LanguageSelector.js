import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/colors';

const LANGUAGES = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
];

const LanguageSelector = () => {
    const { i18n, t } = useTranslation();
    const [modalVisible, setModalVisible] = useState(false);

    const selectLanguage = (code) => {
        i18n.changeLanguage(code);
        setModalVisible(false);
    };

    const currentLanguage = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

    return (
        <View>
            <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <View style={styles.iconCircle}>
                    <Icon name="language" size={18} color={Colors.textWhite} />
                </View>
                <Text style={styles.buttonText}>{currentLanguage.native}</Text>
                <Icon name="chevron-down" size={12} color={Colors.textWhite} style={styles.arrow} />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Language</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={24} color={Colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={LANGUAGES}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.languageItem,
                                        i18n.language === item.code && styles.selectedItem
                                    ]}
                                    onPress={() => selectLanguage(item.code)}
                                >
                                    <View style={styles.languageInfo}>
                                        <Text style={[
                                            styles.nativeLabel,
                                            i18n.language === item.code && styles.selectedText
                                        ]}>
                                            {item.native}
                                        </Text>
                                        <Text style={styles.englishLabel}>{item.label}</Text>
                                    </View>
                                    {i18n.language === item.code && (
                                        <Icon name="checkmark-circle" size={24} color={Colors.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    selectorButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        minWidth: 90,
    },
    iconCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    buttonText: {
        color: Colors.textWhite,
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    arrow: {
        marginLeft: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: Colors.background,
        borderRadius: 28,
        padding: 24,
        maxHeight: '80%',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.textPrimary,
    },
    languageItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedItem: {
        backgroundColor: Colors.primarySoft,
        borderColor: Colors.primary,
    },
    languageInfo: {
        flex: 1,
    },
    nativeLabel: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    englishLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    selectedText: {
        color: Colors.primary,
    },
});

export default LanguageSelector;
