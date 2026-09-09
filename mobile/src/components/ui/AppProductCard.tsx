import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from './AppText';
import { AppCard } from './AppCard';
import { colors, spacing, radii, shadows } from '../../theme';
import { formatCurrency } from '../../utils/format';
import type { Product } from '../../api/products';
import {
  TomatoesIllustration,
  SpinachIllustration,
  CarrotsIllustration,
} from '../illustrations/ProduceIllustrations';
import { Star, Heart, ShoppingCart, Leaf } from 'lucide-react-native';

interface AppProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
  onQuickAdd?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  action?: React.ReactNode;
  layout?: 'horizontal' | 'vertical';
  style?: ViewStyle;
}

export const AppProductCard: React.FC<AppProductCardProps> = ({
  product,
  onPress,
  onQuickAdd,
  onToggleFavorite,
  action,
  layout = 'horizontal',
  style,
}) => {
  const [isFavorited, setIsFavorited] = useState(!!product.is_following);
  const primaryImage = product.images?.find((img) => img.is_primary)?.image || product.images?.[0]?.image;
  const isVertical = layout === 'vertical';

  const farmerObj = typeof product.farmer === 'object' && product.farmer ? (product.farmer as { first_name?: string; last_name?: string; farm_name?: string }) : null;
  const farmerName = product.farmer_name || farmerObj?.farm_name || (farmerObj ? `${farmerObj.first_name || ''} ${farmerObj.last_name || ''}`.trim() : 'Ramesh Farm');

  const normalizedName = (product.name || '').toLowerCase();

  const handleFavoritePress = () => {
    setIsFavorited(!isFavorited);
    if (onToggleFavorite) {
      onToggleFavorite(product);
    }
  };

  const renderProductGraphic = (size: number) => {
    if (primaryImage) {
      return (
        <Image
          source={{ uri: primaryImage }}
          style={[isVertical ? styles.verticalImage : styles.horizontalImage, { width: '100%', height: '100%' }]}
          contentFit="contain"
          transition={200}
        />
      );
    }

    if (normalizedName.includes('tomato')) {
      return <TomatoesIllustration size={size} />;
    }
    if (normalizedName.includes('spinach') || normalizedName.includes('palak') || normalizedName.includes('leaf')) {
      return <SpinachIllustration size={size} />;
    }
    if (normalizedName.includes('carrot')) {
      return <CarrotsIllustration size={size} />;
    }
    return (
      <View style={styles.placeholderGraphic}>
        <Leaf size={size * 0.4} color={colors.brand.primary} />
      </View>
    );
  };

  // Card Content
  const content = (
    <AppCard
      variant="default"
      padding={0}
      borderRadius={radii.xxl}
      style={[
        styles.cardBase,
        isVertical ? styles.verticalCard : styles.horizontalCard,
        style,
      ]}
    >
      {/* Visual Image Container */}
      <View style={isVertical ? styles.verticalImageContainer : styles.horizontalImageContainer}>
        {renderProductGraphic(isVertical ? 90 : 70)}

        {/* Favorite Heart Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.75}
        >
          <Heart
            size={16}
            color={isFavorited ? '#EF4444' : colors.text.muted}
            fill={isFavorited ? '#EF4444' : 'none'}
            strokeWidth={1.8}
          />
        </TouchableOpacity>
      </View>

      {/* Info Body */}
      <View style={isVertical ? styles.verticalBody : styles.horizontalBody}>
        <AppText
          variant="bodySmall"
          weight="bold"
          numberOfLines={1}
          color={colors.text.primary}
          style={styles.name}
        >
          {product.name}
        </AppText>

        <AppText
          variant="caption"
          color={colors.text.muted}
          numberOfLines={1}
          style={styles.farmer}
        >
          {farmerName}
        </AppText>

        {/* Bottom Price & Action Row */}
        <View style={styles.bottomRow}>
          <View style={styles.priceCol}>
            <View style={styles.priceUnitRow}>
              <AppText variant="body" weight="bold" color={colors.text.primary}>
                {formatCurrency(product.price)}
              </AppText>
              <AppText variant="caption" color={colors.text.muted} style={{ marginLeft: 1 }}>
                /{product.unit || 'kg'}
              </AppText>
            </View>

            {/* Rating badge */}
            <View style={styles.ratingRow}>
              <Star size={11} color="#EAB308" fill="#EAB308" />
              <AppText variant="label" weight="bold" color={colors.text.primary} style={{ marginLeft: 3 }}>
                {product.average_rating ? Number(product.average_rating).toFixed(1) : '4.8'}
              </AppText>
              <AppText variant="label" color={colors.text.muted} style={{ marginLeft: 2 }}>
                ({product.reviews_count || product.reviews?.length || 124})
              </AppText>
            </View>
          </View>

          {/* Cart Action Button */}
          {action ? (
            <View style={styles.actionSlot}>{action}</View>
          ) : (
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => onQuickAdd && onQuickAdd(product)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              activeOpacity={0.8}
            >
              <ShoppingCart size={15} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </AppCard>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(product)} activeOpacity={0.85}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  cardBase: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAECE7',
    ...shadows.xs,
  },
  // Vertical (Reference Featured Products horizontal scroll)
  verticalCard: {
    width: 164,
    borderRadius: radii.xxl,
    overflow: 'hidden',
  },
  verticalImageContainer: {
    width: '100%',
    height: 116,
    backgroundColor: '#F8F9F5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: spacing.xs,
  },
  verticalImage: {
    width: '100%',
    height: '100%',
  },
  verticalBody: {
    padding: spacing.md,
  },
  // Horizontal (List view for search/category)
  horizontalCard: {
    flexDirection: 'row',
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  horizontalImageContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#F8F9F5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  horizontalBody: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  placeholderGraphic: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },
  name: {
    fontSize: 14,
    lineHeight: 18,
  },
  farmer: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  priceCol: {
    flex: 1,
  },
  priceUnitRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  cartButton: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.brand.forest,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  actionSlot: {
    marginLeft: spacing.xs,
  },
});
