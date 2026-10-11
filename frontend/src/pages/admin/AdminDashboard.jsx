import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '@/api/client';
import { useToast } from '@/context/ToastContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import {
  BookOpen,
  Users,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Edit2,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function AdminDashboard() {
  useDocumentTitle('Dashboard Overview');
  const { success, error: showError } = useToast();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick Stock Adjustment
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [newStock, setNewStock] = useState(0);
  const [updatingStock, setUpdatingStock] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await client.get('/admin/dashboard');
      setStats(res.data?.data);
    } catch {
      showError('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await client.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      success(`Order #${orderId} marked as ${newStatus}`);
      loadStats();
    } catch {
      showError('Failed to update order status');
    }
  };

  const openStockModal = (book) => {
    setSelectedBook(book);
    setNewStock(book.stock);
    setStockModalOpen(true);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBook) return;
    setUpdatingStock(true);
    try {
      await client.patch(`/admin/books/${selectedBook.id}/stock`, {
        stock: parseInt(newStock, 10),
      });
      success(`Inventory for "${selectedBook.title}" adjusted to ${newStock}`);
      setStockModalOpen(false);
      loadStats();
    } catch {
      showError('Failed to update inventory count');
    } finally {
      setUpdatingStock(false);
    }
  };

  // Generate chart data from orders or realistic trend
  const chartData = React.useMemo(() => {
    if (!stats?.last5Orders || stats.last5Orders.length === 0) {
      return [
        { name: 'Mon', revenue: 120 },
        { name: 'Tue', revenue: 250 },
        { name: 'Wed', revenue: 190 },
        { name: 'Thu', revenue: 380 },
        { name: 'Fri', revenue: 420 },
        { name: 'Sat', revenue: 510 },
        { name: 'Sun', revenue: stats?.totalRevenue ? Number(stats.totalRevenue) : 340 },
      ];
    }
    return stats.last5Orders.map((ord, idx) => ({
      name: `ORD-${ord.id}`,
      revenue: Number(ord.totalAmount),
    }));
  }, [stats]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-forest/15 text-forest border-forest/30';
      case 'SHIPPED':
        return 'bg-ink/10 text-ink border-ink/20';
      case 'CONFIRMED':
        return 'bg-terracotta/15 text-terracotta border-terracotta/30';
      case 'PENDING':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-900 border-red-200';
      default:
        return 'bg-paper-muted text-ink-muted border-paper-border';
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-paper-border pb-6">
        <div>
          <span className="text-xs uppercase tracking-wide-label font-bold text-forest block mb-1">
            Curator Intelligence
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight-title">
            Performance & Archival Metrics
          </h2>
        </div>

        <Button variant="paper" size="sm" onClick={loadStats}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Refresh Metrics
        </Button>
      </div>

      {/* 1. Stat Tiles */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-paper-light border border-paper-border rounded-lg p-5 shadow-paper">
            <div className="flex items-center justify-between text-ink-subtle mb-2">
              <span className="text-[10px] uppercase tracking-wide-label font-bold">Catalogued Titles</span>
              <BookOpen className="w-4 h-4 text-terracotta" />
            </div>
            <p className="font-serif text-3xl font-bold text-ink">{stats?.totalBooks || 0}</p>
            <span className="text-[11px] text-ink-muted">Active curated volumes</span>
          </div>

          <div className="bg-paper-light border border-paper-border rounded-lg p-5 shadow-paper">
            <div className="flex items-center justify-between text-ink-subtle mb-2">
              <span className="text-[10px] uppercase tracking-wide-label font-bold">Readers Registered</span>
              <Users className="w-4 h-4 text-forest" />
            </div>
            <p className="font-serif text-3xl font-bold text-ink">{stats?.totalCustomers || 0}</p>
            <span className="text-[11px] text-ink-muted">Registered reader accounts</span>
          </div>

          <div className="bg-paper-light border border-paper-border rounded-lg p-5 shadow-paper">
            <div className="flex items-center justify-between text-ink-subtle mb-2">
              <span className="text-[10px] uppercase tracking-wide-label font-bold">Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-ink" />
            </div>
            <p className="font-serif text-3xl font-bold text-ink">{stats?.totalOrders || 0}</p>
            <span className="text-[11px] text-ink-muted">Dispatches recorded</span>
          </div>

          <div className="bg-paper-light border border-paper-border rounded-lg p-5 shadow-paper">
            <div className="flex items-center justify-between text-ink-subtle mb-2">
              <span className="text-[10px] uppercase tracking-wide-label font-bold">Gross Book Revenue</span>
              <DollarSign className="w-4 h-4 text-terracotta" />
            </div>
            <p className="font-serif text-3xl font-bold text-terracotta">
              ${stats?.totalRevenue ? Number(stats.totalRevenue).toFixed(2) : '0.00'}
            </p>
            <span className="text-[11px] text-ink-muted">Settled order transactions</span>
          </div>
        </div>
      )}

      {/* 2. Revenue Chart (Recharts) */}
      <div className="bg-paper-light border border-paper-border rounded-lg p-6 sm:p-8 shadow-paper">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-terracotta" />
              <span>Revenue Trend & Order Velocity</span>
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Settled order values tracked across recent transactions.
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-terracotta bg-terracotta/10 px-2.5 py-1 rounded">
            Gross ${stats?.totalRevenue ? Number(stats.totalRevenue).toFixed(2) : '0.00'}
          </span>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="terracottaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B5472B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#B5472B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8DFC8" />
              <XAxis dataKey="name" stroke="#666358" fontSize={11} tickLine={false} />
              <YAxis stroke="#666358" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FAF6EF',
                  borderColor: '#E8DFC8',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  fontSize: '12px',
                }}
                formatter={(val) => [`$${Number(val).toFixed(2)}`, 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#B5472B"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#terracottaGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Two Columns: Low-Stock Alerts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Low Stock Alerts */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-paper-border pb-3">
            <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-terracotta" />
              <span>Low-Stock Inventory (&lt; 5 copies)</span>
            </h3>
            <span className="text-xs font-semibold text-terracotta">
              {stats?.lowStockBooks?.length || 0} Alert(s)
            </span>
          </div>

          {stats?.lowStockBooks && stats.lowStockBooks.length > 0 ? (
            <div className="bg-paper-light border border-paper-border rounded-lg divide-y divide-paper-border shadow-paper">
              {stats.lowStockBooks.map((book) => (
                <div key={book.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-ink truncate">{book.title}</h4>
                    <p className="text-ink-muted truncate">{book.author}</p>
                    <span className="inline-block mt-1 font-mono font-bold text-terracotta">
                      {book.stock} remaining in bindery
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openStockModal(book)}
                    className="shrink-0 text-xs"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Adjust
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-paper-light border border-paper-border rounded-lg p-6 text-center text-xs text-ink-muted">
              All inventory levels are currently above minimum bindery thresholds.
            </div>
          )}
        </div>

        {/* Recent Orders Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-paper-border pb-3">
            <h3 className="font-serif text-lg font-bold text-ink">
              Recent Dispatches
            </h3>
            <Link
              to="/admin/orders"
              className="text-xs uppercase tracking-wide-label font-bold text-terracotta hover:underline inline-flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.last5Orders && stats.last5Orders.length > 0 ? (
            <div className="bg-paper-light border border-paper-border rounded-lg divide-y divide-paper-border shadow-paper overflow-hidden">
              {stats.last5Orders.map((order) => (
                <div key={order.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-ink">#ORD-{order.id}</span>
                      <span className={`px-2 py-0.5 text-[10px] uppercase font-bold border rounded-sm ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-ink-muted">
                      Reader: <strong className="text-ink">{order.userName || order.userEmail}</strong>
                    </p>
                    <p className="text-[11px] text-ink-subtle truncate max-w-sm mt-0.5">
                      {order.shippingAddress}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <span className="font-serif text-sm font-bold text-terracotta">
                      ${Number(order.totalAmount).toFixed(2)}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      className="text-xs bg-paper border border-paper-border rounded px-2 py-1 text-ink outline-none cursor-pointer"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-paper-light border border-paper-border rounded-lg p-6 text-center text-xs text-ink-muted">
              No orders have been recorded in the database yet.
            </div>
          )}
        </div>

      </div>

      {/* Quick Stock Modal */}
      <Modal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        title="Adjust Book Inventory"
        description={selectedBook ? `Update warehouse stock count for "${selectedBook.title}".` : ''}
      >
        <form onSubmit={handleStockSubmit} className="space-y-4">
          <Input
            label="Current Available Stock"
            type="number"
            min="0"
            value={newStock}
            onChange={(e) => setNewStock(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-paper-border">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setStockModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={updatingStock}
            >
              Save Count
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
