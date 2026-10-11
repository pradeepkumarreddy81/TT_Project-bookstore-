import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, BookOpen } from 'lucide-react';

export default function CartPage() {
  const { cart, loading: cartLoading, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  if (cartLoading && isEmpty) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans">
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs uppercase tracking-wide-label text-ink-muted">Retrieving your reading bag...</p>
        </div>
      </main>
    );
  }

  if (isEmpty) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans">
        <EmptyState
          icon={ShoppingBag}
          title="Your Reading Bag is Empty"
          description="You haven't selected any editions yet. Explore our curated catalog to discover classic works and new arrivals."
          actionLabel="Explore Complete Catalogue"
          actionLink="/books"
        />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {/* Page Header */}
      <div className="border-b border-paper-border pb-6 mb-10 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wide-label font-bold text-terracotta block mb-1">
            Order Review
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight-title">
            Your Reading Bag
          </h1>
        </div>
        <p className="text-xs text-ink-muted">
          {cart.totalItems} {cart.totalItems === 1 ? 'volume' : 'volumes'} selected
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8">
          <div className="space-y-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-paper-light border border-paper-border rounded p-4 sm:p-5 flex gap-4 sm:gap-6 shadow-paper"
              >
                {/* Book Cover Thumbnail */}
                <Link
                  to={`/books/${item.bookId}`}
                  className="w-20 sm:w-24 aspect-[3/4] bg-paper-muted border border-paper-border rounded overflow-hidden shrink-0 group"
                >
                  <img
                    src={item.bookImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80'}
                    alt={`Cover of ${item.bookTitle}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </Link>

                {/* Details & Controls */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase tracking-wide-label text-ink-subtle block">
                          {item.bookAuthor}
                        </span>
                        <h2 className="font-serif text-base sm:text-lg font-medium text-ink hover:text-terracotta transition-colors leading-snug">
                          <Link to={`/books/${item.bookId}`}>{item.bookTitle}</Link>
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-ink-subtle hover:text-terracotta transition-colors p-1"
                        title="Remove from bag"
                        aria-label={`Remove ${item.bookTitle} from bag`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-xs text-ink-muted mt-1">
                      Unit Price: ${Number(item.bookPrice).toFixed(2)}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-paper-border flex items-center justify-between">
                    {/* Stepper */}
                    <div className="flex items-center border border-paper-border rounded bg-paper h-9 w-28 justify-between px-1.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                        className="p-1 text-ink hover:text-terracotta disabled:opacity-30 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-xs font-semibold text-ink">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-ink hover:text-terracotta transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <span className="font-serif text-base font-bold text-terracotta">
                        ${Number(item.subtotal).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between items-center pt-4 border-t border-paper-border">
            <Link
              to="/books"
              className="text-xs uppercase tracking-wide-label text-ink hover:text-terracotta underline underline-offset-4 font-semibold"
            >
              &larr; Continue Exploring Catalogue
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="text-xs uppercase tracking-wide-label text-ink-muted hover:text-terracotta transition-colors"
            >
              Clear Entire Bag
            </button>
          </div>
        </div>

        {/* Right Column: Sticky Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-paper-light border border-paper-border rounded p-6 sm:p-8 shadow-book sticky top-24">
            <h2 className="font-serif text-xl font-bold text-ink tracking-tight-title pb-4 border-b border-paper-border">
              Order Summary
            </h2>

            <div className="py-5 space-y-3.5 text-xs text-ink-muted border-b border-paper-border">
              <div className="flex justify-between">
                <span>Volumes Subtotal</span>
                <span className="text-ink font-mono font-medium">
                  ${Number(cart.totalPrice).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tracked Courier Delivery</span>
                <span className="text-forest font-semibold uppercase tracking-wider text-[11px]">
                  Complimentary
                </span>
              </div>
              <div className="flex justify-between">
                <span>Acid-Free Archival Wrap</span>
                <span className="text-forest font-semibold uppercase tracking-wider text-[11px]">
                  Included
                </span>
              </div>
            </div>

            <div className="py-5 flex justify-between items-baseline border-b border-paper-border">
              <span className="font-serif text-base font-bold text-ink">Estimated Total</span>
              <span className="font-serif text-2xl font-bold text-terracotta">
                ${Number(cart.totalPrice).toFixed(2)}
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full mt-6"
              onClick={() => navigate('/checkout')}
            >
              <span>Proceed to Dispatch</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <div className="mt-6 pt-6 border-t border-paper-border space-y-2 text-[11px] text-ink-subtle">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-forest shrink-0" />
                <span>Immediate 24-hour dispatch from bindery.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-forest shrink-0" />
                <span>Full transit loss and damage guarantee.</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
