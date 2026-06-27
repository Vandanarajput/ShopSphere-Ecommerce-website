import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAllOrders, updateAdminOrderStatus } from '../../features/orders/orderSlice';
import Loader from '../../components/common/Loader';
import { formatDate } from '../../utils/orderStatus';

const INK = '#1F1A14';
const GREEN = '#3D4D2E';
const CREAM = '#F7F2E8';
const CREAM_SOFT = '#FAF6EE';

const STATUS_META = {
  pending:    { label: 'Pending',    dot: 'bg-amber-500',   pill: 'bg-amber-100 text-amber-800' },
  processing: { label: 'Processing', dot: 'bg-blue-500',    pill: 'bg-blue-100 text-blue-800' },
  shipped:    { label: 'Shipped',    dot: 'bg-indigo-500',  pill: 'bg-indigo-100 text-indigo-800' },
  delivered:  { label: 'Delivered',  dot: 'bg-emerald-500', pill: 'bg-emerald-100 text-emerald-800' },
  cancelled:  { label: 'Cancelled',  dot: 'bg-rose-500',    pill: 'bg-rose-100 text-rose-800' },
  refunded:   { label: 'Refunded',   dot: 'bg-stone-500',   pill: 'bg-stone-200 text-stone-700' },
  paid:       { label: 'Paid',       pill: 'bg-emerald-100 text-emerald-800' },
  failed:     { label: 'Failed',     pill: 'bg-rose-100 text-rose-800' },
};

// Allowed status transitions (mirrors backend STATUS_FLOW)
const NEXT_STATUS = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: ['refunded'],
  refunded: [],
};

function meta(status) {
  return STATUS_META[status] || { label: status, dot: 'bg-stone-400', pill: 'bg-stone-100 text-stone-700' };
}

