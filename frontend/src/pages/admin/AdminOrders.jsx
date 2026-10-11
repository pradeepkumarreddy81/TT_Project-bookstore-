import React, { useState, useEffect } from 'react';
import client from '@/api/client';
import { useToast } from '@/context/ToastContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import OrderTimeline from '@/components/shared/OrderTimeline';
import { ShoppingBag, Eye, MapPin, Calendar, Clock, CheckCircle2 } from 'lucide-react';

export default function AdminOrders() {
  useDocumentTitle('Orders & Dispatches');
  const { success, error: showError } = useToast();

  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: 10,
        sortBy: 'createdAt',
        sortDir: 'desc',
      };
      if (statusFilter) {
        params.status = statusFilter;
      }
      const res = await client.get('/admin/orders', { params });
      const data = res.data?.data;
      setOrders(data?.content || []);
      setTotalPages(data?.totalPages || 1);
      setTotalElements(data?.totalElements || 0);
    } catch {
      showError('Failed to load dispatches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter]);

  // Optimistic UI Status Update
  const handleStatusChange = async (orderId, newStatus) => {
    const prevOrders = [...orders];
    // Optimistically update
    setOrders((current) =>
      current.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((curr) => ({ ...curr, status: newStatus }));
    }

    try {
      await client.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      success(`Order #ORD-${orderId} updated to ${newStatus}`);
    } catch (err) {
      // Rollback on failure
      setOrders(prevOrders);
      showError('Failed to update order status. Rolled back changes.');
    }
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
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
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-paper-border pb-6">
        <div>
          <span className="text-xs uppercase tracking-wide-label font-bold text-terracotta block mb-1">
            Dispatch Registry
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight-title">
            Orders & Courier Dispatches ({totalElements})
          </h2>
        </div>

        {/* Filter by Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide-label text-ink-muted font-bold">
            Status Filter:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(0);
            }}
            className="text-xs bg-paper-light border border-paper-border rounded px-3 py-1.5 text-ink outline-none cursor-pointer hover:border-ink transition-colors shadow-paper"
            aria-label="Filter orders by status"
          >
            <option value="">All Orders</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="bg-paper-light border border-paper-border rounded-lg shadow-paper overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-paper-muted border-b border-paper-border text-[10px] uppercase tracking-wide-label text-ink-subtle">
              <tr>
                <th className="px-5 py-3.5">Order Ref</th>
                <th className="px-5 py-3.5">Reader</th>
                <th className="px-5 py-3.5">Destination</th>
                <th className="px-5 py-3.5">Total Amount</th>
                <th className="px-5 py-3.5">Status (Optimistic)</th>
                <th className="px-5 py-3.5 text-right">Manifest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-border text-ink">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-paper/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-ink">
                    #ORD-{order.id}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-ink block">{order.userName || 'Anonymous Reader'}</span>
                    <span className="text-ink-muted text-[11px] block">{order.userEmail}</span>
                  </td>
                  <td className="px-5 py-4 max-w-xs truncate text-ink-muted">
                    {order.shippingAddress}
                  </td>
                  <td className="px-5 py-4 font-serif font-bold text-terracotta">
                    ${Number(order.totalAmount).toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-xs border rounded px-2.5 py-1 font-semibold outline-none cursor-pointer shadow-xs ${getStatusBadge(
                        order.status
                      )}`}
                      aria-label={`Update status for order ${order.id}`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetails(order)}
                      className="text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="No Orders Located"
          description="No customer dispatches match the specified status criteria."
          actionLabel="Clear Filter"
          onAction={() => setStatusFilter('')}
        />
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => setCurrentPage(p)}
      />

      {/* Order Details Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedOrder ? `Dispatch Manifest #ORD-${selectedOrder.id}` : ''}
        description="Comprehensive customer dispatch details and item breakdown."
        maxWidth="max-w-2xl"
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs text-ink font-sans">
            {/* Timeline */}
            <div className="p-4 bg-paper-light border border-paper-border rounded">
              <OrderTimeline status={selectedOrder.status} createdAt={selectedOrder.createdAt} />
            </div>

            {/* Address & Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-paper-muted/50 border border-paper-border rounded">
              <div>
                <span className="text-[10px] uppercase tracking-wide-label text-ink-subtle block mb-1">
                  Recipient & Address
                </span>
                <p className="font-semibold text-ink">{selectedOrder.userName} ({selectedOrder.userEmail})</p>
                <p className="text-ink-muted mt-0.5">{selectedOrder.shippingAddress}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wide-label text-ink-subtle block mb-1">
                  Order Registration Time
                </span>
                <p className="text-ink">
                  {new Date(selectedOrder.createdAt).toLocaleString('en-US')}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wide-label text-ink-subtle">Status:</span>
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-bold border rounded-sm ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="text-xs uppercase tracking-wide-label font-bold text-ink mb-3">
                Purchased Editions ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-paper-border border border-paper-border rounded bg-paper-light">
                {selectedOrder.items?.map((it) => (
                  <div key={it.id} className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={it.bookImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80'}
                        alt={it.bookTitle}
                        className="w-8 h-11 object-cover rounded border border-paper-border shrink-0 bg-paper-muted"
                      />
                      <div>
                        <p className="font-serif font-bold text-ink">{it.bookTitle}</p>
                        <p className="text-[11px] text-ink-muted">{it.bookAuthor}</p>
                        <span className="text-[10px] text-ink-subtle font-mono">
                          {it.quantity} × ${Number(it.priceAtPurchase).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <span className="font-serif font-bold text-terracotta">
                      ${Number(it.subtotal).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-baseline pt-3 border-t border-paper-border">
              <span className="font-serif text-sm font-bold text-ink">Total Settlement</span>
              <span className="font-serif text-xl font-bold text-terracotta">
                ${Number(selectedOrder.totalAmount).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-end pt-4 border-t border-paper-border">
              <Button variant="outline" size="sm" onClick={() => setDetailModalOpen(false)}>
                Close Manifest
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
