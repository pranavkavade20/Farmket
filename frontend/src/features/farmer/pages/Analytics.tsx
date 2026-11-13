import React, { useState, useEffect } from 'react';
import { useSEO } from '@/hooks';
import { useAuth } from '@/features/auth';
import { analyticsService, type FarmerAnalyticsData } from '@/features/farmer';
import {
  PageHeader,
  Button,
  OrderStatusBadge,
  Badge,
  EmptyState,
} from '@/components/ui';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Star,
  Eye,
  IndianRupee,
  ArrowUpRight,
  PlusCircle,
  Clock,
  Layers,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { OrderStatus } from '@/types';

// Design tokens palette for charts
const CHART_PALETTE = [
  '#098541', // Primary brand emerald
  '#2FD477', // Vivid brand
  '#3b82f6', // Info blue
  '#f59e0b', // Accent amber
  '#8b5cf6', // Violet
  '#06b6d4', // Sky
];

type DateRange = '30d' | '90d' | '6m';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color?: string }>;
  label?: string;
  prefix?: string;
  suffix?: string;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  prefix = '',
  suffix = '',
}) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const formattedVal =
      typeof item.value === 'number'
        ? item.value.toLocaleString('en-IN')
        : item.value;

    return (
      <div className="rounded-xl bg-surface border border-border-subtle p-3 shadow-lg backdrop-blur-md text-xs">
        <p className="font-semibold text-foreground-secondary mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color || '#098541' }}
          />
          <span className="font-bold text-foreground">
            {prefix}
            {formattedVal}
            {suffix}
          </span>
          <span className="text-foreground-secondary lowercase font-medium">
            ({item.name})
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const Analytics: React.FC = () => {
  useSEO({
    title: 'Revenue & Sales Analytics | Farmket',
    description: 'Track your farm revenue, harvest order flow, produce demand, and customer feedback.',
  });

  const { user } = useAuth();
  const [data, setData] = useState<FarmerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('6m');

  useEffect(() => {
    if (user?.user_type !== 'farmer') return;
    let isMounted = true;

    analyticsService
      .getFarmerAnalytics()
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch(() => {
        if (isMounted) toast.error('Failed to load farmer analytics');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  // Filter trend data according to date range tabs
  const rawRevenueTrend = data?.revenue_trend ?? [];
  const filteredRevenueTrend =
    dateRange === '30d'
      ? rawRevenueTrend.slice(-2)
      : dateRange === '90d'
      ? rawRevenueTrend.slice(-3)
      : rawRevenueTrend;

  const rawOrdersTrend = data?.orders_trend ?? [];
  const filteredOrdersTrend =
    dateRange === '30d'
      ? rawOrdersTrend.slice(-2)
      : dateRange === '90d'
      ? rawOrdersTrend.slice(-3)
      : rawOrdersTrend;

  const periodRevenueTotal = filteredRevenueTrend.reduce(
    (sum, pt) => sum + (pt.revenue || 0),
    0
  );
  const periodOrdersTotal = filteredOrdersTrend.reduce(
    (sum, pt) => sum + (pt.orders || 0),
    0
  );

  if (user?.user_type !== 'farmer') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <EmptyState
          icon={<TrendingUp className="h-10 w-10 text-foreground-secondary" />}
          title="Farmer Analytics Restricted"
          description="Revenue analytics, crop performance trends, and buyer order volume are exclusively available to registered farmer accounts."
          action={{
            label: 'Go to Dashboard',
            onClick: () => {
              window.location.href = '/dashboard';
            },
            variant: 'brand',
          }}
        />
      </div>
    );
  }

  const kpis = data?.kpis;
  const avgOrderValue =
    kpis && kpis.total_orders > 0
      ? Math.round(kpis.total_revenue / kpis.total_orders)
      : 0;

  return (
    <div className="w-full space-y-8 pb-16">
      {/* ── 1. Standardized Header with PageHeader ── */}
      <PageHeader
        title="Revenue & Performance Analytics"
        badge={<Badge variant="brand">Farmer Analytics</Badge>}
        description="Monitor marketplace income, track seasonal harvest order volume, analyze buyer discovery, and evaluate product demand."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Range Selector */}
            <div className="flex items-center bg-surface-elevated border border-border-subtle p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setDateRange('30d')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  dateRange === '30d'
                    ? 'bg-surface shadow-xs text-foreground font-semibold'
                    : 'text-foreground-secondary hover:text-foreground'
                }`}
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => setDateRange('90d')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  dateRange === '90d'
                    ? 'bg-surface shadow-xs text-foreground font-semibold'
                    : 'text-foreground-secondary hover:text-foreground'
                }`}
              >
                90 Days
              </button>
              <button
                type="button"
                onClick={() => setDateRange('6m')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  dateRange === '6m'
                    ? 'bg-surface shadow-xs text-foreground font-semibold'
                    : 'text-foreground-secondary hover:text-foreground'
                }`}
              >
                6 Months
              </button>
            </div>

            <Link to="/dashboard/products">
              <Button variant="outline" size="sm" className="gap-2">
                <Layers className="h-4 w-4 text-brand" />
                <span className="hidden sm:inline">My Products</span>
              </Button>
            </Link>

            <Link to="/dashboard/products/new">
              <Button variant="brand" size="sm" className="gap-2 shadow-xs">
                <PlusCircle className="h-4 w-4" />
                <span>Add Produce</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* ── 2. Tactile Performance Metric Cards (6 KPI Bento) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* KPI 1: Gross Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="rounded-2xl bg-surface border border-border-subtle p-4 shadow-xs hover:border-border-strong hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="h-9 w-9 rounded-xl bg-brand-muted/40 border border-brand/20 flex items-center justify-center text-brand">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          {loading ? (
            <div className="h-7 w-24 animate-pulse rounded bg-surface-elevated mb-1" />
          ) : (
            <p className="text-xl font-display font-black text-foreground tracking-tight mb-1">
              {fmtCurrency(kpis?.total_revenue ?? 0)}
            </p>
          )}
          <p className="text-[11px] font-medium text-foreground-secondary flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3 text-brand" />
            Delivered orders
          </p>
        </motion.div>

        {/* KPI 2: Total Orders */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl bg-surface border border-border-subtle p-4 shadow-xs hover:border-border-strong hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
              Total Orders
            </span>
            <div className="h-9 w-9 rounded-xl bg-info-muted/40 border border-info/20 flex items-center justify-center text-info">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          {loading ? (
            <div className="h-7 w-16 animate-pulse rounded bg-surface-elevated mb-1" />
          ) : (
            <p className="text-xl font-display font-black text-foreground tracking-tight mb-1">
              {kpis?.total_orders ?? 0}
            </p>
          )}
          <p className="text-[11px] font-medium text-info flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {kpis?.pending_orders ?? 0} pending fulfillment
          </p>
        </motion.div>

        {/* KPI 3: Avg. Order Value */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-2xl bg-surface border border-border-subtle p-4 shadow-xs hover:border-border-strong hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
              Avg. Order Value
            </span>
            <div className="h-9 w-9 rounded-xl bg-brand-muted/40 border border-brand/20 flex items-center justify-center text-brand">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          {loading ? (
            <div className="h-7 w-20 animate-pulse rounded bg-surface-elevated mb-1" />
          ) : (
            <p className="text-xl font-display font-black text-foreground tracking-tight mb-1">
              {fmtCurrency(avgOrderValue)}
            </p>
          )}
          <p className="text-[11px] font-medium text-foreground-secondary">
            Per fulfilled basket
          </p>
        </motion.div>

        {/* KPI 4: Produce Catalog */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="rounded-2xl bg-surface border border-border-subtle p-4 shadow-xs hover:border-border-strong hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
              Produce Listed
            </span>
            <div className="h-9 w-9 rounded-xl bg-warning-muted/40 border border-warning/20 flex items-center justify-center text-warning">
              <Package className="h-4 w-4" />
            </div>
          </div>
          {loading ? (
            <div className="h-7 w-16 animate-pulse rounded bg-surface-elevated mb-1" />
          ) : (
            <p className="text-xl font-display font-black text-foreground tracking-tight mb-1">
              {kpis?.total_products ?? 0}
            </p>
          )}
          <p className="text-[11px] font-medium text-success flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            {kpis?.active_products ?? 0} live in market
          </p>
        </motion.div>

        {/* KPI 5: Storefront Rating */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-surface border border-border-subtle p-4 shadow-xs hover:border-border-strong hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
              Farmer Rating
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Star className="h-4 w-4 fill-amber-500" />
            </div>
          </div>
          {loading ? (
            <div className="h-7 w-16 animate-pulse rounded bg-surface-elevated mb-1" />
          ) : (
            <p className="text-xl font-display font-black text-foreground tracking-tight mb-1">
              {kpis?.avg_rating ? `${kpis.avg_rating} ★` : '—'}
            </p>
          )}
          <p className="text-[11px] font-medium text-foreground-secondary">
            {kpis?.total_reviews ?? 0} verified reviews
          </p>
        </motion.div>

        {/* KPI 6: Buyer Views */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="rounded-2xl bg-surface border border-border-subtle p-4 shadow-xs hover:border-border-strong hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
              Buyer Traffic
            </span>
            <div className="h-9 w-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          {loading ? (
            <div className="h-7 w-16 animate-pulse rounded bg-surface-elevated mb-1" />
          ) : (
            <p className="text-xl font-display font-black text-foreground tracking-tight mb-1">
              {(kpis?.total_views ?? 0).toLocaleString('en-IN')}
            </p>
          )}
          <p className="text-[11px] font-medium text-foreground-secondary">
            Produce impressions
          </p>
        </motion.div>
      </div>

      {/* ── 3. Charts Row 1: Revenue Area Chart & Category Distribution Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 rounded-2xl bg-surface border border-border-subtle p-6 shadow-xs flex flex-col justify-between"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">Revenue Trend</h3>
                <Badge variant="brand" size="sm">
                  {dateRange === '30d'
                    ? '30 Days'
                    : dateRange === '90d'
                    ? '90 Days'
                    : '6 Months'}
                </Badge>
              </div>
              <p className="text-xs text-foreground-secondary mt-0.5">
                Earnings generated from delivered marketplace orders.
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-foreground-secondary">Period Revenue:</span>
              <p className="text-lg font-extrabold text-foreground">
                {fmtCurrency(periodRevenueTotal)}
              </p>
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredRevenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="farmketRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#098541" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#098541" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fontWeight: 500, fill: '#888' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fontWeight: 500, fill: '#888' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val: number) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  content={
                    <CustomChartTooltip prefix="₹" />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#098541"
                  strokeWidth={2.5}
                  fill="url(#farmketRevenueGrad)"
                  activeDot={{ r: 6, fill: '#098541', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution Donut Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-surface border border-border-subtle p-6 shadow-xs flex flex-col"
        >
          <div className="mb-4">
            <h3 className="text-base font-bold text-foreground">Produce Classification</h3>
            <p className="text-xs text-foreground-secondary">
              Catalog distribution across product categories.
            </p>
          </div>

          {(data?.category_distribution?.length ?? 0) > 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full h-56 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data!.category_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={88}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={6}
                    >
                      {data!.category_distribution.map((_, index) => (
                        <Cell
                          key={`cat-cell-${index}`}
                          fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={
                        <CustomChartTooltip suffix=" items" />
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-foreground">
                    {data?.category_distribution.reduce((acc, c) => acc + c.value, 0)}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-foreground-secondary">
                    Total Items
                  </span>
                </div>
              </div>

              {/* Custom Legend Chips */}
              <div className="w-full flex flex-wrap gap-2 pt-2 justify-center">
                {data!.category_distribution.map((cat, idx) => (
                  <div
                    key={cat.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-elevated border border-border-subtle text-xs"
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: CHART_PALETTE[idx % CHART_PALETTE.length] }}
                    />
                    <span className="font-medium text-foreground">{cat.name}</span>
                    <span className="text-foreground-secondary font-mono">({cat.value})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs font-medium text-foreground-secondary">
              {loading ? 'Loading categories…' : 'No categorized produce'}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── 4. Charts Row 2: Monthly Orders Trend & Top Produce by Views ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Trend Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl bg-surface border border-border-subtle p-6 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Order Volume Velocity</h3>
              <p className="text-xs text-foreground-secondary">
                Number of completed and incoming orders placed over time.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-foreground-secondary">Period Orders:</span>
              <p className="text-base font-extrabold text-foreground">
                {periodOrdersTotal}
              </p>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredOrdersTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fontWeight: 500, fill: '#888' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fontWeight: 500, fill: '#888' }}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={
                    <CustomChartTooltip suffix=" orders" />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Produce by Views Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-surface border border-border-subtle p-6 shadow-xs flex flex-col justify-between"
        >
          <div className="mb-4">
            <h3 className="text-base font-bold text-foreground">Top Produce by Buyer Views</h3>
            <p className="text-xs text-foreground-secondary">
              Most visited harvest listings in your marketplace catalog.
            </p>
          </div>

          {(data?.top_products?.length ?? 0) > 0 ? (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data!.top_products}
                  barSize={32}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fontWeight: 500, fill: '#888' }}
                    tickFormatter={(v: string) => (v.length > 12 ? `${v.slice(0, 12)}…` : v)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fontWeight: 500, fill: '#888' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={
                      <CustomChartTooltip suffix=" views" />
                    }
                  />
                  <Bar
                    dataKey="views"
                    name="Views"
                    fill="#098541"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-xs font-medium text-foreground-secondary">
              {loading ? 'Loading produce metrics…' : 'No view impressions recorded'}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── 5. Top Products Performance Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl bg-surface border border-border-subtle overflow-hidden shadow-xs"
      >
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Top-Performing Produce</h3>
            <p className="text-xs text-foreground-secondary">
              Direct inventory snapshot of your highest-demand farm items.
            </p>
          </div>
          <Link
            to="/dashboard/products"
            className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
          >
            Manage Inventory <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-elevated/70 text-left border-b border-border-subtle">
                <th className="px-6 py-3 text-xs font-bold text-foreground uppercase tracking-wider">
                  Produce Item
                </th>
                <th className="px-6 py-3 text-xs font-bold text-foreground uppercase tracking-wider">
                  Price / Unit
                </th>
                <th className="px-6 py-3 text-xs font-bold text-foreground uppercase tracking-wider">
                  Available Stock
                </th>
                <th className="px-6 py-3 text-xs font-bold text-foreground uppercase tracking-wider">
                  Buyer Views
                </th>
                <th className="px-6 py-3 text-xs font-bold text-foreground uppercase tracking-wider">
                  Marketplace Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5].map((j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 animate-pulse rounded bg-surface-elevated" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (data?.top_products?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Package className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground mb-1">
                      No produce cataloged yet
                    </p>
                    <p className="text-xs text-foreground-secondary mb-4">
                      List your fresh harvest to start gathering views and buyer inquiries.
                    </p>
                    <Link to="/dashboard/products/new">
                      <Button variant="brand" size="sm">
                        Add Your First Produce
                      </Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                data!.top_products.map((p, i) => {
                  const isLow = p.stock_quantity > 0 && p.stock_quantity <= 10;
                  const isOut = p.stock_quantity === 0;

                  return (
                    <tr
                      key={i}
                      className="hover:bg-state-hover/50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-foreground max-w-[240px] truncate">
                        {p.name}
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                        ₹{parseFloat(p.price).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isOut ? (
                          <Badge variant="danger" size="sm">
                            Out of Stock
                          </Badge>
                        ) : isLow ? (
                          <Badge variant="warning" size="sm">
                            Low: {p.stock_quantity}
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            {p.stock_quantity} In Stock
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-foreground-secondary whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Eye className="h-3.5 w-3.5 text-foreground-muted" />
                          <span>{p.views.toLocaleString('en-IN')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={p.is_available ? 'success' : 'default'} size="sm">
                          {p.is_available ? 'Active in Market' : 'Hidden'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── 6. Recent Orders Fulfillment Feed ── */}
      {(data?.recent_orders?.length ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-surface border border-border-subtle overflow-hidden shadow-xs"
        >
          <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Recent Marketplace Orders</h3>
              <p className="text-xs text-foreground-secondary">
                Latest transactions and fulfillment orders awaiting or completed.
              </p>
            </div>
            <Link
              to="/farmer/orders"
              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
            >
              View Order Pipeline <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border-subtle">
            {data!.recent_orders.map((order) => (
              <Link
                key={order.id}
                to={`/farmer/orders/${order.id}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-state-hover/50 transition-colors gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                      {order.order_number}
                    </p>
                    <span className="text-[11px] text-foreground-muted font-mono">
                      #{order.id}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-secondary mt-0.5">
                    Placed on {fmtDate(order.created_at)}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <OrderStatusBadge status={order.status as OrderStatus} />
                  <span className="text-sm font-extrabold text-foreground w-28 text-right">
                    {fmtCurrency(parseFloat(order.total_amount))}
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
