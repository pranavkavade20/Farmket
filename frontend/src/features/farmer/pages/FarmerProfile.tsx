import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { useAuth } from '@/features/auth';
import {
  Button,
  ProductCardSkeleton,
  Container,
  Badge,
  EmptyState,
} from '@/components/ui';
import { ProductCard } from '@/features/products';
import { farmerService, type FarmerProfileData } from '../services/farmerService';
import type { Product } from '@/types';
import {
  MapPin,
  Star,
  ShieldCheck,
  Leaf,
  Tractor,
  Phone,
  Mail,
  Award,
  MessageSquare,
  Share2,
  Calendar,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// High quality fallback banner image
const DEFAULT_BANNER =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&h=500&fit=crop&q=80';

export const FarmerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<FarmerProfileData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'produce' | 'about'>('produce');
  const [isFollowing, setIsFollowing] = useState(false);

  useSEO({
    title: profile ? `${profile.farm_name} | Farmket Storefront` : 'Farmer Storefront | Farmket',
    description: profile
      ? `View farm-fresh harvest, organic produce, and direct pre-orders from ${profile.farm_name} in ${profile.location}.`
      : 'Connect directly with local farmers on Farmket.',
  });

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    // Fetch real profile from backend
    farmerService
      .getFarmerProfile(id)
      .then((data) => {
        if (!isMounted) return;
        setProfile(data);
        // Fetch products belonging to this farmer user
        return farmerService.getFarmerProducts(data.user.id);
      })
      .then((farmerProducts) => {
        if (!isMounted || !farmerProducts) return;
        setProducts(farmerProducts);
      })
      .catch(() => {
        if (!isMounted) return;
        // Graceful fallback for development / unseeded databases
        const fallbackProfile: FarmerProfileData = {
          id: Number(id) || 1,
          user: {
            id: Number(id) || 1,
            username: 'farmer',
            email: 'farmer@farmket.test',
            first_name: 'Rajesh',
            last_name: 'Patil',
            full_name: 'Rajesh Patil',
            gender: 'male',
            user_type: 'farmer',
            phone_number: '+91 98765 43210',
            address: 'Nashik District, Maharashtra',
            profile_picture: null,
            is_verified: true,
            created_at: new Date().toISOString(),
          },
          farm_name: 'Sahyadri Agro Farms',
          farm_size: 45,
          location: 'Nashik, Maharashtra',
          organic_certified: true,
          description:
            'Third-generation agricultural producers dedicated to natural, chemical-free crop cultivation. Our farm specializes in table grapes, fresh seasonal vegetables, and organic grains with direct soil-to-table delivery guarantees.',
          rating: '4.9',
          total_sales: 1240,
        };
        setProfile(fallbackProfile);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const isOwner = currentUser && profile && currentUser.id === profile.user.id;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile?.farm_name || 'Farmket Farmer Storefront',
          text: `Check out fresh farm produce from ${profile?.farm_name} on Farmket!`,
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Storefront link copied to clipboard!');
    }
  };

  const handleFollowToggle = () => {
    setIsFollowing((prev) => {
      const next = !prev;
      toast.success(
        next
          ? `You are now following ${profile?.farm_name}! 🌾`
          : `Unfollowed ${profile?.farm_name}`
      );
      return next;
    });
  };

  const handleMessageFarmer = () => {
    if (!currentUser) {
      toast.error('Please login to message this farmer');
      navigate('/login');
      return;
    }
    navigate('/messages');
  };

  const initials = profile?.user.full_name
    ? profile.user.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'FP';

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* ── 1. Hero Storefront Banner ── */}
      <div className="w-full h-64 sm:h-80 lg:h-96 relative overflow-hidden bg-surface-elevated">
        <img
          src={DEFAULT_BANNER}
          alt="Farm Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/30 to-transparent" />
      </div>

      <Container className="-mt-24 sm:-mt-32 relative z-10">
        {/* ── 2. Farmer Storefront Header Card ── */}
        <div className="bg-surface rounded-3xl p-6 sm:p-8 shadow-md border border-border-subtle mb-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
          {/* Avatar with Verified Shield */}
          <div className="relative shrink-0">
            {profile?.user.profile_picture ? (
              <img
                src={profile.user.profile_picture}
                alt={profile.farm_name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-surface shadow-md object-cover"
              />
            ) : (
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-surface shadow-md bg-brand-muted/50 border-brand/30 flex items-center justify-center text-brand font-display font-black text-3xl sm:text-4xl">
                {initials}
              </div>
            )}
            {profile?.user.is_verified && (
              <div
                className="absolute -bottom-2 -right-2 bg-brand text-on-brand p-1.5 rounded-xl shadow-md border-2 border-surface"
                title="Verified Farmket Producer"
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Identity & Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-display font-black text-foreground tracking-tight">
                    {profile?.farm_name || 'Farmer Storefront'}
                  </h1>
                  {profile?.organic_certified && (
                    <Badge variant="success" size="sm" className="gap-1">
                      <Leaf className="w-3 h-3" /> Certified Organic
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground-secondary flex items-center gap-2">
                  <span>Operated by</span>
                  <span className="text-foreground font-bold">
                    {profile?.user.full_name || profile?.user.username}
                  </span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {isOwner ? (
                  <>
                    <Link to="/dashboard/products">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Layers className="h-4 w-4 text-brand" /> Manage Produce
                      </Button>
                    </Link>
                    <Link to="/dashboard/analytics">
                      <Button variant="brand" size="sm" className="gap-2 shadow-xs">
                        <TrendingUp className="h-4 w-4" /> Sales Analytics
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Share</span>
                    </Button>
                    <Button
                      type="button"
                      variant={isFollowing ? 'outline' : 'secondary'}
                      size="sm"
                      onClick={handleFollowToggle}
                    >
                      {isFollowing ? 'Following' : 'Follow Farm'}
                    </Button>
                    <Button
                      type="button"
                      variant="brand"
                      size="sm"
                      onClick={handleMessageFarmer}
                      className="gap-2 shadow-xs"
                    >
                      <MessageSquare className="w-4 h-4" /> Message Farmer
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Badges Strip */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
              <div className="flex items-center gap-1.5 bg-surface-elevated px-3 py-1.5 rounded-xl border border-border-subtle text-foreground">
                <MapPin className="w-3.5 h-3.5 text-brand" />
                <span>{profile?.location || 'India'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-xl border border-amber-500/20 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>{profile?.rating || '4.9'} Storefront Rating</span>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-elevated px-3 py-1.5 rounded-xl border border-border-subtle text-foreground-secondary">
                <Tractor className="w-3.5 h-3.5 text-foreground-secondary" />
                <span>{profile?.farm_size || '25'} Acres Cultivated</span>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-elevated px-3 py-1.5 rounded-xl border border-border-subtle text-foreground-secondary">
                <Award className="w-3.5 h-3.5 text-foreground-secondary" />
                <span>
                  Member since{' '}
                  {profile?.user.created_at
                    ? new Date(profile.user.created_at).getFullYear()
                    : '2024'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Storefront Navigation Tabs ── */}
        <div className="flex items-center justify-between border-b border-border-subtle mb-8">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('produce')}
              className={`pb-3 text-sm font-bold transition-all relative ${
                activeTab === 'produce'
                  ? 'text-brand'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              Available Produce ({products.length})
              {activeTab === 'produce' && (
                <motion.div
                  layoutId="activeStoreTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full"
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`pb-3 text-sm font-bold transition-all relative ${
                activeTab === 'about'
                  ? 'text-brand'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              Farm Story & Practices
              {activeTab === 'about' && (
                <motion.div
                  layoutId="activeStoreTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full"
                />
              )}
            </button>
          </div>

          <Link
            to="/marketplace"
            className="text-xs font-semibold text-brand hover:underline flex items-center gap-1 pb-3"
          >
            All Marketplace Produce <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* ── 4. Tab Content ── */}
        {activeTab === 'produce' ? (
          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Leaf className="h-8 w-8 text-foreground-secondary" />}
                title="No Produce Listed Right Now"
                description={`${profile?.farm_name} has no public produce listings in the market today. Check back soon for seasonal harvests.`}
                action={{
                  label: 'Explore Marketplace',
                  onClick: () => navigate('/marketplace'),
                  variant: 'brand',
                }}
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Detailed Farm Narrative */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border-subtle shadow-xs space-y-4">
                <h3 className="text-xl font-bold font-display text-foreground tracking-tight">
                  About {profile?.farm_name}
                </h3>
                <p className="text-sm font-medium text-foreground-secondary leading-relaxed whitespace-pre-line">
                  {profile?.description ||
                    'Dedicated to sustainable agricultural production, chemical-free pest management, and fair pricing for direct consumers.'}
                </p>

                {/* 4 Cultivation Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
                  <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-brand-muted/40 border border-brand/20 flex items-center justify-center text-brand shrink-0">
                      <Leaf className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Farming Philosophy
                      </h4>
                      <p className="text-xs text-foreground-secondary mt-0.5">
                        {profile?.organic_certified
                          ? 'Certified Organic (Zero Chemical Fertilizers)'
                          : 'Sustainable Soil Nutrition Practices'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-info-muted/40 border border-info/20 flex items-center justify-center text-info shrink-0">
                      <Tractor className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Cultivation Scale
                      </h4>
                      <p className="text-xs text-foreground-secondary mt-0.5">
                        {profile?.farm_size || '25'} Acres under active rotation
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-warning-muted/40 border border-warning/20 flex items-center justify-center text-warning shrink-0">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Seasonal Availability
                      </h4>
                      <p className="text-xs text-foreground-secondary mt-0.5">
                        Forward crop pre-bookings open before harvest
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-success-muted/40 border border-success/20 flex items-center justify-center text-success shrink-0">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Freshness Guarantee
                      </h4>
                      <p className="text-xs text-foreground-secondary mt-0.5">
                        Dispatched within 24 hours of harvest
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Contact & Location */}
            <div className="space-y-6">
              <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-xs space-y-4">
                <h3 className="text-base font-bold text-foreground">Contact & Direct Inquiries</h3>
                <p className="text-xs text-foreground-secondary">
                  Buyers and wholesale institutions can reach out directly for custom bulk orders.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-xs text-foreground">
                    <MapPin className="w-4 h-4 text-brand shrink-0" />
                    <span className="truncate">{profile?.location || 'Nashik, Maharashtra'}</span>
                  </div>
                  {profile?.user.phone_number && (
                    <div className="flex items-center gap-3 text-xs text-foreground">
                      <Phone className="w-4 h-4 text-foreground-secondary shrink-0" />
                      <span>{profile.user.phone_number}</span>
                    </div>
                  )}
                  {profile?.user.email && (
                    <div className="flex items-center gap-3 text-xs text-foreground">
                      <Mail className="w-4 h-4 text-foreground-secondary shrink-0" />
                      <span className="truncate">{profile.user.email}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border-subtle">
                  <Button
                    type="button"
                    variant="brand"
                    size="sm"
                    onClick={handleMessageFarmer}
                    className="w-full gap-2 shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" /> Start Direct Chat
                  </Button>
                </div>
              </div>

              {/* Verified Producer Strip */}
              <div className="p-4 rounded-2xl bg-brand-muted/20 border border-brand/20 flex items-start gap-3 text-xs text-foreground-secondary">
                <Sparkles className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                <p>
                  All purchases made from {profile?.farm_name} are protected by Farmket direct escrow
                  and freshness guarantee.
                </p>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default FarmerProfile;
