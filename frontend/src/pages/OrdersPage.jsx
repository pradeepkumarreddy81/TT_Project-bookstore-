import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '@/api/client';
import OrderTimeline from '@/components/shared/OrderTimeline';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import { Package, Clock, MapPin, ChevronDown, ChevronUp, BookOpen, ExternalLink } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      setError(null);
      try {
        const res = await client.get('/orders');
        const list = res.data?.data || [];
        setOrders(list);
        // Expand the most recent order by default
        if (list.length > 0) {
          setExpandedOrders({ [list[0].id]: true });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve order history');
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
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

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
        <Skeleton className="w-48 h-8 mb-4" />
        <Skeleton className="w-80 h-4 mb-10" />
        <div className="space-y-6">
          <Skeleton className="w-full h-44 rounded" />
          <Skeleton className="w-full h-44 rounded" />
        </div>
      </main>
    );
  }

  if (error || orders.length === 0) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans">
        <EmptyState
          icon={Package}
          title="No Order History Found"
          description="You haven't placed any book dispatches yet. Browse our library to select your next volume."
          actionLabel="Explore Catalogue"
          actionLink="/books"
        />
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {/* Header */}
      <div className="border-b border-paper-border pb-6 mb-10">
        <span className="text-xs uppercase tracking-wide-label font-bold text-terracotta block mb-1">
          Reader History & Receipts
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight-title">
          Your Acquired Editions
        </h1>
        <p className="text-xs text-ink-muted mt-1">
          Review your past book dispatches, delivery statuses, and archival receipts.
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-8">
        {orders.map((order) => {
          const isExpanded = !!expandedOrders[order.id];
          const dateStr = order.createdAt
            ? new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'Recent';

          return (
            <div
              key={order.id}
              className="bg-paper-light border border-paper-border rounded-lg overflow-hidden shadow-book transition-all"
            >
              {/* Order Meta Bar */}
              <div className="bg-paper-muted/60 border-b border-paper-border px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wide-label text-ink-subtle block">
                      Order Reference
                    </span>
                    <span className="font-mono font-bold text-ink text-sm">#ORD-{order.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wide-label text-ink-subtle block">
                      Placed On
                    </span>
                    <span className="text-ink flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-ink-muted" />
                      {dateStr}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 text-[10px] uppercase tracking-wide-label font-bold border rounded-sm ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <span className="font-serif text-base font-bold text-terracotta">
                    ${Number(order.totalAmount).toFixed(2)}
                  </span>
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="p-1 text-ink-muted hover:text-ink transition-colors ml-1"
                    aria-label={isExpanded ? 'Collapse order' : 'Expand order'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Order Timeline Progress */}
              <div className="px-5 py-5 border-b border-paper-border bg-paper/30">
                <OrderTimeline status={order.status || 'PENDING'} createdAt={order.createdAt} />
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="divide-y divide-paper-border animate-in fade-in duration-150">
                  {/* Shipping Address */}
                  <div className="px-5 py-3.5 bg-paper/50 text-xs text-ink-muted flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-ink font-medium">Shipped to:</strong>{' '}
                      {order.shippingAddress}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="p-5 divide-y divide-paper-border">
                    {order.items?.map((item) => (
                      <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4">
                        <img
                          src={item.bookImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'}
                          alt={item.bookTitle}
                          className="w-12 h-16 object-cover rounded border border-paper-border shrink-0 bg-paper-muted"
                        />

                        <div className="flex-1 min-w-0">
                          <h2 className="font-serif text-sm font-semibold text-ink truncate">
                            <Link to={`/books/${item.bookId}`} className="hover:text-terracotta">
                              {item.bookTitle}
                            </Link>
                          </h2>
                          <p className="text-xs text-ink-muted">{item.bookAuthor}</p>
                          <p className="text-[11px] text-ink-subtle mt-1 font-mono">
                            Qty: {item.quantity} × ${Number(item.priceAtPurchase).toFixed(2)}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="font-serif text-sm font-bold text-ink">
                            ${Number(item.subtotal).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Bar */}
                  <div className="px-5 py-3.5 bg-paper-muted/30 flex items-center justify-between text-xs">
                    <span className="text-ink-muted">
                      Total {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                    </span>
                    <Link
                      to={`/orders/confirmed/${order.id}`}
                      className="text-xs uppercase tracking-wide-label font-bold text-terracotta hover:underline inline-flex items-center gap-1"
                    >
                      <span>View Printable Receipt</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
