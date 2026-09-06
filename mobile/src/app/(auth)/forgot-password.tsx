import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppInput, AppButton, AppCard, AppHeader } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { Mail, KeyRound } from 'lucide-react-native';
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
      Alert.alert('Required', 'Please enter your email address.');
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
      <AppHeader title="Reset Password" showBack />
      
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <AppText variant="heading" weight="bold" style={styles.title}>
            Forgot Password?
          </AppText>
          <AppText variant="body" color={colors.text.secondary} style={styles.subtitle}>
            Enter your email address and we'll send you a secure link to reset your password.
          </AppText>
        </View>

        <AppCard padding="xl" elevated>
          {submitted ? (
            <View style={styles.successContainer}>
              <AppText variant="subheading" weight="semibold" color={colors.status.success} style={styles.successTitle}>
                Check your email
              </AppText>
              <AppText variant="body" color={colors.text.secondary} align="center" style={styles.successSubtitle}>
                We've sent a password reset link to {email || 'your email'}. Check your inbox and spam folder.
              </AppText>
              <AppButton 
                title="Enter Reset Code" 
                variant="primary"
                leftIcon={<KeyRound size={18} color="#FFFFFF" />}
                onPress={() => router.push('/(auth)/reset-password')} 
                fullWidth 
                style={{ marginBottom: spacing.md }}
              />
              <AppButton 
                title="Back to Login" 
                variant="outline"
                onPress={() => router.back()} 
                fullWidth 
              />
            </View>
          ) : (
            <>
              <AppInput
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={20} color={colors.text.muted} />}
              />

              <AppButton 
                title="Send Reset Link" 
                onPress={handleReset} 
                loading={loading}
                fullWidth 
                style={styles.submitButton}
              />

              <AppButton 
                title="Already have a reset code?" 
                variant="ghost"
                onPress={() => router.push('/(auth)/reset-password')} 
                fullWidth 
                style={{ marginTop: spacing.md }}
              />
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  successTitle: {
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    marginBottom: spacing.xl,
  }
});
