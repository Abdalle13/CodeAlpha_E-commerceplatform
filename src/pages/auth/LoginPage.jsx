import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('returnUrl') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const { profile } = await login(email, password);
      toast.success(`Welcome back, ${profile?.full_name || 'Customer'}.`);
      
      // If admin logging in without a specific returnUrl, route to admin dashboard
      if (profile?.role === 'admin' && returnUrl === '/') {
        navigate('/admin');
      } else {
        navigate(returnUrl);
      }
    } catch (err) {
      console.error('Login error:', err);
      const message = err.message || 'Invalid email or password. Please verify your credentials.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@hilaara.com');
      setPassword('Admin123!Secure');
    } else {
      setEmail('customer@hilaara.com');
      setPassword('Customer123!');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-warm-ivory">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <img src="/brand/hilaara-mark-dark.svg" alt="HILAARA" className="h-10 w-auto" />
        </Link>
        <h2 className="font-serif text-3xl font-medium tracking-tight text-charcoal">
          Sign In to HILAARA
        </h2>
        <p className="text-xs uppercase tracking-wider-brand text-muted-text">
          Access your orders, saved addresses, and personal wishlist
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card border border-soft-beige sm:rounded-sm sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-xs text-xs text-status-error font-medium">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              required
              autoComplete="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                required
                autoComplete="current-password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <div className="flex justify-end pt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs text-muted-text hover:text-charcoal transition-colors underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Fill Buttons for reviewers */}
          <div className="mt-8 pt-6 border-t border-soft-beige space-y-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-text font-medium">
              <ShieldCheck className="w-4 h-4 text-muted-olive" />
              <span>Reviewer Quick Login Demo:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className="text-xs py-1.5 px-2.5 bg-warm-ivory border border-soft-beige text-charcoal hover:bg-soft-beige/50 rounded-xs font-medium transition-colors"
              >
                Fill Customer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="text-xs py-1.5 px-2.5 bg-warm-ivory border border-soft-beige text-charcoal hover:bg-soft-beige/50 rounded-xs font-medium transition-colors"
              >
                Fill Admin
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-text">
              Do not have an account yet?{' '}
              <Link to="/register" className="text-charcoal font-semibold hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

