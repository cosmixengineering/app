import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, Animated, StyleSheet, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/colors';

const FloatingLabelInput = ({
    label,
    value,
    onChangeText,
    icon,
    keyboardType = 'default',
    secureTextEntry = false,
    maxLength,
    prefix,
    style,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: isFocused || value ? 1 : 0,
            duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [isFocused, value, animatedValue]);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const labelStyle = {
        position: 'absolute',
        left: icon ? 44 : (prefix ? 48 : 16),
        top: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [22, 6],
        }),
        fontSize: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [15, 11],
        }),
        color: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [Colors.textLight, Colors.primary],
        }),
        fontWeight: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['500', '700'],
        }),
    };

    const borderColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(0,0,0,0.05)', Colors.primary],
    });

    const borderWidth = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.5],
    });

    return (
        <Animated.View style={[styles.container, style, { borderColor, borderWidth }]}>
            {icon && (
                <Icon
                    name={icon}
                    size={20}
                    color={isFocused || value ? Colors.primary : Colors.textLight}
                    style={styles.icon}
                />
            )}

            {prefix && (
                <Animated.Text style={[styles.prefix, { opacity: animatedValue }]}>
                    {prefix}
                </Animated.Text>
            )}

            <Animated.Text style={labelStyle}>
                {label}
            </Animated.Text>

            <TextInput
                style={[styles.input, { paddingLeft: icon ? 0 : 4 }]}
                value={value}
                onChangeText={onChangeText}
                onFocus={handleFocus}
                onBlur={handleBlur}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
                maxLength={maxLength}
                selectionColor={Colors.primary}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceSecondary,
        borderRadius: 18,
        height: 64,
        paddingHorizontal: 16,
        position: 'relative',
    },
    icon: {
        marginRight: 12,
    },
    prefix: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginRight: 8,
        paddingTop: 20,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: '600',
        height: '100%',
        paddingTop: 24,
        paddingBottom: 4,
    },
});

export default FloatingLabelInput;
