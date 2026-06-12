import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, authService } from '@/features/auth';
import { useSEO } from '@/hooks';
import { Button, OrderStatusBadge } from '@/components/ui';
import {
  Package, TrendingUp, Clock, ArrowRight, PlusCircle, User, ShoppingBag
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Order, DashboardStats } from '@/types';
import { orderService } from '@/features/orders';
import toast from 'react-hot-toast';

const StatCard: React.FC<{
  title: string; value: string; description: string;
  icon: React.ReactNode; color: string; delay?: number;
  loading?: boolean;
}> = ({ title, value, description, icon, color, delay = 0, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}
    className="rounded-2xl bg-surface border border-border-subtle p-6 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between mb-4">
      <p className="text-xs font-bold uppercase tracking-widest text-foreground-secondary">{title}</p>
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${color} shadow-sm text-white`}>
        {icon}
      </div>
    </div>
    {loading ? <div className="h-10 w-24 animate-pulse rounded-lg bg-border-strong" /> : <p className="text-3xl font-display font-bold text-foreground leading-none">{value}</p>}
    <p className="mt-3 text-sm font-medium text-foreground-secondary">{description}</p>
  </motion.div>
);

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
    <div className="mx-auto max-w-[1400px] w-full">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Welcome back, {user?.first_name || user?.username} 👋</h1>
          <p className="mt-2 text-base text-foreground-secondary">Here's what's happening with your farm store today.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/dashboard/products/new">
            <Button variant="primary" size="lg" className="rounded-full shadow-sm gap-2">
              <PlusCircle className="h-5 w-5" /> Add Product
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Orders" value={String(stats?.total_orders ?? 0)} description="Lifetime orders" icon={<ShoppingBag className="h-6 w-6" />} color="bg-gradient-to-br from-brand to-accent" delay={0} loading={statsLoading} />
        <StatCard title="Revenue" value={fmt(stats?.total_revenue ?? 0)} description="From delivered orders" icon={<TrendingUp className="h-6 w-6" />} color="bg-info" delay={0.05} loading={statsLoading} />
        <StatCard title="Products Listed" value={String(stats?.total_products ?? 0)} description="Active listings" icon={<Package className="h-6 w-6" />} color="bg-secondary" delay={0.1} loading={statsLoading} />
        <StatCard title="Pending Orders" value={String(stats?.pending_orders ?? 0)} description="Awaiting confirmation" icon={<Clock className="h-6 w-6" />} color="bg-warning" delay={0.15} loading={statsLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 rounded-2xl bg-surface border border-border-subtle shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle bg-surface-elevated">
            <h2 className="text-lg font-bold text-foreground">Recent Orders</h2>
            <Link to="/farmer/orders" className="text-sm font-semibold text-brand hover:text-brand-hover flex items-center gap-1.5 transition-colors">View all <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="divide-y divide-border-subtle flex-1">
            {ordersLoading ? [1, 2, 3, 4].map(i => <div key={i} className="flex items-center justify-between px-6 py-5"><div className="space-y-3"><div className="h-5 w-32 animate-pulse rounded-md bg-border-strong" /><div className="h-4 w-20 animate-pulse rounded-md bg-border-subtle" /></div><div className="h-6 w-24 animate-pulse rounded-full bg-border-strong" /></div>) : recentOrders.length === 0 ? <div className="px-6 py-16 text-center"><p className="text-base text-foreground-secondary mb-2">No orders yet.</p></div> : recentOrders.map(order => <Link to={`/farmer/orders/${order.id}`} key={order.id} className="group flex items-center justify-between px-6 py-5 hover:bg-state-hover transition-colors"><div><p className="text-base font-semibold text-foreground group-hover:text-brand transition-colors">{(order as any).order_number ?? `ORD-${String(order.id).padStart(4, '0')}`}</p><p className="text-sm text-foreground-secondary mt-1">{fmtDate(order.created_at)}</p></div><div className="flex items-center gap-4"><OrderStatusBadge status={order.status} /><span className="text-lg font-bold text-foreground">{fmt(order.total_amount)}</span></div></Link>)}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-2xl bg-surface border border-border-subtle shadow-sm p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground-secondary mb-8">Your Profile</h2>
          <div className="flex flex-col items-center text-center relative z-10">
            {user?.profile_picture ? <img src={user.profile_picture} alt={user.full_name} className="h-24 w-24 rounded-full object-cover shadow-md mb-5 border border-border-subtle" /> : <div className="h-24 w-24 rounded-full bg-brand-muted flex items-center justify-center text-brand text-3xl font-display font-bold shadow-inner mb-5 border border-brand/20">{(user?.first_name?.[0] ?? user?.username?.[0] ?? '?').toUpperCase()}</div>}
            <p className="text-xl font-display font-bold text-foreground">{user?.full_name || user?.username}</p>
            <p className="text-sm text-foreground-secondary mt-1">{user?.email}</p>
            <span className="mt-3 inline-flex items-center rounded-full bg-secondary-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-primary">{user?.user_type}</span>
          </div>
          <div className="mt-8 space-y-3 relative z-10">
            <Link to="/dashboard/profile" className="block"><Button variant="primary" className="w-full rounded-full gap-2"><User className="h-4 w-4" /> Edit Profile</Button></Link>
            <Link to="/dashboard/analytics" className="block"><Button variant="outline" className="w-full rounded-full gap-2"><TrendingUp className="h-4 w-4" /> View Analytics</Button></Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
