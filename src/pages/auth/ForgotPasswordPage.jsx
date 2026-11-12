import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const { resetPassword } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please provide your registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setIsSubmitted(true);
      toast.success('Password reset instructions have been dispatched.');
    } catch (err) {
      console.error('Password reset error:', err);
      const message = err.message || 'Unable to process reset request. Please verify the email.';
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
          Recover Password
        </h2>
        <p className="text-xs uppercase tracking-wider-brand text-muted-text">
          Enter your registered email to receive recovery instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card border border-soft-beige sm:rounded-sm sm:px-10">
          {isSubmitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-status-success/10 text-status-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-medium text-charcoal">Instructions Dispatched</h3>
              <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
                If an account exists for <span className="font-semibold text-charcoal">{email}</span>, you will receive a secure password recovery link shortly.
              </p>
              <div className="pt-4">
                <Link to="/login">
                  <Button variant="outline" size="sm" icon={ArrowLeft} iconPosition="left">
                    Back to Sign In
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
                label="Registered Email"
                type="email"
                required
                autoComplete="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Send Recovery Link
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-text hover:text-charcoal transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

