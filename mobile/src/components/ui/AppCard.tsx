import React from 'react';
import { View, StyleSheet, ViewProps, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { colors, spacing, radii, shadows } from '../../theme';

export type CardVariant = 'default' | 'elevated' | 'tinted' | 'interactive';

export interface AppCardProps extends ViewProps {
  children: React.ReactNode;
  variant?: CardVariant;
  elevated?: boolean; // backwards compatibility
  padding?: keyof typeof spacing | number;
  borderRadius?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function AppCard({ 
  children, 
  variant = 'default',
  elevated = false, 
  padding = 'lg',
  borderRadius = radii.xl,
  style, 
  onPress,
  ...props 
}: AppCardProps) {
  
  const paddingValue = typeof padding === 'number' ? padding : spacing[padding] ?? spacing.lg;
  const effectiveVariant: CardVariant = elevated ? 'elevated' : variant;

  const getVariantStyles = (): ViewStyle => {
    switch (effectiveVariant) {
      case 'elevated':
        return {
          backgroundColor: colors.background.surface,
          borderWidth: 1,
          borderColor: colors.border.subtle,
          ...shadows.card,
        };
      case 'tinted':
        return {
          backgroundColor: colors.brand.tint,
          borderWidth: 1,
          borderColor: colors.brand.muted,
        };
      case 'interactive':
        return {
          backgroundColor: colors.background.surface,
          borderWidth: 1,
          borderColor: colors.border.subtle,
          ...shadows.xs,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.background.surface,
          borderWidth: 1,
          borderColor: colors.border.subtle,
        };
    }
  };

  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    {
      borderRadius,
      padding: paddingValue,
    },
    getVariantStyles(),
    style
  ];

  const content = (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        activeOpacity={0.85} 
        onPress={onPress} 
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  }
});
