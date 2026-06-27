import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser, registerUser, clearError } from '../features/auth/authSlice';

const INK = '#1F1A14';
const GREEN = '#3D4D2E';
const CREAM = '#F7F2E8';
const CREAM_SOFT = '#FAF6EE';

export default function Auth({ initialMode = 'login' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, user } = useSelector((s) => s.auth);

  const [mode, setMode] = useState(initialMode);
  const [showPwd, setShowPwd] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', phone: '' });

  // Keep mode in sync with URL changes (back/forward)
  useEffect(() => {
    setMode(location.pathname === '/register' ? 'register' : 'login');
  }, [location.pathname]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch, mode]);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  function switchMode(next) {
    if (next === mode) return;
    setMode(next);
    navigate(next === 'login' ? '/login' : '/register', { replace: true });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (mode === 'login') dispatch(loginUser(loginForm));
    else dispatch(registerUser(registerForm));
  }

  const perks = [
    'Free shipping on orders over ₹500',
    'Hand-picked, curated products',
    '30-day easy returns',
  ];

  return (
    <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 md:py-14">
        <div className="grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-xl bg-white">
          {/* LEFT — brand panel */}
          <div
            style={{ backgroundColor: GREEN }}
            className="relative hidden md:flex flex-col justify-between p-10 lg:p-12 text-white overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

            <div className="relative">
              <Link to="/" className="inline-flex items-center gap-2">
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: CREAM, color: GREEN }}
                >
                  S
                </span>
                <span className="text-xl font-serif font-bold">ShopSphere</span>
              </Link>
            </div>

            <div className="relative">
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/60 mb-4 font-medium">
                {mode === 'login' ? 'Welcome back' : 'Join the family'}
              </p>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold leading-[1.15] mb-5">
                {mode === 'login' ? (
                  <>Good to see you<br /><span className="italic font-normal text-white/85">again.</span></>
                ) : (
                  <>Everything you love,<br /><span className="italic font-normal text-white/85">in one place.</span></>
                )}
              </h2>
              <p className="text-white/75 text-sm leading-relaxed max-w-sm mb-8">
                {mode === 'login'
                  ? 'Pick up where you left off — your cart, wishlist and orders are waiting.'
                  : 'Create an account to save your favourites, track orders and unlock member perks.'}
              </p>

              <ul className="space-y-3">
                {perks.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-white/85">
                    <span
                      className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                    >
                      <CheckIcon className="w-3 h-3" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <p className="relative text-xs text-white/50">© {new Date().getFullYear()} ShopSphere. Made with care.</p>
          </div>

          {/* RIGHT — form panel */}
          <div className="p-7 sm:p-10 lg:p-12 flex flex-col justify-center">
            {/* Mobile logo */}
            <Link to="/" className="md:hidden inline-flex items-center gap-2 mb-8">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: GREEN }}
              >
                S
              </span>
              <span className="text-xl font-serif font-bold" style={{ color: INK }}>ShopSphere</span>
            </Link>

            {/* Heading */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-1" style={{ color: INK }}>
                {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
              </h1>
              <p className="text-sm text-stone-500">
                {mode === 'login'
                  ? 'Enter your credentials to continue shopping.'
                  : 'It takes less than a minute to get started.'}
              </p>
            </div>

            {/* Toggle pill */}
            <div
              className="relative grid grid-cols-2 p-1 rounded-full mb-6 text-sm font-medium"
              style={{ backgroundColor: CREAM }}
            >
              <span
                className="absolute top-1 bottom-1 w-1/2 rounded-full shadow-sm transition-transform duration-300 ease-out"
                style={{
                  backgroundColor: 'white',
                  transform: mode === 'register' ? 'translateX(100%)' : 'translateX(0)',
                }}
              />
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="relative z-10 py-2.5 rounded-full transition-colors"
                style={{ color: mode === 'login' ? GREEN : '#78716c' }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="relative z-10 py-2.5 rounded-full transition-colors"
                style={{ color: mode === 'register' ? GREEN : '#78716c' }}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <Field label="Full name">
                  <input
                    name="name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    placeholder="Jane Doe"
                    className={inputCls}
                  />
                </Field>
              )}

              <Field label="Email address">
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className={inputCls}
                  value={mode === 'login' ? loginForm.email : registerForm.email}
                  onChange={(e) =>
                    mode === 'login'
                      ? setLoginForm((f) => ({ ...f, email: e.target.value }))
                      : setRegisterForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </Field>

              <Field
                label="Password"
                hint={
                  mode === 'login' ? (
                    <a href="#" className="text-xs hover:underline" style={{ color: GREEN }}>
                      Forgot password?
                    </a>
                  ) : (
                    <span className="text-xs text-stone-400">Min 6 characters</span>
                  )
                }
              >
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    placeholder={mode === 'login' ? 'Your password' : 'Create a strong password'}
                    className={`${inputCls} pr-12`}
                    value={mode === 'login' ? loginForm.password : registerForm.password}
                    onChange={(e) =>
                      mode === 'login'
                        ? setLoginForm((f) => ({ ...f, password: e.target.value }))
                        : setRegisterForm((f) => ({ ...f, password: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              {mode === 'register' && (
                <Field label="Phone" hint={<span className="text-xs text-stone-400">optional, 10 digits</span>}>
                  <input
                    name="phone"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="9999999999"
                    className={inputCls}
                  />
                </Field>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: GREEN }}
                className="w-full text-white py-3 rounded-full text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition shadow-sm inline-flex items-center justify-center gap-2"
              >
                {loading
                  ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                  : (mode === 'login' ? 'Sign In' : 'Create Account')}
                {!loading && <span aria-hidden>→</span>}
              </button>
            </form>

            {/* Footer text */}
            <p className="text-center text-sm text-stone-500 mt-6">
              {mode === 'login' ? (
                <>Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    style={{ color: GREEN }}
                    className="font-semibold hover:underline"
                  >
                    Sign up free
                  </button>
                </>
              ) : (
                <>Already a member?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    style={{ color: GREEN }}
                    className="font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  'w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm placeholder-stone-400 outline-none focus:bg-white focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition';

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
          {label}
        </label>
        {hint}
      </div>
      {children}
    </div>
  );
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function EyeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.77 19.77 0 0 1 4.22-5.17" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.77 19.77 0 0 1-3.17 4.05" />
      <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
