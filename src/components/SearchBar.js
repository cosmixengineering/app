import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/colors';

const SearchBar = ({
    value,
    onChangeText,
    placeholder = 'Search properties, areas, cities...',
    onFilterPress,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.searchContainer}>
                <Icon name="search-outline" size={20} color={Colors.textLight} style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.textLight}
                />
            </View>
            {onFilterPress && (
                <TouchableOpacity style={styles.filterButton} onPress={onFilterPress} activeOpacity={0.8}>
                    <Icon name="options-outline" size={22} color={Colors.textWhite} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 50,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    searchIcon: {
        marginRight: 0,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: Colors.textPrimary,
        paddingVertical: 0,
    },
    filterButton: {
        width: 50,
        height: 50,
        backgroundColor: Colors.primary,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    filterIcon: {
        fontSize: 20,
    },
});

export default SearchBar;
