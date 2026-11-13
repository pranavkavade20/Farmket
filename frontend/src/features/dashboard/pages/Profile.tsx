import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { useAuth, authService } from '@/features/auth';
import { farmerService, type FarmerProfileData } from '@/features/farmer/services/farmerService';
import { buyerService, type BuyerProfileData } from '@/features/buyer';
import {
  PageHeader,
  Badge,
  Button,
  Input,
  Modal,
  ConfirmDialog,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Camera,
  Tractor,
  Store,
  Smartphone,
  KeyRound,
  AlertCircle,
  Lock,
  ExternalLink,
  Calendar,
  Sparkles,
  Leaf,
  Layers,
  LogOut,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { User as UserType } from '@/types';
import axios from 'axios';

export const Profile: React.FC = () => {
  useSEO({
    title: 'Profile & Account Settings',
    description: 'Manage your personal details, credentials, farm/business specifications, and active sessions.',
  });

  const { user, updateUser, logoutAll } = useAuth();
  const navigate = useNavigate();

  // Active Tab: 'personal' | 'business' | 'security' | 'sessions'
  const [activeTab, setActiveTab] = useState<string>('personal');

  // ── Personal Info Form ────────────────────────────────────────────────────────
  const [personalForm, setPersonalForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    phone_number: user?.phone_number ?? '',
    address: user?.address ?? '',
    gender: (user?.gender ?? '') as UserType['gender'],
  });
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // ── Farmer Profile State (if farmer) ──────────────────────────────────────────
  const isFarmer = user?.user_type === 'farmer';
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfileData | null>(null);
  const [farmerForm, setFarmerForm] = useState({
    farm_name: '',
    farm_size: '',
    location: '',
    organic_certified: false,
    description: '',
  });
  const [savingFarmer, setSavingFarmer] = useState(false);

  // ── Buyer Profile State (if buyer) ────────────────────────────────────────────
  const isBuyer = user?.user_type === 'buyer';
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfileData | null>(null);
  const [buyerForm, setBuyerForm] = useState({
    company_name: '',
    delivery_address: '',
    preferences: '',
  });
  const [savingBuyer, setSavingBuyer] = useState(false);

  // ── Password Form ─────────────────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [changingPass, setChangingPass] = useState(false);

  // ── Change Email Modal State ──────────────────────────────────────────────────
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ new_email: '', password: '' });
  const [requestingEmailChange, setRequestingEmailChange] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  // ── Revoke Sessions Confirmation Modal ────────────────────────────────────────
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  // Fetch role-specific profiles on mount
  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      if (isFarmer) {
        farmerService
          .getFarmerProfile(user.id)
          .then((profile) => {
            if (isMounted && profile) {
              setFarmerProfile(profile);
              setFarmerForm({
                farm_name: profile.farm_name || '',
                farm_size: String(profile.farm_size || ''),
                location: profile.location || '',
                organic_certified: Boolean(profile.organic_certified),
                description: profile.description || '',
              });
            }
          })
          .catch(() => {
            // Profile may not exist yet or defaults used
          });
      } else if (isBuyer) {
        buyerService
          .getBuyerProfile(user.id)
          .then((profile) => {
            if (isMounted && profile) {
              setBuyerProfile(profile);
              setBuyerForm({
                company_name: profile.company_name || '',
                delivery_address: profile.delivery_address || user.address || '',
                preferences: profile.preferences || '',
              });
            }
          })
          .catch(() => {
            // Defaults
          });
      }
    }
    return () => {
      isMounted = false;
    };
  }, [user?.id, isFarmer, isBuyer, user?.address]);

  // Handle personal form changes
  const handlePersonalChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setPersonalForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Submit personal info
  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPersonal(true);
    try {
      const updated = await authService.updateProfile(personalForm);
      updateUser(updated);
      toast.success('Personal profile updated successfully!');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.detail ?? 'Failed to update personal profile');
      } else {
        toast.error('Failed to update personal profile');
      }
    } finally {
      setSavingPersonal(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5 MB');
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('profile_picture', file);
    try {
      const { default: api } = await import('@/lib/api');
      const res = await api.patch<UserType>('/accounts/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(res.data);
      toast.success('Profile picture updated successfully!');
    } catch {
      toast.error('Failed to upload picture. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Save Farmer Profile
  const handleSaveFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerProfile?.id) {
      toast.error('Farmer profile not initialized');
      return;
    }
    setSavingFarmer(true);
    try {
      const updated = await farmerService.updateFarmerProfile(farmerProfile.id, {
        farm_name: farmerForm.farm_name,
        farm_size: Number(farmerForm.farm_size) || 1,
        location: farmerForm.location,
        organic_certified: farmerForm.organic_certified,
        description: farmerForm.description,
      });
      setFarmerProfile(updated);
      toast.success('Farm specifications saved successfully!');
    } catch {
      toast.error('Failed to update farm details');
    } finally {
      setSavingFarmer(false);
    }
  };

  // Save Buyer Profile
  const handleSaveBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerProfile?.id) {
      toast.error('Buyer profile not initialized');
      return;
    }
    setSavingBuyer(true);
    try {
      const updated = await buyerService.updateBuyerProfile(buyerProfile.id, {
        company_name: buyerForm.company_name,
        delivery_address: buyerForm.delivery_address,
        preferences: buyerForm.preferences,
      });
      setBuyerProfile(updated);
      toast.success('Business and delivery preferences saved!');
    } catch {
      toast.error('Failed to update buyer profile');
    } finally {
      setSavingBuyer(false);
    }
  };

  // Change Password
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
      toast.success('Password updated successfully! Other device sessions have been revoked.');
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const d = err.response?.data;
        const msg =
          d?.old_password?.[0] ||
          d?.new_password?.[0] ||
          d?.detail ||
          'Failed to update password';
        toast.error(msg);
      } else {
        toast.error('Failed to change password');
      }
    } finally {
      setChangingPass(false);
    }
  };

  // Resend Email Verification
  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResendingVerification(true);
    try {
      const res = await authService.resendVerification(user.email);
      toast.success(res.detail || 'Verification email sent! Check your inbox.');
    } catch {
      toast.error('Failed to dispatch verification email');
    } finally {
      setResendingVerification(false);
    }
  };

  // Request Email Change
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
        const d = err.response?.data;
        toast.error(
          d?.password?.[0] ||
            d?.new_email?.[0] ||
            d?.detail ||
            'Failed to request email change'
        );
      } else {
        toast.error('Failed to request email change');
      }
    } finally {
      setRequestingEmailChange(false);
    }
  };

  // Logout All Devices
  const handleConfirmLogoutAll = async () => {
    setLoggingOutAll(true);
    try {
      await logoutAll();
      toast.success('Successfully logged out from all devices.');
      navigate('/login');
    } catch {
      toast.error('Failed to log out from all devices');
      setLoggingOutAll(false);
      setShowLogoutAllConfirm(false);
    }
  };

  const initials = (user?.first_name?.[0] ?? user?.username?.[0] ?? '?').toUpperCase();
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16">
      {/* ── Page Header ── */}
      <PageHeader
        title="Profile & Account Settings"
        description="Configure your personal details, farm/business specifications, security credentials, and active device sessions."
        badge={
          <Badge variant="brand" className="capitalize">
            <Sparkles className="h-3 w-3 mr-1" />
            {user?.user_type || 'Account'}
          </Badge>
        }
        backLink={{
          to: isFarmer ? '/dashboard' : isBuyer ? '/marketplace' : '/dashboard/admin/executive',
          label: 'Back to Dashboard',
        }}
        actions={
          isFarmer && (
            <Link to={`/farmers/${user?.id}`}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ExternalLink className="h-4 w-4" />}
              >
                View Public Farm
              </Button>
            </Link>
          )
        }
      />

      {/* ── Hero Profile Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-border-subtle bg-surface p-6 sm:p-8 shadow-xs relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5 sm:gap-6">
            {/* Avatar with Camera upload button */}
            <div className="relative group shrink-0">
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.full_name}
                  className="h-24 w-24 rounded-2xl object-cover border-2 border-brand/20 shadow-md group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="h-24 w-24 rounded-2xl bg-brand-muted text-brand border border-brand/30 flex items-center justify-center text-3xl font-display font-black shadow-inner">
                  {initials}
                </div>
              )}

              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-2 -right-2 h-9 w-9 rounded-xl bg-surface border border-border-strong flex items-center justify-center cursor-pointer shadow-md hover:bg-brand hover:text-on-brand transition-all duration-200"
                title="Upload Profile Picture"
              >
                {uploadingAvatar ? (
                  <div className="h-4 w-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>

            {/* User Meta Information */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-display font-black text-foreground truncate">
                  {user?.full_name || user?.username}
                </h2>
                {user?.is_verified ? (
                  <Badge variant="success" size="sm">
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="pending" size="sm">
                    Unverified
                  </Badge>
                )}
              </div>

              <p className="text-xs sm:text-sm font-medium text-foreground-secondary truncate flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {user?.email}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-muted text-brand border border-brand/20">
                  {user?.user_type === 'farmer'
                    ? 'Agricultural Producer'
                    : user?.user_type === 'buyer'
                    ? 'Marketplace Buyer'
                    : 'System Administrator'}
                </span>
                {joinedDate && (
                  <span className="text-xs text-foreground-secondary flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Joined {joinedDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick role-specific badge / status */}
          <div className="self-stretch sm:self-center p-3 rounded-2xl bg-surface-elevated border border-border-subtle shrink-0 text-left sm:text-right">
            <span className="text-[11px] font-semibold text-foreground-secondary uppercase tracking-wider block">
              Account Security State
            </span>
            <span className="text-xs font-bold text-success flex items-center sm:justify-end gap-1 mt-0.5">
              <ShieldCheck className="h-4 w-4" /> Protected by 2FA & JWT
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Unverified Email Alert Banner (If Applicable) ── */}
      {!user?.is_verified && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-700 dark:text-amber-300">
                Your email address is unverified
              </h3>
              <p className="text-xs text-foreground-secondary mt-0.5">
                Verify your email to guarantee complete access to orders, pre-bookings, and secure messaging.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
            isLoading={resendingVerification}
            onClick={handleResendVerification}
          >
            Resend Verification Link
          </Button>
        </motion.div>
      )}

      {/* ── Main Settings Navigation Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-surface border border-border-subtle p-1.5 rounded-2xl gap-1 shadow-2xs">
            <TabsTrigger
              value="personal"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-brand data-[state=active]:text-on-brand"
            >
              <UserIcon className="h-4 w-4" />
              <span>Personal Information</span>
            </TabsTrigger>

            {(isFarmer || isBuyer) && (
              <TabsTrigger
                value="business"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-brand data-[state=active]:text-on-brand"
              >
                {isFarmer ? <Tractor className="h-4 w-4" /> : <Store className="h-4 w-4" />}
                <span>{isFarmer ? 'Farm Specifications' : 'Business & Delivery'}</span>
              </TabsTrigger>
            )}

            <TabsTrigger
              value="security"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-brand data-[state=active]:text-on-brand"
            >
              <KeyRound className="h-4 w-4" />
              <span>Password & Security</span>
            </TabsTrigger>

            <TabsTrigger
              value="sessions"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-brand data-[state=active]:text-on-brand"
            >
              <Smartphone className="h-4 w-4" />
              <span>Active Sessions</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── TAB 1: Personal Profile Form ── */}
        <TabsContent value="personal" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-surface border border-border-subtle p-6 sm:p-8 shadow-xs"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-subtle/60">
              <div className="h-10 w-10 rounded-xl bg-brand-muted/40 text-brand border border-brand/20 flex items-center justify-center shrink-0">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Personal Details & Identity
                </h3>
                <p className="text-xs text-foreground-secondary">
                  Your primary account information used for marketplace interactions.
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePersonal} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
                    First Name
                  </label>
                  <Input
                    name="first_name"
                    value={personalForm.first_name}
                    onChange={handlePersonalChange}
                    placeholder="Enter first name"
                    icon={<UserIcon className="h-4 w-4 text-foreground-secondary" />}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
                    Last Name
                  </label>
                  <Input
                    name="last_name"
                    value={personalForm.last_name}
                    onChange={handlePersonalChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider">
                      Email Address
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(true)}
                      className="text-xs font-bold text-brand hover:underline cursor-pointer"
                    >
                      Change Email
                    </button>
                  </div>
                  <Input
                    value={user?.email ?? ''}
                    readOnly
                    icon={<Mail className="h-4 w-4 text-foreground-secondary" />}
                    className="cursor-not-allowed bg-surface-elevated/70 text-foreground-secondary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <Input
                    name="phone_number"
                    type="tel"
                    value={personalForm.phone_number}
                    onChange={handlePersonalChange}
                    placeholder="+91 9876543210"
                    icon={<Phone className="h-4 w-4 text-foreground-secondary" />}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
                  Gender Identity
                </label>
                <select
                  name="gender"
                  value={personalForm.gender}
                  onChange={handlePersonalChange}
                  className="w-full h-11 rounded-xl border border-border-subtle bg-surface px-3.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand shadow-2xs transition-all"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand" /> Address & Location
                </label>
                <textarea
                  name="address"
                  rows={3}
                  value={personalForm.address}
                  onChange={handlePersonalChange}
                  placeholder="Primary physical address, village, or business location"
                  className="w-full rounded-xl border border-border-subtle bg-surface p-3.5 text-sm font-medium text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand shadow-2xs resize-none transition-all"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-border-subtle/60">
                <Button
                  type="submit"
                  variant="brand"
                  isLoading={savingPersonal}
                  className="gap-2 px-6"
                >
                  Save Personal Changes
                </Button>
              </div>
            </form>
          </motion.div>
        </TabsContent>

        {/* ── TAB 2: Farm / Business Specifications ── */}
        {(isFarmer || isBuyer) && (
          <TabsContent value="business" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-surface border border-border-subtle p-6 sm:p-8 shadow-xs"
            >
              {isFarmer ? (
                <>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-subtle/60">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Tractor className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        Farm Specifications & Practices
                      </h3>
                      <p className="text-xs text-foreground-secondary">
                        Highlight your land holdings, organic certifications, and cultivation narrative to buyers.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveFarmer} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
                          Farm Name
                        </label>
                        <Input
                          value={farmerForm.farm_name}
                          onChange={(e) =>
                            setFarmerForm((p) => ({ ...p, farm_name: e.target.value }))
                          }
                          placeholder="e.g. Green Acres Organic Farm"
                          icon={<Tractor className="h-4 w-4 text-foreground-secondary" />}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
                          Total Farm Size (Acres)
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          value={farmerForm.farm_size}
                          onChange={(e) =>
                            setFarmerForm((p) => ({ ...p, farm_size: e.target.value }))
                          }
                          placeholder="e.g. 12.5"
                          icon={<Layers className="h-4 w-4 text-foreground-secondary" />}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
                        Geographical Farm Location
                      </label>
                      <Input
                        value={farmerForm.location}
                        onChange={(e) =>
                          setFarmerForm((p) => ({ ...p, location: e.target.value }))
                        }
                        placeholder="Village, District, State (e.g. Nashik, Maharashtra)"
                        icon={<MapPin className="h-4 w-4 text-foreground-secondary" />}
                        required
                      />
                    </div>

                    {/* Organic Switch */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-border-subtle bg-surface-elevated">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                          <Leaf className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            Organic Certified Farm
                          </p>
                          <p className="text-[11px] text-foreground-secondary">
                            Certifies pesticide-free and zero chemical synthetic farming standards.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setFarmerForm((p) => ({
                            ...p,
                            organic_certified: !p.organic_certified,
                          }))
                        }
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                          farmerForm.organic_certified
                            ? 'bg-emerald-500 justify-end'
                            : 'bg-border-strong justify-start'
                        }`}
                      >
                        <motion.div
                          layout
                          className="bg-white w-4 h-4 rounded-full shadow-md"
                        />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
                        Farm Story & Cultivation Methods
                      </label>
                      <textarea
                        rows={4}
                        value={farmerForm.description}
                        onChange={(e) =>
                          setFarmerForm((p) => ({ ...p, description: e.target.value }))
                        }
                        placeholder="Share your farm heritage, water management, seed varieties, and harvest philosophies..."
                        className="w-full rounded-xl border border-border-subtle bg-surface p-3.5 text-sm font-medium text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand shadow-2xs resize-none transition-all"
                      />
                    </div>

                    <div className="flex justify-end pt-3 border-t border-border-subtle/60">
                      <Button
                        type="submit"
                        variant="brand"
                        isLoading={savingFarmer}
                        className="gap-2 px-6"
                      >
                        Save Farm Specifications
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-subtle/60">
                    <div className="h-10 w-10 rounded-xl bg-info-muted/40 text-info border border-info/20 flex items-center justify-center shrink-0">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        Business & Delivery Preferences
                      </h3>
                      <p className="text-xs text-foreground-secondary">
                        Commercial company entity details and default distribution targets.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveBuyer} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
                        Company / Store Name (Optional)
                      </label>
                      <Input
                        value={buyerForm.company_name}
                        onChange={(e) =>
                          setBuyerForm((p) => ({ ...p, company_name: e.target.value }))
                        }
                        placeholder="e.g. Fresh Roots Organics Pvt Ltd"
                        icon={<Store className="h-4 w-4 text-foreground-secondary" />}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
                        Primary Delivery Hub Address
                      </label>
                      <textarea
                        rows={3}
                        value={buyerForm.delivery_address}
                        onChange={(e) =>
                          setBuyerForm((p) => ({ ...p, delivery_address: e.target.value }))
                        }
                        placeholder="Default shipping dock, warehouse, or home delivery coordinates..."
                        className="w-full rounded-xl border border-border-subtle bg-surface p-3.5 text-sm font-medium text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand shadow-2xs resize-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
                        Sourcing Preferences & Bulk Specifications
                      </label>
                      <textarea
                        rows={3}
                        value={buyerForm.preferences}
                        onChange={(e) =>
                          setBuyerForm((p) => ({ ...p, preferences: e.target.value }))
                        }
                        placeholder="e.g. Certified organic grains, Grade A Alphonso mangoes, weekly delivery schedules..."
                        className="w-full rounded-xl border border-border-subtle bg-surface p-3.5 text-sm font-medium text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand shadow-2xs resize-none transition-all"
                      />
                    </div>

                    <div className="flex justify-end pt-3 border-t border-border-subtle/60">
                      <Button
                        type="submit"
                        variant="brand"
                        isLoading={savingBuyer}
                        className="gap-2 px-6"
                      >
                        Save Business Preferences
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </TabsContent>
        )}

        {/* ── TAB 3: Password & Security ── */}
        <TabsContent value="security" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-surface border border-border-subtle p-6 sm:p-8 shadow-xs"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-subtle/60">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Update Account Password
                </h3>
                <p className="text-xs text-foreground-secondary">
                  Password changes automatically invalidate all other active sessions across browsers and devices.
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
                  Current Password
                </label>
                <Input
                  name="current"
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) =>
                    setPasswordForm((p) => ({ ...p, current: e.target.value }))
                  }
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <Input
                    name="newPass"
                    type="password"
                    value={passwordForm.newPass}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, newPass: e.target.value }))
                    }
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <Input
                    name="confirm"
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, confirm: e.target.value }))
                    }
                    placeholder="Re-enter new password"
                    required
                  />
                </div>
              </div>

              {/* Password criteria checklist */}
              <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle space-y-2 text-xs">
                <span className="font-semibold text-foreground-secondary uppercase tracking-wider block text-[10px]">
                  Security Guidelines:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-foreground-secondary">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        passwordForm.newPass.length >= 8 ? 'bg-success' : 'bg-border-strong'
                      }`}
                    />
                    <span>At least 8 characters length</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        passwordForm.newPass && passwordForm.newPass === passwordForm.confirm
                          ? 'bg-success'
                          : 'bg-border-strong'
                      }`}
                    />
                    <span>Passwords match perfectly</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-border-subtle/60">
                <Button
                  type="submit"
                  variant="brand"
                  isLoading={changingPass}
                  className="gap-2 px-6"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </motion.div>
        </TabsContent>

        {/* ── TAB 4: Active Sessions & Device Security ── */}
        <TabsContent value="sessions" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-surface border border-border-subtle p-6 sm:p-8 shadow-xs space-y-6"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-border-subtle/60">
              <div className="h-10 w-10 rounded-xl bg-danger-muted/40 text-danger border border-danger/20 flex items-center justify-center shrink-0">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Active Device Sessions & Revocation
                </h3>
                <p className="text-xs text-foreground-secondary">
                  Manage logged in devices, tokens, and emergency security session termination.
                </p>
              </div>
            </div>

            {/* Current Device Card */}
            <div className="p-4 rounded-2xl border border-border-subtle bg-surface-elevated flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-surface border border-border-subtle flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-foreground">
                      This Device (Active Web Session)
                    </p>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[11px] text-foreground-secondary mt-0.5">
                    Authenticated with secure HTTP token pair • Active Now
                  </p>
                </div>
              </div>

              <Badge variant="in-progress" size="sm">
                Active Session
              </Badge>
            </div>

            {/* Sign Out All Devices Card */}
            <div className="p-5 rounded-2xl border border-danger/20 bg-danger-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-danger flex items-center gap-1.5">
                  <LogOut className="h-4 w-4" /> Revoke All Active Sessions
                </h4>
                <p className="text-xs text-foreground-secondary max-w-xl">
                  Lost a phone or accessed Farmket from a public machine? Revoke all refresh tokens immediately across every mobile device and web browser.
                </p>
              </div>

              <Button
                type="button"
                variant="danger"
                size="sm"
                className="shrink-0"
                onClick={() => setShowLogoutAllConfirm(true)}
              >
                Sign Out All Devices
              </Button>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* ── Change Email Modal ── */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title="Change Email Address"
        description="Enter your new email address and confirm your current password. A verification link will be sent to the new address."
        size="md"
      >
        <form onSubmit={handleEmailChangeRequest} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
              New Email Address
            </label>
            <Input
              type="email"
              placeholder="new.email@example.com"
              value={emailForm.new_email}
              onChange={(e) =>
                setEmailForm((p) => ({ ...p, new_email: e.target.value }))
              }
              icon={<Mail className="h-4 w-4 text-foreground-secondary" />}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
              Current Password
            </label>
            <Input
              type="password"
              placeholder="Confirm your password"
              value={emailForm.password}
              onChange={(e) =>
                setEmailForm((p) => ({ ...p, password: e.target.value }))
              }
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowEmailModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="brand"
              size="sm"
              isLoading={requestingEmailChange}
            >
              Send Verification Link
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Logout All Devices Confirmation Dialog ── */}
      <ConfirmDialog
        isOpen={showLogoutAllConfirm}
        onClose={() => setShowLogoutAllConfirm(false)}
        onConfirm={handleConfirmLogoutAll}
        title="Revoke All Device Sessions?"
        description="Are you sure you want to sign out of all active devices? This immediately invalidates all stored authentication tokens and requires you to log in again."
        confirmLabel="Sign Out Everywhere"
        cancelLabel="Keep Active"
        variant="danger"
        isLoading={loggingOutAll}
      />
    </div>
  );
};

export default Profile;
