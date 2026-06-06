import React from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { closeStageUpdateModal } from '../cropsSlice';
import { useUpdateCropStageMutation } from '../cropsApi';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const stageSchema = z.object({
  stage: z.enum([
    'PLANTED', 'GROWING', 'NEAR_HARVEST', 'HARVESTED'
  ]),
  remarks: z.string().optional(),
});

type StageFormData = z.infer<typeof stageSchema>;

export const StageUpdateModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isStageUpdateModalOpen, selectedCropId } = useAppSelector((state) => state.crops);
  const [updateStage, { isLoading }] = useUpdateCropStageMutation();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<StageFormData>({
    resolver: zodResolver(stageSchema),
  });

  if (!isStageUpdateModalOpen || !selectedCropId) return null;

  const handleClose = () => {
    dispatch(closeStageUpdateModal());
    reset();
  };

  const onSubmit = async (data: StageFormData) => {
    try {
      await updateStage({ id: selectedCropId, ...data }).unwrap();
      toast.success('Crop stage updated successfully');
      handleClose();
    } catch (err: unknown) {
      toast.error((err as any)?.data?.error || 'Failed to update stage');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Update Crop Stage</h2>
          <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Stage
            </label>
            <select 
              {...register('stage')}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
            >
              <option value="PLANTED">Planted</option>
              <option value="GROWING">Growing</option>
              <option value="NEAR_HARVEST">Near Harvest</option>
              <option value="HARVESTED">Harvested</option>
            </select>
            {errors.stage && <p className="mt-1 text-sm text-red-500">{errors.stage.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Remarks / Notes
            </label>
            <textarea 
              {...register('remarks')}
              rows={3}
              placeholder="E.g., Added natural fertilizer..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow resize-none"
            ></textarea>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-70 rounded-lg transition-colors"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Stage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
