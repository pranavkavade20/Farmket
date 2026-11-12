import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input, Badge } from '@/components/ui';
import { useSEO } from '@/hooks';
import { authService } from '@/features/auth/api/authService';
import { Lock, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';

const ResetPassword = () => {
  useSEO({
    title: 'Reset Password | Farmket',
    description: 'Set a new secure password for your Farmket account.',
  });

  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [token, setToken] = useState(urlToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculateStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      toast.error('Reset token is missing. Please click the link in your email.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.confirmPasswordReset({
        token: token.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setSuccess(true);
      toast.success('Password successfully reset! You can now sign in.');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (data?.detail) {
          toast.error(data.detail);
        } else if (data?.new_password) {
          toast.error(data.new_password[0]);
        } else {
          toast.error('Failed to reset password. The link may have expired or been used.');
        }
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStrengthMeta = () => {
    if (strength <= 1) return { label: 'Weak', color: 'bg-danger', width: 'w-1/4' };
    if (strength === 2) return { label: 'Fair', color: 'bg-warning', width: 'w-2/4' };
    if (strength === 3) return { label: 'Good', color: 'bg-warning', width: 'w-3/4' };
    return { label: 'Strong password', color: 'bg-brand', width: 'w-full' };
  };

  const strengthMeta = getStrengthMeta();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full text-center"
    >
      <div className="flex justify-center mb-3">
        <Badge variant="brand" size="sm" dot>
          <Lock className="w-3.5 h-3.5" />
          <span>Set New Password</span>
        </Badge>
      </div>

      <div className="mb-4 flex justify-center">
        <div className="h-14 w-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-xs">
          <Lock className="h-7 w-7" />
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2 tracking-tight">
        {success ? 'Password Reset Complete' : 'Create New Password'}
      </h1>

      <p className="text-sm font-medium text-foreground-secondary mb-6 max-w-sm mx-auto">
        {success
          ? 'Your password has been securely updated. You can now sign in with your new credentials.'
          : 'Please create a strong new password that you have not recently used on Farmket.'}
      </p>

      {success ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-brand/25 bg-brand/5 dark:bg-brand/10 p-4 flex items-start gap-3 text-left">
            <CheckCircle2 className="h-5 w-5 text-brand shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-medium text-foreground">
              You are all set! For your security, any other active sessions have been safely logged
              out.
            </p>
          </div>

          <Button
            type="button"
            variant="brand"
            size="lg"
            fullWidth
            onClick={() => navigate('/login')}
            rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
            className="shadow-brand/25 font-bold"
          >
            Sign In Now
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
          {!urlToken && (
            <div>
              <Input
                id="token"
                label="Reset Token"
                type="text"
                placeholder="Paste token from email link"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                leftElement={<KeyRound className="h-4 w-4" />}
                inputSize="md"
                className="font-mono text-sm"
                required
              />
            </div>
          )}

          <div>
            <Input
              id="newPassword"
              label="New Password"
              type="password"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              leftElement={<Lock className="h-4 w-4" />}
              inputSize="md"
              showPasswordToggle
              required
            />
            {newPassword && (
              <div className="mt-2 space-y-1.5">
                <div className="flex gap-1 h-1.5 w-full bg-border-subtle rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strengthMeta.width} ${strengthMeta.color}`}
                  />
                </div>
                <p className="text-xs font-bold text-foreground-secondary flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand" />
                  <span>{strengthMeta.label}</span>
                </p>
              </div>
            )}
          </div>

          <div>
            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftElement={<Lock className="h-4 w-4" />}
              inputSize="md"
              showPasswordToggle
              required
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="brand"
              size="lg"
              fullWidth
              isLoading={loading}
              rightIcon={!loading ? <ArrowRight className="w-4 h-4 ml-1" /> : undefined}
              className="shadow-brand/25 font-bold"
            >
              Update Password
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

export default ResetPassword;
