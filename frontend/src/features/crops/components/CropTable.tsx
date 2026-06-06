import React from 'react';
import type { CropGrowth } from '@/types/crops';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Leaf, CheckCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { openStageUpdateModal } from '../cropsSlice';

interface CropTableProps {
  crops: CropGrowth[];
}

export const CropTable: React.FC<CropTableProps> = ({ crops }) => {
  const dispatch = useDispatch();

  const handleUpdateStage = (id: number) => {
    dispatch(openStageUpdateModal(id));
  };

  if (!crops || crops.length === 0) {
    return (
      <div className="py-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
        <p className="text-gray-500 dark:text-gray-400">No crops found matching your criteria.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Crop Name</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead>Quantity (Available / Total)</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {crops.map((crop) => (
          <TableRow key={crop.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {crop.product_details?.name || 'Unknown Crop'}
                {crop.organic && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <Leaf className="w-3 h-3" />
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <span className="capitalize text-green-700 dark:text-green-400 font-medium text-sm">
                {crop.stage.replace(/_/g, ' ')}
              </span>
            </TableCell>
            <TableCell className="text-sm">
              <div className="text-gray-500 dark:text-gray-400">
                Sown: {new Date(crop.sowing_date).toLocaleDateString()}
              </div>
              <div className="text-gray-900 dark:text-gray-100">
                Harvest: {new Date(crop.expected_harvest_date).toLocaleDateString()}
              </div>
            </TableCell>
            <TableCell className="text-sm">
              {crop.available_quantity} / {crop.expected_quantity} {crop.product_details?.unit || 'units'}
            </TableCell>
            <TableCell>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 max-w-[100px]">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${Math.round(crop.progress)}%` }}></div>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">{Math.round(crop.progress)}%</span>
            </TableCell>
            <TableCell className="text-right">
              <button
                onClick={() => handleUpdateStage(crop.id)}
                disabled={crop.stage === 'HARVESTED'}
                className="inline-flex items-center justify-center p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Update Stage"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
