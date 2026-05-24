import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, authService } from '@/features/auth';
import { useSEO } from '@/hooks';
import { Button, OrderStatusBadge } from '@/components/ui';
import {
  ShoppingBag, Package, TrendingUp, Clock,
  ArrowRight, PlusCircle, User, Star,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Order, DashboardStats } from '@/types';
import { orderService } from '@/features/orders';
import toast from 'react-hot-toast';

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  title: string; value: string; description: string;
  icon: React.ReactNode; color: string; delay?: number;
  loading?: boolean;
}> = ({ title, value, description, icon, color, delay = 0, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="rounded-[2.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 p-8 shadow-sm hover:shadow-xl transition-shadow"
  >
    <div className="flex items-center justify-between mb-6">
      <p className="text-xs font-black uppercase tracking-widest text-gray-400">{title}</p>
      <div className={`inline-flex h-14 w-14 items-center justify-center rounded-[1.25rem] ${color} shadow-sm`}>
        {icon}
      </div>
    </div>
    {loading ? (
      <div className="h-10 w-24 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
    ) : (
      <p className="text-4xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
    )}
    <p className="mt-4 text-sm font-bold text-gray-500 dark:text-gray-400">{description}</p>
  </motion.div>
);

// ── Dashboard Page ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  useSEO({ title: 'Dashboard', description: 'Manage your Farmket account and orders.' });

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const isFarmer = user?.user_type === 'farmer';

  useEffect(() => {
    authService.getDashboardStats()
      .then(setStats)
      .catch(() => toast.error('Could not load dashboard stats'))
      .finally(() => setStatsLoading(false));

    orderService.getOrders()
      .then((res) => setRecentOrders(res.results.slice(0, 4)))
      .catch(() => { /* silent */ })
      .finally(() => setOrdersLoading(false));
  }, []);

  const fmt = (n: string | number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      typeof n === 'string' ? parseFloat(n) : n
    );
  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="mx-auto max-w-[1400px] w-full pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
      >
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Welcome back, {user?.first_name || user?.username} 👋
          </h1>
          <p className="mt-2 text-base font-bold text-gray-500 dark:text-gray-400">
            Here's what's happening with your {isFarmer ? 'farm store' : 'orders'} today.
          </p>
        </div>
        <div className="flex gap-4">
          {isFarmer && (
            <Link to="/dashboard/products/new">
              <Button size="lg" className="h-14 rounded-full font-black text-sm px-6 shadow-xl gap-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:scale-105 transition-transform">
                <PlusCircle className="h-5 w-5" /> Add Product
              </Button>
            </Link>
          )}
          <Link to="/marketplace">
            <Button variant="outline" size="lg" className="h-14 rounded-full font-black text-sm px-6 shadow-sm gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <ShoppingBag className="h-5 w-5" /> Marketplace
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          title="Total Orders"
          value={String(stats?.total_orders ?? 0)}
          description="Lifetime orders"
          icon={<ShoppingBag className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-green-400 to-green-600"
          delay={0}
          loading={statsLoading}
        />
        {isFarmer && (
          <StatCard
            title="Revenue"
            value={fmt(stats?.total_revenue ?? 0)}
            description="From delivered orders"
            icon={<TrendingUp className="h-6 w-6 text-white" />}
            color="bg-gradient-to-br from-blue-400 to-blue-600"
            delay={0.05}
            loading={statsLoading}
          />
        )}
        {isFarmer && (
          <StatCard
            title="Products Listed"
            value={String(stats?.total_products ?? 0)}
            description="Active listings"
            icon={<Package className="h-6 w-6 text-white" />}
            color="bg-gradient-to-br from-purple-400 to-purple-600"
            delay={0.1}
            loading={statsLoading}
          />
        )}
        <StatCard
          title="Pending Orders"
          value={String(stats?.pending_orders ?? 0)}
          description="Awaiting confirmation"
          icon={<Clock className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-amber-400 to-amber-600"
          delay={0.15}
          loading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-[2.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-8 py-8 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Recent Orders</h2>
            <Link to="/dashboard/orders" className="text-sm font-black text-gray-500 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 flex-1">
            {ordersLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between px-8 py-6">
                  <div className="space-y-3">
                    <div className="h-5 w-32 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
                    <div className="h-4 w-20 animate-pulse rounded-full bg-gray-100 dark:bg-gray-700" />
                  </div>
                  <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
                </div>
              ))
            ) : recentOrders.length === 0 ? (
              <div className="px-8 py-16 text-center">
                <p className="text-base font-bold text-gray-400 mb-2">No orders yet.</p>
                <Link to="/marketplace" className="text-gray-900 dark:text-white font-black hover:underline uppercase tracking-widest text-sm">Shop now →</Link>
              </div>
            ) : (
              recentOrders.map((order) => (
                <Link
                  to={`/dashboard/orders/${order.id}`}
                  key={order.id}
                  className="group flex items-center justify-between px-8 py-6 hover:bg-[#F8F9FA] dark:hover:bg-gray-900 transition-colors"
                >
                  <div>
                    <p className="text-base font-black text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {(order as any).order_number ?? `ORD-${String(order.id).padStart(4, '0')}`}
                    </p>
                    <p className="text-sm font-bold text-gray-400 mt-1">{fmtDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <OrderStatusBadge status={order.status} />
                    <span className="text-xl font-black text-gray-900 dark:text-white">{fmt(order.total_amount)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-[2.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 shadow-sm p-10 relative overflow-hidden"
        >
          {/* Soft decorative glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-green-500/10 dark:bg-white/5 blur-3xl pointer-events-none" />
            
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8">Your Profile</h2>
          <div className="flex flex-col items-center text-center relative z-10">
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt={user.full_name} className="h-28 w-28 rounded-[2rem] object-cover shadow-xl mb-6 ring-4 ring-gray-50 dark:ring-white/10" />
            ) : (
              <div className="h-28 w-28 rounded-[2rem] bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-4xl font-black shadow-xl mb-6 ring-4 ring-gray-50 dark:ring-white/10">
                {(user?.first_name?.[0] ?? user?.username?.[0] ?? '?').toUpperCase()}
              </div>
            )}
            <p className="text-2xl font-black text-gray-900 dark:text-white">{user?.full_name || user?.username}</p>
            <p className="text-sm font-bold text-gray-400 mt-1">{user?.email}</p>
            <span className="mt-4 inline-flex items-center rounded-full bg-gray-100 dark:bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-gray-600 dark:text-white backdrop-blur-md border border-gray-200 dark:border-white/10">
              {user?.user_type ?? 'buyer'}
            </span>
          </div>
          
          <div className="mt-10 space-y-4 relative z-10">
            <Link to="/dashboard/profile" className="block">
              <button className="w-full h-14 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-xl">
                <User className="h-4 w-4" /> Edit Profile
              </button>
            </Link>
            {isFarmer ? (
              <Link to="/dashboard/analytics" className="block">
                <button className="w-full h-14 rounded-full bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors backdrop-blur-md">
                  <TrendingUp className="h-4 w-4" /> View Analytics
                </button>
              </Link>
            ) : (
              <Link to="/marketplace" className="block">
                <button className="w-full h-14 rounded-full bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors backdrop-blur-md">
                  <Star className="h-4 w-4" /> Browse Products
                </button>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
