import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { closeReservationModal } from '../cropsSlice';
import { useReserveCropMutation, useGetCropDetailsQuery } from '../cropsApi';
import { Loader2, Package, Sprout, Calendar, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Button, Input, Alert } from '@/components/ui';

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

  const maxAvailable = Number(crop?.available_quantity || 0);
  const unit = crop?.product_details?.unit || 'units';
  const cropName = crop?.product_details?.name || crop?.crop_name || 'Crop Harvest';

  const unitPrice = parseFloat(crop?.product_details?.price || '0');
  const estimatedCost =
    !isNaN(unitPrice) && unitPrice > 0 && quantity > 0
      ? new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(quantity * unitPrice)
      : null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crop) return;

    if (quantity <= 0 || quantity > maxAvailable) {
      toast.error(`Please enter a valid quantity between 0.1 and ${maxAvailable} ${unit}`);
      return;
    }

    try {
      await reserveCrop({ id: selectedCropId, quantity }).unwrap();
      toast.success('Pre-booking reservation submitted to farmer for approval!');
      handleClose();
    } catch (err: unknown) {
      toast.error((err as { data?: { error?: string } })?.data?.error || 'Failed to reserve harvest');
    }
  };

  return (
    <Modal
      isOpen={isReservationModalOpen}
      onClose={handleClose}
      title={`Pre-Book Harvest: ${cropName}`}
      description="Reserve fresh harvest allocations directly from the farm before harvesting."
      size="sm"
    >
      {isLoadingCrop || !crop ? (
        <div className="p-10 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
          <p className="text-xs text-muted font-medium">Loading crop harvest details...</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Crop Overview Banner */}
          <Alert variant="info" icon={<Sprout className="h-5 w-5 text-brand" />}>
            <div className="space-y-1">
              <p className="font-bold text-foreground text-sm">{cropName}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground-secondary">
                <span>
                  <strong>Available:</strong> {crop.available_quantity} {unit}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-muted" />
                  <strong>Expected:</strong>{' '}
                  {new Date(crop.expected_harvest_date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </Alert>

          {/* Quantity Input */}
          <div>
            <Input
              id="reserve-quantity"
              label={`Quantity to Reserve (${unit}) *`}
              type="number"
              min={0.1}
              max={maxAvailable}
              step={0.1}
              value={quantity || ''}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder={`Up to ${maxAvailable} ${unit}`}
              icon={<Package className="h-4 w-4 text-muted" />}
              helperText={`Farmer confirmation required. Maximum order: ${maxAvailable} ${unit}`}
              required
            />
          </div>

          {/* Cost Estimate Preview */}
          {estimatedCost && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/50 border border-border-subtle text-xs">
              <span className="text-muted font-medium">Estimated Harvest Value</span>
              <span className="text-brand font-bold text-sm">{estimatedCost}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isReserving}
              className="rounded-xl px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="brand"
              disabled={isReserving || quantity <= 0 || quantity > maxAvailable}
              isLoading={isReserving}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="rounded-xl px-5 font-bold shadow-xs"
            >
              Confirm Pre-booking
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ReservationModal;
