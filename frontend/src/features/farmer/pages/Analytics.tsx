import { useState, useEffect } from 'react';
import { useSEO } from '@/hooks';
import { useAuth } from '@/features/auth';
import { analyticsService, type FarmerAnalyticsData } from '@/features/farmer';
import { Button, OrderStatusBadge, Badge, EmptyState } from '@/components/ui';
import { Link } from 'react-router-dom';
import {
  TrendingUp, ShoppingBag, Package, Star, Eye, IndianRupee,
  ArrowUpRight, Calendar, PlusCircle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';
import { motion } from 'framer-motion';
import { toast } from "sonner";

/* eslint-disable @typescript-eslint/no-explicit-any */

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4'];

const Analytics = () => {
  useSEO({ title: 'Analytics', description: 'Track your farm store performance.' });
  const { user } = useAuth();
  const [data, setData] = useState<FarmerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.user_type !== 'farmer') return;
    analyticsService
      .getFarmerAnalytics()
      .then(setData)
      .catch(() => toast.error('Failed to load analytics data'))
      .finally(() => setLoading(false));
  }, [user]);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  if (user?.user_type !== 'farmer') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <EmptyState
          icon={<TrendingUp className="h-10 w-10 text-muted" />}
          title="Analytics for Farmers"
          description="Analytics are available only for farmer accounts."
          action={{
            label: "Go to Dashboard",
            onClick: () => window.location.href = "/dashboard"
          }}
        />
      </div>
    );
  }

  const kpis = data?.kpis;

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">Analytics</h1>
          <p className="text-sm font-medium text-foreground-secondary mt-1">Your farm store performance overview</p>
        </div>
        <Link to="/dashboard/products/new">
          <Button variant="primary" className="gap-2">
            <PlusCircle className="h-5 w-5" /> Add Product
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: 'Total Revenue', icon: <IndianRupee className="h-5 w-5 text-brand" />, bg: 'bg-brand/10',
            value: loading ? '—' : fmt(kpis?.total_revenue ?? 0), sub: 'From delivered orders',
          },
          {
            label: 'Total Orders', icon: <ShoppingBag className="h-5 w-5 text-info" />, bg: 'bg-info/10',
            value: loading ? '—' : String(kpis?.total_orders ?? 0), sub: `${kpis?.pending_orders ?? 0} pending`,
          },
          {
            label: 'Products Listed', icon: <Package className="h-5 w-5 text-warning" />, bg: 'bg-warning/10',
            value: loading ? '—' : String(kpis?.total_products ?? 0), sub: `${kpis?.active_products ?? 0} active`,
          },
          {
            label: 'Avg Rating', icon: <Star className="h-5 w-5 text-amber-500" />, bg: 'bg-amber-500/10',
            value: loading ? '—' : `${kpis?.avg_rating ?? '—'} ★`, sub: `${kpis?.total_reviews ?? 0} reviews`,
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl bg-surface border border-border-subtle p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-foreground-secondary">{kpi.label}</span>
              <div className={`h-11 w-11 rounded-xl ${kpi.bg} flex items-center justify-center`}>{kpi.icon}</div>
            </div>
            {loading ? (
              <div className="h-8 w-24 animate-pulse rounded-md bg-border-subtle mb-2" />
            ) : (
              <p className="text-2xl lg:text-3xl font-bold text-foreground leading-none mb-2">{kpi.value}</p>
            )}
            <div className="flex items-center gap-1 text-xs text-foreground-secondary font-medium">
              <ArrowUpRight className="h-3.5 w-3.5 text-brand" />
              {kpi.sub}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-2xl bg-surface border border-border-subtle p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground tracking-tight">Revenue Trend</h2>
            <span className="flex items-center gap-2 text-xs font-semibold text-foreground-secondary"><Calendar className="h-4 w-4" /> Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data?.revenue_trend ?? []}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 500, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontWeight: 500, fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [`₹${v}`, 'Revenue']} contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', borderRadius: '0.75rem', color: 'var(--color-foreground)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fill="url(#revenueGrad)" activeDot={{ r: 6, fill: '#10B981' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl bg-surface border border-border-subtle p-6 shadow-sm flex flex-col"
        >
          <h2 className="text-lg font-bold text-foreground mb-6 tracking-tight">Products by Category</h2>
          {(data?.category_distribution?.length ?? 0) > 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data!.category_distribution}
                    cx="50%" cy="50%"
                    innerRadius={65} outerRadius={95}
                    paddingAngle={6} dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {data!.category_distribution.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', borderRadius: '0.75rem', color: 'var(--color-foreground)' }} cursor={{ fill: 'transparent' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm font-medium text-foreground-secondary">
              {loading ? 'Loading…' : 'No products listed'}
            </div>
          )}
        </motion.div>
      </div>

      {/* Orders Trend */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27 }}
        className="rounded-2xl bg-surface border border-border-subtle p-6 shadow-sm"
      >
        <h2 className="text-lg font-bold text-foreground mb-6 tracking-tight">Orders Trend</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data?.orders_trend ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 500, fill: '#888' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fontWeight: 500, fill: '#888' }} allowDecimals={false} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', borderRadius: '0.75rem', color: 'var(--color-foreground)' }} />
            <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={3} dot={{ r: 5, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Products by Views */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl bg-surface border border-border-subtle p-6 shadow-sm"
      >
        <h2 className="text-lg font-bold text-foreground mb-6 tracking-tight">Top Products by Views</h2>
        {(data?.top_products?.length ?? 0) > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data!.top_products} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fontWeight: 500, fill: '#888' }}
                tickFormatter={(v: string) => v.length > 12 ? v.slice(0, 12) + '…' : v}
                axisLine={false} tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fontWeight: 500, fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', borderRadius: '0.75rem', color: 'var(--color-foreground)' }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="views" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[260px] items-center justify-center text-sm font-medium text-foreground-secondary">
            {loading ? 'Loading…' : 'No data available'}
          </div>
        )}
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="rounded-2xl bg-surface border border-border-subtle overflow-hidden shadow-sm"
      >
        <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground tracking-tight">Top Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-elevated text-left">
                <th className="px-6 py-3.5 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Product</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Price</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Views</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5].map((j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-5 animate-pulse rounded bg-border-subtle" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (data?.top_products?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-sm font-medium text-foreground-secondary mb-3">No products yet.</p>
                    <Link to="/dashboard/products/new">
                      <Button variant="brand" size="sm">Add your first product</Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                data!.top_products.map((p, i) => (
                  <tr key={i} className="hover:bg-state-hover transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground truncate max-w-[200px]">{p.name}</td>
                    <td className="px-6 py-4 font-medium text-foreground">₹{parseFloat(p.price).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-foreground-secondary">{p.stock_quantity}</td>
                    <td className="px-6 py-4 text-foreground-secondary">
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4 text-muted" /> {p.views}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={p.is_available ? 'success' : 'default'} size="sm">
                        {p.is_available ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Recent Orders */}
      {(data?.recent_orders?.length ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl bg-surface border border-border-subtle overflow-hidden shadow-sm"
        >
          <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground tracking-tight">Recent Orders</h2>
            <Link to="/dashboard/orders" className="text-xs font-semibold text-brand hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-border-subtle">
            {data!.recent_orders.map((order) => (
              <Link
                key={order.id}
                to={`/dashboard/orders/${order.id}`}
                className="group flex items-center justify-between px-6 py-4 hover:bg-state-hover transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-brand transition-colors">{order.order_number}</p>
                  <p className="text-xs text-foreground-secondary mt-0.5">{fmtDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={order.status as any} />
                  <span className="text-sm font-bold text-foreground w-24 text-right">
                    {fmt(parseFloat(order.total_amount))}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;
