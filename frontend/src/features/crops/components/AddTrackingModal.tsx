import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { closeAddTrackingModal } from '../cropsSlice';
import { useCreateCropMutation } from '../cropsApi';
import { productService } from '@/features/products';
import { useAuth } from '@/features/auth';
import type { Product } from '@/types';
import { X, Loader2, Sprout, Calendar, Package, Leaf, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const trackingSchema = z.object({
  product: z.string().min(1, 'Please select an eligible product'),
  sowing_date: z.string().min(1, 'Sowing date is required'),
  expected_harvest_date: z.string().min(1, 'Expected harvest date is required'),
  expected_quantity: z.string().min(1, 'Expected quantity is required'),
  organic: z.boolean(),
  notes: z.string().optional(),
});

type TrackingFormData = z.infer<typeof trackingSchema>;

export const AddTrackingModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { isAddTrackingModalOpen } = useAppSelector((state) => state.crops);
  const [createCrop, { isLoading: isSubmitting }] = useCreateCropMutation();

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<TrackingFormData>({
    resolver: zodResolver(trackingSchema),
    defaultValues: { organic: false },
  });

  const selectedProductId = useWatch({ control, name: 'product' });
  const selectedProduct = availableProducts.find((p) => String(p.id) === selectedProductId);

  useEffect(() => {
    if (isAddTrackingModalOpen && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoadingProducts(true);
      productService
        .getProducts({ ordering: '-created_at' })
        .then((res) => {
          const eligible = res.results.filter(
            (p) => p.farmer === user.id && !p.active_crop_growth_id
          );
          setAvailableProducts(eligible);
        })
        .catch(() => toast.error('Failed to load eligible products'))
        .finally(() => setIsLoadingProducts(false));
    }
  }, [isAddTrackingModalOpen, user]);

  const handleClose = () => {
    dispatch(closeAddTrackingModal());
    reset();
  };

  const onSubmit = async (data: TrackingFormData) => {
    if (new Date(data.expected_harvest_date) <= new Date(data.sowing_date)) {
      toast.error('Expected harvest date must be after sowing date');
      return;
    }

    try {
      await createCrop({
        product: parseInt(data.product, 10),
        sowing_date: data.sowing_date,
        expected_harvest_date: data.expected_harvest_date,
        expected_quantity: data.expected_quantity,
        organic: data.organic,
        notes: data.notes || '',
      }).unwrap();

      toast.success('Crop tracking started successfully!');
      handleClose();
    } catch (error: unknown) {
      const err = error as { data?: unknown };
      const apiErr = err?.data;
      if (apiErr && typeof apiErr === 'object') {
        const firstError = Object.values(apiErr)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        toast.error('Failed to start tracking');
      }
    }
  };

  return (
    <AnimatePresence>
      {isAddTrackingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-surface rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] border border-border-subtle"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-border-subtle bg-surface">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-foreground">
                    Track Existing Crop
                  </h2>
                  <p className="text-xs text-muted">
                    Connect an active product to a growth cycle and monitor harvest timing.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 text-muted hover:text-foreground rounded-xl hover:bg-surface-elevated transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="overflow-y-auto p-5 space-y-6">
              <form id="tracking-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* 1. Crop Product Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider font-bold text-muted flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-brand" /> 1. Crop Information
                    </label>
                    <Link
                      to="/dashboard/products/new"
                      onClick={handleClose}
                      className="text-xs text-brand hover:underline font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Product
                    </Link>
                  </div>

                  {isLoadingProducts ? (
                    <div className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-surface-elevated flex items-center text-xs text-muted">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin text-brand" /> Loading your products...
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        {...register('product')}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-border-strong bg-surface text-foreground text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all appearance-none outline-none cursor-pointer"
                      >
                        <option value="">-- Choose a product to track --</option>
                        {availableProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.stock_quantity} {p.unit} current stock)
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {errors.product && (
                    <p className="text-xs text-danger font-semibold">{errors.product.message}</p>
                  )}

                  {!isLoadingProducts && availableProducts.length === 0 && (
                    <div className="p-3.5 rounded-xl bg-warning-muted/40 border border-warning/30 text-xs text-warning font-medium">
                      All your existing products already have active crop tracking or none exist yet. You can create a new product first.
                    </div>
                  )}

                  {/* Product Preview Card */}
                  {selectedProduct && (
                    <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle flex items-center gap-3">
                      {selectedProduct.images?.[0]?.image ? (
                        <img
                          src={selectedProduct.images[0].image}
                          alt={selectedProduct.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center text-xl">🌱</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate">{selectedProduct.name}</p>
                        <p className="text-[11px] text-muted">
                          Category: {selectedProduct.category || 'Agricultural'} • Unit: {selectedProduct.unit}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Organic Checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer py-1 group">
                    <input
                      type="checkbox"
                      {...register('organic')}
                      className="h-4 w-4 rounded border-border-strong text-brand focus:ring-brand/20 bg-surface transition-all cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-foreground group-hover:text-brand transition-colors flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5 text-brand" />
                      This crop is organically cultivated
                    </span>
                  </label>
                </div>

                {/* 2. Lifecycle Timeline */}
                <div className="space-y-3 pt-3 border-t border-border-subtle">
                  <label className="text-xs uppercase tracking-wider font-bold text-muted flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand" /> 2. Growing Timeline
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground-secondary mb-1">
                        Sowing / Planting Date *
                      </label>
                      <input
                        type="date"
                        {...register('sowing_date')}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border-strong bg-surface text-foreground text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none"
                      />
                      {errors.sowing_date && (
                        <p className="mt-1 text-xs text-danger font-medium">{errors.sowing_date.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-foreground-secondary mb-1">
                        Expected Harvest Date *
                      </label>
                      <input
                        type="date"
                        {...register('expected_harvest_date')}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border-strong bg-surface text-foreground text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none"
                      />
                      {errors.expected_harvest_date && (
                        <p className="mt-1 text-xs text-danger font-medium">{errors.expected_harvest_date.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Production Yield */}
                <div className="space-y-3 pt-3 border-t border-border-subtle">
                  <label className="text-xs uppercase tracking-wider font-bold text-muted flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-brand" /> 3. Expected Yield Quantity
                  </label>

                  <div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g. 500"
                        {...register('expected_quantity')}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border-strong bg-surface text-foreground text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none pr-16"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted uppercase">
                        {selectedProduct?.unit || 'units'}
                      </span>
                    </div>
                    {errors.expected_quantity && (
                      <p className="mt-1 text-xs text-danger font-medium">{errors.expected_quantity.message}</p>
                    )}
                  </div>
                </div>

                {/* 4. Notes & Varieties */}
                <div className="space-y-2 pt-3 border-t border-border-subtle">
                  <label className="block text-xs font-medium text-foreground-secondary">
                    Field Notes & Seed Variety (Optional)
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={2}
                    placeholder="e.g. Alphonso graft, drip irrigated, high nitrogen soil..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-strong bg-surface text-foreground placeholder-muted text-xs focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none outline-none"
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-border-subtle flex gap-3 bg-surface shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 text-xs font-semibold text-foreground bg-surface-elevated hover:bg-border-subtle rounded-xl transition-all border border-border-subtle cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="tracking-form"
                disabled={isSubmitting || availableProducts.length === 0}
                className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover active:bg-brand-active disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  'Start Tracking'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
