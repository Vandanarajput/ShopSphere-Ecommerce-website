export function statusBadgeClass(status) {
  const map = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-slate-100 text-slate-700',
    paid: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-slate-100 text-slate-700';
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
