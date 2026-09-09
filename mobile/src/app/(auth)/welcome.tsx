import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';
import { colors, spacing, radii } from '../../theme';
import { FarmketLogo } from '../../components/illustrations/FarmketLogo';
import { WelcomeIllustration } from '../../components/illustrations/WelcomeIllustration';
import { ArrowRight } from 'lucide-react-native';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleGetStarted = () => {
    // Navigates directly into the Marketplace experience
    router.replace('/(tabs)');
  };

  const handleLoginPress = () => {
    router.push('/(auth)/login');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.md }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Farmket Brand Mark */}
        <View style={styles.header}>
          <FarmketLogo size={36} wordmarkSize="lg" />
        </View>

        {/* Headline & Value Proposition */}
        <View style={styles.textSection}>
          <AppText variant="display" weight="bold" color={colors.text.primary} style={styles.headline}>
            Fresh Food.{'\n'}Fair Trade.{'\n'}Direct from Farmers.
          </AppText>
          <AppText variant="body" color={colors.text.secondary} style={styles.subtitle}>
            Connecting farmers and buyers for a healthier tomorrow.
          </AppText>
        </View>

        {/* Large Flat Agricultural Illustration */}
        <View style={styles.illustrationContainer}>
          <WelcomeIllustration />
        </View>

        {/* Onboarding Carousel Dot Indicators */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionsSection}>
          <AppButton
            title="Get Started"
            variant="forest"
            size="lg"
            shape="pill"
            fullWidth
            rightIcon={<ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />}
            onPress={handleGetStarted}
            style={styles.primaryButton}
          />

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleLoginPress}
            activeOpacity={0.75}
          >
            <AppText variant="bodySmall" weight="semibold" color={colors.text.secondary}>
              I already have an account
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9F5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  textSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  headline: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: spacing.sm,
    lineHeight: 22,
    fontSize: 15,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: spacing.md,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#D1D5DB',
  },
  activeDot: {
    width: 22,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.brand.primary,
  },
  actionsSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  primaryButton: {
    backgroundColor: colors.brand.forest,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
});
