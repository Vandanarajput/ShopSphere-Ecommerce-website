import { Link } from 'react-router-dom';

const INK = '#1F1A14';
const GREEN = '#3D4D2E';
const CREAM = '#F7F2E8';

export default function ProductCard({ product }) {
  const image = product.images?.[0]?.url;
  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;
  const isOut = product.stock === 0;
  const isLow = product.stock > 0 && product.stock < 10;

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: CREAM }}>
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-300">
              <svg className="w-12 h-12 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] uppercase tracking-wider">No image</span>
            </div>
          )}

          {/* Discount badge */}
          {discount > 0 && !isOut && (
            <div
              style={{ backgroundColor: GREEN }}
              className="absolute top-3 left-3 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow"
            >
              {discount}% off
            </div>
          )}

          {/* Out of stock overlay */}
          {isOut && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-stone-900 text-white text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                Sold out
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Brand */}
          <p className="text-[10px] uppercase tracking-[0.15em] text-stone-400 mb-1.5 truncate">
            {product.brand}
          </p>

          {/* Name */}
          <h3
            style={{ color: INK }}
            className="font-serif text-sm font-semibold line-clamp-2 mb-3 min-h-[2.5rem] leading-snug group-hover:opacity-80 transition"
          >
            {product.name}
          </h3>

          {/* Price + rating row */}
          <div className="flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span style={{ color: INK }} className="font-bold text-base">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {discount > 0 && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {product.ratingAverage > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-amber-500">★</span>
                <span className="font-medium text-stone-700">{product.ratingAverage.toFixed(1)}</span>
                <span className="text-stone-400">({product.ratingCount})</span>
              </div>
            )}
          </div>

          {/* Low stock chip */}
          {isLow && (
            <p className="text-[11px] text-amber-700 font-medium mt-2">
              Only {product.stock} left
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
