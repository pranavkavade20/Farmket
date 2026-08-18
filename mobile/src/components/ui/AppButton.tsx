import React from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle, 
  TouchableOpacityProps
} from 'react-native';
import { colors, spacing, radii } from '../../theme';
import { AppText } from './AppText';

export interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function AppButton({
  title,
  variant = 'primary',
  size = 'md',
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
    if (variant === 'primary') return isDisabled ? colors.brand.muted : colors.brand.primary;
    if (variant === 'secondary') return isDisabled ? colors.border.subtle : colors.background.elevated;
    if (variant === 'danger') return isDisabled ? colors.status.dangerMuted : colors.status.danger;
    return 'transparent';
  };

  const getBorderColor = () => {
    if (variant === 'outline') return isDisabled ? colors.border.subtle : colors.border.strong;
    if (variant === 'secondary') return colors.border.subtle;
    return 'transparent';
  };

  const getTextColor = () => {
    if (variant === 'primary' || variant === 'danger') return colors.text.inverse;
    if (isDisabled) return colors.text.muted;
    if (variant === 'ghost' || variant === 'outline') return colors.text.primary;
    return colors.text.primary;
  };

  const getHeight = () => {
    if (size === 'sm') return 36;
    if (size === 'lg') return 56;
    return 48; // md
  };

  const getPadding = () => {
    if (size === 'sm') return spacing.md;
    if (size === 'lg') return spacing.xl;
    return spacing.lg;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' || variant === 'secondary' ? 1 : 0,
          height: getHeight(),
          paddingHorizontal: getPadding(),
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {leftIcon && leftIcon}
          <AppText 
            weight="medium" 
            color={getTextColor()} 
            style={[
              styles.text, 
              { 
                marginLeft: leftIcon ? spacing.sm : 0,
                marginRight: rightIcon ? spacing.sm : 0 
              }
            ]}
          >
            {title}
          </AppText>
          {rightIcon && rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  text: {
    textAlign: 'center',
  }
});
