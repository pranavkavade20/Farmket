import React from 'react';
import { useGetReservationsQuery, useApproveReservationMutation, useRejectReservationMutation } from '../cropsApi';
import { CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import toast from 'react-hot-toast';

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

  if (isLoading) return <div className="py-8 text-center text-gray-500">Loading reservations...</div>;

  const pendingReservations = reservations?.filter(r => r.reservation_status === 'PENDING') || [];
  const processedReservations = reservations?.filter(r => r.reservation_status !== 'PENDING') || [];

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reservation Requests</h2>
      
      {pendingReservations.length === 0 && processedReservations.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Package className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No reservations yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingReservations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Needs Action</h3>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-orange-100 dark:border-orange-900/30 overflow-hidden">
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {pendingReservations.map(res => (
                    <li key={res.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-orange-50/50 dark:hover:bg-gray-750 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-lg">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {res.buyer_name} wants {res.quantity_reserved} units of {res.crop_name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Requested on {new Date(res.reserved_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                          onClick={() => handleReject(res.id)}
                          disabled={isRejecting || isApproving}
                          className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                        <button 
                          onClick={() => handleApprove(res.id)}
                          disabled={isRejecting || isApproving}
                          className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">History</h3>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {processedReservations.map(res => (
                    <li key={res.id} className="p-4 sm:p-5 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {res.buyer_name} requested {res.quantity_reserved} units of {res.crop_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(res.reserved_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        res.reservation_status === 'CONFIRMED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        res.reservation_status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
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
