import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { UserPlus, BookOpen, Feather } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [inlineErrors, setInlineErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Full reader name is required.';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setInlineErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      const user = await register(name.trim(), email.trim(), password);
      success(`Welcome to the Atelier, ${user.name}! Account registered.`);
      navigate('/', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).join(', ')
          : 'Registration failed. The email address may already be registered.');
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] grid grid-cols-1 lg:grid-cols-12 font-sans bg-paper">
      
      {/* Left Column: Editorial Quote Panel (Split Layout) */}
      <div className="lg:col-span-5 bg-paper-muted border-b lg:border-b-0 lg:border-r border-paper-border p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide-label font-bold text-forest mb-8">
            <Feather className="w-4 h-4" />
            <span>Colophon & Inscription</span>
          </div>

          <span className="font-serif text-6xl sm:text-7xl text-forest/20 font-normal block -mb-4 select-none">
            “
          </span>
          <blockquote className="font-serif text-2xl sm:text-3xl text-ink font-normal leading-snug italic mb-6">
            Every passion borders on the chaotic, but the collector’s passion borders on the chaos of memories.
          </blockquote>

          <div className="border-t border-paper-border/80 pt-4">
            <p className="font-sans text-sm font-semibold text-ink">Walter Benjamin</p>
            <p className="text-xs text-ink-muted">Unpacking My Library (1931)</p>
          </div>
        </div>

        <div className="relative z-10 mt-12 pt-8 border-t border-paper-border/80 text-xs text-ink-muted leading-relaxed">
          <p>
            Join our registry to save curated folios, receive archival courier notices, and maintain an ongoing ledger of read volumes.
          </p>
        </div>
      </div>

      {/* Right Column: Registration Form Panel */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md bg-paper-light border border-paper-border rounded-lg p-8 sm:p-10 shadow-book">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-10 h-10 mx-auto mb-3 bg-forest/10 text-forest rounded flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight-title">
              Create Reader Account
            </h1>
            <p className="text-xs text-ink-muted mt-1.5">
              Register to preserve your reading bag and track dispatches.
            </p>
          </div>

          {/* Real API Error Banner */}
          {apiError && (
            <div className="mb-6 p-3.5 bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs rounded leading-relaxed animate-in fade-in duration-150">
              <span className="font-semibold block mb-0.5">Registration Issue:</span>
              {apiError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Full Name"
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (inlineErrors.name) setInlineErrors({ ...inlineErrors, name: null });
              }}
              error={inlineErrors.name}
              placeholder="Virginia Woolf"
              autoComplete="name"
            />

            <Input
              label="Email Address"
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (inlineErrors.email) setInlineErrors({ ...inlineErrors, email: null });
              }}
              error={inlineErrors.email}
              placeholder="virginia@hogarthpress.org"
              autoComplete="email"
            />

            <Input
              label="Password (min 6 characters)"
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (inlineErrors.password) setInlineErrors({ ...inlineErrors, password: null });
              }}
              error={inlineErrors.password}
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (inlineErrors.confirmPassword) setInlineErrors({ ...inlineErrors, confirmPassword: null });
              }}
              error={inlineErrors.confirmPassword}
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full mt-4"
              isLoading={isLoading}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Complete Reader Registration
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="mt-8 pt-6 border-t border-paper-border text-center text-xs text-ink-muted">
            <span>Already registered with us? </span>
            <Link
              to="/login"
              className="text-terracotta font-semibold hover:underline underline-offset-2"
            >
              Sign In Here
            </Link>
          </div>

        </div>
      </div>

    </main>
  );
}
