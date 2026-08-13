import { motion } from 'framer-motion';
import { Search, Sparkles, Filter, ChevronRight } from 'lucide-react';

export const SearchInterfaceMock = ({ className = '', style }: { className?: string, style?: React.CSSProperties }) => {
  return (
    <motion.div
      style={style}
      className={`w-full max-w-2xl bg-surface-elevated border border-border-subtle rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl ${className}`}
    >
      {/* Search Input Area */}
      <div className="flex items-center gap-3 p-4 border-b border-border-subtle bg-background/50">
        <Search className="w-5 h-5 text-foreground-secondary" />
        <div className="flex-1 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 1, duration: 2, ease: "linear" }}
            className="whitespace-nowrap overflow-hidden border-r-2 border-brand pr-1 font-display text-lg"
          >
            Looking for 500kg organic tomatoes...
          </motion.div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 rounded bg-surface border border-border-subtle flex items-center gap-1 text-xs text-foreground-secondary font-medium cursor-default">
            <Filter className="w-3 h-3" /> Filters
          </div>
          <div className="w-8 h-8 rounded bg-brand flex items-center justify-center text-white cursor-default shadow-sm">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* AI Processing / Results Area */}
      <div className="p-4 bg-background/80 flex flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 3, duration: 0.5 }}
          className="flex items-start gap-3 p-3 rounded-xl bg-brand/10 border border-brand/20"
        >
          <div className="mt-0.5">
            <Sparkles className="w-4 h-4 text-brand animate-pulse" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-brand">AI Match Found</span>
            <span className="text-xs text-foreground-secondary">
              Found 3 farms matching "organic tomatoes" within 50 miles. High quality matches available.
            </span>
          </div>
        </motion.div>

        {/* Skeleton Results */}
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 3.5 + i * 0.1, duration: 0.4 }}
              className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle bg-surface/50"
            >
              <div className="w-10 h-10 rounded bg-background border border-border-subtle flex items-center justify-center text-xs font-medium text-foreground-secondary">
                F{i}
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="w-1/3 h-2 rounded-full bg-border"></div>
                <div className="w-1/4 h-2 rounded-full bg-border-subtle"></div>
              </div>
              <div className="w-16 h-6 rounded-md bg-brand/10 border border-brand/20"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
