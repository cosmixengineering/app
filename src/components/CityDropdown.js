import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator, FlatList, Keyboard, KeyboardAvoidingView, Modal,
    Platform, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/colors';

const CityDropdown = ({ districts, value, onChange, loading, error, onRetry }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { height } = useWindowDimensions();
    const [visible, setVisible] = useState(false);
    const [search, setSearch] = useState('');
    const title = t('property.selectCity', { defaultValue: 'Select city' });
    const searchLabel = t('property.searchCity', { defaultValue: 'Search city or district' });
    const cities = useMemo(() => {
        const names = districts.map(district => typeof district === 'string'
            ? district : district?.name || district?.city || district?.district);
        // Keep API values intact for submission and existing property edits.
        if (value) { names.push(value); }
        return [...new Set(names.filter(name => typeof name === 'string' && name.trim()))]
            .sort((a, b) => a.localeCompare(b));
    }, [districts, value]);
    const filtered = cities.filter(city => city.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
    const close = () => {
        Keyboard.dismiss();
        setVisible(false);
        setSearch('');
    };

    return (
        <>
            <Pressable
                testID="city-dropdown"
                accessibilityRole="button"
                accessibilityLabel={`${title}${value ? ': ' + value : ''}`}
                accessibilityState={{ expanded: visible }}
                onPress={() => { Keyboard.dismiss(); setVisible(true); }}
                style={({ pressed }) => [styles.trigger, visible && styles.triggerActive, pressed && styles.pressed]}>
                <View style={styles.locationIcon}><Icon name="location-outline" size={20} color={Colors.primaryDark} /></View>
                <Text style={[styles.value, !value && styles.placeholder]}>{value || title}</Text>
                <Icon name="chevron-down" size={20} color={Colors.textSecondary} />
            </Pressable>
            <Modal visible={visible} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
                <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <Pressable testID="city-backdrop" style={StyleSheet.absoluteFill} onPress={close} accessible={false} />
                    <View accessibilityViewIsModal style={[styles.sheet, {
                        height: Math.min(height * 0.72, 600),
                        maxHeight: height - insets.top - 16,
                        paddingBottom: Math.max(insets.bottom, 16),
                    }]}>
                        <View style={styles.handle} />
                        <View style={styles.header}>
                            <Text accessibilityRole="header" style={styles.title}>{title}</Text>
                            <Pressable testID="city-close" accessibilityRole="button" accessibilityLabel={t('common.cancel')}
                                onPress={close} style={styles.close}>
                                <Icon name="close" size={24} color={Colors.textSecondary} />
                            </Pressable>
                        </View>
                        <View style={styles.searchBox}>
                            <Icon name="search-outline" size={20} color={Colors.textSecondary} />
                            <TextInput testID="city-search" style={styles.searchInput} value={search} onChangeText={setSearch}
                                placeholder={searchLabel} accessibilityLabel={searchLabel} placeholderTextColor={Colors.textSecondary}
                                autoCorrect={false} autoCapitalize="none" selectionColor={Colors.primary} />
                        </View>
                        {loading ? (
                            <View style={styles.message}><ActivityIndicator color={Colors.primary} /><Text style={styles.messageText}>
                                {t('property.loadingCities', { defaultValue: 'Loading cities…' })}
                            </Text></View>
                        ) : error ? (
                            <View style={styles.message}>
                                <Text style={styles.messageText}>{t('property.citiesError', { defaultValue: 'Could not load cities. Please try again.' })}</Text>
                                <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}>
                                    <Text style={styles.selectedText}>{t('property.retryCities', { defaultValue: 'Try again' })}</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <FlatList data={filtered} keyExtractor={item => item} keyboardShouldPersistTaps="handled"
                                keyboardDismissMode="on-drag" contentContainerStyle={styles.list}
                                ListEmptyComponent={<Text style={styles.empty}>{search.trim()
                                    ? t('property.noCityMatches', { defaultValue: 'No matching cities. Try another spelling.' })
                                    : t('property.noCities', { defaultValue: 'No cities available yet.' })}</Text>}
                                renderItem={({ item }) => (
                                    <Pressable accessibilityRole="radio" accessibilityState={{ checked: item === value }}
                                        onPress={() => { onChange(item); close(); }}
                                        style={({ pressed }) => [styles.option, item === value && styles.selected, pressed && styles.pressed]}>
                                        <Text style={[styles.optionText, item === value && styles.selectedText]}>{item}</Text>
                                        <Icon name={item === value ? 'checkmark-circle' : 'ellipse-outline'} size={22}
                                            color={item === value ? Colors.primaryDark : Colors.border} />
                                    </Pressable>
                                )} />
                        )}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    trigger: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 58, padding: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, marginBottom: 20 },
    triggerActive: { borderColor: Colors.primary },
    locationIcon: { padding: 8, borderRadius: 10, backgroundColor: Colors.primarySoft },
    value: { flex: 1, fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
    placeholder: { color: Colors.textSecondary, fontWeight: '400' },
    pressed: { backgroundColor: Colors.primarySoft },
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.4)' },
    sheet: { flexShrink: 1, backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, width: '100%', maxWidth: 600, alignSelf: 'center', overflow: 'hidden' },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginTop: 10, marginBottom: 8 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    title: { flex: 1, fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
    close: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
    searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.surfaceSecondary, borderRadius: 14, paddingHorizontal: 14, marginBottom: 12 },
    searchInput: { flex: 1, minHeight: 50, fontSize: 15, color: Colors.textPrimary },
    list: { paddingBottom: 8 },
    option: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 54, padding: 14, borderRadius: 12, marginBottom: 4 },
    optionText: { flex: 1, color: Colors.textPrimary, fontSize: 16 },
    selected: { backgroundColor: Colors.primarySoft },
    selectedText: { color: Colors.primaryDark, fontWeight: '700' },
    message: { padding: 24, alignItems: 'center', gap: 12 },
    messageText: { color: Colors.textSecondary, textAlign: 'center' },
    retry: { minHeight: 48, paddingHorizontal: 20, justifyContent: 'center', backgroundColor: Colors.primarySoft, borderRadius: 12 },
    empty: { padding: 24, textAlign: 'center', color: Colors.textSecondary },
});

export default CityDropdown;
