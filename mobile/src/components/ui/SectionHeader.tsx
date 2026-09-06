import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { colors, spacing } from '../../theme';
import { ChevronRight } from 'lucide-react-native';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function SectionHeader({
  title,
  subtitle,
  actionTitle,
  onAction,
  style
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleGroup}>
        <AppText variant="h2" weight="bold" color={colors.text.primary}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.text.muted} style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {actionTitle && onAction && (
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onAction}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <AppText variant="caption" weight="semibold" color={colors.brand.primary}>
            {actionTitle}
          </AppText>
          <ChevronRight size={14} color={colors.brand.primary} strokeWidth={2.2} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  titleGroup: {
    flex: 1,
    marginRight: spacing.md,
  },
  subtitle: {
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  }
});
