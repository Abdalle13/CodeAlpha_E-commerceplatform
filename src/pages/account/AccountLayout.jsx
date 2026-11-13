import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Heart, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';

const NAV_ITEMS = [
  { to: '/account', end: true, label: 'Profile', icon: User },
  { to: '/account/orders', label: 'Orders', icon: Package },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
];

export const AccountLayout = () => {
  const { user, profile, logout, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('Signed out of HILAARA session.');
      navigate('/');
    } catch {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="bg-warm-ivory min-h-screen py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Account Header */}
        <div className="border-b border-soft-beige pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest-brand text-muted-olive font-medium">Customer Portal</span>
            <h1 className="font-serif text-3xl font-medium text-charcoal">
              Welcome, {profile?.full_name || user?.email?.split('@')[0]}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && <Badge variant="charcoal" size="sm">Admin Access</Badge>}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs text-muted-text hover:text-status-error font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 bg-white border border-soft-beige rounded-xs p-3 shadow-soft">
            <nav className="space-y-1">
              {NAV_ITEMS.map(({ to, end, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-semibold uppercase tracking-wider-brand transition-colors ${
                      isActive
                        ? 'bg-charcoal text-white'
                        : 'text-charcoal hover:bg-soft-beige/50 hover:text-muted-olive'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 bg-white border border-soft-beige rounded-xs p-6 sm:p-8 shadow-soft">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;

