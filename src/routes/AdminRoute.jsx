import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-ivory flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-wider-brand text-muted-text">Authenticating administrative credentials...</p>
      </div>
    );
  }

  // Not logged in at all
  if (!user) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  // Logged in but not an authorized admin
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] max-w-md mx-auto px-4 py-20 flex flex-col items-center text-center justify-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-status-error/10 text-status-error flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-medium text-charcoal">Administrative Access Denied</h1>
          <p className="text-sm text-muted-text leading-relaxed">
            Your account ({user.email}) does not possess store administrator privileges. This incident has been logged.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/">
            <Button variant="outline" size="sm" icon={ArrowLeft} iconPosition="left">
              Return to Storefront
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

