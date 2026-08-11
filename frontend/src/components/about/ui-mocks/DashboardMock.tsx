import { motion } from 'framer-motion';
import { BarChart3, LineChart, Package, Sprout, TrendingUp, Users } from 'lucide-react';

export const DashboardMock = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`flex w-full max-w-4xl rounded-2xl border border-border-subtle bg-surface-elevated shadow-2xl overflow-hidden backdrop-blur-xl ${className}`}>
      {/* Sidebar */}
      <div className="w-48 border-r border-border-subtle bg-background/50 p-4 hidden md:flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-brand flex items-center justify-center">
            <Sprout className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm">Farmket</span>
        </div>
        <div className="space-y-1">
          {['Overview', 'Inventory', 'Orders', 'Analytics'].map((item, i) => (
            <div
              key={item}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                i === 0 ? 'bg-brand/10 text-brand' : 'text-foreground-secondary hover:bg-surface'
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-background/80 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-lg">Farm Overview</h3>
            <p className="text-xs text-foreground-secondary">Real-time performance metrics</p>
          </div>
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-surface flex items-center justify-center text-xs font-medium z-10 shadow-sm">
                U{i}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Yield', value: '4,200 kg', icon: Package, trend: '+12%' },
            { label: 'Revenue', value: '$12,450', icon: TrendingUp, trend: '+8%' },
            { label: 'Active Buyers', value: '24', icon: Users, trend: '+3' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="p-4 rounded-xl border border-border-subtle bg-surface flex flex-col gap-2 shadow-sm"
            >
              <div className="flex items-center gap-2 text-foreground-secondary text-xs font-medium">
                <stat.icon className="w-4 h-4" />
                {stat.label}
              </div>
              <div className="flex items-end justify-between">
                <span className="font-semibold text-xl">{stat.value}</span>
                <span className="text-xs text-brand font-medium">{stat.trend}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart Area */}
        <div className="flex-1 border border-border-subtle rounded-xl bg-surface p-4 flex flex-col gap-4 min-h-[160px] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground-secondary">
              <LineChart className="w-4 h-4" />
              Demand Forecast
            </div>
            <div className="text-xs font-semibold text-brand">High Demand Expected</div>
          </div>
          <div className="flex-1 w-full flex items-end gap-2 px-2 pb-2">
            {[30, 45, 25, 60, 75, 40, 90, 65, 80].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: "0%" }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`flex-1 rounded-t-sm ${i === 6 ? 'bg-brand' : 'bg-brand/20'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
