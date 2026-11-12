import React, { useState } from 'react';
import { Button, Input, Modal, Alert } from '@/components/ui';
import type { Product } from '@/types';
import { orderService } from '@/features/orders/services/orderService';
import { toast } from 'sonner';
import { Sprout, ShoppingCart, Calendar } from 'lucide-react';

export interface ProductReservationModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationModal: React.FC<ProductReservationModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [quantity, setQuantity] = useState<number>(product.minimum_order || 1);
  const [loading, setLoading] = useState(false);

  const minOrder = product.minimum_order || 1;
  const maxAvailable = product.available_quantity || 0;

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity > maxAvailable) {
      toast.error(`Only ${maxAvailable} ${product.unit} available for reservation.`);
      return;
    }
    if (quantity < minOrder) {
      toast.error(`Minimum order quantity is ${minOrder} ${product.unit}.`);
      return;
    }

    try {
      setLoading(true);
      await orderService.addToCart(product.id, quantity, true);
      toast.success(`${product.name} added to your pre-booking cart!`);
      onClose();
    } catch {
      toast.error('Failed to reserve harvest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pre-Order Harvest: ${product.name}`}
      description="Secure fresh farm produce directly from the grower before harvest day."
      size="sm"
    >
      <form onSubmit={handleReserve} className="space-y-4">
        <Alert variant="info" icon={<Sprout className="h-5 w-5 text-brand" />}>
          <div className="space-y-0.5">
            <p className="font-bold text-foreground text-xs uppercase tracking-wider">
              Harvest Details
            </p>
            <p className="text-xs text-foreground-secondary">
              <strong>Available to Reserve:</strong> {maxAvailable} {product.unit} •{' '}
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3 text-muted" />
                <strong>Est. Harvest:</strong> {product.harvest_date || 'Upcoming'}
              </span>
            </p>
          </div>
        </Alert>

        <div>
          <Input
            id="product-reserve-quantity"
            label={`Reservation Quantity (${product.unit}) *`}
            type="number"
            min={minOrder}
            max={maxAvailable}
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            helperText={`Minimum order is ${minOrder} ${product.unit}. Available: ${maxAvailable} ${product.unit}`}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl px-4"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="brand"
            isLoading={loading}
            disabled={loading || maxAvailable <= 0}
            leftIcon={<ShoppingCart className="w-4 h-4" />}
            className="rounded-xl px-5 font-bold shadow-xs"
          >
            Add to Pre-booking Cart
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReservationModal;
