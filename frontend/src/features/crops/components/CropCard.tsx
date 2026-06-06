import React from 'react';
import type { CropGrowth } from '@/types/crops';
import { ProgressBar } from './ProgressBar';
import { Leaf, Calendar, CheckCircle, Package } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { openStageUpdateModal } from '../cropsSlice';

interface CropCardProps {
  crop: CropGrowth;
}

export const CropCard: React.FC<CropCardProps> = ({ crop }) => {
  const dispatch = useDispatch();
  
  const handleUpdateStage = () => {
    dispatch(openStageUpdateModal(crop.id));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {crop.product_details?.name || 'Unknown Crop'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Stage: <span className="font-medium text-green-600 dark:text-green-400">{crop.stage?.replace(/_/g, ' ')}</span>
            </p>
          </div>
          {crop.organic && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <Leaf className="w-3 h-3" /> Organic
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">Growth Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{Math.round(crop.progress)}%</span>
            </div>
            <ProgressBar progress={crop.progress} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Harvest Date</p>
                <p className="font-medium">{new Date(crop.expected_harvest_date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Package className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Available Qty</p>
                <p className="font-medium">{crop.available_quantity} {crop.product_details?.unit || 'units'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Reserved: {Number(crop.expected_quantity) - Number(crop.available_quantity)} {crop.product_details?.unit}
        </div>
        <button
          onClick={handleUpdateStage}
          disabled={crop.stage === 'HARVESTED'}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Update Stage
        </button>
      </div>
    </div>
  );
};
