import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useSEO } from '@/hooks';
import {
  useGetReservationsQuery,
  useApproveReservationMutation,
  useRejectReservationMutation,
  useCancelReservationMutation,
} from '../cropsApi';
import type { CropReservation } from '@/types/crops';
import {
  Button,
  StatusBadge,
  Badge,
  PageHeader,
  EmptyState,
  Modal,
  Alert,
  Avatar,
} from '@/components/ui';
import { CropStageBadge } from '../components/CropStageBadge';
import {
  CalendarCheck,
  Search,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Sprout,
  Calendar,
  MessageSquare,
  Sparkles,
  Store,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

type StatusFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export default function PreBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isFarmer = user?.user_type === 'farmer';

  useSEO({
    title: isFarmer ? 'Pre-Bookings & Harvest Allocations | Farmket' : 'My Pre-Bookings | Farmket',
    description: isFarmer
      ? 'Manage buyer pre-booking requests and harvest allocations across your crop cycles.'
      : 'Track your pre-booked crop reservations directly with verified farmers.',
  });

  const { data: reservations, isLoading } = useGetReservationsQuery();
  const [approveReservation, { isLoading: isApproving }] = useApproveReservationMutation();
  const [rejectReservation, { isLoading: isRejecting }] = useRejectReservationMutation();
  const [cancelReservation, { isLoading: isCancelling }] = useCancelReservationMutation();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Confirmation dialogs
  const [confirmCancelModal, setConfirmCancelModal] = useState<CropReservation | null>(null);
  const [confirmRejectModal, setConfirmRejectModal] = useState<CropReservation | null>(null);
  const [actionInProgressId, setActionInProgressId] = useState<number | null>(null);

  // Statistics Calculation
  const stats = useMemo(() => {
    if (!reservations) return { total: 0, pending: 0, confirmed: 0, cancelled: 0, totalQuantity: 0, uniqueUsers: 0 };
    const pending = reservations.filter((r) => r.reservation_status === 'PENDING').length;
    const confirmed = reservations.filter((r) => r.reservation_status === 'CONFIRMED').length;
    const cancelled = reservations.filter((r) => r.reservation_status === 'CANCELLED').length;
    const totalQuantity = reservations
      .filter((r) => r.reservation_status !== 'CANCELLED')
      .reduce((sum, r) => sum + parseFloat(r.quantity_reserved || '0'), 0);
    const uniqueUsers = new Set(
      reservations.map((r) => (isFarmer ? r.buyer : r.farmer_id || r.crop_growth))
    ).size;

    return {
      total: reservations.length,
      pending,
      confirmed,
      cancelled,
      totalQuantity: Math.round(totalQuantity * 10) / 10,
      uniqueUsers,
    };
  }, [reservations, isFarmer]);

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    if (!reservations) return [];
    return reservations.filter((item) => {
      // 1. Status Filter
      if (statusFilter !== 'ALL' && item.reservation_status !== statusFilter) {
        return false;
      }
      // 2. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesCrop = item.crop_name?.toLowerCase().includes(query);
        const matchesBuyer = item.buyer_name?.toLowerCase().includes(query);
        const matchesFarmer = item.farmer_name?.toLowerCase().includes(query);
        if (!matchesCrop && !matchesBuyer && !matchesFarmer) {
          return false;
        }
      }
      return true;
    });
  }, [reservations, statusFilter, searchQuery]);

  // Actions
  const handleApprove = async (res: CropReservation) => {
    try {
      setActionInProgressId(res.id);
      await approveReservation(res.id).unwrap();
      toast.success(`Pre-booking for ${res.buyer_name} approved!`);
    } catch {
      toast.error('Failed to approve reservation. Please try again.');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!confirmRejectModal) return;
    try {
      setActionInProgressId(confirmRejectModal.id);
      await rejectReservation(confirmRejectModal.id).unwrap();
      toast.success(`Pre-booking for ${confirmRejectModal.buyer_name} has been rejected.`);
      setConfirmRejectModal(null);
    } catch {
      toast.error('Failed to reject reservation.');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!confirmCancelModal) return;
    try {
      setActionInProgressId(confirmCancelModal.id);
      await cancelReservation(confirmCancelModal.id).unwrap();
      toast.success('Your pre-booking reservation has been cancelled.');
      setConfirmCancelModal(null);
    } catch {
      toast.error('Failed to cancel reservation.');
    } finally {
      setActionInProgressId(null);
    }
  };

  const formatPrice = (priceStr?: string, qtyStr?: string) => {
    if (!priceStr) return null;
    const price = parseFloat(priceStr);
    const qty = parseFloat(qtyStr || '1');
    if (isNaN(price)) return null;
    const total = price * (isNaN(qty) ? 1 : qty);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(total);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Header */}
      <PageHeader
        title={isFarmer ? 'Harvest Pre-Bookings' : 'My Pre-Bookings'}
        description={
          isFarmer
            ? 'Review and manage buyer reservations for your active growing crops before harvest.'
            : 'Track crops reserved directly from farmers before harvest to secure the freshest produce.'
        }
        badge={
          <Badge variant={isFarmer ? 'brand' : 'submitted'} className="font-bold">
            <CalendarCheck className="w-3.5 h-3.5 mr-1" />
            {isFarmer ? 'Farmer Allocations' : 'Buyer Reservations'}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2.5">
            {isFarmer ? (
              <Link to="/farmer/crops">
                <Button variant="outline" className="rounded-xl h-10 px-4 font-semibold gap-2">
                  <Sprout className="w-4 h-4 text-brand" />
                  <span>Crop Lifecycle</span>
                </Button>
              </Link>
            ) : (
              <Link to="/marketplace?prebookable=true">
                <Button variant="brand" className="rounded-xl h-10 px-4 font-bold gap-2 shadow-xs">
                  <Store className="w-4 h-4" />
                  <span>Browse Pre-Bookable Crops</span>
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Pending */}
        <div className="bg-surface rounded-2xl border border-border-subtle p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              {isFarmer ? 'Pending Approvals' : 'Awaiting Approval'}
            </p>
            <p className="text-xl sm:text-2xl font-display font-bold text-foreground">
              {stats.pending}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-warning-muted/40 text-warning flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Confirmed */}
        <div className="bg-surface rounded-2xl border border-border-subtle p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              Confirmed Harvests
            </p>
            <p className="text-xl sm:text-2xl font-display font-bold text-foreground">
              {stats.confirmed}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-success-muted/40 text-success flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Quantity */}
        <div className="bg-surface rounded-2xl border border-border-subtle p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              {isFarmer ? 'Total Reserved Produce' : 'Reserved Produce'}
            </p>
            <p className="text-xl sm:text-2xl font-display font-bold text-foreground">
              {stats.totalQuantity} <span className="text-xs font-medium text-muted">units</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Total Requests / Farmers */}
        <div className="bg-surface rounded-2xl border border-border-subtle p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              {isFarmer ? 'Connected Buyers' : 'Connected Farmers'}
            </p>
            <p className="text-xl sm:text-2xl font-display font-bold text-foreground">
              {stats.uniqueUsers}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-info-muted/40 text-info flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Controls & Filter Tabs */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder={isFarmer ? 'Search by buyer or crop name...' : 'Search by farmer or crop name...'}
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

          {/* Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filter by reservation status"
            className="flex items-center gap-1 bg-surface border border-border-subtle p-1 rounded-xl shadow-2xs overflow-x-auto"
          >
            {(
              [
                { key: 'ALL', label: 'All', count: stats.total },
                { key: 'PENDING', label: 'Pending', count: stats.pending },
                { key: 'CONFIRMED', label: 'Confirmed', count: stats.confirmed },
                { key: 'CANCELLED', label: 'Cancelled', count: stats.cancelled },
              ] as const
            ).map((tab) => {
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setStatusFilter(tab.key)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer',
                    isActive
                      ? 'bg-brand text-on-brand shadow-xs'
                      : 'text-foreground-secondary hover:text-foreground hover:bg-surface-elevated'
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                      isActive ? 'bg-white/20 text-white' : 'bg-surface-elevated text-muted'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Main Reservations Grid / List */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-surface rounded-2xl border border-border-subtle p-5 space-y-4 animate-pulse shadow-xs"
              >
                <div className="h-32 bg-surface-elevated rounded-xl w-full" />
                <div className="h-4 bg-surface-elevated rounded w-3/4" />
                <div className="h-3 bg-surface-elevated rounded w-1/2" />
                <div className="h-10 bg-surface-elevated rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : filteredReservations.length === 0 ? (
          stats.total === 0 ? (
            /* Total Empty State */
            <EmptyState
              icon={<CalendarCheck className="w-8 h-8 text-brand" />}
              iconVariant="brand"
              title={isFarmer ? 'No pre-booking requests yet' : 'No pre-booked crops yet'}
              description={
                isFarmer
                  ? 'When buyers browse your active crops and place pre-booking reservations before harvest day, they will appear here for your approval.'
                  : 'Pre-booking allows you to reserve upcoming crops directly from verified local farmers while they are still growing, ensuring guaranteed fresh deliveries.'
              }
              action={
                isFarmer
                  ? {
                      label: 'View Crop Lifecycle',
                      icon: <Sprout className="w-4 h-4" />,
                      onClick: () => navigate('/farmer/crops'),
                    }
                  : {
                      label: 'Explore Pre-Bookable Harvests',
                      icon: <Store className="w-4 h-4" />,
                      onClick: () => navigate('/marketplace?prebookable=true'),
                    }
              }
              className="max-w-xl mx-auto py-16"
            />
          ) : (
            /* Filter Empty State */
            <EmptyState
              icon={<Sparkles className="w-7 h-7 text-muted" />}
              iconVariant="neutral"
              title="No pre-bookings match your search or filter"
              description="Try adjusting your filter status or search term to view matching reservations."
              action={{
                label: 'Reset Filters',
                variant: 'outline',
                onClick: () => {
                  setStatusFilter('ALL');
                  setSearchQuery('');
                },
              }}
              className="max-w-md mx-auto py-12"
            />
          )
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch"
          >
            {filteredReservations.map((res) => {
              const isActionLoading = actionInProgressId === res.id;
              const estimatedTotal = formatPrice(res.price, res.quantity_reserved);

              return (
                <motion.div
                  key={res.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-surface rounded-2xl border border-border-subtle overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md hover:border-brand/40 transition-all group"
                >
                  <div>
                    {/* Header Image / Thumbnail Banner */}
                    <div className="relative h-40 bg-surface-elevated overflow-hidden">
                      {res.image ? (
                        <img
                          src={res.image}
                          alt={res.crop_name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand/10 via-surface to-brand/5 text-muted">
                          <Sprout className="w-10 h-10 text-brand stroke-1" />
                          <span className="text-[11px] font-semibold text-foreground-secondary mt-1">
                            Farm Harvest Allocation
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <StatusBadge
                          status={
                            res.reservation_status === 'CONFIRMED'
                              ? 'success'
                              : res.reservation_status === 'CANCELLED'
                              ? 'failed'
                              : res.reservation_status === 'PENDING'
                              ? 'pending'
                              : 'expired'
                          }
                          label={
                            res.reservation_status === 'PENDING'
                              ? 'Pending Approval'
                              : res.reservation_status === 'CONFIRMED'
                              ? 'Confirmed'
                              : res.reservation_status === 'CANCELLED'
                              ? 'Cancelled'
                              : res.reservation_status
                          }
                          size="sm"
                          className="font-bold shadow-xs backdrop-blur-md"
                        />

                        {res.crop_stage && (
                          <CropStageBadge
                            stage={res.crop_stage}
                            size="sm"
                            className="shadow-xs backdrop-blur-md"
                          />
                        )}
                      </div>

                      {/* Bottom Image Title */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white font-display font-bold text-base sm:text-lg leading-tight drop-shadow-sm truncate">
                          {res.crop_name}
                        </p>
                        <p className="text-white/80 text-xs flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3 h-3 text-white/70" />
                          <span>
                            Est. Harvest:{' '}
                            {res.expected_harvest_date || res.expected_delivery_date
                              ? new Date(
                                  res.expected_harvest_date || res.expected_delivery_date!
                                ).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Upcoming'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Card Content Details */}
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Person Details (Buyer or Farmer) */}
                      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-elevated/40 border border-border-subtle">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar
                            fallback={isFarmer ? res.buyer_name : res.farmer_name || 'Farmer'}
                            alt={isFarmer ? res.buyer_name : res.farmer_name || 'Farmer'}
                            size="sm"
                            className="ring-1 ring-border-subtle"
                          />
                          <div className="min-w-0">
                            <p className="text-xs text-muted font-medium">
                              {isFarmer ? 'Requested by Buyer' : 'Farm Producer'}
                            </p>
                            <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                              {isFarmer ? res.buyer_name : res.farmer_name || 'Verified Grower'}
                            </p>
                          </div>
                        </div>

                        {/* Direct Chat / Contact */}
                        <Link
                          to={`/messages?user=${isFarmer ? res.buyer : res.farmer_id || ''}`}
                          aria-label={`Message ${isFarmer ? res.buyer_name : res.farmer_name || 'Grower'}`}
                          className="p-2 rounded-lg bg-surface border border-border-subtle hover:border-brand text-muted hover:text-brand transition-colors cursor-pointer shrink-0"
                          title="Send Message"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Link>
                      </div>

                      {/* Quantity & Estimated Total Summary */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-surface-elevated/20 border border-border-subtle">
                          <span className="text-[10px] text-muted font-semibold uppercase tracking-wider block">
                            Reserved Quantity
                          </span>
                          <span className="font-bold text-sm text-foreground">
                            {res.quantity_reserved} {res.unit || 'units'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface-elevated/20 border border-border-subtle">
                          <span className="text-[10px] text-muted font-semibold uppercase tracking-wider block">
                            Estimated Total
                          </span>
                          <span className="font-bold text-sm text-brand">
                            {estimatedTotal || 'TBD at Harvest'}
                          </span>
                        </div>
                      </div>

                      {/* Reservation Timestamp */}
                      <div className="flex items-center justify-between text-[11px] text-muted pt-1 border-t border-border-subtle">
                        <span>Requested on</span>
                        <span className="font-medium text-foreground-secondary">
                          {new Date(res.reserved_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 sm:p-5 pt-0">
                    {/* FARMER ACTIONS */}
                    {isFarmer ? (
                      res.reservation_status === 'PENDING' ? (
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmRejectModal(res)}
                            disabled={isActionLoading || isRejecting || isApproving}
                            leftIcon={<XCircle className="w-3.5 h-3.5 text-danger" />}
                            className="flex-1 text-danger border-danger/30 hover:bg-danger-muted/30 h-9 rounded-xl font-semibold"
                          >
                            Reject
                          </Button>
                          <Button
                            type="button"
                            variant="brand"
                            size="sm"
                            onClick={() => handleApprove(res)}
                            disabled={isActionLoading || isRejecting || isApproving}
                            isLoading={isActionLoading && isApproving}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            className="flex-1 h-9 rounded-xl font-bold shadow-xs"
                          >
                            Approve
                          </Button>
                        </div>
                      ) : res.reservation_status === 'CONFIRMED' ? (
                        <div className="w-full text-center py-2 px-3 bg-success-muted/20 border border-success-subtle rounded-xl text-xs font-semibold text-success flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Harvest allocation secured</span>
                        </div>
                      ) : (
                        <div className="w-full text-center py-2 px-3 bg-surface-elevated/40 border border-border-subtle rounded-xl text-xs font-medium text-muted">
                          Reservation {res.reservation_status.toLowerCase()}
                        </div>
                      )
                    ) : (
                      /* BUYER ACTIONS */
                      res.reservation_status === 'PENDING' ? (
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmCancelModal(res)}
                            disabled={isActionLoading || isCancelling}
                            className="w-full text-danger border-danger/30 hover:bg-danger-muted/30 h-9 rounded-xl font-semibold gap-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancel Reservation</span>
                          </Button>
                        </div>
                      ) : res.reservation_status === 'CONFIRMED' ? (
                        <div className="space-y-2 pt-2">
                          <div className="w-full text-center py-2 px-3 bg-success-muted/20 border border-success-subtle rounded-xl text-xs font-semibold text-success flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirmed by Farmer</span>
                          </div>
                          {res.product_slug && (
                            <Link to={`/marketplace/${res.product_slug}`} className="block w-full">
                              <Button
                                variant="outline"
                                size="sm"
                                fullWidth
                                className="h-8 rounded-xl text-xs font-semibold"
                              >
                                View Marketplace Listing
                              </Button>
                            </Link>
                          )}
                        </div>
                      ) : (
                        <div className="w-full text-center py-2 px-3 bg-surface-elevated/40 border border-border-subtle rounded-xl text-xs font-medium text-muted">
                          Pre-booking {res.reservation_status.toLowerCase()}
                        </div>
                      )
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Confirmation Modals */}
      {/* Buyer Cancel Reservation Modal */}
      <Modal
        isOpen={Boolean(confirmCancelModal)}
        onClose={() => setConfirmCancelModal(null)}
        title="Cancel Pre-Booking Reservation"
        description="Are you sure you want to cancel this harvest pre-booking?"
        size="sm"
      >
        <div className="space-y-4">
          <Alert variant="warning" icon={<Clock className="w-5 h-5 text-warning" />}>
            <p className="text-xs text-foreground font-medium">
              Cancelling will release your reserved{' '}
              <strong>
                {confirmCancelModal?.quantity_reserved} {confirmCancelModal?.unit || 'units'}
              </strong>{' '}
              of <strong>{confirmCancelModal?.crop_name}</strong> back to the farmer for other buyers to claim.
            </p>
          </Alert>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmCancelModal(null)}
              disabled={isCancelling}
              className="rounded-xl px-4"
            >
              Keep Reservation
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmCancel}
              isLoading={isCancelling}
              className="rounded-xl px-4 font-bold"
            >
              Yes, Cancel Reservation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Farmer Reject Reservation Modal */}
      <Modal
        isOpen={Boolean(confirmRejectModal)}
        onClose={() => setConfirmRejectModal(null)}
        title="Reject Pre-Booking Request"
        description="Decline this reservation request from buyer?"
        size="sm"
      >
        <div className="space-y-4">
          <Alert variant="warning" icon={<XCircle className="w-5 h-5 text-warning" />}>
            <p className="text-xs text-foreground font-medium">
              Rejecting will notify <strong>{confirmRejectModal?.buyer_name}</strong> and return{' '}
              <strong>
                {confirmRejectModal?.quantity_reserved} {confirmRejectModal?.unit || 'units'}
              </strong>{' '}
              back to your available harvest stock.
            </p>
          </Alert>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmRejectModal(null)}
              disabled={isRejecting}
              className="rounded-xl px-4"
            >
              Dismiss
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmReject}
              isLoading={isRejecting}
              className="rounded-xl px-4 font-bold"
            >
              Yes, Reject Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
