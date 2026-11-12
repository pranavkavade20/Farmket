import React from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { closeStageUpdateModal } from '../cropsSlice';
import { useUpdateCropStageMutation, useGetCropDetailsQuery } from '../cropsApi';
import { toast } from 'sonner';
import { Modal, Button, Textarea } from '@/components/ui';
import { Sprout, Leaf, Wheat, PackageCheck, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { CropStage } from '@/types/crops';

const stageSchema = z.object({
  stage: z.enum(['PLANTED', 'GROWING', 'NEAR_HARVEST', 'HARVESTED']),
  remarks: z.string().optional(),
});

type StageFormData = z.infer<typeof stageSchema>;

interface StageOption {
  id: CropStage;
  label: string;
  description: string;
  icon: React.ElementType;
}

const STAGE_OPTIONS: StageOption[] = [
  {
    id: 'PLANTED',
    label: 'Planted',
    description: 'Seeds sown, initial germination underway',
    icon: Sprout,
  },
  {
    id: 'GROWING',
    label: 'Actively Growing',
    description: 'Vegetative growth, irrigation & foliage development',
    icon: Leaf,
  },
  {
    id: 'NEAR_HARVEST',
    label: 'Near Harvest',
    description: 'Crops maturing, expected to harvest within 14 days',
    icon: Wheat,
  },
  {
    id: 'HARVESTED',
    label: 'Harvested',
    description: 'Harvest complete, ready to distribute to buyers',
    icon: PackageCheck,
  },
];

export const StageUpdateModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isStageUpdateModalOpen, selectedCropId } = useAppSelector((state) => state.crops);
  const [updateStage, { isLoading }] = useUpdateCropStageMutation();

  const { data: currentCrop } = useGetCropDetailsQuery(selectedCropId ?? 0, {
    skip: !selectedCropId || !isStageUpdateModalOpen,
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm<StageFormData>({
    resolver: zodResolver(stageSchema),
    defaultValues: {
      stage: 'GROWING',
    },
  });

  const selectedStage = useWatch({ control, name: 'stage' });

  // Sync current stage when modal opens with crop data
  React.useEffect(() => {
    if (currentCrop?.stage) {
      const stages: CropStage[] = ['PLANTED', 'GROWING', 'NEAR_HARVEST', 'HARVESTED'];
      const currentIndex = stages.indexOf(currentCrop.stage);
      // Default to next stage if available, otherwise current stage
      const nextStage = currentIndex >= 0 && currentIndex < stages.length - 1
        ? stages[currentIndex + 1]
        : currentCrop.stage;
      setValue('stage', nextStage);
    }
  }, [currentCrop, setValue]);

  const handleClose = () => {
    dispatch(closeStageUpdateModal());
    reset();
  };

  const onSubmit = async (data: StageFormData) => {
    if (!selectedCropId) return;
    try {
      await updateStage({ id: selectedCropId, ...data }).unwrap();
      toast.success('Crop stage updated successfully! Interested buyers will be notified.');
      handleClose();
    } catch (err: unknown) {
      toast.error((err as { data?: { error?: string } })?.data?.error || 'Failed to update stage');
    }
  };

  const cropName = currentCrop?.product_details?.name || currentCrop?.crop_name;

  return (
    <Modal
      isOpen={isStageUpdateModalOpen}
      onClose={handleClose}
      title="Update Crop Lifecycle Stage"
      description={
        cropName
          ? `Advance ${cropName} to its next lifecycle stage and keep waitlisted buyers informed.`
          : 'Advance lifecycle stages and keep waitlisted buyers informed.'
      }
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Interactive Stage Cards */}
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-wider font-bold text-muted">
            Select New Stage *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="radiogroup" aria-label="Growth Stage">
            {STAGE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedStage === opt.id;
              const isCurrent = currentCrop?.stage === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setValue('stage', opt.id, { shouldValidate: true })}
                  className={cn(
                    'p-3.5 rounded-2xl border text-left transition-all duration-150 flex items-start gap-3 cursor-pointer group',
                    isSelected
                      ? 'border-brand bg-brand/5 ring-2 ring-brand/20 shadow-xs'
                      : 'border-border-subtle bg-surface hover:bg-surface-elevated hover:border-border-strong'
                  )}
                >
                  <div
                    className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
                      isSelected
                        ? 'bg-brand text-on-brand shadow-xs'
                        : 'bg-surface-elevated text-muted border border-border-subtle'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={cn('text-xs font-bold', isSelected ? 'text-brand' : 'text-foreground')}>
                        {opt.label}
                      </span>
                      {isCurrent ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-surface-elevated text-muted border border-border-subtle">
                          Current
                        </span>
                      ) : isSelected ? (
                        <Check className="w-3.5 h-3.5 text-brand stroke-[3]" />
                      ) : null}
                    </div>
                    <p className="text-[11px] text-foreground-secondary leading-snug line-clamp-2">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          {errors.stage && (
            <p className="text-xs text-danger font-medium mt-1">{errors.stage.message}</p>
          )}
        </div>

        {/* Remarks Input */}
        <div>
          <Textarea
            label="Field Remarks & Harvest Observations (Optional)"
            placeholder="E.g., Flowering stage reached, organic neem spray applied, weather favorable..."
            rows={3}
            error={errors.remarks?.message}
            {...register('remarks')}
            helperText="Notes are logged in your crop's historical timeline for buyer transparency."
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-xl px-4"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="brand"
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-4 h-4" />}
            className="rounded-xl px-5 font-bold shadow-xs"
          >
            Update Stage
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StageUpdateModal;
