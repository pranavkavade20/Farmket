import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from './AppText';
import { AppCard } from './AppCard';
import { AppBadge } from './AppBadge';
import { colors, spacing, radii, shadows } from '../../theme';
import { formatDate } from '../../utils/format';
import type { CropGrowth } from '../../api/crops';
import { Sprout, Calendar, Package, Clock, CheckCircle2 } from 'lucide-react-native';

const STAGES = [
  { key: 'PLANTED', label: 'Planted', index: 0 },
  { key: 'GROWING', label: 'Growing', index: 1 },
  { key: 'NEAR_HARVEST', label: 'Near Harvest', index: 2 },
  { key: 'HARVESTED', label: 'Harvested', index: 3 },
] as const;

interface AppCropCardProps {
  crop: CropGrowth;
  onPress?: (crop: CropGrowth) => void;
  action?: React.ReactNode;
  showTimeline?: boolean;
  style?: ViewStyle;
}

export const AppCropCard: React.FC<AppCropCardProps> = ({ 
  crop, 
  onPress, 
  action, 
  showTimeline = true,
  style 
}) => {
  const primaryImage = crop.product_details?.images?.find(i => i.is_primary)?.image || crop.product_details?.images?.[0]?.image;

  const currentStageIndex = STAGES.findIndex(s => s.key === crop.stage?.toUpperCase());
  const effectiveIndex = currentStageIndex >= 0 ? currentStageIndex : 0;

  // Expected vs reserved calculation
  const expectedQty = Number(crop.expected_quantity || crop.available_quantity || 0);
  const availableQty = Number(crop.available_quantity || 0);
  const reservedQty = Math.max(0, expectedQty - availableQty);
  const reservationPercent = expectedQty > 0 ? Math.min(100, Math.round((reservedQty / expectedQty) * 100)) : 0;

  const content = (
    <AppCard 
      variant="elevated" 
      padding="lg" 
      borderRadius={radii.xl} 
      style={[styles.card, style]}
    >
      {/* Top Produce & Farmer Info */}
      <View style={styles.topRow}>
        <View style={styles.imageContainer}>
          {primaryImage ? (
            <Image source={{ uri: primaryImage }} style={styles.image} contentFit="cover" transition={200} />
          ) : (
            <View style={styles.placeholderImage}>
              <Sprout size={26} color={colors.brand.primary} />
            </View>
          )}
        </View>

        <View style={styles.mainInfo}>
          <View style={styles.badgeRow}>
            <AppBadge stage={crop.stage} size="xs" label="" />
            {crop.organic && (
              <AppBadge label="Organic" variant="organic" size="xs" style={{ marginLeft: 6 }} />
            )}
          </View>

          <AppText variant="h3" weight="bold" numberOfLines={1} style={styles.cropTitle}>
            {crop.crop_name || crop.product_details?.name || 'Farm Crop'}
          </AppText>

          <AppText variant="caption" color={colors.text.secondary} numberOfLines={1}>
            Cultivated by {crop.farmer_name || 'Partner Farm'}
          </AppText>
        </View>
      </View>

      {/* 4-Stage Visual Lifecycle Timeline */}
      {showTimeline && (
        <View style={styles.timelineContainer}>
          <View style={styles.timelineNodesRow}>
            {STAGES.map((s, idx) => {
              const isPast = idx < effectiveIndex;
              const isCurrent = idx === effectiveIndex;
              const isFuture = idx > effectiveIndex;

              const stageColor = isCurrent
                ? colors.cropStage[s.key.toLowerCase() as keyof typeof colors.cropStage]?.color || colors.brand.primary
                : isPast
                ? colors.brand.primary
                : colors.border.strong;

              return (
                <React.Fragment key={s.key}>
                  {idx > 0 && (
                    <View 
                      style={[
                        styles.connectorBar, 
                        { backgroundColor: idx <= effectiveIndex ? colors.brand.primary : colors.border.subtle }
                      ]} 
                    />
                  )}
                  <View style={styles.stageNodeWrapper}>
                    <View 
                      style={[
                        styles.stageNode,
                        { borderColor: stageColor },
                        (isPast || isCurrent) && { backgroundColor: stageColor },
                        isCurrent && styles.stageNodeCurrent,
                      ]}
                    >
                      {isPast ? (
                        <CheckCircle2 size={10} color="#FFFFFF" />
                      ) : (
                        <View style={[styles.innerDot, { backgroundColor: isCurrent ? '#FFFFFF' : 'transparent' }]} />
                      )}
                    </View>
                    <AppText 
                      variant="label" 
                      color={isCurrent ? colors.text.primary : colors.text.muted}
                      weight={isCurrent ? 'bold' : 'normal'}
                      style={styles.stageLabel}
                    >
                      {s.label}
                    </AppText>
                  </View>
                </React.Fragment>
              );
            })}
          </View>
        </View>
      )}

      {/* Growth Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <AppText variant="caption" weight="medium" color={colors.text.secondary}>
            Growth Cycle
          </AppText>
          <AppText variant="caption" weight="bold" color={colors.brand.primary}>
            {crop.progress || 0}% Complete
          </AppText>
        </View>
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${Math.min(100, Math.max(6, crop.progress || 0))}%` }
            ]} 
          />
        </View>
      </View>

      {/* Harvest Date & Quota Grid */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Calendar size={14} color={colors.brand.primary} />
          <View style={{ marginLeft: 6 }}>
            <AppText variant="label" color={colors.text.muted}>TARGET HARVEST</AppText>
            <AppText variant="caption" weight="semibold" color={colors.text.primary}>
              {formatDate(crop.expected_harvest_date)}
            </AppText>
          </View>
        </View>

        <View style={styles.metaItem}>
          <Package size={14} color={colors.accent.amber} />
          <View style={{ marginLeft: 6 }}>
            <AppText variant="label" color={colors.text.muted}>AVAILABLE YIELD</AppText>
            <AppText variant="caption" weight="semibold" color={colors.text.primary}>
              {availableQty} kg
            </AppText>
          </View>
        </View>
      </View>

      {/* Optional action slot */}
      {action && (
        <View style={styles.actionContainer}>
          {action}
        </View>
      )}
    </AppCard>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(crop)} activeOpacity={0.88}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.background.surface,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 64,
    height: 64,
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
    backgroundColor: colors.brand.tint,
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
  timelineContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  timelineNodesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectorBar: {
    flex: 1,
    height: 2,
    marginHorizontal: 2,
    marginBottom: 16, // align with node center
  },
  stageNodeWrapper: {
    alignItems: 'center',
    width: 60,
  },
  stageNode: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.surface,
  },
  stageNodeCurrent: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    ...shadows.xs,
  },
  innerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  stageLabel: {
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
  },
  progressSection: {
    marginTop: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
    paddingTop: spacing.md,
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
