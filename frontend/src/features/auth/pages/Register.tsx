import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { Button, Input } from '@/components/ui';
import { useSEO } from '@/hooks';
import { User, Mail, Lock, Phone, Sprout } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import type { RegisterData, UserType } from '@/types';
import axios from 'axios';    

type FormState = Omit<RegisterData, 'username'> & { username: string };

const Register = () => {
  useSEO({
    title: 'Create Account',
    description: 'Join Farmket and start buying or selling fresh farm produce.',
  });

  const [form, setForm] = useState<FormState>({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    user_type: 'buyer',
    gender: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.first_name.trim()) e.first_name = 'First name is required';
    if (!form.last_name.trim()) e.last_name = 'Last name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Auto-generate username from email prefix
      ...(name === 'email' ? { username: value.split('@')[0] } : {}),
    }));
    if (name in errors) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to Farmket 🌱');
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as Record<string, string[] | string>;
        // Surface first validation error from Django
        const firstKey = Object.keys(data)[0];
        const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
        toast.error(String(msg));
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create an Account</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Already a member?{' '}
        <Link to="/login" className="font-semibold text-green-600 hover:text-green-500 dark:text-green-500">
          Sign in
        </Link>
      </p>

      {/* Role selector */}
      <div className="mt-8 mb-6">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">I am a…</p>
        <div className="grid grid-cols-2 gap-3">
          {(['buyer', 'farmer'] as UserType[]).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setForm((p) => ({ ...p, user_type: role }))}
              className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 text-sm font-semibold capitalize transition-all ${
                form.user_type === role
                  ? 'border-green-600 bg-green-50 text-green-700 dark:border-green-500 dark:bg-green-900/20 dark:text-green-400'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400'
              }`}
              aria-pressed={form.user_type === role}
            >
              {role === 'farmer' ? <Sprout className="mb-1.5 h-6 w-6" /> : <User className="mb-1.5 h-6 w-6" />}
              {role}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            name="first_name"
            type="text"
            autoComplete="given-name"
            placeholder="John"
            value={form.first_name}
            onChange={handleChange}
            error={errors.first_name}
          />
          <Input
            label="Last Name"
            name="last_name"
            type="text"
            autoComplete="family-name"
            placeholder="Doe"
            value={form.last_name}
            onChange={handleChange}
            error={errors.last_name}
          />
        </div>
        <Input
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          icon={<Mail className="h-4 w-4" />}
        />
        <Input
          label="Phone Number (optional)"
          name="phone_number"
          type="tel"
          autoComplete="tel"
          placeholder="+91 9876543210"
          value={form.phone_number ?? ''}
          onChange={handleChange}
          icon={<Phone className="h-4 w-4" />}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          icon={<Lock className="h-4 w-4" />}
        />
        <Input
          label="Confirm Password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={form.confirm_password}
          onChange={handleChange}
          error={errors.confirm_password}
          icon={<Lock className="h-4 w-4" />}
        />

        <div className="pt-2">
          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Create Account
          </Button>
        </div>

        <p className="text-xs text-center text-gray-400 dark:text-gray-500">
          By creating an account you agree to our{' '}
          <Link to="/terms" className="underline hover:text-gray-600 dark:hover:text-gray-300">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="underline hover:text-gray-600 dark:hover:text-gray-300">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </motion.div>
  );
};

export default Register;
