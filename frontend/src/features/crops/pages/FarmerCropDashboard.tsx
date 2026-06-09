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
import { Button } from '@/components/ui';

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
        <Sprout className="h-10 w-10 animate-pulse text-brand" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-danger">Failed to load crops data.</div>;
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Crop Tracking</h1>
          <p className="text-foreground-secondary font-medium">Monitor your crop growth and manage buyer reservations.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => dispatch(openAddTrackingModal())}
            className="gap-2"
          >
            <ActivitySquare className="w-4 h-4" />
            Track Existing Product
          </Button>
          <Link to="/dashboard/products/new">
            <Button variant="primary" className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex w-full sm:w-auto flex-1 gap-4 items-center">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
            <input 
              type="text"
              placeholder="Search crops..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border-strong rounded-xl text-sm font-medium focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-foreground-secondary hidden sm:block" />
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="px-4 py-2.5 bg-surface border border-border-strong rounded-xl text-sm font-medium focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-sm transition-all appearance-none"
            >
              <option value="ALL">All Stages</option>
              <option value="PLANTED">Planted</option>
              <option value="GROWING">Growing</option>
              <option value="NEAR_HARVEST">Near Harvest</option>
              <option value="HARVESTED">Harvested</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-1 bg-surface border border-border-subtle p-1 rounded-xl shadow-sm">
          <button 
            onClick={() => setView('grid')}
            className={`p-2.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-surface-elevated shadow-sm text-foreground' : 'text-foreground-secondary hover:text-foreground hover:bg-surface-elevated/50'}`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setView('table')}
            className={`p-2.5 rounded-lg transition-colors ${view === 'table' ? 'bg-surface-elevated shadow-sm text-foreground' : 'text-foreground-secondary hover:text-foreground hover:bg-surface-elevated/50'}`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={`p-2.5 rounded-lg transition-colors ${view === 'calendar' ? 'bg-surface-elevated shadow-sm text-foreground' : 'text-foreground-secondary hover:text-foreground hover:bg-surface-elevated/50'}`}
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
            <div className="col-span-full py-16 text-center bg-surface border border-dashed border-border-strong rounded-3xl">
              <div className="w-16 h-16 rounded-2xl bg-surface-elevated flex items-center justify-center mx-auto mb-4 border border-border-subtle shadow-sm">
                <Sprout className="w-8 h-8 text-foreground-secondary" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">No crops tracking</h3>
              <p className="text-foreground-secondary font-medium">Start tracking your crops to get buyer reservations.</p>
            </div>
          )}
        </div>
      )}

      {view === 'table' && (
        <div className="bg-surface rounded-3xl shadow-sm border border-border-subtle overflow-hidden">
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
