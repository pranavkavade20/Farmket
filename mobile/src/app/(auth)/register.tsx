import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppInput, AppButton, AppCard, AppHeader } from '../../components/ui';
import { colors, spacing, radii, shadows } from '../../theme';
import { Mail, Lock, Phone, User, ShoppingBag, Sprout, Check } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { registerApi } from '../../api/auth';
import { normalizeApiError } from '../../api/client';

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
          first_name: values.firstName.trim(),
          last_name: values.lastName.trim(),
          email: values.email.trim().toLowerCase(),
          phone_number: values.phoneNumber.trim(),
          password: values.password,
          confirm_password: values.confirmPassword,
          user_type: userType,
          username,
          gender: '',
        };

        const data = await registerApi(payload);
        await login(data.token, data.refresh_token);
        router.replace('/(tabs)');
      } catch (err: unknown) {
        setError(normalizeApiError(err, 'Registration failed. Please check your details.'));
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
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingBottom: insets.bottom + spacing.xxl }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AppText variant="h1" weight="bold" color={colors.text.primary} style={styles.title}>
            Join Farmket
          </AppText>
          <AppText variant="body" color={colors.text.secondary} style={styles.subtitle}>
            Connect directly with verified farmers and community buyers.
          </AppText>
        </View>

        <AppCard variant="elevated" padding="xl" borderRadius={radii.xxl} style={styles.card}>
          {error && (
            <View style={styles.errorContainer}>
              <AppText variant="caption" weight="medium" color={colors.status.danger}>
                {error}
              </AppText>
            </View>
          )}

          {/* Role Selection Tabs */}
          <View style={styles.roleSection}>
            <AppText variant="label" weight="bold" color={colors.text.secondary} style={styles.roleLabel}>
              CHOOSE YOUR ACCOUNT TYPE
            </AppText>
            <View style={styles.roleRow}>
              {/* Buyer Option */}
              <TouchableOpacity
                style={[
                  styles.roleCard, 
                  userType === 'buyer' && styles.roleCardActive
                ]}
                onPress={() => setUserType('buyer')}
                activeOpacity={0.8}
              >
                <View style={[styles.roleIconWrapper, userType === 'buyer' && styles.roleIconActive]}>
                  <ShoppingBag size={20} color={userType === 'buyer' ? colors.brand.primary : colors.text.muted} />
                </View>
                <AppText variant="bodySmall" weight="bold" color={userType === 'buyer' ? colors.brand.primary : colors.text.primary}>
                  Produce Buyer
                </AppText>
                <AppText variant="label" color={colors.text.muted} align="center" style={{ marginTop: 2 }}>
                  Pre-book & shop fresh
                </AppText>
                {userType === 'buyer' && (
                  <View style={styles.roleCheckBadge}>
                    <Check size={10} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Farmer Option */}
              <TouchableOpacity
                style={[
                  styles.roleCard, 
                  userType === 'farmer' && styles.roleCardActive
                ]}
                onPress={() => setUserType('farmer')}
                activeOpacity={0.8}
              >
                <View style={[styles.roleIconWrapper, userType === 'farmer' && styles.roleIconActive]}>
                  <Sprout size={20} color={userType === 'farmer' ? colors.brand.primary : colors.text.muted} />
                </View>
                <AppText variant="bodySmall" weight="bold" color={userType === 'farmer' ? colors.brand.primary : colors.text.primary}>
                  Grower / Farmer
                </AppText>
                <AppText variant="label" color={colors.text.muted} align="center" style={{ marginTop: 2 }}>
                  List crops & sell direct
                </AppText>
                {userType === 'farmer' && (
                  <View style={styles.roleCheckBadge}>
                    <Check size={10} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.row}>
            <View style={styles.flexHalf}>
              <AppInput
                label="FIRST NAME"
                placeholder="Ananya"
                value={formik.values.firstName}
                onChangeText={formik.handleChange('firstName')}
                onBlur={formik.handleBlur('firstName')}
                error={formik.touched.firstName ? formik.errors.firstName : undefined}
                leftIcon={<User size={16} color={colors.text.muted} />}
              />
            </View>
            <View style={styles.flexHalf}>
              <AppInput
                label="LAST NAME"
                placeholder="Rao"
                value={formik.values.lastName}
                onChangeText={formik.handleChange('lastName')}
                onBlur={formik.handleBlur('lastName')}
                error={formik.touched.lastName ? formik.errors.lastName : undefined}
              />
            </View>
          </View>

          <AppInput
            label="EMAIL ADDRESS"
            placeholder="ananya@example.com"
            value={formik.values.email}
            onChangeText={formik.handleChange('email')}
            onBlur={formik.handleBlur('email')}
            error={formik.touched.email ? formik.errors.email : undefined}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={16} color={colors.text.muted} />}
          />

          <AppInput
            label="PHONE NUMBER"
            placeholder="+91 9876543210"
            value={formik.values.phoneNumber}
            onChangeText={formik.handleChange('phoneNumber')}
            onBlur={formik.handleBlur('phoneNumber')}
            error={formik.touched.phoneNumber ? formik.errors.phoneNumber : undefined}
            keyboardType="phone-pad"
            leftIcon={<Phone size={16} color={colors.text.muted} />}
          />
          
          <AppInput
            label="PASSWORD"
            placeholder="Min. 8 characters"
            value={formik.values.password}
            onChangeText={formik.handleChange('password')}
            onBlur={formik.handleBlur('password')}
            error={formik.touched.password ? formik.errors.password : undefined}
            secureTextEntry
            leftIcon={<Lock size={16} color={colors.text.muted} />}
          />

          <AppInput
            label="CONFIRM PASSWORD"
            placeholder="Repeat password"
            value={formik.values.confirmPassword}
            onChangeText={formik.handleChange('confirmPassword')}
            onBlur={formik.handleBlur('confirmPassword')}
            error={formik.touched.confirmPassword ? formik.errors.confirmPassword : undefined}
            secureTextEntry
            leftIcon={<Lock size={16} color={colors.text.muted} />}
          />

          <AppButton 
            title={`Sign Up as ${userType === 'farmer' ? 'Farmer' : 'Buyer'}`}
            onPress={() => formik.handleSubmit()} 
            loading={loading}
            fullWidth 
            shape="rounded"
            style={styles.submitButton}
          />

          <View style={styles.footer}>
            <AppText variant="bodySmall" color={colors.text.secondary}>
              Already have an account?{' '}
            </AppText>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <AppText variant="bodySmall" weight="bold" color={colors.brand.primary}>
                  Sign in
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
    paddingTop: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flexHalf: {
    flex: 1,
  },
  roleSection: {
    marginBottom: spacing.lg,
  },
  roleLabel: {
    marginBottom: spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roleCard: {
    flex: 1,
    position: 'relative',
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    borderRadius: radii.xl,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.background.surface,
  },
  roleCardActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.tint,
  },
  roleIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  roleIconActive: {
    backgroundColor: colors.brand.muted,
  },
  roleCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: radii.md,
  },
  submitButton: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
