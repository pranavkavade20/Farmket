import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { AppButton } from './AppButton';
import { colors, spacing, radii } from '../../theme';
import { Sprout } from 'lucide-react-native';

interface AppEmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  onAction?: () => void;
  secondaryActionTitle?: string;
  onSecondaryAction?: () => void;
  style?: ViewStyle;
}

export function AppEmptyState({
  title,
  description,
  icon,
  actionTitle,
  onAction,
  secondaryActionTitle,
  onSecondaryAction,
  style
}: AppEmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        {icon || <Sprout size={44} color={colors.brand.primary} strokeWidth={1.8} />}
      </View>
      
      <AppText variant="h2" weight="bold" align="center" style={styles.title}>
        {title}
      </AppText>
      
      {description && (
        <AppText 
          variant="body" 
          color={colors.text.secondary} 
          align="center" 
          style={styles.description}
        >
          {description}
        </AppText>
      )}

      {actionTitle && onAction && (
        <AppButton 
          title={actionTitle} 
          onPress={onAction} 
          variant="primary"
          shape="pill"
          style={styles.actionButton}
        />
      )}

      {secondaryActionTitle && onSecondaryAction && (
        <AppButton 
          title={secondaryActionTitle} 
          onPress={onSecondaryAction} 
          variant="ghost"
          style={{ marginTop: spacing.sm }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.brand.tint,
    borderWidth: 1.5,
    borderColor: colors.brand.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.xs,
  },
  description: {
    marginBottom: spacing.xl,
    maxWidth: 280,
    lineHeight: 22,
  },
  actionButton: {
    minWidth: 180,
  }
});
