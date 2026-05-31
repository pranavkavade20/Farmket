import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import type { Product } from '@/types';
import { productService } from '../services/productService';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface Props {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const WaitlistModal = ({ product, isOpen, onClose }: Props) => {
  const [quantity, setQuantity] = useState<number>(product.minimum_order || 1);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await productService.waitlistProduct(product.slug, quantity);
      toast.success('Joined waitlist successfully!');
      onClose();
    } catch (err) {
      toast.error('Failed to join waitlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Join Waitlist for {product.name}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This crop is currently fully reserved or sold out. Join the waitlist to be notified if stock becomes available or if someone cancels their reservation.
          </p>
          <div className="space-y-2">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity needed ({product.unit})</label>
            <Input
              id="quantity"
              type="number"
              min={product.minimum_order || 1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Joining...' : 'Join Waitlist'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
