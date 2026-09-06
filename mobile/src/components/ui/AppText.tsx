import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { colors, typography } from '../../theme';

export type TextVariant = 
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  // Backward compatibility:
  | 'headingLg'
  | 'heading'
  | 'subheading'
  | 'small';

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  children?: React.ReactNode;
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
  
  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'display':
        return {
          fontFamily: typography.presets.display.fontFamily,
          fontSize: typography.presets.display.fontSize,
          lineHeight: typography.presets.display.lineHeight,
        };
      case 'h1':
      case 'headingLg':
        return {
          fontFamily: typography.presets.h1.fontFamily,
          fontSize: typography.presets.h1.fontSize,
          lineHeight: typography.presets.h1.lineHeight,
        };
      case 'h2':
      case 'heading':
        return {
          fontFamily: typography.presets.h2.fontFamily,
          fontSize: typography.presets.h2.fontSize,
          lineHeight: typography.presets.h2.lineHeight,
        };
      case 'h3':
      case 'subheading':
        return {
          fontFamily: typography.presets.h3.fontFamily,
          fontSize: typography.presets.h3.fontSize,
          lineHeight: typography.presets.h3.lineHeight,
        };
      case 'bodySmall':
        return {
          fontFamily: typography.presets.bodySmall.fontFamily,
          fontSize: typography.presets.bodySmall.fontSize,
          lineHeight: typography.presets.bodySmall.lineHeight,
        };
      case 'caption':
        return {
          fontFamily: typography.presets.caption.fontFamily,
          fontSize: typography.presets.caption.fontSize,
          lineHeight: typography.presets.caption.lineHeight,
        };
      case 'label':
      case 'small':
        return {
          fontFamily: typography.presets.label.fontFamily,
          fontSize: typography.presets.label.fontSize,
          lineHeight: typography.presets.label.lineHeight,
          letterSpacing: 0.4,
        };
      case 'body':
      default:
        return {
          fontFamily: typography.presets.body.fontFamily,
          fontSize: typography.presets.body.fontSize,
          lineHeight: typography.presets.body.lineHeight,
        };
    }
  };

  const isHeadingVariant = ['display', 'h1', 'h2', 'h3', 'headingLg', 'heading', 'subheading'].includes(variant);

  const getFontFamily = (baseFont?: string) => {
    if (!weight) return baseFont;
    if (isHeadingVariant) {
      switch (weight) {
        case 'medium': return typography.family.displayMedium;
        case 'semibold': return typography.family.displaySemiBold;
        case 'bold': return typography.family.displayBold;
        default: return typography.family.displayMedium;
      }
    } else {
      switch (weight) {
        case 'normal': return typography.family.sans;
        case 'medium': return typography.family.sansMedium;
        case 'semibold': return typography.family.sansSemiBold;
        case 'bold': return typography.family.sansBold;
        default: return typography.family.sans;
      }
    }
  };

  const baseStyle = getVariantStyle();

  return (
    <Text 
      style={[
        baseStyle,
        { 
          color, 
          textAlign: align, 
          fontFamily: getFontFamily(baseStyle.fontFamily) 
        },
        style
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
}
