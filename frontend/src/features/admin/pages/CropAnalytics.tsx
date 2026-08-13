import React, { useEffect, useState } from 'react';
import { adminAnalyticsService, type AdminCropData } from '../services/adminAnalyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';
import { toast } from "sonner";

const CropAnalytics: React.FC = () => {
  const [data, setData] = useState<AdminCropData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await adminAnalyticsService.getCropAnalytics();
        setData(response);
      } catch {
        toast.error('Failed to load crop analytics');
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Crop Analytics</h1>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-foreground">Most Listed Crops</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_crops} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: '#f3f4f6', opacity: 0.1 }}
                />
                <Bar dataKey="count" name="Listings" fill="#16a34a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-foreground">Upcoming Harvests</h3>
          <div className="overflow-hidden">
            <div className="space-y-4">
              {data.upcoming_harvests.length > 0 ? (
                data.upcoming_harvests.map((harvest, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-border-subtle p-4 bg-surface-elevated">
                    <div>
                      <p className="font-semibold text-foreground">{harvest.product}</p>
                      <p className="text-sm text-muted">Farmer: {harvest.farmer}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-500">
                      <Calendar className="h-4 w-4" />
                      {harvest.expected_date}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No upcoming harvests in tracking.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropAnalytics;
