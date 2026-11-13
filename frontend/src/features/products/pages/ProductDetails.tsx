import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { Button, Container, Badge } from '@/components/ui';
import { productService } from '@/features/products';
import type { Product } from '@/types';
import CropTimeline from '@/features/products/components/CropTimeline';
import { HarvestCountdown } from '@/features/products/components/HarvestCountdown';
import { CropProgressBar } from '@/features/products/components/CropProgressBar';
import { DemandMeter } from '@/features/products/components/DemandMeter';
import { ProductStatusBadge } from '@/features/products/components/ProductStatusBadge';
import { ReservationModal } from '@/features/products/components/ReservationModal';
import { WaitlistModal } from '@/features/products/components/WaitlistModal';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import { toast } from 'sonner';
import api from '@/lib/api';
import {
  Star,
  MapPin,
  Truck,
  ShieldCheck,
  Leaf,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  MessageSquare,
  Calendar,
  ArrowLeft,
  BadgeCheck,
  Sprout,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [growthDetails, setGrowthDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Modals
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();

  useSEO({
    title: product ? `${product.name} | Farmket Marketplace` : 'Harvest Details | Farmket',
    description: product?.description.slice(0, 160) || 'View product and harvest details on Farmket.',
  });

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    productService
      .getProduct(id)
      .then(async (prod) => {
        if (!isMounted) return;
        setProduct(prod);
        setIsFollowing(prod.is_following);
        setQuantity(prod.minimum_order || 1);
        if (prod.active_crop_growth_id) {
          try {
            const res = await api.get(`/crops/crop-growths/${prod.active_crop_growth_id}/`);
            if (isMounted) setGrowthDetails(res.data);
          } catch (err) {
            console.error('Failed to load growth details', err);
          }
        }
      })
      .catch(() => {
        if (isMounted) toast.error('Failed to load product details');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
      toast.error('Please log in to add items to cart', { icon: '🔒' });
      return;
    }
    await addToCart(product, quantity);
  };

  const handleFollowToggle = async () => {
    if (!product || !user) {
      toast.error('Please log in to follow');
      return;
    }
    try {
      if (isFollowing) {
        await productService.unfollowProduct(product.slug);
        setIsFollowing(false);
        toast.success('Unfollowed crop');
      } else {
        await productService.followProduct(product.slug);
        setIsFollowing(true);
        toast.success('Following crop for updates');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update follow status');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) return;
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    setIsSubmittingReview(true);
    try {
      const newReview = await productService.createReview(product.slug, { rating, comment });
      setProduct({ ...product, reviews: [newReview, ...product.reviews] });
      setRating(5);
      setComment('');
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const formattedPrice = useMemo(() => {
    if (!product) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(parseFloat(product.price || '0'));
  }, [product]);

  const { avgRating, reviewsCount } = useMemo(() => {
    if (product && product.reviews && product.reviews.length > 0) {
      const sum = product.reviews.reduce((s, r) => s + (r.rating || 0), 0);
      return {
        avgRating: (sum / product.reviews.length).toFixed(1),
        reviewsCount: product.reviews.length,
      };
    }
    return { avgRating: null, reviewsCount: 0 };
  }, [product]);

  if (isLoading) {
    return (
      <Container className="py-24 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <Sprout className="h-10 w-10 text-brand animate-pulse" />
          <p className="text-sm font-semibold text-foreground-secondary">
            Loading harvest details...
          </p>
        </div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-24 text-center">
        <h2 className="text-2xl font-bold font-display text-foreground mb-3">
          Harvest Listing Not Found
        </h2>
        <p className="text-sm text-foreground-secondary mb-6">
          This product may have been unlisted or the URL may be incorrect.
        </p>
        <Link to="/marketplace">
          <Button variant="brand" size="md">
            Return to Marketplace
          </Button>
        </Link>
      </Container>
    );
  }

  const images = product.images.length > 0 ? product.images.map((img) => img.image) : [];

  const renderCTA = () => {
    if (!user) {
      return (
        <Button
          variant="brand"
          size="lg"
          fullWidth
          className="font-bold shadow-brand/20"
          onClick={() => navigate('/login')}
        >
          Sign In to Buy
        </Button>
      );
    }

    if (user.user_type === 'farmer' || user.user_type === 'admin') {
      return (
        <Button
          variant="outline"
          size="lg"
          fullWidth
          className="font-bold text-muted bg-surface-elevated/40 cursor-not-allowed"
          disabled
        >
          {user.user_type === 'farmer' ? 'Farmers Cannot Buy' : 'Admins Cannot Buy'}
        </Button>
      );
    }

    switch (product.market_state) {
      case 'AVAILABLE_NOW':
        return (
          <Button
            variant="brand"
            size="lg"
            fullWidth
            className="gap-2 font-bold shadow-brand/25"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5" /> Buy Now
          </Button>
        );
      case 'LOW_STOCK':
        return (
          <Button
            variant="brand"
            size="lg"
            fullWidth
            className="gap-2 font-bold shadow-brand/25 bg-amber-600 hover:bg-amber-700"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5" /> Buy Now (Low Stock)
          </Button>
        );
      case 'READY_FOR_PREBOOKING':
        return (
          <Button
            variant="brand"
            size="lg"
            fullWidth
            className="gap-2 font-bold shadow-brand/25"
            onClick={() => setIsReservationModalOpen(true)}
          >
            <Calendar className="h-5 w-5" /> Reserve Harvest
          </Button>
        );
      case 'READY_TO_HARVEST':
        return (
          <Button
            variant="brand"
            size="lg"
            fullWidth
            className="gap-2 font-bold shadow-brand/25"
            onClick={() => setIsReservationModalOpen(true)}
          >
            <Calendar className="h-5 w-5" /> Priority Harvest Reservation
          </Button>
        );
      case 'SOLD_OUT':
        return (
          <Button
            variant="outline"
            size="lg"
            fullWidth
            className="font-bold"
            onClick={() => setIsWaitlistModalOpen(true)}
          >
            Join Waiting List
          </Button>
        );
      default:
        return (
          <Button
            variant="outline"
            size="lg"
            fullWidth
            disabled
            className="font-bold text-muted"
          >
            Unavailable
          </Button>
        );
    }
  };

  return (
    <Container maxWidth="wide" className="py-6 sm:py-10 min-h-screen">
      {/* Back button & Breadcrumbs */}
      <div className="mb-6 flex flex-col gap-2">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground-secondary hover:text-brand transition-colors group w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Marketplace</span>
        </Link>

        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-medium text-foreground-secondary"
        >
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/marketplace" className="hover:text-foreground transition-colors">
            Marketplace
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold truncate max-w-xs">
            {product.name}
          </span>
        </nav>
      </div>

      {/* Hero Section: Gallery (Left) & Info (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 mb-16">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/3] sm:aspect-square rounded-2xl overflow-hidden bg-surface-elevated/40 border border-border-subtle relative flex items-center justify-center p-6 sm:p-10 shadow-xs">
            {images.length > 0 ? (
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 ease-out hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted">
                <Sprout className="h-16 w-16 stroke-1" />
                <span className="text-xs font-semibold mt-2">Farm Harvest</span>
              </div>
            )}

            {/* Overlay Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              <ProductStatusBadge product={product} className="shadow-xs" />
              {product.is_organic && (
                <Badge
                  variant="brand"
                  size="sm"
                  icon={<Leaf className="w-3.5 h-3.5 stroke-[2.2]" />}
                  className="shadow-xs"
                >
                  Certified Organic
                </Badge>
              )}
            </div>
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    'relative h-18 w-18 shrink-0 rounded-xl overflow-hidden border-2 transition-all p-1 bg-surface cursor-pointer',
                    activeImage === idx
                      ? 'border-brand shadow-xs ring-2 ring-brand/20'
                      : 'border-border-subtle opacity-70 hover:opacity-100 hover:border-border-strong'
                  )}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Commerce Actions */}
        <div className="flex flex-col justify-start">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-brand mb-1.5 inline-block">
              {product.category_name || 'Farm Produce'}
            </span>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground mb-3 tracking-tight">
              {product.name}
            </h1>

            {/* Ratings & Farmer Attribution Row */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {avgRating ? (
                <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full font-bold text-xs">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>
                    {avgRating} ({reviewsCount} review{reviewsCount !== 1 ? 's' : ''})
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-brand/10 text-brand px-3 py-1 rounded-full font-bold text-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Fresh Harvest • New</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-foreground-secondary font-semibold text-xs bg-surface-elevated/70 border border-border-subtle px-3 py-1 rounded-full">
                <MapPin className="h-3.5 w-3.5 text-brand" />
                <span title={product.farmer_name || 'Verified Farmer'}>
                  {product.farmer_name || 'Verified Farmer'}
                </span>
                <BadgeCheck className="h-3.5 w-3.5 text-brand" />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-5 border-b border-border-subtle">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-display font-extrabold text-foreground">
                  {formattedPrice}
                </span>
                <span className="text-sm font-bold text-foreground-secondary">
                  / {product.unit}
                </span>
              </div>
              <span className="text-xs font-medium text-foreground-secondary">
                {product.is_available && product.in_stock
                  ? `${product.available_quantity} ${product.unit} available in stock`
                  : 'Currently not in stock'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
              About This Harvest
            </h3>
            <p className="text-foreground-secondary leading-relaxed text-sm sm:text-base font-normal">
              {product.description ||
                'Freshly harvested agricultural produce delivered straight from the farm to your doorstep. Grown with dedication and sustainable farm management.'}
            </p>
          </div>

          {/* Crop Growth & Pre-booking card if linked */}
          {product.market_state !== 'AVAILABLE_NOW' && product.active_crop_growth_id && (
            <div className="mb-6 bg-brand/5 dark:bg-brand/10 rounded-2xl p-5 border border-brand/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground font-display">
                    Crop Growth & Pre-booking
                  </h3>
                  <p className="text-xs text-foreground-secondary">
                    Real-time status of this harvest batch
                  </p>
                </div>
                {product.harvest_countdown > 0 && (
                  <HarvestCountdown days={product.harvest_countdown} />
                )}
              </div>

              <CropProgressBar
                progress={product.progress}
                stage={product.stage}
                className="mb-4"
              />

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-surface rounded-xl p-3 shadow-xs border border-border-subtle">
                  <p className="text-[10px] text-foreground-secondary font-bold uppercase mb-0.5">
                    Reserved
                  </p>
                  <p className="text-sm sm:text-base font-bold text-foreground">
                    {product.reserved_quantity} {product.unit}
                  </p>
                </div>
                <div className="bg-surface rounded-xl p-3 shadow-xs border border-border-subtle">
                  <p className="text-[10px] text-foreground-secondary font-bold uppercase mb-0.5">
                    Remaining
                  </p>
                  <p className="text-sm sm:text-base font-bold text-foreground">
                    {product.available_quantity} {product.unit}
                  </p>
                </div>
              </div>

              {product.reservation_count > 0 && (
                <div className="flex items-center justify-between pt-3 border-t border-brand/20">
                  <span className="text-xs font-medium text-foreground-secondary">
                    {product.reservation_count} buyers currently reserved
                  </span>
                  <DemandMeter reservationCount={product.reservation_count} />
                </div>
              )}
            </div>
          )}

          {growthDetails && growthDetails.stage_history && (
            <div className="mb-6 bg-surface rounded-2xl p-5 shadow-xs border border-border-subtle">
              <CropTimeline
                currentStage={product.stage}
                history={growthDetails.stage_history}
              />
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col gap-3 mt-auto">
            {['AVAILABLE_NOW', 'LOW_STOCK'].includes(product.market_state) &&
              user?.user_type !== 'farmer' &&
              user?.user_type !== 'admin' ? (
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center bg-surface border border-border-strong rounded-xl h-12 p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-10 w-9 rounded-lg bg-surface-elevated text-foreground flex items-center justify-center hover:bg-state-hover transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-sm text-foreground">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="h-10 w-9 rounded-lg bg-surface-elevated text-foreground flex items-center justify-center hover:bg-state-hover transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1">{renderCTA()}</div>
              </div>
            ) : (
              <div className="w-full">{renderCTA()}</div>
            )}

            {user?.user_type !== 'farmer' && (
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  fullWidth
                  className={cn(
                    'gap-2 font-bold',
                    isFollowing
                      ? 'text-danger border-danger/30 bg-danger/10'
                      : 'text-foreground-secondary hover:text-foreground'
                  )}
                  onClick={handleFollowToggle}
                >
                  <Heart className={cn('h-4 w-4', isFollowing && 'fill-current')} />
                  <span>{isFollowing ? 'Following Harvest' : 'Follow Harvest'}</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  fullWidth
                  className="gap-2 font-bold text-foreground-secondary hover:text-foreground"
                  onClick={() =>
                    navigate('/messages', { state: { userId: product.farmer } })
                  }
                >
                  <MessageSquare className="h-4 w-4 text-brand" />
                  <span>Message Farmer</span>
                </Button>
              </div>
            )}
          </div>

          {/* Quality Guarantees */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Fast Dispatch</h4>
                <p className="text-[11px] text-foreground-secondary font-medium">Direct from farm</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Fresh Quality</h4>
                <p className="text-[11px] text-foreground-secondary font-medium">100% verified harvest</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="pt-12 border-t border-border-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground tracking-tight">
              Customer Reviews & Feedback
            </h2>
            <p className="text-xs sm:text-sm font-medium text-foreground-secondary">
              Genuine experiences from verified buyers who received this produce
            </p>
          </div>

          {avgRating && (
            <div className="flex items-center gap-2 bg-surface p-2 px-3.5 rounded-xl border border-border-subtle shadow-xs">
              <div className="flex items-center text-amber-500">
                <Star className="h-4 w-4 fill-current" />
              </div>
              <span className="text-sm font-bold text-foreground">{avgRating}</span>
              <span className="text-xs text-foreground-secondary">({reviewsCount} reviews)</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {product.reviews.length === 0 ? (
              <div className="p-8 text-center bg-surface rounded-2xl border border-dashed border-border-strong">
                <p className="text-foreground-secondary font-semibold text-sm">
                  No reviews for this harvest yet. Be the first to share your experience!
                </p>
              </div>
            ) : (
              product.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-surface p-5 sm:p-6 rounded-2xl shadow-xs border border-border-subtle transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-foreground text-sm font-display">
                      {rev.buyer_name || 'Verified Buyer'}
                    </span>
                    <span className="text-xs font-medium text-foreground-secondary">
                      {new Date(rev.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex gap-1 mb-3 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-3.5 w-3.5',
                          i < rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-border-strong'
                        )}
                      />
                    ))}
                  </div>

                  <p className="text-foreground-secondary text-sm font-normal leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Write a Review Card */}
          <div className="h-fit lg:sticky lg:top-24 bg-surface p-6 rounded-2xl shadow-xs border border-border-subtle">
            <h3 className="text-base font-display font-bold text-foreground mb-4">
              Write a Review
            </h3>

            {user ? (
              user.id === product.farmer ? (
                <div className="text-center py-6">
                  <p className="text-xs text-foreground-secondary font-medium">
                    You cannot review your own harvest listing.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
                      Your Rating
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 focus:outline-none hover:scale-110 transition-transform cursor-pointer"
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                          <Star
                            className={cn(
                              'h-6 w-6 transition-colors',
                              star <= rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-border-strong'
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
                      Your Comment
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      placeholder="Share details about produce freshness, packaging, and quality..."
                      className="w-full rounded-xl border border-border-strong bg-background p-3 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted/70 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/15 transition-all resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="brand"
                    size="md"
                    fullWidth
                    className="font-bold shadow-brand/20"
                    isLoading={isSubmittingReview}
                  >
                    Submit Review
                  </Button>
                </form>
              )
            ) : (
              <div className="text-center py-6 space-y-4">
                <p className="text-xs text-foreground-secondary font-medium">
                  Please sign in to share a review for this harvest.
                </p>
                <Link to="/login" className="block w-full">
                  <Button variant="brand" size="md" fullWidth className="font-bold">
                    Sign In to Review
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reservation & Waitlist Modals */}
      <ReservationModal
        product={product}
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
      />

      <WaitlistModal
        product={product}
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
      />
    </Container>
  );
};

export default ProductDetails;