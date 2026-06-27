import React, { useEffect, useState } from 'react';
import { Users, ShoppingBag, Package, DollarSign, Download, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../components/KPICard';
import { adminAnalyticsService, type AdminExecutiveData } from '../services/adminAnalyticsService';
import { toast } from "sonner";

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminExecutiveData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await adminAnalyticsService.getExecutiveOverview();
        setData(response);
      } catch (error) {
        console.error('Failed to fetch admin analytics:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExport = async (type: string) => {
    try {
      await adminAnalyticsService.exportReport(type);
      toast.success(`${type} report downloaded successfully`);
    } catch (error) {
      toast.error(`Failed to export ${type} report`);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-600"></div>
      </div>
    );
  }

  const kpis = data.kpis;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Executive Overview</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor platform health, marketplace performance, and business growth.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('users')}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-[#111] dark:text-gray-200 dark:border-gray-800 dark:hover:bg-gray-800/50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Users Report
          </button>
          <button
            onClick={() => handleExport('orders')}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Orders Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={`₹${kpis.total_revenue.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          description="Gross Marketplace Value"
          delay={0}
        />
        <KPICard
          title="Active Users"
          value={kpis.active_users.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          description="In the last 7 days"
          delay={0.1}
        />
        <KPICard
          title="Total Orders"
          value={kpis.total_orders.toLocaleString()}
          icon={<ShoppingBag className="h-5 w-5" />}
          description="Lifetime orders"
          delay={0.2}
        />
        <KPICard
          title="Total Products"
          value={kpis.total_products.toLocaleString()}
          icon={<Package className="h-5 w-5" />}
          trend={12} // Example static trend for now
          description="Active listings"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Trend Chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#111] shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">Revenue Trend (30 Days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenue_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#4ade80' }}
                  formatter={(value: number) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#111] shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">User Growth</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.user_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFarmers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBuyers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="farmers" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorFarmers)" name="Farmers" />
                <Area type="monotone" dataKey="buyers" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorBuyers)" name="Buyers" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
