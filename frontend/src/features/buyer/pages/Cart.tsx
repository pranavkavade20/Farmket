import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/features/buyer';
import { useAuth } from '@/features/auth';
import { Button } from '@/components/ui';
import { useSEO } from '@/hooks';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ChevronRight, ShieldCheck, Truck, Tag, Lock, Award } from 'lucide-react';
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
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 min-h-screen">
      {/* Step indicator */}
      <div className="flex items-center gap-0 text-sm mb-12 select-none">
        {/* Step 1 */}
        <button onClick={() => setStep('cart')} className="flex items-center gap-3 group">
          <span
            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 ${
              step === 'cart'
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 dark:bg-white dark:text-gray-900 dark:shadow-gray-900/40 scale-110'
                : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            1
          </span>
          <span className={`font-black uppercase tracking-widest text-xs transition-colors ${
            step === 'cart' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
          }`}>Cart</span>
        </button>
        {/* Connector */}
        <div className="relative mx-6 flex-1 max-w-[80px]">
          <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full" />
          <motion.div
            className="absolute inset-y-0 left-0 h-1 bg-gray-900 dark:bg-white rounded-full"
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
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 dark:bg-white dark:text-gray-900 dark:shadow-gray-900/40 scale-110'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
            }`}
          >
            2
          </span>
          <span className={`font-black uppercase tracking-widest text-xs transition-colors ${
            step === 'checkout' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
          }`}>Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        {/* Left — items / checkout form */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {step === 'cart' ? (
              <motion.div key="cart-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">
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
                      className="flex gap-6 rounded-[2rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="h-28 w-28 flex-shrink-0 flex items-center justify-center rounded-[1.5rem] bg-[#F8F9FA] dark:bg-gray-900 p-3">
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
                            <p className="font-black text-xl text-gray-900 dark:text-white mb-1">
                              {item.product_details.name}
                            </p>
                            <p className="text-sm font-bold text-gray-400">
                              by {item.product_details.farmer_name}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3 rounded-full bg-gray-100 dark:bg-gray-800 p-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm hover:scale-105 transition-transform"
                            >
                              <Minus className="h-4 w-4 text-gray-900 dark:text-white" />
                            </button>
                            <span className="w-6 text-center text-base font-black text-gray-900 dark:text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm hover:scale-105 transition-transform"
                            >
                              <Plus className="h-4 w-4 text-gray-900 dark:text-white" />
                            </button>
                          </div>
                          <p className="text-2xl font-black text-gray-900 dark:text-white">
                            {fmt(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-8">
                  <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Continue Shopping
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div key="checkout-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Checkout</h2>
                <div className="rounded-[2.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 p-8 space-y-8 shadow-sm">
                  {/* Delivery Address */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                      Delivery Address *
                    </label>
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your full delivery address"
                      className="w-full rounded-[1.5rem] border-none bg-[#F8F9FA] dark:bg-gray-900 px-6 py-5 text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 transition-all resize-none"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
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
                              ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900 shadow-md scale-[1.02]'
                              : 'border-transparent bg-[#F8F9FA] text-gray-500 dark:bg-gray-900 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          {method === 'cod' ? 'Cash' : method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                      Order Notes (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special instructions for the farmer…"
                      className="w-full rounded-[1.5rem] border-none bg-[#F8F9FA] dark:bg-gray-900 px-6 py-5 text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 transition-all resize-none"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setStep('cart')}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to cart
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — Order Summary */}
        <div className="lg:sticky lg:top-32">
          <div className="rounded-[2.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 p-8 shadow-xl relative overflow-hidden">
            {/* Soft decorative glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-green-500/5 dark:bg-white/5 blur-3xl pointer-events-none" />
            
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Order Summary</h2>
            <div className="space-y-4 text-sm font-bold text-gray-500 dark:text-gray-400">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="truncate pr-4 flex-1 text-gray-700 dark:text-gray-300">{item.product_details.name} <span className="text-gray-400 dark:text-gray-500 ml-1">×{item.quantity}</span></span>
                  <span className="text-gray-900 dark:text-white">{fmt(item.subtotal)}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-6 flex justify-between items-end">
                <span className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Total</span>
                <span className="text-4xl font-black text-gray-900 dark:text-white leading-none">{fmt(total)}</span>
              </div>
            </div>
            
            <div className="mt-10 space-y-4 relative z-10">
              <AnimatePresence mode="wait">
                {step === 'cart' ? (
                  <motion.div key="checkout-btn" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <button
                      onClick={() => setStep('checkout')}
                      id="proceed-to-checkout-btn"
                      className="w-full h-16 rounded-full bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 font-black text-base transition-all hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-2"
                    >
                      Proceed to Checkout <ChevronRight className="h-5 w-5" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="place-order-btn" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <button
                      id="place-order-btn"
                      onClick={handlePlaceOrder}
                      disabled={placing}
                      className="w-full h-16 rounded-full bg-green-500 text-white hover:bg-green-400 font-black text-base transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-green-500/20 flex items-center justify-center gap-3 disabled:opacity-60 disabled:pointer-events-none disabled:scale-100"
                    >
                      {placing ? (
                        <>
                          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
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
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2 text-center relative z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-green-500 dark:text-green-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 leading-tight">Secure<br/>Pay</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-blue-500 dark:text-blue-400">
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 leading-tight">Free<br/>Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-yellow-500 dark:text-yellow-400">
                  <Award className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 leading-tight">Quality<br/>Guar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
