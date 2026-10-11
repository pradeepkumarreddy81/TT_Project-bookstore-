import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User as UserIcon, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { onServerWakeChange } from '@/api/client';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [serverWaking, setServerWaking] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Listen to Render cold-start server wake notifications
  useEffect(() => {
    const unsubscribe = onServerWakeChange(({ isWaking }) => {
      setServerWaking(isWaking);
    });
    return unsubscribe;
  }, []);

  const handleSignOut = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-xs uppercase tracking-wide-label font-medium transition-colors ${
      isActive ? 'text-terracotta underline underline-offset-8 font-semibold' : 'text-ink-muted hover:text-ink'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-sm border-b border-paper-border font-sans">
      {/* Cold-start resilience banner */}
      {serverWaking && (
        <div className="bg-forest text-paper-light text-xs font-sans py-2 px-4 text-center flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Waking up the server, one moment... Thank you for your patience!</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex flex-col group">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight-title text-ink group-hover:text-terracotta transition-colors">
                The Bookstore Atelier
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-ink-muted -mt-0.5">
                Independent Press & Curators
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/books" className={navLinkClass}>
              Catalogue
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/orders" className={navLinkClass}>
                Orders
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass}>
                <span className="flex items-center gap-1 text-forest">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Studio
                </span>
              </NavLink>
            )}
          </nav>

          {/* Action Buttons: Cart & Auth */}
          <div className="flex items-center gap-3">
            {/* Cart Link with Badge */}
            <Link
              to="/cart"
              className="relative p-2 text-ink hover:text-terracotta transition-colors rounded-sm hover:bg-paper-muted"
              aria-label={`Shopping cart containing ${cartCount} items`}
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-terracotta text-paper-light text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-sm border border-paper-border hover:border-ink-border bg-paper-light text-ink text-xs font-medium transition-colors"
                  aria-expanded={userDropdownOpen}
                >
                  <UserIcon className="w-4 h-4 text-ink-muted" />
                  <span className="hidden sm:inline max-w-[120px] truncate">{user?.name}</span>
                  {isAdmin && (
                    <span className="px-1.5 py-0.2 bg-forest/10 text-forest text-[9px] font-bold uppercase rounded-sm">
                      Admin
                    </span>
                  )}
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-paper-light border border-paper-border rounded shadow-book py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-paper-border">
                      <p className="text-xs font-medium text-ink truncate">{user?.name}</p>
                      <p className="text-[11px] text-ink-muted truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3 py-2 text-xs text-ink hover:bg-paper-muted transition-colors"
                    >
                      My Orders
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-3 py-2 text-xs text-forest font-semibold hover:bg-paper-muted transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-xs text-terracotta hover:bg-paper-muted flex items-center gap-1.5 border-t border-paper-border transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-ink hover:text-terracotta rounded-sm"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-in Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-paper/98 backdrop-blur-md border-t border-paper-border p-6 flex flex-col gap-6 animate-in slide-in-from-right duration-200">
          <nav className="flex flex-col gap-4 text-base font-serif" aria-label="Mobile navigation">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-ink hover:text-terracotta transition-colors py-2 border-b border-paper-border"
            >
              Home
            </Link>
            <Link
              to="/books"
              onClick={() => setMobileMenuOpen(false)}
              className="text-ink hover:text-terracotta transition-colors py-2 border-b border-paper-border"
            >
              The Complete Catalogue
            </Link>
            <Link
              to="/styleguide"
              onClick={() => setMobileMenuOpen(false)}
              className="text-ink hover:text-terracotta transition-colors py-2 border-b border-paper-border"
            >
              Design Tokens & Styleguide
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="text-ink hover:text-terracotta transition-colors py-2 border-b border-paper-border"
              >
                Order History
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-forest font-semibold hover:text-forest-hover transition-colors py-2 border-b border-paper-border"
              >
                Admin Management Studio
              </Link>
            )}
          </nav>

          <div className="mt-auto pt-6 border-t border-paper-border flex flex-col gap-3">
            {isAuthenticated ? (
              <Button variant="outline" size="md" onClick={handleSignOut} className="w-full">
                Sign Out ({user?.name})
              </Button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                  <Button variant="primary" size="md" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                  <Button variant="outline" size="md" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
