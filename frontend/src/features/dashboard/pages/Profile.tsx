import React, { useState } from 'react';
import { useSEO } from '@/hooks';
import { useAuth, authService } from '@/features/auth';
import { Button, Input } from '@/components/ui';
import { Camera, User, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { User as UserType } from '@/types';
import axios from 'axios';

const Profile = () => {
  useSEO({ title: 'Profile', description: 'Manage your Farmket profile settings.' });
  const { user, updateUser } = useAuth();

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
      toast.error('New passwords do not match'); return;
    }
    if (passwordForm.newPass.length < 8) {
      toast.error('Password must be at least 8 characters'); return;
    }
    setChangingPass(true);
    try {
      const { default: api } = await import('@/lib/api');
      await api.post('/accounts/change-password/', {
        old_password: passwordForm.current,
        new_password: passwordForm.newPass,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.old_password?.[0] ?? 'Failed to change password');
      }
    } finally {
      setChangingPass(false);
    }
  };

  const initials = (user?.first_name?.[0] ?? user?.username?.[0] ?? '?').toUpperCase();

  return (
    <div className="mx-auto max-w-4xl w-full">
      <h1 className="text-3xl font-display font-bold text-foreground mb-8 tracking-tight">Profile Settings</h1>

      <div className="space-y-8">
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
            <p className="text-sm font-medium text-foreground-secondary mt-1">{user?.email}</p>
            <span className="mt-3 inline-flex items-center rounded-full bg-secondary-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-primary">
              {user?.user_type}
            </span>
          </div>
        </motion.div>

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
                <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-widest mb-2.5">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-5 w-5 text-foreground-secondary" />
                  <input
                    value={user?.email ?? ''}
                    readOnly
                    className="w-full rounded-xl border border-border-subtle bg-surface-elevated pl-10 pr-4 py-3 text-sm font-medium text-foreground-secondary cursor-not-allowed shadow-sm focus:outline-none"
                  />
                </div>
                <p className="text-[10px] font-semibold text-foreground-secondary uppercase tracking-widest mt-2 ml-1">Email cannot be changed</p>
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
              <Button type="submit" variant="primary" isLoading={saving} className="rounded-full px-6 gap-2">
                Save Changes
              </Button>
            </div>
          </form>
        </motion.div>

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
              <Button type="submit" variant="outline" isLoading={changingPass} className="rounded-full px-6 gap-2">
                Update Password
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
