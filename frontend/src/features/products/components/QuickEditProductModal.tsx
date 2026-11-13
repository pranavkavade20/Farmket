import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
  Button,
  Input,
  Select,
  Switch,
  Badge,
} from '@/components/ui';
import { productService } from '../services/productService';
import type { Product } from '@/types';
import { toast } from 'sonner';
import { Package, IndianRupee, Layers, ShieldCheck, ShoppingCart } from 'lucide-react';

interface QuickEditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedProduct: Product) => void;
}

type UnitType = 'kg' | 'g' | 'l' | 'unit' | 'dozen';

const UNIT_OPTIONS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'l', label: 'Liter (L)' },
  { value: 'unit', label: 'Single Unit' },
  { value: 'dozen', label: 'Dozen (12 pcs)' },
];

interface QuickEditFormProps {
  product: Product;
  onClose: () => void;
  onSuccess: (updatedProduct: Product) => void;
}

const QuickEditForm: React.FC<QuickEditFormProps> = ({ product, onClose, onSuccess }) => {
  const [price, setPrice] = useState(product.price ? String(parseFloat(product.price)) : '');
  const [unit, setUnit] = useState<UnitType>(product.unit || 'kg');
  const [stockQuantity, setStockQuantity] = useState(String(product.stock_quantity ?? 0));
  const [minOrder, setMinOrder] = useState(String(product.minimum_order ?? 1));
  const [isAvailable, setIsAvailable] = useState(Boolean(product.is_available));
  const [isOrganic, setIsOrganic] = useState(Boolean(product.is_organic));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image ?? product.images?.[0]?.image;

  const validate = () => {
    const errs: Record<string, string> = {};
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stockQuantity, 10);
    const parsedMinOrder = parseInt(minOrder, 10);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errs.price = 'Price must be greater than ₹0';
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
      errs.stock = 'Stock quantity cannot be negative';
    }
    if (isNaN(parsedMinOrder) || parsedMinOrder < 1) {
      errs.minOrder = 'Minimum order must be at least 1';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const updated = await productService.updateProduct(product.slug, {
        price: price,
        unit: unit,
        stock_quantity: parseInt(stockQuantity, 10),
        minimum_order: parseInt(minOrder, 10),
        is_available: isAvailable,
        is_organic: isOrganic,
      });

      toast.success(`Inventory for "${updated.name}" updated successfully`);
      onSuccess(updated);
      onClose();
    } catch {
      toast.error('Failed to update product. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <ModalHeader className="pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-muted/40 border border-brand/20 flex items-center justify-center text-brand shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <ModalTitle className="text-lg font-bold text-foreground">
              Quick Adjust Inventory
            </ModalTitle>
            <ModalDescription className="text-xs text-foreground-secondary">
              Update stock levels, unit pricing, and availability in real-time.
            </ModalDescription>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="py-4 space-y-4">
        {/* Product Summary Header Banner */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated border border-border-subtle">
          <div className="h-12 w-12 rounded-lg bg-surface border border-border-subtle overflow-hidden shrink-0 flex items-center justify-center">
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-6 w-6 text-foreground-muted" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-foreground truncate">{product.name}</h4>
              {product.is_organic && (
                <Badge variant="success" size="sm" className="px-1.5 py-0 text-[10px]">
                  Organic
                </Badge>
              )}
            </div>
            <p className="text-xs text-foreground-secondary uppercase tracking-wider mt-0.5">
              {product.category_name || 'Produce'} • {product.views} Views
            </p>
          </div>
        </div>

        {/* Pricing & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Unit Price (₹) <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary">
                <IndianRupee className="h-4 w-4" />
              </span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="pl-9"
                error={errors.price}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Selling Unit <span className="text-danger">*</span>
            </label>
            <Select
              value={unit}
              onChange={(e) => setUnit(e.target.value as UnitType)}
              options={UNIT_OPTIONS}
            />
          </div>
        </div>

        {/* Stock Quantity & Min Order */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Current Stock ({unit}) <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary">
                <Layers className="h-4 w-4" />
              </span>
              <Input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="0"
                className="pl-9"
                error={errors.stock}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Minimum Order Quantity ({unit})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary">
                <ShoppingCart className="h-4 w-4" />
              </span>
              <Input
                type="number"
                min="1"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="1"
                className="pl-9"
                error={errors.minOrder}
              />
            </div>
          </div>
        </div>

        {/* Availability & Organic Switches */}
        <div className="space-y-3 pt-2 border-t border-border-subtle">
          <div className="p-3 rounded-xl bg-surface-elevated/60 border border-border-subtle">
            <Switch
              checked={isAvailable}
              onChange={setIsAvailable}
              label="Available on Marketplace"
              description={
                isAvailable
                  ? 'Buyers can find and purchase this produce immediately.'
                  : 'Hidden from public search and marketplace catalog.'
              }
            />
          </div>

          <div className="p-3 rounded-xl bg-surface-elevated/60 border border-border-subtle">
            <Switch
              checked={isOrganic}
              onChange={setIsOrganic}
              label={
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-brand" /> Certified Organic Produce
                </span>
              }
              description="Show organic harvest verification badge on marketplace cards."
            />
          </div>
        </div>
      </ModalContent>

      <ModalFooter className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="brand"
          size="sm"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Save Adjustments
        </Button>
      </ModalFooter>
    </form>
  );
};

export const QuickEditProductModal: React.FC<QuickEditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <QuickEditForm
        key={product.slug}
        product={product}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  );
};

export default QuickEditProductModal;
