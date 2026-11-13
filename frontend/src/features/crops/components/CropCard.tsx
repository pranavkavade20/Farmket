import React from 'react';
import type { CropGrowth } from '@/types/crops';
import { Calendar, ArrowRight, Activity, Users } from 'lucide-react';
import { useAppDispatch } from '@/app/hooks';
import { openStageUpdateModal, openCropDetail } from '../cropsSlice';
import { motion } from 'framer-motion';
import { CropLifecycleStepper } from './CropLifecycleStepper';
import { getHarvestTiming, formatCropQuantity } from '../utils/cropUtils';
import { Button, Badge, QualityBadge } from '@/components/ui';
import { CropStageBadge } from './CropStageBadge';

export interface CropCardProps {
  crop: CropGrowth;
  index?: number;
  onViewDetails?: (id: number) => void;
  onUpdateStage?: (id: number) => void;
}

export const CropCard: React.FC<CropCardProps> = ({ crop, index = 0, onViewDetails, onUpdateStage }) => {
  const dispatch = useAppDispatch();

  const handleUpdateStage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateStage) {
      onUpdateStage(crop.id);
    } else {
      dispatch(openStageUpdateModal(crop.id));
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(crop.id);
    } else {
      dispatch(openCropDetail(crop.id));
    }
  };

  const timing = getHarvestTiming(crop.expected_harvest_date, crop.stage, crop.actual_harvest_date);
  const imageUrl = crop.product_details?.images?.[0]?.image;
  const isHarvested = crop.stage === 'HARVESTED';

  const pendingReservations = crop.reservations?.filter((r) => r.reservation_status === 'PENDING') || [];
  const confirmedReservations = crop.reservations?.filter((r) => r.reservation_status === 'CONFIRMED') || [];
  const totalReservations = crop.reservations?.length || 0;

  const cropName = crop.product_details?.name || crop.crop_name || 'Crop';
  const unit = crop.product_details?.unit || 'units';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: Math.min(index * 0.04, 0.25) }}
      onClick={handleViewDetails}
      className="group relative flex flex-col rounded-2xl bg-surface border border-border-subtle overflow-hidden shadow-xs hover:shadow-lg hover:border-brand/40 transition-all duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-brand/20"
      tabIndex={0}
      role="article"
      aria-label={`Crop ${cropName}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleViewDetails();
        }
      }}
    >
      {/* 1. Header Banner / Thumbnail */}
      <div className="relative h-36 w-full overflow-hidden bg-surface-elevated shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={cropName}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand/10 via-surface to-brand/5 p-4 text-center">
            <span className="text-3xl mb-1 select-none">🌱</span>
            <span className="text-xs font-semibold text-muted">Farmket Verified Crop</span>
          </div>
        )}

        {/* Gradient backdrop for overlay badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25 pointer-events-none" />

        {/* Top Badges Row */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            <CropStageBadge stage={crop.stage} size="sm" className="shadow-xs backdrop-blur-md" />
          </div>

          {crop.organic && (
            <QualityBadge size="sm" className="shadow-xs backdrop-blur-md" />
          )}
        </div>

        {/* Bottom thumbnail tag: Timing pill */}
        <div className="absolute bottom-2.5 left-3 pointer-events-none">
          <Badge
            variant={
              timing.isOverdue
                ? 'failed'
                : timing.isToday
                ? 'pending'
                : timing.isHarvested
                ? 'success'
                : 'in-progress'
            }
            size="sm"
            className="shadow-xs backdrop-blur-md"
          >
            {timing.label}
          </Badge>
        </div>
      </div>

      {/* 2. Card Body */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between space-y-4">
        {/* Title & Sowing Date */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-display font-bold text-foreground leading-snug group-hover:text-brand transition-colors line-clamp-1">
              {cropName}
            </h3>
            {crop.product_details?.category && (
              <span className="text-[11px] font-semibold text-muted bg-surface-elevated px-2 py-0.5 rounded-md border border-border-subtle shrink-0">
                {crop.product_details.category}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Sown {new Date(crop.sowing_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
            <span>•</span>
            <span>Est. Harvest {timing.formattedDate}</span>
          </div>
        </div>

        {/* Stepper Lifecycle */}
        <div className="py-1">
          <CropLifecycleStepper currentStage={crop.stage} />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-surface-elevated border border-border-subtle text-left">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted mb-0.5">
              Available Yield
            </p>
            <p className="text-sm font-bold text-foreground truncate tabular-nums">
              {formatCropQuantity(crop.available_quantity, unit)}
            </p>
          </div>

          <div className="border-l border-border-subtle pl-2.5">
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted mb-0.5">
              Expected Total
            </p>
            <p className="text-sm font-semibold text-foreground-secondary truncate tabular-nums">
              {formatCropQuantity(crop.expected_quantity, unit)}
            </p>
          </div>
        </div>

        {/* Buyer Reservation Status Bar */}
        <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-surface border border-border-subtle">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Users className="w-4 h-4 text-brand" />
            <span>
              {totalReservations === 0 ? (
                <span className="text-muted">No reservations yet</span>
              ) : (
                <span>
                  <strong>{totalReservations}</strong> buyer {totalReservations === 1 ? 'reservation' : 'reservations'}
                </span>
              )}
            </span>
          </div>

          {pendingReservations.length > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-warning-muted text-warning border border-warning/20">
              {pendingReservations.length} pending
            </span>
          ) : confirmedReservations.length > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-success-muted text-success border border-success/20">
              {confirmedReservations.length} confirmed
            </span>
          ) : null}
        </div>

        {/* 3. Action Buttons Row */}
        <div className="pt-2 border-t border-border-subtle flex items-center gap-2">
          <Button
            type="button"
            variant="brand"
            size="sm"
            onClick={handleUpdateStage}
            disabled={isHarvested}
            leftIcon={<Activity className="w-3.5 h-3.5" />}
            className="flex-1 font-bold h-10 rounded-xl"
            title={isHarvested ? 'Crop cycle completed' : 'Update lifecycle stage'}
          >
            Update Stage
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="font-semibold h-10 rounded-xl px-3.5"
            title="View full crop details & history"
          >
            Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CropCard;
