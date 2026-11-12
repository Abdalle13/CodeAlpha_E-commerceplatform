import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, LogOut, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { CartDrawer } from '../cart/CartDrawer';

const NAV_LINKS = [
  { label: 'Men', href: '/collections/men' },
  { label: 'Women', href: '/collections/women' },
  { label: 'New Arrivals', href: '/collections/new-arrivals' },
  { label: 'Featured', href: '/collections/featured' },
  { label: 'Shop All', href: '/shop' },
];

export const Navbar = () => {
  const { user, profile, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const searchRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  // Sticky scroll state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    setAccountOpen(false);
    await logout();
    toast.info('Signed out of your HILAARA session.');
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-soft border-b border-soft-beige'
            : 'bg-warm-ivory/95 backdrop-blur-sm border-b border-soft-beige/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-18 flex items-center justify-between gap-4" style={{ height: '72px' }}>

            {/* Mobile: Hamburger */}
            <button
              className="lg:hidden p-2 -ml-2 text-charcoal hover:text-muted-olive transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 flex-shrink-0"
              aria-label="HILAARA Home"
            >
              <img
                src="/brand/hilaara-mark-dark.svg"
                alt=""
                className="h-8 w-auto"
                aria-hidden="true"
              />
              <span className="font-serif text-xl sm:text-2xl tracking-widest-brand uppercase font-medium text-charcoal select-none">
                HILAARA
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    `text-xs uppercase tracking-wider-brand font-medium transition-colors hover:text-muted-olive ${
                      isActive ? 'text-charcoal' : 'text-charcoal/70'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Action Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-charcoal/70 hover:text-charcoal transition-colors rounded-xs"
                aria-label="Search products"
              >
                <Search className="w-4.5 h-4.5 w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                to={user ? '/account/wishlist' : '/login'}
                className="p-2 text-charcoal/70 hover:text-charcoal transition-colors rounded-xs relative"
                aria-label={`Wishlist (${wishlistCount} items)`}
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-charcoal text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none"
                  >
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </motion.span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="p-2 text-charcoal/70 hover:text-charcoal transition-colors rounded-xs relative"
                aria-label={`Cart (${totalItems} items)`}
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-charcoal text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </motion.span>
                )}
              </button>

              {/* Account */}
              {user ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="flex items-center gap-1.5 p-2 text-charcoal/70 hover:text-charcoal transition-colors rounded-xs"
                    aria-label="Account menu"
                    aria-expanded={accountOpen}
                  >
                    <User className="w-5 h-5" />
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {accountOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setAccountOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-1 w-52 bg-white border border-soft-beige rounded-xs shadow-card z-20 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-soft-beige">
                            <p className="text-xs font-semibold text-charcoal truncate">{profile?.full_name}</p>
                            <p className="text-[11px] text-muted-text truncate mt-0.5">{user.email}</p>
                          </div>
                          <nav className="py-1">
                            <Link to="/account" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-charcoal hover:bg-warm-ivory transition-colors">
                              <User className="w-3.5 h-3.5 text-muted-text" /> My Account
                            </Link>
                            <Link to="/account/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-charcoal hover:bg-warm-ivory transition-colors">
                              <ShoppingBag className="w-3.5 h-3.5 text-muted-text" /> Order History
                            </Link>
                            <Link to="/account/wishlist" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-charcoal hover:bg-warm-ivory transition-colors">
                              <Heart className="w-3.5 h-3.5 text-muted-text" /> Wishlist
                            </Link>
                            {isAdmin && (
                              <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-muted-olive font-semibold hover:bg-warm-ivory transition-colors border-t border-soft-beige mt-1 pt-2">
                                <Shield className="w-3.5 h-3.5" /> Admin Console
                              </Link>
                            )}
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-status-error hover:bg-warm-ivory transition-colors border-t border-soft-beige"
                            >
                              <LogOut className="w-3.5 h-3.5" /> Sign Out
                            </button>
                          </nav>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:flex p-2 text-charcoal/70 hover:text-charcoal transition-colors rounded-xs"
                  aria-label="Sign in"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 bg-white border-b border-soft-beige shadow-card z-50"
            >
              <div className="max-w-2xl mx-auto px-4 py-4">
                <form onSubmit={handleSearch} className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-muted-text shrink-0" />
                  <input
                    ref={searchRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for garments, categories, styles..."
                    className="flex-1 text-sm text-charcoal bg-transparent outline-none placeholder:text-muted-text/60"
                    aria-label="Search products"
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                    className="text-muted-text hover:text-charcoal transition-colors"
                    aria-label="Close search"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-charcoal/50 z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-warm-ivory z-50 lg:hidden flex flex-col"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between p-5 border-b border-soft-beige">
                <Link to="/" onClick={() => setMobileOpen(false)}>
                  <img src="/brand/hilaara-logo-dark.svg" alt="HILAARA" className="h-6 w-auto" />
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 text-charcoal/60 hover:text-charcoal"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-0.5 px-3">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <NavLink
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `block px-4 py-3 text-sm font-medium rounded-xs transition-colors ${
                            isActive
                              ? 'bg-soft-beige text-charcoal'
                              : 'text-charcoal/80 hover:bg-soft-beige/60 hover:text-charcoal'
                          }`
                        }
                      >
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 px-3 border-t border-soft-beige pt-4 space-y-0.5">
                  {user ? (
                    <>
                      <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider-brand text-muted-text">
                        {profile?.full_name}
                      </p>
                      <Link to="/account" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-charcoal/80 hover:bg-soft-beige/60 rounded-xs">My Account</Link>
                      <Link to="/account/orders" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-charcoal/80 hover:bg-soft-beige/60 rounded-xs">Order History</Link>
                      <Link to="/account/wishlist" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-charcoal/80 hover:bg-soft-beige/60 rounded-xs">Wishlist</Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-muted-olive font-semibold hover:bg-soft-beige/60 rounded-xs">Admin Console</Link>
                      )}
                      <button
                        onClick={() => { setMobileOpen(false); handleLogout(); }}
                        className="w-full text-left block px-4 py-3 text-sm text-status-error hover:bg-soft-beige/60 rounded-xs"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-semibold text-charcoal hover:bg-soft-beige/60 rounded-xs">Sign In</Link>
                      <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-charcoal/80 hover:bg-soft-beige/60 rounded-xs">Create Account</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

