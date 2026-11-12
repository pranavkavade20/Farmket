import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { useAuth } from '@/features/auth';
import { orderService } from '@/features/orders';
import { chatService } from '@/features/chat/services/chatService';
import { OrderStatusBadge, Button, Badge, PageHeader, EmptyState } from '@/components/ui';
import {
  ShoppingBag,
  Package,
  ArrowRight,
  Search,
  Clock,
  Truck,
  MessageSquare,
  Phone,
  MapPin,
  CreditCard,
  Sprout,
  Plus,
  Check,
  X,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Order } from '@/types';
import { toast } from 'sonner';
import { MEDIA_BASE_URL } from '@/config/env';
import { cn } from '@/lib/utils/cn';

type FilterTab = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const OrdersSkeleton = () => (
  <div className="space-y-4 py-2">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="rounded-2xl bg-surface border border-border-subtle p-6 space-y-4 shadow-xs animate-pulse"
      >
        <div className="flex justify-between items-center pb-4 border-b border-border-subtle">
          <div className="h-6 w-48 bg-surface-elevated rounded-md" />
          <div className="h-6 w-24 bg-surface-elevated rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-2">
          <div className="lg:col-span-4 h-32 bg-surface-elevated rounded-xl" />
          <div className="lg:col-span-8 h-32 bg-surface-elevated rounded-xl" />
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-border-subtle">
          <div className="h-8 w-32 bg-surface-elevated rounded-md" />
          <div className="h-9 w-28 bg-surface-elevated rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

const Orders: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isFarmer = user?.user_type === 'farmer';

  useSEO({
    title: isFarmer ? 'Received Orders | Farmket' : 'My Orders | Farmket',
    description: isFarmer
      ? 'Manage, accept, and fulfill incoming orders from your buyers on Farmket.'
      : 'Track your Farmket purchases and delivery status.',
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  const [currentTime] = useState(() => Date.now());

  const reloadOrders = useCallback(async () => {
    try {
      const res = await orderService.getOrders();
      setOrders(res.results || []);
    } catch {
      toast.error('Failed to reload orders');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    orderService
      .getOrders()
      .then((res) => {
        if (isMounted) {
          setOrders(res.results || []);
        }
      })
      .catch(() => {
        toast.error('Failed to load orders');
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const fmt = (n: string | number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(typeof n === 'string' ? parseFloat(n) || 0 : n);

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const getRelativeTime = (s: string) => {
    const diff = Math.max(0, currentTime - new Date(s).getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const resolveImg = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${MEDIA_BASE_URL}${url}`;
  };

  // Farmer fast-action transitions
  const handleItemTransition = async (itemId: number, newStatus: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setUpdatingItemId(itemId);
    try {
      await orderService.updateItemStatus(itemId, newStatus);
      toast.success(
        newStatus === 'processing'
          ? 'Order accepted and marked for fulfillment!'
          : `Item status updated to ${newStatus}`
      );
      reloadOrders();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleStartChat = async (buyerId?: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!buyerId) {
      navigate('/messages');
      return;
    }
    try {
      const conv = await chatService.getOrCreateConversation(buyerId);
      navigate(`/messages?conversation=${conv.id}`);
    } catch {
      navigate('/messages');
    }
  };

  // Stats calculations for Farmer
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const processing = orders.filter((o) => o.status === 'processing' || o.status === 'shipped').length;
    const delivered = orders.filter((o) => o.status === 'delivered');
    const revenue = delivered.reduce((acc, o) => acc + (parseFloat(o.total_amount) || 0), 0);

    return { total, pending, processing, revenue };
  }, [orders]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeTab !== 'all' && order.status !== activeTab) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = (order.order_number || `ORD-${order.id}`).toLowerCase().includes(q);
        const matchesBuyer = (
          order.buyer_details?.full_name ||
          order.buyer_details?.username ||
          ''
        )
          .toLowerCase()
          .includes(q);
        const matchesAddress = (order.delivery_address || '').toLowerCase().includes(q);
        const matchesProduct = order.items.some((it) => (it.product_name || '').toLowerCase().includes(q));
        return matchesNumber || matchesBuyer || matchesAddress || matchesProduct;
      }
      return true;
    });
  }, [orders, activeTab, searchQuery]);

  const detailUrlPrefix = isFarmer ? '/farmer/orders' : '/dashboard/orders';

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* 1. Header with PageHeader Primitive */}
      <PageHeader
        title={isFarmer ? 'Received Orders' : 'My Orders'}
        description={
          isFarmer
            ? 'Review and manage incoming buyer purchase requests. Accept orders, prepare harvest allocations, and dispatch shipments.'
            : 'Track your Farmket farm-to-table purchases, monitor live fulfillment milestones, and review your order history.'
        }
        badge={
          <Badge variant={isFarmer ? 'brand' : 'default'} className="font-bold">
            {isFarmer ? 'Farmer Portal' : 'Buyer Account'}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2.5">
            {isFarmer ? (
              <Link to="/farmer/crops">
                <Button variant="outline" size="sm" className="gap-2 h-10 rounded-xl font-semibold">
                  <Sprout className="h-4 w-4 text-brand" />
                  <span>Crop Lifecycles</span>
                </Button>
              </Link>
            ) : (
              <Link to="/marketplace">
                <Button variant="brand" size="sm" className="gap-2 h-10 rounded-xl font-bold shadow-xs">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Browse Marketplace</span>
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* 2. Farmer Performance Metric Cards */}
      {isFarmer && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-surface border border-border-subtle p-4 sm:p-5 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                Total Orders
              </p>
              <p className="text-2xl sm:text-3xl font-display font-extrabold text-foreground tabular-nums">
                {stats.total}
              </p>
            </div>
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-brand shadow-2xs shrink-0">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="rounded-2xl bg-surface border border-border-subtle p-4 sm:p-5 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                Needs Action
              </p>
              <p className="text-2xl sm:text-3xl font-display font-extrabold text-warning tabular-nums">
                {stats.pending}
              </p>
            </div>
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-warning-muted text-warning flex items-center justify-center shadow-2xs shrink-0">
              <Clock className="h-5 w-5" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-2xl bg-surface border border-border-subtle p-4 sm:p-5 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                Fulfilling
              </p>
              <p className="text-2xl sm:text-3xl font-display font-extrabold text-info tabular-nums">
                {stats.processing}
              </p>
            </div>
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-info-muted text-info flex items-center justify-center shadow-2xs shrink-0">
              <Truck className="h-5 w-5" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-2xl bg-surface border border-border-subtle p-4 sm:p-5 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                Delivered Revenue
              </p>
              <p className="text-2xl sm:text-3xl font-display font-extrabold text-success tabular-nums">
                {fmt(stats.revenue)}
              </p>
            </div>
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-success-muted text-success flex items-center justify-center shadow-2xs shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
          </motion.div>
        </div>
      )}

      {/* 3. Filter Tabs & Search Controls */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Segmented Tabs */}
          <div
            role="tablist"
            aria-label="Order status filter"
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs"
          >
            {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as FilterTab[]).map(
              (tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 border',
                      isActive
                        ? 'bg-brand text-on-brand border-brand shadow-xs'
                        : 'bg-surface text-foreground-secondary border-border-strong hover:bg-surface-elevated hover:text-foreground'
                    )}
                  >
                    <span className="capitalize">{tab}</span>
                    <span
                      className={cn(
                        'px-1.5 py-0.2 text-[10px] rounded-full font-bold',
                        isActive ? 'bg-black/15 text-white' : 'bg-surface-elevated text-muted'
                      )}
                    >
                      {tabCounts[tab]}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder={isFarmer ? 'Search buyer, order #, crop...' : 'Search by order # or product...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-surface border border-border-strong rounded-xl text-foreground placeholder-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all shadow-2xs"
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
        </div>
      </div>

      {/* 4. Orders Listing */}
      {loading ? (
        <OrdersSkeleton />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<Package className="h-10 w-10 text-muted" />}
          iconVariant="neutral"
          title={activeTab !== 'all' ? `No ${activeTab} orders` : 'No orders found'}
          description={
            isFarmer
              ? activeTab !== 'all'
                ? `You have no orders currently in "${activeTab}" status.`
                : 'Incoming orders from buyers who purchase your products or pre-book your crops will appear here.'
              : activeTab !== 'all'
              ? `You have no purchases currently in "${activeTab}" status.`
              : 'You have not placed any orders yet. Discover fresh produce directly from local farms.'
          }
          action={
            isFarmer
              ? {
                  label: 'Add Products to Sell',
                  onClick: () => navigate('/dashboard/products/new'),
                  icon: <Plus className="w-4 h-4" />,
                }
              : {
                  label: 'Start Shopping',
                  onClick: () => navigate('/marketplace'),
                  icon: <ShoppingBag className="w-4 h-4" />,
                }
          }
          className="max-w-md mx-auto py-16"
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order, index) => {
              const buyer = order.buyer_details;

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: index * 0.03, duration: 0.25 }}
                  className="rounded-2xl bg-surface border border-border-subtle p-5 sm:p-6 hover:shadow-md hover:border-brand/40 transition-all duration-200 relative group overflow-hidden shadow-xs"
                >
                  {/* Top Bar: Order ID, Date, Relative time & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold shrink-0">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`${detailUrlPrefix}/${order.id}`}
                            className="text-base font-bold text-foreground hover:text-brand transition-colors font-display"
                          >
                            {order.order_number ?? `ORD-${String(order.id).padStart(4, '0')}`}
                          </Link>
                          <span className="text-[11px] font-semibold text-muted bg-surface-elevated px-2 py-0.5 rounded-full border border-border-subtle">
                            {getRelativeTime(order.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-muted mt-0.5 font-medium">
                          Placed on {fmtDate(order.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-center">
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>

                  {/* Body Grid: Buyer Info (for Farmer) + Order Items */}
                  <div className="py-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Buyer Information Section (if Farmer) */}
                    {isFarmer && (
                      <div className="lg:col-span-4 rounded-xl bg-surface-elevated/50 border border-border-subtle p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                              Buyer Details
                            </span>
                            {buyer && (
                              <button
                                type="button"
                                onClick={(e) => handleStartChat(buyer.id, e)}
                                className="text-xs font-semibold text-brand hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <MessageSquare className="h-3.5 w-3.5" /> Message
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center font-bold text-brand text-sm overflow-hidden shrink-0">
                              {buyer?.profile_picture ? (
                                <img
                                  src={resolveImg(buyer.profile_picture) || ''}
                                  alt={buyer.full_name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                (buyer?.full_name || buyer?.username || 'B').charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                                {buyer?.full_name || buyer?.username || `Buyer #${order.buyer}`}
                              </p>
                              {buyer?.company_name && (
                                <p className="text-xs text-muted truncate">{buyer.company_name}</p>
                              )}
                              <p className="text-[11px] text-muted truncate">
                                @{buyer?.username || 'buyer'}
                              </p>
                            </div>
                          </div>

                          {/* Buyer Contact / Address summary */}
                          <div className="mt-3 space-y-1.5 text-xs text-foreground-secondary border-t border-border-subtle pt-2.5">
                            {buyer?.phone_number && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-muted shrink-0" />
                                <span className="truncate">{buyer.phone_number}</span>
                              </div>
                            )}
                            {order.delivery_address && (
                              <div className="flex items-start gap-2">
                                <MapPin className="h-3.5 w-3.5 text-muted shrink-0 mt-0.5" />
                                <span className="line-clamp-2 leading-tight">{order.delivery_address}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {order.notes && (
                          <div className="mt-3 p-2 rounded-lg bg-surface border border-border-subtle text-[11px] text-foreground-secondary">
                            <span className="font-semibold text-foreground">Note: </span>
                            {order.notes}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ordered Items List */}
                    <div className={isFarmer ? 'lg:col-span-8' : 'lg:col-span-12'}>
                      <div className="space-y-2.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                          Ordered Harvest Items ({order.items.length})
                        </span>

                        <div className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-surface-elevated/30 overflow-hidden">
                          {order.items.map((item) => {
                            const productImg = item.product_details?.images?.[0]?.image;
                            const isPrebooking = item.is_prebooking;

                            return (
                              <div
                                key={item.id}
                                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-elevated/40 transition-colors"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="h-12 w-12 rounded-lg bg-surface border border-border-subtle overflow-hidden flex items-center justify-center shrink-0">
                                    {productImg ? (
                                      <img
                                        src={resolveImg(productImg) || ''}
                                        alt={item.product_name}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <Package className="h-6 w-6 text-muted" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                                        {item.product_name || `Product #${item.product}`}
                                      </p>
                                      {isPrebooking && (
                                        <Badge variant="brand" size="sm" className="font-bold">
                                          Pre-booking
                                        </Badge>
                                      )}
                                      {item.product_details?.is_organic && (
                                        <Badge variant="success" size="sm" className="font-bold">
                                          Organic
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted mt-0.5">
                                      Qty:{' '}
                                      <strong className="text-foreground">{item.quantity}</strong> ×{' '}
                                      {fmt(item.price_at_purchase || item.price)}
                                    </p>
                                  </div>
                                </div>

                                {/* Item Status & Fast Action for Farmer */}
                                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                  <div className="text-right">
                                    <p className="text-xs sm:text-sm font-bold text-foreground tabular-nums">
                                      {fmt(
                                        item.subtotal ||
                                          item.quantity *
                                            parseFloat(item.price_at_purchase || item.price || '0')
                                      )}
                                    </p>
                                    <span className="text-[11px] capitalize text-muted">
                                      Status: <strong className="text-foreground">{item.status}</strong>
                                    </span>
                                  </div>

                                  {isFarmer && item.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      variant="brand"
                                      isLoading={updatingItemId === item.id}
                                      onClick={(e) => handleItemTransition(item.id, 'processing', e)}
                                      leftIcon={<Check className="h-3.5 w-3.5" />}
                                      className="rounded-xl font-bold shadow-xs h-8 text-xs"
                                    >
                                      Accept
                                    </Button>
                                  )}

                                  {isFarmer && item.status === 'processing' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      isLoading={updatingItemId === item.id}
                                      onClick={(e) => handleItemTransition(item.id, 'shipped', e)}
                                      leftIcon={<Truck className="h-3.5 w-3.5 text-brand" />}
                                      className="rounded-xl font-semibold hover:bg-brand hover:text-brand-foreground hover:border-brand h-8 text-xs"
                                    >
                                      Ship
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Bar: Total Amount, Payment Method, View Details Link */}
                  <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                          {isFarmer ? 'Total Earnings' : 'Order Total'}
                        </p>
                        <p className="text-xl sm:text-2xl font-display font-extrabold text-foreground mt-0.5 tabular-nums">
                          {fmt(order.total_amount)}
                        </p>
                      </div>
                      <div className="h-8 w-px bg-border-subtle hidden sm:block" />
                      <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted font-medium">
                        <CreditCard className="h-4 w-4 text-muted" />
                        <span className="uppercase font-semibold">{order.payment_method || 'COD'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link to={`${detailUrlPrefix}/${order.id}`} className="w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                          className="w-full sm:w-auto rounded-xl font-semibold group-hover:border-brand group-hover:text-brand transition-colors h-10 px-4"
                        >
                          View Full Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Orders;
