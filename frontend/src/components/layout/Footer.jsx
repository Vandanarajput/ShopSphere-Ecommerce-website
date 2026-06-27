import { Link } from 'react-router-dom';

const GREEN = '#3D4D2E';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: GREEN }} className="text-white mt-0">
      <div className="mx-auto max-w-7xl px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-serif text-2xl font-bold mb-3">ShopSphere</h3>
          <p className="text-white/70 text-sm">
            Everything you love, delivered to your doorstep.
          </p>
        </div>

        <div>
          <p className="font-semibold text-sm mb-3">Shop</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/products" className="hover:text-white">All Products</Link></li>
            <li><Link to="/products" className="hover:text-white">Best Sellers</Link></li>
            <li><Link to="/products" className="hover:text-white">New Arrivals</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-sm mb-3">Account</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/login" className="hover:text-white">Login</Link></li>
            <li><Link to="/register" className="hover:text-white">Register</Link></li>
            <li><Link to="/orders" className="hover:text-white">My Orders</Link></li>
            <li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-sm mb-3">Help</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li>Free shipping over ₹500</li>
            <li>30-day return policy</li>
            <li>Secure payments</li>
            <li>support@shopsphere.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-5 text-xs text-white/60 flex flex-wrap justify-between gap-2">
          <p>© {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
          <p>Made with care.</p>
        </div>
      </div>
    </footer>
  );
}
