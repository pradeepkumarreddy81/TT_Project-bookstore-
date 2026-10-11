import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Pagination({
  currentPage = 0,
  totalPages = 1,
  onPageChange,
  className,
}) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav
      className={cn('flex items-center justify-center gap-1.5 font-sans my-8', className)}
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="h-9 px-3 flex items-center justify-center gap-1 text-sm font-medium border border-paper-border bg-paper-light hover:bg-paper-muted text-ink rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p) => {
          // Show first, last, and current +- 1
          if (p === 0 || p === totalPages - 1 || Math.abs(p - currentPage) <= 1) {
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={cn(
                  'w-9 h-9 flex items-center justify-center text-sm font-medium rounded transition-colors',
                  isActive
                    ? 'bg-terracotta text-paper-light border border-terracotta'
                    : 'border border-paper-border bg-paper-light hover:bg-paper-muted text-ink'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {p + 1}
              </button>
            );
          }
          if (p === currentPage - 2 || p === currentPage + 2) {
            return (
              <span key={p} className="px-1.5 text-ink-subtle select-none">
                &hellip;
              </span>
            );
          }
          return null;
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="h-9 px-3 flex items-center justify-center gap-1 text-sm font-medium border border-paper-border bg-paper-light hover:bg-paper-muted text-ink rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
