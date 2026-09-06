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

  // eslint-disable-next-line
  const selectedUserType = watch('user_type');

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // Auto-generate username from email prefix
      const username = data.email.split('@')[0];
      const payload = { ...data, username, gender: '' as const }; // Send gender as empty string based on existing logic

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
      <h1 className="text-3xl font-display font-bold text-foreground mb-2 tracking-tight transition-colors duration-300">Create an Account</h1>
      <p className="text-sm font-medium text-foreground-secondary transition-colors duration-300">
        Already a member?{' '}
        <Link to="/login" className="font-semibold text-brand hover:underline transition-colors">
          Sign in
        </Link>
      </p>

      {/* Role selector */}
      <div className="mt-8 mb-6 text-left">
        <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2.5 transition-colors duration-300">I am a…</label>
        <div className="grid grid-cols-2 gap-3.5">
          {(['buyer', 'farmer'] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setValue('user_type', role, { shouldValidate: true })}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 p-3.5 text-sm font-bold capitalize transition-all duration-200 cursor-pointer ${selectedUserType === role
                  ? 'border-brand bg-brand/10 text-brand shadow-sm ring-2 ring-brand/20 scale-[1.02]'
                  : 'border-border-subtle bg-surface text-foreground-secondary hover:border-border-strong hover:bg-state-hover'
                }`}
              aria-pressed={selectedUserType === role}
            >
              {role === 'farmer' ? <Sprout className="mb-1.5 h-5 w-5 text-brand" /> : <User className="mb-1.5 h-5 w-5 text-brand" />}
              {role}
            </button>
          ))}
        </div>
        {errors.user_type && <p className="text-xs font-medium text-danger mt-1.5">{errors.user_type.message}</p>}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="first_name"
            label="First Name"
            type="text"
            autoComplete="given-name"
            placeholder="John"
            {...register('first_name')}
            error={errors.first_name?.message}
            icon={<User className="h-4 w-4" />}
            inputSize="lg"
          />
          <Input
            id="last_name"
            label="Last Name"
            type="text"
            autoComplete="family-name"
            placeholder="Doe"
            {...register('last_name')}
            error={errors.last_name?.message}
            icon={<User className="h-4 w-4" />}
            inputSize="lg"
          />
        </div>

        <Input
          id="email"
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register('email')}
          error={errors.email?.message}
          icon={<Mail className="h-4 w-4" />}
          inputSize="lg"
        />

        <Input
          id="phone_number"
          label="Phone Number"
          type="tel"
          autoComplete="tel"
          placeholder="+91 9876543210"
          {...register('phone_number')}
          error={errors.phone_number?.message}
          icon={<Phone className="h-4 w-4" />}
          inputSize="lg"
        />

        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          {...register('password')}
          error={errors.password?.message}
          icon={<Lock className="h-4 w-4" />}
          inputSize="lg"
        />

        <Input
          id="confirm_password"
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter password"
          {...register('confirm_password')}
          error={errors.confirm_password?.message}
          icon={<Lock className="h-4 w-4" />}
          inputSize="lg"
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full shadow-md shadow-brand/20 font-bold"
            isLoading={isSubmitting}
          >
            Create Account
          </Button>
        </div>

        <p className="text-xs text-center text-foreground-secondary font-medium mt-4 transition-colors duration-300">
          By creating an account you agree to our{' '}
          <Link to="/terms" className="text-brand hover:underline font-semibold">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-brand hover:underline font-semibold">Privacy Policy</Link>.
        </p>
      </form>
    </motion.div>
  );
};

export default Register;
