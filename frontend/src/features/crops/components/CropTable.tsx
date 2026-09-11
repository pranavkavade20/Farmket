import React from 'react';
import type { CropGrowth } from '@/types/crops';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Leaf, Activity, ArrowRight, Users } from 'lucide-react';
import { useAppDispatch } from '@/app/hooks';
import { openStageUpdateModal, openCropDetail } from '../cropsSlice';
import { CropLifecycleStepper } from './CropLifecycleStepper';
import { getHarvestTiming, formatCropQuantity } from '../utils/cropUtils';

interface CropTableProps {
  crops: CropGrowth[];
}

export const CropTable: React.FC<CropTableProps> = ({ crops }) => {
  const dispatch = useAppDispatch();

  if (!crops || crops.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-border-strong rounded-2xl bg-surface">
        <p className="text-muted font-medium text-sm">No crops found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="w-full text-left border-collapse min-w-[700px]">
        <TableHeader className="bg-surface-elevated">
          <TableRow className="border-b border-border-subtle">
            <TableHead className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">
              Crop & Details
            </TableHead>
            <TableHead className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">
              Growth Lifecycle
            </TableHead>
            <TableHead className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">
              Harvest Timing
            </TableHead>
            <TableHead className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">
              Yield (Avail / Total)
            </TableHead>
            <TableHead className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">
              Reservations
            </TableHead>
            <TableHead className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {crops.map((crop) => {
            const timing = getHarvestTiming(crop.expected_harvest_date, crop.stage, crop.actual_harvest_date);
            const unit = crop.product_details?.unit || 'units';
            const cropName = crop.product_details?.name || crop.crop_name || 'Crop';
            const imageUrl = crop.product_details?.images?.[0]?.image;
            const reservationsCount = crop.reservations?.length || 0;
            const pendingCount = crop.reservations?.filter((r) => r.reservation_status === 'PENDING').length || 0;

            return (
              <TableRow
                key={crop.id}
                onClick={() => dispatch(openCropDetail(crop.id))}
                className="border-b border-border-subtle hover:bg-surface-elevated/70 transition-colors duration-150 cursor-pointer group"
              >
                {/* Crop Name & Thumbnail */}
                <TableCell className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-elevated border border-border-subtle shrink-0">
                      {imageUrl ? (
                        <img src={imageUrl} alt={cropName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-base">🌱</div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-foreground group-hover:text-brand transition-colors text-sm">
                        {cropName}
                        {crop.organic && (
                          <span
                            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand/15 text-brand"
                            title="Organic Certified"
                          >
                            <Leaf className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted">
                        Sown {new Date(crop.sowing_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Stage Stepper Compact */}
                <TableCell className="py-3.5 px-4 w-[180px]">
                  <CropLifecycleStepper currentStage={crop.stage} compact />
                </TableCell>

                {/* Harvest Timing */}
                <TableCell className="py-3.5 px-4 text-xs">
                  <div className="font-semibold text-foreground">
                    {timing.formattedDate}
                  </div>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full font-semibold text-[10px] border ${timing.badgeClass}`}>
                    {timing.label}
                  </span>
                </TableCell>

                {/* Yield Quantities */}
                <TableCell className="py-3.5 px-4 text-xs">
                  <span className="font-bold text-foreground">
                    {formatCropQuantity(crop.available_quantity, unit)}
                  </span>
                  <span className="text-muted block text-[11px]">
                    of {formatCropQuantity(crop.expected_quantity, unit)} total
                  </span>
                </TableCell>

                {/* Reservations */}
                <TableCell className="py-3.5 px-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-muted" />
                    <span>{reservationsCount} {reservationsCount === 1 ? 'order' : 'orders'}</span>
                  </div>
                  {pendingCount > 0 && (
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-warning-muted text-warning border border-warning/30">
                      {pendingCount} pending
                    </span>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {crop.stage !== 'HARVESTED' && (
                      <button
                        type="button"
                        onClick={() => dispatch(openStageUpdateModal(crop.id))}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-brand bg-brand/10 hover:bg-brand/20 rounded-lg transition-all cursor-pointer"
                        title="Update Stage"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Update</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => dispatch(openCropDetail(crop.id))}
                      className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-surface-elevated transition-colors cursor-pointer"
                      title="View Crop Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
