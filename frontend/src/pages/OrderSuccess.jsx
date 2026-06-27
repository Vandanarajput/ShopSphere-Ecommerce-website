import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '../features/orders/orderSlice';
import { clearLastCreated } from '../features/orders/orderSlice';
import Loader from '../components/common/Loader';
import { formatDate } from '../utils/orderStatus';

const INK = '#1F1A14';
const GREEN = '#3D4D2E';
const CREAM = '#F7F2E8';
const CREAM_SOFT = '#FAF6EE';

export default function OrderSuccess() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderById(id));
    return () => dispatch(clearLastCreated());
  }, [id, dispatch]);

  if (loading || !current) {
    return (
      <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)] py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        {/* Hero — celebration */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div
              style={{ backgroundColor: GREEN }}
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-xl"
            >
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {/* Decorative dots */}
            <span className="absolute -top-2 -right-2 text-2xl">🎉</span>
            <span className="absolute -bottom-2 -left-2 text-xl">✨</span>
          </div>

          <p style={{ color: GREEN }} className="text-xs uppercase tracking-[0.25em] font-semibold mb-3">
            Order Confirmed
          </p>
          <h1 style={{ color: INK }} className="text-4xl md:text-5xl font-serif font-bold mb-3">
            Thank you for your order!
          </h1>
          <p className="text-stone-500 text-base max-w-md mx-auto">
            We've received your order and we'll send updates as it moves through delivery.
          </p>
        </div>

        {/* Order details card */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm">
          {/* Order number band */}
          <div
            style={{ backgroundColor: CREAM }}
            className="rounded-2xl p-5 mb-6 flex items-center justify-between flex-wrap gap-3"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-1">
                Order Number
              </p>
              <p style={{ color: INK }} className="font-mono font-bold text-lg">
                {current.orderNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-1">
                Placed on
              </p>
              <p style={{ color: INK }} className="text-sm font-medium">
                {formatDate(current.createdAt)}
              </p>
            </div>
          </div>

          {/* Order items preview */}
          {current.items?.length > 0 && (
            <div className="mb-6">
              <h2 style={{ color: INK }} className="font-serif font-bold text-lg mb-3">
                Items ({current.items.length})
              </h2>
              <div className="space-y-3">
                {current.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div
                      style={{ backgroundColor: CREAM }}
                      className="w-14 h-14 rounded-xl overflow-hidden shrink-0"
                    >
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 text-[10px]">—</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: INK }} className="font-medium text-sm line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span style={{ color: INK }} className="font-semibold text-sm whitespace-nowrap">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment & total */}
          <div className="border-t border-stone-200 pt-5 space-y-2 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Payment method</span>
              <span style={{ color: INK }} className="font-medium uppercase">
                {current.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Payment status</span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                  current.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {current.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-3 mt-3 border-t border-stone-200">
              <span style={{ color: INK }} className="font-serif font-bold text-lg">
                Total paid
              </span>
              <span style={{ color: INK }} className="font-bold text-2xl">
                ₹{current.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* What's next strip */}
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <NextStep icon="📧" title="Confirmation" desc="Order details sent to your email" />
          <NextStep icon="📦" title="Packing soon" desc="We'll prep your items for shipping" />
          <NextStep icon="🚚" title="On the way" desc="Tracking link arrives once shipped" />
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link
            to={`/orders/${current._id}`}
            style={{ backgroundColor: GREEN }}
            className="flex-1 text-white py-4 rounded-full text-center font-semibold hover:opacity-90 transition shadow-sm inline-flex items-center justify-center gap-2"
          >
            View Order Details <span aria-hidden>→</span>
          </Link>
          <Link
            to="/products"
            className="flex-1 border border-stone-300 bg-white text-stone-700 py-4 rounded-full text-center font-semibold hover:bg-stone-50 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

function NextStep({ icon, title, desc }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <p style={{ color: INK }} className="font-semibold text-sm mb-1">{title}</p>
      <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
    </div>
  );
}
