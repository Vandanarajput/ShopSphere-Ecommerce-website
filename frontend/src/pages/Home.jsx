import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../features/products/productSlice';
import { addToCart } from '../features/cart/cartSlice';
import HeroCarousel from '../components/home/HeroCarousel';

// 🎨 EDIT THIS to change your homepage banners.
// Drop your images in `frontend/public/images/hero/` and reference as "/images/hero/foo.jpg"
// Each slide can use either `image` (real photo) OR `gradient` (fallback)
// 🎨 Hero carousel content. Drop images in `frontend/public/images/hero/` and reference them here.
const heroSlides = [
  {
    subtitle: 'New Collection',
    title: 'Discover your style',
    description: 'Premium products for every occasion.',
    cta: 'Shop Collection',
    ctaLink: '/products',
    cta2: 'Explore New Arrivals',
    cta2Link: '/products',
    image: '/images/hero/Hero.jpg',
    gradient: 'from-rose-100 to-amber-100',
  },
  {
    subtitle: 'Limited Time',
    title: 'Up to 50% off Electronics',
    description: 'Smart deals on phones, audio and more.',
    cta: 'Browse Deals',
    ctaLink: '/products',
    cta2: 'View All',
    cta2Link: '/products',
    image: '/images/hero/Hero1.jpg',  // 👈 your new file
    gradient: 'from-indigo-100 to-blue-200',
  },
  {
    subtitle: 'Trending Now',
    title: 'Books that change your day',
    description: 'New arrivals from your favorite authors.',
    cta: 'Explore Books',
    ctaLink: '/products',
    cta2: 'Best Sellers',
    cta2Link: '/products',
    image: '/images/hero/Hero2.jpg',  // 👈 your new outfit-flat-lay photo
    gradient: 'from-amber-100 to-orange-200',
  },
];

// Reusable color tokens to match the cream + sage theme
const C = {
  cream: '#F7F2E8',
  creamSoft: '#FAF6EE',
  green: '#3D4D2E',
  greenSoft: '#4F6135',
  text: '#1F2A1A',
};

// To add a photo for a category: drop it in `frontend/public/images/categories/`
// and reference its filename here as `image: '/images/categories/yourfile.jpg'`.
// If `image` is missing or fails to load, the emoji + gradient is used as a fallback.
const categoryVisuals = {
  Electronics: {
    emoji: '📱',
    bg: 'from-blue-100 to-indigo-200',
    image: '/images/categories/Electronic.jpg',
  },
  Clothing: {
    emoji: '👕',
    bg: 'from-rose-100 to-amber-100',
    image: '/images/categories/clothing.jpg',
  },
  Books: {
    emoji: '📚',
    bg: 'from-amber-100 to-orange-200',
    image: '/images/categories/Books.jpg',
  },
  'Home & Kitchen': {
    emoji: '🍳',
    bg: 'from-stone-100 to-yellow-100',
    image: '/images/categories/home.jpg',
  },
  Sports: {
    emoji: '🏃‍♂️',
    bg: 'from-emerald-100 to-teal-200',
    image: '/images/categories/sports.jpg',
  },
};

export default function Home() {
  const dispatch = useDispatch();
  const { categories, items: products } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchCategories());
    // Fetch a larger pool so we can derive both "Best Sellers" and "Trending Deals" client-side.
    dispatch(fetchProducts({ limit: 20, sort: '-createdAt' }));
  }, [dispatch]);

  return (
    <div style={{ backgroundColor: C.creamSoft }}>
      <section style={{ backgroundColor: C.cream }}>
        <div className="mx-auto max-w-7xl px-6 py-8">
          <HeroCarousel slides={heroSlides} interval={3000} />
        </div>
      </section>
      <CategoryShowcase categories={categories} />
      <TrendingDeals products={products} user={user} dispatch={dispatch} />
      <BestSellers products={products} user={user} dispatch={dispatch} />
    </div>
  );
}

