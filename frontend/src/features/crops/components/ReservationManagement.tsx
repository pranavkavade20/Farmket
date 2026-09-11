import React, { useState } from 'react';
import { useGetReservationsQuery, useApproveReservationMutation, useRejectReservationMutation } from '../cropsApi';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { toast } from 'sonner';

export const ReservationManagement: React.FC = () => {
  const { data: reservations, isLoading } = useGetReservationsQuery();
  const [approveReservation, { isLoading: isApproving }] = useApproveReservationMutation();
  const [rejectReservation, { isLoading: isRejecting }] = useRejectReservationMutation();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleApprove = async (id: number) => {
    try {
      await approveReservation(id).unwrap();
      toast.success('Reservation approved successfully');
    } catch {
      toast.error('Failed to approve reservation');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectReservation(id).unwrap();
      toast.success('Reservation rejected');
    } catch {
      toast.error('Failed to reject reservation');
    }
  };

  if (isLoading) return null;

  const pendingReservations = reservations?.filter((r) => r.reservation_status === 'PENDING') || [];
  const processedReservations = reservations?.filter((r) => r.reservation_status !== 'PENDING') || [];
  const totalCount = reservations?.length || 0;

  if (totalCount === 0) return null;

  return (
    <div className="pt-4">
      <div className="rounded-2xl bg-surface border border-border-subtle overflow-hidden shadow-xs">
        {/* Toggle Header */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-surface-elevated/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-display font-bold text-foreground">
                  All Buyer Reservations
                </h3>
                {pendingReservations.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-warning-muted text-warning border border-warning/20">
                    {pendingReservations.length} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-muted">
                {totalCount} total pre-booking requests across your crops
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted">
            <span className="text-xs font-medium hidden sm:inline">
              {isExpanded ? 'Hide' : 'Manage Requests'}
            </span>
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="p-4 sm:p-6 border-t border-border-subtle space-y-6 bg-surface-elevated/30">
            {pendingReservations.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider font-bold text-warning flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Pending Actions ({pendingReservations.length})
                </h4>
                <div className="bg-surface rounded-xl border border-warning/30 overflow-hidden divide-y divide-border-subtle shadow-xs">
                  {pendingReservations.map((res) => (
                    <div
                      key={res.id}
                      className="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {res.buyer_name} requested {res.quantity_reserved} units of {res.crop_name}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          Requested on {new Date(res.reserved_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => handleReject(res.id)}
                          disabled={isRejecting || isApproving}
                          className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold text-danger bg-danger/10 hover:bg-danger/20 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(res.id)}
                          disabled={isRejecting || isApproving}
                          className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {processedReservations.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider font-bold text-muted">
                  Past History ({processedReservations.length})
                </h4>
                <div className="bg-surface rounded-xl border border-border-subtle overflow-hidden divide-y divide-border-subtle shadow-xs">
                  {processedReservations.map((res) => (
                    <div
                      key={res.id}
                      className="p-3.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-foreground">
                          {res.buyer_name} • {res.quantity_reserved} units of {res.crop_name}
                        </p>
                        <p className="text-muted text-[11px]">
                          {new Date(res.reserved_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${
                          res.reservation_status === 'CONFIRMED'
                            ? 'bg-success-muted text-success border-success/20'
                            : res.reservation_status === 'CANCELLED'
                            ? 'bg-danger-muted text-danger border border-danger/20'
                            : 'bg-surface-elevated text-foreground border-border-strong'
                        }`}
                      >
                        {res.reservation_status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
