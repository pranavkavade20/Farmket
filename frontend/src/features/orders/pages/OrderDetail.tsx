import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { orderService } from '@/features/orders';
import { OrderStatusBadge, Button } from '@/components/ui';
import { ArrowLeft, MapPin, CreditCard, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Order } from '@/types';
import toast from 'react-hot-toast';
import { useAuth } from '@/features/auth';

const STEPS = ['pending', 'processing', 'shipped', 'delivered'] as const;

const OrderDetail = () => {
  useSEO({ title: 'Order Details' });
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    orderService
      .getOrder(Number(id))
      .then(setOrder)
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const updated = await orderService.cancelOrder(order.id);
      setOrder(updated);
      toast.success('Order cancelled');
    } catch {
      toast.error('Cannot cancel this order');
    } finally {
      setCancelling(false);
    }
  };

  const handleItemTransition = async (itemId: number, newStatus: string) => {
    setUpdatingItem(itemId);
    try {
      await orderService.updateItemStatus(itemId, newStatus);
      const updated = await orderService.getOrder(Number(id!));
      setOrder(updated);
      toast.success('Status updated');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingItem(null);
    }
  };

  const fmt = (n: string) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(parseFloat(n));

  const fmtDate = (s: string) =>
    new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const currentStepIndex = order ? STEPS.indexOf(order.status as typeof STEPS[number]) : -1;

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 animate-pulse space-y-4">
        <div className="h-8 w-48 rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-48 rounded-2xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-48 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Order not found</h2>
        <Link to="/dashboard/orders"><Button variant="outline">Back to Orders</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] pb-10">
      <div className="flex items-center gap-6 mb-12">
        <Link to="/dashboard/orders">
          <button className="h-12 w-12 rounded-full bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:shadow-md hover:scale-105 transition-all">
            <ArrowLeft className="h-5 w-5 text-gray-900 dark:text-white" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {(order as any).order_number ?? `Order #${order.id}`}
          </h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">{fmtDate(order.created_at)}</p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <OrderStatusBadge status={order.status} />
          {['pending', 'processing'].includes(order.status) && (
            <Button variant="outline" isLoading={cancelling} onClick={handleCancel}
              className="h-10 rounded-full px-5 text-xs font-black tracking-widest uppercase border-2 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950/30">
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Progress tracker */}
      {order.status !== 'cancelled' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 p-8 mb-6 shadow-sm"
        >
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8">Order Progress</h2>
          <div className="flex items-center px-4">
            {STEPS.map((step, idx) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-3 relative z-10">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-black transition-all shadow-sm ${
                    idx <= currentStepIndex
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 scale-110'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {idx < currentStepIndex ? '✓' : idx + 1}
                  </div>
                  <span className={`absolute -bottom-8 text-[11px] font-black uppercase tracking-widest whitespace-nowrap ${
                    idx <= currentStepIndex ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                  }`}>
                    {step}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 h-1.5 mx-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <motion.div 
                       className="h-full bg-gray-900 dark:bg-white"
                       initial={{ width: '0%' }}
                       animate={{ width: idx < currentStepIndex ? '100%' : '0%' }}
                       transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="h-10" /> {/* Spacer for absolute labels */}
        </motion.div>
      )}

      {/* Order items */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-[2.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 p-8 mb-6 shadow-sm"
      >
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Items</h2>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-5">
              <div>
                <p className="text-base font-black text-gray-900 dark:text-white">{item.product_name ?? `Product #${item.product}`}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 mb-3">Qty: {item.quantity} × {fmt(item.price_at_purchase ?? '0')}</p>
                
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={item.status as any} />
                  
                  {user?.user_type === 'farmer' && item.status === 'pending' && (
                    <Button size="sm" onClick={() => handleItemTransition(item.id, 'processing')} isLoading={updatingItem === item.id} className="h-8 text-[10px]">Accept & Process</Button>
                  )}
                  {user?.user_type === 'farmer' && item.status === 'processing' && (
                    <Button size="sm" onClick={() => handleItemTransition(item.id, 'shipped')} isLoading={updatingItem === item.id} className="h-8 text-[10px]">Mark Shipped</Button>
                  )}
                  {user?.user_type === 'buyer' && item.status === 'shipped' && (
                    <Button size="sm" onClick={() => handleItemTransition(item.id, 'delivered')} isLoading={updatingItem === item.id} className="h-8 text-[10px] bg-green-600 hover:bg-green-700 text-white">Confirm Delivery</Button>
                  )}
                </div>
              </div>
              <p className="text-lg font-black text-gray-900 dark:text-white">
                {fmt(String(item.quantity * parseFloat(item.price_at_purchase ?? '0')))}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-800 pt-6 mt-2 flex justify-between items-center">
          <span className="text-sm font-black uppercase tracking-widest text-gray-500">Total</span>
          <span className="text-3xl font-black text-gray-900 dark:text-white">{fmt(order.total_amount)}</span>
        </div>
      </motion.div>

      {/* Delivery & Payment info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="rounded-[2.5rem] bg-[#F8F9FA] dark:bg-gray-900/50 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
              <MapPin className="h-5 w-5 text-gray-900 dark:text-white" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Delivery Address</h3>
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">{order.delivery_address || 'N/A'}</p>
        </div>
        <div className="rounded-[2.5rem] bg-[#F8F9FA] dark:bg-gray-900/50 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
              <CreditCard className="h-5 w-5 text-gray-900 dark:text-white" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Payment Method</h3>
          </div>
          <p className="text-xl font-black text-gray-900 dark:text-white uppercase">
            {(order as any).payment_method ?? 'COD'}
          </p>
        </div>
        {(order as any).notes && (
          <div className="md:col-span-2 rounded-[2.5rem] bg-[#F8F9FA] dark:bg-gray-900/50 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                <FileText className="h-5 w-5 text-gray-900 dark:text-white" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Notes</h3>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">{(order as any).notes}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default OrderDetail;
