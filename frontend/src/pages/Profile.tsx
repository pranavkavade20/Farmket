import React, { useState } from 'react';
import { useSEO } from '@/hooks/useSEO';
import { useAuth } from '@/store/AuthContext';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
      // Use the raw axios call for multipart
      const { default: api } = await import('@/services/api');
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
      const { default: api } = await import('@/services/api');
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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Profile Settings</h1>

      <div className="space-y-6">
        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-6 flex items-center gap-5"
        >
          <div className="relative">
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.full_name}
                className="h-20 w-20 rounded-full object-cover ring-2 ring-green-200 dark:ring-green-800"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-white text-3xl font-bold ring-2 ring-green-200">
                {initials}
              </div>
            )}
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center cursor-pointer shadow-lg transition-colors"
              aria-label="Upload avatar"
            >
              <Camera className="h-3.5 w-3.5 text-white" />
              <input id="avatar-upload" type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{user?.full_name || user?.username}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <span className="mt-1 inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400 capitalize">
              {user?.user_type}
            </span>
          </div>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <User className="h-4 w-4 text-green-600" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Personal Information</h2>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="John"
                icon={<User className="h-4 w-4" />}
              />
              <Input
                label="Last Name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 h-4 w-4 text-gray-400" />
                  <input
                    value={user?.email ?? ''}
                    readOnly
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-9 pr-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <Input
                label="Phone Number"
                name="phone_number"
                type="tel"
                value={form.phone_number}
                onChange={handleChange}
                placeholder="+91 9876543210"
                icon={<Phone className="h-4 w-4" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Address</span>
              </label>
              <textarea
                name="address"
                rows={3}
                value={form.address}
                onChange={handleChange}
                placeholder="Your delivery address"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" isLoading={saving} className="gap-2">Save Changes</Button>
            </div>
          </form>
        </motion.div>

        {/* Password Change */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Shield className="h-4 w-4 text-green-600" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="Current Password"
              name="current"
              type="password"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
              placeholder="••••••••"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="New Password"
                name="newPass"
                type="password"
                value={passwordForm.newPass}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPass: e.target.value }))}
                placeholder="Min 8 chars"
              />
              <Input
                label="Confirm New Password"
                name="confirm"
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="Re-enter"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="outline" isLoading={changingPass}>Update Password</Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
