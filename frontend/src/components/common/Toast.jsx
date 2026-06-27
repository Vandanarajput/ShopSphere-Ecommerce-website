import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearToast } from '../../features/cart/cartSlice';
import { clearWishlistToast } from '../../features/wishlist/wishlistSlice';

export default function Toast() {
  const dispatch = useDispatch();
  const cartToast = useSelector((s) => s.cart.toast);
  const cartError = useSelector((s) => s.cart.error);
  const wishToast = useSelector((s) => s.wishlist.toast);
  const wishError = useSelector((s) => s.wishlist.error);

  const message = cartToast || wishToast;
  const error = cartError || wishError;
  const text = error || message;
  const isError = Boolean(error);

  useEffect(() => {
    if (!text) return;
    const t = setTimeout(() => {
      dispatch(clearToast());
      dispatch(clearWishlistToast());
    }, 2500);
    return () => clearTimeout(t);
  }, [text, dispatch]);

  if (!text) return null;

  return (
    <div className="fixed top-20 right-6 z-50">
      <div
        className={`px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-white ${
          isError ? 'bg-red-500' : 'bg-slate-900'
        }`}
      >
        {text}
      </div>
    </div>
  );
}
