import React, { useState, useEffect } from 'react';
import { useSEO } from '@/hooks';
import { useAuth } from '@/features/auth';
import { analyticsService, type FarmerAnalyticsData } from '@/features/farmer';
import { Button, OrderStatusBadge } from '@/components/ui';
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
      <div className="flex items-end justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Analytics</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">Your farm store performance overview</p>
        </div>
        <Link to="/dashboard/products/new">
          <Button className="h-14 rounded-full px-8 font-black gap-2 shadow-xl bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-gray-900 transition-transform hover:scale-105">
            <PlusCircle className="h-5 w-5" /> Add Product
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          {
            label: 'Total Revenue', icon: <IndianRupee className="h-6 w-6 text-white" />, color: 'bg-gradient-to-br from-green-400 to-green-600',
            value: loading ? '—' : fmt(kpis?.total_revenue ?? 0), sub: 'From delivered orders',
          },
          {
            label: 'Total Orders', icon: <ShoppingBag className="h-6 w-6 text-white" />, color: 'bg-gradient-to-br from-blue-400 to-blue-600',
            value: loading ? '—' : String(kpis?.total_orders ?? 0), sub: `${kpis?.pending_orders ?? 0} pending`,
          },
          {
            label: 'Products Listed', icon: <Package className="h-6 w-6 text-white" />, color: 'bg-gradient-to-br from-purple-400 to-purple-600',
            value: loading ? '—' : String(kpis?.total_products ?? 0), sub: `${kpis?.active_products ?? 0} active`,
          },
          {
            label: 'Avg Rating', icon: <Star className="h-6 w-6 text-white" />, color: 'bg-gradient-to-br from-amber-400 to-amber-600',
            value: loading ? '—' : `${kpis?.avg_rating ?? '—'} ★`, sub: `${kpis?.total_reviews ?? 0} reviews`,
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-[2.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 p-8 shadow-sm hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">{kpi.label}</span>
              <div className={`h-14 w-14 rounded-[1.25rem] ${kpi.color} flex items-center justify-center shadow-sm`}>{kpi.icon}</div>
            </div>
            {loading ? (
              <div className="h-10 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800 mb-2" />
            ) : (
              <p className="text-4xl font-black text-gray-900 dark:text-white leading-none mb-3">{kpi.value}</p>
            )}
            <div className="flex items-center gap-1 mt-4 text-xs font-black uppercase tracking-widest text-gray-400">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {kpi.sub}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-[2.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Revenue Trend</h2>
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400"><Calendar className="h-4 w-4" /> Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data?.revenue_trend ?? []}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#111" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [`₹${v}`, 'Revenue']} cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="revenue" stroke="#111" strokeWidth={4} fill="url(#revenueGrad)" activeDot={{ r: 8, fill: '#111' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-[2.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 p-8 shadow-sm flex flex-col"
        >
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Products by Category</h2>
          {(data?.category_distribution?.length ?? 0) > 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data!.category_distribution}
                    cx="50%" cy="50%"
                    innerRadius={70} outerRadius={100}
                    paddingAngle={8} dataKey="value"
                    stroke="none"
                    cornerRadius={8}
                  >
                    {data!.category_distribution.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 700 }} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm font-bold text-gray-400">
              {loading ? 'Loading…' : 'No products listed'}
            </div>
          )}
        </motion.div>
      </div>

      {/* Orders Trend */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27 }}
        className="rounded-[2.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 p-8 mb-12 shadow-sm"
      >
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Orders Trend</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data?.orders_trend ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#9ca3af' }} allowDecimals={false} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }} />
            <Line type="monotone" dataKey="orders" stroke="#16a34a" strokeWidth={4} dot={{ r: 6, fill: '#16a34a', strokeWidth: 0 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Products by Views */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-[2.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 p-8 mb-12 shadow-sm"
      >
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Top Products by Views</h2>
        {(data?.top_products?.length ?? 0) > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data!.top_products} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fontWeight: 700, fill: '#9ca3af' }}
                tickFormatter={(v: string) => v.length > 12 ? v.slice(0, 12) + '…' : v}
                axisLine={false} tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} />
              <Bar dataKey="views" fill="#111" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[260px] items-center justify-center text-sm font-bold text-gray-400">
            {loading ? 'Loading…' : 'No data available'}
          </div>
        )}
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="rounded-[2.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 overflow-hidden mb-12 shadow-sm"
      >
        <div className="px-8 py-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Top Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8F9FA] dark:bg-gray-900/50 text-left">
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Product</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Price</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Stock</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Views</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5].map((j) => (
                      <td key={j} className="px-8 py-6">
                        <div className="h-5 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (data?.top_products?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center">
                    <p className="text-base font-bold text-gray-400 mb-2">No products yet.</p>
                    <Link to="/dashboard/products/new" className="text-gray-900 dark:text-white font-black hover:underline uppercase tracking-widest text-sm">Add your first product</Link>
                  </td>
                </tr>
              ) : (
                data!.top_products.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-8 py-6 font-black text-gray-900 dark:text-white truncate max-w-[200px] text-base">{p.name}</td>
                    <td className="px-6 py-6 font-bold text-gray-900 dark:text-white">₹{parseFloat(p.price).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-6 font-bold text-gray-500 dark:text-gray-400">{p.stock_quantity}</td>
                    <td className="px-6 py-6 font-bold text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" /> {p.views}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
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
          className="rounded-[2.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm"
        >
          <div className="px-8 py-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Recent Orders</h2>
            <Link to="/dashboard/orders" className="text-sm font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {data!.recent_orders.map((order) => (
              <Link
                key={order.id}
                to={`/dashboard/orders/${order.id}`}
                className="group flex items-center justify-between px-8 py-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <div>
                  <p className="text-base font-black text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{order.order_number}</p>
                  <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{fmtDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-6">
                  <OrderStatusBadge status={order.status as any} />
                  <span className="text-xl font-black text-gray-900 dark:text-white">
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
