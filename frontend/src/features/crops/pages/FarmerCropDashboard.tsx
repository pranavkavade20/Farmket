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
import { Sprout, Plus, ActivitySquare, LayoutGrid, List, Calendar as CalendarIcon, Search, Filter, Package, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';

const SkeletonCard = ({ index = 0 }: { index?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className="bg-surface rounded-3xl border border-border-subtle overflow-hidden flex flex-col h-[440px] shadow-sm"
  >
    <div className="h-[45%] bg-border-subtle/50 animate-pulse w-full"></div>
    <div className="flex-1 p-5 flex flex-col">
      <div className="h-7 w-2/3 bg-border-subtle rounded-md animate-pulse mb-3"></div>
      <div className="h-4 w-1/3 bg-border-subtle rounded-md animate-pulse mb-6"></div>
      <div className="h-2 w-full bg-border-subtle rounded-full animate-pulse mb-2 mt-auto"></div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="h-16 bg-border-subtle rounded-2xl animate-pulse"></div>
        <div className="h-16 bg-border-subtle rounded-2xl animate-pulse"></div>
      </div>
    </div>
  </motion.div>
);

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

  const analytics = useMemo(() => {
    if (!crops) return { total: 0, growing: 0, harvestReady: 0, harvested: 0 };
    return {
      total: crops.length,
      growing: crops.filter(c => c.stage === 'GROWING').length,
      harvestReady: crops.filter(c => c.stage === 'NEAR_HARVEST').length,
      harvested: crops.filter(c => c.stage === 'HARVESTED').length
    };
  }, [crops]);

  if (error) {
    return <div className="p-6 text-danger font-medium">Failed to load crops data.</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-[1600px] mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2 tracking-tight">Crop Tracking</h1>
          <p className="text-muted font-medium">Monitor your crop growth and manage buyer reservations.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => dispatch(openAddTrackingModal())}
            className="gap-2 border-border-strong hover:bg-surface-elevated text-foreground shadow-sm hover:shadow active:scale-95 transition-all"
          >
            <ActivitySquare className="w-4 h-4" />
            Track Existing Product
          </Button>
          <Link to="/dashboard/products/new">
            <Button variant="primary" className="gap-2 bg-brand hover:bg-brand-hover active:bg-brand-active shadow-sm hover:shadow active:scale-95 transition-all">
              <Plus className="w-4 h-4" />
              Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Crops', value: analytics.total, icon: Package, color: 'text-brand', bg: 'bg-brand/10' },
          { label: 'Actively Growing', value: analytics.growing, icon: TrendingUp, color: 'text-info', bg: 'bg-info/10' },
          { label: 'Harvest Ready', value: analytics.harvestReady, icon: Sprout, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Completed', value: analytics.harvested, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
        ].map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-surface rounded-2xl p-5 border border-border-subtle shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">{stat.label}</p>
              <h3 className="text-2xl font-display font-bold text-foreground">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex w-full sm:w-auto flex-1 gap-4 items-center">
          <div className="relative max-w-md w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-brand transition-colors" />
            <input 
              type="text"
              placeholder="Search crops..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border-strong rounded-xl text-sm font-medium text-foreground placeholder-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 shadow-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-2 relative group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted hidden sm:block pointer-events-none group-focus-within:text-brand transition-colors" />
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-surface border border-border-strong rounded-xl text-sm font-medium text-foreground focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 shadow-sm transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">All Stages</option>
              <option value="PLANTED">Planted</option>
              <option value="GROWING">Growing</option>
              <option value="NEAR_HARVEST">Near Harvest</option>
              <option value="HARVESTED">Harvested</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 bg-surface border border-border-subtle p-1 rounded-xl shadow-sm">
          <button 
            onClick={() => setView('grid')}
            className={`p-2.5 rounded-lg transition-all duration-200 ${view === 'grid' ? 'bg-surface-elevated shadow-sm text-brand' : 'text-muted hover:text-foreground hover:bg-surface-elevated/50'}`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setView('table')}
            className={`p-2.5 rounded-lg transition-all duration-200 ${view === 'table' ? 'bg-surface-elevated shadow-sm text-brand' : 'text-muted hover:text-foreground hover:bg-surface-elevated/50'}`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={`p-2.5 rounded-lg transition-all duration-200 ${view === 'calendar' ? 'bg-surface-elevated shadow-sm text-brand' : 'text-muted hover:text-foreground hover:bg-surface-elevated/50'}`}
            title="Calendar View"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6 min-h-[500px]"
          >
            {[1, 2, 3, 4, 5, 6].map((i, idx) => (
              <SkeletonCard key={i} index={idx} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'grid' && (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6 min-h-[500px] items-start auto-rows-max">
                {filteredCrops.map((crop, index) => (
                  <CropCard key={crop.id} crop={crop} index={index} />
                ))}
                {(!filteredCrops || filteredCrops.length === 0) && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="col-span-full flex flex-col items-center justify-center py-24 px-4 bg-surface border border-border-subtle rounded-3xl shadow-sm text-center min-h-[400px]"
                  >
                    <div className="w-20 h-20 rounded-full bg-surface-elevated flex items-center justify-center mb-6 border border-border-subtle shadow-inner">
                      <Sprout className="w-10 h-10 text-muted" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-foreground mb-3">No crops match your filters</h3>
                    <p className="text-muted font-medium mb-8 max-w-md">Try adjusting your search terms or filter criteria to find what you're looking for.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => { setSearchQuery(''); setFilterStage('ALL'); }}
                      className="border-border-strong hover:bg-surface-elevated shadow-sm hover:shadow"
                    >
                      Clear Filters
                    </Button>
                  </motion.div>
                )}
              </div>
            )}

            {view === 'table' && (
              <div className="bg-surface rounded-2xl shadow-sm border border-border-subtle overflow-hidden">
                <CropTable crops={filteredCrops} />
              </div>
            )}

            {view === 'calendar' && (
              <CropCalendar crops={filteredCrops} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ReservationManagement />
      <StageUpdateModal />
      <AddTrackingModal />
    </motion.div>
  );
}
