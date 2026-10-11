import React, { useState, useEffect } from 'react';
import client from '@/api/client';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import {
  ShieldCheck,
  BookOpen,
  Users,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Edit2,
  Clock,
  MapPin,
  CheckCircle,
} from 'lucide-react';

export default function AdminPage() {
  const { success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'customers' | 'books'
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Orders Tab State
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [ordersPage, setOrdersPage] = useState(0);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Customers Tab State
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Stock update modal state
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedBookForStock, setSelectedBookForStock] = useState(null);
  const [newStockValue, setNewStockValue] = useState(0);
  const [updatingStock, setUpdatingStock] = useState(false);

  // Fetch Dashboard Stats
  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const res = await client.get('/admin/dashboard');
      setStats(res.data.data);
    } catch (err) {
      showError('Failed to load dashboard statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Orders
  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const params = {
        page: ordersPage,
        size: 8,
      };
      if (orderStatusFilter) {
        params.status = orderStatusFilter;
      }
      const res = await client.get('/admin/orders', { params });
      setOrders(res.data.data.content || []);
      setOrdersTotalPages(res.data.data.totalPages || 1);
    } catch (err) {
      showError('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch Customers
  const loadCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const res = await client.get('/admin/customers');
      setCustomers(res.data.data || []);
    } catch (err) {
      showError('Failed to load customers');
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'customers') {
      loadCustomers();
    }
  }, [activeTab, ordersPage, orderStatusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await client.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      success(`Order #${orderId} marked as ${newStatus}`);
      if (activeTab === 'orders') {
        loadOrders();
      } else {
        loadStats();
      }
    } catch (err) {
      showError('Failed to update order status');
    }
  };

  const openStockModal = (book) => {
    setSelectedBookForStock(book);
    setNewStockValue(book.stock);
    setStockModalOpen(true);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookForStock) return;
    setUpdatingStock(true);
    try {
      await client.patch(`/admin/books/${selectedBookForStock.id}/stock`, {
        stock: parseInt(newStockValue, 10),
      });
      success(`Inventory for "${selectedBookForStock.title}" updated to ${newStockValue}`);
      setStockModalOpen(false);
      loadStats();
    } catch (err) {
      showError('Failed to update book inventory');
    } finally {
      setUpdatingStock(false);
    }
  };

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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-paper-border pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide-label font-bold text-forest mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Curator Studio & Operations</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight-title">
            Atelier Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="paper"
            size="sm"
            onClick={() => {
              loadStats();
              if (activeTab === 'orders') loadOrders();
              if (activeTab === 'customers') loadCustomers();
            }}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      {loadingStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <div className="bg-paper-light border border-paper-border rounded p-5 shadow-paper">
            <div className="flex items-center justify-between text-ink-subtle mb-2">
              <span className="text-[10px] uppercase tracking-wide-label font-bold">Catalogue Titles</span>
              <BookOpen className="w-4 h-4 text-terracotta" />
            </div>
            <p className="font-serif text-3xl font-bold text-ink">{stats?.totalBooks || 0}</p>
            <span className="text-[11px] text-ink-muted">Active curated volumes</span>
          </div>

          <div className="bg-paper-light border border-paper-border rounded p-5 shadow-paper">
            <div className="flex items-center justify-between text-ink-subtle mb-2">
              <span className="text-[10px] uppercase tracking-wide-label font-bold">Registered Readers</span>
              <Users className="w-4 h-4 text-forest" />
            </div>
            <p className="font-serif text-3xl font-bold text-ink">{stats?.totalCustomers || 0}</p>
            <span className="text-[11px] text-ink-muted">Accounts created</span>
          </div>

          <div className="bg-paper-light border border-paper-border rounded p-5 shadow-paper">
            <div className="flex items-center justify-between text-ink-subtle mb-2">
              <span className="text-[10px] uppercase tracking-wide-label font-bold">Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-ink" />
            </div>
            <p className="font-serif text-3xl font-bold text-ink">{stats?.totalOrders || 0}</p>
            <span className="text-[11px] text-ink-muted">Dispatches logged</span>
          </div>

          <div className="bg-paper-light border border-paper-border rounded p-5 shadow-paper">
            <div className="flex items-center justify-between text-ink-subtle mb-2">
              <span className="text-[10px] uppercase tracking-wide-label font-bold">Gross Revenue</span>
              <DollarSign className="w-4 h-4 text-terracotta" />
            </div>
            <p className="font-serif text-3xl font-bold text-terracotta">
              ${stats?.totalRevenue ? Number(stats.totalRevenue).toFixed(2) : '0.00'}
            </p>
            <span className="text-[11px] text-ink-muted">Historical book sales</span>
          </div>
        </div>
      )}

      {/* Studio Navigation Tabs */}
      <div className="border-b border-paper-border mb-8 flex gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs uppercase tracking-wide-label font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'overview'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Inventory & Recent
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 text-xs uppercase tracking-wide-label font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'orders'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Order Registry
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2.5 text-xs uppercase tracking-wide-label font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'customers'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Reader Registry
        </button>
      </div>

      {/* Tab 1: Overview (Low Stock Alerts + Last 5 Orders) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Low Stock Watchlist */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-terracotta" />
                <span>Low Stock Watchlist (&lt; 5 copies)</span>
              </h2>
              <span className="text-xs text-ink-muted">
                {stats?.lowStockBooks?.length || 0} alerts
              </span>
            </div>

            {stats?.lowStockBooks && stats.lowStockBooks.length > 0 ? (
              <div className="bg-paper-light border border-paper-border rounded divide-y divide-paper-border shadow-paper">
                {stats.lowStockBooks.map((book) => (
                  <div key={book.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-serif text-sm font-semibold text-ink truncate">
                        {book.title}
                      </h3>
                      <p className="text-xs text-ink-muted truncate">{book.author}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase tracking-wide-label font-bold text-terracotta">
                        Stock: {book.stock} remaining
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
              <div className="bg-paper-light border border-paper-border rounded p-6 text-center text-xs text-ink-muted">
                All cataloged volumes maintain sufficient archival inventory.
              </div>
            )}
          </div>

          {/* Last 5 Orders Quick Management */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-serif text-lg font-bold text-ink">
              Recent Dispatches
            </h2>

            {stats?.last5Orders && stats.last5Orders.length > 0 ? (
              <div className="bg-paper-light border border-paper-border rounded divide-y divide-paper-border shadow-paper overflow-hidden">
                {stats.last5Orders.map((order) => (
                  <div key={order.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-xs text-ink">#ORD-{order.id}</span>
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold border rounded-sm ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted">
                        Reader: <strong className="text-ink">{order.userName || order.userEmail}</strong> • {order.items?.length || 0} items
                      </p>
                      <p className="text-[11px] text-ink-subtle mt-0.5 truncate max-w-sm">
                        Address: {order.shippingAddress}
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
                        aria-label={`Update status for order ${order.id}`}
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
              <div className="bg-paper-light border border-paper-border rounded p-6 text-center text-xs text-ink-muted">
                No orders have been recorded in the system yet.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 2: Orders Registry */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Status Filter */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide-label text-ink-muted font-bold">
                Filter by Status:
              </span>
              <select
                value={orderStatusFilter}
                onChange={(e) => {
                  setOrderStatusFilter(e.target.value);
                  setOrdersPage(0);
                }}
                className="text-xs bg-paper-light border border-paper-border rounded px-3 py-1.5 text-ink outline-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {loadingOrders ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded" />
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="bg-paper-light border border-paper-border rounded divide-y divide-paper-border shadow-paper">
              {orders.map((order) => (
                <div key={order.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-ink">#ORD-{order.id}</span>
                      <span className={`px-2 py-0.5 text-[10px] uppercase font-bold border rounded-sm ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-ink">
                      Customer: <strong>{order.userName}</strong> ({order.userEmail})
                    </p>
                    <p className="text-xs text-ink-muted">
                      Destination: {order.shippingAddress}
                    </p>
                    <p className="text-[11px] text-ink-subtle">
                      Items: {order.items?.map((it) => `${it.bookTitle} (x${it.quantity})`).join(', ')}
                    </p>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
                    <span className="font-serif text-base font-bold text-terracotta">
                      ${Number(order.totalAmount).toFixed(2)}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      className="text-xs bg-paper border border-paper-border rounded px-2.5 py-1 text-ink outline-none cursor-pointer"
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
            <EmptyState
              icon={ShoppingBag}
              title="No Orders Match Criteria"
              description="No customer dispatches were found under the selected filters."
            />
          )}

          <Pagination
            currentPage={ordersPage}
            totalPages={ordersTotalPages}
            onPageChange={(p) => setOrdersPage(p)}
          />
        </div>
      )}

      {/* Tab 3: Customer Registry */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          {loadingCustomers ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded" />
              ))}
            </div>
          ) : customers.length > 0 ? (
            <div className="bg-paper-light border border-paper-border rounded shadow-paper overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-paper-muted border-b border-paper-border text-[10px] uppercase tracking-wide-label text-ink-subtle">
                  <tr>
                    <th className="px-5 py-3.5">ID</th>
                    <th className="px-5 py-3.5">Reader Name</th>
                    <th className="px-5 py-3.5">Email Address</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Orders Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-border text-ink">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-paper/40 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-ink-subtle">{c.id}</td>
                      <td className="px-5 py-4 font-medium text-ink">{c.name}</td>
                      <td className="px-5 py-4 text-ink-muted">{c.email}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm uppercase ${
                          c.role === 'ADMIN' ? 'bg-forest/15 text-forest' : 'bg-paper-muted text-ink'
                        }`}>
                          {c.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-semibold">{c.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No Readers Registered"
              description="No customer accounts exist in the database yet."
            />
          )}
        </div>
      )}

      {/* Quick Stock Adjustment Modal */}
      <Modal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        title="Adjust Inventory Stock"
        description={selectedBookForStock ? `Update available binder stock for "${selectedBookForStock.title}".` : ''}
      >
        <form onSubmit={handleStockSubmit} className="space-y-4">
          <Input
            label="Current Stock Count"
            type="number"
            min="0"
            value={newStockValue}
            onChange={(e) => setNewStockValue(e.target.value)}
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
              Save Stock Count
            </Button>
          </div>
        </form>
      </Modal>

    </main>
  );
}
