const GREEN = '#3D4D2E';

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages } = pagination;

  // Build a compact page list with ellipses for long ranges
  function buildPages() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (page > 3) pages.push('…');
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
  }

  const pages = buildPages();

  return (
    <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-full border border-stone-300 bg-white text-stone-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        Prev
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e-${i}`} className="px-2 text-stone-400 text-sm select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={p === page ? { backgroundColor: GREEN, borderColor: GREEN } : {}}
            className={`min-w-[40px] h-10 px-3 text-sm rounded-full border font-medium transition ${
              p === page
                ? 'text-white shadow-sm'
                : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-full border border-stone-300 bg-white text-stone-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition"
      >
        Next
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
