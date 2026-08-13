import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, authService } from '@/features/auth';
import { useSEO } from '@/hooks';
import { Button, OrderStatusBadge, Stack } from '@/components/ui';
import {
  Package, TrendingUp, Clock, ArrowRight, Sprout, ShoppingBag, Newspaper
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Order, DashboardStats } from '@/types';
import { orderService } from '@/features/orders';
import { toast } from "sonner";

const FarmerDashboard = () => {
  const { user } = useAuth();
  useSEO({ title: 'Farmer Dashboard', description: 'Manage your farm store and orders.' });

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    authService.getDashboardStats().then(setStats).catch(() => toast.error('Could not load dashboard stats')).finally(() => setStatsLoading(false));
    orderService.getOrders().then((res) => setRecentOrders(res.results.slice(0, 4))).catch(() => { }).finally(() => setOrdersLoading(false));
  }, []);

  const fmt = (n: string | number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(typeof n === 'string' ? parseFloat(n) : n);
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <Stack gap="lg" className="w-full pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
        <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">
          Welcome, <span className="text-foreground-secondary">{user?.first_name || user?.username}</span> 👋
        </h1>
        <p className="text-sm text-foreground-secondary">Manage your farm store, track crops, and fulfill orders.</p>
      </motion.div>

      {/* Top Section: Hero + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="lg:col-span-1 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-400 p-8 flex flex-col justify-between text-white shadow-md relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Sprout className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-display font-bold leading-tight mb-2 max-w-[200px]">
              Expand Your Reach
            </h2>
            <p className="text-blue-50 text-sm mb-6 max-w-[220px]">
              Add new harvests to the marketplace to attract more buyers today.
            </p>
          </div>
          <Link to="/dashboard/products/new" className="relative z-10 w-fit">
            <Button variant="primary" className="bg-gray-900 text-white hover:bg-black rounded-lg px-6 font-semibold shadow-sm border-0">
              Add Product
            </Button>
          </Link>
        </motion.div>

        {/* Quick Services Carousel-style container */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="lg:col-span-2 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Quick Services</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
            <Link to="/farmer/crops" className="rounded-xl border border-border-subtle bg-surface p-5 flex flex-col items-center justify-center text-center hover:border-brand transition-colors group shadow-sm">
              <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center mb-3 group-hover:bg-brand/20 transition-colors">
                <Sprout className="w-5 h-5 text-brand" />
              </div>
              <span className="text-sm font-semibold text-foreground">Crop Tracking</span>
            </Link>
            <Link to="/dashboard/analytics" className="rounded-xl border border-border-subtle bg-surface p-5 flex flex-col items-center justify-center text-center hover:border-accent-orange transition-colors group shadow-sm">
              <div className="h-12 w-12 rounded-full bg-accent-orange/10 flex items-center justify-center mb-3 group-hover:bg-accent-orange/20 transition-colors">
                <TrendingUp className="w-5 h-5 text-accent-orange" />
              </div>
              <span className="text-sm font-semibold text-foreground">Analytics</span>
            </Link>
            <Link to="/farmer/posts" className="rounded-xl border border-border-subtle bg-surface p-5 flex flex-col items-center justify-center text-center hover:border-info transition-colors group shadow-sm">
              <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center mb-3 group-hover:bg-info/20 transition-colors">
                <Newspaper className="w-5 h-5 text-info" />
              </div>
              <span className="text-sm font-semibold text-foreground">Community Posts</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Stats Overview */}
      <div className="flex flex-col gap-3 mt-4">
        <h3 className="text-sm font-bold text-foreground">Store Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: stats?.total_orders, icon: <ShoppingBag className="w-4 h-4 text-brand" />, loading: statsLoading },
            { label: 'Revenue', value: stats ? fmt(stats.total_revenue ?? 0) : null, icon: <TrendingUp className="w-4 h-4 text-info" />, loading: statsLoading },
            { label: 'Active Products', value: stats?.total_products, icon: <Package className="w-4 h-4 text-warning" />, loading: statsLoading },
            { label: 'Pending', value: stats?.pending_orders, icon: <Clock className="w-4 h-4 text-danger" />, loading: statsLoading },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i * 0.05) }} className="rounded-xl bg-surface border border-border-subtle p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground-secondary mb-1">{s.label}</p>
                {s.loading ? <div className="h-6 w-16 animate-pulse bg-border-strong rounded-md" /> : <p className="text-xl font-bold text-foreground">{s.value ?? 0}</p>}
              </div>
              <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border border-border-subtle shadow-sm">
                {s.icon}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Orders List */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Recent Orders</h3>
          <Link to="/farmer/orders" className="text-xs font-semibold text-brand hover:underline">View all</Link>
        </div>
        <div className="rounded-xl bg-surface border border-border-subtle shadow-sm overflow-hidden flex flex-col">
          <div className="divide-y divide-border-subtle">
            {ordersLoading ? [1, 2, 3].map(i => <div key={i} className="flex items-center justify-between px-5 py-4"><div className="space-y-2"><div className="h-4 w-32 animate-pulse rounded bg-border-strong" /><div className="h-3 w-20 animate-pulse rounded bg-border-subtle" /></div><div className="h-6 w-20 animate-pulse rounded-full bg-border-strong" /></div>) : recentOrders.length === 0 ? <div className="px-5 py-10 text-center"><p className="text-sm text-foreground-secondary">No orders yet.</p></div> : recentOrders.map(order => (
              <Link to={`/farmer/orders/${order.id}`} key={order.id} className="group flex items-center justify-between px-5 py-4 hover:bg-state-hover transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-background border border-border-subtle flex items-center justify-center text-foreground-secondary group-hover:text-brand transition-colors shadow-sm">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-brand transition-colors">{((order as unknown) as { order_number?: string }).order_number ?? `ORD-${String(order.id).padStart(4, '0')}`}</p>
                    <p className="text-xs text-foreground-secondary mt-0.5">{fmtDate(order.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:block"><OrderStatusBadge status={order.status} /></div>
                  <span className="text-sm font-bold text-foreground w-20 text-right">{fmt(order.total_amount)}</span>
                  <ArrowRight className="w-4 h-4 text-border-strong group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </Stack>
  );
};

export default FarmerDashboard;
