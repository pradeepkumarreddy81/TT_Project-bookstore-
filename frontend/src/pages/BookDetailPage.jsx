import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '@/api/client';
import { useCart } from '@/context/CartContext';
import BookCard from '@/components/shared/BookCard';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import {
  ArrowLeft,
  ShoppingBag,
  Truck,
  ShieldCheck,
  BookOpen,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';

export default function BookDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function loadBookAndRelated() {
      setLoading(true);
      setError(null);
      setQuantity(1);
      try {
        const res = await client.get(`/books/${id}`);
        const bookData = res.data?.data;
        setBook(bookData);

        // Load related books from the same category
        if (bookData?.categoryId) {
          try {
            const relRes = await client.get('/books', {
              params: { categoryId: bookData.categoryId, size: 5 },
            });
            const filtered = (relRes.data?.data?.content || []).filter(
              (b) => String(b.id) !== String(bookData.id)
            );
            setRelatedBooks(filtered.slice(0, 4));
          } catch {
            // Ignore related books failure
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Volume not found in archival registry');
      } finally {
        setLoading(false);
      }
    }
    loadBookAndRelated();
  }, [id]);

  const handleAddToCart = async () => {
    if (!book || book.stock <= 0) return;
    setAdding(true);
    try {
      await addToCart(book.id, quantity);
    } finally {
      setAdding(false);
    }
  };

  const handleIncrement = () => {
    if (quantity < (book?.stock || 1)) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
        <Skeleton className="w-32 h-5 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <Skeleton className="w-full aspect-[3/4] rounded" />
          </div>
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-3/4 h-10" />
            <Skeleton className="w-1/2 h-6" />
            <Skeleton className="w-28 h-8 my-4" />
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-48 h-12" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !book) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans">
        <EmptyState
          icon={BookOpen}
          title="Title Not Found"
          description="The edition you are searching for is unavailable, archived, or has been moved to another collection."
          actionLabel="Return to Catalogue"
          actionLink="/books"
        />
      </main>
    );
  }

  const isOutOfStock = book.stock <= 0;
  const isLowStock = book.stock > 0 && book.stock < 5;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans pb-24 sm:pb-10">
      {/* Breadcrumb Back Link */}
      <nav aria-label="Breadcrumb">
        <Link
          to="/books"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wide-label text-ink-muted hover:text-ink transition-colors mb-8 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Complete Catalogue
        </Link>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Left Column: Large Cover & Technical Colophon */}
        <div className="lg:col-span-5">
          <div className="bg-paper-light border border-paper-border rounded p-4 sm:p-6 shadow-book sticky top-24">
            <div className="relative aspect-[3/4] overflow-hidden rounded bg-paper-muted border border-paper-border/80">
              <img
                src={book.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
                alt={`Cover of ${book.title}`}
                className="w-full h-full object-cover object-center"
              />
              {book.categoryName && (
                <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] uppercase tracking-wide-label font-bold bg-paper/95 backdrop-blur-sm border border-paper-border text-ink rounded-sm shadow-xs">
                  {book.categoryName}
                </span>
              )}
            </div>

            {/* Specifications Sheet */}
            <div className="mt-6 pt-6 border-t border-paper-border grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wide-label text-ink-subtle block mb-1">
                  ISBN Designation
                </span>
                <span className="font-mono text-ink text-[11px]">{book.isbn || '978-0-262-03384-8'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wide-label text-ink-subtle block mb-1">
                  Department
                </span>
                <Link
                  to={`/books?categoryId=${book.categoryId}`}
                  className="text-ink font-medium hover:text-terracotta underline"
                >
                  {book.categoryName || 'General'}
                </Link>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wide-label text-ink-subtle block mb-1">
                  Binding Standard
                </span>
                <span className="text-ink">Archival Smyth-Sewn</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wide-label text-ink-subtle block mb-1">
                  Current Inventory
                </span>
                <span
                  className={
                    isOutOfStock
                      ? 'text-ink-muted'
                      : isLowStock
                      ? 'text-terracotta font-semibold'
                      : 'text-forest font-semibold'
                  }
                >
                  {isOutOfStock ? 'Sold Out' : `${book.stock} copies in bindery`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Synopsis, Buying Controls */}
        <div className="lg:col-span-7 flex flex-col justify-start">
          
          <div className="border-b border-paper-border pb-6 mb-6">
            <span className="text-xs uppercase tracking-wide-label font-bold text-terracotta mb-2 block">
              Curator's Selection
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight-title leading-[1.1] mb-3">
              {book.title}
            </h1>
            <p className="font-serif text-lg sm:text-xl text-ink-muted italic">
              by <span className="text-ink not-italic font-medium">{book.author}</span>
            </p>
          </div>

          {/* Pricing & Stock Status */}
          <div className="flex items-baseline gap-4 mb-6">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-terracotta">
              ${Number(book.price).toFixed(2)}
            </span>
            <span className="text-xs text-ink-muted uppercase tracking-wide-label">
              USD • Tax & Archival Wrap Included
            </span>
          </div>

          {/* Stock Notice Banner */}
          {isOutOfStock ? (
            <div className="bg-paper-muted border border-paper-border p-3.5 rounded text-xs text-ink-muted mb-6">
              This edition is currently out of stock. Contact our bindery for reprint notification.
            </div>
          ) : isLowStock ? (
            <div className="bg-terracotta/10 border border-terracotta/30 p-3.5 rounded text-xs text-terracotta font-medium mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Limited Stock: Only {book.stock} copies remain in the current binding.</span>
            </div>
          ) : null}

          {/* Synopsis */}
          <div className="mb-8">
            <h2 className="text-xs uppercase tracking-wide-label font-bold text-ink mb-3">
              Editorial Synopsis
            </h2>
            <div className="text-ink-muted text-sm sm:text-base leading-relaxed space-y-4">
              <p>{book.description || 'No description recorded for this edition.'}</p>
            </div>
          </div>

          {/* Quantity and Add to Cart Section (Desktop) */}
          {!isOutOfStock && (
            <div className="bg-paper-light border border-paper-border rounded p-5 mb-8 shadow-paper">
              <span className="text-xs uppercase tracking-wide-label text-ink-subtle block mb-3 font-semibold">
                Select Quantity
              </span>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                
                {/* Stepper */}
                <div className="flex items-center border border-paper-border rounded bg-paper h-12 w-36 shrink-0 justify-between px-2">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="p-1.5 text-ink hover:text-terracotta disabled:opacity-30 disabled:hover:text-ink transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-sm font-semibold text-ink select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={quantity >= book.stock}
                    className="p-1.5 text-ink hover:text-terracotta disabled:opacity-30 disabled:hover:text-ink transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Bag Button */}
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1 h-12"
                  isLoading={adding}
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add to Reading Bag (${(Number(book.price) * quantity).toFixed(2)})
                </Button>
              </div>
            </div>
          )}

          {/* Archival Service Promises */}
          <div className="border-t border-paper-border pt-6 space-y-3.5 text-xs text-ink-muted">
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-forest shrink-0" />
              <span>Complimentary tracked courier delivery for archival orders.</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
              <span>Hand-inspected binding and acid-free protective packing.</span>
            </div>
          </div>

        </div>

      </div>

      {/* Related Books Section */}
      {relatedBooks.length > 0 && (
        <section className="mt-20 pt-12 border-t border-paper-border">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <span className="text-xs uppercase tracking-wide-label font-bold text-terracotta block mb-1">
                More in this Department
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
                Related Volumes & Editions
              </h2>
            </div>
            <Link
              to={`/books?categoryId=${book.categoryId}`}
              className="text-xs uppercase tracking-wide-label text-ink hover:text-terracotta underline font-semibold"
            >
              View All {book.categoryName} &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedBooks.map((relBook) => (
              <BookCard key={relBook.id} book={relBook} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Add-to-Cart Bar on Mobile */}
      {!isOutOfStock && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper/95 backdrop-blur-md border-t border-paper-border p-3.5 flex items-center justify-between gap-3 shadow-book">
          <div className="min-w-0 flex-1">
            <h4 className="font-serif text-xs font-bold text-ink truncate leading-tight">
              {book.title}
            </h4>
            <span className="font-serif text-sm font-bold text-terracotta">
              ${(Number(book.price) * quantity).toFixed(2)}
            </span>
          </div>

          <Button
            variant="primary"
            size="md"
            className="h-10 px-4 text-xs shrink-0"
            isLoading={adding}
            onClick={handleAddToCart}
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
            Add to Bag
          </Button>
        </div>
      )}

    </main>
  );
}
