import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppInput, AppButton, AppCard } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { Mail, Lock } from 'lucide-react-native';
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
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.xxxl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <AppText variant="display" weight="bold" color={colors.brand.primary} style={styles.brandText}>
            Farmket
          </AppText>
          <AppText variant="body" color={colors.text.secondary} style={styles.subtitle}>
            Welcome back! Please enter your details.
          </AppText>
        </View>

        <AppCard padding="xl" elevated>
          {error && (
            <View style={styles.errorContainer}>
              <AppText variant="small" color={colors.status.danger}>{error}</AppText>
            </View>
          )}

          <AppInput
            label="Email Address"
            placeholder="Enter your email"
            value={formik.values.email}
            onChangeText={formik.handleChange('email')}
            onBlur={formik.handleBlur('email')}
            error={formik.touched.email ? formik.errors.email : undefined}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={colors.text.muted} />}
          />
          
          <AppInput
            label="Password"
            placeholder="Enter your password"
            value={formik.values.password}
            onChangeText={formik.handleChange('password')}
            onBlur={formik.handleBlur('password')}
            error={formik.touched.password ? formik.errors.password : undefined}
            secureTextEntry
            leftIcon={<Lock size={20} color={colors.text.muted} />}
          />

          <View style={styles.forgotPassword}>
            <Link href="/(auth)/forgot-password" asChild>
              <AppText variant="small" weight="medium" color={colors.brand.primary}>
                Forgot Password?
              </AppText>
            </Link>
          </View>

          <AppButton 
            title="Sign In" 
            onPress={() => formik.handleSubmit()} 
            loading={loading}
            fullWidth 
            style={styles.submitButton}
          />

          <View style={styles.footer}>
            <AppText variant="small" color={colors.text.secondary}>
              Don't have an account?{' '}
            </AppText>
            <Link href="/(auth)/register" asChild>
              <AppText variant="small" weight="semibold" color={colors.brand.primary}>
                Sign up
              </AppText>
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  brandText: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: spacing.xl,
  },
  submitButton: {
    marginBottom: spacing.xl,
  },
  errorContainer: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.status.dangerMuted,
    borderRadius: radii.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
