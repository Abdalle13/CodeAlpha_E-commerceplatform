import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';
import { StorefrontLayout } from './components/layout/StorefrontLayout';

// Loading fallback — minimal inline spinner to avoid importing components before fonts load
const PageLoader = () => (
  <div className="min-h-screen bg-warm-ivory flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <img src="/brand/hilaara-mark-dark.svg" alt="HILAARA" className="h-8 w-auto opacity-30 animate-pulse" />
    </div>
  </div>
);

// Storefront pages — lazily loaded for code splitting
const HomePage = lazy(() =>
  import('./pages/storefront/HomePage').then((m) => ({ default: m.HomePage }))
);
const ShopPage = lazy(() =>
  import('./pages/storefront/ShopPage').then((m) => ({ default: m.ShopPage }))
);
const CollectionPage = lazy(() =>
  import('./pages/storefront/CollectionPage').then((m) => ({ default: m.CollectionPage }))
);
const ProductDetailPage = lazy(() =>
  import('./pages/storefront/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage }))
);
const CartPage = lazy(() =>
  import('./pages/storefront/CartPage').then((m) => ({ default: m.CartPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/common/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

// Auth pages
const LoginPage = lazy(() =>
  import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('./pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const ForgotPasswordPage = lazy(() =>
  import('./pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const ResetPasswordPage = lazy(() =>
  import('./pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
);

// Placeholder stubs for protected pages built in later phases
// These are inline components so the route tree is wired correctly from Phase 3 onward
const AccountPlaceholder = () => (
  <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
    <h1 className="font-serif text-3xl font-medium text-charcoal">My Account</h1>
    <p className="text-muted-text text-sm">Account management pages are built in Phase 6.</p>
  </div>
);

const AdminPlaceholder = () => (
  <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
    <h1 className="font-serif text-3xl font-medium text-charcoal">Admin Console</h1>
    <p className="text-muted-text text-sm">The full admin dashboard is built in Phase 8.</p>
  </div>
);

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Storefront routes — wrapped in StorefrontLayout (Announcement + Navbar + Footer) */}
                  <Route element={<StorefrontLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/products/:slug" element={<ProductDetailPage />} />
                    <Route path="/collections/:slug" element={<CollectionPage />} />
                    <Route path="/cart" element={<CartPage />} />

                    {/* Auth pages — inside layout so Navbar + Footer are present */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* Protected customer area */}
                    <Route
                      path="/account/*"
                      element={
                        <ProtectedRoute>
                          <AccountPlaceholder />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* Admin area — full-page, no storefront layout (admin builds its own layout in Phase 8) */}
                  <Route
                    path="/admin/*"
                    element={
                      <AdminRoute>
                        <AdminPlaceholder />
                      </AdminRoute>
                    }
                  />

                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
