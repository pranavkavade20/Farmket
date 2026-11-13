import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { Button, Input, Badge } from '@/components/ui';
import { useSEO } from '@/hooks';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  useSEO({
    title: 'Sign In | Farmket',
    description: 'Sign in to access your direct agricultural marketplace dashboard.',
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back to Farmket! 👋');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail as string | undefined;
        toast.error(detail ?? 'Invalid email or password');
      } else {
        toast.error('Unable to sign in. Please verify your connection.');
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
          icon={<ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />}
        >
          Secure Sign In
        </Badge>
      </div>

      <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2 tracking-tight">
        Welcome Back
      </h1>
      <p className="text-sm font-medium text-foreground-secondary mb-8">
        New to Farmket?{' '}
        <Link
          to="/register"
          className="font-semibold text-brand hover:underline underline-offset-4 transition-colors"
        >
          Create an account
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left" noValidate>
        <div>
          <Input
            id="email"
            label="Email Address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            error={errors.email?.message}
            leftElement={<Mail className="h-4 w-4" />}
            inputSize="lg"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-wider text-foreground-secondary select-none"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-brand hover:underline underline-offset-4 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
            leftElement={<Lock className="h-4 w-4" />}
            inputSize="lg"
            showPasswordToggle
          />
        </div>

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
            Sign In to Farmket
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default Login;
