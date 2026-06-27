import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, cancelOrder } from '../features/orders/orderSlice';
import Loader from '../components/common/Loader';
import { formatDate } from '../utils/orderStatus';

const INK = '#1F1A14';
const GREEN = '#3D4D2E';
const CREAM = '#F7F2E8';
const CREAM_SOFT = '#FAF6EE';

const STATUS_PILL = {
  pending:    { label: 'Pending',    pill: 'bg-amber-100 text-amber-800',     dot: 'bg-amber-500' },
  processing: { label: 'Processing', pill: 'bg-blue-100 text-blue-800',       dot: 'bg-blue-500' },
  shipped:    { label: 'Shipped',    pill: 'bg-indigo-100 text-indigo-800',   dot: 'bg-indigo-500' },
  delivered:  { label: 'Delivered',  pill: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  cancelled:  { label: 'Cancelled',  pill: 'bg-rose-100 text-rose-800',       dot: 'bg-rose-500' },
  refunded:   { label: 'Refunded',   pill: 'bg-stone-200 text-stone-700',     dot: 'bg-stone-500' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  if (loading) {
    return (
      <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)] py-20">
        <Loader />
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)] py-20 text-center">
        <p className="text-rose-500">{error}</p>
      </div>
    );
  }
  if (!current) return null;

  const o = current;
  const canCancel = ['pending', 'processing'].includes(o.orderStatus);
  const statusMeta = STATUS_PILL[o.orderStatus] || STATUS_PILL.pending;
  const payMeta = o.paymentStatus === 'paid' ? STATUS_PILL.delivered : STATUS_PILL.pending;

  function handleCancel() {
    if (window.confirm('Cancel this order? Stock will be returned to inventory.')) {
      dispatch(cancelOrder(o._id));
    }
  }

  return (
    <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Breadcrumb */}
        <Link
          to="/orders"
          style={{ color: GREEN }}
          className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition mb-6 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to orders
        </Link>

        {/* Hero */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <p style={{ color: GREEN }} className="text-xs uppercase tracking-[0.25em] font-medium mb-2">
              Order Details
            </p>
            <h1 style={{ color: INK }} className="font-mono font-bold text-2xl md:text-3xl mb-1">
              {o.orderNumber}
            </h1>
            <p className="text-sm text-stone-500">Placed on {formatDate(o.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold capitalize ${statusMeta.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
              {statusMeta.label}
            </span>
            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold capitalize ${payMeta.pill}`}>
              Payment: {o.paymentStatus}
            </span>
          </div>
        </div>

        {/* ===== TRACKING TIMELINE ===== */}
        <OrderTimeline order={o} />

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items card */}
            <section className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
              <h2 style={{ color: INK }} className="font-serif font-bold text-xl mb-5">
                Items ({o.items.length})
              </h2>
              <div className="space-y-4">
                {o.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-4 pb-4 border-b border-stone-100 last:border-0 last:pb-0">
                    <div
                      style={{ backgroundColor: CREAM }}
                      className="w-16 h-16 rounded-xl overflow-hidden shrink-0"
                    >
                      {it.image ? (
                        <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 text-[10px] uppercase">No image</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: INK }} className="font-medium text-sm line-clamp-1">{it.name}</p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Qty {it.quantity} × ₹{it.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <p style={{ color: INK }} className="font-semibold text-base whitespace-nowrap">
                      ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Shipping address card */}
            <section className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
              <h2 style={{ color: INK }} className="font-serif font-bold text-xl mb-4">
                Shipping Address
              </h2>
              <div className="flex items-start gap-4">
                <div
                  style={{ backgroundColor: CREAM }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                >
                  📍
                </div>
                <div className="text-sm">
                  <p style={{ color: INK }} className="font-semibold mb-1">{o.shippingAddress.fullName}</p>
                  <p className="text-stone-600 leading-relaxed">
                    {o.shippingAddress.addressLine1}<br />
                    {o.shippingAddress.city}, {o.shippingAddress.state} – {o.shippingAddress.pincode}
                  </p>
                  <p className="text-stone-500 text-xs mt-2">📞 {o.shippingAddress.phone}</p>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT — totals + actions */}
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm lg:sticky lg:top-6">
              <h2 style={{ color: INK }} className="font-serif font-bold text-xl mb-5">
                Order Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span style={{ color: INK }} className="font-medium">₹{o.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {o.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-medium">− ₹{o.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Payment method</span>
                  <span style={{ color: INK }} className="font-medium uppercase">{o.paymentMethod}</span>
                </div>
                <div className="pt-4 mt-2 border-t border-stone-200 flex justify-between items-baseline">
                  <span style={{ color: INK }} className="font-serif font-bold text-lg">Total</span>
                  <span style={{ color: INK }} className="font-bold text-2xl">
                    ₹{o.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {canCancel && (
                <button
                  onClick={handleCancel}
                  className="w-full mt-6 border-2 border-rose-300 text-rose-600 py-3 rounded-full text-sm font-semibold hover:bg-rose-50 transition"
                >
                  Cancel Order
                </button>
              )}

              <p className="text-[11px] text-stone-500 text-center mt-3">
                Need help? Reach our support team
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Timeline component =====
function OrderTimeline({ order }) {
  const isCancelled = order.orderStatus === 'cancelled' || order.orderStatus === 'refunded';

  if (isCancelled) {
    return (
      <section className="bg-white border-2 border-rose-200 rounded-3xl p-6 md:p-8 shadow-sm mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl shrink-0">
            🚫
          </div>
          <div>
            <h2 className="text-rose-700 font-serif font-bold text-xl mb-1">
              Order {order.orderStatus === 'refunded' ? 'Refunded' : 'Cancelled'}
            </h2>
            <p className="text-rose-600 text-sm">
              {order.orderStatus === 'refunded'
                ? 'Your refund has been processed and stock returned to inventory.'
                : 'This order has been cancelled. Any reserved stock has been released.'}
            </p>
            <p className="text-stone-500 text-xs mt-2">
              Updated on {new Date(order.updatedAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Status flow: pending → processing → shipped → delivered
  const stages = [
    { key: 'pending',    label: 'Order Placed',  icon: '📝', desc: 'We received your order' },
    { key: 'processing', label: 'Processing',    icon: '📦', desc: 'Packing your items' },
    { key: 'shipped',    label: 'Shipped',       icon: '🚚', desc: 'On the way to you' },
    { key: 'delivered',  label: 'Delivered',     icon: '✅', desc: 'Enjoy your order!' },
  ];

  const currentIdx = stages.findIndex((s) => s.key === order.orderStatus);
  const completedThrough = currentIdx; // current stage is "active"

  return (
    <section className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm mb-6">
      <h2 style={{ color: INK }} className="font-serif font-bold text-xl mb-2">
        Track Your Order
      </h2>
      <p className="text-stone-500 text-sm mb-8">
        {stages[currentIdx]?.desc || 'Your order is being processed.'}
      </p>

      {/* Desktop: horizontal stepper */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress line — background */}
          <div className="absolute top-6 left-6 right-6 h-1 bg-stone-200 rounded-full" />
          {/* Progress line — filled */}
          <div
            style={{
              width: `calc(${(completedThrough / (stages.length - 1)) * 100}% - 0px)`,
              backgroundColor: GREEN,
            }}
            className="absolute top-6 left-6 h-1 rounded-full transition-all duration-700"
          />

          {/* Stage dots */}
          <div className="relative grid grid-cols-4 gap-2">
            {stages.map((stage, i) => {
              const isDone = i < completedThrough;
              const isActive = i === completedThrough;
              const isUpcoming = i > completedThrough;
              return (
                <div key={stage.key} className="flex flex-col items-center text-center">
                  <div
                    style={
                      isDone || isActive
                        ? { backgroundColor: GREEN, color: '#fff', borderColor: GREEN }
                        : {}
                    }
                    className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center text-xl shadow-sm transition-all duration-500 ${
                      isUpcoming
                        ? 'bg-stone-100 text-stone-300'
                        : isActive
                        ? 'ring-4 ring-stone-200 scale-110'
                        : ''
                    }`}
                  >
                    {isDone ? '✓' : stage.icon}
                  </div>
                  <p
                    style={isDone || isActive ? { color: INK } : {}}
                    className={`text-sm font-semibold mt-3 ${isUpcoming ? 'text-stone-400' : ''}`}
                  >
                    {stage.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${isUpcoming ? 'text-stone-300' : 'text-stone-500'}`}>
                    {stage.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile: vertical stepper */}
      <div className="md:hidden space-y-4">
        {stages.map((stage, i) => {
          const isDone = i < completedThrough;
          const isActive = i === completedThrough;
          const isUpcoming = i > completedThrough;
          const isLast = i === stages.length - 1;
          return (
            <div key={stage.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  style={isDone || isActive ? { backgroundColor: GREEN, color: '#fff' } : {}}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                    isUpcoming ? 'bg-stone-100 text-stone-300' : ''
                  } ${isActive ? 'ring-4 ring-stone-200' : ''}`}
                >
                  {isDone ? '✓' : stage.icon}
                </div>
                {!isLast && (
                  <div
                    style={isDone ? { backgroundColor: GREEN } : {}}
                    className={`w-0.5 flex-1 mt-2 ${isDone ? '' : 'bg-stone-200'}`}
                    aria-hidden
                  />
                )}
              </div>
              <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
                <p
                  style={isDone || isActive ? { color: INK } : {}}
                  className={`text-sm font-semibold ${isUpcoming ? 'text-stone-400' : ''}`}
                >
                  {stage.label}
                </p>
                <p className={`text-xs mt-0.5 ${isUpcoming ? 'text-stone-300' : 'text-stone-500'}`}>
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
