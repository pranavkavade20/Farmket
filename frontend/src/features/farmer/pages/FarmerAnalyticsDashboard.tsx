import React from 'react';
import { cropService, type CropTracking } from '../../products/services/cropService';
import HarvestCountdownCard from '../../products/components/HarvestCountdownCard';

export default function FarmerAnalyticsDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Harvest Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-1">Total Active Crops</h3>
          <p className="text-3xl font-bold text-gray-800">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-1">Nearing Harvest</h3>
          <p className="text-3xl font-bold text-amber-600">3</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-1">Harvested This Season</h3>
          <p className="text-3xl font-bold text-green-600">45</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Harvests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <HarvestCountdownCard expectedDate="2026-06-15" />
        <HarvestCountdownCard expectedDate="2026-06-20" />
        <HarvestCountdownCard expectedDate="2026-07-01" />
      </div>
    </div>
  );
}
