import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { useSEO } from '@/hooks';
import { authService } from '@/features/auth/api/authService';
import { Lock, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';

const ResetPassword = () => {
  useSEO({ title: 'Reset Password', description: 'Choose a new password for your Farmket account.' });

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
    >
      <div className="mb-6 flex justify-center">
        <div className="h-16 w-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-inner">
          <Lock className="h-8 w-8" />
        </div>
      </div>

      <h1 className="text-3xl font-display font-black text-foreground mb-3 tracking-tight">
        {success ? 'Password Reset Complete' : 'Set New Password'}
      </h1>

      <p className="text-base font-medium text-foreground-secondary mb-8 max-w-sm mx-auto">
        {success
          ? 'Your password has been updated and all other active sessions have been safely logged out.'
          : 'Please create a strong new password that you have not recently used on Farmket.'}
      </p>

      {success ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4 flex items-center gap-3 text-left">
            <CheckCircle2 className="h-6 w-6 text-brand shrink-0" />
            <p className="text-sm font-medium text-foreground">
              You're all set! You can now log in with your updated credentials.
            </p>
          </div>

          <Button
            type="button"
            variant="brand"
            size="lg"
            className="w-full shadow-md shadow-brand/20 font-bold"
            onClick={() => navigate('/login')}
          >
            Sign In Now
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 text-left" noValidate>
          {!urlToken && (
            <div>
              <Input
                id="token"
                label="Reset Token"
                type="text"
                placeholder="Paste token from email link"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                inputSize="lg"
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
              placeholder="Min 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              inputSize="lg"
              required
            />
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1 h-1.5 w-full bg-border-subtle rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength <= 1 ? 'w-1/4 bg-semantic-danger' : strength <= 3 ? 'w-3/4 bg-semantic-warning' : 'w-full bg-brand'
                      }`}
                  />
                </div>
                <p className="text-[11px] font-bold text-foreground-secondary flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {strength <= 1 ? 'Weak' : strength <= 3 ? 'Medium' : 'Strong'} password
                </p>
              </div>
            )}
          </div>

          <div>
            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
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
              Update Password
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

export default ResetPassword;
