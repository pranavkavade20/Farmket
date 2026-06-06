import React from 'react';
import { Calendar } from 'lucide-react';
import { CropGrowth } from '@/types/crops';
import { CropStageBadge } from './CropStageBadge';
import { CropProgressBar } from './CropProgressBar';
import { format } from 'date-fns';

interface Props {
  crop: CropGrowth;
  className?: string;
}

export const CropStatusCard: React.FC<Props> = ({ crop, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
            {crop.crop_name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Farmer: {crop.farmer_name}
          </p>
        </div>
        <CropStageBadge stage={crop.stage} />
      </div>

      <CropProgressBar progress={crop.progress} className="mb-5" />

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Expected Harvest
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {crop.expected_harvest_date ? format(new Date(crop.expected_harvest_date), 'MMM dd, yyyy') : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Available Quantity
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {crop.available_quantity} {crop.product_details?.unit || 'Units'}
          </p>
        </div>
      </div>
    </div>
  );
};
