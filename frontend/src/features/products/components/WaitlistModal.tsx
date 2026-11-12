import React, { useState } from 'react';
import { Button, Input, Modal, Alert } from '@/components/ui';
import type { Product } from '@/types';
import { productService } from '../services/productService';
import { toast } from 'sonner';
import { Bell, Sparkles } from 'lucide-react';

export interface WaitlistModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState<number>(product.minimum_order || 1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await productService.waitlistProduct(product.slug, quantity);
      toast.success(`You've joined the waitlist for ${product.name}! We'll notify you first.`);
      onClose();
    } catch {
      toast.error('Failed to join waitlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Join Waitlist: ${product.name}`}
      description="Be immediately alerted when fresh allocations or next-cycle harvest spots become available."
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert variant="warning" icon={<Bell className="h-5 w-5 text-warning" />}>
          <p className="text-xs text-foreground-secondary leading-relaxed">
            This crop allocation is currently fully committed. Joining the waitlist gives you priority access if the farmer increases estimated yield or if an existing reservation cancels.
          </p>
        </Alert>

        <div>
          <Input
            id="waitlist-quantity"
            label={`Desired Quantity (${product.unit}) *`}
            type="number"
            min={product.minimum_order || 1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            helperText="Lets the farmer gauge extra demand for this harvest cycle."
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
            leftIcon={<Sparkles className="w-4 h-4" />}
            className="rounded-xl px-5 font-bold shadow-xs"
          >
            Join Waitlist
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default WaitlistModal;
