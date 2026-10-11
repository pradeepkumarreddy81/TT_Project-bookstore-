import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '@/api/client';
import BookCard from '@/components/shared/BookCard';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { useCart } from '@/context/CartContext';
import { ArrowRight, ShoppingBag, BookOpen, Sparkles, Compass } from 'lucide-react';

export default function HomePage() {
  const { addToCart } = useCart();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [booksRes, catRes] = await Promise.all([
          client.get('/books', { params: { page: 0, size: 12, sortBy: 'createdAt', sortDir: 'desc' } }),
          client.get('/categories'),
        ]);
        setBooks(booksRes.data?.data?.content || []);
        setCategories(catRes.data?.data || []);
      } catch (err) {
        console.warn('Failed to load home data:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featuredBook = books[0] || null;
  const newArrivals = books.slice(1, 5);
  const staffPicks = books.slice(5, 9);

  return (
    <div className="font-sans">
      
      {/* 1. EDITORIAL HERO WITH OVERLAPPING COVER */}
      <section className="relative border-b border-paper-border bg-paper-muted/30 overflow-hidden py-16 sm:py-24">
        {/* Subtle background paper grid watermark */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Left-aligned large serif headline & human tagline */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 text-[11px] uppercase tracking-wide-label font-bold text-terracotta bg-terracotta/10 border border-terracotta/20 rounded-sm mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The 2026 Archival Collection</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-ink font-bold tracking-tight-title leading-[1.05] mb-6">
                Books for those who re-read the margins.
              </h1>

              <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-xl mb-8">
                An independent press and curatorship devoted to physical books, unhurried reading, and deliberate thought. Every volume is selected for enduring literary craft.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link to="/books">
                  <Button variant="primary" size="lg" className="h-12 px-6">
                    <span>Explore Complete Catalogue</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/books?sortBy=price&sortDir=asc">
                  <Button variant="outline" size="lg" className="h-12 px-6">
                    Browse Editions
                  </Button>
                </Link>
              </div>

              {/* Colophon notes strip */}
              <div className="mt-12 pt-8 border-t border-paper-border/80 grid grid-cols-3 gap-6 max-w-lg text-xs">
                <div>
                  <span className="font-serif text-lg font-bold text-ink block">20+</span>
                  <span className="text-ink-muted text-[11px]">Curated Volumes</span>
                </div>
                <div>
                  <span className="font-serif text-lg font-bold text-ink block">5</span>
                  <span className="text-ink-muted text-[11px]">Distinct Departments</span>
                </div>
                <div>
                  <span className="font-serif text-lg font-bold text-forest block">100%</span>
                  <span className="text-ink-muted text-[11px]">Archival Binding</span>
                </div>
              </div>
            </div>

            {/* Right Column: Featured Book with Overlapping Cover */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              {loading || !featuredBook ? (
                <div className="w-full max-w-sm aspect-[3/4] bg-paper-light border border-paper-border rounded p-4 shadow-book animate-pulse" />
              ) : (
                <div className="relative w-full max-w-sm group">
                  {/* Decorative backdrop shadow card */}
                  <div className="absolute inset-0 bg-terracotta/10 rounded-lg -rotate-2 scale-[1.02] transform transition-transform group-hover:-rotate-3 duration-300 -z-10 border border-terracotta/20" />

                  {/* Overlapping Featured Card */}
                  <div className="bg-paper-light border border-paper-border rounded-lg p-5 sm:p-6 shadow-book-hover transition-all duration-300">
                    <div className="relative aspect-[3/4] overflow-hidden rounded bg-paper-muted border border-paper-border mb-5">
                      <img
                        src={featuredBook.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
                        alt={featuredBook.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] uppercase tracking-wide-label font-bold bg-paper/95 border border-paper-border text-ink rounded-sm shadow-xs">
                        {featuredBook.categoryName || 'Featured Folio'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-wide-label text-ink-subtle block mb-1">
                        Curator Spotlight
                      </span>
                      <h3 className="font-serif text-xl font-bold text-ink hover:text-terracotta transition-colors line-clamp-1 mb-1">
                        <Link to={`/books/${featuredBook.id}`}>{featuredBook.title}</Link>
                      </h3>
                      <p className="text-xs text-ink-muted italic mb-4">
                        by {featuredBook.author}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-paper-border">
                        <span className="font-serif text-xl font-bold text-terracotta">
                          ${Number(featuredBook.price).toFixed(2)}
                        </span>
                        <Link to={`/books/${featuredBook.id}`}>
                          <Button variant="outline" size="sm" className="hover:bg-terracotta hover:border-terracotta hover:text-paper">
                            <BookOpen className="w-3.5 h-3.5 mr-1" />
                            Read Folio
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 2. NEW ARRIVALS ROW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-b border-paper-border">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-10">
          <div>
            <span className="text-xs uppercase tracking-wide-label font-bold text-terracotta block mb-1">
              Fresh From The Press
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight-title">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/books?sortBy=createdAt&sortDir=desc"
            className="inline-flex items-center text-xs uppercase tracking-wide-label text-ink font-semibold hover:text-terracotta transition-colors group"
          >
            <span>View All Recent Editions</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-paper-light border border-paper-border rounded p-4">
                <Skeleton className="w-full aspect-[3/4] mb-4" />
                <Skeleton className="w-1/3 h-3 mb-2" />
                <Skeleton className="w-full h-5 mb-2" />
                <Skeleton className="w-2/3 h-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {newArrivals.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* 3. BROWSE BY CATEGORY AS TYPOGRAPHIC LINKS (NOT ICON CARDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-b border-paper-border bg-paper-muted/20">
        <div className="max-w-2xl mb-12">
          <span className="text-xs uppercase tracking-wide-label font-bold text-forest block mb-1">
            Department Directory
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight-title mb-3">
            Browse by Category
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            Every section represents a disciplined inquiry into ideas, literature, and technology. Select a department to explore its curated volumes.
          </p>
        </div>

        {/* Typographic directory index */}
        <div className="divide-y divide-paper-border border-y border-paper-border">
          {categories.map((cat, index) => (
            <Link
              key={cat.id}
              to={`/books?categoryId=${cat.id}`}
              className="group py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-paper-light/70 px-4 sm:px-6 -mx-4 sm:-mx-6"
            >
              <div className="flex items-baseline gap-6 sm:gap-8">
                <span className="font-mono text-xs sm:text-sm text-terracotta font-semibold">
                  {String(index + 1).padStart(2, '0')}.
                </span>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-ink group-hover:text-terracotta transition-colors">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-xl font-sans">
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs uppercase tracking-wide-label font-bold text-ink-subtle group-hover:text-terracotta transition-colors self-end sm:self-center shrink-0">
                <span>Explore Department</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. STAFF PICKS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="border-b border-paper-border pb-6 mb-10 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wide-label font-bold text-terracotta block mb-1">
              Curator's Recommendation
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight-title">
              Staff Picks
            </h2>
          </div>
          <p className="text-xs text-ink-muted max-w-md">
            Hand-selected by our editorial desk for exceptional typesetting, originality of thesis, or narrative grace.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {staffPicks.map((book) => (
              <div key={book.id} className="flex flex-col">
                <BookCard book={book} />
                <div className="mt-2.5 px-3 py-2 bg-paper-muted/50 border border-paper-border rounded text-[11px] text-ink-muted italic font-serif">
                  “Essential reading for anyone interested in timeless design and structural thinking.”
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
