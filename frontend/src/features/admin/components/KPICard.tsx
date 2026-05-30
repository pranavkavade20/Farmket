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
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#111] hover:shadow-md transition-shadow duration-200 group"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <div className="rounded-lg bg-green-50 p-2 text-green-600 dark:bg-green-900/20 dark:text-green-400 group-hover:scale-110 transition-transform duration-200">
          {icon}
        </div>
      </div>
      
      <div className="mt-4 flex items-baseline gap-2">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
      </div>
      
      {(trend !== undefined || description) && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {trend !== undefined && (
            <span className={`flex items-center gap-1 font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {Math.abs(trend)}%
            </span>
          )}
          {description && (
            <span className="text-gray-500 dark:text-gray-400">{description}</span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default KPICard;
