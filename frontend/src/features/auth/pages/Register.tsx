import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { Button, Input, Badge } from '@/components/ui';
import { useSEO } from '@/hooks';
import {
  User,
  Mail,
  Lock,
  Phone,
  Sprout,
  ShoppingBag,
  Check,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';

const registerSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    phone_number: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
    user_type: z.enum(['buyer', 'farmer']),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const roles = [
  {
    id: 'buyer' as const,
    title: 'Buyer',
    tagline: 'Buy fresh farm produce',
    icon: ShoppingBag,
  },
  {
    id: 'farmer' as const,
    title: 'Farmer',
    tagline: 'Sell directly to consumers',
    icon: Sprout,
  },
];

const Register = () => {
  useSEO({
    title: 'Create Account | Farmket',
    description: 'Join Farmket to buy fresh produce directly from farmers or sell your harvest.',
  });

  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    control,
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

  const selectedUserType = useWatch({
    control,
    name: 'user_type',
    defaultValue: 'buyer',
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // Auto-generate username from email prefix
      const username = data.email.split('@')[0];
      const payload = { ...data, username, gender: '' as const };

      await registerAuth(payload);
      toast.success('Account created! Welcome to Farmket 🌱');
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const responseData = err.response.data as Record<string, string[] | string>;
        const firstKey = Object.keys(responseData)[0];
        const msg = Array.isArray(responseData[firstKey])
          ? responseData[firstKey][0]
          : responseData[firstKey];
        toast.error(String(msg));
      } else {
        toast.error('Registration failed. Please try again.');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full text-center"
    >
      <div className="flex justify-center mb-3">
        <Badge
          variant="brand"
          size="sm"
          icon={<UserPlus className="w-3.5 h-3.5 stroke-[2.2]" />}
        >
          Join Farmket
        </Badge>
      </div>

      <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-1.5 tracking-tight">
        Create Your Account
      </h1>
      <p className="text-sm font-medium text-foreground-secondary mb-6">
        Already a member?{' '}
        <Link
          to="/login"
          className="font-semibold text-brand hover:underline underline-offset-4 transition-colors"
        >
          Sign in
        </Link>
      </p>

      {/* Role selector */}
      <div className="mb-6 text-left" role="radiogroup" aria-label="Select account type">
        <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2 select-none">
          I want to register as
        </label>
        <div className="grid grid-cols-2 gap-3">
          {roles.map((role) => {
            const isSelected = selectedUserType === role.id;
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setValue('user_type', role.id, { shouldValidate: true })}
                className={`relative flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-brand bg-brand/5 dark:bg-brand/10 shadow-xs ring-2 ring-brand/20'
                    : 'border-border-subtle bg-surface/70 hover:border-border-strong hover:bg-surface-elevated/40'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-brand text-on-brand shadow-xs'
                        : 'bg-surface-elevated text-muted border border-border-subtle'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'border-brand bg-brand text-on-brand'
                        : 'border-border-strong bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
                <span className="font-display font-bold text-sm text-foreground">
                  {role.title}
                </span>
                <span className="text-xs text-foreground-secondary mt-0.5 line-clamp-1">
                  {role.tagline}
                </span>
              </button>
            );
          })}
        </div>
        {errors.user_type && (
          <p className="text-xs font-medium text-danger mt-1.5" role="alert">
            {errors.user_type.message}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            id="first_name"
            label="First Name"
            type="text"
            autoComplete="given-name"
            placeholder="e.g. John"
            {...register('first_name')}
            error={errors.first_name?.message}
            leftElement={<User className="h-4 w-4" />}
            inputSize="md"
          />
          <Input
            id="last_name"
            label="Last Name"
            type="text"
            autoComplete="family-name"
            placeholder="e.g. Doe"
            {...register('last_name')}
            error={errors.last_name?.message}
            leftElement={<User className="h-4 w-4" />}
            inputSize="md"
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
          leftElement={<Mail className="h-4 w-4" />}
          inputSize="md"
        />

        <Input
          id="phone_number"
          label="Phone Number"
          type="tel"
          autoComplete="tel"
          placeholder="+91 98765 43210"
          {...register('phone_number')}
          error={errors.phone_number?.message}
          helperText={!errors.phone_number ? 'Optional • for order updates & delivery coordination' : undefined}
          leftElement={<Phone className="h-4 w-4" />}
          inputSize="md"
        />

        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          {...register('password')}
          error={errors.password?.message}
          leftElement={<Lock className="h-4 w-4" />}
          inputSize="md"
          showPasswordToggle
        />

        <Input
          id="confirm_password"
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          {...register('confirm_password')}
          error={errors.confirm_password?.message}
          leftElement={<Lock className="h-4 w-4" />}
          inputSize="md"
          showPasswordToggle
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="brand"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            rightIcon={!isSubmitting ? <ArrowRight className="w-4 h-4 ml-1" /> : undefined}
            className="shadow-brand/25 font-bold"
          >
            Create {selectedUserType === 'farmer' ? 'Farmer' : 'Buyer'} Account
          </Button>
        </div>

        <p className="text-xs text-center text-foreground-secondary font-medium pt-2">
          By creating an account, you agree to Farmket's{' '}
          <Link
            to="/terms"
            className="text-brand hover:underline underline-offset-4 font-semibold transition-colors"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            to="/privacy"
            className="text-brand hover:underline underline-offset-4 font-semibold transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </motion.div>
  );
};

export default Register;
