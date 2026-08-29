import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from './AppText';
import { AppCard } from './AppCard';
import { AppBadge } from './AppBadge';
import { colors, spacing, radii } from '../../theme';
import { formatCurrency } from '../../utils/format';
import type { Product } from '../../api/products';
import { Star, Leaf } from 'lucide-react-native';

interface AppProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
  action?: React.ReactNode;
  layout?: 'horizontal' | 'vertical';
  style?: ViewStyle;
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

  const farmerObj = typeof product.farmer === 'object' && product.farmer ? (product.farmer as { first_name?: string; last_name?: string }) : null;
  const farmerName = product.farmer_name || (farmerObj ? `${farmerObj.first_name || ''} ${farmerObj.last_name || ''}`.trim() : 'Farm Producer');

  const content = (
    <AppCard 
      elevated 
      padding={isVertical ? 0 : 'md'} 
      style={[
        isVertical ? styles.verticalCard : styles.horizontalCard,
        style
      ]}
    >
      <View style={isVertical ? styles.verticalImageWrapper : styles.horizontalImageWrapper}>
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

        {product.is_organic && (
          <View style={styles.organicBadgeContainer}>
            <View style={styles.organicBadge}>
              <Leaf size={10} color="#FFFFFF" />
            </View>
          </View>
        )}
      </View>
      
      <View style={isVertical ? styles.verticalInfo : styles.horizontalInfo}>
        {/* Status / Market state badge if pre-booking */}
        {product.market_state && product.market_state !== 'AVAILABLE_NOW' && (
          <View style={{ marginBottom: 4 }}>
            <AppBadge marketState={product.market_state} size="sm" label="" />
          </View>
        )}

        <AppText weight="bold" numberOfLines={1} style={styles.name}>{product.name}</AppText>
        
        <AppText variant="small" color={colors.text.secondary} numberOfLines={1} style={styles.farmer}>
          by {farmerName}
        </AppText>

        <View style={styles.priceRow}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <AppText weight="bold" color={colors.text.primary} style={styles.price}>
              {formatCurrency(product.price)}
            </AppText>
            <AppText variant="small" color={colors.text.muted}> / {product.unit}</AppText>
          </View>
        </View>

        <View style={styles.ratingRow}>
          <Star size={12} color={colors.accent.yellow} fill={colors.accent.yellow} />
          <AppText variant="small" weight="medium" color={colors.text.secondary} style={{ marginLeft: 4 }}>
            {product.average_rating ? Number(product.average_rating).toFixed(1) : '4.8'}
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
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.xl,
  },
  verticalCard: {
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.xl,
  },
  horizontalImageWrapper: {
    position: 'relative',
  },
  verticalImageWrapper: {
    position: 'relative',
    width: '100%',
  },
  horizontalImage: {
    width: 84,
    height: 84,
    borderRadius: radii.lg,
    backgroundColor: colors.background.elevated,
  },
  verticalImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.background.elevated,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  organicBadgeContainer: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  organicBadge: {
    backgroundColor: colors.brand.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  horizontalInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  verticalInfo: {
    padding: spacing.md,
  },
  name: {
    fontSize: 15,
  },
  farmer: {
    marginTop: 2,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 15,
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
    marginTop: spacing.sm,
  }
});
