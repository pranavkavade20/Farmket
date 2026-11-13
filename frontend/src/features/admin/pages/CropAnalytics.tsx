import React, { useEffect, useState } from 'react';
import {
  Sprout,
  Calendar,
  Leaf,
  Layers,
  Sparkles,
  Tractor,
  Clock,
  TrendingUp,
} from 'lucide-react';
import {
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
  PageSkeleton,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  CropStageBadge,
  type CropStage,
} from '@/components/ui';
import {
  KPICard,
  AdminChartTooltip,
  AdminAnalyticsNav,
} from '../components';
import {
  adminAnalyticsService,
  type AdminCropData,
} from '../services/adminAnalyticsService';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const CropAnalytics: React.FC = () => {
  const [data, setData] = useState<AdminCropData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    adminAnalyticsService
      .getCropAnalytics()
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        console.error('Failed to load crop analytics:', err);
        if (isMounted) toast.error('Failed to load crop analytics data');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageSkeleton />
      </div>
    );
  }

  const topCrops = data?.top_crops || [];
  const upcomingHarvests = data?.upcoming_harvests || [];

  const topCropLeader = topCrops[0]?.name || 'Produce';
  const topCropCount = topCrops[0]?.count || 0;
  const distinctCropsCount = topCrops.length;
  const scheduledHarvestsCount = upcomingHarvests.length;
  const totalTracked = data?.total_tracked_crops ?? (scheduledHarvestsCount + topCropCount);

  // Helper for days until harvest
  const getDaysUntil = (dateStr: string) => {
    try {
      const target = new Date(dateStr).getTime();
      const now = new Date().getTime();
      const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return 'Harvesting now';
      if (diffDays === 0) return 'Due today';
      if (diffDays === 1) return 'Tomorrow';
      return `In ${diffDays} days`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ── Page Header ── */}
      <PageHeader
        title="Crop Intelligence & Harvest Forecast"
        description="Monitor agricultural production cycles, cultivate variety volume rankings, and track real-time harvest readiness timelines."
        badge={
          <Badge variant="outline" className="border-brand/30 bg-brand-muted/30 text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse mr-1" />
            Agronomic Radar
          </Badge>
        }
        backLink={{
          to: '/dashboard/admin/executive',
          label: 'Executive Hub',
        }}
      />

      {/* ── Cockpit Sub-Navigation ── */}
      <AdminAnalyticsNav />

      {/* ── Top Metric Bento (4 KPIs) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Top Cultivated Variety"
          value={topCropLeader}
          icon={<Sprout className="h-5 w-5" />}
          deltaLabel={`${topCropCount} active listings`}
          description="Most prominent crop across regions"
          variant="brand"
          delay={0}
        />
        <KPICard
          title="Tracked Crop Cycles"
          value={totalTracked.toLocaleString('en-IN')}
          icon={<Layers className="h-5 w-5" />}
          description="Total agricultural batches logged"
          variant="emerald"
          delay={0.05}
        />
        <KPICard
          title="Scheduled Harvests"
          value={scheduledHarvestsCount.toLocaleString('en-IN')}
          icon={<Calendar className="h-5 w-5" />}
          description="Batches ripening in next 30 days"
          variant="info"
          delay={0.1}
        />
        <KPICard
          title="Crop Varieties"
          value={distinctCropsCount.toLocaleString('en-IN')}
          icon={<Leaf className="h-5 w-5" />}
          description="Distinct listed produce species"
          variant="purple"
          delay={0.15}
        />
      </div>

      {/* ── Visualizations (Top Crops Bar + Harvest Pipeline Overview) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Top Cultivated Produce Horizontal Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-7 rounded-2xl border border-border-subtle bg-surface p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5 text-brand" />
              <h3 className="text-base font-bold text-foreground">
                Top Cultivated Produce Varieties
              </h3>
            </div>
            <p className="text-xs text-foreground-secondary mb-4">
              Ranked distribution of listings and production volume by crop name.
            </p>

            <div className="h-72 w-full">
              {topCrops.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topCrops}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
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
                      width={90}
                    />
                    <Tooltip
                      content={<AdminChartTooltip suffix=" listings" />}
                      cursor={{ fill: 'var(--border-subtle)', opacity: 0.3 }}
                    />
                    <Bar
                      dataKey="count"
                      name="Listings"
                      fill="#10b981"
                      radius={[0, 6, 6, 0]}
                      maxBarSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-foreground-secondary">
                  No crops logged in the system.
                </div>
              )}
            </div>

            {/* Quick Rank Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
              {topCrops.slice(0, 3).map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs"
                >
                  <span className="font-semibold text-foreground truncate mr-2">
                    #{i + 1} {c.name}
                  </span>
                  <span className="font-bold text-brand shrink-0">
                    {c.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border-subtle/60 text-xs text-foreground-secondary flex items-center justify-between">
            <span>Production Dominance</span>
            <span className="font-bold text-foreground">
              {topCropLeader} ({(topCropCount / (totalTracked || 1) * 100).toFixed(0)}% Share)
            </span>
          </div>
        </motion.div>

        {/* Right: Agronomic Pipeline & Readiness Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-5 rounded-2xl border border-border-subtle bg-surface p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-5 w-5 text-brand" />
              <h3 className="text-base font-bold text-foreground">
                Ripening & Harvest Radar
              </h3>
            </div>
            <p className="text-xs text-foreground-secondary mb-4">
              Next scheduled harvest dates across verified regional producers.
            </p>

            <div className="space-y-3">
              {upcomingHarvests.length > 0 ? (
                upcomingHarvests.slice(0, 4).map((harvest, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-border-subtle bg-surface-elevated flex items-center justify-between gap-3 group hover:border-brand/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-foreground truncate">
                          {harvest.product}
                        </p>
                        {harvest.organic && (
                          <Badge variant="success" size="sm" className="px-1.5 py-0 text-[10px]">
                            Organic
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-foreground-secondary truncate flex items-center gap-1 mt-0.5">
                        <Tractor className="h-3 w-3 shrink-0" />
                        {harvest.farmer}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                        <Clock className="h-3 w-3" />
                        {getDaysUntil(harvest.expected_date)}
                      </div>
                      <p className="text-[10px] text-foreground-secondary mt-1">
                        {harvest.expected_date}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-foreground-secondary text-xs">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40 text-brand" />
                  No upcoming harvest events logged in this period.
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border-subtle/60 text-xs text-foreground-secondary flex items-center justify-between">
            <span>Forecast Window</span>
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-brand" /> Next 30 Calendar Days
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Scheduled Harvest Pipeline Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-xs"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand" />
            <h3 className="text-base font-bold text-foreground">
              Detailed Harvest Forecast Pipeline
            </h3>
          </div>
          <span className="text-xs font-semibold text-foreground-secondary">
            {upcomingHarvests.length} Batches Ripening
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="font-bold text-foreground">Crop / Produce</TableHead>
                <TableHead className="font-bold text-foreground">Farmer / Producer</TableHead>
                <TableHead className="font-bold text-foreground">Cultivation Stage</TableHead>
                <TableHead className="font-bold text-foreground text-right">Expected Harvest</TableHead>
                <TableHead className="font-bold text-foreground text-right">Est. Yield</TableHead>
                <TableHead className="font-bold text-foreground text-right">Certification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingHarvests.length > 0 ? (
                upcomingHarvests.map((row, idx) => {
                  const stage = (row.stage || 'GROWING') as CropStage;

                  return (
                    <TableRow
                      key={idx}
                      className="border-border-subtle hover:bg-surface-elevated/50"
                    >
                      <TableCell className="font-bold text-foreground">
                        {row.product}
                      </TableCell>
                      <TableCell className="text-foreground-secondary font-medium">
                        <div className="flex items-center gap-1.5">
                          <Tractor className="h-3.5 w-3.5 text-brand" />
                          {row.farmer}
                        </div>
                      </TableCell>
                      <TableCell>
                        <CropStageBadge stage={stage} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-bold text-foreground text-xs">
                          {row.expected_date}
                        </div>
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                          {getDaysUntil(row.expected_date)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-black text-foreground">
                        {row.expected_quantity
                          ? `${row.expected_quantity.toLocaleString('en-IN')} kg`
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={row.organic ? 'success' : 'outline'}
                          size="sm"
                        >
                          {row.organic ? 'Organic' : 'Standard'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-foreground-secondary text-xs"
                  >
                    No upcoming harvests logged in the crop growth database.
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

export default CropAnalytics;
