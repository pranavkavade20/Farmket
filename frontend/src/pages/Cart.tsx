import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/store/CartContext';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/Button';
import { useSEO } from '@/hooks/useSEO';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ChevronRight, ShieldCheck, Truck, Tag, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService, type PlaceOrderPayload } from '@/services/orderService';
import toast from 'react-hot-toast';

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
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Explore the marketplace and add fresh produce to your cart.
        </p>
        <Link to="/marketplace">
          <Button className="gap-2">
            <ShoppingBag className="h-4 w-4" /> Browse Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Step indicator */}
      <div className="flex items-center gap-0 text-sm mb-8 select-none">
        {/* Step 1 */}
        <button onClick={() => setStep('cart')} className="flex items-center gap-2 group">
          <span
            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step === 'cart'
                ? 'bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-green-900/40 scale-110'
                : 'bg-green-600 text-white opacity-70'
            }`}
          >
            1
          </span>
          <span className={`font-semibold transition-colors ${
            step === 'cart' ? 'text-green-600 dark:text-green-400' : 'text-green-600/70 dark:text-green-500/70'
          }`}>Cart</span>
        </button>
        {/* Connector */}
        <div className="relative mx-3 flex-1 max-w-[60px]">
          <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          <motion.div
            className="absolute inset-y-0 left-0 h-0.5 bg-green-500 rounded"
            initial={{ width: '0%' }}
            animate={{ width: step === 'checkout' ? '100%' : '0%' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
        {/* Step 2 */}
        <div className="flex items-center gap-2">
          <span
            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step === 'checkout'
                ? 'bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-green-900/40 scale-110'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
            }`}
          >
            2
          </span>
          <span className={`font-semibold transition-colors ${
            step === 'checkout' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
          }`}>Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — items / checkout form */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="wait">
            {step === 'cart' ? (
              <motion.div key="cart-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Your Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
                </h1>
                <div className="space-y-3">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-4"
                    >
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                        <img
                          src={
                            item.product_details.images.find((i) => i.is_primary)?.image ||
                            item.product_details.images[0]?.image ||
                            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&fit=crop'
                          }
                          alt={item.product_details.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                              {item.product_details.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              by {item.product_details.farmer_name}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {fmt(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link to="/marketplace" className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500 hover:underline">
                    <ArrowLeft className="h-4 w-4" /> Continue Shopping
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div key="checkout-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Checkout</h2>
                <div className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-6 space-y-5">
                  {/* Delivery Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your full delivery address"
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['cod', 'upi', 'online'] as PaymentMethod[]).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`rounded-xl border-2 py-3 px-4 text-sm font-semibold uppercase transition-all ${
                            paymentMethod === method
                              ? 'border-green-600 bg-green-50 text-green-700 dark:border-green-500 dark:bg-green-900/20 dark:text-green-400'
                              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                          }`}
                        >
                          {method === 'cod' ? 'Cash' : method.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Order Notes (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special instructions for the farmer…"
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setStep('cart')}
                  className="mt-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to cart
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — Order Summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span className="truncate pr-2">{item.product_details.name} ×{item.quantity}</span>
                  <span className="font-medium">{fmt(item.subtotal)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3 flex justify-between font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <AnimatePresence mode="wait">
                {step === 'cart' ? (
                  <motion.div key="checkout-btn" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <button
                      onClick={() => setStep('checkout')}
                      id="proceed-to-checkout-btn"
                      className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 text-white font-bold text-base shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 active:scale-[0.98]"
                    >
                      {/* Shimmer sweep */}
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                      <span className="relative flex items-center justify-center gap-3">
                        <span>Proceed to Checkout</span>
                        <motion.span
                          animate={{ x: [0, 4, 0] }}
                          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                          className="flex items-center"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </motion.span>
                      </span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="place-order-btn" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <button
                      id="place-order-btn"
                      onClick={handlePlaceOrder}
                      disabled={placing}
                      className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white font-bold text-base shadow-lg shadow-green-600/30 hover:shadow-green-600/50 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
                    >
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                      <span className="relative flex items-center justify-center gap-2">
                        {placing ? (
                          <>
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                            </svg>
                            <span>Placing Order…</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 opacity-80" />
                            <span>Place Order · {fmt(total)}</span>
                          </>
                        )}
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Trust badges */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="h-4 w-4 text-green-500" />
                <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">Free above ₹500</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Tag className="h-4 w-4 text-green-500" />
                <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">Best Price</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
