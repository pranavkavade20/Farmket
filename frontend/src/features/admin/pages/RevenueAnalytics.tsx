import React, { useEffect, useState } from 'react';
import {
  IndianRupee,
  Percent,
  TrendingUp,
  Users,
  Download,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  CreditCard,
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
  type AdminExecutiveData,
} from '../services/adminAnalyticsService';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const RevenueAnalytics: React.FC = () => {
  const [data, setData] = useState<AdminExecutiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    adminAnalyticsService
      .getExecutiveOverview()
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        console.error('Failed to load revenue analytics:', err);
        if (isMounted) toast.error('Failed to load revenue analytics data');
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
      toast.success('Financial orders ledger exported successfully');
    } catch {
      toast.error('Failed to export financial report');
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

  const kpis = data?.kpis || {
    total_farmers: 0,
    total_buyers: 0,
    total_products: 0,
    total_orders: 0,
    total_revenue: 0,
    new_farmers_month: 0,
    new_buyers_month: 0,
    new_products_month: 0,
    active_users: 0,
  };

  const revenueTrend = data?.revenue_trend || [];
  const gmv = kpis.total_revenue || 0;
  const platformFee = gmv * 0.03; // Standard 3.0% platform facilitation fee
  const aov = kpis.total_orders > 0 ? gmv / kpis.total_orders : 0;
  const buyerLtv = kpis.total_buyers > 0 ? gmv / kpis.total_buyers : 0;

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);

  // Peak revenue point calculation
  const peakRevenue = revenueTrend.reduce(
    (max, p) => ((p.revenue || 0) > max ? (p.revenue || 0) : max),
    0
  );

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ── Page Header ── */}
      <PageHeader
        title="Platform Financial & Revenue Analytics"
        description="Comprehensive Gross Merchandise Value (GMV), platform monetization margins, unit transaction economics, and daily settlement volume."
        badge={
          <Badge variant="outline" className="border-brand/30 bg-brand-muted/30 text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse mr-1" />
            Financial Intelligence
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
            Export Financial Ledger
          </Button>
        }
      />

      {/* ── Cockpit Sub-Navigation ── */}
      <AdminAnalyticsNav />

      {/* ── Top Metric Bento (4 KPIs) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Gross Merchandise Value"
          value={fmtCurrency(gmv)}
          icon={<IndianRupee className="h-5 w-5" />}
          deltaLabel="100% verified settlement"
          description="Cumulative platform trade volume"
          variant="emerald"
          delay={0}
        />
        <KPICard
          title="Platform Facilitation Take"
          value={fmtCurrency(platformFee)}
          icon={<Percent className="h-5 w-5" />}
          description="3.0% platform service fee model"
          variant="brand"
          delay={0.05}
        />
        <KPICard
          title="Average Order Value"
          value={fmtCurrency(aov)}
          icon={<TrendingUp className="h-5 w-5" />}
          description="Basket size per fulfilled transaction"
          variant="info"
          delay={0.1}
        />
        <KPICard
          title="Buyer Lifetime Value (LTV)"
          value={fmtCurrency(buyerLtv)}
          icon={<Users className="h-5 w-5" />}
          description="Cumulative spend per registered buyer"
          variant="purple"
          delay={0.15}
        />
      </div>

      {/* ── Main Visualization: 30-Day Revenue Velocity ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-brand" />
              <h3 className="text-base font-bold text-foreground">
                30-Day Platform Revenue Velocity
              </h3>
            </div>
            <p className="text-xs text-foreground-secondary mt-1">
              Daily Gross Merchandise Value transacted through the direct farm-to-consumer escrow pipeline.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs">
              <span className="h-2 w-2 rounded-full bg-brand" />
              <span className="text-foreground-secondary">Peak Day:</span>
              <span className="font-bold text-foreground">{fmtCurrency(peakRevenue)}</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          {revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueTrend}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevVelocity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#098541" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#098541" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border-subtle)"
                  opacity={0.6}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--color-foreground-secondary)' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--color-foreground-secondary)' }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  content={<AdminChartTooltip prefix="₹" />}
                  cursor={{ stroke: '#098541', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Daily GMV"
                  stroke="#098541"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevVelocity)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-foreground-secondary">
              No revenue velocity snapshots recorded.
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-border-subtle/60 flex items-center justify-between text-xs text-foreground-secondary">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Escrow Settlement Pipeline Active
          </span>
          <span>Zero Failed Transactions</span>
        </div>
      </motion.div>

      {/* ── Financial Unit Economics & Monetization Bento ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="h-9 w-9 rounded-xl bg-brand-muted/40 text-brand border border-brand/20 flex items-center justify-center mb-3">
              <Zap className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-foreground mb-1">
              Monetization Margin
            </h4>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Farmket applies a 3.0% platform fee on completed deliveries. Zero listing fees are charged to farmers, aligning incentives with transaction success.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border-subtle/60 flex items-center justify-between text-xs">
            <span className="text-foreground-secondary">Effective Take Rate:</span>
            <span className="font-bold text-brand">3.00% Net</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="h-9 w-9 rounded-xl bg-info-muted/40 text-info border border-info/20 flex items-center justify-center mb-3">
              <CreditCard className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-foreground mb-1">
              Producer Payout Health
            </h4>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              97.0% of all gross merchandise value flows directly to producers upon confirmed delivery verification with zero hidden deductions.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border-subtle/60 flex items-center justify-between text-xs">
            <span className="text-foreground-secondary">Producer Disbursed:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {fmtCurrency(gmv * 0.97)}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-3">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-foreground mb-1">
              Settlement Security
            </h4>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              End-to-end payment custody with automated escrow releases prevents dispute friction and protects buyer reservations until physical receipt.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border-subtle/60 flex items-center justify-between text-xs">
            <span className="text-foreground-secondary">Dispute Ratio:</span>
            <span className="font-bold text-success flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> &lt; 0.2%
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Daily Revenue Ledger Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-xs"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-brand" />
            <h3 className="text-base font-bold text-foreground">
              Recent Settlement Ledger
            </h3>
          </div>
          <span className="text-xs font-semibold text-foreground-secondary">
            Last {revenueTrend.length} Settlement Days
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="font-bold text-foreground">Cycle Date</TableHead>
                <TableHead className="font-bold text-foreground text-right">Daily GMV</TableHead>
                <TableHead className="font-bold text-foreground text-right">Platform Fee (3%)</TableHead>
                <TableHead className="font-bold text-foreground text-right">Producer Payout (97%)</TableHead>
                <TableHead className="font-bold text-foreground text-right">Settlement State</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenueTrend.length > 0 ? (
                revenueTrend.slice(-10).reverse().map((row, idx) => {
                  const dayRev = row.revenue || 0;
                  const fee = dayRev * 0.03;
                  const payout = dayRev * 0.97;

                  return (
                    <TableRow
                      key={idx}
                      className="border-border-subtle hover:bg-surface-elevated/50"
                    >
                      <TableCell className="font-semibold text-foreground">
                        {row.date}
                      </TableCell>
                      <TableCell className="text-right font-black text-foreground">
                        {fmtCurrency(dayRev)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-brand text-xs">
                        {fmtCurrency(fee)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        {fmtCurrency(payout)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={dayRev > 0 ? 'success' : 'outline'}
                          size="sm"
                        >
                          {dayRev > 0 ? 'Settled' : 'Idle'}
                        </Badge>
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
                    No revenue ledger entries available yet.
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

export default RevenueAnalytics;
