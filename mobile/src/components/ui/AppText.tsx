import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

type TextVariant = 
  | 'display' 
  | 'headingLg' 
  | 'heading' 
  | 'subheading' 
  | 'body' 
  | 'caption' 
  | 'small';

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  children: React.ReactNode;
}

export function AppText({ 
  variant = 'body', 
  color = colors.text.primary, 
  align = 'left',
  weight,
  style, 
  children, 
  ...props 
}: AppTextProps) {
  
  // Base variant styles
  const variantStyles = {
    display: {
      fontFamily: typography.family.displayBold,
      fontSize: typography.size.xxl,
      lineHeight: typography.size.xxl * typography.lineHeight.tight,
    },
    headingLg: {
      fontFamily: typography.family.displayBold,
      fontSize: typography.size.xl,
      lineHeight: typography.size.xl * typography.lineHeight.tight,
    },
    heading: {
      fontFamily: typography.family.displaySemiBold,
      fontSize: typography.size.lg,
      lineHeight: typography.size.lg * typography.lineHeight.tight,
    },
    subheading: {
      fontFamily: typography.family.displayMedium,
      fontSize: typography.size.lg,
      lineHeight: typography.size.lg * typography.lineHeight.tight,
    },
    body: {
      fontFamily: typography.family.sans,
      fontSize: typography.size.md,
      lineHeight: typography.size.md * typography.lineHeight.normal,
    },
    caption: {
      fontFamily: typography.family.sansMedium,
      fontSize: typography.size.sm,
      lineHeight: typography.size.sm * typography.lineHeight.normal,
    },
    small: {
      fontFamily: typography.family.sans,
      fontSize: typography.size.xs,
      lineHeight: typography.size.xs * typography.lineHeight.normal,
    },
  };

  const getFontFamily = () => {
    const isDisplay = ['display', 'headingLg', 'heading', 'subheading'].includes(variant);
    if (!weight) return variantStyles[variant].fontFamily;
    
    if (isDisplay) {
      switch(weight) {
        case 'medium': return typography.family.displayMedium;
        case 'semibold': return typography.family.displaySemiBold;
        case 'bold': return typography.family.displayBold;
        default: return typography.family.displayMedium;
      }
    } else {
      switch(weight) {
        case 'normal': return typography.family.sans;
        case 'medium': return typography.family.sansMedium;
        case 'semibold': return typography.family.sansSemiBold;
        case 'bold': return typography.family.sansBold;
        default: return typography.family.sans;
      }
    }
  };

  return (
    <Text 
      style={[
        variantStyles[variant],
        { color, textAlign: align, fontFamily: getFontFamily() },
        style
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
}
