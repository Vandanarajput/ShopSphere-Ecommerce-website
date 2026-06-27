import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, clearProduct } from '../features/products/productSlice';
import { addToCart } from '../features/cart/cartSlice';
import { addToWishlist } from '../features/wishlist/wishlistSlice';
import { ProductDetailSkeleton } from '../components/common/Skeleton';
import ProductReviews from '../components/product/ProductReviews';

const INK = '#1F1A14';
const GREEN = '#3D4D2E';
const CREAM = '#F7F2E8';
const CREAM_SOFT = '#FAF6EE';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading, error } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const [selectedImage, setSelectedImage] = useState(0);

  function handleAddToCart() {
    if (!user) return navigate('/login');
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  }
  function handleAddToWishlist() {
    if (!user) return navigate('/login');
    dispatch(addToWishlist(product._id));
  }

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => dispatch(clearProduct());
  }, [dispatch, id]);

  if (loading)
    return (
      <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <ProductDetailSkeleton />
        </div>
      </div>
    );
  if (error)
    return (
      <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)] py-20">
        <p className="text-center text-rose-500">{error}</p>
      </div>
    );
  if (!product) return null;

  const images = product.images || [];
  const activeImage = images[selectedImage]?.url;
  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;
  const inStock = product.stock > 0;
  const isLow = inStock && product.stock < 10;

  return (
    <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Breadcrumb */}
        <Link
          to="/products"
          style={{ color: GREEN }}
          className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition mb-8 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to products
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Images */}
          <div>
            <div
              style={{ backgroundColor: CREAM }}
              className="relative aspect-square rounded-3xl overflow-hidden border border-stone-200 shadow-sm"
            >
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-6"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-300">
                  <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs uppercase tracking-widest">No image</span>
                </div>
              )}

              {discount > 0 && (
                <div
                  style={{ backgroundColor: GREEN }}
                  className="absolute top-4 left-4 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow"
                >
                  {discount}% off
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    style={i === selectedImage ? { borderColor: GREEN } : {}}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                      i === selectedImage ? 'shadow-md' : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:py-2">
            {/* Brand */}
            <p
              style={{ color: GREEN }}
              className="text-xs uppercase tracking-[0.2em] font-semibold mb-3"
            >
              {product.brand}
            </p>

            {/* Name */}
            <h1
              style={{ color: INK }}
              className="font-serif font-bold text-3xl md:text-4xl leading-tight mb-4"
            >
              {product.name}
            </h1>

            {/* Rating */}
            {product.ratingAverage > 0 && (
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < Math.round(product.ratingAverage) ? '' : 'text-stone-300'}>
                      ★
                    </span>
                  ))}
                </div>
                <span style={{ color: INK }} className="text-sm font-semibold">
                  {product.ratingAverage.toFixed(1)}
                </span>
                <span className="text-sm text-stone-500">({product.ratingCount} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline flex-wrap gap-3 mb-2">
              <span style={{ color: INK }} className="text-4xl font-bold">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-stone-400 line-through text-lg">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                  <span
                    style={{ backgroundColor: CREAM, color: GREEN }}
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                  >
                    SAVE ₹{(product.mrp - product.price).toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-stone-500 mb-6">Inclusive of all taxes</p>

            {/* Stock status */}
            <div className="mb-6">
              {inStock ? (
                <div className="inline-flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-emerald-700 font-medium">
                    {isLow ? `Only ${product.stock} left in stock` : 'In stock'}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-rose-700 font-medium">Out of stock</span>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="space-y-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                style={{ backgroundColor: GREEN }}
                className="w-full text-white py-4 rounded-full font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button
                onClick={handleAddToWishlist}
                disabled={!inStock}
                style={{ borderColor: GREEN, color: GREEN }}
                className="w-full border-2 py-4 rounded-full font-semibold hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Add to Wishlist
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-8 pb-8 border-b border-stone-200">
              <div className="text-center">
                <div className="text-2xl mb-1">🚚</div>
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: INK }}>Free Delivery</p>
                <p className="text-[10px] text-stone-500">Above ₹499</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">↩️</div>
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: INK }}>Easy Returns</p>
                <p className="text-[10px] text-stone-500">7-day policy</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🔒</div>
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: INK }}>Secure Payment</p>
                <p className="text-[10px] text-stone-500">100% safe</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 style={{ color: INK }} className="font-serif font-bold text-xl mb-3">
                Description
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Meta */}
            {product.category && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-stone-500">Category:</span>
                <span
                  style={{ backgroundColor: CREAM, color: GREEN }}
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                >
                  {product.category.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <ProductReviews productId={product._id} />
      </div>
    </div>
  );
}
