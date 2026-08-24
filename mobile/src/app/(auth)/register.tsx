import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppInput, AppButton, AppCard, AppHeader } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { User, Mail, Lock, Phone } from 'lucide-react-native';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [userType, setUserType] = useState<'buyer' | 'farmer'>('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      phoneNumber: Yup.string().required('Phone number is required'),
      password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      
      try {
        const username = values.email.split('@')[0];
        const payload = {
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          phone_number: values.phoneNumber,
          password: values.password,
          confirm_password: values.confirmPassword,
          user_type: userType,
          username,
          gender: '', // matching web implementation
        };

        const response = await apiClient.post('accounts/register/', payload);
        await login(response.data.token, response.data.refresh_token);
        router.replace('/(tabs)');
      } catch (err: any) {
        console.error(err);
        if (err.response?.data) {
          const firstKey = Object.keys(err.response.data)[0];
          const msg = Array.isArray(err.response.data[firstKey]) 
            ? err.response.data[firstKey][0] 
            : err.response.data[firstKey];
          setError(typeof msg === 'string' ? msg : 'Registration failed');
        } else {
          setError('Registration failed. Please try again.');
        }
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
      <AppHeader title="Create Account" showBack />
      
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <AppText variant="heading" weight="bold" style={styles.title}>
            Join Farmket Today
          </AppText>
          <AppText variant="body" color={colors.text.secondary} style={styles.subtitle}>
            Buy and sell directly with the agricultural community.
          </AppText>
        </View>

        <AppCard padding="xl" elevated>
          {error && (
            <View style={styles.errorContainer}>
              <AppText variant="small" color={colors.status.danger}>{error}</AppText>
            </View>
          )}

          <View style={styles.roleContainer}>
            <AppText variant="small" weight="bold" color={colors.text.secondary} style={styles.roleLabel}>I AM A...</AppText>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleButton, userType === 'buyer' && styles.roleButtonActive]}
                onPress={() => setUserType('buyer')}
              >
                <AppText weight="bold" color={userType === 'buyer' ? colors.brand.primary : colors.text.secondary}>Buyer</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, userType === 'farmer' && styles.roleButtonActive]}
                onPress={() => setUserType('farmer')}
              >
                <AppText weight="bold" color={userType === 'farmer' ? colors.brand.primary : colors.text.secondary}>Farmer</AppText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flexHalf}>
              <AppInput
                label="First Name"
                placeholder="John"
                value={formik.values.firstName}
                onChangeText={formik.handleChange('firstName')}
                onBlur={formik.handleBlur('firstName')}
                error={formik.touched.firstName ? formik.errors.firstName : undefined}
              />
            </View>
            <View style={styles.flexHalf}>
              <AppInput
                label="Last Name"
                placeholder="Doe"
                value={formik.values.lastName}
                onChangeText={formik.handleChange('lastName')}
                onBlur={formik.handleBlur('lastName')}
                error={formik.touched.lastName ? formik.errors.lastName : undefined}
              />
            </View>
          </View>

          <AppInput
            label="Email Address"
            placeholder="you@example.com"
            value={formik.values.email}
            onChangeText={formik.handleChange('email')}
            onBlur={formik.handleBlur('email')}
            error={formik.touched.email ? formik.errors.email : undefined}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={colors.text.muted} />}
          />

          <AppInput
            label="Phone Number"
            placeholder="+91 9876543210"
            value={formik.values.phoneNumber}
            onChangeText={formik.handleChange('phoneNumber')}
            onBlur={formik.handleBlur('phoneNumber')}
            error={formik.touched.phoneNumber ? formik.errors.phoneNumber : undefined}
            keyboardType="phone-pad"
            leftIcon={<Phone size={20} color={colors.text.muted} />}
          />
          
          <AppInput
            label="Password"
            placeholder="Create a secure password"
            value={formik.values.password}
            onChangeText={formik.handleChange('password')}
            onBlur={formik.handleBlur('password')}
            error={formik.touched.password ? formik.errors.password : undefined}
            secureTextEntry
            leftIcon={<Lock size={20} color={colors.text.muted} />}
          />

          <AppInput
            label="Confirm Password"
            placeholder="Re-enter password"
            value={formik.values.confirmPassword}
            onChangeText={formik.handleChange('confirmPassword')}
            onBlur={formik.handleBlur('confirmPassword')}
            error={formik.touched.confirmPassword ? formik.errors.confirmPassword : undefined}
            secureTextEntry
            leftIcon={<Lock size={20} color={colors.text.muted} />}
          />

          <AppButton 
            title="Sign Up" 
            onPress={() => formik.handleSubmit()} 
            loading={loading}
            fullWidth 
            style={styles.submitButton}
          />

          <View style={styles.footer}>
            <AppText variant="small" color={colors.text.secondary}>
              Already have an account?{' '}
            </AppText>
            <Link href="/(auth)/login" asChild>
              <AppText variant="small" weight="semibold" color={colors.brand.primary}>
                Sign in
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flexHalf: {
    flex: 1,
  },
  roleContainer: {
    marginBottom: spacing.md,
  },
  roleLabel: {
    marginBottom: spacing.xs,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roleButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.background.surface,
  },
  roleButtonActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.muted,
  },
  errorContainer: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.status.dangerMuted,
    borderRadius: radii.sm,
  },
  submitButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
