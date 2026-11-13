import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  BarChart3,
  PieChart as PieIcon,
  Tag,
  Check,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
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
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui';
import {
  KPICard,
  AdminChartTooltip,
  AdminAnalyticsNav,
} from '../components';
import {
  adminAnalyticsService,
  type AdminMarketplaceData,
} from '../services/adminAnalyticsService';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const STATUS_COLOR_MAP: Record<string, { color: string; label: string; bg: string }> = {
  delivered: { color: '#10b981', label: 'Delivered', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  shipped: { color: '#6366f1', label: 'In Transit / Shipped', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  confirmed: { color: '#0ea5e9', label: 'Confirmed / Processing', bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' },
  pending: { color: '#f59e0b', label: 'Pending Payment', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  cancelled: { color: '#f43f5e', label: 'Cancelled / Refunded', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
};

const CATEGORY_COLORS = ['#098541', '#10b981', '#0ea5e9', '#6366f1', '#f59e0b', '#ec4899'];

export const MarketplaceAnalytics: React.FC = () => {
  const [data, setData] = useState<AdminMarketplaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    adminAnalyticsService
      .getMarketplaceAnalytics()
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        console.error('Failed to load marketplace analytics:', err);
        if (isMounted) toast.error('Failed to load marketplace analytics data');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      await adminAnalyticsService.exportReport('orders');
      toast.success('Marketplace orders report exported successfully');
    } catch {
      toast.error('Failed to export orders report');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageSkeleton />
      </div>
    );
  }

  const orderStatuses = data?.order_status || [];
  const topCategories = data?.top_categories || [];

  // Aggregates
  const totalOrdersCalc = orderStatuses.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const totalOrders = data?.total_orders ?? totalOrdersCalc;

  const deliveredCount =
    orderStatuses.find((s) => s.status.toLowerCase() === 'delivered')?.count ??
    data?.delivered_orders ??
    0;

  const pendingCount =
    orderStatuses.find((s) => s.status.toLowerCase() === 'pending')?.count ??
    data?.pending_orders ??
    0;

  const cancelledCount =
    orderStatuses.find((s) => s.status.toLowerCase() === 'cancelled')?.count ?? 0;

  const activePipelineCount =
    orderStatuses
      .filter((s) => ['confirmed', 'shipped', 'pending'].includes(s.status.toLowerCase()))
      .reduce((acc, curr) => acc + (curr.count || 0), 0);

  const fulfillmentRate =
    totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0;
  const cancellationRate =
    totalOrders > 0 ? ((cancelledCount / totalOrders) * 100).toFixed(1) : '0';

  const orderChartData = orderStatuses.map((item) => {
    const key = item.status.toLowerCase();
    const config = STATUS_COLOR_MAP[key] || {
      color: '#94a3b8',
      label: item.status,
      bg: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    };
    return {
      name: config.label,
      rawStatus: item.status,
      value: item.count,
      color: config.color,
    };
  });

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ── Page Header ── */}
      <PageHeader
        title="Marketplace & Order Pipeline"
        description="Comprehensive order lifecycle fulfillment, stage distribution, category demand shares, and transactional platform health."
        badge={
          <Badge variant="outline" className="border-brand/30 bg-brand-muted/30 text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse mr-1" />
            Marketplace Intelligence
          </Badge>
        }
        backLink={{
          to: '/dashboard/admin/executive',
          label: 'Executive Hub',
        }}
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleExport}
            isLoading={exporting}
          >
            Export Orders CSV
          </Button>
        }
      />

      {/* ── Cockpit Sub-Navigation ── */}
      <AdminAnalyticsNav />

      {/* ── Top Metric Bento (4 KPIs) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Orders"
          value={totalOrders.toLocaleString('en-IN')}
          icon={<ShoppingBag className="h-5 w-5" />}
          description="All recorded platform orders"
          variant="brand"
          delay={0}
        />
        <KPICard
          title="Delivered / Fulfilled"
          value={deliveredCount.toLocaleString('en-IN')}
          icon={<CheckCircle2 className="h-5 w-5" />}
          deltaLabel={`${fulfillmentRate}% fulfillment rate`}
          description="Completed farm-to-table deliveries"
          variant="emerald"
          delay={0.05}
        />
        <KPICard
          title="In-Flight Pipeline"
          value={activePipelineCount.toLocaleString('en-IN')}
          icon={<Clock className="h-5 w-5" />}
          deltaLabel={`${pendingCount} awaiting processing`}
          description="Pending, confirmed, or in-transit"
          variant="info"
          delay={0.1}
        />
        <KPICard
          title="Cancelled / Disrupted"
          value={cancelledCount.toLocaleString('en-IN')}
          icon={<AlertCircle className="h-5 w-5" />}
          deltaLabel={`${cancellationRate}% cancellation share`}
          description="Aborted or returned orders"
          variant="warning"
          delay={0.15}
        />
      </div>

      {/* ── Visualizations (Order Status Donut + Top Categories Bar) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Order Status Donut & Stage Pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-6 rounded-2xl border border-border-subtle bg-surface p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieIcon className="h-5 w-5 text-brand" />
              <h3 className="text-base font-bold text-foreground">
                Order Status Distribution
              </h3>
            </div>
            <p className="text-xs text-foreground-secondary mb-4">
              Real-time proportion of active order fulfillment states.
            </p>

            <div className="h-64 w-full relative flex items-center justify-center">
              {orderChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                    >
                      {orderChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={
                        <AdminChartTooltip
                          valueFormatter={(val) =>
                            `${val.toLocaleString('en-IN')} orders (${totalOrders > 0 ? ((val / totalOrders) * 100).toFixed(1) : 0}%)`
                          }
                        />
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-foreground-secondary">
                  No orders recorded.
                </div>
              )}

              {/* Center Metric */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-semibold text-foreground-secondary uppercase tracking-wider">
                  Total
                </span>
                <span className="text-xl font-black text-foreground">
                  {totalOrders.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Custom Status Chips Grid */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {orderStatuses.map((item, idx) => {
                const key = item.status.toLowerCase();
                const config = STATUS_COLOR_MAP[key] || {
                  color: '#94a3b8',
                  label: item.status,
                  bg: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
                };
                const pct = totalOrders > 0 ? ((item.count / totalOrders) * 100).toFixed(1) : 0;

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated border border-border-subtle"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: config.color }}
                      />
                      <span className="text-xs font-semibold text-foreground capitalize truncate">
                        {item.status}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-foreground">
                        {item.count}
                      </span>
                      <span className="text-[10px] text-foreground-secondary ml-1">
                        ({pct}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border-subtle/60 text-xs text-foreground-secondary flex items-center justify-between">
            <span>Fulfillment Velocity</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> High Reliability
            </span>
          </div>
        </motion.div>

        {/* Right: Top Product Categories Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-6 rounded-2xl border border-border-subtle bg-surface p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-5 w-5 text-brand" />
              <h3 className="text-base font-bold text-foreground">
                Top Agricultural Categories
              </h3>
            </div>
            <p className="text-xs text-foreground-secondary mb-4">
              Catalog depth and listing volume ranked by major crop categories.
            </p>

            <div className="h-64 w-full">
              {topCategories.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topCategories}
                    layout="vertical"
                    margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      vertical={true}
                      stroke="var(--border-subtle)"
                      opacity={0.6}
                    />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'var(--color-foreground-secondary)' }}
                      allowDecimals={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'var(--color-foreground)' }}
                      width={100}
                    />
                    <Tooltip
                      content={<AdminChartTooltip suffix=" listings" />}
                      cursor={{ fill: 'var(--border-subtle)', opacity: 0.3 }}
                    />
                    <Bar
                      dataKey="value"
                      name="Listings"
                      radius={[0, 6, 6, 0]}
                      maxBarSize={28}
                    >
                      {topCategories.map((_, index) => (
                        <Cell
                          key={`cell-cat-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-foreground-secondary">
                  No category listings found.
                </div>
              )}
            </div>

            {/* Category Leaderboard */}
            <div className="space-y-2 mt-4">
              {topCategories.slice(0, 3).map((cat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-md bg-brand-muted/40 text-brand font-black flex items-center justify-center text-[10px]">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-foreground">
                      {cat.name}
                    </span>
                  </div>
                  <span className="font-bold text-foreground">
                    {cat.value.toLocaleString('en-IN')} items
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border-subtle/60 text-xs text-foreground-secondary flex items-center justify-between">
            <span>Leading Segment</span>
            <span className="font-bold text-foreground flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-brand" />
              {topCategories[0]?.name || 'Produce'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Order Status Pipeline Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-xs"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand" />
            <h3 className="text-base font-bold text-foreground">
              Order Lifecycle Breakdown
            </h3>
          </div>
          <span className="text-xs font-semibold text-foreground-secondary">
            {orderStatuses.length} Stages Monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="font-bold text-foreground">Lifecycle Stage</TableHead>
                <TableHead className="font-bold text-foreground text-right">Order Count</TableHead>
                <TableHead className="font-bold text-foreground text-right">Volume Share</TableHead>
                <TableHead className="font-bold text-foreground text-right">Operational SLA</TableHead>
                <TableHead className="font-bold text-foreground text-right">Status Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderStatuses.length > 0 ? (
                orderStatuses.map((row, idx) => {
                  const key = row.status.toLowerCase();
                  const config = STATUS_COLOR_MAP[key] || {
                    color: '#94a3b8',
                    label: row.status,
                    bg: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
                  };
                  const pct =
                    totalOrders > 0 ? ((row.count / totalOrders) * 100).toFixed(1) : '0';

                  const slaMap: Record<string, string> = {
                    delivered: 'Completed',
                    shipped: '1-2 Days Transit',
                    confirmed: '< 24 Hours Prep',
                    pending: 'Awaiting Auth',
                    cancelled: 'Archived',
                  };

                  return (
                    <TableRow
                      key={idx}
                      className="border-border-subtle hover:bg-surface-elevated/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: config.color }}
                          />
                          <span className="font-bold text-foreground capitalize">
                            {row.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-black text-foreground">
                        {row.count.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-right text-xs font-semibold text-foreground-secondary">
                        {pct}%
                      </TableCell>
                      <TableCell className="text-right text-xs text-foreground-secondary font-medium">
                        {slaMap[key] || 'Standard SLA'}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${config.bg}`}
                        >
                          {key === 'cancelled'
                            ? 'Flagged'
                            : key === 'delivered'
                            ? 'Optimal'
                            : 'In Progress'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-foreground-secondary text-xs"
                  >
                    No order statuses recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </div>
  );
};

export default MarketplaceAnalytics;
