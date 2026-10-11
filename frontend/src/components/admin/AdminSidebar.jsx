import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Tags,
  ShoppingBag,
  Users,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Feather,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/books', label: 'Books Catalogue', icon: BookOpen },
  { to: '/admin/categories', label: 'Departments', icon: Tags },
  { to: '/admin/orders', label: 'Dispatches & Orders', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Registered Readers', icon: Users },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-paper-muted border-r border-paper-border flex flex-col justify-between font-sans transition-transform duration-200 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div>
          {/* Header Brand */}
          <div className="p-6 border-b border-paper-border bg-paper/60">
            <Link to="/" className="flex items-center gap-2 text-ink group">
              <div className="w-8 h-8 rounded bg-forest/15 text-forest flex items-center justify-center font-serif font-bold text-sm">
                A
              </div>
              <div>
                <span className="font-serif text-base font-bold tracking-tight text-ink block leading-tight">
                  Atelier Studio
                </span>
                <span className="text-[9px] uppercase tracking-wide-label font-bold text-forest">
                  Curator Administration
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5" aria-label="Admin Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded text-xs uppercase tracking-wide-label font-medium transition-colors',
                      isActive
                        ? 'bg-ink text-paper font-bold shadow-xs'
                        : 'text-ink-muted hover:bg-paper-light hover:text-ink'
                    )
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Actions */}
        <div className="p-4 border-t border-paper-border bg-paper/60 space-y-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-ink-muted hover:text-ink px-3 py-2 rounded hover:bg-paper-light transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </Link>

          <div className="pt-3 border-t border-paper-border/80 flex items-center justify-between px-2 text-xs">
            <div className="min-w-0 pr-2">
              <p className="font-semibold text-ink truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-ink-subtle truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 text-terracotta hover:bg-terracotta/10 rounded transition-colors shrink-0"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
