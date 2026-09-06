import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { colors, spacing, radii } from '../../theme';
import { Leaf } from 'lucide-react-native';

export interface AppBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'neutral' | 'cropStage' | 'orderStatus' | 'marketState' | 'organic';
  stage?: 'PLANTED' | 'GROWING' | 'NEAR_HARVEST' | 'HARVESTED' | string;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string;
  marketState?: 'AVAILABLE_NOW' | 'READY_FOR_PREBOOKING' | 'READY_TO_HARVEST' | 'LOW_STOCK' | 'SOLD_OUT' | string;
  size?: 'xs' | 'sm' | 'md';
  icon?: React.ReactNode;
  showDot?: boolean;
  style?: ViewStyle;
}

export const AppBadge: React.FC<AppBadgeProps> = ({
  label,
  variant = 'neutral',
  stage,
  status,
  marketState,
  size = 'md',
  icon,
  showDot = false,
  style,
}) => {
  let badgeColor = colors.text.secondary;
  let badgeBg = colors.background.elevated;
  let borderColor = colors.border.subtle;
  let displayLabel = label;
  let effectiveIcon = icon;

  if (variant === 'organic') {
    badgeColor = colors.brand.primary;
    badgeBg = colors.brand.tint;
    borderColor = colors.brand.muted;
    displayLabel = label || '100% Organic';
    effectiveIcon = effectiveIcon || <Leaf size={10} color={colors.brand.primary} strokeWidth={2.5} />;
  } else if (stage || variant === 'cropStage') {
    const s = (stage || label).toUpperCase();
    if (s === 'PLANTED') {
      badgeColor = colors.cropStage.planted.color;
      badgeBg = colors.cropStage.planted.bg;
      borderColor = colors.cropStage.planted.border;
      displayLabel = colors.cropStage.planted.label;
    } else if (s === 'GROWING') {
      badgeColor = colors.cropStage.growing.color;
      badgeBg = colors.cropStage.growing.bg;
      borderColor = colors.cropStage.growing.border;
      displayLabel = colors.cropStage.growing.label;
    } else if (s === 'NEAR_HARVEST') {
      badgeColor = colors.cropStage.nearHarvest.color;
      badgeBg = colors.cropStage.nearHarvest.bg;
      borderColor = colors.cropStage.nearHarvest.border;
      displayLabel = colors.cropStage.nearHarvest.label;
    } else if (s === 'HARVESTED') {
      badgeColor = colors.cropStage.harvested.color;
      badgeBg = colors.cropStage.harvested.bg;
      borderColor = colors.cropStage.harvested.border;
      displayLabel = colors.cropStage.harvested.label;
    }
  } else if (status || variant === 'orderStatus') {
    const st = (status || label).toLowerCase();
    if (st === 'pending') {
      badgeColor = colors.orderStatus.pending.color;
      badgeBg = colors.orderStatus.pending.bg;
      borderColor = colors.orderStatus.pending.border;
      displayLabel = colors.orderStatus.pending.label;
    } else if (st === 'processing') {
      badgeColor = colors.orderStatus.processing.color;
      badgeBg = colors.orderStatus.processing.bg;
      borderColor = colors.orderStatus.processing.border;
      displayLabel = colors.orderStatus.processing.label;
    } else if (st === 'shipped') {
      badgeColor = colors.orderStatus.shipped.color;
      badgeBg = colors.orderStatus.shipped.bg;
      borderColor = colors.orderStatus.shipped.border;
      displayLabel = colors.orderStatus.shipped.label;
    } else if (st === 'delivered') {
      badgeColor = colors.orderStatus.delivered.color;
      badgeBg = colors.orderStatus.delivered.bg;
      borderColor = colors.orderStatus.delivered.border;
      displayLabel = colors.orderStatus.delivered.label;
    } else if (st === 'cancelled') {
      badgeColor = colors.orderStatus.cancelled.color;
      badgeBg = colors.orderStatus.cancelled.bg;
      borderColor = colors.orderStatus.cancelled.border;
      displayLabel = colors.orderStatus.cancelled.label;
    }
  } else if (marketState || variant === 'marketState') {
    const ms = (marketState || label).toUpperCase();
    if (ms === 'AVAILABLE_NOW') {
      badgeColor = colors.marketState.availableNow.color;
      badgeBg = colors.marketState.availableNow.bg;
      borderColor = colors.marketState.availableNow.border;
      displayLabel = colors.marketState.availableNow.label;
    } else if (ms === 'READY_FOR_PREBOOKING') {
      badgeColor = colors.marketState.readyForPrebooking.color;
      badgeBg = colors.marketState.readyForPrebooking.bg;
      borderColor = colors.marketState.readyForPrebooking.border;
      displayLabel = colors.marketState.readyForPrebooking.label;
    } else if (ms === 'READY_TO_HARVEST') {
      badgeColor = colors.marketState.readyToHarvest.color;
      badgeBg = colors.marketState.readyToHarvest.bg;
      borderColor = colors.marketState.readyToHarvest.border;
      displayLabel = colors.marketState.readyToHarvest.label;
    } else if (ms === 'LOW_STOCK') {
      badgeColor = colors.marketState.lowStock.color;
      badgeBg = colors.marketState.lowStock.bg;
      borderColor = colors.marketState.lowStock.border;
      displayLabel = colors.marketState.lowStock.label;
    } else if (ms === 'SOLD_OUT') {
      badgeColor = colors.marketState.soldOut.color;
      badgeBg = colors.marketState.soldOut.bg;
      borderColor = colors.marketState.soldOut.border;
      displayLabel = colors.marketState.soldOut.label;
    }
  } else {
    switch (variant) {
      case 'success':
        badgeColor = colors.status.success;
        badgeBg = colors.status.successMuted;
        borderColor = '#BBF7D0';
        break;
      case 'warning':
        badgeColor = colors.status.warning;
        badgeBg = colors.status.warningMuted;
        borderColor = '#FDE68A';
        break;
      case 'danger':
        badgeColor = colors.status.danger;
        badgeBg = colors.status.dangerMuted;
        borderColor = '#FECACA';
        break;
      case 'info':
        badgeColor = colors.status.info;
        badgeBg = colors.status.infoMuted;
        borderColor = '#BFDBFE';
        break;
      case 'brand':
        badgeColor = colors.brand.primary;
        badgeBg = colors.brand.tint;
        borderColor = colors.brand.muted;
        break;
      case 'neutral':
      default:
        badgeColor = colors.text.secondary;
        badgeBg = colors.background.elevated;
        borderColor = colors.border.subtle;
        break;
    }
  }

  const getPadding = () => {
    if (size === 'xs') return { paddingHorizontal: 6, paddingVertical: 2 };
    if (size === 'sm') return { paddingHorizontal: 8, paddingVertical: 3 };
    return { paddingHorizontal: 10, paddingVertical: 4 };
  };

  const getFontSize = () => {
    if (size === 'xs') return 10;
    if (size === 'sm') return 11;
    return 12;
  };

  return (
    <View
      style={[
        styles.badge,
        getPadding(),
        {
          backgroundColor: badgeBg,
          borderColor,
          borderWidth: 1,
        },
        style,
      ]}
    >
      {showDot && (
        <View style={[styles.dot, { backgroundColor: badgeColor }]} />
      )}
      {effectiveIcon && <View style={styles.iconContainer}>{effectiveIcon}</View>}
      <AppText
        weight="bold"
        color={badgeColor}
        style={[styles.text, { fontSize: getFontSize() }]}
      >
        {displayLabel}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  iconContainer: {
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
