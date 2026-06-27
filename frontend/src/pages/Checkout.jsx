import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart } from '../features/cart/cartSlice';
import { addAddress, deleteAddress } from '../features/auth/authSlice';
import { createOrder, clearOrderError } from '../features/orders/orderSlice';
import FakePaymentModal from '../components/payment/FakePaymentModal';

const INK = '#1F1A14';
const GREEN = '#3D4D2E';
const CREAM = '#F7F2E8';
const CREAM_SOFT = '#FAF6EE';

const emptyAddress = {
  fullName: '', phone: '', addressLine1: '',
  city: '', state: '', pincode: '',
};

const inputCls =
  'w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm placeholder-stone-400 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition';

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items, subtotal, total } = useSelector((state) => state.cart);
  const { placing, error, lastCreated } = useSelector((state) => state.orders);

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState(null);

  useEffect(() => {
    if (user) dispatch(fetchCart());
    dispatch(clearOrderError());
  }, [dispatch, user]);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (user?.addresses?.length && !selectedAddressId) {
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddressId(def._id);
    }
    if (user?.addresses?.length === 0) {
      setShowNewAddress(true);
    }
  }, [user, selectedAddressId]);

  useEffect(() => {
    if (!lastCreated) return;
    // COD → straight to success page.
    // Online → open fake payment modal first, then navigate after success.
    if (lastCreated.paymentMethod === 'razorpay' && lastCreated.paymentStatus !== 'paid') {
      setPendingPaymentOrder(lastCreated);
    } else {
      navigate(`/order-success/${lastCreated._id}`);
    }
  }, [lastCreated, navigate]);

  if (!user) return null;

  if (items.length === 0 && !lastCreated) {
    return (
      <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)]">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="text-6xl mb-4 opacity-70">🛒</div>
          <h2 style={{ color: INK }} className="font-serif text-2xl font-bold mb-2">
            Your cart is empty
          </h2>
          <p className="text-stone-500 text-sm mb-6">
            Add some products before heading to checkout.
          </p>
          <Link
            to="/products"
            style={{ backgroundColor: GREEN }}
            className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition shadow-sm"
          >
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  async function handleAddAddress(e) {
    e.preventDefault();
    const result = await dispatch(addAddress(newAddress));
    if (result.meta.requestStatus === 'fulfilled') {
      const list = result.payload;
      const added = list[list.length - 1];
      setSelectedAddressId(added._id);
      setNewAddress(emptyAddress);
      setShowNewAddress(false);
    }
  }

  function handlePlaceOrder() {
    const address = user.addresses.find((a) => a._id === selectedAddressId);
    if (!address) return;
    dispatch(
      createOrder({
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          addressLine1: address.addressLine1,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
        paymentMethod,
      })
    );
  }

  return (
    <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Hero */}
        <div className="mb-8">
          <p style={{ color: GREEN }} className="text-xs uppercase tracking-[0.25em] font-medium mb-2">
            Almost there
          </p>
          <h1 style={{ color: INK }} className="text-3xl md:text-4xl font-serif font-bold">
            Checkout
          </h1>
          <p className="text-sm text-stone-500 mt-2">
            Review your order, choose delivery, and place it.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT: form sections */}
          <div className="lg:col-span-2 space-y-5">
            {/* Step 1 — Shipping address */}
            <Section
              step="1"
              title="Shipping address"
              action={
                !showNewAddress && (
                  <button
                    onClick={() => setShowNewAddress(true)}
                    style={{ color: GREEN }}
                    className="text-sm font-semibold hover:opacity-70 transition"
                  >
                    + Add new address
                  </button>
                )
              }
            >
              {user.addresses?.length > 0 && (
                <div className="space-y-3">
                  {user.addresses.map((a) => {
                    const isSelected = selectedAddressId === a._id;
                    return (
                      <label
                        key={a._id}
                        style={isSelected ? { borderColor: GREEN, backgroundColor: CREAM } : {}}
                        className={`flex gap-3 p-4 rounded-2xl border-2 cursor-pointer transition ${
                          isSelected ? 'shadow-sm' : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={isSelected}
                          onChange={() => setSelectedAddressId(a._id)}
                          className="mt-1 w-4 h-4 accent-stone-700"
                        />
                        <div className="flex-1 text-sm">
                          <p className="flex items-center gap-2 mb-1">
                            <span style={{ color: INK }} className="font-semibold">
                              {a.fullName}
                            </span>
                            {a.isDefault && (
                              <span
                                style={{ backgroundColor: GREEN }}
                                className="text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                              >
                                Default
                              </span>
                            )}
                          </p>
                          <p className="text-stone-600 leading-snug">
                            {a.addressLine1}, {a.city}, {a.state} – {a.pincode}
                          </p>
                          <p className="text-stone-500 text-xs mt-1">📞 {a.phone}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            dispatch(deleteAddress(a._id));
                            if (selectedAddressId === a._id) setSelectedAddressId('');
                          }}
                          className="text-xs text-rose-500 hover:text-rose-700 font-medium self-start"
                        >
                          Remove
                        </button>
                      </label>
                    );
                  })}
                </div>
              )}

              {showNewAddress && (
                <form
                  onSubmit={handleAddAddress}
                  className="mt-4 p-5 rounded-2xl border border-dashed bg-white"
                  style={{ borderColor: 'rgba(61,77,46,0.3)' }}
                >
                  <h3 style={{ color: INK }} className="font-serif font-bold mb-4">
                    New address
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      required
                      placeholder="Full name"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className={`${inputCls} col-span-2`}
                    />
                    <input
                      required
                      placeholder="Phone (10 digits)"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className={`${inputCls} col-span-2`}
                    />
                    <input
                      required
                      placeholder="Address line"
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                      className={`${inputCls} col-span-2`}
                    />
                    <input
                      required
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className={inputCls}
                    />
                    <input
                      required
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className={inputCls}
                    />
                    <input
                      required
                      placeholder="Pincode"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className={`${inputCls} col-span-2`}
                    />
                    <div className="col-span-2 flex gap-3 mt-2">
                      <button
                        type="submit"
                        style={{ backgroundColor: GREEN }}
                        className="text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition shadow-sm"
                      >
                        Save address
                      </button>
                      {user.addresses?.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowNewAddress(false)}
                          className="px-6 py-3 rounded-full border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </Section>

            {/* Step 2 — Payment */}
            <Section step="2" title="Payment method">
              <div className="space-y-3">
                <PaymentOption
                  selected={paymentMethod === 'cod'}
                  onSelect={() => setPaymentMethod('cod')}
                  icon="💵"
                  title="Cash on Delivery"
                  desc="Pay when the order arrives at your doorstep"
                />
                <PaymentOption
                  selected={paymentMethod === 'razorpay'}
                  onSelect={() => setPaymentMethod('razorpay')}
                  icon="💳"
                  title="Pay Online (Demo Gateway)"
                  desc="Cards · No real money charged · Test cards provided"
                />
              </div>
            </Section>

            {/* Step 3 — Review items */}
            <Section step="3" title={`Review items (${items.length})`}>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-stone-50"
                  >
                    <div
                      style={{ backgroundColor: CREAM }}
                      className="w-14 h-14 rounded-lg overflow-hidden shrink-0"
                    >
                      {item.product?.images?.[0]?.url ? (
                        <img
                          src={item.product.images[0].url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 text-[10px]">—</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: INK }} className="font-medium text-sm line-clamp-1">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Qty: {item.quantity} × ₹{item.priceSnapshot.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span style={{ color: INK }} className="font-semibold text-sm whitespace-nowrap">
                      ₹{(item.priceSnapshot * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* RIGHT: order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm lg:sticky lg:top-6">
              <h2 style={{ color: INK }} className="font-serif font-bold text-xl mb-5">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({items.length} items)</span>
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

              <button
                onClick={handlePlaceOrder}
                disabled={placing || !selectedAddressId || items.length === 0}
                style={{ backgroundColor: GREEN }}
                className="w-full text-white py-4 rounded-full font-semibold mt-6 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm inline-flex items-center justify-center gap-2"
              >
                {placing ? (
                  'Placing order…'
                ) : (
                  <>
                    Place Order
                    <span aria-hidden>→</span>
                  </>
                )}
              </button>

              {!selectedAddressId && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3 flex items-start gap-2">
                  <span aria-hidden>⚠️</span>
                  <span>Please select or add a shipping address above.</span>
                </p>
              )}

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

      {/* Fake payment modal — opens after order is created with online method */}
      {pendingPaymentOrder && (
        <FakePaymentModal
          order={pendingPaymentOrder}
          onSuccess={(updatedOrder) => {
            setPendingPaymentOrder(null);
            navigate(`/order-success/${updatedOrder._id}`);
          }}
          onCancel={() => {
            // User cancelled — keep them on checkout page; order stays unpaid in DB
            setPendingPaymentOrder(null);
            navigate(`/orders/${pendingPaymentOrder._id}`);
          }}
        />
      )}
    </div>
  );
}

function Section({ step, title, action, children }) {
  return (
    <section className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span
            style={{ backgroundColor: GREEN }}
            className="w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center shadow-sm"
          >
            {step}
          </span>
          <h2 style={{ color: INK }} className="font-serif font-bold text-xl">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function PaymentOption({ selected, onSelect, icon, title, desc }) {
  return (
    <label
      style={selected ? { borderColor: GREEN, backgroundColor: CREAM } : {}}
      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition ${
        selected ? 'shadow-sm' : 'border-stone-200 hover:border-stone-300 bg-white'
      }`}
    >
      <input
        type="radio"
        checked={selected}
        onChange={onSelect}
        className="w-4 h-4 accent-stone-700"
      />
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p style={{ color: INK }} className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
      </div>
    </label>
  );
}
