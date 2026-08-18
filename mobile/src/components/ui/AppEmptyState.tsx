import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { AppButton } from './AppButton';
import { colors, spacing } from '../../theme';
import { Leaf } from 'lucide-react-native'; // Default icon

interface AppEmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function AppEmptyState({
  title,
  description,
  icon,
  actionTitle,
  onAction,
  style
}: AppEmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        {icon || <Leaf size={48} color={colors.brand.muted} strokeWidth={1.5} />}
      </View>
      
      <AppText variant="heading" weight="bold" align="center" style={styles.title}>
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
          variant="outline"
          style={styles.actionButton}
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
    padding: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.background.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  title: {
    marginBottom: spacing.xs,
  },
  description: {
    marginBottom: spacing.xl,
    maxWidth: '80%',
  },
  actionButton: {
    minWidth: 160,
  }
});
