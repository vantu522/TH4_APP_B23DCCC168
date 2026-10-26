import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import colors from '../../theme/colors';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'success' | 'danger' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
}: AppButtonProps) {
  const getBtnStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineBtn;
      case 'success':
        return styles.successBtn;
      case 'danger':
        return styles.dangerBtn;
      case 'secondary':
        return styles.secondaryBtn;
      default:
        return styles.primaryBtn;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      default:
        return styles.solidText;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.base, getBtnStyle(), disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? colors.primary : colors.white}
        />
      ) : (
        <>
          {icon ? icon : null}
          <Text style={[getTextStyle(), icon ? styles.withIcon : null]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  successBtn: {
    backgroundColor: colors.success,
  },
  dangerBtn: {
    backgroundColor: colors.danger,
  },
  secondaryBtn: {
    backgroundColor: colors.secondary,
  },
  solidText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  outlineText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  withIcon: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.6,
  },
});
