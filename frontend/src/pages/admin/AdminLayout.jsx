import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Menu, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard Overview';
    if (path.includes('/admin/books')) return 'Books Management';
    if (path.includes('/admin/categories')) return 'Departments & Categories';
    if (path.includes('/admin/orders')) return 'Dispatches & Orders';
    if (path.includes('/admin/customers')) return 'Registered Readers';
    return 'Curator Studio';
  };

  return (
    <div className="min-h-screen bg-paper flex font-sans text-ink">
      {/* Sidebar Navigation */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Operational Bar */}
        <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur-sm border-b border-paper-border h-16 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-ink lg:hidden rounded hover:bg-paper-muted"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-ink">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-forest/10 border border-forest/20 rounded-sm text-forest font-semibold uppercase tracking-wider text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Verified</span>
            </div>
            <span className="text-ink-muted hidden md:inline">
              Active Curator: <strong className="text-ink">{user?.name}</strong>
            </span>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
