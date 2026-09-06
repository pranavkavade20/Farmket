import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withSequence, 
  withTiming 
} from 'react-native-reanimated';
import { colors, radii, spacing } from '../../theme';
import { AppCard } from './AppCard';

interface AppSkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export function AppSkeleton({ 
  width = '100%', 
  height = 20, 
  borderRadius = radii.md,
  style 
}: AppSkeletonProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 750 }),
        withTiming(0.35, { duration: 750 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={[
        styles.skeleton, 
        { width, height, borderRadius },
        animatedStyle,
        style
      ]} 
    />
  );
}

export function ProductCardSkeleton({ layout = 'horizontal' }: { layout?: 'horizontal' | 'vertical' }) {
  if (layout === 'vertical') {
    return (
      <AppCard variant="elevated" padding={0} borderRadius={radii.xl} style={styles.verticalSkeletonCard}>
        <AppSkeleton width="100%" height={160} borderRadius={0} />
        <View style={{ padding: spacing.md }}>
          <AppSkeleton width="75%" height={16} borderRadius={radii.xs} style={{ marginBottom: 8 }} />
          <AppSkeleton width="45%" height={12} borderRadius={radii.xs} style={{ marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppSkeleton width="40%" height={20} borderRadius={radii.xs} />
            <AppSkeleton width={32} height={32} borderRadius={16} />
          </View>
        </View>
      </AppCard>
    );
  }

  return (
    <AppCard variant="elevated" padding="sm" borderRadius={radii.xl} style={styles.horizontalSkeletonCard}>
      <AppSkeleton width={88} height={88} borderRadius={radii.lg} />
      <View style={{ flex: 1, marginLeft: spacing.md, justifyContent: 'center' }}>
        <AppSkeleton width="65%" height={16} borderRadius={radii.xs} style={{ marginBottom: 8 }} />
        <AppSkeleton width="40%" height={12} borderRadius={radii.xs} style={{ marginBottom: 12 }} />
        <AppSkeleton width="50%" height={18} borderRadius={radii.xs} />
      </View>
    </AppCard>
  );
}

export function CropCardSkeleton() {
  return (
    <AppCard variant="elevated" padding="lg" borderRadius={radii.xl} style={{ marginBottom: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <AppSkeleton width={64} height={64} borderRadius={radii.lg} />
        <View style={{ flex: 1, marginLeft: spacing.md, justifyContent: 'center' }}>
          <AppSkeleton width="30%" height={14} borderRadius={radii.pill} style={{ marginBottom: 8 }} />
          <AppSkeleton width="70%" height={18} borderRadius={radii.xs} style={{ marginBottom: 6 }} />
          <AppSkeleton width="45%" height={12} borderRadius={radii.xs} />
        </View>
      </View>
      <View style={{ marginTop: spacing.md }}>
        <AppSkeleton width="100%" height={6} borderRadius={3} style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppSkeleton width="40%" height={14} borderRadius={radii.xs} />
          <AppSkeleton width="35%" height={14} borderRadius={radii.xs} />
        </View>
      </View>
    </AppCard>
  );
}

export function OrderCardSkeleton() {
  return (
    <AppCard variant="elevated" padding="lg" borderRadius={radii.xl} style={{ marginBottom: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <AppSkeleton width="35%" height={16} borderRadius={radii.xs} />
        <AppSkeleton width={80} height={22} borderRadius={radii.pill} />
      </View>
      <AppSkeleton width="60%" height={14} borderRadius={radii.xs} style={{ marginBottom: 8 }} />
      <AppSkeleton width="40%" height={18} borderRadius={radii.xs} />
    </AppCard>
  );
}

export function FeedPostSkeleton() {
  return (
    <AppCard variant="elevated" padding="lg" borderRadius={radii.xl} style={{ marginBottom: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <AppSkeleton width={44} height={44} borderRadius={22} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <AppSkeleton width="50%" height={16} borderRadius={radii.xs} style={{ marginBottom: 6 }} />
          <AppSkeleton width="30%" height={12} borderRadius={radii.xs} />
        </View>
      </View>
      <AppSkeleton width="100%" height={220} borderRadius={radii.lg} style={{ marginBottom: 12 }} />
      <AppSkeleton width="90%" height={14} borderRadius={radii.xs} style={{ marginBottom: 6 }} />
      <AppSkeleton width="60%" height={14} borderRadius={radii.xs} />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.border.subtle,
  },
  horizontalSkeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  verticalSkeletonCard: {
    marginBottom: spacing.md,
  }
});
