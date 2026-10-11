import React from 'react';
import { BookOpen } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = BookOpen,
  title = "Nothing discovered yet",
  description = "The literary shelves appear quiet for this selection. Try adjusting your search query or browsing through our curated departments.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto border border-dashed border-paper-border rounded bg-paper-light/50 my-8">
      <div className="w-12 h-12 rounded-full bg-paper-muted flex items-center justify-center text-terracotta mb-4">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h4 className="font-serif text-xl sm:text-2xl text-ink font-medium tracking-tight-title mb-2">
        {title}
      </h4>
      <p className="text-sm text-ink-muted leading-relaxed font-sans mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
