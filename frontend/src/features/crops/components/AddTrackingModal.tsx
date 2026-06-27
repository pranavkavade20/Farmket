import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { closeAddTrackingModal } from '../cropsSlice';
import { useCreateCropMutation } from '../cropsApi';
import { productService } from '@/features/products';
import { useAuth } from '@/features/auth';
import type { Product } from '@/types';
import { X, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { motion, AnimatePresence } from 'framer-motion';

const trackingSchema = z.object({
  product: z.string().min(1, 'Please select a product'),
  sowing_date: z.string().min(1, 'Sowing date is required'),
  expected_harvest_date: z.string().min(1, 'Expected harvest date is required'),
  expected_quantity: z.string().min(1, 'Expected quantity is required'),
  organic: z.boolean().default(false),
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

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TrackingFormData>({
    resolver: zodResolver(trackingSchema),
    defaultValues: { organic: false },
  });

  useEffect(() => {
    if (isAddTrackingModalOpen && user) {
      setIsLoadingProducts(true);
      productService.getProducts({ ordering: '-created_at' })
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
      toast.error('Harvest date must be after sowing date');
      return;
    }

    try {
      await createCrop({
        product: parseInt(data.product, 10),
        sowing_date: data.sowing_date,
        expected_harvest_date: data.expected_harvest_date,
        expected_quantity: parseFloat(data.expected_quantity),
        organic: data.organic,
        notes: data.notes || '',
      }).unwrap();
      
      toast.success('Crop tracking started successfully!');
      handleClose();
    } catch (err: any) {
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
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-surface rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-border-subtle"
          >
            <div className="flex justify-between items-center p-5 border-b border-border-subtle">
              <h2 className="text-xl font-display font-semibold text-foreground">Track Existing Product</h2>
              <button 
                onClick={handleClose} 
                className="p-1.5 text-muted hover:text-foreground rounded-full hover:bg-surface-elevated transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-5 custom-scrollbar">
              <form id="tracking-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Select Product *
                  </label>
                  {isLoadingProducts ? (
                    <div className="w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-surface-elevated flex items-center text-sm text-muted">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading products...
                    </div>
                  ) : (
                    <div className="relative">
                      <select 
                        {...register('product')}
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all appearance-none outline-none"
                      >
                        <option value="">-- Choose an eligible product --</option>
                        {availableProducts.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} ({p.stock_quantity} {p.unit} in stock)</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  )}
                  {errors.product && <p className="mt-1.5 text-sm text-danger font-medium">{errors.product.message}</p>}
                  {!isLoadingProducts && availableProducts.length === 0 && (
                    <p className="mt-2 text-xs text-warning font-medium">
                      You don't have any untracked products available. Try creating a new product first.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Sowing Date *
                    </label>
                    <input 
                      type="date"
                      {...register('sowing_date')}
                      className="w-full px-4 py-2.5 rounded-xl border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none"
                    />
                    {errors.sowing_date && <p className="mt-1.5 text-sm text-danger font-medium">{errors.sowing_date.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Expected Harvest *
                    </label>
                    <input 
                      type="date"
                      {...register('expected_harvest_date')}
                      className="w-full px-4 py-2.5 rounded-xl border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none"
                    />
                    {errors.expected_harvest_date && <p className="mt-1.5 text-sm text-danger font-medium">{errors.expected_harvest_date.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Expected Yield Quantity *
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 500"
                    {...register('expected_quantity')}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none"
                  />
                  {errors.expected_quantity && <p className="mt-1.5 text-sm text-danger font-medium">{errors.expected_quantity.message}</p>}
                </div>

                <label className="flex items-center gap-3 cursor-pointer py-2 group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      {...register('organic')}
                      className="h-4 w-4 rounded border-border-strong text-brand focus:ring-brand/20 bg-surface transition-all cursor-pointer peer"
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-brand transition-colors">
                    This crop is organically grown
                  </span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Notes
                  </label>
                  <textarea 
                    {...register('notes')}
                    rows={2}
                    placeholder="Seed variety, special conditions..."
                    className="w-full px-4 py-3 rounded-xl border border-border-strong bg-surface text-foreground placeholder-muted focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none outline-none"
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="p-5 border-t border-border-subtle flex gap-3 mt-auto bg-surface">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-foreground bg-surface-elevated hover:bg-border-subtle rounded-xl transition-all border border-border-subtle active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="tracking-form"
                disabled={isSubmitting || availableProducts.length === 0}
                className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-medium text-surface bg-brand hover:bg-brand-hover active:bg-brand-active disabled:opacity-70 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm active:scale-95"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Tracking'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
