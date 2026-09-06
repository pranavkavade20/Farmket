import { useState } from 'react';
import { Button, Input, Modal, Alert } from '@/components/ui';
import type { Product } from '@/types';
import { productService } from '../services/productService';
import { toast } from "sonner";
import { Clock } from 'lucide-react';

interface Props {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const WaitlistModal = ({ product, isOpen, onClose }: Props) => {
  const [quantity, setQuantity] = useState<number>(product.minimum_order || 1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await productService.waitlistProduct(product.slug, quantity);
      toast.success('Joined waitlist successfully!');
      onClose();
    } catch {
      toast.error('Failed to join waitlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Join Waitlist for ${product.name}`}
      description="Get notified immediately when stock opens up."
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert variant="warning" icon={<Clock className="h-5 w-5 text-warning" />}>
          <p className="text-xs text-foreground-secondary leading-relaxed">
            This crop is currently fully reserved or sold out. Join the waitlist to be first in line if extra yield becomes available.
          </p>
        </Alert>

        <div>
          <Input
            id="quantity"
            label={`Quantity Needed (${product.unit})`}
            type="number"
            min={product.minimum_order || 1}
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
            Join Waitlist
          </Button>
        </div>
      </form>
    </Modal>
  );
};
