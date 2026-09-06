import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { Button, Input } from '@/components/ui';
import { useSEO } from '@/hooks';
import { Mail, Lock } from 'lucide-react';
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  useSEO({ title: 'Sign In', description: 'Sign in to your Farmket account.' });

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

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back! 👋');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail as string | undefined;
        toast.error(detail ?? 'Invalid email or password');
      } else {
        toast.error('Something went wrong. Please try again.');
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
      <h1 className="text-3xl font-display font-bold text-foreground mb-2 tracking-tight transition-colors duration-300">Welcome Back</h1>
      <p className="text-sm font-medium text-foreground-secondary transition-colors duration-300">
        Not a member?{' '}
        <Link
          to="/register"
          className="font-semibold text-brand hover:underline transition-colors"
        >
          Create a free account
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5 text-left" noValidate>
        <div>
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
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-wider text-foreground-secondary"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-brand hover:underline transition-colors"
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
            icon={<Lock className="h-4 w-4" />}
            inputSize="lg"
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full shadow-md shadow-brand/20 font-bold"
            isLoading={isSubmitting}
          >
            Sign In
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default Login;
