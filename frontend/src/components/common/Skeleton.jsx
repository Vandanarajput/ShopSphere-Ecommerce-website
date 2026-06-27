// Reusable skeleton placeholders that match real content layout.
// All shimmer via the `.skeleton` class defined in index.css.

export function SkeletonBox({ className = '', style }) {
  return <div className={`skeleton rounded-xl ${className}`} style={style} />;
}

export function SkeletonText({ className = '', width = 'w-full' }) {
  return <div className={`skeleton rounded h-3 ${width} ${className}`} />;
}

export function SkeletonCircle({ size = 'w-12 h-12' }) {
  return <div className={`skeleton rounded-full ${size}`} />;
}

// ---- Product card skeleton (for ProductList grid) ----
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      <SkeletonBox className="aspect-square rounded-none" />
      <div className="p-4 space-y-2.5">
        <SkeletonText width="w-1/3" />
        <SkeletonText width="w-5/6" />
        <SkeletonText width="w-2/3" />
        <div className="flex items-end justify-between pt-1">
          <SkeletonText width="w-1/3" className="h-4" />
          <SkeletonText width="w-1/4" className="h-3" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ---- Product detail skeleton ----
export function ProductDetailSkeleton() {
  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
      <SkeletonBox className="aspect-square rounded-3xl" />
      <div className="space-y-4">
        <SkeletonText width="w-24" />
        <SkeletonText width="w-3/4" className="h-7" />
        <SkeletonText width="w-1/2" className="h-7" />
        <SkeletonText width="w-1/3" className="h-5 mt-3" />
        <SkeletonText width="w-1/2" className="h-9 mt-4" />
        <SkeletonBox className="h-14 rounded-full mt-6" />
        <SkeletonBox className="h-14 rounded-full" />
        <div className="grid grid-cols-3 gap-3 pt-6">
          <SkeletonBox className="h-16" />
          <SkeletonBox className="h-16" />
          <SkeletonBox className="h-16" />
        </div>
      </div>
    </div>
  );
}

// ---- Cart item skeleton ----
export function CartItemSkeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm flex gap-4">
      <SkeletonBox className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-3">
        <SkeletonText width="w-20" />
        <SkeletonText width="w-5/6" className="h-5" />
        <SkeletonText width="w-1/3" />
        <div className="flex justify-between pt-2">
          <SkeletonBox className="w-28 h-9 rounded-full" />
          <SkeletonText width="w-20" />
        </div>
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="space-y-4">
      <CartItemSkeleton />
      <CartItemSkeleton />
      <CartItemSkeleton />
    </div>
  );
}

// ---- Order row skeleton ----
export function OrderRowSkeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <SkeletonText width="w-16" />
          <SkeletonText width="w-40" />
          <SkeletonText width="w-32" />
        </div>
        <SkeletonBox className="w-24 h-7 rounded-full" />
      </div>
      <div className="flex items-center gap-4 py-3 border-y border-stone-100">
        <SkeletonBox className="w-14 h-14 rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonText width="w-3/4" />
          <SkeletonText width="w-1/4" />
        </div>
      </div>
      <div className="flex justify-between">
        <SkeletonText width="w-16" />
        <SkeletonText width="w-20" />
      </div>
    </div>
  );
}

export function OrdersListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <OrderRowSkeleton key={i} />
      ))}
    </div>
  );
}
