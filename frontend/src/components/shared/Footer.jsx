import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-paper-muted border-t border-paper-border text-ink font-sans pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12 mb-12">
          
          {/* Column 1: Brand & Colophon */}
          <div className="md:col-span-1">
            <span className="font-serif text-xl font-bold tracking-tight-title text-ink block mb-2">
              The Bookstore Atelier
            </span>
            <p className="text-xs text-ink-muted leading-relaxed font-sans mb-4">
              An independent purveyor of books, essays, and critical volumes. Curated for readers who believe paper holds memory and typography shapes thought.
            </p>
            <span className="text-[10px] uppercase tracking-wide-label text-ink-subtle block">
              Printed & Distributed Locally
            </span>
          </div>

          {/* Column 2: Departments */}
          <div>
            <h4 className="text-xs uppercase tracking-wide-label font-bold text-ink mb-4">
              Departments
            </h4>
            <ul className="space-y-2.5 text-xs text-ink-muted">
              <li>
                <Link to="/catalog?search=technology" className="hover:text-terracotta transition-colors">
                  Technology & Systems
                </Link>
              </li>
              <li>
                <Link to="/catalog?search=fiction" className="hover:text-terracotta transition-colors">
                  Literary Fiction
                </Link>
              </li>
              <li>
                <Link to="/catalog?search=science" className="hover:text-terracotta transition-colors">
                  Speculative & Sci-Fi
                </Link>
              </li>
              <li>
                <Link to="/catalog?search=business" className="hover:text-terracotta transition-colors">
                  Philosophy & Habits
                </Link>
              </li>
              <li>
                <Link to="/catalog?search=mystery" className="hover:text-terracotta transition-colors">
                  Mystery & Noir
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: The Library */}
          <div>
            <h4 className="text-xs uppercase tracking-wide-label font-bold text-ink mb-4">
              The Atelier
            </h4>
            <ul className="space-y-2.5 text-xs text-ink-muted">
              <li>
                <Link to="/catalog" className="hover:text-terracotta transition-colors">
                  Complete Catalogue
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-terracotta transition-colors">
                  Reading Bag
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-terracotta transition-colors">
                  Order Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Dispatch Note */}
          <div>
            <h4 className="text-xs uppercase tracking-wide-label font-bold text-ink mb-4">
              Literary Dispatch
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed mb-4">
              Receive quarterly correspondence on small presses, newly unearthed titles, and book craft.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="reader@domain.com"
                className="w-full h-9 px-3 text-xs bg-paper-light border border-paper-border rounded text-ink outline-none focus:border-ink placeholder:text-ink-subtle"
              />
              <button
                type="button"
                className="h-9 px-3 text-xs uppercase tracking-wider font-semibold bg-ink text-paper rounded hover:bg-terracotta transition-colors shrink-0"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Colophon Bar */}
        <div className="pt-8 border-t border-paper-border/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-ink-muted gap-4">
          <p>
            &copy; {new Date().getFullYear()} The Bookstore Atelier. Built with precision and care.
          </p>
          <div className="flex items-center gap-6">
            <span>Set in Fraunces & Inter</span>
            <span>Render Cloud Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
