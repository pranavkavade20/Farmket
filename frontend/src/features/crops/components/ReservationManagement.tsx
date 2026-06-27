import React from 'react';
import { useGetReservationsQuery, useApproveReservationMutation, useRejectReservationMutation } from '../cropsApi';
import { CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import { toast } from "sonner";

export const ReservationManagement: React.FC = () => {
  const { data: reservations, isLoading } = useGetReservationsQuery();
  const [approveReservation, { isLoading: isApproving }] = useApproveReservationMutation();
  const [rejectReservation, { isLoading: isRejecting }] = useRejectReservationMutation();

  const handleApprove = async (id: number) => {
    try {
      await approveReservation(id).unwrap();
      toast.success('Reservation approved');
    } catch (error) {
      toast.error('Failed to approve reservation');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectReservation(id).unwrap();
      toast.success('Reservation rejected');
    } catch (error) {
      toast.error('Failed to reject reservation');
    }
  };

  if (isLoading) return <div className="py-8 text-center text-muted">Loading reservations...</div>;

  const pendingReservations = reservations?.filter(r => r.reservation_status === 'PENDING') || [];
  const processedReservations = reservations?.filter(r => r.reservation_status !== 'PENDING') || [];

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-foreground mb-6 font-display">Reservation Requests</h2>
      
      {pendingReservations.length === 0 && processedReservations.length === 0 ? (
        <div className="p-12 text-center bg-surface rounded-3xl border border-border-subtle shadow-sm">
          <div className="w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center mx-auto mb-4 border border-border-subtle shadow-inner">
            <Package className="w-8 h-8 text-muted" />
          </div>
          <p className="text-muted font-medium">No reservations yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingReservations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Needs Action</h3>
              <div className="bg-surface rounded-2xl shadow-sm border border-warning/30 overflow-hidden">
                <ul className="divide-y divide-border-subtle">
                  {pendingReservations.map(res => (
                    <li key={res.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-surface-elevated transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-warning-muted text-warning rounded-xl">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {res.buyer_name} wants {res.quantity_reserved} units of {res.crop_name}
                          </p>
                          <p className="text-sm text-muted">
                            Requested on {new Date(res.reserved_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                          onClick={() => handleReject(res.id)}
                          disabled={isRejecting || isApproving}
                          className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-danger bg-danger-muted hover:bg-danger/20 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                        <button 
                          onClick={() => handleApprove(res.id)}
                          disabled={isRejecting || isApproving}
                          className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-success hover:bg-success/90 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {processedReservations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">History</h3>
              <div className="bg-surface rounded-2xl shadow-sm border border-border-subtle overflow-hidden">
                <ul className="divide-y divide-border-subtle">
                  {processedReservations.map(res => (
                    <li key={res.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-surface-elevated transition-colors">
                      <div>
                        <p className="font-medium text-foreground">
                          {res.buyer_name} requested {res.quantity_reserved} units of {res.crop_name}
                        </p>
                        <p className="text-sm text-muted">
                          {new Date(res.reserved_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        res.reservation_status === 'CONFIRMED' ? 'bg-success-muted text-success border border-success/20' :
                        res.reservation_status === 'CANCELLED' ? 'bg-danger-muted text-danger border border-danger/20' :
                        'bg-surface-elevated text-foreground border border-border-strong'
                      }`}>
                        {res.reservation_status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
