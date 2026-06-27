import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../features/orders/orderSlice';
import { OrdersListSkeleton } from '../components/common/Skeleton';
import { formatDate } from '../utils/orderStatus';

const INK = '#1F1A14';
const GREEN = '#3D4D2E';
const CREAM = '#F7F2E8';
const CREAM_SOFT = '#FAF6EE';

const STATUS_META = {
  pending: { label: 'Pending', dot: 'bg-amber-500', pill: 'bg-amber-100 text-amber-800' },
  processing: { label: 'Processing', dot: 'bg-blue-500', pill: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Shipped', dot: 'bg-indigo-500', pill: 'bg-indigo-100 text-indigo-800' },
  delivered: { label: 'Delivered', dot: 'bg-emerald-500', pill: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Cancelled', dot: 'bg-rose-500', pill: 'bg-rose-100 text-rose-800' },
  refunded: { label: 'Refunded', dot: 'bg-stone-500', pill: 'bg-stone-200 text-stone-700' },
  paid: { label: 'Paid', dot: 'bg-emerald-500', pill: 'bg-emerald-100 text-emerald-800' },
  failed: { label: 'Failed', dot: 'bg-rose-500', pill: 'bg-rose-100 text-rose-800' },
};

function meta(status) {
  return STATUS_META[status] || { label: status, dot: 'bg-stone-400', pill: 'bg-stone-100 text-stone-700' };
}

export default function Orders() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) dispatch(fetchMyOrders());
  }, [dispatch, user]);

  if (!user) {
    return (
      <EmptyShell
        title="Sign in to view your orders"
        desc="Your order history will appear here once you log in."
        ctaText="Sign In"
        ctaTo="/login"
        icon="🔒"
      />
    );
  }

  if (loading && list.length === 0) {
    return (
      <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)]">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="mb-8">
            <div className="skeleton h-3 w-20 rounded mb-2" />
            <div className="skeleton h-9 w-56 rounded" />
          </div>
          <OrdersListSkeleton count={3} />
        </div>
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <EmptyShell
        title="No orders yet"
        desc="When you place your first order, it'll show up here."
        ctaText="Browse Products"
        ctaTo="/products"
        icon="📦"
      />
    );
  }

  const filters = [
    { key: 'all', label: 'All', count: list.length },
    { key: 'pending', label: 'Pending', count: list.filter((o) => o.orderStatus === 'pending').length },
    { key: 'processing', label: 'Processing', count: list.filter((o) => o.orderStatus === 'processing').length },
    { key: 'shipped', label: 'Shipped', count: list.filter((o) => o.orderStatus === 'shipped').length },
    { key: 'delivered', label: 'Delivered', count: list.filter((o) => o.orderStatus === 'delivered').length },
    { key: 'cancelled', label: 'Cancelled', count: list.filter((o) => o.orderStatus === 'cancelled').length },
  ].filter((f) => f.count > 0 || f.key === 'all');

  const filtered = filter === 'all' ? list : list.filter((o) => o.orderStatus === filter);
  const totalSpent = list.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Hero */}
        <div className="mb-8">
          <p style={{ color: GREEN }} className="text-xs uppercase tracking-[0.25em] font-medium mb-2">
            Account
          </p>
          <h1 style={{ color: INK }} className="text-3xl md:text-4xl font-serif font-bold">
            Your Orders
          </h1>
          <p className="text-sm text-stone-500 mt-2">
            Track and manage all your purchases in one place.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Total orders" value={list.length} />
          <StatCard
            label="Total spent"
            value={`₹${totalSpent.toLocaleString('en-IN')}`}
          />
          <StatCard
            label="Delivered"
            value={list.filter((o) => o.orderStatus === 'delivered').length}
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-2 px-2">
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={active ? { backgroundColor: GREEN, borderColor: GREEN } : {}}
                className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition ${
                  active
                    ? 'text-white shadow-sm'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                }`}
              >
                {f.label}
                <span
                  className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${
                    active ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Order list */}
        {filtered.length === 0 ? (
          <div
            style={{ borderColor: 'rgba(61,77,46,0.15)' }}
            className="text-center py-16 px-8 rounded-3xl border-2 border-dashed bg-white/60"
          >
            <div className="text-5xl mb-3 opacity-60">📋</div>
            <p style={{ color: INK }} className="font-serif font-bold text-lg mb-1">
              No {filter} orders
            </p>
            <p className="text-stone-500 text-sm">Try a different filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const orderMeta = meta(order.orderStatus);
              const payMeta = meta(order.paymentStatus);
              const firstItem = order.items?.[0];
              return (
                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  className="block bg-white border border-stone-200 rounded-3xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                >
                  {/* Top row: id + statuses */}
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-1">
                        Order
                      </p>
                      <p className="font-mono text-sm font-bold" style={{ color: INK }}>
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-stone-500 mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold capitalize ${orderMeta.pill}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${orderMeta.dot}`} />
                        {orderMeta.label}
                      </span>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                        Payment: <span className="font-semibold text-stone-600 normal-case">{payMeta.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Middle: item preview */}
                  <div className="flex items-center gap-4 py-3 border-y border-stone-100">
                    {firstItem?.image ? (
                      <img
                        src={firstItem.image}
                        alt=""
                        style={{ backgroundColor: CREAM }}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div
                        style={{ backgroundColor: CREAM }}
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-stone-300 text-xl shrink-0"
                      >
                        📦
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p style={{ color: INK }} className="text-sm font-medium line-clamp-1">
                        {firstItem?.name || '—'}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        {order.items.length > 1 && ` · +${order.items.length - 1} more`}
                      </p>
                    </div>
                  </div>

                  {/* Bottom row: total + cta */}
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-stone-400">
                        Total
                      </p>
                      <p style={{ color: INK }} className="font-bold text-xl">
                        ₹{order.total.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span
                      style={{ color: GREEN }}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all"
                    >
                      View details <span aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center">
      <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-1">{label}</p>
      <p style={{ color: INK }} className="font-serif font-bold text-xl md:text-2xl">
        {value}
      </p>
    </div>
  );
}

function EmptyShell({ title, desc, ctaText, ctaTo, icon }) {
  return (
    <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-16">
      <div
        style={{ borderColor: 'rgba(61,77,46,0.15)' }}
        className="text-center py-16 px-8 rounded-3xl border-2 border-dashed bg-white/60 max-w-md w-full"
      >
        <div className="text-6xl mb-4 opacity-70">{icon}</div>
        <h3 style={{ color: INK }} className="font-serif text-2xl font-bold mb-2">
          {title}
        </h3>
        <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">{desc}</p>
        <Link
          to={ctaTo}
          style={{ backgroundColor: GREEN }}
          className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition shadow-sm"
        >
          {ctaText} <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
