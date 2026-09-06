import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppInput, AppButton, AppCard, AppHeader } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { Mail, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react-native';
import { forgotPasswordApi } from '../../api/auth';
import { normalizeApiError } from '../../api/client';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      await forgotPasswordApi(email.trim());
      setSubmitted(true);
    } catch (error) {
      const msg = normalizeApiError(error, 'Unable to send password reset link. Please try again.');
      Alert.alert('Notice', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader title="Password Recovery" showBack />
      
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingBottom: insets.bottom + spacing.xxl }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AppText variant="h1" weight="bold" style={styles.title}>
            Forgot Password?
          </AppText>
          <AppText variant="body" color={colors.text.secondary} style={styles.subtitle}>
            Enter your email and we&apos;ll send you a recovery code to securely reset your password.
          </AppText>
        </View>

        <AppCard variant="elevated" padding="xl" borderRadius={radii.xxl} style={styles.card}>
          {submitted ? (
            <View style={styles.successContainer}>
              <View style={styles.successIconWrapper}>
                <CheckCircle2 size={36} color={colors.status.success} />
              </View>
              <AppText variant="h2" weight="bold" color={colors.text.primary} style={styles.successTitle}>
                Check your inbox
              </AppText>
              <AppText variant="bodySmall" color={colors.text.secondary} align="center" style={styles.successSubtitle}>
                We&apos;ve sent a verification code to <AppText variant="bodySmall" weight="bold">{email}</AppText>. Check your email to proceed.
              </AppText>
              <AppButton 
                title="Enter Reset Code" 
                variant="primary"
                shape="rounded"
                leftIcon={<KeyRound size={18} color="#FFFFFF" />}
                onPress={() => router.push('/(auth)/reset-password')} 
                fullWidth 
                style={{ marginBottom: spacing.md }}
              />
              <AppButton 
                title="Back to Sign In" 
                variant="outline"
                shape="rounded"
                onPress={() => router.replace('/(auth)/login')} 
                fullWidth 
              />
            </View>
          ) : (
            <>
              <AppInput
                label="EMAIL ADDRESS"
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={18} color={colors.text.muted} />}
              />

              <AppButton 
                title="Send Recovery Code" 
                onPress={handleReset} 
                loading={loading}
                fullWidth 
                shape="rounded"
                rightIcon={<ArrowRight size={18} color="#FFFFFF" strokeWidth={2.2} />}
                style={styles.submitButton}
              />

              <TouchableOpacity 
                onPress={() => router.push('/(auth)/reset-password')}
                activeOpacity={0.7}
                style={styles.hasCodeButton}
              >
                <AppText variant="caption" weight="semibold" color={colors.brand.primary}>
                  Already have a reset code? Tap here
                </AppText>
              </TouchableOpacity>
            </>
          )}
        </AppCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.xxs,
  },
  subtitle: {
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.background.surface,
  },
  submitButton: {
    marginTop: spacing.xs,
  },
  hasCodeButton: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.xs,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  successIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.status.successMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    marginBottom: spacing.xs,
  },
  successSubtitle: {
    marginBottom: spacing.xl,
    lineHeight: 20,
  }
});
