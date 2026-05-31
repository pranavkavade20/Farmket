import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { closeReservationModal } from '../cropsSlice';
import { useReserveCropMutation, useGetCropDetailsQuery } from '../cropsApi';
import { X, Loader2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export const ReservationModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isReservationModalOpen, selectedCropId } = useAppSelector((state) => state.crops);
  
  const { data: crop, isLoading: isLoadingCrop } = useGetCropDetailsQuery(selectedCropId ?? 0, {
    skip: !selectedCropId || !isReservationModalOpen,
  });
  
  const [reserveCrop, { isLoading: isReserving }] = useReserveCropMutation();
  const [quantity, setQuantity] = useState<number>(0);

  if (!isReservationModalOpen || !selectedCropId) return null;

  const handleClose = () => {
    dispatch(closeReservationModal());
    setQuantity(0);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crop) return;
    
    if (quantity <= 0 || quantity > Number(crop.available_quantity)) {
      toast.error('Invalid quantity');
      return;
    }

    try {
      await reserveCrop({ id: selectedCropId, quantity }).unwrap();
      toast.success('Reservation request sent to farmer!');
      handleClose();
    } catch (err: unknown) {
      toast.error((err as any)?.data?.error || 'Failed to reserve crop');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pre-Book Harvest</h2>
          <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {isLoadingCrop || !crop ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="p-5 space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-4 border border-green-100 dark:border-green-800/50">
              <h3 className="font-semibold text-green-800 dark:text-green-400 mb-1">{crop.product_details?.name}</h3>
              <div className="flex gap-4 text-sm text-green-700 dark:text-green-500">
                <span>Available: {crop.available_quantity} {crop.product_details?.unit}</span>
                <span>Expected: {new Date(crop.expected_harvest_date).toLocaleDateString()}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity to Reserve ({crop.product_details?.unit})
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  min="0.1"
                  max={Number(crop.available_quantity)}
                  step="0.1"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                  placeholder={`Max ${crop.available_quantity}`}
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isReserving || quantity <= 0 || quantity > Number(crop.available_quantity)}
                className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-70 rounded-lg transition-colors"
              >
                {isReserving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Reservation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
