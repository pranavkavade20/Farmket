import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import { Container, EmptyState, Button, Badge } from '@/components/ui';
import { useSEO } from '@/hooks';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  Lock,
  Award,
  Sprout,
  Check,
  MapPin,
  CreditCard,
  FileText,
  Smartphone,
  Banknote,
  AlertCircle,
  User as UserIcon,
  Phone,
  Mail,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService, type PlaceOrderPayload } from '@/features/orders';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';

type PaymentMethod = 'cod' | 'upi' | 'online';

const CartSkeleton = () => (
  <Container maxWidth="wide" className="py-10">
    <div className="animate-pulse space-y-8">
      <div className="h-10 w-48 bg-surface-elevated rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-surface border border-border-subtle p-5 flex gap-4 items-center"
            >
              <div className="h-24 w-24 rounded-xl bg-surface-elevated shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-1/3 bg-surface-elevated rounded-md" />
                <div className="h-4 w-1/4 bg-surface-elevated rounded-md" />
                <div className="h-8 w-1/2 bg-surface-elevated rounded-md" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-80 rounded-3xl bg-surface border border-border-subtle p-6 space-y-4">
          <div className="h-6 w-1/2 bg-surface-elevated rounded-md" />
          <div className="h-4 w-full bg-surface-elevated rounded-md" />
          <div className="h-4 w-3/4 bg-surface-elevated rounded-md" />
          <div className="h-12 w-full bg-surface-elevated rounded-xl mt-6" />
        </div>
      </div>
    </div>
  </Container>
);

