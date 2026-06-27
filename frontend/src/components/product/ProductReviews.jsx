import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchReviews, postReview, deleteReview, clearReviews } from '../../features/reviews/reviewSlice';

const INK = '#1F1A14';
const GREEN = '#3D4D2E';
const CREAM = '#F7F2E8';
const CREAM_SOFT = '#FAF6EE';

export default function ProductReviews({ productId }) {
  const dispatch = useDispatch();
  const { list: reviews, loading } = useSelector((s) => s.reviews);
  const { user } = useSelector((s) => s.auth);

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (productId) dispatch(fetchReviews(productId));
    return () => dispatch(clearReviews());
  }, [dispatch, productId]);

  const myReview = user ? reviews.find((r) => r.user?._id === user.id) : null;

  // Rating breakdown
  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const pct = reviews.length ? (count / reviews.length) * 100 : 0;
    return { stars, count, pct };
  });
  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    const result = await dispatch(postReview({ productId, rating, title, comment }));
    setSubmitting(false);
    if (result.meta.requestStatus === 'fulfilled') {
      setShowForm(false);
      setTitle('');
      setComment('');
      setRating(5);
    }
  }

  // Pre-fill form when editing own review
  function startEditing() {
    if (myReview) {
      setRating(myReview.rating);
      setTitle(myReview.title || '');
      setComment(myReview.comment);
    }
    setShowForm(true);
  }

  return (
    <section className="mt-12 border-t border-stone-200 pt-12">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <p style={{ color: GREEN }} className="text-xs uppercase tracking-[0.25em] font-medium mb-2">
            Customer Feedback
          </p>
          <h2 style={{ color: INK }} className="font-serif font-bold text-3xl">
            Reviews & Ratings
          </h2>
        </div>
        {user && !showForm && (
          <button
            onClick={myReview ? startEditing : () => setShowForm(true)}
            style={{ backgroundColor: GREEN }}
            className="text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition shadow-sm"
          >
            {myReview ? 'Edit your review' : '+ Write a review'}
          </button>
        )}
        {!user && (
          <Link
            to="/login"
            style={{ borderColor: GREEN, color: GREEN }}
            className="border-2 px-6 py-3 rounded-full text-sm font-semibold hover:bg-white transition"
          >
            Login to review
          </Link>
        )}
      </div>

      {/* Summary card */}
      {reviews.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm mb-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Average */}
            <div className="text-center md:border-r md:border-stone-200 md:pr-6">
              <p style={{ color: INK }} className="font-serif font-bold text-5xl mb-2">
                {avg.toFixed(1)}
              </p>
              <Stars value={avg} className="justify-center text-2xl" />
              <p className="text-stone-500 text-sm mt-2">
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            {/* Breakdown */}
            <div className="md:col-span-2 space-y-1.5">
              {breakdown.map((b) => (
                <div key={b.stars} className="flex items-center gap-3 text-sm">
                  <span className="w-8 text-stone-600 font-medium tabular-nums">{b.stars}★</span>
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${b.pct}%`, backgroundColor: GREEN }}
                      className="h-full rounded-full transition-all"
                    />
                  </div>
                  <span className="w-10 text-stone-500 text-xs tabular-nums text-right">{b.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm mb-6"
        >
          <h3 style={{ color: INK }} className="font-serif font-bold text-xl mb-5">
            {myReview ? 'Edit your review' : 'Share your experience'}
          </h3>

          {/* Rating picker */}
          <div className="mb-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
              Your rating
            </label>
            <div className="flex items-center gap-1 text-3xl">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={`transition ${
                    n <= (hoverRating || rating) ? 'text-amber-500' : 'text-stone-300'
                  } hover:scale-110`}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
              <span className="ml-3 text-sm text-stone-500 font-medium">
                {hoverRating || rating} of 5
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
              Title <span className="font-normal normal-case text-stone-400">(optional)</span>
            </label>
            <input
              type="text"
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Loved it! Perfect for daily use"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm placeholder-stone-400 outline-none focus:bg-white focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition"
            />
          </div>

          {/* Comment */}
          <div className="mb-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
              Your review *
            </label>
            <textarea
              required
              rows={4}
              maxLength={2000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike? How was the quality, fit, or experience?"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm placeholder-stone-400 outline-none focus:bg-white focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition resize-none"
            />
            <p className="text-xs text-stone-400 mt-1">{comment.length}/2000</p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              style={{ backgroundColor: GREEN }}
              className="text-white px-7 py-3 rounded-full text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition shadow-sm"
            >
              {submitting ? 'Posting…' : myReview ? 'Update review' : 'Post review'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-7 py-3 rounded-full border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <p className="text-center text-stone-500 py-8">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <div
          style={{ borderColor: 'rgba(61,77,46,0.15)' }}
          className="text-center py-16 px-8 rounded-3xl border-2 border-dashed bg-white/60"
        >
          <div className="text-5xl mb-3 opacity-60">💬</div>
          <h3 style={{ color: INK }} className="font-serif font-bold text-lg mb-1">
            No reviews yet
          </h3>
          <p className="text-stone-500 text-sm">
            Be the first to share your experience with this product.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => {
            const isMine = user && r.user?._id === user.id;
            return (
              <div
                key={r._id}
                className="bg-white border border-stone-200 rounded-3xl p-5 md:p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: GREEN }}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    >
                      {r.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p style={{ color: INK }} className="font-semibold text-sm">
                        {r.user?.name || 'Anonymous'}
                        {isMine && (
                          <span className="ml-2 text-[10px] uppercase tracking-wider text-stone-400 font-medium">
                            (You)
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Stars value={r.rating} className="text-sm" />
                        <span className="text-xs text-stone-400">
                          {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {r.verifiedPurchase && (
                    <span
                      style={{ backgroundColor: CREAM, color: GREEN }}
                      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    >
                      ✓ Verified Purchase
                    </span>
                  )}
                </div>
                {r.title && (
                  <h4 style={{ color: INK }} className="font-serif font-bold text-base mb-1">
                    {r.title}
                  </h4>
                )}
                <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line">
                  {r.comment}
                </p>
                {isMine && (
                  <div className="mt-3 pt-3 border-t border-stone-100 flex gap-3">
                    <button
                      onClick={startEditing}
                      style={{ color: GREEN }}
                      className="text-xs font-semibold hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete your review?')) {
                          dispatch(deleteReview({ productId, reviewId: r._id }));
                        }
                      }}
                      className="text-xs font-semibold text-rose-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Stars({ value, className = '' }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(value) ? 'text-amber-500' : 'text-stone-300'}>
          ★
        </span>
      ))}
    </div>
  );
}
