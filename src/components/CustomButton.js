import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/colors';

const CustomButton = ({
    title,
    onPress,
    variant = 'primary', // 'primary' | 'outline' | 'secondary' | 'accent'
    size = 'medium', // 'small' | 'medium' | 'large'
    loading = false,
    disabled = false,
    icon,
    style,
    textStyle,
}) => {
    const getButtonStyle = () => {
        const base = [styles.button, styles[`${size}Button`]];

        switch (variant) {
            case 'outline':
                base.push(styles.outlineButton);
                break;
            case 'secondary':
                base.push(styles.secondaryButton);
                break;
            case 'accent':
                base.push(styles.accentButton);
                break;
            default:
                base.push(styles.primaryButton);
        }

        if (disabled || loading) {
            base.push(styles.disabledButton);
        }

        return base;
    };

    const getTextStyle = () => {
        const base = [styles.text, styles[`${size}Text`]];

        switch (variant) {
            case 'outline':
                base.push(styles.outlineText);
                break;
            case 'secondary':
                base.push(styles.secondaryText);
                break;
            default:
                base.push(styles.primaryText);
        }

        return base;
    };

    return (
        <TouchableOpacity
            style={[...getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}>
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' ? Colors.primary : Colors.textWhite}
                    size="small"
                />
            ) : (
                <>
                    {icon && (
                        <Icon
                            name={icon}
                            size={size === 'large' ? 20 : 16}
                            color={variant === 'outline' ? Colors.primary : Colors.textWhite}
                        />
                    )}
                    <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
        gap: 8,
    },
    // Sizes
    smallButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    mediumButton: {
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
    largeButton: {
        paddingHorizontal: 32,
        paddingVertical: 18,
        borderRadius: 16,
    },
    // Variants
    primaryButton: {
        backgroundColor: Colors.primary,
        elevation: 3,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    secondaryButton: {
        backgroundColor: Colors.primarySoft,
    },
    accentButton: {
        backgroundColor: Colors.accent,
        elevation: 3,
        shadowColor: Colors.accent,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    disabledButton: {
        opacity: 0.6,
    },
    // Text Sizes
    smallText: {
        fontSize: 12,
    },
    mediumText: {
        fontSize: 15,
    },
    largeText: {
        fontSize: 17,
    },
    // Text Variants
    text: {
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    primaryText: {
        color: Colors.textWhite,
    },
    outlineText: {
        color: Colors.primary,
    },
    secondaryText: {
        color: Colors.primary,
    },
    icon: {
        fontSize: 16,
    },
});

export default CustomButton;
