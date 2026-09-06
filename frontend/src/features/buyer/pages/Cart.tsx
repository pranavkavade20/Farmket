import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import { Container, EmptyState, Button } from '@/components/ui';
import { useSEO } from '@/hooks';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ChevronRight, ShieldCheck, Truck, Lock, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService, type PlaceOrderPayload } from '@/features/orders';
import { toast } from "sonner";

type PaymentMethod = 'cod' | 'upi' | 'online';

const Cart = () => {
  useSEO({ title: 'Your Cart', description: 'Review and checkout your Farmket cart.' });

  const { cart, loading, removeItem, updateQuantity, clearCartLocal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [address, setAddress] = useState(user?.address ?? '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);

  const fmt = (n: number | string) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      typeof n === 'string' ? parseFloat(n) : n
    );

  const handlePlaceOrder = async () => {
    if (!address.trim()) { toast.error('Please enter a delivery address'); return; }
    setPlacing(true);
    try {
      const payload: PlaceOrderPayload = {
        delivery_address: address,
        payment_method: paymentMethod,
        notes,
      };
      const order = await orderService.placeOrder(payload);
      clearCartLocal();
      toast.success('Order placed successfully! 🎉');
      navigate(`/dashboard/orders/${order.id}`);
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="narrow" className="py-16 text-center">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-border-subtle" />
          ))}
        </div>
      </Container>
    );
  }

  const items = cart?.items ?? [];
  // Calculate total in real time from the current items array
  const total = items.reduce((sum, item) => sum + parseFloat(String(item.subtotal)), 0);

  if (items.length === 0) {
    return (
      <Container maxWidth="narrow" className="py-24">
        <EmptyState
          icon={<ShoppingBag className="h-12 w-12 text-muted" />}
          title="Your cart is empty"
          description="Explore the marketplace and add fresh produce directly from verified farmers."
          action={{
            label: "Browse Marketplace",
            onClick: () => navigate('/marketplace')
          }}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="wide" className="py-12 min-h-screen">
      {/* Step indicator */}
      <div className="flex items-center gap-0 text-sm mb-12 select-none">
        {/* Step 1 */}
        <button onClick={() => setStep('cart')} className="flex items-center gap-3 group">
          <span
            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 ${step === 'cart'
                ? 'bg-foreground text-background shadow-lg scale-110'
                : 'bg-surface-elevated text-foreground-secondary'
              }`}
          >
            1
          </span>
          <span className={`font-black uppercase tracking-widest text-xs transition-colors ${step === 'cart' ? 'text-foreground' : 'text-foreground-secondary'
            }`}>Cart</span>
        </button>
        {/* Connector */}
        <div className="relative mx-6 flex-1 max-w-[80px]">
          <div className="h-1 w-full bg-surface-elevated rounded-full transition-colors duration-300" />
          <motion.div
            className="absolute inset-y-0 left-0 h-1 bg-foreground rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: step === 'checkout' ? '100%' : '0%' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
        {/* Step 2 */}
        <div className="flex items-center gap-3">
          <span
            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 ${step === 'checkout'
                ? 'bg-foreground text-background shadow-lg scale-110'
                : 'bg-surface-elevated text-foreground-secondary'
              }`}
          >
            2
          </span>
          <span className={`font-black uppercase tracking-widest text-xs transition-colors ${step === 'checkout' ? 'text-foreground' : 'text-foreground-secondary'
            }`}>Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        {/* Left — items / checkout form */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {step === 'cart' ? (
              <motion.div key="cart-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-3xl font-display font-black text-foreground mb-8 tracking-tight transition-colors duration-300">
                  Your Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
                </h1>
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-6 rounded-[2rem] bg-surface border border-border-subtle p-6 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="h-28 w-28 flex-shrink-0 flex items-center justify-center rounded-[1.5rem] bg-surface-elevated p-3 transition-colors duration-300">
                        <img
                          src={
                            item.product_details.images.find((i) => i.is_primary)?.image ||
                            item.product_details.images[0]?.image ||
                            undefined
                          }
                          alt={item.product_details.name}
                          className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between py-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-black text-xl text-foreground mb-1 transition-colors duration-300">
                              {item.product_details.name}
                            </p>
                            <p className="text-sm font-bold text-foreground-secondary transition-colors duration-300">
                              by {item.product_details.farmer_name}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="h-10 w-10 min-h-[40px] min-w-[40px] rounded-xl text-foreground-secondary hover:text-danger hover:bg-danger-muted"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2 rounded-xl bg-surface-elevated p-1 transition-colors duration-300 border border-border-subtle">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center bg-surface border border-border-subtle shadow-sm hover:bg-state-hover active:scale-95 transition-all text-foreground"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-foreground transition-colors duration-300 tabular-nums">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center bg-surface border border-border-subtle shadow-sm hover:bg-state-hover active:scale-95 transition-all text-foreground"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-2xl font-black text-foreground transition-colors duration-300">
                            {fmt(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-8">
                  <Link to="/marketplace">
                    <Button variant="ghost" size="sm" className="gap-2 text-foreground-secondary hover:text-foreground">
                      <ArrowLeft className="h-4 w-4" /> Continue Shopping
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div key="checkout-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-3xl font-display font-black text-foreground mb-8 tracking-tight transition-colors duration-300">Checkout</h2>
                <div className="rounded-[2.5rem] bg-surface border border-border-subtle p-8 space-y-8 shadow-sm transition-colors duration-300">
                  {/* Delivery Address */}
                  <div>
                    <label className="block text-xs font-black text-foreground-secondary uppercase tracking-widest mb-3 transition-colors duration-300">
                      Delivery Address *
                    </label>
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your full delivery address"
                      className="w-full rounded-[1.5rem] border-none bg-surface-elevated px-6 py-5 text-sm font-bold text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-4 focus:ring-brand/20 transition-all resize-none"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-black text-foreground-secondary uppercase tracking-widest mb-3 transition-colors duration-300">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['cod', 'upi', 'online'] as PaymentMethod[]).map((method) => (
                        <Button
                          key={method}
                          type="button"
                          variant={paymentMethod === method ? 'brand' : 'secondary'}
                          size="md"
                          onClick={() => setPaymentMethod(method)}
                          className="uppercase tracking-wider text-xs font-bold py-3"
                        >
                          {method === 'cod' ? 'Cash on Delivery' : method.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-black text-foreground-secondary uppercase tracking-widest mb-3 transition-colors duration-300">
                      Order Notes (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special instructions for the farmer…"
                      className="w-full rounded-[1.5rem] border-none bg-surface-elevated px-6 py-5 text-sm font-bold text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-4 focus:ring-brand/20 transition-all resize-none"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('cart')}
                  className="mt-6 gap-2 text-foreground-secondary hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to cart
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — Order Summary */}
        <div className="lg:sticky lg:top-32">
          <div className="rounded-[2.5rem] bg-surface border border-border-subtle p-8 shadow-xl relative overflow-hidden transition-colors duration-300">
            {/* Soft decorative glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-brand/10 blur-3xl pointer-events-none" />

            <h2 className="text-xl font-display font-black text-foreground mb-6 tracking-tight transition-colors duration-300">Order Summary</h2>
            <div className="space-y-4 text-sm font-bold text-foreground-secondary transition-colors duration-300">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="truncate pr-4 flex-1 text-foreground transition-colors duration-300">{item.product_details.name} <span className="text-foreground-secondary ml-1">×{item.quantity}</span></span>
                  <span className="text-foreground transition-colors duration-300">{fmt(item.subtotal)}</span>
                </div>
              ))}
              <div className="border-t border-border-subtle pt-6 mt-6 flex justify-between items-end">
                <span className="text-sm font-black uppercase tracking-widest text-foreground-secondary mb-1 transition-colors duration-300">Total</span>
                <span className="text-4xl font-display font-black text-foreground leading-none transition-colors duration-300">{fmt(total)}</span>
              </div>
            </div>

            <div className="mt-10 space-y-4 relative z-10">
              <AnimatePresence mode="wait">
                {step === 'cart' ? (
                  <motion.div key="checkout-btn" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <Button
                      id="proceed-to-checkout-btn"
                      variant="primary"
                      size="xl"
                      onClick={() => setStep('checkout')}
                      className="w-full shadow-lg gap-2 text-base font-bold"
                    >
                      Proceed to Checkout <ChevronRight className="h-5 w-5 shrink-0" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="place-order-btn" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <Button
                      id="place-order-btn"
                      variant="brand"
                      size="xl"
                      onClick={handlePlaceOrder}
                      isLoading={placing}
                      className="w-full shadow-lg shadow-brand/20 gap-2.5 text-base font-bold"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Place Order · {fmt(total)}</span>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Trust badges */}
            <div className="mt-8 pt-6 border-t border-border-subtle grid grid-cols-3 gap-2 text-center relative z-10 transition-colors duration-300">
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-surface-elevated flex items-center justify-center text-brand">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-foreground-secondary leading-tight">Secure<br />Pay</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-surface-elevated flex items-center justify-center text-info">
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-foreground-secondary leading-tight">Free<br />Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-surface-elevated flex items-center justify-center text-warning">
                  <Award className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-foreground-secondary leading-tight">Quality<br />Guar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Cart;
