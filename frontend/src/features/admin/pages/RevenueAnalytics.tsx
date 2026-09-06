import React, { useEffect, useState } from 'react';
import { adminAnalyticsService, type AdminExecutiveData } from '../services/adminAnalyticsService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../components/KPICard';
import { DollarSign, TrendingUp } from 'lucide-react';
import { toast } from "sonner";

const RevenueAnalytics: React.FC = () => {
  const [data, setData] = useState<AdminExecutiveData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await adminAnalyticsService.getExecutiveOverview();
        setData(response);
      } catch {
        toast.error('Failed to load revenue analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand"></div>
      </div>
    );
  }

  const kpis = data.kpis;

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">Revenue Analytics</h1>
        <p className="mt-1 text-sm font-medium text-foreground-secondary">Detailed revenue, average order value, and financial performance.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <KPICard
          title="Total Revenue"
          value={`₹${kpis.total_revenue.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          description="Lifetime Earnings"
        />
        <KPICard
          title="Revenue per User (Avg)"
          value={`₹${((kpis.total_revenue || 0) / (kpis.total_buyers || 1)).toFixed(2)}`}
          icon={<TrendingUp className="h-5 w-5" />}
          description="Average LTV per Buyer"
        />
        <KPICard
          title="Average Order Value"
          value={`₹${((kpis.total_revenue || 0) / (kpis.total_orders || 1)).toFixed(2)}`}
          icon={<DollarSign className="h-5 w-5" />}
          description="AOV"
        />
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-foreground">Revenue Trend</h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.revenue_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenueAnalytics" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.15)" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(val) => `₹${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', borderRadius: '0.75rem', color: 'var(--color-foreground)' }}
                itemStyle={{ color: '#10B981' }}
                formatter={(value: number) => [`₹${value}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueAnalytics)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
