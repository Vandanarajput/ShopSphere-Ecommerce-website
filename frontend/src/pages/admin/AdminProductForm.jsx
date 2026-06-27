import { useEffect, useMemo, useState } from 'react';
import apiClient from '../../services/apiClient';

const INK = '#1F1A14';
const GREEN = '#3D4D2E';
const CREAM = '#F7F2E8';
const CREAM_SOFT = '#FAF6EE';

export default function AdminProductForm({ product, categories, onClose, onSuccess }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price ?? '',
    mrp: product?.mrp ?? '',
    category: product?.category?._id || product?.category || '',
    brand: product?.brand || '',
    stock: product?.stock ?? '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urls = imageFiles.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [imageFiles]);

  // Lock body scroll when modal open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const discountPct = useMemo(() => {
    const p = parseFloat(form.price);
    const m = parseFloat(form.mrp);
    if (!p || !m || m <= p) return null;
    return Math.round(((m - p) / m) * 100);
  }, [form.price, form.mrp]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFilesPicked(files) {
    setImageFiles(Array.from(files).slice(0, 5));
  }

  function removeImage(i) {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEdit) {
        await apiClient.put(`/products/${product._id}`, {
          ...form,
          price: parseFloat(form.price),
          mrp: parseFloat(form.mrp),
          stock: parseInt(form.stock),
        });
        if (imageFiles.length > 0) {
          const fd = new FormData();
          imageFiles.forEach((f) => fd.append('images', f));
          await apiClient.post(`/products/${product._id}/images`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
        onSuccess('Product updated successfully.');
      } else {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        imageFiles.forEach((f) => fd.append('images', f));
        await apiClient.post('/products', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        onSuccess('Product created successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b border-stone-200 shrink-0"
          style={{ backgroundColor: CREAM_SOFT }}
        >
          <div>
            <p style={{ color: GREEN }} className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-1">
              {isEdit ? 'Edit' : 'Create'}
            </p>
            <h2 className="font-serif font-bold text-2xl" style={{ color: INK }}>
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-stone-400 hover:text-stone-700 hover:bg-stone-100 w-9 h-9 rounded-full flex items-center justify-center text-xl leading-none transition"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-8">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
                {error}
              </div>
            )}

            {/* Section: Basics */}
            <Section title="Basics" subtitle="What is this product?">
              <Field label="Product name" required>
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  className={inputCls}
                />
              </Field>

              <Field label="Description" required>
                <textarea
                  required
                  name="description"
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the product features, materials, what's included..."
                  className={`${inputCls} resize-none`}
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Category" required>
                  <select
                    required
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputCls}
                  >
                    <option value="">Select a category…</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Brand" required>
                  <input
                    required
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    placeholder="e.g. Sony, Apple, Nike"
                    className={inputCls}
                  />
                </Field>
              </div>
            </Section>

            {/* Section: Pricing */}
            <Section title="Pricing & Inventory" subtitle="How much, and how many?">
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Selling price" hint="₹" required>
                  <input
                    required
                    type="number"
                    min="1"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="999"
                    className={inputCls}
                  />
                </Field>
                <Field label="MRP" hint="₹" required>
                  <input
                    required
                    type="number"
                    min="1"
                    name="mrp"
                    value={form.mrp}
                    onChange={handleChange}
                    placeholder="1499"
                    className={inputCls}
                  />
                </Field>
                <Field label="Stock" required>
                  <input
                    required
                    type="number"
                    min="0"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="50"
                    className={inputCls}
                  />
                </Field>
              </div>
              {discountPct !== null && (
                <div
                  className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: CREAM, color: GREEN }}
                >
                  <span aria-hidden>🏷️</span>
                  Customer sees {discountPct}% off
                </div>
              )}
            </Section>

            {/* Section: Images */}
            <Section
              title="Product Images"
              subtitle="Up to 5 images. The first one becomes the main thumbnail."
            >
              <label
                htmlFor="product-images"
                className="block cursor-pointer rounded-2xl border-2 border-dashed transition hover:bg-stone-50 p-6 text-center"
                style={{ borderColor: 'rgba(61,77,46,0.25)' }}
              >
                <input
                  id="product-images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFilesPicked(e.target.files)}
                  className="hidden"
                />
                <div className="text-3xl mb-2 opacity-70">📸</div>
                <p className="text-sm font-medium" style={{ color: INK }}>
                  Click to upload images
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  PNG, JPG up to 5 files
                </p>
              </label>

              {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {previews.map((url, i) => (
                    <div key={url} className="relative group aspect-square rounded-xl overflow-hidden bg-stone-100 ring-1 ring-stone-200">
                      <img src={url} alt={`preview ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span
                          className="absolute top-1 left-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-white"
                          style={{ backgroundColor: GREEN }}
                        >
                          Main
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/95 text-stone-700 hover:bg-rose-500 hover:text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3 flex items-start gap-2">
                <span aria-hidden>⚠️</span>
                <span>
                  Image uploads require Cloudinary credentials in your backend <code className="font-mono">.env</code>.
                  Leave this empty if Cloudinary isn't set up yet — the product will still save.
                </span>
              </p>
            </Section>
          </div>

          {/* Footer */}
          <div
            className="flex gap-3 px-6 py-4 border-t border-stone-200 sticky bottom-0"
            style={{ backgroundColor: CREAM_SOFT }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-full border border-stone-300 text-sm font-medium text-stone-700 hover:bg-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: GREEN }}
              className="flex-1 text-white py-3 rounded-full text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition shadow-sm inline-flex items-center justify-center gap-2"
            >
              {loading
                ? (isEdit ? 'Saving…' : 'Creating…')
                : (isEdit ? 'Save Changes' : 'Create Product')}
              {!loading && <span aria-hidden>→</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  'w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm placeholder-stone-400 outline-none focus:bg-white focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition';

function Section({ title, subtitle, children }) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="font-serif font-bold text-lg" style={{ color: INK }}>{title}</h3>
        {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
          {label} {required && <span className="text-rose-500 normal-case">*</span>}
        </label>
        {hint && <span className="text-xs text-stone-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
