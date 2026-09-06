import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppInput, AppButton, AppCard } from '../../components/ui';
import { colors, spacing, radii, shadows } from '../../theme';
import { Mail, Lock, Sprout, ArrowRight } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { loginApi } from '../../api/auth';
import { normalizeApiError } from '../../api/client';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await loginApi({
          email: values.email.trim(),
          password: values.password,
        });
        
        await login(data.access, data.refresh);
        router.replace('/(tabs)');
      } catch (err: unknown) {
        setError(normalizeApiError(err, 'Invalid credentials or server unreachable.'));
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xxl }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Hero Emblem */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Sprout size={32} color={colors.brand.primary} strokeWidth={2.2} />
          </View>
          <AppText variant="display" weight="bold" color={colors.brand.forest} style={styles.brandTitle}>
            Farmket
          </AppText>
          <AppText variant="body" color={colors.text.secondary} align="center" style={styles.subtitle}>
            Direct from farm to table. Fresh, seasonal, and completely traceable.
          </AppText>
        </View>

        {/* Login Card */}
        <AppCard variant="elevated" padding="xl" borderRadius={radii.xxl} style={styles.card}>
          <AppText variant="h2" weight="bold" style={styles.cardHeading}>
            Sign In
          </AppText>
          <AppText variant="caption" color={colors.text.muted} style={styles.cardSubheading}>
            Enter your email and password to access your account
          </AppText>

          {error && (
            <View style={styles.errorContainer}>
              <AppText variant="caption" weight="medium" color={colors.status.danger}>
                {error}
              </AppText>
            </View>
          )}

          <AppInput
            label="EMAIL ADDRESS"
            placeholder="name@example.com"
            value={formik.values.email}
            onChangeText={formik.handleChange('email')}
            onBlur={formik.handleBlur('email')}
            error={formik.touched.email ? formik.errors.email : undefined}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={18} color={colors.text.muted} />}
          />
          
          <AppInput
            label="PASSWORD"
            placeholder="Enter your password"
            value={formik.values.password}
            onChangeText={formik.handleChange('password')}
            onBlur={formik.handleBlur('password')}
            error={formik.touched.password ? formik.errors.password : undefined}
            secureTextEntry
            leftIcon={<Lock size={18} color={colors.text.muted} />}
          />

          <View style={styles.forgotPassword}>
            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <AppText variant="caption" weight="semibold" color={colors.brand.primary}>
                  Forgot Password?
                </AppText>
              </TouchableOpacity>
            </Link>
          </View>

          <AppButton 
            title="Sign In" 
            onPress={() => formik.handleSubmit()} 
            loading={loading}
            fullWidth 
            shape="rounded"
            rightIcon={<ArrowRight size={18} color="#FFFFFF" strokeWidth={2.2} />}
            style={styles.submitButton}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <AppText variant="label" color={colors.text.muted} style={styles.dividerText}>OR</AppText>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.footer}>
            <AppText variant="bodySmall" color={colors.text.secondary}>
              Don&apos;t have an account?{' '}
            </AppText>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <AppText variant="bodySmall" weight="bold" color={colors.brand.primary}>
                  Create an account
                </AppText>
              </TouchableOpacity>
            </Link>
          </View>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brand.tint,
    borderWidth: 1.5,
    borderColor: colors.brand.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  brandTitle: {
    marginBottom: spacing.xxs,
    letterSpacing: -0.5,
  },
  subtitle: {
    maxWidth: 290,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.background.surface,
  },
  cardHeading: {
    marginBottom: spacing.xxs,
  },
  cardSubheading: {
    marginBottom: spacing.lg,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginTop: -spacing.xs,
    marginBottom: spacing.lg,
  },
  submitButton: {
    marginBottom: spacing.lg,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.subtle,
  },
  dividerText: {
    marginHorizontal: spacing.md,
  },
  errorContainer: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: radii.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
