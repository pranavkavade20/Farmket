import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from "sonner";
import { cropService, type CropTracking } from '../services/cropService';
import CropTimeline from '../components/CropTimeline';
import { Button } from '@/components/ui';
import { Leaf } from 'lucide-react';

const schema = z.object({
  sow_date: z.string().min(1, 'Sow date is required'),
  expected_harvest_date: z.string().min(1, 'Harvest date is required'),
});

type FormData = z.infer<typeof schema>;

export default function CropTrackingForm() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState<CropTracking | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    if (slug) {
      cropService.getTracking(slug)
        .then((data: any) => {
          if (data && data.length > 0) {
            setTracking(data[0]);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const onSubmit = async (data: FormData) => {
    if (!slug) return;
    try {
      if (tracking) {
        toast.success('Crop tracking updated');
      } else {
        const newTracking = await cropService.createTracking(slug, data);
        setTracking(newTracking);
        toast.success('Crop tracking created');
      }
    } catch (error) {
      toast.error('Failed to save tracking details');
    }
  };

  const handleStageUpdate = async (stage: string) => {
    if (!slug || !tracking) return;
    try {
      const res = await cropService.updateStage(slug, tracking.id, stage, 'Updated manually via dashboard');
      setTracking(prev => prev ? { ...prev, current_stage: res.current_stage as any } : null);
      toast.success('Stage updated successfully');
    } catch (error) {
      toast.error('Failed to update stage');
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto p-6 bg-surface rounded-3xl shadow-sm border border-border-subtle mt-8">
      <div className="animate-pulse h-8 w-64 bg-border-strong rounded mb-6"></div>
      <div className="animate-pulse h-48 bg-border-strong rounded-2xl"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-8 bg-surface rounded-3xl shadow-sm border border-border-subtle mt-8">
      <div className="flex items-center gap-3 mb-8 border-b border-border-subtle pb-6">
        <div className="h-12 w-12 rounded-2xl bg-brand-muted/20 flex items-center justify-center">
          <Leaf className="h-6 w-6 text-brand" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Track Crop Lifecycle</h2>
          <p className="text-sm font-medium text-foreground-secondary mt-1">Manage growth stages and harvesting timeline</p>
        </div>
      </div>
      
      {!tracking ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-widest">Sow Date</label>
              <input 
                type="date" 
                {...register('sow_date')}
                className="w-full bg-surface border border-border-strong rounded-2xl px-4 py-3.5 text-sm font-medium text-foreground focus:ring-1 focus:ring-brand focus:border-brand transition-all shadow-sm"
              />
              {errors.sow_date && <p className="text-danger text-xs font-semibold mt-1">{errors.sow_date.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-widest">Expected Harvest Date</label>
              <input 
                type="date" 
                {...register('expected_harvest_date')}
                className="w-full bg-surface border border-border-strong rounded-2xl px-4 py-3.5 text-sm font-medium text-foreground focus:ring-1 focus:ring-brand focus:border-brand transition-all shadow-sm"
              />
              {errors.expected_harvest_date && <p className="text-danger text-xs font-semibold mt-1">{errors.expected_harvest_date.message}</p>}
            </div>
          </div>
          
          <Button 
            type="submit" 
            variant="primary"
            isLoading={isSubmitting}
            className="w-full h-14 rounded-full font-bold text-base"
          >
            Start Tracking
          </Button>
        </form>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-2 gap-4 bg-surface-elevated p-6 rounded-2xl border border-border-subtle">
            <div>
              <span className="text-xs font-bold text-foreground-secondary uppercase tracking-widest block mb-1">Sown On</span>
              <p className="text-lg font-bold text-foreground">{new Date(tracking.sow_date).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-foreground-secondary uppercase tracking-widest block mb-1">Expected Harvest</span>
              <p className="text-lg font-bold text-foreground">{new Date(tracking.expected_harvest_date).toLocaleDateString()}</p>
            </div>
          </div>
          
          <CropTimeline tracking={tracking} />
          
          <div className="pt-8 border-t border-border-strong">
            <h4 className="text-base font-bold text-foreground mb-4">Update Stage</h4>
            <div className="flex flex-wrap gap-3">
              {['sown', 'growing', 'ready_for_harvest', 'harvested'].map(stage => (
                <button
                  key={stage}
                  onClick={() => handleStageUpdate(stage)}
                  disabled={tracking.current_stage === stage}
                  className={`px-5 py-3 rounded-xl text-sm font-bold transition-all border ${
                    tracking.current_stage === stage 
                      ? 'bg-brand-muted/20 text-brand border-brand shadow-sm' 
                      : 'bg-surface border-border-strong text-foreground-secondary hover:bg-surface-elevated hover:text-foreground'
                  }`}
                >
                  {stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
