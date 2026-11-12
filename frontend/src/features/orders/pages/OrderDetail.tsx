import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { orderService } from '@/features/orders';
import { chatService } from '@/features/chat/services/chatService';
import { OrderStatusBadge, Button, Badge, PageHeader, ConfirmDialog } from '@/components/ui';
import {
  MapPin,
  CreditCard,
  FileText,
  User as UserIcon,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  Sprout,
  AlertTriangle,
  Printer,
  Calendar,
  Check,
  Building2,
  ShieldCheck,
  Smartphone,
  Banknote,
  XCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Order } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import { MEDIA_BASE_URL } from '@/config/env';
import { cn } from '@/lib/utils/cn';

const STEPS = [
  { key: 'pending', label: 'Order Placed', desc: 'Awaiting farmer acceptance' },
  { key: 'processing', label: 'In Processing', desc: 'Harvesting & packing fresh produce' },
  { key: 'shipped', label: 'Out for Delivery', desc: 'In transit with farm logistics' },
  { key: 'delivered', label: 'Delivered', desc: 'Received fresh & settled' },
] as const;

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFarmer = user?.user_type === 'farmer';

  useSEO({ title: `Order Details #${id} | Farmket` });

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);

  const fetchOrder = useCallback(() => {
    if (!id) return;
    orderService
      .getOrder(Number(id))
      .then(setOrder)
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancelConfirm = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const updated = await orderService.cancelOrder(order.id);
      setOrder(updated);
      toast.success('Order cancelled successfully');
      setIsCancelDialogOpen(false);
    } catch {
      toast.error('Cannot cancel this order at its current fulfillment stage');
    } finally {
      setCancelling(false);
    }
  };

  const handleItemTransition = async (itemId: number, newStatus: string) => {
    setUpdatingItem(itemId);
    try {
      await orderService.updateItemStatus(itemId, newStatus);
      toast.success(
        newStatus === 'processing'
          ? 'Item accepted for processing!'
          : newStatus === 'shipped'
          ? 'Item marked as dispatched!'
          : newStatus === 'delivered'
          ? 'Delivery confirmed!'
          : `Item updated to ${newStatus}`
      );
      fetchOrder();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to update item status');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleStartChat = async (buyerId?: number) => {
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

  const handlePrint = () => {
    window.print();
  };

  const fmt = (n: string | number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(typeof n === 'string' ? parseFloat(n) || 0 : n);

  const fmtDate = (s: string) =>
    new Date(s).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const resolveImg = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${MEDIA_BASE_URL}${url}`;
  };

  const currentStepIndex = order
    ? STEPS.findIndex((s) => s.key === order.status)
    : -1;

  const backLink = isFarmer ? '/farmer/orders' : '/dashboard/orders';
  const buyer = order?.buyer_details;

  if (loading) {
    return (
      <div className="w-full space-y-6 animate-pulse py-4">
        <div className="h-10 w-48 rounded-xl bg-surface-elevated" />
        <div className="h-44 rounded-2xl bg-surface-elevated" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-56 rounded-2xl bg-surface-elevated" />
          <div className="h-56 rounded-2xl bg-surface-elevated" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full max-w-md mx-auto py-20 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-surface-elevated border border-border-subtle flex items-center justify-center mx-auto mb-4 text-warning">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground">Order Not Found</h2>
        <p className="text-sm text-foreground-secondary mb-6 leading-relaxed">
          The requested order does not exist or you do not have permission to view it.
        </p>
        <Link to={backLink}>
          <Button variant="outline" className="rounded-xl px-5 font-semibold">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const hasPrebooking = order.items.some((i) => i.is_prebooking);

  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-16">
      {/* 1. Header with PageHeader Primitive */}
      <PageHeader
        backLink={{
          to: backLink,
          label: isFarmer ? 'Back to Received Orders' : 'Back to My Orders',
        }}
        title={order.order_number ?? `Order #${order.id}`}
        description={`Placed on ${fmtDate(order.created_at)} • Harvest fulfillment direct to doorstep.`}
        badge={
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
            {hasPrebooking && (
              <Badge variant="brand" size="sm" className="font-bold">
                Pre-booking
              </Badge>
            )}
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="h-4 w-4" />}
              className="rounded-xl font-semibold h-10 px-3.5 print:hidden shadow-2xs"
            >
              Print Receipt
            </Button>

            {isFarmer && buyer && (
              <Button
                variant="brand"
                size="sm"
                onClick={() => handleStartChat(buyer.id)}
                leftIcon={<MessageSquare className="h-4 w-4" />}
                className="rounded-xl font-bold h-10 px-4 shadow-xs print:hidden"
              >
                Chat with Buyer
              </Button>
            )}

            {!isFarmer && ['pending', 'processing'].includes(order.status) && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsCancelDialogOpen(true)}
                className="rounded-xl font-semibold h-10 px-4 print:hidden"
              >
                Cancel Order
              </Button>
            )}
          </div>
        }
      />

      {/* 2. Visual Order Fulfillment Stepper */}
      {order.status !== 'cancelled' ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-surface border border-border-subtle p-5 sm:p-7 shadow-xs overflow-x-auto print:border-none"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
              Fulfillment Pipeline & Milestones
            </h2>
            <span className="text-xs font-bold text-brand bg-brand/10 px-3 py-1 rounded-full border border-brand/20">
              Current Status: <span className="capitalize">{order.status}</span>
            </span>
          </div>

          <div className="flex items-center justify-between min-w-[560px] px-4">
            {STEPS.map((stepItem, idx) => {
              const isCompleted = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <React.Fragment key={stepItem.key}>
                  <div className="flex flex-col items-center gap-2 relative z-10 text-center">
                    <div
                      className={cn(
                        'h-11 w-11 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs',
                        isCompleted
                          ? 'bg-brand text-on-brand shadow-xs'
                          : 'bg-surface-elevated text-muted border border-border-subtle',
                        isCurrent && 'ring-4 ring-brand/15 font-black scale-105'
                      )}
                    >
                      {isCompleted ? <Check className="h-5 w-5 stroke-[3]" /> : idx + 1}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-bold whitespace-nowrap',
                        isCurrent
                          ? 'text-brand'
                          : isCompleted
                          ? 'text-foreground'
                          : 'text-muted'
                      )}
                    >
                      {stepItem.label}
                    </span>
                    <span className="text-[11px] text-muted max-w-[120px] hidden sm:block leading-tight">
                      {stepItem.desc}
                    </span>
                  </div>

                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 h-1 mx-3 rounded-full bg-surface-elevated overflow-hidden -mt-6">
                      <motion.div
                        className="h-full bg-brand"
                        initial={{ width: '0%' }}
                        animate={{ width: currentStepIndex > idx ? '100%' : '0%' }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <div className="p-4 rounded-2xl bg-danger-muted/30 border border-danger/30 flex items-center gap-3 text-xs">
          <XCircle className="w-5 h-5 text-danger shrink-0" />
          <div>
            <p className="font-bold text-foreground">Order Cancelled</p>
            <p className="text-foreground-secondary mt-0.5">
              This order has been cancelled and will not be fulfilled. Any pre-authorized amounts will be returned.
            </p>
          </div>
        </div>
      )}

      {/* 3. Grid: Buyer Profile & Delivery Info vs Payment & Settlement */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Customer & Delivery Destination Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-7 rounded-2xl bg-surface border border-border-subtle p-5 sm:p-7 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-5">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-brand" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                  {isFarmer ? 'Buyer Customer Profile' : 'Recipient & Delivery Information'}
                </h3>
              </div>
              {buyer && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success bg-success-muted px-2.5 py-0.5 rounded-full border border-success/20">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified Account
                </span>
              )}
            </div>

            {/* Buyer Profile Info */}
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-brand/10 border-2 border-brand/20 flex items-center justify-center font-bold text-brand text-base overflow-hidden shrink-0 shadow-2xs">
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

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-base font-bold text-foreground">
                    {buyer?.full_name || buyer?.username || `Customer #${order.buyer}`}
                  </h4>
                  {isFarmer && buyer && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartChat(buyer.id)}
                      className="rounded-full text-xs h-7 px-3 gap-1.5 text-brand border-brand/30 hover:bg-brand hover:text-on-brand print:hidden"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Direct Chat
                    </Button>
                  )}
                </div>

                {buyer?.company_name && (
                  <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5 font-medium">
                    <Building2 className="h-3 w-3" /> {buyer.company_name}
                  </p>
                )}
                <p className="text-xs text-muted">@{buyer?.username || 'buyer'}</p>

                {/* Contact Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-3 border-t border-border-subtle text-xs">
                  {buyer?.email && (
                    <a
                      href={`mailto:${buyer.email}`}
                      className="flex items-center gap-2 text-foreground-secondary hover:text-brand transition-colors truncate"
                    >
                      <Mail className="h-3.5 w-3.5 text-muted shrink-0" />
                      <span className="truncate">{buyer.email}</span>
                    </a>
                  )}
                  {buyer?.phone_number && (
                    <a
                      href={`tel:${buyer.phone_number}`}
                      className="flex items-center gap-2 text-foreground-secondary hover:text-brand transition-colors truncate"
                    >
                      <Phone className="h-3.5 w-3.5 text-muted shrink-0" />
                      <span className="truncate">{buyer.phone_number}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Destination Address */}
            <div className="mt-5 pt-4 border-t border-border-subtle">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-brand shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Delivery Destination Address</p>
                  <p className="text-xs sm:text-sm text-foreground-secondary mt-0.5 leading-relaxed">
                    {order.delivery_address || 'Standard Registered Address'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="mt-5 p-3.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs">
              <div className="flex items-center gap-1.5 font-bold text-foreground mb-1">
                <FileText className="h-3.5 w-3.5 text-brand" /> Buyer Notes & Instructions:
              </div>
              <p className="text-foreground-secondary leading-relaxed">{order.notes}</p>
            </div>
          )}
        </motion.div>

        {/* Right Column: Payment, Summary & Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-5 rounded-2xl bg-surface border border-border-subtle p-5 sm:p-7 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-border-subtle mb-5">
              <CreditCard className="h-4 w-4 text-brand" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                Payment & Financial Settlement
              </h3>
            </div>

            <div className="space-y-4">
              {/* Payment Mode Box */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-elevated border border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-brand shrink-0">
                    {order.payment_method === 'cod' ? (
                      <Banknote className="h-5 w-5" />
                    ) : order.payment_method === 'upi' ? (
                      <Smartphone className="h-5 w-5" />
                    ) : (
                      <CreditCard className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      Payment Mode
                    </p>
                    <p className="text-sm font-bold text-foreground uppercase">
                      {order.payment_method === 'cod'
                        ? 'Cash on Delivery'
                        : order.payment_method?.toUpperCase() || 'COD'}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={order.status === 'delivered' ? 'success' : 'brand'}
                  size="sm"
                  className="font-bold"
                >
                  {order.status === 'delivered' ? 'Settled' : 'Confirmed'}
                </Badge>
              </div>

              {/* Financial Calculation */}
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex justify-between text-foreground-secondary">
                  <span>Harvest Items Subtotal</span>
                  <span className="font-semibold text-foreground tabular-nums">{fmt(order.total_amount)}</span>
                </div>
                <div className="flex justify-between text-foreground-secondary">
                  <span>Direct Farm Logistics</span>
                  <span className="text-success font-semibold">FREE (Zero Surcharge)</span>
                </div>
                <div className="flex justify-between text-foreground-secondary">
                  <span>Farmket Platform Quality Assurance</span>
                  <span className="text-brand font-semibold">Complimentary</span>
                </div>
                <div className="border-t border-border-subtle pt-3 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">
                    {isFarmer ? 'Total Farmer Earnings' : 'Total Amount Paid'}
                  </span>
                  <span className="text-2xl sm:text-3xl font-display font-extrabold text-brand tabular-nums tracking-tight">
                    {fmt(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3.5 rounded-xl bg-brand/5 border border-brand/15 text-xs text-foreground-secondary leading-relaxed">
            <span className="font-bold text-foreground">Fulfillment Guarantee: </span>
            {isFarmer
              ? 'Payouts are verified and automatically credited upon final harvest delivery confirmation.'
              : 'Direct from farm protection guarantees peak nutritional freshness and quality inspection.'}
          </div>
        </motion.div>
      </div>

      {/* 4. Ordered Harvest Items Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl bg-surface border border-border-subtle p-5 sm:p-7 shadow-xs"
      >
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-subtle">
          <div>
            <h2 className="text-base sm:text-lg font-display font-bold text-foreground">
              {isFarmer ? 'Harvested Items to Fulfill' : 'Purchased Farm Items'}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'} in this order
            </p>
          </div>
        </div>

        <div className="divide-y divide-border-subtle">
          {order.items.map((item) => {
            const productImg = item.product_details?.images?.[0]?.image;
            const isPrebooking = item.is_prebooking;
            const growth = item.crop_growth_details;
            const isUpdating = updatingItem === item.id;

            return (
              <div
                key={item.id}
                className="py-5 first:pt-2 last:pb-2 flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Item Details */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-surface-elevated border border-border-subtle overflow-hidden flex items-center justify-center shrink-0">
                    {productImg ? (
                      <img
                        src={resolveImg(productImg) || ''}
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Package className="h-7 w-7 text-muted" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-foreground">
                        {item.product_name || `Product #${item.product}`}
                      </h4>
                      {isPrebooking && (
                        <Badge variant="brand" size="sm" className="font-bold gap-1">
                          <Sprout className="h-3 w-3" /> Pre-booking
                        </Badge>
                      )}
                      {item.product_details?.is_organic && (
                        <Badge variant="success" size="sm" className="font-bold">
                          Organic Certified
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted">
                      Quantity: <strong className="text-foreground">{item.quantity}</strong>{' '}
                      {item.product_details?.unit || 'units'} × {fmt(item.price_at_purchase || item.price)}
                    </p>

                    {/* Prebooking extra details if present */}
                    {isPrebooking && growth && (
                      <div className="mt-2 p-2.5 rounded-lg bg-brand/5 border border-brand/10 text-xs text-foreground-secondary flex items-center gap-4 flex-wrap">
                        <span>
                          Current Growth Stage:{' '}
                          <strong className="capitalize text-brand">
                            {growth.current_stage || 'Growing'}
                          </strong>
                        </span>
                        {growth.expected_harvest_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted" /> Expected Harvest:{' '}
                            <strong className="text-foreground">{growth.expected_harvest_date}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Subtotal and Status Transition Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 border-t md:border-t-0 border-border-subtle pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-muted uppercase tracking-wider font-bold">
                      Subtotal
                    </p>
                    <p className="text-lg font-display font-bold text-foreground tabular-nums">
                      {fmt(
                        item.subtotal ||
                          item.quantity * parseFloat(item.price_at_purchase || item.price || '0')
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap print:hidden">
                    <span className="text-xs font-semibold capitalize px-2.5 py-1 rounded-full bg-surface-elevated border border-border-subtle">
                      Status: <strong className="text-foreground">{item.status}</strong>
                    </span>

                    {/* Farmer Action Buttons */}
                    {isFarmer && item.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="brand"
                        isLoading={isUpdating}
                        onClick={() => handleItemTransition(item.id, 'processing')}
                        leftIcon={<Check className="h-3.5 w-3.5" />}
                        className="rounded-xl font-bold shadow-xs h-8 text-xs"
                      >
                        Accept Order
                      </Button>
                    )}

                    {isFarmer && item.status === 'processing' && (
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={isUpdating}
                        onClick={() => handleItemTransition(item.id, 'shipped')}
                        leftIcon={<Truck className="h-3.5 w-3.5 text-brand" />}
                        className="rounded-xl font-semibold hover:bg-brand hover:text-on-brand hover:border-brand h-8 text-xs"
                      >
                        Mark as Shipped
                      </Button>
                    )}

                    {/* Buyer Confirmation Action */}
                    {!isFarmer && item.status === 'shipped' && (
                      <Button
                        size="sm"
                        variant="brand"
                        isLoading={isUpdating}
                        onClick={() => handleItemTransition(item.id, 'delivered')}
                        leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                        className="rounded-xl font-bold shadow-xs h-8 text-xs"
                      >
                        Confirm Received
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 5. Order Status History & Activity Log */}
      {order.items.some((it) => it.status_history && it.status_history.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-surface border border-border-subtle p-5 sm:p-7 shadow-xs print:hidden"
        >
          <div className="flex items-center gap-2 pb-4 border-b border-border-subtle mb-4">
            <Clock className="h-4 w-4 text-brand" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Fulfillment Journey & Audit History
            </h3>
          </div>

          <div className="space-y-2.5">
            {order.items.flatMap((it) =>
              (it.status_history || []).map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between text-xs p-3 rounded-xl bg-surface-elevated/50 border border-border-subtle"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-brand shrink-0" />
                    <span>
                      Item <strong className="text-foreground">{it.product_name}</strong> updated from{' '}
                      <span className="capitalize font-semibold text-warning">{h.previous_status}</span> to{' '}
                      <span className="capitalize font-semibold text-success">{h.new_status}</span>
                      {h.updated_by_name && (
                        <span className="text-muted"> by {h.updated_by_name}</span>
                      )}
                    </span>
                  </div>
                  <span className="text-muted font-medium shrink-0 ml-4">
                    {fmtDate(h.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* 6. Cancel Order Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel This Order?"
        description="Are you sure you want to cancel this order? Once cancelled, the items will be returned to grower inventory and pre-bookings will be voided."
        confirmLabel="Yes, Cancel Order"
        cancelLabel="Keep Order"
        variant="danger"
        isLoading={cancelling}
      />
    </div>
  );
};

export default OrderDetail;
