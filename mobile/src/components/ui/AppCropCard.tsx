import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from './AppText';
import { AppCard } from './AppCard';
import { AppBadge } from './AppBadge';
import { colors, spacing, radii } from '../../theme';
import { formatDate } from '../../utils/format';
import type { CropGrowth } from '../../api/crops';
import { Sprout, Calendar, Package } from 'lucide-react-native';

interface AppCropCardProps {
  crop: CropGrowth;
  onPress?: (crop: CropGrowth) => void;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export const AppCropCard: React.FC<AppCropCardProps> = ({ crop, onPress, action, style }) => {
  const primaryImage = crop.product_details?.images?.find(i => i.is_primary)?.image || crop.product_details?.images?.[0]?.image;

  const content = (
    <AppCard elevated padding="md" style={[styles.card, style]}>
      <View style={styles.topRow}>
        <View style={styles.imageContainer}>
          {primaryImage ? (
            <Image source={{ uri: primaryImage }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={styles.placeholderImage}>
              <Sprout size={28} color={colors.brand.primary} />
            </View>
          )}
        </View>

        <View style={styles.mainInfo}>
          <View style={styles.badgeRow}>
            <AppBadge stage={crop.stage} size="sm" label="" />
            {crop.organic && (
              <AppBadge label="Organic" variant="success" size="sm" style={{ marginLeft: 4 }} />
            )}
          </View>

          <AppText weight="bold" numberOfLines={1} style={styles.cropTitle}>
            {crop.crop_name || crop.product_details?.name || 'Crop'}
          </AppText>

          <AppText variant="small" color={colors.text.secondary} numberOfLines={1}>
            By {crop.farmer_name || 'Farmer'}
          </AppText>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <AppText variant="small" weight="semibold" color={colors.text.secondary}>
            Growth Progress
          </AppText>
          <AppText variant="small" weight="bold" color={colors.brand.primary}>
            {crop.progress || 0}%
          </AppText>
        </View>
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${Math.min(100, Math.max(5, crop.progress || 0))}%` }
            ]} 
          />
        </View>
      </View>

      {/* Meta Info Row */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Calendar size={14} color={colors.text.muted} />
          <AppText variant="small" color={colors.text.muted} style={{ marginLeft: 4 }}>
            Harvest: {formatDate(crop.expected_harvest_date)}
          </AppText>
        </View>

        <View style={styles.metaItem}>
          <Package size={14} color={colors.text.muted} />
          <AppText variant="small" color={colors.text.muted} style={{ marginLeft: 4 }}>
            Available: {crop.available_quantity || 0} kg
          </AppText>
        </View>
      </View>

      {action && (
        <View style={styles.actionContainer}>
          {action}
        </View>
      )}
    </AppCard>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(crop)} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.xl,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 68,
    height: 68,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.elevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.muted,
  },
  mainInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cropTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  progressSection: {
    marginTop: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.background.elevated,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 3,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionContainer: {
    marginTop: spacing.md,
  },
});
