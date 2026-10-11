import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(
  ({ className, label, error, helperText, options = [], children, id, ...props }, ref) => {
    const selectId = id || props.name || Math.random().toString(36).substring(2, 9);

    return (
      <div className="w-full flex flex-col gap-1.5 font-sans">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs uppercase tracking-wide-label text-ink-muted font-medium select-none"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-10 pl-3.5 pr-10 text-sm bg-paper-light border rounded text-ink appearance-none transition-colors duration-150 outline-none cursor-pointer',
              error
                ? 'border-terracotta focus:border-terracotta focus:ring-1 focus:ring-terracotta'
                : 'border-paper-border hover:border-ink-border focus:border-ink focus:ring-1 focus:ring-ink',
              'disabled:opacity-50 disabled:bg-paper-muted disabled:cursor-not-allowed',
              className
            )}
            {...props}
          >
            {children ||
              options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <span className="text-xs text-terracotta font-normal">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-ink-muted">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
