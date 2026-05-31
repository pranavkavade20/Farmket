import React from 'react';
import { useGetUpcomingHarvestsQuery } from '../cropsApi';
import { BuyerCropCard } from '../components/BuyerCropCard';
import { ReservationModal } from '../components/ReservationModal';
import { Sprout } from 'lucide-react';

export default function UpcomingHarvests() {
  const { data: crops, isLoading, error } = useGetUpcomingHarvestsQuery();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Sprout className="h-10 w-10 animate-pulse text-green-600" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 text-center">Failed to load upcoming harvests.</div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            Pre-book Fresh Harvests
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Secure your supply of farm-fresh, organic produce directly from farmers before they even harvest. 
            Track growth progress and get notified when it's ready!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {crops?.map((crop) => (
            <BuyerCropCard key={crop.id} crop={crop} />
          ))}
          
          {(!crops || crops.length === 0) && (
            <div className="col-span-full py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                <Sprout className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No upcoming harvests</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Check back later! Farmers are always planting new crops.
              </p>
            </div>
          )}
        </div>

        <ReservationModal />
      </div>
    </div>
  );
}
