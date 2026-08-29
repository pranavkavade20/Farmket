import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { AppText } from './AppText';
import { colors, spacing, radii } from '../../theme';

export interface AppBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'neutral' | 'cropStage' | 'orderStatus' | 'marketState';
  stage?: 'PLANTED' | 'GROWING' | 'NEAR_HARVEST' | 'HARVESTED' | string;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string;
  marketState?: 'AVAILABLE_NOW' | 'READY_FOR_PREBOOKING' | 'READY_TO_HARVEST' | 'LOW_STOCK' | 'SOLD_OUT' | string;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
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
  style,
}) => {
  let badgeColor = colors.text.secondary;
  let badgeBg = colors.border.subtle;
  let displayLabel = label;

  if (stage || variant === 'cropStage') {
    const s = (stage || label).toUpperCase();
    if (s === 'PLANTED') {
      badgeColor = colors.cropStage.planted.color;
      badgeBg = colors.cropStage.planted.bg;
      displayLabel = colors.cropStage.planted.label;
    } else if (s === 'GROWING') {
      badgeColor = colors.cropStage.growing.color;
      badgeBg = colors.cropStage.growing.bg;
      displayLabel = colors.cropStage.growing.label;
    } else if (s === 'NEAR_HARVEST') {
      badgeColor = colors.cropStage.nearHarvest.color;
      badgeBg = colors.cropStage.nearHarvest.bg;
      displayLabel = colors.cropStage.nearHarvest.label;
    } else if (s === 'HARVESTED') {
      badgeColor = colors.cropStage.harvested.color;
      badgeBg = colors.cropStage.harvested.bg;
      displayLabel = colors.cropStage.harvested.label;
    }
  } else if (status || variant === 'orderStatus') {
    const st = (status || label).toLowerCase();
    if (st === 'pending') {
      badgeColor = colors.orderStatus.pending.color;
      badgeBg = colors.orderStatus.pending.bg;
      displayLabel = colors.orderStatus.pending.label;
    } else if (st === 'processing') {
      badgeColor = colors.orderStatus.processing.color;
      badgeBg = colors.orderStatus.processing.bg;
      displayLabel = colors.orderStatus.processing.label;
    } else if (st === 'shipped') {
      badgeColor = colors.orderStatus.shipped.color;
      badgeBg = colors.orderStatus.shipped.bg;
      displayLabel = colors.orderStatus.shipped.label;
    } else if (st === 'delivered') {
      badgeColor = colors.orderStatus.delivered.color;
      badgeBg = colors.orderStatus.delivered.bg;
      displayLabel = colors.orderStatus.delivered.label;
    } else if (st === 'cancelled') {
      badgeColor = colors.orderStatus.cancelled.color;
      badgeBg = colors.orderStatus.cancelled.bg;
      displayLabel = colors.orderStatus.cancelled.label;
    }
  } else if (marketState || variant === 'marketState') {
    const ms = (marketState || label).toUpperCase();
    if (ms === 'AVAILABLE_NOW') {
      badgeColor = colors.marketState.availableNow.color;
      badgeBg = colors.marketState.availableNow.bg;
      displayLabel = colors.marketState.availableNow.label;
    } else if (ms === 'READY_FOR_PREBOOKING') {
      badgeColor = colors.marketState.readyForPrebooking.color;
      badgeBg = colors.marketState.readyForPrebooking.bg;
      displayLabel = colors.marketState.readyForPrebooking.label;
    } else if (ms === 'READY_TO_HARVEST') {
      badgeColor = colors.marketState.readyToHarvest.color;
      badgeBg = colors.marketState.readyToHarvest.bg;
      displayLabel = colors.marketState.readyToHarvest.label;
    } else if (ms === 'LOW_STOCK') {
      badgeColor = colors.marketState.lowStock.color;
      badgeBg = colors.marketState.lowStock.bg;
      displayLabel = colors.marketState.lowStock.label;
    } else if (ms === 'SOLD_OUT') {
      badgeColor = colors.marketState.soldOut.color;
      badgeBg = colors.marketState.soldOut.bg;
      displayLabel = colors.marketState.soldOut.label;
    }
  } else {
    switch (variant) {
      case 'success':
        badgeColor = colors.status.success;
        badgeBg = colors.status.successMuted;
        break;
      case 'warning':
        badgeColor = colors.status.warning;
        badgeBg = colors.status.warningMuted;
        break;
      case 'danger':
        badgeColor = colors.status.danger;
        badgeBg = colors.status.dangerMuted;
        break;
      case 'info':
        badgeColor = colors.status.info;
        badgeBg = colors.status.infoMuted;
        break;
      case 'brand':
        badgeColor = colors.brand.primary;
        badgeBg = colors.brand.muted;
        break;
    }
  }

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeBg,
          paddingHorizontal: isSmall ? spacing.xs : spacing.sm,
          paddingVertical: isSmall ? 2 : 4,
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <AppText
        variant="small"
        weight="bold"
        color={badgeColor}
        style={[styles.text, isSmall && styles.smallText]}
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
    borderRadius: radii.full,
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  smallText: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
});
