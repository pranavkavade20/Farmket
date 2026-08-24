import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from './AppText';
import { AppCard } from './AppCard';
import { colors, spacing, radii } from '../../theme';
import type { Product } from '../../api/products';

interface AppProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
  action?: React.ReactNode;
}

export const AppProductCard: React.FC<AppProductCardProps> = ({ product, onPress, action }) => {
  const primaryImage = product.images?.find((img) => img.is_primary)?.image || product.images?.[0]?.image;

  const content = (
    <AppCard elevated padding="md" style={styles.card}>
      {primaryImage ? (
        <Image 
          source={{ uri: primaryImage }} 
          style={styles.image} 
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={styles.placeholderImage}>
          <AppText variant="small" color={colors.text.muted}>No image</AppText>
        </View>
      )}
      <View style={styles.info}>
        <AppText weight="bold" numberOfLines={1}>{product.name}</AppText>
        <AppText variant="small" color={colors.text.secondary} numberOfLines={1}>
          By {product.farmer?.farm_name || `${product.farmer?.first_name} ${product.farmer?.last_name}`}
        </AppText>
        <View style={styles.priceRow}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline' }}>
            <AppText weight="bold" color={colors.brand.primary}>${product.price}</AppText>
            <AppText variant="small" color={colors.text.muted}> / {product.unit}</AppText>
          </View>
          {action && <View style={styles.actionContainer}>{action}</View>}
        </View>
      </View>
    </AppCard>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(product)} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    backgroundColor: colors.border.subtle,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    backgroundColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  actionContainer: {
    marginLeft: spacing.sm,
  }
});
