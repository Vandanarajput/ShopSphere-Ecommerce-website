import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { fetchProducts, fetchCategories } from '../../features/products/productSlice';
import Loader from '../../components/common/Loader';
import AdminProductForm from './AdminProductForm';

export default function AdminProducts() {
  const dispatch = useDispatch();
  const { items: products, categories, loading } = useSelector((s) => s.products);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  function reload() {
    dispatch(fetchProducts({ limit: 50 }));
  }

  useEffect(() => {
    reload();
    dispatch(fetchCategories());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(product) {
    setEditing(product);
    setShowForm(true);
  }

  async function handleDelete(product) {
    if (!window.confirm(`Deactivate "${product.name}"? Customers won't see it anymore.`)) return;
    try {
      await apiClient.delete(`/products/${product._id}`);
      setActionMessage(`"${product.name}" was deactivated.`);
      reload();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete.');
    }
  }

  function handleFormSuccess(msg) {
    setShowForm(false);
    setEditing(null);
    setActionMessage(msg);
    reload();
  }

  const INK = '#1F1A14';
  const GREEN = '#3D4D2E';
  const CREAM_SOFT = '#FAF6EE';

  return (
    <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p style={{ color: GREEN }} className="text-xs uppercase tracking-[0.2em] font-medium mb-2">
              Admin
            </p>
            <h1 style={{ color: INK }} className="text-3xl md:text-4xl font-serif font-bold">
              Manage Products
            </h1>
            <p className="text-sm text-stone-500 mt-2">Add, edit, and deactivate products in your catalog.</p>
          </div>
          <button
            onClick={openCreate}
            style={{ backgroundColor: GREEN }}
            className="text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition shadow-sm inline-flex items-center gap-2"
          >
            <span className="text-base leading-none">+</span> Add Product
          </button>
        </div>

        {/* Admin nav tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            style={{ backgroundColor: GREEN, borderColor: GREEN }}
            className="shrink-0 px-5 py-2.5 rounded-full border text-sm font-semibold text-white shadow-sm"
          >
            📦 Products
          </button>
          <Link
            to="/admin/orders"
            className="shrink-0 px-5 py-2.5 rounded-full bg-white border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
          >
            🧾 Orders
          </Link>
        </div>

        {actionMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex justify-between items-center">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-emerald-700 text-xl leading-none">
              ×
            </button>
          </div>
        )}
        {actionError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex justify-between items-center">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="text-rose-700 text-xl leading-none">
              ×
            </button>
          </div>
        )}

        {loading && products.length === 0 ? (
          <Loader />
        ) : products.length === 0 ? (
          <div
            style={{ borderColor: 'rgba(61,77,46,0.15)' }}
            className="text-center py-16 px-8 rounded-3xl border-2 border-dashed bg-white/60"
          >
            <div className="text-6xl mb-4 opacity-70">📦</div>
            <h3 style={{ color: INK }} className="font-serif text-xl font-bold mb-2">
              No products yet
            </h3>
            <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">
              Click "Add Product" to create your first listing.
            </p>
            <button
              onClick={openCreate}
              style={{ backgroundColor: GREEN }}
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition shadow-sm"
            >
              <span className="text-base leading-none">+</span> Add Your First Product
            </button>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: CREAM_SOFT }} className="text-xs uppercase tracking-wider" >
                <tr>
                  <th className="text-left px-5 py-4 font-semibold" style={{ color: INK }}>Product</th>
                  <th className="text-left px-5 py-4 font-semibold" style={{ color: INK }}>Category</th>
                  <th className="text-left px-5 py-4 font-semibold" style={{ color: INK }}>Brand</th>
                  <th className="text-right px-5 py-4 font-semibold" style={{ color: INK }}>Price</th>
                  <th className="text-right px-5 py-4 font-semibold" style={{ color: INK }}>Stock</th>
                  <th className="text-right px-5 py-4 font-semibold" style={{ color: INK }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-t border-stone-100 hover:bg-stone-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                          {p.images?.[0]?.url ? (
                            <img
                              src={p.images[0].url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300 text-[10px]">
                              —
                            </div>
                          )}
                        </div>
                        <span className="font-medium line-clamp-1" style={{ color: INK }}>{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-stone-600">{p.category?.name || '—'}</td>
                    <td className="px-5 py-4 text-stone-600">{p.brand}</td>
                    <td className="px-5 py-4 text-right font-semibold" style={{ color: INK }}>
                      ₹{p.price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {p.stock === 0 ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                          Out
                        </span>
                      ) : p.stock < 10 ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          {p.stock} left
                        </span>
                      ) : (
                        <span className="text-stone-700">{p.stock}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEdit(p)}
                        style={{ color: GREEN }}
                        className="font-medium hover:underline mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="text-rose-500 font-medium hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showForm && (
          <AdminProductForm
            product={editing}
            categories={categories}
            onClose={() => setShowForm(false)}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </div>
  );
}