const Cart = () => {
  useSEO({ title: 'Your Basket | Farmket', description: 'Review your fresh harvest basket and checkout.' });

  const { cart, loading, removeItem, updateQuantity, clearCartLocal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [address, setAddress] = useState(user?.address ?? '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  const fmt = (n: number | string) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(typeof n === 'string' ? parseFloat(n) : n);

  const handleUpdateQty = async (itemId: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemove(itemId);
      return;
    }
    try {
      setUpdatingItemId(itemId);
      await updateQuantity(itemId, newQty);
    } catch {
      toast.error('Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (itemId: number) => {
    try {
      await removeItem(itemId);
      toast.success('Item removed from basket');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }
    if (address.trim().length < 8) {
      toast.error('Please enter a complete delivery address with street and postal code');
      return;
    }

    setPlacing(true);
    try {
      const payload: PlaceOrderPayload = {
        delivery_address: address.trim(),
        payment_method: paymentMethod,
        notes: notes.trim(),
      };
      const order = await orderService.placeOrder(payload);
      clearCartLocal();
      toast.success('Order placed successfully! 🎉');
      navigate(`/dashboard/orders/${order.id}`);
    } catch {
      toast.error('Failed to place order. Please check your network and try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return <CartSkeleton />;
  }

  const items = cart?.items ?? [];
  const total = items.reduce((sum, item) => sum + parseFloat(String(item.subtotal)), 0);
  const hasPrebookingItems = items.some((i) => i.is_prebooking);

  if (items.length === 0 && step === 'cart') {
    return (
      <Container maxWidth="narrow" className="py-20 text-center">
        <EmptyState
          icon={<ShoppingBag className="h-10 w-10 text-brand" />}
          iconVariant="brand"
          title="Your harvest basket is empty"
          description="Discover freshly harvested vegetables, seasonal fruits, and grains directly from verified local growers."
          action={{
            label: 'Explore Marketplace',
            onClick: () => navigate('/marketplace'),
            icon: <Sprout className="w-4 h-4" />,
          }}
          className="max-w-xl mx-auto py-12"
        />

        {/* Quick Category Chips */}
        <div className="mt-8 pt-8 border-t border-border-subtle max-w-lg mx-auto">
          <p className="text-xs uppercase tracking-wider font-bold text-muted mb-3">
            Popular Farm Categories
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: '🥦 Fresh Vegetables', cat: 'Vegetables' },
              { label: '🍎 Seasonal Fruits', cat: 'Fruits' },
              { label: '🌾 Organic Grains', cat: 'Grains' },
              { label: '🌿 Fresh Herbs', cat: 'Herbs' },
            ].map((chip) => (
              <button
                key={chip.cat}
                type="button"
                onClick={() => navigate(`/marketplace?category=${chip.cat}`)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface border border-border-subtle hover:border-brand hover:text-brand transition-colors cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container maxWidth="wide" className="py-8 sm:py-12 min-h-[85vh]">
      {/* 1. Header with Breadcrumb & Multi-step indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-border-subtle mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <Link
              to="/marketplace"
              className="p-2 -ml-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
              aria-label="Continue shopping"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
              {step === 'cart' ? 'Harvest Basket' : 'Checkout & Delivery'}
            </h1>
            <Badge variant="brand" className="font-bold">
              {items.length} {items.length === 1 ? 'Item' : 'Items'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-foreground-secondary mt-1">
            {step === 'cart'
              ? 'Review your selected items and modify quantities before checking out.'
              : 'Complete your delivery destination and confirm your preferred payment option.'}
          </p>
        </div>

        {/* Multi-step Stepper Indicator */}
        <nav aria-label="Checkout Progress" className="flex items-center gap-2 select-none self-end sm:self-auto">
          {/* Step 1: Cart */}
          <button
            type="button"
            onClick={() => setStep('cart')}
            className="flex items-center gap-2.5 cursor-pointer group focus:outline-none"
          >
            <span
              className={cn(
                'h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-200',
                step === 'cart'
                  ? 'bg-brand text-on-brand shadow-xs ring-4 ring-brand/15'
                  : 'bg-surface-elevated text-brand border border-border-subtle group-hover:border-brand/40'
              )}
            >
              {step === 'checkout' ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
            </span>
            <span
              className={cn(
                'text-xs font-bold uppercase tracking-wider transition-colors',
                step === 'cart' ? 'text-brand' : 'text-foreground-secondary group-hover:text-foreground'
              )}
            >
              Basket
            </span>
          </button>

          {/* Stepper Connector Track */}
          <div className="w-8 sm:w-12 h-0.5 bg-border-subtle relative mx-1">
            <motion.div
              className="absolute inset-y-0 left-0 bg-brand"
              initial={{ width: '0%' }}
              animate={{ width: step === 'checkout' ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Step 2: Checkout */}
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                'h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-200',
                step === 'checkout'
                  ? 'bg-brand text-on-brand shadow-xs ring-4 ring-brand/15'
                  : 'bg-surface-elevated text-muted border border-border-subtle'
              )}
            >
              2
            </span>
            <span
              className={cn(
                'text-xs font-bold uppercase tracking-wider transition-colors',
                step === 'checkout' ? 'text-brand' : 'text-muted'
              )}
            >
              Checkout
            </span>
          </div>
        </nav>
      </div>

      {/* 2. Main Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
        {/* Left Column: Cart Items or Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {step === 'cart' ? (
              <motion.div
                key="cart-step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {items.map((item) => {
                  const isUpdating = updatingItemId === item.id;
                  const unit = item.product_details.unit || 'kg';
                  const primaryImage =
                    item.product_details.images.find((i) => i.is_primary)?.image ||
                    item.product_details.images[0]?.image;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5 rounded-2xl bg-surface border border-border-subtle shadow-xs hover:border-brand/40 transition-all"
                    >
                      {/* Thumbnail */}
                      <div className="h-28 w-28 sm:h-32 sm:w-32 flex-shrink-0 flex items-center justify-center rounded-xl bg-surface-elevated border border-border-subtle overflow-hidden relative group">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={item.product_details.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <span className="text-3xl select-none">🌱</span>
                        )}
                        {item.is_prebooking && (
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-warning text-white shadow-xs">
                            Pre-Booking
                          </span>
                        )}
                      </div>

                      {/* Item Content */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              to={`/marketplace/${item.product_details.id}`}
                              className="font-display font-bold text-base sm:text-lg text-foreground hover:text-brand transition-colors line-clamp-1"
                            >
                              {item.product_details.name}
                            </Link>
                            <p className="text-xs text-foreground-secondary mt-0.5 flex items-center gap-1.5">
                              <span>By</span>
                              <strong className="text-foreground">
                                {item.product_details.farmer_name || 'Verified Farmer'}
                              </strong>
                            </p>
                            <p className="text-xs font-semibold text-muted mt-1 tabular-nums">
                              ₹{item.product_details.price} /{unit}
                            </p>
                          </div>

                          {/* Remove Button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(item.id)}
                            className="h-9 w-9 rounded-xl text-muted hover:text-danger hover:bg-danger-muted/30 transition-colors"
                            aria-label={`Remove ${item.product_details.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Stepper & Subtotal Row */}
                        <div className="flex items-center justify-between gap-3 pt-3 mt-3 border-t border-border-subtle">
                          {/* Quantity Stepper */}
                          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-elevated border border-border-subtle">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                              disabled={isUpdating}
                              className="h-8 w-8 rounded-lg flex items-center justify-center bg-surface border border-border-subtle text-foreground hover:bg-surface-elevated active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>

                            <span className="w-10 text-center text-xs font-bold text-foreground tabular-nums select-none">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                              disabled={isUpdating}
                              className="h-8 w-8 rounded-lg flex items-center justify-center bg-surface border border-border-subtle text-foreground hover:bg-surface-elevated active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Line Subtotal */}
                          <div className="text-right">
                            <p className="text-xs text-muted font-medium">Subtotal</p>
                            <p className="text-lg sm:text-xl font-display font-bold text-foreground tabular-nums">
                              {fmt(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Continue Shopping Link */}
                <div className="pt-2">
                  <Link to="/marketplace">
                    <Button variant="ghost" size="sm" className="gap-2 font-semibold text-foreground-secondary hover:text-brand">
                      <ArrowLeft className="h-4 w-4" /> Continue Browsing Marketplace
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* Step 2: Comprehensive Multi-Step Checkout Experience */
              <motion.div
                key="checkout-step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* 1. Recipient Contact Summary */}
                {user && (
                  <div className="p-4 rounded-2xl bg-surface border border-border-subtle flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">
                          {user.full_name || user.username}
                        </p>
                        <p className="text-muted text-[11px]">Verified Buyer Account</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-muted flex-wrap">
                      {user.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-brand" />
                          <span className="text-foreground-secondary">{user.email}</span>
                        </span>
                      )}
                      {user.phone_number && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-brand" />
                          <span className="text-foreground-secondary">{user.phone_number}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Pre-booking Alert Notice if applicable */}
                {hasPrebookingItems && (
                  <div className="p-4 rounded-2xl bg-warning-muted/30 border border-warning/30 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-foreground">Pre-Order Items Included</p>
                      <p className="text-foreground-secondary mt-0.5 leading-relaxed">
                        Your basket contains crops scheduled for upcoming harvests. The farmer will prepare and dispatch these items directly on the scheduled harvest completion date.
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. Delivery Details Card */}
                <div className="rounded-3xl bg-surface border border-border-subtle p-6 sm:p-8 space-y-6 shadow-xs">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wider font-bold text-foreground">
                            1. Delivery Address *
                          </label>
                          <p className="text-[11px] text-muted">Where should our farm partner deliver your produce?</p>
                        </div>
                      </div>

                      {user?.address && user.address !== address && (
                        <button
                          type="button"
                          onClick={() => setAddress(user.address)}
                          className="text-xs font-semibold text-brand hover:underline cursor-pointer"
                        >
                          Use Saved Profile Address
                        </button>
                      )}
                    </div>

                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your complete street address, house/flat number, landmark, locality, and 6-digit postal code..."
                      className="w-full rounded-2xl border border-border-strong bg-surface px-4 py-3 text-sm font-medium text-foreground placeholder-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none shadow-2xs"
                    />
                    <p className="text-[11px] text-muted mt-1">
                      Deliveries are dispatched in insulated, eco-friendly temperature-controlled farm packaging.
                    </p>
                  </div>

                  {/* 4. Payment Method Card Selector */}
                  <div className="pt-6 border-t border-border-subtle">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider font-bold text-foreground">
                          2. Select Payment Method *
                        </label>
                        <p className="text-[11px] text-muted">All transactions are encrypted and direct-to-grower enabled.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          id: 'cod',
                          label: 'Cash on Delivery',
                          desc: 'Pay cash or UPI at delivery doorstep',
                          icon: Banknote,
                        },
                        {
                          id: 'upi',
                          label: 'Instant UPI / QR',
                          desc: 'Google Pay, PhonePe, BHIM, Paytm',
                          icon: Smartphone,
                        },
                        {
                          id: 'online',
                          label: 'Cards / Net Banking',
                          desc: 'Visa, MasterCard, Rupay, NetBanking',
                          icon: CreditCard,
                        },
                      ].map((pm) => {
                        const Icon = pm.icon;
                        const isSelected = paymentMethod === pm.id;
                        return (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                            className={cn(
                              'p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group',
                              isSelected
                                ? 'border-brand bg-brand/5 ring-2 ring-brand/20 shadow-xs'
                                : 'border-border-subtle bg-surface hover:bg-surface-elevated hover:border-border-strong'
                            )}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div
                                  className={cn(
                                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
                                    isSelected
                                      ? 'bg-brand text-on-brand shadow-xs'
                                      : 'bg-surface-elevated text-muted border border-border-subtle'
                                  )}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                {isSelected ? (
                                  <Check className="w-4 h-4 text-brand stroke-[3]" />
                                ) : null}
                              </div>

                              <span
                                className={cn(
                                  'text-xs font-bold block mb-0.5',
                                  isSelected ? 'text-brand' : 'text-foreground'
                                )}
                              >
                                {pm.label}
                              </span>
                            </div>

                            <span className="text-[11px] text-muted leading-tight mt-1">
                              {pm.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Payment Reassurance Message */}
                    <div className="mt-3.5 p-3 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-foreground-secondary flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-brand shrink-0" />
                      {paymentMethod === 'cod' ? (
                        <span>
                          <strong>Zero Risk:</strong> Inspect your fresh harvest upon arrival. Pay cash or UPI only after you're satisfied with quality.
                        </span>
                      ) : paymentMethod === 'upi' ? (
                        <span>
                          <strong>Instant UPI:</strong> Seamless payment via any UPI app with instant farmer transaction verification.
                        </span>
                      ) : (
                        <span>
                          <strong>256-Bit SSL:</strong> Bank-grade encryption ensures your payment credentials remain completely protected.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 5. Special Instructions & Harvest Notes */}
                  <div className="pt-6 border-t border-border-subtle">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider font-bold text-foreground">
                          3. Delivery Instructions & Notes (Optional)
                        </label>
                        <p className="text-[11px] text-muted">Special requests for the grower or logistics partner</p>
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Please leave at front door, call before arrival, package carefully with dry paper..."
                      className="w-full rounded-2xl border border-border-strong bg-surface px-4 py-3 text-xs font-medium text-foreground placeholder-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none shadow-2xs"
                    />
                  </div>
                </div>

                {/* Back to Cart Action */}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep('cart')}
                    className="gap-2 font-semibold text-foreground-secondary hover:text-brand"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to Basket
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Sticky Order Summary Card */}
        <div className="lg:sticky lg:top-28">
          <div className="rounded-3xl bg-surface border border-border-subtle p-6 sm:p-7 shadow-lg relative overflow-hidden">
            {/* Ambient Brand Glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 rounded-full bg-brand/10 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-foreground tracking-tight">
                Order Breakdown
              </h2>
              {step === 'checkout' && (
                <Badge variant="brand" size="sm" className="font-bold">
                  Final Review
                </Badge>
              )}
            </div>

            {/* Items Summary list */}
            <div className="space-y-3 pb-4 border-b border-border-subtle text-xs">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-2">
                  <span className="truncate flex-1 text-foreground-secondary">
                    {item.product_details.name} <strong className="text-foreground">×{item.quantity}</strong>
                  </span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {fmt(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 py-4 border-b border-border-subtle text-xs">
              <div className="flex justify-between items-center text-foreground-secondary">
                <span>Produce Subtotal</span>
                <span className="font-bold text-foreground tabular-nums">{fmt(total)}</span>
              </div>
              <div className="flex justify-between items-center text-foreground-secondary">
                <span className="flex items-center gap-1">
                  <span>Farm-to-Door Delivery</span>
                  <Truck className="w-3.5 h-3.5 text-brand" />
                </span>
                <span className="font-bold text-success">FREE</span>
              </div>
              <div className="flex justify-between items-center text-foreground-secondary">
                <span>Quality Assurance & Packaging</span>
                <span className="font-bold text-brand">Complimentary</span>
              </div>

              {step === 'checkout' && (
                <div className="flex justify-between items-center text-foreground-secondary pt-1">
                  <span>Selected Payment</span>
                  <span className="font-bold text-foreground uppercase tracking-wide">
                    {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Total Row */}
            <div className="py-4 flex justify-between items-baseline">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-muted">Grand Total</p>
                <p className="text-[11px] text-muted">Inclusive of all local taxes</p>
              </div>
              <span className="text-3xl font-display font-extrabold text-brand tabular-nums tracking-tight">
                {fmt(total)}
              </span>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <AnimatePresence mode="wait">
                {step === 'cart' ? (
                  <Button
                    id="proceed-to-checkout-btn"
                    variant="brand"
                    size="lg"
                    onClick={() => setStep('checkout')}
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                    className="w-full h-12 rounded-xl font-bold shadow-md shadow-brand/20 text-sm"
                  >
                    Proceed to Checkout
                  </Button>
                ) : (
                  <Button
                    id="place-order-btn"
                    variant="brand"
                    size="lg"
                    onClick={handlePlaceOrder}
                    isLoading={placing}
                    disabled={placing || !address.trim()}
                    leftIcon={<Lock className="h-4 w-4" />}
                    className="w-full h-12 rounded-xl font-bold shadow-md shadow-brand/20 text-sm"
                  >
                    Place Farm Order · {fmt(total)}
                  </Button>
                )}
              </AnimatePresence>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 pt-5 border-t border-border-subtle grid grid-cols-3 gap-2 text-center text-muted">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-surface-elevated text-brand flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold leading-tight">100% Secure<br />Payments</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-surface-elevated text-brand flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold leading-tight">Direct Farm<br />Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-surface-elevated text-brand flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold leading-tight">Fresh Harvest<br />Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Cart;
