import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { useSEO } from '@/hooks';
import { authService } from '@/features/auth/api/authService';
import { useAuth } from '@/features/auth';
import { CheckCircle2, XCircle, Mail, ArrowRight, RefreshCw, Sprout } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';

const VerifyEmail = () => {
  useSEO({ title: 'Verify Email', description: 'Confirm your Farmket email address.' });

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'idle'>(token ? 'verifying' : 'idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState(user?.email || '');
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!token) return;
    let isMounted = true;

    authService.verifyEmail(token)
      .then(() => {
        if (isMounted) {
          setStatus('success');
          if (user) {
            updateUser({ ...user, is_verified: true });
          }
          toast.success('Email successfully verified! 🎉');
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setStatus('error');
          if (axios.isAxiosError(err)) {
            setErrorMessage(err.response?.data?.detail || 'This verification link is invalid or has expired.');
          } else {
            setErrorMessage('Verification failed. Please try again or request a new link.');
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, user, updateUser]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setResending(true);
    try {
      await authService.resendVerification(resendEmail.trim());
      setResendSent(true);
      toast.success('Verification link dispatched to your email.');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.detail || 'Failed to resend verification link');
      } else {
        toast.error('Failed to resend verification link');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
    >
      {status === 'verifying' && (
        <div className="py-12 flex flex-col items-center">
          <Sprout className="h-16 w-16 text-brand animate-bounce mb-6" />
          <h1 className="text-3xl font-display font-black text-foreground mb-3">Verifying Email</h1>
          <p className="text-sm font-medium text-foreground-secondary">
            Please hold on while we verify your account security...
          </p>
        </div>
      )}

      {status === 'success' && (
        <div>
          <div className="mb-6 flex justify-center">
            <div className="h-20 w-20 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center text-brand shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          </div>
          <h1 className="text-3xl font-display font-black text-foreground mb-3 tracking-tight">
            Email Verified!
          </h1>
          <p className="text-base font-medium text-foreground-secondary mb-8 max-w-sm mx-auto">
            Your Farmket account email is confirmed. You now have full access to create crop listings, transact in the marketplace, and receive notifications.
          </p>
          <Button
            type="button"
            className="w-full h-16 rounded-full font-black text-lg tracking-wide shadow-xl gap-2"
            onClick={() => navigate(user ? '/dashboard' : '/login')}
          >
            Continue to {user ? 'Dashboard' : 'Sign In'} <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div>
          <div className="mb-6 flex justify-center">
            <div className="h-20 w-20 rounded-full bg-semantic-danger/10 border border-semantic-danger/30 flex items-center justify-center text-semantic-danger shadow-inner">
              <XCircle className="h-10 w-10" />
            </div>
          </div>
          <h1 className="text-3xl font-display font-black text-foreground mb-3 tracking-tight">
            Verification Failed
          </h1>
          <p className="text-sm font-medium text-foreground-secondary mb-8 max-w-sm mx-auto">
            {errorMessage}
          </p>

          <div className="rounded-2xl border border-border-subtle bg-surface-elevated/40 p-6 text-left">
            <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-brand" /> Resend Verification Link
            </h2>
            {resendSent ? (
              <p className="text-xs font-semibold text-brand">
                A fresh verification link has been sent to {resendEmail}. Please check your inbox.
              </p>
            ) : (
              <form onSubmit={handleResend} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  icon={<Mail className="h-4 w-4" />}
                  className="h-12 bg-surface"
                />
                <Button type="submit" variant="primary" className="w-full h-12 rounded-xl" isLoading={resending}>
                  Send New Verification Link
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {status === 'idle' && (
        <div>
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-inner">
              <Mail className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-display font-black text-foreground mb-3 tracking-tight">
            Email Verification
          </h1>
          <p className="text-base font-medium text-foreground-secondary mb-8 max-w-sm mx-auto">
            Enter your account email to receive an email verification link.
          </p>

          {resendSent ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4 flex items-center gap-3 text-left">
                <CheckCircle2 className="h-5 w-5 text-brand shrink-0" />
                <p className="text-sm font-medium text-foreground">
                  Verification email sent! Please check your inbox.
                </p>
              </div>
              <Link to="/login" className="inline-block text-sm font-bold text-brand hover:underline">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResend} className="space-y-6 text-left">
              <Input
                type="email"
                placeholder="you@example.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                icon={<Mail className="h-5 w-5" />}
                className="h-14"
              />
              <Button type="submit" className="w-full h-14 rounded-full font-bold" isLoading={resending}>
                Send Verification Link
              </Button>
            </form>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default VerifyEmail;
