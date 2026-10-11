import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { BookOpen, LogIn, KeyRound, Sparkles, Feather } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inlineErrors, setInlineErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email format (e.g. reader@domain.com).';
    }

    if (!password) {
      errs.password = 'Password is required.';
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
      const user = await login(email.trim(), password);
      success(`Welcome back to the atelier, ${user.name}`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? 'Invalid credentials. Please verify your email and password.'
          : 'Authentication request failed. Check server status.');
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@bookstore.com');
    setPassword('Admin@123');
    setInlineErrors({});
    setApiError('');
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] grid grid-cols-1 lg:grid-cols-12 font-sans bg-paper">
      
      {/* Left Column: Editorial Quote Panel (Split Layout) */}
      <div className="lg:col-span-5 bg-paper-muted border-b lg:border-b-0 lg:border-r border-paper-border p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative stamp */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide-label font-bold text-terracotta mb-8">
            <Feather className="w-4 h-4" />
            <span>The Bookstore Atelier Archive</span>
          </div>

          <span className="font-serif text-6xl sm:text-7xl text-terracotta/25 font-normal block -mb-4 select-none">
            “
          </span>
          <blockquote className="font-serif text-2xl sm:text-3xl text-ink font-normal leading-snug italic mb-6">
            I have always imagined that Paradise will be a kind of library.
          </blockquote>

          <div className="border-t border-paper-border/80 pt-4">
            <p className="font-sans text-sm font-semibold text-ink">Jorge Luis Borges</p>
            <p className="text-xs text-ink-muted">Director of the National Public Library of Argentina</p>
          </div>
        </div>

        {/* Archival promise */}
        <div className="relative z-10 mt-12 pt-8 border-t border-paper-border/80 text-xs text-ink-muted leading-relaxed">
          <p>
            Signing in restores your ongoing reading bag, past orders, and dispatch tracking history across all registered editions.
          </p>
        </div>
      </div>

      {/* Right Column: Authentication Form Panel */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md bg-paper-light border border-paper-border rounded-lg p-8 sm:p-10 shadow-book">
          
          {/* Form Header */}
          <div className="text-center mb-8">
            <div className="w-10 h-10 mx-auto mb-3 bg-terracotta/10 text-terracotta rounded flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight-title">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-ink-muted mt-1.5">
              Enter your credentials to access your reading bag and saved orders.
            </p>
          </div>

          {/* Real API Error Banner */}
          {apiError && (
            <div className="mb-6 p-3.5 bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs rounded leading-relaxed animate-in fade-in duration-150">
              <span className="font-semibold block mb-0.5">Authentication Error:</span>
              {apiError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              label="Reader Email Address"
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (inlineErrors.email) setInlineErrors({ ...inlineErrors, email: null });
              }}
              error={inlineErrors.email}
              placeholder="reader@bookstore.com"
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (inlineErrors.password) setInlineErrors({ ...inlineErrors, password: null });
              }}
              error={inlineErrors.password}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In to Atelier
            </Button>
          </form>

          {/* Demo Admin Autofill Shortcut */}
          <div className="mt-8 pt-6 border-t border-paper-border">
            <div className="bg-paper-muted/60 border border-paper-border/80 rounded p-3 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-ink-muted">
                <KeyRound className="w-4 h-4 text-forest" />
                <span>Curator Testing?</span>
              </div>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="text-[11px] font-bold uppercase tracking-wider text-forest hover:underline"
              >
                Autofill Admin
              </button>
            </div>
          </div>

          {/* Switch to Register */}
          <div className="mt-6 text-center text-xs text-ink-muted">
            <span>New to the press? </span>
            <Link
              to="/register"
              className="text-terracotta font-semibold hover:underline underline-offset-2"
            >
              Create Reader Account
            </Link>
          </div>

        </div>
      </div>

    </main>
  );
}
