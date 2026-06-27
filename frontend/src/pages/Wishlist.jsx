import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice';
import { addToCart } from '../features/cart/cartSlice';
import Loader from '../components/common/Loader';

const INK = '#1F1A14';
const GREEN = '#3D4D2E';
const CREAM_SOFT = '#FAF6EE';

export default function Wishlist() {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) dispatch(fetchWishlist());
  }, [dispatch, user]);

  if (!user) {
    return (
      <EmptyShell
        title="Sign in to view your wishlist"
        desc="Save items you love and find them here anytime."
        ctaText="Sign In"
        ctaTo="/login"
        icon="🔒"
      />
    );
  }

  if (loading) return <Loader />;

  if (products.length === 0) {
    return (
      <EmptyShell
        title="Your wishlist is empty"
        desc="Save products you love to view them later."
        ctaText="Browse Products"
        ctaTo="/products"
        icon="❤️"
      />
    );
  }

  function handleMoveToCart(product) {
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
    dispatch(removeFromWishlist(product._id));
  }

  return (
    <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p style={{ color: GREEN }} className="text-xs uppercase tracking-[0.2em] font-medium mb-2">
            Saved for later
          </p>
          <h1 style={{ color: INK }} className="text-3xl md:text-4xl font-serif font-bold">
            Your Wishlist <span className="text-stone-400 text-2xl font-normal">({products.length})</span>
          </h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => {
            const image = product.images?.[0]?.url;
            const outOfStock = product.stock === 0;

            return (
              <div key={product._id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
                <Link to={`/products/${product._id}`}>
                  <div className="aspect-square bg-stone-100 overflow-hidden">
                    {image ? (
                      <img src={image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 text-sm">
                        No image
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <p className="text-xs text-stone-400 mb-1">{product.brand}</p>
                  <h3 className="text-sm font-medium line-clamp-2 mb-2 min-h-[2.5rem]" style={{ color: INK }}>
                    {product.name}
                  </h3>
                  <p className="font-bold mb-3" style={{ color: INK }}>
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>

                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={outOfStock}
                    style={{ backgroundColor: outOfStock ? '#a8a29e' : GREEN }}
                    className="w-full text-white py-2 rounded-full text-sm font-medium hover:opacity-90 disabled:cursor-not-allowed mb-2 transition"
                  >
                    {outOfStock ? 'Out of stock' : 'Move to cart'}
                  </button>
                  <button
                    onClick={() => dispatch(removeFromWishlist(product._id))}
                    className="w-full border border-stone-300 text-stone-600 py-2 rounded-full text-sm hover:bg-stone-50 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
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
