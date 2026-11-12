import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Badge } from '@/components/ui';
import { useSEO } from '@/hooks';
import { authService } from '@/features/auth/api/authService';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';

const ForgotPassword = () => {
  useSEO({
    title: 'Forgot Password | Farmket',
    description: 'Reset your Farmket account password with a secure single-use link.',
  });

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
        toast.error(
          err.response?.data?.detail ?? 'Unable to request password reset. Please try again.'
        );
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
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
        <Badge variant="brand" size="sm" dot>
          <KeyRound className="w-3.5 h-3.5" />
          <span>Account Recovery</span>
        </Badge>
      </div>

      <div className="mb-4 flex justify-center">
        <div className="h-14 w-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-xs">
          <Mail className="h-7 w-7" />
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2 tracking-tight">
        {submitted ? 'Check Your Email' : 'Forgot Password?'}
      </h1>

      <p className="text-sm font-medium text-foreground-secondary mb-6 max-w-sm mx-auto">
        {submitted ? (
          <>
            If an account exists for <span className="font-bold text-foreground">{email}</span>,
            we sent a secure reset link. Check your inbox and spam folders.
          </>
        ) : (
          "Enter the email associated with your Farmket account and we'll send you a single-use link to reset your password."
        )}
      </p>

      {submitted ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-brand/25 bg-brand/5 dark:bg-brand/10 p-4 flex items-start gap-3 text-left">
            <CheckCircle2 className="h-5 w-5 text-brand shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-medium text-foreground">
              The reset link will expire in 1 hour. For security reasons, each link can only be used
              once.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => setSubmitted(false)}
            className="font-bold"
          >
            Resend or try another email
          </Button>

          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-foreground-secondary hover:text-brand transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 text-left" noValidate>
          <div>
            <Input
              id="email"
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftElement={<Mail className="h-4 w-4" />}
              inputSize="lg"
              required
            />
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              variant="brand"
              size="lg"
              fullWidth
              isLoading={loading}
              rightIcon={!loading ? <ArrowRight className="w-4 h-4 ml-1" /> : undefined}
              className="shadow-brand/25 font-bold"
            >
              Send Reset Link
            </Button>
          </div>

          <div className="pt-2 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-foreground-secondary hover:text-brand transition-colors"
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
