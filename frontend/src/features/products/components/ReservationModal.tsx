import { useState } from 'react';
import { Button, Input, Modal, Alert } from '@/components/ui';
import type { Product } from '@/types';
import { orderService } from '@/features/orders/services/orderService';
import { toast } from "sonner";
import { Sprout } from 'lucide-react';

interface Props {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationModal = ({ product, isOpen, onClose }: Props) => {
  const [quantity, setQuantity] = useState<number>(product.minimum_order || 1);
  const [loading, setLoading] = useState(false);

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity > product.available_quantity) {
      toast.error(`Only ${product.available_quantity} ${product.unit} available for reservation.`);
      return;
    }
    try {
      setLoading(true);
      await orderService.addToCart(product.id, quantity, true);
      toast.success('Added to pre-booking cart!');
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
      title={`Reserve ${product.name}`}
      description="Secure fresh produce directly before harvest."
      size="sm"
    >
      <form onSubmit={handleReserve} className="space-y-4">
        <Alert variant="info" icon={<Sprout className="h-5 w-5 text-info" />}>
          <p className="font-semibold text-foreground">Pre-booking Details</p>
          <p className="text-xs text-foreground-secondary mt-0.5">
            <strong>Available:</strong> {product.available_quantity} {product.unit} · <strong>Expected Harvest:</strong> {product.harvest_date || 'TBD'}
          </p>
        </Alert>

        <div>
          <Input
            id="quantity"
            label={`Reservation Quantity (${product.unit})`}
            type="number"
            min={product.minimum_order || 1}
            max={product.available_quantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="rounded-xl">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading} className="rounded-xl px-5">
            Add to Pre-booking Cart
          </Button>
        </div>
      </form>
    </Modal>
  );
};
