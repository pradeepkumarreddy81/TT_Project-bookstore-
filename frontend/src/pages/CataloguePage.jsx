import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '@/api/client';
import BookCard from '@/components/shared/BookCard';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Filter, X, BookOpen, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export default function CataloguePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read state from URL query parameters
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('categoryId') || '';
  const currentSortBy = searchParams.get('sortBy') || 'createdAt';
  const currentSortDir = searchParams.get('sortDir') || 'desc';
  const currentPage = parseInt(searchParams.get('page') || '0', 10);

  // Local state for immediate typing feedback
  const [searchInput, setSearchInput] = useState(currentSearch);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Data states
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync debounced search to URL searchParams
  useEffect(() => {
    if (debouncedSearch !== currentSearch) {
      const nextParams = new URLSearchParams(searchParams);
      if (debouncedSearch.trim()) {
        nextParams.set('search', debouncedSearch.trim());
      } else {
        nextParams.delete('search');
      }
      nextParams.set('page', '0');
      setSearchParams(nextParams, { replace: true });
    }
  }, [debouncedSearch]);

  // Keep input in sync if URL changes externally
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Fetch categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await client.get('/categories');
        setCategories(res.data?.data || []);
      } catch (err) {
        console.warn('Failed to load categories:', err.message);
      }
    }
    loadCategories();
  }, []);

  // Fetch books whenever URL query params change
  useEffect(() => {
    async function loadBooks() {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          size: 9,
          sortBy: currentSortBy,
          sortDir: currentSortDir,
        };
        if (currentSearch) params.search = currentSearch;
        if (currentCategory) params.categoryId = currentCategory;

        const res = await client.get('/books', { params });
        const pageData = res.data?.data;
        setBooks(pageData?.content || []);
        setTotalPages(pageData?.totalPages || 1);
        setTotalElements(pageData?.totalElements || 0);
      } catch (err) {
        console.warn('Failed to load books:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, [currentPage, currentSearch, currentCategory, currentSortBy, currentSortDir]);

  // Parameter update helpers
  const handleCategoryChange = (catId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (catId) {
      nextParams.set('categoryId', catId);
    } else {
      nextParams.delete('categoryId');
    }
    nextParams.set('page', '0');
    setSearchParams(nextParams);
    setMobileFilterOpen(false);
  };

  const handleSortChange = (e) => {
    const [sortBy, sortDir] = e.target.value.split(':');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('sortBy', sortBy);
    nextParams.set('sortDir', sortDir);
    nextParams.set('page', '0');
    setSearchParams(nextParams);
  };

  const handlePageChange = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(currentSearch || currentCategory);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* Top Banner & Header */}
      <div className="border-b border-paper-border pb-6 mb-8 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wide-label font-bold text-terracotta block mb-1">
            Archival Registry
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ink tracking-tight-title">
            The Complete Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-2 max-w-xl">
            Explore our curated inventory of distributed systems, philosophy, speculative fiction, and habit craft.
          </p>
        </div>

        {/* Mobile filter button */}
        <div className="md:hidden flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters {hasActiveFilters && '• Active'}</span>
          </Button>

          <span className="text-xs text-ink-muted">
            {totalElements} {totalElements === 1 ? 'Volume' : 'Volumes'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Sticky Filter Sidebar (Desktop) */}
        <aside
          className={`md:col-span-3 md:block ${
            mobileFilterOpen
              ? 'fixed inset-0 z-50 bg-paper p-6 overflow-y-auto block'
              : 'hidden md:block'
          }`}
        >
          {mobileFilterOpen && (
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-paper-border md:hidden">
              <span className="font-serif text-lg font-bold text-ink">Filter Catalog</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-ink-muted hover:text-ink"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="md:sticky md:top-24 space-y-8">
            
            {/* Search Input */}
            <div>
              <label
                htmlFor="search"
                className="text-xs uppercase tracking-wide-label font-bold text-ink block mb-2"
              >
                Search In Catalog
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="search"
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Author, title, keywords..."
                  className="w-full h-10 pl-9 pr-8 text-xs bg-paper-light border border-paper-border rounded text-ink placeholder:text-ink-subtle outline-none focus:border-ink transition-colors shadow-paper"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-0.5"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Department Categories List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wide-label font-bold text-ink">
                  Departments
                </span>
                {currentCategory && (
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className="text-[10px] uppercase tracking-wide-label text-terracotta hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => handleCategoryChange(null)}
                  className={`w-full text-left px-3 py-2 rounded-sm transition-colors flex items-center justify-between ${
                    !currentCategory
                      ? 'bg-ink text-paper font-semibold'
                      : 'text-ink-muted hover:bg-paper-muted hover:text-ink'
                  }`}
                >
                  <span>All Volumes</span>
                  <span className="text-[10px] opacity-70">({totalElements})</span>
                </button>

                {categories.map((cat) => {
                  const isSelected = String(cat.id) === String(currentCategory);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-sm transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-ink text-paper font-semibold'
                          : 'text-ink-muted hover:bg-paper-muted hover:text-ink'
                      }`}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      {isSelected && <span className="text-[10px] text-terracotta font-mono font-bold">•</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset All Filters Button */}
            {hasActiveFilters && (
              <div className="pt-4 border-t border-paper-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="w-full text-xs"
                >
                  Reset All Filters
                </Button>
              </div>
            )}

            {/* Editorial Colophon */}
            <div className="p-4 bg-paper-muted/50 border border-paper-border rounded text-[11px] text-ink-muted leading-relaxed">
              <span className="font-serif font-bold text-ink block mb-1">Archival Dispatch</span>
              Every folio ships in acid-free tissue paper with protective heavy-duty mailers.
            </div>

          </div>
        </aside>

        {/* Main Products Grid & Sort Controls */}
        <section className="md:col-span-9 flex flex-col">
          
          {/* Top Results Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-border pb-4 mb-8">
            <div className="text-xs text-ink-muted">
              {currentSearch ? (
                <span>
                  Search results for <strong className="text-ink">"{currentSearch}"</strong> ({totalElements} matching)
                </span>
              ) : (
                <span>
                  Showing <strong className="text-ink">{books.length}</strong> of {totalElements} curated volumes
                </span>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] uppercase tracking-wide-label text-ink-subtle">
                Sort:
              </span>
              <select
                value={`${currentSortBy}:${currentSortDir}`}
                onChange={handleSortChange}
                className="text-xs bg-paper-light border border-paper-border rounded px-3 py-1.5 text-ink outline-none cursor-pointer hover:border-ink transition-colors shadow-paper"
                aria-label="Sort books catalogue"
              >
                <option value="createdAt:desc">Newest First</option>
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
                <option value="title:asc">Title: Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Book Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-paper-light border border-paper-border rounded p-4 flex flex-col">
                  <Skeleton className="w-full aspect-[3/4] mb-4" />
                  <Skeleton className="w-1/3 h-3 mb-2" />
                  <Skeleton className="w-full h-5 mb-2" />
                  <Skeleton className="w-2/3 h-4 mb-4" />
                  <div className="mt-auto pt-3 border-t border-paper-border flex justify-between">
                    <Skeleton className="w-12 h-6" />
                    <Skeleton className="w-20 h-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : books.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-12"
              />
            </>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No Volumes Found"
              description="No editions in our registry match your current search and department filters. Try adjusting your query or resetting all filters."
              actionLabel="Reset Search & Department"
              onAction={handleResetFilters}
            />
          )}

        </section>

      </div>
    </main>
  );
}
