import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { formatSomaliPhone } from '../../utils/formatters';

export const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (phone) {
      const phoneValidation = formatSomaliPhone(phone);
      if (!phoneValidation.isValid) {
        setError('Please provide a valid Somali phone number (e.g. +252 61 555 1234 or 0615551234).');
        return;
      }
    }

    setIsLoading(true);
    try {
      await register({
        email,
        password,
        fullName: fullName.trim(),
        phone: phone ? formatSomaliPhone(phone).formatted : '',
      });
      toast.success('Your HILAARA account has been created successfully.');
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      const message = err.message || 'Unable to complete registration. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-warm-ivory">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <img src="/brand/hilaara-mark-dark.svg" alt="HILAARA" className="h-10 w-auto" />
        </Link>
        <h2 className="font-serif text-3xl font-medium tracking-tight text-charcoal">
          Create an Account
        </h2>
        <p className="text-xs uppercase tracking-wider-brand text-muted-text">
          Join HILAARA for seamless checkout and order tracking
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card border border-soft-beige sm:rounded-sm sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-xs text-xs text-status-error font-medium">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              required
              autoComplete="name"
              icon={User}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Hassan Abdi"
            />

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

            <Input
              label="Mobile Number (Somalia)"
              type="tel"
              autoComplete="tel"
              icon={Phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+252 61 555 1234"
              helperText="Used for mobile money order verification and delivery updates"
            />

            <Input
              label="Password (min. 8 characters)"
              type="password"
              required
              autoComplete="new-password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              autoComplete="new-password"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                icon={ArrowRight}
                iconPosition="right"
              >
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-text">
              Already have an account?{' '}
              <Link to="/login" className="text-charcoal font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
