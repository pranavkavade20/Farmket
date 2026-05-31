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
import toast from 'react-hot-toast';

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
          // Filter to the current farmer's products that DO NOT already have tracking
          const eligible = res.results.filter(
            (p) => p.farmer === user.id && !p.active_crop_growth_id
          );
          setAvailableProducts(eligible);
        })
        .catch(() => toast.error('Failed to load eligible products'))
        .finally(() => setIsLoadingProducts(false));
    }
  }, [isAddTrackingModalOpen, user]);

  if (!isAddTrackingModalOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Track Existing Product</h2>
          <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-5">
          <form id="tracking-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Product *
              </label>
              {isLoadingProducts ? (
                <div className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 flex items-center text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading products...
                </div>
              ) : (
                <select 
                  {...register('product')}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                >
                  <option value="">-- Choose an eligible product --</option>
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.stock_quantity} {p.unit} in stock)</option>
                  ))}
                </select>
              )}
              {errors.product && <p className="mt-1 text-sm text-red-500">{errors.product.message}</p>}
              {!isLoadingProducts && availableProducts.length === 0 && (
                <p className="mt-2 text-xs text-orange-500 font-medium">
                  You don't have any untracked products available. Try creating a new product first.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sowing Date *
                </label>
                <input 
                  type="date"
                  {...register('sowing_date')}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                />
                {errors.sowing_date && <p className="mt-1 text-sm text-red-500">{errors.sowing_date.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expected Harvest *
                </label>
                <input 
                  type="date"
                  {...register('expected_harvest_date')}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                />
                {errors.expected_harvest_date && <p className="mt-1 text-sm text-red-500">{errors.expected_harvest_date.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expected Yield Quantity *
              </label>
              <input 
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 500"
                {...register('expected_quantity')}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
              />
              {errors.expected_quantity && <p className="mt-1 text-sm text-red-500">{errors.expected_quantity.message}</p>}
            </div>

            <label className="flex items-center gap-3 cursor-pointer py-2">
              <input
                type="checkbox"
                {...register('organic')}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                This crop is organically grown
              </span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea 
                {...register('notes')}
                rows={2}
                placeholder="Seed variety, special conditions..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow resize-none"
              ></textarea>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex gap-3 mt-auto">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="tracking-form"
            disabled={isSubmitting || availableProducts.length === 0}
            className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Tracking'}
          </button>
        </div>
      </div>
    </div>
  );
};
