import { useState, useMemo, useRef, useEffect } from 'react';
import { useGetCropsQuery } from '../cropsApi';
import { CropCard } from '../components/CropCard';
import { CropTable } from '../components/CropTable';
import { CropCalendar } from '../components/CropCalendar';
import { StageUpdateModal } from '../components/StageUpdateModal';
import { ReservationManagement } from '../components/ReservationManagement';
import { AddTrackingModal } from '../components/AddTrackingModal';
import { CropDetailDrawer } from '../components/CropDetailDrawer';
import { CropOverviewStrip } from '../components/CropOverviewStrip';
import { CropNeedsAttention } from '../components/CropNeedsAttention';
import { getCropAttentionItems } from '../utils/cropUtils';
import { useAppDispatch } from '@/app/hooks';
import { openAddTrackingModal, openStageUpdateModal, openCropDetail } from '../cropsSlice';
import {
  Sprout,
  Plus,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  Search,
  X,
  Sparkles,
  Layers,
  ArrowUpRight,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Alert, PageHeader, Badge, EmptyState } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

const SkeletonCard = ({ index = 0 }: { index?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, delay: index * 0.04 }}
    className="bg-surface rounded-2xl border border-border-subtle overflow-hidden flex flex-col h-[390px] shadow-xs"
  >
    <div className="h-40 bg-surface-elevated animate-pulse w-full" />
    <div className="flex-1 p-5 flex flex-col justify-between space-y-3">
      <div>
        <div className="h-5 w-2/3 bg-surface-elevated rounded-md animate-pulse mb-2" />
        <div className="h-3.5 w-1/3 bg-surface-elevated rounded-md animate-pulse mb-4" />
        <div className="h-2 w-full bg-surface-elevated rounded-full animate-pulse mb-3" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="h-14 bg-surface-elevated rounded-xl animate-pulse" />
        <div className="h-14 bg-surface-elevated rounded-xl animate-pulse" />
      </div>
      <div className="h-10 bg-surface-elevated rounded-xl animate-pulse" />
    </div>
  </motion.div>
);

