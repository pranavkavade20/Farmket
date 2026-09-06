import React from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { closeStageUpdateModal } from '../cropsSlice';
import { useUpdateCropStageMutation } from '../cropsApi';
import { toast } from "sonner";
import { Modal, Button, Select, Textarea } from '@/components/ui';

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
      toast.error((err as { data?: { error?: string } })?.data?.error || 'Failed to update stage');
    }
  };

  return (
    <Modal
      isOpen={isStageUpdateModalOpen}
      onClose={handleClose}
      title="Update Crop Stage"
      description="Advance lifecycle stages and keep waitlisted buyers informed."
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Select
            label="New Growth Stage"
            error={errors.stage?.message}
            {...register('stage')}
            options={[
              { value: 'PLANTED', label: 'Planted' },
              { value: 'GROWING', label: 'Actively Growing' },
              { value: 'NEAR_HARVEST', label: 'Near Harvest' },
              { value: 'HARVESTED', label: 'Harvested' },
            ]}
          />
        </div>

        <div>
          <Textarea
            label="Remarks / Harvest Notes (Optional)"
            placeholder="E.g., Flowering stage reached, natural fertilizer added…"
            rows={3}
            error={errors.remarks?.message}
            {...register('remarks')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="rounded-xl">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} className="rounded-xl px-5">
            Update Stage
          </Button>
        </div>
      </form>
    </Modal>
  );
};
