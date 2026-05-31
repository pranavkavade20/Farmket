import React from 'react';
import { useGetCropsQuery } from '../cropsApi';
import { CropCard } from '../components/CropCard';
import { StageUpdateModal } from '../components/StageUpdateModal';
import { ReservationManagement } from '../components/ReservationManagement';
import { AddTrackingModal } from '../components/AddTrackingModal';
import { useAppDispatch } from '@/app/hooks';
import { openAddTrackingModal } from '../cropsSlice';
import { Sprout, Plus, ActivitySquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FarmerCropDashboard() {
  const dispatch = useAppDispatch();
  const { data: crops, isLoading, error } = useGetCropsQuery();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Sprout className="h-10 w-10 animate-pulse text-green-600" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">Failed to load crops data.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Crop Tracking</h1>
          <p className="text-gray-500 dark:text-gray-400">Monitor your crop growth and manage buyer reservations.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => dispatch(openAddTrackingModal())}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-xl transition-colors dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400"
          >
            <ActivitySquare className="w-5 h-5" />
            Track Existing Product
          </button>
          <Link 
            to="/dashboard/products/new" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {crops?.map((crop) => (
          <CropCard key={crop.id} crop={crop} />
        ))}
        {(!crops || crops.length === 0) && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
            <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No crops tracking</h3>
            <p className="text-gray-500 dark:text-gray-400">Start tracking your crops to get buyer reservations.</p>
          </div>
        )}
      </div>

      <ReservationManagement />

      <StageUpdateModal />
      <AddTrackingModal />
    </div>
  );
}
