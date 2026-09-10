import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import Colors from '../constants/colors';

const Loader = ({ message = 'Loading...', fullScreen = true }) => {
    if (fullScreen) {
        return (
            <View style={styles.fullScreen}>
                <View style={styles.loaderBox}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.message}>{message}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.inline}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.inlineMessage}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreen: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    loaderBox: {
        backgroundColor: Colors.backgroundCard,
        paddingHorizontal: 32,
        paddingVertical: 24,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    message: {
        marginTop: 12,
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    inline: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 10,
    },
    inlineMessage: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
});

export default Loader;
