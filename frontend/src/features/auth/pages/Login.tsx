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
      <h1 className="text-3xl font-display font-black text-foreground mb-3 tracking-tight transition-colors duration-300">Welcome Back</h1>
      <p className="text-base font-bold text-foreground-secondary transition-colors duration-300">
        Not a member?{' '}
        <Link
          to="/register"
          className="text-foreground hover:underline transition-colors"
        >
          Create a free account
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6 text-left" noValidate>
        <div>
          <label className="block text-xs font-black text-foreground-secondary uppercase tracking-widest mb-3 transition-colors duration-300" htmlFor="email">Email Address</label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            error={errors.email?.message}
            icon={<Mail className="h-5 w-5" />}
            className="h-16 text-base shadow-inner bg-surface-elevated/50 backdrop-blur-md border-border-subtle"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="password"
              className="block text-xs font-black text-foreground-secondary uppercase tracking-widest transition-colors duration-300"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-bold text-foreground-secondary hover:text-foreground transition-colors"
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
            icon={<Lock className="h-5 w-5" />}
            className="h-16 text-base shadow-inner bg-surface-elevated/50 backdrop-blur-md border-border-subtle"
          />
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full h-16 rounded-full font-black text-lg tracking-wide shadow-xl" isLoading={isSubmitting}>
            Sign In
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default Login;
