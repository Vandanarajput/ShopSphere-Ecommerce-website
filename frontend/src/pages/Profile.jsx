import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  updateProfile,
  changePassword,
  addAddress,
  deleteAddress,
} from '../features/auth/authSlice';

const INK = '#1F1A14';
const GREEN = '#3D4D2E';
const CREAM = '#F7F2E8';
const CREAM_SOFT = '#FAF6EE';

const inputCls =
  'w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm placeholder-stone-400 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition';

const emptyAddress = {
  fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '',
};

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { list: orders } = useSelector((s) => s.orders);

  const [tab, setTab] = useState('account'); // account | password | addresses
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [newAddress, setNewAddress] = useState(emptyAddress);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  if (!user) return null;

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    await dispatch(updateProfile(profileForm));
    setSavingProfile(false);
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters.');
      return;
    }
    setSavingPassword(true);
    const result = await dispatch(
      changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })
    );
    setSavingPassword(false);
    if (result.meta.requestStatus === 'fulfilled') {
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    }
  }

  async function handleAddAddress(e) {
    e.preventDefault();
    const result = await dispatch(addAddress(newAddress));
    if (result.meta.requestStatus === 'fulfilled') {
      setNewAddress(emptyAddress);
      setShowNewAddress(false);
    }
  }

  const totalSpent = (orders || []).reduce((sum, o) => sum + (o.total || 0), 0);
  const memberSince = user.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();

  return (
    <div style={{ backgroundColor: CREAM_SOFT }} className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Hero */}
        <div className="mb-8">
          <p style={{ color: GREEN }} className="text-xs uppercase tracking-[0.25em] font-medium mb-2">
            Account
          </p>
          <h1 style={{ color: INK }} className="text-3xl md:text-4xl font-serif font-bold">
            My Profile
          </h1>
          <p className="text-sm text-stone-500 mt-2">
            Manage your information, password, and saved addresses.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT: profile card + nav */}
          <div className="lg:col-span-1 space-y-5">
            {/* Identity card */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm text-center">
              <div
                style={{ backgroundColor: GREEN }}
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-sm"
              >
                {user.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <h2 style={{ color: INK }} className="font-serif font-bold text-xl mb-1">
                {user.name}
              </h2>
              <p className="text-stone-500 text-sm">{user.email}</p>
              {user.role && user.role !== 'customer' && (
                <span
                  style={{ backgroundColor: CREAM, color: GREEN }}
                  className="inline-block mt-3 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                >
                  {user.role}
                </span>
              )}
            </div>

            {/* Mini stats */}
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-3">
              <StatRow label="Total orders" value={(orders || []).length} />
              <StatRow label="Total spent" value={`₹${totalSpent.toLocaleString('en-IN')}`} />
              <StatRow label="Saved addresses" value={(user.addresses || []).length} />
              <StatRow label="Member since" value={memberSince} />
            </div>

            {/* Tab nav */}
            <div className="bg-white border border-stone-200 rounded-3xl p-2 shadow-sm">
              <NavBtn active={tab === 'account'} onClick={() => setTab('account')} icon="👤" label="Account info" />
              <NavBtn active={tab === 'password'} onClick={() => setTab('password')} icon="🔒" label="Change password" />
              <NavBtn active={tab === 'addresses'} onClick={() => setTab('addresses')} icon="📍" label="Addresses" />
              <Link
                to="/orders"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
              >
                <span>📦</span> My orders
                <span aria-hidden className="ml-auto opacity-50">→</span>
              </Link>
            </div>
          </div>

          {/* RIGHT: tab content */}
          <div className="lg:col-span-2">
            {tab === 'account' && (
              <Card title="Account Information" subtitle="Update your name and contact details.">
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <Field label="Full name">
                    <input
                      required
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Email address" hint="Email cannot be changed">
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className={`${inputCls} bg-stone-50 cursor-not-allowed text-stone-500`}
                    />
                  </Field>
                  <Field label="Phone number">
                    <input
                      type="tel"
                      placeholder="10-digit mobile"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className={inputCls}
                    />
                  </Field>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      style={{ backgroundColor: GREEN }}
                      className="text-white px-7 py-3 rounded-full font-semibold hover:opacity-90 disabled:opacity-50 transition shadow-sm"
                    >
                      {savingProfile ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </form>
              </Card>
            )}

            {tab === 'password' && (
              <Card
                title="Change Password"
                subtitle="Choose a strong password you don't use anywhere else."
              >
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <Field label="Current password">
                    <input
                      required
                      type="password"
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="New password" hint="At least 6 characters">
                    <input
                      required
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Confirm new password">
                    <input
                      required
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className={inputCls}
                    />
                  </Field>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingPassword}
                      style={{ backgroundColor: GREEN }}
                      className="text-white px-7 py-3 rounded-full font-semibold hover:opacity-90 disabled:opacity-50 transition shadow-sm"
                    >
                      {savingPassword ? 'Updating…' : 'Update password'}
                    </button>
                  </div>
                </form>
              </Card>
            )}

            {tab === 'addresses' && (
              <Card
                title="Saved Addresses"
                subtitle="Manage shipping addresses for faster checkout."
                action={
                  !showNewAddress && (
                    <button
                      onClick={() => setShowNewAddress(true)}
                      style={{ color: GREEN }}
                      className="text-sm font-semibold hover:opacity-70 transition"
                    >
                      + Add new
                    </button>
                  )
                }
              >
                {(user.addresses || []).length === 0 && !showNewAddress && (
                  <div
                    style={{ borderColor: 'rgba(61,77,46,0.15)' }}
                    className="text-center py-10 px-6 rounded-2xl border-2 border-dashed"
                  >
                    <div className="text-4xl mb-2 opacity-60">📍</div>
                    <p style={{ color: INK }} className="font-serif font-semibold mb-1">No addresses yet</p>
                    <p className="text-stone-500 text-sm mb-4">Add one to checkout faster.</p>
                    <button
                      onClick={() => setShowNewAddress(true)}
                      style={{ backgroundColor: GREEN }}
                      className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition"
                    >
                      Add address
                    </button>
                  </div>
                )}

                {(user.addresses || []).length > 0 && (
                  <div className="space-y-3">
                    {user.addresses.map((a) => (
                      <div
                        key={a._id}
                        style={{ backgroundColor: CREAM_SOFT }}
                        className="p-4 rounded-2xl border border-stone-200"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span style={{ color: INK }} className="font-semibold text-sm">
                              {a.fullName}
                            </span>
                            {a.isDefault && (
                              <span
                                style={{ backgroundColor: GREEN }}
                                className="text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                              >
                                Default
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this address?')) {
                                dispatch(deleteAddress(a._id));
                              }
                            }}
                            className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-stone-600 text-sm leading-snug">
                          {a.addressLine1}, {a.city}, {a.state} – {a.pincode}
                        </p>
                        <p className="text-stone-500 text-xs mt-1">📞 {a.phone}</p>
                      </div>
                    ))}
                  </div>
                )}

                {showNewAddress && (
                  <form
                    onSubmit={handleAddAddress}
                    className="mt-4 p-5 rounded-2xl border border-dashed bg-white"
                    style={{ borderColor: 'rgba(61,77,46,0.3)' }}
                  >
                    <h3 style={{ color: INK }} className="font-serif font-bold mb-4">
                      New address
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <input required placeholder="Full name" value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        className={`${inputCls} col-span-2`} />
                      <input required placeholder="Phone (10 digits)" value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className={`${inputCls} col-span-2`} />
                      <input required placeholder="Address line" value={newAddress.addressLine1}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                        className={`${inputCls} col-span-2`} />
                      <input required placeholder="City" value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className={inputCls} />
                      <input required placeholder="State" value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className={inputCls} />
                      <input required placeholder="Pincode" value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        className={`${inputCls} col-span-2`} />
                      <div className="col-span-2 flex gap-3 mt-2">
                        <button type="submit" style={{ backgroundColor: GREEN }}
                          className="text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition shadow-sm">
                          Save address
                        </button>
                        <button type="button" onClick={() => { setShowNewAddress(false); setNewAddress(emptyAddress); }}
                          className="px-6 py-3 rounded-full border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-50 transition">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, subtitle, action, children }) {
  return (
    <section className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h2 style={{ color: INK }} className="font-serif font-bold text-2xl mb-1">
            {title}
          </h2>
          {subtitle && <p className="text-sm text-stone-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
          {label}
        </label>
        {hint && <span className="text-xs text-stone-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-xs uppercase tracking-wider text-stone-500">{label}</span>
      <span style={{ color: INK }} className="font-serif font-bold text-base">{value}</span>
    </div>
  );
}

function NavBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      style={active ? { backgroundColor: GREEN, color: '#fff' } : { color: INK }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium w-full text-left transition ${
        active ? 'shadow-sm' : 'hover:bg-stone-50'
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}
