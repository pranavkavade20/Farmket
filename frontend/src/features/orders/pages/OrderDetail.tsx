import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks';
import { orderService } from '@/features/orders';
import { chatService } from '@/features/chat/services/chatService';
import { OrderStatusBadge, Button, Container, Badge } from '@/components/ui';
import {
  ArrowLeft,
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
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Order } from '@/types';
import { toast } from "sonner";
import { useAuth } from '@/features/auth';
import { MEDIA_BASE_URL } from '@/config/env';

const STEPS = [
  { key: 'pending', label: 'Order Placed', desc: 'Awaiting farmer acceptance' },
  { key: 'processing', label: 'In Processing', desc: 'Packing and preparing harvest' },
  { key: 'shipped', label: 'Out for Delivery', desc: 'In transit to buyer' },
  { key: 'delivered', label: 'Delivered', desc: 'Received & settled' },
] as const;

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFarmer = user?.user_type === 'farmer';

  useSEO({ title: `Order Details #${id}` });

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);

  const fetchOrder = () => {
    if (!id) return;
    orderService
      .getOrder(Number(id))
      .then(setOrder)
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const updated = await orderService.cancelOrder(order.id);
      setOrder(updated);
      toast.success('Order cancelled successfully');
    } catch {
      toast.error('Cannot cancel this order at this stage');
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
            ? 'Item marked as shipped!'
            : newStatus === 'delivered'
              ? 'Delivery confirmed!'
              : `Item updated to ${newStatus}`
      );
      fetchOrder();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to update status');
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
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      typeof n === 'string' ? parseFloat(n) || 0 : n
    );

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
      <Container maxWidth="wide" className="py-12 animate-pulse space-y-6">
        <div className="h-8 w-48 rounded-xl bg-surface-elevated" />
        <div className="h-44 rounded-2xl bg-surface-elevated" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-56 rounded-2xl bg-surface-elevated" />
          <div className="h-56 rounded-2xl bg-surface-elevated" />
        </div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="narrow" className="py-24 text-center">
        <div className="h-16 w-16 rounded-full bg-surface-elevated border border-border-subtle flex items-center justify-center mx-auto mb-4 text-foreground-secondary">
          <AlertTriangle className="h-8 w-8 text-warning" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Order Not Found</h2>
        <p className="text-sm text-foreground-secondary mb-6">
          The requested order does not exist or you do not have permission to view it.
        </p>
        <Link to={backLink}>
          <Button variant="outline" className="rounded-full px-6">
            Back to Orders
          </Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container maxWidth="wide" className="py-8 space-y-8 pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to={backLink}>
            <button className="h-11 w-11 rounded-full bg-surface border border-border-subtle flex items-center justify-center hover:shadow-md hover:scale-105 transition-all text-foreground shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                {order.order_number ?? `Order #${order.id}`}
              </h1>
              <OrderStatusBadge status={order.status} />
              {order.items.some((i) => i.is_prebooking) && (
                <Badge variant="brand" className="text-xs">
                  Includes Pre-booking
                </Badge>
              )}
            </div>
            <p className="text-xs text-foreground-secondary mt-1 font-medium">
              Placed on {fmtDate(order.created_at)}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="rounded-full px-4 gap-2 text-xs shadow-sm"
          >
            <Printer className="h-3.5 w-3.5" /> Print Order
          </Button>

          {isFarmer && buyer && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleStartChat(buyer.id)}
              className="rounded-full px-4 gap-2 text-xs shadow-sm"
            >
              <MessageSquare className="h-3.5 w-3.5" /> Chat with Buyer
            </Button>
          )}

          {!isFarmer && ['pending', 'processing'].includes(order.status) && (
            <Button
              variant="danger"
              size="sm"
              isLoading={cancelling}
              onClick={handleCancel}
              className="rounded-full px-4 text-xs"
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Visual Order Progress Tracker */}
      {order.status !== 'cancelled' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-surface border border-border-subtle p-6 sm:p-8 shadow-sm overflow-x-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground-secondary">
              Order Fulfillment Timeline
            </h2>
            <span className="text-xs font-semibold text-brand bg-brand/10 px-3 py-1 rounded-full">
              Current Stage: <span className="capitalize">{order.status}</span>
            </span>
          </div>

          <div className="flex items-center justify-between min-w-[540px] px-6">
            {STEPS.map((step, idx) => {
              const isCompleted = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center gap-2.5 relative z-10 text-center">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm ${isCompleted
                          ? 'bg-brand text-brand-foreground scale-105 shadow-brand/20'
                          : 'bg-surface-elevated text-foreground-secondary border border-border-subtle'
                        }`}
                    >
                      {isCompleted ? <Check className="h-5 w-5 stroke-[2.5]" /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-bold whitespace-nowrap ${isCurrent
                          ? 'text-brand'
                          : isCompleted
                            ? 'text-foreground'
                            : 'text-foreground-secondary'
                        }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-[11px] text-foreground-secondary/70 max-w-[120px] hidden sm:block">
                      {step.desc}
                    </span>
                  </div>

                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 h-1.5 mx-3 rounded-full bg-surface-elevated overflow-hidden -mt-6">
                      <motion.div
                        className="h-full bg-brand"
                        initial={{ width: '0%' }}
                        animate={{ width: currentStepIndex > idx ? '100%' : '0%' }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Grid: Buyer Profile & Delivery Info vs Payment / Settlement */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Buyer / Customer Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-7 rounded-2xl bg-surface border border-border-subtle p-6 sm:p-7 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-5">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-brand" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-secondary">
                  {isFarmer ? 'Buyer Customer Information' : 'Customer & Delivery Profile'}
                </h3>
              </div>
              {buyer && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success bg-success/10 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified User
                </span>
              )}
            </div>

            {/* Buyer Profile Preview */}
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-full bg-brand/10 border-2 border-brand/20 flex items-center justify-center font-bold text-brand text-lg overflow-hidden shrink-0 shadow-sm">
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
                      className="rounded-full text-xs h-8 px-3 gap-1.5 text-brand border-brand/30 hover:bg-brand hover:text-brand-foreground"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Direct Chat
                    </Button>
                  )}
                </div>
                {buyer?.company_name && (
                  <p className="text-xs text-foreground-secondary flex items-center gap-1.5 mt-0.5">
                    <Building2 className="h-3 w-3" /> {buyer.company_name}
                  </p>
                )}
                <p className="text-xs text-foreground-secondary">@{buyer?.username || 'buyer'}</p>

                {/* Contact Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-3 border-t border-border-subtle text-xs">
                  {buyer?.email && (
                    <a
                      href={`mailto:${buyer.email}`}
                      className="flex items-center gap-2 text-foreground-secondary hover:text-brand transition-colors truncate"
                    >
                      <Mail className="h-3.5 w-3.5 text-foreground-secondary/70 shrink-0" />
                      <span className="truncate">{buyer.email}</span>
                    </a>
                  )}
                  {buyer?.phone_number && (
                    <a
                      href={`tel:${buyer.phone_number}`}
                      className="flex items-center gap-2 text-foreground-secondary hover:text-brand transition-colors truncate"
                    >
                      <Phone className="h-3.5 w-3.5 text-foreground-secondary/70 shrink-0" />
                      <span className="truncate">{buyer.phone_number}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Destination */}
            <div className="mt-5 pt-4 border-t border-border-subtle">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center text-brand shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Delivery Destination Address</p>
                  <p className="text-sm text-foreground-secondary mt-0.5 leading-relaxed">
                    {order.delivery_address || 'Standard Delivery Address'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="mt-5 p-3.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs">
              <div className="flex items-center gap-1.5 font-bold text-foreground mb-1">
                <FileText className="h-3.5 w-3.5 text-brand" /> Buyer Notes / Special Instructions:
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
          className="lg:col-span-5 rounded-2xl bg-surface border border-border-subtle p-6 sm:p-7 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-border-subtle mb-5">
              <CreditCard className="h-4 w-4 text-brand" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-secondary">
                Payment & Settlement Summary
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-elevated border border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-foreground shrink-0 font-bold">
                    <CreditCard className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-foreground-secondary">
                      Payment Mode
                    </p>
                    <p className="text-base font-bold text-foreground uppercase">
                      {order.payment_method || 'Cash on Delivery'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-success/10 text-success">
                  {order.status === 'delivered' ? 'Settled' : 'Confirmed'}
                </span>
              </div>

              {/* Financial Calculation */}
              <div className="space-y-2.5 pt-2 text-sm">
                <div className="flex justify-between text-foreground-secondary">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-foreground">{fmt(order.total_amount)}</span>
                </div>
                <div className="flex justify-between text-foreground-secondary">
                  <span>Marketplace Platform Fee</span>
                  <span className="text-success font-semibold">₹0 (Free Tier)</span>
                </div>
                <div className="flex justify-between text-foreground-secondary">
                  <span>Delivery Surcharge</span>
                  <span className="font-semibold text-foreground">₹0</span>
                </div>
                <div className="border-t border-border-subtle pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-foreground uppercase tracking-wider">
                    {isFarmer ? 'Your Total Payout' : 'Total Paid'}
                  </span>
                  <span className="text-3xl font-display font-bold text-foreground">
                    {fmt(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3.5 rounded-xl bg-brand/5 border border-brand/15 text-xs text-foreground-secondary leading-relaxed">
            <span className="font-bold text-foreground">Fulfillment Guarantee: </span>
            {isFarmer
              ? 'Payments are verified and auto-credited upon successful harvest delivery.'
              : 'Farmket ensures 100% farm-fresh quality with direct buyer protection.'}
          </div>
        </motion.div>
      </div>

      {/* Ordered Items Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl bg-surface border border-border-subtle p-6 sm:p-8 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-subtle">
          <div>
            <h2 className="text-lg font-bold text-foreground font-display">
              {isFarmer ? 'Harvested Items to Fulfill' : 'Purchased Items'}
            </h2>
            <p className="text-xs text-foreground-secondary mt-0.5">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''} in this order
            </p>
          </div>
        </div>

        <div className="divide-y divide-border-subtle">
          {order.items.map((item) => {
            const productImg = item.product_details?.images?.[0]?.image;
            const isPrebooking = item.is_prebooking;
            const growth = item.crop_growth_details;

            return (
              <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Item Details */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-surface-elevated border border-border-subtle overflow-hidden flex items-center justify-center shrink-0">
                    {productImg ? (
                      <img
                        src={resolveImg(productImg) || ''}
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-foreground-secondary" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-foreground">
                        {item.product_name || `Product #${item.product}`}
                      </h4>
                      {isPrebooking && (
                        <Badge variant="brand" className="text-xs gap-1">
                          <Sprout className="h-3 w-3" /> Pre-booking
                        </Badge>
                      )}
                      {item.product_details?.is_organic && (
                        <Badge variant="success" className="text-xs">
                          Organic Certified
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-foreground-secondary">
                      Quantity Ordered: <span className="font-bold text-foreground">{item.quantity}</span> {item.product_details?.unit || 'units'} × {fmt(item.price_at_purchase || item.price)}
                    </p>

                    {/* Prebooking extra details if present */}
                    {isPrebooking && growth && (
                      <div className="mt-2 p-2.5 rounded-lg bg-brand/5 border border-brand/10 text-xs text-foreground-secondary flex items-center gap-4 flex-wrap">
                        <span>Current Stage: <strong className="capitalize text-brand">{growth.current_stage || 'Growing'}</strong></span>
                        {growth.expected_harvest_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-foreground-secondary" /> Expected Harvest: <strong>{growth.expected_harvest_date}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price and Farmer Status Transition Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0 border-t md:border-t-0 border-border-subtle pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-xs text-foreground-secondary uppercase tracking-wider font-semibold">Subtotal</p>
                    <p className="text-xl font-display font-bold text-foreground">
                      {fmt(item.subtotal || item.quantity * parseFloat(item.price_at_purchase || item.price || '0'))}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold capitalize px-3 py-1 rounded-full bg-surface-elevated border border-border-subtle">
                      Status: {item.status}
                    </span>

                    {/* Farmer Action Buttons */}
                    {isFarmer && item.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="primary"
                        isLoading={updatingItem === item.id}
                        onClick={() => handleItemTransition(item.id, 'processing')}
                        className="rounded-full text-xs h-9 px-4 gap-1.5 shadow-sm"
                      >
                        <Check className="h-4 w-4" /> Accept Order
                      </Button>
                    )}

                    {isFarmer && item.status === 'processing' && (
                      <Button
                        size="sm"
                        variant="primary"
                        isLoading={updatingItem === item.id}
                        onClick={() => handleItemTransition(item.id, 'shipped')}
                        className="rounded-full text-xs h-9 px-4 gap-1.5 shadow-sm"
                      >
                        <Truck className="h-4 w-4" /> Mark as Shipped
                      </Button>
                    )}

                    {/* Buyer Action Button */}
                    {!isFarmer && item.status === 'shipped' && (
                      <Button
                        size="sm"
                        variant="success"
                        isLoading={updatingItem === item.id}
                        onClick={() => handleItemTransition(item.id, 'delivered')}
                        className="rounded-full text-xs h-9 px-4 gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Confirm Received
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Order Status History Audit Trail */}
      {order.items.some((it) => it.status_history && it.status_history.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-surface border border-border-subtle p-6 sm:p-7 shadow-sm"
        >
          <div className="flex items-center gap-2 pb-4 border-b border-border-subtle mb-4">
            <Clock className="h-4 w-4 text-brand" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-secondary">
              Status Change History & Activity Log
            </h3>
          </div>

          <div className="space-y-3">
            {order.items.flatMap((it) =>
              (it.status_history || []).map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between text-xs p-3 rounded-xl bg-surface-elevated border border-border-subtle"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-brand shrink-0" />
                    <span>
                      Item <strong className="text-foreground">{it.product_name}</strong> transitioned from{' '}
                      <span className="capitalize font-semibold text-warning">{h.previous_status}</span> to{' '}
                      <span className="capitalize font-semibold text-success">{h.new_status}</span>
                      {h.updated_by_name && (
                        <span className="text-foreground-secondary"> by {h.updated_by_name}</span>
                      )}
                    </span>
                  </div>
                  <span className="text-foreground-secondary font-medium shrink-0 ml-4">
                    {fmtDate(h.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </Container>
  );
};

export default OrderDetail;

