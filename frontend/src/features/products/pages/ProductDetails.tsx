import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { Button, Input } from '@/components/ui';
import { productService } from '@/features/products';
import type { Product, Review } from '@/types';
import CropTimeline from '@/features/products/components/CropTimeline';
import { HarvestCountdown } from '@/features/products/components/HarvestCountdown';
import { CropProgressBar } from '@/features/products/components/CropProgressBar';
import { DemandMeter } from '@/features/products/components/DemandMeter';
import { ProductStatusBadge } from '@/features/products/components/ProductStatusBadge';
import { ReservationModal } from '@/features/products/components/ReservationModal';
import { WaitlistModal } from '@/features/products/components/WaitlistModal';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import { toast } from "sonner";
import api from '@/lib/api';
import { 
  Star, MapPin, Truck, ShieldCheck, Leaf, 
  Minus, Plus, ShoppingCart, Heart, MessageSquare, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
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
    title: product ? `${product.name} - Farmket` : 'Product Details',
    description: product?.description.slice(0, 160) || 'View product details on Farmket.',
  });

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      productService.getProduct(id)
        .then(async (prod) => {
          setProduct(prod);
          setIsFollowing(prod.is_following);
          setQuantity(prod.minimum_order || 1);
          if (prod.active_crop_growth_id) {
            try {
              const res = await api.get(`/crops/crop-growths/${prod.active_crop_growth_id}/`);
              setGrowthDetails(res.data);
            } catch (err) {
              console.error('Failed to load growth details', err);
            }
          }
        })
        .catch(() => toast.error('Failed to load product details'))
        .finally(() => setIsLoading(false));
    }
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
      toast.error('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center animate-pulse text-foreground-secondary">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h2>
        <Link to="/marketplace">
          <Button>Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images.map(img => img.image) : ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop'];
  const avgRating = product.reviews.length > 0 ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1) : '4.8';
  const reviewsCount = product.reviews.length > 0 ? product.reviews.length : 124;

  const renderCTA = () => {
    if (!user) {
      return (
        <Button className="flex-1 h-16 text-lg rounded-full font-bold tracking-wide" onClick={() => navigate('/login')}>
          LOG IN TO CONTINUE
        </Button>
      );
    }

    if (user.user_type === 'farmer' || user.user_type === 'admin') {
      return (
        <Button className="flex-1 h-16 text-lg rounded-full font-bold tracking-wide bg-surface-elevated text-foreground-secondary cursor-not-allowed border border-border-subtle hover:bg-surface-elevated" disabled>
          {user.user_type === 'farmer' ? 'FARMERS CANNOT BUY' : 'ADMINS CANNOT BUY'}
        </Button>
      );
    }

    switch (product.market_state) {
      case 'AVAILABLE_NOW':
        return (
          <Button variant="primary" className="flex-1 h-16 text-lg gap-3 rounded-full font-bold tracking-wide" onClick={handleAddToCart}>
            <ShoppingCart className="h-6 w-6" /> BUY NOW
          </Button>
        );
      case 'LOW_STOCK':
        return (
          <Button className="flex-1 h-16 text-lg gap-3 rounded-full font-bold tracking-wide bg-orange-600 hover:bg-orange-700 text-white" onClick={handleAddToCart}>
            <ShoppingCart className="h-6 w-6" /> BUY NOW - LIMITED STOCK
          </Button>
        );
      case 'READY_FOR_PREBOOKING':
        return (
          <Button className="flex-1 h-16 text-lg gap-3 rounded-full font-bold tracking-wide bg-brand hover:bg-brand-hover text-brand-foreground" onClick={() => setIsReservationModalOpen(true)}>
            RESERVE HARVEST
          </Button>
        );
      case 'READY_TO_HARVEST':
        return (
          <Button className="flex-1 h-16 text-lg gap-3 rounded-full font-bold tracking-wide bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setIsReservationModalOpen(true)}>
            RESERVE PRIORITY HARVEST
          </Button>
        );
      case 'SOLD_OUT':
        return (
          <Button className="flex-1 h-16 text-lg gap-3 rounded-full font-bold tracking-wide bg-foreground hover:bg-foreground/90 text-surface" onClick={() => setIsWaitlistModalOpen(true)}>
            JOIN WAITING LIST
          </Button>
        );
      default:
        return (
          <Button className="flex-1 h-16 text-lg gap-3 rounded-full font-bold tracking-wide bg-surface-elevated text-foreground-secondary border border-border-subtle" disabled>
            UNAVAILABLE
          </Button>
        );
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8 min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-3 text-sm font-semibold text-foreground-secondary mb-10">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link to="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{product.category_name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-20">
        {/* Image Gallery */}
        <div className="space-y-6">
          <div className="aspect-square rounded-3xl overflow-hidden bg-surface-elevated relative flex items-center justify-center p-12 border border-border-subtle">
            <img src={images[activeImage]} alt={product.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 hover:scale-110" />
            <div className="absolute top-8 left-8 flex flex-col gap-2">
              <ProductStatusBadge product={product} className="px-4 py-2 text-sm shadow-xl" />
              {product.is_organic && (
                <div className="bg-foreground text-surface px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl tracking-widest uppercase">
                  <Leaf className="h-4 w-4" /> ORGANIC
                </div>
              )}
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "relative h-24 w-24 shrink-0 rounded-2xl overflow-hidden border-2 transition-all p-2 bg-surface-elevated",
                    activeImage === idx ? "border-brand shadow-md" : "border-transparent opacity-60 hover:opacity-100 hover:-translate-y-1"
                  )}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal rounded-xl" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 tracking-tight leading-[1.1]">{product.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 px-3 py-1.5 rounded-full font-bold text-sm">
                <Star className="h-4 w-4 fill-current" />
                {avgRating} ({reviewsCount} reviews)
              </div>
              <div className="flex items-center gap-2 text-foreground-secondary font-semibold text-sm bg-surface-elevated border border-border-subtle px-3 py-1.5 rounded-full">
                <MapPin className="h-4 w-4 text-foreground" /> {product.farmer_name}
              </div>
            </div>

            <div className="flex items-end gap-3 mt-4">
              <span className="text-5xl lg:text-6xl font-display font-bold text-foreground">₹{product.price}</span>
              <span className="text-xl text-foreground-secondary font-medium mb-1.5">/ {product.unit}</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-foreground-secondary uppercase tracking-widest mb-4">Description</h3>
            <p className="text-foreground-secondary leading-relaxed text-base md:text-lg font-medium max-w-2xl">
              {product.description || 'Freshly harvested produce delivered directly to your doorstep. Grown with care and sustainable farming practices to ensure the best quality and taste.'}
            </p>
          </div>

          {/* Harvest Information Card */}
          {(product.market_state !== 'AVAILABLE_NOW' && product.active_crop_growth_id) && (
            <div className="mb-8 bg-brand-muted/30 rounded-[2rem] p-6 border border-brand/20">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Harvest Information</h3>
                  <p className="text-sm text-foreground-secondary">Live details on crop progress</p>
                </div>
                {product.harvest_countdown > 0 && <HarvestCountdown days={product.harvest_countdown} />}
              </div>
              
              <CropProgressBar progress={product.progress} stage={product.stage} className="mb-6" />

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface rounded-xl p-4 shadow-sm border border-border-subtle">
                  <p className="text-xs text-foreground-secondary font-bold uppercase mb-1">Reserved</p>
                  <p className="text-lg font-bold text-foreground">{product.reserved_quantity} {product.unit}</p>
                </div>
                <div className="bg-surface rounded-xl p-4 shadow-sm border border-border-subtle">
                  <p className="text-xs text-foreground-secondary font-bold uppercase mb-1">Available</p>
                  <p className="text-lg font-bold text-foreground">{product.available_quantity} {product.unit}</p>
                </div>
              </div>

              {product.reservation_count > 0 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-brand/20">
                  <span className="text-sm font-medium text-foreground-secondary">{product.reservation_count} buyers already reserved this crop</span>
                  <DemandMeter reservationCount={product.reservation_count} />
                </div>
              )}
            </div>
          )}

          {growthDetails && growthDetails.stage_history && (
            <div className="mb-10 bg-surface rounded-3xl p-8 shadow-sm border border-border-subtle">
               <CropTimeline currentStage={product.stage} history={growthDetails.stage_history} />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-4 mt-auto">
            {['AVAILABLE_NOW', 'LOW_STOCK'].includes(product.market_state) && user?.user_type !== 'farmer' && user?.user_type !== 'admin' ? (
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center bg-surface-elevated border border-border-subtle rounded-full h-16 p-2">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="h-12 w-12 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-foreground shadow-sm hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="w-16 text-center font-bold text-xl text-foreground">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="h-12 w-12 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-foreground shadow-sm hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                {renderCTA()}
              </div>
            ) : (
              <div className="w-full">
                {renderCTA()}
              </div>
            )}
            
            {user?.user_type !== 'farmer' && (
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                <Button variant="outline" className={cn("flex-1 h-14 w-full gap-2 rounded-full font-bold", isFollowing ? 'text-danger border-danger-subtle bg-danger-subtle' : 'text-foreground-secondary hover:text-foreground')} onClick={handleFollowToggle}>
                  <Heart className={cn("h-5 w-5", isFollowing ? 'fill-current' : '')} /> {isFollowing ? 'Following' : 'Follow Crop'}
                </Button>
                <Button 
                  variant="secondary" 
                  className="flex-1 h-14 w-full gap-2 rounded-full font-bold bg-success-subtle text-success hover:bg-success-subtle/80"
                  onClick={() => navigate('/messages', { state: { userId: product.farmer } })}
                >
                  <MessageSquare className="h-5 w-5" /> Chat with Farmer
                </Button>
              </div>
            )}
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-6 mt-12 pt-10 border-t border-border-strong">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-info-subtle text-info flex items-center justify-center shrink-0">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">Fast Delivery</h4>
                <p className="text-sm text-foreground-secondary font-medium">Dispatched in 24h</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-success-subtle text-success flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">Quality Promise</h4>
                <p className="text-sm text-foreground-secondary font-medium">100% fresh guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-24 border-t border-border-strong pt-20">
        <h2 className="text-3xl font-display font-bold text-foreground mb-10 tracking-tight">Customer Reviews</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Review List */}
          <div className="lg:col-span-2 space-y-6">
            {product.reviews.length === 0 ? (
              <div className="p-12 text-center bg-surface-elevated rounded-3xl border border-border-subtle">
                 <p className="text-foreground-secondary font-bold text-lg">No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev.id} className="bg-surface p-8 rounded-3xl shadow-sm border border-border-subtle transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-foreground text-lg">{rev.buyer_name}</span>
                    <span className="text-sm font-semibold text-foreground-secondary">
                      {new Date(rev.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex gap-1.5 mb-4 bg-surface-elevated w-fit px-3 py-1.5 rounded-full border border-border-subtle">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-border-strong'}`} />
                    ))}
                  </div>
                  <p className="text-foreground-secondary text-base font-medium leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Write a Review Form */}
          <div className="h-fit sticky top-32 bg-surface-elevated p-10 rounded-3xl shadow-sm border border-border-subtle">
            <h3 className="text-2xl font-display font-bold text-foreground mb-8 tracking-tight">Write a Review</h3>
            {user ? (
              user.id === product.farmer ? (
                <div className="text-center py-10">
                  <p className="text-foreground-secondary font-bold">You cannot review your own product.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-foreground-secondary mb-3 uppercase tracking-widest">Your Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none hover:scale-110 transition-transform"
                        >
                          <Star className={`h-8 w-8 transition-colors ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-border-strong'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground-secondary mb-3 uppercase tracking-widest">Your Review</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={5}
                      placeholder="Share your experience..."
                      className="w-full rounded-2xl border border-border-subtle bg-surface px-6 py-5 text-sm font-medium text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-1 focus:ring-brand transition-all shadow-sm resize-none"
                    />
                  </div>
                  <Button type="submit" variant="primary" className="w-full h-14 rounded-full font-bold text-base" isLoading={isSubmittingReview}>Submit Review</Button>
                </form>
              )
            ) : (
              <div className="text-center py-10">
                <p className="text-foreground-secondary mb-6 font-bold">You must be logged in to write a review.</p>
                <Link to="/login">
                  <Button variant="primary" className="h-14 px-8 rounded-full font-bold">Log In to Review</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modals */}
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
    </div>
  );
};

export default ProductDetails;
