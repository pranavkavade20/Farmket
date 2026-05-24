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
    className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-6 shadow-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
    </div>
    {loading ? (
      <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
    ) : (
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    )}
    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.first_name || user?.username} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Here's what's happening with your {isFarmer ? 'farm store' : 'orders'} today.
          </p>
        </div>
        <div className="flex gap-3">
          {isFarmer && (
            <Link to="/dashboard/products/new">
              <Button size="sm" className="gap-2">
                <PlusCircle className="h-4 w-4" /> Add Product
              </Button>
            </Link>
          )}
          <Link to="/marketplace">
            <Button variant="outline" size="sm" className="gap-2">
              <ShoppingBag className="h-4 w-4" /> Marketplace
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard
          title="Total Orders"
          value={String(stats?.total_orders ?? 0)}
          description="Lifetime orders"
          icon={<ShoppingBag className="h-5 w-5 text-white" />}
          color="bg-green-500"
          delay={0}
          loading={statsLoading}
        />
        {isFarmer && (
          <StatCard
            title="Revenue"
            value={fmt(stats?.total_revenue ?? 0)}
            description="From delivered orders"
            icon={<TrendingUp className="h-5 w-5 text-white" />}
            color="bg-blue-500"
            delay={0.05}
            loading={statsLoading}
          />
        )}
        {isFarmer && (
          <StatCard
            title="Products Listed"
            value={String(stats?.total_products ?? 0)}
            description="Active listings"
            icon={<Package className="h-5 w-5 text-white" />}
            color="bg-purple-500"
            delay={0.1}
            loading={statsLoading}
          />
        )}
        <StatCard
          title="Pending Orders"
          value={String(stats?.pending_orders ?? 0)}
          description="Awaiting confirmation"
          icon={<Clock className="h-5 w-5 text-white" />}
          color="bg-amber-500"
          delay={0.15}
          loading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <Link to="/dashboard/orders" className="text-xs font-medium text-green-600 dark:text-green-500 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {ordersLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
                  <div className="space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-3 w-16 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
                  </div>
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              ))
            ) : recentOrders.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-gray-400">
                No orders yet.{' '}
                <Link to="/marketplace" className="text-green-600 hover:underline">Shop now →</Link>
              </div>
            ) : (
              recentOrders.map((order) => (
                <Link
                  to={`/dashboard/orders/${order.id}`}
                  key={order.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {(order as any).order_number ?? `ORD-${String(order.id).padStart(4, '0')}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <OrderStatusBadge status={order.status} />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{fmt(order.total_amount)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm p-6"
        >
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Your Profile</h2>
          <div className="flex flex-col items-center text-center">
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt={user.full_name} className="h-20 w-20 rounded-full object-cover shadow-lg mb-3" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-3">
                {(user?.first_name?.[0] ?? user?.username?.[0] ?? '?').toUpperCase()}
              </div>
            )}
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{user?.full_name || user?.username}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <span className="mt-2 inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400 capitalize">
              {user?.user_type ?? 'buyer'}
            </span>
          </div>
          <div className="mt-6 space-y-3">
            <Link to="/dashboard/profile">
              <Button variant="outline" className="w-full gap-2" size="sm">
                <User className="h-4 w-4" /> Edit Profile
              </Button>
            </Link>
            {isFarmer ? (
              <Link to="/dashboard/analytics">
                <Button variant="ghost" className="w-full gap-2" size="sm">
                  <TrendingUp className="h-4 w-4" /> View Analytics
                </Button>
              </Link>
            ) : (
              <Link to="/marketplace">
                <Button variant="ghost" className="w-full gap-2" size="sm">
                  <Star className="h-4 w-4" /> Browse Products
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
