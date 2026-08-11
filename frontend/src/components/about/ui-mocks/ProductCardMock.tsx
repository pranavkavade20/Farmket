import { motion } from 'framer-motion';
import { Leaf, MapPin, Package, Sprout } from 'lucide-react';

export const ProductCardMock = ({ className = '', style }: { className?: string, style?: any }) => {
  return (
    <motion.div
      style={style}
      className={`w-[320px] rounded-2xl border border-border-subtle bg-surface-elevated shadow-xl overflow-hidden backdrop-blur-xl flex flex-col ${className}`}
    >
      {/* Card Image area */}
      <div className="h-40 bg-brand/10 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated to-transparent z-10"></div>
        <Sprout className="w-16 h-16 text-brand/30 z-0" />
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <span className="px-2 py-1 rounded-md bg-white/90 text-black text-xs font-bold shadow-sm">
            Organic
          </span>
          <span className="px-2 py-1 rounded-md bg-brand text-white text-xs font-bold shadow-sm">
            Harvesting
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-4 relative z-20">
        <div>
          <h3 className="font-display font-semibold text-xl">Premium Tomatoes</h3>
          <div className="flex items-center gap-1 text-foreground-secondary text-xs mt-1">
            <MapPin className="w-3 h-3" />
            <span>Green Valley Farms</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 p-2 rounded-lg bg-background border border-border-subtle">
            <span className="text-[10px] uppercase tracking-wider text-foreground-secondary font-medium">Available</span>
            <div className="flex items-center gap-1 text-sm font-semibold">
              <Package className="w-3 h-3 text-brand" /> 500 kg
            </div>
          </div>
          <div className="flex flex-col gap-1 p-2 rounded-lg bg-background border border-border-subtle">
            <span className="text-[10px] uppercase tracking-wider text-foreground-secondary font-medium">Price</span>
            <div className="flex items-center gap-1 text-sm font-semibold">
              $2.40 / kg
            </div>
          </div>
        </div>

        {/* Quality score bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-foreground-secondary flex items-center gap-1">
              <Leaf className="w-3 h-3" /> Quality Score
            </span>
            <span className="font-medium text-brand">98%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-border-subtle overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '98%' }}
              transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full bg-brand rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
