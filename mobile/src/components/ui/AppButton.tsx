import React from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacityProps,
  View
} from 'react-native';
import { colors, spacing, radii, shadows } from '../../theme';
import { AppText } from './AppText';

export interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function AppButton({
  title,
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  disabled,
  ...props
}: AppButtonProps) {
  
  const isDisabled = disabled || loading;

  const getBackgroundColor = () => {
    if (isDisabled) {
      if (variant === 'ghost' || variant === 'outline') return 'transparent';
      return colors.background.elevated;
    }
    switch (variant) {
      case 'primary': return colors.brand.primary;
      case 'secondary': return colors.background.elevated;
      case 'accent': return colors.accent.amber;
      case 'danger': return colors.status.danger;
      case 'outline':
      case 'ghost':
      default: return 'transparent';
    }
  };

  const getBorderColor = () => {
    if (isDisabled) return variant === 'outline' ? colors.border.subtle : 'transparent';
    if (variant === 'outline') return colors.border.strong;
    if (variant === 'secondary') return colors.border.subtle;
    return 'transparent';
  };

  const getTextColor = () => {
    if (isDisabled) return colors.text.muted;
    switch (variant) {
      case 'primary':
      case 'accent':
      case 'danger':
        return colors.text.inverse;
      case 'ghost':
        return colors.brand.primary;
      case 'secondary':
      case 'outline':
      default:
        return colors.text.primary;
    }
  };

  const getHeight = () => {
    if (size === 'xs') return 30;
    if (size === 'sm') return 38;
    if (size === 'lg') return 54;
    return 46; // md
  };

  const getPaddingHorizontal = () => {
    if (size === 'xs') return spacing.sm;
    if (size === 'sm') return spacing.md;
    if (size === 'lg') return spacing.xxl;
    return spacing.lg;
  };

  const getBorderRadius = () => {
    if (shape === 'pill') return radii.full;
    if (size === 'xs') return radii.sm;
    if (size === 'sm') return radii.md;
    if (size === 'lg') return radii.xl;
    return radii.lg;
  };

  const isElevated = variant === 'primary' && !isDisabled;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      disabled={isDisabled}
      style={[
        styles.button,
        isElevated && shadows.xs,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' || variant === 'secondary' ? 1 : 0,
          height: getHeight(),
          paddingHorizontal: getPaddingHorizontal(),
          borderRadius: getBorderRadius(),
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}
          <AppText 
            weight={variant === 'ghost' ? 'semibold' : 'bold'} 
            color={getTextColor()} 
            style={[
              styles.text,
              size === 'xs' && styles.textXs,
              size === 'sm' && styles.textSmall,
              size === 'lg' && styles.textLarge,
            ]}
          >
            {title}
          </AppText>
          {rightIcon && <View style={styles.rightIconWrapper}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconWrapper: {
    marginRight: spacing.xs,
  },
  rightIconWrapper: {
    marginLeft: spacing.xs,
  },
  text: {
    textAlign: 'center',
    fontSize: 14,
  },
  textXs: {
    fontSize: 11,
  },
  textSmall: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 16,
  }
});
