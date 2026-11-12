import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const { updatePassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(password);
      setIsSuccess(true);
      toast.success('Your password has been updated securely.');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error('Password update error:', err);
      const message = err.message || 'Unable to update password. Your reset link may have expired.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-warm-ivory">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <img src="/brand/hilaara-mark-dark.svg" alt="HILAARA" className="h-10 w-auto" />
        </Link>
        <h2 className="font-serif text-3xl font-medium tracking-tight text-charcoal">
          Set New Password
        </h2>
        <p className="text-xs uppercase tracking-wider-brand text-muted-text">
          Create a secure password for your HILAARA account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card border border-soft-beige sm:rounded-sm sm:px-10">
          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-status-success/10 text-status-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-medium text-charcoal">Password Updated</h3>
              <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
                Your new password has been established. Redirecting you to sign in...
              </p>
              <div className="pt-2">
                <Link to="/login">
                  <Button variant="primary" size="sm">
                    Sign In Now
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-xs text-xs text-status-error font-medium">
                  {error}
                </div>
              )}

              <Input
                label="New Password (min. 8 characters)"
                type="password"
                required
                autoComplete="new-password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Input
                label="Confirm New Password"
                type="password"
                required
                autoComplete="new-password"
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                icon={ArrowRight}
                iconPosition="right"
              >
                Establish New Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
