import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { Button, Input } from '@/components/ui';
import { useSEO } from '@/hooks';
import { User, Mail, Lock, Phone, Sprout } from 'lucide-react';
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import type { UserType } from '@/types';

const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone_number: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Confirm password is required'),
  user_type: z.enum(['buyer', 'farmer']),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  useSEO({
    title: 'Create Account',
    description: 'Join Farmket and start buying or selling fresh farm produce.',
  });

  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      password: '',
      confirm_password: '',
      user_type: 'buyer',
    },
  });

  const selectedUserType = watch('user_type');

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // Auto-generate username from email prefix
      const username = data.email.split('@')[0];
      const payload = { ...data, username, gender: '' }; // Send gender as empty string based on existing logic
      
      await registerAuth(payload);
      toast.success('Account created! Welcome to Farmket 🌱');
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const responseData = err.response.data as Record<string, string[] | string>;
        const firstKey = Object.keys(responseData)[0];
        const msg = Array.isArray(responseData[firstKey]) ? responseData[firstKey][0] : responseData[firstKey];
        toast.error(String(msg));
      } else {
        toast.error('Registration failed. Please try again.');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
    >
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Create an Account</h1>
      <p className="text-base font-bold text-gray-500 dark:text-gray-400">
        Already a member?{' '}
        <Link to="/login" className="text-gray-900 dark:text-white hover:underline transition-colors">
          Sign in
        </Link>
      </p>

      {/* Role selector */}
      <div className="mt-10 mb-8 text-left">
        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">I am a…</label>
        <div className="grid grid-cols-2 gap-4">
          {(['buyer', 'farmer'] as UserType[]).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setValue('user_type', role, { shouldValidate: true })}
              className={`flex flex-col items-center justify-center rounded-[1.5rem] border-2 p-4 text-sm font-black capitalize transition-all tracking-wide ${
                selectedUserType === role
                  ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900 shadow-md scale-[1.02]'
                  : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
              aria-pressed={selectedUserType === role}
            >
              {role === 'farmer' ? <Sprout className="mb-2 h-6 w-6" /> : <User className="mb-2 h-6 w-6" />}
              {role}
            </button>
          ))}
        </div>
        {errors.user_type && <p className="text-xs font-medium text-red-500 mt-2">{errors.user_type.message}</p>}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3" htmlFor="first_name">First Name</label>
            <Input
              id="first_name"
              type="text"
              autoComplete="given-name"
              placeholder="John"
              {...register('first_name')}
              error={errors.first_name?.message}
              className="h-16 text-base shadow-inner bg-white/50 dark:bg-gray-900/50"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3" htmlFor="last_name">Last Name</label>
            <Input
              id="last_name"
              type="text"
              autoComplete="family-name"
              placeholder="Doe"
              {...register('last_name')}
              error={errors.last_name?.message}
              className="h-16 text-base shadow-inner bg-white/50 dark:bg-gray-900/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3" htmlFor="email">Email Address</label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            error={errors.email?.message}
            icon={<Mail className="h-5 w-5" />}
            className="h-16 text-base shadow-inner bg-white/50 dark:bg-gray-900/50"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3" htmlFor="phone_number">Phone Number</label>
          <Input
            id="phone_number"
            type="tel"
            autoComplete="tel"
            placeholder="+91 9876543210"
            {...register('phone_number')}
            error={errors.phone_number?.message}
            icon={<Phone className="h-5 w-5" />}
            className="h-16 text-base shadow-inner bg-white/50 dark:bg-gray-900/50"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3" htmlFor="password">Password</label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            {...register('password')}
            error={errors.password?.message}
            icon={<Lock className="h-5 w-5" />}
            className="h-16 text-base shadow-inner bg-white/50 dark:bg-gray-900/50"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3" htmlFor="confirm_password">Confirm Password</label>
          <Input
            id="confirm_password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter password"
            {...register('confirm_password')}
            error={errors.confirm_password?.message}
            icon={<Lock className="h-5 w-5" />}
            className="h-16 text-base shadow-inner bg-white/50 dark:bg-gray-900/50"
          />
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full h-16 rounded-full font-black text-lg tracking-wide shadow-xl" isLoading={isSubmitting}>
            Create Account
          </Button>
        </div>

        <p className="text-xs text-center text-gray-400 font-bold mt-6">
          By creating an account you agree to our{' '}
          <Link to="/terms" className="text-gray-900 dark:text-white hover:underline">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-gray-900 dark:text-white hover:underline">Privacy Policy</Link>.
        </p>
      </form>
    </motion.div>
  );
};

export default Register;
