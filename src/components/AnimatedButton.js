import React, { useRef } from 'react';
import {
    TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated, View
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/colors';

const AnimatedButton = ({ title, onPress, loading = false, icon, style }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (!loading) {
            Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
        }
    };

    const handlePressOut = () => {
        if (!loading) {
            Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start();
        }
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.animWrapper, { transform: [{ scale: scaleAnim }] }]}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={loading ? null : onPress}
                    disabled={loading}
                    style={[styles.touchable, style]}
                >
                    <LinearGradient
                        colors={Colors.gradientPrimary}
                        style={styles.gradient}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.textWhite} size="small" />
                        ) : (
                            <View style={styles.content}>
                                {icon && <Icon name={icon} size={20} color={Colors.textWhite} style={styles.icon} />}
                                <Text style={styles.text}>{title}</Text>
                            </View>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center', width: '100%' },
    animWrapper: { width: '100%' },
    touchable: {
        width: '100%', borderRadius: 20, elevation: 6,
        shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3, shadowRadius: 16,
    },
    gradient: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    icon: { marginRight: 8 },
    text: { color: Colors.textWhite, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});

export default AnimatedButton;
