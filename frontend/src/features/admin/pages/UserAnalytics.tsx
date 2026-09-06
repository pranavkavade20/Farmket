import React, { useEffect, useState } from 'react';
import { adminAnalyticsService, type AdminUserData } from '../services/adminAnalyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from "sonner";

const UserAnalytics: React.FC = () => {
  const [data, setData] = useState<AdminUserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await adminAnalyticsService.getUserAnalytics();
        setData(response);
      } catch {
        toast.error('Failed to load user analytics');
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

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">User Analytics</h1>
        <p className="mt-1 text-sm font-medium text-foreground-secondary">Track farmer and buyer growth over the last 6 months.</p>
      </div>
      
      <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-foreground">User Registration Trend</h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.user_growth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.15)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', borderRadius: '0.75rem', color: 'var(--color-foreground)' }}
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="farmer" name="Farmers" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="buyer" name="Buyers" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
