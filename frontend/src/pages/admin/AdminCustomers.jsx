import React, { useState, useEffect } from 'react';
import client from '@/api/client';
import { useToast } from '@/context/ToastContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Users, Search, ShieldCheck, Mail, Calendar } from 'lucide-react';

export default function AdminCustomers() {
  useDocumentTitle('Registered Readers');
  const { error: showError } = useToast();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await client.get('/admin/customers');
      setCustomers(res.data?.data || []);
    } catch {
      showError('Failed to load reader directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-paper-border pb-6">
        <div>
          <span className="text-xs uppercase tracking-wide-label font-bold text-forest block mb-1">
            Reader Community
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight-title">
            Registered Readers Directory ({customers.length})
          </h2>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search readers by name or email..."
            className="w-full h-10 pl-9 pr-4 text-xs bg-paper-light border border-paper-border rounded text-ink placeholder:text-ink-subtle outline-none focus:border-ink transition-colors shadow-paper"
          />
        </div>
      </div>

      {/* Readers Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded" />
          ))}
        </div>
      ) : filteredCustomers.length > 0 ? (
        <div className="bg-paper-light border border-paper-border rounded-lg shadow-paper overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-paper-muted border-b border-paper-border text-[10px] uppercase tracking-wide-label text-ink-subtle">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Reader Name</th>
                <th className="px-5 py-3.5">Email Address</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Registration Date</th>
                <th className="px-5 py-3.5 text-right">Orders Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-border text-ink">
              {filteredCustomers.map((reader) => {
                const regDate = reader.createdAt
                  ? new Date(reader.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Historical';

                return (
                  <tr key={reader.id} className="hover:bg-paper/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-ink-subtle">{reader.id}</td>
                    <td className="px-5 py-4 font-serif font-bold text-sm text-ink">{reader.name}</td>
                    <td className="px-5 py-4 text-ink-muted flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                      <span>{reader.email}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase tracking-wide-label font-bold rounded-sm border ${
                          reader.role === 'ADMIN'
                            ? 'bg-forest/15 text-forest border-forest/30'
                            : 'bg-paper-muted text-ink border-paper-border'
                        }`}
                      >
                        {reader.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink-subtle font-mono text-[11px]">{regDate}</td>
                    <td className="px-5 py-4 text-right font-mono font-bold text-ink">
                      {reader.orderCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No Readers Match Search"
          description="No registered readers correspond to the entered search term."
          actionLabel="Clear Search Filter"
          onAction={() => setSearchTerm('')}
        />
      )}
    </div>
  );
}
