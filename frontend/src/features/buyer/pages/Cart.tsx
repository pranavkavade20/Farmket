import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import { Button } from '@/components/ui';
import { useSEO } from '@/hooks';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ChevronRight, ShieldCheck, Truck,  Lock, Award } from 'lucide-react';
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
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];
  // Calculate total in real time from the current items array
  const total = items.reduce((sum, item) => sum + parseFloat(String(item.subtotal)), 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-foreground-secondary mb-4 transition-colors duration-300" />
        <h1 className="text-2xl font-bold text-foreground mb-2 transition-colors duration-300">Your cart is empty</h1>
        <p className="text-foreground-secondary mb-6 transition-colors duration-300">
          Explore the marketplace and add fresh produce to your cart.
        </p>
        <Link to="/marketplace">
          <Button className="gap-2 rounded-full">
            <ShoppingBag className="h-4 w-4" /> Browse Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 min-h-screen">
      {/* Step indicator */}
      <div className="flex items-center gap-0 text-sm mb-12 select-none">
        {/* Step 1 */}
        <button onClick={() => setStep('cart')} className="flex items-center gap-3 group">
          <span
            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 ${
              step === 'cart'
                ? 'bg-foreground text-background shadow-lg scale-110'
                : 'bg-surface-elevated text-foreground-secondary'
            }`}
          >
            1
          </span>
          <span className={`font-black uppercase tracking-widest text-xs transition-colors ${
            step === 'cart' ? 'text-foreground' : 'text-foreground-secondary'
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
            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 ${
              step === 'checkout'
                ? 'bg-foreground text-background shadow-lg scale-110'
                : 'bg-surface-elevated text-foreground-secondary'
            }`}
          >
            2
          </span>
          <span className={`font-black uppercase tracking-widest text-xs transition-colors ${
            step === 'checkout' ? 'text-foreground' : 'text-foreground-secondary'
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
                            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&fit=crop'
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
                          <button
                            onClick={() => removeItem(item.id)}
                            className="h-10 w-10 rounded-full bg-surface-elevated flex items-center justify-center text-foreground-secondary hover:text-danger hover:bg-danger-subtle transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3 rounded-full bg-surface-elevated p-1 transition-colors duration-300">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 rounded-full flex items-center justify-center bg-surface shadow-sm hover:scale-105 transition-transform"
                            >
                              <Minus className="h-4 w-4 text-foreground" />
                            </button>
                            <span className="w-6 text-center text-base font-black text-foreground transition-colors duration-300">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 rounded-full flex items-center justify-center bg-surface shadow-sm hover:scale-105 transition-transform"
                            >
                              <Plus className="h-4 w-4 text-foreground" />
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
                  <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm font-bold text-foreground-secondary hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Continue Shopping
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
                    <div className="grid grid-cols-3 gap-4">
                      {(['cod', 'upi', 'online'] as PaymentMethod[]).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`rounded-[1.5rem] border-2 py-4 px-4 text-sm font-black uppercase tracking-widest transition-all ${
                            paymentMethod === method
                              ? 'border-brand bg-brand text-brand-foreground shadow-md scale-[1.02]'
                              : 'border-transparent bg-surface-elevated text-foreground-secondary hover:bg-state-hover'
                          }`}
                        >
                          {method === 'cod' ? 'Cash' : method}
                        </button>
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
                <button
                  onClick={() => setStep('cart')}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-foreground-secondary hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to cart
                </button>
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
                    <button
                      onClick={() => setStep('checkout')}
                      id="proceed-to-checkout-btn"
                      className="w-full h-16 rounded-full px-6 whitespace-nowrap bg-foreground text-background hover:bg-foreground/90 font-bold text-base transition-all hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-2"
                    >
                      Proceed to Checkout <ChevronRight className="h-5 w-5 shrink-0" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="place-order-btn" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <button
                      id="place-order-btn"
                      onClick={handlePlaceOrder}
                      disabled={placing}
                      className="w-full h-16 rounded-full px-6 whitespace-nowrap bg-brand text-brand-foreground hover:bg-brand-hover font-bold text-base transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-brand/20 flex items-center justify-center gap-3 disabled:opacity-60 disabled:pointer-events-none disabled:scale-100"
                    >
                      {placing ? (
                        <>
                          <svg className="h-5 w-5 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                          </svg>
                          <span>Placing Order…</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          <span>Place Order · {fmt(total)}</span>
                        </>
                      )}
                    </button>
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
                <span className="text-[10px] uppercase tracking-widest font-bold text-foreground-secondary leading-tight">Secure<br/>Pay</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-surface-elevated flex items-center justify-center text-info">
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-foreground-secondary leading-tight">Free<br/>Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-surface-elevated flex items-center justify-center text-warning">
                  <Award className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-foreground-secondary leading-tight">Quality<br/>Guar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
