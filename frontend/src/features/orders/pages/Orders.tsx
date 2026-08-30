import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { useAuth } from '@/features/auth';
import { orderService } from '@/features/orders';
import { chatService } from '@/features/chat/services/chatService';
import { OrderStatusBadge, Button, Container, Badge } from '@/components/ui';
import {
  ShoppingBag,
  Package,
  ArrowRight,
  Search,
  Clock,
  CheckCircle2,
  Truck,
  MessageSquare,
  Phone,
  MapPin,
  CreditCard,
  Sprout,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Order, } from '@/types';
import { toast } from "sonner";
import { MEDIA_BASE_URL } from '@/config/env';

type FilterTab = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isFarmer = user?.user_type === 'farmer';

  useSEO({
    title: isFarmer ? 'Received Orders' : 'My Orders',
    description: isFarmer
      ? 'Manage, accept, and fulfill incoming orders from your buyers on Farmket.'
      : 'Track your Farmket purchases and delivery status.'
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await orderService.getOrders();
      setOrders(res.results || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const fmt = (n: string | number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      typeof n === 'string' ? parseFloat(n) || 0 : n
    );

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const getRelativeTime = (s: string) => {
    const diff = Date.now() - new Date(s).getTime();
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
      toast.success(newStatus === 'processing' ? 'Order accepted and in processing!' : `Status updated to ${newStatus}`);
      fetchOrders();
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
        const matchesBuyer = (order.buyer_details?.full_name || order.buyer_details?.username || '').toLowerCase().includes(q);
        const matchesAddress = (order.delivery_address || '').toLowerCase().includes(q);
        const matchesProduct = order.items.some((it) => (it.product_name || '').toLowerCase().includes(q));
        return matchesNumber || matchesBuyer || matchesAddress || matchesProduct;
      }
      return true;
    });
  }, [orders, activeTab, searchQuery]);

  const detailUrlPrefix = isFarmer ? '/farmer/orders' : '/dashboard/orders';

  return (
    <Container maxWidth="wide" className="py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand px-2.5 py-0.5 rounded-full bg-brand/10">
              {isFarmer ? 'Farmer Portal' : 'Buyer Account'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
            {isFarmer ? 'Received Orders' : 'My Orders'}
          </h1>
          <p className="text-sm text-foreground-secondary mt-1 max-w-xl">
            {isFarmer
              ? 'Review and manage incoming purchase requests from your buyers. Accept orders, prepare harvest packages, and mark shipments.'
              : 'Track your Farmket farm-to-table purchases, view live delivery statuses, and manage your past orders.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isFarmer ? (
            <Link to="/farmer/crops">
              <Button variant="outline" className="rounded-full px-5 gap-2 shadow-sm">
                <Sprout className="h-4 w-4 text-brand" /> Crop Tracking
              </Button>
            </Link>
          ) : (
            <Link to="/marketplace">
              <Button variant="primary" className="rounded-full px-6 gap-2 shadow-sm">
                <ShoppingBag className="h-4 w-4" /> Browse Market
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Farmer Performance Metric Cards */}
      {isFarmer && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-surface border border-border-subtle p-5 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-1">Total Received</p>
              <p className="text-2xl font-display font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-brand shadow-sm">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl bg-surface border border-border-subtle p-5 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-1">Needs Action</p>
              <p className="text-2xl font-display font-bold text-warning">{stats.pending}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-warning-muted text-warning flex items-center justify-center shadow-sm">
              <Clock className="h-5 w-5" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-surface border border-border-subtle p-5 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-1">In Fulfillment</p>
              <p className="text-2xl font-display font-bold text-info">{stats.processing}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-info-muted text-info flex items-center justify-center shadow-sm">
              <Truck className="h-5 w-5" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-surface border border-border-subtle p-5 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-1">Delivered Revenue</p>
              <p className="text-2xl font-display font-bold text-success">{fmt(stats.revenue)}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-success-muted text-success flex items-center justify-center shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab
                ? 'bg-foreground text-background shadow-sm scale-[1.02]'
                : 'bg-surface hover:bg-surface-elevated text-foreground-secondary hover:text-foreground border border-border-subtle'
                }`}
            >
              <span className="capitalize">{tab}</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${activeTab === tab ? 'bg-background/20 text-background' : 'bg-surface-elevated text-foreground-secondary'
                  }`}
              >
                {tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
          <input
            type="text"
            placeholder={isFarmer ? "Search by Buyer, Order #, Product..." : "Search by Order # or Product..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-border-subtle rounded-full focus:outline-none focus:border-brand transition-colors text-foreground placeholder:text-foreground-secondary/70 shadow-sm"
          />
        </div>
      </div>

      {/* Orders Listing */}
      {loading ? (
        <div className="space-y-4 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-surface-elevated border border-border-subtle" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-20 text-center rounded-3xl bg-surface border border-border-subtle shadow-sm px-6"
        >
          <div className="h-20 w-20 rounded-full bg-surface-elevated border border-border-subtle flex items-center justify-center mb-5 text-foreground-secondary">
            <Package className="h-9 w-9" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            {activeTab !== 'all' ? `No ${activeTab} orders` : 'No orders found'}
          </h2>
          <p className="text-sm text-foreground-secondary mb-6 max-w-md">
            {isFarmer
              ? activeTab !== 'all'
                ? `You have no orders currently in "${activeTab}" status.`
                : 'Incoming orders from buyers who purchase your products or pre-book your crops will appear here.'
              : 'You have not placed any orders matching the current filter.'}
          </p>
          {isFarmer ? (
            <Link to="/dashboard/products/new">
              <Button variant="primary" className="rounded-full px-6">
                Add Products to Sell
              </Button>
            </Link>
          ) : (
            <Link to="/marketplace">
              <Button variant="primary" className="rounded-full px-6 gap-2">
                <ShoppingBag className="h-4 w-4" /> Start Shopping
              </Button>
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="space-y-5">
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
                  transition={{ delay: index * 0.04 }}
                  className="rounded-2xl bg-surface border border-border-subtle p-6 hover:shadow-md hover:border-border-strong transition-all duration-300 relative group overflow-hidden"
                >
                  {/* Top Bar: Order ID, Date, Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-brand font-bold shrink-0">
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
                          <span className="text-[11px] font-semibold text-foreground-secondary bg-surface-elevated px-2 py-0.5 rounded-full border border-border-subtle">
                            {getRelativeTime(order.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-foreground-secondary mt-0.5 font-medium">
                          Placed on {fmtDate(order.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-center">
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>

                  {/* Body Grid: Buyer Info (for Farmer) + Order Items */}
                  <div className="py-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Buyer Information Section (if Farmer) */}
                    {isFarmer && (
                      <div className="lg:col-span-4 rounded-xl bg-surface-elevated/70 border border-border-subtle p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-secondary">
                              Buyer Details
                            </span>
                            {buyer && (
                              <button
                                onClick={(e) => handleStartChat(buyer.id, e)}
                                className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
                              >
                                <MessageSquare className="h-3.5 w-3.5" /> Message
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center font-bold text-brand text-sm overflow-hidden shrink-0">
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
                              <p className="text-sm font-bold text-foreground truncate">
                                {buyer?.full_name || buyer?.username || `Buyer #${order.buyer}`}
                              </p>
                              {buyer?.company_name && (
                                <p className="text-xs text-foreground-secondary truncate">{buyer.company_name}</p>
                              )}
                              <p className="text-[11px] text-foreground-secondary truncate">
                                @{buyer?.username || 'buyer'}
                              </p>
                            </div>
                          </div>

                          {/* Buyer Contact / Address summary */}
                          <div className="mt-3.5 space-y-1.5 text-xs text-foreground-secondary border-t border-border-subtle pt-3">
                            {buyer?.phone_number && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-foreground-secondary/70 shrink-0" />
                                <span className="truncate">{buyer.phone_number}</span>
                              </div>
                            )}
                            {order.delivery_address && (
                              <div className="flex items-start gap-2">
                                <MapPin className="h-3.5 w-3.5 text-foreground-secondary/70 shrink-0 mt-0.5" />
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
                      <div className="space-y-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-secondary">
                          Ordered Items ({order.items.length})
                        </span>

                        <div className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-surface-elevated/40 overflow-hidden">
                          {order.items.map((item) => {
                            const productImg = item.product_details?.images?.[0]?.image;
                            const isPrebooking = item.is_prebooking;

                            return (
                              <div key={item.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="h-12 w-12 rounded-lg bg-surface border border-border-subtle overflow-hidden flex items-center justify-center shrink-0">
                                    {productImg ? (
                                      <img
                                        src={resolveImg(productImg) || ''}
                                        alt={item.product_name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <Package className="h-6 w-6 text-foreground-secondary" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="text-sm font-bold text-foreground truncate">
                                        {item.product_name || `Product #${item.product}`}
                                      </p>
                                      {isPrebooking && (
                                        <Badge variant="brand" className="text-[10px] py-0 px-2">
                                          Pre-booking
                                        </Badge>
                                      )}
                                      {item.product_details?.is_organic && (
                                        <Badge variant="success" className="text-[10px] py-0 px-2">
                                          Organic
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-foreground-secondary mt-0.5">
                                      Qty: <span className="font-semibold text-foreground">{item.quantity}</span> × {fmt(item.price_at_purchase || item.price)}
                                    </p>
                                  </div>
                                </div>

                                {/* Item Status & Specific Action for Farmer */}
                                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-foreground">
                                      {fmt(item.subtotal || item.quantity * parseFloat(item.price_at_purchase || item.price || '0'))}
                                    </p>
                                    <span className="text-[11px] capitalize text-foreground-secondary">
                                      Status: <strong className="text-foreground">{item.status}</strong>
                                    </span>
                                  </div>

                                  {isFarmer && item.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      isLoading={updatingItemId === item.id}
                                      onClick={(e) => handleItemTransition(item.id, 'processing', e)}
                                      className="rounded-full text-xs h-8 px-3 gap-1.5 shadow-sm"
                                    >
                                      <Check className="h-3.5 w-3.5" /> Accept
                                    </Button>
                                  )}

                                  {isFarmer && item.status === 'processing' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      isLoading={updatingItemId === item.id}
                                      onClick={(e) => handleItemTransition(item.id, 'shipped', e)}
                                      className="rounded-full text-xs h-8 px-3 gap-1.5 hover:bg-brand hover:text-brand-foreground hover:border-brand"
                                    >
                                      <Truck className="h-3.5 w-3.5" /> Ship
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
                        <p className="text-[11px] font-bold uppercase tracking-wider text-foreground-secondary">
                          {isFarmer ? 'Your Total Earnings' : 'Order Total'}
                        </p>
                        <p className="text-2xl font-display font-bold text-foreground mt-0.5">
                          {fmt(order.total_amount)}
                        </p>
                      </div>
                      <div className="h-8 w-px bg-border-subtle hidden sm:block" />
                      <div className="hidden sm:flex items-center gap-1.5 text-xs text-foreground-secondary font-medium">
                        <CreditCard className="h-4 w-4 text-foreground-secondary/70" />
                        <span className="uppercase">{order.payment_method || 'COD'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link to={`${detailUrlPrefix}/${order.id}`} className="w-full sm:w-auto">
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto rounded-full px-5 gap-2 group-hover:border-brand group-hover:text-brand transition-colors"
                        >
                          View Full Details <ArrowRight className="h-4 w-4" />
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
    </Container>
  );
};

export default Orders;

