import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import type { Product } from '@/types';
import { orderService } from '@/features/orders/services/orderService';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { X } from 'lucide-react';

interface Props {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationModal = ({ product, isOpen, onClose }: Props) => {
  const [quantity, setQuantity] = useState<number>(product.minimum_order || 1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity > product.available_quantity) {
      toast.error(`Only ${product.available_quantity} ${product.unit} available for reservation.`);
      return;
    }
    try {
      setLoading(true);
      // We add to cart as a prebooking item
      await orderService.addToCart(product.id, quantity, true);
      toast.success('Added to prebooking cart!');
      onClose();
      // Optionally navigate to cart or stay
    } catch (err) {
      toast.error('Failed to reserve harvest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reserve {product.name}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleReserve} className="p-5 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm text-blue-800 dark:text-blue-400">
            <p><strong>Available for Pre-booking:</strong> {product.available_quantity} {product.unit}</p>
            <p><strong>Expected Harvest:</strong> {product.harvest_date || 'TBD'}</p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reservation Quantity ({product.unit})</label>
            <Input
              id="quantity"
              type="number"
              min={product.minimum_order || 1}
              max={product.available_quantity}
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
              {loading ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