export default function FarmerCropDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: crops, isLoading, error, refetch } = useGetCropsQuery();

  const [view, setView] = useState<'grid' | 'table' | 'calendar'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('ALL');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Close add menu on outside click or Escape key
  useEffect(() => {
    if (!isAddMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setIsAddMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAddMenuOpen]);

  // 1. Calculate Analytics for Overview Strip
  const analytics = useMemo(() => {
    if (!crops) return { total: 0, growing: 0, harvestSoon: 0, readyToSell: 0, completed: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const growing = crops.filter((c) => c.stage === 'GROWING' || c.stage === 'PLANTED').length;

    const harvestSoon = crops.filter((c) => {
      if (c.stage === 'HARVESTED') return false;
      if (c.stage === 'NEAR_HARVEST') return true;
      if (!c.expected_harvest_date) return false;
      const hDate = new Date(c.expected_harvest_date);
      hDate.setHours(0, 0, 0, 0);
      const diffDays = (hDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 14 && diffDays >= 0;
    }).length;

    const readyToSell = crops.filter((c) => Number(c.available_quantity) > 0).length;
    const completed = crops.filter((c) => c.stage === 'HARVESTED').length;

    return {
      total: crops.length,
      growing,
      harvestSoon,
      readyToSell,
      completed,
    };
  }, [crops]);

  // 2. Filter Crops by Search and Filter Stage
  const filteredCrops = useMemo(() => {
    if (!crops) return [];
    return crops.filter((crop) => {
      const name = (crop.product_details?.name || crop.crop_name || '').toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase().trim());

      let matchesStage = true;
      if (filterStage === 'GROWING') {
        matchesStage = crop.stage === 'GROWING' || crop.stage === 'PLANTED';
      } else if (filterStage === 'HARVEST_SOON') {
        if (crop.stage === 'HARVESTED') return false;
        if (crop.stage === 'NEAR_HARVEST') return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const hDate = new Date(crop.expected_harvest_date);
        hDate.setHours(0, 0, 0, 0);
        const diffDays = (hDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        matchesStage = diffDays <= 14 && diffDays >= 0;
      } else if (filterStage === 'READY_TO_SELL') {
        matchesStage = Number(crop.available_quantity) > 0;
      } else if (filterStage === 'HARVESTED') {
        matchesStage = crop.stage === 'HARVESTED';
      }

      return matchesSearch && matchesStage;
    });
  }, [crops, searchQuery, filterStage]);

  // 3. Extract actionable "Needs Attention" items
  const attentionItems = useMemo(() => {
    if (!crops) return [];
    return getCropAttentionItems(crops);
  }, [crops]);

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 px-4">
        <Alert
          variant="danger"
          title="Couldn't load your crops"
          action={
            <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-1.5 rounded-xl">
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </Button>
          }
        >
          Something went wrong while getting your crop information. Please check your internet connection or try again.
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* 1. Header with PageHeader primitive */}
      <PageHeader
        title="My Crop Lifecycles"
        description="Monitor growth stages, forecast harvest dates, and manage pre-booking demand."
        badge={
          <Badge variant="brand" className="font-bold">
            {analytics.total} {analytics.total === 1 ? 'Crop' : 'Crops'}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2.5 w-full sm:w-auto relative" ref={addMenuRef}>
            <Button
              variant="outline"
              onClick={() => dispatch(openAddTrackingModal())}
              className="flex-1 sm:flex-none h-10 px-4 rounded-xl gap-2 font-semibold"
            >
              <Layers className="w-4 h-4 text-brand" />
              <span>Track Existing Crop</span>
            </Button>

            <div className="relative flex-1 sm:flex-none">
              <Button
                variant="brand"
                onClick={() => setIsAddMenuOpen((prev) => !prev)}
                className="w-full sm:w-auto h-10 px-4 rounded-xl gap-1.5 font-bold shadow-xs"
                aria-haspopup="true"
                aria-expanded={isAddMenuOpen}
              >
                <Plus className="w-4 h-4" />
                <span>Add Crop</span>
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', isAddMenuOpen && 'rotate-180')} />
              </Button>

              {/* Quick Choice Dropdown */}
              {isAddMenuOpen && (
                <div
                  className="absolute right-0 top-12 z-30 w-60 bg-surface rounded-2xl shadow-xl border border-border-subtle p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150"
                  role="menu"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsAddMenuOpen(false);
                      dispatch(openAddTrackingModal());
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-surface-elevated text-left text-xs font-semibold text-foreground transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-foreground font-bold">Track Existing Product</p>
                      <p className="text-[11px] text-muted truncate">From current catalog listings</p>
                    </div>
                  </button>

                  <Link
                    to="/dashboard/products/new"
                    role="menuitem"
                    onClick={() => setIsAddMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-surface-elevated text-left text-xs font-semibold text-foreground transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-info/10 text-info flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-foreground font-bold">Create New Product</p>
                      <p className="text-[11px] text-muted truncate">Create & track a new harvest</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        }
      />

      {/* 2. Crop Overview Strip */}
      <CropOverviewStrip
        analytics={analytics}
        activeFilter={filterStage}
        onSelectFilter={(filter) => setFilterStage(filter)}
      />

      {/* 3. Needs Attention Section */}
      <CropNeedsAttention
        items={attentionItems}
        onUpdateStage={(id) => dispatch(openStageUpdateModal(id))}
        onViewDetails={(id) => dispatch(openCropDetail(id))}
      />

      {/* 4. Controls: Search, Filter Chips & View Switcher */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search crops by name or variety..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-surface border border-border-strong rounded-xl text-xs sm:text-sm font-medium text-foreground placeholder-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground rounded-full"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div
            role="tablist"
            aria-label="Crop display modes"
            className="flex items-center self-end sm:self-auto gap-1 bg-surface border border-border-subtle p-1 rounded-xl shadow-2xs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={view === 'grid'}
              onClick={() => setView('grid')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                view === 'grid'
                  ? 'bg-surface-elevated text-brand shadow-xs border border-border-subtle font-bold'
                  : 'text-muted hover:text-foreground border border-transparent'
              )}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'table'}
              onClick={() => setView('table')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                view === 'table'
                  ? 'bg-surface-elevated text-brand shadow-xs border border-border-subtle font-bold'
                  : 'text-muted hover:text-foreground border border-transparent'
              )}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'calendar'}
              onClick={() => setView('calendar')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                view === 'calendar'
                  ? 'bg-surface-elevated text-brand shadow-xs border border-border-subtle font-bold'
                  : 'text-muted hover:text-foreground border border-transparent'
              )}
              title="Harvest Schedule"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Harvest Schedule</span>
            </button>
          </div>
        </div>

        {/* Filter Chips Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'ALL', label: 'All Crops', count: analytics.total },
            { id: 'GROWING', label: 'Growing', count: analytics.growing },
            { id: 'HARVEST_SOON', label: 'Harvest Soon', count: analytics.harvestSoon },
            { id: 'READY_TO_SELL', label: 'Ready to Sell', count: analytics.readyToSell },
            { id: 'HARVESTED', label: 'Completed', count: analytics.completed },
          ].map((chip) => {
            const isActive = filterStage === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFilterStage(chip.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer shrink-0 border',
                  isActive
                    ? 'bg-brand text-on-brand border-brand shadow-xs'
                    : 'bg-surface text-foreground-secondary border-border-strong hover:bg-surface-elevated hover:text-foreground'
                )}
              >
                <span>{chip.label}</span>
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                    isActive ? 'bg-black/15 text-white' : 'bg-surface-elevated text-muted'
                  )}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Main Views Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {[1, 2, 3, 4, 5, 6].map((i, idx) => (
              <SkeletonCard key={i} index={idx} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Cards View */}
            {view === 'grid' && (
              <>
                {crops && crops.length === 0 ? (
                  /* Full Empty State: No crops at all */
                  <EmptyState
                    icon={<Sprout className="w-8 h-8 text-brand" />}
                    iconVariant="brand"
                    title="Start tracking your first crop"
                    description="Add your crops to monitor growth stages, forecast harvest dates, and connect produce with interested buyers."
                    action={{
                      label: 'Track Your First Crop',
                      icon: <Plus className="w-4 h-4" />,
                      onClick: () => dispatch(openAddTrackingModal()),
                    }}
                    secondaryAction={{
                      label: 'Add New Product',
                      icon: <ArrowUpRight className="w-4 h-4" />,
                      variant: 'outline',
                      onClick: () => navigate('/dashboard/products/new'),
                    }}
                    className="max-w-2xl mx-auto py-16"
                  />
                ) : filteredCrops.length === 0 ? (
                  /* Filter Empty State */
                  <EmptyState
                    icon={<Sparkles className="w-7 h-7 text-muted" />}
                    iconVariant="neutral"
                    title="No crops match your filters"
                    description="Try searching with different terms or reset your active lifecycle stage filter."
                    action={{
                      label: 'Clear Filters',
                      variant: 'outline',
                      onClick: () => {
                        setSearchQuery('');
                        setFilterStage('ALL');
                      },
                    }}
                    className="max-w-md mx-auto py-12"
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch auto-rows-max">
                    {filteredCrops.map((crop, index) => (
                      <CropCard
                        key={crop.id}
                        crop={crop}
                        index={index}
                        onUpdateStage={(id) => dispatch(openStageUpdateModal(id))}
                        onViewDetails={(id) => dispatch(openCropDetail(id))}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Table View */}
            {view === 'table' && (
              <div className="bg-surface rounded-2xl shadow-xs border border-border-subtle overflow-hidden">
                <CropTable crops={filteredCrops} />
              </div>
            )}

            {/* Calendar View (Harvest Schedule Agenda) */}
            {view === 'calendar' && <CropCalendar crops={filteredCrops} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Collapsible Reservation Management Section */}
      <ReservationManagement />

      {/* 7. Drawers & Modals */}
      <CropDetailDrawer />
      <StageUpdateModal />
      <AddTrackingModal />
    </div>
  );
}
