import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import Button from '@/components/ui/Button';
import { Compass, ArrowRight, BookOpen } from 'lucide-react';

export default function NotFoundPage() {
  useDocumentTitle('404 — Folio Not Located');

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16 font-sans bg-paper">
      <div className="max-w-lg w-full bg-paper-light border border-paper-border rounded-lg p-8 sm:p-12 shadow-book text-center">
        <div className="w-14 h-14 mx-auto mb-6 bg-terracotta/10 text-terracotta rounded-full flex items-center justify-center">
          <Compass className="w-8 h-8 stroke-[1.5]" />
        </div>

        <span className="text-xs uppercase tracking-wide-label font-bold text-terracotta block mb-2">
          Folio Missing from Registry
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight-title mb-4">
          404 • Page Not Found
        </h1>

        <p className="text-sm text-ink-muted leading-relaxed mb-8">
          The requested archival link or folio coordinates do not exist in our catalog registry. It may have been moved, renamed, or retired to archival stacks.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/books">
            <Button variant="primary" size="md" className="w-full sm:w-auto">
              <BookOpen className="w-4 h-4 mr-2" />
              <span>Browse Catalogue</span>
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="md" className="w-full sm:w-auto">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
