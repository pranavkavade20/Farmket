import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Input, Badge } from '@/components/ui';
import { useSEO } from '@/hooks';
import { authService } from '@/features/auth/api/authService';
import { useAuth } from '@/features/auth';
import {
  CheckCircle2,
  XCircle,
  Mail,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';

const VerifyEmail = () => {
  useSEO({
    title: 'Verify Email | Farmket',
    description: 'Confirm your Farmket account email address.',
  });

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'idle'>(
    token ? 'verifying' : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState(user?.email || '');
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!token) return;
    let isMounted = true;

    authService
      .verifyEmail(token)
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
            setErrorMessage(
              err.response?.data?.detail || 'This verification link is invalid or has expired.'
            );
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full text-center"
    >
      {status === 'verifying' && (
        <div className="py-6 flex flex-col items-center">
          <div className="mb-4 flex justify-center">
            <div className="h-14 w-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-xs">
              <RefreshCw className="h-7 w-7 animate-spin" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
            Verifying Your Email
          </h1>
          <p className="text-sm font-medium text-foreground-secondary max-w-sm">
            Please wait a moment while we securely confirm your account credentials...
          </p>
        </div>
      )}

      {status === 'success' && (
        <div>
          <div className="flex justify-center mb-3">
            <Badge variant="brand" size="sm" dot>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified</span>
            </Badge>
          </div>

          <div className="mb-4 flex justify-center">
            <div className="h-14 w-14 rounded-2xl bg-brand/10 border border-brand/25 flex items-center justify-center text-brand shadow-xs">
              <CheckCircle2 className="h-7 w-7" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2 tracking-tight">
            Email Confirmed!
          </h1>
          <p className="text-sm font-medium text-foreground-secondary mb-6 max-w-sm mx-auto">
            Your Farmket email is verified. You now have full access to create crop listings,
            transact in the marketplace, and direct message farmers and buyers.
          </p>

          <Button
            type="button"
            variant="brand"
            size="lg"
            fullWidth
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
            className="shadow-brand/25 font-bold"
          >
            Continue to {user ? 'Dashboard' : 'Sign In'}
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div>
          <div className="flex justify-center mb-3">
            <Badge variant="danger" size="sm">
              <XCircle className="w-3.5 h-3.5" />
              <span>Verification Failed</span>
            </Badge>
          </div>

          <div className="mb-4 flex justify-center">
            <div className="h-14 w-14 rounded-2xl bg-danger/10 border border-danger/25 flex items-center justify-center text-danger shadow-xs">
              <XCircle className="h-7 w-7" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2 tracking-tight">
            Link Invalid or Expired
          </h1>
          <p className="text-sm font-medium text-foreground-secondary mb-6 max-w-sm mx-auto">
            {errorMessage}
          </p>

          <div className="rounded-2xl border border-border-subtle bg-surface-elevated/40 p-5 text-left mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground-secondary mb-3 flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 text-brand" /> Request New Verification Link
            </h2>
            {resendSent ? (
              <div className="rounded-xl border border-brand/25 bg-brand/5 dark:bg-brand/10 p-3 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-foreground">
                  A fresh verification link was sent to{' '}
                  <span className="font-bold">{resendEmail}</span>. Please check your inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleResend} className="space-y-3.5">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  leftElement={<Mail className="h-4 w-4" />}
                  inputSize="md"
                  required
                />
                <Button
                  type="submit"
                  variant="brand"
                  size="md"
                  fullWidth
                  isLoading={resending}
                  className="font-bold"
                >
                  Send New Link
                </Button>
              </form>
            )}
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-foreground-secondary hover:text-brand transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      )}

      {status === 'idle' && (
        <div>
          <div className="flex justify-center mb-3">
            <Badge variant="brand" size="sm" dot>
              <Mail className="w-3.5 h-3.5" />
              <span>Email Verification</span>
            </Badge>
          </div>

          <div className="mb-4 flex justify-center">
            <div className="h-14 w-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-xs">
              <Mail className="h-7 w-7" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2 tracking-tight">
            Verify Your Email
          </h1>
          <p className="text-sm font-medium text-foreground-secondary mb-6 max-w-sm mx-auto">
            Enter your account email below to receive a secure link to confirm your address.
          </p>

          {resendSent ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-brand/25 bg-brand/5 dark:bg-brand/10 p-4 flex items-start gap-3 text-left">
                <CheckCircle2 className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-medium text-foreground">
                  Verification email sent! Please check your inbox and click the link to confirm your
                  account.
                </p>
              </div>
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
            <form onSubmit={handleResend} className="space-y-4 text-left">
              <div>
                <Input
                  id="email"
                  label="Account Email"
                  type="email"
                  placeholder="you@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
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
                  isLoading={resending}
                  rightIcon={!resending ? <ArrowRight className="w-4 h-4 ml-1" /> : undefined}
                  className="shadow-brand/25 font-bold"
                >
                  Send Verification Link
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
        </div>
      )}
    </motion.div>
  );
};

export default VerifyEmail;
