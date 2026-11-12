import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';
import { Button } from './components/common/Button';
import { Badge } from './components/common/Badge';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

import { LogOut, User as UserIcon, Shield, ArrowRight } from 'lucide-react';

function Navigation() {
  const { user, profile, isAdmin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('Signed out of HILAARA session.');
      navigate('/');
    } catch (err) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="border-b border-soft-beige bg-white/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="/brand/hilaara-mark-dark.svg" 
            alt="HILAARA Monogram" 
            className="h-9 w-auto" 
          />
          <span className="font-serif text-2xl tracking-widest-brand uppercase font-medium">
            HILAARA
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-wider-brand font-medium">
          <Link to="/collections/men" className="hover:text-muted-olive transition-colors">Men</Link>
          <Link to="/collections/women" className="hover:text-muted-olive transition-colors">Women</Link>
          <Link to="/shop" className="hover:text-muted-olive transition-colors">Shop</Link>
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1.5 text-muted-olive font-semibold hover:underline">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/account">
                <span className="text-xs font-medium text-charcoal hover:text-muted-olive flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{profile?.full_name || user.email}</span>
                  {isAdmin && <Badge variant="olive" size="xs">Admin</Badge>}
                </span>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} title="Sign Out">
                <LogOut className="w-4 h-4 text-muted-text hover:text-charcoal" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Join</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function HomeView() {
  const { user, profile, isAdmin } = useAuth();

  return (
    <div className="text-center max-w-2xl mx-auto space-y-6">
      <div className="inline-flex items-center gap-2">
        <Badge variant="olive" size="sm">Phase 2: Database & Auth Active</Badge>
        {isAdmin && <Badge variant="charcoal" size="sm">Admin Role Verified</Badge>}
      </div>

      <h1 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-charcoal">
        Refined Modern Fashion for Somalia
      </h1>

      <p className="text-muted-text text-base leading-relaxed">
        Authentication, security definer functions, anti-privilege escalation triggers, and PostgreSQL Row-Level Security policies are now fully operational.
      </p>

      {user ? (
        <div className="p-4 bg-white border border-soft-beige rounded-sm text-left shadow-soft space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider-brand text-muted-olive">Authenticated Session</p>
          <div className="text-xs space-y-1 text-charcoal">
            <p><span className="text-muted-text">User:</span> {profile?.full_name || 'N/A'}</p>
            <p><span className="text-muted-text">Email:</span> {user.email}</p>
            <p><span className="text-muted-text">Role:</span> <span className="font-semibold uppercase">{profile?.role || 'customer'}</span></p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white border border-soft-beige rounded-sm text-left shadow-soft space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider-brand text-muted-olive">Session Status: Guest</p>
          <p className="text-xs text-muted-text">Sign in to test protected customer and administrator route privileges.</p>
        </div>
      )}

      <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
        {user ? (
          <>
            <Link to="/account">
              <Button variant="primary" size="md">View Customer Account</Button>
            </Link>
            {isAdmin && (
              <Link to="/admin">
                <Button variant="olive" size="md" icon={Shield} iconPosition="left">
                  Open Admin Command Center
                </Button>
              </Link>
            )}
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="primary" size="md">Sign In to Account</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="md">Register New Account</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function AccountView() {
  const { user, profile } = useAuth();
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="border-b border-soft-beige pb-4">
        <h1 className="font-serif text-3xl font-medium text-charcoal">Customer Account</h1>
        <p className="text-xs uppercase tracking-wider-brand text-muted-text mt-1">Protected Customer Area</p>
      </div>

      <div className="bg-white p-6 rounded-sm border border-soft-beige shadow-card space-y-4">
        <h2 className="font-serif text-xl font-medium text-charcoal">Profile Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-text uppercase tracking-wider-brand">Full Name</p>
            <p className="font-medium text-charcoal mt-0.5">{profile?.full_name || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-text uppercase tracking-wider-brand">Email Address</p>
            <p className="font-medium text-charcoal mt-0.5">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-text uppercase tracking-wider-brand">Phone Number</p>
            <p className="font-medium text-charcoal mt-0.5">{profile?.phone || 'None on file'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-text uppercase tracking-wider-brand">Account Role</p>
            <Badge variant="olive" size="sm" className="mt-1">{profile?.role}</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminView() {
  const { user, profile } = useAuth();
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-soft-beige pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-charcoal">Admin Command Center</h1>
          <p className="text-xs uppercase tracking-wider-brand text-muted-olive font-semibold mt-1">
            Authorized Administrator Access Granted
          </p>
        </div>
        <Badge variant="charcoal" size="md">Admin Session</Badge>
      </div>

      <div className="bg-white p-6 rounded-sm border border-soft-beige shadow-card space-y-4">
        <h2 className="font-serif text-xl font-medium text-charcoal">Authorization Verification</h2>
        <p className="text-sm text-muted-text">
          Active administrative identity: <strong className="text-charcoal">{user?.email}</strong>.
          Role verification: <Badge variant="olive" size="xs">{profile?.role}</Badge>.
        </p>
        <p className="text-xs text-muted-text leading-relaxed">
          Full management modules (Products CRUD, Category Manager, Inventory Matrix, Orders & Payments verification, and Audit Logs) will be fully developed in Phase 8.
        </p>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-warm-ivory text-charcoal">
            <Navigation />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
              <Routes>
                {/* Storefront Home */}
                <Route path="/" element={<HomeView />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Protected Customer Routes */}
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <AccountView />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <AdminRoute>
                      <AdminView />
                    </AdminRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<HomeView />} />
              </Routes>
            </main>

            <footer className="bg-charcoal text-white py-12 border-t border-charcoal">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <img src="/brand/hilaara-mark-light.svg" alt="HILAARA" className="h-6 w-auto" />
                  <span className="font-serif text-lg tracking-widest-brand">HILAARA</span>
                </div>
                <p className="text-xs text-soft-beige/70">
                  © {new Date().getFullYear()} HILAARA Store. Somalia. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
