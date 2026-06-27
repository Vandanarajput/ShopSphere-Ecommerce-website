import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { payMockOrder } from '../../features/orders/orderSlice';

const INK = '#1F1A14';
const GREEN = '#3D4D2E';
const CREAM = '#F7F2E8';
const CREAM_SOFT = '#FAF6EE';

const TEST_SUCCESS = '4111 1111 1111 1111';
const TEST_FAIL = '4000 0000 0000 0002';

function formatCard(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + '/' + digits.slice(2);
}

export default function FakePaymentModal({ order, onSuccess, onCancel }) {
  const dispatch = useDispatch();

  const [cardNumber, setCardNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [step, setStep] = useState('form'); // form | processing | failed
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const cardDigits = cardNumber.replace(/\s/g, '');
  const isValid =
    cardDigits.length === 16 &&
    name.trim().length > 0 &&
    expiry.length === 5 &&
    cvv.length === 3;

  async function handlePay(e) {
    e.preventDefault();
    if (!isValid) return;

    setStep('processing');
    setErrorMsg(null);

    // Add a small realistic delay so the "processing" state is visible
    await new Promise((r) => setTimeout(r, 1500));

    const result = await dispatch(payMockOrder({ orderId: order._id, cardNumber: cardDigits }));
    if (result.meta.requestStatus === 'fulfilled') {
      onSuccess(result.payload);
    } else {
      setStep('failed');
      setErrorMsg(result.payload || 'Payment failed.');
    }
  }

  function fillTestCard(num) {
    setCardNumber(formatCard(num));
    setName('Vandana Rajput');
    setExpiry('12/28');
    setCvv('123');
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div
          style={{ backgroundColor: CREAM_SOFT }}
          className="p-5 border-b border-stone-200 flex items-center justify-between"
        >
          <div>
            <p style={{ color: GREEN }} className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-1">
              Secure Checkout · Demo
            </p>
            <h2 style={{ color: INK }} className="font-serif font-bold text-xl">
              Complete your payment
            </h2>
          </div>
          {step === 'form' && (
            <button
              onClick={onCancel}
              className="w-9 h-9 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 text-xl transition flex items-center justify-center"
              aria-label="Cancel payment"
            >
              ×
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {/* Amount */}
          <div
            style={{ backgroundColor: GREEN }}
            className="rounded-2xl p-5 text-white mb-5 relative overflow-hidden"
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/70 mb-2">Total to pay</p>
            <p className="font-bold text-3xl mb-1">₹{order.total.toLocaleString('en-IN')}</p>
            <p className="text-xs text-white/80">Order {order.orderNumber}</p>
          </div>

          {step === 'processing' ? (
            <ProcessingState amount={order.total} />
          ) : (
            <>
              {/* Test card helper */}
              <div className="mb-5 p-3 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-800">
                <p className="font-semibold mb-2 flex items-center gap-1.5">
                  <span>🧪</span> Test cards (no real money charged)
                </p>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => fillTestCard(TEST_SUCCESS)}
                    className="block w-full text-left px-2 py-1 rounded bg-white hover:bg-amber-100 border border-amber-100 transition"
                  >
                    <span className="text-emerald-700 font-bold">✓ Success card</span>
                    <span className="font-mono ml-2 text-stone-700">{TEST_SUCCESS}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillTestCard(TEST_FAIL)}
                    className="block w-full text-left px-2 py-1 rounded bg-white hover:bg-amber-100 border border-amber-100 transition"
                  >
                    <span className="text-rose-700 font-bold">✗ Failure card</span>
                    <span className="font-mono ml-2 text-stone-700">{TEST_FAIL}</span>
                  </button>
                </div>
              </div>

              {/* Inline error */}
              {errorMsg && step === 'failed' && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-start gap-2">
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handlePay} className="space-y-4">
                <Field label="Card number">
                  <div className="relative">
                    <input
                      required
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCard(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      className={inputCls + ' pl-12 font-mono tracking-wider'}
                      maxLength={19}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none">💳</span>
                  </div>
                </Field>

                <Field label="Name on card">
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VANDANA RAJPUT"
                    className={inputCls + ' uppercase'}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Expiry">
                    <input
                      required
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      className={inputCls + ' font-mono'}
                      maxLength={5}
                    />
                  </Field>
                  <Field label="CVV">
                    <input
                      required
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      placeholder="123"
                      className={inputCls + ' font-mono'}
                      maxLength={3}
                    />
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={!isValid}
                  style={{ backgroundColor: GREEN }}
                  className="w-full text-white py-4 rounded-full font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm inline-flex items-center justify-center gap-2"
                >
                  <span>🔒</span>
                  Pay ₹{order.total.toLocaleString('en-IN')}
                </button>

                <p className="text-[11px] text-stone-500 text-center pt-1">
                  This is a demo gateway — no real money is charged.
                  Your card details are NEVER stored.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ProcessingState({ amount }) {
  return (
    <div className="text-center py-10">
      <div className="relative inline-block mb-6">
        <div
          style={{ borderColor: GREEN }}
          className="w-16 h-16 border-4 border-stone-200 border-t-transparent rounded-full animate-spin"
        />
      </div>
      <p style={{ color: INK }} className="font-serif font-bold text-xl mb-2">
        Processing payment…
      </p>
      <p className="text-stone-500 text-sm mb-4">
        Securely charging ₹{amount.toLocaleString('en-IN')} to your card
      </p>
      <div className="flex items-center justify-center gap-2 text-xs text-stone-400">
        <span>🔒</span> Please don't close this window
      </div>
    </div>
  );
}

const inputCls =
  'w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm placeholder-stone-400 outline-none focus:bg-white focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
