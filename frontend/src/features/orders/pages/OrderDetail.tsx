import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { orderService } from '@/features/orders';
import { OrderStatusBadge, Button } from '@/components/ui';
import { ArrowLeft, MapPin, CreditCard, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Order } from '@/types';
import toast from 'react-hot-toast';

const STEPS = ['pending', 'processing', 'shipped', 'delivered'] as const;

const OrderDetail = () => {
  useSEO({ title: 'Order Details' });
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard/orders">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Orders
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {(order as any).order_number ?? `Order #${order.id}`}
          </h1>
          <p className="text-xs text-gray-400">{fmtDate(order.created_at)}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          {['pending', 'processing'].includes(order.status) && (
            <Button variant="outline" size="sm" isLoading={cancelling} onClick={handleCancel}
              className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700">
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
          className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-6 mb-5"
        >
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-5">Order Progress</h2>
          <div className="flex items-center">
            {STEPS.map((step, idx) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    idx <= currentStepIndex
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  }`}>
                    {idx < currentStepIndex ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[10px] font-medium capitalize whitespace-nowrap ${
                    idx <= currentStepIndex ? 'text-green-600 dark:text-green-500' : 'text-gray-400'
                  }`}>
                    {step}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${idx < currentStepIndex ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      )}

      {/* Order items */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-6 mb-5"
      >
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Items</h2>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.product_name ?? `Product #${item.product}`}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity} × {fmt(item.price_at_purchase ?? '0')}</p>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {fmt(String(item.quantity * parseFloat(item.price_at_purchase ?? '0')))}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3 flex justify-between font-bold text-gray-900 dark:text-white">
          <span>Total</span>
          <span>{fmt(order.total_amount)}</span>
        </div>
      </motion.div>

      {/* Delivery & Payment info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Delivery Address</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{order.delivery_address || 'N/A'}</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Payment</h3>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white uppercase">
            {(order as any).payment_method ?? 'COD'}
          </p>
        </div>
        {(order as any).notes && (
          <div className="sm:col-span-2 rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notes</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{(order as any).notes}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default OrderDetail;
