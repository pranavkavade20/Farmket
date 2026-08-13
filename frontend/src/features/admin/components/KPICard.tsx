import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  description?: string;
  delay?: number;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, description, delay = 0 }) => {
  const isPositive = trend && trend > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm hover:shadow-md transition-shadow duration-200 group"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{title}</p>
        <div className="rounded-lg bg-brand-muted/50 p-2 text-brand group-hover:scale-110 transition-transform duration-200">
          {icon}
        </div>
      </div>
      
      <div className="mt-4 flex items-baseline gap-2">
        <h3 className="text-3xl font-bold text-foreground">{value}</h3>
      </div>
      
      {(trend !== undefined || description) && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {trend !== undefined && (
            <span className={`flex items-center gap-1 font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {Math.abs(trend)}%
            </span>
          )}
          {description && (
            <span className="text-muted">{description}</span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default KPICard;
