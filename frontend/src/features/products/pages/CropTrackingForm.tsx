import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { cropService, type CropTracking } from '../services/cropService';
import CropTimeline from '../components/CropTimeline';

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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Track Crop Lifecycle</h2>
      
      {!tracking ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sow Date</label>
              <input 
                type="date" 
                {...register('sow_date')}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              {errors.sow_date && <p className="text-red-500 text-sm mt-1">{errors.sow_date.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Harvest Date</label>
              <input 
                type="date" 
                {...register('expected_harvest_date')}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              {errors.expected_harvest_date && <p className="text-red-500 text-sm mt-1">{errors.expected_harvest_date.message}</p>}
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white font-medium py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Start Tracking'}
          </button>
        </form>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <span className="text-sm text-gray-500">Sown On:</span>
              <p className="font-medium">{new Date(tracking.sow_date).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Expected Harvest:</span>
              <p className="font-medium">{new Date(tracking.expected_harvest_date).toLocaleDateString()}</p>
            </div>
          </div>
          
          <CropTimeline tracking={tracking} />
          
          <div className="pt-6 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Update Stage</h4>
            <div className="flex flex-wrap gap-3">
              {['sown', 'growing', 'ready_for_harvest', 'harvested'].map(stage => (
                <button
                  key={stage}
                  onClick={() => handleStageUpdate(stage)}
                  disabled={tracking.current_stage === stage}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tracking.current_stage === stage 
                      ? 'bg-green-100 text-green-800 ring-2 ring-green-600' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
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
