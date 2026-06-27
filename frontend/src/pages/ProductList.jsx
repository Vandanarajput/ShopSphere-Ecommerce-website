import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories, setFilters, setPage } from '../features/products/productSlice';
import ProductCard from '../components/product/ProductCard';
import Pagination from '../components/common/Pagination';
import { ProductGridSkeleton } from '../components/common/Skeleton';

const INK = '#1F1A14';
const GREEN = '#3D4D2E';
const CREAM_SOFT = '#FAF6EE';
const CREAM = '#F7F2E8';

export default function ProductList() {
  const dispatch = useDispatch();
  const { items, pagination, loading, error, filters, categories } = useSelector(
    (state) => state.products
  );

  const [searchInput, setSearchInput] = useState(filters.search);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Sync URL query params (?category=, ?search=, ?sort=) into Redux filters.
  // Runs whenever the URL changes so navigating from Home category cards works.
  useEffect(() => {
    const urlCategory = searchParams.get('category') || '';
    const urlSearch = searchParams.get('search') || '';
    const urlSort = searchParams.get('sort') || '';
    const next = {};
    if (urlCategory !== filters.category) next.category = urlCategory;
    if (urlSearch !== filters.search) {
      next.search = urlSearch;
      setSearchInput(urlSearch);
    }
    if (urlSort && urlSort !== filters.sort) next.sort = urlSort;
    if (Object.keys(next).length > 0) {
      dispatch(setFilters(next));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, dispatch]);

  useEffect(() => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== null)
    );
    dispatch(fetchProducts(cleanFilters));
  }, [dispatch, filters]);

  function handleSearch(e) {
    e.preventDefault();
    dispatch(setFilters({ search: searchInput }));
  }

  const activeCount = [
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.inStock,
    filters.search,
  ].filter(Boolean).length;

  function clearAll() {
    setSearchInput('');
    dispatch(setFilters({ search: '', category: '', minPrice: '', maxPrice: '', inStock: '' }));
  }

  const inputCls =
    'w-full bg-white border border-stone-200 rounded-full px-5 py-3 text-sm placeholder-stone-400 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition';

  const selectCls =
    'w-full bg-white border border-stone-200 rounded-full pl-5 pr-10 py-3 text-sm text-stone-700 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition appearance-none cursor-pointer';

  return (
    <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Hero */}
        <div className="mb-8">
          <p style={{ color: GREEN }} className="text-xs uppercase tracking-[0.25em] font-medium mb-3">
            Catalog
          </p>
          <h1 style={{ color: INK }} className="text-4xl md:text-5xl font-serif font-bold mb-2">
            Discover Products
          </h1>
          <p className="text-stone-500 text-sm">
            Curated picks across every category. Filter, sort, and find what you love.
          </p>
        </div>

        {/* Search + Sort bar */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-4 md:p-5 mb-5">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <svg
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products, brands, categories…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className={`${inputCls} pl-12`}
                />
              </div>
              <button
                type="submit"
                style={{ backgroundColor: GREEN }}
                className="text-white px-7 rounded-full text-sm font-semibold hover:opacity-90 transition shadow-sm whitespace-nowrap"
              >
                Search
              </button>
            </form>

            {/* Sort */}
            <div className="relative lg:w-56">
              <select
                value={filters.sort}
                onChange={(e) => dispatch(setFilters({ sort: e.target.value }))}
                className={selectCls}
              >
                <option value="-createdAt">Newest first</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-ratingAverage">Top rated</option>
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Filter toggle */}
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-50 transition whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 12h12M10 20h4" />
              </svg>
              Filters
              {activeCount > 0 && (
                <span style={{ backgroundColor: GREEN }} className="text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {/* Expandable filter panel */}
          {showFilters && (
            <div className="mt-5 pt-5 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={filters.category}
                    onChange={(e) => dispatch(setFilters({ category: e.target.value }))}
                    className={selectCls}
                  >
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Min price */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  Min price (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => dispatch(setFilters({ minPrice: e.target.value }))}
                  className={inputCls}
                />
              </div>

              {/* Max price */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  Max price (₹)
                </label>
                <input
                  type="number"
                  placeholder="10000"
                  value={filters.maxPrice}
                  onChange={(e) => dispatch(setFilters({ maxPrice: e.target.value }))}
                  className={inputCls}
                />
              </div>

              {/* In stock toggle */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  Availability
                </label>
                <label
                  className="flex items-center gap-3 px-5 py-3 rounded-full border border-stone-200 bg-white cursor-pointer hover:bg-stone-50 transition"
                >
                  <input
                    type="checkbox"
                    checked={filters.inStock === 'true'}
                    onChange={(e) => dispatch(setFilters({ inStock: e.target.checked ? 'true' : '' }))}
                    className="w-4 h-4 rounded accent-stone-700"
                  />
                  <span className="text-sm text-stone-700">In stock only</span>
                </label>
              </div>

              {activeCount > 0 && (
                <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                  <button
                    onClick={clearAll}
                    className="text-sm text-rose-500 hover:text-rose-700 font-medium hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results summary */}
        {pagination && !loading && items.length > 0 && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-stone-500">
              Showing <span className="font-semibold" style={{ color: INK }}>{items.length}</span> of{' '}
              <span className="font-semibold" style={{ color: INK }}>{pagination.total}</span> products
            </p>
            {filters.search && (
              <p className="text-sm text-stone-500">
                Results for <span className="font-medium" style={{ color: INK }}>"{filters.search}"</span>
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl mb-5">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && items.length === 0 && <ProductGridSkeleton count={8} />}

        {/* Empty state */}
        {!loading && items.length === 0 && (
          <div
            style={{ borderColor: 'rgba(61,77,46,0.15)' }}
            className="text-center py-20 px-8 rounded-3xl border-2 border-dashed bg-white/60"
          >
            <div className="text-6xl mb-4 opacity-70">🔍</div>
            <h3 style={{ color: INK }} className="font-serif text-xl font-bold mb-2">
              No products found
            </h3>
            <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                style={{ backgroundColor: GREEN }}
                className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition shadow-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Product grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={(p) => dispatch(setPage(p))} />
      </div>
    </div>
  );
}
