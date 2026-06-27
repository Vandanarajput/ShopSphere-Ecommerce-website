import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { resetCart } from '../../features/cart/cartSlice';
import { resetWishlist } from '../../features/wishlist/wishlistSlice';
import { fetchCategories, setFilters } from '../../features/products/productSlice';

const INK = '#1F1A14';
const GREEN = '#3D4D2E';
const CREAM = '#F7F2E8';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { categories } = useSelector((s) => s.products);
  const cartCount = useSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const wishlistCount = useSelector((s) => s.wishlist.products.length);

  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);

  useEffect(() => {
    if (!categories?.length) dispatch(fetchCategories());
  }, [dispatch, categories?.length]);

  function handleLogout() {
    dispatch(logout());
    dispatch(resetCart());
    dispatch(resetWishlist());
    setAcctOpen(false);
    navigate('/login');
  }

  function handleSearch(e) {
    e.preventDefault();
    const term = search.trim();
    dispatch(setFilters({ search: term, page: 1 }));
    navigate('/products');
    setMobileOpen(false);
  }

  function gotoCategory(id) {
    dispatch(setFilters({ category: id, page: 1, search: '' }));
    navigate('/products');
    setCatOpen(false);
    setMobileOpen(false);
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';

  return (
    <header className="sticky top-0 z-30 bg-white">
      {/* Main bar */}
      <div className="border-b border-stone-200">
        <div className="mx-auto max-w-7xl px-6 h-[72px] flex items-center gap-6">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 -ml-2 text-stone-700"
            aria-label="Open menu"
          >
            <IconMenu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: GREEN }}
            >
              S
            </span>
            <span
              className="text-2xl font-serif font-bold tracking-tight"
              style={{ color: INK }}
            >
              ShopSphere
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6 ml-2">
            <Link to="/" className="text-sm text-stone-700 hover:text-stone-950">Home</Link>

            {/* Categories dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <button className="text-sm text-stone-700 hover:text-stone-950 inline-flex items-center gap-1">
                Categories
                <IconChevron className="w-3.5 h-3.5" />
              </button>
              {catOpen && (
                <div className="absolute left-0 top-full pt-3 w-56">
                  <div className="bg-white rounded-xl shadow-lg ring-1 ring-stone-200 py-2">
                    {categories?.length ? (
                      categories.map((c) => (
                        <button
                          key={c._id}
                          onClick={() => gotoCategory(c._id)}
                          className="block w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                        >
                          {c.name}
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-2 text-xs text-stone-400">Loading…</p>
                    )}
                    <Link
                      to="/products"
                      onClick={() => setCatOpen(false)}
                      style={{ color: GREEN }}
                      className="block px-4 pt-2 pb-1 mt-1 text-xs font-medium border-t border-stone-100"
                    >
                      View all products →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/products" className="text-sm text-stone-700 hover:text-stone-950">Shop</Link>
            <a href="#contact" className="text-sm text-stone-700 hover:text-stone-950">Contact</a>
          </nav>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-auto"
          >
            <div className="relative w-full">
              <IconSearch className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for products, brands and more"
                className="w-full bg-stone-100 border border-transparent focus:bg-white focus:border-stone-300 rounded-full pl-10 pr-4 py-2.5 text-sm outline-none transition"
              />
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-1 md:gap-2 ml-auto">
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-full hover:bg-stone-100 transition"
              aria-label="Wishlist"
            >
              <IconHeart className="w-5 h-5 text-stone-700" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[10px] font-medium rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative p-2.5 rounded-full hover:bg-stone-100 transition"
              aria-label="Cart"
            >
              <IconBag className="w-5 h-5 text-stone-700" />
              {cartCount > 0 && (
                <span
                  className="absolute top-0.5 right-0.5 text-white text-[10px] font-medium rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center"
                  style={{ backgroundColor: GREEN }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account */}
            {user ? (
              <div
                className="relative"
                onMouseEnter={() => setAcctOpen(true)}
                onMouseLeave={() => setAcctOpen(false)}
              >
                <button
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-stone-100 transition"
                  aria-label="Account"
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    style={{ backgroundColor: GREEN }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <IconChevron className="w-3.5 h-3.5 text-stone-500 hidden md:block" />
                </button>
                {acctOpen && (
                  <div className="absolute right-0 top-full pt-2 w-72 z-40">
                    <div className="bg-white rounded-xl shadow-lg ring-1 ring-stone-200 overflow-hidden">
                      {/* Profile header */}
                      <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: CREAM }}>
                        <span
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                          style={{ backgroundColor: GREEN }}
                        >
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: INK }}>{user.name}</p>
                          <p className="text-xs text-stone-500 truncate">{user.email}</p>
                        </div>
                      </div>

                      {/* Account links */}
                      <div className="py-1">
                        <Link to="/profile" onClick={() => setAcctOpen(false)} className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">My Profile</Link>
                        <Link to="/orders" onClick={() => setAcctOpen(false)} className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">My Orders</Link>
                        <Link to="/wishlist" onClick={() => setAcctOpen(false)} className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">Wishlist</Link>
                        <Link to="/orders" onClick={() => setAcctOpen(false)} className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">Track Order</Link>
                        {isAdmin && (
                          <>
                            <Link
                              to="/admin/products"
                              onClick={() => setAcctOpen(false)}
                              className="block px-4 py-2 text-sm font-medium hover:bg-stone-50"
                              style={{ color: GREEN }}
                            >
                              Admin · Products
                            </Link>
                            <Link
                              to="/admin/orders"
                              onClick={() => setAcctOpen(false)}
                              className="block px-4 py-2 text-sm font-medium hover:bg-stone-50"
                              style={{ color: GREEN }}
                            >
                              Admin · Orders
                            </Link>
                          </>
                        )}
                      </div>

                      {/* Support / Help */}
                      <div className="px-4 py-3 border-t border-stone-100 space-y-1.5">
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-2">Need help?</p>
                        <a href="mailto:support@shopsphere.com" className="flex items-center gap-2 text-xs text-stone-600 hover:text-stone-900">
                          <IconMail className="w-3.5 h-3.5" style={{ color: GREEN }} />
                          support@shopsphere.com
                        </a>
                        <a href="tel:+918000000000" className="flex items-center gap-2 text-xs text-stone-600 hover:text-stone-900">
                          <IconPhone className="w-3.5 h-3.5" style={{ color: GREEN }} />
                          +91 80000 00000
                        </a>
                        <a href="#help" className="flex items-center gap-2 text-xs text-stone-600 hover:text-stone-900">
                          <IconHelp className="w-3.5 h-3.5" style={{ color: GREEN }} />
                          Help &amp; FAQ
                        </a>
                        <p className="text-[11px] text-stone-400 pt-1">🚚 Free shipping over ₹500</p>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 border-t border-stone-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <Link to="/login" className="text-sm text-stone-700 hover:text-stone-950 px-3 py-2">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm text-white px-5 py-2.5 rounded-full hover:opacity-90 transition"
                  style={{ backgroundColor: GREEN }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="md:hidden px-6 pb-3">
          <div className="relative">
            <IconSearch className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
              className="w-full bg-stone-100 rounded-full pl-10 pr-4 py-2.5 text-sm outline-none"
            />
          </div>
        </form>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 h-[60px] border-b border-stone-200">
              <span className="font-serif font-bold text-lg" style={{ color: INK }}>Menu</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-2">
                <IconClose className="w-5 h-5 text-stone-600" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3">
              <Link to="/" onClick={() => setMobileOpen(false)} className="block px-5 py-2.5 text-sm text-stone-700 hover:bg-stone-50">Home</Link>
              <Link to="/products" onClick={() => setMobileOpen(false)} className="block px-5 py-2.5 text-sm text-stone-700 hover:bg-stone-50">Shop</Link>
              <p className="px-5 pt-4 pb-2 text-[11px] uppercase tracking-widest text-stone-400 font-medium">Categories</p>
              {categories?.map((c) => (
                <button
                  key={c._id}
                  onClick={() => gotoCategory(c._id)}
                  className="block w-full text-left px-5 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
                >
                  {c.name}
                </button>
              ))}
              <div className="border-t border-stone-100 mt-3 pt-3">
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="block px-5 py-2.5 text-sm text-stone-700 hover:bg-stone-50">Wishlist ({wishlistCount})</Link>
                <Link to="/cart" onClick={() => setMobileOpen(false)} className="block px-5 py-2.5 text-sm text-stone-700 hover:bg-stone-50">Cart ({cartCount})</Link>
                <a href="#contact" onClick={() => setMobileOpen(false)} className="block px-5 py-2.5 text-sm text-stone-700 hover:bg-stone-50">Contact</a>
              </div>
            </nav>
            <div className="border-t border-stone-200 p-4" style={{ backgroundColor: CREAM }}>
              {user ? (
                <button onClick={handleLogout} className="w-full text-sm text-rose-600 py-2">Logout</button>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center text-sm py-2.5 rounded-full border border-stone-300 text-stone-700"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    style={{ backgroundColor: GREEN }}
                    className="flex-1 text-center text-sm py-2.5 rounded-full text-white"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------- Inline SVG icons ---------- */
function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function IconHeart(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function IconBag(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
function IconMenu(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function IconClose(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconChevron(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function IconMail(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}
function IconPhone(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function IconHelp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
