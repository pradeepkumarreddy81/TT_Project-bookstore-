import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/utils/cn';

export default function BookCard({ book, className }) {
  const { addToCart } = useCart();

  if (!book) return null;

  const isLowStock = book.stock > 0 && book.stock < 5;
  const isOutOfStock = book.stock <= 0;

  return (
    <article
      className={cn(
        'group flex flex-col bg-paper-light border border-paper-border rounded overflow-hidden shadow-paper hover:shadow-book-hover transition-all duration-200',
        className
      )}
    >
      {/* Book Cover with zoom on hover */}
      <Link
        to={`/books/${book.id}`}
        className="relative block aspect-[3/4] overflow-hidden bg-paper-muted border-b border-paper-border"
        tabIndex={-1}
      >
        <img
          src={book.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
          alt={`Cover of ${book.title}`}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
        />

        {/* Category tag */}
        {book.categoryName && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] uppercase tracking-wide-label font-semibold bg-paper/90 backdrop-blur-sm border border-paper-border text-ink rounded-sm shadow-xs">
            {book.categoryName}
          </span>
        )}

        {/* Stock alerts */}
        {isOutOfStock ? (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] uppercase tracking-wide-label font-bold bg-ink text-paper rounded-sm">
            Sold Out
          </span>
        ) : isLowStock ? (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] uppercase tracking-wide-label font-bold bg-terracotta text-paper rounded-sm">
            Only {book.stock} Left
          </span>
        ) : null}
      </Link>

      {/* Book Information */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <span className="text-xs uppercase tracking-wide-label text-ink-muted mb-1 truncate">
          {book.author}
        </span>

        <h3 className="font-serif text-base sm:text-lg font-medium text-ink leading-snug line-clamp-2 mb-2 group-hover:text-terracotta transition-colors">
          <Link to={`/books/${book.id}`}>{book.title}</Link>
        </h3>

        {book.description && (
          <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed mb-4">
            {book.description}
          </p>
        )}

        <div className="mt-auto pt-3 border-t border-paper-border flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wide-label text-ink-subtle">
              Price
            </span>
            <span className="font-serif text-lg font-bold text-terracotta">
              ${Number(book.price).toFixed(2)}
            </span>
          </div>

          <Button
            size="sm"
            variant="outline"
            disabled={isOutOfStock}
            onClick={() => addToCart(book.id, 1)}
            className="hover:bg-terracotta hover:border-terracotta hover:text-paper"
            aria-label={`Add ${book.title} to bag`}
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1" />
            Add to Bag
          </Button>
        </div>
      </div>
    </article>
  );
}
