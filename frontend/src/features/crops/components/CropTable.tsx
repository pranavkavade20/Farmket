import React from 'react';
import type { CropGrowth } from '@/types/crops';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Leaf, CheckCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { openStageUpdateModal } from '../cropsSlice';
import { SegmentedProgress } from './SegmentedProgress';

interface CropTableProps {
  crops: CropGrowth[];
}

export const CropTable: React.FC<CropTableProps> = ({ crops }) => {
  const dispatch = useDispatch();

  const handleUpdateStage = (id: number) => {
    dispatch(openStageUpdateModal(id));
  };

  const getStageColor = (stage: string) => {
    switch(stage) {
      case 'HARVESTED': return 'bg-success-muted text-success border-success/20';
      case 'NEAR_HARVEST': return 'bg-warning-muted text-warning border-warning/20';
      case 'GROWING': return 'bg-info-muted text-info border-info/20';
      default: return 'bg-brand-muted text-brand border-brand/20';
    }
  };

  if (!crops || crops.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-border-strong rounded-2xl bg-surface">
        <p className="text-muted font-medium">No crops found matching your criteria.</p>
      </div>
    );
  }

  return (
    <Table className="w-full text-left border-collapse">
      <TableHeader className="bg-surface-elevated/50">
        <TableRow className="border-b border-border-subtle">
          <TableHead className="py-4 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Crop Name</TableHead>
          <TableHead className="py-4 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Stage</TableHead>
          <TableHead className="py-4 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Dates</TableHead>
          <TableHead className="py-4 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Quantity (Avail / Total)</TableHead>
          <TableHead className="py-4 px-4 font-semibold text-muted text-xs uppercase tracking-wider w-[200px]">Progress</TableHead>
          <TableHead className="py-4 px-4 font-semibold text-muted text-xs uppercase tracking-wider text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {crops.map((crop) => (
          <TableRow 
            key={crop.id} 
            className="border-b border-border-subtle hover:bg-surface-elevated transition-colors duration-150 group"
          >
            <TableCell className="py-4 px-4 font-medium text-foreground">
              <div className="flex items-center gap-2">
                {crop.product_details?.name || 'Unknown Crop'}
                {crop.organic && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-muted text-brand ring-1 ring-brand/20" title="Organic">
                    <Leaf className="w-3 h-3" />
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="py-4 px-4">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${getStageColor(crop.stage)}`}>
                {crop.stage.replace(/_/g, ' ')}
              </span>
            </TableCell>
            <TableCell className="py-4 px-4 text-sm">
              <div className="text-muted mb-0.5">
                Sown: <span className="font-medium text-foreground">{new Date(crop.sowing_date).toLocaleDateString()}</span>
              </div>
              <div className="text-muted">
                Harvest: <span className="font-medium text-foreground">{new Date(crop.expected_harvest_date).toLocaleDateString()}</span>
              </div>
            </TableCell>
            <TableCell className="py-4 px-4 text-sm font-medium text-foreground">
              {crop.available_quantity} <span className="text-muted font-normal">/ {crop.expected_quantity} {crop.product_details?.unit || 'units'}</span>
            </TableCell>
            <TableCell className="py-4 px-4">
              <SegmentedProgress currentStage={crop.stage} />
            </TableCell>
            <TableCell className="py-4 px-4 text-right">
              <button
                onClick={() => handleUpdateStage(crop.id)}
                disabled={crop.stage === 'HARVESTED'}
                className="inline-flex items-center justify-center p-2 text-brand hover:bg-brand-muted rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-surface"
                title="Update Stage"
                aria-label={`Update stage for ${crop.product_details?.name}`}
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
