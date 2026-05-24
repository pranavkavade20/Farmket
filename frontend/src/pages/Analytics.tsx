import React, { useState, useEffect } from 'react';
import { useSEO } from '@/hooks/useSEO';
import { useAuth } from '@/store/AuthContext';
import { analyticsService, type FarmerAnalyticsData } from '@/services/analyticsService';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import {
  TrendingUp, ShoppingBag, Package, Star, Eye, IndianRupee,
  ArrowUpRight, Calendar, PlusCircle, CheckCircle, Clock,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';
import { motion } from 'framer-motion';
import { OrderStatusBadge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

/* eslint-disable @typescript-eslint/no-explicit-any */

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];

const Analytics = () => {
  useSEO({ title: 'Analytics', description: 'Track your farm store performance.' });
  const { user } = useAuth();
  const [data, setData] = useState<FarmerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.user_type !== 'farmer') { setLoading(false); return; }
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
        <TrendingUp className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Analytics for Farmers</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Analytics are available only for farmer accounts.
        </p>
      </div>
    );
  }

  const kpis = data?.kpis;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your farm store performance overview</p>
        </div>
        <Link to="/dashboard/products/new">
          <Button size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Revenue', icon: <IndianRupee className="h-5 w-5 text-white" />, color: 'bg-green-500',
            value: loading ? '—' : fmt(kpis?.total_revenue ?? 0), sub: 'From delivered orders',
          },
          {
            label: 'Total Orders', icon: <ShoppingBag className="h-5 w-5 text-white" />, color: 'bg-blue-500',
            value: loading ? '—' : String(kpis?.total_orders ?? 0), sub: `${kpis?.pending_orders ?? 0} pending`,
          },
          {
            label: 'Products Listed', icon: <Package className="h-5 w-5 text-white" />, color: 'bg-purple-500',
            value: loading ? '—' : String(kpis?.total_products ?? 0), sub: `${kpis?.active_products ?? 0} active`,
          },
          {
            label: 'Avg Rating', icon: <Star className="h-5 w-5 text-white" />, color: 'bg-amber-500',
            value: loading ? '—' : `${kpis?.avg_rating ?? '—'} ★`, sub: `${kpis?.total_reviews ?? 0} reviews`,
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{kpi.label}</span>
              <div className={`h-9 w-9 rounded-xl ${kpi.color} flex items-center justify-center`}>{kpi.icon}</div>
            </div>
            {loading ? (
              <div className="h-7 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800 mb-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
            )}
            <div className="flex items-center gap-1 mt-1 text-xs font-medium text-green-600 dark:text-green-500">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {kpi.sub}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Revenue Trend</h2>
            <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar className="h-3.5 w-3.5" /> Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.revenue_trend ?? []}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [`₹${v}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-6"
        >
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Products by Category</h2>
          {(data?.category_distribution?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data!.category_distribution}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80}
                  paddingAngle={4} dataKey="value"
                >
                  {data!.category_distribution.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-sm text-gray-400">
              {loading ? 'Loading…' : 'No products listed'}
            </div>
          )}
        </motion.div>
      </div>

      {/* Orders Trend */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27 }}
        className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-6 mb-8"
      >
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Orders Trend</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data?.orders_trend ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="orders" stroke="#22c55e" strokeWidth={2} dot={{ r: 4, fill: '#16a34a' }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Products by Views */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 p-6 mb-8"
      >
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Top Products by Views</h2>
        {(data?.top_products?.length ?? 0) > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data!.top_products} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                tickFormatter={(v: string) => v.length > 12 ? v.slice(0, 12) + '…' : v}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="views" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-sm text-gray-400">
            {loading ? 'Loading…' : 'No data available'}
          </div>
        )}
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 overflow-hidden mb-8"
      >
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Top Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Product</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Price</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Stock</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Views</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5].map((j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (data?.top_products?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No products yet.{' '}
                    <Link to="/dashboard/products/new" className="text-green-600 hover:underline">Add your first product</Link>
                  </td>
                </tr>
              ) : (
                data!.top_products.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white truncate max-w-[180px]">{p.name}</td>
                    <td className="px-4 py-4 text-gray-900 dark:text-white">₹{parseFloat(p.price).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-4 text-gray-500 dark:text-gray-400">{p.stock_quantity}</td>
                    <td className="px-4 py-4 text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> {p.views}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        p.is_available
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {p.is_available ? 'Active' : 'Inactive'}
                      </span>
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
          className="rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <Link to="/dashboard/orders" className="text-xs text-green-600 dark:text-green-500 hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {data!.recent_orders.map((order) => (
              <Link
                key={order.id}
                to={`/dashboard/orders/${order.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{order.order_number}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmtDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={order.status as any} />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
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
