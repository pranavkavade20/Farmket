import React from 'react';
import type { CropGrowth } from '@/types/crops';
import { ProgressBar } from './ProgressBar';
import { Leaf, Clock, ShoppingCart, Bell } from 'lucide-react';
import { useAppDispatch } from '@/app/hooks';
import { openReservationModal } from '../cropsSlice';
import { useFollowCropMutation, useUnfollowCropMutation } from '../cropsApi';
import { useAuth } from '@/features/auth';
import toast from 'react-hot-toast';

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
  
  let countdownColor = "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
  if (daysRemaining < 7) {
    countdownColor = "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
  } else if (daysRemaining <= 15) {
    countdownColor = "text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800";
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-900">
        {crop.product_details?.images?.[0] ? (
          <img 
            src={crop.product_details.images[0].image} 
            alt={crop.product_details.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image available
          </div>
        )}
        
        {crop.organic && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-green-500/90 backdrop-blur text-white text-xs font-bold rounded-full shadow-sm flex items-center gap-1">
            <Leaf className="w-3 h-3" /> ORGANIC
          </div>
        )}

        <div className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-lg border text-xs font-bold shadow-sm flex items-center gap-1.5 ${countdownColor}`}>
          <Clock className="w-3.5 h-3.5" />
          {daysRemaining > 0 ? `Harvest in ${daysRemaining} Days` : 'Ready Soon!'}
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">{crop.farmer_name}</p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
            {crop.product_details?.name || 'Unknown Crop'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {crop.product_details?.description || crop.notes}
          </p>
        </div>

        <div className="space-y-3 mb-5">
          <div>
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span className="text-gray-500 dark:text-gray-400">Growth Progress</span>
              <span className="text-gray-900 dark:text-white">{Math.round(crop.progress)}%</span>
            </div>
            <ProgressBar progress={crop.progress} className="h-1.5" />
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Available to Reserve</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {crop.available_quantity} <span className="text-sm font-normal text-gray-500">{crop.product_details?.unit}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Est. Price</p>
              <p className="font-bold text-green-600 dark:text-green-400">
                ${crop.product_details?.price} <span className="text-sm font-normal text-gray-500">/{crop.product_details?.unit}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleToggleFollow}
            disabled={isFollowing || isUnfollowing}
            className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center ${
              crop.is_followed 
                ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            title={crop.is_followed ? 'Unfollow' : 'Get Notifications'}
          >
            <Bell className={`w-5 h-5 ${crop.is_followed ? 'fill-current' : ''}`} />
          </button>
          
          {user?.user_type === 'farmer' ? null : (
            <button
              onClick={handleReserve}
              disabled={Number(crop.available_quantity) <= 0}
              className="flex-1 py-2.5 px-4 bg-gray-900 hover:bg-black text-white dark:bg-green-600 dark:hover:bg-green-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              Reserve Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
