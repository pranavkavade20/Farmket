import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from './AppText';
import { AppCard } from './AppCard';
import { colors, spacing, radii } from '../../theme';
import type { Product } from '../../api/products';
import { Star } from 'lucide-react-native';

interface AppProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
  action?: React.ReactNode;
  layout?: 'horizontal' | 'vertical';
  style?: any;
}

export const AppProductCard: React.FC<AppProductCardProps> = ({ 
  product, 
  onPress, 
  action,
  layout = 'horizontal',
  style
}) => {
  const primaryImage = product.images?.find((img) => img.is_primary)?.image || product.images?.[0]?.image;

  const isVertical = layout === 'vertical';

  const content = (
    <AppCard 
      elevated 
      padding={isVertical ? 0 : 'md'} 
      style={[
        isVertical ? styles.verticalCard : styles.horizontalCard,
        style
      ]}
    >
      {primaryImage ? (
        <Image 
          source={{ uri: primaryImage }} 
          style={isVertical ? styles.verticalImage : styles.horizontalImage} 
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.placeholderImage, isVertical ? styles.verticalImage : styles.horizontalImage]}>
          <AppText variant="small" color={colors.text.muted}>No image</AppText>
        </View>
      )}
      
      <View style={isVertical ? styles.verticalInfo : styles.horizontalInfo}>
        <AppText weight="bold" numberOfLines={1}>{product.name}</AppText>
        
        <View style={styles.priceRow}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <AppText weight="bold" color={colors.text.primary}>₹{product.price}</AppText>
            <AppText variant="small" color={colors.text.muted}> / {product.unit}</AppText>
          </View>
        </View>

        <View style={styles.ratingRow}>
          <Star size={12} color={colors.accent.yellow} fill={colors.accent.yellow} />
          <AppText variant="small" color={colors.text.secondary} style={{ marginLeft: 4 }}>
            {product.average_rating ? Number(product.average_rating).toFixed(1) : 'New'}
          </AppText>
        </View>
        
        {isVertical && action && (
          <View style={styles.verticalActionContainer}>{action}</View>
        )}
        {!isVertical && action && (
          <View style={styles.actionContainer}>{action}</View>
        )}
      </View>
    </AppCard>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(product)} activeOpacity={0.8} style={style}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={style}>{content}</View>;
};

const styles = StyleSheet.create({
  horizontalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  verticalCard: {
    flexDirection: 'column',
    overflow: 'hidden',
  },
  horizontalImage: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    backgroundColor: colors.border.subtle,
  },
  verticalImage: {
    width: '100%',
    aspectRatio: 1, // 1:1 image ratio
    backgroundColor: colors.border.subtle,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  verticalInfo: {
    padding: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  actionContainer: {
    marginLeft: spacing.sm,
  },
  verticalActionContainer: {
    marginTop: spacing.md,
  }
});
