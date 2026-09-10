import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/colors';

const { width } = Dimensions.get('window');

const SkeletonLoader = ({ style, width: sWidth, height: sHeight, borderRadius }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start();
    }, [animatedValue]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width]
    });

    return (
        <View style={[styles.skeleton, { width: sWidth || '100%', height: sHeight || 20, borderRadius: borderRadius || 8 }, style]}>
            <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.6)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

export const PropertyCardSkeleton = ({ horizontal, style }) => (
    <View style={[styles.cardContainer, horizontal && styles.cardContainerHorizontal, style]}>
        <SkeletonLoader height={horizontal ? 130 : 200} borderRadius={16} />
        <View style={styles.content}>
            <View style={styles.headerRow}>
                <SkeletonLoader width={80} height={22} borderRadius={6} />
                <SkeletonLoader width={40} height={22} borderRadius={6} />
            </View>
            <SkeletonLoader width="85%" height={26} borderRadius={6} style={{ marginTop: 14 }} />
            <SkeletonLoader width="60%" height={16} borderRadius={4} style={{ marginTop: 8 }} />
            <View style={styles.footerRow}>
                <SkeletonLoader width={60} height={16} borderRadius={4} />
                <SkeletonLoader width={60} height={16} borderRadius={4} />
                <SkeletonLoader width={60} height={16} borderRadius={4} />
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: Colors.borderLight,
        overflow: 'hidden',
    },
    cardContainer: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: 24,
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        elevation: 2,
        shadowColor: Colors.shadowMedium,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        marginBottom: 16,
    },
    cardContainerHorizontal: {
        width: width * 0.75,
        marginRight: 16,
        marginBottom: 4,
    },
    content: {
        marginTop: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 16,
        marginTop: 16,
    }
});

export default SkeletonLoader;
