import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../features/cart/cartSlice';
import { CartSkeleton } from '../components/common/Skeleton';

const INK = '#1F1A14';
const GREEN = '#3D4D2E';
const CREAM = '#F7F2E8';
const CREAM_SOFT = '#FAF6EE';

export default function Cart() {
  const dispatch = useDispatch();
  const { items, subtotal, total, loading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) dispatch(fetchCart());
  }, [dispatch, user]);

  if (!user) {
    return (
      <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)]">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="text-6xl mb-4 opacity-70">🔐</div>
          <h2 style={{ color: INK }} className="font-serif text-2xl font-bold mb-2">
            Please login to view your cart
          </h2>
          <p className="text-stone-500 text-sm mb-6">Your saved items are waiting for you.</p>
          <Link
            to="/login"
            style={{ backgroundColor: GREEN }}
            className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition shadow-sm"
          >
            Login to continue
          </Link>
        </div>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-8">
            <div className="skeleton h-3 w-24 rounded mb-2" />
            <div className="skeleton h-9 w-64 rounded" />
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><CartSkeleton /></div>
            <div className="lg:col-span-1">
              <div className="skeleton h-80 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)]">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="text-6xl mb-4 opacity-70">🛒</div>
          <h2 style={{ color: INK }} className="font-serif text-3xl font-bold mb-2">
            Your cart is empty
          </h2>
          <p className="text-stone-500 text-sm mb-8 max-w-sm mx-auto">
            Looks like you haven't added anything yet. Let's find something you'll love.
          </p>
          <Link
            to="/products"
            style={{ backgroundColor: GREEN }}
            className="inline-flex items-center gap-2 text-white px-7 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition shadow-sm"
          >
            Browse products <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Hero */}
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <p style={{ color: GREEN }} className="text-xs uppercase tracking-[0.25em] font-medium mb-2">
              Your selection
            </p>
            <h1 style={{ color: INK }} className="text-3xl md:text-4xl font-serif font-bold">
              Shopping Cart
            </h1>
            <p className="text-sm text-stone-500 mt-2">
              {items.length} {items.length === 1 ? 'item' : 'items'} ready for checkout
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Remove all items from cart?')) dispatch(clearCart());
            }}
            className="text-sm text-rose-500 hover:text-rose-700 font-medium hover:underline"
          >
            Clear cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT: items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = item.product;
              const image = product?.images?.[0]?.url;
              const lineTotal = item.priceSnapshot * item.quantity;
              const outOfStock = product?.stock === 0;
              const overStock = item.quantity > (product?.stock || 0);
              const hasIssue = outOfStock || overStock;

              return (
                <div
                  key={item._id}
                  className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition flex gap-4"
                >
                  {/* Image */}
                  <Link
                    to={`/products/${product._id}`}
                    style={{ backgroundColor: CREAM }}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-stone-100"
                  >
                    {image ? (
                      <img src={image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 text-[10px] uppercase tracking-wider">
                        No image
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-stone-400 mb-1">
                          {product.brand}
                        </p>
                        <Link to={`/products/${product._id}`}>
                          <h3
                            style={{ color: INK }}
                            className="font-serif font-semibold text-base sm:text-lg line-clamp-2 hover:opacity-70 transition"
                          >
                            {product.name}
                          </h3>
                        </Link>
                        <p style={{ color: INK }} className="text-sm font-medium mt-1">
                          ₹{item.priceSnapshot.toLocaleString('en-IN')} each
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p style={{ color: INK }} className="font-bold text-lg">
                          ₹{lineTotal.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {hasIssue && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full w-fit">
                        <span>⚠️</span>
                        {outOfStock ? 'Out of stock' : `Only ${product.stock} left in stock`}
                      </div>
                    )}

                    {/* Actions row */}
                    <div className="flex items-center justify-between gap-3 mt-auto pt-3">
                      <div
                        style={{ backgroundColor: CREAM_SOFT }}
                        className="inline-flex items-center rounded-full border border-stone-200 overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            dispatch(updateCartItem({ productId: product._id, quantity: Math.max(1, item.quantity - 1) }))
                          }
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="w-9 h-9 flex items-center justify-center text-stone-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                          −
                        </button>
                        <span
                          style={{ color: INK }}
                          className="px-3 text-sm font-semibold min-w-[2rem] text-center select-none"
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            dispatch(updateCartItem({ productId: product._id, quantity: item.quantity + 1 }))
                          }
                          disabled={item.quantity >= (product?.stock || 0)}
                          aria-label="Increase quantity"
                          className="w-9 h-9 flex items-center justify-center text-stone-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => dispatch(removeFromCart(product._id))}
                        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-rose-600 font-medium transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a2 2 0 012-2h2a2 2 0 012 2v3" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Continue shopping link */}
            <Link
              to="/products"
              style={{ color: GREEN }}
              className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition mt-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Continue shopping
            </Link>
          </div>

          {/* RIGHT: summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm lg:sticky lg:top-6">
              <h2 style={{ color: INK }} className="font-serif font-bold text-xl mb-5">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                  <span style={{ color: INK }} className="font-medium">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Tax</span>
                  <span style={{ color: INK }} className="font-medium">Included</span>
                </div>

                <div className="pt-4 mt-2 border-t border-stone-200 flex justify-between items-baseline">
                  <span style={{ color: INK }} className="font-serif font-bold text-lg">
                    Total
                  </span>
                  <span style={{ color: INK }} className="font-bold text-2xl">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                style={{ backgroundColor: GREEN }}
                className="block text-center w-full text-white py-4 rounded-full font-semibold mt-6 hover:opacity-90 transition shadow-sm"
              >
                Proceed to Checkout →
              </Link>

              <p className="text-[11px] text-stone-500 text-center mt-3">
                Free returns within 7 days · Secure payment
              </p>

              {/* Trust row */}
              <div className="mt-5 pt-5 border-t border-stone-100 space-y-2 text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <span>🔒</span> <span>Secure 256-bit SSL checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>↩️</span> <span>7-day easy returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🚚</span> <span>Free delivery on all orders</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
