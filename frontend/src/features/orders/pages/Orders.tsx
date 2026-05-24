import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { orderService } from '@/features/orders';
import { OrderStatusBadge, Button } from '@/components/ui';
import { ShoppingBag, Package, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Order } from '@/types';
import toast from 'react-hot-toast';

const Orders = () => {
  useSEO({ title: 'My Orders', description: 'Track your Farmket orders and order history.' });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getOrders()
      .then((res) => setOrders(res.results))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: string) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(parseFloat(n));

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {orders.length} order{orders.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link to="/marketplace">
          <Button variant="outline" size="sm" className="gap-2">
            <ShoppingBag className="h-4 w-4" /> Shop More
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-24 text-center"
        >
          <Package className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
            Your orders will appear here once you make a purchase.
          </p>
          <Link to="/marketplace">
            <Button className="gap-2">
              <ShoppingBag className="h-4 w-4" /> Start Shopping
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{(order as any).order_number ?? `ORD-${String(order.id).padStart(4, '0')}`}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmtDate(order.created_at)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white mt-0.5">{fmt(order.total_amount)}</p>
                </div>
                <Link to={`/dashboard/orders/${order.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    View <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
