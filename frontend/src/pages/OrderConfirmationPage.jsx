import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import client from '@/api/client';
import OrderTimeline from '@/components/shared/OrderTimeline';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { CheckCircle2, Package, ArrowRight, Printer, MapPin, Calendar, Clock } from 'lucide-react';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadOrder() {
      if (order) return;
      setLoading(true);
      try {
        const res = await client.get(`/orders/${id}`);
        setOrder(res.data?.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to retrieve order details.');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id, order]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 font-sans">
        <Skeleton className="w-64 h-8 mb-4 mx-auto" />
        <Skeleton className="w-96 h-4 mb-12 mx-auto" />
        <Skeleton className="w-full h-64 rounded" />
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 font-sans">
        <EmptyState
          icon={Package}
          title="Order Not Located"
          description="We could not retrieve the dispatch details for this reference number."
          actionLabel="View All Orders"
          actionLink="/orders"
        />
      </main>
    );
  }

  const dateFormatted = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Just now';

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 font-sans">
      
      {/* Editorial Confirmation Card */}
      <div className="bg-paper-light border border-paper-border rounded-lg p-6 sm:p-10 shadow-book mb-10">
        
        {/* Header Hero */}
        <div className="text-center pb-8 border-b border-paper-border">
          <div className="w-14 h-14 mx-auto mb-4 bg-forest/15 text-forest rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs uppercase tracking-wide-label font-bold text-forest block mb-1">
            Dispatch Registry Confirmed
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight-title mb-2">
            Thank You For Your Order
          </h1>
          <p className="font-mono text-sm font-semibold text-terracotta">
            Reference #ORD-{order.id}
          </p>
          <p className="text-xs sm:text-sm text-ink-muted mt-3 max-w-lg mx-auto leading-relaxed">
            Your editions have been allocated. Our curators will hand-inspect the binding and enclose them in archival paper before courier collection.
          </p>
        </div>

        {/* Milestone Timeline */}
        <div className="py-8 border-b border-paper-border">
          <h2 className="text-xs uppercase tracking-wide-label font-bold text-ink mb-4 text-center sm:text-left">
            Dispatch Timeline & Progress
          </h2>
          <OrderTimeline status={order.status || 'PENDING'} createdAt={order.createdAt} />
        </div>

        {/* Destination & Meta Strip */}
        <div className="py-6 border-b border-paper-border grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wide-label text-ink-subtle block mb-1">
              Registered Dispatch Destination
            </span>
            <div className="flex items-start gap-2 text-ink">
              <MapPin className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
              <span>{order.shippingAddress}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wide-label text-ink-subtle block mb-1">
              Acquisition Date
            </span>
            <div className="flex items-center gap-2 text-ink">
              <Calendar className="w-4 h-4 text-forest shrink-0" />
              <span>{dateFormatted}</span>
            </div>
          </div>
        </div>

        {/* Items Manifest */}
        <div className="py-6 border-b border-paper-border">
          <h3 className="text-xs uppercase tracking-wide-label font-bold text-ink mb-4">
            Folio Receipt & Editions
          </h3>

          <div className="divide-y divide-paper-border">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.bookImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'}
                    alt={item.bookTitle}
                    className="w-10 h-14 object-cover rounded border border-paper-border shrink-0 bg-paper-muted"
                  />
                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-ink truncate">{item.bookTitle}</h4>
                    <p className="text-[11px] text-ink-muted truncate">{item.bookAuthor}</p>
                    <span className="text-[10px] text-ink-subtle">
                      {item.quantity} × ${Number(item.priceAtPurchase).toFixed(2)}
                    </span>
                  </div>
                </div>

                <span className="font-serif font-bold text-ink shrink-0">
                  ${Number(item.subtotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Strip */}
        <div className="pt-6 flex justify-between items-baseline text-sm">
          <span className="font-serif font-bold text-ink">Total Settled</span>
          <span className="font-serif text-2xl font-bold text-terracotta">
            ${Number(order.totalAmount).toFixed(2)}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-10 pt-6 border-t border-paper-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/orders">
            <Button variant="outline" size="md">
              <span>View All My Orders</span>
            </Button>
          </Link>

          <Link to="/books">
            <Button variant="primary" size="md">
              <span>Continue Exploring Catalogue</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

      </div>

    </main>
  );
}
