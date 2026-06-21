import React from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { closeStageUpdateModal } from '../cropsSlice';
import { useUpdateCropStageMutation } from '../cropsApi';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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

  const handleClose = () => {
    dispatch(closeStageUpdateModal());
    reset();
  };

  const onSubmit = async (data: StageFormData) => {
    if (!selectedCropId) return;
    try {
      await updateStage({ id: selectedCropId, ...data }).unwrap();
      toast.success('Crop stage updated successfully');
      handleClose();
    } catch (err: unknown) {
      toast.error((err as any)?.data?.error || 'Failed to update stage');
    }
  };

  return (
    <AnimatePresence>
      {isStageUpdateModalOpen && (
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
            className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-border-subtle"
          >
            <div className="flex justify-between items-center p-5 border-b border-border-subtle">
              <h2 className="text-xl font-display font-semibold text-foreground">Update Crop Stage</h2>
              <button 
                onClick={handleClose} 
                className="p-1.5 text-muted hover:text-foreground rounded-full hover:bg-surface-elevated transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  New Stage
                </label>
                <div className="relative">
                  <select 
                    {...register('stage')}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-border-strong bg-surface text-foreground focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all appearance-none outline-none"
                  >
                    <option value="PLANTED">Planted</option>
                    <option value="GROWING">Growing</option>
                    <option value="NEAR_HARVEST">Near Harvest</option>
                    <option value="HARVESTED">Harvested</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
                {errors.stage && <p className="mt-1.5 text-sm text-danger font-medium">{errors.stage.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Remarks / Notes
                </label>
                <textarea 
                  {...register('remarks')}
                  rows={3}
                  placeholder="E.g., Added natural fertilizer..."
                  className="w-full px-4 py-3 rounded-xl border border-border-strong bg-surface text-foreground placeholder-muted focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none outline-none"
                ></textarea>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-foreground bg-surface-elevated hover:bg-border-subtle rounded-xl transition-all active:scale-95 border border-border-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-medium text-surface bg-brand hover:bg-brand-hover active:bg-brand-active disabled:opacity-70 rounded-xl transition-all shadow-sm active:scale-95"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Stage'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
