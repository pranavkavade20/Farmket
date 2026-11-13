import React from 'react';
import type { CropGrowth } from '@/types/crops';
import { SegmentedProgress } from './SegmentedProgress';
import { ShoppingCart, Bell } from 'lucide-react';
import { useAppDispatch } from '@/app/hooks';
import { openReservationModal } from '../cropsSlice';
import { useFollowCropMutation, useUnfollowCropMutation } from '../cropsApi';
import { useAuth } from '@/features/auth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button, Badge, QualityBadge } from '@/components/ui';
import { CropStageBadge } from './CropStageBadge';
import { cn } from '@/lib/utils/cn';

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

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (crop.is_followed) {
        await unfollowCrop(crop.id).unwrap();
        toast.success(`Unfollowed ${crop.product_details?.name || 'crop'}`);
      } else {
        await followCrop(crop.id).unwrap();
        toast.success(`Following ${crop.product_details?.name || 'crop'} for harvest updates`);
      }
    } catch {
      toast.error('Failed to update follow status');
    }
  };

  // Calculate days remaining
  const daysRemaining = Math.ceil(
    (new Date(crop.expected_harvest_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  const imageUrl = crop.product_details?.images?.[0]?.image;
  const isAvailable = Number(crop.available_quantity) > 0;
  const unit = crop.product_details?.unit || 'unit';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col h-[490px] rounded-3xl bg-surface border border-border-subtle overflow-hidden shadow-xs hover:shadow-xl hover:border-brand/40 transition-all duration-300 ease-out"
    >
      {/* Top: Image Hero */}
      <div className="relative h-[42%] w-full overflow-hidden bg-surface-elevated shrink-0">
        <div className="w-full h-full transform transition-transform duration-500 ease-out group-hover:scale-105">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={crop.product_details?.name || 'Crop'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand/15 via-surface to-brand/5 text-muted">
              <span className="text-3xl mb-1 select-none">🌱</span>
              <span className="text-xs font-semibold">Farm Verified Crop</span>
            </div>
          )}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

        {/* Floating Badges */}
        <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 flex-wrap">
          <Badge
            variant={daysRemaining <= 3 ? 'pending' : 'in-progress'}
            size="sm"
            className="shadow-xs backdrop-blur-md font-bold"
          >
            {daysRemaining > 0
              ? `Harvest in ${daysRemaining} ${daysRemaining === 1 ? 'Day' : 'Days'}`
              : 'Harvest Ready!'}
          </Badge>
          <CropStageBadge stage={crop.stage} size="sm" className="shadow-xs backdrop-blur-md" />
        </div>

        {/* Organic Badge */}
        {crop.organic && (
          <div className="absolute top-3.5 right-3.5 z-10">
            <QualityBadge size="sm" className="shadow-xs backdrop-blur-md" />
          </div>
        )}
      </div>

      {/* Middle: Content */}
      <div className="flex-1 flex flex-col p-5 bg-surface relative z-10 justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-xs text-muted font-semibold truncate">
              {crop.farmer_name || 'Local Farm'}
            </p>
            {crop.product_details?.category && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-elevated text-muted border border-border-subtle shrink-0">
                {crop.product_details.category}
              </span>
            )}
          </div>

          <h3 className="text-lg font-display font-bold text-foreground leading-snug tracking-tight group-hover:text-brand transition-colors line-clamp-1">
            {crop.product_details?.name || 'Fresh Harvest Crop'}
          </h3>

          <p className="text-xs text-foreground-secondary mt-1 line-clamp-2 leading-relaxed">
            {crop.product_details?.description || crop.notes || 'Locally grown with sustainable agricultural practices.'}
          </p>

          <div className="mt-3">
            <SegmentedProgress currentStage={crop.stage} />
          </div>
        </div>

        {/* Metrics Grid */}
        <div>
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-surface-elevated border border-border-subtle my-3">
            <div>
              <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">
                Available
              </p>
              <p className="text-sm font-bold text-foreground truncate tabular-nums">
                {crop.available_quantity}{' '}
                <span className="text-xs font-semibold text-muted">{unit}</span>
              </p>
            </div>
            <div className="border-l border-border-subtle pl-2.5">
              <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">
                Target Price
              </p>
              <p className="text-sm font-bold text-brand truncate tabular-nums">
                {crop.product_details?.price ? `₹${crop.product_details.price}` : 'Market Rate'}{' '}
                <span className="text-xs font-semibold text-muted">/{unit}</span>
              </p>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleFollow}
              disabled={isFollowing || isUnfollowing}
              className={cn(
                'w-11 h-11 rounded-xl border transition-all flex items-center justify-center cursor-pointer shrink-0',
                crop.is_followed
                  ? 'bg-brand/10 border-brand/20 text-brand'
                  : 'bg-surface border-border-strong text-muted hover:bg-surface-elevated hover:text-foreground'
              )}
              title={crop.is_followed ? 'Unfollow harvest notifications' : 'Follow for harvest notifications'}
              aria-label={crop.is_followed ? 'Unfollow crop' : 'Follow crop updates'}
            >
              <Bell className={cn('w-4 h-4', crop.is_followed && 'fill-current')} />
            </button>

            {user?.user_type === 'farmer' || user?.user_type === 'admin' ? null : (
              <Button
                type="button"
                variant="brand"
                size="md"
                onClick={handleReserve}
                disabled={!isAvailable}
                leftIcon={<ShoppingCart className="w-4 h-4" />}
                className="flex-1 font-bold h-11 rounded-xl shadow-xs"
              >
                {isAvailable ? 'Pre-Book Harvest' : 'Fully Reserved'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BuyerCropCard;
