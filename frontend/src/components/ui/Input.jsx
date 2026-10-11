import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const Input = forwardRef(
  ({ className, type = 'text', label, error, helperText, id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

    return (
      <div className="w-full flex flex-col gap-1.5 font-sans">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs uppercase tracking-wide-label text-ink-muted font-medium select-none"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          id={inputId}
          className={cn(
            'w-full h-10 px-3.5 text-sm bg-paper-light border rounded text-ink placeholder:text-ink-subtle transition-colors duration-150 outline-none',
            error
              ? 'border-terracotta focus:border-terracotta focus:ring-1 focus:ring-terracotta'
              : 'border-paper-border hover:border-ink-border focus:border-ink focus:ring-1 focus:ring-ink',
            'disabled:opacity-50 disabled:bg-paper-muted disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error ? (
          <span className="text-xs text-terracotta font-normal">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-ink-muted">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
