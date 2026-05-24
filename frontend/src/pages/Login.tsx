import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSEO } from '@/hooks/useSEO';
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Not a member?{' '}
        <Link
          to="/register"
          className="font-semibold text-green-600 hover:text-green-500 dark:text-green-500 dark:hover:text-green-400"
        >
          Create a free account
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5" noValidate>
        <Input
          label="Email address"
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="h-4 w-4" />}
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-green-600 hover:text-green-500 dark:text-green-500"
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
            icon={<Lock className="h-4 w-4" />}
          />
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Sign in
        </Button>
      </form>
    </motion.div>
  );
};

export default Login;
