import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { Button, Input } from '@/components/ui';
import { useSEO } from '@/hooks';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import axios from 'axios';


const Login = () => {
  useSEO({ title: 'Sign In', description: 'Sign in to your Farmket account.' });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 👋');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail as string | undefined;
        toast.error(detail ?? 'Invalid email or password');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
    >
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Welcome Back</h1>
      <p className="text-base font-bold text-gray-500 dark:text-gray-400">
        Not a member?{' '}
        <Link
          to="/register"
          className="text-gray-900 dark:text-white hover:underline transition-colors"
        >
          Create a free account
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6 text-left" noValidate>
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Email Address</label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-5 w-5" />}
            className="h-16 text-base shadow-inner bg-white/50 dark:bg-gray-900/50"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="login-password"
              className="block text-xs font-black text-gray-400 uppercase tracking-widest"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-5 w-5" />}
            className="h-16 text-base shadow-inner bg-white/50 dark:bg-gray-900/50"
          />
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full h-16 rounded-full font-black text-lg tracking-wide shadow-xl" isLoading={isLoading}>
            Sign In
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default Login;
