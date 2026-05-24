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
    <div className="mx-auto max-w-[1000px] pb-10">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">My Orders</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">
            {orders.length} order{orders.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link to="/marketplace">
          <Button variant="outline" className="h-12 rounded-full px-6 font-black gap-2 shadow-sm border-2 hover:bg-gray-50 dark:hover:bg-gray-800">
            <ShoppingBag className="h-4 w-4" /> Shop More
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-32 text-center rounded-[3rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <div className="h-24 w-24 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-6">
            <Package className="h-10 w-10 text-gray-400 dark:text-gray-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">No orders yet</h2>
          <p className="text-sm font-bold text-gray-400 mb-8 max-w-sm">
            Your orders will appear here once you make a purchase.
          </p>
          <Link to="/marketplace">
            <Button className="h-14 rounded-full px-8 font-black gap-2 shadow-xl bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 hover:scale-105 transition-transform">
              <ShoppingBag className="h-5 w-5" /> Start Shopping
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-[2rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 p-8 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-lg font-black text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {(order as any).order_number ?? `ORD-${String(order.id).padStart(4, '0')}`}
                  </p>
                  <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{fmtDate(order.created_at)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{fmt(order.total_amount)}</p>
                </div>
                <Link to={`/dashboard/orders/${order.id}`}>
                  <Button variant="outline" className="h-12 rounded-full px-6 font-black gap-2 shadow-sm border-2 group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 dark:group-hover:bg-white dark:group-hover:text-gray-900 transition-all">
                    View Details <ArrowRight className="h-4 w-4" />
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
