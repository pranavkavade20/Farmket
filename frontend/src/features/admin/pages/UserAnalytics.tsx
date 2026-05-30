import React, { useEffect, useState } from 'react';
import { adminAnalyticsService, type AdminUserData } from '../services/adminAnalyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

const UserAnalytics: React.FC = () => {
  const [data, setData] = useState<AdminUserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await adminAnalyticsService.getUserAnalytics();
        setData(response);
      } catch (error) {
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
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Analytics</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Track farmer and buyer growth over the last 6 months.</p>
      
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#111]">
        <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">User Registration Trend</h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.user_growth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', color: '#fff' }}
                cursor={{ fill: '#f3f4f6', opacity: 0.1 }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="farmer" name="Farmers" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="buyer" name="Buyers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
