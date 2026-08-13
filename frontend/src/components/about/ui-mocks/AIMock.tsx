import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit, Activity, Zap } from 'lucide-react';

export const AIMock = ({ className = '', style }: { className?: string, style?: React.CSSProperties }) => {
  return (
    <motion.div
      style={style}
      className={`relative w-80 rounded-2xl bg-surface-elevated border border-border-subtle shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border-subtle bg-background/50">
        <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center">
          <BrainCircuit className="w-4 h-4 text-brand" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">Farmket AI</span>
          <span className="text-xs text-foreground-secondary flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span>
            Active Analysis
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-4">
        {/* Animated Processing State */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border-subtle shadow-inner relative overflow-hidden">
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-brand/10 to-transparent skew-x-12"
          />
          <div className="flex items-center gap-2 text-xs font-medium relative z-10">
            <Activity className="w-3.5 h-3.5 text-foreground-secondary" />
            Analyzing market trends
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-3.5 h-3.5 border-2 border-brand/30 border-t-brand rounded-full relative z-10"
          />
        </div>

        {/* Suggestion Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex flex-col gap-3 p-4 rounded-xl bg-brand/5 border border-brand/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand/10 rounded-bl-full pointer-events-none flex items-start justify-end p-2">
            <Sparkles className="w-4 h-4 text-brand/50" />
          </div>
          
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand" />
            <span className="font-semibold text-sm">Price Optimization</span>
          </div>
          <p className="text-xs text-foreground-secondary leading-relaxed">
            Based on current local demand and weather forecasts, increasing your price by <span className="font-bold text-foreground">8%</span> will maximize revenue without slowing sales velocity.
          </p>
          <div className="flex items-center gap-2 mt-1">
            <button className="flex-1 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold shadow-sm hover:bg-brand/90 transition-colors">
              Apply Strategy
            </button>
            <button className="flex-1 py-1.5 rounded-lg bg-surface border border-border-subtle text-foreground text-xs font-medium hover:bg-surface-elevated transition-colors">
              View Details
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