// ---------- HERO ----------
function HeroSection() {
  return (
    <section style={{ backgroundColor: C.cream }} className="overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1
            style={{ color: C.text }}
            className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6"
          >
            Everything you love.<br />
            Delivered to you.
          </h1>
          <p className="text-stone-600 text-lg mb-8 max-w-md">
            Quality products across electronics, fashion, books, home essentials and more —
            curated for everyday life.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/products"
              style={{ backgroundColor: C.green }}
              className="text-white px-7 py-3 rounded-full font-medium hover:opacity-90 transition"
            >
              Shop Now
            </Link>
            <Link
              to="/products"
              style={{ color: C.green }}
              className="px-7 py-3 rounded-full font-medium hover:underline inline-flex items-center gap-2"
            >
              Explore Categories →
            </Link>
          </div>
        </div>

        {/* Visual block on right */}
        <div className="relative">
          <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-stone-200 to-stone-300 rounded-3xl flex items-center justify-center relative overflow-hidden shadow-lg">
            <div className="text-9xl">🛍️</div>
            <div className="absolute top-6 right-6 bg-white px-3 py-1 rounded-full text-xs font-medium shadow">
              Free shipping
            </div>
            <div
              className="absolute bottom-6 left-6 px-4 py-2 rounded-full text-xs font-medium text-white shadow"
              style={{ backgroundColor: C.green }}
            >
              30-day returns
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- FEATURE BADGES ----------
function FeatureBadges() {
  const features = [
    { icon: '🌿', title: 'Curated Quality', desc: 'Hand-picked products' },
    { icon: '⚡', title: 'Fast Delivery', desc: '3-5 business days' },
    { icon: '🛡️', title: 'Safe Payments', desc: '100% protected' },
    { icon: '♻️', title: 'Easy Returns', desc: '30-day policy' },
  ];
  return (
    <section style={{ backgroundColor: C.cream }} className="border-y border-stone-200">
      <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {features.map((f) => (
          <div key={f.title} className="text-center">
            <div className="text-3xl mb-2">{f.icon}</div>
            <p style={{ color: C.text }} className="font-semibold text-sm">
              {f.title}
            </p>
            <p className="text-xs text-stone-500 mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- PROMO STRIP ----------
function PromoStrip() {
  const items = [
    { icon: '🚚', title: 'Free Shipping', desc: 'On all orders over ₹500' },
    { icon: '↩️', title: '30-Day Returns', desc: 'Love it or return it' },
    { icon: '🔒', title: 'Secure Checkout', desc: '100% protected payments' },
  ];
  return (
    <section style={{ backgroundColor: C.green }}>
      <div className="mx-auto max-w-7xl px-6 py-7 grid md:grid-cols-3 gap-6">
        {items.map((it) => (
          <div key={it.title} className="flex items-center gap-3 text-white">
            <div className="text-2xl">{it.icon}</div>
            <div>
              <p className="font-semibold text-sm">{it.title}</p>
              <p className="text-xs text-white/80">{it.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- CATEGORY SHOWCASE ----------
function CategoryShowcase({ categories }) {
  if (!categories?.length) return null;

  const [featured, ...rest] = categories;
  const featuredVisual = categoryVisuals[featured.name] || { emoji: '✨', bg: 'from-stone-100 to-stone-200' };

  return (
    <section style={{ backgroundColor: C.creamSoft }}>
      <div className="mx-auto max-w-7xl px-6 py-20">
        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div className="max-w-xl">
            <p style={{ color: C.green }} className="text-xs uppercase tracking-[0.2em] font-medium mb-3">
              Explore
            </p>
            <h2
              style={{ color: C.text }}
              className="text-3xl md:text-5xl font-serif font-bold leading-tight"
            >
              Shop by Category
            </h2>
            <p className="text-stone-600 text-sm md:text-base mt-3">
              Everything you need for everyday essentials and special moments.
            </p>
          </div>
          <Link
            to="/products"
            style={{ borderColor: C.green, color: C.green }}
            className="text-sm font-medium px-5 py-2.5 rounded-full border hover:bg-white transition inline-flex items-center gap-2"
          >
            View All Products
            <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Bento grid: 1 featured + rest */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          <FeaturedCategoryCard category={featured} visual={featuredVisual} />
          {rest.map((cat) => (
            <CategoryCard key={cat._id} category={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCategoryCard({ category, visual }) {
  return (
    <Link
      to={`/products?category=${category._id}`}
      className="group relative col-span-2 row-span-2 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
    >
      {/* Background: real image if present, else gradient + emoji */}
      {visual.image ? (
        <img
          src={visual.image}
          alt={category.name}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
      ) : (
        <>
          <div className={`absolute inset-0 bg-gradient-to-br ${visual.bg}`} />
          <div className="absolute inset-0 flex items-center justify-center text-[10rem] md:text-[14rem] opacity-90 group-hover:scale-110 transition-transform duration-700">
            {visual.emoji}
          </div>
        </>
      )}
      {/* Dark gradient for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="relative aspect-square md:aspect-auto md:min-h-[420px] flex flex-col justify-end p-6 md:p-8">
        <span className="inline-block w-fit text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full bg-white/90 text-stone-700 mb-3">
          Featured
        </span>
        <h3 className="text-white font-serif text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
          {category.name}
        </h3>
        <p className="text-white/95 text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all drop-shadow">
          Shop the collection <span aria-hidden>→</span>
        </p>
      </div>
    </Link>
  );
}

function CategoryCard({ category }) {
  const visual = categoryVisuals[category.name] || { emoji: '✨', bg: 'from-stone-100 to-stone-200' };
  return (
    <Link
      to={`/products?category=${category._id}`}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div className={`relative aspect-square overflow-hidden bg-gradient-to-br ${visual.bg}`}>
        {visual.image ? (
          <img
            src={visual.image}
            alt={category.name}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-500">
            {visual.emoji}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 style={{ color: C.text }} className="font-serif text-base font-semibold mb-1">
          {category.name}
        </h3>
        <p style={{ color: C.green }} className="text-xs inline-flex items-center gap-1 group-hover:gap-2 transition-all">
          Shop Now <span aria-hidden>→</span>
        </p>
      </div>
    </Link>
  );
}

// ---------- TRENDING DEALS ----------
// Real data: shows the top products with the biggest % discount (mrp vs price).
// Driven entirely by the products already fetched — no fake content.
function TrendingDeals({ products, user, dispatch }) {
  const handleAdd = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    dispatch(addToCart({ productId, quantity: 1 }));
  };

  const deals = (products || [])
    .filter((p) => p.mrp && p.mrp > p.price)
    .map((p) => ({
      ...p,
      discountPct: Math.round(((p.mrp - p.price) / p.mrp) * 100),
      savings: p.mrp - p.price,
    }))
    .sort((a, b) => b.discountPct - a.discountPct)
    .slice(0, 4);

  if (deals.length === 0) return null;

  const topDeal = deals[0];

  return (
    <section style={{ backgroundColor: C.creamSoft }}>
      <div className="mx-auto max-w-7xl px-6 pb-20">
        <div
          style={{ backgroundColor: C.green }}
          className="relative rounded-3xl overflow-hidden shadow-lg"
        >
          {/* Decorative glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />

          <div className="relative grid md:grid-cols-5 gap-8 p-8 md:p-14 items-center">
            {/* Left: pitch */}
            <div className="md:col-span-2 text-white">
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/60 mb-4 font-medium">
                Limited Time
              </p>
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-5 leading-[1.1]">
                Trending<br />
                <span className="italic font-normal text-white/90">deals today.</span>
              </h2>
              <p className="text-white/75 text-sm md:text-base mb-3 max-w-md leading-relaxed">
                Up to <span className="font-bold text-white">{topDeal.discountPct}% off</span> on the most-loved picks. Grab them while they last.
              </p>
              <p className="text-white/60 text-xs mb-7">
                Prices auto-update from the live catalog.
              </p>
              <Link
                to="/products?sort=-price"
                style={{ color: C.green }}
                className="inline-flex items-center gap-2 bg-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-stone-100 transition shadow-md"
              >
                Shop Deals <span aria-hidden>→</span>
              </Link>
            </div>

            {/* Right: real deal cards */}
            <div className="md:col-span-3 grid sm:grid-cols-2 gap-4">
              {deals.map((p) => (
                <Link
                  key={p._id}
                  to={`/products/${p._id}`}
                  className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 hover:bg-white/20 transition flex gap-4 group"
                >
                  <div
                    className="w-20 h-20 rounded-xl overflow-hidden shrink-0"
                    style={{ backgroundColor: C.cream }}
                  >
                    {p.images?.[0]?.url ? (
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-stone-300">
                        {categoryVisuals[p.category?.name]?.emoji || '🛒'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-[10px] uppercase tracking-wider text-white/60">
                        {p.brand}
                      </p>
                      <span
                        style={{ backgroundColor: C.cream, color: C.green }}
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                      >
                        {p.discountPct}% off
                      </span>
                    </div>
                    <p className="text-white font-serif font-semibold text-sm line-clamp-2 mb-2 leading-tight">
                      {p.name}
                    </p>
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-1.5 min-w-0">
                        <span className="text-white font-bold text-base">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-white/50 text-xs line-through">
                          ₹{p.mrp.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleAdd(e, p._id)}
                        style={{ backgroundColor: C.cream, color: C.green }}
                        className="w-8 h-8 rounded-full text-lg flex items-center justify-center hover:scale-110 transition shadow-sm shrink-0"
                        title="Add to cart"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- BEST SELLERS ----------
function BestSellers({ products, user, dispatch }) {
  const handleAdd = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    dispatch(addToCart({ productId, quantity: 1 }));
  };

  return (
    <section style={{ backgroundColor: C.creamSoft }} className="pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <p style={{ color: C.green }} className="text-xs uppercase tracking-[0.2em] font-medium mb-3">
              Trending Now
            </p>
            <h2 style={{ color: C.text }} className="text-3xl md:text-5xl font-serif font-bold">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/products"
            style={{ borderColor: C.green, color: C.green }}
            className="text-sm font-medium px-5 py-2.5 rounded-full border hover:bg-white transition inline-flex items-center gap-2"
          >
            View All <span aria-hidden>→</span>
          </Link>
        </div>

        {products.length === 0 ? (
          <div
            style={{ borderColor: 'rgba(61,77,46,0.15)' }}
            className="text-center py-20 px-6 rounded-3xl border-2 border-dashed bg-white/40"
          >
            <div className="text-6xl mb-4 opacity-60">🛍️</div>
            <h3 style={{ color: C.text }} className="font-serif text-xl font-semibold mb-2">
              Fresh picks coming soon
            </h3>
            <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">
              We're curating the best products for you. Check back shortly or browse our full catalog.
            </p>
            <Link
              to="/products"
              style={{ backgroundColor: C.green }}
              className="inline-flex items-center gap-2 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition"
            >
              Browse Catalog <span aria-hidden>→</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.slice(0, 8).map((p, i) => (
              <Link
                key={p._id}
                to={`/products/${p._id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group relative"
              >
                {i === 0 && (
                  <span
                    className="absolute top-3 left-3 z-10 px-2 py-1 rounded text-xs font-medium bg-stone-100 text-stone-700"
                  >
                    Bestseller
                  </span>
                )}
                {i === 1 && (
                  <span
                    className="absolute top-3 right-3 z-10 px-2 py-1 rounded text-xs font-medium border bg-white text-stone-700"
                  >
                    New
                  </span>
                )}

                <div className="aspect-square bg-stone-100 overflow-hidden">
                  {p.images?.[0]?.url ? (
                    <img
                      src={p.images[0].url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-stone-100 to-stone-200">
                      {categoryVisuals[p.category?.name]?.emoji || '🛒'}
                    </div>
                  )}
                </div>

                <div className="p-4 relative">
                  <h3
                    style={{ color: C.text }}
                    className="font-serif font-semibold text-sm line-clamp-2 mb-2 min-h-[2.5rem]"
                  >
                    {p.name}
                  </h3>
                  <p className="text-xs text-amber-500 mb-2">
                    ★★★★☆{' '}
                    <span className="text-stone-400">
                      ({p.ratingCount || Math.floor(Math.random() * 200) + 50})
                    </span>
                  </p>
                  <div className="flex items-end justify-between">
                    <span style={{ color: C.text }} className="font-bold text-lg">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={(e) => handleAdd(e, p._id)}
                      style={{ backgroundColor: C.green }}
                      className="w-9 h-9 rounded-full text-white text-xl flex items-center justify-center hover:opacity-90"
                      title="Add to cart"
                    >
                      +
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
