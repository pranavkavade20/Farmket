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
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-border-strong" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] pb-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">My Orders</h1>
          <p className="text-sm font-semibold text-foreground-secondary mt-1 uppercase tracking-widest">
            {orders.length} order{orders.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link to="/marketplace">
          <Button variant="outline" className="rounded-full px-6 gap-2">
            <ShoppingBag className="h-4 w-4" /> Shop More
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-24 text-center rounded-3xl bg-surface border border-border-subtle shadow-sm"
        >
          <div className="h-24 w-24 rounded-full bg-surface-elevated border border-border-subtle flex items-center justify-center mb-6">
            <Package className="h-10 w-10 text-foreground-secondary" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-3">No orders yet</h2>
          <p className="text-sm text-foreground-secondary mb-8 max-w-sm">
            Your orders will appear here once you make a purchase.
          </p>
          <Link to="/marketplace">
            <Button variant="primary" size="lg" className="rounded-full px-8 gap-2">
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
              className="group rounded-2xl bg-surface border border-border-subtle p-6 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-lg font-bold text-foreground group-hover:text-brand transition-colors">
                    {(order as any).order_number ?? `ORD-${String(order.id).padStart(4, '0')}`}
                  </p>
                  <p className="text-xs font-semibold text-foreground-secondary mt-1 uppercase tracking-widest">{fmtDate(order.created_at)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="pt-5 border-t border-border-subtle flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground-secondary">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xl font-display font-bold text-foreground mt-1">{fmt(order.total_amount)}</p>
                </div>
                <Link to={`/dashboard/orders/${order.id}`}>
                  <Button variant="outline" className="rounded-full px-5 gap-2 group-hover:bg-brand group-hover:text-brand-foreground group-hover:border-brand transition-all">
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
