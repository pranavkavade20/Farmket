import React from 'react';
import type { CropGrowth } from '@/types/crops';
import { Leaf, Calendar, ArrowRight, Activity, Droplets } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { openStageUpdateModal } from '../cropsSlice';
import { motion } from 'framer-motion';
import { SegmentedProgress } from './SegmentedProgress';

interface CropCardProps {
  crop: CropGrowth;
  index?: number;
}

export const CropCard: React.FC<CropCardProps> = ({ crop, index = 0 }) => {
  const dispatch = useDispatch();
  
  const handleUpdateStage = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(openStageUpdateModal(crop.id));
  };

  const getStatusConfig = (stage: string) => {
    switch(stage) {
      case 'HARVESTED': return { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success', label: 'Harvested ✅' };
      case 'NEAR_HARVEST': return { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning', label: 'Harvest Ready 🌾' };
      case 'GROWING': return { bg: 'bg-info/10', text: 'text-info', dot: 'bg-info', label: 'Growing 🌿' };
      case 'PLANTED': return { bg: 'bg-brand/10', text: 'text-brand', dot: 'bg-brand', label: 'Seeded 🌱' };
      default: return { bg: 'bg-surface-elevated', text: 'text-foreground', dot: 'bg-muted', label: stage?.replace(/_/g, ' ') };
    }
  };

  const status = getStatusConfig(crop.stage);
  const imageUrl = crop.product_details?.images?.[0]?.image || crop.product_details?.image; 
  const isActionable = crop.stage !== 'HARVESTED';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
      className="group relative flex flex-col h-[440px] rounded-3xl bg-surface border border-border-subtle overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out"
    >
      {/* Top: Image Hero */}
      <div className="relative h-[45%] w-full overflow-hidden bg-surface-elevated shrink-0">
        <div className="w-full h-full transform transition-transform duration-500 ease-out group-hover:scale-110">
          {imageUrl ? (
            <img src={imageUrl} alt={crop.crop_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand/20 via-surface to-accent/10 opacity-80" />
          )}
        </div>
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-surface/90" />

        {/* Floating Status Pill */}
        <div className="absolute top-4 left-4 z-10">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-sm bg-surface/80`}>
            <span className="relative flex h-2 w-2">
              {isActionable && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.dot}`}></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${status.dot}`}></span>
            </span>
            <span className={`text-xs font-semibold tracking-wide ${status.text}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Organic Badge */}
        {crop.organic && (
          <div className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-surface/80 backdrop-blur-md border border-white/10 text-brand shadow-sm">
            <Leaf className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Middle: Crop Information & Bottom: Metrics */}
      <div className="flex-1 flex flex-col p-5 bg-surface relative z-10">
        
        {/* Title Section */}
        <div className="mb-4">
          <h3 className="text-xl font-display font-bold text-foreground leading-tight tracking-tight mb-1 group-hover:text-brand transition-colors duration-300">
            {crop.product_details?.name || 'Unknown Crop'}
          </h3>
          <div className="flex items-center gap-3 text-xs font-medium text-muted">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(crop.sowing_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
            <div className="w-1 h-1 rounded-full bg-border-strong" />
            <div className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5" />
              Optimal
            </div>
          </div>
        </div>

        {/* Modern Segmented Progress */}
        <div className="mb-auto mt-2">
          <SegmentedProgress currentStage={crop.stage} />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4 opacity-100 transition-all duration-300 group-hover:opacity-0 group-hover:translate-y-4">
          <div className="p-3 rounded-2xl bg-surface-elevated border border-border-subtle flex flex-col justify-center">
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">Harvest</p>
            <p className="text-sm font-semibold text-foreground truncate">
              {new Date(crop.expected_harvest_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-surface-elevated border border-border-subtle flex flex-col justify-center">
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">Available</p>
            <p className="text-sm font-semibold text-foreground truncate">
              {crop.available_quantity} <span className="text-xs font-medium text-muted">{crop.product_details?.unit || 'u'}</span>
            </p>
          </div>
        </div>

        {/* Footer: Quick Actions */}
        <div className="absolute inset-x-5 bottom-5 flex gap-2 opacity-0 translate-y-4 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
          <button 
            onClick={handleUpdateStage}
            disabled={!isActionable}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-brand text-white hover:bg-brand-hover active:scale-95 transition-all duration-200 rounded-xl text-sm font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Activity className="w-4 h-4" />
            Update Status
          </button>
          <button className="flex items-center justify-center w-12 bg-surface hover:bg-surface-elevated text-foreground active:scale-95 transition-all duration-200 rounded-xl border border-border-strong shadow-sm">
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </motion.div>
  );
};
