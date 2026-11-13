import React, { useState } from 'react';
import {
  useGetReservationsQuery,
  useApproveReservationMutation,
  useRejectReservationMutation,
} from '../cropsApi';
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  Users,
  CheckCircle2,
  Calendar,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, Badge, StatusBadge } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export const ReservationManagement: React.FC = () => {
  const { data: reservations, isLoading } = useGetReservationsQuery();
  const [approveReservation, { isLoading: isApproving }] = useApproveReservationMutation();
  const [rejectReservation, { isLoading: isRejecting }] = useRejectReservationMutation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleApprove = async (id: number, buyerName?: string) => {
    try {
      setProcessingId(id);
      await approveReservation(id).unwrap();
      toast.success(buyerName ? `Reservation for ${buyerName} approved!` : 'Reservation approved successfully');
    } catch {
      toast.error('Failed to approve reservation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number, buyerName?: string) => {
    try {
      setProcessingId(id);
      await rejectReservation(id).unwrap();
      toast.success(buyerName ? `Reservation for ${buyerName} rejected` : 'Reservation rejected');
    } catch {
      toast.error('Failed to reject reservation');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) return null;

  const pendingReservations = reservations?.filter((r) => r.reservation_status === 'PENDING') || [];
  const processedReservations = reservations?.filter((r) => r.reservation_status !== 'PENDING') || [];
  const totalCount = reservations?.length || 0;

  return (
    <div className="pt-2">
      <div className="rounded-2xl bg-surface border border-border-subtle overflow-hidden shadow-xs">
        {/* Toggle Header */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-surface-elevated/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/20"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-display font-bold text-foreground">
                  Buyer Pre-booking Reservations
                </h3>
                {pendingReservations.length > 0 && (
                  <Badge variant="pending" size="sm" className="font-bold">
                    {pendingReservations.length} Pending
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted mt-0.5">
                {totalCount} total pre-booking {totalCount === 1 ? 'request' : 'requests'} across your crop lifecycles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted">
            <span className="text-xs font-semibold hidden sm:inline text-foreground-secondary">
              {isExpanded ? 'Hide Panel' : 'Manage Requests'}
            </span>
            <ChevronDown
              className={cn('w-5 h-5 transition-transform duration-200', isExpanded && 'rotate-180')}
            />
          </div>
        </button>

        {/* Collapsible Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="border-t border-border-subtle bg-surface-elevated/20 overflow-hidden"
            >
              <div className="p-4 sm:p-6 space-y-6">
                {/* 1. Pending Reservations Section */}
                {pendingReservations.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs uppercase tracking-wider font-bold text-warning flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Action Required ({pendingReservations.length})
                      </h4>
                      <span className="text-[11px] text-muted font-medium">
                        Confirm allocations before harvest completion
                      </span>
                    </div>

                    <div className="bg-surface rounded-2xl border border-warning/30 overflow-hidden divide-y divide-border-subtle shadow-xs">
                      {pendingReservations.map((res) => {
                        const isThisProcessing = processingId === res.id;

                        return (
                          <div
                            key={res.id}
                            className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-surface-elevated/40 transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-foreground">
                                  {res.buyer_name}
                                </span>
                                <Badge variant="pending" size="sm" className="font-bold">
                                  Pending
                                </Badge>
                                <span className="text-xs font-semibold text-brand flex items-center gap-1">
                                  <Package className="w-3.5 h-3.5" />
                                  {res.crop_name}
                                </span>
                              </div>

                              <p className="text-xs text-foreground-secondary flex items-center gap-3">
                                <span>
                                  Requested quantity:{' '}
                                  <strong className="text-foreground">{res.quantity_reserved} units</strong>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-muted">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(res.reserved_at).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </p>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(res.id, res.buyer_name)}
                                disabled={isThisProcessing || isRejecting || isApproving}
                                leftIcon={<XCircle className="w-3.5 h-3.5 text-danger" />}
                                className="flex-1 sm:flex-none text-danger border-danger/30 hover:bg-danger-muted/30 h-9 rounded-xl font-semibold"
                              >
                                Reject
                              </Button>
                              <Button
                                type="button"
                                variant="brand"
                                size="sm"
                                onClick={() => handleApprove(res.id, res.buyer_name)}
                                disabled={isThisProcessing || isRejecting || isApproving}
                                isLoading={isThisProcessing && isApproving}
                                leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                                className="flex-1 sm:flex-none h-9 rounded-xl font-bold shadow-xs"
                              >
                                Approve
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Processed Reservations History */}
                {processedReservations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-muted flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand" /> Pre-booking History ({processedReservations.length})
                    </h4>

                    <div className="bg-surface rounded-2xl border border-border-subtle overflow-hidden divide-y divide-border-subtle shadow-xs">
                      {processedReservations.map((res) => (
                        <div
                          key={res.id}
                          className="p-3.5 sm:p-4 flex items-center justify-between text-xs hover:bg-surface-elevated/30 transition-colors"
                        >
                          <div className="min-w-0 pr-4">
                            <p className="font-bold text-foreground truncate">
                              {res.buyer_name}
                              <span className="font-normal text-muted ml-1.5">
                                • {res.quantity_reserved} units of {res.crop_name}
                              </span>
                            </p>
                            <p className="text-muted text-[11px] mt-0.5">
                              Requested on {new Date(res.reserved_at).toLocaleDateString()}
                            </p>
                          </div>

                          <StatusBadge
                            status={
                              res.reservation_status === 'CONFIRMED'
                                ? 'success'
                                : res.reservation_status === 'CANCELLED'
                                ? 'failed'
                                : res.reservation_status === 'PENDING'
                                ? 'pending'
                                : 'expired'
                            }
                            label={res.reservation_status}
                            size="sm"
                            className="font-bold shrink-0 capitalize"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Empty State if no reservations */}
                {totalCount === 0 && (
                  <div className="py-8 px-4 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">No pre-booking requests yet</h4>
                      <p className="text-xs text-muted max-w-sm mx-auto mt-1">
                        When buyers pre-book your active crop harvests from the marketplace, their requests will appear here for you to review, approve, or reject.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReservationManagement;
