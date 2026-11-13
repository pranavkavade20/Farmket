import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  deltaLabel?: string;
  description?: string;
  variant?: 'brand' | 'info' | 'warning' | 'purple' | 'emerald';
  delay?: number;
  onClick?: () => void;
}

const variantStyles = {
  brand: 'bg-brand-muted/40 border-brand/20 text-brand',
  info: 'bg-info-muted/40 border-info/20 text-info',
  warning: 'bg-warning-muted/40 border-warning/20 text-warning',
  purple: 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
};

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  trend,
  deltaLabel,
  description,
  variant = 'brand',
  delay = 0,
  onClick,
}) => {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      onClick={onClick}
      className={`rounded-2xl border border-border-subtle bg-surface p-5 shadow-xs transition-all duration-200 group flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-brand hover:shadow-sm' : 'hover:border-border-strong hover:shadow-2xs'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary truncate">
          {title}
        </span>
        <div
          className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
            variantStyles[variant]
          }`}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <h3 className="text-2xl lg:text-3xl font-display font-black text-foreground tracking-tight">
          {value}
        </h3>
      </div>

      {(trend !== undefined || deltaLabel || description) && (
        <div className="flex items-center gap-1.5 text-xs font-medium flex-wrap pt-1 border-t border-border-subtle/50">
          {trend !== undefined && (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                isPositive ? 'text-success' : 'text-danger'
              }`}
            >
              {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          {deltaLabel && (
            <span className="text-success font-semibold flex items-center gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {deltaLabel}
            </span>
          )}
          {description && (
            <span className="text-foreground-secondary">{description}</span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default KPICard;
