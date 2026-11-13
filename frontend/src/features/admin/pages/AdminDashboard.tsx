import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShoppingBag,
  Package,
  IndianRupee,
  Download,
  Tractor,
  Activity,
  Leaf,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  PageHeader,
  Badge,
  Button,
  PageSkeleton,
} from '@/components/ui';
import { KPICard, AdminAnalyticsNav } from '../components';
import {
  adminAnalyticsService,
  type AdminExecutiveData,
} from '../services/adminAnalyticsService';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
    return (
      <div className="rounded-xl bg-surface border border-border-subtle p-3 shadow-lg backdrop-blur-md text-xs">
        <p className="font-semibold text-foreground-secondary mb-1.5">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color || '#098541' }}
              />
              <span className="font-medium text-foreground-secondary capitalize">
                {entry.name}:
              </span>
              <span className="font-bold text-foreground">
                {prefix}
                {entry.value.toLocaleString('en-IN')}
                {suffix}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminExecutiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingType, setExportingType] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    adminAnalyticsService
      .getExecutiveOverview()
      .then((response) => {
        if (isMounted) setData(response);
      })
      .catch((error) => {
        console.error('Failed to fetch admin analytics:', error);
        if (isMounted) toast.error('Failed to load dashboard data');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleExport = async (type: string) => {
    setExportingType(type);
    try {
      await adminAnalyticsService.exportReport(type);
      toast.success(`${type.toUpperCase()} report exported successfully`);
    } catch {
      toast.error(`Failed to export ${type} report`);
    } finally {
      setExportingType(null);
    }
  };

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);

  if (loading || !data) {
    return <PageSkeleton />;
  }

  const kpis = data.kpis;

  return (
    <div className="w-full space-y-8 pb-16">
      {/* ── 1. Standardized Header with PageHeader ── */}
      <PageHeader
        title="Executive Overview"
        badge={<Badge variant="brand">Platform Administration</Badge>}
        description="Comprehensive visibility across marketplace gross merchandise value, user acquisition velocity, and agricultural trade volume."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('users')}
              isLoading={exportingType === 'users'}
              disabled={exportingType !== null}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Users</span>
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={() => handleExport('orders')}
              isLoading={exportingType === 'orders'}
              disabled={exportingType !== null}
              className="gap-2 shadow-xs"
            >
              <Download className="h-4 w-4" />
              <span>Export Orders</span>
            </Button>
          </div>
        }
      />

      {/* ── Cockpit Sub-Navigation ── */}
      <AdminAnalyticsNav />

      {/* ── 2. Tactile Executive KPI Bento (6 Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Gross Revenue"
          value={fmtCurrency(kpis.total_revenue)}
          icon={<IndianRupee className="h-4 w-4" />}
          description="Delivered GMV"
          variant="brand"
          delay={0}
        />
        <KPICard
          title="Active Users"
          value={kpis.active_users.toLocaleString('en-IN')}
          icon={<Activity className="h-4 w-4" />}
          description="Past 7 days active"
          variant="info"
          delay={0.05}
        />
        <KPICard
          title="Total Farmers"
          value={kpis.total_farmers.toLocaleString('en-IN')}
          icon={<Tractor className="h-4 w-4" />}
          deltaLabel={`+${kpis.new_farmers_month} this mo`}
          description="Verified producers"
          variant="emerald"
          delay={0.1}
        />
        <KPICard
          title="Total Buyers"
          value={kpis.total_buyers.toLocaleString('en-IN')}
          icon={<Users className="h-4 w-4" />}
          deltaLabel={`+${kpis.new_buyers_month} this mo`}
          description="Direct consumers"
          variant="purple"
          delay={0.15}
        />
        <KPICard
          title="Lifetime Orders"
          value={kpis.total_orders.toLocaleString('en-IN')}
          icon={<ShoppingBag className="h-4 w-4" />}
          description="Processed orders"
          variant="warning"
          delay={0.2}
        />
        <KPICard
          title="Active Produce"
          value={kpis.total_products.toLocaleString('en-IN')}
          icon={<Package className="h-4 w-4" />}
          deltaLabel={`+${kpis.new_products_month} this mo`}
          description="Market listings"
          variant="brand"
          delay={0.25}
        />
      </div>

      {/* ── 3. Visual Charts Grid (Revenue Velocity & User Growth) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Velocity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Revenue Velocity</h3>
              <p className="text-xs text-foreground-secondary">
                Daily marketplace sales over the last 30 days.
              </p>
            </div>
            <Badge variant="brand" size="sm">
              30 Days Snapshot
            </Badge>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenue_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#098541" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#098541" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.15)" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 500, fill: '#888' }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 500, fill: '#888' }}
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
                  fillOpacity={1}
                  fill="url(#adminRevenueGrad)"
                  activeDot={{ r: 6, fill: '#098541', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* User Acquisition Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">User Acquisition Trajectory</h3>
              <p className="text-xs text-foreground-secondary">
                Farmer and buyer registration curves over time.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Farmers
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <span className="h-2 w-2 rounded-full bg-purple-500" /> Buyers
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.user_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminFarmersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="adminBuyersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.15)" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 500, fill: '#888' }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 500, fill: '#888' }}
                />
                <Tooltip
                  content={
                    <CustomChartTooltip suffix=" users" />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="farmers"
                  name="Farmers"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#adminFarmersGrad)"
                  activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 1.5 }}
                />
                <Area
                  type="monotone"
                  dataKey="buyers"
                  name="Buyers"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#adminBuyersGrad)"
                  activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 1.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ── 4. Specialized Analytics Navigation Bento Hub ── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Specialized Analytics Suites</h3>
            <p className="text-xs text-foreground-secondary">
              Deep-dive metrics across platform domains.
            </p>
          </div>
          <Badge variant="outline" size="sm">
            4 Dedicated Modules
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Module 1: User Analytics */}
          <Link
            to="/dashboard/admin/users"
            className="group rounded-2xl bg-surface border border-border-subtle p-5 shadow-xs hover:border-brand hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-foreground text-sm mb-1 group-hover:text-brand transition-colors">
                User Analytics
              </h4>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Monthly farmer vs buyer growth ratios, account verification status, and acquisition trends.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between text-xs font-semibold text-brand">
              <span>View User Cohorts</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Module 2: Marketplace Analytics */}
          <Link
            to="/dashboard/admin/marketplace"
            className="group rounded-2xl bg-surface border border-border-subtle p-5 shadow-xs hover:border-brand hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-warning-muted/40 border border-warning/20 text-warning flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-foreground text-sm mb-1 group-hover:text-brand transition-colors">
                Marketplace Analytics
              </h4>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Order fulfillment pipelines, category demand share, and transaction status distribution.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between text-xs font-semibold text-brand">
              <span>View Order Pipelines</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Module 3: Crop Production Analytics */}
          <Link
            to="/dashboard/admin/crops"
            className="group rounded-2xl bg-surface border border-border-subtle p-5 shadow-xs hover:border-brand hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-brand-muted/40 border border-brand/20 text-brand flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Leaf className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-foreground text-sm mb-1 group-hover:text-brand transition-colors">
                Crop Analytics
              </h4>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Upcoming regional harvests, top cultivated crops, and forward pre-booking volume tracking.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between text-xs font-semibold text-brand">
              <span>View Harvest Pipelines</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Module 4: Revenue Analytics */}
          <Link
            to="/dashboard/admin/revenue"
            className="group rounded-2xl bg-surface border border-border-subtle p-5 shadow-xs hover:border-brand hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-foreground text-sm mb-1 group-hover:text-brand transition-colors">
                Revenue Analytics
              </h4>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Platform financial health, GMV velocity, fee collection, and monthly monetary reports.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between text-xs font-semibold text-brand">
              <span>View Financial Reports</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* ── 5. Platform Integrity Banner ── */}
      <div className="rounded-2xl bg-surface border border-border-subtle p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-foreground-secondary">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-brand shrink-0" />
          <span>
            Executive metrics are synced with real-time PostgreSQL database snapshots every 24 hours.
          </span>
        </div>
        <span className="text-[11px] font-mono text-foreground-muted">
          Platform Version 2.0 • Fresh Harvest
        </span>
      </div>
    </div>
  );
};

export default AdminDashboard;
