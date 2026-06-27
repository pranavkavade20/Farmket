import React from 'react';
import type { CropGrowth } from '@/types/crops';
import { SegmentedProgress } from './SegmentedProgress';
import { Leaf, Clock, ShoppingCart, Bell } from 'lucide-react';
import { useAppDispatch } from '@/app/hooks';
import { openReservationModal } from '../cropsSlice';
import { useFollowCropMutation, useUnfollowCropMutation } from '../cropsApi';
import { useAuth } from '@/features/auth';
import { toast } from "sonner";
import { motion } from 'framer-motion';

interface BuyerCropCardProps {
  crop: CropGrowth;
}

export const BuyerCropCard: React.FC<BuyerCropCardProps> = ({ crop }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [followCrop, { isLoading: isFollowing }] = useFollowCropMutation();
  const [unfollowCrop, { isLoading: isUnfollowing }] = useUnfollowCropMutation();
  
  const handleReserve = () => {
    dispatch(openReservationModal(crop.id));
  };

  const handleToggleFollow = async () => {
    try {
      if (crop.is_followed) {
        await unfollowCrop(crop.id).unwrap();
        toast.success('Unfollowed crop');
      } else {
        await followCrop(crop.id).unwrap();
        toast.success('Following crop for updates');
      }
    } catch (err) {
      toast.error('Failed to update follow status');
    }
  };

  // Calculate days remaining
  const daysRemaining = Math.ceil((new Date(crop.expected_harvest_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  
  let countdownColor = "text-success bg-success-muted border-success/20";
  if (daysRemaining < 7) {
    countdownColor = "text-danger bg-danger-muted border-danger/20";
  } else if (daysRemaining <= 15) {
    countdownColor = "text-warning bg-warning-muted border-warning/20";
  }

  const imageUrl = crop.product_details?.images?.[0]?.image || crop.product_details?.image;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col h-[480px] rounded-3xl bg-surface border border-border-subtle overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out"
    >
      {/* Top: Image Hero */}
      <div className="relative h-[40%] w-full overflow-hidden bg-surface-elevated shrink-0">
        <div className="w-full h-full transform transition-transform duration-500 ease-out group-hover:scale-110">
          {imageUrl ? (
            <img src={imageUrl} alt={crop.product_details?.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted font-medium bg-gradient-to-br from-brand/20 via-surface to-accent/10 opacity-80">
              No image available
            </div>
          )}
        </div>
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-surface/90" />

        {/* Floating Countdown Pill */}
        <div className="absolute top-4 left-4 z-10">
          <div className={`px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm flex items-center gap-1.5 border ${countdownColor}`}>
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-bold tracking-wide">
              {daysRemaining > 0 ? `Harvest in ${daysRemaining} Days` : 'Ready Soon!'}
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

      {/* Middle: Info */}
      <div className="flex-1 flex flex-col p-5 bg-surface relative z-10">
        <div className="mb-3">
          <p className="text-xs text-muted mb-1 font-medium">{crop.farmer_name}</p>
          <h3 className="text-xl font-display font-bold text-foreground leading-tight tracking-tight mb-1 group-hover:text-brand transition-colors duration-300 line-clamp-1">
            {crop.product_details?.name || 'Unknown Crop'}
          </h3>
          <p className="text-sm text-muted mt-1 line-clamp-2 leading-relaxed">
            {crop.product_details?.description || crop.notes}
          </p>
        </div>

        <div className="mb-auto mt-2">
          <SegmentedProgress currentStage={crop.stage} />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 rounded-2xl bg-surface-elevated border border-border-subtle flex flex-col justify-center">
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">Available</p>
            <p className="text-sm font-semibold text-foreground truncate">
              {crop.available_quantity} <span className="text-xs font-medium text-muted">{crop.product_details?.unit || 'u'}</span>
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-surface-elevated border border-border-subtle flex flex-col justify-center text-right">
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">Est. Price</p>
            <p className="text-sm font-semibold text-brand truncate">
              ${crop.product_details?.price} <span className="text-xs font-medium text-muted">/{crop.product_details?.unit}</span>
            </p>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleToggleFollow}
            disabled={isFollowing || isUnfollowing}
            className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-center active:scale-95 ${
              crop.is_followed 
                ? 'bg-brand/10 border-brand/20 text-brand' 
                : 'bg-surface border-border-strong text-muted hover:bg-surface-elevated hover:text-foreground'
            }`}
            title={crop.is_followed ? 'Unfollow' : 'Get Notifications'}
          >
            <Bell className={`w-5 h-5 ${crop.is_followed ? 'fill-current' : ''}`} />
          </button>
          
          {user?.user_type === 'farmer' || user?.user_type === 'admin' ? null : (
            <button
              onClick={handleReserve}
              disabled={Number(crop.available_quantity) <= 0}
              className="flex-1 py-3 px-4 bg-brand hover:bg-brand-hover text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              Reserve Now
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
