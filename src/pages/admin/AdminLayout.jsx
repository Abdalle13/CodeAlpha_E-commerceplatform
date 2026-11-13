import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, Layers, ShoppingBag, Users,
  Truck, Settings, ShieldCheck, LogOut, ExternalLink,
  Menu, X, Bell, CheckCircle2, ChevronRight, Store,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/inventory', label: 'Inventory', icon: Layers },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/shipping', label: 'Shipping & Delivery', icon: Truck },
  { to: '/admin/settings', label: 'Store Settings', icon: Settings },
  { to: '/admin/audit-logs', label: 'Audit Trail', icon: ShieldCheck },
];

export const AdminLayout = () => {
  const { user, profile, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [storeOnline, setStoreOnline] = useState(true);

  const handleLogout = async () => {
    await logout();
    toast.info('Logged out from Admin Console');
    navigate('/login');
  };

  const getBreadcrumbTitle = () => {
    const item = NAV_ITEMS.find((n) =>
      n.end ? location.pathname === n.end : location.pathname.startsWith(n.to) && n.to !== '/admin'
    );
    if (location.pathname === '/admin') return 'Overview & Analytics';
    return item ? item.label : 'Management';
  };

  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col lg:flex-row text-charcoal font-sans antialiased">
      {/* ─── Desktop Dark Navigation Sidebar (#141513) ─────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#141513] border-r border-charcoal/30 text-white shrink-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-3">
            <img src="/brand/hilaara-mark-light.svg" alt="HILAARA" className="h-6 w-auto" />
            <div className="flex flex-col">
              <span className="font-serif tracking-widest text-sm font-semibold uppercase text-white">
                HILAARA
              </span>
              <span className="text-[10px] uppercase tracking-widest-brand text-muted-text -mt-0.5">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider-brand text-muted-text">
            Command Center
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xs text-xs font-medium transition ${
                    isActive
                      ? 'bg-muted-olive text-white shadow-xs'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xs text-xs text-white/70 hover:text-white hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-muted-olive" />
              <span>Live Storefront</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xs text-xs text-red-300 hover:text-red-200 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Mobile Header & Responsive Drawer ───────────────────────────────── */}
      <div className="lg:hidden bg-[#141513] border-b border-white/10 text-white px-4 py-3 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2">
          <img src="/brand/hilaara-mark-light.svg" alt="HILAARA" className="h-5 w-auto" />
          <span className="font-serif tracking-widest text-xs font-semibold uppercase">
            HILAARA Admin
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-xs hover:bg-white/10 text-white/80"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-[#141513] border-b border-white/10 text-white px-4 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xs text-xs font-medium transition ${
                    isActive ? 'bg-muted-olive text-white' : 'text-white/70 hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <Link to="/" target="_blank" className="text-muted-olive flex items-center gap-1">
              <Store className="w-3.5 h-3.5" /> Live Storefront
            </Link>
            <button onClick={handleLogout} className="text-red-400">
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* ─── Content Canvas & Top Header Bar ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-soft-beige px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-text uppercase tracking-wider-brand">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-text" />
            <span className="font-semibold text-charcoal">{getBreadcrumbTitle()}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Store Status Toggle */}
            <button
              onClick={() => {
                setStoreOnline(!storeOnline);
                toast.info(storeOnline ? 'Store switched to Maintenance Mode' : 'Store is Online & Accepting Orders');
              }}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition ${
                storeOnline
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${storeOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{storeOnline ? 'Online / Accepting Orders' : 'Maintenance Mode'}</span>
            </button>

            {/* Admin Profile Chip */}
            <div className="flex items-center gap-2 border-l border-soft-beige pl-4">
              <div className="w-7 h-7 rounded-full bg-soft-beige flex items-center justify-center text-xs font-semibold text-charcoal">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-medium text-charcoal leading-tight">
                  {profile?.full_name || 'Store Administrator'}
                </span>
                <span className="text-[10px] uppercase tracking-wider-brand text-muted-olive font-semibold">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Routed Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
