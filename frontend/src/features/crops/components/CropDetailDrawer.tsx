import React from 'react';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { CropLifecycleStepper } from './CropLifecycleStepper';
import { getHarvestTiming, formatCropQuantity } from '../utils/cropUtils';

export const CropDetailDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isDetailDrawerOpen, selectedDetailCropId } = useAppSelector((state) => state.crops);

  const { data: crop, isLoading } = useGetCropDetailsQuery(selectedDetailCropId ?? 0, {
    skip: !selectedDetailCropId || !isDetailDrawerOpen,
  });

  const [approveReservation, { isLoading: isApproving }] = useApproveReservationMutation();
  const [rejectReservation, { isLoading: isRejecting }] = useRejectReservationMutation();

  const handleClose = () => {
    dispatch(closeCropDetail());
  };

  const handleOpenStageModal = () => {
    if (selectedDetailCropId) {
      dispatch(openStageUpdateModal(selectedDetailCropId));
    }
  };

  const handleApprove = async (resId: number, buyerName: string) => {
    try {
      await approveReservation(resId).unwrap();
      toast.success(`Reservation from ${buyerName} approved`);
    } catch {
      toast.error('Failed to approve reservation');
    }
  };

  const handleReject = async (resId: number, buyerName: string) => {
    try {
      await rejectReservation(resId).unwrap();
      toast.success(`Reservation from ${buyerName} rejected`);
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
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
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
                  Crop ID #{crop?.id} • Farmer: {crop?.farmer_name || 'You'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="p-2 text-muted hover:text-foreground rounded-xl hover:bg-surface-elevated transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
                  <div className="h-44 w-full relative">
                    {imageUrl ? (
                      <img src={imageUrl} alt={cropName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand/10 via-surface to-brand/5">
                        <span className="text-4xl mb-1">🌱</span>
                        <span className="text-xs font-semibold text-muted">Verified Farm Crop</span>
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
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand text-white shadow-xs flex items-center gap-1">
                          <Leaf className="w-3.5 h-3.5" />
                          Organic Certified
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
                        Expected: {timing.formattedDate}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Lifecycle Stepper Section */}
                <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-muted">
                      Growth Lifecycle
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
                    <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle">
                      <p className="text-[11px] font-medium text-muted mb-0.5">Sowing Date</p>
                      <p className="text-sm font-bold text-foreground">
                        {new Date(crop.sowing_date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle">
                      <p className="text-[11px] font-medium text-muted mb-0.5">Expected Yield</p>
                      <p className="text-sm font-bold text-foreground">
                        {formatCropQuantity(crop.expected_quantity, unit)}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle">
                      <p className="text-[11px] font-medium text-muted mb-0.5">Available Yield</p>
                      <p className="text-sm font-bold text-brand">
                        {formatCropQuantity(crop.available_quantity, unit)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Notes if available */}
                {crop.notes && (
                  <div className="p-3.5 rounded-xl bg-surface border border-border-subtle">
                    <p className="text-xs font-semibold text-muted mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Field Notes
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
                      <span className="text-xs font-bold text-warning">
                        {pendingReservations.length} action required
                      </span>
                    )}
                  </div>

                  {crop.reservations && crop.reservations.length > 0 ? (
                    <div className="space-y-2">
                      {/* Pending requests first */}
                      {pendingReservations.map((res) => (
                        <div
                          key={res.id}
                          className="p-3.5 rounded-xl bg-warning-muted/30 border border-warning/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
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
                            <button
                              type="button"
                              onClick={() => handleReject(res.id, res.buyer_name)}
                              disabled={isRejecting || isApproving}
                              className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold text-danger bg-danger/10 hover:bg-danger/20 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApprove(res.id, res.buyer_name)}
                              disabled={isRejecting || isApproving}
                              className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>
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
                            className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                              res.reservation_status === 'CONFIRMED'
                                ? 'bg-success-muted text-success border border-success/20'
                                : res.reservation_status === 'CANCELLED'
                                ? 'bg-danger-muted text-danger border border-danger/20'
                                : 'bg-surface-elevated text-muted'
                            }`}
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
                    Lifecycle Timeline & Updates
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
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-border-strong text-foreground text-xs font-semibold hover:bg-surface-elevated transition-colors cursor-pointer"
            >
              Close
            </button>

            {crop && crop.stage !== 'HARVESTED' && (
              <button
                type="button"
                onClick={() => {
                  handleOpenStageModal();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                Update Growth Stage
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
