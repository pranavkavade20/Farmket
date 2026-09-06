import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from './AppText';
import { AppCard } from './AppCard';
import { AppBadge } from './AppBadge';
import { colors, spacing, radii, shadows } from '../../theme';
import { formatCurrency } from '../../utils/format';
import type { Product } from '../../api/products';
import { Star, Leaf, MapPin, Plus } from 'lucide-react-native';

interface AppProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
  onQuickAdd?: (product: Product) => void;
  action?: React.ReactNode;
  layout?: 'horizontal' | 'vertical';
  style?: ViewStyle;
}

export const AppProductCard: React.FC<AppProductCardProps> = ({ 
  product, 
  onPress, 
  onQuickAdd,
  action,
  layout = 'horizontal',
  style
}) => {
  const primaryImage = product.images?.find((img) => img.is_primary)?.image || product.images?.[0]?.image;
  const isVertical = layout === 'vertical';

  const farmerObj = typeof product.farmer === 'object' && product.farmer ? (product.farmer as { first_name?: string; last_name?: string }) : null;
  const farmerName = product.farmer_name || (farmerObj ? `${farmerObj.first_name || ''} ${farmerObj.last_name || ''}`.trim() : 'Verified Grower');

  const content = (
    <AppCard 
      variant="elevated"
      padding={0}
      borderRadius={radii.xl}
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
            <Leaf size={24} color={colors.brand.primary} />
            <AppText variant="caption" color={colors.text.muted} style={{ marginTop: 4 }}>Fresh Farm</AppText>
          </View>
        )}

        {/* Floating Organic Badge */}
        {product.is_organic && (
          <View style={styles.organicBadgeContainer}>
            <View style={styles.organicBadge}>
              <Leaf size={10} color="#FFFFFF" strokeWidth={2.5} />
              <AppText variant="label" color="#FFFFFF" weight="bold" style={styles.organicText}>
                Organic
              </AppText>
            </View>
          </View>
        )}

        {/* Floating Market State Badge for vertical */}
        {isVertical && product.market_state && product.market_state !== 'AVAILABLE_NOW' && (
          <View style={styles.verticalStateBadge}>
            <AppBadge marketState={product.market_state} size="xs" label="" />
          </View>
        )}
      </View>
      
      <View style={isVertical ? styles.verticalInfo : styles.horizontalInfo}>
        {/* Horizontal Market State badge */}
        {!isVertical && product.market_state && product.market_state !== 'AVAILABLE_NOW' && (
          <View style={{ marginBottom: 4 }}>
            <AppBadge marketState={product.market_state} size="xs" label="" />
          </View>
        )}

        <AppText variant="h3" weight="bold" numberOfLines={1} style={styles.name}>
          {product.name}
        </AppText>
        
        <View style={styles.farmerRow}>
          <AppText variant="caption" color={colors.text.secondary} numberOfLines={1} style={styles.farmerText}>
            {farmerName}
          </AppText>
          <View style={styles.ratingBadge}>
            <Star size={11} color={colors.accent.amber} fill={colors.accent.amber} />
            <AppText variant="label" weight="bold" color={colors.text.primary} style={{ marginLeft: 3 }}>
              {product.average_rating ? Number(product.average_rating).toFixed(1) : '4.9'}
            </AppText>
          </View>
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceGroup}>
            <AppText variant="h3" weight="bold" color={colors.brand.primary}>
              {formatCurrency(product.price)}
            </AppText>
            <AppText variant="caption" color={colors.text.muted} style={{ marginLeft: 2 }}>
              /{product.unit}
            </AppText>
          </View>

          {/* Quick Add or Action button */}
          {action ? (
            <View style={styles.actionWrapper}>{action}</View>
          ) : onQuickAdd ? (
            <TouchableOpacity 
              style={styles.quickAddButton} 
              onPress={() => onQuickAdd(product)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </AppCard>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(product)} activeOpacity={0.88}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  horizontalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.background.surface,
  },
  verticalCard: {
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: colors.background.surface,
  },
  horizontalImageWrapper: {
    position: 'relative',
  },
  verticalImageWrapper: {
    position: 'relative',
    width: '100%',
  },
  horizontalImage: {
    width: 92,
    height: 92,
    borderRadius: radii.lg,
    backgroundColor: colors.background.elevated,
  },
  verticalImage: {
    width: '100%',
    aspectRatio: 1.1,
    backgroundColor: colors.background.elevated,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.tint,
  },
  organicBadgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  organicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 118, 110, 0.92)',
    borderRadius: radii.pill,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
    ...shadows.xs,
  },
  organicText: {
    fontSize: 9,
    textTransform: 'uppercase',
  },
  verticalStateBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
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
    marginBottom: 2,
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  farmerText: {
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    marginLeft: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  actionWrapper: {
    marginLeft: spacing.sm,
  },
  quickAddButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  }
});