export default function AdminOrders() {
  const dispatch = useDispatch();
  const { adminList: orders, adminLoading: loading, adminPagination: pagination } = useSelector((s) => s.orders);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    dispatch(fetchAllOrders(statusFilter ? { status: statusFilter, limit: 50 } : { limit: 50 }));
  }, [dispatch, statusFilter]);

  const stats = {
    total: pagination?.total ?? orders.length,
    pending: orders.filter((o) => o.orderStatus === 'pending').length,
    processing: orders.filter((o) => o.orderStatus === 'processing').length,
    shipped: orders.filter((o) => o.orderStatus === 'shipped').length,
    delivered: orders.filter((o) => o.orderStatus === 'delivered').length,
    revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
  };

  function handleStatusChange(orderId, newStatus) {
    if (!window.confirm(`Move this order to "${newStatus}"?`)) return;
    dispatch(updateAdminOrderStatus({ id: orderId, status: newStatus }));
  }

  return (
    <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Hero */}
        <div className="mb-8">
          <p style={{ color: GREEN }} className="text-xs uppercase tracking-[0.25em] font-medium mb-2">
            Admin
          </p>
          <h1 style={{ color: INK }} className="text-3xl md:text-4xl font-serif font-bold">
            Manage Orders
          </h1>
          <p className="text-sm text-stone-500 mt-2">
            View all customer orders and move them through fulfillment.
          </p>
        </div>

        {/* Admin nav tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Link
            to="/admin/products"
            className="shrink-0 px-5 py-2.5 rounded-full bg-white border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
          >
            📦 Products
          </Link>
          <button
            style={{ backgroundColor: GREEN, borderColor: GREEN }}
            className="shrink-0 px-5 py-2.5 rounded-full border text-sm font-semibold text-white shadow-sm"
          >
            🧾 Orders
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total orders" value={stats.total} highlight />
          <StatCard label="Pending" value={stats.pending} accent="amber" />
          <StatCard label="Processing" value={stats.processing} accent="blue" />
          <StatCard label="Shipped" value={stats.shipped} accent="indigo" />
          <StatCard label="Revenue" value={`₹${stats.revenue.toLocaleString('en-IN')}`} />
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => {
            const active = statusFilter === s;
            const label = s === '' ? 'All' : meta(s).label;
            return (
              <button
                key={s || 'all'}
                onClick={() => setStatusFilter(s)}
                style={active ? { backgroundColor: GREEN, borderColor: GREEN } : {}}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                  active
                    ? 'text-white shadow-sm'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Orders table */}
        {loading && orders.length === 0 ? (
          <div className="py-20"><Loader /></div>
        ) : orders.length === 0 ? (
          <div
            style={{ borderColor: 'rgba(61,77,46,0.15)' }}
            className="text-center py-20 px-8 rounded-3xl border-2 border-dashed bg-white/60"
          >
            <div className="text-6xl mb-4 opacity-70">📭</div>
            <h3 style={{ color: INK }} className="font-serif text-xl font-bold mb-2">
              No orders {statusFilter && `with status "${statusFilter}"`}
            </h3>
            <p className="text-stone-500 text-sm">
              {statusFilter ? 'Try a different filter.' : 'Orders will appear here when customers place them.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const expanded = expandedId === order._id;
              const orderMeta = meta(order.orderStatus);
              const payMeta = meta(order.paymentStatus);
              const transitions = NEXT_STATUS[order.orderStatus] || [];
              return (
                <div
                  key={order._id}
                  className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden"
                >
                  {/* Summary row */}
                  <div
                    onClick={() => setExpandedId(expanded ? null : order._id)}
                    className="p-5 cursor-pointer hover:bg-stone-50 transition flex items-center justify-between gap-4 flex-wrap"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div
                        style={{ backgroundColor: CREAM }}
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl"
                      >
                        {order.items?.[0]?.image ? (
                          <img src={order.items[0].image} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : '📦'}
                      </div>
                      <div className="min-w-0">
                        <p style={{ color: INK }} className="font-mono text-sm font-bold">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {order.user?.name || 'Guest'} · {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm text-stone-500">
                        {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                      </span>
                      <span style={{ color: INK }} className="font-bold text-lg">
                        ₹{order.total.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold capitalize ${orderMeta.pill}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${orderMeta.dot}`} />
                        {orderMeta.label}
                      </span>
                      <svg
                        className={`w-5 h-5 text-stone-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expanded && (
                    <div style={{ backgroundColor: CREAM_SOFT }} className="border-t border-stone-200 p-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Customer */}
                        <div>
                          <h4 className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-2">
                            Customer
                          </h4>
                          <p style={{ color: INK }} className="font-medium text-sm">
                            {order.user?.name || 'Unknown'}
                          </p>
                          <p className="text-stone-600 text-xs mt-0.5">{order.user?.email}</p>
                        </div>

                        {/* Shipping */}
                        <div>
                          <h4 className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-2">
                            Shipping to
                          </h4>
                          <p style={{ color: INK }} className="font-medium text-sm">
                            {order.shippingAddress?.fullName}
                          </p>
                          <p className="text-stone-600 text-xs mt-0.5 leading-snug">
                            {order.shippingAddress?.addressLine1}<br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} – {order.shippingAddress?.pincode}<br />
                            📞 {order.shippingAddress?.phone}
                          </p>
                        </div>

                        {/* Payment */}
                        <div>
                          <h4 className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-2">
                            Payment
                          </h4>
                          <p style={{ color: INK }} className="font-medium text-sm uppercase">
                            {order.paymentMethod}
                          </p>
                          <span
                            className={`inline-block mt-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${payMeta.pill}`}
                          >
                            {payMeta.label}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mt-6">
                        <h4 className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-3">
                          Items ({order.items?.length || 0})
                        </h4>
                        <div className="space-y-2">
                          {order.items?.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-stone-100">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                                {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p style={{ color: INK }} className="text-sm font-medium line-clamp-1">{item.name}</p>
                                <p className="text-xs text-stone-500">Qty {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                              </div>
                              <span style={{ color: INK }} className="font-semibold text-sm">
                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status actions */}
                      <div className="mt-6 pt-5 border-t border-stone-200">
                        <h4 className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-3">
                          Update Status
                        </h4>
                        {transitions.length === 0 ? (
                          <p className="text-sm text-stone-500 italic">
                            No further status changes available for "{order.orderStatus}".
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {transitions.map((nextStatus) => {
                              const m = meta(nextStatus);
                              const isCancel = nextStatus === 'cancelled';
                              return (
                                <button
                                  key={nextStatus}
                                  onClick={() => handleStatusChange(order._id, nextStatus)}
                                  style={isCancel ? {} : { backgroundColor: GREEN }}
                                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition shadow-sm inline-flex items-center gap-2 ${
                                    isCancel
                                      ? 'bg-white border border-rose-300 text-rose-600 hover:bg-rose-50'
                                      : 'text-white hover:opacity-90'
                                  }`}
                                >
                                  Move to {m.label} <span aria-hidden>→</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, highlight }) {
  const accentClass = {
    amber: 'text-amber-600',
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
  }[accent];
  return (
    <div
      className={`bg-white border border-stone-200 rounded-2xl p-4 ${highlight ? 'ring-2 ring-stone-200' : ''}`}
    >
      <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-1">{label}</p>
      <p
        style={!accentClass ? { color: INK } : {}}
        className={`font-serif font-bold text-xl md:text-2xl ${accentClass || ''}`}
      >
        {value}
      </p>
    </div>
  );
}
