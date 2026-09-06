import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { useSEO } from '@/hooks';
import { authService } from '@/features/auth/api/authService';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';

const ForgotPassword = () => {
  useSEO({ title: 'Forgot Password', description: 'Reset your Farmket account password.' });

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await authService.requestPasswordReset(email.trim());
      setSubmitted(true);
      toast.success('Password reset instructions sent!');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.detail ?? 'Unable to request password reset. Please try again.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
    >
      <div className="mb-6 flex justify-center">
        <div className="h-16 w-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-inner">
          <Mail className="h-8 w-8" />
        </div>
      </div>

      <h1 className="text-3xl font-display font-black text-foreground mb-3 tracking-tight">
        {submitted ? 'Check Your Email' : 'Forgot Password?'}
      </h1>

      <p className="text-base font-medium text-foreground-secondary mb-8 max-w-sm mx-auto">
        {submitted ? (
          <>
            If an account exists for <span className="font-bold text-foreground">{email}</span>, we have sent a secure password reset link. Please check your inbox and spam folders.
          </>
        ) : (
          "No worries! Enter the email address associated with your Farmket account and we'll send you a single-use link to reset your password."
        )}
      </p>

      {submitted ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4 flex items-center gap-3 text-left">
            <CheckCircle2 className="h-5 w-5 text-brand shrink-0" />
            <p className="text-sm font-medium text-foreground">
              The reset link will expire in 1 hour for your security.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-14 rounded-full font-bold"
            onClick={() => setSubmitted(false)}
          >
            Resend or try another email
          </Button>

          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-foreground-secondary hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 text-left" noValidate>
          <div>
            <Input
              id="email"
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              inputSize="lg"
              required
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-md shadow-brand/20 font-bold"
              isLoading={loading}
            >
              Send Reset Link
            </Button>
          </div>

          <div className="pt-2 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-foreground-secondary hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default ForgotPassword;
