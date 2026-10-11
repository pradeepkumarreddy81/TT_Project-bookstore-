import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function SlideOver({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-xl',
  className,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div
          className={cn(
            'w-screen bg-paper border-l border-paper-border shadow-book flex flex-col justify-between animate-in slide-in-from-right duration-200',
            maxWidth,
            className
          )}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-paper-border flex items-start justify-between bg-paper-light">
            <div>
              {title && (
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink tracking-tight-title">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-ink-muted hover:text-ink hover:bg-paper-muted rounded transition-colors ml-4 focus:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
