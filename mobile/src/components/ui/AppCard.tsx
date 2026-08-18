import React from 'react';
import { View, StyleSheet, ViewProps, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { colors, spacing, radii, shadows } from '../../theme';

export interface AppCardProps extends ViewProps {
  children: React.ReactNode;
  elevated?: boolean;
  padding?: keyof typeof spacing | number;
  onPress?: TouchableOpacityProps['onPress'];
}

export function AppCard({ 
  children, 
  elevated = false, 
  padding = 'lg',
  style, 
  onPress,
  ...props 
}: AppCardProps) {
  
  const paddingValue = typeof padding === 'number' ? padding : spacing[padding];

  const content = (
    <View 
      style={[
        styles.card,
        elevated && shadows.md,
        { 
          backgroundColor: elevated ? colors.background.elevated : colors.background.surface,
          padding: paddingValue,
        },
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  }
});
