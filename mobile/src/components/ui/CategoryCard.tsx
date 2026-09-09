import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { colors, spacing, radii, shadows } from '../../theme';
import {
  VegetablesCategorySvg,
  FruitsCategorySvg,
  GrainsCategorySvg,
  DairyCategorySvg,
} from '../illustrations/ProduceIllustrations';
import { Tag } from 'lucide-react-native';

export interface CategoryCardProps {
  name: string;
  slug?: string;
  icon?: 'vegetables' | 'fruits' | 'grains' | 'dairy' | string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  active?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  slug = '',
  icon,
  onPress,
  style,
  active = false,
}) => {
  const normalizedKey = (icon || slug || name).toLowerCase();

  const getCategoryTheme = () => {
    if (normalizedKey.includes('veg') || normalizedKey.includes('greens')) {
      return {
        bg: '#F0FDF4',
        border: '#DCFCE7',
        renderIcon: () => <VegetablesCategorySvg size={30} />,
      };
    }
    if (normalizedKey.includes('fruit') || normalizedKey.includes('citrus') || normalizedKey.includes('berry')) {
      return {
        bg: '#FFFBEB',
        border: '#FEF3C7',
        renderIcon: () => <FruitsCategorySvg size={30} />,
      };
    }
    if (normalizedKey.includes('grain') || normalizedKey.includes('wheat') || normalizedKey.includes('pulse') || normalizedKey.includes('cereal')) {
      return {
        bg: '#FEFCE8',
        border: '#FEF9C3',
        renderIcon: () => <GrainsCategorySvg size={30} />,
      };
    }
    if (normalizedKey.includes('dairy') || normalizedKey.includes('milk') || normalizedKey.includes('egg')) {
      return {
        bg: '#F0F9FF',
        border: '#E0F2FE',
        renderIcon: () => <DairyCategorySvg size={30} />,
      };
    }
    return {
      bg: '#F8F9F5',
      border: '#EAECE7',
      renderIcon: () => <Tag size={24} color={colors.brand.primary} />,
    };
  };

  const theme = getCategoryTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: active ? colors.brand.tint : theme.bg,
          borderColor: active ? colors.brand.primary : theme.border,
        },
        style,
      ]}
    >
      <View style={styles.iconContainer}>
        {theme.renderIcon()}
      </View>
      <AppText
        variant="caption"
        weight="semibold"
        color={active ? colors.brand.primary : colors.text.primary}
        numberOfLines={1}
        style={styles.label}
      >
        {name}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 74,
    height: 84,
    borderRadius: radii.xxl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    ...shadows.xs,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
  },
});
