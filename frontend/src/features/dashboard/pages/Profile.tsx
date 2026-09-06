import React, { useState } from 'react';
import { useSEO } from '@/hooks';
import { useAuth, authService } from '@/features/auth';
import { Button, Input, Modal } from '@/components/ui';
import { Camera, User, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from "sonner";
import type { User as UserType } from '@/types';
import axios from 'axios';

const Profile = () => {
  useSEO({ title: 'Profile', description: 'Manage your Farmket profile settings.' });
  const { user, updateUser, logoutAll } = useAuth();

  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    phone_number: user?.phone_number ?? '',
    address: user?.address ?? '',
    gender: user?.gender ?? '' as UserType['gender'],
  });
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [changingPass, setChangingPass] = useState(false);

  // Email Change State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ new_email: '', password: '' });
  const [requestingEmailChange, setRequestingEmailChange] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await authService.updateProfile(form);
      updateUser(updated);
      toast.success('Profile updated successfully!');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.detail ?? 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profile_picture', file);
    try {
      const { default: api } = await import('@/lib/api');
      const res = await api.patch<UserType>('/accounts/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(res.data);
      toast.success('Profile picture updated!');
    } catch {
      toast.error('Failed to upload picture');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPass.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setChangingPass(true);
    try {
      await authService.changePassword({
        old_password: passwordForm.current,
        new_password: passwordForm.newPass,
        confirm_password: passwordForm.confirm,
      });
      toast.success('Password changed successfully! Other device sessions have been revoked.');
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        const msg = data?.old_password?.[0] || data?.new_password?.[0] || data?.detail || 'Failed to change password';
        toast.error(msg);
      }
    } finally {
      setChangingPass(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResendingVerification(true);
    try {
      const res = await authService.resendVerification(user.email);
      toast.success(res.detail || 'Verification email sent! Please check your inbox.');
    } catch {
      toast.error('Failed to dispatch verification email');
    } finally {
      setResendingVerification(false);
    }
  };

  const handleEmailChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.new_email || !emailForm.password) {
      toast.error('Please enter new email and your current password');
      return;
    }
    setRequestingEmailChange(true);
    try {
      const res = await authService.requestEmailChange(emailForm);
      toast.success(res.detail || 'Confirmation link sent to your new email.');
      setShowEmailModal(false);
      setEmailForm({ new_email: '', password: '' });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        toast.error(data?.password?.[0] || data?.new_email?.[0] || data?.detail || 'Failed to request email change');
      }
    } finally {
      setRequestingEmailChange(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!window.confirm('Are you sure you want to sign out of all devices? You will need to log in again.')) {
      return;
    }
    setLoggingOutAll(true);
    try {
      await logoutAll();
      toast.success('Successfully logged out from all devices.');
      window.location.href = '/login';
    } catch {
      toast.error('Failed to log out from all devices');
      setLoggingOutAll(false);
    }
  };

  const initials = (user?.first_name?.[0] ?? user?.username?.[0] ?? '?').toUpperCase();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">Profile Settings</h1>
        <p className="mt-1 text-sm font-medium text-foreground-secondary">Manage your personal details, account security, and active sessions.</p>
      </div>

      {/* Avatar Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-surface border border-border-subtle p-8 flex items-center gap-6 shadow-sm"
      >
          <div className="relative">
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.full_name}
                className="h-24 w-24 rounded-2xl object-cover border border-border-subtle shadow-md"
              />
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-brand-muted flex items-center justify-center text-brand text-3xl font-display font-bold shadow-inner border border-brand/20">
                {initials}
              </div>
            )}
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-surface-elevated flex items-center justify-center cursor-pointer shadow-md border border-border-strong hover:scale-110 hover:text-brand transition-all"
              aria-label="Upload avatar"
            >
              <Camera className="h-5 w-5 text-foreground" />
              <input id="avatar-upload" type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">{user?.full_name || user?.username}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm font-medium text-foreground-secondary">{user?.email}</p>
              {user?.is_verified ? (
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-xs font-semibold">
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-xs font-semibold">
                  Unverified
                </span>
              )}
            </div>
            <span className="mt-3 inline-flex items-center rounded-full bg-secondary-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-primary">
              {user?.user_type}
            </span>
          </div>
        </motion.div>

        {/* Email Verification Notice if unverified */}
        {!user?.is_verified && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <h3 className="text-base font-bold text-amber-700 dark:text-amber-300">Your email address is unverified</h3>
              <p className="text-sm text-foreground-secondary mt-1">
                Please verify your email to ensure uninterrupted access to crops, chat, and orders.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full shrink-0 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
              isLoading={resendingVerification}
              onClick={handleResendVerification}
            >
              Resend Verification Email
            </Button>
          </motion.div>
        )}

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl bg-surface border border-border-subtle p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center">
               <User className="h-5 w-5 text-foreground" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground tracking-tight">Personal Information</h2>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-widest mb-2.5">First Name</label>
                <Input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  icon={<User className="h-5 w-5" />}
                  className="h-12 bg-surface-elevated border-border-subtle"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-widest mb-2.5">Last Name</label>
                <Input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="h-12 bg-surface-elevated border-border-subtle"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-widest">Email Address</label>
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(true)}
                    className="text-xs font-bold text-brand hover:underline"
                  >
                    Change Email
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-5 w-5 text-foreground-secondary" />
                  <input
                    value={user?.email ?? ''}
                    readOnly
                    className="w-full rounded-xl border border-border-subtle bg-surface-elevated pl-10 pr-4 py-3 text-sm font-medium text-foreground-secondary cursor-not-allowed shadow-sm focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-widest mb-2.5">Phone Number</label>
                <Input
                  name="phone_number"
                  type="tel"
                  value={form.phone_number}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  icon={<Phone className="h-5 w-5" />}
                  className="h-12 bg-surface-elevated border-border-subtle"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-widest mb-2.5">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand shadow-sm appearance-none transition-all"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-widest mb-2.5 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Address
              </label>
              <textarea
                name="address"
                rows={3}
                value={form.address}
                onChange={handleChange}
                placeholder="Your delivery address"
                className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-sm font-medium text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand shadow-sm resize-none transition-all"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="brand" isLoading={saving} className="gap-2">
                Save Changes
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Change Email Modal */}
        <Modal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          title="Change Email Address"
          description="Enter your new email address and current password. We will send a confirmation link to the new address."
          size="sm"
        >
          <form onSubmit={handleEmailChangeRequest} className="space-y-4">
            <div>
              <Input
                label="New Email Address"
                type="email"
                placeholder="new@example.com"
                value={emailForm.new_email}
                onChange={(e) => setEmailForm((p) => ({ ...p, new_email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={emailForm.password}
                onChange={(e) => setEmailForm((p) => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
              <Button type="button" variant="outline" onClick={() => setShowEmailModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="brand" isLoading={requestingEmailChange}>
                Send Confirmation
              </Button>
            </div>
          </form>
        </Modal>

        {/* Password Change */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl bg-surface border border-border-subtle p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center">
              <Shield className="h-5 w-5 text-foreground" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground tracking-tight">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-widest mb-2.5">Current Password</label>
              <Input
                name="current"
                type="password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                placeholder="••••••••"
                className="h-12 bg-surface-elevated border-border-subtle"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-widest mb-2.5">New Password</label>
                <Input
                  name="newPass"
                  type="password"
                  value={passwordForm.newPass}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPass: e.target.value }))}
                  placeholder="Min 8 chars"
                  className="h-12 bg-surface-elevated border-border-subtle"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-widest mb-2.5">Confirm New Password</label>
                <Input
                  name="confirm"
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                  placeholder="Re-enter"
                  className="h-12 bg-surface-elevated border-border-subtle"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="outline" isLoading={changingPass} className="gap-2">
                Update Password
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Active Sessions & Security */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl bg-surface border border-border-subtle p-8 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-display font-bold text-foreground tracking-tight">Active Sessions & Security</h2>
              <p className="text-sm text-foreground-secondary mt-1">
                Log out of all devices and mobile sessions immediately. This revokes all active authentication tokens.
              </p>
            </div>
            <Button
              type="button"
              variant="danger"
              className="shrink-0"
              isLoading={loggingOutAll}
              onClick={handleLogoutAllDevices}
            >
              Sign Out All Devices
            </Button>
          </div>
        </motion.div>
    </div>
  );
};

export default Profile;

