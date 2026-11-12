import React, { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { closeCropDetail, openStageUpdateModal } from '../cropsSlice';
import {
  useGetCropDetailsQuery,
  useApproveReservationMutation,
  useRejectReservationMutation,
} from '../cropsApi';
import {
  X,
  Package,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Leaf,
  Users,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { CropLifecycleStepper } from './CropLifecycleStepper';
import { getHarvestTiming, formatCropQuantity } from '../utils/cropUtils';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

export const CropDetailDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isDetailDrawerOpen, selectedDetailCropId } = useAppSelector((state) => state.crops);

  const { data: crop, isLoading } = useGetCropDetailsQuery(selectedDetailCropId ?? 0, {
    skip: !selectedDetailCropId || !isDetailDrawerOpen,
  });

  const [approveReservation, { isLoading: isApproving }] = useApproveReservationMutation();
  const [rejectReservation, { isLoading: isRejecting }] = useRejectReservationMutation();

  const handleClose = useCallback(() => {
    dispatch(closeCropDetail());
  }, [dispatch]);

  const handleOpenStageModal = () => {
    if (selectedDetailCropId) {
      dispatch(openStageUpdateModal(selectedDetailCropId));
    }
  };

  // Keyboard Escape listener
  useEffect(() => {
    if (!isDetailDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailDrawerOpen, handleClose]);

  const handleApprove = async (resId: number, buyerName: string) => {
    try {
      await approveReservation(resId).unwrap();
      toast.success(`Reservation for ${buyerName} approved!`);
    } catch {
      toast.error('Failed to approve reservation');
    }
  };

  const handleReject = async (resId: number, buyerName: string) => {
    try {
      await rejectReservation(resId).unwrap();
      toast.success(`Reservation for ${buyerName} rejected`);
    } catch {
      toast.error('Failed to reject reservation');
    }
  };

  if (!isDetailDrawerOpen) return null;

  const timing = crop
    ? getHarvestTiming(crop.expected_harvest_date, crop.stage, crop.actual_harvest_date)
    : null;

  const unit = crop?.product_details?.unit || 'units';
  const cropName = crop?.product_details?.name || crop?.crop_name || 'Crop Details';
  const imageUrl = crop?.product_details?.images?.[0]?.image;

  const pendingReservations = crop?.reservations?.filter((r) => r.reservation_status === 'PENDING') || [];
  const processedReservations = crop?.reservations?.filter((r) => r.reservation_status !== 'PENDING') || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" role="dialog" aria-modal="true" aria-label={cropName}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          className="relative w-full max-w-2xl bg-surface border-l border-border-subtle shadow-2xl h-full flex flex-col z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border-subtle bg-surface shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-display font-bold text-foreground truncate">
                  {cropName}
                </h2>
                <p className="text-xs text-muted">
                  Crop Cycle #{crop?.id} • Farmer: {crop?.farmer_name || 'You'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-2 text-muted hover:text-foreground rounded-xl hover:bg-surface-elevated transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Scroll */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {isLoading || !crop ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-44 bg-surface-elevated rounded-2xl" />
                <div className="h-20 bg-surface-elevated rounded-2xl" />
                <div className="h-40 bg-surface-elevated rounded-2xl" />
              </div>
            ) : (
              <>
                {/* 1. Hero Image & Overview Status Banner */}
                <div className="relative rounded-2xl overflow-hidden bg-surface-elevated border border-border-subtle">
                  <div className="h-48 w-full relative">
                    {imageUrl ? (
                      <img src={imageUrl} alt={cropName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand/10 via-surface to-brand/5">
                        <span className="text-4xl mb-1 select-none">🌱</span>
                        <span className="text-xs font-semibold text-muted">Farmket Verified Crop</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md bg-surface/90 text-foreground shadow-xs">
                        {crop.stage === 'PLANTED' && '🌱 Seeded / Planted'}
                        {crop.stage === 'GROWING' && '🌿 Actively Growing'}
                        {crop.stage === 'NEAR_HARVEST' && '🌾 Harvest Ready'}
                        {crop.stage === 'HARVESTED' && '📦 Harvested & Stocked'}
                      </span>

                      {crop.organic && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand text-on-brand shadow-xs flex items-center gap-1">
                          <Leaf className="w-3.5 h-3.5" />
                          Organic
                        </span>
                      )}
                    </div>
                  </div>

                  {timing && (
                    <div className="p-3.5 bg-surface flex items-center justify-between border-t border-border-subtle">
                      <div className="flex items-center gap-2">
                        {timing.isOverdue ? (
                          <AlertCircle className="w-4 h-4 text-danger" />
                        ) : (
                          <Clock className="w-4 h-4 text-brand" />
                        )}
                        <span className="text-xs font-semibold text-foreground">
                          {timing.label}
                        </span>
                      </div>
                      <span className="text-xs text-muted font-medium">
                        Target Date: {timing.formattedDate}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Lifecycle Stepper Section */}
                <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-muted">
                      Growth Lifecycle Progress
                    </h3>
                    <span className="text-xs font-bold text-brand">
                      {crop.progress}% Stage Complete
                    </span>
                  </div>
                  <CropLifecycleStepper currentStage={crop.stage} />
                </div>

                {/* 3. Farm & Yield Metrics */}
                <div className="space-y-2">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-muted">
                    Production & Yield Metrics
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-surface-elevated border border-border-subtle">
                      <p className="text-[11px] font-medium text-muted mb-0.5">Sowing Date</p>
                      <p className="text-sm font-bold text-foreground">
                        {new Date(crop.sowing_date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface-elevated border border-border-subtle">
                      <p className="text-[11px] font-medium text-muted mb-0.5">Expected Yield</p>
                      <p className="text-sm font-bold text-foreground">
                        {formatCropQuantity(crop.expected_quantity, unit)}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface-elevated border border-border-subtle">
                      <p className="text-[11px] font-medium text-muted mb-0.5">Available Yield</p>
                      <p className="text-sm font-bold text-brand">
                        {formatCropQuantity(crop.available_quantity, unit)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Notes if available */}
                {crop.notes && (
                  <div className="p-4 rounded-xl bg-surface border border-border-subtle">
                    <p className="text-xs font-semibold text-muted mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-brand" /> Field Observations & Notes
                    </p>
                    <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                      {crop.notes}
                    </p>
                  </div>
                )}

                {/* 5. Integrated Buyer Reservations */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-brand" />
                      <h3 className="text-sm font-display font-bold text-foreground">
                        Buyer Reservations
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand/10 text-brand">
                        {crop.reservations?.length || 0}
                      </span>
                    </div>

                    {pendingReservations.length > 0 && (
                      <span className="text-xs font-bold text-warning flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {pendingReservations.length} action required
                      </span>
                    )}
                  </div>

                  {crop.reservations && crop.reservations.length > 0 ? (
                    <div className="space-y-2.5">
                      {/* Pending requests first */}
                      {pendingReservations.map((res) => (
                        <div
                          key={res.id}
                          className="p-3.5 rounded-xl bg-warning-muted/20 border border-warning/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground">
                                {res.buyer_name}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-warning-muted text-warning border border-warning/30">
                                Pending Approval
                              </span>
                            </div>
                            <p className="text-xs text-foreground-secondary mt-0.5">
                              Reserved: <strong>{res.quantity_reserved} {unit}</strong> • Requested on{' '}
                              {new Date(res.reserved_at).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(res.id, res.buyer_name)}
                              disabled={isRejecting || isApproving}
                              leftIcon={<XCircle className="w-3.5 h-3.5 text-danger" />}
                              className="flex-1 sm:flex-none text-danger border-danger/30 hover:bg-danger-muted"
                            >
                              Reject
                            </Button>
                            <Button
                              type="button"
                              variant="brand"
                              size="sm"
                              onClick={() => handleApprove(res.id, res.buyer_name)}
                              disabled={isRejecting || isApproving}
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                              className="flex-1 sm:flex-none font-bold"
                            >
                              Approve
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* Processed / Confirmed reservations */}
                      {processedReservations.map((res) => (
                        <div
                          key={res.id}
                          className="p-3 rounded-xl bg-surface border border-border-subtle flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-semibold text-foreground">
                              {res.buyer_name}
                            </p>
                            <p className="text-muted text-[11px]">
                              {res.quantity_reserved} {unit} • {new Date(res.reserved_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full font-semibold text-[10px]',
                              res.reservation_status === 'CONFIRMED'
                                ? 'bg-success-muted text-success border border-success/20'
                                : res.reservation_status === 'CANCELLED'
                                ? 'bg-danger-muted text-danger border border-danger/20'
                                : 'bg-surface-elevated text-muted'
                            )}
                          >
                            {res.reservation_status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center rounded-xl bg-surface-elevated border border-border-subtle">
                      <Package className="w-6 h-6 text-muted mx-auto mb-1" />
                      <p className="text-xs text-muted font-medium">
                        No buyer reservations for this crop yet.
                      </p>
                    </div>
                  )}
                </div>

                {/* 6. Timeline / Stage Journey */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand" />
                    Lifecycle Timeline & Historical Milestones
                  </h3>

                  {crop.stage_history && crop.stage_history.length > 0 ? (
                    <div className="relative border-l-2 border-border-subtle ml-3 space-y-4 pl-4 py-1">
                      {crop.stage_history.map((entry) => (
                        <div key={entry.id} className="relative">
                          <div className="absolute -left-[23px] top-0.5 w-3 h-3 rounded-full bg-brand ring-4 ring-surface" />
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="text-xs font-bold text-foreground">
                              Stage updated to {entry.current_stage.replace(/_/g, ' ')}
                            </p>
                            <span className="text-[10px] text-muted shrink-0">
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          {entry.remarks && (
                            <p className="text-xs text-foreground-secondary mt-1 bg-surface-elevated p-2 rounded-lg border border-border-subtle">
                              "{entry.remarks}"
                            </p>
                          )}
                          {entry.updated_by_name && (
                            <p className="text-[10px] text-muted mt-0.5">
                              Updated by {entry.updated_by_name}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted italic">
                      No lifecycle changes recorded yet.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-border-subtle bg-surface shrink-0 flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="rounded-xl px-4"
            >
              Close
            </Button>

            {crop && crop.stage !== 'HARVESTED' && (
              <Button
                type="button"
                variant="brand"
                onClick={handleOpenStageModal}
                leftIcon={<Activity className="w-4 h-4" />}
                rightIcon={<Sparkles className="w-3.5 h-3.5 opacity-80" />}
                className="flex-1 rounded-xl font-bold shadow-xs"
              >
                Update Growth Stage
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CropDetailDrawer;
