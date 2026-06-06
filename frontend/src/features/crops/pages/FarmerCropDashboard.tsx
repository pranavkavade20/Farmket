import React, { useState, useMemo } from 'react';
import { useGetCropsQuery } from '../cropsApi';
import { CropCard } from '../components/CropCard';
import { CropTable } from '../components/CropTable';
import { CropCalendar } from '../components/CropCalendar';
import { StageUpdateModal } from '../components/StageUpdateModal';
import { ReservationManagement } from '../components/ReservationManagement';
import { AddTrackingModal } from '../components/AddTrackingModal';
import { useAppDispatch } from '@/app/hooks';
import { openAddTrackingModal } from '../cropsSlice';
import { Sprout, Plus, ActivitySquare, LayoutGrid, List, Calendar as CalendarIcon, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function FarmerCropDashboard() {
  const dispatch = useAppDispatch();
  const { data: crops, isLoading, error } = useGetCropsQuery();

  const [view, setView] = useState<'grid' | 'table' | 'calendar'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('ALL');

  const filteredCrops = useMemo(() => {
    if (!crops) return [];
    return crops.filter(crop => {
      const matchesSearch = crop.product_details?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = filterStage === 'ALL' || crop.stage === filterStage;
      return matchesSearch && matchesStage;
    });
  }, [crops, searchQuery, filterStage]);

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

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex w-full sm:w-auto flex-1 gap-4 items-center">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search crops..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select 
              value={filterStage} 
              onChange={(e) => setFilterStage(e.target.value)}
              className="w-[150px]"
              options={[
                { label: 'All Stages', value: 'ALL' },
                { label: 'Planted', value: 'PLANTED' },
                { label: 'Growing', value: 'GROWING' },
                { label: 'Near Harvest', value: 'NEAR_HARVEST' },
                { label: 'Harvested', value: 'HARVESTED' },
              ]}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
          <button 
            onClick={() => setView('grid')}
            className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setView('table')}
            className={`p-2 rounded-md transition-colors ${view === 'table' ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={`p-2 rounded-md transition-colors ${view === 'calendar' ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            title="Calendar View"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCrops.map((crop) => (
            <CropCard key={crop.id} crop={crop} />
          ))}
          {(!filteredCrops || filteredCrops.length === 0) && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
              <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No crops tracking</h3>
              <p className="text-gray-500 dark:text-gray-400">Start tracking your crops to get buyer reservations.</p>
            </div>
          )}
        </div>
      )}

      {view === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <CropTable crops={filteredCrops} />
        </div>
      )}

      {view === 'calendar' && (
        <CropCalendar crops={filteredCrops} />
      )}

      <ReservationManagement />

      <StageUpdateModal />
      <AddTrackingModal />
    </div>
  );
}
